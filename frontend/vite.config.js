/**
 * ==============================================================================
 * Vite Configuration File
 * ==============================================================================
 * 
 * WHAT IS THIS FILE?
 * Vite (pronounced "veet") is the modern build tool and local development server 
 * used for this React website. Think of it like a lightning-fast engine that takes 
 * your React code, bundles it, and shows it live in your web browser.
 * 
 * WHY IS IT NEEDED?
 * Web browsers cannot run modern React JSX code directly. Vite translates the JSX, 
 * packages CSS styles, and optimizes images and files so they load instantly.
 * 
 * HOW DOES IT CONNECT TO THE REST OF THE PROJECT?
 * - When you run `npm run dev`, Vite reads this file to start the local website at http://localhost:5173.
 * - When you run `npm run build`, Vite packages everything into the production-ready `dist/` folder.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Enables official React support so Vite understands JSX syntax (<Component />)
  plugins: [react()],

  // Local development server configuration
  server: {
    // Port 5173 is the local web address (e.g., http://localhost:5173)
    port: 5173,
    // host: true allows viewing the site from other devices on the same Wi-Fi (like your phone)
    host: true,
  },
});


