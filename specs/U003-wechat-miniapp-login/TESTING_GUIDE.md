# User Story 1 & 2 测试指南

## 测试环境准备

### 1. 后端服务
- ✅ 后端已启动在 `http://192.168.10.71:8080`
- ✅ 进程 ID: 5487

### 2. 微信开发者工具
确保微信开发者工具已打开项目：
```bash
cd /Users/lining/qoder/Cinema_Bussiness_Center_Platform/hall-reserve-taro
npm run dev:weapp
```

---

## User Story 1 测试：静默自动登录

### 测试场景 1.1：首次启动自动登录

**步骤**：
1. 打开微信开发者工具 Console
2. 清除本地存储：
   ```javascript
   wx.clearStorage()
   ```
3. 重新编译小程序（或点击"重新编译"按钮）
4. 观察 Console 日志

**预期结果**：
```
[App] Initializing authentication...
[App] No cached token found, performing silent login...
[AuthService] Starting silent login...
[AuthService] Got WeChat code: 071****
[AuthService] Silent login successful, user ID: xxxxx-xxxx-xxxx
[App] Silent login successful
```

**验证点**：
- ✅ Console 无报错
- ✅ 本地存储中有 `access_token`, `refresh_token`, `user` 数据
- ✅ 点击底部 Tab "我的" 显示用户信息（不是"点击登录"）

---

### 测试场景 1.2：已登录用户再次启动

**步骤**：
1. 确保已完成场景 1.1（本地有令牌）
2. 重新编译小程序
3. 观察 Console 日志

**预期结果**：
```
[App] Initializing authentication...
[App] Found cached user and token, restoring session: xxxxx
[App] Token is still valid, skipping refresh
```

**验证点**：
- ✅ 没有重新调用登录 API
- ✅ 直接使用本地令牌
- ✅ "我的"页面立即显示用户信息

---

### 测试场景 1.3：未登录用户点击"立即预约"

**步骤**：
1. 清除本地存储：`wx.clearStorage()`
2. 重新编译小程序（此时用户处于未登录状态）
3. 进入首页，点击任意场景包卡片
4. 在详情页选择日期、时段、套餐
5. 点击底部"立即预约"按钮

**预期结果**：
```
[Detail] 登录成功,继续预约流程
```
- ✅ 自动弹出"登录中..."提示
- ✅ 后台自动完成静默登录
- ✅ 登录成功后跳转到预约表单页面
- ✅ 无需用户手动操作

---

### 测试场景 1.4：未登录用户提交预约

**步骤**：
1. 清除本地存储：`wx.clearStorage()`
2. 重新编译，手动跳过登录
3. 通过 URL 直接访问预约表单页（模拟深度链接场景）
4. 填写完整信息后点击"提交预约"

**预期结果**：
- ✅ 提交前自动触发静默登录
- ✅ 登录成功后继续提交预约
- ✅ 跳转到成功页面

---

## User Story 2 测试：登录态持久化与自动刷新

### 测试场景 2.1：令牌即将过期时自动刷新

**注意**：由于令牌有效期为 7 天，无法实际等待。此测试需要**模拟令牌过期**。

**手动模拟步骤**：
1. 完成登录后，在 Console 中修改令牌过期时间：
   ```javascript
   // 将过期时间设置为 12 小时后（模拟即将过期）
   const nowPlus12Hours = Date.now() + 12 * 60 * 60 * 1000
   wx.setStorageSync('token_expires_at', nowPlus12Hours)
   ```
2. 重新编译小程序
3. 观察 Console 日志

**预期结果**：
```
[App] Found cached user and token, restoring session: xxxxx
[App] Token expiring soon, attempting refresh...
[Request] Refreshing token...
[Request] Token refreshed successfully
[App] Token refreshed successfully
```

**验证点**：
- ✅ 自动调用 `/api/auth/refresh-token` 接口
- ✅ 本地存储中的 token 被更新
- ✅ 用户无感知，继续使用

---

### 测试场景 2.2：API 请求遇到 401 自动刷新令牌

**手动模拟步骤**：
1. 完成登录后，在 Console 中手动删除 access_token：
   ```javascript
   wx.removeStorageSync('access_token')
   ```
2. 点击"我的预约"或其他需要认证的功能
3. 观察 Console 日志

**预期结果**：
```
[Request] 401 Unauthorized, attempting token refresh...
[Request] Token refresh in progress, queuing request...
[AuthService] Refreshing token...
[AuthService] Token refreshed successfully
[Request] Token refreshed successfully, retrying original request...
```

**验证点**：
- ✅ 自动刷新令牌
- ✅ 自动重试原请求
- ✅ 最终成功获取数据
- ✅ 用户无感知

---

### 测试场景 2.3：并发请求触发 401 时只刷新一次

**手动模拟步骤**：
1. 删除 access_token
2. 快速点击多个需要认证的功能（如"我的预约"+"待处理订单数量"）
3. 观察 Console 日志

**预期结果**：
```
[Request] 401 Unauthorized, attempting token refresh...
[Request] Token refresh in progress, queuing request...
[Request] Token refresh in progress, queuing request...
[AuthService] Refreshing token...  ← 只调用一次
[AuthService] Token refreshed successfully
[Request] Token refreshed, retrying original request...
[Request] Token refreshed, retrying original request...
```

**验证点**：
- ✅ 只发起一次 refresh-token 请求
- ✅ 其他请求等待刷新完成后重试
- ✅ 所有请求最终都成功

---

### 测试场景 2.4：刷新令牌失败时的降级处理

**手动模拟步骤**：
1. 在 Console 中设置无效的 refresh_token：
   ```javascript
   wx.setStorageSync('refresh_token', 'invalid_token_12345')
   ```
2. 删除 access_token：
   ```javascript
   wx.removeStorageSync('access_token')
   ```
3. 点击"我的预约"

**预期结果**：
```
[Request] 401 Unauthorized, attempting token refresh...
[AuthService] Failed to refresh token: ...
[Request] Token refresh failed, please restart the app
```
- ✅ 显示提示："登录已过期,请重启小程序"
- ✅ 自动清除本地认证数据
- ✅ 用户状态重置为未登录

---

### 测试场景 2.5：退出登录

**步骤**：
1. 确保已登录状态
2. 在"我的"页面添加退出登录按钮（临时测试）：
   ```javascript
   // 在 Console 中执行
   import { logout } from '@/services/authService'
   logout()
   ```
3. 观察效果

**预期结果**：
```
[AuthService] Logging out...
[AuthService] Logout successful
```
- ✅ 显示"已退出登录"提示
- ✅ 1.5 秒后跳转到首页
- ✅ 本地存储被清空
- ✅ 用户状态重置为未登录

---

## 完整流程测试

### 测试流程 A：完整的用户旅程

1. **清空状态**：`wx.clearStorage()` + 重新编译
2. **浏览首页**：能正常查看场景包列表（公开页面）
3. **点击预约**：自动触发静默登录 → 成功跳转表单
4. **提交预约**：成功创建订单 → 跳转成功页
5. **查看我的预约**：能正常查看订单列表
6. **重启小程序**：令牌仍然有效，直接恢复登录态
7. **等待 12 小时后**（模拟）：启动时自动刷新令牌
8. **退出登录**：清除所有数据，回到首页

---

## 常见问题排查

### 问题 1：Console 报错 "No refresh token found"
**原因**：本地没有 refresh_token
**解决**：执行 `wx.clearStorage()` 后重新编译，让系统执行完整登录

### 问题 2：401 错误后无限循环
**原因**：refresh-token 也无效，但没有正确降级
**解决**：检查 `request.ts` 中的错误处理逻辑

### 问题 3：刷新令牌后仍然 401
**原因**：新令牌没有正确保存到本地存储
**解决**：检查 `authService.ts` 中的 `setToken()` 调用

---

## 验证检查清单

### User Story 1 验收标准
- [ ] 小程序启动时自动静默登录
- [ ] 登录成功后获取 JWT 令牌（7天有效期）
- [ ] 令牌存储在本地 Storage
- [ ] 用户信息存储在 Zustand Store
- [ ] 未登录用户点击需认证功能时自动登录

### User Story 2 验收标准
- [ ] 小程序启动时优先使用本地有效令牌
- [ ] 令牌即将过期（<1天）时自动刷新
- [ ] API 请求遇到 401 时自动刷新令牌并重试
- [ ] 并发 401 请求时只刷新一次令牌
- [ ] 刷新失败时提示用户重启小程序
- [ ] 退出登录清除所有认证数据并跳转首页

---

## 下一步

测试完成后，可以继续实现：
- **User Story 3**: 路由守卫（页面级登录拦截）
- **User Story 4**: 用户资料完善（头像、昵称、手机号）

---

**测试愉快！如有任何问题请随时反馈。**
