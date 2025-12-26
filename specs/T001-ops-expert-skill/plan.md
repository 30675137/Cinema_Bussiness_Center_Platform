# Implementation Plan: 运营专家技能 - 单位换算专家扩展

**Branch**: `T001-ops-expert-skill` | **Date**: 2025-12-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/T001-ops-expert-skill/spec.md`

## Summary

本功能扩展现有的运营专家 Skill (`.claude/skills/ops-expert/`)，新增单位换算专家能力，让运营人员能够通过对话方式进行单位换算计算、查询换算规则、配置换算关系。

**核心技术方案**：
1. 复用 P002-unit-conversion 模块的后端 API
2. 新增 6 个 Python 脚本处理单位换算操作
3. 扩展 SKILL.md 添加单位换算意图识别
4. 新增 unit-conversion.md 业务知识库

## Technical Context

**Language/Version**:
- Claude Code Skill: Markdown (SKILL.md) + Python 3.8+ (scripts)
- 后端 API: Java 21 + Spring Boot 3.x (复用 P002)

**Primary Dependencies**:
- Python: requests, supabase-py (复用现有 api_client.py)
- 后端: P002 unit-conversion API endpoints
- 数据库: unit_conversions 表 (V028 迁移已创建)

**Storage**:
- 复用 Supabase `unit_conversions` 表
- 不需要新建数据库表

**Testing**:
- Python 脚本单元测试 (pytest)
- 手动集成测试 (通过 /ops 命令验证)

**Target Platform**:
- Claude Code CLI (通过 /ops 命令触发)

**Project Type**:
- Claude Code Skill 扩展 (非前端/后端功能)

**Performance Goals**:
- 换算计算响应时间 < 2秒
- 换算路径查找支持最多 5 个中间步骤

**Constraints**:
- 必须复用 P002 后端 API，不重复实现算法
- 必须继承现有 Skill 的安全约束

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 T001-ops-expert-skill = active_spec 路径 T001-ops-expert-skill ✓
- [x] **测试驱动开发**: Python 脚本有对应的 pytest 测试 (tests/test_*.py)
- [N/A] **组件化架构**: 本功能为 Skill 扩展，不涉及前端组件
- [N/A] **前端技术栈分层**: 本功能为 Skill 扩展，不涉及前端
- [N/A] **数据驱动状态管理**: 本功能为 Skill 扩展，不涉及前端状态
- [x] **代码质量工程化**: Python 脚本遵循 PEP8，有类型注解
- [x] **后端技术栈约束**: 复用 P002 的 Spring Boot API，数据存储在 Supabase

### 性能与标准检查：
- [x] **性能标准**: 换算计算 < 2秒，路径查找支持 5 步
- [x] **安全标准**: 操作确认、循环依赖检测、BOM 引用检查
- [N/A] **可访问性标准**: 本功能为 CLI 交互，无 UI

## Project Structure

### Documentation (this feature)

```text
specs/T001-ops-expert-skill/
├── plan.md              # This file
├── research.md          # 研究文档 (已完成)
├── spec.md              # 功能规格 (已完成)
├── quickstart.md        # 开发快速入门
├── tasks.md             # 开发任务列表
└── checklists/
    └── requirements.md  # 需求检查清单 (已完成)
```

### Source Code (Skill 目录)

```text
.claude/skills/ops-expert/
├── SKILL.md                      # 主技能文件 (需更新)
├── scripts/
│   ├── api_client.py            # API 客户端 (已存在，需扩展)
│   ├── query_stores.py          # 门店查询 (已存在)
│   ├── query_conversions.py     # 换算规则查询 (新增)
│   ├── calculate_conversion.py  # 换算计算 (新增)
│   ├── create_conversion.py     # 创建规则 (新增)
│   ├── update_conversion.py     # 修改规则 (新增)
│   ├── delete_conversion.py     # 删除规则 (新增)
│   ├── validate_cycle.py        # 循环检测 (新增)
│   └── tests/
│       ├── test_api_client.py   # 客户端测试 (已存在)
│       └── test_conversion.py   # 换算脚本测试 (新增)
├── references/
│   ├── database-schema.md       # 数据库结构 (需更新)
│   ├── unit-conversion.md       # 单位换算知识库 (新增)
│   ├── scenario-package.md      # 场景包规则 (已存在)
│   └── ...
└── examples/
    └── common-queries.md        # 常见查询示例 (需更新)
```

### 依赖的外部模块

```text
# P002-unit-conversion 后端 API (复用)
backend/src/main/java/com/cinema/unitconversion/
├── controller/UnitConversionController.java   # REST API
├── service/UnitConversionService.java         # 业务逻辑
├── service/ConversionPathService.java         # 路径计算
└── repository/UnitConversionRepository.java   # 数据访问

# P002 前端工具函数 (参考算法实现)
frontend/src/features/unit-conversion/utils/
├── pathFinding.ts      # BFS 路径查找
├── cycleDetection.ts   # DFS 循环检测
└── rounding.ts         # 舍入规则
```

**Structure Decision**: 扩展现有 Claude Code Skill，不新建独立项目。Python 脚本调用 P002 后端 API 实现功能，知识库文档提供业务上下文。

## Implementation Phases

### Phase 1: 知识库扩展

1. 创建 `references/unit-conversion.md` 业务知识库
2. 更新 `references/database-schema.md` 添加 unit_conversions 表
3. 更新 `examples/common-queries.md` 添加单位换算示例

### Phase 2: Python 脚本开发

1. 扩展 `api_client.py` 添加单位换算 API 方法
2. 创建 `query_conversions.py` 查询换算规则
3. 创建 `calculate_conversion.py` 执行换算计算
4. 创建 `create_conversion.py` 创建换算规则
5. 创建 `update_conversion.py` 修改换算规则
6. 创建 `delete_conversion.py` 删除换算规则
7. 创建 `validate_cycle.py` 循环依赖检测

### Phase 3: SKILL.md 更新

1. 添加单位换算能力描述到核心能力部分
2. 添加单位换算意图识别到工作流程
3. 添加单位换算常见指令示例
4. 添加单位换算错误处理模式

### Phase 4: 测试与验证

1. 创建 `tests/test_conversion.py` 单元测试
2. 手动验证 /ops 命令的单位换算功能
3. 验证各种边界情况处理

## Complexity Tracking

> 本功能复杂度较低，无宪法违规需要解释

| 违规项 | 无 | - |
|--------|---|---|

## API Dependencies (P002)

| 端点 | 方法 | 功能 | 脚本调用 |
|------|------|------|----------|
| `/api/unit-conversions` | GET | 获取规则列表 | query_conversions.py |
| `/api/unit-conversions/{id}` | GET | 获取单条规则 | query_conversions.py |
| `/api/unit-conversions` | POST | 创建规则 | create_conversion.py |
| `/api/unit-conversions/{id}` | PUT | 更新规则 | update_conversion.py |
| `/api/unit-conversions/{id}` | DELETE | 删除规则 | delete_conversion.py |
| `/api/unit-conversions/stats` | GET | 统计信息 | query_conversions.py |
| `/api/unit-conversions/validate-cycle` | POST | 循环检测 | validate_cycle.py |
| `/api/unit-conversions/calculate-path` | POST | 路径计算 | calculate_conversion.py |

## Success Criteria Mapping

| 成功标准 | 实现方式 | 验证方法 |
|---------|---------|---------|
| SC-009: 换算准确率 100% | 复用 P002 API | 单元测试 + 手动验证 |
| SC-010: 路径查找 < 5秒 | 后端 BFS 算法 | 性能测试 |
| SC-011: 循环检测准确率 100% | 后端 DFS 算法 | 单元测试 |
| SC-012: 80% 选择对话配置 | 友好的对话交互 | 用户反馈 |
