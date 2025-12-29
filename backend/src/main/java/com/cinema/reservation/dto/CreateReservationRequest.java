package com.cinema.reservation.dto;

import jakarta.validation.constraints.*;
import java.util.List;
import java.util.UUID;

/**
 * 创建预约单请求 DTO (C端)
 * <p>
 * 用于 C 端用户创建预约单时提交的请求数据。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
public class CreateReservationRequest {

    /**
     * 场景包ID
     */
    @NotNull(message = "场景包ID不能为空")
    private UUID scenarioPackageId;

    /**
     * 套餐ID
     */
    @NotNull(message = "套餐ID不能为空")
    private UUID packageTierId;

    /**
     * 时段模板ID
     */
    @NotNull(message = "时段模板ID不能为空")
    private UUID timeSlotTemplateId;

    /**
     * 预订日期 (格式: yyyy-MM-dd)
     */
    @NotBlank(message = "预订日期不能为空")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "日期格式不正确，应为 yyyy-MM-dd")
    private String reservationDate;

    /**
     * 联系人姓名
     */
    @NotBlank(message = "联系人姓名不能为空")
    @Size(max = 100, message = "联系人姓名不能超过100个字符")
    private String contactName;

    /**
     * 联系人手机号
     */
    @NotBlank(message = "联系人手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String contactPhone;

    /**
     * 备注 (可选)
     */
    @Size(max = 200, message = "备注不能超过200个字符")
    private String remark;

    /**
     * 加购项列表
     */
    private List<AddonItemRequest> addonItems;

    // Getters and Setters

    public UUID getScenarioPackageId() {
        return scenarioPackageId;
    }

    public void setScenarioPackageId(UUID scenarioPackageId) {
        this.scenarioPackageId = scenarioPackageId;
    }

    public UUID getPackageTierId() {
        return packageTierId;
    }

    public void setPackageTierId(UUID packageTierId) {
        this.packageTierId = packageTierId;
    }

    public UUID getTimeSlotTemplateId() {
        return timeSlotTemplateId;
    }

    public void setTimeSlotTemplateId(UUID timeSlotTemplateId) {
        this.timeSlotTemplateId = timeSlotTemplateId;
    }

    public String getReservationDate() {
        return reservationDate;
    }

    public void setReservationDate(String reservationDate) {
        this.reservationDate = reservationDate;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public List<AddonItemRequest> getAddonItems() {
        return addonItems;
    }

    public void setAddonItems(List<AddonItemRequest> addonItems) {
        this.addonItems = addonItems;
    }

    /**
     * 加购项请求
     */
    public static class AddonItemRequest {

        /**
         * 加购项ID
         */
        @NotNull(message = "加购项ID不能为空")
        private UUID addonItemId;

        /**
         * 数量
         */
        @NotNull(message = "数量不能为空")
        @Min(value = 1, message = "数量至少为1")
        private Integer quantity;

        public UUID getAddonItemId() {
            return addonItemId;
        }

        public void setAddonItemId(UUID addonItemId) {
            this.addonItemId = addonItemId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}
