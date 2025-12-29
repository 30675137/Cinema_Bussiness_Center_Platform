package com.cinema.scenariopackage.exception;

import java.util.UUID;

/**
 * 场景包未找到异常
 * <p>
 * 当查询的场景包不存在时抛出此异常
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */
public class PackageNotFoundException extends RuntimeException {

    /**
     * 场景包 ID
     */
    private final UUID packageId;

    /**
     * 构造函数
     *
     * @param packageId 场景包 ID
     */
    public PackageNotFoundException(UUID packageId) {
        super("场景包未找到: " + packageId);
        this.packageId = packageId;
    }

    /**
     * 带自定义消息的构造函数
     *
     * @param packageId 场景包 ID
     * @param message   自定义消息
     */
    public PackageNotFoundException(UUID packageId, String message) {
        super(message);
        this.packageId = packageId;
    }

    public UUID getPackageId() {
        return packageId;
    }
}
