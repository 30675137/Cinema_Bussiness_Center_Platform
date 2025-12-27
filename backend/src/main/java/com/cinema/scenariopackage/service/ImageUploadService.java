package com.cinema.scenariopackage.service;

import com.cinema.hallstore.config.SupabaseConfig;
import com.cinema.scenariopackage.dto.ImageUploadRequest;
import com.cinema.scenariopackage.dto.ImageUploadResponse;
import com.cinema.scenariopackage.exception.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * 图片上传服务
 * <p>
 * 提供 Supabase Storage 图片上传功能：
 * - 生成预签名上传 URL
 * - 文件类型和大小验证
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */
@Service
public class ImageUploadService {

    private static final Logger logger = LoggerFactory.getLogger(ImageUploadService.class);

    /**
     * 允许的 MIME 类型
     */
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    /**
     * 最大文件大小（5MB）
     */
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    /**
     * 预签名 URL 有效期（秒）
     */
    private static final int SIGNED_URL_EXPIRES_IN = 600;

    private final SupabaseConfig supabaseConfig;
    private final RestTemplate restTemplate;

    @Value("${supabase.storage.bucket:scenario-packages}")
    private String bucketName;

    @Value("${supabase.storage.base-url:}")
    private String storageBaseUrl;

    public ImageUploadService(SupabaseConfig supabaseConfig, RestTemplate restTemplate) {
        this.supabaseConfig = supabaseConfig;
        this.restTemplate = restTemplate;
    }

    /**
     * 生成预签名上传 URL
     *
     * @param packageId 场景包 ID
     * @param request   上传请求（包含文件名、大小、MIME类型）
     * @return 预签名 URL 和公开访问 URL
     * @throws ValidationException 如果文件验证失败
     */
    public ImageUploadResponse generateUploadUrl(UUID packageId, ImageUploadRequest request) {
        logger.info("Generating upload URL for package: {}, file: {}", packageId, request.getFileName());

        // 1. 验证文件
        validateFile(request);

        // 2. 生成唯一文件路径
        String fileExtension = getFileExtension(request.getFileName());
        String uniqueFileName = UUID.randomUUID() + "-" + sanitizeFileName(request.getFileName());
        String filePath = "backgrounds/" + uniqueFileName;

        // 3. 生成预签名上传 URL
        String uploadUrl = generateSignedUploadUrl(filePath);

        // 4. 构建公开访问 URL
        String publicUrl = buildPublicUrl(filePath);

        logger.info("Upload URL generated successfully for package: {}", packageId);
        return new ImageUploadResponse(uploadUrl, publicUrl, SIGNED_URL_EXPIRES_IN);
    }

    /**
     * 验证文件类型和大小
     */
    private void validateFile(ImageUploadRequest request) {
        // 验证文件大小
        if (request.getFileSize() > MAX_FILE_SIZE) {
            throw new ValidationException("文件大小超过5MB限制");
        }

        // 验证 MIME 类型
        if (!ALLOWED_MIME_TYPES.contains(request.getMimeType().toLowerCase())) {
            throw new ValidationException("仅支持 JPG/PNG/WebP 格式");
        }

        // 验证文件扩展名与 MIME 类型是否匹配
        String extension = getFileExtension(request.getFileName()).toLowerCase();
        boolean extensionValid = switch (request.getMimeType().toLowerCase()) {
            case "image/jpeg" -> extension.equals("jpg") || extension.equals("jpeg");
            case "image/png" -> extension.equals("png");
            case "image/webp" -> extension.equals("webp");
            default -> false;
        };

        if (!extensionValid) {
            throw new ValidationException("文件扩展名与MIME类型不匹配");
        }

        logger.debug("File validation passed: {}, size: {} bytes, type: {}",
                request.getFileName(), request.getFileSize(), request.getMimeType());
    }

    /**
     * 生成 Supabase Storage 预签名上传 URL
     * <p>
     * 使用 Supabase Storage API 的 createSignedUploadUrl 端点
     * </p>
     */
    private String generateSignedUploadUrl(String filePath) {
        String baseUrl = getStorageBaseUrl();
        String endpoint = baseUrl + "/object/upload/sign/" + bucketName + "/" + filePath;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(supabaseConfig.getServiceRoleKey());
        headers.set("apikey", supabaseConfig.getServiceRoleKey());
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>("{}", headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    endpoint,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Supabase 返回的是相对 URL，需要拼接完整路径
                String signedUrl = (String) response.getBody().get("url");
                if (signedUrl != null) {
                    // 如果是相对路径，拼接完整 URL
                    if (!signedUrl.startsWith("http")) {
                        signedUrl = baseUrl + signedUrl;
                    }
                    return signedUrl;
                }

                // 备用：尝试获取 signedURL 字段
                String token = (String) response.getBody().get("token");
                if (token != null) {
                    return baseUrl + "/object/upload/sign/" + bucketName + "/" + filePath + "?token=" + token;
                }
            }

            logger.error("Failed to get signed URL from Supabase response: {}", response.getBody());
            throw new RuntimeException("无法生成上传URL");

        } catch (Exception e) {
            logger.error("Error generating signed upload URL: {}", e.getMessage(), e);
            throw new RuntimeException("生成上传URL失败: " + e.getMessage());
        }
    }

    /**
     * 构建公开访问 URL
     */
    private String buildPublicUrl(String filePath) {
        return getStorageBaseUrl() + "/object/public/" + bucketName + "/" + filePath;
    }

    /**
     * 获取存储基础 URL
     */
    private String getStorageBaseUrl() {
        if (storageBaseUrl != null && !storageBaseUrl.isEmpty()) {
            return storageBaseUrl;
        }
        return supabaseConfig.getUrl() + "/storage/v1";
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }

    /**
     * 清理文件名（移除特殊字符）
     */
    private String sanitizeFileName(String fileName) {
        if (fileName == null) {
            return "file";
        }
        // 保留字母、数字、下划线、连字符和点
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
