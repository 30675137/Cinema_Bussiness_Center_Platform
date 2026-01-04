# Lark PM 项目管理集成规则

## 核心原则
当项目使用 Lark PM (飞书多维表格) 进行任务跟踪时，必须遵循以下规则确保数据一致性。

## 配置信息

### Base App 配置
| 配置项 | 值 |
|--------|-----|
| Base App Token | `Y05Mb7greapFiSseRpoc5XkXnrb` |
| 任务表 Table ID | `tblucYhJLq5TJ5xA` |
| API 表 Table ID | `tblmNcitMxHPrOMv` |

### 任务表字段映射
| 字段名 | 类型 | 说明 |
|--------|------|------|
| 标题 | Text | 任务标题 |
| 规格ID | Text | 完整 specId (如 `O002-miniapp-menu-config`) |
| 阶段 | Text | Phase 名称 (如 `Phase 6: US6 商品筛选`) |
| 状态 | SingleSelect | `📝 待办` / `🚀 进行中` / `✅完成` |
| 执行结果 | Text | 多行文本，记录完成情况 |

## 规则

### R11.1 记录查询规范（最重要）

**必须使用完整的 specId 进行查询**：

```typescript
// ✅ 正确：使用完整 specId
{
  "filter": {
    "conjunction": "and",
    "conditions": [
      { "field_name": "规格ID", "operator": "is", "value": ["O002-miniapp-menu-config"] },
      { "field_name": "阶段", "operator": "is", "value": ["Phase 6: US6 商品筛选"] }
    ]
  }
}

// ❌ 错误：使用简写 specId
{
  "filter": {
    "conditions": [
      { "field_name": "规格ID", "operator": "is", "value": ["O002"] }  // 可能匹配多条记录！
    ]
  }
}
```

### R11.2 更新前验证

更新记录前**必须验证**返回记录的字段与预期匹配：
- 标题
- 规格ID
- 阶段

```typescript
// 查询返回后，验证记录
const record = searchResult.data.items[0];
if (record.fields["规格ID"] !== "O002-miniapp-menu-config" ||
    record.fields["阶段"] !== "Phase 6: US6 商品筛选") {
  throw new Error("记录不匹配，请检查查询条件");
}
```

### R11.3 Phase 状态同步

| 时机 | 状态 | 操作 |
|------|------|------|
| Phase 开始 | `🚀 进行中` | 更新状态字段 |
| Phase 完成 | `✅完成` | 更新状态 + 填写执行结果 |

**状态更新顺序**：先 Git Commit，后 Lark PM 更新

### R11.4 执行结果格式

```markdown
## 执行结果

### 已完成任务
- 后端: T062-T066 Service/Controller 层完成
- 前端: T067-T068 Hook/Store 更新完成

### Git Commit
- `3bf328f` feat(O002): Phase 6 - Products Filtered by Dynamic Category
- 9 files changed, 330 insertions(+), 57 deletions(-)

### 遇到的问题
无
```

### R11.5 API 记录规则

新增 API 接口时，必须记录到 API 表：

```typescript
// 使用 bitable_v1_appTableRecord_create
{
  "path": {
    "app_token": "Y05Mb7greapFiSseRpoc5XkXnrb",
    "table_id": "tblmNcitMxHPrOMv"
  },
  "data": {
    "fields": {
      "端点": "GET /api/client/channel-products",
      "方法": "GET",
      "描述": "获取渠道商品列表",
      "规格ID": "O002-miniapp-menu-config"
    }
  }
}
```

## MCP 工具调用示例

### 查询任务记录

```typescript
// 1. 先查询获取 record_id
mcp__lark-mcp__bitable_v1_appTableRecord_search({
  path: {
    app_token: "Y05Mb7greapFiSseRpoc5XkXnrb",
    table_id: "tblucYhJLq5TJ5xA"
  },
  data: {
    filter: {
      conjunction: "and",
      conditions: [
        { field_name: "规格ID", operator: "is", value: ["O002-miniapp-menu-config"] },
        { field_name: "阶段", operator: "is", value: ["Phase 6: US6 商品筛选"] }
      ]
    }
  }
})
```

### 更新任务状态

```typescript
// 2. 使用 record_id 更新
mcp__lark-mcp__bitable_v1_appTableRecord_update({
  path: {
    app_token: "Y05Mb7greapFiSseRpoc5XkXnrb",
    table_id: "tblucYhJLq5TJ5xA",
    record_id: "recv7fidbKAp7N"  // 从查询结果获取
  },
  data: {
    fields: {
      "状态": "🚀 进行中"
    }
  }
})
```

### 创建新任务

```typescript
mcp__lark-mcp__bitable_v1_appTableRecord_create({
  path: {
    app_token: "Y05Mb7greapFiSseRpoc5XkXnrb",
    table_id: "tblucYhJLq5TJ5xA"
  },
  data: {
    fields: {
      "标题": "O002 Phase 7: US3 分类排序",
      "规格ID": "O002-miniapp-menu-config",
      "阶段": "Phase 7: US3 分类排序",
      "状态": "📝 待办"
    }
  }
})
```

## 常见错误及解决方案

### 错误 1：查询返回错误记录

**原因**：使用简写 specId（如 `O002`）导致匹配多条记录

**解决**：始终使用完整 specId（如 `O002-miniapp-menu-config`）

### 错误 2：Table ID 不存在

**原因**：使用了错误的 Table ID

**解决**：先调用 `bitable_v1_appTable_list` 获取正确的 Table ID

```typescript
mcp__lark-mcp__bitable_v1_appTable_list({
  path: { app_token: "Y05Mb7greapFiSseRpoc5XkXnrb" }
})
```

### 错误 3：字段格式错误

**原因**：多行文本字段使用了富文本数组格式

**解决**：多行文本字段使用纯字符串，不要使用 `[{"text": "...", "type": "text"}]` 格式

```typescript
// ✅ 正确
{ "执行结果": "## 已完成\n- Task 1\n- Task 2" }

// ❌ 错误
{ "执行结果": [{"text": "已完成", "type": "text"}] }
```

## 文档上传与权限规则

### R11.6 文档权限自动授权

通过 Lark MCP 上传文档后，**必须**自动授予指定人员编辑权限。

**默认授权人员**：

| 邮箱 | 权限 | 说明 |
|------|------|------|
| `30675137@qq.com` | edit | 项目负责人，所有文档可编辑 |

**授权流程**：

```typescript
// 1. 上传文档
const result = await mcp__lark-mcp__docx_builtin_import({
  data: { file_name: "文档名称", markdown: "..." }
});

// 2. 获取用户 open_id
const user = await mcp__lark-mcp__contact_v3_user_batchGetId({
  data: { emails: ["30675137@qq.com"] },
  params: { user_id_type: "open_id" }
});

// 3. 授予编辑权限
await mcp__lark-mcp__drive_v1_permissionMember_create({
  data: {
    member_id: user.user_list[0].user_id,  // "ou_4d5ff96d59a2ce2dc8a3549c05efcc11"
    member_type: "openid",
    perm: "edit"
  },
  params: { need_notification: true, type: "docx" },
  path: { token: result.result.token }
});
```

**预存 open_id 快速引用**：

| 邮箱 | open_id |
|------|---------|
| `30675137@qq.com` | `ou_4d5ff96d59a2ce2dc8a3549c05efcc11` |

### R11.7 文档权限级别

| 权限 | 说明 |
|------|------|
| `view` | 只读 |
| `edit` | 可编辑 |
| `full_access` | 完全管理 |

## 禁止行为

- ❌ 禁止使用简写 specId 查询记录
- ❌ 禁止不验证就更新记录
- ❌ 禁止 Phase 完成后不更新 Lark PM
- ❌ 禁止执行结果字段留空
- ❌ 禁止在 Git Commit 之前标记任务完成
- ❌ 禁止新增 API 后不记录到 API 表
- ❌ 禁止上传文档后不授予默认人员编辑权限

## 相关文档

- **治理规则**: `.specify/memory/constitution.md` (R11.1-R11.6)
- **Skill 文档**: `.claude/skills/lark-pm/README.md`
- **快速入门**: `.claude/skills/lark-pm/QUICKSTART.md`

---

**版本**: 1.0.0 | **创建日期**: 2026-01-03
