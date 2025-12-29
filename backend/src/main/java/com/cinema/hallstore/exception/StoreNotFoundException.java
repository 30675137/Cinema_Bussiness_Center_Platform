package com.cinema.hallstore.exception;

/**
 * Exception thrown when a store is not found
 * 
 * @since 022-store-crud
 */
public class StoreNotFoundException extends RuntimeException {

    private final String storeId;

    public StoreNotFoundException(String storeId) {
        super("门店不存在: " + storeId);
        this.storeId = storeId;
    }

    public StoreNotFoundException(String storeId, String message) {
        super(message);
        this.storeId = storeId;
    }

    public String getStoreId() {
        return storeId;
    }
}
