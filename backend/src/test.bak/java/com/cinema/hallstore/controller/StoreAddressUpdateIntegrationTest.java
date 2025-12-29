package com.cinema.hallstore.controller;

import com.cinema.hallstore.domain.enums.StoreStatus;
import com.cinema.hallstore.dto.ApiResponse;
import com.cinema.hallstore.dto.StoreDTO;
import com.cinema.hallstore.dto.UpdateStoreAddressRequest;
import com.cinema.hallstore.service.StoreService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 门店地址更新集成测试
 *
 * @since 020-store-address
 */
@WebMvcTest(StoreQueryController.class)
@DisplayName("门店地址更新 API 测试")
class StoreAddressUpdateIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private StoreService storeService;

    private UUID testStoreId;
    private StoreDTO testStore;

    @BeforeEach
    void setUp() {
        testStoreId = UUID.randomUUID();
        testStore = new StoreDTO();
        testStore.setId(testStoreId.toString());
        testStore.setCode("TEST001");
        testStore.setName("测试门店");
        testStore.setProvince("北京市");
        testStore.setCity("北京市");
        testStore.setDistrict("朝阳区");
        testStore.setAddress("建国路88号");
        testStore.setPhone("13800138000");
        testStore.setStatus(StoreStatus.ACTIVE);
        testStore.setCreatedAt(Instant.now());
        testStore.setUpdatedAt(Instant.now());
    }

    @Nested
    @DisplayName("GET /api/stores/{storeId}")
    class GetStoreTests {

        @Test
        @DisplayName("应该返回门店详情包含地址字段")
        void shouldReturnStoreWithAddressFields() throws Exception {
            when(storeService.getStoreById(testStoreId)).thenReturn(testStore);

            mockMvc.perform(get("/api/stores/{storeId}", testStoreId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(testStoreId.toString()))
                    .andExpect(jsonPath("$.data.province").value("北京市"))
                    .andExpect(jsonPath("$.data.city").value("北京市"))
                    .andExpect(jsonPath("$.data.district").value("朝阳区"))
                    .andExpect(jsonPath("$.data.address").value("建国路88号"))
                    .andExpect(jsonPath("$.data.phone").value("13800138000"))
                    .andExpect(jsonPath("$.data.addressSummary").exists());
        }
    }

    @Nested
    @DisplayName("PUT /api/stores/{storeId}")
    class UpdateStoreAddressTests {

        @Test
        @DisplayName("有效请求应该成功更新门店地址")
        void shouldUpdateAddressSuccessfully() throws Exception {
            UpdateStoreAddressRequest request = new UpdateStoreAddressRequest();
            request.setProvince("上海市");
            request.setCity("上海市");
            request.setDistrict("浦东新区");
            request.setAddress("世纪大道100号");
            request.setPhone("13900139000");

            StoreDTO updatedStore = new StoreDTO();
            updatedStore.setId(testStoreId.toString());
            updatedStore.setCode("TEST001");
            updatedStore.setName("测试门店");
            updatedStore.setProvince("上海市");
            updatedStore.setCity("上海市");
            updatedStore.setDistrict("浦东新区");
            updatedStore.setAddress("世纪大道100号");
            updatedStore.setPhone("13900139000");
            updatedStore.setStatus(StoreStatus.ACTIVE);

            when(storeService.updateStoreAddress(eq(testStoreId), any(UpdateStoreAddressRequest.class)))
                    .thenReturn(updatedStore);

            mockMvc.perform(put("/api/stores/{storeId}", testStoreId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.province").value("上海市"))
                    .andExpect(jsonPath("$.data.city").value("上海市"))
                    .andExpect(jsonPath("$.data.district").value("浦东新区"))
                    .andExpect(jsonPath("$.data.address").value("世纪大道100号"))
                    .andExpect(jsonPath("$.data.phone").value("13900139000"));
        }

        @Test
        @DisplayName("缺少必填字段应该返回400")
        void shouldReturn400WhenMissingRequiredFields() throws Exception {
            UpdateStoreAddressRequest request = new UpdateStoreAddressRequest();
            request.setProvince("北京市");
            // 缺少 city 和 district

            mockMvc.perform(put("/api/stores/{storeId}", testStoreId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("无效电话格式应该返回400")
        void shouldReturn400WhenInvalidPhoneFormat() throws Exception {
            UpdateStoreAddressRequest request = new UpdateStoreAddressRequest();
            request.setProvince("北京市");
            request.setCity("北京市");
            request.setDistrict("朝阳区");
            request.setPhone("invalid-phone");

            mockMvc.perform(put("/api/stores/{storeId}", testStoreId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("电话为空应该可以通过验证")
        void shouldAllowEmptyPhone() throws Exception {
            UpdateStoreAddressRequest request = new UpdateStoreAddressRequest();
            request.setProvince("北京市");
            request.setCity("北京市");
            request.setDistrict("朝阳区");
            request.setAddress("建国路88号");
            // 不设置 phone

            StoreDTO updatedStore = new StoreDTO();
            updatedStore.setId(testStoreId.toString());
            updatedStore.setProvince("北京市");
            updatedStore.setCity("北京市");
            updatedStore.setDistrict("朝阳区");
            updatedStore.setAddress("建国路88号");

            when(storeService.updateStoreAddress(eq(testStoreId), any(UpdateStoreAddressRequest.class)))
                    .thenReturn(updatedStore);

            mockMvc.perform(put("/api/stores/{storeId}", testStoreId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("有效座机号应该通过验证")
        void shouldAllowValidLandlinePhone() throws Exception {
            UpdateStoreAddressRequest request = new UpdateStoreAddressRequest();
            request.setProvince("北京市");
            request.setCity("北京市");
            request.setDistrict("朝阳区");
            request.setPhone("010-12345678");

            StoreDTO updatedStore = new StoreDTO();
            updatedStore.setId(testStoreId.toString());
            updatedStore.setProvince("北京市");
            updatedStore.setCity("北京市");
            updatedStore.setDistrict("朝阳区");
            updatedStore.setPhone("010-12345678");

            when(storeService.updateStoreAddress(eq(testStoreId), any(UpdateStoreAddressRequest.class)))
                    .thenReturn(updatedStore);

            mockMvc.perform(put("/api/stores/{storeId}", testStoreId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("有效400热线应该通过验证")
        void shouldAllowValid400Hotline() throws Exception {
            UpdateStoreAddressRequest request = new UpdateStoreAddressRequest();
            request.setProvince("北京市");
            request.setCity("北京市");
            request.setDistrict("朝阳区");
            request.setPhone("400-123-4567");

            StoreDTO updatedStore = new StoreDTO();
            updatedStore.setId(testStoreId.toString());
            updatedStore.setProvince("北京市");
            updatedStore.setCity("北京市");
            updatedStore.setDistrict("朝阳区");
            updatedStore.setPhone("400-123-4567");

            when(storeService.updateStoreAddress(eq(testStoreId), any(UpdateStoreAddressRequest.class)))
                    .thenReturn(updatedStore);

            mockMvc.perform(put("/api/stores/{storeId}", testStoreId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }
    }
}
