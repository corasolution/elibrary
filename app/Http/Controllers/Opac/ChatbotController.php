<?php

namespace App\Http\Controllers\Opac;

use App\Http\Controllers\Controller;
use App\Models\Tenant\LibrarySetting;
use App\Services\AI\AiManager;
use App\Services\SearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Public OPAC chatbot — a catalog-aware library assistant (RAG over the catalog).
 * Per-library toggle via `ai_chatbot_enabled`; provider via the per-feature setting.
 */
class ChatbotController extends Controller
{
    public function __construct(private SearchService $search) {}

    public function chat(Request $request): JsonResponse
    {
        $slug = $request->segment(1);

        if (! $this->enabled()) {
            return response()->json(['error' => 'The assistant is currently unavailable.'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:500',
            'history' => 'nullable|array|max:10',
        ]);

        $message = trim($validated['message']);

        // ── RAG: pull the most relevant catalog records ───────────────────────
        $records = collect();
        try {
            $records = $this->search->search($message, [], 5)->getCollection();
        } catch (\Throwable) {
            // search failure shouldn't break the chat — fall back to no context
        }

        $base = '/' . $slug;
        $sources = $records->map(fn ($r) => [
            'id'    => $r->id,
            'title' => $r->title,
            'url'   => "{$base}/catalog/{$r->id}",
        ])->values()->all();

        $context = $records->map(function ($r) {
            $authors = collect($r->authors ?? [])->pluck('name')->filter()->implode(', ');
            $type = $r->materialType?->name ?? 'item';
            $year = $r->publication_year ? " ({$r->publication_year})" : '';
            return "- \"{$r->title}\"{$year}" . ($authors ? " by {$authors}" : '') . " — {$type}";
        })->implode("\n");

        $libraryName = LibrarySetting::get('library_name', 'the library');
        $hours       = LibrarySetting::get('library_hours');
        $address     = LibrarySetting::get('library_address');
        $phone       = LibrarySetting::get('library_phone');

        $facts = collect([
            $hours ? "Opening hours: {$hours}" : null,
            $address ? "Address: {$address}" : null,
            $phone ? "Phone: {$phone}" : null,
        ])->filter()->implode("\n");

        $system = <<<SYS
You are a friendly, concise library assistant for "{$libraryName}". Help patrons find materials and answer questions about the library.
Rules:
- Use ONLY the catalog results and library facts provided. Do not invent titles, authors, or holdings.
- If relevant catalog items are listed, recommend them by title and tell the patron they can open the linked record.
- If nothing relevant is found, say so honestly and suggest the patron try different search terms or ask a librarian.
- Keep answers under 120 words, warm and helpful. Plain text, no markdown headings.
SYS;

        $prompt = "Patron question: {$message}\n\n"
            . "Matching catalog results (top " . $records->count() . "):\n"
            . ($context ?: "(no matching items found)") . "\n\n"
            . "Library facts:\n" . ($facts ?: "(none provided)") . "\n\n"
            . "Write a helpful reply.";

        $ai = app(AiManager::class)->for('chatbot');
        if (! $ai->isConfigured()) {
            return response()->json(['error' => 'The assistant is not configured yet.'], 503);
        }

        $result = $ai->generateContent($prompt, [
            'feature'           => 'opac_chatbot',
            'system'            => $system,
            'max_output_tokens' => 600,
            // light caching of identical questions
            'cache_key'         => 'opac_chat:' . md5(($slug) . '|' . mb_strtolower($message)),
            'cache_ttl'         => 60 * 6, // 6 hours
        ]);

        if (! $result || empty($result['text'])) {
            return response()->json([
                'reply'   => "Sorry, I couldn't generate a response right now. Please try again or ask a librarian.",
                'sources' => $sources,
            ]);
        }

        return response()->json([
            'reply'   => $result['text'],
            'sources' => $sources,
        ]);
    }

    private function enabled(): bool
    {
        $platform = (bool) filter_var(
            rescue(fn () => \App\Models\Central\PlatformSetting::get('ai_platform_enabled', true), true),
            FILTER_VALIDATE_BOOLEAN
        );
        $library = (bool) filter_var(LibrarySetting::get('ai_chatbot_enabled', false), FILTER_VALIDATE_BOOLEAN);

        return $platform && $library;
    }
}
