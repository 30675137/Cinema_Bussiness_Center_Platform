# Research: Material Management Filter & Actions

**Spec**: M002-material-filter | **Date**: 2026-01-14  
**Purpose**: Resolve technical unknowns and establish implementation approach

## Research Questions

Based on the Technical Context, all technical choices are clear. No NEEDS CLARIFICATION markers found.

## Technology Decisions

### 1. Excel Processing Library Selection

**Decision**: 前端使用 **ExcelJS**，后端使用 **Apache POI**

**Rationale**:
- **ExcelJS**: 
  - 纯 JavaScript 实现，无需额外依赖
  - 支持浏览器环境，可在前端直接生成和解析 Excel
  - API 简洁，支持流式处理大文件
  - 良好的 TypeScript 类型支持
  - 支持 .xlsx 格式（Office Open XML）
  
- **Apache POI**:
  - Java 生态最成熟的 Excel 处理库
  - 项目已集成（用于其他导出功能）
  - 支持 .xls 和 .xlsx 两种格式
  - 提供 SXSSF API 用于大数据量流式写入

**Alternatives Considered**:
- SheetJS (js-xlsx): 功能类似 ExcelJS，但 TypeScript 支持较弱
- XLSX-Style: 已不再维护
- 后端使用 EasyExcel: 国内流行，但团队更熟悉 Apache POI

**Implementation Notes**:
```typescript
// 前端导出示例
import ExcelJS from 'exceljs';

export async function exportMaterials(materials: Material[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('物料数据');
  
  worksheet.columns = [
    { header: '物料编码', key: 'code', width: 15 },
    { header: '物料名称', key: 'name', width: 20 },
    // ...
  ];
  
  worksheet.addRows(materials.map(m => ({
    code: m.code,
    name: m.name,
    // ...
  })));
  
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  // ... 下载逻辑
}
```

### 2. 筛选条件状态管理

**Decision**: 使用 **受控表单组件** + **URL Query Parameters**

**Rationale**:
- 受控表单组件确保筛选条件的实时同步
- URL Query Parameters 支持：
  - 筛选条件的持久化（刷新页面保留筛选）
  - 分享筛选结果链接
  - 浏览器前进/后退按钮支持
- 使用 React Router 的 `useSearchParams` hook 管理 URL 参数

**Alternatives Considered**:
- 仅使用本地 state：无法持久化，用户体验较差
- 使用 Zustand 全局状态：过度设计，筛选条件无需跨页面共享
- 使用 localStorage：不支持链接分享和浏览器历史

**Implementation Notes**:
```typescript
import { useSearchParams } from 'react-router-dom';

export function MaterialFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || '';
  const keyword = searchParams.get('keyword') || '';
  
  const handleFilter = (values: FilterValues) => {
    const params = new URLSearchParams();
    if (values.category) params.set('category', values.category);
    if (values.status) params.set('status', values.status);
    if (values.keyword) params.set('keyword', values.keyword);
    setSearchParams(params);
  };
  
  // ...
}
```

### 3. 批量导入数据校验策略

**Decision**: **前端预校验** + **后端完整校验**

**Rationale**:
- 前端预校验：
  - 提前发现格式错误，减少无效请求
  - 即时反馈，提升用户体验
  - 校验规则：文件格式、文件大小、必填列、数据类型
  
- 后端完整校验：
  - 业务规则校验（唯一性、关联数据存在性）
  - 安全防护（防止恶意数据）
  - 事务一致性保证

**Alternatives Considered**:
- 仅后端校验：用户体验较差，需等待上传完成才能看到错误
- 仅前端校验：不安全，无法保证数据完整性
- 前端完整校验：前后端校验规则重复维护，易不一致

**Implementation Notes**:
```typescript
// 前端预校验
export function validateImportFile(file: File): ValidationResult {
  const errors: string[] = [];
  
  // 1. 文件格式校验
  if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    errors.push('仅支持 .xlsx 和 .xls 格式');
  }
  
  // 2. 文件大小校验
  if (file.size > 10 * 1024 * 1024) {
    errors.push('文件大小不能超过 10MB');
  }
  
  return { valid: errors.length === 0, errors };
}

// 后端完整校验
@Service
public class MaterialImportService {
  public ImportResult validateAndImport(List<MaterialImportDTO> records) {
    List<ValidationError> errors = new ArrayList<>();
    
    // 1. 数据格式校验
    for (int i = 0; i < records.size(); i++) {
      MaterialImportDTO record = records.get(i);
      if (StringUtils.isBlank(record.getName())) {
        errors.add(new ValidationError(i + 1, "物料名称不能为空"));
      }
      // ...
    }
    
    // 2. 业务规则校验
    Set<String> codes = records.stream()
      .map(MaterialImportDTO::getCode)
      .filter(StringUtils::isNotBlank)
      .collect(Collectors.toSet());
    
    List<Material> existingMaterials = materialRepository.findByCodeIn(codes);
    // ...
    
    return new ImportResult(successCount, errors);
  }
}
```

### 4. 批量操作事务处理

**Decision**: 使用 **单事务批量处理** + **详细结果反馈**

**Rationale**:
- 单事务批量处理：
  - 保证数据一致性
  - 提高性能（减少数据库往返）
  - Spring Boot `@Transactional` 注解支持
  
- 详细结果反馈：
  - 记录每个操作的成功/失败状态
  - 提供具体的失败原因（如被 BOM 引用）
  - 前端展示成功/失败数量和详情

**Alternatives Considered**:
- 逐条操作：性能差，无法保证一致性
- 全部成功或全部失败：用户体验差，一个错误导致全部失败
- 多事务分批处理：复杂度高，一致性难保证

**Implementation Notes**:
```java
@Service
public class MaterialService {
  
  @Transactional
  public BatchOperationResult batchDelete(List<String> materialIds) {
    List<BatchOperationItem> results = new ArrayList<>();
    
    for (String id : materialIds) {
      try {
        // 检查是否被 BOM 引用
        boolean inUse = bomRepository.existsByMaterialId(id);
        if (inUse) {
          results.add(BatchOperationItem.failure(id, "物料已被 BOM 引用，无法删除"));
          continue;
        }
        
        materialRepository.deleteById(id);
        results.add(BatchOperationItem.success(id));
      } catch (Exception e) {
        results.add(BatchOperationItem.failure(id, e.getMessage()));
      }
    }
    
    long successCount = results.stream().filter(BatchOperationItem::isSuccess).count();
    long failureCount = results.size() - successCount;
    
    return new BatchOperationResult(successCount, failureCount, results);
  }
}
```

### 5. 大数据量导出优化

**Decision**: **分页查询** + **流式写入** + **限制导出数量**

**Rationale**:
- 分页查询：避免一次性加载全部数据到内存
- 流式写入：逐批次写入 Excel，降低内存占用
- 限制导出数量：单次导出最多 10000 条，超出提示用户筛选

**Alternatives Considered**:
- 一次性查询全部数据：内存占用高，可能 OOM
- 异步导出 + 邮件通知：复杂度高，需要额外的任务队列和邮件服务
- 无限制导出：可能导致服务器资源耗尽

**Implementation Notes**:
```java
@Service
public class MaterialExportService {
  
  private static final int PAGE_SIZE = 1000;
  private static final int MAX_EXPORT_SIZE = 10000;
  
  public ByteArrayOutputStream exportMaterials(MaterialFilterDTO filter) {
    long totalCount = materialRepository.countByFilter(filter);
    
    if (totalCount > MAX_EXPORT_SIZE) {
      throw new BusinessException("导出数据量过大（" + totalCount + " 条），请使用筛选条件缩小范围");
    }
    
    try (SXSSFWorkbook workbook = new SXSSFWorkbook(100)) {
      Sheet sheet = workbook.createSheet("物料数据");
      
      // 写入表头
      Row headerRow = sheet.createRow(0);
      // ...
      
      // 分页查询并写入
      int pageNumber = 0;
      int rowIndex = 1;
      
      while (true) {
        Pageable pageable = PageRequest.of(pageNumber++, PAGE_SIZE);
        Page<Material> page = materialRepository.findByFilter(filter, pageable);
        
        if (page.isEmpty()) break;
        
        for (Material material : page.getContent()) {
          Row dataRow = sheet.createRow(rowIndex++);
          // ... 写入数据
        }
        
        if (!page.hasNext()) break;
      }
      
      ByteArrayOutputStream out = new ByteArrayOutputStream();
      workbook.write(out);
      return out;
    }
  }
}
```

## Best Practices

### Frontend Best Practices

1. **筛选器性能优化**:
   - 使用 `useMemo` 缓存筛选后的结果
   - 使用 `debounce` 延迟关键词搜索请求（300ms）
   - 避免在每次输入时触发 API 请求

2. **Excel 文件下载**:
   - 使用 Blob URL 下载，避免内存泄漏
   - 文件名包含时间戳，避免覆盖
   - 下载完成后清理 Blob URL

3. **导入预览优化**:
   - 限制预览显示行数（最多 100 行）
   - 使用虚拟滚动展示大量错误信息
   - 提供"导出错误明细"功能

### Backend Best Practices

1. **数据库查询优化**:
   - 为筛选条件创建复合索引（category, status, created_at）
   - 使用 JPA Specification 动态构建查询条件
   - 避免 N+1 查询问题（使用 JOIN FETCH）

2. **异常处理**:
   - 使用统一的异常编号（MAT_xxx）
   - 提供清晰的错误消息和解决建议
   - 记录详细的错误日志（包含请求参数）

3. **安全防护**:
   - 验证 Excel 文件真实格式（防止恶意文件伪装）
   - 限制单次操作的数据量
   - 对用户输入进行 XSS 过滤

## Dependencies & Versions

### Frontend
- `exceljs`: ^4.4.0 - Excel 文件处理
- `file-saver`: ^2.0.5 - 文件下载辅助库
- 无需新增其他依赖，使用现有技术栈

### Backend
- `org.apache.poi:poi`: 5.2.3 - Excel 基础库（已集成）
- `org.apache.poi:poi-ooxml`: 5.2.3 - XLSX 格式支持（已集成）
- 无需新增其他依赖

## Performance Considerations

### Estimated Metrics

| Operation | Target | Expected Reality |
|-----------|--------|-----------------|
| 筛选查询（1000条） | < 5秒 | ~2秒（有索引） |
| 导出1000条 | < 10秒 | ~5秒（流式写入） |
| 导入100条（预览） | < 5秒 | ~2秒（前端解析） |
| 批量操作50项 | < 5秒 | ~3秒（单事务） |

### Optimization Strategies

1. **数据库索引**:
   ```sql
   CREATE INDEX idx_materials_filter 
   ON materials(category, status, created_at);
   ```

2. **前端缓存**:
   - TanStack Query 自动缓存查询结果
   - 设置 `staleTime: 5 * 60 * 1000`（5分钟）
   - 手动操作后自动失效缓存

3. **后端分页**:
   - 使用 Spring Data JPA 分页查询
   - 默认页大小 20 条
   - 最大页大小 100 条

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Excel 文件解析失败 | 中 | 中 | 前端预校验 + 后端异常捕获 + 用户友好提示 |
| 大数据量导出超时 | 低 | 中 | 限制导出数量 + 流式写入 + 超时提示 |
| 批量操作部分失败 | 高 | 低 | 详细结果反馈 + 允许重试失败项 |
| 并发导入冲突 | 低 | 中 | 数据库唯一约束 + 乐观锁 |

## Testing Strategy

### Unit Tests (必须)
- 前端：筛选条件组合逻辑、Excel 解析逻辑、数据格式化
- 后端：筛选查询构建、导入数据校验、批量操作事务

### Integration Tests (必须)
- 后端：完整的导出流程、导入流程、批量操作流程
- API 契约测试（使用 MockMvc）

### E2E Tests (可选)
- 完整的用户操作流程：筛选 → 导出 → 导入 → 批量操作
- 使用 Playwright，优先级较低

## Conclusion

所有技术选型和实现策略已明确：
- ✅ Excel 处理：ExcelJS (前端) + Apache POI (后端)
- ✅ 筛选状态管理：受控表单 + URL Query Parameters
- ✅ 导入校验：前端预校验 + 后端完整校验
- ✅ 批量操作：单事务 + 详细结果反馈
- ✅ 导出优化：分页查询 + 流式写入 + 数量限制

无需进一步研究，可以直接进入 Phase 1 设计阶段。
