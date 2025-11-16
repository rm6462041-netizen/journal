import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,       // Dev server port
    open: true,       // Open browser automatically
    cors: true        // Enable CORS for your Flask backend
  }
});
