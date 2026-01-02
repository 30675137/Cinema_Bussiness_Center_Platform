/**
 * @spec O006-miniapp-channel-order
 * Taro 开发环境配置
 */

import type { UserConfigExport } from '@tarojs/cli'

export default {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {
    API_BASE_URL: '"http://localhost:8080/api"'
  },
  mini: {},
  h5: {}
} satisfies UserConfigExport
