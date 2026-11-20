import { defineConfig, type UserConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import { nitro } from 'nitro/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const emptyMock = path.resolve(__dirname, 'src/mock-empty.js');

export default defineConfig(({ command }): UserConfig => {
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
    viteReact(),
    ...(command === 'build'
      ? [
          nitro({
            routeRules: {
              '/socket.io/**': {
                proxy: `${process.env.NEST_API_URL || 'http://127.0.0.1:4000'}/socket.io/**`,
              },
            },
          }),
        ]
      : []),
  ];

  return {
    plugins,
    esbuild: {
      jsx: 'automatic',
    },
    resolve: {
      alias: {
        'xmlhttprequest-ssl': emptyMock,
        https: 'node:https',
        http: 'node:http',
      },
      dedupe: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@tanstack/react-query',
        '@tanstack/query-core',
        '@tanstack/react-router',
        '@tanstack/react-start',
      ],
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
      ],
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 2500,
    },
    server: {
      host: true,
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
