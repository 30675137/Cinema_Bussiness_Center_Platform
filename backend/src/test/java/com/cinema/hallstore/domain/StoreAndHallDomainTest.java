package com.cinema.hallstore.domain;

import com.cinema.hallstore.domain.enums.HallStatus;
import com.cinema.hallstore.domain.enums.HallType;
import com.cinema.hallstore.domain.enums.StoreStatus;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 基础领域模型单元测试：
 * - 校验 Store/Hall 必要字段与枚举是否可正常赋值
 * - 作为后续更复杂业务规则测试的基础
 */
class StoreAndHallDomainTest {

    @Test
    void storeShouldAcceptRequiredFields() {
        Store store = new Store();
        UUID id = UUID.randomUUID();
        store.setId(id);
        store.setCode("STORE-001");
        store.setName("测试门店");
        store.setRegion("北京");
        store.setStatus(StoreStatus.ACTIVE);
        store.setCreatedAt(Instant.now());
        store.setUpdatedAt(Instant.now());

        assertEquals(id, store.getId());
        assertEquals("STORE-001", store.getCode());
        assertEquals(StoreStatus.ACTIVE, store.getStatus());
    }

    @Test
    void hallShouldAcceptRequiredFieldsAndEnums() {
        Hall hall = new Hall();
        UUID hallId = UUID.randomUUID();
        UUID storeId = UUID.randomUUID();

        hall.setId(hallId);
        hall.setStoreId(storeId);
        hall.setCode("HALL-001");
        hall.setName("VIP厅A");
        hall.setType(HallType.VIP);
        hall.setCapacity(120);
        hall.setTags(List.of("真皮沙发", "KTV设备"));
        hall.setStatus(HallStatus.ACTIVE);
        hall.setCreatedAt(Instant.now());
        hall.setUpdatedAt(Instant.now());

        assertEquals(hallId, hall.getId());
        assertEquals(storeId, hall.getStoreId());
        assertEquals(HallType.VIP, hall.getType());
        assertTrue(hall.getCapacity() > 0);
        assertNotNull(hall.getTags());
    }
}


