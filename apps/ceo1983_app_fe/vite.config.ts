import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const emptyMock = path.resolve(__dirname, 'src/mock-empty.js');

export default defineConfig(async ({ command }) => {
  const plugins = [
    tailwindcss(),
    viteTsConfigPaths({ projects: ['./tsconfig.json'] }),
    tanstackStart({
      importProtection: {
        behavior: 'error',
        client: {
          files: ['**/server/**'],
          specifiers: ['server-only'],
        },
      },
    }),
  ];

  if (command === 'build') {
    const { nitro } = await import('nitro/vite');
    plugins.push(nitro());
  }

  return {
    plugins,
    resolve: {
      alias: {
        'xmlhttprequest-ssl': emptyMock,
        https: 'node:https',
        http: 'node:http',
      },
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 2500,
    },
    server: {
      port: 5173,
      watch: {
        ignored: [
          '**/.output/**',
          '**/.tanstack/**',
          '**/release_apk/**',
          '**/android/**',
          '**/ios/**',
          '**/.turbo/**',
          '**/*.log',
        ],
      },
      proxy: {
        '/upload': {
          target: 'http://127.0.0.1:4000',
          changeOrigin: true,
          rewrite: (path: string) => '/api' + path,
        },
        '/api': {
          target: 'http://127.0.0.1:4000',
          changeOrigin: true,
        },
        '/socket.io': {
          target: 'http://127.0.0.1:4000',
          ws: true,
          changeOrigin: true,
        },
      },
    },
  };
});
