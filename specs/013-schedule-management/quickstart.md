# 快速开始指南：排期管理甘特图视图

**分支**: `013-schedule-management` | **日期**: 2025-01-27 | **版本**: 1.0

## 概述

本文档提供排期管理甘特图视图功能的快速入门指南，包括环境设置、开发流程、测试方法和部署指南。基于 React 19.2.0 + TypeScript 5.9.3 + Ant Design 6.1.0 技术栈，支持 Mock 数据和 LocalStorage 持久化。

## 技术栈概览

### 核心技术

```typescript
{
  "frontend": {
    "framework": "React 19.2.0",
    "language": "TypeScript 5.9.3",
    "ui": "Ant Design 6.1.0",
    "routing": "React Router 7.10.1",
    "stateManagement": {
      "client": "Zustand 5.0.9",
      "server": "TanStack Query 5.90.12"
    },
    "form": {
      "library": "React Hook Form 7.68.0",
      "validation": "Zod 4.1.13"
    },
    "date": "dayjs 1.11.19",
    "testing": {
      "unit": "Vitest",
      "e2e": "Playwright",
      "library": "Testing Library"
    },
    "mocking": "MSW 2.12.4"
  },
  "dataStorage": {
    "mockData": "静态JSON文件 + MSW handlers",
    "userPreferences": "浏览器LocalStorage"
  }
}
```

### 前置要求

```bash
# Node.js版本要求
node --version  # >= 18.0.0
npm --version   # >= 9.0.0

# 或使用yarn
yarn --version # >= 1.22.0
```

## 项目结构

```text
frontend/src/
├── pages/
│   └── schedule/
│       ├── index.tsx                    # 主页面入口
│       ├── components/
│       │   ├── atoms/                   # 原子组件
│       │   │   ├── EventBlock.tsx      # 事件块组件
│       │   │   ├── TimeSlot.tsx        # 时间槽标记
│       │   │   ├── HallCard.tsx        # 影厅信息卡片
│       │   │   └── EventTypeTag.tsx    # 事件类型标签
│       │   ├── molecules/               # 分子组件
│       │   │   ├── GanttRow.tsx        # 甘特图行
│       │   │   ├── TimelineHeader.tsx  # 时间轴表头
│       │   │   ├── EventForm.tsx        # 事件表单
│       │   │   └── DateNavigator.tsx   # 日期导航
│       │   └── organisms/              # 有机体组件
│       │       ├── GanttChart.tsx      # 甘特图主组件
│       │       └── ScheduleManagement.tsx # 顶层容器
│       ├── hooks/
│       │   ├── useScheduleQueries.ts   # 查询Hooks
│       │   ├── useScheduleMutations.ts # 变更Hooks
│       │   └── useGanttViewport.ts     # 视口管理Hook
│       ├── services/
│       │   └── scheduleService.ts      # API服务类
│       └── types/
│           └── schedule.types.ts       # TypeScript类型
├── features/
│   └── schedule-management/
│       ├── stores/
│       │   └── scheduleStore.ts        # Zustand状态管理
│       └── utils/
│           ├── timeCalculations.ts    # 时间计算工具
│           └── conflictDetection.ts   # 冲突检测工具
└── mocks/
    ├── data/
    │   └── scheduleMockData.ts         # Mock数据
    └── handlers/
        └── scheduleHandlers.ts        # MSW处理器
```

## 环境设置

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 初始化 Mock Service Worker

```bash
npm run mock:init
```

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

## 开发流程

### 1. 访问排期管理页面

在浏览器中访问：`http://localhost:3000/schedule/gantt`

### 2. 查看甘特图视图

- 左侧显示影厅资源列表
- 右侧显示时间轴（默认 10:00-24:00）
- 事件块根据类型和状态显示不同颜色

### 3. 日期切换

- 点击"前一天"或"后一天"按钮切换日期
- 点击"回到今天"快速跳转到今天
- 日期显示包含星期信息

### 4. 创建排期事件

1. 点击"新增预约"按钮
2. 填写表单信息：
   - 选择影厅
   - 选择开始时间和持续时间
   - 选择事件类型（公映/包场/维护/保洁）
   - 填写标题和相关信息
3. 提交表单
4. 新事件将显示在甘特图中

### 5. 编辑排期事件

1. 点击甘特图中的事件块
2. 在详情弹窗中点击"编辑"
3. 修改信息后保存
4. 事件块将更新显示

### 6. 锁座/维护时段

1. 点击"锁座/维护"按钮
2. 选择影厅和时间段
3. 选择类型（锁座或维护）
4. 填写说明
5. 提交后显示为特殊样式（斜纹背景）

## 测试

### 单元测试

```bash
# 运行单元测试
npm run test:unit

# 带覆盖率
npm run test:coverage

# UI模式
npm run test:unit:ui
```

**测试文件位置**:
- `frontend/src/pages/schedule/__tests__/` - 页面测试
- `frontend/src/features/schedule-management/stores/__tests__/` - Store测试
- `frontend/src/features/schedule-management/utils/__tests__/` - 工具函数测试

### 集成测试

```bash
# 运行E2E测试
npm run test:e2e

# UI模式
npm run test:e2e:ui

# 调试模式
npm run test:debug
```

**测试场景**:
- 甘特图视图加载
- 日期切换功能
- 创建/编辑/删除排期事件
- 冲突检测
- 锁座/维护时段管理

## 数据模型

### 核心实体

- **Hall (影厅资源)**: 包含 id, name, capacity, type, tags, status
- **ScheduleEvent (排期事件)**: 包含 id, hallId, date, startHour, duration, title, type, status, customer, serviceManager, occupancy, details
- **TimelineConfig (时间轴配置)**: 包含 startHour, endHour, interval, timeFormat

详细数据模型定义见 [data-model.md](./data-model.md)

## API 接口

### 主要端点

- `GET /api/schedules?date=YYYY-MM-DD` - 获取排期事件列表
- `GET /api/schedules/:id` - 获取排期事件详情
- `POST /api/schedules` - 创建排期事件
- `PUT /api/schedules/:id` - 更新排期事件
- `DELETE /api/schedules/:id` - 删除排期事件
- `POST /api/schedules/:id/conflict-check` - 检查时间冲突
- `GET /api/halls` - 获取影厅列表
- `GET /api/halls/:id` - 获取影厅详情

详细 API 契约见 [contracts/api.yaml](./contracts/api.yaml)

## 状态管理

### Zustand Store

```typescript
import { useScheduleStore } from '@/features/schedule-management/stores/scheduleStore';

const { 
  selectedDate, 
  setSelectedDate,
  selectedEvent,
  setSelectedEvent,
  filters,
  setFilters 
} = useScheduleStore();
```

### TanStack Query

```typescript
import { useScheduleQueries } from '@/pages/schedule/hooks/useScheduleQueries';

const { data: events, isLoading } = useScheduleQueries.useScheduleList(selectedDate);
const { mutate: createEvent } = useScheduleMutations.useCreateEvent();
```

## 性能优化

### 1. 事件块渲染优化

- 使用 `React.memo` 防止不必要的重渲染
- 使用 `useMemo` 缓存时间计算（left, width）
- 使用 `useCallback` 缓存事件处理器

### 2. 滚动性能

- CSS `will-change: transform` 优化滚动
- 左侧影厅卡片使用 `position: sticky`
- 视口滚动位置持久化到 LocalStorage

### 3. 数据加载

- TanStack Query 自动缓存和后台刷新
- 乐观更新提升感知性能
- 分页加载（如果未来需要）

## 常见问题

### Q: 事件块不显示？

**A**: 检查：
1. 事件数据是否正确加载
2. 时间计算是否正确（startHour, duration）
3. CSS 定位是否正确（parent 需要 `position: relative`）

### Q: 日期切换后数据不更新？

**A**: 检查：
1. TanStack Query 的 queryKey 是否包含日期
2. 缓存是否正确失效
3. MSW handler 是否正确处理日期参数

### Q: 冲突检测不工作？

**A**: 检查：
1. 客户端冲突检测逻辑是否正确
2. 服务器端验证是否正确实现
3. 错误消息是否正确显示

## 下一步

1. 阅读 [spec.md](./spec.md) 了解完整功能需求
2. 阅读 [plan.md](./plan.md) 了解实施计划
3. 阅读 [data-model.md](./data-model.md) 了解数据模型
4. 阅读 [research.md](./research.md) 了解技术决策

## 相关文档

- [功能规格](./spec.md)
- [实施计划](./plan.md)
- [数据模型](./data-model.md)
- [技术研究](./research.md)
- [API 契约](./contracts/api.yaml)

