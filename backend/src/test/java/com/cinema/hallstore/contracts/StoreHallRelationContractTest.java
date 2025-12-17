package com.cinema.hallstore.contracts;

import com.cinema.hallstore.domain.Hall;
import com.cinema.hallstore.domain.Store;
import com.cinema.hallstore.domain.enums.HallStatus;
import com.cinema.hallstore.domain.enums.HallType;
import com.cinema.hallstore.domain.enums.StoreStatus;
import com.cinema.hallstore.repository.HallRepository;
import com.cinema.hallstore.repository.StoreRepository;
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
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Store-Hall 关系契约测试
 * 验证多门店多影厅场景下，按门店查询影厅关系的正确性
 */
@SpringBootTest
@AutoConfigureMockMvc
class StoreHallRelationContractTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private HallRepository hallRepository;

    @MockBean
    private StoreRepository storeRepository;

    private UUID storeAId;
    private UUID storeBId;

    @BeforeEach
    void setUp() {
        storeAId = UUID.randomUUID();
        storeBId = UUID.randomUUID();
    }

    @Nested
    @DisplayName("门店-影厅关系查询契约")
    class StoreHallRelationshipContractTests {

        @Test
        @DisplayName("按门店A查询仅返回门店A的影厅，不包含门店B的影厅")
        void shouldReturnOnlyHallsBelongingToStoreA() throws Exception {
            // Given: 门店A有3个影厅，门店B有1个影厅
            List<Hall> storeAHalls = List.of(
                    createMockHall(UUID.randomUUID(), storeAId, "A厅-VIP1", HallType.VIP, 100, HallStatus.ACTIVE),
                    createMockHall(UUID.randomUUID(), storeAId, "A厅-公众1", HallType.PUBLIC, 200, HallStatus.ACTIVE),
                    createMockHall(UUID.randomUUID(), storeAId, "A厅-派对1", HallType.PARTY, 50, HallStatus.ACTIVE)
            );
            when(hallRepository.findByStoreId(eq(storeAId), any(), any())).thenReturn(storeAHalls);

            // When & Then
            mockMvc.perform(get("/api/stores/{storeId}/halls", storeAId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(3)))
                    .andExpect(jsonPath("$.total", is(3)))
                    // 验证所有返回的影厅都属于门店A（通过名称前缀确认）
                    .andExpect(jsonPath("$.data[*].name", everyItem(startsWith("A厅"))));
        }

        @Test
        @DisplayName("按门店B查询仅返回门店B的影厅，不包含门店A的影厅")
        void shouldReturnOnlyHallsBelongingToStoreB() throws Exception {
            // Given: 门店B有1个影厅
            List<Hall> storeBHalls = List.of(
                    createMockHall(UUID.randomUUID(), storeBId, "B厅-CP1", HallType.CP, 80, HallStatus.ACTIVE)
            );
            when(hallRepository.findByStoreId(eq(storeBId), any(), any())).thenReturn(storeBHalls);

            // When & Then
            mockMvc.perform(get("/api/stores/{storeId}/halls", storeBId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(1)))
                    .andExpect(jsonPath("$.total", is(1)))
                    .andExpect(jsonPath("$.data[0].name", startsWith("B厅")));
        }

        @Test
        @DisplayName("门店下没有影厅时返回空数组")
        void shouldReturnEmptyArrayWhenStoreHasNoHalls() throws Exception {
            // Given: 新门店没有配置影厅
            UUID newStoreId = UUID.randomUUID();
            when(hallRepository.findByStoreId(eq(newStoreId), any(), any())).thenReturn(List.of());

            // When & Then
            mockMvc.perform(get("/api/stores/{storeId}/halls", newStoreId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(0)))
                    .andExpect(jsonPath("$.total", is(0)));
        }

        @Test
        @DisplayName("同时存在活动和停用状态的影厅时，不带筛选参数返回全部")
        void shouldReturnAllHallsIncludingInactiveWhenNoStatusFilter() throws Exception {
            // Given
            List<Hall> allHalls = List.of(
                    createMockHall(UUID.randomUUID(), storeAId, "活动厅", HallType.VIP, 100, HallStatus.ACTIVE),
                    createMockHall(UUID.randomUUID(), storeAId, "停用厅", HallType.PUBLIC, 80, HallStatus.INACTIVE),
                    createMockHall(UUID.randomUUID(), storeAId, "维护厅", HallType.CP, 60, HallStatus.MAINTENANCE)
            );
            when(hallRepository.findByStoreId(eq(storeAId), eq(null), eq(null))).thenReturn(allHalls);

            // When & Then
            mockMvc.perform(get("/api/stores/{storeId}/halls", storeAId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(3)))
                    .andExpect(jsonPath("$.data[*].status", containsInAnyOrder("ACTIVE", "INACTIVE", "MAINTENANCE")));
        }

        @Test
        @DisplayName("筛选活动状态时仅返回活动影厅")
        void shouldReturnOnlyActiveHallsWhenFilterByActiveStatus() throws Exception {
            // Given
            List<Hall> activeHalls = List.of(
                    createMockHall(UUID.randomUUID(), storeAId, "活动厅", HallType.VIP, 100, HallStatus.ACTIVE)
            );
            when(hallRepository.findByStoreId(eq(storeAId), eq(HallStatus.ACTIVE), any())).thenReturn(activeHalls);

            // When & Then
            mockMvc.perform(get("/api/stores/{storeId}/halls", storeAId)
                            .param("status", "ACTIVE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(1)))
                    .andExpect(jsonPath("$.data[0].status", is("ACTIVE")));
        }
    }

    @Nested
    @DisplayName("门店状态对影厅查询的影响")
    class StoreStatusImpactTests {

        @Test
        @DisplayName("活动门店下可以正常查询影厅列表")
        void shouldQueryHallsFromActiveStore() throws Exception {
            // Given
            Store activeStore = createMockStore(storeAId, "STORE-A", "活动门店", StoreStatus.ACTIVE);
            when(storeRepository.findById(storeAId)).thenReturn(Optional.of(activeStore));

            List<Hall> halls = List.of(
                    createMockHall(UUID.randomUUID(), storeAId, "VIP厅", HallType.VIP, 100, HallStatus.ACTIVE)
            );
            when(hallRepository.findByStoreId(eq(storeAId), any(), any())).thenReturn(halls);

            // When & Then
            mockMvc.perform(get("/api/stores/{storeId}/halls", storeAId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(1)));
        }

        @Test
        @DisplayName("停用门店下的影厅仍可用于历史查询")
        void shouldStillQueryHallsFromDisabledStoreForHistory() throws Exception {
            // Given: 门店已停用但历史数据保留
            Store disabledStore = createMockStore(storeAId, "STORE-A", "已停用门店", StoreStatus.DISABLED);
            when(storeRepository.findById(storeAId)).thenReturn(Optional.of(disabledStore));

            List<Hall> halls = List.of(
                    createMockHall(UUID.randomUUID(), storeAId, "历史厅", HallType.PUBLIC, 80, HallStatus.INACTIVE)
            );
            when(hallRepository.findByStoreId(eq(storeAId), any(), any())).thenReturn(halls);

            // When & Then: 查询仍可返回数据（用于历史查询场景）
            mockMvc.perform(get("/api/stores/{storeId}/halls", storeAId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(1)));
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
        hall.setTags(List.of());
        hall.setCreatedAt(Instant.now());
        hall.setUpdatedAt(Instant.now());
        return hall;
    }

    private Store createMockStore(UUID id, String code, String name, StoreStatus status) {
        Store store = new Store();
        store.setId(id);
        store.setCode(code);
        store.setName(name);
        store.setStatus(status);
        store.setCreatedAt(Instant.now());
        store.setUpdatedAt(Instant.now());
        return store;
    }
}
