# Bug 修复记录：移除不存在的登录页面引用

**日期**: 2025-12-24
**问题**: 微信小程序运行时报错 `navigateTo:fail page "pages/login/index" is not found`

## 问题原因

项目中存在旧的显式登录页面引用，但我们实现的是**静默登录**架构，无需用户手动跳转到登录页。

## 受影响文件

### 1. `/hall-reserve-taro/src/services/reservationService.ts`

**原问题**:
- 401 错误时跳转到不存在的 `/pages/login/index`

**修复方案**:
```typescript
// ❌ 修复前：跳转登录页
if (response.statusCode === 401) {
  Taro.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
  Taro.removeStorageSync('access_token')
  Taro.navigateTo({ url: '/pages/login/index' })
  throw new Error('Unauthorized')
}

// ✅ 修复后：自动重新静默登录
if (response.statusCode === 401) {
  console.log('[ReservationService] Token expired, attempting silent login...')
  try {
    await silentLogin()
    // 重新发起原请求
    return request<T>(options)
  } catch (error) {
    clearAuth()
    Taro.showToast({ title: '登录已过期，请重启小程序', icon: 'none' })
    throw new Error('Unauthorized')
  }
}
```

**改进点**:
- ✅ 401 错误时自动触发静默登录
- ✅ 登录成功后自动重试原请求，无需用户干预
- ✅ 仅在静默登录失败时才提示用户重启小程序

### 2. `/hall-reserve-taro/src/pages/profile/index.tsx`

**原问题**:
- 未登录时点击头像或菜单项跳转到不存在的 `/pages/login/index`

**修复方案**:
```typescript
// ❌ 修复前：跳转登录页
const handleAvatarClick = () => {
  if (!isLoggedIn) {
    Taro.navigateTo({
      url: '/pages/login/index?redirect=/pages/profile/index',
    })
  }
}

// ✅ 修复后：触发静默登录
const handleAvatarClick = async () => {
  if (!isLoggedIn) {
    Taro.showLoading({ title: '登录中...' })
    try {
      await silentLogin()
      Taro.hideLoading()
      Taro.showToast({ title: '登录成功', icon: 'success' })
    } catch (error) {
      Taro.hideLoading()
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
    }
  }
}
```

**改进点**:
- ✅ 使用 `useUserStore` 替代本地 state 管理登录态
- ✅ 未登录时触发静默登录，无需跳转页面
- ✅ 菜单项点击时同样支持自动登录

## 测试验证

### 验证步骤

1. **清除本地存储**
   ```javascript
   // 在微信开发者工具 Console 执行
   wx.clearStorage()
   ```

2. **重新启动小程序**
   - 应自动触发静默登录（app.tsx 的 useEffect）
   - 检查 Console 日志确认登录流程

3. **访问"我的"页面**
   - 未登录时点击头像，应触发静默登录
   - 登录成功后显示用户信息

4. **测试 401 错误恢复**
   - 手动删除本地 token
   - 访问需要认证的接口（如"我的预约"）
   - 应自动重新登录并重试请求

### 预期结果

✅ 所有场景下都不会出现 `navigateTo:fail page "pages/login/index" is not found` 错误
✅ 用户无感知完成登录，无需手动跳转
✅ Token 过期时自动刷新，业务流程不中断

## 相关文件清单

**已修改**:
- ✅ `hall-reserve-taro/src/services/reservationService.ts`
- ✅ `hall-reserve-taro/src/pages/profile/index.tsx`

**新增（User Story 1）**:
- ✅ `hall-reserve-taro/src/services/authService.ts` - 静默登录服务
- ✅ `hall-reserve-taro/src/utils/storage.ts` - 本地存储工具
- ✅ `hall-reserve-taro/src/stores/userStore.ts` - 用户状态管理
- ✅ `hall-reserve-taro/src/types/auth.ts` - 认证类型定义
- ✅ `hall-reserve-taro/src/types/user.ts` - 用户类型定义
- ✅ `hall-reserve-taro/src/app.tsx` - 应用启动时自动登录

## 后续改进

User Story 2 将进一步完善登录体验：
- [ ] T030: 实现 `refreshToken()` 自动刷新令牌
- [ ] T031: 实现 `checkTokenExpiry()` 过期检查
- [ ] T032: 创建统一的 `request.ts` 拦截器处理 401
- [ ] T033: 完善 `logout()` 退出登录逻辑
- [ ] T034: 优化启动检查逻辑（先检查本地令牌有效性）

## 总结

✅ **问题已解决**: 移除了所有对不存在登录页的引用
✅ **架构一致**: 所有认证流程统一使用静默登录
✅ **用户体验**: 无感知自动登录，无需手动跳转页面
✅ **容错能力**: Token 过期时自动重试，提高系统稳定性
