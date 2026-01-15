# 📘 Scrum 多维表格使用说明

**@spec T004-lark-project-management**

**版本**: 1.0.0
**最后更新**: 2025-12-31
**适用对象**: Cinema Business Center Platform 全体成员

---

## 📌 快速导航

- [核心概念映射](#核心概念映射)
- [字段对应关系](#字段对应关系)
- [实战示例](#实战示例)
- [常见操作指南](#常见操作指南)
- [FAQ](#faq)

---

## 🗺️ 核心概念映射

### Spec 文件 ↔️ 飞书表格映射关系

```
Spec-Driven 开发流程              Scrum 敏捷流程              飞书多维表格
─────────────────────            ─────────────────           ──────────────
specs/<specId>/
  ├── spec.md          ────────→ User Story        ────────→ 产品待办列表 表
  ├── plan.md          ────────→ Sprint Backlog    ────────→ 迭代 (Sprint) 表
  └── tasks.md         ────────→ Task 列表         ────────→ 任务 (Task) 表
```

### 一句话总结

- **spec.md** → **产品待办列表** 表中的一条 User Story 记录
- **plan.md** → **迭代 (Sprint)** 表 + **任务 (Task)** 表的技术设计
- **tasks.md** → **任务 (Task)** 表中的多条任务记录

---

## 📋 字段对应关系

### 1️⃣ spec.md → 产品待办列表 表

<table>
  <thead>
    <tr>
      <th>spec.md 内容</th>
      <th>飞书表格字段</th>
      <th>示例值</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>spec 标题<br/><code>I003-inventory-query</code></td>
      <td><strong>spec_id</strong></td>
      <td><code>I003-inventory-query</code></td>
      <td>完整规格标识符，核心关联字段</td>
    </tr>
    <tr>
      <td>功能名称</td>
      <td><strong>标题</strong></td>
      <td><code>[I003] 库存查询功能</code></td>
      <td>User Story 标题</td>
    </tr>
    <tr>
      <td>-</td>
      <td><strong>类型</strong></td>
      <td><code>User Story</code></td>
      <td>Epic / User Story / Spike</td>
    </tr>
    <tr>
      <td>业务评估</td>
      <td><strong>优先级</strong></td>
      <td><code>🟡 P2</code></td>
      <td>🔴 P0 / 🟠 P1 / 🟡 P2 / 🟢 P3</td>
    </tr>
    <tr>
      <td>-</td>
      <td><strong>状态</strong></td>
      <td><code>📝 待规划</code></td>
      <td>待规划 → 已规划 → 开发中 → 已完成</td>
    </tr>
    <tr>
      <td>团队估算</td>
      <td><strong>故事点</strong></td>
      <td><code>5</code></td>
      <td>1, 2, 3, 5, 8, 13, 21 (斐波那契)</td>
    </tr>
    <tr>
      <td>-</td>
      <td><strong>负责人</strong></td>
      <td>Product Owner</td>
      <td>单人</td>
    </tr>
    <tr>
      <td>-</td>
      <td><strong>Sprint</strong></td>
      <td>Sprint 2 (关联)</td>
      <td>关联到"迭代 (Sprint)"表</td>
    </tr>
    <tr>
      <td><strong>## 验收标准</strong><br/>1. xxx<br/>2. yyy</td>
      <td><strong>验收标准</strong></td>
      <td>多行文本</td>
      <td>从 spec.md 直接复制</td>
    </tr>
    <tr>
      <td><strong>## 功能概述</strong><br/><strong>## 用户故事</strong></td>
      <td><strong>描述</strong></td>
      <td>完整 User Story 描述</td>
      <td>包含用户故事和功能场景</td>
    </tr>
    <tr>
      <td>业务评估</td>
      <td><strong>业务价值</strong></td>
      <td><code>85</code></td>
      <td>0-100 分，评估业务价值</td>
    </tr>
  </tbody>
</table>

#### 📝 完整示例

**spec.md**:
```markdown
# I003-inventory-query

## 功能概述
库存查询功能，支持多维度筛选和实时查询。

## 用户故事
作为仓库管理员，我想要查询库存数据，以便掌握商品库存情况。

## 验收标准
1. 用户可以选择门店和商品进行筛选
2. 查询结果在 1 秒内返回
3. 导出的 Excel 包含所有查询字段
4. 支持分页，每页 20 条记录
```

**对应的"产品待办列表"记录**:
```
标题: [I003] 库存查询功能
类型: User Story
优先级: 🟡 P2
状态: 📝 待规划
故事点: 5
负责人: Product Owner
Sprint: (空，待规划)
spec_id: I003-inventory-query

验收标准:
1. 用户可以选择门店和商品进行筛选
2. 查询结果在 1 秒内返回
3. 导出的 Excel 包含所有查询字段
4. 支持分页，每页 20 条记录

描述:
作为仓库管理员，我想要查询库存数据，以便掌握商品库存情况。

功能场景:
- 查看当前所有门店的库存
- 筛选特定商品的库存情况
- 导出库存报表供管理层查看

业务价值: 85
```

---

### 2️⃣ plan.md → 迭代 (Sprint) 表 + 任务 (Task) 表

<table>
  <thead>
    <tr>
      <th>plan.md 内容</th>
      <th>飞书表格位置</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>## 技术方案</strong></td>
      <td><strong>产品待办列表.描述</strong> 字段</td>
      <td>记录在 User Story 描述中</td>
    </tr>
    <tr>
      <td><strong>## 架构设计</strong></td>
      <td><strong>产品待办列表.描述</strong> 字段</td>
      <td>或单独创建设计文档</td>
    </tr>
    <tr>
      <td><strong>## 数据模型</strong></td>
      <td><code>contracts/data-model.md</code></td>
      <td>独立文档，不存入表格</td>
    </tr>
    <tr>
      <td><strong>## API 设计</strong></td>
      <td><code>contracts/api.yaml</code></td>
      <td>OpenAPI 规范，不存入表格</td>
    </tr>
    <tr>
      <td><strong>## 实施步骤</strong><br/>1. xxx (4h)<br/>2. yyy (8h)<br/>...</td>
      <td><strong>任务 (Task) 表</strong> (多条记录)</td>
      <td>每个步骤创建一条任务记录</td>
    </tr>
  </tbody>
</table>

#### 📝 完整示例

**plan.md**:
```markdown
# I003-inventory-query - 实施计划

## 技术方案
- 前端: React + Ant Design Table
- 后端: Spring Boot + Supabase
- 缓存: Redis (2 分钟)

## 实施步骤
1. 设计数据库表结构 (4h)
2. 实现后端 API (8h)
3. 实现前端页面 (12h)
4. 编写单元测试 (6h)
5. E2E 测试 (4h)
```

**对应的"任务 (Task)"表记录**:

| 任务 ID | 任务标题 | User Story | 状态 | 负责人 | 优先级 | 预估工时 | Sprint | spec_id | 标签 |
|---------|---------|-----------|------|--------|--------|---------|--------|---------|------|
| TSK-010 | [I003] 设计数据库表结构 | I003 库存查询 | 📝 待办 | 张三 | 🔴 高 | 4 | Sprint 2 | I003-inventory-query | Backend |
| TSK-011 | [I003] 实现后端 API | I003 库存查询 | 📝 待办 | 张三 | 🔴 高 | 8 | Sprint 2 | I003-inventory-query | Backend |
| TSK-012 | [I003] 实现前端页面 | I003 库存查询 | 📝 待办 | 李四 | 🟡 中 | 12 | Sprint 2 | I003-inventory-query | Frontend |
| TSK-013 | [I003] 编写单元测试 | I003 库存查询 | 📝 待办 | 王五 | 🟢 低 | 6 | Sprint 2 | I003-inventory-query | Test |
| TSK-014 | [I003] E2E 测试 | I003 库存查询 | 📝 待办 | 王五 | 🟢 低 | 4 | Sprint 2 | I003-inventory-query | Test |

---

### 3️⃣ tasks.md → 任务 (Task) 表

<table>
  <thead>
    <tr>
      <th>tasks.md 内容</th>
      <th>任务 (Task) 表字段</th>
      <th>示例值</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>任务标题<br/><code>- [ ] 设计数据库表结构</code></td>
      <td><strong>任务标题</strong></td>
      <td><code>[I003] 设计数据库表结构</code></td>
      <td>加上 spec_id 前缀</td>
    </tr>
    <tr>
      <td>-</td>
      <td><strong>User Story</strong></td>
      <td>I003 库存查询</td>
      <td>关联到"产品待办列表"</td>
    </tr>
    <tr>
      <td><code>[ ]</code> 或 <code>[x]</code></td>
      <td><strong>状态</strong></td>
      <td><code>📝 待办</code></td>
      <td>待办 / 进行中 / 测试中 / 已完成 / 已取消</td>
    </tr>
    <tr>
      <td><code>@张三</code></td>
      <td><strong>负责人</strong></td>
      <td>张三</td>
      <td>从 @mention 解析</td>
    </tr>
    <tr>
      <td>-</td>
      <td><strong>优先级</strong></td>
      <td><code>🔴 高</code></td>
      <td>根据 Phase 推断或手动设置</td>
    </tr>
    <tr>
      <td><code>(4h)</code></td>
      <td><strong>预估工时</strong></td>
      <td><code>4</code></td>
      <td>从括号中提取数字</td>
    </tr>
    <tr>
      <td>-</td>
      <td><strong>实际工时</strong></td>
      <td>(空)</td>
      <td>完成后填写</td>
    </tr>
    <tr>
      <td>-</td>
      <td><strong>Sprint</strong></td>
      <td>Sprint 2</td>
      <td>关联到"迭代 (Sprint)"表</td>
    </tr>
    <tr>
      <td>-</td>
      <td><strong>spec_id</strong></td>
      <td><code>I003-inventory-query</code></td>
      <td>完整规格标识符</td>
    </tr>
    <tr>
      <td>## Phase 分类<br/>(如 "Phase 1: 后端开发")</td>
      <td><strong>标签</strong></td>
      <td><code>Backend</code></td>
      <td>Frontend / Backend / Test / Docs</td>
    </tr>
  </tbody>
</table>

#### 📝 完整示例

**tasks.md**:
```markdown
# I003-inventory-query - 任务清单

## Phase 1: 后端开发
- [ ] 设计数据库表结构 (4h) @张三
- [ ] 实现 InventoryQueryController (3h) @张三
- [ ] 实现 InventoryService 业务逻辑 (5h) @张三
- [ ] 编写后端单元测试 (4h) @王五

## Phase 2: 前端开发
- [ ] 实现库存查询页面 (6h) @李四
- [ ] 实现筛选组件 (3h) @李四
- [ ] 实现表格展示 (3h) @李四

## Phase 3: 测试
- [ ] 编写前端单元测试 (2h) @王五
- [ ] E2E 测试 (4h) @王五
```

**自动转换为 Task 表记录**:
```json
{
  "任务标题": "[I003] 设计数据库表结构",
  "User Story": "I003 库存查询",
  "状态": "📝 待办",
  "负责人": "张三",
  "优先级": "🔴 高",
  "预估工时": 4,
  "实际工时": null,
  "Sprint": "Sprint 2",
  "spec_id": "I003-inventory-query",
  "标签": ["Backend"],
  "创建时间": "2026-01-06T09:00:00Z",
  "完成时间": null
}
```

---

## 🎯 实战示例：I003-库存查询

### Step 1: 创建 spec.md

```bash
mkdir -p specs/I003-inventory-query
cd specs/I003-inventory-query
touch spec.md
```

编写 spec.md 内容...

### Step 2: 在"产品待办列表"表创建记录

1. 打开飞书多维表格 → **产品待办列表**
2. 点击「添加记录」按钮
3. 填写字段:
   - **标题**: `[I003] 库存查询功能`
   - **类型**: 选择 `User Story`
   - **优先级**: 选择 `🟡 P2`
   - **状态**: 选择 `📝 待规划`
   - **故事点**: 选择 `5`
   - **负责人**: 选择 `Product Owner`
   - **spec_id**: 输入 `I003-inventory-query`
   - **验收标准**: 复制 spec.md 中的验收标准
   - **描述**: 复制 spec.md 中的用户故事
   - **业务价值**: 输入 `85`
4. 点击「保存」

### Step 3: Sprint Planning - 规划到 Sprint

1. 打开 **迭代 (Sprint)** 表
2. 创建新 Sprint:
   - **Sprint 名称**: `Sprint 2 (2026-01-14 ~ 2026-01-27)`
   - **开始日期**: `2026/01/14`
   - **结束日期**: `2026/01/27`
   - **Sprint 目标**: `完成库存查询功能`
   - **状态**: `📝 规划中`
3. 保存后，更新为 `🚀 进行中`

4. 返回 **产品待办列表** 表
5. 找到 `[I003] 库存查询功能` 记录
6. 在 **Sprint** 字段选择 `Sprint 2`
7. 更新 **状态** 为 `🎯 已规划`

### Step 4: 拆解任务到 Task 表

1. 打开 **任务 (Task)** 表
2. 创建任务 1:
   - **任务标题**: `[I003] 设计数据库表结构`
   - **User Story**: 选择 `I003 库存查询`
   - **状态**: `📝 待办`
   - **负责人**: 选择 `张三`
   - **优先级**: `🔴 高`
   - **预估工时**: `4`
   - **Sprint**: 选择 `Sprint 2`
   - **spec_id**: `I003-inventory-query`
   - **标签**: 选择 `Backend`

3. 重复创建任务 2-5...

### Step 5: 日常更新任务状态

1. 打开 **任务 (Task)** 表
2. 筛选: **Sprint** = `Sprint 2` AND **负责人** = `我`
3. 开始任务: 更新 **状态** 为 `🚀 进行中`
4. 完成任务:
   - 更新 **状态** 为 `✅ 已完成`
   - 填写 **实际工时**: `3.5`
   - 填写 **完成时间**: `2026/01/15`

---

## 🔧 常见操作指南

### 如何查看我的任务？

1. 打开 **任务 (Task)** 表
2. 点击「视图」下拉菜单
3. 选择「我的任务」视图（或新建）
4. 设置筛选条件:
   - **负责人** = `我`
   - **状态** ≠ `✅ 已完成`
5. 按 **优先级** 升序排序

### 如何查看当前 Sprint 的进度？

1. 打开 **迭代 (Sprint)** 表
2. 找到当前 Sprint 记录
3. 查看字段:
   - **总故事点**: 本 Sprint 规划的总工作量
   - **完成故事点**: 已完成的工作量
   - **完成率**: 自动计算的进度百分比

### 如何报告 Bug？

1. 打开 **缺陷 (Bug)** 表
2. 点击「添加记录」
3. 填写:
   - **Bug 标题**: `[I003] 库存查询筛选条件无效`
   - **严重程度**: 选择 `🟠 High`
   - **状态**: `📝 待修复`
   - **报告人**: 自动填充
   - **关联 Story**: 选择对应的 User Story
   - **发现环境**: 选择 `Test` / `UAT` / `Production`
   - **spec_id**: `I003-inventory-query`
   - **复现步骤**: 详细描述
4. 保存

### 如何记录技术债？

1. 打开 **技术债 (Technical Debt)** 表
2. 点击「添加记录」
3. 填写:
   - **债务标题**: `库存模块缺少单元测试覆盖`
   - **类型**: 选择 `代码质量`
   - **影响程度**: 选择 `🔴 High`
   - **状态**: `📝 待处理`
   - **预估工时**: `16`
   - **spec_id**: `I003-inventory-query`
   - **影响范围**: 描述受影响的模块
4. 保存

---

## ❓ FAQ

### Q1: spec_id 字段的作用是什么？

**A**: `spec_id` 是**核心关联字段**，记录完整的 spec 标识符（如 `I003-inventory-query`），用于：
- 将 spec 文件和多维表格记录精确关联
- 跨表查询和追踪（Product Backlog → Task → Bug → Technical Debt）
- 代码中的 `@spec` 标识与表格数据映射
- 避免不同功能的数字冲突（如 I003 vs P003）

### Q2: 如何保持 spec.md 和 Product Backlog 同步？

**A**:
- **spec.md 更新时**: 手动同步更新 Product Backlog 的「验收标准」和「描述」字段
- **Product Backlog 状态变更时**: 考虑在 spec.md 中添加状态标记
- **未来自动化**: 可通过脚本或 Webhook 自动同步

### Q3: Task 的「预估工时」和「实际工时」差异很大怎么办？

**A**:
- 在 Sprint Retrospective 中讨论偏差原因
- 调整估算方法，参考历史数据
- 拆分任务粒度，单个任务不超过 16 小时

### Q4: 如何处理跨 Sprint 的大型功能？

**A**:
- 使用 **Epic** 类型记录大型功能
- 拆分为多个 **User Story**，分配到不同 Sprint
- 每个子功能创建独立的 spec（如 I003-inventory-query, I004-inventory-ledger）
- 在描述中注明父 Epic 关联

### Q5: 能否自动从 spec.md 创建 Product Backlog 记录？

**A**:
- **当前**: 需要手动创建和填写
- **未来规划**: `/lark-pm backlog-create --from-spec I003-inventory-query` 命令自动创建

---

## 📚 相关文档

- [Scrum 工作流指南](./scrum-workflow.md)
- [Scrum 数据模型](./data-model-scrum.md)
- [Scrum-Spec 映射详解](./SCRUM-SPEC-MAPPING.md)
- [功能分支绑定规则](../../.claude/rules/01-branch-spec-binding.md)

---

## 🎯 快速参考卡

### 核心映射公式

```
spec.md → 产品待办列表 (1条记录)
plan.md → 迭代 (Sprint) + 任务 (Task) (技术设计)
tasks.md → 任务 (Task) (N条记录)
```

### 关键字段

| 字段 | 作用 |
|------|------|
| **spec_id** | 贯穿所有表，核心关联字段 |
| **Sprint** | 关联"迭代 (Sprint)"表 |
| **User Story** | 关联"产品待办列表"表 |
| **标签** | 快速筛选任务类型 |

### 状态流转

```
产品待办列表: 📝 待规划 → 🎯 已规划 → 🚀 开发中 → ✅ 已完成
任务 (Task): 📝 待办 → 🚀 进行中 → 🧪 测试中 → ✅ 已完成
迭代 (Sprint): 📝 规划中 → 🚀 进行中 → ✅ 已完成
```

---

**文档维护者**: Scrum Master
**反馈渠道**: 飞书群或提交 Issue
**更新计划**: 每季度检查并更新

---

**使用提示**:
1. 将此文档添加到飞书多维表格的「说明」或「知识库」中
2. 新成员入职时，先阅读本文档
3. 遇到问题时，先查阅 FAQ 章节
