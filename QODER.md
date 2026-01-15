# Cinema_Bussiness_Center_Platform Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-14

## Active Technologies
- Supabase PostgreSQL (物料数据通过现有 materials 表) (M002-material-filter)
- Java 17 + Spring Boot 3.x + Spring Data JPA, Supabase PostgreSQL Client, Caffeine Cache, Jackson (feat/O012-order-inventory-reservation)
- Supabase PostgreSQL (复用 `store_inventory`, `inventory_reservations`, `bom_snapshots` 表,由P005创建) (feat/O012-order-inventory-reservation)
- Postman Collection v2.1 + JavaScript (Postman Test Scripts) (T009-e2e-postman-flow-test)
- Java 17, TypeScript 5.x + Spring Boot 3.x, Taro 3.x, Spring Data JPA (O013-order-channel-migration)
- PostgreSQL (Supabase) (O013-order-channel-migration)

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
- O013-order-channel-migration: Added Java 17, TypeScript 5.x + Spring Boot 3.x, Taro 3.x, Spring Data JPA
- T009-e2e-postman-flow-test: Added Postman Collection v2.1 + JavaScript (Postman Test Scripts)
- feat/O012-order-inventory-reservation: Added Java 17 + Spring Boot 3.x + Spring Data JPA, Supabase PostgreSQL Client, Caffeine Cache, Jackson


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
