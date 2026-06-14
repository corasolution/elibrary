import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enFallback from './locales/en.json';
import kmFallback from './locales/km.json';

// Get language from: 1) Server (window.initialLanguage), 2) localStorage, 3) HTML lang attribute, 4) fallback to Khmer
const getInitialLanguage = () => {
    // Check if server provided an initial language (from user's saved preference)
    if (typeof window !== 'undefined' && window.initialLanguage && ['en', 'km'].includes(window.initialLanguage)) {
        return window.initialLanguage;
    }

    const stored = localStorage.getItem('language');
    if (stored && ['en', 'km'].includes(stored)) {
        return stored;
    }

    const htmlLang = document.documentElement.lang;
    if (htmlLang && ['en', 'km'].includes(htmlLang)) {
        return htmlLang;
    }

    return 'km'; // Default to Khmer
};

// Initialize with fallback translations
i18n.use(initReactI18next).init({
    resources: {
        en: { translation: enFallback },
        km: { translation: kmFallback },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'km',
    interpolation: { escapeValue: false },
});

// `languageChanged` does NOT fire for the initial language, so the <html lang>
// rendered by Blade (server locale) can disagree with the language i18next
// actually shows. Sync it immediately so the :lang(km) CSS rules apply on
// first paint (otherwise Khmer inherits Latin letter-spacing and looks cramped).
if (typeof document !== 'undefined') {
    document.documentElement.lang = i18n.language;
}

// Listen for language changes and persist to localStorage
i18n.on('languageChanged', (lng) => {
    localStorage.setItem('language', lng);
    document.documentElement.lang = lng;
});

/**
 * Update translations dynamically from CMS
 * Call this when the page loads with Inertia shared props
 */
export const updateDynamicTranslations = (translations) => {
    if (translations && translations.en && translations.km) {
        // Merge CMS translations with fallback translations
        i18n.addResourceBundle('en', 'translation', translations.en, true, true);
        i18n.addResourceBundle('km', 'translation', translations.km, true, true);
    }
};

export default i18n;
