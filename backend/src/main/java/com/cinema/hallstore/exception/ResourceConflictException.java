package com.cinema.hallstore.exception;

/**
 * 资源冲突异常（如唯一性约束冲突）
 */
public class ResourceConflictException extends BusinessException {

    public ResourceConflictException(String message) {
        super("CONFLICT", message);
    }
}
