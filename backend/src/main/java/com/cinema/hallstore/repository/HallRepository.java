package com.cinema.hallstore.repository;

import com.cinema.hallstore.config.SupabaseConfig;
import com.cinema.hallstore.domain.Hall;
import com.cinema.hallstore.domain.enums.HallStatus;
import com.cinema.hallstore.domain.enums.HallType;
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
 * HallRepository:
 * - 通过 Supabase REST API 实现影厅数据的 CRUD 操作
 * - 使用 WebClient 进行 HTTP 调用
 */
@Repository
public class HallRepository {

    private final WebClient webClient;
    private final SupabaseConfig supabaseConfig;

    public HallRepository(WebClient supabaseWebClient, SupabaseConfig supabaseConfig) {
        this.webClient = supabaseWebClient;
        this.supabaseConfig = supabaseConfig;
    }

    /**
     * 按门店查询影厅列表，支持状态和类型筛选
     */
    public List<Hall> findByStoreId(UUID storeId, HallStatus status, HallType type) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString("/halls")
                .queryParam("store_id", "eq." + storeId)
                .queryParam("order", "created_at.desc");

        if (status != null) {
            builder.queryParam("status", "eq." + status.name().toLowerCase());
        }
        if (type != null) {
            builder.queryParam("type", "eq." + type.name());
        }

        List<SupabaseHallRow> rows = webClient.get()
                .uri(builder.build().toUriString())
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<SupabaseHallRow>>() {})
                .block(supabaseConfig.getTimeoutDuration());

        return rows == null ? List.of() : rows.stream().map(this::toDomain).toList();
    }

    /**
     * 根据影厅 ID 查询单个影厅
     */
    public Optional<Hall> findById(UUID hallId) {
        try {
            List<SupabaseHallRow> rows = webClient.get()
                    .uri("/halls?id=eq." + hallId)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<SupabaseHallRow>>() {})
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
     * 创建影厅
     */
    public Hall create(Hall hall) {
        SupabaseHallInsert insertData = toInsert(hall);

        List<SupabaseHallRow> rows = webClient.post()
                .uri("/halls")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(insertData)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<SupabaseHallRow>>() {})
                .block(supabaseConfig.getTimeoutDuration());

        if (rows == null || rows.isEmpty()) {
            throw new RuntimeException("Failed to create hall: no response from Supabase");
        }
        return toDomain(rows.get(0));
    }

    /**
     * 更新影厅
     */
    public Hall update(UUID hallId, Hall hall) {
        SupabaseHallUpdate updateData = toUpdate(hall);

        List<SupabaseHallRow> rows = webClient.patch()
                .uri("/halls?id=eq." + hallId)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(updateData)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<SupabaseHallRow>>() {})
                .block(supabaseConfig.getTimeoutDuration());

        if (rows == null || rows.isEmpty()) {
            throw new RuntimeException("Failed to update hall: no response from Supabase");
        }
        return toDomain(rows.get(0));
    }

    /**
     * 检查门店下是否存在指定编码的影厅（用于唯一性校验）
     */
    public boolean existsByStoreIdAndCode(UUID storeId, String code, UUID excludeHallId) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString("/halls")
                .queryParam("store_id", "eq." + storeId)
                .queryParam("code", "eq." + code)
                .queryParam("select", "id");

        if (excludeHallId != null) {
            builder.queryParam("id", "neq." + excludeHallId);
        }

        List<SupabaseHallRow> rows = webClient.get()
                .uri(builder.build().toUriString())
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<SupabaseHallRow>>() {})
                .block(supabaseConfig.getTimeoutDuration());

        return rows != null && !rows.isEmpty();
    }

    // ========== Internal DTOs for Supabase ==========

    /**
     * Supabase 表行结构（snake_case）
     */
    private static class SupabaseHallRow {
        @JsonProperty("id")
        public UUID id;

        @JsonProperty("store_id")
        public UUID storeId;

        @JsonProperty("code")
        public String code;

        @JsonProperty("name")
        public String name;

        @JsonProperty("type")
        public String type;

        @JsonProperty("capacity")
        public int capacity;

        @JsonProperty("tags")
        public List<String> tags;

        @JsonProperty("status")
        public String status;

        @JsonProperty("created_at")
        public Instant createdAt;

        @JsonProperty("updated_at")
        public Instant updatedAt;
    }

    /**
     * 创建影厅时的请求结构
     */
    private static class SupabaseHallInsert {
        @JsonProperty("store_id")
        public UUID storeId;

        @JsonProperty("code")
        public String code;

        @JsonProperty("name")
        public String name;

        @JsonProperty("type")
        public String type;

        @JsonProperty("capacity")
        public int capacity;

        @JsonProperty("tags")
        public List<String> tags;

        @JsonProperty("status")
        public String status;
    }

    /**
     * 更新影厅时的请求结构
     */
    private static class SupabaseHallUpdate {
        @JsonProperty("code")
        public String code;

        @JsonProperty("name")
        public String name;

        @JsonProperty("type")
        public String type;

        @JsonProperty("capacity")
        public Integer capacity;

        @JsonProperty("tags")
        public List<String> tags;

        @JsonProperty("status")
        public String status;
    }

    // ========== Mapping Methods ==========

    private Hall toDomain(SupabaseHallRow row) {
        Hall hall = new Hall();
        hall.setId(row.id);
        hall.setStoreId(row.storeId);
        hall.setCode(row.code);
        hall.setName(row.name);
        hall.setType(parseHallType(row.type));
        hall.setCapacity(row.capacity);
        hall.setTags(row.tags);
        hall.setStatus(parseHallStatus(row.status));
        hall.setCreatedAt(row.createdAt);
        hall.setUpdatedAt(row.updatedAt);
        return hall;
    }

    private SupabaseHallInsert toInsert(Hall hall) {
        SupabaseHallInsert insert = new SupabaseHallInsert();
        insert.storeId = hall.getStoreId();
        insert.code = hall.getCode();
        insert.name = hall.getName();
        insert.type = hall.getType() != null ? hall.getType().name() : null;
        insert.capacity = hall.getCapacity();
        insert.tags = hall.getTags();
        insert.status = hall.getStatus() != null ? hall.getStatus().name().toLowerCase() : "active";
        return insert;
    }

    private SupabaseHallUpdate toUpdate(Hall hall) {
        SupabaseHallUpdate update = new SupabaseHallUpdate();
        update.code = hall.getCode();
        update.name = hall.getName();
        update.type = hall.getType() != null ? hall.getType().name() : null;
        update.capacity = hall.getCapacity() > 0 ? hall.getCapacity() : null;
        update.tags = hall.getTags();
        update.status = hall.getStatus() != null ? hall.getStatus().name().toLowerCase() : null;
        return update;
    }

    private HallType parseHallType(String type) {
        if (type == null) return null;
        try {
            return HallType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private HallStatus parseHallStatus(String status) {
        if (status == null) return null;
        try {
            return HallStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return HallStatus.ACTIVE;
        }
    }
}
