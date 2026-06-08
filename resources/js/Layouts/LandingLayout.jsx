import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';

export default function LandingLayout({ children }) {
    const { t } = useTranslation();
    const { platform } = usePage().props;

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-brand-700 font-bold text-lg">
                        {platform?.logo ? (
                            <img
                                src={`/storage/${platform.logo}`}
                                alt={platform.name || 'Alpha eLibrary'}
                                className="h-12 object-contain"
                            />
                        ) : (
                            <>
                                <BookOpen className="w-6 h-6" />
                                <span>{platform?.name || 'Alpha eLibrary'}</span>
                            </>
                        )}
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                        <Link href="/features" className="hover:text-brand-600">{t('landing.features_title')}</Link>
                        <Link href="/pricing" className="hover:text-brand-600">{t('landing.pricing_title')}</Link>
                        <Link href="/about" className="hover:text-brand-600">{t('landing.about_title')}</Link>
                        <LanguageSwitcher />
                        <Link href="/demo" className="btn-secondary text-xs py-1.5 px-3">{t('landing.cta_demo')}</Link>
                        <Link href="/register" className="btn-primary text-xs py-1.5 px-3">{t('landing.cta_trial')}</Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="bg-gray-900 text-gray-300">
                <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 text-white font-bold mb-3">
                            {platform?.logo ? (
                                <img
                                    src={`/storage/${platform.logo}`}
                                    alt={platform.name || 'Alpha eLibrary'}
                                    className="h-10 object-contain brightness-0 invert"
                                />
                            ) : (
                                <>
                                    <BookOpen className="w-5 h-5 text-brand-400" />
                                    <span>{platform?.name || 'Alpha eLibrary'}</span>
                                </>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            The Modern Library OS for Southeast Asia.
                            Built by Corasoft, Phnom Penh 🇰🇭
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white text-sm font-semibold mb-3">Product</h4>
                        <ul className="space-y-2 text-xs">
                            <li><Link href="/features" className="hover:text-white">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                            <li><Link href="/demo" className="hover:text-white">Demo</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white text-sm font-semibold mb-3">Company</h4>
                        <ul className="space-y-2 text-xs">
                            <li><Link href="/about" className="hover:text-white">About</Link></li>
                            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white text-sm font-semibold mb-3">Legal</h4>
                        <ul className="space-y-2 text-xs">
                            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-600">
                    © {new Date().getFullYear()} Corasoft. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
