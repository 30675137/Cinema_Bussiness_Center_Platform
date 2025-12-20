package com.cinema.hallstore.contracts;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * 契约测试草稿：
 * - 用于固定 /api/admin/halls 接口的基本约定（路径、方法、状态码语义）
 * - 当前仅定义形状，待后续 Controller/Service 实现后再补充完整断言与示例数据
 *
 * 注意：为遵循 TDD，本测试类初期可以是 @Disabled 状态，
 *       待实现 Controller 后再启用并完善断言。
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Disabled("HallAdminController 尚未实现，待 US1 开发时启用并完善契约断言")
class HallAdminContractTest {

    @LocalServerPort
    int port;

    @Test
    @DisplayName("POST /api/admin/halls 应接受创建请求并返回 2xx 或明确的 4xx 错误结构")
    void createHallContractShape() {
        WebClient client = WebClient.create("http://localhost:" + port);

        var response = client.post()
            .uri("/api/admin/halls")
            .bodyValue("""
                {
                  "storeId": "550e8400-e29b-41d4-a716-446655440000",
                  "name": "契约测试影厅",
                  "type": "VIP",
                  "capacity": 100
                }
                """)
            .exchangeToMono(res -> Mono.just(res.statusCode()))
            .block();

        // 初始阶段只固定“不会返回 500”，后续根据业务实现收紧为 201 或具体 4xx
        assertEquals(false, HttpStatus.INTERNAL_SERVER_ERROR.equals(response));
    }
}



