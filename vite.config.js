import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: '127.0.0.1', // replace with the IP address of the Homestead machine
        https: false,
        cors: true,
        hmr: {
            host: '127.0.0.1', // replace with the IP address of the Homestead machine
        }
    },
});
