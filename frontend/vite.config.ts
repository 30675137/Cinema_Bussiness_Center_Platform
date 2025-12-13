import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/pages': resolve(__dirname, 'src/pages'),
      '@/features': resolve(__dirname, 'src/features'),
      '@/stores': resolve(__dirname, 'src/stores'),
      '@/services': resolve(__dirname, 'src/services'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/constants': resolve(__dirname, 'src/constants'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd', '@ant-design/icons'],
          query: ['@tanstack/react-query'],
          router: ['react-router-dom'],
          forms: ['react-hook-form', 'zod', '@hookform/resolvers'],
          utils: ['axios', 'lodash-es'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd', 'react-router-dom', 'zustand', '@tanstack/react-query'],
  },
  server: {
    port: 3000,
    host: true,
    // 当使用 MSW 时，禁用 API 代理以避免冲突
    // 设置 VITE_USE_MSW=true 来启用 MSW 模式
    proxy: process.env.VITE_USE_MSW === 'true' ? {} : {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Vitest configuration
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
  },
})
