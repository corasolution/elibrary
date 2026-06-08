import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n, { updateDynamicTranslations } from './i18n';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { staleTime: 60_000, retry: 1 },
    },
});

const appName = import.meta.env.VITE_APP_NAME || 'Alpha eLibrary';

createInertiaApp({
    title: (title) => title ? `${title} — ${appName}` : appName,
    resolve: (name) =>
        resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        // Load dynamic translations from CMS if available
        if (props.initialPage.props.translations) {
            updateDynamicTranslations(props.initialPage.props.translations);
        }

        const root = createRoot(el);
        root.render(
            <QueryClientProvider client={queryClient}>
                <I18nextProvider i18n={i18n}>
                    <App {...props} />
                </I18nextProvider>
            </QueryClientProvider>
        );
    },
    progress: { color: '#0ea5e9' },
});
