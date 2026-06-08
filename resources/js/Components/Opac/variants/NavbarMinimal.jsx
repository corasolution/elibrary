import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Search, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';

export default function NavbarMinimal() {
    const { auth, tenant } = usePage().props;
    const { t } = useTranslation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const base = tenant?.base_url ?? '';

    return (
        <header className="opac-navbar bg-transparent sticky top-0 z-40 backdrop-blur-sm">
            <div className="page-container px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 border-b border-gray-100">
                    {/* Brand */}
                    <Link href={`${base}/`} className="brand flex items-center gap-2 text-gray-800 font-light text-lg hover:text-primary transition-colors">
                        <BookOpen className="w-5 h-5" />
                        <span className="tracking-wide">{tenant?.name || t('app.name')}</span>
                    </Link>

                    {/* Nav links (desktop) */}
                    <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
                        <Link href={`${base}/catalog`} className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
                            {t('nav.catalog')}
                        </Link>

                        <LanguageSwitcher />
                        {auth?.patron ? (
                            <>
                                <Link href={`${base}/account`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                    <User className="w-4 h-4" />
                                    <span className="font-medium">{auth.patron.name}</span>
                                </Link>
                                <Link href={`${base}/logout`} method="post" as="button"
                                    className="text-sm text-gray-400 hover:text-red-600 transition-colors">
                                    <LogOut className="w-4 h-4" />
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href={`${base}/login`} className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
                                    {t('auth.login')}
                                </Link>
                                <Link href={`${base}/register`} className="text-sm text-primary hover:text-primary/80 font-semibold transition-colors">
                                    {t('nav.register')}
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button className="md:hidden text-gray-600 hover:text-gray-900" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden border-b border-gray-100 bg-white/95 backdrop-blur-sm px-4 py-3 space-y-2">
                    <form action={`${base}/catalog`} method="GET">
                        <input type="text" name="q" placeholder={t('nav.search_placeholder')}
                            className="w-full border-0 border-b border-gray-300 px-0 py-1.5 text-sm focus:outline-none focus:border-gray-900" />
                    </form>
                    <Link href={`${base}/catalog`} className="block text-sm text-gray-700 py-1.5 hover:text-gray-900">{t('nav.catalog')}</Link>
                    {auth?.patron
                        ? <Link href={`${base}/account`} className="block text-sm text-gray-700 py-1.5 hover:text-gray-900">{t('nav.account')}</Link>
                        : <Link href={`${base}/login`} className="block text-sm text-gray-700 py-1.5 hover:text-gray-900">{t('auth.login')}</Link>
                    }
                </div>
            )}
        </header>
    );
}
