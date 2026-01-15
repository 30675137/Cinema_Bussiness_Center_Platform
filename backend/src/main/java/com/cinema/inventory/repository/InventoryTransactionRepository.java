package com.cinema.inventory.repository;

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

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 库存流水数据访问层 - 使用 Supabase REST API
 * 
 * @since P004-inventory-adjustment
 */
@Repository
public class InventoryTransactionRepository {

    private static final Logger logger = LoggerFactory.getLogger(InventoryTransactionRepository.class);

    private final WebClient webClient;
    private final SupabaseConfig supabaseConfig;

    public InventoryTransactionRepository(WebClient supabaseWebClient, SupabaseConfig supabaseConfig) {
        this.webClient = supabaseWebClient;
        this.supabaseConfig = supabaseConfig;
    }

    /**
     * 创建库存流水记录
     * 
     * @param transaction 流水数据
     * @return 创建的流水记录（包含生成的ID）
     */
    public InventoryTransaction create(InventoryTransaction transaction) {
        try {
            Map<String, Object> data = new HashMap<>();
            data.put("store_id", transaction.storeId.toString());
            data.put("sku_id", transaction.skuId.toString());
            data.put("transaction_type", transaction.transactionType);
            data.put("quantity", transaction.quantity);
            data.put("stock_before", transaction.stockBefore);
            data.put("stock_after", transaction.stockAfter);
            data.put("available_before", transaction.availableBefore);
            data.put("available_after", transaction.availableAfter);
            data.put("source_type", transaction.sourceType);
            data.put("source_document", transaction.sourceDocument);
            if (transaction.operatorId != null) {
                data.put("operator_id", transaction.operatorId.toString());
            }
            data.put("operator_name", transaction.operatorName);
            data.put("remarks", transaction.remarks);
            data.put("transaction_time", Instant.now().toString());

            List<InventoryTransaction> result = webClient.post()
                    .uri("/inventory_transactions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Prefer", "return=representation")
                    .bodyValue(data)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<InventoryTransaction>>() {})
                    .block(supabaseConfig.getTimeoutDuration());

            if (result != null && !result.isEmpty()) {
                logger.info("Created inventory transaction: id={}, type={}, quantity={}", 
                    result.get(0).id, result.get(0).transactionType, result.get(0).quantity);
                return result.get(0);
            }
            return transaction;
        } catch (WebClientResponseException e) {
            logger.error("Error creating inventory transaction. Status: {}, Body: {}", 
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to create inventory transaction", e);
        }
    }

    /**
     * 查询库存流水列表
     * 
     * @param skuId SKU ID（可选）
     * @param storeId 门店ID（可选）
     * @param page 页码
     * @param pageSize 每页条数
     * @return 流水记录列表
     */
    public List<InventoryTransaction> findByParams(UUID skuId, UUID storeId, int page, int pageSize) {
        try {
            // 使用 Supabase 的嵌入查询来获取关联的 SKU 和 Store 信息
            UriComponentsBuilder builder = UriComponentsBuilder
                    .fromUriString("/inventory_transactions")
                    .queryParam("select", "*,skus(code,name,main_unit),stores(code,name)")
                    .queryParam("order", "transaction_time.desc");

            if (skuId != null) {
                builder.queryParam("sku_id", "eq." + skuId);
            }
            if (storeId != null) {
                builder.queryParam("store_id", "eq." + storeId);
            }

            int offset = (page - 1) * pageSize;
            builder.queryParam("limit", pageSize);
            builder.queryParam("offset", offset);

            String uri = builder.build().toUriString();
            logger.debug("Querying inventory transactions with URI: {}", uri);

            List<InventoryTransaction> transactions = webClient.get()
                    .uri(uri)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<InventoryTransaction>>() {})
                    .block(supabaseConfig.getTimeoutDuration());

            return transactions != null ? transactions : List.of();
        } catch (WebClientResponseException e) {
            logger.error("Error fetching inventory transactions. Status: {}, Body: {}", 
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to fetch inventory transactions", e);
        }
    }

    /**
     * 统计流水总数
     */
    public long countByParams(UUID skuId, UUID storeId) {
        try {
            UriComponentsBuilder builder = UriComponentsBuilder
                    .fromUriString("/inventory_transactions")
                    .queryParam("select", "count");

            if (skuId != null) {
                builder.queryParam("sku_id", "eq." + skuId);
            }
            if (storeId != null) {
                builder.queryParam("store_id", "eq." + storeId);
            }

            String countHeader = webClient.get()
                    .uri(builder.build().toUriString())
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
            logger.error("Error counting inventory transactions", e);
            return 0;
        }
    }

    // ========== DTO ==========

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class InventoryTransaction {
        @JsonProperty("id")
        public UUID id;

        @JsonProperty("store_id")
        public UUID storeId;

        @JsonProperty("sku_id")
        public UUID skuId;

        @JsonProperty("transaction_type")
        public String transactionType;

        @JsonProperty("quantity")
        public Integer quantity;

        @JsonProperty("stock_before")
        public Integer stockBefore;

        @JsonProperty("stock_after")
        public Integer stockAfter;

        @JsonProperty("available_before")
        public Integer availableBefore;

        @JsonProperty("available_after")
        public Integer availableAfter;

        @JsonProperty("source_type")
        public String sourceType;

        @JsonProperty("source_document")
        public String sourceDocument;

        @JsonProperty("operator_id")
        public UUID operatorId;

        @JsonProperty("operator_name")
        public String operatorName;

        @JsonProperty("remarks")
        public String remarks;

        @JsonProperty("transaction_time")
        public Instant transactionTime;

        @JsonProperty("created_at")
        public Instant createdAt;

        @JsonProperty("updated_at")
        public Instant updatedAt;

        // 关联信息（通过 Supabase join 查询填充）
        @JsonProperty("skus")
        public SkuInfo skus;

        @JsonProperty("stores")
        public StoreInfo stores;
    }

    // SKU 关联信息
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SkuInfo {
        @JsonProperty("code")
        public String code;

        @JsonProperty("name")
        public String name;

        @JsonProperty("main_unit")
        public String mainUnit;
    }

    // 门店关联信息
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StoreInfo {
        @JsonProperty("code")
        public String code;

        @JsonProperty("name")
        public String name;
    }
}
