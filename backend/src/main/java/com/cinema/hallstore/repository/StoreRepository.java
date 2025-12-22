package com.cinema.hallstore.repository;

import com.cinema.hallstore.config.SupabaseConfig;
import com.cinema.hallstore.domain.Store;
import com.cinema.hallstore.domain.enums.StoreStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
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
import java.util.Optional;
import java.util.UUID;

/**
 * StoreRepository:
 * - 通过 Supabase REST API 实现门店数据的查询和CRUD操作
 * - 使用 WebClient 进行 HTTP 调用
 * 
 * @since 014-hall-store-backend
 * @updated 020-store-address 添加地址更新方法
 * @updated 022-store-crud 添加CRUD方法和名称唯一性检查
 */
@Repository
public class StoreRepository {

    private final WebClient webClient;
    private final SupabaseConfig supabaseConfig;

    public StoreRepository(WebClient supabaseWebClient, SupabaseConfig supabaseConfig) {
        this.webClient = supabaseWebClient;
        this.supabaseConfig = supabaseConfig;
    }

    /**
     * 查询门店列表，支持按状态过滤
     */
    public List<Store> findAll(StoreStatus status) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString("/stores")
                .queryParam("order", "created_at.desc");

        if (status != null) {
            builder.queryParam("status", "eq." + status.name().toLowerCase());
        }

        List<SupabaseStoreRow> rows = webClient.get()
                .uri(builder.build().toUriString())
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<SupabaseStoreRow>>() {})
                .block(supabaseConfig.getTimeoutDuration());

        return rows == null ? List.of() : rows.stream().map(this::toDomain).toList();
    }

    /**
     * 根据门店 ID 查询单个门店
     */
    public Optional<Store> findById(UUID storeId) {
        try {
            List<SupabaseStoreRow> rows = webClient.get()
                    .uri("/stores?id=eq." + storeId)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<SupabaseStoreRow>>() {})
                    .block(supabaseConfig.getTimeoutDuration());

            if (rows == null || rows.isEmpty()) {
                return Optional.empty();
            }
            return Optional.of(toDomain(rows.get(0)));
        } catch (WebClientResponseException.NotFound e) {
            return Optional.empty();
        }
    }

    /**
     * 根据门店编码查询门店
     */
    public Optional<Store> findByCode(String code) {
        try {
            List<SupabaseStoreRow> rows = webClient.get()
                    .uri("/stores?code=eq." + code)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<SupabaseStoreRow>>() {})
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

    /**
     * Supabase 表行结构（snake_case）
     * @updated 020-store-address 添加地址字段
     * @updated 022-store-crud 添加version字段
     */
    private static class SupabaseStoreRow {
        @JsonProperty("id")
        public UUID id;

        @JsonProperty("code")
        public String code;

        @JsonProperty("name")
        public String name;

        @JsonProperty("region")
        public String region;

        @JsonProperty("status")
        public String status;

        @JsonProperty("version")
        public Long version;  // 022-store-crud

        @JsonProperty("created_at")
        public Instant createdAt;

        @JsonProperty("updated_at")
        public Instant updatedAt;

        @JsonProperty("created_by")
        public UUID createdBy;  // 022-store-crud

        @JsonProperty("updated_by")
        public UUID updatedBy;  // 022-store-crud

        // 020-store-address 新增字段
        @JsonProperty("province")
        public String province;

        @JsonProperty("city")
        public String city;

        @JsonProperty("district")
        public String district;

        @JsonProperty("address")
        public String address;

        @JsonProperty("phone")
        public String phone;
    }

    // ========== Mapping Methods ==========

    private Store toDomain(SupabaseStoreRow row) {
        Store store = new Store();
        store.setId(row.id);
        store.setCode(row.code);
        store.setName(row.name);
        store.setRegion(row.region);
        store.setStatus(parseStoreStatus(row.status));
        store.setVersion(row.version != null ? row.version : 0L);  // 022-store-crud
        store.setCreatedAt(row.createdAt);
        store.setUpdatedAt(row.updatedAt);
        store.setCreatedBy(row.createdBy);  // 022-store-crud
        store.setUpdatedBy(row.updatedBy);  // 022-store-crud
        // 020-store-address 地址字段映射
        store.setProvince(row.province);
        store.setCity(row.city);
        store.setDistrict(row.district);
        store.setAddress(row.address);
        store.setPhone(row.phone);
        return store;
    }

    private StoreStatus parseStoreStatus(String status) {
        if (status == null) return StoreStatus.ACTIVE;
        try {
            return StoreStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return StoreStatus.ACTIVE;
        }
    }

    /**
     * 更新门店地址信息
     *
     * @param storeId  门店ID
     * @param province 省份
     * @param city     城市
     * @param district 区县
     * @param address  详细地址
     * @param phone    联系电话
     * @return 更新后的门店信息，如果门店不存在返回 Optional.empty()
     * @since 020-store-address
     */
    public Optional<Store> updateAddress(UUID storeId, String province, String city,
                                         String district, String address, String phone) {
        // 构建更新请求体
        Map<String, Object> updateBody = new HashMap<>();
        updateBody.put("province", province);
        updateBody.put("city", city);
        updateBody.put("district", district);
        updateBody.put("address", address);
        updateBody.put("phone", phone);

        try {
            // 使用 Supabase PATCH 请求更新，需要返回更新后的数据
            List<SupabaseStoreRow> rows = webClient.patch()
                    .uri("/stores?id=eq." + storeId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Prefer", "return=representation")
                    .bodyValue(updateBody)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<SupabaseStoreRow>>() {})
                    .block(supabaseConfig.getTimeoutDuration());

            if (rows == null || rows.isEmpty()) {
                return Optional.empty();
            }
            return Optional.of(toDomain(rows.get(0)));
        } catch (WebClientResponseException.NotFound e) {
            return Optional.empty();
        }
    }

    // ========== 022-store-crud: CRUD 方法 ==========

    /**
     * 根据名称查找门店（不区分大小写）
     * @since 022-store-crud
     */
    public Optional<Store> findByNameIgnoreCase(String name) {
        if (name == null || name.isBlank()) {
            return Optional.empty();
        }
        try {
            // 使用 Supabase ilike 进行不区分大小写查询
            List<SupabaseStoreRow> rows = webClient.get()
                    .uri("/stores?name=ilike." + name.trim())
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<SupabaseStoreRow>>() {})
                    .block(supabaseConfig.getTimeoutDuration());

            if (rows == null || rows.isEmpty()) {
                return Optional.empty();
            }
            return Optional.of(toDomain(rows.get(0)));
        } catch (WebClientResponseException.NotFound e) {
            return Optional.empty();
        }
    }

    /**
     * 检查名称是否存在（排除指定ID，用于更新时检查）
     * @since 022-store-crud
     */
    public boolean existsByNameIgnoreCaseAndIdNot(String name, UUID excludeId) {
        if (name == null || name.isBlank()) {
            return false;
        }
        try {
            List<SupabaseStoreRow> rows = webClient.get()
                    .uri("/stores?name=ilike." + name.trim() + "&id=neq." + excludeId)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<SupabaseStoreRow>>() {})
                    .block(supabaseConfig.getTimeoutDuration());

            return rows != null && !rows.isEmpty();
        } catch (WebClientResponseException.NotFound e) {
            return false;
        }
    }

    /**
     * 创建新门店
     * @since 022-store-crud
     */
    public Store save(Store store) {
        Map<String, Object> body = new HashMap<>();
        if (store.getId() != null) {
            body.put("id", store.getId().toString());
        }
        body.put("code", store.getCode());
        body.put("name", store.getName());
        // 注意: stores 表没有 region 字段，跳过
        body.put("status", store.getStatus() != null ? store.getStatus().getValue() : "active");
        body.put("version", store.getVersion() != null ? store.getVersion() : 0L);
        putIfNotBlank(body, "province", store.getProvince());
        putIfNotBlank(body, "city", store.getCity());
        putIfNotBlank(body, "district", store.getDistrict());
        putIfNotBlank(body, "address", store.getAddress());
        putIfNotBlank(body, "phone", store.getPhone());
        if (store.getCreatedBy() != null) {
            body.put("created_by", store.getCreatedBy().toString());
        }
        if (store.getUpdatedBy() != null) {
            body.put("updated_by", store.getUpdatedBy().toString());
        }

        List<SupabaseStoreRow> rows = webClient.post()
                .uri("/stores")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Prefer", "return=representation")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<SupabaseStoreRow>>() {})
                .block(supabaseConfig.getTimeoutDuration());

        if (rows == null || rows.isEmpty()) {
            throw new RuntimeException("Failed to save store");
        }
        return toDomain(rows.get(0));
    }

    /**
     * 只在值非空时添加到 body
     */
    private void putIfNotBlank(Map<String, Object> body, String key, String value) {
        if (value != null && !value.isBlank()) {
            body.put(key, value);
        }
    }

    /**
     * 更新门店
     * @since 022-store-crud
     */
    public Optional<Store> update(Store store) {
        if (store.getId() == null) {
            throw new IllegalArgumentException("Store ID is required for update");
        }

        Map<String, Object> body = new HashMap<>();
        if (store.getName() != null) body.put("name", store.getName());
        // 注意: stores 表没有 region 字段
        if (store.getStatus() != null) body.put("status", store.getStatus().getValue());
        if (store.getVersion() != null) body.put("version", store.getVersion() + 1);
        if (store.getProvince() != null) body.put("province", store.getProvince());
        if (store.getCity() != null) body.put("city", store.getCity());
        if (store.getDistrict() != null) body.put("district", store.getDistrict());
        if (store.getAddress() != null) body.put("address", store.getAddress());
        if (store.getPhone() != null) body.put("phone", store.getPhone());
        if (store.getUpdatedBy() != null) body.put("updated_by", store.getUpdatedBy().toString());

        try {
            List<SupabaseStoreRow> rows = webClient.patch()
                    .uri("/stores?id=eq." + store.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Prefer", "return=representation")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<SupabaseStoreRow>>() {})
                    .block(supabaseConfig.getTimeoutDuration());

            if (rows == null || rows.isEmpty()) {
                return Optional.empty();
            }
            return Optional.of(toDomain(rows.get(0)));
        } catch (WebClientResponseException.NotFound e) {
            return Optional.empty();
        }
    }

    /**
     * 删除门店
     * @since 022-store-crud
     */
    public boolean deleteById(UUID storeId) {
        try {
            webClient.delete()
                    .uri("/stores?id=eq." + storeId)
                    .retrieve()
                    .toBodilessEntity()
                    .block(supabaseConfig.getTimeoutDuration());
            return true;
        } catch (WebClientResponseException.NotFound e) {
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 统计门店关联的影厅数量
     * @since 022-store-crud
     */
    public long countHallsByStoreId(UUID storeId) {
        try {
            List<Map<String, Object>> rows = webClient.get()
                    .uri("/halls?store_id=eq." + storeId + "&select=id")
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                    .block(supabaseConfig.getTimeoutDuration());
            return rows == null ? 0 : rows.size();
        } catch (Exception e) {
            return 0;
        }
    }
}
