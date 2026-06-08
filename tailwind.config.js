/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'Noto Sans Khmer', 'ui-sans-serif', 'system-ui'],
                khmer: ['Noto Sans Khmer', 'sans-serif'],
                heading: ['var(--font-heading)', 'Inter', 'sans-serif'],
                body: ['var(--font-body)', 'Inter', 'sans-serif'],
            },
            colors: {
                // Theme colors from CSS variables
                primary: 'var(--color-primary, #2563eb)',
                secondary: 'var(--color-secondary, #64748b)',
                accent: 'var(--color-accent, #f59e0b)',
                background: 'var(--color-background, #ffffff)',
                text: 'var(--color-text, #1e293b)',
                muted: 'var(--color-muted, #94a3b8)',

                // Legacy brand colors (kept for backward compatibility)
                brand: {
                    50:  '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#082f49',
                },
                library: {
                    dark:    '#0f172a',
                    primary: '#1e40af',
                    accent:  '#f59e0b',
                },
            },
            borderRadius: {
                theme: 'var(--border-radius, 0.5rem)',
            },
            screens: {
                'xs': '475px',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
    ],
};
