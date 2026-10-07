import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // The hosted preview does not expose Vite's HMR WebSocket endpoint. Keep it
  // opt-in so the Vite client does not repeatedly report closed connections.
  const hmrEnabled = process.env.ENABLE_HMR === 'true' && process.env.DISABLE_HMR !== 'true';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      hmr: hmrEnabled,
      watch: hmrEnabled ? {} : null,
    },
  };
});
