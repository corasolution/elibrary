<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PaymentTransaction extends Model
{
    use HasUuids;

    protected $connection = 'central';
    protected $table = 'payment_transactions';

    protected $fillable = [
        'tenant_id',
        'plan_id',
        'amount',
        'currency',
        'payment_method',
        'transaction_proof',
        'notes',
        'status',
        'paid_at',
        'verified_at',
        'verified_by',
        'rejection_reason',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    // Relationships
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function verifiedBy()
    {
        return $this->belongsTo(CentralUser::class, 'verified_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    // Helpers
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isVerified(): bool
    {
        return $this->status === 'verified';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function getProofUrl(): ?string
    {
        if (!$this->transaction_proof) {
            return null;
        }

        return asset('storage/' . $this->transaction_proof);
    }
}
