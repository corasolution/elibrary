import { useTranslation } from 'react-i18next';
import LandingLayout from '@/Layouts/LandingLayout';
import { CheckCircle, Clock, Mail } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function RegistrationPending() {
    const { t } = useTranslation();

    return (
        <LandingLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
                <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-12 text-center">
                    {/* Success Icon */}
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
                        <CheckCircle className="w-12 h-12" />
                    </div>

                    {/* Main Message */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {t('registration.pending_title', 'Registration Submitted Successfully!')}
                    </h1>

                    <p className="text-lg text-gray-600 mb-8">
                        {t('registration.pending_message', 'Thank you for registering with Alpha eLibrary. Your account is under review and we will get back to you soon.')}
                    </p>

                    {/* What's Next Section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
                        <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            {t('registration.whats_next', 'What happens next?')}
                        </h2>

                        <ol className="space-y-3 text-sm text-blue-800">
                            <li className="flex items-start gap-3">
                                <span className="font-semibold shrink-0">1.</span>
                                <span>{t('registration.step1', 'Our team will review your registration within 24-48 hours.')}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="font-semibold shrink-0">2.</span>
                                <span>{t('registration.step2', 'We will contact you on Telegram to verify your library information.')}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="font-semibold shrink-0">3.</span>
                                <span>{t('registration.step3', 'Once verified, we will set up your library account and send you your login details.')}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="font-semibold shrink-0">4.</span>
                                <span>{t('registration.step4', 'Your 30-day free trial will begin immediately upon approval.')}</span>
                            </li>
                        </ol>
                    </div>

                    {/* Contact Section */}
                    <div className="flex items-center justify-center gap-2 text-gray-600 mb-8">
                        <Mail className="w-5 h-5" />
                        <span className="text-sm">
                            {t('registration.contact_help', 'Questions? Contact us at')}{' '}
                            <a href="mailto:support@bannalai.com" className="text-brand-600 hover:underline font-medium">
                                support@bannalai.com
                            </a>
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center">
                        <Link href="/" className="btn-secondary px-6 py-2">
                            {t('registration.back_home', 'Back to Home')}
                        </Link>
                        <Link href="/features" className="btn-primary px-6 py-2">
                            {t('registration.explore_features', 'Explore Features')}
                        </Link>
                    </div>
                </div>
            </div>
        </LandingLayout>
    );
}
