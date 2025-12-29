# Research Findings: E2E Scenario Author Skill

**Date**: 2025-12-29
**Feature**: T001-e2e-scenario-author
**Purpose**: Research technical approaches for implementing Claude Code skill to create, manage and validate E2E test scenarios

## 1. Claude Code Skill Structure Best Practices

### Decision: 采用扩展目录结构

**Rationale**:
- skill.md 作为主入口点,定义 skill 行为和对话流程
- references/ 存放参考文档,便于 skill 引用和用户查阅
- assets/templates/ 存放 YAML 模板,支持模板填充模式
- scripts/ 存放 Python 脚本,实现复杂逻辑(解析、验证、生成)

**Structure**:
```
.claude/skills/scenario-author/
├── skill.md                      # 主文档
├── references/
│   ├── e2e-scenario-spec.md     # 格式规范
│   └── usage-guide.md           # 使用指南
├── assets/templates/
│   ├── base-scenario.yaml       # 基础模板
│   └── scenario-schema.json     # JSON Schema
└── scripts/
    ├── parse_spec.py
    ├── generate_scenario.py
    ├── validate_scenario.py
    └── list_scenarios.py
```

**Alternatives Considered**:
- 单文件 skill.md: 过于庞大,不便维护
- 纯脚本驱动: 缺少对话引导,用户体验差

**Best Practices**:
1. skill.md 使用清晰的 Markdown 结构定义命令和工作流
2. 通过 references/ 提供详细文档,避免 skill.md 过长
3. 使用 `@spec T001` 标识所有文件归属
4. 脚本输出 JSON 格式,便于 skill 解析和展示

---

## 2. YAML Processing in Python

### Decision: 使用 PyYAML + JSON Schema 验证

**Technology Choice**:
- **PyYAML**: 解析和生成 YAML 文件
- **jsonschema**: 使用 JSON Schema 验证 YAML 结构
- **pathlib**: 文件路径处理

**Rationale**:
- PyYAML 是 Python 标准 YAML 库,成熟稳定
- JSON Schema 提供强大的结构验证能力
- pathlib 跨平台兼容性好,代码简洁

**Implementation Approach**:

```python
import yaml
from pathlib import Path
from jsonschema import validate, ValidationError

def parse_yaml_scenario(file_path: Path) -> dict:
    """安全解析 YAML 场景文件"""
    with file_path.open('r', encoding='utf-8') as f:
        # 使用 safe_load 防止代码注入
        return yaml.safe_load(f)

def generate_yaml_scenario(data: dict, output_path: Path) -> None:
    """生成 YAML 场景文件"""
    with output_path.open('w', encoding='utf-8') as f:
        yaml.dump(data, f,
                  allow_unicode=True,  # 支持中文
                  default_flow_style=False,  # 使用块状格式
                  sort_keys=False)  # 保持字段顺序

def validate_scenario(scenario: dict, schema_path: Path) -> tuple[bool, str]:
    """使用 JSON Schema 验证场景"""
    with schema_path.open('r') as f:
        schema = json.load(f)

    try:
        validate(instance=scenario, schema=schema)
        return True, ""
    except ValidationError as e:
        return False, str(e)
```

**Security Considerations**:
- 始终使用 `yaml.safe_load()` 而非 `yaml.load()`
- 验证文件路径防止路径遍历攻击
- 限制 YAML 文件大小(< 1MB)

**Performance**:
- PyYAML 处理单个文件 < 10ms
- 批量处理 100 个文件 < 1 秒
- 使用生成器遍历大量文件避免内存占用

**Alternatives Considered**:
- ruamel.yaml: 功能更强大但依赖复杂,对此项目过度设计
- pyyaml-include: 支持 YAML 引用,但增加复杂度且不需要

---

## 3. Markdown Parsing for spec.md

### Decision: 使用正则表达式 + 手动解析

**Rationale**:
- spec.md 格式标准化,使用简单的模式匹配即可
- 避免引入重型 Markdown 解析库
- 更灵活地处理中英文混合内容

**Implementation Approach**:

```python
import re
from pathlib import Path
from typing import List, Dict

def parse_user_stories(spec_content: str) -> List[Dict]:
    """提取用户故事和验收场景"""
    user_stories = []

    # 匹配用户故事标题
    story_pattern = r'### 用户故事 \d+ - (.+?) \(优先级: (P\d+)\)'

    # 匹配验收场景 (Given-When-Then 格式)
    scenario_pattern = r'\d+\. \*\*假设\*\* (.+?),\*\*当\*\* (.+?),\*\*那么\*\* (.+?)(?=\n\d+\.|\n---|\n##|$)'

    stories = re.finditer(story_pattern, spec_content)
    for story in stories:
        title = story.group(1).strip()
        priority = story.group(2)

        # 提取该用户故事后的验收场景
        story_start = story.end()
        next_story = spec_content.find('### 用户故事', story_start)
        story_section = spec_content[story_start:next_story if next_story != -1 else None]

        scenarios = []
        for match in re.finditer(scenario_pattern, story_section, re.DOTALL):
            scenarios.append({
                'given': match.group(1).strip(),
                'when': match.group(2).strip(),
                'then': match.group(3).strip()
            })

        user_stories.append({
            'title': title,
            'priority': priority,
            'scenarios': scenarios
        })

    return user_stories

def extract_spec_id(spec_path: Path) -> str:
    """从规格路径提取 specId"""
    # 从路径如 specs/P005-bom-inventory/spec.md 提取 P005
    return spec_path.parent.name.split('-')[0]
```

**Pattern Recognition**:
- 用户故事标题: `### 用户故事 \d+ - <title> (优先级: P\d+)`
- 验收场景 (中文): `假设...当...那么...`
- 验收场景 (英文): `Given...When...Then...`

**Edge Cases**:
- 多行验收场景(处理换行符)
- 嵌套列表(使用 re.DOTALL 标志)
- 不完整的 GWT 格式(添加 TODO 注释)

**Alternatives Considered**:
- markdown-it-py: 功能强大但解析结果需要二次处理
- mistune: 快速但不支持自定义解析规则
- 手动逐行解析: 代码更长但更精确

---

## 4. File System Operations

### Decision: 使用 pathlib + 严格路径验证

**Implementation Approach**:

```python
from pathlib import Path
from typing import List

# 项目根目录和场景目录
REPO_ROOT = Path.cwd()
SCENARIOS_DIR = REPO_ROOT / 'scenarios'

def ensure_scenarios_dir(module: str) -> Path:
    """确保场景模块目录存在"""
    module_dir = SCENARIOS_DIR / module
    module_dir.mkdir(parents=True, exist_ok=True)
    return module_dir

def list_scenarios(module: str = None, spec_ref: str = None) -> List[Path]:
    """列出场景文件,支持按模块和 spec_ref 筛选"""
    if module:
        search_dir = SCENARIOS_DIR / module
        if not search_dir.exists():
            return []
        pattern = '*.yaml'
    else:
        search_dir = SCENARIOS_DIR
        pattern = '**/*.yaml'

    scenarios = list(search_dir.glob(pattern))

    # 如果指定 spec_ref,过滤场景
    if spec_ref:
        filtered = []
        for scenario_path in scenarios:
            scenario = parse_yaml_scenario(scenario_path)
            if scenario.get('spec_ref') == spec_ref:
                filtered.append(scenario_path)
        return filtered

    return scenarios

def validate_scenario_id(scenario_id: str) -> bool:
    """验证 scenario_id 格式"""
    pattern = r'^E2E-[A-Z]+-\d{3}$'
    return re.match(pattern, scenario_id) is not None

def check_id_conflict(scenario_id: str) -> bool:
    """检查 scenario_id 是否冲突"""
    all_scenarios = list(SCENARIOS_DIR.glob('**/*.yaml'))
    for scenario_path in all_scenarios:
        if scenario_path.stem == scenario_id:
            return True
    return False

def get_next_scenario_id(module: str) -> str:
    """生成下一个可用的 scenario_id"""
    module_upper = module.upper()
    existing = list(SCENARIOS_DIR.glob(f'**/{module_upper}*.yaml'))

    if not existing:
        return f'E2E-{module_upper}-001'

    # 提取编号并找到最大值
    numbers = []
    for path in existing:
        match = re.search(r'E2E-' + module_upper + r'-(\d{3})', path.stem)
        if match:
            numbers.append(int(match.group(1)))

    next_num = max(numbers) + 1 if numbers else 1
    return f'E2E-{module_upper}-{next_num:03d}'
```

**Security**:
- 验证路径在 scenarios/ 目录内,防止路径遍历
- 使用 Path.resolve() 规范化路径
- 检查文件扩展名,仅处理 .yaml 文件

**Cross-Platform**:
- pathlib 自动处理 Windows/Unix 路径分隔符
- 使用 UTF-8 编码读写文件
- 避免硬编码路径字符串

**Performance**:
- 使用 glob() 而非 os.walk() 提高性能
- 对大量文件使用生成器 (iglob) 而非列表
- 缓存常用查询结果(如模块列表)

---

## 5. Claude Code Skill Execution Model

### Decision: Markdown 驱动 + Python 脚本辅助

**Skill.md Structure**:

```markdown
# E2E Scenario Author Skill

Use this skill to create, manage and validate E2E test scenarios in YAML format.

## Commands

### `/scenario-author create`
Create a new E2E scenario through guided dialogue.

**Workflow**:
1. Ask user for scenario requirements (功能描述、模块)
2. Extract scenario_id, spec_ref, title from dialogue
3. Guide user to define tags (module, channel, deploy)
4. Collect steps (actions) and assertions
5. Generate YAML file using `scripts/generate_scenario.py`
6. Save to `scenarios/<module>/<scenario_id>.yaml`

### `/scenario-author generate --spec <specId>`
Batch generate scenarios from spec.md file.

**Workflow**:
1. Locate spec file: `specs/<specId>-*/spec.md`
2. Parse user stories using `scripts/parse_spec.py`
3. For each acceptance scenario, generate YAML
4. Save scenarios to `scenarios/<module>/`
5. Output summary report

### `/scenario-author validate <scenario-id>`
Validate scenario against E2EScenarioSpec rules.

**Workflow**:
1. Load scenario YAML file
2. Run `scripts/validate_scenario.py`
3. Check: required fields, YAML syntax, decoupling principles
4. Display validation results and suggestions

### `/scenario-author list [--tags <tags>] [--spec-ref <specId>]`
List scenarios with optional filtering.

**Workflow**:
1. Run `scripts/list_scenarios.py` with filters
2. Display formatted table with ID, title, tags, spec_ref
```

**Script Invocation Pattern**:
```markdown
Execute the following Python script:

```bash
python3 .claude/skills/scenario-author/scripts/generate_scenario.py \
  --spec-id "P005" \
  --output-dir "scenarios/inventory"
```

Parse the JSON output and present to user.
```

**Multi-Turn Dialogue**:
- skill.md 定义对话流程和问题顺序
- 使用条件分支处理用户选择
- 保持对话上下文(记住之前的回答)

**Output Formatting**:
- 脚本输出 JSON 格式便于解析
- skill.md 将 JSON 转换为 Markdown 表格展示
- 使用代码块展示生成的 YAML 内容

**Best Practices**:
1. skill.md 专注于对话流程,逻辑委托给脚本
2. 脚本输出详细错误信息便于调试
3. 使用 `--dry-run` 模式预览而不实际写文件
4. 提供 `--verbose` 选项显示详细日志

---

## 6. Implementation Recommendations

### Primary Technology Stack

| Component | Technology | Justification |
|-----------|-----------|---------------|
| Skill Definition | Markdown (skill.md) | Claude Code 原生支持,简洁易维护 |
| YAML Processing | PyYAML 6.0+ | 成熟稳定,安全的 safe_load |
| Schema Validation | jsonschema 4.17+ | 强大的 JSON Schema 支持 |
| spec.md Parsing | Python re 模块 | 轻量级,适合标准化格式 |
| File Operations | pathlib | 跨平台,Pythonic API |
| Script Language | Python 3.8+ | 丰富的库生态,易读易维护 |

### Implementation Approach

**Phase 1: 核心功能**
1. 实现基础 YAML 模板(base-scenario.yaml)
2. 编写 validate_scenario.py 验证脚本
3. 创建 skill.md 基础对话流程(create/template 命令)

**Phase 2: 自动生成**
4. 实现 parse_spec.py 解析 spec.md
5. 实现 generate_scenario.py 批量生成
6. 添加 generate 命令到 skill.md

**Phase 3: 查询管理**
7. 实现 list_scenarios.py 列表和筛选
8. 添加 list/edit/delete 命令
9. 完善错误处理和边缘情况

### Common Pitfalls to Avoid

1. **硬编码路径**: 使用相对路径和环境变量,支持不同项目结构
2. **忽略中文处理**: 确保 UTF-8 编码,测试中英文混合场景
3. **过度复杂脚本**: 保持脚本简单,单一职责,便于测试和维护
4. **缺少错误处理**: 优雅处理文件不存在、YAML 格式错误等异常
5. **忽略性能**: 对大量文件使用生成器和缓存优化

### Performance Optimization

1. **延迟加载**: 仅在需要时加载 YAML 文件,避免一次性读取所有场景
2. **索引缓存**: 维护场景 ID 到文件路径的映射缓存
3. **并行处理**: 批量生成时使用 multiprocessing 并行化
4. **增量验证**: 仅验证修改的场景,而非全量

### Testing Strategy

1. **单元测试**: pytest 测试每个 Python 函数
2. **集成测试**: 测试完整工作流(create → validate → list)
3. **示例场景**: 提供多个示例 YAML 用于手动测试
4. **边缘用例**: 测试空场景、超大场景、非法字符等

---

## Conclusion

采用 **Markdown skill + Python 脚本** 混合架构,skill.md 负责对话流程和用户交互,Python 脚本负责复杂逻辑处理(解析、生成、验证)。使用成熟的 PyYAML + jsonschema 技术栈,确保安全性和性能。重点关注中文支持、跨平台兼容性和错误处理,提供清晰的用户反馈。

**准备进入 Phase 1: Design & Contracts**
