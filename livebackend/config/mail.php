<?php

return [
    'default' => env('MAIL_MAILER', 'brevo'),

    'mailers' => [
        'smtp' => [
            'transport' => 'smtp',
            'scheme' => env('MAIL_SCHEME'),
            'url' => env('MAIL_URL'),
            'host' => env('MAIL_HOST', '127.0.0.1'),
            'port' => env('MAIL_PORT', 2525),
            'username' => env('MAIL_USERNAME'),
            'password' => env('MAIL_PASSWORD'),
            'timeout' => null,
            'local_domain' => env('MAIL_EHLO_DOMAIN', parse_url(env('APP_URL', 'http://localhost'), PHP_URL_HOST)),
        ],

        'brevo' => [
            'transport' => 'brevo',
            'api_key' => env('BREVO_API_KEY'),
        ],

        // Keep other mailers as they are
    ],

    'from' => [
        'address' => env('MAIL_FROM_ADDRESS', 'noreply@mmartplus.com'),
        'name' => env('MAIL_FROM_NAME', 'M-Mart+ Support'),
    ],

    // Keep other settings as they are
];