# Feature Specification: 饮品模块复用SKU管理能力

**Feature Branch**: `O004-beverage-sku-reuse`
**Created**: 2025-12-31
**Status**: Draft
**Input**: User description: "问题描述：小程序饮品模块上架的 功能通过后台 http://localhost:3000/beverage/list 完成 目前的逻辑 与sku 配置成品 鸡尾酒的逻辑是重叠的
解决方案：这个功能应该重复复用 SKU管理的能力，也就是 在选择配方的时候 只能选择 具体的SKU成品 不应该选在对应的包材"

## Clarifications

### Session 2025-12-31

- Q: Which user stories require automated E2E test scripts for this feature? → A: P1 + P2（SKU管理界面配置饮品 + SKU选择器过滤）- 核心流程自动化
- Q: What test data should be prepared for the E2E test scenarios covering P1 and P2? → A: Generate test data via E2E test fixtures (recommended) - 使用 e2e-testdata-planner 创建测试数据蓝图（如 TD-SKU-BEVERAGE-001, TD-BOM-COCKTAIL-001）并生成 Playwright fixtures 进行 setup/teardown，确保干净隔离的测试环境和可预测的测试数据
- Q: 这个功能涉及 B端管理后台和 C端小程序的数据同步。E2E测试需要验证跨系统同步吗？ → A: 仅测试 B端管理后台功能（SKU创建、配方配置、选择器过滤）- E2E测试聚焦在后台运营人员的操作流程，不验证小程序端的展示效果，假设后台数据正确则小程序端自动正确

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 运营人员通过SKU管理界面配置饮品成品 (Priority: P1)

后台运营人员需要为小程序饮品模块上架新的成品饮料（如鸡尾酒、果汁），他们应该使用统一的SKU管理界面来创建和配置这些饮品，而不是在独立的饮品模块中重复操作。

**Why this priority**: 这是核心功能，消除了重复的饮品配置逻辑，确保所有成品（包括饮品）都通过标准SKU流程管理，是后续功能的基础。

**Independent Test**: 可以独立测试——运营人员在SKU管理页面创建一个新的成品饮品SKU（SKU类型=finished_product），验证该饮品出现在小程序饮品模块中。

**Acceptance Scenarios**:

1. **Given** 运营人员在SKU管理界面, **When** 创建新SKU并选择类型为"成品"（finished_product）且分类为"饮品", **Then** 该SKU自动出现在小程序饮品模块的可选列表中
2. **Given** 运营人员在SKU编辑界面修改成品饮品的名称/价格, **When** 保存修改, **Then** 小程序饮品模块中该饮品信息同步更新
3. **Given** 运营人员在SKU管理界面停用一个饮品SKU, **When** 状态改为"disabled", **Then** 该饮品从小程序饮品模块中下架

---

### User Story 2 - 饮品配方只能关联成品SKU (Priority: P2)

在配置饮品配方（BOM/原料清单）时，运营人员只能从成品SKU列表中选择饮品，系统自动过滤掉包材类SKU（如杯子、吸管），确保配方关联的是真正的饮品成品。

**Why this priority**: 防止配置错误（如误选包材作为饮品），提升数据质量和用户体验，但不影响基础饮品上架功能。

**Independent Test**: 可以独立测试——在饮品配方配置界面打开SKU选择器，验证下拉列表中只显示"finished_product"类型的SKU，不显示"packaging"类型的SKU。

**Acceptance Scenarios**:

1. **Given** 运营人员在配方配置界面点击"选择饮品SKU", **When** SKU选择器弹出, **Then** 只显示SKU类型为"finished_product"的选项，不显示"packaging"、"raw_material"等类型
2. **Given** 系统中存在3个finished_product SKU（威士忌可乐、薄荷威士忌、冰镇可乐）和5个packaging SKU（杯子、吸管等）, **When** 运营人员打开饮品配方SKU选择器, **Then** 只看到3个finished_product选项
3. **Given** 运营人员已选择一个finished_product SKU作为饮品, **When** 尝试手动输入一个packaging类型的SKU编码, **Then** 系统拒绝并提示"只能选择成品类型的SKU"

---

### User Story 3 - 移除旧饮品管理界面的冗余功能 (Priority: P3)

将现有的独立饮品管理界面（`/beverage/list`）中与SKU管理重叠的功能移除或重定向，避免运营人员在两个地方重复配置相同的数据，减少维护成本和数据不一致风险。

**Why this priority**: 这是清理工作，在确保P1、P2功能正常后再执行，不影响核心业务流程。

**Independent Test**: 可以独立测试——访问旧饮品管理界面，验证重复功能已移除或重定向到SKU管理界面，现有数据迁移正确。

**Acceptance Scenarios**:

1. **Given** 运营人员访问 `/beverage/list`, **When** 页面加载, **Then** 页面显示迁移提示："饮品管理已迁移至SKU管理，请前往 /products/sku 进行操作"，并提供跳转链接
2. **Given** 旧饮品管理界面中已有10条历史饮品数据, **When** 系统执行数据迁移脚本, **Then** 这10条数据转换为对应的finished_product类型SKU，保留原有属性（名称、价格、状态）
3. **Given** 运营人员尝试在旧饮品管理界面创建新饮品, **When** 点击"新增"按钮, **Then** 系统自动跳转到SKU管理的"新增成品SKU"页面

---

### Edge Cases

- **What happens when** 运营人员在饮品配方中已关联某个finished_product SKU，但该SKU后来被修改为packaging类型？
  - 系统应保留历史关联但标记为"无效关联"，提示运营人员更新配方
- **How does system handle** 旧饮品数据迁移到SKU时，发现SKU编码冲突（已存在相同编码的SKU）？
  - 系统应生成新的唯一SKU编码（如添加后缀"-MIGRATED"），记录映射关系，并通知运营人员审核
- **What happens when** finished_product SKU关联了BOM配方，但BOM中的原料SKU不存在？
  - 系统应在配方验证时提示缺失原料，阻止保存直到原料补充完整
- **How does system handle** 小程序端用户浏览饮品时，后台运营人员同时停用该饮品SKU？
  - 小程序应实时或短时间内（≤5秒）刷新饮品列表，已停用的饮品不再显示

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统必须在SKU管理界面支持创建"finished_product"类型的饮品SKU，包含字段：SKU编码、名称、分类（饮品子分类如鸡尾酒/果汁）、价格、状态（enabled/disabled）、主库存单位、规格
- **FR-002**: 系统必须自动将SKU类型为"finished_product"且分类为"饮品"的SKU同步显示在小程序饮品模块的可选列表中
- **FR-003**: 系统必须在饮品配方配置界面的SKU选择器中，仅显示SKU类型为"finished_product"的选项，过滤掉"packaging"、"raw_material"等其他类型
- **FR-004**: 系统必须在SKU选择器中提供按SKU名称、编码的模糊搜索功能，方便运营人员快速定位目标饮品
- **FR-005**: 系统必须提供数据迁移脚本，将旧饮品管理界面（`/beverage/list`）中的现有饮品数据转换为finished_product类型的SKU，保留原有属性（名称、价格、状态、分类）
- **FR-006**: 系统必须在旧饮品管理界面显示迁移提示信息，并提供跳转到SKU管理界面的链接，引导运营人员使用新流程
- **FR-007**: 系统必须在饮品配方保存时验证：关联的SKU类型必须为"finished_product"，否则拒绝保存并提示错误信息
- **FR-008**: 系统必须记录SKU管理操作日志（创建、修改、停用），包括操作人、操作时间、变更字段，用于审计和问题追溯
- **FR-009**: 系统必须在小程序端实时或近实时（≤5秒）同步SKU状态变更，当饮品SKU被停用时，该饮品不再显示在小程序饮品列表中
- **FR-010**: 系统必须支持批量导入finished_product类型的饮品SKU，通过Excel模板上传，减少手动录入工作量

### Key Entities

- **SKU (Stock Keeping Unit)**: 库存保管单位，代表可管理的最小商品单元。关键属性包括：
  - SKU编码（唯一标识）
  - SKU名称
  - SKU类型（finished_product=成品, raw_material=原料, packaging=包材）
  - 所属SPU（标准产品单元）
  - 分类（饮品、小食等）
  - 价格
  - 主库存单位（份、杯、瓶等）
  - 状态（enabled=启用, disabled=停用, draft=草稿）
  - 创建时间、更新时间

- **BOM配方 (Bill of Materials)**: 成品SKU的物料清单，定义生产该成品所需的原料SKU和包材SKU。关键属性包括：
  - 所属成品SKU ID
  - 原料/包材列表（每项包含：SKU ID、用量、单位）
  - 损耗率
  - 状态（enabled/disabled）

- **饮品分类 (Beverage Category)**: 饮品的业务分类（鸡尾酒、果汁、咖啡等），关键属性包括：
  - 分类ID
  - 分类名称
  - 父分类ID（支持多级分类）
  - 排序顺序

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 运营人员可以在5分钟内完成一个新饮品SKU的创建和配方配置（包含3种原料），无需重复操作
- **SC-002**: 饮品配方配置时，SKU选择器过滤准确率达到100%（所有显示的选项均为finished_product类型，无包材SKU误显示）
- **SC-003**: 旧饮品数据迁移成功率≥95%（至少95%的历史饮品正确转换为SKU，保留原有属性）
- **SC-004**: 小程序饮品列表与后台SKU管理的数据同步延迟≤5秒（SKU状态变更后，小程序端在5秒内反映变化）
- **SC-005**: 减少饮品配置相关的运营人员支持工单≥60%（通过统一SKU管理流程，降低因重复配置导致的问题）
- **SC-006**: 新饮品上架流程缩短≥40%（从平均8个步骤减少到≤5个步骤，通过复用SKU管理能力）

## Assumptions *(optional)*

- 现有SKU管理界面已支持finished_product类型的SKU创建和编辑
- 小程序饮品模块已有API接口从后台获取饮品列表，可直接切换为从SKU服务获取数据
- 旧饮品管理界面（`/beverage/list`）的数据库表结构已知，可编写迁移脚本
- 运营人员已熟悉SKU管理的基本操作（如SKU类型选择、分类配置）
- 饮品配方配置界面已集成通用的SKU选择器组件，可通过参数过滤SKU类型

## Dependencies *(optional)*

- **P系列规格（商品管理）**: 依赖SKU管理基础功能（CRUD、类型管理、状态管理）
- **M系列规格（BOM管理）**: 依赖BOM配方管理功能（如果涉及配方关联）
- **数据迁移脚本**: 需要数据库访问权限和足够的测试环境验证

## Out of Scope *(optional)*

- 小程序端饮品展示UI/UX优化（保持现有界面，仅更换数据源）
- SKU成本核算和定价策略调整（仅使用现有价格字段）
- 饮品库存管理和预警功能（库存管理由独立的库存模块负责）
- 多语言支持（饮品名称、分类名称仅支持中文）
- 饮品推荐算法和个性化展示（仅提供基础列表功能）
