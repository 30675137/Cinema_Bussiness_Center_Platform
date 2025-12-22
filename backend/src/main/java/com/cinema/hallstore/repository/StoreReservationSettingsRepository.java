package com.cinema.hallstore.repository;

import com.cinema.hallstore.config.SupabaseConfig;
import com.cinema.hallstore.domain.StoreReservationSettings;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Repository;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * StoreReservationSettingsRepository:
 * - 通过 Supabase REST API 实现门店预约设置数据的查询和更新操作
 * - 使用 WebClient 进行 HTTP 调用
 * 
 * @since 015-store-reservation-settings
 * @updated 016-store-reservation-settings 添加时间段、提前量、时长单位、押金字段
 */
@Repository
public class StoreReservationSettingsRepository {

    private static final Logger logger = LoggerFactory.getLogger(StoreReservationSettingsRepository.class);

    private final WebClient webClient;
    private final SupabaseConfig supabaseConfig;

    public StoreReservationSettingsRepository(WebClient supabaseWebClient, SupabaseConfig supabaseConfig) {
        this.webClient = supabaseWebClient;
        this.supabaseConfig = supabaseConfig;
    }

    /**
     * 根据门店ID查询预约设置
     */
    public Optional<StoreReservationSettings> findByStoreId(UUID storeId) {
        try {
            List<SupabaseRow> rows = webClient.get()
                    .uri("/store_reservation_settings?store_id=eq." + storeId)
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
        }
    }

    /**
     * 根据多个门店ID查询预约设置列表
     */
    public List<StoreReservationSettings> findByStoreIdIn(List<UUID> storeIds) {
        if (storeIds == null || storeIds.isEmpty()) {
            return List.of();
        }

        // 构建 Supabase 查询：store_id=in.(uuid1,uuid2,...)
        String storeIdsParam = String.join(",", storeIds.stream().map(UUID::toString).toList());
        String uri = "/store_reservation_settings?store_id=in.(" + storeIdsParam + ")";

        List<SupabaseRow> rows = webClient.get()
                .uri(uri)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<SupabaseRow>>() {})
                .block(supabaseConfig.getTimeoutDuration());

        return rows == null ? List.of() : rows.stream().map(this::toDomain).toList();
    }

    /**
     * 保存或更新预约设置
     */
    public StoreReservationSettings save(StoreReservationSettings settings) {
        if (settings.getId() == null) {
            // 插入新记录 - 只发送必需字段，让数据库自动生成 id, created_at, updated_at
            SupabaseRow row = toSupabaseRowForInsert(settings);
            
            try {
                SupabaseRow created = webClient.post()
                        .uri("/store_reservation_settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)
                        .bodyValue(row)
                        .retrieve()
                        .bodyToMono(SupabaseRow.class)
                        .doOnError(WebClientResponseException.class, e -> {
                            logger.error("Supabase POST error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
                        })
                        .block(supabaseConfig.getTimeoutDuration());
                return toDomain(created);
            } catch (WebClientResponseException.BadRequest e) {
                // 记录详细的错误信息以便调试
                String errorBody = e.getResponseBodyAsString();
                logger.error("Failed to create reservation settings. Status: {}, Body: {}", e.getStatusCode(), errorBody);
                throw new RuntimeException("Failed to create reservation settings: " + errorBody, e);
            }
        } else {
            // 更新现有记录 - 只发送可更新的字段
            SupabaseRow row = toSupabaseRowForUpdate(settings);
            
            try {
                List<SupabaseRow> updatedList = webClient.patch()
                        .uri("/store_reservation_settings?id=eq." + settings.getId())
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
                    throw new RuntimeException("No reservation settings found with id: " + settings.getId());
                }
                
                return toDomain(updatedList.get(0));
            } catch (WebClientResponseException.BadRequest e) {
                // 记录详细的错误信息以便调试
                String errorBody = e.getResponseBodyAsString();
                logger.error("Failed to update reservation settings. Status: {}, Body: {}", e.getStatusCode(), errorBody);
                throw new RuntimeException("Failed to update reservation settings: " + errorBody, e);
            }
        }
    }

    // ========== Internal DTOs for Supabase ==========

    /**
     * Supabase 表行结构（snake_case）
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private static class SupabaseRow {
        @JsonProperty("id")
        public UUID id;

        @JsonProperty("store_id")
        public UUID storeId;

        @JsonProperty("is_reservation_enabled")
        public Boolean isReservationEnabled;

        @JsonProperty("max_reservation_days")
        public Integer maxReservationDays;

        @JsonProperty("created_at")
        public Instant createdAt;

        @JsonProperty("updated_at")
        public Instant updatedAt;

        @JsonProperty("updated_by")
        public String updatedBy;

        // 016-store-reservation-settings 新增字段
        @JsonProperty("time_slots")
        public List<TimeSlotRow> timeSlots;

        @JsonProperty("min_advance_hours")
        public Integer minAdvanceHours;

        @JsonProperty("duration_unit")
        public Integer durationUnit;

        @JsonProperty("deposit_required")
        public Boolean depositRequired;

        @JsonProperty("deposit_amount")
        public BigDecimal depositAmount;

        @JsonProperty("deposit_percentage")
        public Integer depositPercentage;

        @JsonProperty("is_active")
        public Boolean isActive;
    }

    /**
     * 时间段 Supabase 结构
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private static class TimeSlotRow {
        @JsonProperty("dayOfWeek")
        public Integer dayOfWeek;

        @JsonProperty("startTime")
        public String startTime;

        @JsonProperty("endTime")
        public String endTime;
    }

    // ========== Mapping Methods ==========

    private StoreReservationSettings toDomain(SupabaseRow row) {
        StoreReservationSettings settings = new StoreReservationSettings();
        settings.setId(row.id);
        settings.setStoreId(row.storeId);
        settings.setIsReservationEnabled(row.isReservationEnabled);
        settings.setMaxReservationDays(row.maxReservationDays);
        settings.setCreatedAt(row.createdAt);
        settings.setUpdatedAt(row.updatedAt);
        settings.setUpdatedBy(row.updatedBy);

        // 016-store-reservation-settings 新增字段
        if (row.timeSlots != null) {
            settings.setTimeSlots(row.timeSlots.stream()
                    .map(ts -> new StoreReservationSettings.TimeSlot(
                            ts.dayOfWeek, ts.startTime, ts.endTime))
                    .collect(Collectors.toList()));
        }
        settings.setMinAdvanceHours(row.minAdvanceHours);
        settings.setDurationUnit(row.durationUnit);
        settings.setDepositRequired(row.depositRequired);
        settings.setDepositAmount(row.depositAmount);
        settings.setDepositPercentage(row.depositPercentage);
        settings.setIsActive(row.isActive);

        return settings;
    }

    private SupabaseRow toSupabaseRowForInsert(StoreReservationSettings settings) {
        SupabaseRow row = new SupabaseRow();
        row.storeId = settings.getStoreId();
        row.isReservationEnabled = settings.getIsReservationEnabled();
        row.maxReservationDays = settings.getMaxReservationDays();
        row.updatedBy = settings.getUpdatedBy();

        // 016-store-reservation-settings 新增字段
        if (settings.getTimeSlots() != null) {
            row.timeSlots = settings.getTimeSlots().stream()
                    .map(ts -> {
                        TimeSlotRow tsr = new TimeSlotRow();
                        tsr.dayOfWeek = ts.getDayOfWeek();
                        tsr.startTime = ts.getStartTime();
                        tsr.endTime = ts.getEndTime();
                        return tsr;
                    })
                    .collect(Collectors.toList());
        }
        row.minAdvanceHours = settings.getMinAdvanceHours();
        row.durationUnit = settings.getDurationUnit();
        row.depositRequired = settings.getDepositRequired();
        row.depositAmount = settings.getDepositAmount();
        row.depositPercentage = settings.getDepositPercentage();
        row.isActive = settings.getIsActive();

        return row;
    }

    private SupabaseRow toSupabaseRowForUpdate(StoreReservationSettings settings) {
        SupabaseRow row = new SupabaseRow();
        row.isReservationEnabled = settings.getIsReservationEnabled();
        row.maxReservationDays = settings.getMaxReservationDays();
        row.updatedBy = settings.getUpdatedBy();

        // 016-store-reservation-settings 新增字段
        if (settings.getTimeSlots() != null) {
            row.timeSlots = settings.getTimeSlots().stream()
                    .map(ts -> {
                        TimeSlotRow tsr = new TimeSlotRow();
                        tsr.dayOfWeek = ts.getDayOfWeek();
                        tsr.startTime = ts.getStartTime();
                        tsr.endTime = ts.getEndTime();
                        return tsr;
                    })
                    .collect(Collectors.toList());
        }
        row.minAdvanceHours = settings.getMinAdvanceHours();
        row.durationUnit = settings.getDurationUnit();
        row.depositRequired = settings.getDepositRequired();
        row.depositAmount = settings.getDepositAmount();
        row.depositPercentage = settings.getDepositPercentage();
        row.isActive = settings.getIsActive();

        return row;
    }
}
