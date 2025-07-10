import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

// Load environment variables from .env files
export default defineConfig(() => {
  return {
    plugins: [react()],
    define: {
      'process.env': {
        CANISTER_ID_CARBONLOCK_BACKEND: JSON.stringify(process.env.CANISTER_ID_CARBONLOCK_BACKEND),
        CANISTER_ID_CARBONLOCK_FRONTEND: JSON.stringify(process.env.CANISTER_ID_CARBONLOCK_FRONTEND),
        DFX_NETWORK: JSON.stringify(process.env.DFX_NETWORK || 'local'),
        HOST: JSON.stringify(process.env.HOST || 'http://localhost:8000')
      }
    },
    server: {
      proxy: {
        // Proxy API requests to the local replica
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api/v1')
        }
      }
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    resolve: {
      alias: [
        {
          find: "declarations",
          replacement: fileURLToPath(
            new URL("../declarations", import.meta.url)
          ),
        },
      ],
    },
  };
});
