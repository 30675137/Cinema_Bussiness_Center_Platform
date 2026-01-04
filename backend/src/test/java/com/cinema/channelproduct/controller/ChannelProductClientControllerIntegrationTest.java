package com.cinema.channelproduct.controller;

import com.cinema.category.entity.MenuCategory;
import com.cinema.category.repository.MenuCategoryRepository;
import com.cinema.channelproduct.domain.ChannelProductConfig;
import com.cinema.channelproduct.domain.enums.ChannelCategory;
import com.cinema.channelproduct.domain.enums.ChannelProductStatus;
import com.cinema.channelproduct.domain.enums.ChannelType;
import com.cinema.channelproduct.repository.ChannelProductRepository;
import com.cinema.hallstore.domain.Sku;
import com.cinema.hallstore.domain.enums.SkuType;
import com.cinema.hallstore.repository.SkuRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * @spec O002-miniapp-menu-config
 * @spec O006-miniapp-channel-order
 * 渠道商品客户端 API 集成测试
 *
 * 测试覆盖：
 * - T033: 商品按分类筛选 API 测试
 * - 支持 categoryId (UUID) 和 category (code) 参数
 * - 参数优先级验证：categoryId > category
 * - 向后兼容性：旧枚举分类仍可使用
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ChannelProductClientControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ChannelProductRepository channelProductRepository;

    @Autowired
    private MenuCategoryRepository menuCategoryRepository;

    @Autowired
    private SkuRepository skuRepository;

    private MenuCategory beverageCategory;
    private MenuCategory snackCategory;
    private ChannelProductConfig beverageProduct1;
    private ChannelProductConfig beverageProduct2;
    private ChannelProductConfig snackProduct;

    @BeforeEach
    void setUp() {
        // Note: @Transactional will rollback data after each test, so manual cleanup is not needed

        // 创建分类
        beverageCategory = menuCategoryRepository.save(MenuCategory.builder()
                .code("BEVERAGE")
                .displayName("饮料")
                .sortOrder(20)
                .isVisible(true)
                .isDefault(false)
                .build());

        snackCategory = menuCategoryRepository.save(MenuCategory.builder()
                .code("SNACK")
                .displayName("小吃")
                .sortOrder(30)
                .isVisible(true)
                .isDefault(false)
                .build());

        // 创建 SKU
        Sku beverageSku1 = skuRepository.save(Sku.builder()
                .code("BEV001")
                .name("可乐")
                .skuType(SkuType.FINISHED_PRODUCT)
                .price(new BigDecimal("5.00"))
                .build());

        Sku beverageSku2 = skuRepository.save(Sku.builder()
                .code("BEV002")
                .name("雪碧")
                .skuType(SkuType.FINISHED_PRODUCT)
                .price(new BigDecimal("5.00"))
                .build());

        Sku snackSku = skuRepository.save(Sku.builder()
                .code("SNACK001")
                .name("爆米花")
                .skuType(SkuType.FINISHED_PRODUCT)
                .price(new BigDecimal("15.00"))
                .build());

        // 创建渠道商品配置
        beverageProduct1 = channelProductRepository.save(ChannelProductConfig.builder()
                .skuId(beverageSku1.getId())
                .channelType(ChannelType.MINI_PROGRAM)
                .displayName("可乐（小程序专享）")
                .channelCategory(ChannelCategory.BEVERAGE)
                .categoryId(beverageCategory.getId())
                .channelPrice(500L)
                .mainImage("https://example.com/cola.jpg")
                .detailImages(new ArrayList<>())
                .description("冰爽可乐")
                .specs(new ArrayList<>())
                .isRecommended(true)
                .status(ChannelProductStatus.ACTIVE)
                .sortOrder(1)
                .build());

        beverageProduct2 = channelProductRepository.save(ChannelProductConfig.builder()
                .skuId(beverageSku2.getId())
                .channelType(ChannelType.MINI_PROGRAM)
                .displayName("雪碧（小程序专享）")
                .channelCategory(ChannelCategory.BEVERAGE)
                .categoryId(beverageCategory.getId())
                .channelPrice(500L)
                .mainImage("https://example.com/sprite.jpg")
                .detailImages(new ArrayList<>())
                .description("清凉雪碧")
                .specs(new ArrayList<>())
                .isRecommended(false)
                .status(ChannelProductStatus.ACTIVE)
                .sortOrder(2)
                .build());

        snackProduct = channelProductRepository.save(ChannelProductConfig.builder()
                .skuId(snackSku.getId())
                .channelType(ChannelType.MINI_PROGRAM)
                .displayName("爆米花（大份）")
                .channelCategory(ChannelCategory.SNACK)
                .categoryId(snackCategory.getId())
                .channelPrice(1500L)
                .mainImage("https://example.com/popcorn.jpg")
                .detailImages(new ArrayList<>())
                .description("香脆爆米花")
                .specs(new ArrayList<>())
                .isRecommended(true)
                .status(ChannelProductStatus.ACTIVE)
                .sortOrder(1)
                .build());
    }

    @Test
    @DisplayName("T033-1: 无筛选条件时返回所有 ACTIVE 商品")
    void shouldReturnAllActiveProducts() throws Exception {
        mockMvc.perform(get("/api/client/channel-products/mini-program"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(3)))
                .andExpect(jsonPath("$.data[*].displayName", hasItems(
                        "可乐（小程序专享）", "雪碧（小程序专享）", "爆米花（大份）"
                )));
    }

    @Test
    @DisplayName("T033-2: 使用 categoryId (UUID) 筛选商品")
    void shouldFilterByCategoryId() throws Exception {
        mockMvc.perform(get("/api/client/channel-products/mini-program")
                        .param("categoryId", beverageCategory.getId().toString()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[*].displayName", hasItems(
                        "可乐（小程序专享）", "雪碧（小程序专享）"
                )))
                .andExpect(jsonPath("$.data[*].categoryId", everyItem(is(beverageCategory.getId().toString()))))
                .andExpect(jsonPath("$.data[0].category.code").value("BEVERAGE"))
                .andExpect(jsonPath("$.data[0].category.displayName").value("饮料"));
    }

    @Test
    @DisplayName("T033-3: 使用 category (code) 筛选商品")
    void shouldFilterByCategoryCode() throws Exception {
        mockMvc.perform(get("/api/client/channel-products/mini-program")
                        .param("category", "SNACK"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].displayName").value("爆米花（大份）"))
                .andExpect(jsonPath("$.data[0].category.code").value("SNACK"))
                .andExpect(jsonPath("$.data[0].category.displayName").value("小吃"));
    }

    @Test
    @DisplayName("T033-4: categoryId 优先级高于 category (code)")
    void shouldPrioritizeCategoryIdOverCategoryCode() throws Exception {
        // 同时传递 categoryId=BEVERAGE 和 category=SNACK
        // 期望：按 categoryId 筛选，返回饮料而非小吃
        mockMvc.perform(get("/api/client/channel-products/mini-program")
                        .param("categoryId", beverageCategory.getId().toString())
                        .param("category", "SNACK"))  // 这个应该被忽略
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[*].category.code", everyItem(is("BEVERAGE"))));
    }

    @Test
    @DisplayName("T033-5: 不存在的分类 ID 返回空列表")
    void shouldReturnEmptyListForNonExistentCategoryId() throws Exception {
        UUID nonExistentId = UUID.randomUUID();

        mockMvc.perform(get("/api/client/channel-products/mini-program")
                        .param("categoryId", nonExistentId.toString()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    @DisplayName("T033-6: 不存在的分类 code 返回空列表")
    void shouldReturnEmptyListForNonExistentCategoryCode() throws Exception {
        mockMvc.perform(get("/api/client/channel-products/mini-program")
                        .param("category", "NONEXISTENT"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    @DisplayName("T033-7: 仅返回 ACTIVE 状态商品，忽略 INACTIVE")
    void shouldOnlyReturnActiveProducts() throws Exception {
        // 将一个商品设为 INACTIVE
        beverageProduct1.setStatus(ChannelProductStatus.INACTIVE);
        channelProductRepository.save(beverageProduct1);

        mockMvc.perform(get("/api/client/channel-products/mini-program")
                        .param("categoryId", beverageCategory.getId().toString()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].displayName").value("雪碧（小程序专享）"));
    }

    @Test
    @DisplayName("T033-8: 商品按推荐优先 + 排序顺序排列")
    void shouldSortByRecommendedAndSortOrder() throws Exception {
        mockMvc.perform(get("/api/client/channel-products/mini-program"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(3)))
                // 推荐商品在前：可乐、爆米花（都是推荐），然后是雪碧
                .andExpect(jsonPath("$.data[0].isRecommended").value(true))
                .andExpect(jsonPath("$.data[1].isRecommended").value(true));
    }

    @Test
    @DisplayName("T033-9: 返回的 DTO 包含分类信息")
    void shouldIncludeCategoryInfoInResponse() throws Exception {
        mockMvc.perform(get("/api/client/channel-products/mini-program")
                        .param("categoryId", beverageCategory.getId().toString()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].categoryId").value(beverageCategory.getId().toString()))
                .andExpect(jsonPath("$.data[0].category").exists())
                .andExpect(jsonPath("$.data[0].category.id").value(beverageCategory.getId().toString()))
                .andExpect(jsonPath("$.data[0].category.code").value("BEVERAGE"))
                .andExpect(jsonPath("$.data[0].category.displayName").value("饮料"));
    }

    @Test
    @DisplayName("T033-10: 向后兼容旧枚举分类（BEVERAGE 枚举值）")
    void shouldSupportLegacyEnumCategory() throws Exception {
        // 旧的枚举值也应该能通过 code 查找
        mockMvc.perform(get("/api/client/channel-products/mini-program")
                        .param("category", "BEVERAGE"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[*].category.code", everyItem(is("BEVERAGE"))));
    }

    @Test
    @DisplayName("T033-11: 获取商品详情接口包含分类信息")
    void shouldReturnProductDetailWithCategory() throws Exception {
        mockMvc.perform(get("/api/client/channel-products/mini-program/{id}", beverageProduct1.getId()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(beverageProduct1.getId().toString()))
                .andExpect(jsonPath("$.data.displayName").value("可乐（小程序专享）"))
                .andExpect(jsonPath("$.data.categoryId").value(beverageCategory.getId().toString()))
                .andExpect(jsonPath("$.data.category.code").value("BEVERAGE"))
                .andExpect(jsonPath("$.data.category.displayName").value("饮料"));
    }

    @Test
    @DisplayName("T033-12: 获取商品规格接口正常工作")
    void shouldReturnProductSpecs() throws Exception {
        mockMvc.perform(get("/api/client/channel-products/mini-program/{id}/specs", snackProduct.getId()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }
}
