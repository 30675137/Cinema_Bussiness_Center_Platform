package com.cinema.scenariopackage.dto;

/**
 * 图片上传响应 DTO
 * <p>
 * 返回预签名上传 URL 和公开访问 URL
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */
public class ImageUploadResponse {

    /**
     * 预签名上传 URL（用于前端直接上传到 Supabase Storage）
     */
    private String uploadUrl;

    /**
     * 上传成功后的公开访问 URL
     */
    private String publicUrl;

    /**
     * URL 有效期（秒）
     */
    private Integer expiresIn;

    public ImageUploadResponse() {
    }

    public ImageUploadResponse(String uploadUrl, String publicUrl, Integer expiresIn) {
        this.uploadUrl = uploadUrl;
        this.publicUrl = publicUrl;
        this.expiresIn = expiresIn;
    }

    public String getUploadUrl() {
        return uploadUrl;
    }

    public void setUploadUrl(String uploadUrl) {
        this.uploadUrl = uploadUrl;
    }

    public String getPublicUrl() {
        return publicUrl;
    }

    public void setPublicUrl(String publicUrl) {
        this.publicUrl = publicUrl;
    }

    public Integer getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(Integer expiresIn) {
        this.expiresIn = expiresIn;
    }
}
