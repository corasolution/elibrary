<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CMSTranslation extends Model
{
    protected $connection = 'central';
    protected $table = 'cms_translations';

    protected $fillable = [
        'section',
        'key',
        'en_value',
        'km_value',
        'translation_status',
        'translation_method',
        'description',
        'is_published',
        'is_active',
        'last_published_at',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'is_active' => 'boolean',
        'last_published_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get version history for this translation
     */
    public function versions(): HasMany
    {
        return $this->hasMany(CMSTranslationVersion::class, 'translation_id');
    }

    /**
     * Get the user who created this translation
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(CentralUser::class, 'created_by');
    }

    /**
     * Get the user who last updated this translation
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(CentralUser::class, 'updated_by');
    }

    /**
     * Scope: Get only published translations
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope: Get only active translations (visible to public)
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Get only inactive translations (hidden from public)
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope: Filter by section
     */
    public function scopeSection($query, string $section)
    {
        return $query->where('section', $section);
    }

    /**
     * Scope: Get translations that need Khmer translation
     */
    public function scopeNeedsTranslation($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('km_value')
              ->orWhere('translation_status', 'pending');
        });
    }

    /**
     * Save a version of this translation before updating
     */
    public function saveVersion(string $note = null): void
    {
        CMSTranslationVersion::create([
            'translation_id' => $this->id,
            'en_value_old' => $this->getOriginal('en_value'),
            'km_value_old' => $this->getOriginal('km_value'),
            'en_value_new' => $this->en_value,
            'km_value_new' => $this->km_value,
            'changed_by' => auth('central')->id(),
            'change_note' => $note,
        ]);
    }

    /**
     * Publish this translation
     */
    public function publish(): void
    {
        $this->update([
            'is_published' => true,
            'last_published_at' => now(),
        ]);
    }

    /**
     * Unpublish this translation
     */
    public function unpublish(): void
    {
        $this->update([
            'is_published' => false,
        ]);
    }
}
