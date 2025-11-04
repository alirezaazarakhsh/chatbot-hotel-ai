import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    // تنظیمات حالت توسعه (dev)
    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    // تنظیمات حالت پیش‌نمایش (production preview)
    preview: {
      port: 3000,
      host: '0.0.0.0',
      // مهم: اجازه دادن به تمام دامنه‌ها (برای Nginx reverse proxy)
      allowedHosts: 'all',
    },

    plugins: [react()],

    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
  };
});