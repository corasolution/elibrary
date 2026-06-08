<?php

namespace App\Models\Tenant;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use SoftDeletes, Notifiable, HasRoles;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name', 'email', 'password',
        'avatar_url', 'preferred_language', 'is_active',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active'         => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $u) {
            if (empty($u->id)) {
                $u->id = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function canAccessAdmin(): bool
    {
        return $this->is_active && $this->hasAnyRole([
            'super_admin', 'library_admin', 'cataloger',
            'circulation_staff', 'reader_services',
        ]);
    }
}
