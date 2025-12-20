# 开发快速入门：场景包管理

**Feature**: 017-scenario-package
**目标读者**: 前后端开发人员
**前置阅读**: [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/api.yaml](./contracts/api.yaml)

---

## 概述

本文档为开发人员提供场景包管理功能的实现快速入门，包括：
- 开发环境配置
- 数据库初始化
- 后端实现要点
- 前端实现要点
- 测试策略
- 常见问题排查

---

## 1. 开发环境配置

### 1.1 必需工具

| 工具 | 版本 | 用途 |
|------|------|------|
| Node.js | ≥ 20.x | 前端开发和构建 |
| Java JDK | ≥ 21 | 后端开发 |
| PostgreSQL Client | ≥ 15 | 数据库访问（通过 Supabase） |
| Git | ≥ 2.x | 版本控制 |
| VS Code / IntelliJ IDEA | Latest | IDE |

### 1.2 环境变量配置

**后端 (`backend/src/main/resources/application.yml`)**:
```yaml
supabase:
  url: ${SUPABASE_URL}  # https://your-project.supabase.co
  api-key: ${SUPABASE_ANON_KEY}  # 公开匿名密钥
  storage:
    bucket: scenario-packages
    base-url: ${SUPABASE_URL}/storage/v1

spring:
  datasource:
    url: jdbc:postgresql://${SUPABASE_DB_HOST}:5432/${SUPABASE_DB_NAME}
    username: ${SUPABASE_DB_USER}
    password: ${SUPABASE_DB_PASSWORD}
```

**前端 (`.env.local`)**:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 1.3 分支切换

```bash
# 确保在正确的功能分支
git checkout 017-scenario-package

# 验证 active_spec 指向当前功能
cat .specify/active_spec.txt
# 应输出: specs/017-scenario-package/spec.md
```

---

## 2. 数据库初始化

### 2.1 创建 Supabase Storage Bucket

在 Supabase Dashboard → Storage → Create Bucket:
- Bucket name: `scenario-packages`
- Public: ✅ (允许公开读取)
- File size limit: 5MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

### 2.2 执行数据库迁移

使用 Flyway 或直接在 Supabase SQL Editor 执行以下脚本：

```bash
# 后端项目根目录
cd backend

# 运行迁移（Flyway）
mvn flyway:migrate

# 或手动执行 SQL（复制 data-model.md 中的 DDL）
# 在 Supabase Dashboard → SQL Editor → New Query
```

**迁移脚本位置**: `backend/src/main/resources/db/migration/V1__create_scenario_packages.sql`

### 2.3 验证数据库表

```sql
-- 检查所有表是否创建成功
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'scenario_%' OR table_name LIKE 'package_%';

-- 应返回:
-- scenario_packages
-- package_rules
-- package_hall_associations
-- package_benefits
-- package_items
-- package_services
-- package_pricing
```

---

## 3. 后端实现要点

### 3.1 项目结构

```
backend/src/main/java/com/cinema/scenariopackage/
├── controller/
│   └── ScenarioPackageController.java      # REST API 端点
├── service/
│   ├── ScenarioPackageService.java         # 业务逻辑
│   ├── ImageUploadService.java             # 图片上传服务
│   └── PricingService.java                 # 定价计算服务
├── repository/
│   ├── ScenarioPackageRepository.java      # 主表 DAO
│   ├── PackageRuleRepository.java
│   ├── PackageItemRepository.java
│   └── ...
├── model/
│   ├── ScenarioPackage.java                # JPA 实体
│   ├── PackageRule.java
│   └── ...
├── dto/
│   ├── CreatePackageRequest.java           # 创建场景包请求
│   ├── UpdatePackageRequest.java           # 更新场景包请求
│   ├── ScenarioPackageDTO.java             # 场景包详情响应
│   ├── ScenarioPackageSummary.java         # 场景包列表摘要
│   ├── AddBenefitRequest.java              # 添加硬权益请求 (US2)
│   ├── AddItemRequest.java                 # 添加单品请求 (US2)
│   ├── AddServiceRequest.java              # 添加服务请求 (US2)
│   ├── ConfigureRulesRequest.java          # 配置规则请求 (US2)
│   ├── ImageUploadRequest.java             # 图片上传请求
│   ├── ImageUploadResponse.java            # 预签名 URL 响应
│   └── ImageConfirmRequest.java            # 图片上传确认
└── exception/
    ├── PackageNotFoundException.java       # 自定义异常
    └── ConcurrentModificationException.java
```

### 3.2 关键实现模式

#### 3.2.1 乐观锁实现（JPA @Version）

```java
@Entity
@Table(name = "scenario_packages")
public class ScenarioPackage {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Version  // JPA 乐观锁注解
    @Column(name = "version_lock", nullable = false)
    private Integer versionLock;

    // 其他字段...
}

// Service 层
public ScenarioPackageDTO updatePackage(UUID id, UpdatePackageRequest request) {
    ScenarioPackage pkg = repository.findById(id)
        .orElseThrow(() -> new PackageNotFoundException(id));

    // JPA 会自动检查 versionLock，如果不匹配抛出 OptimisticLockException
    pkg.setName(request.getName());
    // ... 其他更新

    try {
        return toDTO(repository.save(pkg));
    } catch (OptimisticLockException e) {
        throw new ConcurrentModificationException("该场景包已被他人修改，请刷新后重试");
    }
}
```

#### 3.2.2 版本创建逻辑

```java
public ScenarioPackageDTO updatePublishedPackage(UUID id, UpdatePackageRequest request) {
    ScenarioPackage oldPkg = repository.findById(id).orElseThrow();

    if (oldPkg.getStatus() == PackageStatus.PUBLISHED) {
        // 创建新版本
        ScenarioPackage newPkg = new ScenarioPackage();
        newPkg.setBasePackageId(oldPkg.getBasePackageId() != null ?
            oldPkg.getBasePackageId() : oldPkg.getId());
        newPkg.setVersion(oldPkg.getVersion() + 1);
        newPkg.setStatus(PackageStatus.DRAFT);
        newPkg.setIsLatest(true);
        // 复制其他字段...

        // 保存新版本
        ScenarioPackage saved = repository.save(newPkg);

        // 更新旧版本的 is_latest 标记
        oldPkg.setIsLatest(false);
        repository.save(oldPkg);

        // 复制所有关联数据（rules, items, services, etc.）
        copyAssociations(oldPkg.getId(), saved.getId());

        return toDTO(saved);
    } else {
        // 草稿状态直接更新
        // ...
    }
}
```

#### 3.2.3 图片上传（预签名 URL）

```java
@Service
public class ImageUploadService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.api-key}")
    private String apiKey;

    public UploadUrlResponse generateUploadUrl(UUID packageId, String fileName, long fileSize, String mimeType) {
        // 验证文件类型和大小
        validateFile(fileName, fileSize, mimeType);

        // 生成唯一文件路径
        String path = "backgrounds/" + UUID.randomUUID() + "-" + fileName;

        // 调用 Supabase Storage API 生成预签名 URL
        String endpoint = supabaseUrl + "/storage/v1/object/sign/scenario-packages/" + path;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of("expiresIn", 600); // 10 分钟有效期

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map> response = restTemplate.exchange(
            endpoint, HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);

        String signedUrl = (String) response.getBody().get("signedUrl");
        String publicUrl = supabaseUrl + "/storage/v1/object/public/scenario-packages/" + path;

        return new UploadUrlResponse(signedUrl, publicUrl, 600);
    }

    private void validateFile(String fileName, long fileSize, String mimeType) {
        if (fileSize > 5 * 1024 * 1024) {
            throw new ValidationException("文件大小超过5MB限制");
        }
        if (!List.of("image/jpeg", "image/png", "image/webp").contains(mimeType)) {
            throw new ValidationException("仅支持 JPG/PNG/WebP 格式");
        }
    }
}
```

#### 3.2.4 定价计算（实时）

```java
@Service
public class PricingService {

    public ReferencePriceResponse calculateReferencePrice(UUID packageId) {
        // 查询所有单品项
        List<PackageItem> items = itemRepository.findByPackageId(packageId);
        BigDecimal itemsTotal = items.stream()
            .map(pi -> {
                Item item = itemRepository.findById(pi.getItemId())
                    .orElseThrow(() -> new ItemNotFoundException(pi.getItemId()));
                return item.getPrice().multiply(new BigDecimal(pi.getQuantity()));
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 查询所有服务项
        List<PackageService> services = serviceRepository.findByPackageId(packageId);
        BigDecimal servicesTotal = services.stream()
            .map(ps -> {
                Service service = serviceRepository.findById(ps.getServiceId())
                    .orElseThrow(() -> new ServiceNotFoundException(ps.getServiceId()));
                return service.getPrice();
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal referencePrice = itemsTotal.add(servicesTotal);

        // 如果已设置打包价格，计算优惠
        PackagePricing pricing = pricingRepository.findByPackageId(packageId).orElse(null);
        BigDecimal discountPercentage = null;
        BigDecimal discountAmount = null;

        if (pricing != null && pricing.getPackagePrice() != null) {
            BigDecimal packagePrice = pricing.getPackagePrice();
            if (referencePrice.compareTo(BigDecimal.ZERO) > 0) {
                discountPercentage = packagePrice.divide(referencePrice, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100));
                discountAmount = referencePrice.subtract(packagePrice);
            }
        }

        return new ReferencePriceResponse(
            referencePrice, itemsTotal, servicesTotal,
            pricing != null ? pricing.getPackagePrice() : null,
            discountPercentage, discountAmount
        );
    }
}
```

#### 3.2.5 US2 内容管理方法

```java
@Service
public class ScenarioPackageService {
    
    // US2: 配置规则
    @Transactional
    public ScenarioPackageDTO configureRules(UUID id, ConfigureRulesRequest request) {
        ScenarioPackage pkg = repository.findById(id)
            .orElseThrow(() -> new PackageNotFoundException(id));
        
        // 乐观锁检查
        if (request.getVersionLock() != null && 
            !request.getVersionLock().equals(pkg.getVersionLock())) {
            throw new ConcurrentModificationException("该场景包已被他人修改");
        }
        
        // 业务规则：minPeople <= maxPeople
        if (request.getMinPeople() != null && request.getMaxPeople() != null &&
            request.getMinPeople() > request.getMaxPeople()) {
            throw new ValidationException("最少人数不能大于最多人数");
        }
        
        PackageRule rule = ruleRepository.findByPackageId(id)
            .orElseGet(() -> new PackageRule(id));
        rule.setDurationHours(request.getDurationHours());
        rule.setMinPeople(request.getMinPeople());
        rule.setMaxPeople(request.getMaxPeople());
        ruleRepository.save(rule);
        
        return toDTO(pkg);
    }
    
    // US2: 添加硬权益
    @Transactional
    public ScenarioPackageDTO addBenefit(UUID id, AddBenefitRequest request) {
        ScenarioPackage pkg = repository.findById(id)
            .orElseThrow(() -> new PackageNotFoundException(id));
        
        PackageBenefit benefit = new PackageBenefit();
        benefit.setPackageId(id);
        benefit.setBenefitType(request.getBenefitType());
        benefit.setDiscountRate(request.getDiscountRate());
        benefit.setFreeCount(request.getFreeCount());
        benefit.setDescription(request.getDescription());
        benefitRepository.save(benefit);
        
        return toDTO(pkg);
    }
    
    // US2: 添加单品（带快照）
    @Transactional
    public ScenarioPackageDTO addItem(UUID id, AddItemRequest request) {
        ScenarioPackage pkg = repository.findById(id)
            .orElseThrow(() -> new PackageNotFoundException(id));
        
        PackageItem item = new PackageItem();
        item.setPackageId(id);
        item.setItemId(request.getItemId());
        item.setQuantity(request.getQuantity());
        item.setItemNameSnapshot(request.getItemNameSnapshot());   // 快照
        item.setItemPriceSnapshot(request.getItemPriceSnapshot()); // 快照
        itemRepository.save(item);
        
        return toDTO(pkg);
    }
    
    // US2: 添加服务（带快照）
    @Transactional
    public ScenarioPackageDTO addService(UUID id, AddServiceRequest request) {
        ScenarioPackage pkg = repository.findById(id)
            .orElseThrow(() -> new PackageNotFoundException(id));
        
        PackageServiceItem service = new PackageServiceItem();
        service.setPackageId(id);
        service.setServiceId(request.getServiceId());
        service.setServiceNameSnapshot(request.getServiceNameSnapshot());
        service.setServicePriceSnapshot(request.getServicePriceSnapshot());
        serviceRepository.save(service);
        
        return toDTO(pkg);
    }
}
```

#### 3.2.6 US2 API 端点

```java
@RestController
@RequestMapping("/api/scenario-packages")
public class ScenarioPackageController {
    
    // US2: 配置规则
    @PutMapping("/{id}/rules")
    public ResponseEntity<ApiResponse<ScenarioPackageDTO>> configureRules(
            @PathVariable UUID id,
            @Valid @RequestBody ConfigureRulesRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.configureRules(id, request)));
    }
    
    // US2: 添加硬权益
    @PostMapping("/{id}/benefits")
    public ResponseEntity<ApiResponse<ScenarioPackageDTO>> addBenefit(
            @PathVariable UUID id,
            @Valid @RequestBody AddBenefitRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.addBenefit(id, request)));
    }
    
    // US2: 删除硬权益
    @DeleteMapping("/{id}/benefits/{benefitId}")
    public ResponseEntity<ApiResponse<ScenarioPackageDTO>> removeBenefit(
            @PathVariable UUID id,
            @PathVariable UUID benefitId) {
        return ResponseEntity.ok(ApiResponse.success(service.removeBenefit(id, benefitId)));
    }
    
    // US2: 添加单品
    @PostMapping("/{id}/items")
    public ResponseEntity<ApiResponse<ScenarioPackageDTO>> addItem(
            @PathVariable UUID id,
            @Valid @RequestBody AddItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.addItem(id, request)));
    }
    
    // US2: 更新单品数量
    @PutMapping("/{id}/items/{itemId}/quantity")
    public ResponseEntity<ApiResponse<ScenarioPackageDTO>> updateItemQuantity(
            @PathVariable UUID id,
            @PathVariable UUID itemId,
            @RequestParam @Min(1) Integer quantity) {
        return ResponseEntity.ok(ApiResponse.success(
            service.updateItemQuantity(id, itemId, quantity)));
    }
    
    // US2: 删除单品
    @DeleteMapping("/{id}/items/{itemId}")
    public ResponseEntity<ApiResponse<ScenarioPackageDTO>> removeItem(
            @PathVariable UUID id,
            @PathVariable UUID itemId) {
        return ResponseEntity.ok(ApiResponse.success(service.removeItem(id, itemId)));
    }
    
    // US2: 添加服务
    @PostMapping("/{id}/services")
    public ResponseEntity<ApiResponse<ScenarioPackageDTO>> addService(
            @PathVariable UUID id,
            @Valid @RequestBody AddServiceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.addService(id, request)));
    }
    
    // US2: 删除服务
    @DeleteMapping("/{id}/services/{serviceId}")
    public ResponseEntity<ApiResponse<ScenarioPackageDTO>> removeService(
            @PathVariable UUID id,
            @PathVariable UUID serviceId) {
        return ResponseEntity.ok(ApiResponse.success(service.removeService(id, serviceId)));
    }
}
```

### 3.3 API 响应格式标准化

**成功响应**（单个资源）:
```java
@GetMapping("/{id}")
public ResponseEntity<ApiResponse<ScenarioPackageDTO>> getPackage(@PathVariable UUID id) {
    ScenarioPackageDTO dto = service.findById(id);
    return ResponseEntity.ok(ApiResponse.success(dto));
}

// ApiResponse 类
public class ApiResponse<T> {
    private T data;
    private String timestamp;

    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.data = data;
        response.timestamp = Instant.now().toString();
        return response;
    }
}
```

**成功响应**（列表）:
```java
@GetMapping
public ResponseEntity<ListResponse<ScenarioPackageSummary>> listPackages(Pageable pageable) {
    Page<ScenarioPackageDTO> page = service.findAll(pageable);
    return ResponseEntity.ok(ListResponse.success(page.getContent(), page.getTotalElements()));
}

// ListResponse 类
public class ListResponse<T> {
    private boolean success = true;
    private List<T> data;
    private long total;
    private String message;

    public static <T> ListResponse<T> success(List<T> data, long total) {
        ListResponse<T> response = new ListResponse<>();
        response.data = data;
        response.total = total;
        return response;
    }
}
```

**错误响应**:
```java
@ExceptionHandler(PackageNotFoundException.class)
public ResponseEntity<ErrorResponse> handleNotFound(PackageNotFoundException ex) {
    ErrorResponse error = new ErrorResponse(
        false, "NOT_FOUND", ex.getMessage(), null
    );
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
}

// ErrorResponse 类
public record ErrorResponse(
    boolean success,
    String error,
    String message,
    Object details
) {}
```

---

## 4. 前端实现要点

### 4.1 项目结构

```
frontend/src/features/scenario-package-management/
├── components/
│   ├── atoms/
│   │   ├── ImageUpload.tsx                # 图片上传组件 (Supabase 集成)
│   │   └── StatusBadge.tsx                # 状态标签
│   ├── molecules/
│   │   ├── PackageForm.tsx                # 场景包基本信息表单
│   │   ├── PackageListFilters.tsx         # 列表筛选器
│   │   ├── RuleConfigurator.tsx           # 规则配置器 (US2)
│   │   ├── BenefitSelector.tsx            # 硬权益选择器 (US2)
│   │   ├── ItemSelector.tsx               # 单品选择器 (US2)
│   │   └── ServiceSelector.tsx            # 服务选择器 (US2)
│   └── organisms/
│       ├── PackageList.tsx                # 场景包列表
│       ├── PackageEditor.tsx              # 场景包编辑器
│       └── ContentConfigurator.tsx        # 内容配置器 (US2)
├── hooks/
│   ├── usePackageList.ts                  # 列表查询 hook
│   ├── usePackageMutation.ts              # 增删改 hook
│   └── usePricing.ts                      # 定价计算 hook
├── services/
│   └── packageService.ts                  # API 调用封装
├── types/
│   └── index.ts                           # TypeScript 类型定义
└── stores/
    └── packageStore.ts                    # Zustand 状态管理
```

### 4.2 关键实现模式

#### 4.2.1 TanStack Query 数据获取

```typescript
// services/packageService.ts
import { apiClient } from '@/services/apiClient';

export const packageService = {
  list: async (params: ListParams): Promise<ListResponse<ScenarioPackage>> => {
    const { data } = await apiClient.get('/scenario-packages', { params });
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<ScenarioPackageDetail>> => {
    const { data } = await apiClient.get(`/scenario-packages/${id}`);
    return data;
  },

  create: async (request: CreatePackageRequest): Promise<ApiResponse<ScenarioPackageDetail>> => {
    const { data } = await apiClient.post('/scenario-packages', request);
    return data;
  },

  update: async (id: string, request: UpdatePackageRequest): Promise<ApiResponse<ScenarioPackageDetail>> => {
    const { data } = await apiClient.put(`/scenario-packages/${id}`, request);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/scenario-packages/${id}`);
  },

  publish: async (id: string): Promise<ApiResponse<ScenarioPackageDetail>> => {
    const { data } = await apiClient.post(`/scenario-packages/${id}/publish`);
    return data;
  },

  calculateReferencePrice: async (id: string): Promise<ApiResponse<ReferencePriceData>> => {
    const { data} = await apiClient.get(`/scenario-packages/${id}/pricing/reference`);
    return data;
  },
};

// hooks/usePackageList.ts
import { useQuery } from '@tanstack/react-query';

export const usePackageList = (params: ListParams) => {
  return useQuery({
    queryKey: ['scenario-packages', params],
    queryFn: () => packageService.list(params),
    staleTime: 1000 * 60 * 5, // 5 分钟缓存
  });
};

// hooks/usePackageMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: packageService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenario-packages'] });
    },
  });
};
```

#### 4.2.2 图片上传流程

```typescript
// components/atoms/ImageUpload.tsx
import { useState } from 'react';
import { Upload, message } from 'antd';

export const ImageUpload = ({ packageId, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: File) => {
    setLoading(true);

    try {
      // 步骤 1：获取预签名 URL
      const { data } = await apiClient.post(`/scenario-packages/${packageId}/image`, {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      const { uploadUrl, publicUrl } = data;

      // 步骤 2：直接上传到 Supabase Storage
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      // 步骤 3：确认上传成功，更新数据库
      await apiClient.patch(`/scenario-packages/${packageId}/image`, { publicUrl });

      message.success('图片上传成功');
      onSuccess?.(publicUrl);
    } catch (error) {
      message.error('图片上传失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Upload
      beforeUpload={(file) => {
        // 前端验证
        if (file.size > 5 * 1024 * 1024) {
          message.error('文件大小不能超过5MB');
          return false;
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          message.error('仅支持JPG/PNG/WebP格式');
          return false;
        }

        handleUpload(file);
        return false; // 阻止默认上传行为
      }}
      showUploadList={false}
      accept=".jpg,.jpeg,.png,.webp"
    >
      <Button loading={loading}>上传背景图片</Button>
    </Upload>
  );
};
```

#### 4.2.3 实时定价计算

```typescript
// components/molecules/PricingCalculator.tsx
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export const PricingCalculator = ({ packageId }: Props) => {
  const { data, refetch } = useQuery({
    queryKey: ['pricing', packageId],
    queryFn: () => packageService.calculateReferencePrice(packageId),
    enabled: !!packageId,
  });

  // 当 items/services 变更时重新计算
  useEffect(() => {
    if (packageId) {
      refetch();
    }
  }, [packageId, refetch]);

  const pricing = data?.data;

  return (
    <div>
      <div>参考总价：¥{pricing?.referencePrice.toFixed(2)}</div>
      <div>  - 单品总价：¥{pricing?.itemsTotal.toFixed(2)}</div>
      <div>  - 服务总价：¥{pricing?.servicesTotal.toFixed(2)}</div>

      <Input
        type="number"
        placeholder="输入打包价格"
        onChange={(e) => {
          // 实时计算优惠比例
          const packagePrice = parseFloat(e.target.value);
          if (pricing && packagePrice > 0) {
            const discount = (packagePrice / pricing.referencePrice) * 100;
            console.log('优惠比例:', discount.toFixed(2) + '%');
          }
        }}
      />

      {pricing?.discountPercentage && (
        <div style={{ color: 'green' }}>
          优惠比例：{pricing.discountPercentage.toFixed(2)}%
          （优惠 ¥{pricing.discountAmount.toFixed(2)}）
        </div>
      )}
    </div>
  );
};
```

#### 4.2.4 US2 内容配置组件

```typescript
// components/molecules/RuleConfigurator.tsx
import { Form, InputNumber, Card, Row, Col } from 'antd';

export interface RuleConfiguratorProps {
  value?: Partial<PackageRule>;
  onChange?: (value: Partial<PackageRule>) => void;
  disabled?: boolean;
}

export const RuleConfigurator: React.FC<RuleConfiguratorProps> = ({
  value = {},
  onChange,
  disabled = false,
}) => {
  return (
    <Card title="包场规则配置" size="small">
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="包场时长">
            <InputNumber
              min={1}
              max={24}
              value={value.durationHours}
              onChange={(v) => onChange?.({ ...value, durationHours: v ?? undefined })}
              addonAfter="小时"
              disabled={disabled}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="最少人数">
            <InputNumber
              min={1}
              value={value.minPeople}
              onChange={(v) => onChange?.({ ...value, minPeople: v ?? undefined })}
              addonAfter="人"
              disabled={disabled}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="最多人数">
            <InputNumber
              min={value.minPeople || 1}
              value={value.maxPeople}
              onChange={(v) => onChange?.({ ...value, maxPeople: v ?? undefined })}
              addonAfter="人"
              disabled={disabled}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};
```

```typescript
// components/molecules/ItemSelector.tsx
import { Table, Button, InputNumber, Modal } from 'antd';

export interface ItemSelectorProps {
  value?: PackageItem[];
  onChange?: (items: PackageItem[]) => void;
  disabled?: boolean;
}

export const ItemSelector: React.FC<ItemSelectorProps> = ({
  value = [],
  onChange,
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // 计算小计和合计
  const calculateSubtotal = (item: PackageItem) => 
    (item.itemPriceSnapshot || 0) * item.quantity;
  
  const total = value.reduce((sum, item) => sum + calculateSubtotal(item), 0);

  const columns = [
    { title: '单品名称', dataIndex: 'itemNameSnapshot' },
    { title: '单价', dataIndex: 'itemPriceSnapshot', render: (v) => `¥${v?.toFixed(2)}` },
    {
      title: '数量',
      dataIndex: 'quantity',
      render: (_, record, index) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(v) => {
            const newItems = [...value];
            newItems[index] = { ...record, quantity: v || 1 };
            onChange?.(newItems);
          }}
          disabled={disabled}
        />
      ),
    },
    { title: '小计', render: (_, record) => `¥${calculateSubtotal(record).toFixed(2)}` },
    {
      title: '操作',
      render: (_, record, index) => (
        <Button danger onClick={() => {
          const newItems = value.filter((_, i) => i !== index);
          onChange?.(newItems);
        }} disabled={disabled}>
          删除
        </Button>
      ),
    },
  ];

  return (
    <Card title="单品列表" extra={<span>合计: ¥{total.toFixed(2)}</span>}>
      <Table dataSource={value} columns={columns} pagination={false} />
      <Button onClick={() => setModalVisible(true)} disabled={disabled}>
        添加单品
      </Button>
      {/* 单品选择 Modal */}
    </Card>
  );
};
```

```typescript
// components/organisms/ContentConfigurator.tsx
import { RuleConfigurator, BenefitSelector, ItemSelector, ServiceSelector } from '../molecules';

export interface ContentConfiguratorProps {
  rule?: Partial<PackageRule>;
  content?: Partial<PackageContent>;
  packagePrice?: number;
  onRuleChange?: (rule: Partial<PackageRule>) => void;
  onBenefitsChange?: (benefits: PackageBenefit[]) => void;
  onItemsChange?: (items: PackageItem[]) => void;
  onServicesChange?: (services: PackageService[]) => void;
  disabled?: boolean;
}

export const ContentConfigurator: React.FC<ContentConfiguratorProps> = ({
  rule,
  content,
  onRuleChange,
  onBenefitsChange,
  onItemsChange,
  onServicesChange,
  disabled = false,
}) => {
  // 计算参考总价
  const itemsTotal = content?.items?.reduce(
    (sum, item) => sum + (item.itemPriceSnapshot || 0) * item.quantity, 0
  ) || 0;
  const servicesTotal = content?.services?.reduce(
    (sum, svc) => sum + (svc.servicePriceSnapshot || 0), 0
  ) || 0;
  const referencePrice = itemsTotal + servicesTotal;

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {/* 规则配置 */}
      <RuleConfigurator value={rule} onChange={onRuleChange} disabled={disabled} />
      
      {/* 硬权益 */}
      <BenefitSelector
        value={content?.benefits}
        onChange={onBenefitsChange}
        disabled={disabled}
      />
      
      {/* 单品 */}
      <ItemSelector
        value={content?.items}
        onChange={onItemsChange}
        disabled={disabled}
      />
      
      {/* 服务 */}
      <ServiceSelector
        value={content?.services}
        onChange={onServicesChange}
        disabled={disabled}
      />
      
      {/* 价格汇总 */}
      <Card size="small">
        <Row gutter={16}>
          <Col span={8}>单品总价: ¥{itemsTotal.toFixed(2)}</Col>
          <Col span={8}>服务总价: ¥{servicesTotal.toFixed(2)}</Col>
          <Col span={8}><strong>参考总价: ¥{referencePrice.toFixed(2)}</strong></Col>
        </Row>
      </Card>
    </Space>
  );
};
```

#### 4.2.5 乐观锁冲突处理

```typescript
// hooks/usePackageMutation.ts
export const useUpdatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdatePackageRequest }) =>
      packageService.update(id, request),

    onError: (error: any) => {
      if (error.response?.status === 409) {
        // 并发冲突
        message.error('该场景包已被他人修改，请刷新后重试');
        queryClient.invalidateQueries({ queryKey: ['scenario-packages'] });
      } else {
        message.error('更新失败：' + error.message);
      }
    },

    onSuccess: () => {
      message.success('更新成功');
      queryClient.invalidateQueries({ queryKey: ['scenario-packages'] });
    },
  });
};

// 在表单提交时包含 versionLock
const handleSubmit = (values: FormValues) => {
  const request: UpdatePackageRequest = {
    ...values,
    versionLock: currentPackage.versionLock, // 必须传递当前版本号
  };

  updateMutation.mutate({ id: packageId, request });
};
```

### 4.3 TypeScript 类型定义

```typescript
// types/index.ts
export interface ScenarioPackageDetail {
  id: string;
  basePackageId: string | null;
  version: number;
  versionLock: number; // 乐观锁版本号
  name: string;
  description?: string;
  backgroundImageUrl?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED';
  isLatest: boolean;
  rule: PackageRule;
  hallTypes: HallType[];
  content: {
    benefits: PackageBenefit[];
    items: PackageItem[];
    services: PackageService[];
  };
  pricing?: PackagePricing;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface PackageRule {
  durationHours: number;
  minPeople?: number;
  maxPeople?: number;
}

export interface PackageItem {
  id: string;
  itemId: string;
  quantity: number;
  itemNameSnapshot: string;
  itemPriceSnapshot: number;
  sortOrder: number;
}

export interface PackagePricing {
  packagePrice: number;
  referencePriceSnapshot?: number;
  discountPercentage?: number;
  discountAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackageRequest {
  name: string;
  description?: string;
  backgroundImageUrl?: string;
  rule: {
    durationHours: number;
    minPeople?: number;
    maxPeople?: number;
  };
  hallTypeIds: string[];
  content: {
    benefits?: Array<{ benefitType: string; discountRate?: number; freeCount?: number }>;
    items?: Array<{ itemId: string; quantity: number }>;
    services?: Array<{ serviceId: string }>;
  };
  pricing?: {
    packagePrice: number;
  };
}

export interface UpdatePackageRequest extends Partial<CreatePackageRequest> {
  versionLock: number; // 必需，用于乐观锁
}
```

---

## 5. 测试策略

### 5.1 后端测试

#### 5.1.1 单元测试（JUnit 5 + Mockito）

```java
@ExtendWith(MockitoExtension.class)
class ScenarioPackageServiceTest {

    @Mock
    private ScenarioPackageRepository repository;

    @InjectMocks
    private ScenarioPackageService service;

    @Test
    void shouldCreatePackageSuccessfully() {
        // Given
        CreatePackageRequest request = new CreatePackageRequest(/* ... */);
        ScenarioPackage mockEntity = new ScenarioPackage(/* ... */);
        when(repository.save(any())).thenReturn(mockEntity);

        // When
        ScenarioPackageDTO result = service.create(request);

        // Then
        assertNotNull(result.getId());
        assertEquals("VIP 生日派对专场", result.getName());
        verify(repository, times(1)).save(any());
    }

    @Test
    void shouldThrowExceptionWhenVersionConflict() {
        // Given
        UUID id = UUID.randomUUID();
        UpdatePackageRequest request = new UpdatePackageRequest(/* versionLock: 1 */);
        ScenarioPackage pkg = new ScenarioPackage(/* versionLock: 2 */);
        when(repository.findById(id)).thenReturn(Optional.of(pkg));

        // When & Then
        assertThrows(ConcurrentModificationException.class, () -> {
            service.update(id, request);
        });
    }
}
```

#### 5.1.2 集成测试（Spring Boot Test）

```java
@SpringBootTest
@AutoConfigureMockMvc
class ScenarioPackageControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldListPackagesWithPagination() throws Exception {
        mockMvc.perform(get("/api/scenario-packages")
                .param("page", "0")
                .param("size", "20"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data").isArray())
            .andExpect(jsonPath("$.total").isNumber());
    }

    @Test
    void shouldReturn404WhenPackageNotFound() throws Exception {
        UUID fakeId = UUID.randomUUID();
        mockMvc.perform(get("/api/scenario-packages/" + fakeId))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }
}
```

### 5.2 前端测试

#### 5.2.1 组件测试（Vitest + Testing Library）

```typescript
// __tests__/PackageList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PackageList } from '../components/organisms/PackageList';

const queryClient = new QueryClient();

test('renders package list', async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <PackageList />
    </QueryClientProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('VIP 生日派对专场')).toBeInTheDocument();
  });
});

test('displays error message on API failure', async () => {
  // Mock API failure
  server.use(
    http.get('/api/scenario-packages', () => {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    })
  );

  render(<PackageList />);

  await waitFor(() => {
    expect(screen.getByText(/加载失败/)).toBeInTheDocument();
  });
});
```

#### 5.2.2 E2E 测试（Playwright）

```typescript
// tests/e2e/scenario-package.spec.ts
import { test, expect } from '@playwright/test';

test('create scenario package flow', async ({ page }) => {
  // 登录
  await page.goto('/login');
  await page.fill('[name="username"]', 'operator');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // 进入场景包管理
  await page.goto('/scenario-packages');
  await page.click('text=新建场景包');

  // 填写基本信息
  await page.fill('[name="name"]', 'VIP 生日派对专场');
  await page.fill('[name="description"]', '适合10-20人的生日派对');

  // 上传背景图片
  await page.setInputFiles('input[type="file"]', 'tests/fixtures/party.jpg');
  await expect(page.locator('img[alt="Preview"]')).toBeVisible();

  // 设置规则
  await page.fill('[name="durationHours"]', '3');
  await page.fill('[name="minPeople"]', '10');
  await page.fill('[name="maxPeople"]', '20');

  // 选择影厅
  await page.click('text=1号厅 VIP');

  // 添加单品
  await page.click('text=添加单品');
  await page.selectOption('[name="itemId"]', '莫吉托');
  await page.fill('[name="quantity"]', '20');

  // 设置定价
  await page.fill('[name="packagePrice"]', '1888');

  // 保存
  await page.click('button:has-text("保存草稿")');

  // 验证成功提示
  await expect(page.locator('text=保存成功')).toBeVisible();

  // 验证列表页显示新建场景包
  await page.goto('/scenario-packages');
  await expect(page.locator('text=VIP 生日派对专场')).toBeVisible();
});
```

---

## 6. 常见问题排查

### 6.1 图片上传失败

**症状**: 图片上传时返回 403 Forbidden

**排查步骤**:
1. 检查 Supabase Storage Bucket 是否设置为 Public
2. 检查 `SUPABASE_ANON_KEY` 是否正确配置
3. 检查预签名 URL 是否过期（有效期 10 分钟）
4. 检查 CORS 配置（前端域名是否在 Supabase 白名单）

**解决方案**:
```bash
# Supabase Dashboard → Storage → scenario-packages → Settings
# Public bucket: ✅
# Allowed CORS origins: http://localhost:5173, https://your-domain.com
```

### 6.2 乐观锁冲突频繁

**症状**: 用户频繁收到"已被他人修改"提示

**排查步骤**:
1. 检查前端是否在每次请求时重新获取最新 `versionLock`
2. 检查是否有多个浏览器标签页同时打开同一个场景包

**解决方案**:
```typescript
// 在提交前重新获取最新数据
const handleSubmit = async (values: FormValues) => {
  // 重新获取最新版本号
  const latestPackage = await packageService.getById(packageId);

  const request: UpdatePackageRequest = {
    ...values,
    versionLock: latestPackage.data.versionLock, // 使用最新版本号
  };

  updateMutation.mutate({ id: packageId, request });
};
```

### 6.3 定价计算不准确

**症状**: 参考总价与预期不符

**排查步骤**:
1. 检查 `package_items` 和 `package_services` 表的 `snapshot` 字段是否正确
2. 检查是否包含了硬权益（硬权益不应计入参考总价）
3. 检查 `item_price_snapshot` 是否为最新价格（如需实时价格，JOIN `items` 表）

**解决方案**:
```java
// 如果需要实时价格而非快照价格，修改查询逻辑
BigDecimal itemsTotal = items.stream()
    .map(pi -> {
        // 使用实时价格（JOIN items 表）
        Item item = itemRepository.findById(pi.getItemId()).orElseThrow();
        return item.getPrice().multiply(new BigDecimal(pi.getQuantity()));
    })
    .reduce(BigDecimal.ZERO, BigDecimal::add);
```

### 6.4 版本创建失败

**症状**: 修改已发布场景包时报错"版本创建失败"

**排查步骤**:
1. 检查 `base_package_id` 字段是否正确设置
2. 检查是否所有关联表（items, services, rules）都正确复制
3. 检查数据库外键约束是否阻止了复制操作

**解决方案**:
```java
// 确保事务完整性
@Transactional
public ScenarioPackageDTO createVersion(UUID oldPackageId) {
    // 1. 创建新版本主记录
    ScenarioPackage newPkg = copyPackage(oldPackageId);
    newPkg = repository.save(newPkg);

    // 2. 复制所有关联数据（在同一事务内）
    copyRules(oldPackageId, newPkg.getId());
    copyHallAssociations(oldPackageId, newPkg.getId());
    copyItems(oldPackageId, newPkg.getId());
    copyServices(oldPackageId, newPkg.getId());
    copyBenefits(oldPackageId, newPkg.getId());
    copyPricing(oldPackageId, newPkg.getId());

    // 3. 更新旧版本标记
    updateOldVersionFlag(oldPackageId);

    return toDTO(newPkg);
}
```

---

## 7. 下一步

1. ✅ 开发环境配置完成
2. ✅ 数据库初始化完成
3. ✅ 后端 API 实现完成
   - US1: 创建/编辑场景包基本信息
   - US2: 配置场景包规则和内容组合
   - 图片上传（Supabase Storage 预签名 URL）
4. ✅ 前端组件实现完成
   - Atoms: ImageUpload, StatusBadge
   - Molecules: RuleConfigurator, BenefitSelector, ItemSelector, ServiceSelector
   - Organisms: PackageList, PackageEditor, ContentConfigurator
5. ✅ 页面集成完成
   - 列表页 (list.tsx)
   - 创建页 (create.tsx) - 包含图片上传
   - 编辑页 (edit.tsx) - 包含图片上传和内容配置
6. 🔄 TDD 测试用例已编写，待验证
7. ⏳ 执行 E2E 测试
8. ⏳ 性能测试和优化
9. ⏳ 提交代码审查

**参考文档**:
- [spec.md](./spec.md) - 功能规格说明
- [data-model.md](./data-model.md) - 数据模型设计
- [contracts/api.yaml](./contracts/api.yaml) - API 契约
- [research.md](./research.md) - 技术决策依据

**联系方式**:
如有问题，请在项目 Issue 跟踪器中提出，或联系技术负责人。
