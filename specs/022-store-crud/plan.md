# Implementation Plan: 门店管理 - 增删改功能

**Branch**: `022-store-crud` | **Date**: 2025-12-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/022-store-crud/spec.md`

## Summary

This feature implements complete CRUD (Create, Read, Update, Delete) operations for store management, building upon the existing read-only store management page from feature 014-hall-store-backend. The implementation extends the Store entity (already enhanced with address fields in 020-store-address) with full lifecycle management capabilities, including create/edit forms, status toggle (enable/disable), and delete operations with safety constraints. The feature also introduces a new StoreOperationLog entity for comprehensive audit logging. The frontend leverages the existing StoreTable component and integrates new modals for CRUD operations, while the backend extends StoreController with new endpoints for mutation operations. All operations enforce strict validation rules (unique store names, phone format validation) and maintain data integrity through cascading relationship checks.

## Technical Context

**Language/Version**:
- B端（管理后台）: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 21 + Spring Boot 3.x (backend)

**Primary Dependencies**:
- Frontend: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, MSW 2.12.4, React Hook Form 7.68.0, Zod 4.1.13
- Backend: Spring Boot 3.x Web, Supabase Java Client SDK (or PostgreSQL JDBC), Lombok, Jackson

**Storage**: Supabase PostgreSQL 作为主要数据源，扩展 stores 表添加 status 字段（枚举类型 ACTIVE/INACTIVE），新增 store_operation_logs 表用于审计日志

**Testing**:
- Frontend: Vitest (unit tests for form validation, store hooks) + Playwright (e2e tests for CRUD workflows)
- Backend: JUnit 5 + Spring Boot Test (unit tests for StoreService) + Testcontainers PostgreSQL (integration tests for StoreRepository)

**Target Platform**:
- Web browser (Chrome, Firefox, Safari, Edge) for B端 admin interface
- Spring Boot backend API deployed on server/cloud

**Project Type**:
- Full-stack web application (Spring Boot backend + React frontend for B端 admin interface)

**Performance Goals**:
- Store creation/edit response time < 2 seconds (including validation)
- List refresh after mutation < 3 seconds (TanStack Query cache invalidation)
- Form validation feedback < 100ms (client-side Zod validation)
- Delete safety check query < 500ms (check related halls, reservations, settings)

**Constraints**:
- Must comply with Feature Branch Binding (specId 022 alignment)
- Must follow TDD (tests before implementation)
- Must reuse existing Store entity from 014/020 (no schema duplication)
- Must integrate with existing StoreTable component (014) and ReservationSettingsModal (016)
- Backend must use Spring Boot + Supabase as unified stack
- API responses must follow standardized format (ApiResponse<T>)

**Scale/Scope**:
- Feature-specific: 4 new modals (CreateStoreModal, EditStoreModal, DeleteConfirmModal, StatusToggleModal)
- Backend: 4 new endpoints (POST /stores, PUT /stores/{id}, PATCH /stores/{id}/status, DELETE /stores/{id})
- Database: 1 new table (store_operation_logs), 1 column addition (stores.status)
- Audit logging: All CRUD operations logged to store_operation_logs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [X] **功能分支绑定**: Current branch is `022-store-crud`, spec is at `specs/022-store-crud/spec.md`, specId matches
- [X] **测试驱动开发**: Will implement TDD - write Playwright e2e tests and Vitest unit tests before implementing CRUD logic
- [X] **组件化架构**: Will reuse existing StoreTable organism, create new modal molecules (CreateStoreModal, EditStoreModal), use Ant Design atoms (Form, Input, Select, Button)
- [X] **前端技术栈分层**: B端 feature using React + Ant Design + Zustand + TanStack Query (no C端 Taro involvement)
- [X] **数据驱动状态管理**: Will use TanStack Query mutations (useCreateStore, useUpdateStore, useDeleteStore) + Zustand for modal visibility state
- [X] **代码质量工程化**: Will configure TypeScript strict mode, ESLint/Prettier checks, Zod validation schemas for forms
- [X] **后端技术栈约束**: Backend will use Spring Boot 3.x with Supabase PostgreSQL as primary data source

### 性能与标准检查:
- [X] **性能标准**: CRUD operations target < 2s response time, form validation < 100ms (client-side), list refresh < 3s (TanStack Query cache)
- [X] **安全标准**: Zod validation for all form inputs (name, phone, region, city), API Token authentication, XSS prevention through Ant Design Form sanitization
- [X] **可访问性标准**: Form fields have aria-label attributes, modal dialogs support keyboard navigation (Ant Design Modal defaults), focus management on modal open

### Constitution Compliance Notes:
- **No violations detected**. This feature fully complies with all constitution principles.
- **API Response Format**: Will follow standardized `ApiResponse<T>` format for consistency (addressing concerns from `docs/问题总结/014-API响应格式不一致问题.md`)
- **Reuse over duplication**: Extends existing Store entity instead of creating new schema, reuses StoreTable component

## Project Structure

### Documentation (this feature)

```text
specs/022-store-crud/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
│   └── api.yaml        # OpenAPI spec for CRUD endpoints
├── checklists/          # Quality validation (completed)
│   └── requirements.md # Spec quality checklist (passed)
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/src/
├── features/
│   └── store-management/
│       ├── components/
│       │   ├── StoreTable.tsx               # Existing (from 014) - will modify
│       │   ├── StoreFormFields.tsx          # New - shared form fields component
│       │   ├── CreateStoreModal.tsx         # New - create store modal
│       │   ├── EditStoreModal.tsx           # New - edit store modal
│       │   ├── DeleteStoreConfirm.tsx       # New - delete confirmation dialog
│       │   └── StatusToggleButton.tsx       # New - enable/disable button
│       ├── hooks/
│       │   ├── useStores.ts                 # Existing (from 014) - no changes
│       │   ├── useCreateStore.ts            # New - TanStack Query mutation
│       │   ├── useUpdateStore.ts            # New - TanStack Query mutation
│       │   ├── useDeleteStore.ts            # New - TanStack Query mutation
│       │   └── useToggleStoreStatus.ts      # New - TanStack Query mutation
│       ├── services/
│       │   └── storeApi.ts                  # Extend with create/update/delete methods
│       ├── types/
│       │   ├── store.ts                     # Extend with StoreStatus enum, CreateStoreDTO, UpdateStoreDTO
│       │   └── operationLog.ts              # New - StoreOperationLog type
│       └── validations/
│           └── storeSchema.ts               # New - Zod schemas for form validation
└── pages/
    └── stores/
        └── index.tsx                         # Existing (from 014) - add modal integration

backend/src/main/java/com/cinema/
├── controller/
│   └── StoreController.java                 # Extend with POST/PUT/PATCH/DELETE endpoints
├── service/
│   ├── StoreService.java                    # Extend with create/update/delete/toggleStatus methods
│   └── StoreOperationLogService.java        # New - audit logging service
├── repository/
│   ├── StoreRepository.java                 # Extend with custom queries (findByNameIgnoreCase, etc.)
│   └── StoreOperationLogRepository.java     # New - JPA repository for audit logs
├── entity/
│   ├── Store.java                           # Extend with status field (enum StoreStatus)
│   └── StoreOperationLog.java               # New - audit log entity
├── dto/
│   ├── CreateStoreDTO.java                  # New - DTO for store creation
│   ├── UpdateStoreDTO.java                  # New - DTO for store updates
│   └── StoreOperationLogDTO.java            # New - DTO for audit logs
├── exception/
│   ├── StoreNotFoundException.java          # New - custom exception
│   ├── StoreNameConflictException.java      # New - custom exception
│   └── StoreHasDependenciesException.java   # New - custom exception for delete safety
└── validator/
    └── StoreValidator.java                   # New - validation logic (name uniqueness, phone format)
```

### Database Schema

```sql
-- Extend existing stores table (from 014/020)
ALTER TABLE stores
ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'));

-- Create store_operation_logs table
CREATE TABLE store_operation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('CREATE', 'UPDATE', 'STATUS_CHANGE', 'DELETE')),
  operator_id UUID,  -- FK to users table (if exists)
  operator_name VARCHAR(100),
  before_value JSONB,  -- JSON snapshot of state before change (for UPDATE/STATUS_CHANGE)
  after_value JSONB,   -- JSON snapshot of state after change
  operation_time TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(45),
  remark TEXT,
  INDEX idx_store_operation_logs_store_id (store_id),
  INDEX idx_store_operation_logs_operation_time (operation_time DESC)
);
```

### File Changes Summary

| File | Change Type | Purpose |
|------|------------|---------|
| `frontend/src/features/store-management/components/StoreTable.tsx` | Modify | Add action buttons (Edit, Delete, Status Toggle) |
| `frontend/src/features/store-management/components/StoreFormFields.tsx` | Create | Shared form fields (name, region, city, address, phone) |
| `frontend/src/features/store-management/components/CreateStoreModal.tsx` | Create | Modal for creating new store |
| `frontend/src/features/store-management/components/EditStoreModal.tsx` | Create | Modal for editing existing store |
| `frontend/src/features/store-management/components/DeleteStoreConfirm.tsx` | Create | Confirmation dialog for delete operation |
| `frontend/src/features/store-management/components/StatusToggleButton.tsx` | Create | Button to toggle store status (enable/disable) |
| `frontend/src/features/store-management/hooks/useCreateStore.ts` | Create | TanStack Query mutation for store creation |
| `frontend/src/features/store-management/hooks/useUpdateStore.ts` | Create | TanStack Query mutation for store updates |
| `frontend/src/features/store-management/hooks/useDeleteStore.ts` | Create | TanStack Query mutation for store deletion |
| `frontend/src/features/store-management/hooks/useToggleStoreStatus.ts` | Create | TanStack Query mutation for status toggle |
| `frontend/src/features/store-management/services/storeApi.ts` | Modify | Add createStore, updateStore, deleteStore, toggleStatus API methods |
| `frontend/src/features/store-management/types/store.ts` | Modify | Add StoreStatus enum, CreateStoreDTO, UpdateStoreDTO types |
| `frontend/src/features/store-management/types/operationLog.ts` | Create | StoreOperationLog type definitions |
| `frontend/src/features/store-management/validations/storeSchema.ts` | Create | Zod validation schemas for forms |
| `frontend/src/pages/stores/index.tsx` | Modify | Integrate modals and action button handlers |
| `backend/src/main/java/com/cinema/controller/StoreController.java` | Modify | Add POST, PUT, PATCH, DELETE endpoints |
| `backend/src/main/java/com/cinema/service/StoreService.java` | Modify | Add CRUD business logic methods |
| `backend/src/main/java/com/cinema/service/StoreOperationLogService.java` | Create | Audit logging service |
| `backend/src/main/java/com/cinema/repository/StoreRepository.java` | Modify | Add custom queries for name uniqueness check |
| `backend/src/main/java/com/cinema/repository/StoreOperationLogRepository.java` | Create | JPA repository for audit logs |
| `backend/src/main/java/com/cinema/entity/Store.java` | Modify | Add status field (enum StoreStatus) |
| `backend/src/main/java/com/cinema/entity/StoreOperationLog.java` | Create | Audit log JPA entity |
| `backend/src/main/java/com/cinema/dto/CreateStoreDTO.java` | Create | DTO for store creation requests |
| `backend/src/main/java/com/cinema/dto/UpdateStoreDTO.java` | Create | DTO for store update requests |
| `backend/src/main/java/com/cinema/dto/StoreOperationLogDTO.java` | Create | DTO for audit log responses |
| `backend/src/main/java/com/cinema/exception/StoreNotFoundException.java` | Create | Custom exception for 404 scenarios |
| `backend/src/main/java/com/cinema/exception/StoreNameConflictException.java` | Create | Custom exception for name conflicts |
| `backend/src/main/java/com/cinema/exception/StoreHasDependenciesException.java` | Create | Custom exception for delete safety |
| `backend/src/main/java/com/cinema/validator/StoreValidator.java` | Create | Validation logic (name uniqueness, phone format) |

## Phase 0: Research & Technical Decisions

*To be generated in research.md*

### Research Topics

1. **Store Status Enum Modeling**:
   - Decision: Use database-level CHECK constraint or application-level enum?
   - Alternatives: String column with validation vs. separate status table vs. enum type
   - Recommendation: Use PostgreSQL ENUM type or VARCHAR with CHECK constraint (ACTIVE, INACTIVE)

2. **Audit Logging Strategy**:
   - Decision: Database triggers vs. application-level logging?
   - Alternatives: PostgreSQL trigger capturing changes vs. Spring AOP aspect vs. manual service logging
   - Recommendation: Application-level logging in StoreService (better control, easier debugging)

3. **Delete Safety Checks**:
   - Decision: Query all related entities or use database constraints?
   - Alternatives: Manual queries (SELECT halls/reservations) vs. database ON DELETE RESTRICT
   - Recommendation: Combination - database constraints for integrity + manual queries for user-friendly error messages

4. **Form Validation Strategy**:
   - Decision: Client-side Zod + server-side validation?
   - Alternatives: Zod only vs. Zod + Bean Validation (@Valid) vs. custom validators
   - Recommendation: Zod for frontend (immediate feedback) + Bean Validation for backend (security)

5. **Concurrent Edit Handling**:
   - Decision: Optimistic locking or last-write-wins?
   - Alternatives: @Version field (JPA optimistic locking) vs. timestamp comparison vs. no conflict detection
   - Recommendation: Optimistic locking with @Version field (prevents silent data loss)

6. **Phone Number Validation**:
   - Decision: Regex pattern for both mobile and landline?
   - Pattern for mobile: `^1[3-9]\\d{9}$` (11 digits starting with 1)
   - Pattern for landline: `^0\\d{2,3}-\\d{7,8}$` (area code + number)
   - Recommendation: Combined regex accepting both formats

7. **Region/City Data Source**:
   - Decision: Hardcoded dropdown options or database table?
   - Alternatives: Static JSON file vs. separate regions/cities table vs. API call
   - Recommendation: Static TypeScript constants for MVP (frontend/src/constants/regions.ts), migrate to database if needed

## Phase 1: Design Artifacts

### Data Model (data-model.md)

**Extended Entity: Store**
- Existing fields (from 014/020): id, name, region, city, province, district, address, phone, createdAt, updatedAt
- New field: status (enum: ACTIVE | INACTIVE, default: ACTIVE)
- New field: version (integer, for optimistic locking)
- Constraints:
  - name: UNIQUE, NOT NULL, case-insensitive uniqueness check after trimming whitespace
  - phone: NOT NULL, regex validation (mobile or landline format)
  - status: CHECK constraint (ACTIVE | INACTIVE)

**New Entity: StoreOperationLog**
- Fields:
  - id (UUID, primary key)
  - storeId (UUID, foreign key to stores)
  - operationType (enum: CREATE | UPDATE | STATUS_CHANGE | DELETE)
  - operatorId (UUID, nullable, foreign key to users if user system exists)
  - operatorName (string, for display purposes)
  - beforeValue (JSONB, snapshot of Store before change, nullable)
  - afterValue (JSONB, snapshot of Store after change)
  - operationTime (timestamp with timezone, default NOW())
  - ipAddress (string, optional)
  - remark (text, optional)

**Relationships**:
- Store 1:N StoreOperationLog (one store has many operation logs)
- Store 1:N Hall (existing, from 014)
- Store 1:1 ReservationSettings (existing, from 016)

### API Contracts (contracts/api.yaml)

**POST /api/stores**
- Request body: CreateStoreDTO { name, region, city, province?, district?, address, phone }
- Response: 201 Created, ApiResponse<Store>
- Errors: 400 (validation), 409 (name conflict)

**PUT /api/stores/{id}**
- Request body: UpdateStoreDTO { name?, region?, city?, province?, district?, address?, phone?, version }
- Response: 200 OK, ApiResponse<Store>
- Errors: 400 (validation), 404 (not found), 409 (name conflict or version mismatch)

**PATCH /api/stores/{id}/status**
- Request body: { status: "ACTIVE" | "INACTIVE" }
- Response: 200 OK, ApiResponse<Store>
- Errors: 404 (not found), 400 (invalid status)

**DELETE /api/stores/{id}**
- Response: 204 No Content
- Errors: 404 (not found), 409 (has dependencies - halls, reservation settings, or bookings exist)

**GET /api/stores/{id}/operation-logs** (optional, for future audit trail UI)
- Response: 200 OK, ApiResponse<List<StoreOperationLog>>
- Query params: page, pageSize, operationType filter

### Quickstart Guide (quickstart.md)

**Prerequisites**:
- Completed features 014 (hall-store-backend) and 020 (store-address)
- Supabase project with stores table schema from 014/020
- Node.js 18+, Java 21+, PostgreSQL 14+

**Local Development Setup**:
1. Database migration: Run SQL script to add `status` column and create `store_operation_logs` table
2. Backend: `cd backend && ./mvnw spring-boot:run`
3. Frontend: `cd frontend && npm run dev`
4. Navigate to http://localhost:3000/stores

**Testing CRUD Operations**:
1. Create: Click "新建门店" button, fill form, submit
2. Edit: Click "编辑" button in table row, modify fields, submit
3. Status toggle: Click "停用" or "启用" button, confirm dialog
4. Delete: Click "删除" button (admin only), confirm with safety check warnings

**Mock Data for Development**:
- MSW handlers in `frontend/src/mocks/handlers/stores.ts` simulate CRUD endpoints
- Use localStorage to persist mock data across page refreshes
- Simulate validation errors (duplicate name, invalid phone) for testing

## Next Steps

After `/speckit.plan` completion:
1. Run `/speckit.tasks` to generate task breakdown (tasks.md)
2. Run `/speckit.implement` to execute tasks and implement the feature
3. Create PR and merge to main branch after all tests pass
