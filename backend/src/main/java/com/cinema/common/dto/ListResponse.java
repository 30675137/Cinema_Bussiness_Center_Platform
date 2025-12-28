package com.cinema.common.dto;

import java.time.Instant;
import java.util.List;

/**
 * 列表响应类
 * <p>
 * 用于包装列表查询的 API 响应，包含数据列表和总数
 * </p>
 *
 * @param <T> 列表元素类型
 * @author Cinema Platform
 * @since 2025-12-19
 */
public class ListResponse<T> {

    /**
     * 是否成功
     */
    private boolean success = true;

    /**
     * 数据列表
     */
    private List<T> data;

    /**
     * 总记录数（用于分页）
     */
    private long total;

    /**
     * 消息（可选）
     */
    private String message;

    /**
     * 响应时间戳（ISO 8601 格式）
     */
    private String timestamp;

    /**
     * 默认构造函数
     */
    public ListResponse() {
        this.timestamp = Instant.now().toString();
    }

    /**
     * 带数据的构造函数
     *
     * @param data  数据列表
     * @param total 总记录数
     */
    public ListResponse(List<T> data, long total) {
        this.data = data;
        this.total = total;
        this.timestamp = Instant.now().toString();
    }

    /**
     * 静态工厂方法：创建成功的列表响应
     *
     * @param data  数据列表
     * @param total 总记录数
     * @param <T>   列表元素类型
     * @return ListResponse 实例
     */
    public static <T> ListResponse<T> success(List<T> data, long total) {
        return new ListResponse<>(data, total);
    }

    /**
     * 静态工厂方法：创建带消息的成功响应
     *
     * @param data    数据列表
     * @param total   总记录数
     * @param message 消息
     * @param <T>     列表元素类型
     * @return ListResponse 实例
     */
    public static <T> ListResponse<T> success(List<T> data, long total, String message) {
        ListResponse<T> response = new ListResponse<>(data, total);
        response.setMessage(message);
        return response;
    }

    // Getters and Setters

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public List<T> getData() {
        return data;
    }

    public void setData(List<T> data) {
        this.data = data;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "ListResponse{" +
                "success=" + success +
                ", data=" + data +
                ", total=" + total +
                ", message='" + message + '\'' +
                ", timestamp='" + timestamp + '\'' +
                '}';
    }
}
