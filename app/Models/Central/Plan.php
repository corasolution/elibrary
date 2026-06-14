<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Plan extends Model
{
    use HasFactory, HasUuids;

    protected $connection = 'central';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name', 'price_usd', 'billing_cycle', 'max_titles',
        'max_patrons', 'max_storage_gb', 'features', 'is_active', 'is_popular', 'sort_order',
    ];

    protected $casts = [
        'features'   => 'array',
        'is_active'  => 'boolean',
        'is_popular' => 'boolean',
        'price_usd'  => 'decimal:2',
    ];

    public function tenants()
    {
        return $this->hasMany(Tenant::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function isFree(): bool
    {
        return $this->price_usd == 0;
    }

    public function hasFeature(string $feature): bool
    {
        return in_array($feature, $this->features ?? []);
    }
}
