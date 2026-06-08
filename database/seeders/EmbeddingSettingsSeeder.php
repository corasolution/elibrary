<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Central\PlatformSetting;

class EmbeddingSettingsSeeder extends Seeder
{
    /**
     * Seed platform settings for vector embeddings and semantic search.
     */
    public function run(): void
    {
        $settings = [
            // Embedding Provider Configuration
            [
                'key' => 'embedding_provider',
                'value' => 'openai',
                'group' => 'embedding',
                'label' => 'Embedding Provider',
                'description' => 'Provider for generating vector embeddings (openai, gemini, custom)',
            ],
            [
                'key' => 'embedding_model',
                'value' => 'text-embedding-3-small',
                'group' => 'embedding',
                'label' => 'Embedding Model',
                'description' => 'Model to use for embeddings (text-embedding-3-small, text-embedding-ada-002, embedding-001)',
            ],
            [
                'key' => 'embedding_api_key',
                'value' => '', // Empty by default - admin must configure
                'group' => 'embedding',
                'label' => 'Embedding API Key',
                'description' => 'API key for embedding provider (encrypted)',
                'is_encrypted' => true,
            ],
            [
                'key' => 'embedding_api_url',
                'value' => 'https://api.openai.com/v1/embeddings',
                'group' => 'embedding',
                'label' => 'Embedding API URL',
                'description' => 'API endpoint for embeddings',
            ],

            // Semantic Search Toggle
            [
                'key' => 'enable_semantic_search',
                'value' => 'false',
                'group' => 'embedding',
                'label' => 'Enable Semantic Search',
                'description' => 'Enable vector-based semantic search (requires pgvector and embeddings)',
            ],

            // Batch Processing
            [
                'key' => 'embedding_batch_size',
                'value' => '50',
                'group' => 'embedding',
                'label' => 'Embedding Batch Size',
                'description' => 'Number of records to process per batch for embedding generation',
            ],

            // Cost Management
            [
                'key' => 'embedding_monthly_budget_usd',
                'value' => '100.00',
                'group' => 'embedding',
                'label' => 'Monthly Embedding Budget (USD)',
                'description' => 'Maximum monthly spend on embedding API calls',
            ],

            // Hybrid Search Weights
            [
                'key' => 'search_tsvector_weight',
                'value' => '0.4',
                'group' => 'search',
                'label' => 'Keyword Search Weight',
                'description' => 'Weight for tsvector (keyword) search in hybrid mode (0.0-1.0)',
            ],
            [
                'key' => 'search_vector_weight',
                'value' => '0.6',
                'group' => 'search',
                'label' => 'Semantic Search Weight',
                'description' => 'Weight for vector (semantic) search in hybrid mode (0.0-1.0)',
            ],
        ];

        foreach ($settings as $setting) {
            PlatformSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('✓ Embedding platform settings seeded');
    }
}
