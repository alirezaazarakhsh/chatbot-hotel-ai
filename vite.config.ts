import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// بدون نیاز به type ConfigEnv — چون از JS-style استفاده می‌کنیم (مثل کد شما)
export default defineConfig(({ mode }) => {
  // بارگذاری متغیرهای .env
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // === تنظیمات حالت توسعه (npm run dev) ===
    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    // === تنظیمات حالت پیش‌نمایش (npm run preview) — مهم! ===
    preview: {
      port: 3000,
      host: '0.0.0.0',
      // رفع خطای "Blocked request" در production
      allowedHosts: 'all',
    },

    // === پلاگین‌ها ===
    plugins: [react()],

    // === متغیرهای محیطی (GEMINI_API_KEY) ===
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    // === alias برای import راحت (مثل @/components) ===
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // بهتره فقط src باشه
      },
    },
  };
});