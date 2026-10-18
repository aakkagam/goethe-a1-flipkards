import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  base: '/goethe-a1-flipkards/',
  plugins: [preact()],
});
