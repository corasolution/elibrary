<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Patron;
use App\Models\Tenant\PhysicalItem;
use App\Models\Tenant\Loan;
use App\Services\CirculationService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class QuickCheckoutController extends Controller
{
    public function __construct(private CirculationService $circulation) {}

    public function index()
    {
        return Inertia::render('Admin/Circulation/QuickCheckout');
    }

    public function kiosk()
    {
        return Inertia::render('Admin/Circulation/Kiosk');
    }

    public function lookupPatron(Request $request)
    {
        $request->validate(['barcode' => 'required|string']);

        try {
            $patron = Patron::with('category')
                ->where('patron_number', $request->barcode)
                ->orWhere('email', $request->barcode)
                ->firstOrFail();

            $activeLoans = Loan::with('item.bibliographicRecord')
                ->where('patron_id', $patron->id)
                ->whereNull('returned_at')
                ->orderBy('due_date')
                ->get()
                ->map(fn ($loan) => [
                    'id'          => $loan->id,
                    'title'       => $loan->item?->bibliographicRecord?->title ?? 'Unknown',
                    'barcode'     => $loan->item?->barcode,
                    'due_date'    => $loan->due_date?->format('Y-m-d'),
                    'is_overdue'  => $loan->isOverdue(),
                    'renewals_count' => $loan->renewals_count,
                    'max_renewals'   => $patron->category?->renewals_allowed ?? 2,
                ]);

            return response()->json([
                'patron' => [
                    'id'           => $patron->id,
                    'name'         => $patron->fullName(),
                    'patron_number'=> $patron->patron_number,
                    'email'        => $patron->email,
                    'category'     => $patron->category?->name,
                    'status'       => $patron->status,
                    'active_loans' => $patron->active_loans,
                    'can_borrow'   => $patron->canBorrow(),
                    'active_loans_list' => $activeLoans,
                ],
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json(['error' => 'Patron not found.'], 404);
        }
    }

    public function lookupItem(Request $request)
    {
        $request->validate(['barcode' => 'required|string']);

        try {
            $item = PhysicalItem::with('bibliographicRecord.materialType')
                ->where('barcode', $request->barcode)
                ->firstOrFail();

            return response()->json([
                'item' => [
                    'id'          => $item->id,
                    'barcode'     => $item->barcode,
                    'title'       => $item->bibliographicRecord?->title ?? 'Unknown',
                    'call_number' => $item->call_number,
                    'status'      => $item->item_status,
                    'available'   => $item->item_status === 'available',
                    'type'        => $item->bibliographicRecord?->materialType?->name,
                ],
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json(['error' => 'Item not found.'], 404);
        }
    }

    public function checkout(Request $request)
    {
        $request->validate([
            'patron_id' => 'required|string',
            'item_id'   => 'required|string',
        ]);

        try {
            $loan = $this->circulation->checkout(
                $request->patron_id,
                $request->item_id,
                auth()->id()
            );

            return response()->json([
                'loan' => [
                    'id'       => $loan->id,
                    'due_date' => $loan->due_date->format('Y-m-d'),
                    'title'    => $loan->item?->bibliographicRecord?->title,
                    'barcode'  => $loan->item?->barcode,
                ],
            ]);
        } catch (ValidationException $e) {
            return response()->json(['error' => collect($e->errors())->flatten()->first()], 422);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function checkin(Request $request)
    {
        $request->validate(['barcode' => 'required|string']);

        try {
            $loan = Loan::with(['item', 'patron'])
                ->whereNull('returned_at')
                ->whereHas('item', fn ($q) => $q->where('barcode', $request->barcode))
                ->firstOrFail();

            $returned = $this->circulation->returnItem($loan->id, auth()->id());

            return response()->json([
                'loan' => [
                    'id'          => $returned->id,
                    'title'       => $returned->item?->bibliographicRecord?->title ?? 'Unknown',
                    'barcode'     => $returned->item?->barcode,
                    'patron_name' => $returned->patron?->fullName(),
                    'fine_amount' => (float) $returned->fine_amount,
                    'returned_at' => $returned->returned_at?->format('Y-m-d H:i'),
                ],
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json(['error' => 'No active loan found for this barcode.'], 404);
        } catch (ValidationException $e) {
            return response()->json(['error' => collect($e->errors())->flatten()->first()], 422);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function renew(string $loanId)
    {
        try {
            $loan = $this->circulation->renewLoan($loanId, auth()->id());
            return response()->json([
                'loan' => [
                    'id'             => $loan->id,
                    'due_date'       => $loan->due_date->format('Y-m-d'),
                    'renewals_count' => $loan->renewals_count,
                ],
            ]);
        } catch (ValidationException $e) {
            return response()->json(['error' => collect($e->errors())->flatten()->first()], 422);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
