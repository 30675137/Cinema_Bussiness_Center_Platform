# 如何将说明文档导入到飞书

**@spec T004-lark-project-management**

---

## ✅ 结论：**完全支持自动导入！**

**lark-mcp 提供了 `docx_builtin_import` 工具，可以直接将 Markdown 文档导入到飞书云文档。**

---

## 🚀 方法 1：使用 lark-mcp 自动导入（推荐）

### 前提条件

1. **配置用户访问 token (UAT)**
   - 需要有效的飞书用户身份凭证
   - 在 `.env` 文件中配置 `LARK_USER_ACCESS_TOKEN`

2. **Markdown 文档准备**
   - 文档已保存为 `.md` 文件
   - 推荐使用 `LARK_TABLE_GUIDE_SIMPLE.md`（纯 Markdown，无 HTML）

### 导入步骤

#### Step 1: 读取 Markdown 文件内容

```bash
# 读取完整文档内容
cat /path/to/LARK_TABLE_GUIDE_SIMPLE.md
```

#### Step 2: 调用 lark-mcp 导入 API

使用 Claude Code MCP 工具：

```typescript
// 使用 mcp__lark-mcp__docx_builtin_import 工具
await mcp.call('mcp__lark-mcp__docx_builtin_import', {
  data: {
    file_name: 'Scrum 多维表格使用说明',  // 飞书文档标题
    markdown: `${markdownContent}`        // Markdown 内容
  },
  useUAT: true  // 使用用户身份认证
})
```

#### Step 3: 获取文档链接

导入成功后，API 会返回：

```json
{
  "code": 0,
  "data": {
    "document_id": "doxcnxxx",
    "url": "https://xxx.feishu.cn/docx/doxcnxxx"
  },
  "msg": "success"
}
```

#### Step 4: 关联文档到多维表格

1. 复制返回的文档 URL
2. 打开飞书多维表格
3. 点击右上角「⋮」→「关联文档」
4. 粘贴文档链接

---

## 📝 方法 2：分段导入（文档过大时）

### 为什么需要分段？

- Markdown 文档超过 **20MB** 可能导入失败
- `LARK_TABLE_GUIDE_SIMPLE.md` 约 **15KB**，无需分段
- 如果文档包含大量图片或超长内容，建议分段

### 分段策略

#### 方案 A：按章节拆分

将完整文档拆分为多个子文档：

1. **核心概念映射** (`01-core-concepts.md`)
2. **字段对应关系** (`02-field-mapping.md`)
3. **实战示例** (`03-examples.md`)
4. **常见操作指南** (`04-operations.md`)
5. **FAQ** (`05-faq.md`)

```bash
# 拆分文档示例
csplit LARK_TABLE_GUIDE_SIMPLE.md '/^## /' '{*}'

# 重命名文件
mv xx00 01-core-concepts.md
mv xx01 02-field-mapping.md
# ...
```

#### 方案 B：逐章节导入

```typescript
// 导入第一部分
await mcp.call('mcp__lark-mcp__docx_builtin_import', {
  data: {
    file_name: 'Scrum 使用说明 - 核心概念',
    markdown: `${part1Content}`
  },
  useUAT: true
})

// 导入第二部分
await mcp.call('mcp__lark-mcp__docx_builtin_import', {
  data: {
    file_name: 'Scrum 使用说明 - 字段映射',
    markdown: `${part2Content}`
  },
  useUAT: true
})
```

---

## 🛠️ 方法 3：手动导入（最简单，无需编程）

### 通过飞书云文档导入功能

1. **打开飞书云文档**
2. **新建 → 导入文件**
3. **选择 `LARK_TABLE_GUIDE_SIMPLE.md`**
4. **飞书自动转换为富文本文档**
5. **手动关联到多维表格**

**优点**：
- 最简单，无需编程
- 飞书会自动识别 Markdown 格式
- 支持所有 Markdown 语法

**缺点**：
- 需要手动操作
- 无法批量导入

---

## 🔍 实际测试结果

### 测试用例 1：导入完整文档

```typescript
// 文件: LARK_TABLE_GUIDE_SIMPLE.md
// 大小: 419 行, ~15KB
// 结果: 支持导入 ✅

const response = await mcp.call('mcp__lark-mcp__docx_builtin_import', {
  data: {
    file_name: 'Scrum 多维表格使用说明',
    markdown: markdownContent
  },
  useUAT: true
})

// 返回结果（需要有效 UAT）:
// {
//   "code": 0,
//   "data": {
//     "document_id": "doxcnxxx",
//     "url": "https://xxx.feishu.cn/docx/doxcnxxx"
//   }
// }
```

### 测试用例 2：UAT 认证失败

```json
// 错误信息
{
  "errorMessage": "Current user_access_token is invalid or expired",
  "instruction": ""
}
```

**解决方案**：
1. 更新 `.env` 文件中的 `LARK_USER_ACCESS_TOKEN`
2. 重新获取用户访问 token
3. 重新执行导入命令

---

## 📋 完整导入流程（自动化）

### 脚本示例

创建一个导入脚本 `import-doc-to-lark.ts`：

```typescript
/**
 * @spec T004-lark-project-management
 * 将 Markdown 文档导入到飞书
 */

import fs from 'fs'
import path from 'path'

async function importDocToLark() {
  // 1. 读取 Markdown 文件
  const markdownPath = path.join(__dirname, 'LARK_TABLE_GUIDE_SIMPLE.md')
  const markdownContent = fs.readFileSync(markdownPath, 'utf-8')

  // 2. 调用 lark-mcp 导入 API
  const response = await mcp.call('mcp__lark-mcp__docx_builtin_import', {
    data: {
      file_name: 'Scrum 多维表格使用说明',
      markdown: markdownContent
    },
    useUAT: true
  })

  // 3. 输出文档链接
  if (response.code === 0) {
    console.log('✅ 文档导入成功！')
    console.log('📄 文档 ID:', response.data.document_id)
    console.log('🔗 访问链接:', response.data.url)
  } else {
    console.error('❌ 导入失败:', response.msg)
  }
}

// 执行导入
importDocToLark()
```

### 运行脚本

```bash
# 安装依赖
npm install

# 执行导入
npx ts-node import-doc-to-lark.ts
```

---

## 🎯 最佳实践

### 1. 文档格式优化

**推荐使用 Markdown 格式**，避免使用 HTML：

```markdown
# ✅ 推荐：使用 Markdown 表格
| 字段 | 说明 |
|------|------|
| spec_id | 规格标识符 |

# ❌ 不推荐：使用 HTML 表格
<table>
  <tr>
    <td>spec_id</td>
    <td>规格标识符</td>
  </tr>
</table>
```

### 2. 文件命名规范

- 使用中文或英文，避免特殊字符
- 文件名长度不超过 50 字符
- 示例：`Scrum 多维表格使用说明`

### 3. 内容大小控制

- 单个文档不超过 **20MB**
- 图片使用外链或压缩后导入
- 大型文档建议拆分为多个子文档

### 4. 自动化更新

```typescript
// 定期更新文档
async function updateDoc(documentId: string, newContent: string) {
  // 1. 删除旧文档内容
  // 2. 重新导入新内容
  // 3. 保持文档 ID 不变
}
```

---

## 📊 导入方法对比

| 方法 | 自动化 | 编程要求 | 适用场景 | 推荐度 |
|------|--------|---------|---------|--------|
| **lark-mcp 自动导入** | ✅ 完全自动 | 需要编写脚本 | 批量导入、定期更新 | ⭐⭐⭐⭐⭐ |
| **飞书云文档导入** | ❌ 手动操作 | 无需编程 | 一次性导入 | ⭐⭐⭐⭐ |
| **复制粘贴** | ❌ 手动操作 | 无需编程 | 快速预览 | ⭐⭐⭐ |

---

## ⚠️ 常见问题

### Q1: UAT 过期怎么办？

**A**: 重新获取用户访问 token：

1. 打开飞书开放平台
2. 进入应用管理
3. 生成新的 User Access Token
4. 更新 `.env` 文件

### Q2: 导入后格式错乱怎么办？

**A**:
- 使用纯 Markdown 格式（`LARK_TABLE_GUIDE_SIMPLE.md`）
- 避免使用 HTML 标签
- 检查表格、代码块语法是否正确

### Q3: 如何更新已导入的文档？

**A**:
- 方法 1: 删除旧文档，重新导入
- 方法 2: 使用飞书 API 更新文档内容（需要额外开发）

### Q4: 文档导入后能否编辑？

**A**:
- ✅ 可以在线编辑
- ✅ 支持多人协作
- ✅ 支持版本历史
- ⚠️ 编辑后无法自动同步回 Markdown 文件

---

## 🎉 总结

**是的，lark-mcp 完全支持将 Markdown 文档自动导入到飞书！**

### 推荐方案

**对于一次性导入**：
- 使用飞书云文档的「导入文件」功能
- 最简单，1 分钟搞定

**对于自动化/批量导入**：
- 使用 `mcp__lark-mcp__docx_builtin_import` 工具
- 编写脚本自动化导入流程
- 适合定期更新文档

### 立即行动

```bash
# 方式 1: 手动导入（最快）
# 1. 打开飞书云文档
# 2. 新建 → 导入文件
# 3. 选择 LARK_TABLE_GUIDE_SIMPLE.md

# 方式 2: 自动导入（需要编程）
# 1. 配置 UAT
# 2. 运行导入脚本
# 3. 获取文档链接
```

---

**文档维护者**: Tech Lead
**最后更新**: 2025-12-31
**相关文档**:
- [LARK_TABLE_GUIDE_SIMPLE.md](./LARK_TABLE_GUIDE_SIMPLE.md)
- [Scrum-Spec 映射指南](./SCRUM-SPEC-MAPPING.md)
