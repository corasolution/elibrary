<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\SoftDeletes;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains, SoftDeletes;

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_ACTIVE = 'active';
    const STATUS_SUSPENDED = 'suspended';
    const STATUS_CANCELLED = 'cancelled';

    protected $connection = 'central';

    protected $fillable = [
        'id', 'name', 'slug', 'domain', 'data', 'plan_id', 'trial_ends_at', 'status',
        'created_by_id', 'managed_by_id', 'is_featured', 'featured_order',
    ];

    protected $casts = [
        'data'          => 'array',
        'trial_ends_at' => 'datetime',
        'is_featured'   => 'boolean',
    ];

    public static function getCustomColumns(): array
    {
        return ['id', 'name', 'slug', 'domain', 'plan_id', 'trial_ends_at', 'status', 'created_by_id', 'managed_by_id', 'is_featured', 'featured_order'];
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

    // Central User relationships
    public function createdBy()
    {
        return $this->belongsTo(CentralUser::class, 'created_by_id');
    }

    public function managedBy()
    {
        return $this->belongsTo(CentralUser::class, 'managed_by_id');
    }

    public function assignedUsers()
    {
        return $this->belongsToMany(
            CentralUser::class,
            'central_user_tenants',
            'tenant_id',
            'user_id'
        )->withPivot('assigned_at', 'assigned_by', 'notes')
         ->withTimestamps();
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isOnTrial(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    /**
     * Check if tenant is deleted (soft deleted)
     */
    public function isDeleted(): bool
    {
        return $this->deleted_at !== null;
    }

    /**
     * Get the date when this tenant will be permanently deleted (30 days after soft delete)
     */
    public function getPermanentDeletionDate(): ?\Carbon\Carbon
    {
        if (!$this->deleted_at) {
            return null;
        }

        return $this->deleted_at->copy()->addDays(30);
    }

    /**
     * Get days remaining until permanent deletion
     */
    public function getDaysUntilPermanentDeletion(): ?int
    {
        if (!$this->deleted_at) {
            return null;
        }

        $permanentDeletionDate = $this->getPermanentDeletionDate();
        return now()->diffInDays($permanentDeletionDate, false);
    }

    /**
     * Check if tenant is ready for permanent deletion (deleted > 30 days ago)
     */
    public function isReadyForPermanentDeletion(): bool
    {
        if (!$this->deleted_at) {
            return false;
        }

        return $this->deleted_at->copy()->addDays(30)->isPast();
    }
}
