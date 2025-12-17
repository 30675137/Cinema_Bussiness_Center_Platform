package com.cinema.hallstore.controller;

import com.cinema.hallstore.domain.Hall;
import com.cinema.hallstore.domain.enums.HallStatus;
import com.cinema.hallstore.domain.enums.HallType;
import com.cinema.hallstore.repository.HallRepository;
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
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * HallQueryController 集成测试
 * 验证按门店查询影厅列表时返回数据与 DTO/前端类型一致
 */
@SpringBootTest
@AutoConfigureMockMvc
class HallQueryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private HallRepository hallRepository;

    private UUID testStoreId;

    @BeforeEach
    void setUp() {
        testStoreId = UUID.randomUUID();
    }

    @Nested
    @DisplayName("GET /api/stores/{storeId}/halls - 按门店查询影厅列表")
    class GetHallsByStoreTests {

        @Test
        @DisplayName("成功返回门店下所有影厅")
        void shouldReturnAllHallsForStore() throws Exception {
            // Given
            UUID hallId1 = UUID.randomUUID();
            UUID hallId2 = UUID.randomUUID();
            List<Hall> halls = List.of(
                    createMockHall(hallId1, testStoreId, "VIP影厅A", HallType.VIP, 120, HallStatus.ACTIVE, List.of("真皮沙发")),
                    createMockHall(hallId2, testStoreId, "公众厅B", HallType.PUBLIC, 200, HallStatus.ACTIVE, List.of())
            );
            when(hallRepository.findByStoreId(testStoreId, null, null)).thenReturn(halls);

            // When & Then
            mockMvc.perform(get("/api/stores/{storeId}/halls", testStoreId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(2)))
                    .andExpect(jsonPath("$.total", is(2)))
                    // 验证第一个影厅的字段结构与前端 Hall 类型对齐
                    .andExpect(jsonPath("$.data[0].id", is(hallId1.toString())))
                    .andExpect(jsonPath("$.data[0].name", is("VIP影厅A")))
                    .andExpect(jsonPath("$.data[0].capacity", is(120)))
                    .andExpect(jsonPath("$.data[0].type", is("VIP")))
                    .andExpect(jsonPath("$.data[0].status", is("active")))
                    .andExpect(jsonPath("$.data[0].tags", hasSize(1)))
                    .andExpect(jsonPath("$.data[0].createdAt", notNullValue()))
                    .andExpect(jsonPath("$.data[0].updatedAt", notNullValue()));
        }

        @Test
        @DisplayName("门店下没有影厅时返回空数组")
        void shouldReturnEmptyArrayWhenNoHalls() throws Exception {
            // Given
            when(hallRepository.findByStoreId(testStoreId, null, null)).thenReturn(List.of());

            // When & Then
            mockMvc.perform(get("/api/stores/{storeId}/halls", testStoreId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(0)))
                    .andExpect(jsonPath("$.total", is(0)));
        }

        @Test
        @DisplayName("按状态筛选影厅列表")
        void shouldFilterHallsByStatus() throws Exception {
            // Given
            UUID hallId = UUID.randomUUID();
            List<Hall> activeHalls = List.of(
                    createMockHall(hallId, testStoreId, "活动影厅", HallType.VIP, 100, HallStatus.ACTIVE, List.of())
            );
            when(hallRepository.findByStoreId(eq(testStoreId), eq(HallStatus.ACTIVE), any())).thenReturn(activeHalls);

            // When & Then
            mockMvc.perform(get("/api/stores/{storeId}/halls", testStoreId)
                            .param("status", "ACTIVE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(1)))
                    .andExpect(jsonPath("$.data[0].status", is("active")));
        }

        @Test
        @DisplayName("按类型筛选影厅列表")
        void shouldFilterHallsByType() throws Exception {
            // Given
            UUID hallId = UUID.randomUUID();
            List<Hall> vipHalls = List.of(
                    createMockHall(hallId, testStoreId, "VIP厅", HallType.VIP, 80, HallStatus.ACTIVE, List.of())
            );
            when(hallRepository.findByStoreId(eq(testStoreId), any(), eq(HallType.VIP))).thenReturn(vipHalls);

            // When & Then
            mockMvc.perform(get("/api/stores/{storeId}/halls", testStoreId)
                            .param("type", "VIP"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(1)))
                    .andExpect(jsonPath("$.data[0].type", is("VIP")));
        }

        @Test
        @DisplayName("同时按状态和类型筛选影厅列表")
        void shouldFilterHallsByStatusAndType() throws Exception {
            // Given
            UUID hallId = UUID.randomUUID();
            List<Hall> filteredHalls = List.of(
                    createMockHall(hallId, testStoreId, "VIP活动厅", HallType.VIP, 100, HallStatus.ACTIVE, List.of())
            );
            when(hallRepository.findByStoreId(testStoreId, HallStatus.ACTIVE, HallType.VIP)).thenReturn(filteredHalls);

            // When & Then
            mockMvc.perform(get("/api/stores/{storeId}/halls", testStoreId)
                            .param("status", "ACTIVE")
                            .param("type", "VIP"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(1)))
                    .andExpect(jsonPath("$.data[0].type", is("VIP")))
                    .andExpect(jsonPath("$.data[0].status", is("active")));
        }

        @Test
        @DisplayName("返回的 Hall 字段结构与前端类型定义一致")
        void shouldReturnHallFieldsMatchingFrontendType() throws Exception {
            // Given
            UUID hallId = UUID.randomUUID();
            Hall hall = createMockHall(hallId, testStoreId, "测试影厅", HallType.CP, 60, HallStatus.MAINTENANCE, List.of("KTV设备", "投影仪"));
            when(hallRepository.findByStoreId(testStoreId, null, null)).thenReturn(List.of(hall));

            // When & Then
            // 验证返回的 Hall 结构包含前端所需的所有字段：
            // id, name, capacity, type, tags, status, createdAt, updatedAt
            mockMvc.perform(get("/api/stores/{storeId}/halls", testStoreId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data[0].id").exists())
                    .andExpect(jsonPath("$.data[0].name").exists())
                    .andExpect(jsonPath("$.data[0].capacity").exists())
                    .andExpect(jsonPath("$.data[0].type").exists())
                    .andExpect(jsonPath("$.data[0].tags").exists())
                    .andExpect(jsonPath("$.data[0].status").exists())
                    .andExpect(jsonPath("$.data[0].createdAt").exists())
                    .andExpect(jsonPath("$.data[0].updatedAt").exists())
                    // 验证字段类型正确
                    .andExpect(jsonPath("$.data[0].id", is(hallId.toString())))
                    .andExpect(jsonPath("$.data[0].name", is("测试影厅")))
                    .andExpect(jsonPath("$.data[0].capacity", is(60)))
                    .andExpect(jsonPath("$.data[0].type", is("CP")))
                    .andExpect(jsonPath("$.data[0].status", is("maintenance")))
                    .andExpect(jsonPath("$.data[0].tags", hasSize(2)));
        }

        @Test
        @DisplayName("返回多种类型和状态的影厅列表")
        void shouldReturnHallsWithVariousTypesAndStatuses() throws Exception {
            // Given
            List<Hall> halls = List.of(
                    createMockHall(UUID.randomUUID(), testStoreId, "VIP厅", HallType.VIP, 50, HallStatus.ACTIVE, List.of()),
                    createMockHall(UUID.randomUUID(), testStoreId, "CP厅", HallType.CP, 80, HallStatus.INACTIVE, List.of()),
                    createMockHall(UUID.randomUUID(), testStoreId, "Party厅", HallType.PARTY, 100, HallStatus.MAINTENANCE, List.of()),
                    createMockHall(UUID.randomUUID(), testStoreId, "公众厅", HallType.PUBLIC, 200, HallStatus.ACTIVE, List.of())
            );
            when(hallRepository.findByStoreId(testStoreId, null, null)).thenReturn(halls);

            // When & Then
            mockMvc.perform(get("/api/stores/{storeId}/halls", testStoreId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(4)))
                    .andExpect(jsonPath("$.total", is(4)))
                    // 验证不同类型
                    .andExpect(jsonPath("$.data[*].type", containsInAnyOrder("VIP", "CP", "Party", "Public")))
                    // 验证不同状态
                    .andExpect(jsonPath("$.data[*].status", containsInAnyOrder("active", "inactive", "maintenance", "active")));
        }
    }

    // ========== Helper Methods ==========

    private Hall createMockHall(UUID id, UUID storeId, String name, HallType type, int capacity, HallStatus status, List<String> tags) {
        Hall hall = new Hall();
        hall.setId(id);
        hall.setStoreId(storeId);
        hall.setName(name);
        hall.setType(type);
        hall.setCapacity(capacity);
        hall.setStatus(status);
        hall.setTags(tags);
        hall.setCreatedAt(Instant.now());
        hall.setUpdatedAt(Instant.now());
        return hall;
    }
}
