<?php

namespace App\Services\AI;

/**
 * Common contract for text-generation AI providers (Gemini, Claude/Anthropic).
 * Lets CatalogAIService / the chatbot stay provider-agnostic and be switched
 * per-feature via AiManager.
 */
interface AiTextService
{
    /**
     * Generate text from a prompt.
     *
     * @param array $options cache_key, cache_ttl, max_output_tokens, feature, system
     * @return array|null ['text' => string, 'metadata' => [...token info...]] or null on failure
     */
    public function generateContent(string $prompt, array $options = []): ?array;

    /** Parse a JSON object out of a model response (handles ```json fences). */
    public function parseJsonResponse(string $text): ?array;

    public function isConfigured(): bool;

    /** @return array{success:bool, message?:string, error?:string, response?:?string} */
    public function testConnection(): array;

    /** Provider key used for usage attribution ('gemini' | 'claude'). */
    public function providerKey(): string;
}
