package com.cinema.hallstore.repository;

import com.cinema.hallstore.config.SupabaseConfig;
import com.cinema.hallstore.domain.ActivityType;
import com.cinema.hallstore.domain.enums.ActivityTypeStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Repository;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * ActivityTypeRepository:
 * - 通过 Supabase REST API 实现活动类型数据的查询和更新操作
 * - 使用 WebClient 进行 HTTP 调用
 */
@Repository
public class ActivityTypeRepository {

    private static final Logger logger = LoggerFactory.getLogger(ActivityTypeRepository.class);

    private final WebClient webClient;
    private final SupabaseConfig supabaseConfig;

    public ActivityTypeRepository(WebClient supabaseWebClient, SupabaseConfig supabaseConfig) {
        this.webClient = supabaseWebClient;
        this.supabaseConfig = supabaseConfig;
    }

    /**
     * 查询所有活动类型（运营后台使用，排除已删除状态）
     * 
     * @param status 可选的状态过滤（ENABLED/DISABLED），null 表示返回所有非删除状态
     * @return 活动类型列表，按 sort ASC, created_at ASC 排序
     */
    public List<ActivityType> findAll(ActivityTypeStatus status) {
        try {
            // 构建查询 URI：排除 DELETED 状态，可选的状态过滤，按 sort 和 created_at 排序
            StringBuilder uriBuilder = new StringBuilder("/activity_types?status=neq.DELETED");
            if (status != null && status != ActivityTypeStatus.DELETED) {
                uriBuilder.append("&status=eq.").append(status.getValue());
            }
            uriBuilder.append("&order=sort.asc,created_at.asc");

            List<SupabaseRow> rows = webClient.get()
                    .uri(uriBuilder.toString())
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<SupabaseRow>>() {})
                    .block(supabaseConfig.getTimeoutDuration());

            return rows == null ? List.of() : rows.stream().map(this::toDomain).toList();
        } catch (WebClientResponseException e) {
            logger.error("Error fetching activity types. Status: {}, Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to fetch activity types: " + e.getResponseBodyAsString(), e);
        }
    }

    /**
     * 查询所有启用状态的活动类型（小程序端使用）
     * 
     * @return 启用状态的活动类型列表，按 sort ASC, created_at ASC 排序
     */
    public List<ActivityType> findEnabled() {
        return findAll(ActivityTypeStatus.ENABLED);
    }

    /**
     * 根据ID查询单个活动类型
     */
    public Optional<ActivityType> findById(UUID id) {
        try {
            List<SupabaseRow> rows = webClient.get()
                    .uri("/activity_types?id=eq." + id)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<SupabaseRow>>() {})
                    .block(supabaseConfig.getTimeoutDuration());

            if (rows == null || rows.isEmpty()) {
                return Optional.empty();
            }
            return Optional.of(toDomain(rows.get(0)));
        } catch (WebClientResponseException.NotFound e) {
            return Optional.empty();
        } catch (WebClientResponseException e) {
            logger.error("Error fetching activity type by id: {}. Status: {}, Body: {}", id, e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to fetch activity type: " + e.getResponseBodyAsString(), e);
        }
    }

    /**
     * 检查名称是否已存在（排除已删除状态和当前记录）
     * 
     * @param name 活动类型名称
     * @param excludeId 要排除的记录ID（用于更新时检查）
     * @return 如果名称已存在返回 true
     */
    public boolean existsByName(String name, UUID excludeId) {
        try {
            StringBuilder uriBuilder = new StringBuilder("/activity_types?name=eq." + name + "&status=neq.DELETED");
            if (excludeId != null) {
                uriBuilder.append("&id=neq.").append(excludeId);
            }

            List<SupabaseRow> rows = webClient.get()
                    .uri(uriBuilder.toString())
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<SupabaseRow>>() {})
                    .block(supabaseConfig.getTimeoutDuration());

            return rows != null && !rows.isEmpty();
        } catch (WebClientResponseException e) {
            logger.error("Error checking name uniqueness: {}. Status: {}, Body: {}", name, e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to check name uniqueness: " + e.getResponseBodyAsString(), e);
        }
    }

    /**
     * 保存或更新活动类型
     */
    public ActivityType save(ActivityType activityType) {
        if (activityType.getId() == null) {
            // 插入新记录 - 只发送必需字段，让数据库自动生成 id, created_at, updated_at
            SupabaseRow row = new SupabaseRow();
            row.name = activityType.getName();
            row.description = activityType.getDescription();
            row.businessCategory = activityType.getBusinessCategory();
            row.backgroundImageUrl = activityType.getBackgroundImageUrl();
            row.status = activityType.getStatus() != null ? activityType.getStatus() : ActivityTypeStatus.ENABLED;
            row.sort = activityType.getSort() != null ? activityType.getSort() : 0;
            row.createdBy = activityType.getCreatedBy();
            // 不设置 id, createdAt, updatedAt - 由数据库自动生成

            try {
                // Supabase REST API 对于 INSERT 默认返回「数组形式」的 inserted rows，
                // 因此这里按 List<SupabaseRow> 解析并取第一条。
                List<SupabaseRow> createdList = webClient.post()
                        .uri("/activity_types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)
                        .bodyValue(row)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<List<SupabaseRow>>() {})
                        .doOnError(WebClientResponseException.class, e -> {
                            logger.error("Supabase POST error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
                        })
                        .block(supabaseConfig.getTimeoutDuration());

                if (createdList == null || createdList.isEmpty()) {
                    throw new RuntimeException("Failed to create activity type: empty response from Supabase");
                }

                return toDomain(createdList.get(0));
            } catch (WebClientResponseException.BadRequest e) {
                String errorBody = e.getResponseBodyAsString();
                logger.error("Failed to create activity type. Status: {}, Body: {}", e.getStatusCode(), errorBody);
                throw new RuntimeException("Failed to create activity type: " + errorBody, e);
            }
        } else {
            // 更新现有记录 - 只发送可更新的字段
            // 不发送：id（通过 URI 参数指定）、created_at（不应更新）、updated_at（由触发器自动更新）
            SupabaseRow row = new SupabaseRow();
            row.name = activityType.getName();
            row.description = activityType.getDescription();
            row.businessCategory = activityType.getBusinessCategory();
            row.backgroundImageUrl = activityType.getBackgroundImageUrl();
            row.sort = activityType.getSort();
            row.updatedBy = activityType.getUpdatedBy();
            // 不设置 id, status, createdAt, updatedAt

            try {
                List<SupabaseRow> updatedList = webClient.patch()
                        .uri("/activity_types?id=eq." + activityType.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)
                        .bodyValue(row)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<List<SupabaseRow>>() {})
                        .doOnError(WebClientResponseException.class, e -> {
                            logger.error("Supabase PATCH error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
                        })
                        .block(supabaseConfig.getTimeoutDuration());

                if (updatedList == null || updatedList.isEmpty()) {
                    throw new RuntimeException("No activity type found with id: " + activityType.getId());
                }

                return toDomain(updatedList.get(0));
            } catch (WebClientResponseException.BadRequest e) {
                String errorBody = e.getResponseBodyAsString();
                logger.error("Failed to update activity type. Status: {}, Body: {}", e.getStatusCode(), errorBody);
                throw new RuntimeException("Failed to update activity type: " + errorBody, e);
            }
        }
    }

    /**
     * 更新活动类型状态（启用/停用/删除）
     */
    public ActivityType updateStatus(UUID id, ActivityTypeStatus status, String updatedBy) {
        SupabaseRow row = new SupabaseRow();
        row.status = status;
        row.updatedBy = updatedBy;
        // 如果状态为 DELETED，记录 deleted_at
        if (status == ActivityTypeStatus.DELETED) {
            row.deletedAt = Instant.now();
        } else {
            row.deletedAt = null; // Clear deleted_at if status is not DELETED
        }

        try {
            List<SupabaseRow> updatedList = webClient.patch()
                    .uri("/activity_types?id=eq." + id)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .bodyValue(row)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<SupabaseRow>>() {})
                    .doOnError(WebClientResponseException.class, e -> {
                        logger.error("Supabase PATCH status error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
                    })
                    .block(supabaseConfig.getTimeoutDuration());

            if (updatedList == null || updatedList.isEmpty()) {
                throw new RuntimeException("No activity type found with id: " + id);
            }

            return toDomain(updatedList.get(0));
        } catch (WebClientResponseException.BadRequest e) {
            String errorBody = e.getResponseBodyAsString();
            logger.error("Failed to update activity type status. Status: {}, Body: {}", e.getStatusCode(), errorBody);
            throw new RuntimeException("Failed to update activity type status: " + errorBody, e);
        }
    }

    /**
     * 软删除活动类型（将状态设置为 DELETED）
     */
    public ActivityType delete(UUID id) {
        return updateStatus(id, ActivityTypeStatus.DELETED, null);
    }

    // ========== Internal DTOs for Supabase ==========

    /**
     * Supabase 表行结构（snake_case）
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private static class SupabaseRow {
        @JsonProperty("id")
        public UUID id;

        @JsonProperty("name")
        public String name;

        @JsonProperty("description")
        public String description;

        @JsonProperty("business_category")
        public String businessCategory;

        @JsonProperty("background_image_url")
        public String backgroundImageUrl;

        @JsonProperty("status")
        public ActivityTypeStatus status;

        @JsonProperty("sort")
        public Integer sort;

        @JsonProperty("created_at")
        public Instant createdAt;

        @JsonProperty("updated_at")
        public Instant updatedAt;

        @JsonProperty("deleted_at")
        public Instant deletedAt;

        @JsonProperty("created_by")
        public String createdBy;

        @JsonProperty("updated_by")
        public String updatedBy;
    }

    // ========== Mapping Methods ==========

    private ActivityType toDomain(SupabaseRow row) {
        ActivityType activityType = new ActivityType();
        activityType.setId(row.id);
        activityType.setName(row.name);
        activityType.setDescription(row.description);
        activityType.setBusinessCategory(row.businessCategory);
        activityType.setBackgroundImageUrl(row.backgroundImageUrl);
        activityType.setStatus(row.status);
        activityType.setSort(row.sort);
        activityType.setCreatedAt(row.createdAt);
        activityType.setUpdatedAt(row.updatedAt);
        activityType.setDeletedAt(row.deletedAt);
        activityType.setCreatedBy(row.createdBy);
        activityType.setUpdatedBy(row.updatedBy);
        return activityType;
    }
}

