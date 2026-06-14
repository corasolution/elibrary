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

        $primary = $provider === 'claude'
            ? app(ClaudeService::class)
            : app(GeminiService::class);

        // If the preferred provider has no API key configured, fall back to the
        // other one when IT is configured. This lets a single-provider setup
        // (e.g. only a Gemini key) power every feature — including the chatbot,
        // which prefers Claude by default — instead of failing "not configured".
        if (! $primary->isConfigured()) {
            $fallback = $provider === 'claude'
                ? app(GeminiService::class)
                : app(ClaudeService::class);

            if ($fallback->isConfigured()) {
                return $fallback;
            }
        }

        return $primary;
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
