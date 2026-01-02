/**
 * @spec O006-miniapp-channel-order
 * Taro 应用全局配置
 */

export default {
  pages: [
    'pages/index/index', // 商品菜单页面（首页）
    'pages/product-detail/index', // 商品详情页面
    'pages/order-confirm/index', // 订单确认页面
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#18181b',
    navigationBarTitleText: '商品菜单',
    navigationBarTextStyle: 'white',
  },
}
