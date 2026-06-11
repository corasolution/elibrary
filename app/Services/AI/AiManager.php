<?php

namespace App\Services\AI;

use App\Services\ClaudeService;
use App\Services\GeminiService;

/**
 * Resolves which AI provider serves a given feature, based on the per-feature
 * platform setting `ai_provider_{feature}` (super-admin configurable).
 * Falls back to a sensible default per feature.
 */
class AiManager
{
    private const DEFAULTS = [
        'chatbot'    => 'claude',
        'cataloging' => 'gemini',
        'search'     => 'gemini',
    ];

    public function for(string $feature): AiTextService
    {
        $provider = $this->providerFor($feature);

        return $provider === 'claude'
            ? app(ClaudeService::class)
            : app(GeminiService::class);
    }

    public function providerFor(string $feature): string
    {
        $default = self::DEFAULTS[$feature] ?? 'gemini';

        try {
            $val = \App\Models\Central\PlatformSetting::get("ai_provider_{$feature}", $default);
        } catch (\Throwable) {
            $val = $default;
        }

        return in_array($val, ['claude', 'gemini'], true) ? $val : $default;
    }
}
