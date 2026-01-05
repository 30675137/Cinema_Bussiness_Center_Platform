export default defineAppConfig({
  pages: [
    // TabBar 页面必须放在前面
    'pages/home/index',
    'pages/beverage/menu/index',
    'pages/mall/index',
    'pages/member/index',
    'pages/profile/index',
    // 普通页面 - 场地预约
    'pages/detail/index',
    'pages/store-detail/index',
    'pages/reservation-form/index',
    'pages/my-reservations/index',
    'pages/my-reservations/detail/index',
    'pages/success/index',
    'pages/admin/index',
    // 饮品订单页面
    'pages/beverage/detail/index',
    'pages/order/cart/index',
    'pages/order/confirm/index',
    'pages/order/payment/index',
    'pages/order/detail/index',
    'pages/order/list/index',
    // 商品列表页面 (O009)
    'pages/product-list/index',
    'pages/product-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '影院多元经营',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#ff2e4d',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '场地预约',
        iconPath: 'assets/tabbar/home.png',
        selectedIconPath: 'assets/tabbar/home-active.png'
      },
      {
        pagePath: 'pages/beverage/menu/index',
        text: '饮品',
        iconPath: 'assets/tabbar/mall.png',
        selectedIconPath: 'assets/tabbar/mall-active.png'
      },
      {
        pagePath: 'pages/mall/index',
        text: '商城',
        iconPath: 'assets/tabbar/mall.png',
        selectedIconPath: 'assets/tabbar/mall-active.png'
      },
      {
        pagePath: 'pages/member/index',
        text: '会员',
        iconPath: 'assets/tabbar/member.png',
        selectedIconPath: 'assets/tabbar/member-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tabbar/profile.png',
        selectedIconPath: 'assets/tabbar/profile-active.png'
      }
    ]
  }
})
