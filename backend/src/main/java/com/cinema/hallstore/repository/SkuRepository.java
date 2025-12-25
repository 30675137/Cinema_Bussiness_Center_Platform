package com.cinema.hallstore.repository;

import com.cinema.hallstore.config.SupabaseConfig;
import com.cinema.hallstore.domain.Sku;
import com.cinema.hallstore.domain.enums.SkuStatus;
import com.cinema.hallstore.domain.enums.SkuType;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Repository;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import com.fasterxml.jackson.core.type.TypeReference;

/**
 * SKU Repository
 * 通过 Supabase REST API 实现SKU数据的查询和CRUD操作
 *
 * @since P001-sku-master-data
 */
@Repository
public class SkuRepository {

    private final WebClient webClient;
    private final SupabaseConfig supabaseConfig;

    public SkuRepository(WebClient supabaseWebClient, SupabaseConfig supabaseConfig) {
        this.webClient = supabaseWebClient;
        this.supabaseConfig = supabaseConfig;
    }

    /**
     * 查询SKU列表,支持按类型、状态、门店筛选
     */
    public List<Sku> findAll(SkuType skuType, SkuStatus status, String storeId, String keyword) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString("/skus")
                .queryParam("order", "created_at.desc");

        // 按SKU类型筛选
        if (skuType != null) {
            builder.queryParam("sku_type", "eq." + skuType.getValue());
        }

        // 按状态筛选
        if (status != null) {
            builder.queryParam("status", "eq." + status.getValue());
        }

        // 按关键词搜索(名称或编码)
        if (keyword != null && !keyword.trim().isEmpty()) {
            builder.queryParam("or", "(name.ilike.*" + keyword + "*,code.ilike.*" + keyword + "*)");
        }

        // 按门店范围筛选
        // store_scope = '{}' OR storeId = ANY(store_scope)
        if (storeId != null && !storeId.trim().isEmpty()) {
            builder.queryParam("or", "(store_scope.eq.{},store_scope.cs.{" + storeId + "})");
        }

        String uri = builder.build().toUriString();

        return webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Sku>>() {})
                .block();
    }

    /**
     * 按ID查询SKU
     */
    public Optional<Sku> findById(UUID id) {
        String uri = UriComponentsBuilder
                .fromUriString("/skus")
                .queryParam("id", "eq." + id)
                .queryParam("limit", "1")
                .build()
                .toUriString();

        List<Sku> result = webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Sku>>() {})
                .block();

        return result != null && !result.isEmpty()
                ? Optional.of(result.get(0))
                : Optional.empty();
    }

    /**
     * 按编码查询SKU(检查唯一性)
     */
    public Optional<Sku> findByCode(String code) {
        String uri = UriComponentsBuilder
                .fromUriString("/skus")
                .queryParam("code", "eq." + code)
                .queryParam("limit", "1")
                .build()
                .toUriString();

        List<Sku> result = webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Sku>>() {})
                .block();

        return result != null && !result.isEmpty()
                ? Optional.of(result.get(0))
                : Optional.empty();
    }

    /**
     * 按SKU类型查询
     */
    public List<Sku> findBySkuType(SkuType skuType) {
        return findAll(skuType, null, null, null);
    }

    /**
     * 按状态查询
     */
    public List<Sku> findByStatus(SkuStatus status) {
        return findAll(null, status, null, null);
    }

    /**
     * 创建SKU
     */
    public Sku save(Sku sku) {
        if (sku.getId() == null) {
            // 创建新SKU
            // PostgREST 返回数组，需要反序列化为 List 后取第一个元素
            List<Sku> result = webClient.post()
                    .uri("/skus")
                    .header("Prefer", "return=representation")
                    .bodyValue(sku)
                    .retrieve()
                    .onStatus(
                        status -> status.is4xxClientError() || status.is5xxServerError(),
                        response -> response.bodyToMono(String.class)
                            .flatMap(body -> {
                                System.err.println("Supabase error response: " + body);
                                return reactor.core.publisher.Mono.error(
                                    new RuntimeException("Supabase API error: " + body)
                                );
                            })
                    )
                    .bodyToMono(new ParameterizedTypeReference<List<Sku>>() {})
                    .block();
            return result != null && !result.isEmpty() ? result.get(0) : null;
        } else {
            // 更新SKU
            return update(sku);
        }
    }

    /**
     * 更新SKU
     * 只发送需要更新的字段，避免发送 created_at 等数据库自动管理的字段
     * 注意：updated_at 字段由数据库触发器自动更新，无需手动发送
     */
    public Sku update(Sku sku) {
        String uri = UriComponentsBuilder
                .fromUriString("/skus")
                .queryParam("id", "eq." + sku.getId())
                .build()
                .toUriString();

        // 构建只包含需要更新字段的 Map，避免发送 created_at 和 updated_at 等字段
        // 数据库有触发器自动更新 updated_at
        Map<String, Object> updateFields = new HashMap<>();
        if (sku.getName() != null) {
            updateFields.put("name", sku.getName());
        }
        if (sku.getCode() != null) {
            updateFields.put("code", sku.getCode());
        }
        if (sku.getSpuId() != null) {
            updateFields.put("spu_id", sku.getSpuId().toString());
        }
        if (sku.getSkuType() != null) {
            updateFields.put("sku_type", sku.getSkuType().getValue());
        }
        if (sku.getMainUnit() != null) {
            updateFields.put("main_unit", sku.getMainUnit());
        }
        // storeScope 需要特殊处理：Supabase 期望 JSON 数组格式
        if (sku.getStoreScope() != null) {
            updateFields.put("store_scope", java.util.Arrays.asList(sku.getStoreScope()));
        }
        if (sku.getStandardCost() != null) {
            updateFields.put("standard_cost", sku.getStandardCost());
        }
        if (sku.getWasteRate() != null) {
            updateFields.put("waste_rate", sku.getWasteRate());
        }
        if (sku.getStatus() != null) {
            updateFields.put("status", sku.getStatus().getValue());
        }
        // P001-sku-master-data: 添加零售价字段更新（仅成品/套餐类型使用）
        if (sku.getPrice() != null) {
            updateFields.put("price", sku.getPrice());
        }
        // 不发送 created_at 和 updated_at，数据库触发器会自动处理

        System.out.println("Updating SKU with fields: " + updateFields);

        List<Sku> result = webClient.patch()
                .uri(uri)
                .header("Prefer", "return=representation")
                .bodyValue(updateFields)
                .retrieve()
                .onStatus(
                    status -> status.is4xxClientError() || status.is5xxServerError(),
                    response -> response.bodyToMono(String.class)
                        .flatMap(body -> {
                            System.err.println("Supabase update error response: " + body);
                            return reactor.core.publisher.Mono.error(
                                new RuntimeException("Supabase API error: " + body)
                            );
                        })
                )
                .bodyToMono(new ParameterizedTypeReference<List<Sku>>() {})
                .block();

        return result != null && !result.isEmpty() ? result.get(0) : null;
    }

    /**
     * 删除SKU
     */
    public void deleteById(UUID id) {
        String uri = UriComponentsBuilder
                .fromUriString("/skus")
                .queryParam("id", "eq." + id)
                .build()
                .toUriString();

        webClient.delete()
                .uri(uri)
                .retrieve()
                .toBodilessEntity()
                .block();
    }

    /**
     * 检查编码是否存在
     */
    public boolean existsByCode(String code) {
        return findByCode(code).isPresent();
    }

    /**
     * 检查编码是否存在(排除指定ID)
     */
    public boolean existsByCodeAndIdNot(String code, UUID excludeId) {
        String uri = UriComponentsBuilder
                .fromUriString("/skus")
                .queryParam("code", "eq." + code)
                .queryParam("id", "neq." + excludeId)
                .queryParam("select", "id")
                .queryParam("limit", "1")
                .build()
                .toUriString();

        List<Object> result = webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Object>>() {})
                .block();

        return result != null && !result.isEmpty();
    }

    /**
     * 删除SKU
     */
    public void delete(UUID id) {
        deleteById(id);
    }
}
