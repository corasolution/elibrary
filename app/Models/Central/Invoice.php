<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class Invoice extends Model
{
    use HasFactory, HasUuids;

    protected $connection = 'central';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'invoice_number',
        'payment_transaction_id',
        'tenant_id',
        'plan_id',
        'invoice_date',
        'due_date',
        'subtotal',
        'tax_rate',
        'tax_amount',
        'total_amount',
        'currency',
        'exchange_rate',
        'total_khr',
        'pdf_path',
        'status',
        'sent_at',
        'notes',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'due_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'exchange_rate' => 'decimal:4',
        'total_khr' => 'decimal:2',
        'sent_at' => 'datetime',
    ];

    /**
     * Get the payment transaction that owns the invoice
     */
    public function paymentTransaction()
    {
        return $this->belongsTo(PaymentTransaction::class);
    }

    /**
     * Get the tenant that owns the invoice
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the plan for this invoice
     */
    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    /**
     * Generate next invoice number: INV-2026-001234
     */
    public static function generateInvoiceNumber(): string
    {
        $prefix = PlatformSetting::get('invoice_prefix', 'INV');
        $year = now()->year;

        // Get next sequence number from sequence table (database-agnostic)
        $sequence = DB::connection('central')->table('invoice_number_sequence')
            ->insertGetId([], 'current_value');

        return sprintf('%s-%s-%06d', $prefix, $year, $sequence);
    }

    /**
     * Get PDF download URL (signed, expires in 1 hour)
     */
    public function getPdfUrl(): ?string
    {
        if (!$this->pdf_path) {
            return null;
        }

        return Storage::disk('s3')->temporaryUrl(
            $this->pdf_path,
            now()->addHours(1)
        );
    }

    /**
     * Check if invoice has been sent
     */
    public function isSent(): bool
    {
        return !is_null($this->sent_at);
    }

    /**
     * Check if invoice is paid
     */
    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }
}
