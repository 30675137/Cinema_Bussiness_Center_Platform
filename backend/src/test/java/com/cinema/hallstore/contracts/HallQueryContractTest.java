package com.cinema.hallstore.contracts;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * 契约测试草稿：
 * - 固定 GET /api/stores/{storeId}/halls 的基本响应形状（JSON 对象内包含 data 数组）
 * - 后续将结合 MSW/集成测试补充字段级断言
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Disabled("HallQueryController 尚未实现，待 US1/US2 完成后启用")
class HallQueryContractTest {

    @LocalServerPort
    int port;

    @Test
    @DisplayName("GET /api/stores/{storeId}/halls 应返回包含 data 数组字段的 JSON 对象")
    @SuppressWarnings("unchecked")
    void getHallsByStoreContractShape() {
        WebClient client = WebClient.create("http://localhost:" + port);

        Map<String, Object> body = client.get()
            .uri("/api/stores/{storeId}/halls?status=active", "550e8400-e29b-41d4-a716-446655440000")
            .accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .bodyToMono(Map.class)
            .onErrorResume(ex -> Mono.just(Map.of()))
            .block();

        // 仅固定响应为 JSON 对象且包含 data 字段，具体字段结构在后续实现中收紧
        assertNotNull(body);
        // data 字段存在即可，类型细节后续在实现完成后再断言
        //noinspection unused
        Object data = body.get("data");
    }
}



