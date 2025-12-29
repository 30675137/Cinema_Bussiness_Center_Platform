
import { Scenario, AddonItem, ScenarioCategory } from './types';

export const THEME_CONFIG: Record<ScenarioCategory, {
  label: string;
  badgeStyle: string;
  gradientFrom: string; // Used for home card tint
  borderColor: string;
  iconColor: string;
  heroOverlay: string; // Specific gradient for Detail page hero
}> = {
  MOVIE: {
    label: '私人订制',
    badgeStyle: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30',
    gradientFrom: 'from-purple-100 dark:from-purple-900',
    borderColor: 'group-hover:border-purple-300 dark:group-hover:border-purple-500/50',
    iconColor: 'text-purple-600 dark:text-purple-400',
    heroOverlay: 'from-purple-200/10 via-gray-50/40 to-gray-50 dark:from-purple-900/80 dark:via-[#050505]/50 dark:to-[#050505]'
  },
  TEAM: {
    label: '商务团建',
    badgeStyle: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30',
    gradientFrom: 'from-cyan-100 dark:from-cyan-900',
    borderColor: 'group-hover:border-cyan-300 dark:group-hover:border-cyan-500/50',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    heroOverlay: 'from-cyan-200/10 via-gray-50/40 to-gray-50 dark:from-cyan-900/80 dark:via-[#050505]/50 dark:to-[#050505]'
  },
  PARTY: {
    label: '派对策划',
    badgeStyle: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/30',
    gradientFrom: 'from-pink-100 dark:from-pink-900',
    borderColor: 'group-hover:border-pink-300 dark:group-hover:border-pink-500/50',
    iconColor: 'text-pink-600 dark:text-pink-400',
    heroOverlay: 'from-pink-200/10 via-gray-50/40 to-gray-50 dark:from-pink-900/80 dark:via-[#050505]/50 dark:to-[#050505]'
  }
};

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
];

export const ADDONS: AddonItem[] = [
  { id: 'a1', name: '高端茶歇(按人头)', price: 58, category: 'Food' },
  { id: 'a2', name: '进口气泡水畅饮', price: 188, category: 'Drink' },
  { id: 'a3', name: '专业会议/路演设备', price: 500, category: 'Service' },
  { id: 'a4', name: '求婚鲜花布置升级', price: 999, category: 'Service' },
];

export const TIME_SLOTS = [
  { time: '10:00', status: 'Available' },
  { time: '14:30', status: 'Sold Out' },
  { time: '19:00', status: 'Available' },
  { time: '22:00', status: 'Available' },
];
