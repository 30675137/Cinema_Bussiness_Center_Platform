package com.cinema.hallstore.service;

import com.cinema.hallstore.domain.Store;
import com.cinema.hallstore.domain.enums.StoreStatus;
import com.cinema.hallstore.dto.StoreDTO;
import com.cinema.hallstore.exception.ResourceNotFoundException;
import com.cinema.hallstore.repository.StoreRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * StoreService 单元测试
 * 验证多门店、多影厅组合下按门店查询影厅的正确性（含门店停用场景）
 */
@ExtendWith(MockitoExtension.class)
class StoreServiceTest {

    @Mock
    private StoreRepository storeRepository;

    @InjectMocks
    private StoreService storeService;

    private UUID testStoreId;

    @BeforeEach
    void setUp() {
        testStoreId = UUID.randomUUID();
    }

    @Nested
    @DisplayName("查询门店列表测试")
    class GetAllStoresTests {

        @Test
        @DisplayName("成功查询所有门店（不带状态过滤）")
        void shouldReturnAllStores() {
            // Given
            List<Store> stores = List.of(
                    createMockStore(UUID.randomUUID(), "STORE-A", "活动门店", StoreStatus.ACTIVE),
                    createMockStore(UUID.randomUUID(), "STORE-B", "停用门店", StoreStatus.DISABLED)
            );
            when(storeRepository.findAll(null)).thenReturn(stores);

            // When
            List<StoreDTO> result = storeService.getAllStores(null);

            // Then
            assertEquals(2, result.size());
            verify(storeRepository).findAll(null);
        }

        @Test
        @DisplayName("按活动状态过滤门店")
        void shouldReturnOnlyActiveStores() {
            // Given
            List<Store> activeStores = List.of(
                    createMockStore(UUID.randomUUID(), "STORE-A", "活动门店", StoreStatus.ACTIVE)
            );
            when(storeRepository.findAll(StoreStatus.ACTIVE)).thenReturn(activeStores);

            // When
            List<StoreDTO> result = storeService.getAllStores(StoreStatus.ACTIVE);

            // Then
            assertEquals(1, result.size());
            assertEquals(StoreStatus.ACTIVE, result.get(0).getStatus());
        }

        @Test
        @DisplayName("按停用状态过滤门店（用于历史查询）")
        void shouldReturnOnlyDisabledStores() {
            // Given
            List<Store> disabledStores = List.of(
                    createMockStore(UUID.randomUUID(), "STORE-B", "停用门店", StoreStatus.DISABLED)
            );
            when(storeRepository.findAll(StoreStatus.DISABLED)).thenReturn(disabledStores);

            // When
            List<StoreDTO> result = storeService.getAllStores(StoreStatus.DISABLED);

            // Then
            assertEquals(1, result.size());
            assertEquals(StoreStatus.DISABLED, result.get(0).getStatus());
        }

        @Test
        @DisplayName("没有门店时返回空列表")
        void shouldReturnEmptyListWhenNoStores() {
            // Given
            when(storeRepository.findAll(null)).thenReturn(List.of());

            // When
            List<StoreDTO> result = storeService.getAllStores(null);

            // Then
            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("查询活动门店测试")
    class GetActiveStoresTests {

        @Test
        @DisplayName("getActiveStores 仅返回活动状态门店")
        void shouldReturnOnlyActiveStoresFromConvenienceMethod() {
            // Given
            List<Store> activeStores = List.of(
                    createMockStore(UUID.randomUUID(), "STORE-A", "活动门店1", StoreStatus.ACTIVE),
                    createMockStore(UUID.randomUUID(), "STORE-C", "活动门店2", StoreStatus.ACTIVE)
            );
            when(storeRepository.findAll(StoreStatus.ACTIVE)).thenReturn(activeStores);

            // When
            List<StoreDTO> result = storeService.getActiveStores();

            // Then
            assertEquals(2, result.size());
            result.forEach(store -> assertEquals(StoreStatus.ACTIVE, store.getStatus()));
        }
    }

    @Nested
    @DisplayName("根据ID查询门店测试")
    class GetStoreByIdTests {

        @Test
        @DisplayName("成功根据ID获取门店详情")
        void shouldGetStoreById() {
            // Given
            Store store = createMockStore(testStoreId, "STORE-A", "测试门店", StoreStatus.ACTIVE);
            when(storeRepository.findById(testStoreId)).thenReturn(Optional.of(store));

            // When
            StoreDTO result = storeService.getStoreById(testStoreId);

            // Then
            assertEquals(testStoreId.toString(), result.getId());
            assertEquals("测试门店", result.getName());
            assertEquals("STORE-A", result.getCode());
        }

        @Test
        @DisplayName("门店不存在时抛出 ResourceNotFoundException")
        void shouldThrowExceptionWhenStoreNotFound() {
            // Given
            when(storeRepository.findById(testStoreId)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(ResourceNotFoundException.class,
                    () -> storeService.getStoreById(testStoreId));
        }

        @Test
        @DisplayName("停用门店也能查询到（用于历史查询场景）")
        void shouldGetDisabledStoreForHistoryQuery() {
            // Given
            Store disabledStore = createMockStore(testStoreId, "STORE-OLD", "已关闭门店", StoreStatus.DISABLED);
            when(storeRepository.findById(testStoreId)).thenReturn(Optional.of(disabledStore));

            // When
            StoreDTO result = storeService.getStoreById(testStoreId);

            // Then
            assertEquals(StoreStatus.DISABLED, result.getStatus());
            assertEquals("已关闭门店", result.getName());
        }
    }

    @Nested
    @DisplayName("根据编码查询门店测试")
    class GetStoreByCodeTests {

        @Test
        @DisplayName("成功根据编码获取门店详情")
        void shouldGetStoreByCode() {
            // Given
            Store store = createMockStore(testStoreId, "STORE-ABC", "测试门店", StoreStatus.ACTIVE);
            when(storeRepository.findByCode("STORE-ABC")).thenReturn(Optional.of(store));

            // When
            StoreDTO result = storeService.getStoreByCode("STORE-ABC");

            // Then
            assertEquals("STORE-ABC", result.getCode());
            assertEquals("测试门店", result.getName());
        }

        @Test
        @DisplayName("编码不存在时抛出异常")
        void shouldThrowExceptionWhenCodeNotFound() {
            // Given
            when(storeRepository.findByCode("INVALID")).thenReturn(Optional.empty());

            // When & Then
            assertThrows(ResourceNotFoundException.class,
                    () -> storeService.getStoreByCode("INVALID"));
        }
    }

    @Nested
    @DisplayName("门店状态检查测试")
    class IsStoreActiveTests {

        @Test
        @DisplayName("活动门店返回 true")
        void shouldReturnTrueForActiveStore() {
            // Given
            Store activeStore = createMockStore(testStoreId, "STORE-A", "活动门店", StoreStatus.ACTIVE);
            when(storeRepository.findById(testStoreId)).thenReturn(Optional.of(activeStore));

            // When
            boolean result = storeService.isStoreActive(testStoreId);

            // Then
            assertTrue(result);
        }

        @Test
        @DisplayName("停用门店返回 false")
        void shouldReturnFalseForDisabledStore() {
            // Given
            Store disabledStore = createMockStore(testStoreId, "STORE-B", "停用门店", StoreStatus.DISABLED);
            when(storeRepository.findById(testStoreId)).thenReturn(Optional.of(disabledStore));

            // When
            boolean result = storeService.isStoreActive(testStoreId);

            // Then
            assertFalse(result);
        }

        @Test
        @DisplayName("门店不存在返回 false")
        void shouldReturnFalseWhenStoreNotExists() {
            // Given
            when(storeRepository.findById(testStoreId)).thenReturn(Optional.empty());

            // When
            boolean result = storeService.isStoreActive(testStoreId);

            // Then
            assertFalse(result);
        }
    }

    // ========== Helper Methods ==========

    private Store createMockStore(UUID id, String code, String name, StoreStatus status) {
        Store store = new Store();
        store.setId(id);
        store.setCode(code);
        store.setName(name);
        store.setStatus(status);
        store.setRegion("上海");
        store.setCreatedAt(Instant.now());
        store.setUpdatedAt(Instant.now());
        return store;
    }
}
