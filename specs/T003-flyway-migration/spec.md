# Feature Specification: Flyway 数据库迁移管理

**Feature Branch**: `T003-flyway-migration`
**Created**: 2026-01-10
**Status**: Draft
**Input**: 整合 Flyway 数据库迁移脚本 - 建表和初始化数据，实现建表脚本统一管理、初始化数据脚本、版本化迁移管理、多环境支持
**Lark PM 技术债ID**: recv7UrsLoFKjP (严重程度: 🟠 高)

## Background

当前项目存在以下技术债：
- Flyway 虽已配置但处于禁用状态 (`enabled: false`)
- 存在大量 V### 迁移脚本但未被统一管理和执行
- 新环境搭建需要手动执行多个 SQL 脚本
- 缺少初始化数据（品牌、分类等基础数据）的标准化管理
- 多环境（dev/test/prod）配置不统一

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 新环境一键初始化 (Priority: P1)

作为开发人员，我希望在搭建新的开发/测试环境时，只需执行一条命令即可完成数据库表结构创建和基础数据初始化，避免手动执行多个 SQL 脚本。

**Why this priority**: 这是技术债的核心诉求，直接影响新成员入职效率和环境搭建时间。一键初始化可将环境搭建时间从数小时缩短至数分钟。

**Independent Test**: 在一个空的 PostgreSQL 数据库上启动应用，验证所有表结构被正确创建，且基础数据（品牌、分类）已初始化，应用可正常启动并提供 API 服务。

**Acceptance Scenarios**:

1. **Given** 一个空的 PostgreSQL 数据库, **When** 启动 Spring Boot 应用, **Then** Flyway 自动执行所有迁移脚本，创建完整的表结构
2. **Given** 迁移完成后, **When** 查询品牌表和分类表, **Then** 存在预设的初始化数据（如默认品牌、商品分类）
3. **Given** 迁移已执行过, **When** 再次启动应用, **Then** Flyway 跳过已执行的迁移，不重复执行

---

### User Story 2 - 数据库变更版本化管理 (Priority: P1)

作为开发人员，我希望所有数据库结构变更都通过版本化的迁移脚本管理，确保变更可追溯、可回滚、可在团队间同步。

**Why this priority**: 版本化管理是团队协作的基础，避免"在我机器上能跑"的问题。与一键初始化同等重要。

**Independent Test**: 创建一个新的迁移脚本，验证其按版本号顺序执行，且执行记录被持久化到 flyway_schema_history 表。

**Acceptance Scenarios**:

1. **Given** 已有 V001-V060 的迁移脚本, **When** 新增 V061 迁移脚本并启动应用, **Then** 仅执行 V061，不影响已执行的脚本
2. **Given** 两个开发人员分别创建 V065 和 V066 脚本, **When** 合并代码后启动应用, **Then** 按版本号顺序执行，无冲突
3. **Given** 查看 flyway_schema_history 表, **When** 列出所有记录, **Then** 可看到每个脚本的执行时间、版本号、校验和

---

### User Story 3 - 多环境配置支持 (Priority: P2)

作为运维人员，我希望 Flyway 支持不同环境（dev/test/prod）使用不同的配置，包括是否执行测试数据初始化、是否启用清理功能等。

**Why this priority**: 多环境支持是生产部署的前提，但可在核心功能完成后实现。

**Independent Test**: 通过切换 Spring Profile（dev/test/prod），验证不同环境使用对应的 Flyway 配置。

**Acceptance Scenarios**:

1. **Given** 使用 dev profile 启动, **When** Flyway 执行完成, **Then** 测试数据（如测试门店、测试商品）被初始化
2. **Given** 使用 prod profile 启动, **When** Flyway 执行完成, **Then** 仅创建表结构和必要的基础数据，不包含测试数据
3. **Given** 使用 test profile 启动, **When** Flyway 执行完成, **Then** 可使用 `flyway:clean` 清空数据库（仅 test 环境允许）

---

### User Story 4 - 现有迁移脚本整合 (Priority: P2)

作为开发人员，我希望现有的 60+ 个迁移脚本被正确整合，命名规范统一，无冗余或冲突。

**Why this priority**: 整合现有脚本是启用 Flyway 的必要步骤，但优先级低于核心功能验证。

**Independent Test**: 检查所有迁移脚本，验证命名符合 Flyway 规范，无重复版本号，脚本可按顺序成功执行。

**Acceptance Scenarios**:

1. **Given** 现有 V001-V064 系列脚本, **When** 进行命名规范检查, **Then** 所有脚本符合 `V{version}__{description}.sql` 格式
2. **Given** 存在日期格式脚本（V2026_01_xx）, **When** 整合后, **Then** 与数字版本脚本共存无冲突（使用 out-of-order 配置）
3. **Given** 存在重复功能的脚本, **When** 整合后, **Then** 冗余脚本被合并或标记为 ignored

---

### Edge Cases

- **数据库已有部分表结构时如何处理？** 使用 `baseline-on-migrate` 功能，从指定版本开始执行
- **迁移脚本执行失败时如何回滚？** 提供清晰的错误日志和手动回滚指引（Flyway 社区版不支持自动回滚）
- **生产环境如何安全执行迁移？** 启用 `validateOnMigrate` 和 `cleanDisabled`，禁止自动清理

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统必须在应用启动时自动执行 Flyway 数据库迁移
- **FR-002**: 系统必须支持版本化的迁移脚本，按版本号顺序执行
- **FR-003**: 系统必须记录每个迁移脚本的执行状态到 flyway_schema_history 表
- **FR-004**: 系统必须支持跳过已执行的迁移脚本，避免重复执行
- **FR-005**: 系统必须支持 baseline 功能，允许从指定版本开始管理现有数据库
- **FR-006**: 系统必须支持多环境配置（dev/test/prod），通过 Spring Profile 切换
- **FR-007**: 系统必须提供初始化数据脚本，包含品牌、分类等基础数据
- **FR-008**: 系统必须在生产环境禁用 `clean` 命令，防止误删数据
- **FR-009**: 系统必须支持乱序执行（out-of-order）以兼容多人并行开发
- **FR-010**: 系统必须在迁移失败时提供清晰的错误日志和回滚指引

### Key Entities

- **flyway_schema_history**: Flyway 内置表，记录迁移执行历史（版本号、描述、校验和、执行时间、执行状态）
- **Migration Scripts**: 迁移脚本文件，分为 V（Versioned）、R（Repeatable）类型
- **Seed Data**: 初始化数据，包含品牌（brands）、分类（categories）、默认门店等基础数据

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 新环境从零初始化到应用可用的时间不超过 5 分钟（不含依赖下载）
- **SC-002**: 所有现有迁移脚本可在干净数据库上按顺序成功执行
- **SC-003**: 团队成员更新代码后，数据库结构同步时间不超过 1 分钟
- **SC-004**: 迁移执行记录在 flyway_schema_history 中 100% 可追溯
- **SC-005**: dev/test/prod 三个环境使用独立配置，配置切换无需修改代码

## Assumptions

- 当前使用的 Supabase PostgreSQL 版本兼容 Flyway
- 现有迁移脚本无严重的语法错误或依赖问题
- 团队成员熟悉基本的 SQL 和数据库迁移概念
- 生产环境的数据库用户拥有必要的 DDL 权限

## Out of Scope

- 数据库性能优化（属于独立技术债）
- 多租户/分库分表支持
- 数据库监控和告警
- 敏感数据脱敏
