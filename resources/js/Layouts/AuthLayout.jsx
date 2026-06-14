import { usePage, Link } from '@inertiajs/react';
import { BookOpen, BookMarked, Users, Wifi } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AuthLayout({ children, title, subtitle }) {
    const { tenant } = usePage().props;
    const { t } = useTranslation();
    const base = tenant?.base_url ?? '';
    const libraryName = tenant?.name ?? 'eLibrary';

    return (
        <div className="min-h-screen flex">
            {/* ── Left panel: Brand ── */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative flex-col overflow-hidden"
                style={{ background: 'linear-gradient(145deg, #1B3D8F 0%, #2952BE 55%, #1e6fbf 100%)' }}>

                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
                <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(-40%, 40%)' }} />
                <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full opacity-5 -translate-x-1/2 -translate-y-1/2 border-2 border-white" />
                <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full opacity-5 -translate-x-1/2 -translate-y-1/2 border border-white" />

                <div className="relative z-10 flex flex-col h-full px-10 py-10">
                    {/* Logo + Library name */}
                    <Link href={base || '/'} className="flex items-center gap-3 group">
                        {tenant?.logo_url ? (
                            <img src={tenant.logo_url} alt={libraryName} className="h-12 w-auto object-contain" />
                        ) : (
                            <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                        )}
                        <div>
                            <div className="text-white font-bold text-lg leading-tight">{libraryName}</div>
                            <div className="text-white/50 text-xs">{tenant?.tagline || t('footer.tagline')}</div>
                        </div>
                    </Link>

                    {/* Center content */}
                    <div className="flex-1 flex flex-col justify-center">
                        <h2 className="text-white font-extrabold text-3xl xl:text-4xl leading-tight mb-4">
                            Your library,<br />
                            <span className="text-blue-200">everywhere you go.</span>
                        </h2>
                        <p className="text-white/60 text-sm leading-relaxed mb-10 max-w-xs">
                            Access thousands of books, journals, audio and video resources — anytime, anywhere.
                        </p>

                        {/* Feature highlights */}
                        <div className="space-y-4">
                            {[
                                { icon: BookMarked, label: 'Browse & borrow physical books' },
                                { icon: Wifi,       label: 'Read eBooks & stream media online' },
                                { icon: Users,      label: 'Manage loans, fines & reservations' },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-4 h-4 text-white/80" />
                                    </div>
                                    <span className="text-white/70 text-sm">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-white/30 text-xs">
                        © {new Date().getFullYear()} {libraryName}. Powered by Alpha eLibrary.
                    </div>
                </div>
            </div>

            {/* ── Right panel: Form ── */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {/* Mobile logo bar */}
                <div className="lg:hidden flex items-center gap-2 px-6 py-4 bg-white border-b border-gray-200">
                    {tenant?.logo_url ? (
                        <img src={tenant.logo_url} alt={libraryName} className="h-8 w-auto object-contain" />
                    ) : (
                        <BookOpen className="w-5 h-5 text-blue-600" />
                    )}
                    <span className="font-bold text-gray-800">{libraryName}</span>
                </div>

                <div className="flex-1 flex items-center justify-center px-6 py-10">
                    <div className="w-full max-w-sm">
                        {/* Form header */}
                        <div className="mb-8">
                            {title && (
                                <h1 className="text-2xl font-extrabold text-gray-900 mb-1">{title}</h1>
                            )}
                            {subtitle && (
                                <p className="text-sm text-gray-500">{subtitle}</p>
                            )}
                        </div>

                        {/* Form card */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
                            {children}
                        </div>

                        {/* Back link */}
                        <p className="text-center mt-5">
                            <Link href={base ? `${base}/catalog` : '/'}
                                className="text-xs text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1">
                                ← {t('nav.catalog')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
