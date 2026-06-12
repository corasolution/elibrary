import { usePage, Link } from '@inertiajs/react';
import { ThemeProvider } from '@/Components/ThemeProvider';
import { useThemeVariant } from '@/hooks/useThemeVariant';
import { BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Import navbar variants
import NavbarSolid from '@/Components/Opac/variants/NavbarSolid';
import NavbarProfessional from '@/Components/Opac/variants/NavbarProfessional';
import NavbarDark from '@/Components/Opac/variants/NavbarDark';
import NavbarMinimal from '@/Components/Opac/variants/NavbarMinimal';
import NavbarColorful from '@/Components/Opac/variants/NavbarColorful';
import NavbarELibrary from '@/Components/Opac/variants/NavbarELibrary';
import NavbarCambodiaTax from '@/Components/Opac/variants/NavbarCambodiaTax';
import ChatbotWidget from '@/Components/Opac/ChatbotWidget';

export default function OpacLayout({ children }) {
    const { theme, tenant } = usePage().props;
    const { navbarStyle } = useThemeVariant();
    const base = tenant?.base_url ?? '';
    const { t } = useTranslation();

    // Select navbar component based on theme style
    const NavbarComponent = {
        'solid': NavbarSolid,
        'classic': NavbarSolid,
        'professional': NavbarProfessional,
        'university': NavbarProfessional,
        'dark': NavbarDark,
        'minimal': NavbarMinimal,
        'colorful': NavbarColorful,
        'elibrary': NavbarELibrary,
        'cambodia-tax': NavbarCambodiaTax,
    }[navbarStyle] || NavbarELibrary;

    return (
        <ThemeProvider theme={theme}>
            <div className="min-h-screen flex flex-col opac-page-bg">
                {/* Dynamic Navbar based on template */}
                <NavbarComponent />

            {/* Flash messages */}
            <FlashMessages />

            {/* Main content */}
            <main className="flex-1">
                {children}
            </main>

            {/* AI assistant (renders only when enabled) */}
            <ChatbotWidget />

            {/* ── Footer ── */}
            <footer className="mt-20 opac-footer-themed">
                {/* Top gradient divider */}
                <div className="h-px w-full" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)' }} />

                <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

                        {/* Brand column */}
                        <div className="md:col-span-4">
                            <Link href={`${base}/`} className="flex items-center gap-3 mb-5 group">
                                {tenant?.logo_url ? (
                                    <img src={tenant.logo_url} alt={tenant.name} className="h-10 w-auto object-contain opacity-90" />
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                                        <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                )}
                                <div>
                                    <div className="font-extrabold text-white text-base leading-tight">{tenant?.name || 'eLibrary'}</div>
                                    <div className="text-xs text-white/50 mt-0.5">{tenant?.tagline || t('footer.tagline')}</div>
                                </div>
                            </Link>

                            <p className="text-sm text-white/50 leading-relaxed max-w-xs mb-6">
                                {t('footer.description')}
                            </p>

                            {/* Social icons */}
                            <div className="flex items-center gap-2">
                                {[
                                    { label: 'Facebook', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
                                    { label: 'Twitter/X', path: 'M4 4l16 16M4 20L20 4' },
                                    { label: 'Telegram', path: 'M21.93 3.27a1.5 1.5 0 0 0-1.67-.32L2.5 10.06a1.5 1.5 0 0 0 .07 2.79l4.06 1.38 1.57 4.98a1 1 0 0 0 1.74.31l2.26-2.6 4.41 3.26a1.5 1.5 0 0 0 2.34-1.02l2-14a1.5 1.5 0 0 0-.02-.89z' },
                                ].map(s => (
                                    <a key={s.label} href="#" title={s.label}
                                        className="w-8 h-8 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/15 hover:border-white/20 transition-all">
                                        <svg className="w-3.5 h-3.5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d={s.path} />
                                        </svg>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Spacer */}
                        <div className="hidden md:block md:col-span-1" />

                        {/* Explore */}
                        <div className="md:col-span-2">
                            <div className="text-[11px] font-bold uppercase tracking-widest text-white/35 mb-4">{t('footer.explore')}</div>
                            <ul className="space-y-2.5">
                                {[
                                    { label: t('footer.ebooks'),        href: `${base}/catalog?type=ebook` },
                                    { label: t('footer.epublications'), href: `${base}/catalog?type=epub` },
                                    { label: t('footer.audio'),         href: `${base}/catalog?type=audio` },
                                    { label: t('footer.video'),         href: `${base}/catalog?type=video` },
                                    { label: t('footer.theses'),        href: `${base}/catalog?type=thesis` },
                                ].map(l => (
                                    <li key={l.href}>
                                        <Link href={l.href} className="text-sm text-white/55 hover:text-white transition-colors">{l.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Library */}
                        <div className="md:col-span-2">
                            <div className="text-[11px] font-bold uppercase tracking-widest text-white/35 mb-4">{t('footer.library')}</div>
                            <ul className="space-y-2.5">
                                {[
                                    { label: t('footer.browse_catalog'), href: `${base}/catalog` },
                                    { label: t('footer.new_arrivals'),   href: `${base}/catalog?sort=newest` },
                                    { label: t('footer.my_account'),     href: `${base}/account` },
                                    { label: t('auth.login'),            href: `${base}/login` },
                                ].map(l => (
                                    <li key={l.href}>
                                        <Link href={l.href} className="text-sm text-white/55 hover:text-white transition-colors">{l.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* About */}
                        <div className="md:col-span-3">
                            <div className="text-[11px] font-bold uppercase tracking-widest text-white/35 mb-4">{t('footer.about')}</div>
                            <ul className="space-y-2.5 mb-6">
                                {[
                                    { label: t('footer.about_us'),   href: `${base}/about` },
                                    { label: t('footer.contact_us'), href: `${base}/contact` },
                                    { label: t('footer.privacy'),    href: '#' },
                                    { label: t('footer.terms'),      href: '#' },
                                ].map(l => (
                                    <li key={l.label}>
                                        <a href={l.href} className="text-sm text-white/55 hover:text-white transition-colors">{l.label}</a>
                                    </li>
                                ))}
                            </ul>

                            {/* Developed by box */}
                            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                <div className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1">Developed by</div>
                                <a href="https://www.alphalib.org" target="_blank" rel="noopener noreferrer"
                                    className="text-sm font-bold text-white/80 hover:text-white transition-colors flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                                    www.alphalib.org
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/8">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                        <div className="text-xs text-white/35">
                            © {new Date().getFullYear()} <span className="text-white/55 font-medium">{tenant?.name || 'eLibrary'}</span>. {t('footer.rights')}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/35">
                            <span>Powered by <span className="text-white/55 font-medium">Alpha eLibrary</span></span>
                            <span className="w-px h-3 bg-white/15" />
                            <span>v1.0</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
        </ThemeProvider>
    );
}

function FlashMessages() {
    const { flash } = usePage().props;
    if (!flash?.success && !flash?.error) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 pt-4">
            {flash.success && (
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
                    {flash.success}
                </div>
            )}
            {flash.error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
                    {flash.error}
                </div>
            )}
        </div>
    );
}
