import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Search, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';

export default function NavbarSolid() {
    const { auth, tenant } = usePage().props;
    const { t } = useTranslation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const base = tenant?.base_url ?? '';

    return (
        <header className="opac-navbar opac-navbar-themed sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand */}
                    <Link href={`${base}/`} className="brand flex items-center gap-2 text-blue-700 font-bold text-lg">
                        <BookOpen className="w-6 h-6" />
                        <span>{tenant?.name || t('app.name')}</span>
                    </Link>

                    {/* Nav links */}
                    <nav className="hidden md:flex items-center gap-4">
                        <Link href={`${base}/catalog`} className="text-sm text-gray-600 hover:text-blue-600 font-medium">
                            {t('nav.catalog')}
                        </Link>
                        <LanguageSwitcher />
                        {auth?.patron ? (
                            <div className="flex items-center gap-3">
                                <Link href={`${base}/account`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600">
                                    <User className="w-4 h-4" />
                                    {auth.patron.name}
                                </Link>
                                <Link href={`${base}/logout`} method="post" as="button"
                                    className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1">
                                    <LogOut className="w-4 h-4" />
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href={`${base}/login`} className="text-sm text-gray-600 hover:text-blue-600 font-medium">
                                    {t('auth.login')}
                                </Link>
                                {tenant?.self_registration && (
                                    <Link href={`${base}/register`} className="btn-primary text-xs py-1.5 px-3">
                                        {t('nav.register')}
                                    </Link>
                                )}
                            </div>
                        )}
                    </nav>

                    {/* Mobile toggle */}
                    <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
                    <form action={`${base}/catalog`} method="GET">
                        <input type="text" name="q" placeholder={t('nav.search_placeholder')}
                            className="w-full input text-sm" />
                    </form>
                    <Link href={`${base}/catalog`} className="block text-sm text-gray-700 py-1">{t('nav.catalog')}</Link>
                    {auth?.patron
                        ? <Link href={`${base}/account`} className="block text-sm text-gray-700 py-1">{t('nav.account')}</Link>
                        : <Link href={`${base}/login`} className="block text-sm text-gray-700 py-1">{t('auth.login')}</Link>
                    }
                </div>
            )}
        </header>
    );
}
