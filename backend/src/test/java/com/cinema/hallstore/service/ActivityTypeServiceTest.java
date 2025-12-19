package com.cinema.hallstore.service;

import com.cinema.hallstore.domain.ActivityType;
import com.cinema.hallstore.domain.enums.ActivityTypeStatus;
import com.cinema.hallstore.dto.ActivityTypeDTO;
import com.cinema.hallstore.dto.CreateActivityTypeRequest;
import com.cinema.hallstore.dto.UpdateActivityTypeRequest;
import com.cinema.hallstore.exception.ResourceConflictException;
import com.cinema.hallstore.exception.ResourceNotFoundException;
import com.cinema.hallstore.repository.ActivityTypeRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * ActivityTypeService 单元测试
 * 验证活动类型查询、创建、更新、删除和状态切换操作的正确性
 */
@ExtendWith(MockitoExtension.class)
class ActivityTypeServiceTest {

    @Mock
    private ActivityTypeRepository repository;

    @InjectMocks
    private ActivityTypeService service;

    private UUID testId;
    private ActivityType existingActivityType;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();
        existingActivityType = createMockActivityType(testId, "企业团建", ActivityTypeStatus.ENABLED, 1);
    }

    @Nested
    @DisplayName("查询活动类型列表测试")
    class FindAllTests {

        @Test
        @DisplayName("成功查询所有活动类型（无状态过滤）")
        void shouldFindAllActivityTypes() {
            // Given
            ActivityType type1 = createMockActivityType(UUID.randomUUID(), "企业团建", ActivityTypeStatus.ENABLED, 1);
            ActivityType type2 = createMockActivityType(UUID.randomUUID(), "订婚", ActivityTypeStatus.DISABLED, 2);
            List<ActivityType> types = List.of(type1, type2);

            when(repository.findAll(null)).thenReturn(types);

            // When
            List<ActivityTypeDTO> result = service.findAll(null);

            // Then
            assertNotNull(result);
            assertEquals(2, result.size());
            assertEquals("企业团建", result.get(0).getName());
            assertEquals("订婚", result.get(1).getName());
            verify(repository).findAll(null);
        }

        @Test
        @DisplayName("成功查询启用状态的活动类型")
        void shouldFindEnabledActivityTypes() {
            // Given
            ActivityType type1 = createMockActivityType(UUID.randomUUID(), "企业团建", ActivityTypeStatus.ENABLED, 1);
            List<ActivityType> types = List.of(type1);

            when(repository.findAll(ActivityTypeStatus.ENABLED)).thenReturn(types);

            // When
            List<ActivityTypeDTO> result = service.findAll(ActivityTypeStatus.ENABLED);

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals(ActivityTypeStatus.ENABLED, result.get(0).getStatus());
            verify(repository).findAll(ActivityTypeStatus.ENABLED);
        }

        @Test
        @DisplayName("查询空列表时返回空列表")
        void shouldReturnEmptyListWhenNoActivityTypes() {
            // Given
            when(repository.findAll(null)).thenReturn(List.of());

            // When
            List<ActivityTypeDTO> result = service.findAll(null);

            // Then
            assertNotNull(result);
            assertTrue(result.isEmpty());
            verify(repository).findAll(null);
        }
    }

    @Nested
    @DisplayName("查询启用状态活动类型测试")
    class FindEnabledTests {

        @Test
        @DisplayName("成功查询启用状态的活动类型")
        void shouldFindEnabledActivityTypes() {
            // Given
            ActivityType type1 = createMockActivityType(UUID.randomUUID(), "企业团建", ActivityTypeStatus.ENABLED, 1);
            List<ActivityType> types = List.of(type1);

            when(repository.findEnabled()).thenReturn(types);

            // When
            List<ActivityTypeDTO> result = service.findEnabled();

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals(ActivityTypeStatus.ENABLED, result.get(0).getStatus());
            verify(repository).findEnabled();
        }
    }

    @Nested
    @DisplayName("根据ID查询活动类型测试")
    class FindByIdTests {

        @Test
        @DisplayName("成功根据ID查询活动类型")
        void shouldFindActivityTypeById() {
            // Given
            when(repository.findById(testId)).thenReturn(Optional.of(existingActivityType));

            // When
            ActivityTypeDTO result = service.findById(testId);

            // Then
            assertNotNull(result);
            assertEquals(testId.toString(), result.getId());
            assertEquals("企业团建", result.getName());
            verify(repository).findById(testId);
        }

        @Test
        @DisplayName("活动类型不存在时抛出异常")
        void shouldThrowExceptionWhenActivityTypeNotFound() {
            // Given
            when(repository.findById(testId)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(ResourceNotFoundException.class, () -> service.findById(testId));
            verify(repository).findById(testId);
        }
    }

    @Nested
    @DisplayName("创建活动类型测试")
    class CreateTests {

        @Test
        @DisplayName("成功创建活动类型")
        void shouldCreateActivityType() {
            // Given
            CreateActivityTypeRequest request = new CreateActivityTypeRequest();
            request.setName("生日Party");
            request.setDescription("生日聚会活动");
            request.setSort(3);

            when(repository.existsByName("生日Party", null)).thenReturn(false);
            
            ActivityType saved = createMockActivityType(UUID.randomUUID(), "生日Party", ActivityTypeStatus.ENABLED, 3);
            when(repository.save(any(ActivityType.class))).thenReturn(saved);

            // When
            ActivityTypeDTO result = service.create(request);

            // Then
            assertNotNull(result);
            assertEquals("生日Party", result.getName());
            assertEquals(ActivityTypeStatus.ENABLED, result.getStatus()); // 默认启用
            assertEquals(3, result.getSort());
            verify(repository).existsByName("生日Party", null);
            verify(repository).save(any(ActivityType.class));
        }

        @Test
        @DisplayName("名称已存在时抛出异常")
        void shouldThrowExceptionWhenNameExists() {
            // Given
            CreateActivityTypeRequest request = new CreateActivityTypeRequest();
            request.setName("企业团建");
            request.setSort(1);

            when(repository.existsByName("企业团建", null)).thenReturn(true);

            // When & Then
            assertThrows(ResourceConflictException.class, () -> service.create(request));
            verify(repository).existsByName("企业团建", null);
            verify(repository, never()).save(any(ActivityType.class));
        }
    }

    @Nested
    @DisplayName("更新活动类型测试")
    class UpdateTests {

        @Test
        @DisplayName("成功更新活动类型")
        void shouldUpdateActivityType() {
            // Given
            UpdateActivityTypeRequest request = new UpdateActivityTypeRequest();
            request.setName("企业团建（更新）");
            request.setDescription("更新后的描述");
            request.setSort(5);

            when(repository.findById(testId)).thenReturn(Optional.of(existingActivityType));
            when(repository.existsByName("企业团建（更新）", testId)).thenReturn(false);
            
            ActivityType updated = createMockActivityType(testId, "企业团建（更新）", ActivityTypeStatus.ENABLED, 5);
            when(repository.save(any(ActivityType.class))).thenReturn(updated);

            // When
            ActivityTypeDTO result = service.update(testId, request);

            // Then
            assertNotNull(result);
            assertEquals("企业团建（更新）", result.getName());
            assertEquals(5, result.getSort());
            verify(repository).findById(testId);
            verify(repository).existsByName("企业团建（更新）", testId);
            verify(repository).save(any(ActivityType.class));
        }

        @Test
        @DisplayName("更新时名称与其他记录重复时抛出异常")
        void shouldThrowExceptionWhenUpdatedNameExists() {
            // Given
            UpdateActivityTypeRequest request = new UpdateActivityTypeRequest();
            request.setName("订婚");
            request.setSort(2);

            when(repository.findById(testId)).thenReturn(Optional.of(existingActivityType));
            when(repository.existsByName("订婚", testId)).thenReturn(true);

            // When & Then
            assertThrows(ResourceConflictException.class, () -> service.update(testId, request));
            verify(repository).findById(testId);
            verify(repository).existsByName("订婚", testId);
            verify(repository, never()).save(any(ActivityType.class));
        }

        @Test
        @DisplayName("更新不存在的活动类型时抛出异常")
        void shouldThrowExceptionWhenUpdatingNonExistentActivityType() {
            // Given
            UpdateActivityTypeRequest request = new UpdateActivityTypeRequest();
            request.setName("新名称");
            request.setSort(1);

            when(repository.findById(testId)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(ResourceNotFoundException.class, () -> service.update(testId, request));
            verify(repository).findById(testId);
            verify(repository, never()).save(any(ActivityType.class));
        }
    }

    @Nested
    @DisplayName("切换活动类型状态测试")
    class ToggleStatusTests {

        @Test
        @DisplayName("成功切换为停用状态")
        void shouldToggleToDisabled() {
            // Given
            when(repository.findById(testId)).thenReturn(Optional.of(existingActivityType));
            
            ActivityType updated = createMockActivityType(testId, "企业团建", ActivityTypeStatus.DISABLED, 1);
            when(repository.updateStatus(testId, ActivityTypeStatus.DISABLED)).thenReturn(updated);

            // When
            ActivityTypeDTO result = service.toggleStatus(testId, ActivityTypeStatus.DISABLED);

            // Then
            assertNotNull(result);
            assertEquals(ActivityTypeStatus.DISABLED, result.getStatus());
            verify(repository).findById(testId);
            verify(repository).updateStatus(testId, ActivityTypeStatus.DISABLED);
        }

        @Test
        @DisplayName("成功切换为启用状态")
        void shouldToggleToEnabled() {
            // Given
            ActivityType disabled = createMockActivityType(testId, "企业团建", ActivityTypeStatus.DISABLED, 1);
            when(repository.findById(testId)).thenReturn(Optional.of(disabled));
            
            ActivityType updated = createMockActivityType(testId, "企业团建", ActivityTypeStatus.ENABLED, 1);
            when(repository.updateStatus(testId, ActivityTypeStatus.ENABLED)).thenReturn(updated);

            // When
            ActivityTypeDTO result = service.toggleStatus(testId, ActivityTypeStatus.ENABLED);

            // Then
            assertNotNull(result);
            assertEquals(ActivityTypeStatus.ENABLED, result.getStatus());
            verify(repository).findById(testId);
            verify(repository).updateStatus(testId, ActivityTypeStatus.ENABLED);
        }

        @Test
        @DisplayName("活动类型不存在时抛出异常")
        void shouldThrowExceptionWhenActivityTypeNotFound() {
            // Given
            when(repository.findById(testId)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(ResourceNotFoundException.class, () -> 
                service.toggleStatus(testId, ActivityTypeStatus.DISABLED));
            verify(repository).findById(testId);
            verify(repository, never()).updateStatus(any(), any());
        }
    }

    @Nested
    @DisplayName("删除活动类型测试")
    class DeleteTests {

        @Test
        @DisplayName("成功删除活动类型（软删除）")
        void shouldDeleteActivityType() {
            // Given
            when(repository.findById(testId)).thenReturn(Optional.of(existingActivityType));
            
            ActivityType deleted = createMockActivityType(testId, "企业团建", ActivityTypeStatus.DELETED, 1);
            when(repository.delete(testId)).thenReturn(deleted);

            // When
            ActivityTypeDTO result = service.delete(testId);

            // Then
            assertNotNull(result);
            assertEquals(ActivityTypeStatus.DELETED, result.getStatus());
            verify(repository).findById(testId);
            verify(repository).delete(testId);
        }

        @Test
        @DisplayName("删除不存在的活动类型时抛出异常")
        void shouldThrowExceptionWhenDeletingNonExistentActivityType() {
            // Given
            when(repository.findById(testId)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(ResourceNotFoundException.class, () -> service.delete(testId));
            verify(repository).findById(testId);
            verify(repository, never()).delete(any());
        }
    }

    // ========== Helper Methods ==========

    private ActivityType createMockActivityType(UUID id, String name, ActivityTypeStatus status, Integer sort) {
        ActivityType activityType = new ActivityType();
        activityType.setId(id);
        activityType.setName(name);
        activityType.setDescription("描述");
        activityType.setStatus(status);
        activityType.setSort(sort);
        activityType.setCreatedAt(Instant.now());
        activityType.setUpdatedAt(Instant.now());
        return activityType;
    }
}




