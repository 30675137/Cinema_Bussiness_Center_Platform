# Cinema_Bussiness_Center_Platform Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-11

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
- TypeScript 5.9.3 + React 19.2.0 (frontend), Java 21 + Spring Boot 3.3.5 (backend) (014-hall-store-backend)
- Supabase PostgreSQL 作为主要数据源，包含 `stores` 和 `halls` 两张主数据表；前端开发时可使用 MSW 模拟 API (014-hall-store-backend)
- Supabase PostgreSQL 作为主要数据源，新增 `store_reservation_settings` 表与 `stores` 表建立一对一关系；前端开发时可使用 MSW 模拟 API (015-store-reservation-settings)
- TypeScript 5.9.3 + React 19.2.0 (frontend), Java 17 + Spring Boot 3.3.5 (backend) + Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4, Spring Boot Web, Spring WebFlux, Supabase Java/HTTP client (WebClient) (016-activity-type)
- Supabase (PostgreSQL) 作为主要后端数据源，前端使用 MSW handlers + localStorage 进行开发模拟 (016-activity-type)

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
- 016-activity-type: Added TypeScript 5.9.3 + React 19.2.0 (frontend), Java 17 + Spring Boot 3.3.5 (backend) + Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4, Spring Boot Web, Spring WebFlux, Supabase Java/HTTP client (WebClient)
- 015-store-reservation-settings: Added TypeScript 5.9.3 + React 19.2.0 (frontend), Java 21 + Spring Boot 3.3.5 (backend)
- 014-hall-store-backend: Added TypeScript 5.9.3 + React 19.2.0 (frontend), Java 21 + Spring Boot 3.3.5 (backend)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
