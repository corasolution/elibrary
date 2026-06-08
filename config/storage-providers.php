<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cloud Storage Providers Configuration
    |--------------------------------------------------------------------------
    |
    | This configuration defines the available cloud storage providers for
    | the Alpha eLibrary digital resource storage system. Each provider
    | includes field definitions, regions, and documentation links.
    |
    */

    'providers' => [

        'cloudflare_r2_default' => [
            'name' => 'Cloudflare R2 (Default)',
            'driver' => 's3',
            'description' => 'Free egress, S3-compatible object storage',
            'documentation' => 'https://developers.cloudflare.com/r2/',
            'benefits' => [
                'Zero egress fees',
                'S3-compatible API',
                'Automatic region selection',
                'Fast global access',
            ],
            'pricing' => [
                'storage' => '$0.015/GB/month',
                'class_a_ops' => '$4.50/million (writes)',
                'class_b_ops' => '$0.36/million (reads)',
                'egress' => 'FREE',
            ],
            'fields' => [],
        ],

        'cloudflare_r2' => [
            'name' => 'Cloudflare R2 (Custom Account)',
            'driver' => 's3',
            'description' => 'Your own Cloudflare R2 account',
            'documentation' => 'https://developers.cloudflare.com/r2/get-started/',
            'fields' => [
                [
                    'name' => 'access_key_id',
                    'label' => 'Access Key ID',
                    'type' => 'text',
                    'required' => true,
                    'help' => 'R2 API Token Access Key ID',
                ],
                [
                    'name' => 'secret_access_key',
                    'label' => 'Secret Access Key',
                    'type' => 'password',
                    'required' => true,
                    'help' => 'R2 API Token Secret',
                ],
                [
                    'name' => 'account_id',
                    'label' => 'Account ID',
                    'type' => 'text',
                    'required' => true,
                    'help' => 'Your Cloudflare Account ID',
                ],
                [
                    'name' => 'bucket',
                    'label' => 'Bucket Name',
                    'type' => 'text',
                    'required' => true,
                    'help' => 'R2 bucket name',
                ],
                [
                    'name' => 'endpoint',
                    'label' => 'Endpoint URL',
                    'type' => 'text',
                    'required' => true,
                    'placeholder' => 'https://<account_id>.r2.cloudflarestorage.com',
                    'help' => 'R2 S3 API endpoint',
                ],
            ],
        ],

        'amazon_s3' => [
            'name' => 'Amazon S3',
            'driver' => 's3',
            'description' => 'AWS S3 object storage',
            'documentation' => 'https://aws.amazon.com/s3/',
            'benefits' => [
                'Industry standard',
                'Global availability',
                'Advanced features',
                'AWS ecosystem integration',
            ],
            'pricing' => [
                'storage' => '$0.023/GB/month (Standard)',
                'egress' => '$0.09/GB',
                'requests' => 'Pay per request',
            ],
            'fields' => [
                [
                    'name' => 'access_key_id',
                    'label' => 'Access Key ID',
                    'type' => 'text',
                    'required' => true,
                ],
                [
                    'name' => 'secret_access_key',
                    'label' => 'Secret Access Key',
                    'type' => 'password',
                    'required' => true,
                ],
                [
                    'name' => 'bucket',
                    'label' => 'Bucket Name',
                    'type' => 'text',
                    'required' => true,
                ],
                [
                    'name' => 'region',
                    'label' => 'Region',
                    'type' => 'select',
                    'required' => true,
                    'options' => [
                        'us-east-1' => 'US East (N. Virginia)',
                        'us-east-2' => 'US East (Ohio)',
                        'us-west-1' => 'US West (N. California)',
                        'us-west-2' => 'US West (Oregon)',
                        'eu-west-1' => 'Europe (Ireland)',
                        'eu-west-2' => 'Europe (London)',
                        'eu-central-1' => 'Europe (Frankfurt)',
                        'ap-southeast-1' => 'Asia Pacific (Singapore)',
                        'ap-southeast-2' => 'Asia Pacific (Sydney)',
                        'ap-northeast-1' => 'Asia Pacific (Tokyo)',
                        'ap-south-1' => 'Asia Pacific (Mumbai)',
                    ],
                ],
            ],
        ],

        'digitalocean_spaces' => [
            'name' => 'DigitalOcean Spaces',
            'driver' => 's3',
            'description' => 'Object storage with built-in CDN',
            'documentation' => 'https://docs.digitalocean.com/products/spaces/',
            'benefits' => [
                'Simple pricing',
                'Built-in CDN',
                'S3-compatible',
                'Easy setup',
            ],
            'pricing' => [
                'storage' => '$5/month for 250GB',
                'egress' => '1TB included, then $0.01/GB',
            ],
            'fields' => [
                [
                    'name' => 'access_key_id',
                    'label' => 'Access Key',
                    'type' => 'text',
                    'required' => true,
                ],
                [
                    'name' => 'secret_access_key',
                    'label' => 'Secret Key',
                    'type' => 'password',
                    'required' => true,
                ],
                [
                    'name' => 'bucket',
                    'label' => 'Space Name',
                    'type' => 'text',
                    'required' => true,
                ],
                [
                    'name' => 'region',
                    'label' => 'Region',
                    'type' => 'select',
                    'required' => true,
                    'options' => [
                        'nyc3' => 'New York 3',
                        'sfo3' => 'San Francisco 3',
                        'sgp1' => 'Singapore 1',
                        'fra1' => 'Frankfurt 1',
                        'ams3' => 'Amsterdam 3',
                    ],
                ],
            ],
        ],

        'wasabi' => [
            'name' => 'Wasabi Hot Cloud Storage',
            'driver' => 's3',
            'description' => 'Hot cloud storage with flat pricing',
            'documentation' => 'https://wasabi.com/help/',
            'benefits' => [
                'Flat-rate pricing',
                'No egress fees',
                'S3-compatible',
                'Fast performance',
            ],
            'pricing' => [
                'storage' => '$5.99/TB/month',
                'egress' => 'FREE',
                'minimum' => '1TB minimum',
            ],
            'fields' => [
                [
                    'name' => 'access_key_id',
                    'label' => 'Access Key',
                    'type' => 'text',
                    'required' => true,
                ],
                [
                    'name' => 'secret_access_key',
                    'label' => 'Secret Key',
                    'type' => 'password',
                    'required' => true,
                ],
                [
                    'name' => 'bucket',
                    'label' => 'Bucket Name',
                    'type' => 'text',
                    'required' => true,
                ],
                [
                    'name' => 'region',
                    'label' => 'Region',
                    'type' => 'select',
                    'required' => true,
                    'options' => [
                        'us-east-1' => 'US East 1 (N. Virginia)',
                        'us-east-2' => 'US East 2 (N. Virginia)',
                        'us-west-1' => 'US West 1 (Oregon)',
                        'eu-central-1' => 'Europe Central 1 (Amsterdam)',
                        'ap-northeast-1' => 'Asia Pacific Northeast 1 (Tokyo)',
                        'ap-northeast-2' => 'Asia Pacific Northeast 2 (Osaka)',
                    ],
                ],
            ],
        ],

        'google_cloud_storage' => [
            'name' => 'Google Cloud Storage',
            'driver' => 'gcs',
            'description' => 'Google Cloud object storage',
            'documentation' => 'https://cloud.google.com/storage/docs',
            'benefits' => [
                'Google infrastructure',
                'Multiple storage classes',
                'Global edge caching',
                'GCP integration',
            ],
            'pricing' => [
                'storage' => '$0.020/GB/month (Standard)',
                'egress' => '$0.12/GB (worldwide)',
            ],
            'fields' => [
                [
                    'name' => 'project_id',
                    'label' => 'Project ID',
                    'type' => 'text',
                    'required' => true,
                    'help' => 'Your GCP Project ID',
                ],
                [
                    'name' => 'key_file',
                    'label' => 'Service Account JSON',
                    'type' => 'textarea',
                    'required' => true,
                    'help' => 'Paste the entire JSON key file content',
                ],
                [
                    'name' => 'bucket',
                    'label' => 'Bucket Name',
                    'type' => 'text',
                    'required' => true,
                ],
            ],
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Migration Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for file migration between storage providers.
    |
    */

    'migration' => [
        'chunk_size' => env('STORAGE_MIGRATION_CHUNK_SIZE', 50),
        'delay_between_chunks' => env('STORAGE_MIGRATION_DELAY', 5), // seconds
        'verify_checksums' => env('STORAGE_MIGRATION_VERIFY', true),
        'delete_source_after' => env('STORAGE_MIGRATION_DELETE_SOURCE', false),
    ],

];
