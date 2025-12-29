# Cinema_Bussiness_Center_Platform Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-21

## Project Rules (宪章规则)

项目遵循 `.specify/memory/constitution.md` 宪章规范，详细规则见 `.claude/rules/` 目录：

| 规则 | 说明 |
|------|------|
| 01-branch-spec-binding | 功能分支与规格绑定 |
| 02-test-driven-development | 测试驱动开发 |
| 03-frontend-b-tech-stack | B端技术栈（React+AntD） |
| 04-frontend-c-tech-stack | C端技术栈（Taro 多端） |
| 05-state-management | 状态管理（Zustand+TanStack Query） |
| 06-code-quality | 代码质量与工程化 |
| 07-backend-architecture | 后端架构（Spring Boot+Supabase） |
| 08-api-standards | API 响应格式标准 |
| 09-quality-standards | 质量标准（性能/安全/可访问性） |

## Active Technologies
- TypeScript 5.0.4 + React 18.2.0, Ant Design 6.1.0, Zustand, TanStack Query, React Router 6 (005-sku-management)
- 无后端存储，前端Mock数据服务 (005-sku-management)
- TypeScript 5.0.4 + React 18.2.0, Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 6, React Hook Form 7.68.0, Zod 4.1.13 (005-sku-management)
- 前端 Mock 数据（内存存储），不依赖后端数据库 (005-sku-management)
- TypeScript 5.0.4, React 18.2.0 + Vite 6.0.7, Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 6, React Hook Form 7.68.0, Zod 4.1.13 (006-frontend-structure-refactor)
- N/A (前端文件系统重构，不涉及数据存储) (006-frontend-structure-refactor)
- TypeScript 5.9.3 + React 19.2.0, Ant Design 6.1.0, TanStack Query 5.90.12, Zustand 5.0.9, MSW 2.12.4, React Router 7.10.1 (007-category-management)
- Mock data (in-memory state + MSW handlers + localStorage for persistence) (007-category-management)
- Python 3.8+ (001-claude-cleanup-script)
- Python 3.8+（与项目 CLAUDE.md 中指定的 Python 3.8+ 一致） (001-claude-cleanup-script)
- TypeScript 5.9.3 + React 19.2.0 + Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4 (001-brand-management)
- Python 3.8+ (标准库 + pathlib, re, shutil) + 无外部依赖，仅使用 Python 标准库 (011-uninstall-env-cleanup)
- 文件系统操作（读取/写入 ~/.zshrc 等配置文件） (011-uninstall-env-cleanup)
- Python 3.8+ (标准库 + argparse) (012-set-config-enhancement)
- TypeScript 5.9.3 + React 19.2.0 + Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4, React Hook Form 7.68.0, Zod 4.1.13, dayjs 1.11.19 (013-schedule-management)
- TypeScript 5.9.3 + React 19.2.0 (frontend), Java 21 + Spring Boot 3.x (backend) + Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4, Spring Boot Web, Supabase Java/HTTP clien (014-hall-store-backend)
- Supabase (PostgreSQL, Auth, Storage) 作为主要后端数据源，必要时前端使用 Mock data（in-memory state + MSW handlers + localStorage）进行开发模拟 (014-hall-store-backend)
- Supabase (PostgreSQL) - 扩展 stores 表添加 province, city, district, address, phone 字段 (020-store-address)
- Supabase PostgreSQL数据库作为主要数据源，包含以下表结构： (016-store-reservation-settings)
- Supabase PostgreSQL 作为主要数据源，扩展 stores 表添加 status 字段（枚举类型 ACTIVE/INACTIVE），新增 store_operation_logs 表用于审计日志 (022-store-crud)
- 无需数据存储，纯前端配置 (F001-miniapp-tab-bar)
- Supabase (PostgreSQL, Auth, Storage) 作为主要后端数据源，必要时前端使用 Mock data（in-memory state + MSW handlers + localStorage for B端 / Taro.setStorage for C端）进行开发模拟 (U001-reservation-order-management)
- 无需数据存储(纯UI样式优化) (U002-reservation-card-ui-compact)
- Supabase (PostgreSQL) - 使用现有 `inventory` 表，关联 `skus`、`stores`、`categories` 表 (P003-inventory-query)
- Supabase (PostgreSQL) - 扩展现有 `store_inventory` 表，新增 `inventory_adjustments`、`adjustment_reasons`、`approval_records` 表 (P004-inventory-adjustment)
- Supabase PostgreSQL 作为主要数据源，扩展现有表结构: (P005-bom-inventory-deduction)

- (003-inventory-management)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

# Add commands for 

## Code Style

: Follow standard conventions

## Recent Changes
- P005-bom-inventory-deduction: Added Supabase PostgreSQL 作为主要数据源，扩展现有表结构:
- O003-beverage-order: Added Supabase (PostgreSQL, Auth, Storage) 作为主要后端数据源，必要时前端使用 Mock data（in-memory state + MSW handlers + localStorage for B端 / Taro.setStorage for C端）进行开发模拟
- O001-product-order-list: Added Supabase (PostgreSQL, Auth, Storage) 作为主要后端数据源，必要时前端使用 Mock data（in-memory state + MSW handlers + localStorage for B端 / Taro.setStorage for C端）进行开发模拟


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
