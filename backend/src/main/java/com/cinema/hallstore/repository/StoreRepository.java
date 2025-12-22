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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * StoreRepository:
 * - 通过 Supabase REST API 实现门店数据的查询操作
 * - 使用 WebClient 进行 HTTP 调用
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

        @JsonProperty("created_at")
        public Instant createdAt;

        @JsonProperty("updated_at")
        public Instant updatedAt;

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
        store.setCreatedAt(row.createdAt);
        store.setUpdatedAt(row.updatedAt);
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
}
