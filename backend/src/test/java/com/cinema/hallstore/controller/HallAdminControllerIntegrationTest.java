package com.cinema.hallstore.controller;

import com.cinema.hallstore.domain.Hall;
import com.cinema.hallstore.domain.enums.HallStatus;
import com.cinema.hallstore.domain.enums.HallType;
import com.cinema.hallstore.dto.CreateHallRequest;
import com.cinema.hallstore.dto.UpdateHallRequest;
import com.cinema.hallstore.repository.HallRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
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
 * HallAdminController 集成测试
 * 验证通过 HTTP 调用完成影厅创建与状态更新
 */
@SpringBootTest
@AutoConfigureMockMvc
class HallAdminControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private HallRepository hallRepository;

    private UUID testStoreId;
    private UUID testHallId;

    @BeforeEach
    void setUp() {
        testStoreId = UUID.randomUUID();
        testHallId = UUID.randomUUID();
    }

    @Test
    @DisplayName("POST /api/admin/halls - 成功创建影厅并返回201")
    void shouldCreateHallAndReturn201() throws Exception {
        // Given
        CreateHallRequest request = new CreateHallRequest();
        request.setStoreId(testStoreId.toString());
        request.setName("VIP影厅A");
        request.setType(HallType.VIP);
        request.setCapacity(120);
        request.setTags(List.of("真皮沙发"));

        Hall createdHall = createMockHall(testHallId, testStoreId, "VIP影厅A", HallType.VIP, 120, HallStatus.ACTIVE);
        createdHall.setTags(List.of("真皮沙发"));
        when(hallRepository.existsByStoreIdAndCode(any(), any(), any())).thenReturn(false);
        when(hallRepository.create(any(Hall.class))).thenReturn(createdHall);

        // When & Then
        mockMvc.perform(post("/api/admin/halls")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id", is(testHallId.toString())))
                .andExpect(jsonPath("$.data.name", is("VIP影厅A")))
                .andExpect(jsonPath("$.data.type", is("VIP")))
                .andExpect(jsonPath("$.data.capacity", is(120)))
                .andExpect(jsonPath("$.data.status", is("ACTIVE")))
                .andExpect(jsonPath("$.data.tags", hasSize(1)));
    }

    @Test
    @DisplayName("POST /api/admin/halls - 缺少必填字段返回400")
    void shouldReturn400WhenMissingRequiredFields() throws Exception {
        // Given
        CreateHallRequest request = new CreateHallRequest();
        request.setStoreId(testStoreId.toString());
        // missing name, type, capacity

        // When & Then
        mockMvc.perform(post("/api/admin/halls")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("VALIDATION_ERROR")));
    }

    @Test
    @DisplayName("POST /api/admin/halls - 容量超限返回400")
    void shouldReturn400WhenCapacityExceedsLimit() throws Exception {
        // Given
        CreateHallRequest request = new CreateHallRequest();
        request.setStoreId(testStoreId.toString());
        request.setName("超大影厅");
        request.setType(HallType.PUBLIC);
        request.setCapacity(1001); // exceeds 1000

        // When & Then
        mockMvc.perform(post("/api/admin/halls")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/admin/halls/{hallId} - 成功获取影厅详情")
    void shouldGetHallDetails() throws Exception {
        // Given
        Hall hall = createMockHall(testHallId, testStoreId, "VIP影厅A", HallType.VIP, 120, HallStatus.ACTIVE);
        when(hallRepository.findById(testHallId)).thenReturn(Optional.of(hall));

        // When & Then
        mockMvc.perform(get("/api/admin/halls/{hallId}", testHallId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id", is(testHallId.toString())))
                .andExpect(jsonPath("$.data.name", is("VIP影厅A")));
    }

    @Test
    @DisplayName("GET /api/admin/halls/{hallId} - 影厅不存在返回404")
    void shouldReturn404WhenHallNotFound() throws Exception {
        // Given
        when(hallRepository.findById(testHallId)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/admin/halls/{hallId}", testHallId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error", is("NOT_FOUND")));
    }

    @Test
    @DisplayName("PUT /api/admin/halls/{hallId} - 成功更新影厅")
    void shouldUpdateHallSuccessfully() throws Exception {
        // Given
        Hall existingHall = createMockHall(testHallId, testStoreId, "旧名称", HallType.VIP, 100, HallStatus.ACTIVE);
        when(hallRepository.findById(testHallId)).thenReturn(Optional.of(existingHall));

        Hall updatedHall = createMockHall(testHallId, testStoreId, "新名称", HallType.VIP, 150, HallStatus.ACTIVE);
        when(hallRepository.update(eq(testHallId), any(Hall.class))).thenReturn(updatedHall);

        UpdateHallRequest request = new UpdateHallRequest();
        request.setName("新名称");
        request.setCapacity(150);

        // When & Then
        mockMvc.perform(put("/api/admin/halls/{hallId}", testHallId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name", is("新名称")))
                .andExpect(jsonPath("$.data.capacity", is(150)));
    }

    @Test
    @DisplayName("PUT /api/admin/halls/{hallId} - 更新不存在的影厅返回404")
    void shouldReturn404WhenUpdatingNonExistentHall() throws Exception {
        // Given
        when(hallRepository.findById(testHallId)).thenReturn(Optional.empty());

        UpdateHallRequest request = new UpdateHallRequest();
        request.setName("新名称");

        // When & Then
        mockMvc.perform(put("/api/admin/halls/{hallId}", testHallId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/admin/halls/{hallId}/deactivate - 成功停用影厅")
    void shouldDeactivateHallSuccessfully() throws Exception {
        // Given
        Hall activeHall = createMockHall(testHallId, testStoreId, "VIP影厅", HallType.VIP, 100, HallStatus.ACTIVE);
        when(hallRepository.findById(testHallId)).thenReturn(Optional.of(activeHall));

        Hall inactiveHall = createMockHall(testHallId, testStoreId, "VIP影厅", HallType.VIP, 100, HallStatus.INACTIVE);
        when(hallRepository.update(eq(testHallId), any(Hall.class))).thenReturn(inactiveHall);

        // When & Then
        mockMvc.perform(post("/api/admin/halls/{hallId}/deactivate", testHallId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("INACTIVE")));
    }

    @Test
    @DisplayName("POST /api/admin/halls/{hallId}/activate - 成功启用影厅")
    void shouldActivateHallSuccessfully() throws Exception {
        // Given
        Hall inactiveHall = createMockHall(testHallId, testStoreId, "VIP影厅", HallType.VIP, 100, HallStatus.INACTIVE);
        when(hallRepository.findById(testHallId)).thenReturn(Optional.of(inactiveHall));

        Hall activeHall = createMockHall(testHallId, testStoreId, "VIP影厅", HallType.VIP, 100, HallStatus.ACTIVE);
        when(hallRepository.update(eq(testHallId), any(Hall.class))).thenReturn(activeHall);

        // When & Then
        mockMvc.perform(post("/api/admin/halls/{hallId}/activate", testHallId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("ACTIVE")));
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
