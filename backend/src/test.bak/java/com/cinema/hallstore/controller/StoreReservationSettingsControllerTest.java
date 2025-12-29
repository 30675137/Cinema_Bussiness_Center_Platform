package com.cinema.hallstore.controller;

import com.cinema.hallstore.dto.StoreReservationSettingsDTO;
import com.cinema.hallstore.dto.UpdateStoreReservationSettingsRequest;
import com.cinema.hallstore.exception.ResourceNotFoundException;
import com.cinema.hallstore.service.StoreReservationSettingsService;
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
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * StoreReservationSettingsController 集成测试
 * 验证门店预约设置查询接口
 */
@SpringBootTest
@AutoConfigureMockMvc
class StoreReservationSettingsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StoreReservationSettingsService service;

    private UUID testStoreId;

    @BeforeEach
    void setUp() {
        testStoreId = UUID.randomUUID();
    }

    @Nested
    @DisplayName("GET /api/stores/{storeId}/reservation-settings - 获取门店预约设置")
    class GetSettingsTests {

        @Test
        @DisplayName("成功获取门店预约设置")
        void shouldGetReservationSettings() throws Exception {
            // Given
            StoreReservationSettingsDTO settings = createMockSettingsDTO(testStoreId, true, 7);
            when(service.getSettings(testStoreId)).thenReturn(settings);

            // When & Then
            mockMvc.perform(get("/api/stores/{storeId}/reservation-settings", testStoreId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id", notNullValue()))
                    .andExpect(jsonPath("$.data.storeId", is(testStoreId.toString())))
                    .andExpect(jsonPath("$.data.isReservationEnabled", is(true)))
                    .andExpect(jsonPath("$.data.maxReservationDays", is(7)))
                    .andExpect(jsonPath("$.data.createdAt", notNullValue()))
                    .andExpect(jsonPath("$.data.updatedAt", notNullValue()))
                    .andExpect(jsonPath("$.timestamp", notNullValue()));
        }

        @Test
        @DisplayName("预约设置不存在返回404")
        void shouldReturn404WhenSettingsNotFound() throws Exception {
            // Given
            when(service.getSettings(testStoreId))
                    .thenThrow(new ResourceNotFoundException("门店预约设置", testStoreId.toString()));

            // When & Then
            mockMvc.perform(get("/api/stores/{storeId}/reservation-settings", testStoreId))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error", is("NOT_FOUND")));
        }

        @Test
        @DisplayName("返回的预约设置字段结构正确")
        void shouldReturnCorrectSettingsFields() throws Exception {
            // Given
            StoreReservationSettingsDTO settings = createMockSettingsDTO(testStoreId, false, 0);
            when(service.getSettings(testStoreId)).thenReturn(settings);

            // When & Then
            mockMvc.perform(get("/api/stores/{storeId}/reservation-settings", testStoreId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.isReservationEnabled", is(false)))
                    .andExpect(jsonPath("$.data.maxReservationDays", is(0)));
        }
    }

    @Nested
    @DisplayName("PUT /api/stores/{storeId}/reservation-settings - 更新门店预约设置")
    class UpdateSettingsTests {

        @Test
        @DisplayName("成功更新门店预约设置")
        void shouldUpdateReservationSettings() throws Exception {
            // Given
            UpdateStoreReservationSettingsRequest request = new UpdateStoreReservationSettingsRequest();
            request.setIsReservationEnabled(true);
            request.setMaxReservationDays(7);

            StoreReservationSettingsDTO updatedSettings = createMockSettingsDTO(testStoreId, true, 7);
            when(service.updateSettings(eq(testStoreId), any(UpdateStoreReservationSettingsRequest.class)))
                    .thenReturn(updatedSettings);

            // When & Then
            mockMvc.perform(put("/api/stores/{storeId}/reservation-settings", testStoreId)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(new ObjectMapper().writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id", notNullValue()))
                    .andExpect(jsonPath("$.data.storeId", is(testStoreId.toString())))
                    .andExpect(jsonPath("$.data.isReservationEnabled", is(true)))
                    .andExpect(jsonPath("$.data.maxReservationDays", is(7)))
                    .andExpect(jsonPath("$.timestamp", notNullValue()));
        }

        @Test
        @DisplayName("验证失败返回400")
        void shouldReturn400WhenValidationFails() throws Exception {
            // Given
            UpdateStoreReservationSettingsRequest request = new UpdateStoreReservationSettingsRequest();
            request.setIsReservationEnabled(true);
            request.setMaxReservationDays(0); // Invalid: should be > 0 when enabled

            // When & Then
            mockMvc.perform(put("/api/stores/{storeId}/reservation-settings", testStoreId)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(new ObjectMapper().writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("预约设置不存在返回404")
        void shouldReturn404WhenSettingsNotFound() throws Exception {
            // Given
            UpdateStoreReservationSettingsRequest request = new UpdateStoreReservationSettingsRequest();
            request.setIsReservationEnabled(true);
            request.setMaxReservationDays(7);

            when(service.updateSettings(eq(testStoreId), any(UpdateStoreReservationSettingsRequest.class)))
                    .thenThrow(new ResourceNotFoundException("门店预约设置", testStoreId.toString()));

            // When & Then
            mockMvc.perform(put("/api/stores/{storeId}/reservation-settings", testStoreId)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(new ObjectMapper().writeValueAsString(request)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error", is("NOT_FOUND")));
        }

        @Test
        @DisplayName("关闭预约时maxReservationDays可以为0")
        void shouldAllowZeroDaysWhenDisabled() throws Exception {
            // Given
            UpdateStoreReservationSettingsRequest request = new UpdateStoreReservationSettingsRequest();
            request.setIsReservationEnabled(false);
            request.setMaxReservationDays(0);

            StoreReservationSettingsDTO updatedSettings = createMockSettingsDTO(testStoreId, false, 0);
            when(service.updateSettings(eq(testStoreId), any(UpdateStoreReservationSettingsRequest.class)))
                    .thenReturn(updatedSettings);

            // When & Then
            mockMvc.perform(put("/api/stores/{storeId}/reservation-settings", testStoreId)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(new ObjectMapper().writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.isReservationEnabled", is(false)))
                    .andExpect(jsonPath("$.data.maxReservationDays", is(0)));
        }
    }

    // ========== Helper Methods ==========

    private StoreReservationSettingsDTO createMockSettingsDTO(UUID storeId, boolean enabled, int maxDays) {
        StoreReservationSettingsDTO dto = new StoreReservationSettingsDTO();
        dto.setId(UUID.randomUUID().toString());
        dto.setStoreId(storeId.toString());
        dto.setIsReservationEnabled(enabled);
        dto.setMaxReservationDays(maxDays);
        dto.setCreatedAt(Instant.now());
        dto.setUpdatedAt(Instant.now());
        return dto;
    }
}

