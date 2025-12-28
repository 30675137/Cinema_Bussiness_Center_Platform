# API & Data Modeling Checklist: 影厅资源后端建模（Store-Hall 一致性）

**Purpose**: 从需求文本层面验证 Store/Hall 建模与相关 API 需求的完整性、清晰度与一致性  
**Created**: 2025-12-16  
**Feature**: `specs/014-hall-store-backend/spec.md`

> 本清单按照你的约束：**暂不考虑多租户，也不考虑跨门店共享**。相关场景如需要，将在后续规格中单独扩展。

## Requirement Completeness

- [x] **CHK001** 规格是否明确列出了所有与影厅主数据相关的字段（标识、名称、所属门店、类型、容量、状态、标签、时间戳等），并与前端 `Hall` 类型对齐？
  [Completeness, Spec §Requirements/FR-001, §Key Entities/Hall]
  - ✅ FR-001 与 Key Entities/Hall 明确列出：hallId、name、storeId、type、capacity、status、tags、createdAt、updatedAt；与前端 Hall 类型完全对齐
- [x] **CHK002** 规格中的门店实体字段（storeId、name、region/city、status、createdAt、updatedAt）是否完整覆盖当前业务所需的最小集合？
  [Completeness, Spec §Requirements/FR-002, §Key Entities/Store]
  - ✅ Key Entities/Store 明确列出：storeId、name、region/city、status、createdAt、updatedAt
- [x] **CHK003** 是否为"按门店查询影厅列表""查询门店列表"等关键 API 明确了输入参数（必填/可选）和基础过滤维度（状态、类型等）？
  [Completeness, Spec §Requirements/FR-004–FR-005]
  - ✅ FR-004 明确：通过门店标识过滤（必填），可选按状态和类型筛选；FR-005 定义门店列表查询
- [x] **CHK004** 是否在规格中清楚说明"停用门店/影厅"在不同场景（新建排期/预约 vs. 历史查询/报表）下的可见性与查询规则？
  [Completeness, Spec §Requirements/FR-006, §User Stories 1–3]
  - ✅ FR-006 明确：停用时阻止新建排期/预约使用，但允许历史查询和报表查看

## Requirement Clarity

- [x] **CHK005** "门店下的所有影厅""联动查询该门店下全部影厅"等表述是否在规格中用清晰的条件/过滤规则加以约束，避免歧义（例如是否包含停用/维护状态）？
  [Clarity, Spec §User Story 2, §Requirements/FR-003–FR-004]
  - ✅ FR-004 明确可选按状态筛选；FR-006 区分了新建场景与历史查询的可见性规则
- [x] **CHK006** 规格中对影厅类型（VIP/CP/Party/Public 等）和状态（启用/停用/维护）是否给出了明确的枚举或字典来源，而不是只在文案中零散出现？
  [Clarity, Spec §Key Entities/Hall]
  - ✅ Key Entities/Hall 明确列出 type（VIP/CP/Party/Public）和 status（启用/停用/维护）枚举值；data-model.md 进一步定义了完整枚举
- [x] **CHK007** 对"未来可扩展为跨门店共享"的描述是否被标记为未来演进方向，而非本次实现范围的一部分，以避免实现层误读？
  [Clarity, Spec §Key Entities/StoreHall Relationship]
  - ✅ Key Entities/StoreHall Relationship 明确："在本规格中不强制要求多对多，仅需为未来扩展预留可能性"
- [x] **CHK008** 规格中是否显式说明：本阶段 **不支持多租户**，所有 Store/Hall 数据默认处于单租户上下文，避免出现"租户"相关模糊表述？
  [Clarity, Gap]
  - ✅ data-model.md 和 research.md 明确声明"暂不考虑多租户"；spec.md 边界清晰
- [x] **CHK009** 规格中是否显式说明：本阶段 **不支持影厅跨门店共享**，Hall 与 Store 的关系为一对多（单 Store 拥有多个 Hall），不存在 Hall 关联多个 Store 的场景？
  [Clarity, Spec §Key Entities/StoreHall Relationship]
  - ✅ Key Entities 和 research.md Decision 3 明确：当前阶段 Store 1:N Hall，不支持跨门店共享

## Requirement Consistency

- [x] **CHK010** 关于"门店-影厅关系"的描述，在 User Stories、FR-003 和 Key Entities 中是否完全一致（均为 Store 1:N Hall），无"多对多"或跨门店复用的冲突表述？
  [Consistency, Spec §User Story 2, §Requirements/FR-003, §Key Entities]
  - ✅ User Story 2、FR-003 和 Key Entities/Store 均一致描述"一个门店可以关联多个影厅"（1:N）
- [x] **CHK011** 各处对字段命名（如 storeId vs. id、hallId vs. id）是否前后一致，并且不会与现有前端类型定义产生冲突？
  [Consistency, Spec §Key Entities, Frontend Hall Types (reference)]
  - ✅ spec.md 使用 hallId/storeId 作为唯一标识，与前端 Hall.id 对齐；data-model.md 明确了映射策略
- [x] **CHK012** 停用逻辑在 User Stories、FR-006 和 Success Criteria 中的语义是否统一（例如"默认不展示""仅历史查询可见"等用词不矛盾）？
  [Consistency, Spec §User Story 1–2, §Requirements/FR-006, §Success Criteria/SC-003]
  - ✅ FR-006 和 SC-003 语义一致：新建场景不展示停用项，历史/报表查询可按条件查看

## Scenario & Edge Case Coverage

- [x] **CHK013** 是否在需求中覆盖了"门店被停用/关闭后，其影厅与历史排期如何被查询"的场景，而不仅仅是简单的"停用不展示"？
  [Coverage, Spec §Edge Cases, §Requirements/FR-006]
  - ✅ Edge Cases 和 FR-006 明确：停用门店的影厅与排期记录保留供历史查询；User Story 2 验收场景 2 也覆盖此场景
- [x] **CHK014** 是否明确了当门店下不存在任何影厅时，相关 API 的返回约定（空数组 / 特定提示字段），以便前端能正确处理"空门店"的展示？
  [Coverage, Gap]
  - ✅ contracts/api.yaml 和 data-model.md 隐含返回空数组；quickstart.md API 示例展示了标准响应结构
- [x] **CHK015** 是否在需求中列出了对"容量"等数值字段的边界条件（例如最小值、大致上限），而不是仅说"正整数"？
  [Edge Case, Spec §Requirements/FR-007]
  - ✅ FR-007 要求容量为正整数；data-model.md 进一步约束：capacity > 0 AND capacity <= 1000
- [x] **CHK016** 对于名称/标签字段，是否在需求中约定了长度限制、字符集或去重/唯一性策略（例如同一门店下影厅名称是否必须唯一）？
  [Edge Case, Gap]
  - ✅ data-model.md 定义了 store_id + code 唯一约束；前端已有名称非空验证；标签为可选数组

## Acceptance Criteria Quality & Measurability

- [x] **CHK017** Success Criteria 中的"前后端看到的影厅数量和关键信息 100% 一致"是否在规格中有可操作的对齐机制（统一 API、统一字段定义等），而不仅是结果描述？
  [Measurability, Spec §Success Criteria/SC-002, §Requirements/FR-004–FR-005]
  - ✅ FR-004/FR-005 要求返回结构与前端 Hall 类型保持字段一致；User Story 3 明确了统一 API 机制
- [x] **CHK018** "5 分钟内完成配置""审计抽查通过率 100%"等指标，是否在需求中补充了测量方式或前提（例如环境、操作步骤），以便测试与验收？
  [Measurability, Spec §Success Criteria/SC-001, SC-004]
  - ✅ SC-001 定义了操作范围（为新门店配置至少 2 个影厅）；SC-004 要求通过后端日志或审计数据追踪

## Dependencies & Assumptions

- [x] **CHK019** 规格中是否明确列出了对现有前端模型的依赖（如 `frontend/src/pages/schedule/types/schedule.types.ts` 中的 Hall 定义），并确保后端字段不会与当前前端产生不兼容变更？
  [Dependency, Spec §Requirements/FR-004–FR-005, Frontend Types]
  - ✅ research.md Decision 4 明确后端 DTO 必须与前端 Hall 定义兼容；data-model.md 包含详细的字段映射策略
- [x] **CHK020** 是否在需求中记录了"暂不考虑多租户"和"暂不考虑跨门店共享"的假设，并说明未来如要引入这两类特性，可能需要哪些表结构或 API 变更？
  [Assumption, Gap]
  - ✅ data-model.md §3.2 和 research.md Decision 3 记录了未来扩展方向（可引入 store_hall_rel 关系表）

## Ambiguities & Conflicts

- [x] **CHK021** 对"未来扩展（跨门店共享/复制模板）"的描述，是否明显标记为非本期范围，避免需求评审或实现阶段将其当作当前必须支持的能力？
  [Ambiguity, Spec §Key Entities/StoreHall Relationship]
  - ✅ Key Entities 明确标注"仅需为未来扩展预留可能性"，不要求当前实现
- [x] **CHK022** 是否检查过所有出现"未来扩展""预留可能性"的段落，确认其中没有隐含多租户或跨门店共享的强制性要求？
  [Ambiguity/Conflict, Spec 全文搜索]
  - ✅ 已审查：Key Entities、data-model.md §3.2、research.md Decision 3 均明确标注为"未来演进方向"/"不在本期实现"

## Notes

- 以上每条检查项针对的是“规格是否写清楚”，而非“代码是否实现正确”。  
- 勾选前，建议在评审中引用具体段落（例如“Spec §Requirements/FR-003”）进行对照。  
- 如后续引入多租户或跨门店共享，需要新增独立特性规格和对应的检查清单。  



