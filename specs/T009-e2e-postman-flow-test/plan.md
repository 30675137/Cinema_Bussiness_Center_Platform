# Implementation Plan: E2E Postman 业务流程测试

**Branch**: `T009-e2e-postman-flow-test` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/T009-e2e-postman-flow-test/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

创建一个完整的 Postman Collection，用于端到端测试从 SKU 主数据创建、BOM 配方配置、采购入库到销售订单下单的完整业务流程。测试覆盖正常流程、库存不足、订单取消等关键场景，确保系统各模块协同工作正常，库存扣减逻辑正确。技术方案使用 Postman Collection + Environment Variables + Test Scripts，实现自动化的 API 测试和数据准备。

## Technical Context

**Language/Version**: Postman Collection v2.1 + JavaScript (Postman Test Scripts)  
**Primary Dependencies**: 
- Postman Desktop App v10.x+ / Postman CLI (Newman)
- 已存在的后端 API (Spring Boot + Supabase)
- 已完成的模块: O012-order-inventory-reservation, P001-sku-master-data, P005-bom-inventory-deduction

**Storage**: 
- 测试数据存储: Postman Environment Variables (动态保存资源 ID)
- 后端数据库: Supabase PostgreSQL (由被测系统管理)

**Testing**: 
- Postman Test Scripts (JavaScript) - 验证响应状态码、响应体字段
- Postman Pre-request Scripts - 数据准备和清理
- Postman Collection Runner - 批量执行测试场景

**Target Platform**: 
- 本地开发环境 (localhost:8080)
- 测试环境 (如适用)
- Postman Cloud (团队共享)

**Project Type**: API Testing Collection (E2E 测试工具)  

**Performance Goals**: 
- 单个测试场景执行时间 < 30 秒
- 完整测试套件执行时间 < 5 分钟
- 环境变量自动保存成功率 100%

**Constraints**: 
- 测试必须幂等: 可重复执行而不影响测试结果
- Setup & Teardown 必须完整: 测试前准备数据，测试后清理数据
- 无需 UI 操作: 纯 API 测试，不涉及前端界面
- 测试数据隔离: 使用固定的测试门店 ID 和分类 ID

**Scale/Scope**: 
- 5 个测试场景 (正常流程、库存不足、订单取消、边界值、多品订单)
- 约 20-30 个 API 请求 (包含 Setup、测试、Teardown)
- 1 个 Postman Collection 文件 + 1 个 Environment 文件
- 测试数据: 莫吉托配方 (3 种原料 + 1 种成品 + BOM 配方)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ **一、功能分支绑定 (Feature Branch Binding)** - PASS
- ✅ 分支命名: `T009-e2e-postman-flow-test` (符合 `T###-<slug>` 格式)
- ✅ Spec 目录: `specs/T009-e2e-postman-flow-test/spec.md` 存在
- ✅ 模块前缀: `T` (Tool/Infrastructure - E2E 测试工具)
- ✅ Active Spec 绑定: 当前分支与 spec 目录一致

### ✅ **二、代码归属标识 (Code Attribution Marking)** - N/A
- 🟡 **N/A**: Postman Collection 是 JSON 配置文件，不是代码文件，无需 `@spec` 注释
- 🟡 **替代方案**: Collection 文件命名包含 spec 标识符 (T009-e2e-postman-flow-test.postman_collection.json)

### ✅ **三、测试驱动开发 (Test-Driven Development)** - ADAPTED
- ✅ **本 spec 就是测试**: E2E 测试工具的开发本身就是为了验证系统功能
- ✅ **验证策略**: 
  - Postman Collection Runner 执行所有测试场景
  - 每个请求包含 Test Scripts 验证响应正确性
  - 自动化验证环境变量保存成功
- ✅ **覆盖率目标**: 100% API 端点覆盖，100% 场景覆盖

### 🟡 **四、组件化架构 (Component-Based Architecture)** - N/A
- 🟡 **N/A**: Postman Collection 不涉及前端 UI 组件开发

### 🟡 **五、前端技术栈分层 (Frontend Tech Stack Layering)** - N/A
- 🟡 **N/A**: 纯 API 测试，不涉及 B端或 C端前端开发

### 🟡 **六、数据驱动与状态管理 (Data-Driven & State Management)** - ADAPTED
- ✅ **数据驱动**: 使用 Postman Environment Variables 管理测试数据状态
- ✅ **状态管理**: 环境变量存储资源 ID，实现跨请求数据传递
- ✅ **持久化**: Environment 文件可导出并共享给团队

### ✅ **七、代码质量与工程化 (Code Quality & Engineering Excellence)** - ADAPTED
- ✅ **脚本质量**: Postman Test Scripts 遵循 JavaScript 编码规范
- ✅ **版本控制**: Collection 和 Environment 文件纳入 Git 管理
- ✅ **文档完整**: 提供 quickstart.md 和使用指南
- 🟡 **N/A**: 无需 ESLint/Prettier（Postman 自带格式化）

### 🟡 **八、Claude Code Skills 开发规范** - N/A
- 🟡 **N/A**: 本 spec 不是开发 Claude Code skill，而是 E2E 测试工具

### 🟡 **九、认证与权限要求分层** - ADAPTED
- ✅ **B端策略**: 测试环境暂不考虑认证与权限（与实现一致）
- ✅ **API 调用**: 直接调用后端 API，无需 Token 验证

### 🟡 **十、Lark PM 项目管理集成规则** - OPTIONAL
- 🟡 **可选**: 如项目使用 Lark PM，需在实施阶段同步任务状态

---

### ✅ **后端架构与技术栈** - DEPENDENT
- ✅ **依赖验证**: 依赖已存在的 Spring Boot + Supabase 后端服务
- ✅ **API 可用性**: 测试执行前需确保后端服务运行
- ✅ **API 响应格式**: 遵循项目统一的 ApiResponse 格式

### ✅ **API 异常编号规范** - VALIDATED
- ✅ **错误码验证**: Test Scripts 验证错误响应中的 error 编号 (如 `ORD_BIZ_002`)
- ✅ **编号格式**: 验证错误编号符合 `<模块>_<类别>_<序号>` 格式

### ✅ **API 测试规范** - THIS SPEC
- ✅ **本 spec 就是 API 测试规范的实施**
- ✅ **文件存放**: `specs/T009-e2e-postman-flow-test/postman/`
- ✅ **文件命名**: T009-e2e-postman-flow-test.postman_collection.json
- ✅ **测试覆盖**: 所有流程相关 API 端点

---

### 🎯 **Constitution Check Summary**

| 规则 | 状态 | 说明 |
|------|------|------|
| 功能分支绑定 | ✅ PASS | T009 命名符合宪章 |
| 代码归属标识 | 🟡 N/A | JSON 配置文件无需注释 |
| 测试驱动开发 | ✅ ADAPTED | E2E 测试本身就是验证 |
| 组件化架构 | 🟡 N/A | 不涉及 UI 开发 |
| 前端技术栈 | 🟡 N/A | 纯 API 测试 |
| 数据驱动管理 | ✅ ADAPTED | Environment Variables |
| 代码质量工程 | ✅ ADAPTED | Git + Docs |
| Skills 开发规范 | 🟡 N/A | 非 skill 开发 |
| 认证权限分层 | ✅ ADAPTED | 暂不考虑认证 |
| Lark PM 集成 | 🟡 OPTIONAL | 根据项目需要 |
| 后端技术栈 | ✅ DEPENDENT | 依赖后端服务 |
| API 异常规范 | ✅ VALIDATED | 验证错误编号 |
| API 测试规范 | ✅ THIS SPEC | 本 spec 就是实施 |

**结论**: ✅ **All Gates PASS** - 可以进入 Phase 0 研究阶段

## Project Structure

### Documentation (this feature)

```text
specs/T009-e2e-postman-flow-test/
├── plan.md              # 本文件 (/speckit.plan 输出)
├── research.md          # Phase 0 输出 (/speckit.plan 命令)
├── data-model.md        # Phase 1 输出 (/speckit.plan 命令)
├── quickstart.md        # Phase 1 输出 (/speckit.plan 命令)
├── contracts/           # Phase 1 输出 (/speckit.plan 命令)
│   └── api-endpoints.md # 测试涉及的 API 端点文档
├── postman/             # Postman 测试文件目录
│   ├── T009-e2e-postman-flow-test.postman_collection.json  # 主 Collection
│   ├── T009-local.postman_environment.json                  # 本地环境
│   ├── T009-test.postman_environment.json                   # 测试环境(可选)
│   ├── README.md                                            # 使用说明
│   └── test-data.csv                                        # 数据驱动测试(可选)
└── business-clarification.md  # 业务概念澄清文档(强制)
```

### Source Code (repository root)

```text
# 此 spec 不生成代码，仅生成 Postman Collection 文件
# Postman Collection 是 JSON 配置文件，存放在 specs/T009-e2e-postman-flow-test/postman/ 目录

# 依赖的后端代码位于：
backend/
├── src/main/java/com/cinema/
│   ├── product/         # P001-sku-master-data (已存在)
│   ├── bom/             # P005-bom-inventory-deduction (已存在)
│   ├── order/           # O012-order-inventory-reservation (已存在)
│   └── procurement/     # 采购入库模块 (假设存在)
└── ...

# 测试执行时访问的 API 端点：
# - POST /api/spu                          # 创建 SPU
# - POST /api/sku                          # 创建 SKU
# - POST /api/bom                          # 创建 BOM 配方
# - POST /api/purchase-orders              # 创建采购订单
# - POST /api/purchase-orders/{id}/receive # 采购入库
# - POST /api/orders                       # 创建销售订单
# - POST /api/orders/{id}/cancel           # 取消订单
# - GET  /api/stores/{id}/inventory        # 查询库存
```

**Structure Decision**: 
- **选择**: API Testing Collection (纯测试工具，不生成业务代码)
- **文件位置**: Postman Collection 和 Environment 文件存放在 `specs/T009-e2e-postman-flow-test/postman/` 目录
- **依赖验证**: 测试执行前需确保后端服务 (Spring Boot) 已启动并运行在 `localhost:8080`
- **文档组织**: quickstart.md 提供快速开始指南，README.md 提供详细使用说明

## Complexity Tracking

> **不需要填写** - 没有 Constitution Check 违规项，所有规则都已通过或标记为 N/A。
