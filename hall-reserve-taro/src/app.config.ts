export default defineAppConfig({
  pages: [
    // Tab 页面（必须放在最前面）
    'pages/home/index',
    'pages/mall/index',
    'pages/member/index',
    'pages/profile/index',
    // 其他非 Tab 页面
    'pages/detail/index',
    'pages/store-detail/index',
    'pages/reservation-form/index',
    'pages/my-reservations/index',
    'pages/my-reservations/detail/index',
    'pages/success/index',
    'pages/admin/index'
  ],
  tabBar: {
    color: '#999999',
    selectedColor: '#1890ff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '场地预约',
        iconPath: 'assets/tabbar/reserve.png',
        selectedIconPath: 'assets/tabbar/reserve-active.png'
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
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '影院多元经营',
    navigationBarTextStyle: 'black'
  }
})
