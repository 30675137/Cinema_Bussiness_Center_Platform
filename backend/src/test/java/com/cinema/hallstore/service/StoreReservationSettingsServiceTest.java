package com.cinema.hallstore.service;

import com.cinema.hallstore.domain.StoreReservationSettings;
import com.cinema.hallstore.dto.BatchUpdateResult;
import com.cinema.hallstore.dto.BatchUpdateStoreReservationSettingsRequest;
import com.cinema.hallstore.dto.StoreReservationSettingsDTO;
import com.cinema.hallstore.dto.UpdateStoreReservationSettingsRequest;
import com.cinema.hallstore.exception.ResourceNotFoundException;
import com.cinema.hallstore.mapper.StoreReservationSettingsMapper;
import com.cinema.hallstore.repository.StoreReservationSettingsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * StoreReservationSettingsService 单元测试
 * 验证预约设置查询和更新操作的正确性
 */
@ExtendWith(MockitoExtension.class)
class StoreReservationSettingsServiceTest {

    @Mock
    private StoreReservationSettingsRepository repository;

    @InjectMocks
    private StoreReservationSettingsService service;

    private UUID testStoreId;
    private UUID testSettingsId;
    private StoreReservationSettings existingSettings;

    @BeforeEach
    void setUp() {
        testStoreId = UUID.randomUUID();
        testSettingsId = UUID.randomUUID();
        existingSettings = createMockSettings(testSettingsId, testStoreId, false, 0);
    }

    @Nested
    @DisplayName("获取预约设置测试")
    class GetSettingsTests {

        @Test
        @DisplayName("成功获取预约设置")
        void shouldGetSettings() {
            // Given
            when(repository.findByStoreId(testStoreId)).thenReturn(Optional.of(existingSettings));

            // When
            StoreReservationSettingsDTO result = service.getSettings(testStoreId);

            // Then
            assertNotNull(result);
            assertEquals(testStoreId.toString(), result.getStoreId());
            assertEquals(false, result.getIsReservationEnabled());
            assertEquals(0, result.getMaxReservationDays());
            verify(repository).findByStoreId(testStoreId);
        }

        @Test
        @DisplayName("预约设置不存在时抛出异常")
        void shouldThrowExceptionWhenSettingsNotFound() {
            // Given
            when(repository.findByStoreId(testStoreId)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(ResourceNotFoundException.class, () -> service.getSettings(testStoreId));
            verify(repository).findByStoreId(testStoreId);
        }
    }

    @Nested
    @DisplayName("更新预约设置测试")
    class UpdateSettingsTests {

        @Test
        @DisplayName("成功更新预约设置")
        void shouldUpdateSettings() {
            // Given
            UpdateStoreReservationSettingsRequest request = new UpdateStoreReservationSettingsRequest();
            request.setIsReservationEnabled(true);
            request.setMaxReservationDays(7);

            when(repository.findByStoreId(testStoreId)).thenReturn(Optional.of(existingSettings));
            
            StoreReservationSettings updatedSettings = createMockSettings(testSettingsId, testStoreId, true, 7);
            updatedSettings.setUpdatedAt(Instant.now());
            when(repository.save(any(StoreReservationSettings.class))).thenReturn(updatedSettings);

            // When
            StoreReservationSettingsDTO result = service.updateSettings(testStoreId, request);

            // Then
            assertNotNull(result);
            assertEquals(true, result.getIsReservationEnabled());
            assertEquals(7, result.getMaxReservationDays());
            verify(repository).findByStoreId(testStoreId);
            verify(repository).save(any(StoreReservationSettings.class));
        }

        @Test
        @DisplayName("更新不存在的预约设置时抛出异常")
        void shouldThrowExceptionWhenUpdatingNonExistentSettings() {
            // Given
            UpdateStoreReservationSettingsRequest request = new UpdateStoreReservationSettingsRequest();
            request.setIsReservationEnabled(true);
            request.setMaxReservationDays(7);

            when(repository.findByStoreId(testStoreId)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(ResourceNotFoundException.class, () -> service.updateSettings(testStoreId, request));
            verify(repository).findByStoreId(testStoreId);
            verify(repository, never()).save(any());
        }

        @Test
        @DisplayName("更新时正确设置字段值")
        void shouldUpdateFieldsCorrectly() {
            // Given
            UpdateStoreReservationSettingsRequest request = new UpdateStoreReservationSettingsRequest();
            request.setIsReservationEnabled(false);
            request.setMaxReservationDays(0);

            when(repository.findByStoreId(testStoreId)).thenReturn(Optional.of(existingSettings));
            
            StoreReservationSettings updatedSettings = createMockSettings(testSettingsId, testStoreId, false, 0);
            when(repository.save(any(StoreReservationSettings.class))).thenReturn(updatedSettings);

            // When
            StoreReservationSettingsDTO result = service.updateSettings(testStoreId, request);

            // Then
            assertEquals(false, result.getIsReservationEnabled());
            assertEquals(0, result.getMaxReservationDays());
        }
    }

    @Nested
    @DisplayName("批量更新预约设置测试")
    class BatchUpdateSettingsTests {

        @Test
        @DisplayName("成功批量更新所有门店的预约设置")
        void shouldBatchUpdateAllStoresSuccessfully() {
            // Given
            UUID storeId1 = UUID.randomUUID();
            UUID storeId2 = UUID.randomUUID();
            UUID storeId3 = UUID.randomUUID();

            BatchUpdateStoreReservationSettingsRequest request = new BatchUpdateStoreReservationSettingsRequest();
            request.setStoreIds(List.of(storeId1, storeId2, storeId3));
            
            UpdateStoreReservationSettingsRequest settingsRequest = new UpdateStoreReservationSettingsRequest();
            settingsRequest.setIsReservationEnabled(true);
            settingsRequest.setMaxReservationDays(7);
            request.setSettings(settingsRequest);

            // Mock existing settings for all stores
            StoreReservationSettings settings1 = createMockSettings(UUID.randomUUID(), storeId1, false, 0);
            StoreReservationSettings settings2 = createMockSettings(UUID.randomUUID(), storeId2, false, 0);
            StoreReservationSettings settings3 = createMockSettings(UUID.randomUUID(), storeId3, false, 0);

            when(repository.findByStoreId(storeId1)).thenReturn(Optional.of(settings1));
            when(repository.findByStoreId(storeId2)).thenReturn(Optional.of(settings2));
            when(repository.findByStoreId(storeId3)).thenReturn(Optional.of(settings3));

            when(repository.save(any(StoreReservationSettings.class))).thenAnswer(invocation -> {
                StoreReservationSettings s = invocation.getArgument(0);
                s.setIsReservationEnabled(true);
                s.setMaxReservationDays(7);
                return s;
            });

            // When
            BatchUpdateResult result = service.batchUpdate(request);

            // Then
            assertNotNull(result);
            assertEquals(3, result.getSuccessCount());
            assertEquals(0, result.getFailureCount());
            assertTrue(result.getFailures().isEmpty());
            verify(repository, times(3)).findByStoreId(any(UUID.class));
            verify(repository, times(3)).save(any(StoreReservationSettings.class));
        }

        @Test
        @DisplayName("批量更新时部分门店不存在应返回部分成功")
        void shouldHandlePartialFailures() {
            // Given
            UUID storeId1 = UUID.randomUUID();
            UUID storeId2 = UUID.randomUUID(); // This one doesn't exist
            UUID storeId3 = UUID.randomUUID();

            BatchUpdateStoreReservationSettingsRequest request = new BatchUpdateStoreReservationSettingsRequest();
            request.setStoreIds(List.of(storeId1, storeId2, storeId3));
            
            UpdateStoreReservationSettingsRequest settingsRequest = new UpdateStoreReservationSettingsRequest();
            settingsRequest.setIsReservationEnabled(true);
            settingsRequest.setMaxReservationDays(7);
            request.setSettings(settingsRequest);

            // Mock: storeId1 and storeId3 exist, storeId2 doesn't
            StoreReservationSettings settings1 = createMockSettings(UUID.randomUUID(), storeId1, false, 0);
            StoreReservationSettings settings3 = createMockSettings(UUID.randomUUID(), storeId3, false, 0);

            when(repository.findByStoreId(storeId1)).thenReturn(Optional.of(settings1));
            when(repository.findByStoreId(storeId2)).thenReturn(Optional.empty()); // Not found
            when(repository.findByStoreId(storeId3)).thenReturn(Optional.of(settings3));

            when(repository.save(any(StoreReservationSettings.class))).thenAnswer(invocation -> {
                StoreReservationSettings s = invocation.getArgument(0);
                s.setIsReservationEnabled(true);
                s.setMaxReservationDays(7);
                return s;
            });

            // When
            BatchUpdateResult result = service.batchUpdate(request);

            // Then
            assertNotNull(result);
            assertEquals(2, result.getSuccessCount());
            assertEquals(1, result.getFailureCount());
            assertEquals(1, result.getFailures().size());
            assertEquals(storeId2.toString(), result.getFailures().get(0).getStoreId());
            assertEquals("NOT_FOUND", result.getFailures().get(0).getError());
        }

        @Test
        @DisplayName("批量更新时所有门店都不存在应返回全部失败")
        void shouldHandleAllFailures() {
            // Given
            UUID storeId1 = UUID.randomUUID();
            UUID storeId2 = UUID.randomUUID();

            BatchUpdateStoreReservationSettingsRequest request = new BatchUpdateStoreReservationSettingsRequest();
            request.setStoreIds(List.of(storeId1, storeId2));
            
            UpdateStoreReservationSettingsRequest settingsRequest = new UpdateStoreReservationSettingsRequest();
            settingsRequest.setIsReservationEnabled(true);
            settingsRequest.setMaxReservationDays(7);
            request.setSettings(settingsRequest);

            when(repository.findByStoreId(any(UUID.class))).thenReturn(Optional.empty());

            // When
            BatchUpdateResult result = service.batchUpdate(request);

            // Then
            assertNotNull(result);
            assertEquals(0, result.getSuccessCount());
            assertEquals(2, result.getFailureCount());
            assertEquals(2, result.getFailures().size());
            verify(repository, never()).save(any(StoreReservationSettings.class));
        }

        @Test
        @DisplayName("批量更新空列表应返回空结果")
        void shouldHandleEmptyStoreIdsList() {
            // Given
            BatchUpdateStoreReservationSettingsRequest request = new BatchUpdateStoreReservationSettingsRequest();
            request.setStoreIds(new ArrayList<>());
            
            UpdateStoreReservationSettingsRequest settingsRequest = new UpdateStoreReservationSettingsRequest();
            settingsRequest.setIsReservationEnabled(true);
            settingsRequest.setMaxReservationDays(7);
            request.setSettings(settingsRequest);

            // When
            BatchUpdateResult result = service.batchUpdate(request);

            // Then
            assertNotNull(result);
            assertEquals(0, result.getSuccessCount());
            assertEquals(0, result.getFailureCount());
            assertTrue(result.getFailures().isEmpty());
            verify(repository, never()).findByStoreId(any(UUID.class));
            verify(repository, never()).save(any(StoreReservationSettings.class));
        }
    }

    // ========== Helper Methods ==========

    private StoreReservationSettings createMockSettings(UUID id, UUID storeId, boolean enabled, int maxDays) {
        StoreReservationSettings settings = new StoreReservationSettings();
        settings.setId(id);
        settings.setStoreId(storeId);
        settings.setIsReservationEnabled(enabled);
        settings.setMaxReservationDays(maxDays);
        settings.setCreatedAt(Instant.now());
        settings.setUpdatedAt(Instant.now());
        return settings;
    }
}

