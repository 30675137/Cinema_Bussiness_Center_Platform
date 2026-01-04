---
name: lark-pm
description: 飞书项目管理工具。支持管理需求规约(Spec)、产品待办列表(Product Backlog)和任务(Task)三个表格。适用于SDD(Spec-Driven Development)开发流程。可创建、更新、删除和查询Spec、待办项与任务；读取和上传文档；设置共享权限；发送消息通知。
---

# 飞书项目管理工具 (Lark Project Management)

## 概述

此Skill提供与飞书(Lark)的项目管理集成，支持SDD开发流程，管理三个核心表格：

### 需求规约列表 (Spec)
- 管理需求规约，支持SDD开发流程
- 表格ID: `tblpQ6i8HRR0IInZ`

### 产品待办列表 (Product Backlog)
- 管理产品级别的待办项：Epic、User Story、功能需求等
- 表格ID: `tblDiernIQoFU9Yr`

### 任务管理 (Task)
- 管理具体执行任务：开发、测试、文档任务等
- 表格ID: `tblucYhJLq5TJ5xA`

## 配置信息

**多维表格 App Token**: `Y05Mb7greapFiSseRpoc5XkXnrb`

表结构配置保存在 `table_schema.json` 文件中。

## 表结构参考

### 需求规约列表 (Spec)

| 字段名 | 类型 | 选项值 |
|--------|------|--------|
| Spec标识 | Text | - (索引字段，如 S001, I003) |
| 状态 | SingleSelect | To Do, Doing, Done, 📝 待规划, 🚀 开发中, ✅ 已完成 |
| 平台 | MultiSelect | 商品运营平台, 小程序订单（miniapp-ordering）, Pos端售卖, 小程序预约 |
| Spec说明 | Text | - |
| 相关文档 | Text | - |
| 测试报告 | Text | - |

### 产品待办列表 (Product Backlog)

| 字段名 | 类型 | 选项值 |
|--------|------|--------|
| 标题 | Text | - (索引字段) |
| 类型 | SingleSelect | Epic, User Story, Spike, 功能需求, 功能优化, BUG, 优化 |
| 优先级 | SingleSelect | 🔴 P0, 🟠 P1, 🟡 P2, 🟢 P3 |
| 状态 | SingleSelect | 📝 待规划, 🎯 已规划, 🚀 开发中, ✅ 已完成, ❌ 已废弃 |
| 故事点 | SingleSelect | 1, 2, 3, 5, 8, 13, 21 |
| 负责人 | User | - |
| spec_id | Text | 关联的Spec标识符 |
| 描述 | Text | - |
| 验收标准 | Text | - |

### 任务管理 (Task)

| 字段名 | 类型 | 选项值 |
|--------|------|--------|
| 标题 | Text | - (索引字段) |
| 任务标识 | Text | - |
| 优先级 | SingleSelect | 🔴 高, 🟡 中, 🟢 低, ⚪ 普通 |
| 状态 | SingleSelect | 📝 待办, 🚀 进行中, ✅完成, ❌ 已取消, 🚗停车场 |
| 规格ID | Text | 关联的Spec标识符 |
| 执行人 | User (多选) | - |
| 标签 | MultiSelect | Frontend, Backend, Test, Docs, Design, Infra |
| 备注 | Text | - |
| 相关文档 | Text | - |

## 使用方法

### 1. Spec管理 (需求规约)

#### 创建Spec
```
/lark-pm 创建spec "S001" 说明:"用户登录功能规约" 平台:小程序订单 状态:To Do
```

#### 查询Spec
```
/lark-pm 查询spec 状态:Doing
/lark-pm 查询spec 平台:小程序订单
/lark-pm 查询所有spec
```

#### 更新Spec
```
/lark-pm 更新spec "S001" 状态:Done
/lark-pm 更新spec "S001" 相关文档:https://xxx.feishu.cn/docx/xxx
```

### 2. 待办项管理 (Product Backlog)

#### 创建待办项
```
/lark-pm 创建待办 "用户登录功能" 类型:User Story 优先级:P1 状态:待规划 spec_id:S001
```

#### 查询待办项
```
/lark-pm 查询待办 状态:开发中
/lark-pm 查询待办 spec_id:S001
```

#### 更新待办项
```
/lark-pm 更新待办 "用户登录功能" 状态:已完成
```

### 3. 任务管理 (Task)

#### 创建任务
```
/lark-pm 创建任务 "实现登录API" 优先级:高 状态:待办 标签:Backend 规格ID:S001
```

#### 查询任务
```
/lark-pm 查询任务 状态:进行中
/lark-pm 查询任务 规格ID:S001
```

#### 更新任务
```
/lark-pm 更新任务 "实现登录API" 状态:完成
```

### 4. 文档管理

#### 读取文档内容
```
/lark-pm 读取文档 https://xxx.feishu.cn/docx/xxxxxx
/lark-pm 读取文档 doc_token
```

#### 上传文档
```
/lark-pm 上传文档 "文档内容markdown"
```

#### 共享文档
```
/lark-pm 共享文档 doc_token 给 user@company.com 权限:编辑
```

### 5. 消息通知

```
/lark-pm 发送消息 "项目进展更新" 到群组
```

## SDD开发流程集成

### 典型流程

1. **创建Spec** → 定义需求规约
2. **创建待办项** → 关联spec_id，分解为Product Backlog
3. **创建任务** → 关联规格ID，分配具体开发任务
4. **上传文档** → 将设计文档关联到Spec或任务

### 示例：完整SDD流程

```
# 1. 创建Spec
/lark-pm 创建spec "S001" 说明:"用户认证模块" 平台:小程序订单 状态:To Do

# 2. 创建关联的待办项
/lark-pm 创建待办 "用户认证功能" 类型:User Story 优先级:P1 spec_id:S001

# 3. 创建开发任务
/lark-pm 创建任务 "实现JWT认证" 优先级:高 规格ID:S001 标签:Backend

# 4. 上传设计文档并关联
/lark-pm 上传文档 "# 用户认证设计\n## 接口定义..."
/lark-pm 更新spec "S001" 相关文档:https://xxx.feishu.cn/docx/xxx
```

## 执行指南

### 操作Spec表

使用以下参数调用 Bitable API:
- `app_token`: `Y05Mb7greapFiSseRpoc5XkXnrb`
- `table_id`: `tblpQ6i8HRR0IInZ`

**创建Spec示例:**
```json
{
  "fields": {
    "Spec标识": "S001",
    "状态": "To Do",
    "平台": ["小程序订单（miniapp-ordering）"],
    "Spec说明": "用户认证模块规约"
  }
}
```

### 操作产品待办列表

- `app_token`: `Y05Mb7greapFiSseRpoc5XkXnrb`
- `table_id`: `tblDiernIQoFU9Yr`

**创建待办项示例:**
```json
{
  "fields": {
    "标题": "用户登录功能",
    "类型": "User Story",
    "优先级": "🟠 P1",
    "状态": "📝 待规划",
    "spec_id": "S001"
  }
}
```

### 操作任务管理表

- `app_token`: `Y05Mb7greapFiSseRpoc5XkXnrb`
- `table_id`: `tblucYhJLq5TJ5xA`

**创建任务示例:**
```json
{
  "fields": {
    "标题": "实现登录API",
    "优先级": "🔴 高",
    "状态": "📝 待办",
    "规格ID": "S001",
    "标签": ["Backend"],
    "执行人": [{"id": "ou_xxx"}]
  }
}
```

## API工具参考

### 查询记录
```
mcp__lark-mcp__bitable_v1_appTableRecord_search
- path.app_token: "Y05Mb7greapFiSseRpoc5XkXnrb"
- path.table_id: 根据操作目标选择表格ID
- data.filter.conditions: 筛选条件
- data.filter.conjunction: "and" 或 "or"
```

### 创建记录
```
mcp__lark-mcp__bitable_v1_appTableRecord_create
- path.app_token: "Y05Mb7greapFiSseRpoc5XkXnrb"
- path.table_id: 表格ID
- data.fields: 字段数据对象
```

### 更新记录
```
mcp__lark-mcp__bitable_v1_appTableRecord_update
- path.app_token: "Y05Mb7greapFiSseRpoc5XkXnrb"
- path.table_id: 表格ID
- path.record_id: 记录ID (需先查询获取)
- data.fields: 更新的字段数据
```

### 用户ID查询
```
mcp__lark-mcp__contact_v3_user_batchGetId
- data.emails: ["user@company.com"]
- params.user_id_type: "open_id"
```

### 导入文档
```
mcp__lark-mcp__docx_builtin_import
- data.file_name: 文档名称
- data.markdown: Markdown内容
```

### 读取文档内容
```
mcp__lark-mcp__docx_v1_document_rawContent
- path.document_id: 文档ID (从URL中提取，如 https://xxx.feishu.cn/docx/ABC123 中的 ABC123)
```

**从URL提取document_id:**
- URL格式: `https://xxx.feishu.cn/docx/{document_id}`
- 示例: `https://j13juzq4tyn.feishu.cn/docx/US8VdV3l0oOyCOxPY2GcJcwDnWe`
- document_id: `US8VdV3l0oOyCOxPY2GcJcwDnWe`

## 注意事项

1. **选项值必须精确匹配**: 状态、优先级等选项字段的值必须与表格中定义的完全一致
2. **Spec标识唯一**: 每个Spec标识符应该是唯一的（如 S001, I003, P004）
3. **关联字段**: 通过spec_id/规格ID字段关联Spec、待办项和任务
4. **多选字段**: 平台、标签等多选字段需要传数组格式
5. **用户字段**: 设置负责人/执行人时需要使用用户的 open_id
