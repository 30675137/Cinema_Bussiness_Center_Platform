/**
 * @spec O006-miniapp-channel-order
 * Taro 项目主配置文件
 */

import path from 'path'
import type { UserConfigExport } from '@tarojs/cli'

const config: UserConfigExport = {
  projectName: 'miniapp-ordering',
  date: '2026-1-2',
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
    '@tarojs/plugin-platform-h5'
  ],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {}
  },
  framework: 'react',
  compiler: {
    type: 'webpack5' as const,
    vitePlugins: []
  },
  cache: {
    enable: false
  },
  sass: {
    data: `@import "@/styles/variables.scss";`
  },
  alias: {
    '@': path.resolve(__dirname, '..', 'src'),
    '@/components': path.resolve(__dirname, '..', 'src/components'),
    '@/pages': path.resolve(__dirname, '..', 'src/pages'),
    '@/services': path.resolve(__dirname, '..', 'src/services'),
    '@/stores': path.resolve(__dirname, '..', 'src/stores'),
    '@/hooks': path.resolve(__dirname, '..', 'src/hooks'),
    '@/types': path.resolve(__dirname, '..', 'src/types'),
    '@/utils': path.resolve(__dirname, '..', 'src/utils'),
    '@/constants': path.resolve(__dirname, '..', 'src/constants'),
    '@/assets': path.resolve(__dirname, '..', 'src/assets'),
    '@/styles': path.resolve(__dirname, '..', 'src/styles')
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {}
      },
      url: {
        enable: true,
        config: {
          limit: 1024
        }
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    output: {
      filename: 'js/[name].[hash:8].js',
      chunkFilename: 'js/[name].[chunkhash:8].js'
    },
    miniCssExtractPluginOption: {
      ignoreOrder: true,
      filename: 'css/[name].[hash:8].css',
      chunkFilename: 'css/[name].[chunkhash:8].css'
    },
    postcss: {
      autoprefixer: {
        enable: true,
        config: {}
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    devServer: {
      port: 10186,
      hot: true,
      open: false,
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    }
  },
  rn: {
    appName: 'miniappOrdering',
    postcss: {
      cssModules: {
        enable: false
      }
    }
  }
}

export default config
