package com.cinema.hallstore.exception;

/**
 * 资源未找到异常
 */
public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String resourceType, String resourceId) {
        super("NOT_FOUND", resourceType + "不存在: " + resourceId);
    }
}
