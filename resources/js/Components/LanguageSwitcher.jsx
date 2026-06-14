import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const languages = [
        { code: 'km', name: 'ខ្មែរ', nativeName: 'ភាសាខ្មែរ' },
        { code: 'en', name: 'English', nativeName: 'English' },
    ];

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    const changeLanguage = async (langCode) => {
        i18n.changeLanguage(langCode);
        setOpen(false);

        // Persist to backend if user is authenticated in admin/central area
        if (typeof window !== 'undefined' &&
            (window.location.pathname.includes('/admin') ||
             window.location.pathname.startsWith('/central'))) {
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
                if (!csrfToken) return;

                await fetch('/admin/preferences/language', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify({ language: langCode }),
                });
            } catch (error) {
                console.error('Failed to save language preference:', error);
                // Language still changes locally via localStorage, so no user-visible error
            }
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="lang-trigger flex items-center gap-1.5 px-3 py-1.5 text-base rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Change language"
            >
                <Globe className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-700">{currentLang.name}</span>
                <svg
                    className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="lang-dropdown absolute right-0 mt-1.5 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                                i18n.language === lang.code
                                    ? 'lang-active bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <span className="text-base">{lang.name}</span>
                            {i18n.language === lang.code && (
                                <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
