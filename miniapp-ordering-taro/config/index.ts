import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import { resolve } from 'path'

export default defineConfig<'vite'>(async (merge) => {
  const baseConfig: UserConfigExport<'vite'> = {
    projectName: 'miniapp-ordering-taro',
    date: '2025-01-02',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [
      '@tarojs/plugin-framework-react',
      '@tarojs/plugin-platform-h5',
      '@tarojs/plugin-platform-weapp'
    ],
    defineConstants: {},
    copy: {
      patterns: [],
      options: {}
    },
    framework: 'react',
    compiler: 'webpack5',
    alias: {
      '@': resolve(__dirname, '..', 'src')
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {}
        }
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      postcss: {
        autoprefixer: {
          enable: true,
          config: {}
        },
        pxtransform: {
          enable: true,
          config: {
            onePxTransform: true,
            unitPrecision: 5,
            propList: ['*'],
            selectorBlackList: [],
            replace: true,
            mediaQuery: false,
            minPixelValue: 0,
            baseFontSize: 20,
            maxRootSize: 40,
            minRootSize: 12
          }
        }
      },
      devServer: {
        port: 10087,
        hot: true
      }
    }
  }

  return baseConfig
})
