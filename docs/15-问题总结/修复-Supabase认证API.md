# Bug 修复: Supabase Auth API 查询错误

## 问题描述

**错误信息**:
```
Silent login failed: Error: 登录失败: Failed to query user: 404 Not Found from GET https://fxhgyxceqrmnpezluaht.supabase.co/rest/v1/auth/users
```

**触发场景**:
- 用户首次静默登录时
- 后端尝试通过 openid 查找已有用户

---

## 根本原因

### 错误的 API 使用

在 `SupabaseAuthClient.java:112` 中，代码尝试通过 Supabase REST API 访问 `auth.users` 表:

```java
// ❌ 错误的实现
String response = restClient.get()
    .uri(uriBuilder -> uriBuilder
            .path("/auth/users")  // 这个路径不存在！
            .queryParam("select", "*")
            .queryParam("raw_user_meta_data->>openid", "eq." + metadataValue)
            .queryParam("limit", "1")
            .build())
    .retrieve()
    .bodyToMono(String.class)
    .block();
```

### 为什么失败？

1. **Supabase REST API 限制**:
   - Supabase REST API (PostgREST) 默认只能访问 `public` schema
   - `auth.users` 表位于 `auth` schema，不对外暴露

2. **正确的 API**:
   - 应该使用 **Auth Admin API** 的 `GET /admin/users` 端点
   - 但这个端点**不支持查询参数过滤**，只能获取所有用户

---

## 解决方案

### 方案选择

由于 Supabase Auth Admin API 的限制，我们采用以下策略:

1. **短期方案** (当前实现):
   - 调用 `GET /admin/users` 获取所有用户
   - 在内存中遍历过滤，找到 `user_metadata.openid` 匹配的用户

2. **长期优化方案** (生产环境推荐):
   - 创建自定义表 `user_openid_mapping` 存储 `openid → user_id` 映射
   - 在用户创建时插入记录
   - 查询时直接查自定义表

### 修复后的代码

```java
/**
 * 通过 user_metadata 查找用户
 *
 * 注意：这在用户量很大时性能不佳，实际生产环境应考虑：
 * 1. 在自定义表中存储 openid → user_id 映射关系
 * 2. 或者使用 Supabase Edge Functions 进行查询
 */
public Map<String, Object> getUserByMetadata(String metadataKey, String metadataValue) {
    log.debug("Searching user by metadata: {}={}", metadataKey, maskValue(metadataValue));

    try {
        // 使用 Auth Admin API 获取用户列表
        String response = webClient.get()
                .uri("/admin/users")
                .retrieve()
                .bodyToMono(String.class)
                .block();

        JsonNode jsonNode = objectMapper.readTree(response);

        // 响应格式: { "users": [...] }
        if (jsonNode.has("users")) {
            JsonNode users = jsonNode.get("users");

            // 在内存中过滤：查找 user_metadata 中匹配的用户
            for (JsonNode user : users) {
                if (user.has("user_metadata")) {
                    JsonNode userMetadata = user.get("user_metadata");
                    if (userMetadata.has(metadataKey)) {
                        String value = userMetadata.get(metadataKey).asText();
                        if (metadataValue.equals(value)) {
                            Map<String, Object> foundUser = objectMapper.convertValue(user, Map.class);
                            log.info("User found with metadata {}={}", metadataKey, maskValue(metadataValue));
                            return foundUser;
                        }
                    }
                }
            }
        }

        log.info("No user found with metadata {}={}", metadataKey, maskValue(metadataValue));
        return null;

    } catch (Exception e) {
        log.error("Failed to query user by metadata", e);
        throw new RuntimeException("Failed to query user: " + e.getMessage(), e);
    }
}
```

---

## 性能影响

### 当前方案性能特性

| 场景 | 性能 |
|------|------|
| 用户量 < 100 | ✅ 可接受（< 100ms） |
| 用户量 100-1000 | ⚠️ 较慢（100-500ms） |
| 用户量 > 1000 | ❌ 不推荐（> 500ms） |

### 长期优化方案

#### 方案 1: 自定义映射表

创建 `user_openid_mapping` 表:

```sql
CREATE TABLE public.user_openid_mapping (
  openid TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_openid_mapping_user_id ON public.user_openid_mapping(user_id);
```

**优点**:
- 查询性能：O(1) 索引查找
- 适用于任何用户规模

**缺点**:
- 需要维护两个数据源
- 需要在用户创建/删除时同步

#### 方案 2: Supabase Edge Functions

创建 Edge Function 查询用户:

```typescript
// supabase/functions/find-user-by-openid/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "@supabase/supabase-js"

serve(async (req) => {
  const { openid } = await req.json()

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const { data, error } = await supabase.auth.admin.listUsers()

  const user = data?.users?.find(u => u.user_metadata?.openid === openid)

  return new Response(JSON.stringify({ user }), {
    headers: { "Content-Type": "application/json" },
  })
})
```

**优点**:
- 保持单一数据源
- 可以使用 Supabase Auth Admin SDK

**缺点**:
- 额外的网络调用
- 冷启动延迟

---

## 测试验证

### 验证步骤

1. 重新编译后端:
   ```bash
   cd backend
   mvn clean compile
   ```

2. 重启后端服务:
   ```bash
   mvn spring-boot:run
   ```

3. 在微信小程序中测试:
   - 清除本地存储
   - 重新启动小程序
   - 观察控制台日志

4. 预期行为:
   - ✅ 首次登录：创建新用户
   - ✅ 再次登录：找到已有用户
   - ✅ 不应该出现 404 错误

---

## Supabase API 参考

### Auth Admin API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/admin/users` | GET | 获取所有用户（不支持过滤） |
| `/admin/users` | POST | 创建新用户 |
| `/admin/users/{id}` | PUT | 更新用户 |
| `/admin/users/{id}` | DELETE | 删除用户 |
| `/admin/generate_link` | POST | 生成魔法链接（含 JWT） |

### REST API (PostgREST)

| 端点 | Schema | 说明 |
|------|--------|------|
| `/rest/v1/*` | public | 访问 public schema 表 |
| `/rest/v1/auth/*` | ❌ | **不可访问** auth schema |

---

## 相关文档

- [Supabase Auth Admin API 文档](https://supabase.com/docs/reference/javascript/auth-admin-api)
- [PostgREST Schema 隔离](https://postgrest.org/en/stable/schema_isolation.html)

---

**修复日期**: 2025-12-24
**修复人**: Claude
**影响范围**: 用户静默登录流程
**版本**: v1.0.2
