---
name: e2e-test-executor
description: 端到端验证执行器。自动化执行联调验证步骤，支持后端API验证和前端UI验证，生成详细的验收报告。适用于前后端联调、功能验收、回归测试。触发词：联调验证、自动验证、执行验证步骤、验收测试、e2e测试、端到端测试、自动化测试、验证报告。
version: 1.0.0
---

# 端到端验证执行器 (E2E Test Executor)

自动化执行联调验证步骤文档，支持后端 API 验证和前端 UI 验证，生成详细的验收报告。

## 命令入口

| 命令 | 说明 |
|------|------|
| `/e2e` | 显示帮助和可用命令 |
| `/e2e run <验证文档路径>` | 执行指定验证文档中的所有步骤 |
| `/e2e run --api-only` | 只执行 API 验证步骤 |
| `/e2e run --ui-only` | 只执行 UI 验证步骤 |
| `/e2e report` | 查看最近一次验证报告 |
| `/e2e generate <spec路径>` | 根据 spec 生成验证步骤文档 |

## 意图识别关键词

| 功能 | 触发词 |
|------|--------|
| 执行验证 | 联调验证、执行验证、自动验证、跑验证、run e2e |
| 生成报告 | 验证报告、验收报告、测试报告 |
| 生成验证文档 | 生成验证步骤、创建验证文档 |

## 核心能力

### 1. 解析验证步骤文档

自动解析 Markdown 格式的验证步骤文档，识别：
- 前置准备条件
- API 测试命令（curl 命令）
- 预期结果（JSON 格式）
- 验收标准（checkbox 列表）
- UI 操作步骤

**支持的文档格式**：
```markdown
### 步骤 1: 验证分类列表 API（后端）

**测试命令**：
\`\`\`bash
curl http://localhost:8080/api/client/menu-categories
\`\`\`

**预期结果**：
\`\`\`json
{
  "success": true,
  "data": [...]
}
\`\`\`

**验收标准**：
- [ ] 返回状态码 200
- [ ] `success` 字段为 `true`
- [ ] `data` 数组不为空
```

### 2. 自动化 API 验证

执行验证文档中的 curl 命令，自动验证：

| 验证项 | 说明 |
|--------|------|
| HTTP 状态码 | 验证响应状态码是否符合预期 |
| 响应结构 | 验证 JSON 结构是否包含必需字段 |
| 字段值 | 验证特定字段值是否符合预期 |
| 数组非空 | 验证数组字段是否有数据 |
| 排序验证 | 验证数据是否按指定字段排序 |

**执行示例**：
```
🔍 执行 API 验证: 分类列表 API

请求: GET http://localhost:8080/api/client/menu-categories
状态: ✅ 200 OK

验收标准检查:
  ✅ 返回状态码 200
  ✅ success 字段为 true
  ✅ data 数组不为空 (共 5 条记录)
  ✅ 每个分类包含必需字段: id, code, displayName, sortOrder, isVisible
  ✅ 分类按 sortOrder 升序排列
  ⚠️ 只返回 isVisible: true 的分类 (发现 1 条 isVisible: false)

结果: 5/6 通过
```

### 3. 自动化 UI 验证

使用 Playwright 执行前端 UI 验证：

| 验证项 | 说明 |
|--------|------|
| 元素存在 | 验证页面元素是否存在 |
| 文本内容 | 验证元素文本是否正确 |
| 样式状态 | 验证元素高亮、选中状态 |
| 交互功能 | 模拟点击、输入等操作 |
| 数据展示 | 验证列表数据是否正确显示 |

**执行示例**：
```
🖥️ 执行 UI 验证: 小程序前端集成

启动服务:
  ✅ 后端服务 (端口 8080) - 就绪
  ✅ 前端服务 (端口 10086) - 就绪

验证步骤:
  📸 截图: 01-initial-load.png

  ✅ 页面顶部显示分类标签栏
  ✅ 分类标签包含"全部"选项
  ✅ 默认选中"全部"分类
  📸 截图: 02-category-tabs.png

  ✅ 商品以卡片形式展示
  ✅ 商品卡片显示图片、名称、价格
  ✅ 价格格式化正确 (2800 → ¥28.00)
  📸 截图: 03-product-cards.png

  ✅ 点击"精品咖啡"分类
  ✅ 列表只显示咖啡类商品 (过滤前: 10, 过滤后: 3)
  ✅ 选中的分类标签高亮显示
  📸 截图: 04-category-filter.png

结果: 11/11 通过
```

### 4. 生成验收报告

自动生成详细的验收报告：

```markdown
# O007 小程序菜单与商品API 验收报告

**执行时间**: 2026-01-05 14:30:00
**验证文档**: specs/O007-miniapp-menu-api/联调验证步骤.md
**执行耗时**: 45 秒

---

## 📊 验收概览

| 类别 | 通过 | 失败 | 跳过 | 通过率 |
|------|------|------|------|--------|
| API 验证 | 8 | 1 | 0 | 88.9% |
| UI 验证 | 11 | 0 | 2 | 100% |
| **总计** | **19** | **1** | **2** | **95.0%** |

---

## ✅ 通过的验证项

### API 验证
- [x] 分类列表 API 返回正确
- [x] 商品列表 API 返回正确
- [x] 分类筛选功能正常
...

### UI 验证
- [x] 分类菜单正确显示
- [x] 商品列表正确显示
...

---

## ❌ 失败的验证项

### 1. 只返回 isVisible: true 的分类

**位置**: API 验证 > 步骤 1
**预期**: 只返回 isVisible 为 true 的分类
**实际**: 返回了 1 条 isVisible: false 的记录

**响应数据**:
\`\`\`json
{
  "id": "xxx",
  "code": "HIDDEN",
  "displayName": "隐藏分类",
  "isVisible": false
}
\`\`\`

**建议**: 检查后端 MenuCategoryService 的查询条件

---

## 📸 截图证据

| 截图 | 说明 |
|------|------|
| ![初始加载](screenshots/01-initial-load.png) | 页面初始加载状态 |
| ![分类标签](screenshots/02-category-tabs.png) | 分类标签栏显示 |
| ![商品卡片](screenshots/03-product-cards.png) | 商品列表展示 |
| ![分类过滤](screenshots/04-category-filter.png) | 分类过滤功能 |

---

## 📝 验收结论

- [x] **部分通过** - 存在 1 个次要问题，不影响主流程

**签字确认**:
- 验证人: Claude Code
- 执行时间: 2026-01-05 14:30:00
```

### 5. 服务生命周期管理

自动管理后端和前端服务：

```python
# 使用 with_server.py 管理服务
python scripts/with_server.py \
  --server "cd backend && ./mvnw spring-boot:run" --port 8080 \
  --server "cd miniapp-ordering-taro && npm run dev:h5" --port 10086 \
  -- python verify_script.py
```

**健康检查**：
- 等待服务启动完成
- 验证端口可访问
- 检查关键接口响应

## 工作流程

### 执行验证的完整流程

```
1. 解析验证文档
   └── 提取前置条件、API 步骤、UI 步骤

2. 环境准备
   ├── 检查服务状态
   ├── 启动所需服务（如未运行）
   └── 等待服务就绪

3. 执行 API 验证
   ├── 逐个执行 curl 命令
   ├── 解析响应 JSON
   ├── 验证验收标准
   └── 记录结果

4. 执行 UI 验证
   ├── 启动 Playwright 浏览器
   ├── 执行操作步骤
   ├── 截取关键截图
   └── 验证 UI 状态

5. 生成报告
   ├── 汇总验证结果
   ├── 整理截图证据
   ├── 生成 Markdown 报告
   └── 输出到 reports/ 目录
```

## 配置

在项目根目录创建 `.e2e-config.json`：

```json
{
  "servers": {
    "backend": {
      "command": "cd backend && ./mvnw spring-boot:run",
      "port": 8080,
      "healthCheck": "/actuator/health",
      "startupTimeout": 60
    },
    "frontend": {
      "command": "cd miniapp-ordering-taro && npm run dev:h5",
      "port": 10086,
      "healthCheck": "/",
      "startupTimeout": 30
    }
  },
  "playwright": {
    "headless": true,
    "slowMo": 100,
    "screenshotDir": "reports/screenshots"
  },
  "report": {
    "outputDir": "reports/e2e",
    "format": ["markdown", "json"],
    "includeScreenshots": true
  }
}
```

## 验证脚本生成

从验证文档自动生成 Playwright 脚本：

**输入**（验证文档）：
```markdown
### 步骤 3: 验证小程序前端集成

**操作步骤**：
1. 打开小程序 H5 页面
2. 验证分类菜单显示
   - [ ] 页面顶部显示分类标签栏
   - [ ] 默认选中"全部"分类
```

**输出**（Playwright 脚本）：
```python
from playwright.sync_api import sync_playwright

def verify_miniapp_integration():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 步骤 1: 打开小程序 H5 页面
        page.goto('http://localhost:10086')
        page.wait_for_load_state('networkidle')
        page.screenshot(path='reports/screenshots/01-initial-load.png')

        # 步骤 2: 验证分类菜单显示
        # - 页面顶部显示分类标签栏
        category_tabs = page.locator('.category-tabs, [class*="category"]')
        assert category_tabs.count() > 0, "分类标签栏不存在"

        # - 默认选中"全部"分类
        all_tab = page.locator('text=全部').first
        assert 'active' in all_tab.get_attribute('class') or \
               all_tab.evaluate('el => getComputedStyle(el).fontWeight') == '700', \
               "全部分类未选中"

        page.screenshot(path='reports/screenshots/02-category-tabs.png')

        browser.close()
        return True

if __name__ == '__main__':
    verify_miniapp_integration()
```

## 使用示例

### 示例 1: 执行联调验证

```bash
# 执行完整验证
/e2e run specs/O007-miniapp-menu-api/联调验证步骤.md

# 只执行 API 验证
/e2e run specs/O007-miniapp-menu-api/联调验证步骤.md --api-only

# 只执行 UI 验证（服务已启动）
/e2e run specs/O007-miniapp-menu-api/联调验证步骤.md --ui-only --servers-running
```

### 示例 2: 根据 spec 生成验证文档

```bash
/e2e generate specs/O008-new-feature
# 输出: specs/O008-new-feature/联调验证步骤.md
```

### 示例 3: 查看验证报告

```bash
/e2e report
# 打开最近的验证报告

/e2e report --list
# 列出所有历史报告
```

## 执行指南

### 解析验证文档

```
1. 读取 Markdown 文件
2. 识别 ### 步骤 标题
3. 提取 **测试命令** 中的 curl
4. 提取 **预期结果** 中的 JSON
5. 提取 **验收标准** 中的 checkbox
6. 提取 **操作步骤** 中的 UI 验证项
```

### 执行 API 验证

```python
import subprocess
import json

def execute_api_test(curl_command, expected_result, criteria):
    # 执行 curl 命令
    result = subprocess.run(
        curl_command,
        shell=True,
        capture_output=True,
        text=True
    )

    # 解析响应
    response = json.loads(result.stdout)

    # 验证标准
    results = []
    for criterion in criteria:
        passed = verify_criterion(response, criterion)
        results.append({
            'criterion': criterion,
            'passed': passed
        })

    return results
```

### 执行 UI 验证

```python
from playwright.sync_api import sync_playwright

def execute_ui_test(steps, base_url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(base_url)
        page.wait_for_load_state('networkidle')

        results = []
        for step in steps:
            try:
                execute_step(page, step)
                results.append({'step': step, 'passed': True})
            except Exception as e:
                results.append({'step': step, 'passed': False, 'error': str(e)})

            # 截图
            page.screenshot(path=f'screenshots/{step.id}.png')

        browser.close()
        return results
```

## 依赖

- Python 3.8+
- Playwright (`pip install playwright && playwright install chromium`)
- requests（用于 API 验证）

## 输出目录结构

```
reports/
├── e2e/
│   ├── O007-miniapp-menu-api-2026-01-05-143000.md  # 验收报告
│   └── O007-miniapp-menu-api-2026-01-05-143000.json # JSON 格式报告
└── screenshots/
    ├── 01-initial-load.png
    ├── 02-category-tabs.png
    ├── 03-product-cards.png
    └── 04-category-filter.png
```

## 注意事项

1. **服务启动顺序**: 后端服务需先于前端启动
2. **等待时间**: 动态页面需等待 `networkidle` 状态
3. **测试数据**: 确保数据库有足够的测试数据
4. **截图命名**: 使用有意义的名称便于报告阅读
5. **错误处理**: 单个验证失败不影响后续执行

---

## 变更日志

### v1.0.0 (2026-01-05)

**初始版本**:
- 解析 Markdown 格式验证步骤文档
- 自动执行 API 验证（curl 命令）
- 自动执行 UI 验证（Playwright）
- 服务生命周期管理
- 生成 Markdown 验收报告
- 截图证据收集
