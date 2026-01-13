# 多租户统一身份认证方案设计

> 文档版本：v1.0  
> 创建日期：2026-01-13  
> 文档状态：草案

---

## 1. 背景与目标

### 1.1 业务背景

影院商品管理中台作为 SaaS 业务平台，需要服务多个影院集团客户（租户）。每个租户可能有不同的企业办公平台（飞书、钉钉、企业微信），需要支持员工通过各自企业平台实现单点登录（SSO）。

### 1.2 核心目标

| 目标 | 说明 |
|------|------|
| 多租户隔离 | 数据、配置、用户完全隔离 |
| 多 IdP 支持 | 支持飞书、钉钉、企业微信 SSO |
| 租户自治 | 每个租户可独立配置身份源 |
| 统一管理 | 平台侧统一管理所有租户 |
| 平滑扩展 | 未来可扩展更多身份源 |

### 1.3 适用范围

- **B 端管理后台**：影院管理员、店员登录
- **C 端小程序**：会员登录（微信授权，不在本方案范围）

---

## 2. 整体架构设计

### 2.1 技术选型

| 组件 | 技术选择 | 说明 |
|------|----------|------|
| 身份认证中心 | **Keycloak** | 开源 IAM，原生多租户支持 |
| 数据存储 | **Supabase** | 业务数据，RLS 租户隔离 |
| 前端框架 | **React** | B 端管理后台 |
| 后端服务 | **Spring Boot** | 业务 API |

### 2.2 架构拓扑

```
┌─────────────────────────────────────────────────────────────────────┐
│                         租户入口层                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ tenant-a.    │  │ tenant-b.    │  │ tenant-c.    │              │
│  │ cinema.com   │  │ cinema.com   │  │ cinema.com   │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
└─────────┼─────────────────┼─────────────────┼───────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Keycloak (身份认证中心)                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Master Realm (平台管理)                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  Org: 万达   │  │  Org: 金逸   │  │  Org: CGV   │                 │
│  │             │  │             │  │             │                 │
│  │ IdP: 飞书   │  │ IdP: 钉钉   │  │ IdP: 企微   │                 │
│  │ Users: 120  │  │ Users: 85   │  │ Users: 200  │                 │
│  │ Roles: 自定义│  │ Roles: 自定义│  │ Roles: 自定义│                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ JWT (含 tenant_id, roles)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        应用层                                        │
│  ┌─────────────────────┐     ┌─────────────────────┐               │
│  │   React 管理后台     │     │   Spring Boot API   │               │
│  │   验证 JWT          │────▶│   验证 JWT          │               │
│  │   解析 tenant_id    │     │   租户上下文注入     │               │
│  └─────────────────────┘     └──────────┬──────────┘               │
└──────────────────────────────────────────┼──────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Supabase (数据层)                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  RLS Policy: tenant_id = jwt_claim('tenant_id')             │   │
│  │                                                             │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │   │
│  │  │ products│  │ orders  │  │ stores  │  │ users   │        │   │
│  │  │tenant_id│  │tenant_id│  │tenant_id│  │tenant_id│        │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. 多租户模型设计

### 3.1 租户模型选择

采用 **Keycloak Organizations** 模式（Keycloak 24+ 新特性）：

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| ~~Realm per Tenant~~ | 每个租户一个 Realm | 完全隔离，管理复杂 |
| **Organization** ✅ | 单 Realm 内多 Organization | 适合 SaaS，统一管理 |

### 3.2 租户数据模型

```sql
-- 租户主表 (Supabase)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,        -- 租户编码，如 'wanda'
    name VARCHAR(200) NOT NULL,              -- 租户名称，如 '万达影城'
    keycloak_org_id VARCHAR(100),            -- Keycloak Organization ID
    status VARCHAR(20) DEFAULT 'active',     -- active, suspended, terminated
    
    -- 配置信息
    config JSONB DEFAULT '{}',               -- 租户级配置
    idp_type VARCHAR(20),                    -- feishu, dingtalk, wecom
    
    -- 订阅信息
    plan VARCHAR(20) DEFAULT 'basic',        -- basic, professional, enterprise
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- 审计字段
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 租户域名映射
CREATE TABLE tenant_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    domain VARCHAR(255) UNIQUE NOT NULL,     -- 如 'wanda.cinema-platform.com'
    is_primary BOOLEAN DEFAULT false,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户-租户关系 (补充 Keycloak 数据)
CREATE TABLE tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    keycloak_user_id VARCHAR(100) NOT NULL,  -- Keycloak 用户 ID
    external_id VARCHAR(200),                -- 飞书/钉钉/企微 用户 ID
    employee_no VARCHAR(50),                 -- 工号
    department VARCHAR(200),                 -- 部门
    
    -- 业务角色 (补充 Keycloak 角色)
    store_ids UUID[],                        -- 可管理的门店
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, keycloak_user_id)
);
```

### 3.3 RLS 策略示例

```sql
-- 启用 RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己租户的数据
CREATE POLICY tenant_isolation ON products
    FOR ALL
    USING (
        tenant_id = (
            SELECT (current_setting('request.jwt.claims', true)::json->>'tenant_id')::uuid
        )
    );
```

---

## 4. 统一身份认证设计

### 4.1 Keycloak 配置结构

```yaml
Keycloak:
  Realm: cinema-platform
    │
    ├── Clients:
    │   ├── cinema-admin-web      # B端管理后台
    │   ├── cinema-api            # Spring Boot 后端
    │   └── cinema-mobile         # 移动端（预留）
    │
    ├── Organizations:
    │   ├── wanda                 # 万达影城
    │   │   ├── Identity Provider: feishu-wanda
    │   │   ├── Members: [user1, user2, ...]
    │   │   └── Attributes: {idp_type: "feishu", app_id: "xxx"}
    │   │
    │   ├── jinyi                 # 金逸影城
    │   │   ├── Identity Provider: dingtalk-jinyi
    │   │   └── Members: [...]
    │   │
    │   └── cgv                   # CGV 影城
    │       ├── Identity Provider: wecom-cgv
    │       └── Members: [...]
    │
    ├── Identity Providers:
    │   ├── feishu-wanda          # 万达飞书
    │   ├── dingtalk-jinyi        # 金逸钉钉
    │   └── wecom-cgv             # CGV 企业微信
    │
    └── Roles:
        ├── platform-admin        # 平台管理员
        ├── tenant-admin          # 租户管理员
        ├── store-manager         # 门店经理
        └── store-staff           # 门店店员
```

### 4.2 JWT Token 设计

```json
{
  "iss": "https://auth.cinema-platform.com/realms/cinema-platform",
  "sub": "user-uuid-123",
  "aud": "cinema-admin-web",
  "exp": 1704067200,
  "iat": 1704063600,
  
  // 自定义 Claims
  "tenant_id": "tenant-uuid-456",
  "tenant_code": "wanda",
  "org_id": "keycloak-org-id",
  "idp": "feishu",
  "external_user_id": "feishu-user-id",
  
  // 角色
  "realm_access": {
    "roles": ["tenant-admin", "store-manager"]
  },
  
  // 用户信息
  "name": "张三",
  "email": "zhangsan@wanda.com",
  "preferred_username": "zhangsan"
}
```

### 4.3 Token Mapper 配置

| Mapper 名称 | 类型 | 说明 |
|-------------|------|------|
| tenant_id | User Attribute | 从用户属性映射租户 ID |
| tenant_code | User Attribute | 租户编码 |
| org_id | Organization Membership | Keycloak Organization ID |
| idp | Hardcoded Claim | 身份源类型 |
| external_user_id | User Attribute | 外部系统用户 ID |

---

## 5. 多 IdP 集成方案

### 5.1 飞书 SSO 集成

#### 5.1.1 飞书开放平台配置

| 配置项 | 值 |
|--------|---|
| 应用类型 | 企业自建应用 |
| 重定向 URL | `https://auth.cinema-platform.com/realms/cinema-platform/broker/feishu-{tenant}/endpoint` |
| 权限范围 | `contact:user.base`, `contact:user.email`, `contact:user.phone` |

#### 5.1.2 Keycloak IdP 配置

```yaml
Identity Provider:
  Alias: feishu-wanda
  Provider Type: OAuth 2.0
  
  Config:
    Authorization URL: https://open.feishu.cn/open-apis/authen/v1/authorize
    Token URL: https://open.feishu.cn/open-apis/authen/v1/oidc/access_token
    User Info URL: https://open.feishu.cn/open-apis/authen/v1/user_info
    Client ID: cli_xxxxx
    Client Secret: xxxxxx
    Default Scopes: contact:user.base contact:user.email
    
  Mappers:
    - Name: username
      Mapper Type: Username Template Importer
      Template: ${CLAIM.open_id}
    
    - Name: email
      Mapper Type: Attribute Importer
      Claim: email
      User Attribute: email
    
    - Name: name
      Mapper Type: Attribute Importer
      Claim: name
      User Attribute: firstName
    
    - Name: external_user_id
      Mapper Type: Attribute Importer
      Claim: open_id
      User Attribute: external_user_id
```

### 5.2 钉钉 SSO 集成

#### 5.2.1 钉钉开放平台配置

| 配置项 | 值 |
|--------|---|
| 应用类型 | 企业内部应用 - H5微应用 |
| 重定向 URL | `https://auth.cinema-platform.com/realms/cinema-platform/broker/dingtalk-{tenant}/endpoint` |
| 权限范围 | `openid`, `corpid` |

#### 5.2.2 Keycloak IdP 配置

```yaml
Identity Provider:
  Alias: dingtalk-jinyi
  Provider Type: OAuth 2.0
  
  Config:
    Authorization URL: https://login.dingtalk.com/oauth2/auth
    Token URL: https://api.dingtalk.com/v1.0/oauth2/userAccessToken
    User Info URL: https://api.dingtalk.com/v1.0/contact/users/me
    Client ID: dingxxxxx
    Client Secret: xxxxxx
    Default Scopes: openid corpid
    
  Mappers:
    - Name: username
      Mapper Type: Username Template Importer
      Template: ${CLAIM.unionId}
    
    - Name: name
      Mapper Type: Attribute Importer
      Claim: nick
      User Attribute: firstName
    
    - Name: mobile
      Mapper Type: Attribute Importer
      Claim: mobile
      User Attribute: mobile
```

### 5.3 企业微信 SSO 集成

#### 5.3.1 企业微信管理后台配置

| 配置项 | 值 |
|--------|---|
| 应用类型 | 自建应用 |
| 可信域名 | `auth.cinema-platform.com` |
| 授权回调域 | `auth.cinema-platform.com` |

#### 5.3.2 Keycloak IdP 配置

```yaml
Identity Provider:
  Alias: wecom-cgv
  Provider Type: OAuth 2.0
  
  Config:
    Authorization URL: https://open.weixin.qq.com/connect/oauth2/authorize
    Token URL: https://qyapi.weixin.qq.com/cgi-bin/gettoken
    User Info URL: https://qyapi.weixin.qq.com/cgi-bin/auth/getuserinfo
    Client ID: ww_corpid
    Client Secret: app_secret
    Default Scopes: snsapi_base
    
  # 注意：企业微信 OAuth 流程特殊，可能需要自定义 Provider
  Custom Config:
    Use Custom Provider: true
    Provider Class: com.cinema.keycloak.WeComIdentityProvider
```

### 5.4 IdP 配置对比表

| 配置项 | 飞书 | 钉钉 | 企业微信 |
|--------|------|------|----------|
| 协议 | OAuth 2.0 / OIDC | OAuth 2.0 | OAuth 2.0 (特殊) |
| 用户唯一标识 | open_id / union_id | unionId | UserId |
| 获取手机号 | 需申请权限 | 需申请权限 | 需申请权限 |
| 获取邮箱 | 支持 | 支持 | 需额外接口 |
| 实现复杂度 | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

---

## 6. 登录流程设计

### 6.1 租户识别流程

```
┌─────────────────────────────────────────────────────────────────┐
│                      用户访问入口                                │
│         https://wanda.cinema-platform.com                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      租户识别 (前端)                             │
│  1. 解析子域名 → wanda                                          │
│  2. 调用 API 获取租户配置                                        │
│  3. 获取租户的 IdP 类型 → feishu                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      显示登录页面                                │
│  ┌─────────────────────────────────────────┐                   │
│  │        万达影城 管理后台                  │                   │
│  │                                         │                   │
│  │    ┌─────────────────────────────┐     │                   │
│  │    │    🔵 飞书账号登录           │     │                   │
│  │    └─────────────────────────────┘     │                   │
│  │                                         │                   │
│  │    ─────────── 或 ───────────          │                   │
│  │                                         │                   │
│  │    账号: [________________]             │                   │
│  │    密码: [________________]             │                   │
│  │         [     登录     ]               │                   │
│  └─────────────────────────────────────────┘                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ 点击"飞书账号登录"
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      重定向到 Keycloak                          │
│  /realms/cinema-platform/protocol/openid-connect/auth           │
│  ?client_id=cinema-admin-web                                    │
│  &redirect_uri=https://wanda.cinema-platform.com/callback       │
│  &kc_idp_hint=feishu-wanda                                      │
│  &login_hint=tenant:wanda                                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Keycloak 处理                              │
│  1. 识别 kc_idp_hint → feishu-wanda                            │
│  2. 重定向到飞书授权页面                                         │
│  3. 用户在飞书完成授权                                          │
│  4. 飞书回调 Keycloak                                           │
│  5. Keycloak 创建/更新用户，设置 Organization 归属               │
│  6. 生成 JWT Token（含 tenant_id）                              │
│  7. 重定向回应用                                                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      前端获取 Token                              │
│  1. 从 URL 获取 authorization code                              │
│  2. 调用 Keycloak Token 端点换取 access_token                    │
│  3. 解析 JWT 获取 tenant_id, roles                              │
│  4. 存储 Token，进入应用主页面                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 首次登录用户处理

```yaml
First Broker Login Flow:
  1. Review Profile:
     - 检查从 IdP 获取的用户信息
     - 可选：要求用户补充必填字段
  
  2. Create User If Not Exists:
     - 根据 external_id 查找现有用户
     - 若不存在则创建新用户
  
  3. Link Brokered Account:
     - 建立 IdP 账户与 Keycloak 用户的关联
  
  4. Set Organization Membership:
     - 将用户加入对应的 Organization
     - 设置 tenant_id 用户属性
  
  5. Sync to Supabase:
     - 触发 Webhook 同步用户到 tenant_users 表
```

---

## 7. 系统集成设计

### 7.1 Spring Boot 集成

#### 7.1.1 依赖配置

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
<dependency>
    <groupId>org.keycloak</groupId>
    <artifactId>keycloak-spring-boot-starter</artifactId>
    <version>24.0.0</version>
</dependency>
```

#### 7.1.2 应用配置

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://auth.cinema-platform.com/realms/cinema-platform
          jwk-set-uri: https://auth.cinema-platform.com/realms/cinema-platform/protocol/openid-connect/certs

# 自定义配置
app:
  multi-tenant:
    enabled: true
    tenant-header: X-Tenant-ID
    tenant-claim: tenant_id
```

#### 7.1.3 租户上下文过滤器

```java
@Component
public class TenantContextFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) {
        
        // 从 JWT 中提取 tenant_id
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            String tenantId = jwtAuth.getToken().getClaimAsString("tenant_id");
            TenantContext.setCurrentTenant(tenantId);
        }
        
        try {
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
```

### 7.2 React 前端集成

#### 7.2.1 依赖

```json
{
  "dependencies": {
    "@react-keycloak/web": "^3.4.0",
    "keycloak-js": "^24.0.0"
  }
}
```

#### 7.2.2 Keycloak 初始化

```typescript
// src/auth/keycloak.ts
import Keycloak from 'keycloak-js';

const getTenantFromDomain = (): string => {
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];
  return subdomain;
};

export const initKeycloak = async () => {
  const tenant = getTenantFromDomain();
  
  const keycloak = new Keycloak({
    url: 'https://auth.cinema-platform.com',
    realm: 'cinema-platform',
    clientId: 'cinema-admin-web',
  });

  await keycloak.init({
    onLoad: 'check-sso',
    pkceMethod: 'S256',
    checkLoginIframe: false,
  });

  return keycloak;
};

// SSO 登录
export const loginWithSSO = (keycloak: Keycloak, tenant: string, idpType: string) => {
  const idpHint = `${idpType}-${tenant}`; // e.g., 'feishu-wanda'
  
  keycloak.login({
    idpHint: idpHint,
    redirectUri: window.location.origin + '/callback',
  });
};
```

### 7.3 Supabase JWT 集成

#### 7.3.1 配置 Supabase 信任 Keycloak JWT

```sql
-- 在 Supabase Dashboard 或通过 API 配置
ALTER DATABASE postgres SET "app.jwt_secret" = 'your-keycloak-public-key';

-- 或配置 JWKS 端点
ALTER DATABASE postgres SET "app.jwt_jwks_url" = 
  'https://auth.cinema-platform.com/realms/cinema-platform/protocol/openid-connect/certs';
```

#### 7.3.2 RLS 策略使用 Keycloak JWT Claims

```sql
-- 创建获取 tenant_id 的函数
CREATE OR REPLACE FUNCTION auth.tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'tenant_id')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  )
$$;

-- 使用该函数的 RLS 策略
CREATE POLICY tenant_policy ON products
    FOR ALL
    USING (tenant_id = auth.tenant_id());
```

---

## 8. 租户生命周期管理

### 8.1 租户入驻流程

```
┌──────────────────────────────────────────────────────────────┐
│                     租户入驻申请                              │
│  1. 销售提交入驻申请（租户名称、联系人、计划等级）             │
│  2. 平台管理员审核                                           │
└───────────────────────────┬──────────────────────────────────┘
                            │ 审核通过
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                     自动化入驻                                │
│  1. 创建 Supabase 租户记录                                   │
│  2. 调用 Keycloak Admin API 创建 Organization                │
│  3. 生成租户管理员账号                                       │
│  4. 配置租户子域名                                           │
│  5. 发送入驻成功邮件                                         │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                     IdP 配置                                  │
│  1. 租户管理员登录后台                                       │
│  2. 进入「身份源配置」页面                                    │
│  3. 选择 IdP 类型（飞书/钉钉/企微）                          │
│  4. 填写 IdP 凭证（App ID, App Secret）                      │
│  5. 系统自动创建 Keycloak Identity Provider                  │
│  6. 系统自动配置用户属性映射                                 │
└──────────────────────────────────────────────────────────────┘
```

### 8.2 API 设计

```yaml
# 租户管理 API
POST   /api/platform/tenants              # 创建租户
GET    /api/platform/tenants              # 租户列表
GET    /api/platform/tenants/{id}         # 租户详情
PUT    /api/platform/tenants/{id}         # 更新租户
DELETE /api/platform/tenants/{id}         # 删除租户
POST   /api/platform/tenants/{id}/suspend # 暂停租户
POST   /api/platform/tenants/{id}/resume  # 恢复租户

# IdP 配置 API (租户管理员使用)
GET    /api/tenant/idp/config             # 获取当前 IdP 配置
POST   /api/tenant/idp/config             # 配置 IdP
PUT    /api/tenant/idp/config             # 更新 IdP 配置
DELETE /api/tenant/idp/config             # 删除 IdP 配置
POST   /api/tenant/idp/test               # 测试 IdP 连接
```

---

## 9. 安全设计

### 9.1 安全措施

| 安全项 | 措施 |
|--------|------|
| Token 安全 | PKCE 流程，短有效期，Refresh Token 轮转 |
| 传输安全 | 全链路 HTTPS，HSTS |
| 租户隔离 | JWT 强制携带 tenant_id，RLS 策略兜底 |
| IdP 凭证存储 | 加密存储，Keycloak Vault Provider |
| 审计日志 | 记录所有登录、授权、配置变更 |
| 会话管理 | 支持单点登出，管理员强制下线 |

### 9.2 权限矩阵

| 角色 | 平台管理 | 租户管理 | 门店管理 | 数据访问范围 |
|------|----------|----------|----------|--------------|
| platform-admin | ✅ | ✅ | ✅ | 所有租户 |
| tenant-admin | ❌ | ✅ | ✅ | 本租户 |
| store-manager | ❌ | ❌ | ✅ | 本租户-授权门店 |
| store-staff | ❌ | ❌ | 部分 | 本租户-授权门店 |

---

## 10. 实施路线图

### 10.1 阶段规划

```
Phase 1: 基础设施 (2周)
├── Keycloak 部署与基础配置
├── Realm 和 Client 创建
├── Organization 功能验证
└── 与现有系统集成验证

Phase 2: 飞书集成 (1周)
├── 飞书开放平台应用创建
├── Keycloak 飞书 IdP 配置
├── 用户属性映射
└── 端到端登录测试

Phase 3: 钉钉集成 (1周)
├── 钉钉开放平台应用创建
├── Keycloak 钉钉 IdP 配置
└── 端到端登录测试

Phase 4: 企业微信集成 (1.5周)
├── 企业微信应用创建
├── 自定义 Keycloak Provider (如需要)
└── 端到端登录测试

Phase 5: 租户管理功能 (2周)
├── 租户入驻流程开发
├── IdP 自助配置界面
├── 租户管理后台
└── 审计日志功能

Phase 6: 生产上线 (1周)
├── 性能测试
├── 安全审计
├── 灰度发布
└── 监控告警配置
```

### 10.2 工作量评估

| 阶段 | 工作量 | 人员配置 |
|------|--------|----------|
| Phase 1: 基础设施 | 2 周 | 后端 1人 + DevOps 1人 |
| Phase 2: 飞书集成 | 1 周 | 后端 1人 |
| Phase 3: 钉钉集成 | 1 周 | 后端 1人 |
| Phase 4: 企业微信集成 | 1.5 周 | 后端 1人 |
| Phase 5: 租户管理 | 2 周 | 后端 1人 + 前端 1人 |
| Phase 6: 上线 | 1 周 | 全员 |
| **总计** | **8.5 周** | - |

---

## 11. 技术风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 企业微信 OAuth 流程特殊 | 集成复杂度高 | 预研自定义 Provider，评估第三方方案 |
| IdP 接口变更 | 登录失败 | 监控 + 告警，及时响应 |
| Keycloak 高可用 | 全站不可用 | 集群部署，多活架构 |
| Token 泄露 | 数据安全 | 短有效期 + Token 绑定 + 审计 |
| 租户隔离失效 | 数据泄露 | RLS 兜底 + 定期审计 + 自动化测试 |

---

## 12. 附录

### 12.1 参考文档

- [Keycloak 官方文档](https://www.keycloak.org/documentation)
- [飞书开放平台 - 身份验证](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-way-to-identify-user)
- [钉钉开放平台 - 授权登录](https://open.dingtalk.com/document/orgapp/obtain-identity-credentials)
- [企业微信开发文档 - 网页授权登录](https://developer.work.weixin.qq.com/document/path/91335)

### 12.2 术语表

| 术语 | 说明 |
|------|------|
| IdP | Identity Provider，身份提供者 |
| SSO | Single Sign-On，单点登录 |
| OIDC | OpenID Connect，身份认证协议 |
| RLS | Row Level Security，行级安全 |
| PKCE | Proof Key for Code Exchange，授权码增强 |
| Realm | Keycloak 中的隔离域 |
| Organization | Keycloak 24+ 的多租户特性 |

---

## 变更记录

| 版本 | 日期 | 作者 | 变更内容 |
|------|------|------|----------|
| v1.0 | 2026-01-13 | - | 初始版本 |
