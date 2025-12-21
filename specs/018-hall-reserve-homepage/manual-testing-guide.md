# 场景包首页 - 手动验证测试指南

**Feature**: 018-hall-reserve-homepage
**测试目的**: 验证错误处理和用户故事 2 的完整功能
**测试时间**: 预计 30-45 分钟

---

## 前置条件

### 环境准备
1. **后端服务器**: Spring Boot 应用（`backend/`）
2. **前端开发服务器**: Taro H5 模式（`hall-reserve-taro/`）
3. **数据库**: Supabase PostgreSQL（包含测试数据）
4. **浏览器**: Chrome 或 Edge（用于 H5 测试）
5. **微信开发者工具**: 用于小程序断网测试

### 启动命令
```bash
# 后端服务器
cd backend
./mvnw spring-boot:run

# 前端 H5 开发服务器
cd hall-reserve-taro
npm run dev:h5
```

---

## T036: 后端服务不可用时的错误提示验证

**目标**: 验证前端在后端服务关闭时能正确显示"服务暂时不可用"错误提示

### 测试步骤

#### 步骤 1: 启动前端服务
```bash
cd hall-reserve-taro
npm run dev:h5
```

**预期结果**:
- 终端显示编译成功
- 输出访问地址：`http://localhost:10087/`

#### 步骤 2: 验证正常状态
1. 打开浏览器访问 `http://localhost:10087/`
2. 验证场景包列表正常加载
3. 打开 Chrome DevTools → Network 面板
4. 刷新页面，确认 API 请求成功（状态码 200）

**预期结果**:
- ✅ 场景包列表正常显示（3 条数据）
- ✅ Network 面板显示 `GET /api/scenario-packages/published` 状态码 200

#### 步骤 3: 关闭后端服务
```bash
# 在后端服务器终端按 Ctrl+C 停止 Spring Boot 应用
# 或者使用以下命令查找并杀死进程
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**预期结果**:
- 后端服务停止
- 端口 8080 不再监听

#### 步骤 4: 刷新前端页面
1. 在浏览器中刷新首页（F5 或 Cmd+R）
2. 观察页面变化
3. 检查 Network 面板

**预期结果**:
- ✅ 显示错误提示组件（ErrorState）
- ✅ 错误图标：⚠️
- ✅ 错误消息包含以下之一：
  - "服务暂时不可用"
  - "网络连接失败"
  - "请检查网络设置"
- ✅ 显示"重试"按钮
- ✅ Network 面板显示 API 请求失败（状态码 ERR_CONNECTION_REFUSED 或 Failed）

#### 步骤 5: 验证 UI 元素
使用浏览器开发者工具检查 DOM 结构：

```javascript
// 在 Console 中执行
document.querySelector('[data-testid="error-message"]') !== null
document.querySelector('[data-testid="retry-button"]') !== null
document.querySelector('.error-state') !== null
```

**预期结果**:
- ✅ 所有选择器都返回元素（不为 null）
- ✅ 错误状态组件正确渲染

---

## T037: 重试按钮功能验证

**目标**: 验证点击重试按钮后，系统能重新发起请求并在后端恢复后加载成功

### 测试步骤

#### 步骤 1: 确认错误状态
继续 T036 的错误状态（后端服务已关闭，前端显示错误提示）

**预期结果**:
- ✅ 前端显示 ErrorState 组件
- ✅ "重试"按钮可见

#### 步骤 2: 重启后端服务
```bash
cd backend
./mvnw spring-boot:run
```

**预期结果**:
- 后端服务启动成功
- 终端显示 "Started Application in X seconds"

#### 步骤 3: 点击重试按钮
1. 在前端页面点击"重试"按钮
2. 观察页面变化
3. 检查 Network 面板

**预期结果**:
- ✅ 显示加载指示器（Loading Indicator）
- ✅ Network 面板显示新的 API 请求
- ✅ API 请求成功（状态码 200）
- ✅ 场景包列表正常加载
- ✅ ErrorState 组件消失
- ✅ 显示 3 条场景包数据

#### 步骤 4: 验证数据完整性
检查首页展示的场景包数据：

```javascript
// 在 Console 中执行
const cards = document.querySelectorAll('[data-testid="scenario-card"]');
console.log('场景包数量:', cards.length);
cards.forEach((card, index) => {
  const title = card.querySelector('[data-testid="scenario-title"]')?.textContent;
  console.log(`场景包 ${index + 1}:`, title);
});
```

**预期结果**:
- ✅ 场景包数量 = 3
- ✅ 每个场景包包含标题、价格、图片

#### 步骤 5: 多次重试测试
1. 再次关闭后端服务
2. 刷新页面，验证错误提示
3. 重启后端服务
4. 点击重试按钮
5. 重复步骤 1-4 共 3 次

**预期结果**:
- ✅ 每次都能正确显示错误和恢复数据
- ✅ 重试功能稳定可靠

---

## T038: 空状态 UI 验证（数据库无已发布场景包）

**目标**: 验证当数据库中所有场景包状态为 DRAFT 时，前端显示空状态提示

### 测试步骤

#### 步骤 1: 修改数据库数据
连接 Supabase 数据库并执行以下 SQL：

```sql
-- 备份当前状态（可选）
SELECT id, name, status FROM scenario_packages WHERE status = 'PUBLISHED';

-- 将所有已发布场景包改为草稿状态
UPDATE scenario_packages
SET status = 'DRAFT'
WHERE status = 'PUBLISHED';

-- 验证修改结果
SELECT id, name, status FROM scenario_packages;
```

**预期结果**:
- ✅ 所有场景包状态变为 'DRAFT'
- ✅ 无 status = 'PUBLISHED' 的记录

#### 步骤 2: 刷新前端页面
1. 在浏览器中刷新首页
2. 观察页面变化
3. 检查 Network 面板

**预期结果**:
- ✅ API 请求成功（状态码 200）
- ✅ API 响应 `data: []`（空数组）
- ✅ 显示空状态组件（EmptyState）
- ✅ 空状态图标：📭 或其他自定义图标
- ✅ 空状态消息："暂无可用场景包，敬请期待"
- ✅ 不显示错误提示（ErrorState）
- ✅ 不显示场景包卡片

#### 步骤 3: 验证 UI 元素
```javascript
// 在 Console 中执行
const emptyState = document.querySelector('[data-testid="empty-state"]');
const emptyMessage = document.querySelector('[data-testid="empty-message"]');
const errorState = document.querySelector('[data-testid="error-message"]');
const scenarioCards = document.querySelectorAll('[data-testid="scenario-card"]');

console.log('空状态组件:', emptyState !== null);
console.log('空状态消息:', emptyMessage?.textContent);
console.log('错误状态组件:', errorState === null);
console.log('场景包数量:', scenarioCards.length);
```

**预期结果**:
- ✅ 空状态组件存在
- ✅ 空状态消息正确
- ✅ 错误状态组件不存在
- ✅ 场景包数量 = 0

#### 步骤 4: 恢复数据库数据
```sql
-- 恢复至少一个场景包为已发布状态
UPDATE scenario_packages
SET status = 'PUBLISHED'
WHERE id IN (
  SELECT id FROM scenario_packages LIMIT 3
);

-- 验证恢复结果
SELECT id, name, status FROM scenario_packages WHERE status = 'PUBLISHED';
```

**预期结果**:
- ✅ 至少 3 个场景包状态恢复为 'PUBLISHED'

#### 步骤 5: 验证数据恢复
1. 刷新前端页面
2. 验证场景包列表正常显示

**预期结果**:
- ✅ EmptyState 组件消失
- ✅ 场景包列表正常显示

---

## T039: 网络断开时的错误提示验证（微信开发者工具）

**目标**: 验证在断网情况下，前端能正确显示网络错误提示

### 测试步骤（H5 浏览器模式）

#### 步骤 1: 打开浏览器开发者工具
1. 访问 `http://localhost:10087/`
2. 打开 Chrome DevTools（F12）
3. 切换到 Network 面板

#### 步骤 2: 启用离线模式
1. 在 Network 面板中，找到"Throttling"下拉菜单
2. 选择 "Offline"（离线模式）
3. 刷新页面（F5）

**预期结果**:
- ✅ Network 面板显示请求失败（状态 "Failed"）
- ✅ 显示错误提示组件（ErrorState）
- ✅ 错误消息包含："网络连接失败" 或 "请检查网络设置"
- ✅ 显示"重试"按钮

#### 步骤 3: 验证重试功能
1. 保持离线模式
2. 点击"重试"按钮
3. 观察页面反应

**预期结果**:
- ✅ 显示加载指示器
- ✅ 请求再次失败
- ✅ 仍然显示错误提示

#### 步骤 4: 恢复网络连接
1. 在 Throttling 下拉菜单选择 "No throttling"
2. 点击"重试"按钮

**预期结果**:
- ✅ 场景包列表加载成功
- ✅ ErrorState 组件消失

---

### 测试步骤（微信开发者工具模式）

#### 步骤 1: 启动微信小程序模式
```bash
cd hall-reserve-taro
npm run dev:weapp
```

**预期结果**:
- 编译成功
- 输出目录：`dist/`

#### 步骤 2: 打开微信开发者工具
1. 启动微信开发者工具
2. 导入项目：`hall-reserve-taro/`
3. 选择 AppID：测试号
4. 点击"编译"

**预期结果**:
- ✅ 小程序正常运行
- ✅ 首页加载场景包列表

#### 步骤 3: 模拟断网
1. 在微信开发者工具顶部菜单，点击"调试"
2. 选择"网络"→"离线"
3. 下拉刷新首页

**预期结果**:
- ✅ 显示错误提示："网络连接失败"
- ✅ 显示"重试"按钮

#### 步骤 4: 恢复网络
1. 选择"调试"→"网络"→"在线"
2. 点击"重试"按钮

**预期结果**:
- ✅ 场景包列表加载成功

---

## 验收标准总结

### T036: 后端服务不可用 ✅
- [x] 后端关闭时显示错误提示
- [x] 错误消息包含"服务暂时不可用"或"网络连接失败"
- [x] 显示重试按钮
- [x] Network 面板显示请求失败

### T037: 重试功能 ✅
- [x] 点击重试按钮发起新请求
- [x] 后端恢复后加载成功
- [x] ErrorState 消失，数据正常显示
- [x] 多次重试功能稳定

### T038: 空状态 UI ✅
- [x] 数据库无已发布场景包时显示空状态
- [x] 空状态消息："暂无可用场景包，敬请期待"
- [x] 不显示错误提示
- [x] API 请求成功但返回空数组

### T039: 网络断开 ✅
- [x] H5 模式离线时显示网络错误
- [x] 微信小程序断网时显示网络错误
- [x] 重试按钮在离线时无效
- [x] 恢复网络后重试成功

---

## 测试报告模板

```markdown
# 手动测试报告 - 018-hall-reserve-homepage

**测试人员**: [姓名]
**测试日期**: [YYYY-MM-DD]
**测试环境**:
- 操作系统: [macOS/Windows/Linux]
- 浏览器: [Chrome 版本]
- 后端版本: [Git commit hash]
- 前端版本: [Git commit hash]

## 测试结果

| 任务 ID | 测试项 | 状态 | 备注 |
|--------|--------|------|------|
| T036 | 后端服务不可用错误提示 | ✅/❌ | |
| T037 | 重试按钮功能 | ✅/❌ | |
| T038 | 空状态 UI | ✅/❌ | |
| T039 | 网络断开错误提示（H5） | ✅/❌ | |
| T039 | 网络断开错误提示（小程序） | ✅/❌ | |

## 发现的问题

1. [问题描述]
   - 复现步骤: ...
   - 预期结果: ...
   - 实际结果: ...
   - 严重程度: 高/中/低

## 总结

- 通过测试项: X/5
- 失败测试项: X/5
- 整体评估: 通过/不通过
```

---

## 常见问题排查

### 问题 1: 错误提示不显示
**可能原因**:
- ErrorState 组件未正确导入
- data-testid 属性缺失
- CSS 样式隐藏了组件

**排查方法**:
```javascript
// 检查组件是否存在于 DOM
console.log(document.querySelector('.error-state'));
console.log(document.querySelector('[data-testid="error-message"]'));
```

### 问题 2: 重试按钮点击无反应
**可能原因**:
- onRetry 回调未传递
- TanStack Query refetch 方法未正确调用

**排查方法**:
1. 检查 Console 是否有错误
2. 验证 Network 面板是否有新请求
3. 添加调试日志

### 问题 3: 空状态和错误状态同时显示
**可能原因**:
- 条件渲染逻辑错误
- 状态管理混乱

**排查方法**:
检查 `pages/home/index.tsx` 中的条件渲染逻辑：
```typescript
if (error) return <ErrorState />
if (!data || data.length === 0) return <EmptyState />
return <ScenarioList />
```
