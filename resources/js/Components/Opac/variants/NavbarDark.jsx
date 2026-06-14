import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Search, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';

export default function NavbarDark() {
    const { auth, tenant } = usePage().props;
    const { t } = useTranslation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const base = tenant?.base_url ?? '';

    return (
        <header className="opac-navbar opac-navbar-themed sticky top-0 z-40 shadow-lg shadow-black/20">
            <div className="page-container px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand */}
                    <Link href={`${base}/`} className="brand flex items-center gap-2.5 text-white font-bold text-lg hover:text-gray-200 transition-colors">
                        <BookOpen className="w-6 h-6 text-primary" />
                        <span>{tenant?.name || t('app.name')}</span>
                    </Link>

                    {/* Nav links */}
                    <nav className="hidden md:flex items-center gap-4">
                        <Link href={`${base}/catalog`} className="text-sm text-gray-300 hover:text-white font-medium transition-colors">
                            {t('nav.catalog')}
                        </Link>
                        <LanguageSwitcher />
                        {auth?.patron ? (
                            <div className="flex items-center gap-3">
                                <Link href={`${base}/account`} className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors">
                                    <User className="w-4 h-4" />
                                    {auth.patron.name}
                                </Link>
                                <Link href={`${base}/logout`} method="post" as="button"
                                    className="text-sm text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors">
                                    <LogOut className="w-4 h-4" />
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href={`${base}/login`} className="text-sm text-gray-300 hover:text-white font-medium transition-colors">
                                    {t('auth.login')}
                                </Link>
                                {tenant?.self_registration && (
                                    <Link href={`${base}/register`} className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity">
                                        {t('nav.register')}
                                    </Link>
                                )}
                            </div>
                        )}
                    </nav>

                    {/* Mobile toggle */}
                    <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-gray-800 bg-gray-900 px-4 py-3 space-y-2">
                    <form action={`${base}/catalog`} method="GET">
                        <input type="text" name="q" placeholder={t('nav.search_placeholder')}
                            className="w-full bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg px-3 py-2 text-sm" />
                    </form>
                    <Link href={`${base}/catalog`} className="block text-sm text-gray-300 py-1 hover:text-white">{t('nav.catalog')}</Link>
                    {auth?.patron
                        ? <Link href={`${base}/account`} className="block text-sm text-gray-300 py-1 hover:text-white">{t('nav.account')}</Link>
                        : <Link href={`${base}/login`} className="block text-sm text-gray-300 py-1 hover:text-white">{t('auth.login')}</Link>
                    }
                </div>
            )}
        </header>
    );
}
