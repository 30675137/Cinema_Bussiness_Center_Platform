# O002-miniapp-menu-config 功能验证文档

**规格**: O002-miniapp-menu-config (小程序菜单分类动态配置)
**版本**: 1.0.0
**创建日期**: 2026-01-03
**状态**: 📝 待验证

---

## 1. 验证概述

### 1.1 功能范围

本规格实现了小程序菜单分类的动态配置功能，包括：

- **B端管理后台**: 分类 CRUD、排序、可见性控制、图标/描述设置
- **C端小程序**: 动态获取分类、按分类筛选商品、图标显示
- **后端 API**: 分类管理接口、缓存机制、审计日志

### 1.2 User Story 映射

| 优先级 | Story | 描述 | Phase |
|--------|-------|------|-------|
| P1 | US1 | 管理员配置菜单分类 (CRUD) | Phase 3 |
| P1 | US2 | 小程序获取动态分类 | Phase 4 |
| P1 | US5 | 系统迁移 ChannelCategory 数据 | Phase 5 |
| P1 | US6 | 商品按动态分类筛选 | Phase 6 |
| P2 | US3 | 管理员调整分类排序 | Phase 7 |
| P2 | US4 | 管理员设置分类可见性 | Phase 8 |
| P3 | US7 | 管理员设置分类图标和描述 | Phase 9 |

---

## 2. 环境准备

### 2.1 后端环境

```bash
cd backend
./mvnw spring-boot:run
# 确认启动在 http://localhost:8080
```

### 2.2 B端前端环境

```bash
cd frontend
npm install
npm run dev
# 确认启动在 http://localhost:3000
```

### 2.3 C端小程序环境

```bash
cd hall-reserve-taro
npm install
npm run dev:h5
# 确认启动在 http://localhost:10086
```

### 2.4 数据库准备

确认以下数据库迁移已执行：
- [ ] `V202601030001__add_menu_category.sql` - menu_category 表
- [ ] `V2026_01_03_002__migrate_category_data.sql` - 初始数据迁移

---

## 3. 功能验证清单

### 3.1 Phase 3: US1 管理员配置菜单分类 (CRUD)

#### 3.1.1 创建分类

| 测试用例 | 操作步骤 | 预期结果 | 实际结果 | 状态 |
|----------|----------|----------|----------|------|
| TC-001 | 点击"新建分类"，输入 code=SEASONAL, displayName=季节限定，点击确定 | 分类创建成功，列表显示新分类 | | ⬜ |
| TC-002 | 创建分类时 code 留空 | 显示验证错误"请输入分类编码" | | ⬜ |
| TC-003 | 创建分类时输入已存在的 code | 显示错误"分类编码已存在" | | ⬜ |
| TC-004 | 创建分类时输入无效 code 格式 (如 "123abc") | 显示验证错误"编码必须以字母开头" | | ⬜ |

#### 3.1.2 查看分类列表

| 测试用例 | 操作步骤 | 预期结果 | 实际结果 | 状态 |
|----------|----------|----------|----------|------|
| TC-005 | 访问分类管理页面 | 显示所有分类列表，包含默认分类 | | ⬜ |
| TC-006 | 查看列表列 | 显示：排序、图标、编码、名称、商品数量、描述、可见、操作 | | ⬜ |
| TC-007 | 检查默认分类标识 | "其他商品"分类显示"默认"标签 | | ⬜ |

#### 3.1.3 编辑分类

| 测试用例 | 操作步骤 | 预期结果 | 实际结果 | 状态 |
|----------|----------|----------|----------|------|
| TC-008 | 点击编辑按钮，修改 displayName | 更新成功，列表显示新名称 | | ⬜ |
| TC-009 | 编辑时尝试修改 code | code 字段为禁用状态 | | ⬜ |
| TC-010 | 编辑默认分类 | 可以编辑名称，但不能隐藏 | | ⬜ |

#### 3.1.4 删除分类

| 测试用例 | 操作步骤 | 预期结果 | 实际结果 | 状态 |
|----------|----------|----------|----------|------|
| TC-011 | 删除无商品的分类 | 确认后删除成功 | | ⬜ |
| TC-012 | 删除有商品的分类 | 显示确认对话框，提示商品将迁移到默认分类 | | ⬜ |
| TC-013 | 确认删除有商品的分类 | 分类删除，商品迁移到"其他商品" | | ⬜ |
| TC-014 | 尝试删除默认分类 | 删除按钮禁用，显示"默认分类不可删除" | | ⬜ |

---

### 3.2 Phase 4: US2 小程序获取动态分类

#### 3.2.1 API 验证

| 测试用例 | 操作步骤 | 预期结果 | 实际结果 | 状态 |
|----------|----------|----------|----------|------|
| TC-015 | 调用 GET /api/client/menu-categories | 返回可见分类列表，按 sortOrder 排序 | | ⬜ |
| TC-016 | 验证响应字段 | 包含 id, code, displayName, iconUrl, productCount | | ⬜ |
| TC-017 | 隐藏一个分类后调用 API | 隐藏的分类不在列表中 | | ⬜ |

#### 3.2.2 小程序显示

| 测试用例 | 操作步骤 | 预期结果 | 实际结果 | 状态 |
|----------|----------|----------|----------|------|
| TC-018 | 打开饮品菜单页面 | 显示动态分类 Tab，包含"全部"选项 | | ⬜ |
| TC-019 | 点击不同分类 Tab | Tab 切换，商品列表按分类筛选 | | ⬜ |
| TC-020 | B端新增分类后刷新小程序 | 新分类出现在 Tab 中 | | ⬜ |

---

### 3.3 Phase 5: US5 数据迁移

| 测试用例 | 操作步骤 | 预期结果 | 实际结果 | 状态 |
|----------|----------|----------|----------|------|
| TC-021 | 查询 menu_category 表 | 包含 6 个初始分类 (ALCOHOL, COFFEE, BEVERAGE, SNACK, MEAL, OTHER) | | ⬜ |
| TC-022 | 验证中文名称 | ALCOHOL→经典特调, COFFEE→精品咖啡, 等 | | ⬜ |
| TC-023 | 验证 OTHER 为默认分类 | is_default = true | | ⬜ |
| TC-024 | 检查商品 category_id | 所有商品都有有效的 category_id | | ⬜ |

---

### 3.4 Phase 6: US6 商品按分类筛选

#### 3.4.1 API 验证

| 测试用例 | 操作步骤 | 预期结果 | 实际结果 | 状态 |
|----------|----------|----------|----------|------|
| TC-025 | GET /api/client/channel-products?categoryId=xxx | 返回该分类的商品 | | ⬜ |
| TC-026 | GET /api/client/channel-products?category=COFFEE | 返回 COFFEE 分类商品（向后兼容） | | ⬜ |
| TC-027 | 同时传 categoryId 和 category | categoryId 优先 | | ⬜ |

#### 3.4.2 商品响应

| 测试用例 | 操作步骤 | 预期结果 | 实际结果 | 状态 |
|----------|----------|----------|----------|------|
| TC-028 | 检查商品响应 | 包含嵌套的 category 对象 (id, code, displayName) | | ⬜ |

---

### 3.5 Phase 7: US3 分类排序

| 测试用例 | 操作步骤 | 预期结果 | 实际结果 | 状态 |
|----------|----------|----------|----------|------|
| TC-029 | 拖拽分类行调整顺序 | 拖拽过程中显示视觉反馈 | | ⬜ |
| TC-030 | 释放拖拽 | 排序更新成功，提示"排序已更新" | | ⬜ |
| TC-031 | 刷新小程序菜单 | 分类 Tab 顺序与 B端一致 | | ⬜ |

---

### 3.6 Phase 8: US4 可见性控制

| 测试用例 | 操作步骤 | 预期结果 | 实际结果 | 状态 |
|----------|----------|----------|----------|------|
| TC-032 | 点击可见性开关隐藏分类 | 开关关闭，提示"分类已隐藏" | | ⬜ |
| TC-033 | 刷新小程序菜单 | 隐藏的分类不显示 | | ⬜ |
| TC-034 | 尝试隐藏默认分类 | 开关禁用 | | ⬜ |
| TC-035 | 重新显示隐藏的分类 | 开关开启，小程序中恢复显示 | | ⬜ |

---

### 3.7 Phase 9: US7 图标和描述

#### 3.7.1 B端设置

| 测试用例 | 操作步骤 | 预期结果 | 实际结果 | 状态 |
|----------|----------|----------|----------|------|
| TC-036 | 编辑分类，设置图标 URL | 保存成功，表格显示图标预览 | | ⬜ |
| TC-037 | 输入无效 URL 格式 | 显示验证错误"请输入有效的 URL 地址" | | ⬜ |
| TC-038 | 设置描述文本 (超过500字符) | 显示验证错误"描述长度不能超过500字符" | | ⬜ |
| TC-039 | 清空图标 URL | 保存成功，表格显示"-" | | ⬜ |

#### 3.7.2 C端显示

| 测试用例 | 操作步骤 | 预期结果 | 实际结果 | 状态 |
|----------|----------|----------|----------|------|
| TC-040 | 查看有图标的分类 Tab | 显示图标图片 | | ⬜ |
| TC-041 | 查看无图标的分类 Tab | 显示分类名称首字符作为 fallback | | ⬜ |
| TC-042 | 点击有图标的分类 | 图标和文字高亮显示 | | ⬜ |

---

## 4. API 验证

### 4.1 Admin API

| 端点 | 方法 | 描述 | 状态 |
|------|------|------|------|
| `/api/admin/menu-categories` | GET | 获取分类列表 | ⬜ |
| `/api/admin/menu-categories` | POST | 创建分类 | ⬜ |
| `/api/admin/menu-categories/{id}` | GET | 获取单个分类 | ⬜ |
| `/api/admin/menu-categories/{id}` | PUT | 更新分类 | ⬜ |
| `/api/admin/menu-categories/{id}` | DELETE | 删除分类 | ⬜ |
| `/api/admin/menu-categories/batch-sort` | PUT | 批量更新排序 | ⬜ |
| `/api/admin/menu-categories/{id}/visibility` | PATCH | 切换可见性 | ⬜ |

### 4.2 Client API

| 端点 | 方法 | 描述 | 状态 |
|------|------|------|------|
| `/api/client/menu-categories` | GET | 获取可见分类 | ⬜ |
| `/api/client/channel-products` | GET | 获取商品（支持 categoryId 筛选） | ⬜ |

---

## 5. 性能验证

| 指标 | 目标 | 实际 | 状态 |
|------|------|------|------|
| 分类列表 API 响应时间 | < 200ms | | ⬜ |
| 小程序菜单页面加载 | < 1s | | ⬜ |
| 拖拽排序响应时间 | < 500ms | | ⬜ |

---

## 6. 兼容性验证

### 6.1 向后兼容

| 测试用例 | 操作步骤 | 预期结果 | 实际结果 | 状态 |
|----------|----------|----------|----------|------|
| TC-043 | 使用旧版 category 参数查询商品 | 正常返回结果 | | ⬜ |
| TC-044 | 旧版商品数据（无 category_id） | 自动关联到默认分类 | | ⬜ |

---

## 7. 验证结果汇总

### 7.1 统计

| 类别 | 总数 | 通过 | 失败 | 未测试 |
|------|------|------|------|--------|
| Phase 3 (CRUD) | 14 | 0 | 0 | 14 |
| Phase 4 (C端API) | 6 | 0 | 0 | 6 |
| Phase 5 (迁移) | 4 | 0 | 0 | 4 |
| Phase 6 (筛选) | 4 | 0 | 0 | 4 |
| Phase 7 (排序) | 3 | 0 | 0 | 3 |
| Phase 8 (可见性) | 4 | 0 | 0 | 4 |
| Phase 9 (图标) | 7 | 0 | 0 | 7 |
| API 验证 | 9 | 0 | 0 | 9 |
| 兼容性 | 2 | 0 | 0 | 2 |
| **总计** | **53** | **0** | **0** | **53** |

### 7.2 验证结论

- [ ] 所有测试用例通过
- [ ] 性能指标达标
- [ ] 兼容性验证通过
- [ ] 可以发布到生产环境

---

## 8. 签核

| 角色 | 姓名 | 日期 | 签名 |
|------|------|------|------|
| 开发 | | | |
| 测试 | | | |
| 产品 | | | |

---

## 附录

### A. 相关代码文件

**后端**:
- `backend/src/main/java/com/cinema/category/` - 分类模块
- `backend/src/main/resources/db/migration/V202601030001__add_menu_category.sql`

**B端前端**:
- `frontend/src/features/menu-category/` - 分类功能模块
- `frontend/src/pages/menu-category/MenuCategoryPage.tsx`

**C端前端**:
- `hall-reserve-taro/src/pages/beverage/menu/index.tsx`
- `hall-reserve-taro/src/hooks/useMenuCategories.ts`
- `hall-reserve-taro/src/stores/menuCategoryStore.ts`

### B. 相关 Git Commits

| Hash | 描述 |
|------|------|
| eaa5c88 | Phase 8 - Admin Sets Category Visibility |
| 4da1faa | Phase 9 - Admin Sets Category Icons and Descriptions |

### C. 变更文件列表

#### 后端 (Backend)

| 文件路径 | 变更类型 | 说明 |
|----------|----------|------|
| `backend/src/main/java/com/cinema/category/entity/MenuCategory.java` | 新增 | 菜单分类实体 |
| `backend/src/main/java/com/cinema/category/entity/CategoryAuditLog.java` | 新增 | 分类审计日志实体 |
| `backend/src/main/java/com/cinema/category/repository/MenuCategoryRepository.java` | 新增 | 分类数据仓库 |
| `backend/src/main/java/com/cinema/category/repository/CategoryAuditLogRepository.java` | 新增 | 审计日志仓库 |
| `backend/src/main/java/com/cinema/category/dto/MenuCategoryDTO.java` | 新增 | 分类 DTO |
| `backend/src/main/java/com/cinema/category/dto/CreateMenuCategoryRequest.java` | 新增 | 创建分类请求 |
| `backend/src/main/java/com/cinema/category/dto/UpdateMenuCategoryRequest.java` | 新增 | 更新分类请求 |
| `backend/src/main/java/com/cinema/category/dto/BatchUpdateSortOrderRequest.java` | 新增 | 批量排序请求 |
| `backend/src/main/java/com/cinema/category/dto/ClientMenuCategoryDTO.java` | 新增 | C端分类 DTO |
| `backend/src/main/java/com/cinema/category/dto/DeleteCategoryResponse.java` | 新增 | 删除响应 |
| `backend/src/main/java/com/cinema/category/service/MenuCategoryService.java` | 新增 | 分类服务层 |
| `backend/src/main/java/com/cinema/category/service/CategoryAuditService.java` | 新增 | 审计服务 |
| `backend/src/main/java/com/cinema/category/controller/MenuCategoryAdminController.java` | 新增 | 管理端控制器 |
| `backend/src/main/java/com/cinema/category/controller/MenuCategoryClientController.java` | 新增 | 客户端控制器 |
| `backend/src/main/java/com/cinema/channelproduct/domain/ChannelProductConfig.java` | 修改 | 添加 category_id 关联 |
| `backend/src/main/resources/db/migration/V202601030001__add_menu_category.sql` | 新增 | 数据库迁移脚本 |
| `backend/src/main/resources/db/migration/V2026_01_03_002__migrate_category_data.sql` | 新增 | 数据迁移脚本 |

#### B端前端 (Frontend)

| 文件路径 | 变更类型 | 说明 |
|----------|----------|------|
| `frontend/src/features/menu-category/types/index.ts` | 新增 | 类型定义 + Zod Schema |
| `frontend/src/features/menu-category/services/menuCategoryService.ts` | 新增 | API 服务 |
| `frontend/src/features/menu-category/hooks/useMenuCategories.ts` | 新增 | TanStack Query Hooks |
| `frontend/src/features/menu-category/components/CategoryTable.tsx` | 新增 | 分类表格组件 |
| `frontend/src/features/menu-category/components/CategoryForm.tsx` | 新增 | 分类表单组件 |
| `frontend/src/features/menu-category/components/DeleteCategoryDialog.tsx` | 新增 | 删除确认对话框 |
| `frontend/src/pages/menu-category/MenuCategoryPage.tsx` | 新增 | 分类管理页面 |

#### C端前端 (Taro)

| 文件路径 | 变更类型 | 说明 |
|----------|----------|------|
| `hall-reserve-taro/src/types/menuCategory.ts` | 新增 | C端类型定义 |
| `hall-reserve-taro/src/services/menuCategoryService.ts` | 新增 | 分类 API 服务 |
| `hall-reserve-taro/src/hooks/useMenuCategories.ts` | 新增 | 分类数据 Hook |
| `hall-reserve-taro/src/stores/menuCategoryStore.ts` | 新增 | Zustand Store |
| `hall-reserve-taro/src/pages/beverage/menu/index.tsx` | 修改 | 添加动态分类、图标显示 |
| `hall-reserve-taro/src/pages/beverage/menu/index.scss` | 修改 | 添加图标和 fallback 样式 |

### D. 变更原因

#### 业务需求

1. **动态分类管理**: 原有的 ChannelCategory 是硬编码枚举，无法满足运营动态调整分类的需求
2. **分类可见性控制**: 运营需要临时隐藏某些分类（如季节性商品）而不删除数据
3. **排序灵活性**: 运营需要根据促销活动调整分类展示顺序
4. **品牌视觉一致性**: 需要为分类添加图标以增强小程序 UI 体验

#### 技术改进

1. **数据库规范化**: 将分类数据从代码枚举迁移到数据库表，支持运行时修改
2. **审计追踪**: 添加 CategoryAuditLog 记录所有分类变更操作
3. **类型安全**: 添加 Zod Schema 增强前端表单验证
4. **性能优化**: 使用 TanStack Query 实现分类数据缓存和后台刷新
5. **向后兼容**: 保留旧版 `category` 参数支持，确保现有客户端正常工作

#### 用户故事映射

| User Story | 变更范围 | 优先级 |
|------------|----------|--------|
| US1: 管理员配置菜单分类 | Backend CRUD + B端管理页面 | P1 |
| US2: 小程序获取动态分类 | Client API + C端菜单页 | P1 |
| US3: 管理员调整分类排序 | 拖拽排序 + 批量更新 API | P2 |
| US4: 管理员设置分类可见性 | 可见性切换 + 过滤逻辑 | P2 |
| US5: 系统迁移 ChannelCategory 数据 | 数据迁移脚本 | P1 |
| US6: 商品按动态分类筛选 | 商品查询参数扩展 | P1 |
| US7: 管理员设置分类图标和描述 | 图标字段 + C端显示 | P3 |

---

**文档版本**: 1.1.0
**最后更新**: 2026-01-03
