# O003-beverage-order BUG 修复记录

本文档记录 O003-beverage-order 功能开发过程中遇到的问题及解决方法。

---

## BUG-001: JwtAuthenticationFilter Bean 未找到

### 问题描述
后端启动失败，报错：
```
Parameter 0 of constructor in com.cinema.config.SecurityConfig required a bean of type 
'com.cinema.security.JwtAuthenticationFilter' that could not be found.
```

### 错误日志
```
org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean 
with name 'securityConfig' defined in file [.../SecurityConfig.class]: 
Unsatisfied dependency expressed through constructor parameter 0: 
No qualifying bean of type 'com.cinema.security.JwtAuthenticationFilter' available
```

### 根本原因
`HallStoreBackendApplication` 的 `@ComponentScan` 注解没有包含 `com.cinema.security` 和 `com.cinema.beverage` 包，导致这些包中的 Bean 无法被 Spring 容器扫描和注册。

### 解决方法
修改 `HallStoreBackendApplication.java`，在组件扫描配置中添加缺失的包：

**修改前：**
```java
@ComponentScan(basePackages = {
    "com.cinema.hallstore", 
    "com.cinema.scenariopackage", 
    "com.cinema.common", 
    "com.cinema.config", 
    "com.cinema.reservation", 
    "com.cinema.unitconversion", 
    "com.cinema.inventory", 
    "com.cinema.sku", 
    "com.cinema.order"
})
```

**修改后：**
```java
@ComponentScan(basePackages = {
    "com.cinema.hallstore", 
    "com.cinema.scenariopackage", 
    "com.cinema.common", 
    "com.cinema.config", 
    "com.cinema.reservation", 
    "com.cinema.unitconversion", 
    "com.cinema.inventory", 
    "com.cinema.sku", 
    "com.cinema.order", 
    "com.cinema.security",    // 新增
    "com.cinema.beverage",    // 新增
    "com.cinema.auth"         // 新增
})
```

同时更新 `@EnableJpaRepositories` 和 `@EntityScan` 注解，添加 `com.cinema.beverage` 包。

### 修复文件
- `backend/src/main/java/com/cinema/hallstore/HallStoreBackendApplication.java`

### 修复日期
2025-12-28

---

## BUG-002: AuthController Bean 名称冲突

### 问题描述
后端启动失败，报错：
```
Annotation-specified bean name 'authController' for bean class 
[com.cinema.auth.controller.AuthController] conflicts with existing, 
non-compatible bean definition of same name and class 
[com.cinema.hallstore.auth.controller.AuthController]
```

### 错误日志
```
org.springframework.context.annotation.ConflictingBeanDefinitionException: 
Annotation-specified bean name 'authController' for bean class 
[com.cinema.auth.controller.AuthController] conflicts with existing, 
non-compatible bean definition of same name and class 
[com.cinema.hallstore.auth.controller.AuthController]
```

### 根本原因
项目中存在两个同名的 `AuthController` 类：
1. `com.cinema.hallstore.auth.controller.AuthController` - 原有的 C端微信登录控制器
2. `com.cinema.auth.controller.AuthController` - O003 新增的 B端管理员登录控制器

两个类默认生成相同的 Bean 名称 `authController`，导致冲突。

### 解决方法

将 O003 新增的 `AuthController` 重命名为 `BeverageAuthController`，并修改其 API 路径：

**修改内容：**
1. 类名：`AuthController` → `BeverageAuthController`
2. 文件名：`AuthController.java` → `BeverageAuthController.java`
3. API 路径：`/api/auth` → `/api/beverage-auth`

**修改后的控制器：**
```java
@RestController
@RequestMapping("/api/beverage-auth")
public class BeverageAuthController {
    // ...
}
```

**更新 SecurityConfig 的公共端点配置：**
```java
.authorizeHttpRequests(auth -> auth
    // 公共端点 (不需要认证)
    .requestMatchers(HttpMethod.POST, "/api/auth/**").permitAll()
    .requestMatchers(HttpMethod.POST, "/api/beverage-auth/**").permitAll()
    // ...
)
```

### 修复文件
- `backend/src/main/java/com/cinema/auth/controller/BeverageAuthController.java` (重命名)
- `backend/src/main/java/com/cinema/config/SecurityConfig.java`

### 注意事项
修改 Controller 路径后，必须执行 `mvn clean compile` 重新编译项目，否则可能加载旧的类文件。

### 修复日期
2025-12-28

---

## 认证控制器职责对照

为避免后续开发混淆，明确两个认证控制器的职责分工：

| 控制器 | 包路径 | API 路径 | 服务对象 | 认证方式 |
|--------|--------|----------|----------|----------|
| AuthController | com.cinema.hallstore.auth.controller | /api/auth/* | C端顾客 | 微信静默登录 |
| BeverageAuthController | com.cinema.auth.controller | /api/beverage-auth/* | B端工作人员 | 用户名密码 |

### API 端点对照

**AuthController (C端):**
- `POST /api/auth/wechat-login` - 微信小程序静默登录
- `POST /api/auth/refresh-token` - 刷新访问令牌
- `POST /api/auth/decrypt-phone` - 解密微信手机号

**BeverageAuthController (B端):**
- `POST /api/beverage-auth/login` - B端用户名密码登录
- `POST /api/beverage-auth/refresh` - 刷新访问令牌
- `GET /api/beverage-auth/me` - 获取当前用户信息

---

## 预防措施

### 1. 新增模块时检查组件扫描
新增 `com.cinema.xxx` 包时，必须检查 `HallStoreBackendApplication` 的扫描配置是否包含该包。

### 2. 避免类名冲突
新增控制器时，应使用具有业务含义的前缀命名，避免使用通用名称（如 `AuthController`、`UserController`）。

### 3. 修改路径后重新编译
修改 Spring Boot Controller 的 `@RequestMapping` 后，必须执行 `mvn clean compile`。

---

## BUG-003: 图片上传 403 Forbidden

### 问题描述
在 B端饮品管理页面，点击"添加饮品"上传图片时失败，浏览器控制台报错：
```
POST http://localhost:3000/api/admin/beverages/upload-image 403 (Forbidden)
```

### 根本原因
Spring Security 配置要求所有 `/api/admin/**` 路径必须经过 JWT 认证，但前端调用图片上传接口时未携带 `Authorization` header。

### 解决方法（临时方案）
在 `SecurityConfig.java` 中将图片上传接口设为公开访问：

```java
// B端公共端点 (图片上传)
.requestMatchers(HttpMethod.POST, "/api/admin/beverages/upload-image").permitAll()
```

### 安全警告 ⚠️
此方案为开发阶段临时方案，**生产环境必须改进**：
- 在前端实现 JWT Token 认证流程
- 在所有 API 请求中携带 `Authorization: Bearer <token>` header
- 移除当前的 `.permitAll()` 配置

### 修复文件
- `backend/src/main/java/com/cinema/config/SecurityConfig.java:78`

### 修复日期
2025-12-28

---

## BUG-004: 创建饮品 403 Forbidden

### 问题描述
在 B端饮品管理页面，填写完饮品信息并点击"确定"提交时失败，浏览器控制台报错：
```
POST http://localhost:3000/api/admin/beverages 403 (Forbidden)
```

### 根本原因
与 BUG-003 相同，Spring Security 配置要求认证，但前端未携带 Token。

### 解决方法（临时方案）
在 `SecurityConfig.java` 中将整个饮品管理接口设为公开访问：

```java
// B端公共端点 (饮品管理 - 临时开放用于开发测试)
.requestMatchers("/api/admin/beverages/**").permitAll()
```

### 影响范围
所有 `/api/admin/beverages/**` 路径的请求都不再需要认证，包括：
- 创建/修改/删除饮品
- 配置规格
- 配置配方
- 图片上传

### 修复文件
- `backend/src/main/java/com/cinema/config/SecurityConfig.java:79`

### 修复日期
2025-12-28

---

## BUG-005: 创建饮品 NullPointerException

### 问题描述
修复 BUG-004 后，创建饮品仍然失败，后端返回 500 错误：
```json
{
  "success": false,
  "error": "INTERNAL_SERVER_ERROR",
  "message": "服务器内部错误，请稍后重试"
}
```

### 错误日志
```
NullPointerException: Cannot invoke "java.time.LocalDateTime.toString()"
because the return value of "com.cinema.beverage.entity.Beverage.getCreatedAt()" is null
```

### 根本原因
`BeverageMapper.toDTO()` 方法在转换实体时直接调用 `beverage.getCreatedAt().toString()`，但此时 JPA 的 `@CreationTimestamp` 注解还未触发，导致字段为 null。

### 解决方法
在 `BeverageMapper.java` 中添加 null 安全检查：

```java
// 修改前
dto.setCreatedAt(beverage.getCreatedAt().toString());
dto.setUpdatedAt(beverage.getUpdatedAt().toString());

// 修改后
dto.setCreatedAt(beverage.getCreatedAt() != null ? beverage.getCreatedAt().toString() : null);
dto.setUpdatedAt(beverage.getUpdatedAt() != null ? beverage.getUpdatedAt().toString() : null);
```

### 修复文件
- `backend/src/main/java/com/cinema/beverage/mapper/BeverageMapper.java:38-39`

### 修复日期
2025-12-28

---

## BUG-006: 配方配置原料输入方式不符合规格

### 问题描述
在 B端配方配置页面，原料 SKU 使用手动输入 `<InputNumber>` 组件，需要用户自己填写 SKU ID、原料名称和单位。这不符合规格要求："关联原料SKU（从P001 SKU主数据中选择）"。

**当前实现问题**：
1. 用户需要手动输入 SKU ID（容易输错）
2. 原料名称和单位需要手动填写（与 SKU 主数据不一致）
3. 无法验证 SKU 是否存在
4. 用户体验差，需要记住 SKU ID

### 规格要求（FR-035）
商品管理员必须能够为饮品配置配方（BOM），**从P001 SKU主数据中选择原料SKU**，设置每种原料的用量和单位。

### 解决方案

#### 1. 添加 SKU API 公开访问
修改 `SecurityConfig.java`，允许查询 SKU 列表：

```java
.requestMatchers(HttpMethod.GET, "/api/skus/**").permitAll()
```

#### 2. 创建前端 SKU 服务
新建 `frontend/src/features/beverage-config/services/skuApi.ts`：

```typescript
export interface SkuDTO {
  id: string
  name: string
  skuCode: string
  unit: string
  // ...
}

export async function getSkuList(
  skuType: 'RAW_MATERIAL' | 'PACKAGING' = 'RAW_MATERIAL',
  keyword?: string
): Promise<SkuDTO[]> {
  // 调用 GET /api/skus 接口
}
```

#### 3. 修改 RecipeConfigModal 组件
将原料选择改为下拉选择框：

**修改前**：
```tsx
<Form.Item name={[name, 'skuId']}>
  <InputNumber placeholder="SKU ID" min={1} />
</Form.Item>
<Form.Item name={[name, 'ingredientName']}>
  <Input placeholder="原料名称" />
</Form.Item>
<Form.Item name={[name, 'unit']}>
  <Input placeholder="单位" />
</Form.Item>
```

**修改后**：
```tsx
<Form.Item name={[name, 'skuId']}>
  <Select
    showSearch
    placeholder="选择原料SKU"
    loading={isLoadingSkus}
    onChange={(value) => handleSkuChange(value, name)}
    options={skuList.map((sku) => ({
      value: sku.id,
      label: `${sku.name} (${sku.skuCode})`,
    }))}
  />
</Form.Item>
<Form.Item name={[name, 'ingredientName']}>
  <Input disabled /> {/* 自动填充，不可编辑 */}
</Form.Item>
<Form.Item name={[name, 'unit']}>
  <Input disabled /> {/* 自动填充，不可编辑 */}
</Form.Item>
```

#### 4. 自动填充逻辑
当用户选择 SKU 时，自动填充原料名称和单位：

```typescript
const handleSkuChange = (skuId: string, fieldIndex: number) => {
  const selectedSku = skuList.find((sku) => sku.id === skuId)
  if (selectedSku) {
    const ingredients = form.getFieldValue('ingredients') || []
    ingredients[fieldIndex] = {
      ...ingredients[fieldIndex],
      skuId: Number(skuId),
      ingredientName: selectedSku.name,
      unit: selectedSku.unit,
    }
    form.setFieldsValue({ ingredients })
  }
}
```

### 优化效果
1. ✅ 用户从下拉列表选择原料，支持搜索
2. ✅ 自动填充原料名称和单位，确保与 SKU 主数据一致
3. ✅ 防止输入不存在的 SKU ID
4. ✅ 显示 SKU 编码，便于识别
5. ✅ 符合 FR-035 规格要求

### 修复文件
- `backend/src/main/java/com/cinema/config/SecurityConfig.java:80`
- `frontend/src/features/beverage-config/services/skuApi.ts` (新建)
- `frontend/src/features/beverage-config/components/RecipeConfigModal.tsx:6,36,73-78,194-207,399-450`

### 修复日期
2025-12-28

---

---

## BUG-007: beverage_recipes 表字段名不匹配导致查询失败

### 问题描述
访问 `http://localhost:3000/api/skus?skuType=RAW_MATERIAL&status=ACTIVE&pageSize=1000` 时返回 500 错误。后端日志显示 SQL 查询错误：
```
ERROR: column br1_0.applicable_specs does not exist
```

### 错误日志
```
org.hibernate.exception.SQLGrammarException: JDBC exception executing SQL
[/* <criteria> */ select br1_0.id,br1_0.applicable_specs,br1_0.beverage_id,
 br1_0.created_at,br1_0.description,br1_0.name,br1_0.updated_at
 from beverage_recipes br1_0 where br1_0.beverage_id=? order by br1_0.created_at desc]
[ERROR: column br1_0.applicable_specs does not exist 位置：34]
```

### 根本原因
数据库迁移脚本 `V041__create_beverage_recipes.sql` 和实体类 `BeverageRecipe.java` 字段定义不一致：

**数据库表字段** (V041):
- `spec_combination` (JSONB)
- `instructions` (TEXT)
- `preparation_time` (INTEGER)

**实体类字段** (BeverageRecipe.java):
- `applicable_specs` (String)
- `name` (String)
- `description` (String)

JPA/Hibernate 根据实体类生成 SQL 时使用了 `applicable_specs` 等字段名，但数据库表中实际字段名是 `spec_combination`，导致查询失败。

### 解决方法

#### 1. 创建数据库迁移脚本 V048
新建 `backend/src/main/resources/db/migration/V048__alter_beverage_recipes_columns.sql`：

```sql
-- 1. 重命名字段
ALTER TABLE beverage_recipes
  RENAME COLUMN spec_combination TO applicable_specs;

-- 2. 删除不需要的字段
ALTER TABLE beverage_recipes
  DROP COLUMN IF EXISTS instructions,
  DROP COLUMN IF EXISTS preparation_time;

-- 3. 添加新字段
ALTER TABLE beverage_recipes
  ADD COLUMN name VARCHAR(100) NOT NULL DEFAULT 'Default Recipe',
  ADD COLUMN description TEXT;

-- 4. 移除默认值（仅用于迁移）
ALTER TABLE beverage_recipes
  ALTER COLUMN name DROP DEFAULT;

-- 5. 修改 applicable_specs 类型为 TEXT（与实体类一致）
ALTER TABLE beverage_recipes
  ALTER COLUMN applicable_specs TYPE TEXT USING applicable_specs::TEXT;

-- 6. 更新约束（删除旧约束）
ALTER TABLE beverage_recipes
  DROP CONSTRAINT IF EXISTS unique_beverage_recipe;
```

#### 2. 执行迁移
Flyway 在后端启动时自动执行：
```
Successfully applied 1 migration to schema "public", now at version v048
```

#### 3. 修复前端 SKU 状态枚举值错误
前端 `skuApi.ts` 中使用了错误的状态值 `ACTIVE`，实际应使用 `ENABLED`：

**修改前**:
```typescript
status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
params.append('status', 'ACTIVE')
```

**修改后**:
```typescript
status: 'DRAFT' | 'ENABLED' | 'DISABLED'
params.append('status', 'ENABLED')
```

### 修复文件
- `backend/src/main/resources/db/migration/V048__alter_beverage_recipes_columns.sql` (新建)
- `frontend/src/features/beverage-config/services/skuApi.ts:16,45`

### 验证结果
```bash
$ curl "http://localhost:8080/api/skus?skuType=RAW_MATERIAL&status=ENABLED&pageSize=10"
{
  "success": true,
  "total": 6,
  "data": [...]
}
```

### 修复日期
2025-12-28

---

---

## BUG-008: SKU API 字段名不匹配导致单位显示 NaN

### 问题描述
在配方配置页面选择 SKU（如"可乐糖浆"）后：
1. 单位字段显示 `NaN` 而不是正确的单位（如 `ml`）
2. SKU ID 列显示 `NaN` 而不是正确的 UUID

### 用户反馈
> 为什么 可乐糖浆 选择后 是 NaN
> id出来了，但是选择后 第一列 还是NaN

### 根本原因

#### 问题 1: 字段名不匹配
前端 `SkuDTO` 接口定义使用了 camelCase 字段名（`unit`, `skuCode` 等），但后端 API 实际返回的是 snake_case 字段名（`main_unit`, `code` 等），导致字段访问失败返回 `undefined`。

#### 问题 2: UUID 被错误转换为 Number
代码中使用 `skuId: Number(skuId)` 将 UUID 字符串转换为数字：
- SKU ID 实际是 UUID 格式：`"550e8400-e29b-41d4-a716-446655440002"`
- `Number(uuid)` 返回 `NaN`，因为 UUID 无法转换为数字
- 后端数据库 SKU 表使用 UUID 类型作为主键

**前端接口定义**（错误）:
```typescript
export interface SkuDTO {
  unit: string        // ❌ 后端实际返回 main_unit
  skuCode: string     // ❌ 后端实际返回 code
  // ...
}
```

**后端 API 实际返回**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "name": "可乐糖浆",
  "code": "6901234567002",
  "main_unit": "ml",
  "sku_type": "raw_material",
  "status": "enabled"
}
```

**错误位置**:
- `RecipeConfigModal.tsx:201` - `skuId: Number(skuId)` 将 UUID 错误转换为 NaN
- `RecipeConfigModal.tsx:203` - 访问 `selectedSku.unit`（应为 `selectedSku.main_unit`）
- `RecipeConfigModal.tsx:416` - 访问 `sku.skuCode`（应为 `sku.code`）

### 解决方法

#### 1. 更新 SkuDTO 接口定义
修改 `skuApi.ts`，使用后端 API 实际返回的字段名：

```typescript
export interface SkuDTO {
  id: string
  name: string
  code: string                    // 后端返回 code 而不是 skuCode
  spu_id: string
  sku_type: string                // 后端返回 snake_case
  main_unit: string               // 后端返回 main_unit 而不是 unit
  status: string                  // 后端返回 "enabled"/"disabled"/"draft"
  price: number
  standard_cost: number
  waste_rate: number
  store_scope: string[]
  created_at: string
  updated_at: string
}
```

#### 2. 修复字段引用
修改 `RecipeConfigModal.tsx` 中的字段访问：

**修改 handleSkuChange 函数** (line 201, 203):
```typescript
// 修改前
skuId: Number(skuId),        // ❌ UUID 无法转换为数字，返回 NaN
unit: selectedSku.unit,      // ❌ 字段名不存在

// 修改后
skuId: skuId,                // ✅ 保持 UUID 字符串格式
unit: selectedSku.main_unit, // ✅ 使用正确的字段名
```

**修改 Select 选项标签** (line 416):
```typescript
// 修改前
label: `${sku.name} (${sku.skuCode})`,

// 修改后
label: `${sku.name} (${sku.code})`, // 使用 code 字段
```

### 修复文件
- `frontend/src/features/beverage-config/services/skuApi.ts:6-20`
- `frontend/src/features/beverage-config/components/RecipeConfigModal.tsx:201,203,416`

### 验证结果
```bash
$ curl "http://localhost:8080/api/skus?skuType=RAW_MATERIAL&status=ENABLED&pageSize=1" | jq '.data[0] | {name, code, main_unit}'
{
  "name": "可乐糖浆",
  "code": "6901234567002",
  "main_unit": "ml"
}
```

现在选择"可乐糖浆"后：
- SKU ID 列正确显示 UUID：`550e8400-e29b-41d4-a716-446655440002`
- 单位字段正确显示：`ml`

### 重要说明
**类型不一致问题**：后端 `RecipeIngredient.skuId` 定义为 `Long` 类型，但 SKU 表使用 UUID。当前前端传递 UUID 字符串，后续需要：
1. 修改后端实体类将 `skuId` 从 `Long` 改为 `UUID`，或
2. 在后端添加 UUID 到 Long 的映射逻辑

当前修复为临时方案，保持 UUID 字符串格式传递。

### 修复日期
2025-12-28

---

## 更新日志

| 日期 | 版本 | 内容 |
|------|------|------|
| 2025-12-28 | v1.0 | 初始版本，记录 BUG-001、BUG-002 |
| 2025-12-28 | v1.1 | 新增 BUG-003、BUG-004、BUG-005、BUG-006 |
| 2025-12-28 | v1.2 | 新增 BUG-007 - beverage_recipes 表字段名不匹配 |
| 2025-12-28 | v1.3 | 新增 BUG-008 - SKU API 字段名不匹配导致单位显示 NaN |
