package com.cinema.hallstore;

import com.cinema.hallstore.config.SupabaseConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Supabase 数据库连接冒烟测试
 * 
 * 用途：
 * - 验证 Supabase 配置是否正确
 * - 验证数据库连接是否可用
 * - 验证 API 密钥是否有效
 * 
 * 运行前提：
 * - 需要设置环境变量 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY
 * - 或在 application.yml 中配置默认值
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Supabase 数据库连接冒烟测试")
class SupabaseSmokeTest {

    @Autowired
    private SupabaseConfig supabaseConfig;

    @Autowired
    private WebClient supabaseWebClient;

    @Test
    @DisplayName("验证 Supabase 配置已加载")
    void shouldLoadSupabaseConfig() {
        assertNotNull(supabaseConfig, "SupabaseConfig 应该被正确注入");
        assertNotNull(supabaseConfig.getUrl(), "Supabase URL 不能为空");
        assertNotNull(supabaseConfig.getServiceRoleKey(), "Supabase Service Role Key 不能为空");
        
        assertFalse(supabaseConfig.getUrl().contains("your-project"), 
                "请配置正确的 Supabase URL（当前为默认值）");
        assertFalse(supabaseConfig.getServiceRoleKey().contains("your-service-role-key"), 
                "请配置正确的 Supabase Service Role Key（当前为默认值）");
    }

    @Test
    @DisplayName("验证 WebClient Bean 已创建")
    void shouldCreateWebClientBean() {
        assertNotNull(supabaseWebClient, "Supabase WebClient 应该被正确创建");
    }

    @Test
    @DisplayName("验证 Supabase API 连接可用")
    void shouldConnectToSupabaseAPI() {
        try {
            // 尝试访问 stores 表（应该返回数据或空数组，不应该返回认证错误）
            String response = supabaseWebClient.get()
                    .uri("/stores?select=id&limit=1")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(supabaseConfig.getTimeoutDuration());

            assertNotNull(response, "应该收到来自 Supabase 的响应");
            System.out.println("✓ Supabase 连接成功");
            System.out.println("响应示例: " + response);
            
        } catch (WebClientResponseException.Unauthorized e) {
            fail("Supabase API 认证失败：请检查 SUPABASE_SERVICE_ROLE_KEY 是否正确");
        } catch (WebClientResponseException.NotFound e) {
            fail("Supabase 表不存在：请检查 stores 表是否已创建");
        } catch (WebClientResponseException e) {
            fail("Supabase API 请求失败 [" + e.getStatusCode() + "]: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            fail("连接 Supabase 失败：" + e.getMessage());
        }
    }

    @Test
    @DisplayName("验证 halls 表可访问")
    void shouldAccessHallsTable() {
        try {
            String response = supabaseWebClient.get()
                    .uri("/halls?select=id&limit=1")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(supabaseConfig.getTimeoutDuration());

            assertNotNull(response, "应该能够访问 halls 表");
            System.out.println("✓ halls 表访问成功");
            
        } catch (WebClientResponseException.NotFound e) {
            fail("halls 表不存在：请检查数据库表是否已创建");
        } catch (WebClientResponseException e) {
            fail("访问 halls 表失败 [" + e.getStatusCode() + "]: " + e.getResponseBodyAsString());
        }
    }

    @Test
    @DisplayName("验证超时配置")
    void shouldHaveValidTimeoutConfiguration() {
        long timeout = supabaseConfig.getApiTimeout();
        assertTrue(timeout > 0, "API 超时时间应该大于 0");
        assertTrue(timeout <= 120000, "API 超时时间不应该超过 120 秒");
        
        System.out.println("✓ API 超时配置: " + timeout + "ms");
    }
}
