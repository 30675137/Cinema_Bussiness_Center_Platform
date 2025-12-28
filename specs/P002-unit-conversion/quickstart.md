# Quickstart: 单位换算系统开发指南

**Branch**: `P002-unit-conversion` | **Date**: 2025-12-25

## 开发环境准备

### 前置条件

- Node.js 18+
- Java 21
- pnpm / npm
- PostgreSQL (Supabase)

### 快速启动

```bash
# 1. 切换到功能分支
git checkout P002-unit-conversion

# 2. 安装前端依赖
cd frontend && npm install

# 3. 启动前端开发服务器 (带 MSW Mock)
npm run dev

# 4. 启动后端服务 (新终端)
cd ../backend && ./mvnw spring-boot:run

# 5. 访问开发页面
open http://localhost:3000/bom/conversion
```

---

## 核心文件索引

### 前端文件

| 文件路径 | 说明 |
|---------|------|
| `frontend/src/pages/bom/ConversionPage.tsx` | 页面组件（路由入口） |
| `frontend/src/features/unit-conversion/components/` | 功能组件目录 |
| `frontend/src/features/unit-conversion/hooks/useConversions.ts` | TanStack Query Hooks |
| `frontend/src/features/unit-conversion/services/conversionService.ts` | API 服务层 |
| `frontend/src/features/unit-conversion/types/index.ts` | TypeScript 类型定义 |
| `frontend/src/features/unit-conversion/utils/cycleDetection.ts` | 循环检测工具 |
| `frontend/src/features/unit-conversion/utils/pathFinding.ts` | 最短路径工具 |
| `frontend/src/mocks/handlers/conversion.ts` | MSW Mock Handlers |

### 后端文件

| 文件路径 | 说明 |
|---------|------|
| `backend/src/main/java/com/cinema/unitconversion/controller/UnitConversionController.java` | REST 控制器 |
| `backend/src/main/java/com/cinema/unitconversion/service/UnitConversionService.java` | 业务逻辑服务 |
| `backend/src/main/java/com/cinema/unitconversion/service/ConversionPathService.java` | 路径计算服务 |
| `backend/src/main/java/com/cinema/unitconversion/repository/UnitConversionRepository.java` | 数据访问层 |
| `backend/src/main/java/com/cinema/unitconversion/domain/UnitConversion.java` | 领域实体 |
| `backend/src/main/java/com/cinema/unitconversion/dto/*.java` | DTO 定义 |

### 规格文档

| 文件路径 | 说明 |
|---------|------|
| `specs/P002-unit-conversion/spec.md` | 功能规格说明 |
| `specs/P002-unit-conversion/plan.md` | 实现计划 |
| `specs/P002-unit-conversion/research.md` | 研究文档 |
| `specs/P002-unit-conversion/data-model.md` | 数据模型 |
| `specs/P002-unit-conversion/contracts/api.yaml` | API 契约 |
| `specs/P002-unit-conversion/UIDEMO/` | UI 参考设计 |

---

## 开发任务清单

### TDD 流程 (Red-Green-Refactor)

1. **编写测试 (Red)**
   ```bash
   # 运行单元测试 (应失败)
   cd frontend && npm run test:unit
   cd ../backend && ./mvnw test
   ```

2. **实现功能 (Green)**
   - 实现最小可行代码使测试通过

3. **重构优化 (Refactor)**
   - 优化代码结构，确保测试仍通过

### 前端开发顺序

```text
1. 创建类型定义 (types/index.ts)
2. 创建 MSW Mock Handlers (mocks/handlers/conversion.ts)
3. 创建 API 服务层 (services/conversionService.ts)
4. 创建 TanStack Query Hooks (hooks/useConversions.ts)
5. 创建工具函数 (utils/cycleDetection.ts, pathFinding.ts)
6. 创建组件:
   - ConversionStats.tsx (统计卡片)
   - ConversionList.tsx (列表表格)
   - ConversionForm.tsx (创建/编辑表单)
   - ConversionChainGraph.tsx (可视化换算链)
7. 创建页面组件 (pages/bom/ConversionPage.tsx)
8. 添加路由配置 (Router.tsx)
```

### 后端开发顺序

```text
1. 创建领域实体 (domain/UnitConversion.java)
2. 创建 DTO 类 (dto/*.java)
3. 创建 Repository 接口 (repository/UnitConversionRepository.java)
4. 创建业务服务:
   - UnitConversionService.java (CRUD 操作)
   - ConversionPathService.java (路径计算)
5. 创建控制器 (controller/UnitConversionController.java)
6. 编写集成测试
```

---

## 测试命令

### 前端测试

```bash
cd frontend

# 运行所有单元测试
npm run test:unit

# 运行特定测试文件
npm run test:unit -- --filter "ConversionList"

# 运行测试覆盖率
npm run test:coverage

# 运行 E2E 测试
npm run test:e2e

# 运行特定 E2E 测试
npx playwright test conversion --headed
```

### 后端测试

```bash
cd backend

# 运行所有测试
./mvnw test

# 运行特定测试类
./mvnw test -Dtest=UnitConversionServiceTest

# 运行集成测试
./mvnw test -Dtest=*IntegrationTest
```

---

## API 调试

### 使用 curl 测试

```bash
# 获取所有换算规则
curl -X GET http://localhost:8080/api/unit-conversions

# 获取统计信息
curl -X GET http://localhost:8080/api/unit-conversions/stats

# 创建换算规则
curl -X POST http://localhost:8080/api/unit-conversions \
  -H "Content-Type: application/json" \
  -d '{
    "fromUnit": "瓶",
    "toUnit": "ml",
    "conversionRate": 750,
    "category": "volume"
  }'

# 验证循环依赖
curl -X POST http://localhost:8080/api/unit-conversions/validate-cycle \
  -H "Content-Type: application/json" \
  -d '{
    "fromUnit": "A",
    "toUnit": "B"
  }'

# 计算换算路径
curl -X POST http://localhost:8080/api/unit-conversions/calculate-path \
  -H "Content-Type: application/json" \
  -d '{
    "fromUnit": "瓶",
    "toUnit": "L"
  }'
```

### 使用 Postman

导入 API 契约文件：
- 打开 Postman
- Import → File → 选择 `specs/P002-unit-conversion/contracts/api.yaml`
- 自动生成请求集合

---

## 数据库操作

### 查看现有换算数据

```sql
-- 查看所有换算规则
SELECT * FROM unit_conversions ORDER BY category, from_unit;

-- 按类别统计
SELECT category, COUNT(*) as count
FROM unit_conversions
GROUP BY category;

-- 查看体积类换算
SELECT * FROM unit_conversions WHERE category = 'volume';
```

### 插入测试数据

```sql
-- 插入新的换算规则
INSERT INTO unit_conversions (from_unit, to_unit, conversion_rate, category)
VALUES ('瓶', 'ml', 750, 'volume')
ON CONFLICT (from_unit, to_unit) DO NOTHING;
```

---

## 常见问题

### Q: MSW Mock 不生效？

```typescript
// 确保 main.tsx 中正确初始化 MSW
if (process.env.NODE_ENV === 'development') {
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}
```

### Q: 类别显示不正确？

前端需要将数据库值（小写）映射为显示值（大写）：

```typescript
// 使用 categoryMapping 工具
import { DB_TO_DISPLAY } from '../utils/categoryMapping';

const displayCategory = DB_TO_DISPLAY[conversion.category];
```

### Q: 循环检测报错？

确保在创建/编辑表单提交前调用 validateCycle API：

```typescript
const { mutate: validateCycle } = useValidateCycle();

const onSubmit = async (data) => {
  const cycleResult = await validateCycle({
    fromUnit: data.fromUnit,
    toUnit: data.toUnit,
    excludeId: editingId, // 编辑时排除当前规则
  });

  if (!cycleResult.valid) {
    message.error(`检测到循环：${cycleResult.cyclePath.join('→')}`);
    return;
  }

  // 继续保存...
};
```

---

## 参考资源

- [UIDEMO 设计稿](./UIDEMO/ConversionManagement.tsx)
- [API 契约](./contracts/api.yaml)
- [数据模型](./data-model.md)
- [研究文档](./research.md)
- [项目宪法](/.specify/memory/constitution.md)
