import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // تنظیمات توسعه
    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    // تنظیمات production preview — مهم!
    preview: {
      port: 3000,
      host: '0.0.0.0',
      // این خط مشکل Blocked رو حل می‌کنه
      allowedHosts: ['localhost', '127.0.0.1', 'chatbot.safarnameh24.com','www.chatbot.safarnameh24.com', 'safarnameh24.com', 'cps.safarnameh24.com' ],
      // یا: allowedHosts: 'all' — اما بهتره دقیق بنویسیم
    },

    plugins: [react()],

    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});