import { URL, fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          // FIX: `__dirname` is not available in ES modules.
          // Using `import.meta.url` is the standard way to get the current file's path.
          '@': fileURLToPath(new URL('.', import.meta.url)),
        }
      }
    };
});