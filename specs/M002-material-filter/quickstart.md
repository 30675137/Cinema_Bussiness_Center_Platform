# Quickstart: Material Management Filter & Actions

**Spec**: M002-material-filter | **Date**: 2026-01-14  
**Purpose**: 快速启动开发和测试指南

## Prerequisites

### Development Environment

- **Node.js**: >= 18.0.0
- **Java**: 17
- **PostgreSQL**: 14+ (通过 Supabase 提供)
- **IDE**: VS Code (推荐) 或 IntelliJ IDEA

### Required Tools

- **npm** or **pnpm**: 前端依赖管理
- **Maven**: 后端依赖管理
- **Git**: 版本控制
- **Docker**: 本地 Supabase 数据库（可选）

---

## Quick Start (< 5 minutes)

### 1. Clone and Branch

```bash
# 确保在 M002-material-filter 分支
git checkout M002-material-filter

# 拉取最新代码
git pull origin M002-material-filter

# 检查工作目录
pwd
# 应该输出: /Users/lining/qoder/Cinema_Bussiness_Center_Platform
```

### 2. Install Dependencies

**Frontend**:
```bash
cd frontend
npm install
# 或
pnpm install
```

**Backend**:
```bash
cd ../backend
mvn clean install -DskipTests
```

### 3. Setup Database (本地开发)

**使用现有 Supabase 环境**:
```bash
# 检查 .env 文件
cat frontend/.env

# 应包含:
# VITE_SUPABASE_URL=http://localhost:54321
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

**启动 Supabase (如果未运行)**:
```bash
cd /path/to/supabase
supabase start
```

### 4. Run Development Servers

**Terminal 1 - Backend**:
```bash
cd backend
mvn spring-boot:run
# 后端服务: http://localhost:8080
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
# 前端服务: http://localhost:5173
```

### 5. Verify Setup

**Backend Health Check**:
```bash
curl http://localhost:8080/api/health
# Expected: {"status":"UP"}
```

**Frontend Access**:
- 打开浏览器：http://localhost:5173
- 导航到：物料管理 > 物料主数据管理

---

## Project Structure

### Frontend Files

```
frontend/src/
├── components/material/
│   ├── MaterialFilter.tsx           # ⭐ 新增：筛选器组件
│   ├── MaterialExportButton.tsx     # ⭐ 新增：导出按钮
│   ├── MaterialImportModal.tsx      # ⭐ 新增：导入弹窗
│   ├── MaterialBatchActions.tsx     # ⭐ 新增：批量操作
│   └── MaterialTable.tsx            # 🔄 修改：支持批量选择
├── features/material-management/
│   └── MaterialManagementPage.tsx   # 🔄 修改：集成新组件
├── hooks/
│   ├── useMaterials.ts              # 🔄 修改：支持筛选参数
│   ├── useExportMaterials.ts        # ⭐ 新增：导出 hook
│   ├── useImportMaterials.ts        # ⭐ 新增：导入 hook
│   └── useBatchMaterials.ts         # ⭐ 新增：批量操作 hook
├── services/
│   └── materialService.ts           # 🔄 修改：新增筛选/导出/导入接口
└── types/
    └── material.ts                  # 🔄 修改：新增相关类型定义
```

**图例**:
- ⭐ 新增文件
- 🔄 修改现有文件

### Backend Files

```
backend/src/main/java/com/cinema/
├── material/
│   ├── controller/
│   │   └── MaterialController.java          # 🔄 修改：新增筛选/导出/导入/批量接口
│   ├── service/
│   │   ├── MaterialService.java             # 🔄 修改：扩展筛选逻辑
│   │   ├── MaterialExportService.java       # ⭐ 新增：导出服务
│   │   └── MaterialImportService.java       # ⭐ 新增：导入服务
│   ├── dto/
│   │   ├── MaterialFilterDTO.java           # ⭐ 新增：筛选条件 DTO
│   │   ├── MaterialExportDTO.java           # ⭐ 新增：导出 DTO
│   │   ├── MaterialImportDataDTO.java       # ⭐ 新增：导入数据 DTO
│   │   ├── MaterialImportRecordDTO.java     # ⭐ 新增：导入记录 DTO
│   │   ├── MaterialImportResultDTO.java     # ⭐ 新增：导入结果 DTO
│   │   └── MaterialBatchOperationDTO.java   # ⭐ 新增：批量操作 DTO
│   └── repository/
│       └── MaterialRepository.java          # 🔄 修改：扩展筛选查询方法
└── common/
    └── util/
        └── ExcelUtil.java                   # ⭐ 新增：Excel 工具类
```

---

## Development Workflow

### Step 1: Frontend Component Development

**创建筛选器组件示例**:
```typescript
// frontend/src/components/material/MaterialFilter.tsx
import { Form, Select, InputNumber, Input, Button, Space } from 'antd';
import { MaterialCategory, MaterialStatus } from '@/types/material';

export function MaterialFilter({ onFilter }: { onFilter: (values: any) => void }) {
  const [form] = Form.useForm();
  
  const handleSubmit = (values: any) => {
    onFilter(values);
  };
  
  return (
    <Form form={form} layout="inline" onFinish={handleSubmit}>
      <Form.Item name="category" label="分类">
        <Select placeholder="全部" allowClear style={{ width: 120 }}>
          <Select.Option value={MaterialCategory.RAW_MATERIAL}>原料</Select.Option>
          <Select.Option value={MaterialCategory.PACKAGING}>包材</Select.Option>
        </Select>
      </Form.Item>
      
      <Form.Item name="status" label="状态">
        <Select placeholder="全部" allowClear style={{ width: 120 }}>
          <Select.Option value={MaterialStatus.ACTIVE}>在用</Select.Option>
          <Select.Option value={MaterialStatus.INACTIVE}>停用</Select.Option>
        </Select>
      </Form.Item>
      
      <Form.Item label="成本范围">
        <Space.Compact>
          <Form.Item name="minCost" noStyle>
            <InputNumber placeholder="最小" min={0} style={{ width: 100 }} />
          </Form.Item>
          <Input placeholder="~" disabled style={{ width: 30, textAlign: 'center' }} />
          <Form.Item name="maxCost" noStyle>
            <InputNumber placeholder="最大" min={0} style={{ width: 100 }} />
          </Form.Item>
        </Space.Compact>
      </Form.Item>
      
      <Form.Item name="keyword" label="关键词">
        <Input placeholder="搜索编码或名称" style={{ width: 200 }} />
      </Form.Item>
      
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">筛选</Button>
          <Button onClick={() => form.resetFields()}>重置</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
```

### Step 2: Backend Service Development

**创建导出服务示例**:
```java
// backend/src/main/java/com/cinema/material/service/MaterialExportService.java
package com.cinema.material.service;

import com.cinema.material.dto.MaterialExportDTO;
import com.cinema.material.dto.MaterialFilterDTO;
import com.cinema.material.repository.MaterialRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class MaterialExportService {
    private final MaterialRepository materialRepository;
    private static final int MAX_EXPORT_SIZE = 10000;
    private static final DateTimeFormatter DATE_FORMATTER = 
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    public ByteArrayOutputStream exportMaterials(MaterialFilterDTO filter) {
        // 1. 检查数据量
        long totalCount = materialRepository.countByFilter(filter);
        if (totalCount > MAX_EXPORT_SIZE) {
            throw new BusinessException("导出数据量过大（" + totalCount + " 条），请缩小筛选范围");
        }
        
        // 2. 查询数据
        List<Material> materials = materialRepository.findByFilter(filter);
        
        // 3. 生成 Excel
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100)) {
            Sheet sheet = workbook.createSheet("物料数据");
            
            // 创建表头
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "物料编码", "物料名称", "分类", "状态", "库存单位",
                "采购单位", "换算率", "标准成本", "规格", "描述", "创建时间"
            };
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }
            
            // 填充数据
            int rowIndex = 1;
            for (Material material : materials) {
                Row dataRow = sheet.createRow(rowIndex++);
                dataRow.createCell(0).setCellValue(material.getCode());
                dataRow.createCell(1).setCellValue(material.getName());
                // ... 填充其他列
            }
            
            // 输出到字节流
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out;
        } catch (Exception e) {
            throw new BusinessException("Excel 生成失败", e);
        }
    }
}
```

### Step 3: API Contract Testing

**使用 curl 测试**:
```bash
# 1. 测试筛选查询
curl -X GET "http://localhost:8080/api/materials?category=RAW_MATERIAL&status=ACTIVE&page=0&size=20"

# 2. 测试导出（保存到文件）
curl -X GET "http://localhost:8080/api/materials/export?category=RAW_MATERIAL" \
  -o materials_export.xlsx

# 3. 测试导入预览
curl -X POST "http://localhost:8080/api/materials/import/preview" \
  -F "file=@test_materials.xlsx"

# 4. 测试批量删除
curl -X POST "http://localhost:8080/api/materials/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "materialIds": ["uuid1", "uuid2"],
    "operation": "DELETE"
  }'
```

---

## Testing Strategy

### Unit Tests

**Frontend (Vitest + MSW)**:
```bash
cd frontend

# 运行所有测试
npm run test

# 运行特定测试
npm run test MaterialFilter.test.tsx

# 查看覆盖率
npm run test:coverage
```

**Backend (JUnit 5)**:
```bash
cd backend

# 运行所有测试
mvn test

# 运行特定测试类
mvn test -Dtest=MaterialExportServiceTest

# 生成覆盖率报告
mvn test jacoco:report
```

### Integration Tests

**Backend API Tests**:
```bash
cd backend
mvn test -Dtest=MaterialControllerIntegrationTest
```

### E2E Tests (可选)

**Playwright**:
```bash
cd frontend
npm run test:e2e
```

---

## Debugging Tips

### Frontend Debugging

**1. 启用 React DevTools**:
- 安装 Chrome 扩展：React Developer Tools
- 打开 Components 面板查看组件状态

**2. 调试 TanStack Query**:
```typescript
// 在 main.tsx 中启用 devtools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

**3. 网络请求监控**:
- 打开 Chrome DevTools -> Network 面板
- 筛选 XHR/Fetch 请求
- 检查请求参数和响应数据

### Backend Debugging

**1. 日志级别配置**:
```yaml
# application-dev.yml
logging:
  level:
    com.cinema.material: DEBUG
    org.springframework.web: DEBUG
```

**2. 数据库查询日志**:
```yaml
spring:
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        use_sql_comments: true
```

**3. IntelliJ IDEA 断点调试**:
- 在关键代码行左侧点击设置断点
- 点击 Debug 按钮启动应用
- 使用 Step Over (F8) / Step Into (F7) 单步执行

---

## Common Issues & Solutions

### Issue 1: 前端导入 ExcelJS 失败

**问题**:
```
Error: Cannot find module 'exceljs'
```

**解决**:
```bash
cd frontend
npm install exceljs file-saver
npm install -D @types/file-saver
```

### Issue 2: 后端 Excel 导出中文乱码

**问题**: 导出的 Excel 文件中文显示为乱码

**解决**:
```java
// 确保使用 UTF-8 编码
response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
response.setCharacterEncoding("UTF-8");
response.setHeader("Content-Disposition", 
    "attachment; filename=" + URLEncoder.encode("物料数据.xlsx", "UTF-8"));
```

### Issue 3: 批量操作事务回滚

**问题**: 部分操作失败导致全部回滚

**解决**: 不要在批量操作方法上添加 `@Transactional`，改为逐项操作并记录结果
```java
// ❌ 错误：整体事务
@Transactional
public BatchOperationResult batchDelete(List<String> ids) { ... }

// ✅ 正确：无整体事务，逐项处理
public BatchOperationResult batchDelete(List<String> ids) {
    for (String id : ids) {
        try {
            singleDelete(id); // 单独的事务方法
        } catch (Exception e) {
            // 记录失败
        }
    }
}

@Transactional
private void singleDelete(String id) { ... }
```

### Issue 4: 筛选查询性能慢

**问题**: 筛选查询耗时超过 10 秒

**解决**: 检查数据库索引
```sql
-- 查看现有索引
SELECT * FROM pg_indexes WHERE tablename = 'materials';

-- 创建复合索引（如果不存在）
CREATE INDEX idx_materials_filter 
ON materials(category, status, created_at DESC);
```

---

## Next Steps

开发完成后的检查清单：

- [ ] 所有代码文件包含 `@spec M002-material-filter` 标识
- [ ] 单元测试覆盖率 ≥ 80%
- [ ] API 契约测试通过
- [ ] 代码通过 ESLint / Checkstyle 检查
- [ ] 提交消息遵循 Conventional Commits 格式
- [ ] 更新 `CHANGELOG.md`（如果存在）
- [ ] 创建 Pull Request 到主分支

完成开发后，执行：
```bash
# 运行完整测试套件
cd frontend && npm run test && cd ../backend && mvn test

# 提交代码
git add .
git commit -m "feat(M002): implement material filter and batch operations"
git push origin M002-material-filter

# 创建 Pull Request（通过 GitHub/GitLab UI）
```

---

## Resources

- [Spec Document](./spec.md)
- [Implementation Plan](./plan.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/api.yaml)
- [Research Notes](./research.md)

---

## Support

如果遇到问题：

1. **检查日志**: 前端控制台、后端日志文件
2. **查阅文档**: 本目录下的 spec.md、plan.md、data-model.md
3. **运行测试**: 确保测试通过，排查失败原因
4. **查看示例**: 参考类似功能的实现（如 SPU 管理）

Happy Coding! 🚀
