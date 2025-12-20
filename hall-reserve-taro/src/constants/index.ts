import type { Scenario, AddonItem, ScenarioCategory, TimeSlot } from '@/types'

export const THEME_CONFIG: Record<ScenarioCategory, {
  label: string
  badgeStyle: string
  gradientFrom: string
  borderColor: string
  iconColor: string
  heroOverlay: string
}> = {
  MOVIE: {
    label: '私人订制',
    badgeStyle: 'badge-purple',
    gradientFrom: 'from-purple-100',
    borderColor: 'border-purple-300',
    iconColor: 'text-purple-600',
    heroOverlay: 'overlay-purple'
  },
  TEAM: {
    label: '商务团建',
    badgeStyle: 'badge-cyan',
    gradientFrom: 'from-cyan-100',
    borderColor: 'border-cyan-300',
    iconColor: 'text-cyan-600',
    heroOverlay: 'overlay-cyan'
  },
  PARTY: {
    label: '派对策划',
    badgeStyle: 'badge-pink',
    gradientFrom: 'from-pink-100',
    borderColor: 'border-pink-300',
    iconColor: 'text-pink-600',
    heroOverlay: 'overlay-pink'
  }
}

export const SCENARIOS: Scenario[] = [
  {
    id: 's1',
    title: '至尊路演：企业年会/发布会专场',
    category: 'TEAM',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    tags: ['50-200人', '4K巨幕投屏', '自助茶歇'],
    location: '耀莱成龙影城（五棵松店）· 5号多功能厅',
    rating: 4.9,
    packages: [
      {
        id: 'p1',
        name: '年度会议标准包',
        price: 3500,
        originalPrice: 5000,
        desc: '含3小时场地、专业音响麦克风及会议投屏服务。',
        tags: ['企业首选']
      },
      {
        id: 'p2',
        name: '电竞/娱乐团建包',
        price: 4800,
        originalPrice: 6800,
        desc: '支持主机游戏投屏对战，含自助茶歇与饮料畅饮。',
        tags: ['甚至可以打游戏']
      }
    ]
  },
  {
    id: 's2',
    title: '浪漫策划：求婚/纪念日/私密观影',
    category: 'MOVIE',
    image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=800&q=80',
    tags: ['2-10人', '同步院线', '鲜花布置'],
    location: '耀莱成龙影城（王府井店）· VIP尊享厅',
    rating: 5.0,
    packages: [
      {
        id: 'p3',
        name: '二人世界尊享包',
        price: 888,
        originalPrice: 1288,
        desc: '含院线同步大片两张、情侣套餐及私密包厢。',
        tags: ['约会神器']
      },
      {
        id: 'p4',
        name: '盛大求婚仪式包',
        price: 5200,
        originalPrice: 8888,
        desc: '含30分钟映前屏幕告白视频、场地布置及策划服务。',
        tags: ['仪式感拉满']
      }
    ]
  },
  {
    id: 's3',
    title: '全案定制：生日派对/粉丝应援',
    category: 'PARTY',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    tags: ['20-50人', '管家服务', '主题餐饮'],
    location: '耀莱成龙影城（慈云寺店）· 3号亲子/派对厅',
    rating: 4.8,
    packages: [
      {
        id: 'p5',
        name: '粉丝应援打call包',
        price: 2200,
        originalPrice: 2800,
        desc: '允许自带物料布置，含荧光棒及定制票根打印。',
        tags: ['追星必备']
      },
      {
        id: 'p6',
        name: '梦幻生日派对包',
        price: 3688,
        originalPrice: 4500,
        desc: '含主题气球布置、生日蛋糕及专属摄影师跟拍。',
        tags: ['一站式服务']
      }
    ]
  }
]

export const ADDONS: AddonItem[] = [
  { id: 'a1', name: '高端茶歇(按人头)', price: 58, category: 'Food' },
  { id: 'a2', name: '进口气泡水畅饮', price: 188, category: 'Drink' },
  { id: 'a3', name: '专业会议/路演设备', price: 500, category: 'Service' },
  { id: 'a4', name: '求婚鲜花布置升级', price: 999, category: 'Service' }
]

export const TIME_SLOTS: TimeSlot[] = [
  { time: '10:00', status: 'Available' },
  { time: '14:30', status: 'Sold Out' },
  { time: '19:00', status: 'Available' },
  { time: '22:00', status: 'Available' }
]
