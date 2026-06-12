import LandingLayout from '@/Layouts/LandingLayout';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, X } from 'lucide-react';

const PLANS = [
    {
        name: 'Free',
        price: 0,
        billing: '',
        tagline: 'Perfect for small community libraries',
        color: 'gray',
        features: {
            titles:    '500',
            patrons:   '100',
            storage:   '1 GB',
            digital:   false,
            branches:  false,
            domain:    false,
            api:       false,
            khmer:     true,
            support:   'Community',
        },
    },
    {
        name: 'Starter',
        price: 29,
        billing: '/mo',
        tagline: 'Ideal for school and small public libraries',
        color: 'blue',
        features: {
            titles:    '5,000',
            patrons:   '1,000',
            storage:   '20 GB',
            digital:   true,
            branches:  false,
            domain:    false,
            api:       false,
            khmer:     true,
            support:   'Email',
        },
    },
    {
        name: 'Pro',
        price: 79,
        billing: '/mo',
        tagline: 'For universities and multi-branch systems',
        color: 'brand',
        popular: true,
        features: {
            titles:    '50,000',
            patrons:   '10,000',
            storage:   '200 GB',
            digital:   true,
            branches:  true,
            domain:    true,
            api:       true,
            khmer:     true,
            support:   'Priority',
        },
    },
    {
        name: 'Enterprise',
        price: null,
        billing: '',
        tagline: 'Custom deployments for national libraries',
        color: 'purple',
        features: {
            titles:    'Unlimited',
            patrons:   'Unlimited',
            storage:   'Custom',
            digital:   true,
            branches:  true,
            domain:    true,
            api:       true,
            khmer:     true,
            support:   'Dedicated',
        },
    },
];

const FEATURE_ROWS = [
    { key: 'titles',   label: 'Catalog Titles' },
    { key: 'patrons',  label: 'Patrons' },
    { key: 'storage',  label: 'File Storage' },
    { key: 'digital',  label: 'Digital Library & Reader',  boolean: true },
    { key: 'branches', label: 'Multiple Locations',        boolean: true },
    { key: 'domain',   label: 'Custom Domain',             boolean: true },
    { key: 'api',      label: 'API Access',                boolean: true },
    { key: 'khmer',    label: 'Khmer Language',            boolean: true },
    { key: 'support',  label: 'Support' },
];

const COLOR_STYLES = {
    gray:  { card: 'border-gray-200',   btn: 'bg-gray-700 hover:bg-gray-800 text-white' },
    blue:  { card: 'border-blue-200',   btn: 'bg-blue-600 hover:bg-blue-700 text-white' },
    brand: { card: 'border-brand-400 ring-2 ring-brand-400', btn: 'bg-brand-600 hover:bg-brand-700 text-white' },
    purple:{ card: 'border-purple-200', btn: 'bg-purple-700 hover:bg-purple-800 text-white' },
};

const FAQS = [
    { q: 'Can I start for free?', a: 'Yes. The Free plan is free forever with no credit card required. Upgrade at any time.' },
    { q: 'What payment methods do you accept?', a: 'We accept ABA PayWay, Bakong KHQR, major credit cards, and manual bank transfer for Enterprise.' },
    { q: 'Can I import my existing catalog?', a: 'Yes. You can import from MARC21, CSV, or use our ISBN bulk-lookup tool to auto-fill records.' },
    { q: 'Is there a trial period?', a: 'All paid plans include a 14-day free trial with full features. No credit card needed to start.' },
    { q: 'What happens if I exceed my limits?', a: 'You\'ll be notified and can upgrade at any time. We never delete data without your consent.' },
    { q: 'Is data isolated between libraries?', a: 'Yes. Each library tenant has a fully isolated database — your patron data is never shared.' },
];

// Helper to format plan data from database
const formatPlan = (dbPlan) => {
    // Map plan names to colors
    const colorMap = {
        'Free': 'gray',
        'Starter': 'blue',
        'Pro': 'brand',
        'Enterprise': 'purple',
    };

    // Map plan names to taglines
    const taglineMap = {
        'Free': 'Perfect for small community libraries',
        'Starter': 'Ideal for school and small public libraries',
        'Pro': 'For universities and multi-branch systems',
        'Enterprise': 'Custom deployments for national libraries',
    };

    // Check which features this plan has
    const hasFeature = (featureName) => {
        return Array.isArray(dbPlan.features) && dbPlan.features.includes(featureName);
    };

    return {
        name: dbPlan.name,
        price: dbPlan.price,
        billing: dbPlan.billing_cycle === 'yearly' ? '/year' : (dbPlan.price > 0 ? '/month' : ''),
        tagline: taglineMap[dbPlan.name] || `Complete ${dbPlan.name} plan`,
        color: colorMap[dbPlan.name] || 'blue',
        popular: dbPlan.name === 'Pro',
        features: {
            titles: dbPlan.max_titles === -1 || dbPlan.max_titles === null
                ? 'Unlimited'
                : (dbPlan.max_titles ? dbPlan.max_titles.toLocaleString() : 'Unlimited'),
            patrons: dbPlan.max_patrons === -1 || dbPlan.max_patrons === null
                ? 'Unlimited'
                : (dbPlan.max_patrons ? dbPlan.max_patrons.toLocaleString() : 'Unlimited'),
            storage: dbPlan.max_storage_gb === -1 || dbPlan.max_storage_gb === null
                ? 'Unlimited'
                : (dbPlan.max_storage_gb ? `${dbPlan.max_storage_gb} GB` : 'Custom'),
            digital: hasFeature('digital_library'),
            branches: hasFeature('multi_branch'),
            domain: hasFeature('custom_domain'),
            api: hasFeature('api_access'),
            khmer: true, // Always true
            support: hasFeature('dedicated_support') ? 'Dedicated' :
                    hasFeature('email_notifications') ? 'Email' : 'Community',
        },
    };
};

export default function Pricing({ plans = [] }) {
    const { t } = useTranslation();

    // Use database plans if available, otherwise fall back to hardcoded
    const displayPlans = plans.length > 0
        ? plans.map(formatPlan)
        : PLANS;

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            { "@type": "Question", "name": "Can I start for free?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes. The Free plan includes 500 titles, 100 patrons, and 1GB storage — no credit card required." }},
            { "@type": "Question", "name": "What payment methods are accepted in Cambodia?",
              "acceptedAnswer": { "@type": "Answer", "text": "We accept ABA PayWay, Bakong KHQR, and international credit cards via Stripe." }},
            { "@type": "Question", "name": "Can I import my existing catalog?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes. Import via ISBN auto-lookup, CSV upload, or MARC21 format." }},
            { "@type": "Question", "name": "Is there a free trial for paid plans?",
              "acceptedAnswer": { "@type": "Answer", "text": "All paid plans include a 14-day free trial. No credit card required to start." }},
            { "@type": "Question", "name": "Is my library data isolated from other libraries?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes. Each library gets its own dedicated database. Your data is never shared with other tenants." }},
            { "@type": "Question", "name": "Does it support the Khmer language?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes. Alpha eLibrary fully supports Khmer (ខ្មែរ) and English. The interface, catalog entries, and patron communications all support Khmer." }}
        ]
    };

    return (
        <LandingLayout>
            <Head>
                <title>Pricing — Free Library Software Cambodia | Alpha eLibrary</title>
                <meta name="description" content="Start free with 500 titles and 100 patrons. Upgrade to Starter $29/mo, Pro $79/mo, or Enterprise. Best library software pricing in Cambodia. No hidden fees." head-key="description" />
                <meta property="og:title" content="Pricing — Free Library Software for Cambodia | Alpha eLibrary" head-key="og:title" />
                <meta property="og:description" content="Free plan available. Starter $29/mo, Pro $79/mo. Best library software pricing in Cambodia." head-key="og:description" />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            </Head>

            {/* Hero */}
            <section className="py-16 px-4 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{t('pricing.hero_title')}</h1>
                <p className="text-gray-500 text-lg max-w-xl mx-auto">
                    {t('pricing.hero_subtitle')}
                </p>
            </section>

            {/* Plan cards */}
            <section className="max-w-6xl mx-auto px-4 pb-16">
                <div className="grid md:grid-cols-4 gap-6">
                    {displayPlans.map(plan => {
                        const styles = COLOR_STYLES[plan.color];
                        return (
                            <div key={plan.name} className={`relative rounded-2xl border-2 p-6 flex flex-col ${styles.card} bg-white`}>
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                                <p className="text-xs text-gray-500 mt-1 mb-4">{plan.tagline}</p>
                                <div className="mb-6">
                                    {plan.price === null ? (
                                        <span className="text-2xl font-bold text-gray-900">Custom</span>
                                    ) : (
                                        <><span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                                        <span className="text-gray-400 text-sm">{plan.billing}</span></>
                                    )}
                                </div>
                                <Link
                                    href={plan.price === null ? '/contact' : '/demo'}
                                    className={`w-full py-2.5 rounded-xl text-sm font-semibold text-center mb-6 block ${styles.btn}`}>
                                    {plan.price === 0 ? 'Start Free' : plan.price === null ? 'Contact Us' : 'Start Trial'}
                                </Link>
                                <ul className="space-y-2.5 flex-1">
                                    {FEATURE_ROWS.map(row => {
                                        const val = plan.features[row.key];
                                        return (
                                            <li key={row.key} className="flex items-center gap-2 text-sm">
                                                {row.boolean
                                                    ? val
                                                        ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                                        : <X className="w-4 h-4 text-gray-300 shrink-0" />
                                                    : <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                                }
                                                <span className={row.boolean && !val ? 'text-gray-300' : 'text-gray-700'}>
                                                    {row.boolean ? row.label : <><strong>{val}</strong> {row.label}</>}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* FAQ */}
            <section className="max-w-3xl mx-auto px-4 pb-20">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {FAQS.map(faq => (
                        <div key={faq.q} className="card p-5">
                            <h3 className="font-semibold text-gray-900 mb-1">{faq.q}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>
        </LandingLayout>
    );
}
