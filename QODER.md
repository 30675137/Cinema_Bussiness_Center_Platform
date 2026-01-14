# Cinema_Bussiness_Center_Platform Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-14

## Active Technologies
- Supabase PostgreSQL (物料数据通过现有 materials 表) (M002-material-filter)
- Java 17 + Spring Boot 3.x + Spring Data JPA, Supabase PostgreSQL Client, Caffeine Cache, Jackson (feat/O012-order-inventory-reservation)
- Supabase PostgreSQL (复用 `store_inventory`, `inventory_reservations`, `bom_snapshots` 表,由P005创建) (feat/O012-order-inventory-reservation)

- TypeScript 5.9.3, React 19.2.0 (001-menu-panel)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.9.3, React 19.2.0: Follow standard conventions

## Recent Changes
- feat/O012-order-inventory-reservation: Added Java 17 + Spring Boot 3.x + Spring Data JPA, Supabase PostgreSQL Client, Caffeine Cache, Jackson
- M002-material-filter: Added Supabase PostgreSQL (物料数据通过现有 materials 表)

- 001-menu-panel: Added TypeScript 5.9.3, React 19.2.0

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
