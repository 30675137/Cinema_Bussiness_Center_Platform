/**
 * @spec O006-miniapp-channel-order
 * 批量导入 O006 任务到飞书项目管理系统
 *
 * 使用方法：
 * npx tsx scripts/import-o006-tasks.ts
 */

import { execSync } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Task {
  id: string;
  title: string;
  priority: '🔴 高' | '🟡 中' | '🟢 低';
  sprint: string;
  phase: string;
  tags: string[];
  notes: string;
  estimatedHours?: number;
}

// Phase 1: Setup & Infrastructure (Sprint 1)
const phase1Tasks: Task[] = [
  {
    id: 'SETUP-001',
    title: '创建功能分支 feat/O006-miniapp-channel-order 并切换 hall-reserve-taro/',
    priority: '🔴 高',
    sprint: 'Sprint-1',
    phase: 'Phase 1: Setup & Infrastructure',
    tags: ['Infra'],
    notes: '依赖：无 | 文件：.git/config',
    estimatedHours: 0.5
  },
  {
    id: 'SETUP-002',
    title: '验证 Taro 项目依赖安装 (npm install 成功，版本 Taro 4.1.9 + React 18.3.1)',
    priority: '🔴 高',
    sprint: 'Sprint-1',
    phase: 'Phase 1: Setup & Infrastructure',
    tags: ['Infra'],
    notes: '依赖：SETUP-001 | 文件：hall-reserve-taro/package.json',
    estimatedHours: 0.5
  },
  {
    id: 'SETUP-003',
    title: '启动 H5 开发服务器验证基础环境 (npm run dev:h5 成功运行)',
    priority: '🔴 高',
    sprint: 'Sprint-1',
    phase: 'Phase 1: Setup & Infrastructure',
    tags: ['Infra'],
    notes: '依赖：SETUP-002 | 验证：http://localhost:10086',
    estimatedHours: 0.5
  },
  {
    id: 'SETUP-004',
    title: '配置 .specify/active_spec.txt 指向 specs/O006-miniapp-channel-order/spec.md',
    priority: '🔴 高',
    sprint: 'Sprint-1',
    phase: 'Phase 1: Setup & Infrastructure',
    tags: ['Infra'],
    notes: '依赖：SETUP-001 | 文件：.specify/active_spec.txt',
    estimatedHours: 0.25
  }
];

// Phase 2: Foundational (Sprint 2)
const phase2Tasks: Task[] = [
  {
    id: 'TYPE-001',
    title: '创建 hall-reserve-taro/src/types/channelProduct.ts (ChannelProductDTO, ChannelCategory, ProductStatus, StockStatus)',
    priority: '🔴 高',
    sprint: 'Sprint-2',
    phase: 'Phase 2: Foundational - Type Definitions',
    tags: ['Frontend'],
    notes: '依赖：SETUP-001 | 文件：hall-reserve-taro/src/types/channelProduct.ts | 参考：data-model.md 第 18-37 行',
    estimatedHours: 2
  },
  {
    id: 'TYPE-002',
    title: '扩展 channelProduct.ts (ChannelProductSpecDTO, SpecType 7种规格, SpecOptionDTO, SelectedSpec)',
    priority: '🔴 高',
    sprint: 'Sprint-2',
    phase: 'Phase 2: Foundational - Type Definitions',
    tags: ['Frontend'],
    notes: '依赖：TYPE-001 | 文件：hall-reserve-taro/src/types/channelProduct.ts | 参考：data-model.md 第 93-138 行',
    estimatedHours: 2
  },
  {
    id: 'TYPE-003',
    title: '修改 hall-reserve-taro/src/types/order.ts (CartItem, ChannelProductOrderDTO, OrderItemDTO 使用 channelProductId)',
    priority: '🔴 高',
    sprint: 'Sprint-2',
    phase: 'Phase 2: Foundational - Type Definitions',
    tags: ['Frontend'],
    notes: '依赖：TYPE-002 | 文件：hall-reserve-taro/src/types/order.ts | 参考：data-model.md 第 196-321 行',
    estimatedHours: 2
  },
  {
    id: 'STYLE-001',
    title: '创建 hall-reserve-taro/src/styles/variables.scss (颜色/字体/间距/圆角/阴影变量)',
    priority: '🔴 高',
    sprint: 'Sprint-2',
    phase: 'Phase 2: Foundational - Styles',
    tags: ['Frontend', 'Design'],
    notes: '依赖：SETUP-001 | 文件：hall-reserve-taro/src/styles/variables.scss | 参考：miniapp-ordering/ 原型配色',
    estimatedHours: 2
  },
  {
    id: 'STYLE-002',
    title: '创建 hall-reserve-taro/src/assets/images/placeholders/ (商品占位图、空状态图标)',
    priority: '🔴 高',
    sprint: 'Sprint-2',
    phase: 'Phase 2: Foundational - Styles',
    tags: ['Frontend', 'Design'],
    notes: '依赖：SETUP-001 | 文件：hall-reserve-taro/src/assets/images/placeholders/*.png',
    estimatedHours: 1
  },
  {
    id: 'UTIL-001',
    title: '创建 hall-reserve-taro/src/utils/priceCalculator.ts (calculateUnitPrice, validateRequiredSpecs, formatPrice + 单元测试)',
    priority: '🔴 高',
    sprint: 'Sprint-2',
    phase: 'Phase 2: Foundational - Utils',
    tags: ['Frontend', 'Test'],
    notes: '依赖：TYPE-001, TYPE-002 | 文件：hall-reserve-taro/src/utils/priceCalculator.ts | 参考：data-model.md 第 586-628 行',
    estimatedHours: 3
  },
  {
    id: 'API-001',
    title: '创建 hall-reserve-taro/src/services/channelProductService.ts (fetchChannelProducts, fetchChannelProductDetail, fetchChannelProductSpecs)',
    priority: '🔴 高',
    sprint: 'Sprint-2',
    phase: 'Phase 2: Foundational - API Services',
    tags: ['Frontend', 'Backend'],
    notes: '依赖：TYPE-001, TYPE-002 | 文件：hall-reserve-taro/src/services/channelProductService.ts | API：GET /api/client/channel-products/mini-program',
    estimatedHours: 4
  },
  {
    id: 'API-002',
    title: '修改 hall-reserve-taro/src/services/orderService.ts (createChannelProductOrder, fetchMyOrders, fetchOrderDetail 使用 channelProductId)',
    priority: '🔴 高',
    sprint: 'Sprint-2',
    phase: 'Phase 2: Foundational - API Services',
    tags: ['Frontend', 'Backend'],
    notes: '依赖：TYPE-003 | 文件：hall-reserve-taro/src/services/orderService.ts | API：POST /api/client/channel-product-orders',
    estimatedHours: 3
  },
  {
    id: 'HOOK-001',
    title: '创建 hall-reserve-taro/src/hooks/useChannelProducts.ts (TanStack Query, staleTime 2分钟)',
    priority: '🔴 高',
    sprint: 'Sprint-2',
    phase: 'Phase 2: Foundational - TanStack Query Hooks',
    tags: ['Frontend'],
    notes: '依赖：API-001 | 文件：hall-reserve-taro/src/hooks/useChannelProducts.ts | queryKey: [channel-products, mini-program]',
    estimatedHours: 2
  },
  {
    id: 'HOOK-002',
    title: '创建 hall-reserve-taro/src/hooks/useChannelProductDetail.ts (商品详情 + 规格列表并行查询)',
    priority: '🔴 高',
    sprint: 'Sprint-2',
    phase: 'Phase 2: Foundational - TanStack Query Hooks',
    tags: ['Frontend'],
    notes: '依赖：API-001 | 文件：hall-reserve-taro/src/hooks/useChannelProductDetail.ts | staleTime: 5分钟',
    estimatedHours: 2
  },
  {
    id: 'HOOK-003',
    title: '创建 hall-reserve-taro/src/hooks/useOrders.ts (useMyOrders + useCreateOrder mutation)',
    priority: '🔴 高',
    sprint: 'Sprint-2',
    phase: 'Phase 2: Foundational - TanStack Query Hooks',
    tags: ['Frontend'],
    notes: '依赖：API-002 | 文件：hall-reserve-taro/src/hooks/useOrders.ts | 自动刷新订单列表',
    estimatedHours: 2
  },
  {
    id: 'STORE-001',
    title: '创建 hall-reserve-taro/src/stores/orderCartStore.ts (Zustand 购物车 Store: addItem, updateQuantity, removeItem, clearCart)',
    priority: '🔴 高',
    sprint: 'Sprint-2',
    phase: 'Phase 2: Foundational - State Management',
    tags: ['Frontend'],
    notes: '依赖：TYPE-001, TYPE-002, TYPE-003, UTIL-001 | 文件：hall-reserve-taro/src/stores/orderCartStore.ts | 参考：data-model.md 第 343-415 行',
    estimatedHours: 4
  }
];

// Phase 3: User Story 1 - 浏览渠道商品菜单 (Sprint 3)
const phase3Tasks: Task[] = [
  {
    id: 'US1-001',
    title: '创建 channel-product-menu/index.tsx (商品列表页：分类标签栏、商品卡片、筛选、空状态)',
    priority: '🔴 高',
    sprint: 'Sprint-3',
    phase: 'Phase 3: User Story 1 - 浏览商品菜单',
    tags: ['Frontend'],
    notes: '依赖：HOOK-001, STYLE-001, STORE-001 | 文件：hall-reserve-taro/src/pages/channel-product-menu/index.tsx | 参考原型：miniapp-ordering/ 菜单列表页',
    estimatedHours: 6
  },
  {
    id: 'US1-002',
    title: '创建 channel-product-menu/index.less (分类标签栏、商品卡片样式，使用 rpx 单位)',
    priority: '🔴 高',
    sprint: 'Sprint-3',
    phase: 'Phase 3: User Story 1 - 浏览商品菜单',
    tags: ['Frontend', 'Design'],
    notes: '依赖：US1-001 | 文件：hall-reserve-taro/src/pages/channel-product-menu/index.less | 引入 @/styles/variables.scss',
    estimatedHours: 3
  },
  {
    id: 'US1-003',
    title: '创建 channel-product-menu/index.config.ts (配置页面标题"点餐菜单")',
    priority: '🔴 高',
    sprint: 'Sprint-3',
    phase: 'Phase 3: User Story 1 - 浏览商品菜单',
    tags: ['Frontend'],
    notes: '依赖：US1-001 | 文件：hall-reserve-taro/src/pages/channel-product-menu/index.config.ts',
    estimatedHours: 0.5
  }
];

// Phase 4: User Story 2 - 查看商品详情并选择规格 (Sprint 4)
const phase4Tasks: Task[] = [
  {
    id: 'US2-001',
    title: '创建 channel-product-detail/index.tsx (商品详情、规格选择器、实时价格计算、加入购物车)',
    priority: '🔴 高',
    sprint: 'Sprint-4',
    phase: 'Phase 4: User Story 2 - 商品详情选规格',
    tags: ['Frontend'],
    notes: '依赖：HOOK-002, UTIL-001, STORE-001 | 文件：hall-reserve-taro/src/pages/channel-product-detail/index.tsx | 参考原型：miniapp-ordering/ 商品详情页',
    estimatedHours: 8
  },
  {
    id: 'US2-002',
    title: '创建 components/SpecSelector/index.tsx (可复用规格选择器组件，支持7种规格类型)',
    priority: '🔴 高',
    sprint: 'Sprint-4',
    phase: 'Phase 4: User Story 2 - 商品详情选规格',
    tags: ['Frontend'],
    notes: '依赖：TYPE-002 | 文件：hall-reserve-taro/src/components/SpecSelector/index.tsx | 支持单选/必选/默认选中',
    estimatedHours: 5
  },
  {
    id: 'US2-003',
    title: '创建 channel-product-detail/index.less (商品详情、规格选择器、底部固定按钮样式)',
    priority: '🔴 高',
    sprint: 'Sprint-4',
    phase: 'Phase 4: User Story 2 - 商品详情选规格',
    tags: ['Frontend', 'Design'],
    notes: '依赖：US2-001 | 文件：hall-reserve-taro/src/pages/channel-product-detail/index.less',
    estimatedHours: 3
  },
  {
    id: 'US2-004',
    title: '创建 channel-product-detail/index.config.ts (配置页面标题"商品详情")',
    priority: '🔴 高',
    sprint: 'Sprint-4',
    phase: 'Phase 4: User Story 2 - 商品详情选规格',
    tags: ['Frontend'],
    notes: '依赖：US2-001 | 文件：hall-reserve-taro/src/pages/channel-product-detail/index.config.ts',
    estimatedHours: 0.5
  }
];

// Phase 5: User Story 3 - 购物车管理与订单提交 (Sprint 5)
const phase5Tasks: Task[] = [
  {
    id: 'US3-001',
    title: '创建 components/CartDrawer/index.tsx (购物车抽屉：商品列表、数量修改、删除、总价、提交订单)',
    priority: '🔴 高',
    sprint: 'Sprint-5',
    phase: 'Phase 5: User Story 3 - 购物车订单提交',
    tags: ['Frontend'],
    notes: '依赖：STORE-001, STYLE-001 | 文件：hall-reserve-taro/src/components/CartDrawer/index.tsx | 参考原型：miniapp-ordering/ 购物车页',
    estimatedHours: 6
  },
  {
    id: 'US3-002',
    title: '创建 components/CartDrawer/index.less (抽屉弹窗、购物车项卡片、底部固定总价栏样式)',
    priority: '🔴 高',
    sprint: 'Sprint-5',
    phase: 'Phase 5: User Story 3 - 购物车订单提交',
    tags: ['Frontend', 'Design'],
    notes: '依赖：US3-001 | 文件：hall-reserve-taro/src/components/CartDrawer/index.less',
    estimatedHours: 3
  },
  {
    id: 'US3-003',
    title: '修改 channel-product-menu/index.tsx (添加购物车入口按钮、数量角标、弹出购物车抽屉)',
    priority: '🔴 高',
    sprint: 'Sprint-5',
    phase: 'Phase 5: User Story 3 - 购物车订单提交',
    tags: ['Frontend'],
    notes: '依赖：US1-001, US3-001 | 文件：hall-reserve-taro/src/pages/channel-product-menu/index.tsx',
    estimatedHours: 2
  },
  {
    id: 'US3-004',
    title: '创建 order-cart/index.tsx (订单提交逻辑、Mock支付、订单确认页、防抖处理)',
    priority: '🔴 高',
    sprint: 'Sprint-5',
    phase: 'Phase 5: User Story 3 - 购物车订单提交',
    tags: ['Frontend'],
    notes: '依赖：US3-001, HOOK-003, API-002 | 文件：hall-reserve-taro/src/pages/order-cart/index.tsx | 支付成功后清空购物车',
    estimatedHours: 6
  },
  {
    id: 'US3-005',
    title: '创建 order-cart/index.less (订单确认页样式)',
    priority: '🔴 高',
    sprint: 'Sprint-5',
    phase: 'Phase 5: User Story 3 - 购物车订单提交',
    tags: ['Frontend', 'Design'],
    notes: '依赖：US3-004 | 文件：hall-reserve-taro/src/pages/order-cart/index.less',
    estimatedHours: 2
  }
];

// Phase 6: User Story 4 - 订单状态查询与取餐 (Sprint 6)
const phase6Tasks: Task[] = [
  {
    id: 'US4-001',
    title: '创建 member/my-orders/index.tsx (订单列表页：订单卡片、状态标签、下拉刷新、分页加载)',
    priority: '🔴 高',
    sprint: 'Sprint-6',
    phase: 'Phase 6: User Story 4 - 订单状态查询',
    tags: ['Frontend'],
    notes: '依赖：HOOK-003, STYLE-001 | 文件：hall-reserve-taro/src/pages/member/my-orders/index.tsx | 参考原型：miniapp-ordering/ 会员-订单列表',
    estimatedHours: 6
  },
  {
    id: 'US4-002',
    title: '创建 member/my-orders/index.less (订单卡片、状态标签、空状态样式)',
    priority: '🔴 高',
    sprint: 'Sprint-6',
    phase: 'Phase 6: User Story 4 - 订单状态查询',
    tags: ['Frontend', 'Design'],
    notes: '依赖：US4-001 | 文件：hall-reserve-taro/src/pages/member/my-orders/index.less',
    estimatedHours: 3
  },
  {
    id: 'US4-003',
    title: '创建 member/my-orders/index.config.ts (配置页面标题"我的订单")',
    priority: '🔴 高',
    sprint: 'Sprint-6',
    phase: 'Phase 6: User Story 4 - 订单状态查询',
    tags: ['Frontend'],
    notes: '依赖：US4-001 | 文件：hall-reserve-taro/src/pages/member/my-orders/index.config.ts',
    estimatedHours: 0.5
  },
  {
    id: 'US4-004',
    title: '创建 member/order-detail/index.tsx (订单详情页、"再来一单"、订单状态轮询5-10秒、取餐通知)',
    priority: '🔴 高',
    sprint: 'Sprint-6',
    phase: 'Phase 6: User Story 4 - 订单状态查询',
    tags: ['Frontend'],
    notes: '依赖：HOOK-003, STORE-001 | 文件：hall-reserve-taro/src/pages/member/order-detail/index.tsx',
    estimatedHours: 6
  },
  {
    id: 'US4-005',
    title: '创建 member/order-detail/index.less (订单详情、商品列表、"再来一单"按钮样式)',
    priority: '🔴 高',
    sprint: 'Sprint-6',
    phase: 'Phase 6: User Story 4 - 订单状态查询',
    tags: ['Frontend', 'Design'],
    notes: '依赖：US4-004 | 文件：hall-reserve-taro/src/pages/member/order-detail/index.less',
    estimatedHours: 2
  }
];

// Phase 7: Polish & Cross-Cutting Concerns (Sprint 7)
const phase7Tasks: Task[] = [
  {
    id: 'POLISH-001',
    title: '修改 hall-reserve-taro/config/index.ts (添加新页面路由配置、页面权限)',
    priority: '🔴 高',
    sprint: 'Sprint-7',
    phase: 'Phase 7: Polish & Cross-Cutting',
    tags: ['Frontend'],
    notes: '依赖：US1-001, US4-001 | 文件：hall-reserve-taro/config/index.ts',
    estimatedHours: 2
  },
  {
    id: 'POLISH-002',
    title: '修改 hall-reserve-taro/project.config.json (配置微信小程序 tabBar、页面路径)',
    priority: '🔴 高',
    sprint: 'Sprint-7',
    phase: 'Phase 7: Polish & Cross-Cutting',
    tags: ['Frontend'],
    notes: '依赖：US1-001, US4-001 | 文件：hall-reserve-taro/project.config.json',
    estimatedHours: 1
  },
  {
    id: 'POLISH-003',
    title: '实现全局错误处理 (SKU禁用、网络离线、API超时重试、购物车空状态、支付中断)',
    priority: '🔴 高',
    sprint: 'Sprint-7',
    phase: 'Phase 7: Polish & Cross-Cutting',
    tags: ['Frontend'],
    notes: '依赖：所有 US 任务 | 文件：多个组件和服务',
    estimatedHours: 4
  },
  {
    id: 'POLISH-004',
    title: '实现性能优化 (商品列表虚拟滚动/懒加载、图片懒加载、TanStack Query缓存优化、防抖节流)',
    priority: '🔴 高',
    sprint: 'Sprint-7',
    phase: 'Phase 7: Polish & Cross-Cutting',
    tags: ['Frontend'],
    notes: '依赖：所有 US 任务 | 目标：首屏≤2s, 详情页≤1s',
    estimatedHours: 6
  },
  {
    id: 'TEST-001',
    title: '编写单元测试 (priceCalculator.ts、orderCartStore.ts、validateRequiredSpecs)',
    priority: '🔴 高',
    sprint: 'Sprint-7',
    phase: 'Phase 7: Polish & Cross-Cutting',
    tags: ['Test'],
    notes: '依赖：UTIL-001, STORE-001 | 覆盖率目标：100% (关键业务逻辑)',
    estimatedHours: 6
  },
  {
    id: 'TEST-002',
    title: 'E2E测试 (完整订单流程、分类筛选、订单状态更新)',
    priority: '🟡 中',
    sprint: 'Sprint-7',
    phase: 'Phase 7: Polish & Cross-Cutting',
    tags: ['Test'],
    notes: '依赖：所有 US 任务 | 可选任务',
    estimatedHours: 8
  },
  {
    id: 'DOC-001',
    title: '更新文档 (README.md添加O006功能说明、API文档、组件使用文档)',
    priority: '🔴 高',
    sprint: 'Sprint-7',
    phase: 'Phase 7: Polish & Cross-Cutting',
    tags: ['Docs'],
    notes: '依赖：所有 US 任务 | 文件：README.md, docs/',
    estimatedHours: 3
  }
];

// 合并所有任务
const allTasks: Task[] = [
  ...phase1Tasks,
  ...phase2Tasks,
  ...phase3Tasks,
  ...phase4Tasks,
  ...phase5Tasks,
  ...phase6Tasks,
  ...phase7Tasks
];

// 执行批量导入
async function importTasks() {
  console.log(`\n🚀 开始批量导入 O006 任务到飞书项目管理系统...\n`);
  console.log(`📊 总任务数: ${allTasks.length}\n`);

  let successCount = 0;
  let failCount = 0;

  for (const task of allTasks) {
    try {
      const cmd = [
        'npx tsx src/index.ts task create',
        `--title "[${task.sprint}] [${task.id}] ${task.title}"`,
        `--priority "${task.priority}"`,
        `--spec-id "O006"`,
        `--status "📝 待办"`,
        `--tags ${task.tags.map(t => `"${t}"`).join(' ')}`,
        `--notes "${task.phase} | ${task.notes}"`,
        task.estimatedHours ? `--estimated-hours ${task.estimatedHours}` : '',
        `--progress 0`
      ].filter(Boolean).join(' ');

      console.log(`✅ 创建任务: [${task.id}] ${task.sprint} - ${task.title.substring(0, 50)}...`);

      execSync(cmd, {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit'
      });

      successCount++;
    } catch (error) {
      console.error(`❌ 创建任务失败: [${task.id}]`, error);
      failCount++;
    }
  }

  console.log(`\n✨ 批量导入完成！`);
  console.log(`   成功: ${successCount} 个任务`);
  console.log(`   失败: ${failCount} 个任务`);
  console.log(`\n📋 查看所有任务:\n   npx tsx src/index.ts task list`);
  console.log(`\n🔍 按 Sprint 筛选:\n   npx tsx src/index.ts task list --tags "Sprint-1"`);
}

// 按 Sprint 统计任务
function printSprintSummary() {
  console.log(`\n📦 Sprint 统计:\n`);

  const sprints = ['Sprint-1', 'Sprint-2', 'Sprint-3', 'Sprint-4', 'Sprint-5', 'Sprint-6', 'Sprint-7'];

  sprints.forEach(sprint => {
    const tasks = allTasks.filter(t => t.sprint === sprint);
    const totalHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const phase = tasks[0]?.phase.split(' - ')[0] || '';

    console.log(`   ${sprint} (${phase}): ${tasks.length} 个任务, 预计 ${totalHours} 小时`);
  });

  console.log(`\n   总计: ${allTasks.length} 个任务, 预计 ${allTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)} 小时\n`);
}

// 主函数
async function main() {
  printSprintSummary();

  console.log(`❓ 确认导入所有任务到飞书项目管理系统？ (按 Ctrl+C 取消)\n`);

  // 等待3秒给用户时间取消
  await new Promise(resolve => setTimeout(resolve, 3000));

  await importTasks();
}

main().catch(console.error);
