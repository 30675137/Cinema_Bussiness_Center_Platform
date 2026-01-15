/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 耀莱影城品牌色彩
        primary: {
          50: '#e6f7ff',
          100: '#bae7ff',
          200: '#91d5ff',
          300: '#69c0ff',
          400: '#40a9ff',
          500: '#1890ff', // 主色
          600: '#096dd9',
          700: '#0050b3',
          800: '#003a8c',
          900: '#002766',
        },
        success: {
          50: '#f6ffed',
          100: '#d9f7be',
          200: '#b7eb8f',
          300: '#95de64',
          400: '#73d13d',
          500: '#52c41a', // 成功色
          600: '#389e0d',
          700: '#237804',
          800: '#135200',
          900: '#092b00',
        },
        warning: {
          50: '#fffbe6',
          100: '#fff1b8',
          200: '#ffe58f',
          300: '#ffd666',
          400: '#ffc53d',
          500: '#faad14', // 警告色
          600: '#d48806',
          700: '#ad6800',
          800: '#874d00',
          900: '#613400',
        },
        error: {
          50: '#fff2f0',
          100: '#ffccc7',
          200: '#ffa39e',
          300: '#ff7875',
          400: '#ff4d4f',
          500: '#f5222d', // 错误色
          600: '#cf1322',
          700: '#a8071a',
          800: '#820014',
          900: '#5c0011',
        },

        // 业务扩展色彩
        cinema: {
          50: '#f9f0ff',
          100: '#efdbff',
          200: '#d3adf7',
          300: '#b37feb',
          400: '#9254de',
          500: '#722ed1', // 影院紫
          600: '#531dab',
          700: '#391085',
          800: '#22075e',
          900: '#120338',
        },
        food: {
          50: '#fff7e6',
          100: '#ffe7ba',
          200: '#ffd591',
          300: '#ffc069',
          400: '#ffa940',
          500: '#fa8c16', // 食品橙
          600: '#d46b08',
          700: '#ad4e00',
          800: '#873800',
          900: '#612500',
        },
        ticket: {
          50: '#e6fffb',
          100: '#b7f5eb',
          200: '#83e4d4',
          300: '#5cdbd3',
          400: '#36cfc9',
          500: '#13c2c2', // 票务青
          600: '#08979c',
          700: '#006d75',
          800: '#00474f',
          900: '#002329',
        },
      },

      // 字体系统
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
        ],
      },

      // 间距系统
      spacing: {
        18: '4.5rem',
        88: '22rem',
        120: '30rem',
      },

      // 圆角系统
      borderRadius: {
        4: '0.25rem',
        6: '0.375rem',
        8: '0.5rem',
      },

      // 阴影系统
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 6px 16px rgba(0, 0, 0, 0.12)',
      },

      // 动画时长
      transitionDuration: {
        250: '250ms',
        350: '350ms',
      },
    },
  },
  plugins: [
    // 可以在这里添加插件
  ],
};
