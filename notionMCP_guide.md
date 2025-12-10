# Notion MCP 功能指南

> **版本**: 1.0
> **更新时间**: 2025-12-09
> **适用对象**: 开发者、项目经理、内容创作者

## 📖 目录

- [概述](#概述)
- [核心功能](#核心功能)
- [页面管理](#页面管理)
- [数据库操作](#数据库操作)
- [搜索功能](#搜索功能)
- [用户与团队管理](#用户与团队管理)
- [高级功能](#高级功能)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)
- [代码示例](#代码示例)

## 📋 概述

Notion MCP (Model Context Protocol) 是一个强大的工具，允许您通过 Claude AI 与 Notion 工作空间进行交互。它提供了完整的 Notion API 功能，让您能够自动化工作流程、管理内容和协作。

### 🔧 核心能力
- 📄 **页面管理**: 创建、读取、更新、删除页面
- 🗄️ **数据库操作**: 管理数据库、记录和视图
- 🔍 **智能搜索**: 全文搜索和语义检索
- 👥 **用户管理**: 团队协作和权限管理
- 💬 **协作功能**: 评论和互动

---

## 🚀 核心功能

### 1. 页面管理 (Page Management)

#### 创建页面
```markdown
功能: 创建新页面或子页面
用途: 建立文档结构、任务记录、知识库
```

#### 读取页面
```markdown
功能: 获取页面内容和属性
用途: 信息检索、内容分析、数据提取
```

#### 更新页面
```markdown
功能: 修改页面内容和属性
用途: 状态更新、内容编辑、进度跟踪
```

#### 移动页面
```markdown
功能: 重新组织页面层级结构
用途: 文档整理、项目重构
```

### 2. 数据库操作 (Database Operations)

#### 数据库管理
- **创建数据库**: 建立结构化数据存储
- **更新数据库**: 修改字段、视图和配置
- **查询记录**: 检索和过滤数据

#### 记录管理
- **添加记录**: 在数据库中创建新条目
- **编辑记录**: 更新现有记录的属性
- **删除记录**: 移除不需要的条目

#### 高级功能
- **关系字段**: 管理数据库之间的关联
- **公式计算**: 自动计算字段值
- **视图配置**: 自定义数据展示方式

---

## 📄 页面管理详解

### 创建页面 (Create Pages)

#### 基础页面创建
```javascript
// 创建独立页面
{
  "parent": null,
  "pages": [{
    "properties": {"title": "页面标题"},
    "content": "# 页面内容\n\n这里是详细描述..."
  }]
}
```

#### 在数据库中创建记录
```javascript
// 在特定数据库中创建页面
{
  "parent": {"data_source_id": "数据库ID"},
  "pages": [{
    "properties": {
      "名称": "记录标题",
      "状态": "进行中",
      "优先级": "高",
      "截止日期": "2025-12-31"
    }
  }]
}
```

#### 复杂内容页面
```javascript
// 创建包含丰富内容的页面
{
  "pages": [{
    "properties": {"title": "项目计划"},
    "content": `
# 项目名称

## 📋 概述
项目描述和目标

## 🎯 里程碑
- [x] 需求分析
- [ ] 设计阶段
- [ ] 开发实现
- [ ] 测试部署

## 👥 团队分工
| 姓名 | 角色 | 职责 |
|------|------|------|
| 张三 | 前端 | UI/UX开发 |
| 李四 | 后端 | API开发 |
    `
  }]
}
```

### 更新页面 (Update Pages)

#### 更新属性
```javascript
// 更新页面属性
{
  "command": "update_properties",
  "properties": {
    "状态": "已完成",
    "优先级": "低",
    "完成日期": "2025-12-09"
  }
}
```

#### 替换内容
```javascript
// 完全替换页面内容
{
  "command": "replace_content",
  "new_str": "# 更新后的标题\n\n全新的页面内容"
}
```

#### 部分内容更新
```javascript
// 替换特定内容片段
{
  "command": "replace_content_range",
  "selection_with_ellipsis": "旧内容开始...旧内容结束",
  "new_str": "新的替换内容"
}
```

#### 插入内容
```javascript
// 在指定位置插入内容
{
  "command": "insert_content_after",
  "selection_with_ellipsis": "## 标题...",
  "new_str": "\n### 新增章节\n新章节内容"
}
```

---

## 🗄️ 数据库操作详解

### 创建数据库 (Create Database)

#### 简单数据库
```javascript
// 基础任务管理数据库
{
  "properties": {
    "任务名称": {"type": "title"},
    "状态": {
      "type": "select",
      "select": {
        "options": [
          {"name": "待办", "color": "gray"},
          {"name": "进行中", "color": "blue"},
          {"name": "已完成", "color": "green"}
        ]
      }
    },
    "优先级": {
      "type": "select",
      "select": {
        "options": [
          {"name": "高", "color": "red"},
          {"name": "中", "color": "yellow"},
          {"name": "低", "color": "gray"}
        ]
      }
    },
    "截止日期": {"type": "date"},
    "负责人": {"type": "people"}
  }
}
```

#### 高级数据库
```javascript
// 项目管理数据库（包含关系和公式）
{
  "properties": {
    "项目名称": {"type": "title"},
    "项目经理": {"type": "people"},
    "开始日期": {"type": "date"},
    "结束日期": {"type": "date"},
    "预算": {
      "type": "number",
      "number": {"format": "dollar"}
    },
    "状态": {
      "type": "status",
      "status": {
        "options": [
          {"name": "计划中", "color": "gray"},
          {"name": "进行中", "color": "blue"},
          {"name": "已完成", "color": "green"}
        ]
      }
    },
    "关联任务": {
      "type": "relation",
      "relation": {
        "data_source_id": "任务数据库ID",
        "type": "single_property"
      }
    },
    "进度": {
      "type": "formula",
      "formula": {
        "expression": "prop(\"关联任务\") / prop(\"总任务数\") * 100"
      }
    }
  }
}
```

### 数据库查询与过滤

#### 搜索特定记录
```javascript
// 在数据库中搜索
{
  "query": "特定关键词",
  "data_source_url": "collection://数据库ID",
  "filters": {
    "created_date_range": {
      "start_date": "2025-12-01",
      "end_date": "2025-12-31"
    }
  }
}
```

#### 按属性过滤
```javascript
// 按状态和负责人过滤
{
  "query": "任务",
  "filters": {
    "created_by_user_ids": ["用户ID"],
    "created_date_range": {
      "start_date": "2025-12-01"
    }
  }
}
```

---

## 🔍 搜索功能详解

### 全工作空间搜索

#### 基础搜索
```javascript
// 搜索所有内容
{
  "query": "项目计划",
  "query_type": "internal"
}
```

#### 高级搜索
```javascript
// 带日期范围的搜索
{
  "query": "重要文档",
  "query_type": "internal",
  "filters": {
    "created_date_range": {
      "start_date": "2025-11-01",
      "end_date": "2025-12-31"
    },
    "created_by_user_ids": ["用户ID1", "用户ID2"]
  }
}
```

### 数据库内搜索
```javascript
// 在特定数据库中搜索
{
  "query": "开发任务",
  "data_source_url": "collection://数据库ID",
  "filters": {
    "created_date_range": {
      "start_date": "2025-12-01"
    }
  }
}
```

### 用户搜索
```javascript
// 搜索团队成员
{
  "query": "张三",
  "query_type": "user"
}
```

---

## 👥 用户与团队管理

### 用户管理功能

#### 获取用户信息
```javascript
// 获取当前用户信息
notion-get-self

// 获取特定用户信息
{
  "path": {
    "user_id": "用户ID"
  }
}
```

#### 列出工作空间用户
```javascript
// 获取所有用户列表
{
  "query": "",
  "page_size": 100,
  "start_cursor": ""
}
```

#### 搜索特定用户
```javascript
// 按姓名或邮箱搜索用户
{
  "query": "zhang@example.com",
  "page_size": 20
}
```

### 团队空间管理

#### 获取团队列表
```javascript
// 获取所有团队空间
{
  "query": "团队名称"
}
```

---

## 🚀 高级功能

### 批量操作

#### 批量创建页面
```javascript
// 一次创建多个页面
{
  "parent": {"data_source_id": "数据库ID"},
  "pages": [
    {
      "properties": {"title": "任务1", "状态": "待办"},
      "content": "任务1的详细描述"
    },
    {
      "properties": {"title": "任务2", "状态": "进行中"},
      "content": "任务2的详细描述"
    },
    {
      "properties": {"title": "任务3", "状态": "待办"},
      "content": "任务3的详细描述"
    }
  ]
}
```

#### 批量移动页面
```javascript
// 重新组织多个页面
{
  "page_or_database_ids": [
    "页面ID1",
    "页面ID2",
    "页面ID3"
  ],
  "new_parent": {
    "page_id": "目标父页面ID"
  }
}
```

### 内容格式化

#### Notion Markdown 语法
```markdown
# 一级标题
## 二级标题
### 三级标题

**粗体文本**
*斜体文本*
~~删除线~~
`行内代码`

- 无序列表项
1. 有序列表项

> 引用文本
> 可以包含多行

[链接文本](URL)

| 表格 | 列1 | 列2 |
|------|-----|-----|
| 行1  | 数据1 | 数据2 |

- [ ] 待办事项
- [x] 已完成任务

▶ 折叠内容
  折叠内容的详细说明

$$
数学公式
$$

```代码块
function example() {
  return "Hello Notion MCP";
}
```
```

#### 高级内容块
```markdown
// 调用块
<callout icon="💡" color="gray_bg">
  **提示**: 这是一个提示信息
</callout>

// 分栏布局
<columns>
  <column>
    左侧内容
  </column>
  <column>
    右侧内容
  </column>
</columns>

// 数据库视图
<database inline="true" data-source-url="collection://数据库ID">
  数据库标题
</database>

// 子页面
<page url="页面URL">子页面标题</page>

// 日期提及
<mention-date start="2025-12-09"/>

// 用户提及
<mention-user url="user://用户ID">用户名</mention-user>
```

### 自动化工作流

#### 任务状态自动更新
```javascript
// 基于日期更新任务状态
function updateTaskStatus() {
  // 获取所有进行中的任务
  const tasks = searchTasks({
    status: "进行中",
    deadline_before: new Date()
  });

  // 将过期任务标记为需要关注
  tasks.forEach(task => {
    updatePage(task.id, {
      "状态": "需要关注",
      "备注": "任务已过期，请及时处理"
    });
  });
}
```

#### 项目进度追踪
```javascript
// 自动计算项目完成度
function calculateProjectProgress(projectId) {
  const project = getPage(projectId);
  const tasks = getRelatedTasks(projectId);

  const completedTasks = tasks.filter(task =>
    task.properties.status === "已完成"
  ).length;

  const progress = (completedTasks / tasks.length) * 100;

  updatePage(projectId, {
    "完成度": progress,
    "更新时间": new Date().toISOString()
  });
}
```

---

## 💡 最佳实践

### 1. 项目管理最佳实践

#### 任务管理结构
```markdown
项目主页面
├── 项目概述和目标
├── 里程碑和时间线
├── 团队成员和职责
├── 任务数据库
│   ├── 待办事项 (Backlog)
│   ├── 当前冲刺 (Sprint)
│   ├── 进行中 (In Progress)
│   ├── 测试中 (QA)
│   └── 已完成 (Done)
├── 会议记录
├── 决策文档
└── 项目总结
```

#### 状态流转设计
```javascript
// 推荐的任务状态流转
const taskWorkflow = {
  states: [
    "Backlog",      // 积压任务
    "Next Sprint",  // 下个冲刺
    "This Sprint",  // 当前冲刺
    "In Development", // 开发中
    "In QA",        // 测试中
    "Review",       // 代码审查
    "Done",         // 已完成
    "Blocked"       // 阻塞状态
  ],

  transitions: {
    "Backlog": ["Next Sprint"],
    "Next Sprint": ["This Sprint"],
    "This Sprint": ["In Development", "Blocked"],
    "In Development": ["In QA", "Review", "Blocked"],
    "In QA": ["In Development", "Review", "Done"],
    "Review": ["In Development", "Done"],
    "Blocked": ["In Development"],
    "Done": []
  }
};
```

### 2. 内容组织最佳实践

#### 知识库结构
```markdown
公司知识库
├── 📋 人力资源
│   ├── 入职指南
│   ├── 培训材料
│   ├── 绩效考核
│   └── 福利政策
├── 🛠️ 技术文档
│   ├── 开发指南
│   ├── API 文档
│   ├── 架构设计
│   └── 故障排查
├── 📊 产品管理
│   ├── 产品需求
│   ├── 用户研究
│   ├── 竞品分析
│   └── 数据报告
└── 🏢 行政管理
    ├── 办公流程
    ├── 资产管理
    ├── 采购指南
    └── 安全规范
```

#### 标签和分类系统
```javascript
// 标签分类体系
const tagSystem = {
  priority: {
    "P0 - 紧急": "red",
    "P1 - 高": "orange",
    "P2 - 中": "yellow",
    "P3 - 低": "gray"
  },

  category: {
    "开发": "blue",
    "设计": "purple",
    "测试": "green",
    "运营": "orange",
    "市场": "pink"
  },

  status: {
    "计划中": "gray",
    "进行中": "blue",
    "已完成": "green",
    "已暂停": "yellow",
    "已取消": "red"
  }
};
```

### 3. 数据库设计最佳实践

#### 字段命名规范
```javascript
// 推荐的字段命名
const fieldNaming = {
  // 使用清晰的中英文名称
  title: "标题",
  status: "状态",
  assignee: "负责人",
  due_date: "截止日期",
  created_time: "创建时间",
  updated_time: "更新时间",

  // 关系字段
  project: "所属项目",
  parent_task: "父任务",
  related_docs: "相关文档",

  // 计算字段
  progress: "完成进度",
  duration: "持续时长",
  priority_score: "优先级评分"
};
```

#### 数据验证规则
```javascript
// 数据完整性检查
function validateTaskData(taskData) {
  const required = ['title', 'status', 'assignee'];
  const missing = required.filter(field => !taskData[field]);

  if (missing.length > 0) {
    throw new Error(`缺少必填字段: ${missing.join(', ')}`);
  }

  // 验证日期格式
  if (taskData.due_date && !isValidDate(taskData.due_date)) {
    throw new Error('截止日期格式不正确');
  }

  // 验证状态值
  const validStatuses = ['待办', '进行中', '已完成', '已取消'];
  if (!validStatuses.includes(taskData.status)) {
    throw new Error('状态值不在允许范围内');
  }
}
```

---

## ❓ 常见问题

### Q1: 如何批量更新多个页面的状态？

**A**: 使用批量操作功能：
```javascript
const pagesToUpdate = ["页面ID1", "页面ID2", "页面ID3"];
pagesToUpdate.forEach(pageId => {
  updatePage(pageId, {
    "command": "update_properties",
    "properties": {"状态": "已完成"}
  });
});
```

### Q2: 如何创建跨数据库的关联关系？

**A**: 在数据库中添加关系字段：
```javascript
{
  "properties": {
    "关联项目": {
      "type": "relation",
      "relation": {
        "data_source_id": "项目数据库ID",
        "type": "single_property"
      }
    }
  }
}
```

### Q3: 如何导出数据库内容？

**A**:
1. 使用搜索功能获取所有记录
2. 将结果格式化为所需格式
3. 通过 API 或手动导出

### Q4: 如何设置页面访问权限？

**A**: 通过 Notion 的分享功能：
```javascript
// 获取分享链接
const shareUrl = getPageShareLink(pageId);

// 更新分享设置
updatePageShareSettings(pageId, {
  "public": true,
  "allow_comments": true,
  "allow_edit": false
});
```

### Q5: 如何处理大型数据库的性能问题？

**A**:
- 使用分页查询
- 添加适当的索引
- 使用视图过滤器减少数据量
- 考虑拆分为多个数据库

---

## 📚 代码示例

### 完整的项目管理自动化

```javascript
class ProjectManager {
  constructor(apiKey) {
    this.notion = new NotionAPI(apiKey);
  }

  // 创建新项目
  async createProject(projectData) {
    const projectPage = await this.notion.createPages({
      parent: { data_source_id: this.projectsDb },
      pages: [{
        properties: {
          "项目名称": projectData.name,
          "状态": "计划中",
          "项目经理": projectData.manager,
          "开始日期": projectData.startDate,
          "结束日期": projectData.endDate,
          "预算": projectData.budget
        },
        content: this.generateProjectTemplate(projectData)
      }]
    });

    // 创建相关任务数据库
    await this.createTaskDatabase(projectPage.id);

    return projectPage;
  }

  // 生成项目模板
  generateProjectTemplate(projectData) {
    return `
# ${projectData.name}

## 📋 项目概述
${projectData.description}

## 🎯 项目目标
${projectData.objectives.map(obj => `- ${obj}`).join('\n')}

## 📅 关键里程碑
- **项目启动**: ${projectData.startDate}
- **第一阶段完成**: ${projectData.milestones.phase1}
- **最终交付**: ${projectData.endDate}

## 👥 团队成员
${projectData.team.map(member =>
  `- **${member.name}**: ${member.role}`
).join('\n')}

## 📊 项目进度
- **当前状态**: 计划中
- **完成度**: 0%
- **更新时间**: ${new Date().toLocaleDateString()}

---
*最后更新: ${new Date().toISOString()}*
    `;
  }

  // 更新项目进度
  async updateProjectProgress(projectId) {
    const tasks = await this.notion.search({
      data_source_url: this.tasksDb,
      query: "",
      filters: {
        "关联项目": projectId
      }
    });

    const totalTasks = tasks.results.length;
    const completedTasks = tasks.results.filter(
      task => task.properties.Status === "已完成"
    ).length;

    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    await this.notion.updatePage({
      page_id: projectId,
      command: "update_properties",
      properties: {
        "完成度": progress,
        "已完成任务数": completedTasks,
        "总任务数": totalTasks
      }
    });

    return { progress, completedTasks, totalTasks };
  }
}

// 使用示例
const projectManager = new ProjectManager("your-api-key");

// 创建新项目
const newProject = await projectManager.createProject({
  name: "移动应用开发",
  description: "开发新的iOS和Android应用",
  objectives: [
    "完成MVP版本",
    "通过测试验证",
    "上线应用商店"
  ],
  manager: "张三",
  startDate: "2025-01-01",
  endDate: "2025-06-30",
  budget: 500000,
  team: [
    { name: "张三", role: "项目经理" },
    { name: "李四", role: "前端开发" },
    { name: "王五", role: "后端开发" }
  ],
  milestones: {
    phase1: "2025-03-01"
  }
});

// 定期更新进度
setInterval(async () => {
  await projectManager.updateProjectProgress(newProject.id);
}, 60000); // 每分钟更新一次
```

### 知识库内容管理

```javascript
class KnowledgeManager {
  constructor() {
    this.notion = new NotionAPI();
  }

  // 自动分类和标签
  async categorizeContent(pageId, content) {
    // 使用关键词分析自动分类
    const category = this.analyzeCategory(content);
    const tags = this.extractTags(content);

    await this.notion.updatePage({
      page_id: pageId,
      command: "update_properties",
      properties: {
        "分类": category,
        "标签": tags,
        "自动分类时间": new Date().toISOString()
      }
    });
  }

  // 内容分类逻辑
  analyzeCategory(content) {
    const categories = {
      "技术文档": ["API", "开发", "代码", "框架", "库"],
      "产品设计": ["UI", "UX", "设计", "原型", "用户"],
      "项目管理": ["进度", "里程碑", "任务", "团队"],
      "业务分析": ["需求", "用户", "市场", "竞品"]
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return category;
      }
    }

    return "其他";
  }

  // 标签提取
  extractTags(content) {
    const tagPatterns = {
      "重要": /重要|关键|核心/gi,
      "紧急": /紧急|立即|急需/gi,
      "文档": /文档|说明|指南/gi,
      "代码": /代码|编程|开发/gi,
      "设计": /设计|UI|UX|界面/gi
    };

    const tags = [];
    for (const [tag, pattern] of Object.entries(tagPatterns)) {
      if (pattern.test(content)) {
        tags.push(tag);
      }
    }

    return tags;
  }

  // 内容关联
  async findRelatedContent(pageId, content) {
    // 搜索相关内容
    const keywords = this.extractKeywords(content);
    const relatedPages = [];

    for (const keyword of keywords) {
      const results = await this.notion.search({
        query: keyword,
        query_type: "internal"
      });

      relatedPages.push(...results.results);
    }

    // 去重并排序
    const uniqueRelated = [...new Set(relatedPages.map(p => p.id))]
      .slice(0, 5); // 最多5个相关页面

    return uniqueRelated;
  }

  // 提取关键词
  extractKeywords(content) {
    // 简单的关键词提取逻辑
    const words = content.split(/\s+/)
      .filter(word => word.length > 2)
      .map(word => word.toLowerCase());

    // 统计词频并返回高频词
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }
}
```

---

## 📖 总结

Notion MCP 提供了强大的 Notion 自动化和管理能力，通过合理使用这些功能，您可以：

### ✅ 核心优势
- **自动化工作流程**: 减少手动操作，提高效率
- **结构化数据管理**: 通过数据库组织信息
- **智能搜索**: 快速定位需要的内容
- **团队协作**: 改善团队沟通和协作
- **内容组织**: 建立有序的知识体系

### 🎯 适用场景
- **项目管理**: 任务跟踪、进度管理
- **知识管理**: 文档组织、信息检索
- **团队协作**: 会议记录、决策跟踪
- **内容创作**: 写作管理、发布流程
- **个人效率**: 笔记管理、目标追踪

### 🚀 下一步
1. **开始使用**: 从简单的页面创建开始
2. **建立数据库**: 创建适合您需求的数据结构
3. **自动化流程**: 设置重复性任务的自动化
4. **团队推广**: 在团队中推广使用最佳实践

---

## 📞 支持与反馈

如果您在使用过程中遇到问题或有改进建议，请：

1. **查阅文档**: 查看 Notion 官方文档
2. **社区求助**: 在相关社区提问
3. **功能建议**: 提出新功能需求
4. **Bug 报告**: 报告使用中的问题

---

*本指南持续更新中，最新版本请查看项目仓库。*