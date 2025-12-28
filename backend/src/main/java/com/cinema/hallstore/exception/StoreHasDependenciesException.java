package com.cinema.hallstore.exception;

/**
 * Exception thrown when a store has dependencies and cannot be deleted
 * 
 * @since 022-store-crud
 */
public class StoreHasDependenciesException extends RuntimeException {

    private final String storeId;
    private final String dependencyType;

    public StoreHasDependenciesException(String storeId, String dependencyType, String message) {
        super(message);
        this.storeId = storeId;
        this.dependencyType = dependencyType;
    }

    public StoreHasDependenciesException(String message) {
        super(message);
        this.storeId = null;
        this.dependencyType = null;
    }

    public String getStoreId() {
        return storeId;
    }

    public String getDependencyType() {
        return dependencyType;
    }
}
