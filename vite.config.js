import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'wwwroot/dist',
    rollupOptions: {
      input: {
        main: './wwwroot/js/site.js',
        styles: './wwwroot/css/site.css',
      },
    },
  },
});
