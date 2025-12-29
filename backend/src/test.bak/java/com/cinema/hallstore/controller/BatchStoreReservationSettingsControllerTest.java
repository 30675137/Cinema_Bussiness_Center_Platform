package com.cinema.hallstore.controller;

import com.cinema.hallstore.dto.BatchUpdateResult;
import com.cinema.hallstore.dto.BatchUpdateStoreReservationSettingsRequest;
import com.cinema.hallstore.dto.UpdateStoreReservationSettingsRequest;
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

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * BatchStoreReservationSettingsController 集成测试
 * 验证批量更新门店预约设置接口
 */
@SpringBootTest
@AutoConfigureMockMvc
class BatchStoreReservationSettingsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StoreReservationSettingsService service;

    private UUID testStoreId1;
    private UUID testStoreId2;

    @BeforeEach
    void setUp() {
        testStoreId1 = UUID.randomUUID();
        testStoreId2 = UUID.randomUUID();
    }

    @Nested
    @DisplayName("PUT /api/stores/reservation-settings/batch - 批量更新门店预约设置")
    class BatchUpdateSettingsTests {

        @Test
        @DisplayName("成功批量更新门店预约设置")
        void shouldBatchUpdateReservationSettings() throws Exception {
            // Given
            BatchUpdateStoreReservationSettingsRequest request = new BatchUpdateStoreReservationSettingsRequest();
            request.setStoreIds(List.of(testStoreId1, testStoreId2));
            
            UpdateStoreReservationSettingsRequest settingsRequest = new UpdateStoreReservationSettingsRequest();
            settingsRequest.setIsReservationEnabled(true);
            settingsRequest.setMaxReservationDays(7);
            request.setSettings(settingsRequest);

            BatchUpdateResult result = new BatchUpdateResult();
            result.setSuccessCount(2);
            result.setFailureCount(0);
            when(service.batchUpdate(any(BatchUpdateStoreReservationSettingsRequest.class)))
                    .thenReturn(result);

            // When & Then
            mockMvc.perform(put("/api/stores/reservation-settings/batch")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(new ObjectMapper().writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.successCount", is(2)))
                    .andExpect(jsonPath("$.data.failureCount", is(0)))
                    .andExpect(jsonPath("$.data.failures", empty()))
                    .andExpect(jsonPath("$.timestamp", notNullValue()));
        }

        @Test
        @DisplayName("批量更新时部分失败应返回失败详情")
        void shouldReturnFailureDetailsWhenPartialFailures() throws Exception {
            // Given
            BatchUpdateStoreReservationSettingsRequest request = new BatchUpdateStoreReservationSettingsRequest();
            request.setStoreIds(List.of(testStoreId1, testStoreId2));
            
            UpdateStoreReservationSettingsRequest settingsRequest = new UpdateStoreReservationSettingsRequest();
            settingsRequest.setIsReservationEnabled(true);
            settingsRequest.setMaxReservationDays(7);
            request.setSettings(settingsRequest);

            BatchUpdateResult result = new BatchUpdateResult();
            result.setSuccessCount(1);
            result.setFailureCount(1);
            result.addFailure(testStoreId2.toString(), "NOT_FOUND", "门店预约设置不存在: " + testStoreId2);
            when(service.batchUpdate(any(BatchUpdateStoreReservationSettingsRequest.class)))
                    .thenReturn(result);

            // When & Then
            mockMvc.perform(put("/api/stores/reservation-settings/batch")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(new ObjectMapper().writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.successCount", is(1)))
                    .andExpect(jsonPath("$.data.failureCount", is(1)))
                    .andExpect(jsonPath("$.data.failures", hasSize(1)))
                    .andExpect(jsonPath("$.data.failures[0].storeId", is(testStoreId2.toString())))
                    .andExpect(jsonPath("$.data.failures[0].error", is("NOT_FOUND")));
        }

        @Test
        @DisplayName("验证失败返回400")
        void shouldReturn400WhenValidationFails() throws Exception {
            // Given
            BatchUpdateStoreReservationSettingsRequest request = new BatchUpdateStoreReservationSettingsRequest();
            request.setStoreIds(List.of()); // Empty list - invalid
            request.setSettings(null); // Null settings - invalid

            // When & Then
            mockMvc.perform(put("/api/stores/reservation-settings/batch")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(new ObjectMapper().writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("空门店ID列表应返回400")
        void shouldReturn400WhenStoreIdsListIsEmpty() throws Exception {
            // Given
            BatchUpdateStoreReservationSettingsRequest request = new BatchUpdateStoreReservationSettingsRequest();
            request.setStoreIds(List.of()); // Empty list
            
            UpdateStoreReservationSettingsRequest settingsRequest = new UpdateStoreReservationSettingsRequest();
            settingsRequest.setIsReservationEnabled(true);
            settingsRequest.setMaxReservationDays(7);
            request.setSettings(settingsRequest);

            // When & Then
            mockMvc.perform(put("/api/stores/reservation-settings/batch")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .content(new ObjectMapper().writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }
}

