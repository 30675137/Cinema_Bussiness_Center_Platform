# Research & Design Decisions: E2E测试脚本生成器

**Feature**: T002-e2e-test-generator
**Date**: 2025-12-30
**Phase**: Phase 0 - Research

## Research Topics

### 1. YAML Parsing Libraries

**Decision**: PyYAML 6.0+

**Rationale**:
- 成熟稳定，Python YAML 解析事实标准
- `yaml.safe_load()` 防止代码注入攻击
- 良好的错误提示，便于调试场景 YAML 文件
- 支持自定义 Loader 进行高级验证

**Alternatives Considered**:
- ruamel.yaml: 功能更强（保留注释、格式），但对于简单解析过于复杂
- pyyaml-include: 支持 YAML 文件包含，但场景文件不需要此特性

**Best Practices**:
```python
import yaml

# ✅ 安全加载
with open('scenario.yaml', 'r') as f:
    data = yaml.safe_load(f)

# ❌ 禁止使用 yaml.load() - 存在代码注入风险
```

---

### 2. Playwright Test Script Generation

**Decision**: Jinja2 模板引擎 + 预定义代码片段

**Rationale**:
- Jinja2 模板易于维护和修改，非技术人员也可理解
- 避免 AST 操作的复杂性（如 ts-morph, Babel）
- 模板文件可独立测试和版本控制
- 支持继承和宏，便于代码复用

**Playwright Test Structure**:
```typescript
// 生成的测试脚本结构
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { ProductPage } from './pages/ProductPage';
import { loadTestData } from '@/testdata/loader';

test.describe('{{ scenario.title }}', () => {
  let testData;

  test.beforeEach(async ({ page }) => {
    testData = await loadTestData('{{ scenario.preconditions.testdata_ref }}');
    await page.goto(testData.baseUrl);
  });

  test('{{ scenario.scenario_id }}', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const productPage = new ProductPage(page);

    // AUTO-GENERATED: Do not modify above this line
    {% for step in scenario.steps %}
    // Step: {{ step.description or step.action }}
    {{ generate_action_code(step) }}
    {% endfor %}

    // Assertions
    {% for assertion in scenario.assertions %}
    {{ generate_assertion_code(assertion) }}
    {% endfor %}

    // CUSTOM CODE START
    // Add your custom test logic here
    // CUSTOM CODE END
  });
});
```

**Action → Code Mapping Examples**:
```python
ACTION_MAPPINGS = {
    'login': 'await loginPage.login(testData.{{ params.testdata_ref }})',
    'navigate': 'await page.goto(testData.{{ params.testdata_ref }})',
    'click': 'await page.click(testData.{{ params.testdata_ref }})',
    'input': 'await page.fill(testData.{{ params.selector }}, testData.{{ params.value }})',
    'browse_product': 'await productPage.browseProduct(testData.{{ params.testdata_ref }})',
    'add_to_cart': 'await cartPage.addToCart(testData.{{ params.testdata_ref }}, {{ params.quantity }})',
    'checkout': 'await checkoutPage.proceed()',
    'create_order': 'await orderPage.createOrder(testData.{{ params.testdata_ref }})',
}
```

**Assertion → Code Mapping Examples**:
```python
ASSERTION_MAPPINGS = {
    'ui/element_visible': 'await expect(page.locator(testData.{{ params.selector }})).toBeVisible()',
    'ui/toast_message_shown': 'await expect(page.locator(\'.toast\')).toContainText(\'{{ params.message }}\')',
    'api/response_status_is': 'expect(response.status).toBe({{ params.expected }})',
    'api/database_field_equals': '// TODO: Implement database field check for {{ params.table }}.{{ params.field }}',
}
```

---

### 3. Postman Collection v2.1 Format

**Decision**: 使用 Python dict 构建 JSON 结构，P2 阶段实现

**Rationale**:
- Postman Collection v2.1 是标准化的 JSON Schema
- Python dict → JSON 转换简单直接
- 支持 Newman CLI 运行，便于 CI/CD 集成
- 环境变量管理（{{baseUrl}}, {{token}}）符合最佳实践

**Collection Structure**:
```json
{
  "info": {
    "name": "{{ scenario.title }}",
    "description": "Generated from {{ scenario.scenario_id }}",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "{{ step.description }}",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Response status is {{ assertion.params.expected }}', function () {",
              "  pm.response.to.have.status({{ assertion.params.expected }});",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "{{ http_method }}",
        "url": "{{baseUrl}}/{{ endpoint }}",
        "body": {
          "mode": "raw",
          "raw": "{{ request_body }}"
        }
      }
    }
  ],
  "variable": [
    { "key": "baseUrl", "value": "http://localhost:8080" }
  ]
}
```

---

### 4. REST Client .http Format

**Decision**: 文本模板生成 .http 文件，P2 阶段实现

**Rationale**:
- VS Code REST Client 插件广泛使用
- 简单的文本格式，易于阅读和版本控制
- 支持变量引用（@baseUrl, @token）
- 适合纯 API 测试场景

**HTTP File Structure**:
```http
### {{ scenario.title }}
# Generated from {{ scenario.scenario_id }}

@baseUrl = http://localhost:8080
@token = {{testData.authToken}}

### Step 1: Login
POST {{baseUrl}}/api/auth/login
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "username": "{{testData.user.username}}",
  "password": "{{testData.user.password}}"
}

### Expected: 200 OK
### Verify: response.body.success == true

### Step 2: Create Order
POST {{baseUrl}}/api/orders
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "items": {{testData.orderItems}}
}

### Expected: 201 Created
### Verify: response.body.data.orderId exists
```

---

### 5. Code Generation: Template-Based vs AST Manipulation

**Decision**: 模板引擎（Jinja2）优先

**Rationale**:
- **易于维护**: 模板文件可视化，团队成员易于理解和修改
- **快速迭代**: 修改模板无需深入了解 AST 结构
- **足够灵活**: 通过 Jinja2 宏和过滤器实现复杂逻辑
- **降低依赖**: 避免引入 TypeScript/JavaScript AST 解析库（如 ts-morph, @babel/parser）

**Alternatives Considered**:
- AST 操作（ts-morph, Babel）: 更精确但实现复杂度高，维护成本大
- 字符串拼接: 不可维护，易出错

**Template Example** (Jinja2):
```jinja2
{# playwright-test-template.ts.j2 #}
import { test, expect } from '@playwright/test';
{% for page_import in page_objects %}
import { {{ page_import }} } from './pages/{{ page_import }}';
{% endfor %}

test.describe('{{ scenario.title }}', () => {
  test.beforeEach(async ({ page }) => {
    const testData = await loadTestData('{{ scenario.preconditions.testdata_ref }}');
    await page.goto(testData.baseUrl);
  });

  test('{{ scenario.scenario_id }}', async ({ page }) => {
    {% for step in scenario.steps %}
    // {{ step.description or step.action }}
    {{ map_action_to_code(step) }}
    {% endfor %}

    // Assertions
    {% for assertion in scenario.assertions %}
    {{ map_assertion_to_code(assertion) }}
    {% endfor %}
  });
});
```

**Prettier Integration**:
```python
import subprocess

def format_typescript(code: str) -> str:
    """使用 Prettier 格式化生成的 TypeScript 代码"""
    result = subprocess.run(
        ['npx', 'prettier', '--parser', 'typescript'],
        input=code,
        capture_output=True,
        text=True
    )
    return result.stdout if result.returncode == 0 else code
```

---

### 6. File Update Detection & Smart Merge

**Decision**: 文件哈希 + 代码标记组合策略

**Rationale**:
- 文件哈希检测整体变更程度（SHA256）
- 代码标记划分自动生成和手动区域
- 大幅修改（≥30%）时拒绝覆盖，生成 .spec.new.ts 供对比
- 保护用户手动代码，避免数据丢失

**Implementation**:
```python
import hashlib

def calculate_file_hash(filepath: str) -> str:
    """计算文件 SHA256 哈希值"""
    with open(filepath, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()

def detect_modification_level(original_hash: str, current_hash: str, file_content: str) -> str:
    """检测文件修改程度"""
    if original_hash == current_hash:
        return 'none'  # 无修改

    # 检测是否有 CUSTOM CODE 标记
    has_custom_code = '// CUSTOM CODE START' in file_content

    # 计算变更行数比例（简化版，实际需用 diff算法）
    # TODO: 使用 difflib.unified_diff 计算精确变更比例

    if has_custom_code:
        return 'low'  # 有标记，认为是安全修改
    else:
        return 'high'  # 无标记且哈希不同，可能大幅修改

def update_test_script(scenario_id: str, new_content: str):
    """智能更新测试脚本"""
    filepath = f'scenarios/{module}/{scenario_id}.spec.ts'

    if not os.path.exists(filepath):
        # 文件不存在，直接写入
        write_file(filepath, new_content)
        return 'created'

    # 文件存在，检测修改程度
    original_hash = get_stored_hash(scenario_id)  # 从元数据读取原始哈希
    current_hash = calculate_file_hash(filepath)

    with open(filepath, 'r') as f:
        current_content = f.read()

    mod_level = detect_modification_level(original_hash, current_hash, current_content)

    if mod_level == 'none' or mod_level == 'low':
        # 安全更新：仅更新 AUTO-GENERATED 区域
        updated_content = merge_auto_generated_section(current_content, new_content)
        write_file(filepath, updated_content)
        return 'updated'
    else:
        # 大幅修改：生成新文件供手动合并
        new_filepath = filepath.replace('.spec.ts', '.spec.new.ts')
        write_file(new_filepath, new_content)
        return 'generated_new_file'
```

**Code Markers**:
```typescript
// AUTO-GENERATED: Do not modify above this line
// Code between these markers will be regenerated on updates

import { test, expect } from '@playwright/test';
// ... auto-generated imports ...

test.describe('...', () => {
  test.beforeEach(async ({ page }) => {
    // ... auto-generated setup ...
  });

  test('scenario', async ({ page }) => {
    // ... auto-generated steps ...

    // CUSTOM CODE START
    // Your manual code here - safe from regeneration
    // CUSTOM CODE END
  });
});
```

---

## Key Design Decisions Summary

| Decision | Rationale | Trade-offs |
|----------|-----------|-----------|
| Jinja2 模板引擎 | 易维护、快速迭代、可视化 | 不如 AST 精确，但对代码生成足够 |
| PyYAML safe_load | 防止代码注入，Python 标准 | 无 |
| 文件哈希 + 标记 | 平衡自动化和安全性 | 需维护哈希元数据 |
| P1: Playwright only | 快速交付核心功能 | P2 才支持 Postman/REST Client |
| action-mappings.yaml | 可扩展性，用户自定义 | 需验证配置文件格式 |
| TODO 注释 fallback | 优雅降级，避免生成失败 | 需 QA 手动补充未识别 action |

---

## Next Steps (Phase 1)

1. 创建 data-model.md - 定义所有数据结构和 Schema
2. 创建 quickstart.md - 提供快速上手指南和示例
3. 创建 contracts/action-mappings-schema.json - 定义配置文件 Schema
4. 创建 Jinja2 模板文件 - playwright-test-template.ts.j2
5. 实现核心生成逻辑 - scripts/generate_playwright.py
