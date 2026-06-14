import { router } from '@inertiajs/react';
import { ChevronLeft, User } from 'lucide-react';
import { useEffect } from 'react';

export default function EditorLayout({ title, onBack, children, backRoute }) {
    // Escape key handler
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && onBack) {
                onBack();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onBack]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Minimal top bar */}
            <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 shadow-sm">
                {/* Back button */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back to Templates</span>
                    </button>
                )}

                {/* Title */}
                <h1 className="ml-4 text-lg font-semibold text-gray-900">{title}</h1>

                {/* Spacer */}
                <div className="flex-1" />

                {/* User indicator (optional) */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Press ESC to exit</span>
                </div>
            </header>

            {/* Full-height content area */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
