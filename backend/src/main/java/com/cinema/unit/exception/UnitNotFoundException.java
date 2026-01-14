package com.cinema.unit.exception;

/**
 * M001: 单位不存在异常
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
public class UnitNotFoundException extends RuntimeException {
    
    public UnitNotFoundException(String message) {
        super(message);
    }
    
    public UnitNotFoundException(String code, String message) {
        super(String.format("Unit with code '%s' not found: %s", code, message));
    }
}
