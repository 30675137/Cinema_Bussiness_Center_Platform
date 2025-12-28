/**
 * @spec O003-beverage-order
 * 饮品订单业务异常基类
 */
package com.cinema.beverage.exception;

/**
 * 饮品订单业务异常基类
 */
public class BeverageException extends RuntimeException {

    private final BeverageErrorCode errorCode;
    private final Object details;

    public BeverageException(BeverageErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.details = null;
    }

    public BeverageException(BeverageErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
        this.details = null;
    }

    public BeverageException(BeverageErrorCode errorCode, Object details) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.details = details;
    }

    public BeverageException(BeverageErrorCode errorCode, String customMessage, Object details) {
        super(customMessage);
        this.errorCode = errorCode;
        this.details = details;
    }

    public BeverageException(BeverageErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
        this.details = null;
    }

    public BeverageErrorCode getErrorCode() {
        return errorCode;
    }

    public Object getDetails() {
        return details;
    }
}
