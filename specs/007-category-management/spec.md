# Feature Specification: 类目管理

**Feature Branch**: `007-category-management`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "@2.1_类目管理_UI设计文档.md (1-178)"

**Business Context**: 影院商品管理中台 - 类目管理功能用于支撑「一级/二级/三级类目」的配置与维护，作为 SPU 前置主数据。系统需要提供类目树结构展示、类目基本信息管理、属性模板配置等功能，确保商品管理人员能够高效地维护类目体系。

**文档要求**: 所有功能规格、用户故事、需求文档等必须使用简体中文编写，遵循中国大陆地区中文表达习惯

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 类目树浏览与基本信息查看 (Priority: P1)

商品管理人员需要能够浏览三级类目树结构，查看任意类目的基本信息，了解类目的层级关系和基本属性。

**Why this priority**: 类目浏览和查看是类目管理的基础功能，是其他所有操作的前提，用户必须能够清晰地了解类目结构才能进行后续的编辑、配置等操作。

**Independent Test**: 可以通过验证用户能够看到完整的类目树结构，点击任意节点查看详细信息，测试类目数据的展示完整性和交互流畅性。

**Acceptance Scenarios**:

1. **Given** 用户已登录系统并具有类目查看权限，**When** 用户访问类目管理页面，**Then** 用户能够在左侧看到完整的类目树结构，包括一级、二级、三级类目
2. **Given** 用户在类目树中，**When** 点击任意类目节点，**Then** 右侧详情区域显示该类目的基本信息，包括类目名称、等级、上级类目路径、编码、排序序号、状态等
3. **Given** 用户在类目树中，**When** 展开或收起类目节点，**Then** 系统正确更新树结构的展开状态，保持用户的浏览位置
4. **Given** 用户需要查找特定类目，**When** 在搜索框中输入类目名称，**Then** 系统自动展开匹配的类目路径并高亮显示匹配节点
5. **Given** 用户在查看类目详情，**When** 查看基本信息区域，**Then** 用户能够看到类目名称、类目等级（一级/二级/三级）、上级类目路径、类目编码、排序序号、启用状态等完整信息

---

### User Story 2 - 类目创建与编辑 (Priority: P1)

主数据管理员需要能够创建新的类目（一级、二级、三级），并编辑已有类目的基本信息，维护类目体系的完整性。

**Why this priority**: 类目的创建和编辑是类目管理的核心功能，是构建和维护类目体系的基础操作，直接影响后续 SPU 管理的可用性。

**Independent Test**: 可以通过验证管理员能够成功创建新类目、编辑类目信息并保存，测试类目数据的完整性和一致性。

**Acceptance Scenarios**:

1. **Given** 用户具有主数据管理员或商品管理员权限，**When** 点击「新增一级类目」按钮，**Then** 系统弹出新建类目弹窗，显示类目名称、类目等级、排序序号、状态等字段
2. **Given** 用户在类目树中，**When** 右键点击某个类目节点选择「新增子类目」，**Then** 系统弹出新建类目弹窗，上级类目字段自动填充为当前类目，类目等级自动判定为下一级
3. **Given** 用户填写类目信息，**When** 提交新建类目表单，**Then** 系统验证类目名称必填，创建成功后关闭弹窗、刷新类目树并自动选中新创建的类目节点
4. **Given** 用户在查看类目详情，**When** 点击「编辑」按钮，**Then** 基本信息表单切换为编辑模式，用户可以修改类目名称、排序序号等可编辑字段
5. **Given** 用户在编辑类目信息，**When** 修改类目名称并点击「保存」，**Then** 系统验证类目名称不能为空，保存成功后表单切换回只读模式并显示更新后的信息
6. **Given** 用户在编辑类目信息，**When** 点击「取消」按钮，**Then** 系统放弃所有修改，表单切换回只读模式并恢复原始数据

---

### User Story 3 - 类目状态管理与删除控制 (Priority: P1)

主数据管理员需要能够启用或停用类目，控制类目在新建 SPU 时的可用性，并在确保数据安全的前提下删除未使用的类目。

**Why this priority**: 类目状态管理直接影响业务运营，停用类目可以防止新 SPU 使用已废弃的类目，删除控制确保数据完整性，这些都是关键的业务规则。

**Independent Test**: 可以通过验证管理员能够切换类目状态、系统正确阻止删除已被使用的类目，测试状态管理和删除约束的有效性。

**Acceptance Scenarios**:

1. **Given** 用户在查看启用状态的类目详情，**When** 点击「停用」按钮，**Then** 系统弹出确认提示："停用后，新增 SPU 时将无法选择该类目，已有 SPU 不受影响。"
2. **Given** 用户确认停用类目，**When** 点击确认按钮，**Then** 系统更新类目状态为停用，类目树中该类目显示为停用状态（使用 Tag/Badge 标记）
3. **Given** 用户在查看停用状态的类目详情，**When** 点击「启用」按钮，**Then** 系统更新类目状态为启用，该类目重新可用于新建 SPU
4. **Given** 用户尝试删除类目，**When** 该类目已被 SPU 使用，**Then** 系统禁止删除操作，删除按钮置灰并显示 Tooltip："该类目已有 SPU 使用，不可删除。"
5. **Given** 用户尝试删除类目，**When** 该类目未被任何 SPU 使用，**Then** 系统允许删除操作，删除后从类目树中移除该类目节点

---

### User Story 4 - 属性模板配置 (Priority: P2)

主数据管理员需要能够为每个类目配置专属的属性模板，定义该类目下 SPU 需要填写的属性字段，确保商品数据的规范性和完整性。

**Why this priority**: 属性模板配置是类目管理的高级功能，虽然不影响基础类目管理，但能够显著提升 SPU 创建时的数据质量和规范性，减少数据录入错误。

**Independent Test**: 可以通过验证管理员能够为类目添加、编辑、删除属性，在 SPU 创建时系统能够正确应用属性模板，测试属性模板配置的完整性和联动效果。

**Acceptance Scenarios**:

1. **Given** 用户在查看类目详情，**When** 滚动到属性模板配置区域，**Then** 用户能够看到该类目已配置的属性列表表格，包括属性名称、属性类型、是否必填、可选值、排序、操作列
2. **Given** 用户在属性模板配置区域，**When** 点击「新增属性」按钮，**Then** 系统弹出属性配置弹窗，显示属性名称、属性类型（文本/数字/单选/多选）、是否必填、可选值等字段
3. **Given** 用户填写属性信息，**When** 选择属性类型为单选或多选，**Then** 系统显示可选值输入框，支持多行输入或 Tag 输入方式
4. **Given** 用户提交新增属性表单，**When** 属性名称已填写，**Then** 系统保存属性配置，关闭弹窗并刷新属性列表，新属性显示在列表中
5. **Given** 用户在属性列表中，**When** 点击某个属性的「编辑」按钮，**Then** 系统弹出属性配置弹窗并带入该属性的原有数据，用户可以修改属性信息
6. **Given** 用户尝试删除属性，**When** 该属性已被 SPU 使用，**Then** 系统禁止删除操作，显示提示："该属性已被 SPU 使用，删除将影响已有 SPU，请通过运维流程处理。"
7. **Given** 用户在 SPU 新建页面，**When** 选择某个已配置属性模板的三级类目，**Then** 系统提示："该类目已配置属性：[属性列表]，请按模板填写。"

---

### User Story 5 - 权限控制与只读模式 (Priority: P2)

系统需要根据用户角色控制类目管理功能的可见性和可操作性，确保只有授权用户能够修改类目数据，其他用户只能浏览。

**Why this priority**: 权限控制是数据安全的基础保障，虽然不影响核心功能使用，但对于保护主数据完整性和防止误操作至关重要。

**Independent Test**: 可以通过验证不同角色的用户看到不同的操作按钮和功能，测试权限控制的准确性和一致性。

**Acceptance Scenarios**:

1. **Given** 用户具有"主数据管理员"或"商品管理员"角色，**When** 访问类目管理页面，**Then** 用户能够看到「新增类目」「编辑」「删除」「属性模板编辑」等所有操作按钮
2. **Given** 用户具有其他角色（非管理员），**When** 访问类目管理页面，**Then** 用户只能看到类目树和右侧详情区域，所有操作按钮隐藏，所有信息为只读模式
3. **Given** 非管理员用户在查看类目详情，**When** 尝试编辑类目信息，**Then** 系统不显示编辑按钮，基本信息表单始终处于只读状态
4. **Given** 非管理员用户在查看属性模板配置，**When** 查看属性列表，**Then** 系统不显示「新增属性」按钮和属性行的「编辑」「删除」操作按钮

---

### Edge Cases

- 当类目树数据量很大（超过 1000 个节点）时，系统如何保证树结构的加载和渲染性能？
- 当用户同时编辑多个类目时，系统如何处理并发修改冲突？
- 当类目被删除后，历史 SPU 数据中的类目引用如何处理？
- 当属性模板中的可选值列表很长（超过 100 项）时，系统如何优化展示和选择体验？
- 当用户搜索类目时，如果匹配结果分布在多个分支中，系统如何高效地展开所有相关路径？
- 当类目编码规则发生变化时，系统如何处理已有类目的编码兼容性？
- 当属性模板配置错误导致 SPU 创建失败时，系统如何提供清晰的错误提示和修复建议？
- 当用户尝试将类目从启用状态切换为停用时，如果该类目下存在大量活跃 SPU，系统是否需要额外的确认步骤？

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a hierarchical category tree structure supporting three levels (Level 1, Level 2, Level 3 categories)
- **FR-002**: System MUST allow users to expand and collapse category tree nodes to navigate the hierarchy
- **FR-003**: System MUST display category details (name, level, parent path, code, sort order, status) in the right panel when a category node is selected
- **FR-004**: System MUST support searching categories by name and automatically expand matching paths in the tree
- **FR-005**: System MUST allow authorized users (Master Data Administrator / Product Administrator) to create new categories at any level
- **FR-006**: System MUST automatically determine category level based on parent category when creating sub-categories
- **FR-007**: System MUST validate that category name is required and cannot be empty
- **FR-008**: System MUST allow authorized users to edit category basic information (name, sort order, status)
- **FR-009**: System MUST prevent editing of read-only fields (category level, parent category path, category code)
- **FR-010**: System MUST allow authorized users to enable or disable categories
- **FR-011**: System MUST display a confirmation dialog before disabling a category, explaining the impact on new SPU creation
- **FR-012**: System MUST prevent deletion of categories that are being used by existing SPUs
- **FR-013**: System MUST display a tooltip explaining why deletion is disabled when a category is in use
- **FR-014**: System MUST allow deletion of categories that are not referenced by any SPU
- **FR-015**: System MUST support configuring attribute templates for each category
- **FR-016**: System MUST allow authorized users to add, edit, and delete attributes in category attribute templates
- **FR-017**: System MUST support multiple attribute types: text, number, single-select, multi-select
- **FR-018**: System MUST require attribute name when creating or editing attributes
- **FR-019**: System MUST allow configuring optional values for single-select and multi-select attribute types
- **FR-020**: System MUST allow marking attributes as required or optional
- **FR-021**: System MUST prevent deletion of attributes that are being used by existing SPUs
- **FR-022**: System MUST display appropriate error messages when attempting to delete attributes in use
- **FR-023**: System MUST restrict category management operations (create, edit, delete, attribute template configuration) to authorized roles only
- **FR-024**: System MUST display category management interface in read-only mode for non-administrator users
- **FR-025**: System MUST refresh the category tree and automatically select newly created categories after successful creation
- **FR-026**: System MUST validate sort order as numeric when provided
- **FR-027**: System MUST display category status (enabled/disabled) using visual indicators (Tag/Badge) in the category tree
- **FR-028**: System MUST maintain category tree state (expanded/collapsed nodes) during user navigation
- **FR-029**: System MUST support displaying attribute template information when creating SPUs under categories with configured templates

### Key Entities *(include if feature involves data)*

- **Category**: Represents a product category in the hierarchical structure. Key attributes include: category name (required), category level (Level 1/2/3, read-only), parent category reference, category code (system-generated or read-only), sort order (numeric, optional), status (enabled/disabled). Relationships: belongs to parent category (except Level 1), has many sub-categories, referenced by SPUs, has one attribute template.

- **Attribute Template**: Represents a collection of attributes configured for a category. Key attributes: belongs to one category, contains multiple attributes. Relationships: belongs to one category, has many attributes.

- **Attribute**: Represents a single attribute definition in a category's attribute template. Key attributes include: attribute name (required), attribute type (text/number/single-select/multi-select), is required (boolean), optional values (for select types), sort order. Relationships: belongs to one attribute template, referenced by SPUs using the category.

- **Category Tree Node**: Represents a node in the hierarchical tree structure. Key attributes: category reference, expanded state, selected state, visibility state. Relationships: references one category, has parent node (except root), has child nodes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can browse and locate any category in a three-level hierarchy within 10 seconds, regardless of tree size (up to 1000 nodes)
- **SC-002**: Authorized users can create a new category (including filling form and submitting) in under 2 minutes
- **SC-003**: Authorized users can edit and save category information in under 1 minute
- **SC-004**: System prevents 100% of deletion attempts on categories that are in use by SPUs
- **SC-005**: Users can configure a complete attribute template (5 attributes) for a category in under 5 minutes
- **SC-006**: Category tree loads and displays initial structure (up to 500 nodes) within 3 seconds
- **SC-007**: Category search returns results and expands matching paths within 2 seconds for trees with up to 1000 nodes
- **SC-008**: 95% of authorized users successfully complete category creation on first attempt without errors
- **SC-009**: System maintains data integrity with zero unauthorized deletions of categories in use
- **SC-010**: Attribute template configuration reduces SPU creation data errors by at least 30% compared to free-form input

## Assumptions

- Category codes are system-generated or managed externally, users do not need to manually create or edit codes
- Category hierarchy is limited to three levels (Level 1, Level 2, Level 3) and does not support deeper nesting
- Category status changes (enable/disable) only affect new SPU creation, existing SPUs retain their category references
- Attribute templates are optional - categories can exist without attribute templates
- Attribute optional values for select types are stored as text lists, with comma or line-break separation
- User roles and permissions are managed by a separate authorization system
- SPU management system is aware of category attribute templates and can apply them during SPU creation
- Category tree supports up to 1000 nodes without significant performance degradation
- Category deletion is a permanent operation with no soft-delete or recovery mechanism
- All category operations are logged for audit purposes (implementation detail, not in spec)

## Dependencies

- **SPU Management System**: Category management serves as master data for SPU creation. The SPU system must be able to query categories, check category status, and apply attribute templates during SPU creation.
- **User Authentication and Authorization System**: Category management requires role-based access control. The system must provide user role information (Master Data Administrator, Product Administrator, etc.) to determine operation permissions.
- **Data Persistence Layer**: Category data, attribute templates, and their relationships must be persisted. The system must support hierarchical queries and efficient tree structure retrieval.

## Out of Scope

- Category import/export functionality (bulk operations)
- Category versioning or history tracking
- Category approval workflows
- Category usage analytics or reporting
- Category migration or batch update tools
- Advanced search filters beyond name search
- Category relationship visualization beyond tree structure
- Attribute template inheritance or sharing between categories
- Category-level business rules or validation beyond basic field validation
