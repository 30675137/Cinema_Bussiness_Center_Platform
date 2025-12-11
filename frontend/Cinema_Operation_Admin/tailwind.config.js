/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // Ant Design 主题同步
        antPrimary: '#1890ff',
        antSuccess: '#52c41a',
        antWarning: '#faad14',
        antError: '#ff4d4f',
      },
      screens: {
        xs: '480px',
        sm: '576px',
        md: '768px',
        lg: '992px',
        xl: '1200px',
        xxl: '1600px',
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true, // 保留 Tailwind 的基础样式重置
  }
}