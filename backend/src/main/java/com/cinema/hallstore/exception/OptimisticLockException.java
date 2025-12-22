package com.cinema.hallstore.exception;

/**
 * Exception thrown when optimistic locking fails (version mismatch)
 * 
 * @since 022-store-crud
 */
public class OptimisticLockException extends RuntimeException {

    private final String storeId;
    private final Long expectedVersion;
    private final Long actualVersion;

    public OptimisticLockException(String storeId, Long expectedVersion, Long actualVersion) {
        super("门店信息已被他人修改,请刷新后重试");
        this.storeId = storeId;
        this.expectedVersion = expectedVersion;
        this.actualVersion = actualVersion;
    }

    public OptimisticLockException(String message) {
        super(message);
        this.storeId = null;
        this.expectedVersion = null;
        this.actualVersion = null;
    }

    public String getStoreId() {
        return storeId;
    }

    public Long getExpectedVersion() {
        return expectedVersion;
    }

    public Long getActualVersion() {
        return actualVersion;
    }
}
