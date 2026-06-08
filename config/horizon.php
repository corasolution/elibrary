<?php

use Illuminate\Support\Str;

return [
    'domain' => null,
    'path'   => 'horizon',
    'use'    => 'default',

    'prefix' => env('HORIZON_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_horizon:'),

    'middleware' => ['web'],

    'waits' => ['redis:default' => 60],

    'trim' => [
        'recent'            => 60,
        'pending'           => 60,
        'completed'         => 60,
        'recent_failed'     => 10080,
        'failed'            => 10080,
        'monitored'         => 10080,
    ],

    'silenced' => [],

    'metrics' => [
        'trim_snapshots' => ['job' => 24, 'queue' => 24],
    ],

    'fast_termination' => false,
    'memory_limit'     => 64,

    'defaults' => [
        'supervisor-1' => [
            'connection'    => 'redis',
            'queue'         => ['default'],
            'balance'       => 'auto',
            'autoScalingStrategy' => 'time',
            'maxProcesses'  => 1,
            'maxTime'       => 0,
            'maxJobs'       => 0,
            'memory'        => 128,
            'tries'         => 1,
            'timeout'       => 60,
            'nice'          => 0,
        ],
    ],

    'environments' => [
        'production' => [
            'supervisor-default' => [
                'connection'    => 'redis',
                'queue'         => ['default'],
                'balance'       => 'auto',
                'minProcesses'  => 1,
                'maxProcesses'  => 10,
                'tries'         => 3,
                'timeout'       => 60,
            ],
            'supervisor-digital' => [
                'connection'    => 'redis',
                'queue'         => ['digital-processing'],
                'balance'       => 'simple',
                'minProcesses'  => 1,
                'maxProcesses'  => 5,
                'tries'         => 3,
                'timeout'       => 300,
            ],
            'supervisor-notifications' => [
                'connection'    => 'redis',
                'queue'         => ['notifications'],
                'balance'       => 'simple',
                'minProcesses'  => 1,
                'maxProcesses'  => 3,
                'tries'         => 3,
                'timeout'       => 60,
            ],
        ],

        'local' => [
            'supervisor-1' => [
                'connection'    => 'redis',
                'queue'         => ['default', 'digital-processing', 'notifications', 'stats'],
                'balance'       => 'simple',
                'minProcesses'  => 1,
                'maxProcesses'  => 3,
                'tries'         => 1,
                'timeout'       => 300,
            ],
        ],
    ],
];
