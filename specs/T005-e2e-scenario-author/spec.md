# 功能规格：E2E 场景创建工具 (e2e-scenario-author)

**功能分支**: `T005-e2e-scenario-author`
**创建日期**: 2025-12-29
**状态**: 草稿
**输入**: 用户描述："创建/维护场景规格资产（E2EScenarioSpec），支持方案 A（极简一行式）"

## Clarifications

### Session 2025-12-29

- Q: scenario_id 与项目规格的关联方式 - scenario_id 格式保持 E2E-<MODULE>-<NUMBER>,但在场景 YAML 中增加 spec_ref 字段引用项目规格 ID → A: scenario_id 保持 `E2E-<MODULE>-<NUMBER>`,但在场景 YAML 中增加 spec_ref 字段引用项目规格 ID
- Q: 功能范围定位 - 是开发独立工具还是 Claude Code skill? → A: 创建 Claude Code skill 来辅助 E2E 场景编写(通过对话生成 YAML、验证规范、管理场景文件)
- Q: Skill 交互模式 - 对话生成、模板填充还是混合? → A: 混合模式 - 支持对话生成和模板填充两种方式,用户可选择
- Q: Skill 调用方式 - 使用什么命令调用? → A: 使用 `/test-scenario-author` 命令调用,保持与规格 ID 一致
- Q: Skill 文件结构 - 使用什么目录结构? → A: 扩展结构 - 增加 assets/templates/ 和 scripts/ 子目录存放辅助资源
- Q: Skill 的场景存储位置 - 生成的场景 YAML 文件存放在哪里? → A: 项目根目录 `scenarios/` 下,按模块组织子目录
- Q: Skill 是否需要从 spec.md 自动生成测试场景的能力? → A: 是 - Skill 必须支持通过指定 spec.md 文件路径或 specId 自动解析用户故事和验收场景,批量生成对应的 E2E 测试场景 YAML 文件
- Q: Skill 命名规范 - skill 名称应该使用什么前缀? → A: 使用 `test-scenario-author` 作为 skill 名称和命令前缀,明确表明其测试工具属性

## 用户场景与测试 *(必填)*

### 用户故事 1 - 通过 Claude Code Skill 创建标准化 E2E 测试场景 (优先级: P1)

QA 工程师希望通过 `/test-scenario-author` skill 快速创建标准化的 E2E 测试场景 YAML 文件。Skill 支持对话式生成(通过多轮问答收集信息)和模板填充式(提供 YAML 模板由用户编辑)两种方式,生成的场景与环境配置和具体测试数据解耦,便于在不同环境和数据集下复用。场景通过 spec_ref 字段关联到项目规格,便于追溯功能需求。

**优先级说明**: 这是核心功能 - 没有场景创建能力,整个 skill 无法使用。标准化的场景格式是后续所有功能的基础。

**独立测试**: 可以通过调用 `/test-scenario-author create` 命令并提供场景描述,验证 skill 生成的 YAML 文件符合 E2EScenarioSpec 规范,包含必需字段(scenario_id, title, spec_ref, steps, assertions),存储在 `scenarios/<module>/` 目录下,且不包含任何硬编码的环境URL或测试数据。

**验收场景**:

1. **假设** QA 工程师调用 `/test-scenario-author` 并提供场景需求(如"P005 BOM库存扣减测试"),**当** 选择对话式生成模式时,**那么** skill 通过多轮对话收集必要信息后生成包含唯一 scenario_id、spec_ref(如 P005)、描述性 title、完整 steps 和 assertions 的 YAML 文件,存储在 `scenarios/inventory/` 目录下
2. **假设** QA 工程师调用 `/test-scenario-author template`,**当** 选择模板填充模式时,**那么** skill 提供 E2EScenarioSpec YAML 模板供用户编辑,并在保存前验证格式正确性
3. **假设** 生成的场景文件,**当** 检查内容时,**那么** 不包含任何硬编码的 baseURL、环境标识、门店ID、SKU ID 等具体数据
4. **假设** 场景包含多个操作步骤,**当** 审查场景时,**那么** 每个步骤通过 testdata_ref 引用测试数据,而非内联数据值
5. **假设** 场景关联了项目规格 P005,**当** 调用 `/test-scenario-author list --spec-ref P005` 时,**那么** 返回所有关联该规格的场景

---

### 用户故事 2 - 使用 Skill 为场景打标签并筛选 (优先级: P1)

测试负责人希望使用 `/test-scenario-author` skill 为场景打上多维度标签(模块、渠道、部署类型),并能通过 skill 命令快速筛选和查询特定场景子集,便于组合测试套件。

**优先级说明**: 标签系统对于大规模测试至关重要。没有标签,团队无法高效管理数百个场景,无法按需求运行部分测试(如只测小程序模块或只测 SaaS 部署)。

**独立测试**: 可以通过 skill 创建 10 个场景并打上不同标签组合(如 module: order, channel: miniapp),然后通过 `/test-scenario-author list --tags module:order` 验证可以筛选出特定场景子集。

**验收场景**:

1. **假设** 使用 skill 创建订单场景,**当** 对话中指定标签 module: ["order", "payment"], channel: ["miniapp"], deploy: ["saas"],**那么** 生成的场景 YAML 中包含这些标签且格式正确
2. **假设** 项目中有 20 个场景分布在不同模块,**当** 调用 `/test-scenario-author list --tags module:order` 时,**那么** 只返回订单相关场景
3. **假设** 有场景同时标记为 deploy: ["saas", "onprem"],**当** 调用 `/test-scenario-author list --tags deploy:onprem` 时,**那么** 该场景被包含在结果中

---

### 用户故事 3 - 通过 Skill 编辑场景并利用 Git 版本控制 (优先级: P2)

QA 工程师希望使用 `/test-scenario-author edit <scenario-id>` 命令修改现有场景,skill 自动读取场景文件并提供编辑支持。由于场景文件存储在 Git 仓库中,可以通过 Git 命令查看变更历史和回退版本。

**优先级说明**: 对于场景的长期维护很重要,但初期依赖 Git 版本控制即可满足需求。Skill 内置的版本管理功能可在基础功能稳定后添加。

**独立测试**: 可以通过 `/test-scenario-author edit E2E-ORDER-001` 命令修改现有场景(如添加新步骤),保存后通过 `git log` 和 `git diff` 查看变更历史,并能通过 `git checkout` 回退到原始版本。

**验收场景**:

1. **假设** 一个场景 `E2E-ORDER-001.yaml` 已存在,**当** 调用 `/test-scenario-author edit E2E-ORDER-001` 并添加新步骤时,**那么** skill 保存修改后的 YAML 文件,Git 仓库记录变更
2. **假设** 场景有多个 Git 提交历史,**当** 运行 `git log scenarios/order/E2E-ORDER-001.yaml` 时,**那么** 显示每次修改的时间、作者和提交信息
3. **假设** 场景最新修改引入问题,**当** 运行 `git checkout HEAD~1 scenarios/order/E2E-ORDER-001.yaml` 时,**那么** 场景恢复到上一个版本的状态

---

### 用户故事 4 - 使用 Skill 验证场景规范一致性 (优先级: P2)

QA 负责人希望使用 `/test-scenario-author validate <scenario-id>` 命令在提交场景前自动验证其符合 E2EScenarioSpec 规范,避免因格式错误导致执行失败。Skill 会检查必需字段、环境解耦和数据解耦原则。

**优先级说明**: 验证功能提升场景质量,减少执行时错误,但初期可以手动审查。自动验证可在 skill 成熟后添加。

**独立测试**: 可以创建一个故意缺少必需字段(如 scenario_id)的场景 YAML 文件,然后调用 `/test-scenario-author validate <scenario-id>` 验证 skill 能检测到错误并给出清晰提示。

**验收场景**:

1. **假设** 场景 YAML 文件缺少必需字段(scenario_id, spec_ref, title, steps),**当** 调用 `/test-scenario-author validate <scenario-id>` 时,**那么** skill 提示缺失字段并给出修复建议
2. **假设** 场景包含硬编码的 URL 或环境变量,**当** 运行 `/test-scenario-author validate <scenario-id>` 时,**那么** skill 警告用户违反环境解耦原则并建议使用 RunConfig 替代
3. **假设** 场景在 steps 中内联了具体数据值(如门店名称"北京王府井店"),**当** 运行验证时,**那么** skill 提示违反数据解耦原则并建议使用 testdata_ref 引用

---

### 用户故事 5 - 从项目规格自动生成测试场景 (优先级: P1)

QA 工程师希望使用 `/test-scenario-author generate --spec <specId>` 或 `/test-scenario-author generate --spec-file <path>` 命令,让 skill 自动解析项目规格文档(spec.md)中的用户故事和验收场景,批量生成对应的 E2E 测试场景 YAML 文件,大幅提升测试用例创建效率。

**优先级说明**: 这是核心效率提升功能 - 手动为每个用户故事创建测试场景非常耗时,自动生成能将效率提升 5-10 倍,确保规格与测试场景的一致性。

**独立测试**: 可以通过准备一个包含 3 个用户故事(每个有 2-3 个验收场景)的 spec.md 文件,调用 `/test-scenario-author generate --spec P005`,验证 skill 能自动生成对应的 6-9 个场景 YAML 文件,每个文件包含正确的 scenario_id, spec_ref, steps 和 assertions。

**验收场景**:

1. **假设** 存在规格文件 `specs/P005-bom-inventory-deduction/spec.md` 包含 4 个用户故事,**当** 调用 `/test-scenario-author generate --spec P005` 时,**那么** skill 读取规格文件,解析用户故事和验收场景,生成 8-12 个场景 YAML 文件,存储在 `scenarios/inventory/` 目录下,每个文件包含唯一 scenario_id(如 E2E-INVENTORY-001)、spec_ref: "P005"、从用户故事标题提取的 title、从验收场景转换的 steps 和 assertions
2. **假设** 用户故事包含"Given-When-Then"格式的验收场景,**当** skill 解析时,**那么** 自动将 Given 转换为 preconditions, When 转换为 steps, Then 转换为 assertions
3. **假设** 规格文档中用户故事包含优先级标记(如"优先级: P1"),**当** 生成场景时,**那么** skill 自动在场景 tags 中添加 priority: "p1"
4. **假设** 生成过程中遇到场景 ID 冲突,**当** skill 检测到冲突时,**那么** 自动递增编号(如 E2E-INVENTORY-001 已存在则生成 E2E-INVENTORY-002)
5. **假设** 规格文档中存在模糊的验收场景描述(如"系统正确处理请求"),**当** skill 解析时,**那么** 在生成的场景中添加 TODO 注释提示 QA 工程师补充具体步骤

---

### 边缘情况

- 场景 ID 冲突时如何处理(两个场景使用相同 scenario_id)?
- 场景引用不存在的 spec_ref 时如何提示(如引用了不存在的 P999)?
- 场景引用不存在的 testdata_ref 时如何提示?
- 场景包含循环引用(如 action A 引用 action B, B 又引用 A)时如何检测?
- 场景文件 YAML 语法错误时如何给出友好错误提示?
- 场景标签使用非标准值(如自定义的 module 名称)时是否允许?
- 删除已被测试套件引用的场景时如何警告?
- 大量场景(如 500+ 个)时查询和筛选性能如何保证?

## 需求 *(必填)*

### 功能需求

#### Skill 基础功能

- **FR-001**: Skill 必须通过 `/test-scenario-author` 命令调用,支持子命令(create, edit, validate, list, template, generate)
- **FR-002**: Skill 必须支持对话式生成模式,通过多轮问答收集场景信息(scenario_id, spec_ref, title, tags, steps, assertions 等)
- **FR-003**: Skill 必须支持模板填充模式,提供标准 E2EScenarioSpec YAML 模板供用户编辑
- **FR-004**: Skill 必须将生成的场景 YAML 文件存储在项目根目录 `scenarios/<module>/` 子目录下
- **FR-005**: Skill 必须支持从现有场景文件读取内容进行编辑(`/test-scenario-author edit <scenario-id>`)

#### 自动生成功能

- **FR-040**: Skill 必须支持 `/test-scenario-author generate --spec <specId>` 命令,自动解析指定项目规格文档并生成测试场景
- **FR-041**: Skill 必须支持 `/test-scenario-author generate --spec-file <path>` 命令,从指定路径读取 spec.md 文件并生成测试场景
- **FR-042**: Skill 必须能解析 spec.md 中的用户故事章节(识别"### 用户故事"标题),提取用户故事标题、优先级和验收场景
- **FR-043**: Skill 必须能识别"Given-When-Then"格式的验收场景,自动转换为场景 YAML 的 preconditions, steps, assertions
- **FR-044**: Skill 必须能从用户故事标题提取关键信息生成场景 title(如"用户故事 1 - 创建订单" → title: "创建订单")
- **FR-045**: Skill 必须能从 specId 推断模块(如 P005 → module: "inventory"),并将生成的场景存储在对应 `scenarios/<module>/` 目录
- **FR-046**: Skill 必须自动为生成的场景分配唯一的 scenario_id,格式为 E2E-<MODULE>-<NUMBER>,遇到冲突时自动递增编号
- **FR-047**: Skill 必须在生成的场景中自动设置 spec_ref 字段为指定的 specId
- **FR-048**: Skill 必须能识别用户故事中的优先级标记(如"优先级: P1"),并在场景 tags 中添加 priority 标签
- **FR-049**: Skill 必须在生成模糊或不完整的场景时添加 TODO 注释,提示 QA 工程师补充具体步骤
- **FR-050**: Skill 必须在批量生成完成后输出摘要报告(生成场景数量、存储位置、需要人工补充的场景列表)

#### 场景 YAML 规范

- **FR-006**: 生成的场景必须包含唯一的 scenario_id(格式: E2E-<MODULE>-<NUMBER>, 如 E2E-ORDER-001)
- **FR-007**: 场景必须包含 spec_ref 字段,引用项目规格标识符(如 P005, O003, U001)
- **FR-008**: 场景必须包含描述性的 title 字段,说明场景测试的业务流程
- **FR-009**: 场景必须支持 tags 定义,包括 module(模块), channel(渠道), deploy(部署类型)等维度
- **FR-010**: 场景必须定义 preconditions,包括 role(角色)和 testdata_ref(测试数据引用)
- **FR-011**: 场景必须定义 steps 数组,每个步骤包含 action 和相关参数
- **FR-012**: 场景必须定义 assertions 数组,包括 type(ui/api)和 check(断言条件)
- **FR-013**: 场景必须支持 artifacts 配置,定义 trace 和 video 的捕获策略

#### 环境与数据解耦

- **FR-014**: Skill 生成的场景文件中禁止出现硬编码的 baseURL、租户域名、环境标识
- **FR-015**: 场景文件中禁止硬编码门店 ID、SKU ID、价格、促销码等具体数据
- **FR-016**: 所有具体数据必须通过 testdata_ref 引用外部测试数据定义
- **FR-017**: 环境相关配置(如 URL、凭据)必须由 RunConfig 在执行时提供
- **FR-018**: Skill 必须提供验证功能(`/test-scenario-author validate`),检测场景是否违反环境解耦原则
- **FR-019**: Skill 必须提供验证功能,检测场景是否违反数据解耦原则

#### 标签与筛选

- **FR-020**: Skill 在对话式生成中必须引导用户为场景打上多个标签,标签分为不同维度(module, channel, deploy 等)
- **FR-021**: Skill 必须支持 `/test-scenario-author list` 命令,基于标签查询和筛选场景(如 `--tags module:order`)
- **FR-022**: Skill 必须支持基于 spec_ref 查询和筛选场景(如 `/test-scenario-author list --spec-ref P005`)
- **FR-023**: 标签筛选必须支持逻辑组合(如 `--tags module:order,channel:miniapp` 表示 AND)
- **FR-024**: 标签筛选必须支持多值匹配(如场景标记 deploy: ["saas", "onprem"] 时,`--tags deploy:onprem` 能匹配)

#### 场景管理

- **FR-025**: 场景文件必须存储在项目根目录 `scenarios/<module>/` 子目录下,按模块组织
- **FR-026**: 每个场景文件命名格式为 `<scenario_id>.yaml`(如 `E2E-ORDER-001.yaml`)
- **FR-027**: Skill 必须支持 `/test-scenario-author list` 命令,列出所有场景及其基本信息(ID, spec_ref, title, tags)
- **FR-028**: Skill 必须支持搜索场景(按 ID, spec_ref, title 关键词, tags)
- **FR-029**: Skill 必须支持删除场景(`/test-scenario-author delete <scenario-id>`),并在删除前检查是否被套件引用

#### 场景验证

- **FR-030**: Skill 必须验证场景 YAML 文件语法正确性
- **FR-031**: Skill 必须验证场景包含所有必需字段(scenario_id, spec_ref, title, steps, assertions)
- **FR-032**: Skill 必须验证 scenario_id 在所有场景中唯一(创建时自动检查 `scenarios/` 目录下的所有 YAML 文件)
- **FR-033**: Skill 必须验证 testdata_ref 引用的测试数据存在(如果可访问测试数据定义)
- **FR-034**: Skill 必须验证场景的 steps 和 assertions 格式正确

#### Skill 文件结构

- **FR-035**: Skill 必须存储在 `.claude/skills/test-scenario-author/` 目录下
- **FR-036**: Skill 目录必须包含 `skill.md` 主文档,描述 skill 功能和使用方法
- **FR-037**: Skill 目录必须包含 `references/` 子目录,存放参考文档和示例
- **FR-038**: Skill 目录必须包含 `assets/templates/` 子目录,存放 E2EScenarioSpec YAML 模板
- **FR-039**: Skill 目录可选包含 `scripts/` 子目录,存放辅助脚本(如验证脚本、场景解析脚本)

### 关键实体

- **test-scenario-author Skill (测试场景创作者技能)**: Claude Code skill,通过 `/test-scenario-author` 命令调用,辅助用户创建、编辑、验证和管理 E2E 测试场景 YAML 文件
- **E2EScenarioSpec (E2E场景规格)**: 定义单个 E2E 测试场景的 YAML 文件,包含场景 ID、规格引用、标题、标签、前置条件、测试步骤、断言和工件配置,存储在 `scenarios/<module>/` 目录下
- **scenario_id (场景ID)**: 场景的唯一标识符,格式为 E2E-<MODULE>-<NUMBER>,用于场景内部引用、文件命名和筛选
- **spec_ref (规格引用)**: 场景关联的项目规格标识符(如 P005, O003),用于追溯场景对应的功能需求,便于按规格筛选和管理场景
- **tags (标签)**: 场景的多维度分类标签,包括 module(功能模块)、channel(渠道如小程序/Web)、deploy(部署类型如 SaaS/私有化),由 skill 在对话中引导用户定义
- **testdata_ref (测试数据引用)**: 指向外部测试数据定义的引用,用于解耦场景与具体数据
- **steps (测试步骤)**: 场景中的操作序列,每个步骤包含 action 和参数(如 login, create_order, pay)
- **assertions (断言)**: 场景的验证点,包括 UI 断言和 API 断言,用于判断测试通过或失败
- **artifacts (工件)**: 测试执行工件的捕获配置,如 trace(追踪)和 video(视频)的保留策略
- **RunConfig (运行配置)**: 场景执行时的环境配置,包含 baseURL、凭据、环境标识等,与场景分离(不由 skill 管理)

## 成功标准 *(必填)*

### 可衡量的结果

- **SC-001**: QA 工程师使用 `/test-scenario-author` skill 可以在 5 分钟内创建一个符合规范的标准场景(包含 5-10 个步骤)
- **SC-002**: Skill 生成的场景 100% 通过环境解耦验证(不包含硬编码 URL 或环境标识)
- **SC-003**: Skill 生成的场景 100% 通过数据解耦验证(不包含硬编码的业务数据)
- **SC-004**: Skill 引导用户为场景打标签,覆盖率达到 100%(每个场景至少有 module, channel, deploy 三个维度的标签)
- **SC-005**: `/test-scenario-author list` 命令的标签筛选查询在 1 秒内返回结果(场景数量 < 500 个)
- **SC-006**: Skill 的 scenario_id 冲突检测准确率 100%(创建时自动检查 `scenarios/` 目录并立即检测到重复 ID)
- **SC-007**: `/test-scenario-author validate` 命令能检测出 95% 以上的常见格式错误(缺失必需字段、YAML 语法错误、解耦原则违反)
- **SC-008**: Skill 生成的场景修改后,90% 的用户能在不查文档的情况下理解场景意图(通过 title 和 steps 描述清晰)
- **SC-009**: Skill 生成的场景 100% 包含有效的 spec_ref,可追溯到项目规格文档
- **SC-010**: Skill 能够在 3 分钟内从指定 spec.md 或 specId 自动生成覆盖主要用户故事的测试场景(对话式或批量生成)

## 假设 *(可选)*

- QA 团队熟悉 YAML 格式基本语法
- 测试场景数量在 500 个以内(超过此数量可能需要数据库支持)
- 场景文件存储在 Git 仓库中,利用 Git 进行版本控制和协作
- 存在独立的测试数据管理机制(testdata_ref 引用的数据由其他工具管理)
- 存在 RunConfig 配置管理机制,为场景执行提供环境配置
- 团队已建立场景命名和标签使用规范(如 module 的有效值列表)
- 项目规格使用标准化的 spec ID 格式(如 P005, O003, U001 等)
- 项目规格文档遵循统一格式,包含"用户场景与测试"章节和"验收场景"小节
- 用户故事使用"Given-When-Then"或"假设-当-那么"格式编写验收场景
- Claude Code skill 运行环境支持文件系统读写和 YAML 解析

## 超出范围 *(可选)*

- 场景的实际执行(由测试执行引擎负责)
- 测试数据的创建和管理(由测试数据工具负责)
- RunConfig 的创建和管理(由环境配置工具负责)
- 场景执行结果的报告和分析
- 场景性能优化建议(如步骤精简、并行化建议)
- 自动生成场景(基于录制或 AI 生成)
- 场景的可视化编辑器(初期仅支持 YAML 文本编辑)
- 与第三方测试管理工具(Jira, TestRail)的集成
- 项目规格文档的创建和管理(规格由其他工具维护)
