package com.cinema.hallstore.controller;

import com.cinema.hallstore.domain.Store;
import com.cinema.hallstore.domain.enums.StoreStatus;
import com.cinema.hallstore.repository.StoreRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * StoreQueryController 集成测试
 * 验证门店查询接口，覆盖 active/disabled 状态
 */
@SpringBootTest
@AutoConfigureMockMvc
class StoreQueryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StoreRepository storeRepository;

    private UUID testStoreId;

    @BeforeEach
    void setUp() {
        testStoreId = UUID.randomUUID();
    }

    @Nested
    @DisplayName("GET /api/stores - 查询门店列表")
    class GetStoresTests {

        @Test
        @DisplayName("成功返回所有门店（不带状态过滤）")
        void shouldReturnAllStores() throws Exception {
            // Given
            List<Store> stores = List.of(
                    createMockStore(UUID.randomUUID(), "STORE-A", "门店A", StoreStatus.ACTIVE, "上海"),
                    createMockStore(UUID.randomUUID(), "STORE-B", "门店B", StoreStatus.DISABLED, "北京")
            );
            when(storeRepository.findAll(null)).thenReturn(stores);

            // When & Then
            mockMvc.perform(get("/api/stores"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(2)))
                    .andExpect(jsonPath("$.total", is(2)))
                    .andExpect(jsonPath("$.data[*].status", containsInAnyOrder("active", "disabled")));
        }

        @Test
        @DisplayName("按活动状态筛选门店")
        void shouldFilterActiveStores() throws Exception {
            // Given
            List<Store> activeStores = List.of(
                    createMockStore(UUID.randomUUID(), "STORE-A", "活动门店", StoreStatus.ACTIVE, "上海")
            );
            when(storeRepository.findAll(StoreStatus.ACTIVE)).thenReturn(activeStores);

            // When & Then
            mockMvc.perform(get("/api/stores")
                            .param("status", "ACTIVE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(1)))
                    .andExpect(jsonPath("$.data[0].status", is("active")));
        }

        @Test
        @DisplayName("按停用状态筛选门店（用于历史查询）")
        void shouldFilterDisabledStores() throws Exception {
            // Given
            List<Store> disabledStores = List.of(
                    createMockStore(UUID.randomUUID(), "STORE-OLD", "已关闭门店", StoreStatus.DISABLED, "广州")
            );
            when(storeRepository.findAll(StoreStatus.DISABLED)).thenReturn(disabledStores);

            // When & Then
            mockMvc.perform(get("/api/stores")
                            .param("status", "DISABLED"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(1)))
                    .andExpect(jsonPath("$.data[0].status", is("disabled")));
        }

        @Test
        @DisplayName("没有门店时返回空数组")
        void shouldReturnEmptyArrayWhenNoStores() throws Exception {
            // Given
            when(storeRepository.findAll(null)).thenReturn(List.of());

            // When & Then
            mockMvc.perform(get("/api/stores"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(0)))
                    .andExpect(jsonPath("$.total", is(0)));
        }

        @Test
        @DisplayName("返回的 Store 字段结构正确")
        void shouldReturnCorrectStoreFields() throws Exception {
            // Given
            Store store = createMockStore(testStoreId, "STORE-XYZ", "测试门店", StoreStatus.ACTIVE, "深圳");
            when(storeRepository.findAll(null)).thenReturn(List.of(store));

            // When & Then
            mockMvc.perform(get("/api/stores"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data[0].id", is(testStoreId.toString())))
                    .andExpect(jsonPath("$.data[0].code", is("STORE-XYZ")))
                    .andExpect(jsonPath("$.data[0].name", is("测试门店")))
                    .andExpect(jsonPath("$.data[0].region", is("深圳")))
                    .andExpect(jsonPath("$.data[0].status", is("active")))
                    .andExpect(jsonPath("$.data[0].createdAt", notNullValue()))
                    .andExpect(jsonPath("$.data[0].updatedAt", notNullValue()));
        }
    }

    @Nested
    @DisplayName("GET /api/stores/{storeId} - 获取门店详情")
    class GetStoreByIdTests {

        @Test
        @DisplayName("成功获取门店详情")
        void shouldGetStoreDetails() throws Exception {
            // Given
            Store store = createMockStore(testStoreId, "STORE-A", "测试门店", StoreStatus.ACTIVE, "上海");
            when(storeRepository.findById(testStoreId)).thenReturn(Optional.of(store));

            // When & Then
            mockMvc.perform(get("/api/stores/{storeId}", testStoreId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id", is(testStoreId.toString())))
                    .andExpect(jsonPath("$.data.code", is("STORE-A")))
                    .andExpect(jsonPath("$.data.name", is("测试门店")))
                    .andExpect(jsonPath("$.data.region", is("上海")))
                    .andExpect(jsonPath("$.data.status", is("active")));
        }

        @Test
        @DisplayName("门店不存在返回404")
        void shouldReturn404WhenStoreNotFound() throws Exception {
            // Given
            when(storeRepository.findById(testStoreId)).thenReturn(Optional.empty());

            // When & Then
            mockMvc.perform(get("/api/stores/{storeId}", testStoreId))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error", is("NOT_FOUND")));
        }

        @Test
        @DisplayName("停用门店也能查询到（用于历史查询场景）")
        void shouldGetDisabledStoreForHistoryQuery() throws Exception {
            // Given
            Store disabledStore = createMockStore(testStoreId, "STORE-OLD", "已关闭门店", StoreStatus.DISABLED, "广州");
            when(storeRepository.findById(testStoreId)).thenReturn(Optional.of(disabledStore));

            // When & Then
            mockMvc.perform(get("/api/stores/{storeId}", testStoreId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.status", is("disabled")))
                    .andExpect(jsonPath("$.data.name", is("已关闭门店")));
        }
    }

    // ========== Helper Methods ==========

    private Store createMockStore(UUID id, String code, String name, StoreStatus status, String region) {
        Store store = new Store();
        store.setId(id);
        store.setCode(code);
        store.setName(name);
        store.setStatus(status);
        store.setRegion(region);
        store.setCreatedAt(Instant.now());
        store.setUpdatedAt(Instant.now());
        return store;
    }
}
