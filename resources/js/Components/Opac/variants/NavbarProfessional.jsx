import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Search, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';

export default function NavbarProfessional() {
    const { auth, tenant } = usePage().props;
    const { t } = useTranslation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const base = tenant?.base_url ?? '';

    return (
        <header className="opac-navbar sticky top-0 z-40">
            <div className="page-container px-4 sm:px-6 lg:px-8">
                {/* Top row: Brand + utility links */}
                <div className="flex items-center justify-between border-b border-white/10 py-3">
                    <Link href={`${base}/`} className="brand flex items-center gap-2.5 font-bold text-xl">
                        <BookOpen className="w-7 h-7" />
                        <span className="uppercase tracking-wide">{tenant?.name || t('app.name')}</span>
                    </Link>

                    {/* Auth section */}
                    <div className="hidden md:flex items-center gap-4">
                        <LanguageSwitcher />
                        {auth?.patron ? (
                            <div className="flex items-center gap-3">
                                <Link href={`${base}/account`} className="flex items-center gap-1.5 text-sm hover:text-white/80">
                                    <User className="w-4 h-4" />
                                    {auth.patron.name}
                                </Link>
                                <Link href={`${base}/logout`} method="post" as="button"
                                    className="text-sm hover:text-red-300 flex items-center gap-1">
                                    <LogOut className="w-4 h-4" />
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href={`${base}/login`} className="text-sm hover:text-white/80 font-medium">
                                    {t('auth.login')}
                                </Link>
                                <Link href={`${base}/register`} className="bg-white text-blue-700 px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-white/90">
                                    {t('nav.register')}
                                </Link>
                            </div>
                        )}

                        {/* Mobile toggle */}
                        <button className="md:hidden ml-2" onClick={() => setMobileOpen(!mobileOpen)}>
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Bottom row: Navigation + Search */}
                <div className="flex items-center justify-between py-4">
                    <nav className="hidden md:flex items-center gap-6 ml-auto">
                        <Link href={`${base}/catalog`} className="text-sm font-semibold hover:text-white/80 uppercase tracking-wide">
                            {t('nav.catalog')}
                        </Link>
                        <Link href={`${base}/`} className="text-sm hover:text-white/80">
                            {t('nav.home')}
                        </Link>
                    </nav>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-3">
                    <form action={`${base}/catalog`} method="GET">
                        <input type="text" name="q" placeholder={t('nav.search_placeholder')}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/60" />
                    </form>
                    <Link href={`${base}/catalog`} className="block text-sm py-2 hover:text-white/80">{t('nav.catalog')}</Link>
                    {auth?.patron
                        ? <Link href={`${base}/account`} className="block text-sm py-2 hover:text-white/80">{t('nav.account')}</Link>
                        : <Link href={`${base}/login`} className="block text-sm py-2 hover:text-white/80">{t('auth.login')}</Link>
                    }
                </div>
            )}
        </header>
    );
}
