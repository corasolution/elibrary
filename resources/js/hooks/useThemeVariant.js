import { usePage } from '@inertiajs/react';

/**
 * Custom hook to access theme style variants
 *
 * Returns the current theme's style properties from the template JSON.
 * Provides sensible defaults if theme or styles are not available.
 *
 * @returns {Object} Theme style properties
 */
export function useThemeVariant() {
    const { theme } = usePage().props;

    return {
        // Layout style: controls page container width and structure
        layout: theme?.styles?.layout || 'centered',

        // Card style: controls how catalog records are displayed
        cardStyle: theme?.styles?.cardStyle || 'shadow',

        // Navbar style: controls header/navigation appearance
        navbarStyle: theme?.styles?.navbarStyle || 'solid',

        // Hero style: controls homepage hero section design
        heroStyle: theme?.styles?.heroStyle || 'gradient',

        // Button style: controls button appearance throughout
        buttonStyle: theme?.styles?.buttonStyle || 'rounded',

        // Border radius: global border radius value
        borderRadius: theme?.styles?.borderRadius || '0.5rem',

        // Full theme object for advanced use cases
        theme: theme || null,
    };
}
