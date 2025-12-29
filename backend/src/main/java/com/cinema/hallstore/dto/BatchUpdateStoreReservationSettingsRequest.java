package com.cinema.hallstore.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

/**
 * BatchUpdateStoreReservationSettingsRequest - 批量更新门店预约设置请求
 *
 * <p>用于 PUT /api/stores/reservation-settings/batch 端点</p>
 */
public class BatchUpdateStoreReservationSettingsRequest {

    @NotEmpty(message = "门店ID列表不能为空")
    private List<UUID> storeIds;

    @Valid
    @NotNull(message = "预约设置不能为空")
    private UpdateStoreReservationSettingsRequest settings;

    public List<UUID> getStoreIds() {
        return storeIds;
    }

    public void setStoreIds(List<UUID> storeIds) {
        this.storeIds = storeIds;
    }

    public UpdateStoreReservationSettingsRequest getSettings() {
        return settings;
    }

    public void setSettings(UpdateStoreReservationSettingsRequest settings) {
        this.settings = settings;
    }
}

