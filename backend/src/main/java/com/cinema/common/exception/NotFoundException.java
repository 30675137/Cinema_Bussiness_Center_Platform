/**
 * @spec O003-beverage-order
 * 资源未找到异常
 */
package com.cinema.common.exception;

/**
 * 资源未找到异常
 *
 * HTTP状态码: 404
 * 使用场景: 当请求的资源（饮品、规格、配方等）不存在时抛出
 */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }

    public NotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
