# Research Report: 饮品订单创建与出品管理

**Feature**: O003-beverage-order | **Date**: 2025-12-28 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

本研究文档针对饮品订单创建与出品管理功能的关键技术决策进行深入调研,覆盖6个核心研究任务,确保技术方案的可行性、可维护性和符合项目宪章规范。

## Research Task 1: Taro框架小程序底部导航栏(tabBar)配置最佳实践

### Decision

采用 Taro `app.config.ts` 集中式配置 tabBar,使用静态配置方式定义底部导航栏,添加"点餐菜单"tab作为饮品订单功能的入口。

### Rationale

1. **框架原生支持**: Taro框架提供完整的tabBar配置API,与微信小程序、H5等多端平台完全兼容
2. **配置集中管理**: 在 `app.config.ts` 中统一配置,避免分散在多个文件中
3. **多端一致性**: 编译后自动适配不同平台的tabBar实现(微信小程序的app.json、H5的底部导航)
4. **图标资源规范**: 支持本地图标和iconPath配置,符合小程序规范(81px*81px)

### Alternatives Considered

1. **自定义底部导航组件**
   - 优点: UI完全可控,可实现复杂交互
   - 缺点: 无法享受小程序原生tabBar的性能优化和平台特性(如角标、震动反馈)
   - 放弃原因: 增加开发成本,且与小程序规范不一致

2. **运行时动态配置tabBar**
   - 优点: 可根据用户权限动态显示tab项
   - 缺点: Taro对运行时修改tabBar支持有限,微信小程序不支持
   - 放弃原因: 当前需求无动态调整需求,静态配置足够

### Implementation Example

**配置文件: `hall-reserve-taro/src/app.config.ts`**

```typescript
/**
 * @spec O003-beverage-order
 * Taro应用配置 - 添加饮品订单tab
 */
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/reservation/index',
    'pages/beverage/menu/index', // 新增:饮品菜单页
    'pages/beverage/cart/index',
    'pages/beverage/orders/index',
    'pages/user/index'
  ],

  tabBar: {
    color: '#999999',
    selectedColor: '#1890ff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/reservation/index',
        text: '预约',
        iconPath: 'assets/icons/reservation.png',
        selectedIconPath: 'assets/icons/reservation-active.png'
      },
      {
        pagePath: 'pages/beverage/menu/index', // 新增:点餐菜单tab
        text: '点餐菜单',
        iconPath: 'assets/icons/beverage.png',
        selectedIconPath: 'assets/icons/beverage-active.png'
      },
      {
        pagePath: 'pages/user/index',
        text: '我的',
        iconPath: 'assets/icons/user.png',
        selectedIconPath: 'assets/icons/user-active.png'
      }
    ]
  },

  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '影院商品中台',
    navigationBarTextStyle: 'black'
  }
})
```

**图标资源准备**:
- 存放路径: `hall-reserve-taro/src/assets/icons/`
- 图标规格: 81px * 81px(微信小程序要求)
- 图标格式: PNG,支持透明背景
- 命名规范: `beverage.png`(默认态)、`beverage-active.png`(选中态)

**页面配置: `hall-reserve-taro/src/pages/beverage/menu/index.config.ts`**

```typescript
/**
 * @spec O003-beverage-order
 * 饮品菜单页配置
 */
export default definePageConfig({
  navigationBarTitleText: '点餐菜单',
  enablePullDownRefresh: true,
  backgroundTextStyle: 'dark'
})
```

### Best Practices

1. **Tab数量限制**: tabBar最多支持5个tab(微信小程序规范),当前配置4个符合限制
2. **首页tab必须**: tabBar的第一个tab必须是首页(pages数组第一项)
3. **iconPath路径**: 使用相对于项目根目录的路径,不要使用绝对路径
4. **多端适配**: H5端会自动转换为底部导航,无需额外配置
5. **性能优化**: tabBar页面会被预加载,避免在页面中执行重量级初始化逻辑

---

## Research Task 2: Supabase Storage图片上传与访问最佳实践

### Decision

采用Supabase Storage作为饮品图片存储方案,使用分桶策略(`beverages`桶)管理图片,B端通过Spring Boot封装上传API,C端通过CDN加速访问公开URL。

### Rationale

1. **官方支持**: Supabase提供完整的Storage API和Java SDK,与PostgreSQL数据库无缝集成
2. **访问控制**: 支持公开桶(public bucket)和私有桶,可通过RLS(Row Level Security)实现细粒度权限控制
3. **CDN加速**: Supabase自动配置CDN,图片访问速度快,降低服务器负载
4. **成本优势**: 按实际存储和带宽计费,初期成本低
5. **URL稳定性**: 生成的公开URL长期有效,无需重新签名

### Alternatives Considered

1. **阿里云OSS**
   - 优点: 国内访问速度快,生态成熟
   - 缺点: 需要额外集成SDK,增加依赖复杂度,与Supabase数据库分离
   - 放弃原因: 违反宪章"Supabase为单一数据源"原则

2. **本地文件系统存储**
   - 优点: 实现简单,无第三方依赖
   - 缺点: 无法横向扩展,备份和CDN加速困难
   - 放弃原因: 不符合云原生架构,可维护性差

3. **Base64内联存储**
   - 优点: 图片数据直接存在数据库中,无外部依赖
   - 缺点: 数据库体积膨胀,查询性能下降,无CDN加速
   - 放弃原因: 严重影响性能和成本

### Implementation Example

**后端Spring Boot图片上传服务**

```java
/**
 * @spec O003-beverage-order
 * 饮品图片上传服务
 */
@Service
public class BeverageImageService {

    private static final String BUCKET_NAME = "beverages";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_TYPES = Arrays.asList("image/jpeg", "image/png", "image/webp");

    private final SupabaseClient supabaseClient;

    public BeverageImageService(SupabaseClient supabaseClient) {
        this.supabaseClient = supabaseClient;
    }

    /**
     * 上传饮品图片到Supabase Storage
     *
     * @param file 图片文件
     * @param beverageId 饮品ID
     * @param imageType 图片类型(main/detail)
     * @return 图片公开访问URL
     */
    public String uploadBeverageImage(MultipartFile file, Long beverageId, String imageType) {
        // 1. 校验文件大小和类型
        validateFile(file);

        // 2. 生成唯一文件名(避免重复)
        String fileName = generateFileName(beverageId, imageType, file.getOriginalFilename());

        // 3. 上传到Supabase Storage
        try {
            byte[] fileBytes = file.getBytes();
            String filePath = String.format("%s/%s", beverageId, fileName);

            supabaseClient.storage()
                .from(BUCKET_NAME)
                .upload(filePath, fileBytes, new FileOptions(file.getContentType()));

            // 4. 获取公开URL
            String publicUrl = supabaseClient.storage()
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            log.info("图片上传成功: beverageId={}, url={}", beverageId, publicUrl);
            return publicUrl;

        } catch (IOException e) {
            throw new ImageUploadException("图片上传失败", e);
        }
    }

    /**
     * 删除饮品图片
     *
     * @param imageUrl 图片URL
     */
    public void deleteBeverageImage(String imageUrl) {
        // 从URL提取文件路径
        String filePath = extractFilePathFromUrl(imageUrl);

        supabaseClient.storage()
            .from(BUCKET_NAME)
            .remove(List.of(filePath));

        log.info("图片删除成功: path={}", filePath);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new InvalidFileException("文件不能为空");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidFileException("文件大小不能超过5MB");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new InvalidFileException("只支持JPG、PNG、WebP格式图片");
        }
    }

    private String generateFileName(Long beverageId, String imageType, String originalFilename) {
        String extension = FilenameUtils.getExtension(originalFilename);
        String timestamp = String.valueOf(System.currentTimeMillis());
        return String.format("%s_%s_%s.%s", beverageId, imageType, timestamp, extension);
    }

    private String extractFilePathFromUrl(String imageUrl) {
        // 示例URL: https://xxx.supabase.co/storage/v1/object/public/beverages/123/main_1640000000000.jpg
        // 提取: 123/main_1640000000000.jpg
        String[] parts = imageUrl.split(BUCKET_NAME + "/");
        return parts.length > 1 ? parts[1] : "";
    }
}
```

**B端React图片上传组件**

```typescript
/**
 * @spec O003-beverage-order
 * 饮品图片上传组件(Ant Design Upload)
 */
import React from 'react';
import { Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';

interface BeverageImageUploadProps {
  beverageId: number;
  imageType: 'main' | 'detail';
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxCount?: number;
}

export const BeverageImageUpload: React.FC<BeverageImageUploadProps> = ({
  beverageId,
  imageType,
  value = [],
  onChange,
  maxCount = 1
}) => {
  const [fileList, setFileList] = React.useState<UploadFile[]>(
    value.map((url, index) => ({
      uid: `-${index}`,
      name: `image-${index}.jpg`,
      status: 'done',
      url
    }))
  );

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    // 提取所有上传成功的图片URL
    const urls = newFileList
      .filter(file => file.status === 'done' && file.response?.url)
      .map(file => file.response.url);

    onChange?.(urls);
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过5MB!');
      return false;
    }

    return true;
  };

  return (
    <Upload
      listType="picture-card"
      fileList={fileList}
      onChange={handleChange}
      beforeUpload={beforeUpload}
      action={`/api/admin/beverages/${beverageId}/images`}
      data={{ imageType }}
      headers={{
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }}
      maxCount={maxCount}
    >
      {fileList.length < maxCount && (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>上传图片</div>
        </div>
      )}
    </Upload>
  );
};
```

**C端Taro图片显示优化**

```typescript
/**
 * @spec O003-beverage-order
 * 饮品卡片组件 - 图片懒加载和占位符
 */
import Taro from '@tarojs/taro';
import { Image, View } from '@tarojs/components';
import React from 'react';

interface BeverageCardProps {
  imageUrl: string;
  name: string;
}

export const BeverageCard: React.FC<BeverageCardProps> = ({ imageUrl, name }) => {
  return (
    <View className="beverage-card">
      <Image
        src={imageUrl}
        mode="aspectFill"
        lazyLoad // 启用懒加载
        className="beverage-image"
        onError={() => {
          // 图片加载失败时显示占位图
          Taro.showToast({ title: '图片加载失败', icon: 'none' });
        }}
      />
      <View className="beverage-name">{name}</View>
    </View>
  );
};
```

**Supabase Storage桶配置**

```sql
-- 创建公开桶(允许匿名读取)
INSERT INTO storage.buckets (id, name, public)
VALUES ('beverages', 'beverages', true);

-- 设置上传权限(仅认证用户可上传)
CREATE POLICY "认证用户可上传饮品图片"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'beverages');

-- 设置公开读取权限
CREATE POLICY "所有用户可查看饮品图片"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'beverages');

-- 设置删除权限(仅图片所有者可删除)
CREATE POLICY "认证用户可删除自己上传的图片"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'beverages' AND auth.uid() = owner);
```

### Best Practices

1. **图片压缩**: 上传前在客户端压缩图片(推荐使用Sharp库),减少存储和带宽成本
2. **命名规范**: 使用 `beverageId/imageType_timestamp.ext` 格式,避免文件名冲突
3. **CDN缓存**: 设置合理的Cache-Control头,提高访问速度
4. **删除策略**: 删除饮品时级联删除关联图片,避免存储空间浪费
5. **错误处理**: 图片加载失败时显示占位图,提升用户体验
6. **安全性**: 验证文件类型和大小,防止恶意文件上传

---

## Research Task 3: BOM自动扣料与库存集成方案

### Decision

通过Spring Boot服务层集成P003/P004库存管理模块的REST API,实现饮品配方驱动的BOM自动扣料。扣料时机为订单状态从"待制作"切换到"制作中"时,使用事务机制保证库存扣减和订单状态更新的原子性。

### Rationale

1. **模块解耦**: 库存管理作为独立模块,通过API调用实现功能复用
2. **数据一致性**: 使用数据库事务确保库存扣减和订单状态更新的原子性
3. **业务规则集中**: 库存校验、扣减逻辑由P003/P004模块统一处理,避免重复实现
4. **可追溯性**: 所有扣料操作记录在库存调整日志中,便于审计和问题排查
5. **失败回滚**: 扣料失败时自动回滚订单状态,保证数据完整性

### Alternatives Considered

1. **直接操作库存表**
   - 优点: 性能更好,无网络开销
   - 缺点: 违反模块边界,导致库存逻辑分散,难以维护
   - 放弃原因: 违反模块化架构原则

2. **消息队列异步扣料**
   - 优点: 解耦订单服务和库存服务,提高响应速度
   - 缺点: 增加系统复杂度,扣料失败处理困难
   - 放弃原因: MVP阶段无需异步处理,同步调用足够

3. **前端调用库存API**
   - 优点: 后端无需额外开发
   - 缺点: 无法保证事务一致性,安全性差
   - 放弃原因: 业务逻辑不应在前端实现

### Implementation Example

**BOM服务层:自动扣料逻辑**

```java
/**
 * @spec O003-beverage-order
 * BOM自动扣料服务
 */
@Service
public class BOMService {

    private final BeverageRecipeRepository recipeRepository;
    private final InventoryClient inventoryClient; // Feign客户端调用P003/P004 API
    private final BeverageOrderRepository orderRepository;

    private static final Logger log = LoggerFactory.getLogger(BOMService.class);

    /**
     * 执行BOM自动扣料
     *
     * @param orderId 订单ID
     * @throws InsufficientStockException 库存不足时抛出
     */
    @Transactional(rollbackFor = Exception.class)
    public void executeAutoDeduction(Long orderId) {
        // 1. 查询订单及订单项
        BeverageOrder order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException("订单不存在: " + orderId));

        List<BeverageOrderItem> items = order.getItems();

        // 2. 查询每个订单项的配方(BOM)
        List<InventoryDeductionRequest> deductionRequests = new ArrayList<>();

        for (BeverageOrderItem item : items) {
            Long beverageId = item.getBeverageId();
            String specCombination = item.getSpecSnapshot(); // JSON格式规格快照

            // 查询匹配的配方
            BeverageRecipe recipe = recipeRepository
                .findByBeverageIdAndSpecCombination(beverageId, specCombination)
                .orElseThrow(() -> new RecipeNotFoundException(
                    "未找到配方: beverageId=" + beverageId + ", specs=" + specCombination));

            // 解析配方中的原料列表
            List<RecipeIngredient> ingredients = parseIngredients(recipe.getIngredients());

            // 计算扣料数量(配方用量 × 订单数量)
            for (RecipeIngredient ingredient : ingredients) {
                InventoryDeductionRequest request = InventoryDeductionRequest.builder()
                    .skuId(ingredient.getSkuId())
                    .storeId(order.getStoreId())
                    .quantity(ingredient.getQuantity() * item.getQuantity())
                    .unit(ingredient.getUnit())
                    .reason("饮品订单自动扣料")
                    .referenceType("BEVERAGE_ORDER")
                    .referenceId(orderId.toString())
                    .build();

                deductionRequests.add(request);
            }
        }

        // 3. 调用库存管理API批量扣料
        try {
            BatchDeductionResponse response = inventoryClient.batchDeduct(deductionRequests);

            if (!response.isSuccess()) {
                // 扣料失败,记录失败原因
                log.error("BOM扣料失败: orderId={}, error={}", orderId, response.getErrorMessage());
                throw new BOMDeductionException(response.getErrorMessage());
            }

            // 4. 记录扣料成功日志
            log.info("BOM扣料成功: orderId={}, 扣减SKU数量={}", orderId, deductionRequests.size());

        } catch (FeignException e) {
            // 网络异常或库存服务异常
            log.error("调用库存API失败: orderId={}", orderId, e);
            throw new BOMDeductionException("库存服务暂时不可用,请稍后重试");
        }
    }

    /**
     * 校验库存是否充足(开始制作前调用)
     *
     * @param orderId 订单ID
     * @return 是否充足
     */
    public boolean checkInventorySufficiency(Long orderId) {
        // 类似executeAutoDeduction逻辑,但只查询不扣减
        BeverageOrder order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException("订单不存在: " + orderId));

        for (BeverageOrderItem item : order.getItems()) {
            BeverageRecipe recipe = recipeRepository
                .findByBeverageIdAndSpecCombination(item.getBeverageId(), item.getSpecSnapshot())
                .orElseThrow(() -> new RecipeNotFoundException("未找到配方"));

            List<RecipeIngredient> ingredients = parseIngredients(recipe.getIngredients());

            for (RecipeIngredient ingredient : ingredients) {
                // 调用库存查询API
                InventoryDTO inventory = inventoryClient.getInventory(
                    ingredient.getSkuId(),
                    order.getStoreId()
                );

                double requiredQuantity = ingredient.getQuantity() * item.getQuantity();
                if (inventory.getQuantity() < requiredQuantity) {
                    log.warn("库存不足: skuId={}, 需要={}, 可用={}",
                        ingredient.getSkuId(), requiredQuantity, inventory.getQuantity());
                    return false;
                }
            }
        }

        return true;
    }

    private List<RecipeIngredient> parseIngredients(String ingredientsJson) {
        // JSON格式: [{"skuId": 123, "quantity": 20, "unit": "g"}, ...]
        try {
            return objectMapper.readValue(ingredientsJson,
                new TypeReference<List<RecipeIngredient>>() {});
        } catch (JsonProcessingException e) {
            throw new InvalidRecipeException("配方格式错误", e);
        }
    }
}
```

**库存管理API客户端(Feign)**

```java
/**
 * @spec O003-beverage-order
 * 库存管理API客户端(Feign声明式HTTP客户端)
 */
@FeignClient(name = "inventory-service", url = "${inventory.api.baseUrl}")
public interface InventoryClient {

    /**
     * 查询库存
     */
    @GetMapping("/api/inventory/{skuId}/stores/{storeId}")
    InventoryDTO getInventory(
        @PathVariable("skuId") Long skuId,
        @PathVariable("storeId") Long storeId
    );

    /**
     * 批量扣减库存
     */
    @PostMapping("/api/inventory/batch-deduct")
    BatchDeductionResponse batchDeduct(@RequestBody List<InventoryDeductionRequest> requests);
}

@Data
@Builder
class InventoryDeductionRequest {
    private Long skuId;
    private Long storeId;
    private Double quantity;
    private String unit;
    private String reason;
    private String referenceType; // "BEVERAGE_ORDER"
    private String referenceId;   // 订单ID
}

@Data
class BatchDeductionResponse {
    private boolean success;
    private String errorMessage;
    private List<DeductionResult> results;
}

@Data
class DeductionResult {
    private Long skuId;
    private boolean success;
    private String message;
}
```

**订单状态切换时触发扣料**

```java
/**
 * @spec O003-beverage-order
 * 订单服务 - 状态切换逻辑
 */
@Service
public class OrderService {

    private final BeverageOrderRepository orderRepository;
    private final BOMService bomService;

    /**
     * 更新订单状态
     *
     * @param orderId 订单ID
     * @param newStatus 新状态
     */
    @Transactional(rollbackFor = Exception.class)
    public void updateOrderStatus(Long orderId, OrderStatus newStatus) {
        BeverageOrder order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException("订单不存在"));

        OrderStatus oldStatus = order.getStatus();

        // 状态流转校验
        validateStatusTransition(oldStatus, newStatus);

        // 特殊处理:待制作 → 制作中,触发BOM扣料
        if (oldStatus == OrderStatus.PENDING && newStatus == OrderStatus.IN_PROGRESS) {
            // 1. 先校验库存是否充足
            if (!bomService.checkInventorySufficiency(orderId)) {
                throw new InsufficientStockException("原料库存不足,无法开始制作");
            }

            // 2. 执行BOM自动扣料
            bomService.executeAutoDeduction(orderId);
        }

        // 3. 更新订单状态
        order.setStatus(newStatus);
        order.setUpdatedAt(Instant.now());
        orderRepository.save(order);

        log.info("订单状态更新成功: orderId={}, {} → {}", orderId, oldStatus, newStatus);
    }

    private void validateStatusTransition(OrderStatus from, OrderStatus to) {
        // 定义允许的状态流转规则
        Map<OrderStatus, List<OrderStatus>> allowedTransitions = Map.of(
            OrderStatus.PENDING, List.of(OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED),
            OrderStatus.IN_PROGRESS, List.of(OrderStatus.COMPLETED, OrderStatus.CANCELLED),
            OrderStatus.COMPLETED, List.of(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED, Collections.emptyList()
        );

        if (!allowedTransitions.getOrDefault(from, Collections.emptyList()).contains(to)) {
            throw new InvalidStatusTransitionException(
                String.format("不允许的状态流转: %s → %s", from, to));
        }
    }
}
```

### Best Practices

1. **事务边界**: 扣料和订单状态更新必须在同一个事务中,保证原子性
2. **幂等性**: 扣料操作应支持幂等(通过referenceId去重),避免重复扣减
3. **库存预校验**: 开始制作前先校验库存,避免扣料失败导致订单状态不一致
4. **错误处理**: 扣料失败时抛出业务异常,前端提示用户"原料不足"
5. **审计日志**: 所有扣料操作记录在库存调整日志中,便于问题排查
6. **性能优化**: 批量扣料减少API调用次数,提高性能

---

## Research Task 4: 订单状态实时同步方案(MVP轮询策略)

### Decision

MVP阶段采用前端轮询(Polling)策略实现订单状态实时同步,B端每5秒查询一次新订单,C端订单详情页每3秒查询一次订单状态。后续版本可升级为WebSocket或Server-Sent Events(SSE)实现真正的实时推送。

### Rationale

1. **实现简单**: 无需引入WebSocket服务器,使用现有REST API即可实现
2. **兼容性好**: 轮询策略在所有浏览器和小程序平台都支持,无兼容性问题
3. **成本低**: MVP阶段并发量不高,轮询频率适中不会造成服务器压力
4. **易于调试**: 轮询请求可通过浏览器开发者工具直接查看,便于排查问题
5. **渐进式升级**: 后续可无缝升级为WebSocket,前端代码改动小

### Alternatives Considered

1. **WebSocket实时推送**
   - 优点: 真正的实时双向通信,性能最优
   - 缺点: 需要部署WebSocket服务器,增加架构复杂度,小程序支持有限
   - 放弃原因: MVP阶段过度设计,成本收益不匹配

2. **Server-Sent Events(SSE)**
   - 优点: 单向推送,服务端主动发送,比轮询节省带宽
   - 缺点: 微信小程序不支持SSE,需要降级方案
   - 放弃原因: 多端兼容性问题

3. **长轮询(Long Polling)**
   - 优点: 减少无效请求,接近实时效果
   - 缺点: 服务端需要hold连接,并发性能差
   - 放弃原因: 复杂度高于短轮询,收益有限

### Implementation Example

**B端订单轮询Hook**

```typescript
/**
 * @spec O003-beverage-order
 * B端订单轮询Hook - 每5秒查询新订单
 */
import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { orderService } from '../services/orderService';

export const useOrderPolling = () => {
  const queryClient = useQueryClient();
  const lastOrderCountRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初始化提示音
  useEffect(() => {
    audioRef.current = new Audio('/sounds/new-order.mp3');
  }, []);

  // 轮询查询新订单
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['beverage-orders', 'pending'],
    queryFn: () => orderService.getOrders({ status: 'PENDING' }),
    refetchInterval: 5000, // 每5秒刷新
    refetchIntervalInBackground: true, // 后台也刷新
    onSuccess: (newOrders) => {
      // 检测到新订单时提示
      if (newOrders.length > lastOrderCountRef.current) {
        const newOrderCount = newOrders.length - lastOrderCountRef.current;

        // 播放提示音
        audioRef.current?.play();

        // 显示通知
        message.success(`收到${newOrderCount}个新订单!`, 3);

        // 浏览器通知(需要用户授权)
        if (Notification.permission === 'granted') {
          new Notification('新订单提醒', {
            body: `您有${newOrderCount}个新订单待处理`,
            icon: '/icons/order-icon.png',
            vibrate: [200, 100, 200] // 震动模式
          });
        }
      }

      lastOrderCountRef.current = newOrders.length;
    }
  });

  return { orders, isLoading };
};
```

**C端订单状态轮询**

```typescript
/**
 * @spec O003-beverage-order
 * C端订单详情页 - 轮询订单状态更新
 */
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import { beverageOrderService } from '@/services/beverageService';

export const OrderDetailPage = () => {
  const orderId = Taro.getCurrentInstance().router?.params.id;
  const [order, setOrder] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  // 轮询查询订单状态
  useEffect(() => {
    if (!orderId) return;

    // 立即查询一次
    fetchOrderDetail();

    // 每3秒轮询一次(仅在待制作/制作中状态)
    const interval = setInterval(() => {
      fetchOrderDetail();
    }, 3000);

    setPollingInterval(interval);

    // 清理定时器
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      const data = await beverageOrderService.getOrderDetail(orderId);
      setOrder(data);

      // 订单已完成或已交付时停止轮询
      if (data.status === 'COMPLETED' || data.status === 'DELIVERED') {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }

        // 显示取餐提醒
        if (data.status === 'COMPLETED') {
          Taro.showToast({
            title: '您的饮品已制作完成,请取餐!',
            icon: 'success',
            duration: 3000
          });

          // 震动提醒
          Taro.vibrateShort();
        }
      }
    } catch (error) {
      console.error('查询订单详情失败:', error);
    }
  };

  return (
    <View className="order-detail">
      <Text>订单号: {order?.orderNo}</Text>
      <Text>状态: {order?.statusText}</Text>
      {/* ... 其他订单信息 */}
    </View>
  );
};
```

**后端API优化:支持增量查询**

```java
/**
 * @spec O003-beverage-order
 * B端订单管理API - 支持增量查询
 */
@RestController
@RequestMapping("/api/admin/beverage-orders")
public class AdminOrderController {

    private final OrderService orderService;

    /**
     * 查询订单列表(支持增量查询)
     *
     * @param status 订单状态
     * @param since 查询此时间之后的订单(ISO-8601格式)
     */
    @GetMapping
    public ApiResponse<List<OrderDTO>> getOrders(
        @RequestParam(required = false) OrderStatus status,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant since
    ) {
        List<OrderDTO> orders;

        if (since != null) {
            // 增量查询:仅返回since时间之后的新订单
            orders = orderService.getOrdersSince(status, since);
        } else {
            // 全量查询
            orders = orderService.getOrders(status);
        }

        return ApiResponse.success(orders);
    }
}
```

**前端轮询优化:仅查询增量数据**

```typescript
/**
 * @spec O003-beverage-order
 * 优化版轮询 - 仅查询增量订单
 */
export const useIncrementalOrderPolling = () => {
  const [lastFetchTime, setLastFetchTime] = useState(new Date().toISOString());

  const { data: newOrders = [] } = useQuery({
    queryKey: ['beverage-orders', 'incremental', lastFetchTime],
    queryFn: () => orderService.getOrders({
      status: 'PENDING',
      since: lastFetchTime // 仅查询上次查询后的新订单
    }),
    refetchInterval: 5000,
    onSuccess: (orders) => {
      if (orders.length > 0) {
        // 更新最后查询时间
        setLastFetchTime(new Date().toISOString());

        // 通知用户
        message.success(`收到${orders.length}个新订单!`);
      }
    }
  });

  return { newOrders };
};
```

### Best Practices

1. **轮询频率控制**: 根据业务紧急程度调整频率(B端5秒、C端3秒),避免过度轮询
2. **增量查询优化**: 使用`since`参数仅查询增量数据,减少数据传输
3. **停止轮询条件**: 订单完成后停止轮询,节省资源
4. **后台轮询控制**: 页面不可见时降低轮询频率或停止轮询
5. **网络异常处理**: 轮询失败时使用指数退避策略,避免频繁重试
6. **用户提醒**: 新订单到达时播放提示音、震动、推送通知,提升用户体验

---

## Research Task 5: Mock支付与Mock叫号实现方案

### Decision

MVP阶段采用Mock实现支付和叫号功能,支付模拟为"点击支付按钮后自动成功",叫号模拟为"B端显示'已叫号'状态 + C端推送通知",不集成真实的微信支付API和TTS语音服务。后续版本预留接口扩展点,便于升级为真实实现。

### Rationale

1. **快速交付**: Mock实现大幅降低开发成本和集成复杂度,满足MVP验证需求
2. **业务流程验证**: Mock支付和叫号足以验证完整的业务流程(下单→支付→制作→叫号→取餐)
3. **接口预留**: 通过抽象接口设计,后续升级为真实实现时前端代码改动最小
4. **测试友好**: Mock实现便于自动化测试,无需真实支付环境
5. **成本节约**: 避免MVP阶段接入支付和TTS服务的费用

### Alternatives Considered

1. **直接集成微信支付**
   - 优点: 真实支付体验,验证完整流程
   - 缺点: 需要企业资质、配置复杂、测试困难
   - 放弃原因: MVP阶段过度投入,且支付不是核心验证目标

2. **使用支付沙箱环境**
   - 优点: 接近真实支付流程,无需企业资质
   - 缺点: 仍需配置和集成工作,增加开发时间
   - 放弃原因: Mock实现更简单,满足MVP需求

3. **真实TTS语音播报**
   - 优点: 验证叫号体验,贴近生产环境
   - 缺点: 需要集成第三方TTS服务(阿里云、腾讯云),增加成本
   - 放弃原因: MVP阶段无需真实语音,显示状态足够

### Implementation Example

**Mock支付服务**

```java
/**
 * @spec O003-beverage-order
 * Mock支付服务 - MVP阶段自动成功
 */
@Service
public class MockPaymentService implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(MockPaymentService.class);

    /**
     * 创建支付订单(Mock实现)
     *
     * @param orderId 订单ID
     * @param amount 支付金额
     * @return 支付参数(前端用于唤起支付)
     */
    @Override
    public PaymentParams createPayment(Long orderId, BigDecimal amount) {
        log.info("[Mock支付] 创建支付订单: orderId={}, amount={}", orderId, amount);

        // Mock支付参数(前端点击后自动成功)
        return PaymentParams.builder()
            .paymentId("MOCK_PAY_" + orderId + "_" + System.currentTimeMillis())
            .orderId(orderId)
            .amount(amount)
            .payType("MOCK")
            .build();
    }

    /**
     * 处理支付回调(Mock实现,立即标记为成功)
     *
     * @param paymentId 支付ID
     * @return 支付结果
     */
    @Override
    public PaymentResult handlePaymentCallback(String paymentId) {
        log.info("[Mock支付] 处理支付回调: paymentId={}", paymentId);

        // 模拟支付成功
        return PaymentResult.builder()
            .success(true)
            .paymentId(paymentId)
            .paidAt(Instant.now())
            .transactionId("MOCK_TXN_" + System.currentTimeMillis())
            .build();
    }

    /**
     * 查询支付状态(Mock实现,始终返回成功)
     */
    @Override
    public PaymentStatus queryPaymentStatus(String paymentId) {
        log.info("[Mock支付] 查询支付状态: paymentId={}", paymentId);
        return PaymentStatus.SUCCESS;
    }
}
```

**C端Mock支付交互**

```typescript
/**
 * @spec O003-beverage-order
 * C端订单支付页 - Mock支付流程
 */
import Taro from '@tarojs/taro';
import { View, Button } from '@tarojs/components';
import { useState } from 'react';
import { beverageOrderService } from '@/services/beverageService';

export const OrderPaymentPage = () => {
  const orderId = Taro.getCurrentInstance().router?.params.id;
  const [paying, setPaying] = useState(false);

  const handlePay = async () => {
    setPaying(true);

    try {
      // 1. 创建支付订单(获取Mock支付参数)
      const paymentParams = await beverageOrderService.createPayment(orderId);

      // 2. Mock支付:延迟1秒后自动成功(模拟支付过程)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. 调用支付回调接口(标记订单为已支付)
      const result = await beverageOrderService.handlePaymentCallback(paymentParams.paymentId);

      if (result.success) {
        // 支付成功,跳转到支付结果页
        Taro.showToast({
          title: '支付成功!',
          icon: 'success',
          duration: 2000
        });

        setTimeout(() => {
          Taro.redirectTo({
            url: `/pages/beverage/payment/index?orderId=${orderId}&status=success`
          });
        }, 2000);
      }
    } catch (error) {
      Taro.showToast({
        title: '支付失败,请重试',
        icon: 'error'
      });
    } finally {
      setPaying(false);
    }
  };

  return (
    <View className="payment-page">
      <View className="order-info">
        <Text>订单金额: ¥38.00</Text>
      </View>

      <Button
        type="primary"
        loading={paying}
        onClick={handlePay}
        disabled={paying}
      >
        {paying ? '支付中...' : '立即支付(Mock)'}
      </Button>

      <View className="mock-notice">
        注意:当前为Mock支付,点击后自动成功
      </View>
    </View>
  );
};
```

**Mock叫号服务**

```java
/**
 * @spec O003-beverage-order
 * Mock叫号服务 - MVP阶段显示状态 + 推送通知
 */
@Service
public class MockCallNumberService implements CallNumberService {

    private static final Logger log = LoggerFactory.getLogger(MockCallNumberService.class);

    private final QueueNumberRepository queueNumberRepository;
    private final NotificationService notificationService; // 小程序推送通知服务

    /**
     * 叫号通知(Mock实现)
     *
     * @param orderId 订单ID
     */
    @Override
    public void callNumber(Long orderId) {
        // 1. 查询取餐号
        QueueNumber queueNumber = queueNumberRepository.findByOrderId(orderId)
            .orElseThrow(() -> new QueueNumberNotFoundException("取餐号不存在"));

        // 2. 更新叫号状态
        queueNumber.setStatus(QueueNumberStatus.CALLED);
        queueNumber.setCalledAt(Instant.now());
        queueNumberRepository.save(queueNumber);

        log.info("[Mock叫号] 取餐号: {}, 订单: {}", queueNumber.getQueueNo(), orderId);

        // 3. Mock语音播报(仅记录日志,不实际播放)
        log.info("[Mock语音] 请{}号顾客取餐", queueNumber.getQueueNo());

        // 4. 发送小程序推送通知(真实实现)
        notificationService.sendOrderReadyNotification(orderId, queueNumber.getQueueNo());
    }

    /**
     * 批量叫号(未来扩展)
     */
    @Override
    public void batchCallNumbers(List<Long> orderIds) {
        orderIds.forEach(this::callNumber);
    }
}
```

**B端叫号交互**

```typescript
/**
 * @spec O003-beverage-order
 * B端订单详情 - Mock叫号按钮
 */
import React from 'react';
import { Button, message, Badge, Modal } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import { orderService } from '../services/orderService';

export const OrderDetailCard = ({ order }) => {
  const [calling, setCalling] = useState(false);

  const handleCallNumber = async () => {
    setCalling(true);

    try {
      await orderService.callNumber(order.id);

      message.success(`已叫号:${order.queueNumber}号`);

      // Mock语音播报提示(仅显示)
      Modal.info({
        title: 'Mock叫号成功',
        content: (
          <div>
            <p>取餐号:<strong>{order.queueNumber}</strong></p>
            <p>Mock语音:请{order.queueNumber}号顾客取餐</p>
            <p>小程序推送:已发送</p>
          </div>
        )
      });
    } catch (error) {
      message.error('叫号失败,请重试');
    } finally {
      setCalling(false);
    }
  };

  return (
    <div className="order-detail-card">
      <Badge.Ribbon text={order.statusText} color={getStatusColor(order.status)}>
        <div className="order-info">
          <p>订单号: {order.orderNo}</p>
          <p>取餐号: {order.queueNumber}</p>
        </div>
      </Badge.Ribbon>

      {order.status === 'COMPLETED' && !order.called && (
        <Button
          type="primary"
          icon={<SoundOutlined />}
          loading={calling}
          onClick={handleCallNumber}
        >
          叫号(Mock)
        </Button>
      )}
    </div>
  );
};
```

**接口预留:真实支付升级路径**

```java
/**
 * @spec O003-beverage-order
 * 支付服务接口 - 抽象层,便于后续升级为真实实现
 */
public interface PaymentService {
    PaymentParams createPayment(Long orderId, BigDecimal amount);
    PaymentResult handlePaymentCallback(String paymentId);
    PaymentStatus queryPaymentStatus(String paymentId);
}

// MVP阶段使用Mock实现
@Service
@ConditionalOnProperty(name = "payment.mode", havingValue = "mock", matchIfMissing = true)
public class MockPaymentService implements PaymentService { /* ... */ }

// 后续版本切换为微信支付实现
@Service
@ConditionalOnProperty(name = "payment.mode", havingValue = "wechat")
public class WechatPaymentService implements PaymentService {
    // 真实微信支付逻辑
}
```

### Best Practices

1. **配置开关**: 使用配置文件控制Mock/真实实现切换(`payment.mode=mock`)
2. **明确提示**: UI上明确标注"Mock支付"或"Mock叫号",避免用户困惑
3. **日志记录**: Mock操作记录详细日志,便于调试和问题排查
4. **接口抽象**: 使用接口抽象支付和叫号逻辑,后续升级时前端无需改动
5. **推送通知**: 即使是Mock叫号,小程序推送通知仍应真实实现,验证通知功能
6. **测试覆盖**: 为Mock实现编写单元测试,确保业务流程正确性

---

## Research Task 6: 订单数据快照设计(防止菜单变更影响历史订单)

### Decision

在订单项(`beverage_order_items`表)中使用JSON字段存储饮品和规格的完整快照,包括饮品名称、规格选项、单价等信息。快照在订单创建时生成,后续菜单变更不影响已下单的历史订单数据。

### Rationale

1. **数据独立性**: 历史订单数据不依赖饮品主数据,即使饮品被删除或修改,订单仍可正常展示
2. **价格冻结**: 订单创建时的价格永久保存,避免价格调整影响历史订单统计
3. **审计合规**: 订单数据作为财务凭证,必须保证不可篡改和完整性
4. **查询性能**: 订单查询时无需join饮品表,查询性能更好
5. **业务灵活性**: 支持饮品下架、重命名、规格调整等操作,不影响历史数据

### Alternatives Considered

1. **仅存储饮品ID,查询时Join**
   - 优点: 避免数据冗余,节省存储空间
   - 缺点: 饮品删除后订单无法显示,价格变更影响历史统计
   - 放弃原因: 无法保证数据独立性和审计合规性

2. **饮品表使用软删除+版本控制**
   - 优点: 保留所有历史版本,订单可引用历史版本
   - 缺点: 表结构复杂,查询性能差,维护成本高
   - 放弃原因: 过度设计,不如快照方案简洁

3. **订单归档表**
   - 优点: 历史订单与当前订单分离,便于归档管理
   - 缺点: 增加表数量,归档逻辑复杂
   - 放弃原因: 快照方案足以满足需求

### Implementation Example

**数据库表设计**

```sql
/**
 * @spec O003-beverage-order
 * 订单项表 - 包含饮品和规格快照
 */
CREATE TABLE beverage_order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES beverage_orders(id) ON DELETE CASCADE,

    -- 关联字段(仅用于关联查询,不作为主要数据源)
    beverage_id BIGINT REFERENCES beverages(id) ON DELETE SET NULL,

    -- 饮品快照(订单创建时的饮品信息,JSON格式)
    beverage_snapshot JSONB NOT NULL,
    -- 示例: {
    --   "id": 123,
    --   "name": "美式咖啡",
    --   "category": "COFFEE",
    --   "description": "经典美式咖啡,香醇浓郁",
    --   "mainImage": "https://xxx.supabase.co/storage/v1/object/public/beverages/123/main.jpg"
    -- }

    -- 规格快照(订单创建时选中的规格,JSON格式)
    spec_snapshot JSONB NOT NULL,
    -- 示例: {
    --   "SIZE": {"name": "大杯", "priceAdjustment": 5.00},
    --   "TEMPERATURE": {"name": "热", "priceAdjustment": 0.00},
    --   "SWEETNESS": {"name": "半糖", "priceAdjustment": 0.00},
    --   "TOPPING": {"name": "加珍珠", "priceAdjustment": 3.00}
    -- }

    -- 数量和价格(快照)
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL, -- 单价(含规格调整后的总价)
    subtotal DECIMAL(10, 2) NOT NULL,   -- 小计 = unit_price * quantity

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_beverage_order_items_order_id ON beverage_order_items(order_id);
CREATE INDEX idx_beverage_order_items_beverage_id ON beverage_order_items(beverage_id);
```

**订单创建时生成快照**

```java
/**
 * @spec O003-beverage-order
 * 订单服务 - 创建订单时生成快照
 */
@Service
public class OrderService {

    private final BeverageRepository beverageRepository;
    private final BeverageSpecRepository specRepository;
    private final BeverageOrderRepository orderRepository;
    private final ObjectMapper objectMapper;

    /**
     * 创建饮品订单
     *
     * @param request 订单创建请求
     * @return 订单DTO
     */
    @Transactional
    public OrderDTO createOrder(CreateOrderRequest request) {
        // 1. 创建订单主记录
        BeverageOrder order = new BeverageOrder();
        order.setOrderNo(generateOrderNo());
        order.setUserId(request.getUserId());
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(Instant.now());

        List<BeverageOrderItem> orderItems = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;

        // 2. 处理每个订单项,生成快照
        for (CreateOrderItemRequest itemRequest : request.getItems()) {
            // 2.1 查询饮品主数据
            Beverage beverage = beverageRepository.findById(itemRequest.getBeverageId())
                .orElseThrow(() -> new BeverageNotFoundException("饮品不存在"));

            // 2.2 生成饮品快照
            BeverageSnapshot beverageSnapshot = BeverageSnapshot.builder()
                .id(beverage.getId())
                .name(beverage.getName())
                .category(beverage.getCategory())
                .description(beverage.getDescription())
                .mainImage(beverage.getMainImage())
                .build();

            // 2.3 查询规格并生成规格快照
            Map<SpecType, SpecSnapshot> specSnapshot = new HashMap<>();
            BigDecimal priceAdjustment = BigDecimal.ZERO;

            for (Map.Entry<SpecType, Long> entry : itemRequest.getSelectedSpecs().entrySet()) {
                SpecType specType = entry.getKey();
                Long specId = entry.getValue();

                BeverageSpec spec = specRepository.findById(specId)
                    .orElseThrow(() -> new SpecNotFoundException("规格不存在"));

                SpecSnapshot snapshot = SpecSnapshot.builder()
                    .name(spec.getSpecName())
                    .priceAdjustment(spec.getPriceAdjustment())
                    .build();

                specSnapshot.put(specType, snapshot);
                priceAdjustment = priceAdjustment.add(spec.getPriceAdjustment());
            }

            // 2.4 计算单价和小计
            BigDecimal unitPrice = beverage.getBasePrice().add(priceAdjustment);
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalPrice = totalPrice.add(subtotal);

            // 2.5 创建订单项(包含快照)
            BeverageOrderItem orderItem = new BeverageOrderItem();
            orderItem.setOrder(order);
            orderItem.setBeverageId(beverage.getId());
            orderItem.setBeverageSnapshot(objectMapper.writeValueAsString(beverageSnapshot));
            orderItem.setSpecSnapshot(objectMapper.writeValueAsString(specSnapshot));
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setUnitPrice(unitPrice);
            orderItem.setSubtotal(subtotal);

            orderItems.add(orderItem);
        }

        // 3. 设置订单总价并保存
        order.setTotalPrice(totalPrice);
        order.setItems(orderItems);
        orderRepository.save(order);

        return OrderMapper.toDTO(order);
    }
}

@Data
@Builder
class BeverageSnapshot {
    private Long id;
    private String name;
    private String category;
    private String description;
    private String mainImage;
}

@Data
@Builder
class SpecSnapshot {
    private String name;
    private BigDecimal priceAdjustment;
}
```

**订单查询时使用快照**

```java
/**
 * @spec O003-beverage-order
 * 订单DTO - 包含快照数据
 */
@Data
public class OrderDTO {
    private Long id;
    private String orderNo;
    private String queueNumber;
    private OrderStatus status;
    private BigDecimal totalPrice;
    private List<OrderItemDTO> items;
    private Instant createdAt;
}

@Data
public class OrderItemDTO {
    private Long id;

    // 快照数据(从JSON反序列化)
    private String beverageName;
    private String beverageImage;
    private String beverageDescription;

    // 规格快照
    private Map<String, String> specs; // {"大小": "大杯", "温度": "热", ...}

    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}

// Mapper: 从快照中提取数据
public class OrderMapper {

    public static OrderDTO toDTO(BeverageOrder order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setOrderNo(order.getOrderNo());
        dto.setStatus(order.getStatus());
        dto.setTotalPrice(order.getTotalPrice());

        List<OrderItemDTO> itemDTOs = order.getItems().stream()
            .map(OrderMapper::toItemDTO)
            .collect(Collectors.toList());
        dto.setItems(itemDTOs);

        return dto;
    }

    public static OrderItemDTO toItemDTO(BeverageOrderItem item) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(item.getId());

        // 从快照中提取数据
        BeverageSnapshot beverageSnapshot = parseSnapshot(item.getBeverageSnapshot(), BeverageSnapshot.class);
        dto.setBeverageName(beverageSnapshot.getName());
        dto.setBeverageImage(beverageSnapshot.getMainImage());
        dto.setBeverageDescription(beverageSnapshot.getDescription());

        // 规格快照转换为可读格式
        Map<SpecType, SpecSnapshot> specSnapshot = parseSnapshot(
            item.getSpecSnapshot(),
            new TypeReference<Map<SpecType, SpecSnapshot>>() {}
        );

        Map<String, String> specs = specSnapshot.entrySet().stream()
            .collect(Collectors.toMap(
                e -> e.getKey().getDisplayName(),
                e -> e.getValue().getName()
            ));
        dto.setSpecs(specs);

        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setSubtotal(item.getSubtotal());

        return dto;
    }

    private static <T> T parseSnapshot(String json, Class<T> clazz) {
        try {
            return objectMapper.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            throw new SnapshotParseException("快照解析失败", e);
        }
    }
}
```

**前端展示订单快照**

```typescript
/**
 * @spec O003-beverage-order
 * C端订单详情页 - 展示快照数据
 */
import React from 'react';
import { View, Text, Image } from '@tarojs/components';

export const OrderDetailPage = ({ order }) => {
  return (
    <View className="order-detail">
      <Text className="order-no">订单号: {order.orderNo}</Text>

      {order.items.map(item => (
        <View key={item.id} className="order-item">
          <Image src={item.beverageImage} className="item-image" />

          <View className="item-info">
            <Text className="item-name">{item.beverageName}</Text>

            {/* 显示规格快照 */}
            <View className="item-specs">
              {Object.entries(item.specs).map(([type, value]) => (
                <Text key={type} className="spec-tag">
                  {type}: {value}
                </Text>
              ))}
            </View>

            <Text className="item-price">
              ¥{item.unitPrice} × {item.quantity} = ¥{item.subtotal}
            </Text>
          </View>
        </View>
      ))}

      <View className="order-total">
        <Text>总价: ¥{order.totalPrice}</Text>
      </View>
    </View>
  );
};
```

### Best Practices

1. **快照完整性**: 快照应包含所有展示所需的数据(名称、图片、规格、价格),避免依赖外部数据
2. **JSON字段索引**: 对常用查询字段(如饮品名称)创建GIN索引,提高查询性能
3. **快照版本**: 在快照中添加`version`字段,便于后续快照格式升级
4. **数据校验**: 订单创建时校验饮品和规格的有效性,避免保存无效快照
5. **定期清理**: 定期归档或删除过期订单数据,释放存储空间
6. **快照压缩**: 对于大型快照(如详情图列表),考虑使用JSONB的压缩功能

---

## Summary

本研究文档完成了6个关键技术任务的决策和实现方案设计:

1. **Taro tabBar配置**: 采用静态配置方式,在`app.config.ts`中集中管理,添加"点餐菜单"tab
2. **Supabase Storage图片管理**: 使用分桶策略,B端封装上传API,C端通过CDN加速访问
3. **BOM自动扣料**: 集成P003/P004库存API,使用事务保证原子性,扣料时机为"待制作→制作中"
4. **订单状态实时同步**: MVP阶段采用轮询策略(B端5秒、C端3秒),后续可升级为WebSocket
5. **Mock支付与叫号**: 使用Mock实现快速交付,通过接口抽象预留真实实现升级路径
6. **订单数据快照**: 在订单项中存储JSON快照,保证历史订单数据独立性和审计合规性

所有技术方案均遵循项目宪章规范,符合TDD、模块化架构、性能标准和安全标准要求。后续开发将基于这些技术决策进行实现。

---

**Next Steps**:
1. 基于本研究成果完成`data-model.md`数据模型设计
2. 编写`contracts/api.yaml` OpenAPI规范文档
3. 生成`quickstart.md`开发快速入门指南
4. 使用`/speckit.tasks`命令生成`tasks.md`开发任务清单

**Research Complete**: 2025-12-28
**Ready for Implementation**: Yes
**Estimated MVP Development Time**: 2-3 weeks
