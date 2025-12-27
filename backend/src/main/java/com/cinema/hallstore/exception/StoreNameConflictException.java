package com.cinema.hallstore.exception;

/**
 * Exception thrown when a store name already exists (conflict)
 * 
 * @since 022-store-crud
 */
public class StoreNameConflictException extends RuntimeException {

    private final String storeName;

    public StoreNameConflictException(String storeName) {
        super("门店名称已存在: " + storeName);
        this.storeName = storeName;
    }

    public StoreNameConflictException(String storeName, String message) {
        super(message);
        this.storeName = storeName;
    }

    public String getStoreName() {
        return storeName;
    }
}
