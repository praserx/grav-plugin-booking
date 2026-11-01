import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    target: 'es2022',
    outDir: 'admin-next/pages',
    emptyOutDir: false,
    minify: false,
    lib: {
      entry: 'src/admin/main.ts',
      name: 'GravBookingAdmin',
      formats: ['iife'],
      fileName: () => 'booking.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: 'booking.js',
        assetFileNames: '[name][extname]',
      },
    },
  },
});
