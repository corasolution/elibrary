import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        host: '127.0.0.1',
        port: 5174,
    },
    plugins: [
        laravel({
            input: ['resources/js/app.jsx', 'resources/css/app.css'],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // Core React runtime — most stable, longest cache life
                    if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
                        return 'vendor-react';
                    }
                    // Inertia + routing
                    if (id.includes('@inertiajs') || id.includes('ziggy')) {
                        return 'vendor-inertia';
                    }
                    // i18n
                    if (id.includes('i18next') || id.includes('react-i18next')) {
                        return 'vendor-i18n';
                    }
                    // React Query
                    if (id.includes('@tanstack')) {
                        return 'vendor-query';
                    }
                    // Lucide icons — large, but stable
                    if (id.includes('lucide-react')) {
                        return 'vendor-icons';
                    }
                    // Charts — only used on report pages, already lazy
                    if (id.includes('recharts') || id.includes('d3-')) {
                        return 'vendor-charts';
                    }
                    // PDF / ebook readers — already lazy-loaded per page
                    if (id.includes('pdfjs') || id.includes('react-pdf') || id.includes('epubjs')) {
                        return 'vendor-readers';
                    }
                },
            },
        },
    },
});
