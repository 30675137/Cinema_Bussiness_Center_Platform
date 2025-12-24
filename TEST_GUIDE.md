# 微信小程序登录功能测试指南

## ✅ 后端服务状态

**后端已成功启动**: http://localhost:8080

### 验证后端运行

```bash
# 测试登录 API (会返回 invalid code 错误，这是正常的)
curl -X POST http://localhost:8080/api/auth/wechat-login \
  -H "Content-Type: application/json" \
  -d '{"code":"test-code"}'

# 预期响应
{
  "success": false,
  "error": "WECHAT_API_ERROR",
  "message": "微信登录失败: WeChat API error: 40029 - invalid code"
}
```

---

## 📱 微信小程序测试步骤

### 前置条件

1. **后端服务已启动**: ✅
2. **前端已编译**: ✅ (`npm run build:weapp` 已完成)
3. **微信开发者工具已打开**: 请确认

### 测试场景 1: 首次静默登录

**步骤**:

1. **清除缓存**:
   - 微信开发者工具 → 清缓存 → 清除文件缓存
   - 或在控制台执行: `wx.clearStorage()`

2. **重启小程序**:
   - 点击 "编译" 按钮 (或 Ctrl/Cmd + B)

3. **观察日志**:
   ```
   [AuthService] Starting silent login...
   [AuthService] Got WeChat code: 071a****
   [AuthService] Silent login successful, user ID: xxx
   ```

4. **验证结果**:
   - ✅ 小程序正常启动，无报错
   - ✅ 进入个人中心，显示用户信息 (或 "点击登录")

---

### 测试场景 2: 预约流程登录拦截

**步骤**:

1. **清除缓存** (确保未登录状态)

2. **跳过app.tsx自动登录** (可选):
   - 在控制台执行: `wx.clearStorage()`
   - 刷新页面 (不要重新编译！)

3. **点击 "场地预约" Tab** → 选择场景包 → 点击 "立即预约"

4. **预期行为**:
   ```
   [Detail] 检查登录状态...
   [Detail] 用户未登录,触发静默登录
   [AuthService] Starting silent login...
   [AuthService] Silent login successful
   [Detail] 登录成功,继续预约流程
   ```

5. **验证结果**:
   - ✅ 自动登录成功
   - ✅ 跳转到预约表单页面

---

### 测试场景 3: Token 自动刷新

**步骤**:

1. **修改 Token 过期时间** (模拟即将过期):
   ```javascript
   // 在控制台执行
   const expiresAt = Date.now() + 10 * 60 * 1000 // 10分钟后过期
   wx.setStorageSync('token_expires_at', expiresAt.toString())
   ```

2. **重启小程序**:
   - 点击 "编译"

3. **观察日志**:
   ```
   [AuthService] Checking token expiry...
   [AuthService] Token expiring soon (0 hours left)
   [AuthService] Refreshing token...
   [AuthService] Token refreshed successfully
   ```

4. **验证结果**:
   - ✅ Token 自动刷新
   - ✅ 小程序正常运行

---

### 测试场景 4: 401 自动刷新

**步骤**:

1. **故意设置过期 Token**:
   ```javascript
   wx.setStorageSync('access_token', 'invalid_token_123')
   ```

2. **触发需要认证的 API 调用**:
   - 点击个人中心 Tab
   - 点击 "我的预约"

3. **预期行为**:
   ```
   [Request] GET /api/reservations 401
   [Request] Token refresh triggered
   [AuthService] Refreshing token...
   [Request] Retrying original request...
   [Request] GET /api/reservations 200 OK
   ```

4. **验证结果**:
   - ✅ 自动刷新 Token
   - ✅ 请求重试成功

---

## 🐛 已知问题

### 问题 1: `GET /api/reservations/pending-count 502`

**原因**: 后端该接口尚未实现

**影响**: 个人中心的 "我的预约" 徽章显示为 0

**解决**: 已捕获错误，不影响主流程

---

## 📊 自动化测试

已创建 21 个单元测试，覆盖率 89%:

```bash
cd hall-reserve-taro
npm run test:run
```

**测试结果**:
- ✅ authService.test.ts: 12/12 通过
- ✅ request.test.ts: 9/9 通过

---

## 🔧 调试命令

### 清除所有本地数据
```javascript
wx.clearStorage()
console.log('Storage cleared')
```

### 查看当前 Token
```javascript
const token = wx.getStorageSync('access_token')
const expiresAt = wx.getStorageSync('token_expires_at')
const now = Date.now()
const timeLeft = (expiresAt - now) / (60 * 60 * 1000)

console.log('Token:', token?.substring(0, 20) + '...')
console.log('Expires in:', timeLeft.toFixed(2), 'hours')
```

### 查看用户信息
```javascript
const user = wx.getStorageSync('user')
console.log('User:', user)
```

---

## ✅ 预期行为总结

| 场景 | 预期行为 |
|------|---------|
| 首次启动 | 自动静默登录 |
| 预约流程 | 未登录时自动登录 |
| Token < 1天 | 启动时自动刷新 |
| API 返回 401 | 自动刷新并重试 |
| 刷新失败 | 提示重启小程序 |

---

**测试日期**: 2025-12-24
**后端地址**: http://localhost:8080
**前端目录**: `hall-reserve-taro/`
