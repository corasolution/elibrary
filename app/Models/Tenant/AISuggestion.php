<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AISuggestion extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'record_id',
        'field_name',
        'suggested_value',
        'confidence',
        'source',
        'status',
        'reviewed_by',
        'reviewed_at',
        'metadata',
    ];

    protected $casts = [
        'confidence' => 'decimal:2',
        'metadata' => 'array',
        'reviewed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the bibliographic record this suggestion belongs to
     */
    public function bibliographicRecord(): BelongsTo
    {
        return $this->belongsTo(BibliographicRecord::class, 'record_id');
    }

    /**
     * Get the user who reviewed this suggestion
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'reviewed_by');
    }

    /**
     * Scope: pending suggestions
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope: accepted suggestions
     */
    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    /**
     * Mark suggestion as accepted
     */
    public function accept(string $userId): void
    {
        $this->update([
            'status' => 'accepted',
            'reviewed_by' => $userId,
            'reviewed_at' => now(),
        ]);
    }

    /**
     * Mark suggestion as rejected
     */
    public function reject(string $userId): void
    {
        $this->update([
            'status' => 'rejected',
            'reviewed_by' => $userId,
            'reviewed_at' => now(),
        ]);
    }

    /**
     * Mark suggestion as modified (user edited before accepting)
     */
    public function markAsModified(string $userId): void
    {
        $this->update([
            'status' => 'modified',
            'reviewed_by' => $userId,
            'reviewed_at' => now(),
        ]);
    }
}
