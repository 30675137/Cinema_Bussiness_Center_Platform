package com.cinema.inventory.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.inventory.domain.InventoryAdjustment;
import com.cinema.inventory.repository.AdjustmentRepository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * 审批服务
 * 提供库存调整审批相关的业务逻辑。
 * 
 * P004-inventory-adjustment
 * 实现 T051 任务。
 * 
 * @since US4 - 大额库存调整审批
 */
@Service
public class ApprovalService {

    private static final Logger logger = LoggerFactory.getLogger(ApprovalService.class);

    /**
     * 审批阈值（元）
     */
    private static final BigDecimal APPROVAL_THRESHOLD = new BigDecimal("1000");

    private final AdjustmentRepository adjustmentRepository;

    @Autowired
    public ApprovalService(AdjustmentRepository adjustmentRepository) {
        this.adjustmentRepository = adjustmentRepository;
    }

    /**
     * 审批通过
     * 
     * @param adjustmentId 调整记录ID
     * @param approverId 审批人ID
     * @param approverName 审批人姓名
     * @param comments 审批意见
     * @return 审批结果
     */
    @Transactional
    public ApprovalResult approve(
            UUID adjustmentId,
            UUID approverId,
            String approverName,
            String comments) {

        logger.info("审批通过 - adjustmentId={}, approver={}", adjustmentId, approverName);

        // 1. 查询调整记录
        Optional<InventoryAdjustment> optionalAdjustment = adjustmentRepository.findById(adjustmentId);
        if (optionalAdjustment.isEmpty()) {
            logger.warn("审批失败 - 调整记录不存在: {}", adjustmentId);
            return ApprovalResult.failure(adjustmentId, "调整记录不存在");
        }

        InventoryAdjustment adjustment = optionalAdjustment.get();

        // 2. 验证状态是否为 pending_approval
        if (!adjustment.canApprove()) {
            logger.warn("审批失败 - 状态不允许审批: {}, 当前状态: {}", adjustmentId, adjustment.getStatus());
            return ApprovalResult.failure(adjustmentId, "当前状态不允许审批，当前状态: " + adjustment.getStatus());
        }

        // 3. 更新状态为 approved
        adjustment.setStatus("approved");
        adjustment.setApprovedAt(OffsetDateTime.now());
        adjustment.setApprovedBy(approverId);

        // 4. 保存更新
        adjustmentRepository.save(adjustment);

        logger.info("审批通过成功 - adjustmentId={}, 新状态=approved", adjustmentId);

        // TODO: 5. 执行库存更新（更新 store_inventory 表）
        // TODO: 6. 生成流水记录（inventory_transactions 表）

        return ApprovalResult.success(
                adjustmentId,
                "approved",
                "审批通过成功"
        );
    }

    /**
     * 审批拒绝
     * 
     * @param adjustmentId 调整记录ID
     * @param approverId 审批人ID
     * @param approverName 审批人姓名
     * @param comments 拒绝原因
     * @return 审批结果
     */
    @Transactional
    public ApprovalResult reject(
            UUID adjustmentId,
            UUID approverId,
            String approverName,
            String comments) {

        logger.info("审批拒绝 - adjustmentId={}, approver={}, reason={}", 
                adjustmentId, approverName, comments);

        // 1. 查询调整记录
        Optional<InventoryAdjustment> optionalAdjustment = adjustmentRepository.findById(adjustmentId);
        if (optionalAdjustment.isEmpty()) {
            logger.warn("拒绝失败 - 调整记录不存在: {}", adjustmentId);
            return ApprovalResult.failure(adjustmentId, "调整记录不存在");
        }

        InventoryAdjustment adjustment = optionalAdjustment.get();

        // 2. 验证状态是否为 pending_approval
        if (!adjustment.canApprove()) {
            logger.warn("拒绝失败 - 状态不允许审批: {}, 当前状态: {}", adjustmentId, adjustment.getStatus());
            return ApprovalResult.failure(adjustmentId, "当前状态不允许审批，当前状态: " + adjustment.getStatus());
        }

        // 3. 更新状态为 rejected
        adjustment.setStatus("rejected");
        adjustment.setApprovedAt(OffsetDateTime.now());
        adjustment.setApprovedBy(approverId);
        // 如果需要保存拒绝原因，可以添加到 remarks 或者专门的字段
        if (comments != null && !comments.isEmpty()) {
            String existingRemarks = adjustment.getRemarks();
            String rejectReason = "【拒绝原因】" + comments;
            adjustment.setRemarks(existingRemarks != null ? existingRemarks + " " + rejectReason : rejectReason);
        }

        // 4. 保存更新
        adjustmentRepository.save(adjustment);

        logger.info("审批拒绝成功 - adjustmentId={}, 新状态=rejected", adjustmentId);

        return ApprovalResult.success(
                adjustmentId,
                "rejected",
                "审批拒绝成功"
        );
    }

    /**
     * 撤回调整申请
     * 
     * @param adjustmentId 调整记录ID
     * @param operatorId 操作人ID（必须是申请人）
     * @return 撤回结果
     */
    @Transactional
    public ApprovalResult withdraw(
            UUID adjustmentId,
            UUID operatorId) {

        logger.info("撤回调整 - adjustmentId={}, operator={}", adjustmentId, operatorId);

        // 1. 查询调整记录
        Optional<InventoryAdjustment> optionalAdjustment = adjustmentRepository.findById(adjustmentId);
        if (optionalAdjustment.isEmpty()) {
            logger.warn("撤回失败 - 调整记录不存在: {}", adjustmentId);
            return ApprovalResult.failure(adjustmentId, "调整记录不存在");
        }

        InventoryAdjustment adjustment = optionalAdjustment.get();

        // 2. 验证操作人是否为申请人
        if (!adjustment.getOperatorId().equals(operatorId)) {
            logger.warn("撤回失败 - 操作人不是申请人: adjustmentId={}, operatorId={}, originalOperatorId={}", 
                    adjustmentId, operatorId, adjustment.getOperatorId());
            return ApprovalResult.failure(adjustmentId, "只有申请人才能撤回");
        }

        // 3. 验证状态是否为 pending_approval
        if (!adjustment.canWithdraw()) {
            logger.warn("撤回失败 - 状态不允许撤回: {}, 当前状态: {}", adjustmentId, adjustment.getStatus());
            return ApprovalResult.failure(adjustmentId, "当前状态不允许撤回，当前状态: " + adjustment.getStatus());
        }

        // 4. 更新状态为 withdrawn
        adjustment.setStatus("withdrawn");

        // 5. 保存更新
        adjustmentRepository.save(adjustment);

        logger.info("撤回成功 - adjustmentId={}, 新状态=withdrawn", adjustmentId);

        return ApprovalResult.success(
                adjustmentId,
                "withdrawn",
                "撤回成功"
        );
    }

    /**
     * 判断是否需要审批
     * 
     * @param adjustmentAmount 调整金额
     * @return 是否需要审批
     */
    public boolean requiresApproval(BigDecimal adjustmentAmount) {
        return adjustmentAmount.abs().compareTo(APPROVAL_THRESHOLD) >= 0;
    }

    /**
     * 审批结果
     */
    public static class ApprovalResult {
        private final boolean success;
        private final UUID adjustmentId;
        private final String newStatus;
        private final String message;
        private final String error;

        private ApprovalResult(boolean success, UUID adjustmentId, String newStatus, 
                               String message, String error) {
            this.success = success;
            this.adjustmentId = adjustmentId;
            this.newStatus = newStatus;
            this.message = message;
            this.error = error;
        }

        public static ApprovalResult success(UUID adjustmentId, String newStatus, String message) {
            return new ApprovalResult(true, adjustmentId, newStatus, message, null);
        }

        public static ApprovalResult failure(UUID adjustmentId, String error) {
            return new ApprovalResult(false, adjustmentId, null, null, error);
        }

        // Getters
        public boolean isSuccess() { return success; }
        public UUID getAdjustmentId() { return adjustmentId; }
        public String getNewStatus() { return newStatus; }
        public String getMessage() { return message; }
        public String getError() { return error; }
    }
}
