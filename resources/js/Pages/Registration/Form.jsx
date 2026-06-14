import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import LandingLayout from '@/Layouts/LandingLayout';
import { BookOpen, Building2, User } from 'lucide-react';

export default function RegistrationForm({ plans }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        library_name: '',
        slug: '',
        contact_name: '',
        contact_email: '',
        telegram: '',
        contact_phone: '',
        plan_id: plans.find(p => p.name === 'Free')?.id || '',
        library_type: '',
        collection_size: '',
        address: '',
        country: 'KHM',
    });

    // Auto-generate slug from library name
    const handleLibraryNameChange = (e) => {
        const name = e.target.value;
        setData('library_name', name);

        if (!data.slug || data.slug === slugify(data.library_name)) {
            setData('slug', slugify(name));
        }
    };

    const slugify = (text) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 50);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('register.submit'));
    };

    return (
        <LandingLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-600 text-white mb-3">
                            <BookOpen className="w-7 h-7" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            {t('registration.title', 'Register Your Library')}
                        </h1>
                        <p className="text-sm text-gray-600">
                            {t('registration.subtitle', 'Start your free 30-day trial. No credit card required.')}
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                        <form onSubmit={submit} className="space-y-5">
                            {/* Library Information */}
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-brand-600" />
                                    {t('registration.library_info', 'Library Information')}
                                </h2>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('registration.library_name', 'Library Name')} *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.library_name}
                                            onChange={handleLibraryNameChange}
                                            className={`input w-full ${errors.library_name ? 'border-red-500' : ''}`}
                                            placeholder="e.g., Royal University of Phnom Penh Library"
                                            required
                                        />
                                        {errors.library_name && <p className="text-red-500 text-xs mt-1">{errors.library_name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('registration.slug', 'Library URL')} *
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">bannalai.com/</span>
                                            <input
                                                type="text"
                                                value={data.slug}
                                                onChange={(e) => setData('slug', e.target.value)}
                                                className={`input flex-1 ${errors.slug ? 'border-red-500' : ''}`}
                                                placeholder="your-library"
                                                pattern="[a-z0-9\-]+"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {t('registration.slug_hint', 'Lowercase letters, numbers, and hyphens only')}
                                        </p>
                                        {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('registration.library_type', 'Library Type')}
                                        </label>
                                        <select
                                            value={data.library_type}
                                            onChange={(e) => setData('library_type', e.target.value)}
                                            className="input w-full"
                                        >
                                            <option value="">Select type...</option>
                                            <option value="university">University Library</option>
                                            <option value="public">Public Library</option>
                                            <option value="school">School Library</option>
                                            <option value="research">Research Library</option>
                                            <option value="special">Special Library</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('registration.collection_size', 'Approximately how many titles do you have?')} *
                                        </label>
                                        <select
                                            value={data.collection_size}
                                            onChange={(e) => setData('collection_size', e.target.value)}
                                            className={`input w-full ${errors.collection_size ? 'border-red-500' : ''}`}
                                            required
                                        >
                                            <option value="">Select range...</option>
                                            <option value="under-500">Under 500</option>
                                            <option value="500-5000">500 – 5,000</option>
                                            <option value="5000-50000">5,000 – 50,000</option>
                                            <option value="50000-plus">50,000+</option>
                                        </select>
                                        {errors.collection_size && <p className="text-red-500 text-xs mt-1">{errors.collection_size}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4 text-brand-600" />
                                    {t('registration.contact_info', 'Contact Information')}
                                </h2>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('registration.contact_name', 'Full Name')} *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.contact_name}
                                            onChange={(e) => setData('contact_name', e.target.value)}
                                            className={`input w-full ${errors.contact_name ? 'border-red-500' : ''}`}
                                            required
                                        />
                                        {errors.contact_name && <p className="text-red-500 text-xs mt-1">{errors.contact_name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('registration.contact_email', 'Email Address')} *
                                        </label>
                                        <input
                                            type="email"
                                            value={data.contact_email}
                                            onChange={(e) => setData('contact_email', e.target.value)}
                                            className={`input w-full ${errors.contact_email ? 'border-red-500' : ''}`}
                                            required
                                        />
                                        {errors.contact_email && <p className="text-red-500 text-xs mt-1">{errors.contact_email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('registration.telegram', 'Telegram')} *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.telegram}
                                            onChange={(e) => setData('telegram', e.target.value)}
                                            className={`input w-full ${errors.telegram ? 'border-red-500' : ''}`}
                                            placeholder="@username or phone"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {t('registration.telegram_hint', "We'll contact you on Telegram to verify your library.")}
                                        </p>
                                        {errors.telegram && <p className="text-red-500 text-xs mt-1">{errors.telegram}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('registration.contact_phone', 'Phone Number')}
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.contact_phone}
                                            onChange={(e) => setData('contact_phone', e.target.value)}
                                            className="input w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Plan Selection */}
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 mb-3">
                                    {t('registration.select_plan', 'Select Plan')}
                                </h2>

                                <div className="grid grid-cols-2 gap-3">
                                    {plans.map((plan) => (
                                        <label
                                            key={plan.id}
                                            className={`relative border-2 rounded-lg p-3 cursor-pointer transition-all ${
                                                data.plan_id === plan.id
                                                    ? 'border-brand-500 bg-brand-50'
                                                    : 'border-gray-200 hover:border-brand-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="plan_id"
                                                value={plan.id}
                                                checked={data.plan_id === plan.id}
                                                onChange={(e) => setData('plan_id', e.target.value)}
                                                className="sr-only"
                                            />
                                            <div className="text-sm font-semibold text-gray-900">{plan.name}</div>
                                            <div className="text-xl font-bold text-brand-600 mt-1">
                                                {plan.price_usd === 0 ? 'Free' : `$${plan.price_usd}/mo`}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {plan.max_titles ? `${plan.max_titles.toLocaleString()} titles` : 'Unlimited'}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full btn-primary py-2.5 text-base disabled:opacity-50"
                                >
                                    {processing
                                        ? t('registration.submitting', 'Submitting...')
                                        : t('registration.submit', 'Register Library')}
                                </button>

                                <p className="text-xs text-gray-500 text-center mt-3">
                                    {t('registration.terms', 'By registering, you agree to our Terms of Service and Privacy Policy.')}
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </LandingLayout>
    );
}
