import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: false,
    fs: {
      // Restrict file serving to only the project directory
      strict: true,
      allow: ['.'],
      deny: ['.env', '.env.*', '**/*.{crt,pem}'],
    },
  },
  optimizeDeps: {
    // Only scan the project's entry points
    entries: ['index.html', 'src/**/*.{ts,tsx}'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
