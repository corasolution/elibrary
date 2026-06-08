<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\PaymentTransaction;
use App\Models\Central\Subscription;
use App\Services\InvoiceService;
use App\Mail\PaymentVerifiedMail;
use App\Mail\PaymentRejectedMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Display payment verification queue
     */
    public function index(Request $request)
    {
        $query = PaymentTransaction::with(['tenant', 'plan', 'verifiedBy']);

        // Filter by status
        $status = $request->get('status', 'pending');
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $payments = $query->latest()
            ->paginate(25)
            ->through(function ($payment) {
                return [
                    'id' => $payment->id,
                    'tenant' => [
                        'id' => $payment->tenant->id,
                        'name' => $payment->tenant->name,
                        'slug' => $payment->tenant->slug,
                    ],
                    'plan' => $payment->plan ? [
                        'name' => $payment->plan->name,
                        'price' => $payment->plan->price_usd,
                    ] : null,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'payment_method' => $payment->payment_method,
                    'proof_url' => $payment->getProofUrl(),
                    'notes' => $payment->notes,
                    'status' => $payment->status,
                    'paid_at' => $payment->paid_at?->format('M d, Y H:i'),
                    'verified_at' => $payment->verified_at?->format('M d, Y H:i'),
                    'verified_by' => $payment->verifiedBy?->name,
                    'rejection_reason' => $payment->rejection_reason,
                    'created_at' => $payment->created_at->format('M d, Y H:i'),
                ];
            });

        $statistics = [
            'pending' => PaymentTransaction::pending()->count(),
            'verified' => PaymentTransaction::verified()->count(),
            'rejected' => PaymentTransaction::rejected()->count(),
            'total' => PaymentTransaction::count(),
        ];

        return Inertia::render('Central/Payments/Index', [
            'payments' => $payments,
            'statistics' => $statistics,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Verify/approve a payment
     */
    public function verify(Request $request, string $id)
    {
        $payment = PaymentTransaction::with('tenant', 'plan')->findOrFail($id);

        if (!$payment->isPending()) {
            return back()->with('error', 'Payment has already been processed.');
        }

        DB::connection('central')->transaction(function () use ($payment) {
            // 1. Update payment status
            $payment->update([
                'status' => 'verified',
                'verified_at' => now(),
                'verified_by' => Auth::guard('central')->id(),
            ]);

            // 2. Activate subscription
            $this->activateSubscription($payment);

            // 3. Generate invoice
            $invoiceService = app(InvoiceService::class);
            $invoice = $invoiceService->createInvoice($payment);

            // 4. Send email with PDF attachment
            if ($payment->tenant->email) {
                Mail::to($payment->tenant->email)
                    ->send(new PaymentVerifiedMail($invoice));

                // Update invoice sent status
                $invoice->update(['sent_at' => now()]);
            }
        });

        return back()->with('success', 'Payment verified, invoice generated and emailed to tenant.');
    }

    /**
     * Reject a payment
     */
    public function reject(Request $request, string $id)
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $payment = PaymentTransaction::with(['tenant', 'plan'])->findOrFail($id);

        if (!$payment->isPending()) {
            return back()->with('error', 'Payment has already been processed.');
        }

        // Update status
        $payment->update([
            'status' => 'rejected',
            'verified_at' => now(),
            'verified_by' => Auth::guard('central')->id(),
            'rejection_reason' => $validated['reason'],
        ]);

        // Send rejection email
        if ($payment->tenant->email) {
            Mail::to($payment->tenant->email)
                ->send(new PaymentRejectedMail($payment, $validated['reason']));
        }

        return back()->with('success', 'Payment rejected and tenant notified.');
    }

    /**
     * Activate subscription after payment verification
     */
    private function activateSubscription(PaymentTransaction $payment)
    {
        $tenant = $payment->tenant;
        $plan = $payment->plan;

        if (!$plan) {
            return;
        }

        // Check if subscription exists
        $subscription = Subscription::where('tenant_id', $tenant->id)->first();

        if ($subscription) {
            // Update existing subscription
            $subscription->update([
                'plan_id' => $plan->id,
                'status' => 'active',
                'current_period_start' => now(),
                'current_period_end' => $plan->billing_cycle === 'monthly'
                    ? now()->addMonth()
                    : now()->addYear(),
                'payment_method' => $payment->payment_method,
            ]);
        } else {
            // Create new subscription
            Subscription::create([
                'tenant_id' => $tenant->id,
                'plan_id' => $plan->id,
                'status' => 'active',
                'current_period_start' => now(),
                'current_period_end' => $plan->billing_cycle === 'monthly'
                    ? now()->addMonth()
                    : now()->addYear(),
                'payment_method' => $payment->payment_method,
            ]);
        }

        // Update tenant plan
        $tenant->update([
            'plan_id' => $plan->id,
        ]);
    }
}
