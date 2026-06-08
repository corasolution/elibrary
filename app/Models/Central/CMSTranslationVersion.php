<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CMSTranslationVersion extends Model
{
    protected $connection = 'central';
    protected $table = 'cms_translation_versions';

    public $timestamps = false;

    protected $fillable = [
        'translation_id',
        'en_value_old',
        'km_value_old',
        'en_value_new',
        'km_value_new',
        'changed_by',
        'change_note',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Get the translation this version belongs to
     */
    public function translation(): BelongsTo
    {
        return $this->belongsTo(CMSTranslation::class, 'translation_id');
    }

    /**
     * Get the user who made this change
     */
    public function changer(): BelongsTo
    {
        return $this->belongsTo(CentralUser::class, 'changed_by');
    }
}
