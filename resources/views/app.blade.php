<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    @php
        // Platform name is editable in Central Admin → General Settings.
        $platformName = rescue(fn () => \App\Models\Central\PlatformSetting::get('platform_name'), null, false)
            ?: config('app.name', 'Alpha eLibrary');
        $platformFavicon = rescue(fn () => \App\Models\Central\PlatformSetting::get('platform_favicon'), null, false);
    @endphp
    <title inertia>{{ $platformName }}</title>
    @if ($platformFavicon)
        <link rel="icon" href="{{ $platformFavicon }}">
    @endif

    <!-- SEO: Canonical & Hreflang -->
    <link rel="canonical" href="{{ url()->current() }}" />
    <link rel="alternate" hreflang="en" href="{{ url()->current() }}" />
    <link rel="alternate" hreflang="km" href="{{ url()->current() }}" />
    <link rel="alternate" hreflang="x-default" href="{{ url('/') }}" />

    <!-- SEO: Default Meta (overridden per page via Inertia head) -->
    <meta name="description" content="Alpha eLibrary — Cambodia's leading digital library platform. Modern library management, cataloging, circulation and eLibrary for schools, universities and NGOs across Southeast Asia." />
    <meta name="keywords" content="digital library cambodia, library management system cambodia, e-library cambodia, school library software, university library system, បណ្ណាល័យឌីជីថល, ប្រព័ន្ធគ្រប់គ្រងបណ្ណាល័យ" />
    <meta name="robots" content="index, follow" />
    <meta name="author" content="Corasoft, Phnom Penh, Cambodia" />
    <meta name="geo.region" content="KH" />
    <meta name="geo.placename" content="Phnom Penh" />

    <!-- SEO: Open Graph -->
    <meta property="og:site_name" content="{{ $platformName }}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="{{ url()->current() }}" />
    <meta property="og:title" content="{{ $platformName }} — Cambodia's Digital Library Platform" />
    <meta property="og:description" content="Modern library management system for Cambodia and Southeast Asia. Catalog, circulate, go digital. Free plan available." />
    <meta property="og:image" content="{{ asset('images/og-image.jpg') }}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Alpha eLibrary — Cambodia's Digital Library Platform" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:locale:alternate" content="km_KH" />

    <!-- SEO: Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{{ $platformName }} — Cambodia's Digital Library Platform" />
    <meta name="twitter:description" content="Modern library management system for Cambodia and Southeast Asia. Free plan available." />
    <meta name="twitter:image" content="{{ asset('images/og-image.jpg') }}" />
    <meta name="twitter:image:alt" content="Alpha eLibrary — Cambodia's Digital Library Platform" />

    <!-- PWA / Mobile -->
    <meta name="theme-color" content="#1B3D8F" />
    <meta name="application-name" content="{{ $platformName }}" />

    <!-- JSON-LD: Organization -->
    <script type="application/ld+json">{"@@context":"https://schema.org","@type":"Organization","@id":"{{ url('/') }}/#organization","name":"Alpha eLibrary","alternateName":"Bannalai","url":"{{ url('/') }}","description":"Cambodia's leading digital library platform for schools, universities, NGOs and government libraries.","foundingLocation":{"@type":"Place","name":"Phnom Penh, Cambodia"},"areaServed":["KH","TH","VN","MM","LA"],"contactPoint":{"@type":"ContactPoint","contactType":"customer support","email":"hello@corasoft.io","availableLanguage":["English","Khmer"]}}</script>

    <!-- JSON-LD: SoftwareApplication -->
    <script type="application/ld+json">{"@@context":"https://schema.org","@type":"SoftwareApplication","name":"Alpha eLibrary","applicationCategory":"BusinessApplication","operatingSystem":"Web","offers":{"@type":"AggregateOffer","priceCurrency":"USD","lowPrice":"0","highPrice":"79","offerCount":"4"},"description":"Integrated Library System and eLibrary SaaS for Cambodia and Southeast Asia.","featureList":["Book cataloging with ISBN lookup","Circulation and loan management","Digital eBook and ePub reader","AI-powered catalog search","Khmer language support","Multi-branch library management","Cloud storage","Patron self-registration","Barcode label printing","Library analytics and reports"],"inLanguage":["en","km"],"url":"{{ url('/') }}"}</script>

    <!-- JSON-LD: WebSite -->
    <script type="application/ld+json">{"@@context":"https://schema.org","@type":"WebSite","name":"{{ $platformName }}","url":"{{ url('/') }}","description":"Cambodia's #1 digital library platform","inLanguage":["en","km"]}</script>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Khmer:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Scripts -->
    <script>
        // Pass server-side locale to i18n
        window.initialLanguage = @json($page['props']['locale'] ?? 'km');
        // Runtime app/platform name for the Inertia tab-title fallback.
        window.__APP_NAME__ = @json($platformName);
    </script>
    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="h-full antialiased bg-gray-50 text-gray-900">
    @inertia
</body>
</html>
