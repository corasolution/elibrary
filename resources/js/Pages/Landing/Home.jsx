import LandingLayout from '@/Layouts/LandingLayout';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    BookOpen, ArrowRight, CheckCircle, RefreshCw, Layers, BarChart2, Users, Globe,
    Search, Sparkles, Cloud, Palette, Languages,
    Zap, Shield, Smartphone, Eye, Download
} from 'lucide-react';

export default function Home({ featuredLibraries = [], plans = [] }) {
    const { t } = useTranslation();

    const FEATURES = [
        {
            icon: Sparkles,
            title: t('home.feature_ai_search_title'),
            desc: t('home.feature_ai_search_desc'),
            color: 'from-purple-500 to-pink-500'
        },
        {
            icon: BookOpen,
            title: t('home.feature_multiformat_title'),
            desc: t('home.feature_multiformat_desc'),
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: Eye,
            title: t('home.feature_reader_title'),
            desc: t('home.feature_reader_desc'),
            color: 'from-green-500 to-emerald-500'
        },
        {
            icon: Cloud,
            title: t('home.feature_storage_title'),
            desc: t('home.feature_storage_desc'),
            color: 'from-orange-500 to-red-500'
        },
        {
            icon: Palette,
            title: t('home.feature_themes_title'),
            desc: t('home.feature_themes_desc'),
            color: 'from-indigo-500 to-purple-500'
        },
        {
            icon: Languages,
            title: t('home.feature_multilingual_title'),
            desc: t('home.feature_multilingual_desc'),
            color: 'from-teal-500 to-green-500'
        },
        {
            icon: BarChart2,
            title: t('home.feature_analytics_title'),
            desc: t('home.feature_analytics_desc'),
            color: 'from-pink-500 to-rose-500'
        },
        {
            icon: Zap,
            title: t('home.feature_fast_title'),
            desc: t('home.feature_fast_desc'),
            color: 'from-yellow-500 to-orange-500'
        },
        {
            icon: Shield,
            title: t('home.feature_secure_title'),
            desc: t('home.feature_secure_desc'),
            color: 'from-gray-600 to-slate-600'
        },
    ];

    const TECH_STACK = [
        { name: t('home.tech_laravel'),  desc: t('home.tech_laravel_desc') },
        { name: t('home.tech_react'),    desc: t('home.tech_react_desc') },
        { name: t('home.tech_postgres'), desc: t('home.tech_postgres_desc') },
        { name: t('home.tech_r2'),       desc: t('home.tech_r2_desc') },
        { name: t('home.tech_redis'),    desc: t('home.tech_redis_desc') },
        { name: t('home.tech_tailwind'), desc: t('home.tech_tailwind_desc') },
    ];

    // Plans come from the live Plans table (Central Admin → Plans). The "popular"
    // flag and prices are editable there; this section stays in sync automatically.
    const PLANS = plans;

    return (
        <LandingLayout>
            <Head>
                <title>Cambodia's #1 Digital Library Platform — Alpha eLibrary</title>
                <meta name="description" content="Cambodia's leading cloud-based library management system. Catalog books, manage loans, and run your eLibrary — free. Trusted by schools, universities and NGOs across Southeast Asia." head-key="description" />
                <meta property="og:title" content="Cambodia's #1 Digital Library Platform — Alpha eLibrary" head-key="og:title" />
                <meta property="og:description" content="Free library management system for Cambodia. Catalog, circulate, go digital. Start free today." head-key="og:description" />
                <meta name="keywords" content="digital library cambodia, library management system cambodia, e-library cambodia, free library software, school library cambodia, university library software, បណ្ណាល័យឌីជីថលកម្ពុជា" head-key="keywords" />
            </Head>

            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                </div>
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />

                <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
                            {t('home.hero_title')}
                        </h1>

                        <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
                            {t('home.hero_subtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all shadow-xl">
                                {t('home.cta_start_trial')} <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/demo" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl text-lg font-semibold hover:bg-white/20 transition-all">
                                {t('home.cta_request_demo')}
                            </Link>
                        </div>

                        <p className="text-sm text-blue-200">
                            {t('home.cta_note')}
                        </p>
                    </div>

                </div>
            </section>

            {/* Library Portfolio */}
            {featuredLibraries?.length > 0 && (
                <section className="bg-white border-b border-gray-100 py-16">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                                {t('home.portfolio_title', 'Libraries on our platform')}
                            </h2>
                            <p className="text-gray-600">
                                {t('home.portfolio_subtitle', 'Trusted by libraries of all sizes')}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
                            {featuredLibraries.map(lib => (
                                <Link
                                    key={lib.slug}
                                    href={`/${lib.slug}`}
                                    className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-blue-200 hover:shadow-lg transition-all group"
                                >
                                    {lib.logo_url ? (
                                        <img
                                            src={lib.logo_url}
                                            alt={lib.name}
                                            className="w-16 h-16 rounded-2xl object-contain bg-white border border-gray-100"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                                            {lib.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-sm font-semibold text-gray-800 text-center leading-tight group-hover:text-blue-700">
                                        {lib.name}
                                    </span>
                                </Link>
                            ))}
                        </div>

                        <div className="text-center mt-10">
                            <Link
                                href="/libraries"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:border-blue-300 hover:text-blue-700 transition-all"
                            >
                                {t('home.portfolio_show_all', 'Show all libraries')}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Features Grid */}
            <section className="py-24 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4">
                            <Zap className="w-4 h-4" />
                            Features
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                            Everything you need.<br />Nothing you don't.
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Built for modern libraries with features that actually matter.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {FEATURES.map(({ icon: Icon, title, desc, color }) => (
                            <div key={title} className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100">
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                                <p className="text-gray-600 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="py-24 px-6 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-semibold mb-4">
                            <Layers className="w-4 h-4" />
                            {t('home.tech_badge')}
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
                            {t('home.tech_stack_title')}
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            {t('home.tech_stack_subtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {TECH_STACK.map(({ name, desc }) => (
                            <div key={name} className="text-center p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="text-lg font-bold mb-1">{name}</div>
                                <div className="text-sm text-gray-400">{desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-4">
                            <CheckCircle className="w-4 h-4" />
                            Pricing
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                            Simple, transparent pricing
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Start free, upgrade as you grow. No hidden fees.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {PLANS.map((plan) => (
                            <div key={plan.name} className={`relative rounded-2xl p-8 ${
                                plan.popular
                                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl scale-105'
                                    : 'bg-white border-2 border-gray-200'
                            }`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-sm font-bold rounded-full">
                                        Most Popular
                                    </div>
                                )}

                                <div className={`text-lg font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                                    {plan.name}
                                </div>

                                <div className="mb-6">
                                    <span className={`text-5xl font-extrabold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                                        {plan.price === null ? 'Custom' : plan.price === 0 ? 'Free' : `$${plan.price}`}
                                    </span>
                                    {plan.price !== null && plan.price !== 0 && (
                                        <span className={plan.popular ? 'text-blue-100' : 'text-gray-600'}>/month</span>
                                    )}
                                </div>

                                <ul className={`space-y-3 mb-8 ${plan.popular ? 'text-blue-50' : 'text-gray-600'}`}>
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2 text-sm">
                                            <CheckCircle className={`w-5 h-5 shrink-0 mt-0.5 ${plan.popular ? 'text-blue-200' : 'text-green-500'}`} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={plan.price === null ? '/contact' : '/register'}
                                    className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-all ${
                                        plan.popular
                                            ? 'bg-white text-blue-700 hover:bg-blue-50'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {plan.price === null ? 'Contact Sales' : 'Get Started'}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-24 px-6">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
                        Ready to modernize your library?
                    </h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Join hundreds of libraries worldwide using Alpha eLibrary to serve their communities better.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all shadow-xl">
                            Start Free Trial <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/demo" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl text-lg font-semibold hover:bg-white/20 transition-all">
                            Schedule Demo
                        </Link>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}
