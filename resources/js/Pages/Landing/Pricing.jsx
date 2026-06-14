import LandingLayout from '@/Layouts/LandingLayout';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';

// ─── Feature presentation ────────────────────────────────────────────────────
// Known feature keys get a friendly label; unknown / custom strings pass through
// (prettified) so the page faithfully reflects whatever is stored on the plan.
const FEATURE_LABELS = {
    digital_library:     'Digital Library & Reader',
    email_notifications: 'Email Notifications',
    reports:             'Reports & Analytics',
    multi_branch:        'Multiple Locations',
    custom_domain:       'Custom Domain',
    api_access:          'API Access',
    dedicated_support:   'Dedicated Support',
    sla:                 'SLA Guarantee',
    khmer_language:      'Khmer Language',
};

const prettify = (key) =>
    String(key).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const featureLabel = (key) => FEATURE_LABELS[key] ?? prettify(key);

// ─── Per-plan presentation (name-driven, with sensible fallbacks) ────────────
const COLOR_BY_NAME = {
    Free:       'gray',
    Starter:    'blue',
    Pro:        'brand',
    Enterprise: 'purple',
};
const TAGLINE_BY_NAME = {
    Free:       'Perfect for small community libraries',
    Starter:    'Ideal for school and small public libraries',
    Pro:        'For universities and multi-branch systems',
    Enterprise: 'Custom deployments for national libraries',
};

const COLOR_STYLES = {
    gray:  { card: 'border-gray-200',   btn: 'bg-gray-700 hover:bg-gray-800 text-white' },
    blue:  { card: 'border-blue-200',   btn: 'bg-blue-600 hover:bg-blue-700 text-white' },
    brand: { card: 'border-brand-400 ring-2 ring-brand-400', btn: 'bg-brand-600 hover:bg-brand-700 text-white' },
    purple:{ card: 'border-purple-200', btn: 'bg-purple-700 hover:bg-purple-800 text-white' },
};

const fmtLimit = (v) =>
    v === -1 || v === null || v === undefined ? 'Unlimited' : Number(v).toLocaleString();

const fmtStorage = (v) =>
    v === -1 ? 'Unlimited' : (v === null || v === undefined ? 'Custom' : `${v} GB`);

// Normalize a DB plan record (LandingController payload) into the card shape.
const normalize = (p) => ({
    name:    p.name,
    price:   Number(p.price),
    billing: p.billing_cycle === 'yearly' ? '/year' : (Number(p.price) > 0 ? '/month' : ''),
    popular: !!p.is_popular,
    color:   COLOR_BY_NAME[p.name] || 'blue',
    tagline: TAGLINE_BY_NAME[p.name] || `Complete ${p.name} plan`,
    limits: {
        titles:  fmtLimit(p.max_titles),
        patrons: fmtLimit(p.max_patrons),
        storage: fmtStorage(p.max_storage_gb),
    },
    features: Array.isArray(p.features) ? p.features : [],
});

// Fallback used only when the database returns no active plans.
const FALLBACK = [
    { name: 'Free',       price: 0,   billing_cycle: 'monthly', is_popular: false, max_titles: 500,    max_patrons: 100,   max_storage_gb: 1,   features: [] },
    { name: 'Starter',    price: 29,  billing_cycle: 'monthly', is_popular: false, max_titles: 5000,   max_patrons: 1000,  max_storage_gb: 20,  features: ['digital_library', 'email_notifications'] },
    { name: 'Pro',        price: 79,  billing_cycle: 'monthly', is_popular: true,  max_titles: 50000,  max_patrons: 10000, max_storage_gb: 200, features: ['digital_library', 'multi_branch', 'custom_domain', 'api_access'] },
    { name: 'Enterprise', price: 199, billing_cycle: 'monthly', is_popular: false, max_titles: -1,     max_patrons: -1,    max_storage_gb: -1,  features: ['digital_library', 'multi_branch', 'custom_domain', 'api_access', 'dedicated_support', 'sla'] },
];

export default function Pricing({ plans = [] }) {
    const { t } = useTranslation();

    const source = plans.length > 0 ? plans : FALLBACK;
    const displayPlans = source.map(normalize);

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
                        const styles = COLOR_STYLES[plan.color] ?? COLOR_STYLES.blue;
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
                                    {plan.price === 0 ? (
                                        <span className="text-4xl font-bold text-gray-900">Free</span>
                                    ) : (
                                        <><span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                                        <span className="text-gray-400 text-sm">{plan.billing}</span></>
                                    )}
                                </div>
                                <Link
                                    href={plan.name === 'Enterprise' ? '/contact' : '/demo'}
                                    className={`w-full py-2.5 rounded-xl text-sm font-semibold text-center mb-6 block ${styles.btn}`}>
                                    {plan.price === 0 ? 'Start Free' : plan.name === 'Enterprise' ? 'Contact Us' : 'Start Trial'}
                                </Link>
                                <ul className="space-y-2.5 flex-1">
                                    <li className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                        <span className="text-gray-700"><strong>{plan.limits.titles}</strong> Titles</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                        <span className="text-gray-700"><strong>{plan.limits.patrons}</strong> Patrons</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                        <span className="text-gray-700"><strong>{plan.limits.storage}</strong> Storage</span>
                                    </li>
                                    {plan.features.map((f, i) => (
                                        <li key={`${f}-${i}`} className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                            <span className="text-gray-700">{featureLabel(f)}</span>
                                        </li>
                                    ))}
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
                    {faqSchema.mainEntity.map(faq => (
                        <div key={faq.name} className="card p-5">
                            <h3 className="font-semibold text-gray-900 mb-1">{faq.name}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{faq.acceptedAnswer.text}</p>
                        </div>
                    ))}
                </div>
            </section>
        </LandingLayout>
    );
}
