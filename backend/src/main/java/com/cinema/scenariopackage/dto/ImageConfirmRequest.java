package com.cinema.scenariopackage.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 图片上传确认请求 DTO
 * <p>
 * 前端上传图片到 Supabase Storage 成功后，调用此接口更新数据库
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */
public class ImageConfirmRequest {

    /**
     * 图片的公开访问 URL
     */
    @NotBlank(message = "图片URL不能为空")
    private String publicUrl;

    public ImageConfirmRequest() {
    }

    public ImageConfirmRequest(String publicUrl) {
        this.publicUrl = publicUrl;
    }

    public String getPublicUrl() {
        return publicUrl;
    }

    public void setPublicUrl(String publicUrl) {
        this.publicUrl = publicUrl;
    }
}
