# Feature Specification: 前端路径结构优化

**Feature Branch**: `006-frontend-structure-refactor`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "目前 这个前端路径比较混乱需要优化 将根目录 src/ tests/ 以及 frontend/Cinema_Operation_Admin/ 下面的路径直接copy到 frontend/ 路径下然后删除 Cinema_Operation_Admin 路径"

## 范围说明

本功能专注于前端项目路径结构的优化和整合，将分散在多个目录下的源代码和测试文件统一合并到 `frontend/` 目录下，消除路径混乱，简化项目结构，提高代码可维护性。

## Clarifications

### Session 2025-01-27

- Q: 测试验证策略 - 每个阶段后需要运行什么级别的测试验证？ → A: 最小验证 - 只检查文件复制成功和路径别名配置正确，不运行任何测试
- Q: 路径标记澄清 - 用户输入中的 @frontend 标记含义 → A: @frontend 不是路径别名，应理解为 frontend/ 目录路径。目标路径是 frontend/src/ 和 frontend/tests/，不是路径别名

## 实现说明

- **重构范围**：涉及文件移动、路径合并、导入路径更新、配置文件调整
- **数据来源**：所有文件从现有目录复制合并，不涉及数据迁移
- **兼容性**：确保重构后所有功能正常工作，不破坏现有功能
- **文档语言**：所有文档内容使用中文编写

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 合并根目录 src 和 tests 到 frontend (Priority: P1)

开发人员需要将根目录下的 `src/` 和 `tests/` 目录内容合并到 `frontend/src/` 和 `frontend/tests/` 目录下，统一前端代码结构。

**Why this priority**: 这是路径整合的第一步，必须先完成根目录文件的合并，才能进行后续的 Cinema_Operation_Admin 目录合并。

**Independent Test**: 可以独立测试通过检查文件是否成功复制到目标目录，验证导入路径别名配置是否正确（检查 vite.config.ts 和 tsconfig.json），确认文件结构正确。不运行任何测试或构建命令。

**Acceptance Scenarios**:

1. **Given** 根目录存在 `src/` 和 `tests/` 目录，**When** 执行合并操作，**Then** 所有文件成功复制到 `frontend/src/` 和 `frontend/tests/` 对应位置
2. **Given** 文件已合并到 frontend 目录，**When** 检查导入路径，**Then** 所有使用 `@/` 别名的导入路径正确解析到 `frontend/src/`
3. **Given** 合并操作完成，**When** 检查文件复制结果和路径别名配置，**Then** 所有文件成功复制，路径别名配置正确指向新的目录结构
4. **Given** 文件合并完成，**When** 检查配置文件（vite.config.ts, tsconfig.json），**Then** 路径别名配置正确指向新的目录结构

---

### User Story 2 - 合并 Cinema_Operation_Admin 目录到 frontend (Priority: P1)

开发人员需要将 `frontend/Cinema_Operation_Admin/src/` 和 `frontend/Cinema_Operation_Admin/tests/` 目录内容合并到 `frontend/src/` 和 `frontend/tests/` 目录下，消除嵌套目录结构。

**Why this priority**: Cinema_Operation_Admin 目录的合并是路径优化的核心目标，必须完成才能实现统一的目录结构。

**Independent Test**: 可以独立测试通过检查文件是否成功合并，验证是否存在文件冲突，更新所有导入路径，检查路径别名配置是否正确。不运行任何测试或构建命令。

**Acceptance Scenarios**:

1. **Given** Cinema_Operation_Admin 目录存在，**When** 执行合并操作，**Then** 所有文件成功复制到 `frontend/src/` 和 `frontend/tests/` 对应位置
2. **Given** 存在同名文件，**When** 执行合并操作，**Then** 系统能够识别冲突并采用合理的合并策略（保留最新版本或手动合并）
3. **Given** 文件已合并，**When** 更新导入路径，**Then** 所有 `@/` 别名导入正确解析，不再需要 `@admin/` 别名
4. **Given** 合并完成，**When** 启动开发服务器，**Then** 应用正常启动，所有页面和功能正常工作

---

### User Story 3 - 更新配置文件和路径别名 (Priority: P1)

开发人员需要更新所有配置文件（vite.config.ts, tsconfig.json, package.json 等），移除 Cinema_Operation_Admin 相关的路径配置，统一使用 frontend 目录结构。

**Why this priority**: 配置文件更新是确保构建工具和开发工具能够正确工作的关键，必须在文件合并后立即完成。

**Independent Test**: 可以独立测试通过检查配置文件内容，验证路径别名配置是否正确，确认配置文件格式有效。不运行任何构建或测试命令。

**Acceptance Scenarios**:

1. **Given** 文件合并完成，**When** 更新 vite.config.ts，**Then** 移除 `@admin` 别名，`@` 别名正确指向 `frontend/src`
2. **Given** 文件合并完成，**When** 更新 tsconfig.json，**Then** 路径映射配置正确，TypeScript 能够解析所有导入
3. **Given** 配置文件已更新，**When** 检查配置文件内容，**Then** 路径别名配置正确，配置文件格式有效
4. **Given** 配置文件已更新，**When** 检查路径映射配置，**Then** 所有路径别名正确指向新的目录结构

---

### User Story 4 - 删除 Cinema_Operation_Admin 目录 (Priority: P2)

开发人员需要在确认所有文件已成功合并且功能正常后，删除 `frontend/Cinema_Operation_Admin/` 目录，完成路径结构优化。

**Why this priority**: 目录删除是最后一步，必须在确认所有功能正常后才能执行，避免数据丢失。

**Independent Test**: 可以独立测试通过验证目录已删除，检查文件系统确认目录不再存在，检查 Git 历史记录确保删除操作可追溯。不运行任何测试或构建命令。

**Acceptance Scenarios**:

1. **Given** 所有文件已合并且功能验证通过，**When** 删除 Cinema_Operation_Admin 目录，**Then** 目录成功删除，不再存在于文件系统中
2. **Given** Cinema_Operation_Admin 目录已删除，**When** 检查文件系统和目录结构，**Then** 目录已成功删除，项目结构符合预期
3. **Given** 目录已删除，**When** 检查 Git 提交记录，**Then** 删除操作已记录，可以通过版本控制追溯

---

### Edge Cases

- 当合并时遇到同名文件冲突时，如何处理？（保留最新版本、手动合并、或重命名）
- 当某些文件在 Cinema_Operation_Admin 中有但 frontend 中没有时，如何确保不丢失？
- 当某些文件在 frontend 中有但 Cinema_Operation_Admin 中没有时，如何确保不覆盖？
- 当配置文件（如 package.json）存在差异时，如何合并依赖项？
- 当测试配置文件（playwright.config.ts, vitest.config.ts）存在差异时，如何统一配置？

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统必须能够将根目录 `src/` 下的所有文件和子目录复制到 `frontend/src/` 对应位置
- **FR-002**: 系统必须能够将根目录 `tests/` 下的所有文件和子目录复制到 `frontend/tests/` 对应位置
- **FR-003**: 系统必须能够将 `frontend/Cinema_Operation_Admin/src/` 下的所有文件和子目录合并到 `frontend/src/` 对应位置
- **FR-004**: 系统必须能够将 `frontend/Cinema_Operation_Admin/tests/` 下的所有文件和子目录合并到 `frontend/tests/` 对应位置
- **FR-005**: 系统必须能够识别并处理同名文件冲突，提供明确的冲突解决策略
- **FR-006**: 系统必须更新所有源代码文件中的导入路径，将 `@admin/` 别名替换为 `@/` 别名
- **FR-007**: 系统必须更新所有相对路径导入，确保路径正确指向新的目录结构
- **FR-008**: 系统必须更新 `frontend/vite.config.ts`，移除 `@admin` 别名配置
- **FR-009**: 系统必须更新 `frontend/tsconfig.app.json`，移除 `@admin/*` 路径映射
- **FR-010**: 系统必须合并 `package.json` 文件，确保所有依赖项正确合并，不丢失任何依赖
- **FR-011**: 系统必须更新测试配置文件（playwright.config.ts, vitest.config.ts），确保测试路径正确
- **FR-012**: 系统必须更新路由配置文件，移除对 `@admin` 路径的引用
- **FR-013**: 系统必须在删除 Cinema_Operation_Admin 目录前，验证所有功能正常工作
- **FR-014**: 系统必须确保删除操作可追溯，通过 Git 提交记录保留历史

### Key Entities *(include if feature involves data)*

- **源代码文件**: 包含组件、页面、服务、工具函数等，需要移动和更新导入路径
- **测试文件**: 包含单元测试和 E2E 测试，需要移动和更新测试路径
- **配置文件**: 包含构建配置、TypeScript 配置、测试配置等，需要更新路径引用
- **依赖项**: package.json 中的依赖列表，需要合并确保不丢失任何依赖

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 所有源代码文件成功合并到 `frontend/src/` 目录，合并完成率达到 100%
- **SC-002**: 所有测试文件成功合并到 `frontend/tests/` 目录，测试文件完整性保持 100%
- **SC-003**: 所有导入路径更新完成，路径解析错误数量为 0
- **SC-004**: 文件复制和路径配置验证通过，验证成功率 100%
- **SC-005**: 文件结构验证通过，所有文件成功合并，路径别名配置正确
- **SC-006**: 配置文件验证通过，路径映射配置正确率 100%
- **SC-007**: 目录结构验证通过，项目结构符合目标结构
- **SC-008**: Cinema_Operation_Admin 目录成功删除，目录清理完成率 100%
- **SC-009**: 配置文件更新完成，配置错误数量为 0
- **SC-010**: 项目结构简化，目录层级减少至少 1 层，路径复杂度降低

## Assumptions

- 合并同名文件时，优先保留 `frontend/src/` 中的版本，`Cinema_Operation_Admin/src/` 中的版本作为参考
- 如果两个版本存在实质性差异，需要手动审查和合并
- package.json 的依赖项合并时，保留版本号较高的依赖
- 测试配置文件合并时，保留更完整的配置选项
- 所有路径别名更新后，不再需要 `@admin` 别名
- Git 历史记录会保留所有变更，可以通过版本控制追溯

## Dependencies

- 需要确保文件结构在合并前已明确
- 需要备份重要文件，以防合并过程中出现问题
- 需要团队成员了解重构计划，避免在重构期间进行冲突的更改
- 测试验证策略：使用最小验证（只检查文件复制成功和路径别名配置正确），不运行任何测试或构建命令
