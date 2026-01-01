# Sprint 管理功能实施进度

**@spec T004-lark-project-management**

**最后更新**: 2026-01-01 13:03

## 已完成的工作 ✅

### 1. 基础调研和分析
- ✅ 检查现有 Sprint 表（`tbllbcahbnPvidbE`）的字段结构
- ✅ 确认现有字段：只有 1 个"Sprint 名称"字段
- ✅ 分析需要新增的 13 个字段

### 2. 配置更新
- ✅ 更新 `config.json`，添加 Sprint 表 ID 配置
  ```json
  {
    "tableIds": {
      "sprint": "tbllbcahbnPvidbE"
    }
  }
  ```

### 3. 设计文档
- ✅ 创建 `SPRINT_MANAGEMENT_DESIGN.md` - 完整的 Sprint 管理系统设计方案
- ✅ 创建 `SPRINT_FIELD_COMPARISON.md` - 字段对比和实施计划

### 4. 飞书文档导入功能修复 ⭐
- ✅ 发现 `/docx/v1/documents/import` 端点返回 404
- ✅ 通过 Context7 查询飞书官方文档，找到正确的导入流程
- ✅ 更新 `LarkDocxService.importMarkdown()` 方法，实现三步导入：
  1. 创建空文档 (`POST /docx/v1/documents`)
  2. 转换 Markdown 为 blocks (`POST /docx/v1/documents/blocks/convert`)
  3. 插入 blocks (`POST /docx/v1/documents/{id}/blocks/{root_id}/children/batch_create`)

### 5. OAuth 权限配置
- ✅ 发现权限不足错误：缺少 `docx:document` 和 `docx:document:create` 权限
- ✅ 更新 `lark-oauth-helper.ts`，添加 `docx:document` scope
  ```typescript
  private readonly SCOPES = [
    'bitable:app',
    'drive:drive',
    'docx:document', // 新增
  ]
  ```
- ✅ 重新编译 TypeScript 代码

## 当前阻塞 ⏸️

### OAuth 重新授权
- **状态**: 等待用户在浏览器中完成授权
- **授权链接**: 已打开浏览器
- **所需权限**:
  - `bitable:app` - 多维表格
  - `drive:drive` - 云文档
  - `docx:document` - 文档创建和编辑
- **下一步**: 用户授权完成后，导入文档到飞书

## 待办事项 📋

### 优先级 P0（核心功能）

#### 1. 文档导入（当前阻塞）
- [ ] 等待用户完成 OAuth 重新授权
- [ ] 测试导入 `SPRINT_MANAGEMENT_DESIGN.md`
- [ ] 测试导入 `SPRINT_FIELD_COMPARISON.md`
- [ ] 验证文档在飞书中正确渲染

#### 2. Sprint 表字段添加
- [ ] **手动操作**：在飞书多维表格中添加以下字段（推荐）
  - Sprint ID（单行文本，必填）
  - spec_id（单行文本，必填）
  - 状态（单选，必填，4个选项）
  - 目标（多行文本）
  - 开始日期（日期）
  - 结束日期（日期）
  - **计划文档内容**（多行文本）⭐ 关键字段
  - **计划文档链接**（URL）⭐ 关键字段
  - 关联 Epic（关联字段 → Product Backlog）
  - 速度（数字）
  - 容量（数字）
  - 负责人（人员）
  - 备注（多行文本）

#### 3. Sprint CRUD 命令实现
- [ ] 实现 `sprint create` 命令
  ```typescript
  // src/commands/sprint/create.ts
  export async function createSprintCommand(options: CreateSprintOptions) {
    // 使用 LarkBitableService.createRecord()
    // 支持 --plan-doc 和 --plan-link 参数
  }
  ```
- [ ] 实现 `sprint list` 命令
- [ ] 实现 `sprint update` 命令
- [ ] 实现 `sprint status` 命令（统计任务进度）

### 优先级 P1（集成功能）

#### 4. Product Backlog 表增强
- [ ] 添加字段：
  - 技术方案链接（URL）
  - user_story_id（单行文本）
  - 关联 Epic（关联字段）
- [ ] 更新 `backlog update` 命令，支持新字段

#### 5. 任务管理表增强
- [ ] 添加字段：
  - sprint_id（单行文本）
  - user_story_id（单行文本）
  - task_id（单行文本）
- [ ] 更新 `task create` 命令，支持新字段

### 优先级 P2（高级功能）
- [ ] 实现 `task import-from-tasks-md` 命令
- [ ] 实现 `sprint burndown` 命令
- [ ] 更新 README.md 文档

## 技术要点总结

### 飞书 Markdown 导入的正确方式

根据飞书官方文档，导入 Markdown 需要三步：

```typescript
// 1. 创建空文档
const createResponse = await client.post('/docx/v1/documents', {
  title: '文档标题'
})
const documentId = createResponse.data.document.document_id

// 2. 转换 Markdown 为 blocks
const convertResponse = await client.post('/docx/v1/documents/blocks/convert', {
  content: markdownContent,
  content_type: 'markdown'
})
const blocks = convertResponse.data.blocks

// 3. 获取根块 ID 并插入 blocks
const docResponse = await client.get(`/docx/v1/documents/${documentId}`)
const rootBlockId = docResponse.data.document.body.block_id

await client.post(
  `/docx/v1/documents/${documentId}/blocks/${rootBlockId}/children/batch_create`,
  { children: blocks }
)
```

### 飞书 OAuth 权限管理

**关键发现**：
- 飞书应用的权限 scope 必须在首次授权时完整声明
- 修改 scope 后必须重新授权（旧的 access_token 无法获得新权限）
- 文档操作需要 `docx:document` 权限

**权限列表**：
| Scope | 用途 | 是否必需 |
|-------|------|---------|
| `bitable:app` | 多维表格操作 | ✅ 必需 |
| `drive:drive` | 云文档基础权限 | ✅ 必需 |
| `docx:document` | 创建/编辑文档 | ✅ 新增（用于导入文档）|

## 数据模型核心设计

### plan.md 存储策略 ⭐

**决策**: 存储在 Sprint 表的"计划文档内容"字段

**理由**:
1. plan.md 描述"如何实现"，是技术决策记录（ADR），不是待办事项
2. 一个 spec 可能有多个 Sprints，每个 Sprint 的技术方案可能不同
3. 便于 Sprint 回顾时查看当时的技术决策

**实施方案**:
- `计划文档内容`（多行文本）: 存储 plan.md 的完整 Markdown 内容
- `计划文档链接`（URL）: 指向 GitHub/GitLab 上的 plan.md 文件

**示例**:
```bash
# 创建 Sprint 0（技术设计阶段）
node dist/index.js sprint create \
  --sprint-id "Sprint 0 - Tech Design" \
  --name "技术方案设计" \
  --spec-id "T004-lark-project-management" \
  --plan-doc "$(cat specs/T004-lark-project-management/plan.md)" \
  --plan-link "https://github.com/.../plan.md" \
  --status "📝 规划中"
```

## 遇到的问题及解决方案

### 问题 1: 飞书导入 API 404 错误

**错误信息**:
```
POST https://open.feishu.cn/open-apis/docx/v1/documents/import
→ 404 page not found
```

**根本原因**: `/docx/v1/documents/import` 端点不存在或已废弃

**解决方案**:
使用三步流程：创建文档 → 转换 Markdown → 插入块

**参考文档**:
https://github.com/context7/open_feishu_cn_document/blob/main/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert.md

### 问题 2: OAuth 权限不足

**错误信息**:
```
code: 99991679
msg: "required one of these privileges: [docx:document, docx:document:create]"
```

**根本原因**: 初次授权时未申请文档创建权限

**解决方案**:
1. 在 `lark-oauth-helper.ts` 中添加 `docx:document` scope
2. 重新执行 OAuth 授权流程（旧 token 无法获得新权限）

## 下一步操作指南

### 完成授权后

1. **测试文档导入**:
   ```bash
   node -e "
   const fs = require('fs');
   const { LarkDocxService } = require('./dist/services/lark-docx-service.js');

   async function test() {
     const markdown = fs.readFileSync('SPRINT_MANAGEMENT_DESIGN.md', 'utf-8');
     const service = new LarkDocxService();
     const docId = await service.importMarkdown({
       file_name: 'Sprint 管理系统设计方案',
       markdown
     });
     console.log('文档 ID:', docId);
     console.log('在线链接: https://feishu.cn/docx/' + docId);
   }
   test();
   "
   ```

2. **手动添加 Sprint 表字段**（推荐）:
   - 打开飞书多维表格: https://example.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tbllbcahbnPvidbE
   - 参考 `SPRINT_FIELD_COMPARISON.md` 逐个添加字段

3. **实现 Sprint CRUD 命令**:
   - 复用 `backlog` 命令的实现模式
   - 使用 `LarkBitableService` 直接 API 调用

## 文件清单

### 新增文件
- `SPRINT_MANAGEMENT_DESIGN.md` - Sprint 管理系统完整设计方案
- `SPRINT_FIELD_COMPARISON.md` - 字段对比和实施指南
- `IMPLEMENTATION_PROGRESS.md` - 本文档

### 修改文件
- `config.json` - 添加 Sprint 表 ID 配置
- `src/services/lark-docx-service.ts` - 修复 Markdown 导入实现
- `src/utils/lark-oauth-helper.ts` - 添加 `docx:document` scope

---

**创建人**: Claude Code
**Spec**: T004-lark-project-management
**状态**: 🟡 等待用户完成 OAuth 授权
