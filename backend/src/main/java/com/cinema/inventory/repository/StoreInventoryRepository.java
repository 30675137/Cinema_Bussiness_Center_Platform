package com.cinema.inventory.repository;

import com.cinema.inventory.domain.InventoryStatus;
import com.cinema.inventory.domain.StoreInventory;
import com.cinema.inventory.dto.InventoryQueryParams;
import com.cinema.hallstore.config.SupabaseConfig;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Repository;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 门店库存数据访问层 - 使用 Supabase REST API
 * 支持复杂的库存查询，包含关联的SKU和分类信息。
 * 
 * @since P003-inventory-query
 */
@Repository
public class StoreInventoryRepository {

    private static final Logger logger = LoggerFactory.getLogger(StoreInventoryRepository.class);

    private final WebClient webClient;
    private final SupabaseConfig supabaseConfig;

    public StoreInventoryRepository(WebClient supabaseWebClient, SupabaseConfig supabaseConfig) {
        this.webClient = supabaseWebClient;
        this.supabaseConfig = supabaseConfig;
    }

    /**
     * 查询库存列表，支持多条件筛选和分页。
     * 使用 Supabase 的关联查询获取 SKU 和分类信息。
     * 
     * @param params 查询参数
     * @return 库存列表
     */
    public List<StoreInventory> findByParams(InventoryQueryParams params) {
        try {
            // 使用 Supabase 的嵌入查询来获取关联的 SKU 和 Category 信息
            UriComponentsBuilder builder = UriComponentsBuilder
                    .fromUriString("/store_inventory")
                    .queryParam("select", "id,store_id,sku_id,on_hand_qty,available_qty,reserved_qty,safety_stock,created_at,updated_at," +
                            "skus!inner(code,name,main_unit,category_id,categories(id,name))," +
                            "stores!inner(code,name)")
                    .queryParam("order", "updated_at.desc");

            // 门店筛选
            if (params.getStoreId() != null) {
                builder.queryParam("store_id", "eq." + params.getStoreId());
            }

            // 分类筛选
            if (params.getCategoryId() != null) {
                builder.queryParam("skus.category_id", "eq." + params.getCategoryId());
            }

            // 关键词搜索（SKU 名称或编码）
            if (params.getKeyword() != null && !params.getKeyword().isBlank()) {
                // 使用 or 条件搜索 name 或 code
                String keyword = params.getKeyword().trim();
                builder.queryParam("or", "(skus.name.ilike.*" + keyword + "*,skus.code.ilike.*" + keyword + "*)");
            }

            // 分页
            int page = params.getPage() != null ? params.getPage() : 1;
            int pageSize = params.getPageSize() != null ? params.getPageSize() : 20;
            int offset = (page - 1) * pageSize;
            builder.queryParam("limit", pageSize);
            builder.queryParam("offset", offset);

            String uri = builder.build().toUriString();
            logger.debug("Querying inventory with URI: {}", uri);

            List<SupabaseInventoryRow> rows = webClient.get()
                    .uri(uri)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<SupabaseInventoryRow>>() {})
                    .block(supabaseConfig.getTimeoutDuration());

            if (rows == null) {
                return List.of();
            }

            // 转换为领域模型，并根据状态过滤
            List<StoreInventory> inventories = rows.stream()
                    .map(this::toDomain)
                    .collect(Collectors.toList());

            // 状态过滤（需要在内存中进行，因为状态是计算字段）
            if (params.getStatuses() != null && !params.getStatuses().isEmpty()) {
                inventories = inventories.stream()
                        .filter(inv -> params.getStatuses().contains(inv.getInventoryStatus()))
                        .collect(Collectors.toList());
            }

            return inventories;
        } catch (WebClientResponseException e) {
            logger.error("Error fetching inventory. Status: {}, Body: {}", 
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to fetch inventory", e);
        }
    }

    /**
     * 统计符合条件的库存总数
     */
    public long countByParams(InventoryQueryParams params) {
        try {
            UriComponentsBuilder builder = UriComponentsBuilder
                    .fromUriString("/store_inventory")
                    .queryParam("select", "count")
                    .queryParam("count", "exact");

            if (params.getStoreId() != null) {
                builder.queryParam("store_id", "eq." + params.getStoreId());
            }

            if (params.getCategoryId() != null) {
                // 需要 join SKU 表来按分类过滤
                // Supabase count 不支持直接 join，这里简化处理
                builder.queryParam("sku_id", "in.(select id from skus where category_id=eq." + params.getCategoryId() + ")");
            }

            String uri = builder.build().toUriString();
            
            // Supabase 返回 content-range header 包含总数
            String countHeader = webClient.get()
                    .uri(uri)
                    .accept(MediaType.APPLICATION_JSON)
                    .header("Prefer", "count=exact")
                    .retrieve()
                    .toBodilessEntity()
                    .block(supabaseConfig.getTimeoutDuration())
                    .getHeaders()
                    .getFirst("content-range");

            if (countHeader != null && countHeader.contains("/")) {
                String[] parts = countHeader.split("/");
                return Long.parseLong(parts[1]);
            }
            return 0;
        } catch (Exception e) {
            logger.error("Error counting inventory", e);
            return 0;
        }
    }

    /**
     * 根据ID查询库存详情
     */
    public Optional<StoreInventory> findById(UUID id) {
        try {
            String uri = UriComponentsBuilder
                    .fromUriString("/store_inventory")
                    .queryParam("select", "id,store_id,sku_id,on_hand_qty,available_qty,reserved_qty,safety_stock,created_at,updated_at," +
                            "skus!inner(code,name,main_unit,category_id,categories(id,name))," +
                            "stores!inner(code,name)")
                    .queryParam("id", "eq." + id)
                    .build()
                    .toUriString();

            List<SupabaseInventoryRow> rows = webClient.get()
                    .uri(uri)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<SupabaseInventoryRow>>() {})
                    .block(supabaseConfig.getTimeoutDuration());

            if (rows == null || rows.isEmpty()) {
                return Optional.empty();
            }
            return Optional.of(toDomain(rows.get(0)));
        } catch (WebClientResponseException.NotFound e) {
            return Optional.empty();
        }
    }

    // ========== Internal DTOs for Supabase ==========

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private static class SupabaseInventoryRow {
        @JsonProperty("id")
        public UUID id;

        @JsonProperty("store_id")
        public UUID storeId;

        @JsonProperty("sku_id")
        public UUID skuId;

        @JsonProperty("on_hand_qty")
        public BigDecimal onHandQty;

        @JsonProperty("available_qty")
        public BigDecimal availableQty;

        @JsonProperty("reserved_qty")
        public BigDecimal reservedQty;

        @JsonProperty("safety_stock")
        public BigDecimal safetyStock;

        @JsonProperty("created_at")
        public Instant createdAt;

        @JsonProperty("updated_at")
        public Instant updatedAt;

        // 嵌套的 SKU 信息
        @JsonProperty("skus")
        public SkuInfo skus;

        // 嵌套的门店信息
        @JsonProperty("stores")
        public StoreInfo stores;
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private static class SkuInfo {
        @JsonProperty("code")
        public String code;

        @JsonProperty("name")
        public String name;

        @JsonProperty("main_unit")
        public String mainUnit;

        @JsonProperty("category_id")
        public UUID categoryId;

        @JsonProperty("categories")
        public CategoryInfo categories;
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private static class CategoryInfo {
        @JsonProperty("id")
        public UUID id;

        @JsonProperty("name")
        public String name;
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private static class StoreInfo {
        @JsonProperty("code")
        public String code;

        @JsonProperty("name")
        public String name;
    }

    // ========== Mapping Methods ==========

    private StoreInventory toDomain(SupabaseInventoryRow row) {
        StoreInventory inventory = new StoreInventory();
        inventory.setId(row.id);
        inventory.setStoreId(row.storeId);
        inventory.setSkuId(row.skuId);
        inventory.setOnHandQty(row.onHandQty != null ? row.onHandQty : BigDecimal.ZERO);
        inventory.setAvailableQty(row.availableQty != null ? row.availableQty : BigDecimal.ZERO);
        inventory.setReservedQty(row.reservedQty != null ? row.reservedQty : BigDecimal.ZERO);
        inventory.setSafetyStock(row.safetyStock != null ? row.safetyStock : BigDecimal.ZERO);
        inventory.setCreatedAt(row.createdAt);
        inventory.setUpdatedAt(row.updatedAt);

        // 设置关联的 SKU 信息
        if (row.skus != null) {
            inventory.setSkuCode(row.skus.code);
            inventory.setSkuName(row.skus.name);
            inventory.setMainUnit(row.skus.mainUnit);
            inventory.setCategoryId(row.skus.categoryId);
            
            // 设置分类信息
            if (row.skus.categories != null) {
                inventory.setCategoryName(row.skus.categories.name);
            }
        }

        // 设置门店信息
        if (row.stores != null) {
            inventory.setStoreCode(row.stores.code);
            inventory.setStoreName(row.stores.name);
        }

        return inventory;
    }
}
