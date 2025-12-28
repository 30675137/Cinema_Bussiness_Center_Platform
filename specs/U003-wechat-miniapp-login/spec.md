# Feature Specification: 微信小程序登录功能

**Feature Branch**: `U003-wechat-miniapp-login`
**Created**: 2025-12-24
**Status**: Draft
**Input**: User description: "根据 /Users/lining/qoder/Cinema_Bussiness_Center_Platform/docs/业务需求/微信小程序登录功能需求规约.md 实现"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 静默自动登录获取用户身份 (Priority: P1)

作为影院小程序用户,当我打开小程序时,系统应自动在后台完成登录流程,无需我手动操作,这样我可以无感知地获得登录态,直接使用需要身份认证的功能(如查看我的预约、创建预约订单)。

**Why this priority**: 这是用户认证系统的核心基础功能,是所有需要身份识别功能的前置依赖。没有静默登录,用户将无法使用任何受保护的功能(我的预约、创建订单等)。P1优先级确保MVP能够支持基本的用户身份识别。

**Independent Test**: 可以独立测试,通过打开小程序并检查本地存储中是否成功获取访问令牌(access token),以及后续调用受保护的API(如查询我的预约)是否返回200而非401来验证登录成功。

**Acceptance Scenarios**:

1. **Given** 新用户首次打开小程序,**When** 小程序启动时调用登录接口,**Then** 系统应自动创建用户记录,返回访问令牌,并存储到本地
2. **Given** 老用户再次打开小程序,**When** 小程序启动时调用登录接口,**Then** 系统应识别已存在用户,返回访问令牌,并更新最后登录时间
3. **Given** 用户已完成静默登录,**When** 访问需要认证的页面(如"我的预约"),**Then** 应成功加载页面内容,不会跳转到登录页
4. **Given** 用户已完成静默登录,**When** 调用需要认证的API(如POST /api/reservations),**Then** 请求应携带有效令牌,后端返回200成功响应
5. **Given** 静默登录过程中微信API调用失败,**When** 系统重试1次后仍失败,**Then** 应显示"网络异常,请重试"提示,并允许用户手动重新登录

---

### User Story 2 - 登录态持久化与自动刷新 (Priority: P1)

作为已登录的小程序用户,当我关闭小程序再次打开时,系统应能识别我的登录状态而无需重新登录。当访问令牌即将过期时,系统应自动刷新令牌,保持我的登录态持续有效。

**Why this priority**: 登录态管理直接影响用户体验,如果每次打开小程序都需要重新登录,或者令牌过期后无法自动刷新导致频繁被踢出登录,会严重降低用户满意度。P1优先级确保核心登录流程的完整性。

**Independent Test**: 可以独立测试,通过在小程序完成登录后关闭并重新打开,检查本地存储中的令牌是否仍然存在且有效,以及在令牌即将过期时(模拟时间或设置短过期时间)系统是否自动调用刷新接口获取新令牌。

**Acceptance Scenarios**:

1. **Given** 用户已完成登录,**When** 关闭小程序后再次打开,**Then** 本地存储的访问令牌和刷新令牌应仍然存在,用户无需重新登录
2. **Given** 访问令牌距离过期仅剩1天,**When** 系统检测到令牌即将过期,**Then** 应自动使用刷新令牌调用刷新接口,获取新的访问令牌并更新本地存储
3. **Given** 访问令牌已过期,**When** 用户调用受保护的API返回401 Unauthorized,**Then** 系统应自动使用刷新令牌尝试刷新访问令牌,刷新成功后重新发起原请求
4. **Given** 刷新令牌也已过期,**When** 系统尝试刷新访问令牌时返回401,**Then** 应清除本地所有登录态数据,显示"登录已过期,请重新登录"提示,并引导用户重新登录
5. **Given** 用户主动点击退出登录,**When** 触发退出登录操作,**Then** 应清除本地存储的所有令牌和用户信息,并跳转到首页

---

### User Story 3 - 受保护页面的登录拦截与跳转 (Priority: P2)

作为未登录的小程序用户,当我尝试访问需要登录的页面(如"我的预约"、预约表单)时,系统应拦截我的访问,显示登录提示,引导我完成登录,登录成功后自动返回我原本想访问的页面。

**Why this priority**: 路由守卫是登录系统的重要配套功能,防止未登录用户访问受保护资源,同时提供良好的用户体验(登录后自动跳转回原页面)。虽然不是登录功能本身,但对完整用户体验至关重要,因此设为P2优先级。

**Independent Test**: 可以独立测试,通过未登录状态下点击"我的预约"或"立即预约"按钮,检查是否弹出登录提示,完成登录后是否自动跳转回原页面,而不是跳转到首页。

**Acceptance Scenarios**:

1. **Given** 用户未登录,**When** 点击TabBar中的"我的预约"页面,**Then** 应拦截访问并弹出登录提示弹窗,显示"请先登录后再查看预约"和"去登录"/"取消"按钮
2. **Given** 用户未登录,**When** 在场景包详情页点击"立即预约"按钮,**Then** 应拦截操作并弹出登录提示弹窗,显示"请先登录后再进行预约"
3. **Given** 用户在详情页被拦截并点击"去登录",**When** 完成登录流程,**Then** 应自动跳转回详情页,而不是跳转到首页
4. **Given** 用户已登录,**When** 访问"我的预约"或点击"立即预约",**Then** 应正常进入对应页面,不显示登录提示
5. **Given** 用户访问公开页面(首页、场景包详情、门店详情),**When** 页面加载,**Then** 无论是否登录都应正常显示,不进行登录检查

---

### User Story 4 - 完善用户资料(头像昵称手机号) (Priority: P3)

作为已完成静默登录的用户,当我首次使用小程序时,系统应引导我完善个人资料(头像、昵称、手机号),这样我可以拥有个性化的身份展示,并在创建订单时使用手机号作为联系方式。

**Why this priority**: 完善用户资料是可选的增强功能,静默登录已经提供了基本的身份识别能力(OpenID),用户可以正常使用预约功能。头像昵称和手机号主要用于提升体验和订单联系,属于非核心功能,因此设为P3优先级,可以在MVP之后迭代添加。

**Independent Test**: 可以独立测试,通过在完成静默登录后(作为新用户),检查是否显示完善资料的引导页面或弹窗,填写头像、昵称、手机号后,后端数据库中用户记录是否正确更新这些字段。

**Acceptance Scenarios**:

1. **Given** 新用户完成静默登录且未设置头像昵称,**When** 首次进入"我的"页面,**Then** 应显示默认头像和"点击设置头像昵称"的引导文案
2. **Given** 用户点击头像选择器,**When** 选择本地图片作为头像,**Then** 应上传头像并更新用户资料,头像立即在界面中显示
3. **Given** 用户输入昵称,**When** 点击保存按钮,**Then** 应调用更新用户资料接口,昵称保存成功后在界面中显示
4. **Given** 用户在创建预约订单时需要提供手机号,**When** 点击"获取手机号"按钮并授权,**Then** 应调用后端解密接口,解密成功后将手机号保存到用户资料并自动填充到订单表单中
5. **Given** 用户已设置头像昵称和手机号,**When** 再次访问"我的"页面,**Then** 应显示用户设置的头像、昵称和手机号,不再显示引导文案

---

### Edge Cases

- **微信API调用失败**: 当调用wx.login或code2Session接口失败时(网络异常、微信服务器故障),系统应重试1次,仍失败则显示"网络异常,请重试"提示,并提供手动重新登录入口
- **令牌解析失败**: 当本地存储的访问令牌格式损坏或签名无效时,系统应清除所有本地登录态数据,自动触发静默登录流程,无需用户手动操作
- **并发登录冲突**: 当用户在多个设备同时登录同一账号时,系统应允许并发登录,每个设备拥有独立的访问令牌,不互相影响(无单设备登录限制)
- **微信OpenID变更**: 当用户卸载小程序后重新安装,或微信账号迁移时,OpenID可能发生变化,系统应将其视为新用户,重新创建用户记录(历史数据无法自动关联)
- **手机号解密失败**: 当用户授权手机号后,后端解密失败(session_key过期或解密算法错误)时,应提示用户"手机号获取失败,请重试",并允许用户重新授权
- **长时间未使用小程序**: 当用户超过30天未打开小程序,刷新令牌已过期,再次打开时应自动触发静默登录,重新获取访问令牌,对用户透明无感知

## Requirements *(mandatory)*

### Functional Requirements

#### 静默登录核心功能

- **FR-001**: 系统必须在小程序启动时自动调用微信登录接口(wx.login),获取临时登录凭证code,无需用户手动触发
- **FR-002**: 系统必须将code发送到后端登录接口(POST /api/auth/wechat-login),后端使用code调用微信code2Session接口换取用户唯一标识openid和会话密钥session_key
- **FR-003**: 系统必须在后端根据openid查找用户记录,如用户不存在则自动创建新用户(使用Supabase Auth的auth.users表,将openid存储在user_metadata或app_metadata中),如用户已存在则更新最后登录时间(last_login_at)
- **FR-004**: 系统必须在用户登录成功后签发JWT访问令牌(access token)和刷新令牌(refresh token),访问令牌有效期为7天,刷新令牌有效期为30天
- **FR-005**: 系统必须将访问令牌、刷新令牌和用户基本信息(id, openid, nickname, avatarUrl, phone)存储到本地存储(Taro.setStorageSync)

#### 登录态管理

- **FR-006**: 系统必须在访问令牌距离过期仅剩1天时,自动使用刷新令牌调用刷新接口(POST /api/auth/refresh-token),获取新的访问令牌并更新本地存储
- **FR-007**: 系统必须在API请求返回401 Unauthorized时,自动尝试使用刷新令牌刷新访问令牌,刷新成功后重新发起原请求,刷新失败则清除本地登录态并提示用户重新登录
- **FR-008**: 系统必须在用户点击退出登录时,清除本地存储的所有令牌(access_token, refresh_token)和用户信息(user_info),并跳转到首页
- **FR-009**: 系统必须在小程序关闭后重新打开时,检查本地存储的访问令牌是否存在,如存在且未过期则继续使用,如不存在或已过期则自动触发静默登录

#### 路由守卫与访问控制

- **FR-010**: 系统必须区分公开页面(首页、场景包详情、门店详情)和受保护页面(我的预约、预约详情、预约表单),公开页面无需登录检查,受保护页面需验证登录态
- **FR-011**: 系统必须在用户未登录状态下访问受保护页面时,拦截访问并弹出登录提示弹窗,显示"请先登录后再进行操作"和"去登录"/"取消"按钮
- **FR-012**: 系统必须记录用户登录前原本想访问的页面路径(如详情页、我的预约页),登录成功后自动跳转回该页面,如无记录则跳转首页
- **FR-013**: 系统必须在所有需要认证的API请求中自动添加Authorization请求头,格式为"Bearer {access_token}",后端验证令牌有效性

#### 用户资料完善(可选)

- **FR-014**: 系统必须提供用户资料更新接口(PUT /api/users/profile),支持更新昵称(nickname)、头像URL(avatarUrl)和手机号(phone)字段
- **FR-015**: 系统必须在用户授权手机号后,调用后端解密接口(POST /api/auth/decrypt-phone),使用session_key解密encryptedData获取手机号明文
- **FR-016**: 系统必须在用户未设置头像昵称时,在"我的"页面显示默认头像和引导文案"点击设置头像昵称",引导用户完善资料

#### 安全与容错

- **FR-017**: 系统必须确保微信AppSecret仅存储在后端环境变量中,不得暴露给前端代码或日志
- **FR-018**: 系统必须使用HTTPS协议进行所有API通信,防止令牌在传输过程中被窃取
- **FR-019**: 系统必须在微信登录凭证code使用后立即失效,确保code不能被重复使用(防重放攻击)
- **FR-020**: 系统必须在JWT令牌签名时使用HS256算法,密钥长度不小于256位,并定期轮换密钥

### Key Entities

- **用户(User)**: 小程序用户的核心实体,使用Supabase Auth的auth.users表管理核心身份认证,微信唯一标识(openid)存储在user_metadata中。业务字段包含昵称(nickname)、头像URL(avatarUrl)、手机号(phone)等,存储在user_metadata或app_metadata中。用户通过openid与微信账号唯一绑定,通过auth.uid()与预约订单等业务数据关联。账号状态和登录时间由Supabase Auth自动管理。
- **访问令牌(Access Token)**: 短期有效的JWT令牌(有效期7天),由Supabase Auth签发,包含用户UUID(auth.uid())和openid,用于验证用户身份。每次API请求需在Authorization请求头中携带访问令牌,后端通过Supabase Auth验证令牌签名和过期时间。
- **刷新令牌(Refresh Token)**: 长期有效的JWT令牌(有效期30天),由Supabase Auth管理,用于在访问令牌过期时获取新的访问令牌,避免用户频繁重新登录。刷新令牌仅用于调用刷新接口,不能直接用于API请求验证。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户打开小程序时,静默登录流程在2秒内完成(包含调用wx.login和后端登录接口),用户无感知地获得登录态
- **SC-002**: 新用户首次登录成功率达到95%以上,失败情况主要由网络异常导致,系统自动重试1次后成功率达到99%
- **SC-003**: 老用户再次打开小程序时,本地存储的访问令牌命中率达到80%以上(未过期),无需重新调用登录接口,直接使用缓存令牌
- **SC-004**: 访问令牌自动刷新成功率达到98%以上,刷新失败时系统自动引导用户重新登录,不会出现用户无法使用功能的情况
- **SC-005**: 未登录用户访问受保护页面时,100%被正确拦截并显示登录提示,登录成功后100%自动跳转回原页面
- **SC-006**: 用户手动退出登录后,本地存储的所有令牌和用户信息100%被清除,再次访问受保护页面时正确触发登录流程

## Assumptions

- 假设微信小程序已在微信公众平台申请并获取有效的AppID和AppSecret,后端可正常调用微信code2Session接口
- 假设小程序运行环境为微信客户端,支持wx.login、wx.getUserProfile等微信开放能力,不考虑非微信环境(如浏览器H5)的兼容性
- 假设用户设备网络连接稳定,偶尔出现的网络异常通过重试1次可解决,不考虑长时间离线场景
- 假设访问令牌和刷新令牌的有效期分别为7天和30天,符合大多数应用的登录态管理需求,暂不支持自定义有效期
- 假设用户OpenID在微信账号生命周期内保持不变(除非卸载重装或账号迁移),可作为用户唯一标识
- 假设后端Supabase已部署并可正常访问,Supabase Auth功能已启用,auth.users表自动管理用户身份认证,支持在user_metadata中存储自定义字段(如openid)
- 假设登录功能上线时,现有预约订单数据已迁移或关联到新的用户体系,不存在历史数据无法查询的问题

## Dependencies

- **依赖微信开放平台**: 需要小程序已在微信公众平台注册并获取AppID和AppSecret,后端需配置这些凭证才能调用微信code2Session接口
- **依赖Supabase Auth**: 需要Supabase Auth功能已启用,使用auth.users表管理用户身份,支持在user_metadata中存储微信openid,支持自定义认证流程(如微信code2Session适配Supabase Auth登录)
- **依赖后端认证接口**: 需要后端实现POST /api/auth/wechat-login(登录)、POST /api/auth/refresh-token(刷新令牌)、POST /api/auth/decrypt-phone(解密手机号)、PUT /api/users/profile(更新用户资料)等接口,这些接口需集成Supabase Auth SDK进行用户创建和令牌管理
- **依赖Supabase Auth SDK**: 后端需集成Supabase Java/HTTP Client,使用supabase.auth.signUp()、supabase.auth.signInWithPassword()等方法管理用户认证,前端可选集成Supabase JS SDK或使用自定义JWT解析
- **依赖Taro框架**: 小程序基于Taro框架开发,需使用Taro.login、Taro.setStorageSync等API,确保跨端(微信小程序/H5)兼容性
- **依赖现有预约订单功能(U001)**: 登录功能是预约订单管理系统(U001-reservation-order-management)的前置依赖,预约订单需关联用户ID才能查询"我的预约"

## Related Features

- **U001-reservation-order-management**: 预约订单管理系统,依赖登录功能提供用户身份标识,预约订单通过user_id字段关联到用户
- **F001-miniapp-tab-bar**: 小程序TabBar导航,其中"我的"页面入口需要登录才能查看完整用户信息和预约列表

## Clarifications

### Session 2025-12-24

**Q: 创建 users 表时是否可以考虑使用 Supabase Auth 的内置用户系统?**

**A: 使用 Supabase Auth + metadata 存储 openid (推荐)**

**理由与决策**:
- **架构决策**: 使用Supabase Auth的auth.users表作为核心身份认证基础,将微信openid存储在user_metadata或app_metadata中,而不是创建自定义的public.users表
- **优势**:
  1. **安全性**: 利用Supabase Auth内置的密码哈希、会话管理、JWT签发和验证功能,减少自定义认证代码的安全风险
  2. **标准化**: 遵循Supabase生态的标准认证模式,便于集成RLS(Row Level Security)策略,使用auth.uid()进行权限控制
  3. **减少代码**: 无需自己实现JWT签发、刷新、验证逻辑,直接使用Supabase Auth SDK提供的方法
  4. **可扩展性**: 未来如需支持其他登录方式(手机号、邮箱),可复用Supabase Auth的多Provider机制
- **实现要点**:
  1. 后端在收到微信code后,调用微信code2Session获取openid
  2. 使用openid作为唯一标识,调用Supabase Auth的signUp或signInWithPassword方法创建/登录用户
  3. 将openid、nickname、avatarUrl、phone等字段存储在user_metadata中
  4. 返回Supabase Auth签发的JWT令牌给前端
  5. 预约订单等业务表通过auth.uid()关联用户,使用RLS策略控制数据访问权限
- **替代方案不被采纳的原因**:
  - **自定义users表**: 需要自己实现所有认证逻辑,增加开发复杂度和安全风险,无法使用Supabase的RLS策略
  - **混合方案(Auth + user_profiles)**: 数据分散在两个表,查询需要JOIN,初期架构复杂度较高,不适合当前需求

**影响的规格部分**:
- FR-003: 明确使用Supabase Auth的auth.users表,openid存储在user_metadata中
- Key Entities - 用户(User): 更新为使用auth.users表,通过auth.uid()关联业务数据
- Key Entities - 访问令牌/刷新令牌: 明确由Supabase Auth签发和管理
- Assumptions: 更新为依赖Supabase Auth功能,而非自定义users表
- Dependencies: 增加对Supabase Auth SDK的依赖,明确认证流程需适配Supabase Auth
