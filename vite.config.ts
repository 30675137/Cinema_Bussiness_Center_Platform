import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'frontend/src'),
      '@components': resolve(__dirname, 'frontend/src/components'),
      '@pages': resolve(__dirname, 'frontend/src/pages'),
      '@hooks': resolve(__dirname, 'frontend/src/hooks'),
      '@stores': resolve(__dirname, 'frontend/src/stores'),
      '@services': resolve(__dirname, 'frontend/src/services'),
      '@types': resolve(__dirname, 'frontend/src/types'),
      '@utils': resolve(__dirname, 'frontend/src/utils'),
      '@styles': resolve(__dirname, 'frontend/src/styles')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd', '@ant-design/icons'],
          router: ['react-router-dom']
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})