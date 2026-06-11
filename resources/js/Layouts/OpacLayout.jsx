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
import ChatbotWidget from '@/Components/Opac/ChatbotWidget';

export default function OpacLayout({ children }) {
    const { theme, tenant } = usePage().props;
    const { navbarStyle } = useThemeVariant();
    const base = tenant?.base_url ?? '';
    const { t } = useTranslation();

    // Select navbar component based on theme style
    const NavbarComponent = {
        'solid': NavbarSolid,
        'professional': NavbarProfessional,
        'dark': NavbarDark,
        'minimal': NavbarMinimal,
        'colorful': NavbarColorful,
        'elibrary': NavbarELibrary,
    }[navbarStyle] || NavbarELibrary; // Default to eLibrary design

    return (
        <ThemeProvider theme={theme}>
            <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
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

            {/* Footer - eLibrary style */}
            <footer className="mt-20 bg-[#0B1F52] text-white/80">
                <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-8">
                    <div className="col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="font-extrabold text-white">{tenant?.name || 'eLibrary'}</div>
                                <div className="text-xs text-white/60">{t('footer.tagline')}</div>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-white/60 max-w-sm">
                            {t('footer.description')}
                        </p>
                    </div>
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">{t('footer.explore')}</div>
                        <ul className="space-y-2 text-sm">
                            <li><Link href={`${base}/catalog?type=ebook`} className="hover:text-white">{t('footer.ebooks')}</Link></li>
                            <li><Link href={`${base}/catalog?type=epub`} className="hover:text-white">{t('footer.epublications')}</Link></li>
                            <li><Link href={`${base}/catalog?type=audio`} className="hover:text-white">{t('footer.audio')}</Link></li>
                            <li><Link href={`${base}/catalog?type=video`} className="hover:text-white">{t('footer.video')}</Link></li>
                            <li><Link href={`${base}/catalog?type=thesis`} className="hover:text-white">{t('footer.theses')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">{t('footer.library')}</div>
                        <ul className="space-y-2 text-sm">
                            <li><Link href={`${base}/catalog`} className="hover:text-white">{t('footer.browse_catalog')}</Link></li>
                            <li><Link href={`${base}/collections`} className="hover:text-white">{t('footer.collections')}</Link></li>
                            <li><Link href={`${base}/new-arrivals`} className="hover:text-white">{t('footer.new_arrivals')}</Link></li>
                            <li><Link href={`${base}/account`} className="hover:text-white">{t('footer.my_account')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">{t('footer.about')}</div>
                        <ul className="space-y-2 text-sm">
                            <li><Link href={`${base}/about`} className="hover:text-white">{t('footer.about_us')}</Link></li>
                            <li><Link href={`${base}/contact`} className="hover:text-white">{t('footer.contact_us')}</Link></li>
                            <li><a href="#" className="hover:text-white">{t('footer.privacy')}</a></li>
                            <li><a href="#" className="hover:text-white">{t('footer.terms')}</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-6 py-5 text-xs text-white/50 flex items-center justify-between">
                        <div>© {new Date().getFullYear()} {tenant?.name || 'eLibrary'}. {t('footer.rights')}</div>
                        <div>{t('footer.built_by')} <span className="text-white/70">Corasoft</span> · v1.0</div>
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
