import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

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
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq) => {
              // The server is likely rejecting requests based on Origin/Referer headers.
              // We set them to match the target host to bypass these checks during local development.
              proxyReq.setHeader('Origin', 'https://cps.safarnameh24.com');
              proxyReq.setHeader('Referer', 'https://cps.safarnameh24.com/');
            });
          },
        },
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
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  };
});
