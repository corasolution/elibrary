import { Link, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Search, User, LogOut, Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useState } from 'react';

// Social icon placeholders (Facebook, Telegram, Instagram, YouTube)
function SocialIcons() {
    return (
        <div className="hidden md:flex items-center gap-1.5">
            {/* Facebook */}
            <a href="#" className="w-6 h-6 rounded flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
                <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
            </a>
            {/* Telegram */}
            <a href="#" className="w-6 h-6 rounded flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
                <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M21.93 3.27a1.5 1.5 0 0 0-1.67-.32L2.5 10.06a1.5 1.5 0 0 0 .07 2.79l4.06 1.38 1.57 4.98a1 1 0 0 0 1.74.31l2.26-2.6 4.41 3.26a1.5 1.5 0 0 0 2.34-1.02l2-14a1.5 1.5 0 0 0-.02-.89zM10 15.5l-.8-2.54 7.1-6.63L10 15.5zm1.2.94.4-1.44 1.3.96-1.7.48zm7.5 1.03-4.9-3.62 3.89-9.37-1.5 14.1z" />
                </svg>
            </a>
            {/* YouTube */}
            <a href="#" className="w-6 h-6 rounded flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
                <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
                </svg>
            </a>
        </div>
    );
}

function LangButton() {
    const { t, i18n } = useTranslation();
    const [open, setOpen] = useState(false);

    const currentLang = i18n.language?.startsWith('km') ? 'ខ្មែរ' : 'English';
    const otherCode   = i18n.language?.startsWith('km') ? 'en' : 'km';
    const otherLabel  = i18n.language?.startsWith('km') ? 'English' : 'ខ្មែរ';

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1 text-white text-xs font-medium border border-white/30 px-2.5 py-1 rounded hover:bg-white/10 transition-colors"
            >
                <Globe className="w-3.5 h-3.5" />
                <span>{currentLang}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
            {open && (
                <div className="absolute right-0 mt-1 bg-white shadow-lg rounded border border-gray-200 py-1 min-w-[110px] z-50">
                    <button
                        onClick={() => { i18n.changeLanguage(otherCode); setOpen(false); }}
                        className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                    >
                        {otherLabel}
                    </button>
                </div>
            )}
        </div>
    );
}

export default function NavbarCambodiaTax() {
    const { auth, tenant } = usePage().props;
    const { t } = useTranslation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQ, setSearchQ] = useState('');
    const base = tenant?.base_url ?? '';

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQ.trim()) router.get(`${base}/catalog`, { q: searchQ });
    };

    const navLinks = [
        { label: t('nav.home'),    href: `${base}/` },
        { label: t('nav.catalog'), href: `${base}/catalog` },
        { label: t('nav.ebooks'),  href: `${base}/catalog?type=ebook` },
        { label: t('nav.audio'),   href: `${base}/catalog?type=audio` },
        { label: t('nav.video'),   href: `${base}/catalog?type=video` },
        { label: t('nav.theses'),  href: `${base}/catalog?type=thesis` },
    ];

    const isActive = (href) => {
        const path = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
        if (href === `${base}/`) return path === href || path === base + '/';
        return path.startsWith(href.split('?')[0]) && (href.includes('?') ? path.includes(href.split('?')[1]) : true);
    };

    return (
        <header className="opac-navbar sticky top-0 z-40 shadow-md">
            {/* ── Top bar: deep navy ── */}
            <div className="opac-navbar-themed">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 py-2.5">
                        {/* Logo + Library name */}
                        <Link href={`${base}/`} className="flex items-center gap-3 shrink-0 group">
                            {/* Logo: use uploaded image if available, else seal placeholder */}
                            {tenant?.logo_url ? (
                                <img
                                    src={tenant.logo_url}
                                    alt={tenant.name}
                                    className="h-16 w-auto object-contain"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                    </svg>
                                </div>
                            )}
                            <div className="leading-tight">
                                <div className="text-white font-bold text-sm leading-tight">
                                    {tenant?.name || t('app.name')}
                                </div>
                                <div className="text-white/60 text-[10px] hidden sm:block">
                                    {tenant?.tagline || t('footer.tagline')}
                                </div>
                            </div>
                        </Link>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Social + lang + auth */}
                        <div className="flex items-center gap-3">
                            <SocialIcons />
                            <LangButton />

                            {auth?.patron ? (
                                <div className="hidden md:flex items-center gap-2">
                                    <Link href={`${base}/account`}
                                        className="flex items-center gap-1.5 text-white/85 hover:text-white text-xs font-medium transition-colors">
                                        <User className="w-3.5 h-3.5" />
                                        <span className="hidden lg:block">{auth.patron.name}</span>
                                    </Link>
                                    <Link href={`${base}/logout`} method="post" as="button"
                                        className="text-white/60 hover:text-red-300 transition-colors">
                                        <LogOut className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center gap-2">
                                    <Link href={`${base}/login`}
                                        className="text-white/85 hover:text-white text-xs font-medium transition-colors">
                                        {t('auth.login')}
                                    </Link>
                                </div>
                            )}

                            {/* Mobile toggle */}
                            <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
                                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bottom nav bar: medium blue ── */}
            <div style={{ backgroundColor: 'var(--color-secondary, #2952BE)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="hidden md:flex items-stretch h-10">
                        {navLinks.map((link) => {
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`
                                        relative flex items-center px-4 text-sm font-medium h-full transition-all
                                        ${active
                                            ? 'text-white'
                                            : 'text-white/75 hover:text-white hover:bg-white/10'
                                        }
                                    `}
                                >
                                    {/* Active tab: orange bottom border + slight background */}
                                    {active && (
                                        <>
                                            <span
                                                className="absolute inset-0"
                                                style={{ backgroundColor: 'var(--color-accent, #E8971D)', opacity: 0.18 }}
                                            />
                                            <span
                                                className="absolute bottom-0 inset-x-0 h-0.5"
                                                style={{ backgroundColor: 'var(--color-accent, #E8971D)' }}
                                            />
                                        </>
                                    )}
                                    <span className="relative z-10">{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* ── Mobile dropdown ── */}
            {mobileOpen && (
                <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-2"
                    style={{ backgroundColor: 'var(--color-primary, #1B3D8F)' }}>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={searchQ}
                            onChange={e => setSearchQ(e.target.value)}
                            placeholder={t('nav.search_placeholder')}
                            className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded px-3 py-1.5 text-sm focus:outline-none"
                        />
                        <button type="submit" className="bg-white/15 px-3 py-1.5 rounded border border-white/20">
                            <Search className="w-4 h-4 text-white" />
                        </button>
                    </form>
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={`block text-sm py-1.5 px-1 border-l-2 transition-colors ${
                                isActive(link.href)
                                    ? 'text-white border-orange-400 font-medium'
                                    : 'text-white/75 border-transparent hover:text-white hover:border-white/30'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {!auth?.patron && (
                        <Link href={`${base}/login`} onClick={() => setMobileOpen(false)}
                            className="block text-sm py-1.5 text-white/75 hover:text-white">
                            {t('auth.login')}
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
}
