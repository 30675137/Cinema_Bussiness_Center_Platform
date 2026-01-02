# O006 Sprint 批量导入指南

**@spec T004-lark-project-management**

本指南帮助您完成 O006 小程序渠道商品订单适配项目的 40 个任务批量导入。

---

## 📊 当前状态

✅ **已完成**:
- Base App Token 已配置: `Y05Mb7greapFiSseRpoc5XkXnrb`
- 任务管理表 ID 已配置: `tblucYhJLq5TJ5xA`
- 智能检测脚本已创建并运行

🔍 **检测结果**:

| 状态 | 字段名称 | 类型 |
|------|---------|------|
| ✅ 已存在 | 标题 | 文本 |
| ✅ 已存在 | 优先级 | 单选 |
| ✅ 已存在 | 状态 | 单选 |
| ❌ **缺失** | **规格ID** | **文本** |
| ❌ **缺失** | **标签** | **多选** |
| ❌ **缺失** | **进度** | **数字** |
| ❌ **缺失** | **预计工时** | **数字** |
| ❌ **缺失** | **备注** | **文本** |

---

## 🎯 下一步操作（需要手动添加 5 个字段）

### 步骤 1: 打开飞书任务管理表

访问链接：
```
https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tblucYhJLq5TJ5xA
```

### 步骤 2: 添加 5 个缺失字段

点击表格右侧的 **"+"** 按钮，依次添加以下字段：

#### 字段 1: 规格ID
- **字段名称**: `规格ID` （必须完全一致，包括中文字符）
- **字段类型**: 文本
- **说明**: 用于关联 spec 规格标识符（如 O006）

#### 字段 2: 标签
- **字段名称**: `标签`
- **字段类型**: 多选
- **选项**（必须添加以下 6 个选项）:
  1. Frontend
  2. Backend
  3. Test
  4. Docs
  5. Design
  6. Infra

#### 字段 3: 进度
- **字段名称**: `进度`
- **字段类型**: 数字
- **说明**: 任务完成进度（0-100）

#### 字段 4: 预计工时
- **字段名称**: `预计工时`
- **字段类型**: 数字
- **说明**: 任务预估工时（单位：小时）

#### 字段 5: 备注
- **字段名称**: `备注`
- **字段类型**: 文本
- **说明**: 任务详细说明和依赖关系

---

## ✅ 步骤 3: 验证字段是否添加成功

添加完所有字段后，运行验证脚本：

```bash
cd /Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/lark-pm
npx tsx scripts/smart-field-check.ts
```

**预期输出**:
```
✅ 测试任务创建成功！所有字段已存在。
🎉 字段检测通过！可以开始导入了
```

如果仍然提示缺失字段，请检查：
- 字段名称是否完全一致（包括中文字符）
- 字段类型是否正确
- "标签"字段的 6 个选项是否都已添加

---

## 🚀 步骤 4: 执行批量导入

验证通过后，运行导入脚本：

```bash
npx tsx scripts/import-o006-tasks.ts
```

**导入内容**:
- ✅ 40 个任务
- ✅ 分布在 7 个 Sprint
- ✅ 总工时 123.25 小时
- ✅ Sprint 信息存储在任务标题中（如 `[Sprint-1]`）

**导入时间**: 约 2-3 分钟（每个任务约 3-5 秒）

---

## 📊 导入后的 Sprint 分布

| Sprint | Phase | 任务数 | 预计工时 | 主要交付物 |
|--------|-------|--------|----------|-----------|
| **Sprint-1** | Setup & Infrastructure | 4 | 1.75h | 功能分支、环境验证 |
| **Sprint-2** | Foundational | 12 | 29h | 类型定义、样式、API、Hooks、Store |
| **Sprint-3** | User Story 1 | 3 | 9.5h | 商品列表页 |
| **Sprint-4** | User Story 2 | 4 | 16.5h | 商品详情页 |
| **Sprint-5** | User Story 3 | 5 | 19h | 购物车和订单提交 |
| **Sprint-6** | User Story 4 | 5 | 17.5h | 订单状态查询 |
| **Sprint-7** | Polish & Testing | 7 | 30h | 打磨、测试、文档 |

**总计**: 40 任务, 123.25 小时 ≈ 15-16 人天

---

## 📝 导入后的操作

### 1. 查看所有 Sprint 统计
```bash
./scripts/manage-sprints.sh stats
```

### 2. 查看 Sprint 1 任务列表
```bash
./scripts/manage-sprints.sh list 1
```

### 3. 启动 Sprint 1
```bash
./scripts/manage-sprints.sh start 1
```

### 4. 查看 Sprint 1 进度
```bash
./scripts/manage-sprints.sh progress 1
```

### 5. 完成 Sprint 1
```bash
./scripts/manage-sprints.sh complete 1
```

### 6. 导出 Sprint 1 报告
```bash
./scripts/manage-sprints.sh export 1
```

---

## ⚠️ 重要提示

### 字段名称必须完全一致
- ✅ 正确: `规格ID`, `标签`, `进度`, `预计工时`, `备注`
- ❌ 错误: `规格id`, `Tag`, `Progress`, `Estimated Hours`, `Notes`

### 不会删除现有数据
- 添加字段**不会**删除或修改任何现有任务数据
- 这是一个安全的增量操作

### "标签"字段的选项
- 必须是**多选**类型（不是单选）
- 必须添加全部 6 个选项：Frontend, Backend, Test, Docs, Design, Infra
- 选项名称必须完全一致（区分大小写）

---

## 🔧 故障排除

### 问题 1: 验证时仍然提示 FieldNameNotFound

**可能原因**:
1. 字段名称不完全匹配（检查中文字符、空格）
2. 字段类型不正确（如"标签"必须是"多选"类型）
3. 浏览器缓存问题

**解决方案**:
1. 刷新飞书表格页面
2. 重新检查字段名称和类型
3. 重新运行验证脚本

### 问题 2: 导入时部分任务失败

**可能原因**:
- 网络超时
- API 限流

**解决方案**:
- 等待 1-2 分钟后重新运行导入脚本
- 脚本会自动跳过已存在的任务，只导入失败的任务

---

## 📚 相关文档

- **Sprint 管理文档**: `scripts/README.md`
- **任务详情**: `../../specs/O006-miniapp-channel-order/tasks.md`
- **功能规格**: `../../specs/O006-miniapp-channel-order/spec.md`
- **实施计划**: `../../specs/O006-miniapp-channel-order/plan.md`

---

**创建时间**: 2026-01-02
**Last Updated**: 2026-01-02 07:51
**Base App Token**: Y05Mb7greapFiSseRpoc5XkXnrb
**Tasks Table ID**: tblucYhJLq5TJ5xA
**飞书表格**: https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tblucYhJLq5TJ5xA
