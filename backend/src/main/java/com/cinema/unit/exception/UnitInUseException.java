package com.cinema.unit.exception;

/**
 * M001: 单位正在使用异常
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
public class UnitInUseException extends RuntimeException {
    
    public UnitInUseException(String message) {
        super(message);
    }
    
    public UnitInUseException(String code, String usageInfo) {
        super(String.format("Unit '%s' cannot be deleted: %s", code, usageInfo));
    }
}
