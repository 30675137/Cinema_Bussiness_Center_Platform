package com.cinema.scenariopackage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * 图片上传请求 DTO
 * <p>
 * 用于请求生成预签名上传 URL
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */
public class ImageUploadRequest {

    /**
     * 文件名（含扩展名）
     */
    @NotBlank(message = "文件名不能为空")
    private String fileName;

    /**
     * 文件大小（字节）
     */
    @NotNull(message = "文件大小不能为空")
    @Positive(message = "文件大小必须为正数")
    private Long fileSize;

    /**
     * MIME 类型
     */
    @NotBlank(message = "MIME类型不能为空")
    private String mimeType;

    public ImageUploadRequest() {
    }

    public ImageUploadRequest(String fileName, Long fileSize, String mimeType) {
        this.fileName = fileName;
        this.fileSize = fileSize;
        this.mimeType = mimeType;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }
}
