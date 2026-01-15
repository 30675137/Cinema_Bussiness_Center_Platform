# Quickstart: 预约单管理系统

**Feature**: U001-reservation-order-management
**Date**: 2025-12-24

## Prerequisites

- Node.js 18+
- pnpm 8+
- Java 21+
- Maven 3.8+
- 微信开发者工具（用于小程序调试）

## Quick Setup

### 1. 后端服务

```bash
cd backend

# 安装依赖并编译
mvn clean compile

# 运行数据库迁移
mvn flyway:migrate

# 启动后端服务
mvn spring-boot:run
```

后端服务默认运行在 `http://localhost:8080`

### 2. 前端管理后台 (B端)

```bash
cd frontend

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

B端管理后台默认运行在 `http://localhost:5173`

### 3. Taro 小程序 (C端)

```bash
cd hall-reserve-taro

# 安装依赖
pnpm install

# 启动微信小程序开发
pnpm dev:weapp

# 或启动 H5 开发
pnpm dev:h5
```

H5 版本默认运行在 `http://localhost:10086`

---

## Implementation Steps

### Step 1: Profile 页面升级 (User Story 7)

**文件位置**: `hall-reserve-taro/src/pages/profile/`

1. 升级 Profile 页面为完整个人中心：
   - 添加用户头像区域（支持未登录状态）
   - 添加功能菜单列表
   - "我的预约"作为第一个菜单项

2. 创建菜单项组件：
   ```bash
   mkdir -p hall-reserve-taro/src/pages/profile/components
   ```

3. 实现待处理订单角标显示

### Step 2: 预约表单页面

**文件位置**: `hall-reserve-taro/src/pages/reservation-form/`

1. 创建预约表单页面：
   ```bash
   mkdir -p hall-reserve-taro/src/pages/reservation-form
   ```

2. 添加以下文件：
   - `index.tsx` - 页面组件
   - `index.scss` - 样式
   - `index.config.ts` - 页面配置

3. 集成时段选择器、套餐选择器、加购项选择器、联系人表单

### Step 3: 我的预约列表页

**文件位置**: `hall-reserve-taro/src/pages/my-reservations/`

1. 创建列表页和详情页：
   ```bash
   mkdir -p hall-reserve-taro/src/pages/my-reservations/detail
   ```

2. 实现功能：
   - 预约单列表展示
   - 状态筛选 Tab
   - 下拉刷新
   - 点击跳转详情

### Step 4: 更新 app.config.ts

在 `hall-reserve-taro/src/app.config.ts` 中添加新页面：

```typescript
export default defineAppConfig({
  pages: [
    // Tab 页面
    'pages/home/index',
    'pages/mall/index',
    'pages/member/index',
    'pages/profile/index',
    // 预约相关页面
    'pages/reservation-form/index',
    'pages/my-reservations/index',
    'pages/my-reservations/detail/index',
    // 其他页面...
  ],
  // ...
})
```

### Step 5: B端预约管理

**文件位置**: `frontend/src/pages/reservation-orders/`

1. 创建预约单管理页面：
   ```bash
   mkdir -p frontend/src/pages/reservation-orders
   ```

2. 实现功能：
   - 预约单列表页（筛选、分页）
   - 预约单详情页
   - 确认预约对话框（支付可选）
   - 取消预约对话框

### Step 6: 后端 API

**文件位置**: `backend/src/main/java/com/cinema/reservation/`

1. 创建预约单模块包结构：
   ```
   backend/src/main/java/com/cinema/reservation/
   ├── controller/
   ├── domain/
   ├── dto/
   ├── exception/
   ├── repository/
   └── service/
   ```

2. 数据库迁移：
   ```bash
   # 创建迁移文件
   touch backend/src/main/resources/db/migration/VU001_001__create_reservation_tables.sql
   ```

---

## Verification

### Profile 页面验证

1. 启动 Taro 小程序或 H5
2. 点击底部"我的"Tab
3. 验证：
   - [ ] 显示用户头像区域
   - [ ] 显示"我的预约"菜单项
   - [ ] 点击"我的预约"跳转到列表页
   - [ ] 待处理订单显示角标

### 预约流程验证

1. 在场景包详情页点击"立即预约"
2. 填写预约信息（日期、时段、套餐、联系人）
3. 提交预约
4. 验证：
   - [ ] 跳转到预约成功页面
   - [ ] 显示预约单号
   - [ ] "我的预约"中显示新创建的预约单

### B端管理验证

1. 登录后台管理平台
2. 进入"预约管理"菜单
3. 验证：
   - [ ] 列表显示预约单
   - [ ] 筛选功能正常
   - [ ] 确认预约功能正常（两种模式）
   - [ ] 取消预约功能正常

---

## Common Issues

### 1. Profile 页面不显示菜单

- 检查 `profile/index.tsx` 是否正确导入组件
- 检查样式文件是否正确引用

### 2. 待处理订单角标不更新

- 检查 API 调用是否成功
- 检查登录状态是否有效

### 3. 预约单创建失败

- 检查库存是否充足
- 检查联系人手机号格式
- 查看后端日志获取详细错误信息

### 4. 页面跳转失败

- 确保页面路径已在 `app.config.ts` 中注册
- 使用 `Taro.navigateTo()` 进行非 Tab 页面跳转
- 使用 `Taro.switchTab()` 进行 Tab 页面跳转

---

## API Endpoints

### C端 API

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/client/reservations` | 创建预约单 |
| GET | `/api/client/reservations/my` | 获取我的预约单列表 |
| GET | `/api/client/reservations/{id}` | 获取预约单详情 |
| GET | `/api/client/reservations/pending-count` | 获取待处理订单数量 |

### B端 API

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/admin/reservations` | 预约单列表（筛选、分页） |
| GET | `/api/admin/reservations/{id}` | 预约单详情 |
| POST | `/api/admin/reservations/{id}/confirm` | 确认预约单 |
| POST | `/api/admin/reservations/{id}/cancel` | 取消预约单 |
| PUT | `/api/admin/reservations/{id}` | 修改预约单 |

---

**Quickstart Complete**: 2025-12-24
