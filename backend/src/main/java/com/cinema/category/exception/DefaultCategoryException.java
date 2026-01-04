package com.cinema.category.exception;

/**
 * @spec O002-miniapp-menu-config
 * 默认分类操作异常
 * 错误码: CAT_BIZ_001 (删除), CAT_BIZ_002 (隐藏)
 * HTTP 状态: 422 Unprocessable Entity
 */
public class DefaultCategoryException extends RuntimeException {

    /**
     * 错误码：删除默认分类
     */
    public static final String ERROR_CODE_DELETE = "CAT_BIZ_001";

    /**
     * 错误码：隐藏默认分类
     */
    public static final String ERROR_CODE_HIDE = "CAT_BIZ_002";

    /**
     * 操作类型
     */
    private final OperationType operationType;

    /**
     * 操作类型枚举
     */
    public enum OperationType {
        DELETE("删除", ERROR_CODE_DELETE),
        HIDE("隐藏", ERROR_CODE_HIDE);

        private final String label;
        private final String errorCode;

        OperationType(String label, String errorCode) {
            this.label = label;
            this.errorCode = errorCode;
        }

        public String getLabel() {
            return label;
        }

        public String getErrorCode() {
            return errorCode;
        }
    }

    /**
     * 删除默认分类异常
     */
    public static DefaultCategoryException cannotDelete() {
        return new DefaultCategoryException(OperationType.DELETE);
    }

    /**
     * 隐藏默认分类异常
     */
    public static DefaultCategoryException cannotHide() {
        return new DefaultCategoryException(OperationType.HIDE);
    }

    /**
     * 构造函数
     */
    private DefaultCategoryException(OperationType operationType) {
        super(String.format("不允许%s默认分类", operationType.getLabel()));
        this.operationType = operationType;
    }

    /**
     * 自定义错误消息构造函数
     */
    public DefaultCategoryException(String message, OperationType operationType) {
        super(message);
        this.operationType = operationType;
    }

    /**
     * 获取错误码
     */
    public String getErrorCode() {
        return operationType.getErrorCode();
    }

    /**
     * 获取操作类型
     */
    public OperationType getOperationType() {
        return operationType;
    }
}
