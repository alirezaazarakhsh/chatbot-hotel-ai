
import path from 'path';
import { readFileSync } from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'https://cps.safarnameh24.com',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
          headers: {
            'Origin': 'https://cps.safarnameh24.com',
            'Referer': 'https://cps.safarnameh24.com/',
          },
        },
        '/gemini-api': {
          target: `https://generativelanguage.googleapis.com`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/gemini-api/, '') + `&key=${env.GEMINI_API_KEY}`,
        }
      },
    },

    preview: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: [
        'localhost', 
        '127.0.0.1', 
        'chatbot.safarnameh24.com',
        'www.chatbot.safarnameh24.com', 
        'safarnameh24.com', 
        'cps.safarnameh24.com'
      ],
    },

    plugins: [react()],

    define: {
      'process.env.APP_VERSION': JSON.stringify(packageJson.version),
    },

    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  };
});
