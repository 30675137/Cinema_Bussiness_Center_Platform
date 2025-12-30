# 任务清单：E2E测试脚本生成器 (e2e-test-generator)

**输入**: 设计文档来自 `/specs/T002-e2e-test-generator/`
**前置条件**: plan.md, spec.md, research.md, data-model.md, contracts/

**测试**: 包含 pytest 单元测试（如 plan.md 所述，采用 TDD 方法，核心逻辑 100% 覆盖率）

**组织方式**: 任务按用户故事分组，以便每个故事可以独立实现和测试。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**: 可并行运行（不同文件，无依赖）
- **[Story]**: 任务所属的用户故事（如 US1、US2、US3）
- 描述中包含准确的文件路径

## 路径约定

这是一个 Claude Code Skill（Python CLI 工具）。所有路径都在 `.claude/skills/e2e-test-generator/` 下

---

## 阶段 1：初始化（共享基础设施）

**目的**: 项目初始化和 Skill 结构搭建

- [X] T001 创建 skill 目录结构 .claude/skills/e2e-test-generator/
- [X] T002 创建 skill.md 文档文件 .claude/skills/e2e-test-generator/skill.md
- [X] T003 [P] 创建 Python 虚拟环境和 requirements.txt，包含依赖（PyYAML 6.0+, Jinja2 3.0+, jsonschema, pytest）
- [X] T004 [P] 配置 pytest 设置文件 .claude/skills/e2e-test-generator/pytest.ini
- [X] T005 [P] 创建 .gitignore 文件用于 Python 构建产物（.pyc, __pycache__, .pytest_cache 等）

---

## 阶段 2：基础设施（阻塞性前置条件）

**目的**: 核心基础设施，**必须**在任何用户故事实现前完成

**⚠️ 关键**: 此阶段完成前，所有用户故事工作不能开始

- [X] T006 创建 YAML 解析模块 .claude/skills/e2e-test-generator/scripts/yaml_parser.py，使用 safe_load()
- [X] T007 [P] 创建 E2EScenarioSpec schema 验证器 .claude/skills/e2e-test-generator/scripts/schema_validator.py
- [X] T008 [P] 创建 action-mappings.yaml 配置模板 .claude/skills/e2e-test-generator/assets/templates/action-mappings.yaml，包含 10-15 个常用 actions
- [X] T009 [P] 创建 assertion-mappings.yaml 配置模板 .claude/skills/e2e-test-generator/assets/templates/assertion-mappings.yaml
- [X] T010 [P] 创建配置加载模块 .claude/skills/e2e-test-generator/scripts/config_loader.py，包含 jsonschema 验证
- [X] T011 创建 Jinja2 模板渲染器 .claude/skills/e2e-test-generator/scripts/template_renderer.py
- [X] T012 [P] 创建文件哈希工具 .claude/skills/e2e-test-generator/scripts/file_utils.py（SHA256 哈希）
- [X] T013 [P] 创建测试固件目录 .claude/skills/e2e-test-generator/tests/fixtures/sample_scenarios/
- [X] T014 [P] 创建示例场景 YAML 文件用于测试（E2E-INVENTORY-001.yaml, E2E-ORDER-001.yaml）

**检查点**: 基础设施就绪 - 用户故事实现现可并行开始

---

## 阶段 3：用户故事 1 - 将 E2E 场景 YAML 转换为测试脚本（Playwright） (优先级: P1) 🎯 MVP

**目标**: 将 T001 生成的场景 YAML 文件转换为可执行的 Playwright TypeScript 测试脚本

**独立测试**: 准备一个包含 login、navigate、create_order 步骤和 ui/api 断言的场景 YAML。调用 skill generate 命令。验证生成的 .spec.ts 文件包含正确的 test describe、beforeEach hook、test case 和断言。

### 用户故事 1 的测试

> **注意: 先编写这些测试，确保它们失败后再实现**

- [ ] T015 [P] [US1] YAML 解析逻辑单元测试 .claude/skills/e2e-test-generator/tests/test_yaml_parser.py
- [ ] T016 [P] [US1] Playwright 代码生成单元测试 .claude/skills/e2e-test-generator/tests/test_playwright_generator.py
- [ ] T017 [P] [US1] 端到端生成工作流集成测试 .claude/skills/e2e-test-generator/tests/test_integration_generate.py

### 用户故事 1 的实现

- [X] T018 [P] [US1] 创建 Playwright 测试模板 .claude/skills/e2e-test-generator/assets/templates/playwright-test-template.ts.j2
- [X] T019 [P] [US1] 创建常用 actions 的 action mapping 定义（login、navigate、click、input 等）在 action-mappings.yaml 中
- [X] T020 [P] [US1] 创建 assertion mapping 定义（element_visible、toast_message_shown、response_status_is 等）在 assertion-mappings.yaml 中
- [X] T021 [US1] 实现 Playwright 代码生成器 .claude/skills/e2e-test-generator/scripts/generate_playwright.py（依赖 T018, T019, T020）
- [X] T022 [US1] 实现步骤转换逻辑（action → Playwright 代码）在 generate_playwright.py 中
- [X] T023 [US1] 实现断言转换逻辑（assertion → expect() 代码）在 generate_playwright.py 中
- [X] T024 [US1] 添加 import 语句生成（页面对象和测试数据）
- [X] T025 [US1] 为所有生成的脚本添加 @spec T002-e2e-test-generator 归属标识
- [X] T026 [US1] 实现 `/e2e-test-generator generate <scenario-id>` CLI 命令处理器 .claude/skills/e2e-test-generator/scripts/cli.py

**检查点**: 此时用户故事 1 应完全可用 - 单个场景生成功能正常工作

---

## 阶段 4：用户故事 2 - 生成测试数据加载逻辑 (优先级: P1)

**目标**: 基于场景 YAML 中的 testdata_ref 引用自动生成测试数据加载逻辑

**独立测试**: 准备一个包含 `preconditions.testdata_ref: bomTestData.scenario_001` 的场景。验证生成的测试脚本包含 beforeEach hook，其中有 `await loadTestData('bomTestData.scenario_001')`。

### 用户故事 2 的测试

- [ ] T027 [P] [US2] testdata_ref 解析单元测试 .claude/skills/e2e-test-generator/tests/test_testdata_parser.py
- [ ] T028 [P] [US2] beforeEach hook 生成单元测试 .claude/skills/e2e-test-generator/tests/test_beforeeach_generation.py

### 用户故事 2 的实现

- [ ] T029 [P] [US2] 创建 testdata 引用解析器 .claude/skills/e2e-test-generator/scripts/testdata_parser.py
- [ ] T030 [US2] 在 generate_playwright.py 中实现 beforeEach hook 生成逻辑（依赖 T029）
- [ ] T031 [US2] 添加 testdata import 语句生成（如 `import { loadTestData } from '@/testdata/loader'`）
- [ ] T032 [US2] 为缺失的 testdata 引用添加 TODO 注释生成
- [ ] T033 [US2] 将 testdata 加载集成到 Playwright 测试模板中

**检查点**: 测试数据加载逻辑现可为所有场景自动生成

---

## 阶段 5：用户故事 3 - 批量生成测试脚本 (优先级: P2)

**目标**: 批量生成模块目录下所有场景的测试脚本

**独立测试**: 在 `scenarios/inventory/` 中准备 10 个场景 YAML 文件。调用 `/e2e-test-generator batch --module inventory`。验证生成了 10 个 .spec.ts 文件。

### 用户故事 3 的测试

- [ ] T034 [P] [US3] 目录扫描逻辑单元测试 .claude/skills/e2e-test-generator/tests/test_batch_scanner.py
- [ ] T035 [P] [US3] 批量报告生成单元测试 .claude/skills/e2e-test-generator/tests/test_batch_reporter.py

### 用户故事 3 的实现

- [ ] T036 [P] [US3] 创建批量处理器 .claude/skills/e2e-test-generator/scripts/batch_processor.py
- [ ] T037 [US3] 实现场景 YAML 文件目录扫描（依赖 T036）
- [ ] T038 [US3] 实现批量生成循环和错误处理
- [ ] T039 [US3] 实现批量报告生成器（成功数量、失败场景、输出路径）
- [ ] T040 [US3] 在 cli.py 中添加 `/e2e-test-generator batch --module <module>` CLI 命令处理器
- [ ] T041 [US3] 添加错误跳过逻辑（单个场景失败时继续处理）

**检查点**: 批量生成对整个模块有效

---

## 阶段 6：用户故事 4 - 生成页面对象模板 (优先级: P2)

**目标**: 当引用的页面对象不存在时自动生成页面对象类模板

**独立测试**: 准备一个使用 `LoginPage.login()` 和 `ProductPage.selectProduct()` 的场景。验证 skill 生成 `LoginPage.ts` 和 `ProductPage.ts` 模板，包含方法签名和 TODO 注释（如果文件不存在）。

### 用户故事 4 的测试

- [ ] T042 [P] [US4] 页面对象检测单元测试 .claude/skills/e2e-test-generator/tests/test_page_object_detector.py
- [ ] T043 [P] [US4] 页面对象模板生成单元测试 .claude/skills/e2e-test-generator/tests/test_page_object_generator.py

### 用户故事 4 的实现

- [ ] T044 [P] [US4] 创建页面对象模板 .claude/skills/e2e-test-generator/assets/templates/playwright-page-object-template.ts.j2
- [ ] T045 [P] [US4] 创建页面对象检测器 .claude/skills/e2e-test-generator/scripts/page_object_detector.py
- [ ] T046 [US4] 实现页面对象文件存在性检查（依赖 T045）
- [ ] T047 [US4] 实现页面对象模板生成逻辑 .claude/skills/e2e-test-generator/scripts/page_object_generator.py（依赖 T044）
- [ ] T048 [US4] 从 action mappings 中提取方法签名
- [ ] T049 [US4] 将页面对象生成集成到 generate_playwright.py 工作流中
- [ ] T050 [US4] 为生成的页面对象模板添加 @spec T002-e2e-test-generator 归属标识

**检查点**: 需要时页面对象模板可自动生成

---

## 阶段 7：用户故事 5 - 更新已存在的测试脚本 (优先级: P3)

**目标**: 智能更新现有测试脚本，同时保留自定义代码

**独立测试**: 修改一个场景 YAML（添加新步骤）。调用 `/e2e-test-generator update E2E-INVENTORY-001`。验证测试脚本更新了新步骤，但保留了 CUSTOM CODE 区域的自定义断言。

### 用户故事 5 的测试

- [ ] T051 [P] [US5] 文件哈希计算单元测试 .claude/skills/e2e-test-generator/tests/test_file_hasher.py
- [ ] T052 [P] [US5] 修改程度检测单元测试 .claude/skills/e2e-test-generator/tests/test_modification_detector.py
- [ ] T053 [P] [US5] 代码标记保留单元测试 .claude/skills/e2e-test-generator/tests/test_code_marker_preserver.py

### 用户故事 5 的实现

- [ ] T054 [P] [US5] 创建文件更新器模块 .claude/skills/e2e-test-generator/scripts/file_updater.py
- [ ] T055 [US5] 在 .claude/skills/e2e-test-generator/metadata/ 目录实现文件哈希存储/检索（依赖 T054）
- [ ] T056 [US5] 实现修改程度检测（哈希比较 + 变更百分比计算）
- [ ] T057 [US5] 实现代码标记解析器（检测 `// AUTO-GENERATED`、`// CUSTOM CODE START/END`）
- [ ] T058 [US5] 实现智能合并逻辑（更新自动生成部分，保留自定义代码）
- [ ] T059 [US5] 为大幅修改的文件（≥30% 变更）实现 .spec.new.ts 生成
- [ ] T060 [US5] 向 Playwright 测试模板添加代码标记（`// AUTO-GENERATED`、`// CUSTOM CODE START/END`）
- [ ] T061 [US5] 在 cli.py 中添加 `/e2e-test-generator update <scenario-id>` CLI 命令处理器

**检查点**: 智能更新在刷新自动生成部分的同时保留自定义代码

---

## 阶段 8：用户故事 6 - 支持 API 专用测试框架（Postman/REST Client） (优先级: P2)

**目标**: 为纯 API 场景生成 Postman Collections 和 REST Client .http 文件

**独立测试**: 准备一个纯 API 场景（仅 api 断言）。调用 `/e2e-test-generator generate E2E-API-AUTH-001 --framework postman`。验证 .postman_collection.json 文件符合 Postman Collection v2.1 格式。

### 用户故事 6 的测试

- [ ] T062 [P] [US6] Postman collection 生成单元测试 .claude/skills/e2e-test-generator/tests/test_postman_generator.py
- [ ] T063 [P] [US6] REST Client 生成单元测试 .claude/skills/e2e-test-generator/tests/test_restclient_generator.py
- [ ] T064 [P] [US6] 框架检测器单元测试 .claude/skills/e2e-test-generator/tests/test_framework_detector.py

### 用户故事 6 的实现

- [ ] T065 [P] [US6] 创建 Postman collection 模板 .claude/skills/e2e-test-generator/assets/templates/postman-collection-template.json.j2
- [ ] T066 [P] [US6] 创建 REST Client 模板 .claude/skills/e2e-test-generator/assets/templates/restclient-template.http.j2
- [ ] T067 [P] [US6] 向 action-mappings.yaml 添加 Postman 特定的 action mappings
- [ ] T068 [P] [US6] 向 action-mappings.yaml 添加 REST Client 特定的 action mappings
- [ ] T069 [US6] 实现框架检测器 .claude/skills/e2e-test-generator/scripts/framework_detector.py
- [ ] T070 [US6] 实现 Postman collection 生成器 .claude/skills/e2e-test-generator/scripts/generate_postman.py（依赖 T065, T067）
- [ ] T071 [US6] 实现 REST Client 生成器 .claude/skills/e2e-test-generator/scripts/generate_restclient.py（依赖 T066, T068）
- [ ] T072 [US6] 为 CLI generate 命令添加 --framework 参数支持
- [ ] T073 [US6] 集成框架选择逻辑（自动检测或用户指定）

**检查点**: Postman 和 REST Client 格式现与 Playwright 并列支持

---

## 阶段 9：验证命令（支持功能）

**目的**: 验证生成的测试脚本语法和正确性

- [ ] T074 [P] 创建验证器模块 .claude/skills/e2e-test-generator/scripts/validator.py
- [ ] T075 [P] TypeScript 语法验证单元测试 .claude/skills/e2e-test-generator/tests/test_validator.py
- [ ] T076 实现 TypeScript 语法检查（使用子进程调用 tsc 或 Prettier）
- [ ] T077 实现 Playwright dry-run 检查（子进程调用 `npx playwright test --dry-run`）
- [ ] T078 实现 import 路径验证
- [ ] T079 实现验证报告生成（PASS/FAIL 及详细错误）
- [ ] T080 在 cli.py 中添加 `/e2e-test-generator validate <scenario-id>` CLI 命令处理器

---

## 阶段 10：完善和跨领域关注点

**目的**: 影响多个用户故事的改进

- [ ] T081 [P] 完成 skill.md 文档，包含所有命令和示例
- [ ] T082 [P] 添加全面的错误消息和用户友好的输出格式
- [ ] T083 [P] 添加调试日志（Python logging 模块）
- [ ] T084 [P] 为批量生成添加进度指示器
- [ ] T085 [P] 使用 black 格式化代码和使用 pylint 进行 lint 检查
- [ ] T086 [P] 为所有 Python 函数添加类型提示（mypy 验证）
- [ ] T087 运行 pytest 覆盖率检查（确保核心逻辑 ≥90% 覆盖率）
- [ ] T088 运行 quickstart.md 验证（测试所有示例命令）
- [ ] T089 创建 GitHub workflow 用于 skill 测试（可选）
- [ ] T090 为所有 Python 脚本添加 @spec T002-e2e-test-generator 标识

---

## 依赖关系和执行顺序

### 阶段依赖

- **初始化（阶段 1）**: 无依赖 - 可立即开始
- **基础设施（阶段 2）**: 依赖初始化完成 - 阻塞所有用户故事
- **用户故事（阶段 3-8）**: 全部依赖基础设施阶段完成
  - US1 和 US2（P1）应首先完成（它们是 MVP）
  - US3、US4、US6（P2）可在 US1/US2 后并行进行
  - US5（P3）应最后完成，因为它依赖于理解现有文件结构
- **验证（阶段 9）**: US1 完成后任何时候都可以进行
- **完善（阶段 10）**: 依赖所有期望的用户故事完成

### 用户故事依赖

- **用户故事 1（P1）**: 基础设施（阶段 2）后可开始 - 无其他故事依赖 ✅ MVP 核心
- **用户故事 2（P1）**: 基础设施（阶段 2）后可开始 - 扩展 US1 但可独立测试 ✅ MVP 核心
- **用户故事 3（P2）**: US1 完成后可开始 - 基于单场景生成构建
- **用户故事 4（P2）**: US1 完成后可开始 - 用页面对象模板增强 US1
- **用户故事 5（P3）**: US1 完成后应开始 - 需要理解生成的文件结构
- **用户故事 6（P2）**: 基础设施（阶段 2）后可开始 - Playwright 的并行框架

### 每个用户故事内部

- 测试必须先编写并失败后再实现（TDD）
- 模板文件先于代码生成器
- 解析器/工具先于主生成逻辑
- 核心生成先于 CLI 集成
- 故事完成后再进入下一个优先级

### 并行机会

- 所有标记 [P] 的初始化任务可并行运行
- 所有标记 [P] 的基础设施任务可并行运行（在阶段 2 内）
- 基础设施阶段完成后：
  - US1 和 US2 可按顺序进行（US2 基于 US1 构建）
  - US6 可与 US1/US2 并行（不同框架）
- US1/US2 完成后：
  - US3、US4、US5 都可并行（独立增强）
- 用户故事的所有测试都可标记 [P] 并行运行
- 不同团队成员可并行处理不同的用户故事

---

## 并行示例：用户故事 1

```bash
# 一起启动用户故事 1 的所有测试：
# 任务 T015: YAML 解析单元测试
# 任务 T016: Playwright 代码生成单元测试
# 任务 T017: 端到端工作流集成测试

# 一起启动用户故事 1 的所有模板/配置文件：
# 任务 T018: Playwright 测试模板
# 任务 T019: Action mapping 定义
# 任务 T020: Assertion mapping 定义
```

---

## 实施策略

### MVP 优先（仅用户故事 1 和 2）

1. 完成阶段 1：初始化
2. 完成阶段 2：基础设施（关键 - 阻塞所有故事）
3. 完成阶段 3：用户故事 1（单场景 Playwright 生成）
4. 完成阶段 4：用户故事 2（测试数据加载）
5. **停止并验证**: 独立测试 US1+US2
6. 部署/演示 Playwright 生成功能

### 增量交付

1. 完成初始化 + 基础设施 → 基础就绪
2. 添加用户故事 1 → 独立测试 → **MVP 检查点**（可生成单个 Playwright 测试）
3. 添加用户故事 2 → 独立测试 → **数据加载就绪**
4. 添加用户故事 3 → 独立测试 → **批量生成就绪**
5. 添加用户故事 4 → 独立测试 → **页面对象自动生成**
6. 添加用户故事 6 → 独立测试 → **多框架支持**
7. 添加用户故事 5 → 独立测试 → **智能更新启用**
8. 每个故事在不破坏之前故事的情况下增加价值

### 并行团队策略

多名开发人员的情况下：

1. 团队一起完成初始化 + 基础设施
2. 基础设施完成后：
   - 开发者 A：用户故事 1 + 用户故事 2（P1 MVP）
   - 开发者 B：用户故事 6（P2 - Postman/REST Client）
   - 开发者 C：用户故事 4（P2 - 页面对象）
3. US1/US2 完成后：
   - 开发者 A：用户故事 5（P3 - 更新）
   - 开发者 B 或 C：用户故事 3（P2 - 批量）
4. 所有开发者：阶段 10（完善）

---

## 注意事项

- [P] 任务 = 不同文件，无依赖
- [Story] 标签将任务映射到特定用户故事以便追溯
- 每个用户故事应可独立完成和测试
- **需要 TDD**: 先写测试，确保失败，然后实现
- 所有 Python 代码必须包含 `# @spec T002-e2e-test-generator` 归属标识
- 核心生成逻辑（yaml_parser.py、generate_playwright.py、template_renderer.py）目标 100% 测试覆盖率
- 每个任务或逻辑组后提交
- 在任何检查点停止以独立验证故事
- P1 故事（US1、US2）构成 MVP - 优先处理这些
- P2 故事（US3、US4、US6）是增强功能 - 可逐步添加
- P3 故事（US5）是高级功能 - 核心功能稳定后实现
