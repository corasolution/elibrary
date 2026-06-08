import { usePage, Link } from '@inertiajs/react';
import { ThemeProvider } from '@/Components/ThemeProvider';
import { useThemeVariant } from '@/hooks/useThemeVariant';
import { BookOpen } from 'lucide-react';

// Import navbar variants
import NavbarSolid from '@/Components/Opac/variants/NavbarSolid';
import NavbarProfessional from '@/Components/Opac/variants/NavbarProfessional';
import NavbarDark from '@/Components/Opac/variants/NavbarDark';
import NavbarMinimal from '@/Components/Opac/variants/NavbarMinimal';
import NavbarColorful from '@/Components/Opac/variants/NavbarColorful';
import NavbarELibrary from '@/Components/Opac/variants/NavbarELibrary';

export default function OpacLayout({ children }) {
    const { theme, tenant } = usePage().props;
    const { navbarStyle } = useThemeVariant();
    const base = tenant?.base_url ?? '';

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
                                <div className="text-xs text-white/60">Digital Knowledge Portal</div>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-white/60 max-w-sm">
                            A modern library management system — free, searchable, and accessible to everyone.
                        </p>
                    </div>
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">Explore</div>
                        <ul className="space-y-2 text-sm">
                            <li><Link href={`${base}/catalog?type=ebook`} className="hover:text-white">eBooks</Link></li>
                            <li><Link href={`${base}/catalog?type=epub`} className="hover:text-white">ePublications</Link></li>
                            <li><Link href={`${base}/catalog?type=audio`} className="hover:text-white">Audio</Link></li>
                            <li><Link href={`${base}/catalog?type=video`} className="hover:text-white">Video</Link></li>
                            <li><Link href={`${base}/catalog?type=thesis`} className="hover:text-white">Theses</Link></li>
                        </ul>
                    </div>
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">Library</div>
                        <ul className="space-y-2 text-sm">
                            <li><Link href={`${base}/catalog`} className="hover:text-white">Browse catalog</Link></li>
                            <li><Link href={`${base}/collections`} className="hover:text-white">Collections</Link></li>
                            <li><Link href={`${base}/new-arrivals`} className="hover:text-white">New arrivals</Link></li>
                            <li><Link href={`${base}/account`} className="hover:text-white">My account</Link></li>
                        </ul>
                    </div>
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">About</div>
                        <ul className="space-y-2 text-sm">
                            <li><Link href={`${base}/about`} className="hover:text-white">About us</Link></li>
                            <li><Link href={`${base}/contact`} className="hover:text-white">Contact us</Link></li>
                            <li><a href="#" className="hover:text-white">Privacy</a></li>
                            <li><a href="#" className="hover:text-white">Terms</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-6 py-5 text-xs text-white/50 flex items-center justify-between">
                        <div>© {new Date().getFullYear()} {tenant?.name || 'eLibrary'}. All rights reserved.</div>
                        <div>Built by <span className="text-white/70">Corasoft</span> · v1.0</div>
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
