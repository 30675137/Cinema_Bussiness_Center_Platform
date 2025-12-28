/**
 * @spec O003-beverage-order
 * 饮品不存在异常
 */
package com.cinema.beverage.exception;

import java.util.Map;

/**
 * 饮品不存在异常
 */
public class BeverageNotFoundException extends BeverageException {

    public BeverageNotFoundException(String beverageId) {
        super(
            BeverageErrorCode.BEV_NTF_001,
            "饮品不存在: " + beverageId,
            Map.of("beverageId", beverageId)
        );
    }
}
