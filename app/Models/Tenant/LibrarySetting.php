<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class LibrarySetting extends Model
{
    protected $table = 'library_settings';

    public $timestamps = false;

    protected $fillable = ['key', 'value', 'group', 'label', 'description', 'updated_at'];

    // ─── Static helpers ──────────────────────────────────────────────────────

    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember("setting:{$key}", 300, function () use ($key, $default) {
            return static::where('key', $key)->value('value') ?? $default;
        });
    }

    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value, 'updated_at' => now()]);
        Cache::forget("setting:{$key}");
    }

    public static function group(string $group): \Illuminate\Support\Collection
    {
        return static::where('group', $group)->orderBy('key')->get();
    }

    public static function all_keyed(): array
    {
        return static::all()->pluck('value', 'key')->all();
    }
}
