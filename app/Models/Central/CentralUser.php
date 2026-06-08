<?php

namespace App\Models\Central;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class CentralUser extends Authenticatable
{
    use SoftDeletes;

    protected $connection = 'central';
    protected $table = 'central_users';

    public $incrementing = false;
    protected $keyType = 'string';

    // Role constants
    const ROLE_SUPER_ADMIN = 'super_admin';
    const ROLE_ADMIN = 'admin';
    const ROLE_SUPPORT_STAFF = 'support_staff';
    const ROLE_PARTNER = 'partner';
    const ROLE_SALES_AGENT = 'sales_agent';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'email_verified_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $user) {
            if (empty($user->id)) {
                $user->id = (string) Str::uuid();
            }
        });
    }

    // ========================================
    // Relationships
    // ========================================

    /**
     * Tenants assigned to this user (many-to-many)
     */
    public function tenants()
    {
        return $this->belongsToMany(
            Tenant::class,
            'central_user_tenants',
            'user_id',
            'tenant_id'
        )->withPivot('assigned_at', 'assigned_by', 'notes');
    }

    /**
     * Tenants created by this user
     */
    public function createdTenants()
    {
        return $this->hasMany(Tenant::class, 'created_by_id');
    }

    /**
     * Tenants currently managed by this user
     */
    public function managedTenants()
    {
        return $this->hasMany(Tenant::class, 'managed_by_id');
    }

    // ========================================
    // Role Helper Methods
    // ========================================

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isSupportStaff(): bool
    {
        return $this->role === self::ROLE_SUPPORT_STAFF;
    }

    public function isPartner(): bool
    {
        return $this->role === self::ROLE_PARTNER;
    }

    public function isSalesAgent(): bool
    {
        return $this->role === self::ROLE_SALES_AGENT;
    }

    // ========================================
    // Permission Methods
    // ========================================

    /**
     * Check if user can manage a specific tenant
     */
    public function canManageTenant($tenantId): bool
    {
        // Super admins can manage all tenants
        if ($this->isSuperAdmin()) {
            return true;
        }

        // Check if tenant is assigned to this user OR created by this user
        return $this->tenants()->where('tenant_id', $tenantId)->exists()
            || $this->createdTenants()->where('id', $tenantId)->exists();
    }

    /**
     * Get all tenant IDs this user can access
     */
    public function getAllAccessibleTenantIds(): array
    {
        // Super admins see all tenants
        if ($this->isSuperAdmin()) {
            return Tenant::pluck('id')->toArray();
        }

        // Get assigned tenants + created tenants
        $assignedIds = $this->tenants()->pluck('tenant_id');
        $createdIds = $this->createdTenants()->pluck('id');

        return $assignedIds->merge($createdIds)
            ->unique()
            ->values()
            ->toArray();
    }

    /**
     * Check if user can create new tenants
     */
    public function canCreateTenants(): bool
    {
        return $this->isSuperAdmin() || $this->isPartner();
    }

    /**
     * Check if user can manage partners
     */
    public function canManagePartners(): bool
    {
        return $this->isSuperAdmin();
    }
}
