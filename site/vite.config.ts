import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// `base: './'` keeps every asset path relative, so the same build works on
// GitHub Pages under any repository name and from a local folder.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
