<?php

namespace App\Models\Tenant;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class Patron extends Authenticatable
{
    use SoftDeletes, Notifiable;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $guard = 'patron';

    protected $fillable = [
        'patron_number', 'email', 'password',
        'first_name', 'last_name', 'first_name_km', 'last_name_km',
        'gender', 'date_of_birth', 'phone',
        'address', 'city', 'country',
        'patron_category_id', 'status', 'membership_expiry',
        'preferred_language', 'total_checkouts', 'active_loans', 'notes',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'date_of_birth'    => 'date',
        'membership_expiry' => 'date',
        'email_verified_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $p) {
            if (empty($p->id)) {
                $p->id = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function category()
    {
        return $this->belongsTo(PatronCategory::class, 'patron_category_id');
    }

    public function loans()
    {
        return $this->hasMany(Loan::class);
    }

    public function activeLoans()
    {
        return $this->hasMany(Loan::class)->whereNull('returned_at');
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function fullName(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function canBorrow(): bool
    {
        if (! $this->isActive()) return false;
        $limit = $this->category?->loan_limit ?? 5;
        return $this->active_loans < $limit;
    }
}
