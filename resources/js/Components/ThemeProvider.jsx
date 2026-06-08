import { useEffect } from 'react';
import { loadGoogleFonts } from '@/utils/loadGoogleFonts';

export function ThemeProvider({ children, theme }) {
    useEffect(() => {
        if (!theme) return;

        // Apply CSS custom properties to root
        const root = document.documentElement;

        // Apply colors
        if (theme.colors) {
            Object.entries(theme.colors).forEach(([key, value]) => {
                root.style.setProperty(`--color-${key}`, value);
            });
        }

        // Apply fonts
        if (theme.fonts) {
            root.style.setProperty('--font-heading', `'${theme.fonts.heading}', sans-serif`);
            root.style.setProperty('--font-body', `'${theme.fonts.body}', sans-serif`);

            // Load Google Fonts
            const fontsToLoad = [];
            if (theme.fonts.heading) fontsToLoad.push(theme.fonts.heading);
            if (theme.fonts.body && theme.fonts.body !== theme.fonts.heading) {
                fontsToLoad.push(theme.fonts.body);
            }

            if (fontsToLoad.length > 0) {
                loadGoogleFonts(fontsToLoad);
            }
        }

        // Apply styles
        if (theme.styles) {
            if (theme.styles.borderRadius) {
                root.style.setProperty('--border-radius', theme.styles.borderRadius);
            }
        }

        // Apply template class to body
        if (theme.id) {
            document.body.className = `theme-${theme.id}`;
        }

        // Apply data attributes for CSS targeting
        if (theme.styles) {
            if (theme.styles.layout) {
                document.body.setAttribute('data-layout', theme.styles.layout);
            }
            if (theme.styles.navbarStyle) {
                document.body.setAttribute('data-navbar-style', theme.styles.navbarStyle);
            }
            if (theme.styles.cardStyle) {
                document.body.setAttribute('data-card-style', theme.styles.cardStyle);
            }
            if (theme.styles.heroStyle) {
                document.body.setAttribute('data-hero-style', theme.styles.heroStyle);
            }
            if (theme.styles.buttonStyle) {
                document.body.setAttribute('data-button-style', theme.styles.buttonStyle);
            }
        }

        // Inject custom CSS if exists
        if (theme.custom_css) {
            let styleElement = document.getElementById('custom-theme-css');

            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = 'custom-theme-css';
                document.head.appendChild(styleElement);
            }

            styleElement.textContent = theme.custom_css;
        }

    }, [theme]);

    return <>{children}</>;
}
