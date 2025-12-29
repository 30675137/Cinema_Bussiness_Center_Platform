package com.cinema.hallstore.service;

import com.cinema.hallstore.domain.Hall;
import com.cinema.hallstore.domain.enums.HallStatus;
import com.cinema.hallstore.domain.enums.HallType;
import com.cinema.hallstore.dto.CreateHallRequest;
import com.cinema.hallstore.dto.HallDTO;
import com.cinema.hallstore.dto.UpdateHallRequest;
import com.cinema.hallstore.exception.BusinessException;
import com.cinema.hallstore.exception.ResourceConflictException;
import com.cinema.hallstore.exception.ResourceNotFoundException;
import com.cinema.hallstore.repository.HallRepository;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * HallService 单元测试
 * 覆盖：创建、编辑、停用影厅，容量校验、类型枚举、状态流转等规则
 */
@ExtendWith(MockitoExtension.class)
class HallServiceTest {

    @Mock
    private HallRepository hallRepository;

    @InjectMocks
    private HallService hallService;

    private UUID testStoreId;
    private UUID testHallId;

    @BeforeEach
    void setUp() {
        testStoreId = UUID.randomUUID();
        testHallId = UUID.randomUUID();
    }

    @Nested
    @DisplayName("创建影厅测试")
    class CreateHallTests {

        @Test
        @DisplayName("成功创建影厅 - 基本字段")
        void shouldCreateHallSuccessfully() {
            // Given
            CreateHallRequest request = new CreateHallRequest();
            request.setStoreId(testStoreId.toString());
            request.setName("VIP影厅A");
            request.setType(HallType.VIP);
            request.setCapacity(120);

            Hall createdHall = createMockHall(testHallId, testStoreId, "VIP影厅A", HallType.VIP, 120, HallStatus.ACTIVE);
            when(hallRepository.create(any(Hall.class))).thenReturn(createdHall);

            // When
            HallDTO result = hallService.createHall(request);

            // Then
            assertNotNull(result);
            assertEquals(testHallId.toString(), result.getId());
            assertEquals("VIP影厅A", result.getName());
            assertEquals(HallType.VIP, result.getType());
            assertEquals(120, result.getCapacity());
            assertEquals(HallStatus.ACTIVE, result.getStatus());

            verify(hallRepository).create(any(Hall.class));
        }

        @Test
        @DisplayName("创建影厅 - 带标签")
        void shouldCreateHallWithTags() {
            // Given
            CreateHallRequest request = new CreateHallRequest();
            request.setStoreId(testStoreId.toString());
            request.setName("派对厅B");
            request.setType(HallType.PARTY);
            request.setCapacity(50);
            request.setTags(List.of("KTV设备", "真皮沙发"));

            Hall createdHall = createMockHall(testHallId, testStoreId, "派对厅B", HallType.PARTY, 50, HallStatus.ACTIVE);
            createdHall.setTags(List.of("KTV设备", "真皮沙发"));
            when(hallRepository.create(any(Hall.class))).thenReturn(createdHall);

            // When
            HallDTO result = hallService.createHall(request);

            // Then
            assertNotNull(result.getTags());
            assertEquals(2, result.getTags().size());
            assertTrue(result.getTags().contains("KTV设备"));
        }

        @Test
        @DisplayName("创建影厅 - 影厅编码冲突抛出异常")
        void shouldThrowExceptionWhenHallCodeConflicts() {
            // Given
            CreateHallRequest request = new CreateHallRequest();
            request.setStoreId(testStoreId.toString());
            request.setCode("HALL-001");
            request.setName("VIP影厅A");
            request.setType(HallType.VIP);
            request.setCapacity(120);

            when(hallRepository.existsByStoreIdAndCode(testStoreId, "HALL-001", null)).thenReturn(true);

            // When & Then
            ResourceConflictException ex = assertThrows(ResourceConflictException.class,
                    () -> hallService.createHall(request));
            assertTrue(ex.getMessage().contains("HALL-001"));
        }

        @Test
        @DisplayName("创建影厅 - 无效门店ID格式抛出异常")
        void shouldThrowExceptionForInvalidStoreIdFormat() {
            // Given
            CreateHallRequest request = new CreateHallRequest();
            request.setStoreId("invalid-uuid");
            request.setName("VIP影厅A");
            request.setType(HallType.VIP);
            request.setCapacity(120);

            // When & Then
            BusinessException ex = assertThrows(BusinessException.class,
                    () -> hallService.createHall(request));
            assertEquals("VALIDATION_ERROR", ex.getErrorCode());
        }
    }

    @Nested
    @DisplayName("容量校验测试")
    class CapacityValidationTests {

        @Test
        @DisplayName("容量为0时抛出异常")
        void shouldThrowExceptionWhenCapacityIsZero() {
            // Given
            CreateHallRequest request = new CreateHallRequest();
            request.setStoreId(testStoreId.toString());
            request.setName("测试影厅");
            request.setType(HallType.PUBLIC);
            request.setCapacity(0);

            // When & Then
            BusinessException ex = assertThrows(BusinessException.class,
                    () -> hallService.createHall(request));
            assertTrue(ex.getMessage().contains("正整数"));
        }

        @Test
        @DisplayName("容量为负数时抛出异常")
        void shouldThrowExceptionWhenCapacityIsNegative() {
            // Given
            CreateHallRequest request = new CreateHallRequest();
            request.setStoreId(testStoreId.toString());
            request.setName("测试影厅");
            request.setType(HallType.PUBLIC);
            request.setCapacity(-10);

            // When & Then
            BusinessException ex = assertThrows(BusinessException.class,
                    () -> hallService.createHall(request));
            assertTrue(ex.getMessage().contains("正整数"));
        }

        @Test
        @DisplayName("容量超过1000时抛出异常")
        void shouldThrowExceptionWhenCapacityExceedsMax() {
            // Given
            CreateHallRequest request = new CreateHallRequest();
            request.setStoreId(testStoreId.toString());
            request.setName("超大影厅");
            request.setType(HallType.PUBLIC);
            request.setCapacity(1001);

            // When & Then
            BusinessException ex = assertThrows(BusinessException.class,
                    () -> hallService.createHall(request));
            assertTrue(ex.getMessage().contains("1000"));
        }

        @Test
        @DisplayName("容量刚好为1000时成功")
        void shouldSucceedWhenCapacityIsExactly1000() {
            // Given
            CreateHallRequest request = new CreateHallRequest();
            request.setStoreId(testStoreId.toString());
            request.setName("大型影厅");
            request.setType(HallType.PUBLIC);
            request.setCapacity(1000);

            Hall createdHall = createMockHall(testHallId, testStoreId, "大型影厅", HallType.PUBLIC, 1000, HallStatus.ACTIVE);
            when(hallRepository.create(any(Hall.class))).thenReturn(createdHall);

            // When
            HallDTO result = hallService.createHall(request);

            // Then
            assertEquals(1000, result.getCapacity());
        }
    }

    @Nested
    @DisplayName("更新影厅测试")
    class UpdateHallTests {

        @Test
        @DisplayName("成功更新影厅名称和容量")
        void shouldUpdateHallSuccessfully() {
            // Given
            Hall existingHall = createMockHall(testHallId, testStoreId, "旧名称", HallType.VIP, 100, HallStatus.ACTIVE);
            when(hallRepository.findById(testHallId)).thenReturn(Optional.of(existingHall));

            Hall updatedHall = createMockHall(testHallId, testStoreId, "新名称", HallType.VIP, 150, HallStatus.ACTIVE);
            when(hallRepository.update(eq(testHallId), any(Hall.class))).thenReturn(updatedHall);

            UpdateHallRequest request = new UpdateHallRequest();
            request.setName("新名称");
            request.setCapacity(150);

            // When
            HallDTO result = hallService.updateHall(testHallId, request);

            // Then
            assertEquals("新名称", result.getName());
            assertEquals(150, result.getCapacity());
        }

        @Test
        @DisplayName("更新不存在的影厅抛出异常")
        void shouldThrowExceptionWhenHallNotFound() {
            // Given
            when(hallRepository.findById(testHallId)).thenReturn(Optional.empty());

            UpdateHallRequest request = new UpdateHallRequest();
            request.setName("新名称");

            // When & Then
            assertThrows(ResourceNotFoundException.class,
                    () -> hallService.updateHall(testHallId, request));
        }

        @Test
        @DisplayName("更新影厅编码冲突抛出异常")
        void shouldThrowExceptionWhenUpdatedCodeConflicts() {
            // Given
            Hall existingHall = createMockHall(testHallId, testStoreId, "旧名称", HallType.VIP, 100, HallStatus.ACTIVE);
            when(hallRepository.findById(testHallId)).thenReturn(Optional.of(existingHall));
            when(hallRepository.existsByStoreIdAndCode(testStoreId, "HALL-002", testHallId)).thenReturn(true);

            UpdateHallRequest request = new UpdateHallRequest();
            request.setCode("HALL-002");

            // When & Then
            ResourceConflictException ex = assertThrows(ResourceConflictException.class,
                    () -> hallService.updateHall(testHallId, request));
            assertTrue(ex.getMessage().contains("HALL-002"));
        }
    }

    @Nested
    @DisplayName("状态流转测试")
    class StatusTransitionTests {

        @Test
        @DisplayName("成功停用启用状态的影厅")
        void shouldDeactivateActiveHall() {
            // Given
            Hall activeHall = createMockHall(testHallId, testStoreId, "VIP影厅", HallType.VIP, 100, HallStatus.ACTIVE);
            when(hallRepository.findById(testHallId)).thenReturn(Optional.of(activeHall));

            Hall inactiveHall = createMockHall(testHallId, testStoreId, "VIP影厅", HallType.VIP, 100, HallStatus.INACTIVE);
            when(hallRepository.update(eq(testHallId), any(Hall.class))).thenReturn(inactiveHall);

            // When
            HallDTO result = hallService.deactivateHall(testHallId);

            // Then
            assertEquals(HallStatus.INACTIVE, result.getStatus());
        }

        @Test
        @DisplayName("重复停用已停用的影厅抛出异常")
        void shouldThrowExceptionWhenDeactivatingInactiveHall() {
            // Given
            Hall inactiveHall = createMockHall(testHallId, testStoreId, "VIP影厅", HallType.VIP, 100, HallStatus.INACTIVE);
            when(hallRepository.findById(testHallId)).thenReturn(Optional.of(inactiveHall));

            // When & Then
            BusinessException ex = assertThrows(BusinessException.class,
                    () -> hallService.deactivateHall(testHallId));
            assertEquals("INVALID_STATE", ex.getErrorCode());
        }

        @Test
        @DisplayName("成功启用停用状态的影厅")
        void shouldActivateInactiveHall() {
            // Given
            Hall inactiveHall = createMockHall(testHallId, testStoreId, "VIP影厅", HallType.VIP, 100, HallStatus.INACTIVE);
            when(hallRepository.findById(testHallId)).thenReturn(Optional.of(inactiveHall));

            Hall activeHall = createMockHall(testHallId, testStoreId, "VIP影厅", HallType.VIP, 100, HallStatus.ACTIVE);
            when(hallRepository.update(eq(testHallId), any(Hall.class))).thenReturn(activeHall);

            // When
            HallDTO result = hallService.activateHall(testHallId);

            // Then
            assertEquals(HallStatus.ACTIVE, result.getStatus());
        }

        @Test
        @DisplayName("重复启用已启用的影厅抛出异常")
        void shouldThrowExceptionWhenActivatingActiveHall() {
            // Given
            Hall activeHall = createMockHall(testHallId, testStoreId, "VIP影厅", HallType.VIP, 100, HallStatus.ACTIVE);
            when(hallRepository.findById(testHallId)).thenReturn(Optional.of(activeHall));

            // When & Then
            BusinessException ex = assertThrows(BusinessException.class,
                    () -> hallService.activateHall(testHallId));
            assertEquals("INVALID_STATE", ex.getErrorCode());
        }
    }

    @Nested
    @DisplayName("查询影厅测试")
    class QueryHallTests {

        @Test
        @DisplayName("按门店查询影厅列表")
        void shouldGetHallsByStore() {
            // Given
            List<Hall> halls = List.of(
                    createMockHall(UUID.randomUUID(), testStoreId, "影厅A", HallType.VIP, 100, HallStatus.ACTIVE),
                    createMockHall(UUID.randomUUID(), testStoreId, "影厅B", HallType.PUBLIC, 200, HallStatus.ACTIVE)
            );
            when(hallRepository.findByStoreId(testStoreId, null, null)).thenReturn(halls);

            // When
            List<HallDTO> result = hallService.getHallsByStore(testStoreId, null, null);

            // Then
            assertEquals(2, result.size());
        }

        @Test
        @DisplayName("按门店和状态查询影厅列表")
        void shouldGetHallsByStoreAndStatus() {
            // Given
            List<Hall> halls = List.of(
                    createMockHall(UUID.randomUUID(), testStoreId, "活动影厅", HallType.VIP, 100, HallStatus.ACTIVE)
            );
            when(hallRepository.findByStoreId(testStoreId, HallStatus.ACTIVE, null)).thenReturn(halls);

            // When
            List<HallDTO> result = hallService.getHallsByStore(testStoreId, HallStatus.ACTIVE, null);

            // Then
            assertEquals(1, result.size());
            assertEquals(HallStatus.ACTIVE, result.get(0).getStatus());
        }

        @Test
        @DisplayName("根据ID获取影厅详情")
        void shouldGetHallById() {
            // Given
            Hall hall = createMockHall(testHallId, testStoreId, "VIP影厅A", HallType.VIP, 120, HallStatus.ACTIVE);
            when(hallRepository.findById(testHallId)).thenReturn(Optional.of(hall));

            // When
            HallDTO result = hallService.getHallById(testHallId);

            // Then
            assertEquals(testHallId.toString(), result.getId());
            assertEquals("VIP影厅A", result.getName());
        }

        @Test
        @DisplayName("获取不存在的影厅抛出异常")
        void shouldThrowExceptionWhenHallNotFoundById() {
            // Given
            when(hallRepository.findById(testHallId)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(ResourceNotFoundException.class,
                    () -> hallService.getHallById(testHallId));
        }
    }

    // ========== Helper Methods ==========

    private Hall createMockHall(UUID id, UUID storeId, String name, HallType type, int capacity, HallStatus status) {
        Hall hall = new Hall();
        hall.setId(id);
        hall.setStoreId(storeId);
        hall.setName(name);
        hall.setType(type);
        hall.setCapacity(capacity);
        hall.setStatus(status);
        hall.setCreatedAt(Instant.now());
        hall.setUpdatedAt(Instant.now());
        return hall;
    }
}
