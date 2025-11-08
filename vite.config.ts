
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
          secure: false,
          // Replace the 'configure' hook with a more direct 'headers' object.
          // This is a more reliable way to set static headers for the proxy to
          // satisfy the server's security policy (checking Origin/Referer).
          headers: {
            'Origin': 'https://cps.safarnameh24.com',
            'Referer': 'https://cps.safarnameh24.com/',
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
      // Fix: Adhere to Gemini API guidelines by using process.env.API_KEY.
      // This maps the value from the GEMINI_API_KEY environment variable to process.env.API_KEY in the client-side code.
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  };
});
