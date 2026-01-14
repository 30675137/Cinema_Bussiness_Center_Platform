package com.cinema.material.exception;

/**
 * M001: 物料不存在异常
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
public class MaterialNotFoundException extends RuntimeException {
    
    public MaterialNotFoundException(String message) {
        super(message);
    }
    
    public MaterialNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
