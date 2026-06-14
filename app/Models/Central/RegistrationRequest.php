<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class RegistrationRequest extends Model
{
    use HasUuids;

    const STATUS_PENDING  = 'pending';
    const STATUS_REVIEWED = 'reviewed';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    protected $connection = 'central';

    protected $fillable = [
        'library_name', 'slug', 'contact_name', 'contact_email', 'telegram',
        'contact_phone', 'library_type', 'collection_size', 'address', 'country',
        'plan_id', 'status', 'admin_notes', 'reviewed_by_id', 'reviewed_at', 'tenant_id',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class, 'plan_id');
    }

    public function reviewedBy()
    {
        return $this->belongsTo(CentralUser::class, 'reviewed_by_id');
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }
}
