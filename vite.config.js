import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import zipPack from "vite-plugin-zip-pack";
import manifest from './manifest.json';

export default defineConfig(({ mode }) => {
    const isProduction = mode === 'production';
    console.log(Object.values(manifest.icons));
    const icons = Object.values(manifest.icons);

    return {
        plugins: [
            viteStaticCopy({
                targets: [
                    { src: 'manifest.json', dest: '.' },
                    { src: icons, dest: 'icons' },
                    { src: 'popup/index.html', dest: 'popup' }
                ]
            }),
            zipPack()
        ],
        build: {
            outDir: 'dist',
            minify: isProduction ? 'esbuild' : false,
            rollupOptions: {
                input: {
                    'content': 'content.js',
                    'scripts/page-agent': 'scripts/page-agent.js',
                    'assets/css/search-ui': 'styles/search-ui.css',
                    'assets/css/uicons-solid-rounded': 'node_modules/@flaticon/flaticon-uicons/css/solid/rounded.css',
                    'popup/popup': 'popup/popup.js', 
                    'popup/styles': 'popup/styles.css' 
                },
                output: {
                    banner: '(function () {',
                    footer: '})();',
                    entryFileNames: '[name].js',
                    assetFileNames: (assetInfo) => {     
                        const name = assetInfo?.names[0] || '';                  
                        if (name.endsWith('.woff2') || name.endsWith('.woff') || name.endsWith('.eot')) {
                            return 'assets/fonts/[name][extname]';
                        }
                        return '[name][extname]';
                    },
                }
            }
        },
    };
});