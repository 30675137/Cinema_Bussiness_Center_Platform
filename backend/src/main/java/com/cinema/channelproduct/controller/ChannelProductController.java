package com.cinema.channelproduct.controller;

import com.cinema.channelproduct.domain.ChannelProductConfig;
import com.cinema.channelproduct.domain.enums.ChannelCategory;
import com.cinema.channelproduct.domain.enums.ChannelProductStatus;
import com.cinema.channelproduct.domain.enums.ChannelType;
import com.cinema.channelproduct.dto.*;
import com.cinema.channelproduct.service.ChannelProductService;
import com.cinema.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * @spec O005-channel-product-config
 * 渠道商品配置 API 控制器
 */
@RestController
@RequestMapping("/api/channel-products")
@RequiredArgsConstructor
public class ChannelProductController {

    private final ChannelProductService channelProductService;

    /**
     * 创建渠道商品配置
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ChannelProductConfig>> create(
            @Valid @RequestBody CreateChannelProductRequest request) {
        ChannelProductConfig config = channelProductService.createChannelProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(config));
    }

    /**
     * 查询单个渠道商品
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ChannelProductConfig>> getById(@PathVariable UUID id) {
        ChannelProductConfig config = channelProductService.getChannelProduct(id);
        return ResponseEntity.ok(ApiResponse.success(config));
    }

    /**
     * 更新渠道商品配置
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ChannelProductConfig>> update(
            @PathVariable UUID id,
            @RequestBody UpdateChannelProductRequest request) {
        ChannelProductConfig config = channelProductService.updateChannelProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success(config));
    }

    /**
     * 查询渠道商品列表
     * @spec O008-channel-product-category-migration
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ChannelProductConfig>>> list(
            @RequestParam(required = false, defaultValue = "MINI_PROGRAM") ChannelType channelType,
            @RequestParam(required = false) ChannelCategory channelCategory,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) ChannelProductStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {

        ChannelProductQueryParams params = ChannelProductQueryParams.builder()
                .channelType(channelType)
                .channelCategory(channelCategory)
                .categoryId(categoryId)
                .status(status)
                .keyword(keyword)
                .page(page)
                .size(size)
                .build();

        Page<ChannelProductConfig> pageResult = channelProductService.getChannelProducts(params);
        return ResponseEntity.ok(ApiResponse.success(pageResult));
    }

    /**
     * 更新商品状态
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStatusRequest request) {
        channelProductService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 删除渠道商品（软删除）
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        channelProductService.deleteChannelProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 上传渠道商品图片
     *
     * @param file 图片文件
     * @return 图片URL
     */
    @PostMapping("/upload-image")
    public ResponseEntity<ApiResponse<String>> uploadImage(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        String imageUrl = channelProductService.uploadImage(file);
        return ResponseEntity.ok(ApiResponse.success(imageUrl));
    }
}
