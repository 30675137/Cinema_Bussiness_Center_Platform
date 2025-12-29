package com.cinema.hallstore.controller;

import com.cinema.hallstore.domain.enums.ActivityTypeStatus;
import com.cinema.hallstore.dto.ActivityTypeDTO;
import com.cinema.hallstore.dto.ActivityTypeListResponse;
import com.cinema.hallstore.dto.CreateActivityTypeRequest;
import com.cinema.hallstore.dto.UpdateActivityTypeRequest;
import com.cinema.hallstore.dto.UpdateActivityTypeStatusRequest;
import com.cinema.hallstore.exception.ResourceNotFoundException;
import com.cinema.hallstore.service.ActivityTypeService;
import com.fasterxml.jackson.databind.ObjectMapper;
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
 * ActivityTypeController 集成测试
 * 验证活动类型查询接口
 */
@SpringBootTest
@AutoConfigureMockMvc
class ActivityTypeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ActivityTypeService service;

    private UUID testId;
    private ActivityTypeDTO testActivityType;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();
        testActivityType = createMockActivityTypeDTO(testId, "企业团建", ActivityTypeStatus.ENABLED, 1);
    }

    @Nested
    @DisplayName("GET /api/activity-types - 获取活动类型列表")
    class GetActivityTypesTests {

        @Test
        @DisplayName("成功获取活动类型列表（无状态过滤）")
        void shouldGetActivityTypes() throws Exception {
            // Given
            ActivityTypeDTO type1 = createMockActivityTypeDTO(UUID.randomUUID(), "企业团建", ActivityTypeStatus.ENABLED, 1);
            ActivityTypeDTO type2 = createMockActivityTypeDTO(UUID.randomUUID(), "订婚", ActivityTypeStatus.DISABLED, 2);
            List<ActivityTypeDTO> types = List.of(type1, type2);

            when(service.findAll(null)).thenReturn(types);

            // When & Then
            mockMvc.perform(get("/api/activity-types"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", is(notNullValue())))
                    .andExpect(jsonPath("$.data", hasSize(2)))
                    .andExpect(jsonPath("$.data[0].name", is("企业团建")))
                    .andExpect(jsonPath("$.data[1].name", is("订婚")))
                    .andExpect(jsonPath("$.total", is(2)));
        }

        @Test
        @DisplayName("成功获取启用状态的活动类型列表")
        void shouldGetEnabledActivityTypes() throws Exception {
            // Given
            ActivityTypeDTO type1 = createMockActivityTypeDTO(UUID.randomUUID(), "企业团建", ActivityTypeStatus.ENABLED, 1);
            List<ActivityTypeDTO> types = List.of(type1);

            when(service.findAll(ActivityTypeStatus.ENABLED)).thenReturn(types);

            // When & Then
            mockMvc.perform(get("/api/activity-types")
                    .param("status", "ENABLED"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", hasSize(1)))
                    .andExpect(jsonPath("$.data[0].status", is("ENABLED")))
                    .andExpect(jsonPath("$.total", is(1)));
        }

        @Test
        @DisplayName("返回空列表时结构正确")
        void shouldReturnEmptyList() throws Exception {
            // Given
            when(service.findAll(null)).thenReturn(List.of());

            // When & Then
            mockMvc.perform(get("/api/activity-types"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", is(notNullValue())))
                    .andExpect(jsonPath("$.data", hasSize(0)))
                    .andExpect(jsonPath("$.total", is(0)));
        }

        @Test
        @DisplayName("返回的活动类型字段结构正确")
        void shouldReturnCorrectActivityTypeFields() throws Exception {
            // Given
            List<ActivityTypeDTO> types = List.of(testActivityType);
            when(service.findAll(null)).thenReturn(types);

            // When & Then
            mockMvc.perform(get("/api/activity-types"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data[0].id", is(testId.toString())))
                    .andExpect(jsonPath("$.data[0].name", is("企业团建")))
                    .andExpect(jsonPath("$.data[0].status", is("ENABLED")))
                    .andExpect(jsonPath("$.data[0].sort", is(1)))
                    .andExpect(jsonPath("$.data[0].createdAt", notNullValue()))
                    .andExpect(jsonPath("$.data[0].updatedAt", notNullValue()));
        }
    }

    @Nested
    @DisplayName("GET /api/activity-types/{id} - 获取单个活动类型")
    class GetActivityTypeByIdTests {

        @Test
        @DisplayName("成功获取单个活动类型")
        void shouldGetActivityTypeById() throws Exception {
            // Given
            when(service.findById(testId)).thenReturn(testActivityType);

            // When & Then
            mockMvc.perform(get("/api/activity-types/{id}", testId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id", is(testId.toString())))
                    .andExpect(jsonPath("$.data.name", is("企业团建")))
                    .andExpect(jsonPath("$.data.status", is("ENABLED")))
                    .andExpect(jsonPath("$.timestamp", notNullValue()));
        }

        @Test
        @DisplayName("活动类型不存在返回404")
        void shouldReturn404WhenActivityTypeNotFound() throws Exception {
            // Given
            when(service.findById(testId))
                    .thenThrow(new ResourceNotFoundException("活动类型", testId.toString()));

            // When & Then
            mockMvc.perform(get("/api/activity-types/{id}", testId))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error", is("NOT_FOUND")));
        }
    }

    @Nested
    @DisplayName("GET /api/activity-types/enabled - 获取启用状态的活动类型列表（小程序端）")
    class GetEnabledActivityTypesTests {

        @Test
        @DisplayName("成功获取启用状态的活动类型列表")
        void shouldGetEnabledActivityTypes() throws Exception {
            // Given
            ActivityTypeDTO type1 = createMockActivityTypeDTO(UUID.randomUUID(), "企业团建", ActivityTypeStatus.ENABLED, 1);
            ActivityTypeDTO type2 = createMockActivityTypeDTO(UUID.randomUUID(), "订婚", ActivityTypeStatus.ENABLED, 2);
            List<ActivityTypeDTO> types = List.of(type1, type2);

            when(service.findEnabled()).thenReturn(types);

            // When & Then
            mockMvc.perform(get("/api/activity-types/enabled"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", hasSize(2)))
                    .andExpect(jsonPath("$.data[0].status", is("ENABLED")))
                    .andExpect(jsonPath("$.data[1].status", is("ENABLED")))
                    .andExpect(jsonPath("$.total", is(2)));
        }
    }

    @Nested
    @DisplayName("POST /api/activity-types - 创建活动类型")
    class CreateActivityTypeTests {

        @Test
        @DisplayName("成功创建活动类型")
        void shouldCreateActivityType() throws Exception {
            // Given
            CreateActivityTypeRequest request = new CreateActivityTypeRequest();
            request.setName("生日Party");
            request.setDescription("生日聚会活动");
            request.setSort(3);

            ActivityTypeDTO created = createMockActivityTypeDTO(UUID.randomUUID(), "生日Party", ActivityTypeStatus.ENABLED, 3);
            when(service.create(any(CreateActivityTypeRequest.class))).thenReturn(created);

            // When & Then
            mockMvc.perform(post("/api/activity-types")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(new ObjectMapper().writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.id", notNullValue()))
                    .andExpect(jsonPath("$.data.name", is("生日Party")))
                    .andExpect(jsonPath("$.data.description", is("生日聚会活动")))
                    .andExpect(jsonPath("$.data.status", is("ENABLED"))) // 默认启用
                    .andExpect(jsonPath("$.data.sort", is(3)))
                    .andExpect(jsonPath("$.timestamp", notNullValue()));
        }

        @Test
        @DisplayName("验证失败返回400")
        void shouldReturn400WhenValidationFails() throws Exception {
            // Given
            CreateActivityTypeRequest request = new CreateActivityTypeRequest();
            request.setName(""); // Invalid: empty name
            request.setSort(1);

            // When & Then
            mockMvc.perform(post("/api/activity-types")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(new ObjectMapper().writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("名称已存在返回409")
        void shouldReturn409WhenNameExists() throws Exception {
            // Given
            CreateActivityTypeRequest request = new CreateActivityTypeRequest();
            request.setName("企业团建");
            request.setSort(1);

            when(service.create(any(CreateActivityTypeRequest.class)))
                    .thenThrow(new com.cinema.hallstore.exception.ResourceConflictException("活动类型名称已存在: 企业团建"));

            // When & Then
            mockMvc.perform(post("/api/activity-types")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(new ObjectMapper().writeValueAsString(request)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.error", is("CONFLICT")));
        }

        @Test
        @DisplayName("创建时默认状态为启用")
        void shouldSetDefaultStatusToEnabled() throws Exception {
            // Given
            CreateActivityTypeRequest request = new CreateActivityTypeRequest();
            request.setName("新活动类型");
            request.setSort(1);

            ActivityTypeDTO created = createMockActivityTypeDTO(UUID.randomUUID(), "新活动类型", ActivityTypeStatus.ENABLED, 1);
            when(service.create(any(CreateActivityTypeRequest.class))).thenReturn(created);

            // When & Then
            mockMvc.perform(post("/api/activity-types")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(new ObjectMapper().writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.status", is("ENABLED")));
        }
    }

    @Nested
    @DisplayName("PUT /api/activity-types/{id} - 更新活动类型")
    class UpdateActivityTypeTests {

        @Test
        @DisplayName("成功更新活动类型")
        void shouldUpdateActivityType() throws Exception {
            // Given
            UpdateActivityTypeRequest request = new UpdateActivityTypeRequest();
            request.setName("企业团建（更新）");
            request.setDescription("更新后的描述");
            request.setSort(5);

            ActivityTypeDTO updated = createMockActivityTypeDTO(testId, "企业团建（更新）", ActivityTypeStatus.ENABLED, 5);
            when(service.update(eq(testId), any(UpdateActivityTypeRequest.class))).thenReturn(updated);

            // When & Then
            mockMvc.perform(put("/api/activity-types/{id}", testId)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(new ObjectMapper().writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id", is(testId.toString())))
                    .andExpect(jsonPath("$.data.name", is("企业团建（更新）")))
                    .andExpect(jsonPath("$.data.sort", is(5)))
                    .andExpect(jsonPath("$.timestamp", notNullValue()));
        }

        @Test
        @DisplayName("验证失败返回400")
        void shouldReturn400WhenValidationFails() throws Exception {
            // Given
            UpdateActivityTypeRequest request = new UpdateActivityTypeRequest();
            request.setName(""); // Invalid: empty name
            request.setSort(1);

            // When & Then
            mockMvc.perform(put("/api/activity-types/{id}", testId)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(new ObjectMapper().writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("名称已存在返回409")
        void shouldReturn409WhenNameExists() throws Exception {
            // Given
            UpdateActivityTypeRequest request = new UpdateActivityTypeRequest();
            request.setName("订婚");
            request.setSort(2);

            when(service.update(eq(testId), any(UpdateActivityTypeRequest.class)))
                    .thenThrow(new com.cinema.hallstore.exception.ResourceConflictException("活动类型名称已存在: 订婚"));

            // When & Then
            mockMvc.perform(put("/api/activity-types/{id}", testId)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(new ObjectMapper().writeValueAsString(request)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.error", is("CONFLICT")));
        }

        @Test
        @DisplayName("活动类型不存在返回404")
        void shouldReturn404WhenActivityTypeNotFound() throws Exception {
            // Given
            UpdateActivityTypeRequest request = new UpdateActivityTypeRequest();
            request.setName("新名称");
            request.setSort(1);

            when(service.update(eq(testId), any(UpdateActivityTypeRequest.class)))
                    .thenThrow(new ResourceNotFoundException("活动类型", testId.toString()));

            // When & Then
            mockMvc.perform(put("/api/activity-types/{id}", testId)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(new ObjectMapper().writeValueAsString(request)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error", is("NOT_FOUND")));
        }
    }

    @Nested
    @DisplayName("PATCH /api/activity-types/{id}/status - 切换活动类型状态")
    class ToggleStatusTests {

        @Test
        @DisplayName("成功切换为停用状态")
        void shouldToggleToDisabled() throws Exception {
            // Given
            UpdateActivityTypeStatusRequest request = new UpdateActivityTypeStatusRequest();
            request.setStatus(ActivityTypeStatus.DISABLED);

            ActivityTypeDTO updated = createMockActivityTypeDTO(testId, "企业团建", ActivityTypeStatus.DISABLED, 1);
            when(service.toggleStatus(eq(testId), eq(ActivityTypeStatus.DISABLED))).thenReturn(updated);

            // When & Then
            mockMvc.perform(patch("/api/activity-types/{id}/status", testId)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(new ObjectMapper().writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.status", is("DISABLED")))
                    .andExpect(jsonPath("$.timestamp", notNullValue()));
        }

        @Test
        @DisplayName("成功切换为启用状态")
        void shouldToggleToEnabled() throws Exception {
            // Given
            UpdateActivityTypeStatusRequest request = new UpdateActivityTypeStatusRequest();
            request.setStatus(ActivityTypeStatus.ENABLED);

            ActivityTypeDTO updated = createMockActivityTypeDTO(testId, "企业团建", ActivityTypeStatus.ENABLED, 1);
            when(service.toggleStatus(eq(testId), eq(ActivityTypeStatus.ENABLED))).thenReturn(updated);

            // When & Then
            mockMvc.perform(patch("/api/activity-types/{id}/status", testId)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(new ObjectMapper().writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.status", is("ENABLED")))
                    .andExpect(jsonPath("$.timestamp", notNullValue()));
        }

        @Test
        @DisplayName("活动类型不存在返回404")
        void shouldReturn404WhenActivityTypeNotFound() throws Exception {
            // Given
            UpdateActivityTypeStatusRequest request = new UpdateActivityTypeStatusRequest();
            request.setStatus(ActivityTypeStatus.DISABLED);

            when(service.toggleStatus(eq(testId), eq(ActivityTypeStatus.DISABLED)))
                    .thenThrow(new ResourceNotFoundException("活动类型", testId.toString()));

            // When & Then
            mockMvc.perform(patch("/api/activity-types/{id}/status", testId)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(new ObjectMapper().writeValueAsString(request)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error", is("NOT_FOUND")));
        }
    }

    @Nested
    @DisplayName("DELETE /api/activity-types/{id} - 删除活动类型")
    class DeleteActivityTypeTests {

        @Test
        @DisplayName("成功删除活动类型（软删除）")
        void shouldDeleteActivityType() throws Exception {
            // Given
            ActivityTypeDTO deleted = createMockActivityTypeDTO(testId, "企业团建", ActivityTypeStatus.DELETED, 1);
            when(service.delete(testId)).thenReturn(deleted);

            // When & Then
            mockMvc.perform(delete("/api/activity-types/{id}", testId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.status", is("DELETED")))
                    .andExpect(jsonPath("$.timestamp", notNullValue()));
        }

        @Test
        @DisplayName("活动类型不存在返回404")
        void shouldReturn404WhenActivityTypeNotFound() throws Exception {
            // Given
            when(service.delete(testId))
                    .thenThrow(new ResourceNotFoundException("活动类型", testId.toString()));

            // When & Then
            mockMvc.perform(delete("/api/activity-types/{id}", testId))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error", is("NOT_FOUND")));
        }
    }

    // ========== Helper Methods ==========

    private ActivityTypeDTO createMockActivityTypeDTO(UUID id, String name, ActivityTypeStatus status, Integer sort) {
        ActivityTypeDTO dto = new ActivityTypeDTO();
        dto.setId(id.toString());
        dto.setName(name);
        dto.setDescription("描述");
        dto.setStatus(status);
        dto.setSort(sort);
        dto.setCreatedAt(Instant.now());
        dto.setUpdatedAt(Instant.now());
        return dto;
    }
}

