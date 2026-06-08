import { usePage, Link } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle, maxWidth = 'max-w-sm' }) {
    const { tenant } = usePage().props;
    const base = tenant?.base_url ?? '';
    const libraryName = tenant?.name ?? 'CoraLibrary';

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className={`w-full ${maxWidth}`}>
                {/* Brand header */}
                <div className="text-center mb-8">
                    <Link href={base || '/'} className="inline-flex items-center gap-2 text-brand-700 font-bold text-xl mb-1 hover:text-brand-800">
                        <BookOpen className="w-6 h-6" />
                        {libraryName}
                    </Link>
                    {title && <h1 className="text-2xl font-bold text-gray-900 mt-2">{title}</h1>}
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>

                {/* Card */}
                <div className="card p-8">
                    {children}
                </div>

                {/* Back link */}
                <p className="text-center mt-4">
                    <Link href={base ? `${base}/catalog` : '/'} className="text-sm text-gray-500 hover:text-gray-700">
                        ← Back to catalog
                    </Link>
                </p>
            </div>
        </div>
    );
}
