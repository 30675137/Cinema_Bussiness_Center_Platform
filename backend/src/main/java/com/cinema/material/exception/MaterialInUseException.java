package com.cinema.material.exception;

/**
 * M001: 物料正在使用中异常
 * 
 * 当尝试删除被BOM或库存引用的物料时抛出此异常
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
public class MaterialInUseException extends RuntimeException {
    
    public MaterialInUseException(String message) {
        super(message);
    }
    
    public MaterialInUseException(String message, Throwable cause) {
        super(message, cause);
    }
}
