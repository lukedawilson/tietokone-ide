import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'wwwroot/dist',
    rollupOptions: {
      input: {
        main: './wwwroot/js/site.js',
        styles: './wwwroot/css/site.css',
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      },
    },
  },
});
