import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Globe, User, Bookmark, ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function NavbarELibrary() {
    const { auth, tenant } = usePage().props;
    const { t, i18n } = useTranslation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const base = tenant?.base_url ?? '';
    const [lang, setLang] = useState(i18n.language || 'en');

    const switchLanguage = (newLang) => {
        i18n.changeLanguage(newLang);
        setLang(newLang);
    };

    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
            {/* Utility row - Hidden for cleaner look */}
            <div className="hidden bg-[#0B1F52] text-white/90 text-xs">
                <div className="max-w-7xl mx-auto px-6 h-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5" />
                            {tenant?.name || 'Digital Library Network'}
                        </span>
                        <span className="opacity-60 hidden md:inline">•</span>
                        <span className="hidden md:inline opacity-80">Open access since 2019</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {auth?.patron ? (
                            <>
                                <Link href={`${base}/account`} className="hover:text-white inline-flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" />
                                    {auth.patron.name}
                                </Link>
                                <Link href={`${base}/logout`} method="post" className="hover:text-white">
                                    Sign out
                                </Link>
                            </>
                        ) : (
                            <Link href={`${base}/login`} className="hover:text-white inline-flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                Sign in
                            </Link>
                        )}
                        <a href="#" className="hover:text-white hidden md:inline">Help</a>
                        <a href="/admin" className="hover:text-white hidden md:inline">Librarian portal</a>
                    </div>
                </div>
            </div>

            {/* Main nav */}
            <div className="max-w-7xl mx-auto px-6 h-12 flex items-center gap-6">
                {/* Logo */}
                <Link href={`${base}/`} className="flex items-center gap-2.5 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 5a2 2 0 012-2h5v16H5a2 2 0 01-2-2V5z"/>
                            <path d="M21 5a2 2 0 00-2-2h-5v16h5a2 2 0 002-2V5z"/>
                        </svg>
                    </div>
                    <div className="leading-tight">
                        <div className="font-extrabold text-base tracking-tight text-gray-900 uppercase">
                            {tenant?.name || 'eLibrary'}
                        </div>
                    </div>
                </Link>

                {/* Menu - Hidden for cleaner look */}
                <nav className="hidden lg:flex items-center gap-1">
                </nav>

                {/* Right: lang + account */}
                <div className="ml-auto flex items-center gap-3">
                    {/* Language switch */}
                    <div className="flex items-center p-1 bg-slate-100 rounded-full text-xs font-semibold">
                        <button
                            onClick={() => switchLanguage('en')}
                            className={`px-3 py-1.5 rounded-full transition-all ${
                                lang === 'en'
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => switchLanguage('km')}
                            className={`px-3 py-1.5 rounded-full transition-all ${
                                lang === 'km'
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            ខ្មែរ
                        </button>
                    </div>

                    <button className="hidden sm:inline-flex w-8 h-8 items-center justify-center rounded-full hover:bg-slate-100 text-gray-700" aria-label="Saved">
                        <Bookmark className="w-4 h-4" />
                    </button>

                    {auth?.patron ? (
                        <Link
                            href={`${base}/account`}
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 transition-colors"
                        >
                            <User className="w-3.5 h-3.5" />
                            My Library
                        </Link>
                    ) : (
                        <Link
                            href={`${base}/login`}
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 transition-colors"
                        >
                            <User className="w-3.5 h-3.5" />
                            My Library
                        </Link>
                    )}
                </div>

            </div>

            {/* Mobile menu - Hidden for cleaner look */}
        </header>
    );
}
