import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Search, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';

export default function NavbarColorful() {
    const { auth, tenant } = usePage().props;
    const { t } = useTranslation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const base = tenant?.base_url ?? '';

    return (
        <header className="opac-navbar sticky top-0 z-40 shadow-lg shadow-primary/20">
            <div className="page-container px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand */}
                    <Link href={`${base}/`} className="brand flex items-center gap-2.5 text-white font-bold text-lg hover:text-white/90 transition-colors drop-shadow-md">
                        <BookOpen className="w-7 h-7" />
                        <span className="text-shadow">{tenant?.name || t('app.name')}</span>
                    </Link>

                    {/* Nav links */}
                    <nav className="hidden md:flex items-center gap-4">
                        <Link href={`${base}/catalog`} className="text-sm text-white hover:text-white/80 font-semibold transition-colors drop-shadow">
                            {t('nav.catalog')}
                        </Link>
                        <LanguageSwitcher />
                        {auth?.patron ? (
                            <div className="flex items-center gap-3">
                                <Link href={`${base}/account`} className="flex items-center gap-1.5 text-sm text-white hover:text-white/80 font-medium transition-colors drop-shadow">
                                    <User className="w-4 h-4" />
                                    {auth.patron.name}
                                </Link>
                                <Link href={`${base}/logout`} method="post" as="button"
                                    className="text-sm text-white/80 hover:text-white flex items-center gap-1 transition-colors">
                                    <LogOut className="w-4 h-4" />
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href={`${base}/login`} className="text-sm text-white hover:text-white/80 font-semibold transition-colors drop-shadow">
                                    {t('auth.login')}
                                </Link>
                                <Link href={`${base}/register`} className="bg-white text-primary px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-white/90 transition-colors shadow-md">
                                    {t('nav.register')}
                                </Link>
                            </div>
                        )}
                    </nav>

                    {/* Mobile toggle */}
                    <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-white/20 px-4 py-3 space-y-2 bg-gradient-to-b from-transparent to-black/10">
                    <form action={`${base}/catalog`} method="GET">
                        <input type="text" name="q" placeholder={t('nav.search_placeholder')}
                            className="w-full bg-white/90 border-0 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-500 shadow-md" />
                    </form>
                    <Link href={`${base}/catalog`} className="block text-sm text-white py-1.5 hover:text-white/80 font-medium">{t('nav.catalog')}</Link>
                    {auth?.patron
                        ? <Link href={`${base}/account`} className="block text-sm text-white py-1.5 hover:text-white/80 font-medium">{t('nav.account')}</Link>
                        : <Link href={`${base}/login`} className="block text-sm text-white py-1.5 hover:text-white/80 font-medium">{t('auth.login')}</Link>
                    }
                </div>
            )}
        </header>
    );
}
