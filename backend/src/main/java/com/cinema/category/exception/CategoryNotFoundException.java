package com.cinema.category.exception;

import java.util.UUID;

/**
 * @spec O002-miniapp-menu-config
 * 分类未找到异常
 * 错误码: CAT_NTF_001
 * HTTP 状态: 404 Not Found
 */
public class CategoryNotFoundException extends RuntimeException {

    /**
     * 错误码
     */
    public static final String ERROR_CODE = "CAT_NTF_001";

    /**
     * 分类 ID
     */
    private final UUID categoryId;

    /**
     * 分类编码
     */
    private final String code;

    /**
     * 通过 ID 未找到分类
     */
    public CategoryNotFoundException(UUID categoryId) {
        super(String.format("未找到 ID 为 %s 的分类", categoryId));
        this.categoryId = categoryId;
        this.code = null;
    }

    /**
     * 通过编码未找到分类
     */
    public CategoryNotFoundException(String code) {
        super(String.format("未找到编码为 %s 的分类", code));
        this.categoryId = null;
        this.code = code;
    }

    /**
     * 自定义错误消息
     */
    public CategoryNotFoundException(String message, UUID categoryId) {
        super(message);
        this.categoryId = categoryId;
        this.code = null;
    }

    /**
     * 获取错误码
     */
    public String getErrorCode() {
        return ERROR_CODE;
    }

    /**
     * 获取分类 ID
     */
    public UUID getCategoryId() {
        return categoryId;
    }

    /**
     * 获取分类编码
     */
    public String getCode() {
        return code;
    }
}
