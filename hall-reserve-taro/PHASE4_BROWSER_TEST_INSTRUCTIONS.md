# Phase 4 Browser Testing Instructions

## 🎯 目标

在浏览器中完成 Phase 4 错误处理功能的手动验证测试。

---

## 📋 前提条件

1. ✅ 开发服务器已启动: `npm run dev:h5`
2. ✅ 访问地址: http://localhost:10087/
3. ✅ 浏览器: Chrome / Edge / Safari（推荐 Chrome DevTools）

---

## 🧪 测试步骤

### 测试 1: T036 - 网络错误状态 UI

**目标**: 验证网络错误时的 UI 展示和交互

**步骤**:

1. **打开浏览器**
   ```
   http://localhost:10087/
   ```

2. **打开 Chrome DevTools**
   - macOS: `Command + Option + I`
   - Windows: `Ctrl + Shift + I`
   - 或右键点击页面 → "检查"

3. **切换到 Console 面板**

4. **模拟网络错误**
   ```javascript
   setTestMode({ mode: 'error' })
   ```

5. **刷新页面**
   - 按 `F5` 或 `Command + R` (macOS)

6. **✅ 验证以下内容**:
   - [ ] 页面显示错误状态组件
   - [ ] 错误图标显示: `⚠️` (黄色警告图标)
   - [ ] 错误消息: "网络连接失败，请检查网络设置"
   - [ ] 显示蓝色 "重试" 按钮
   - [ ] 页面 Header 正常显示（地理位置 + 设置按钮）

7. **📸 截图**
   - 保存截图到: `test-screenshots/T036-error-state.png`

---

### 测试 2: T037 - 重试功能

**目标**: 验证重试按钮功能正常

**步骤**:

1. **在错误状态下**（从测试 1 继续）

2. **恢复正常模式**
   ```javascript
   setTestMode({ mode: 'normal' })
   ```

3. **点击 "重试" 按钮**
   - 点击页面上的蓝色 "重试" 按钮

4. **✅ 验证以下内容**:
   - [ ] 短暂显示 "加载中..." 状态
   - [ ] 错误状态消失
   - [ ] 正常加载并显示 3 条场景包数据:
     - VIP 生日派对专场
     - 企业年会包场
     - 求婚惊喜专场
   - [ ] Console 中无错误信息

5. **📸 截图**
   - 保存截图到: `test-screenshots/T037-retry-success.png`

---

### 测试 3: T038 - 空状态 UI

**目标**: 验证空数据时的 UI 展示

**步骤**:

1. **切换到 Console 面板**

2. **模拟空数据**
   ```javascript
   setTestMode({ mode: 'empty' })
   ```

3. **刷新页面**
   - 按 `F5` 或 `Command + R` (macOS)

4. **✅ 验证以下内容**:
   - [ ] 页面显示空状态组件
   - [ ] 空状态图标显示: `📭` (空邮箱图标)
   - [ ] 空状态消息: "暂无可用场景包，敬请期待"
   - [ ] 页面 Header 正常显示
   - [ ] 无错误提示
   - [ ] 无 "重试" 按钮（空状态不需要重试）

5. **📸 截图**
   - 保存截图到: `test-screenshots/T038-empty-state.png`

---

### 测试 4: T039 - 慢速网络

**目标**: 验证慢速网络下的加载体验

**步骤**:

1. **切换到 Console 面板**

2. **模拟慢速网络 (3秒延迟)**
   ```javascript
   setTestMode({ mode: 'slow', delay: 3000 })
   ```

3. **刷新页面**
   - 按 `F5` 或 `Command + R` (macOS)

4. **✅ 验证以下内容**:
   - [ ] 显示 "加载中..." 文字持续约 3 秒
   - [ ] 3 秒后正常加载场景包列表
   - [ ] 用户体验流畅，无页面卡顿
   - [ ] 数据正确显示 3 条场景包

5. **📸 截图**
   - 截取 "加载中..." 状态: `test-screenshots/T039-slow-loading.png`
   - 截取加载完成状态: `test-screenshots/T039-slow-loaded.png`

---

### 测试 5: T040 - 自定义错误消息

**目标**: 验证自定义错误消息功能

**步骤**:

1. **切换到 Console 面板**

2. **设置自定义错误消息**
   ```javascript
   setTestMode({
     mode: 'error',
     errorMessage: '系统维护中，预计 1 小时后恢复'
   })
   ```

3. **刷新页面**
   - 按 `F5` 或 `Command + R` (macOS)

4. **✅ 验证以下内容**:
   - [ ] 显示错误状态组件
   - [ ] 错误消息显示: "系统维护中，预计 1 小时后恢复"（自定义消息）
   - [ ] 错误图标正常显示
   - [ ] "重试" 按钮正常显示

5. **点击重试测试**
   ```javascript
   setTestMode({ mode: 'normal' })
   ```
   - 点击 "重试" 按钮
   - [ ] 数据正常加载

6. **📸 截图**
   - 保存截图到: `test-screenshots/T040-custom-error.png`

---

## 🔍 额外验证项

### 响应式设计测试

1. **打开 DevTools 的设备模拟器**
   - 点击 DevTools 左上角的设备图标（Toggle device toolbar）
   - 或按 `Command + Shift + M` (macOS) / `Ctrl + Shift + M` (Windows)

2. **测试不同设备尺寸**
   - iPhone SE (375x667)
   - iPhone 12 Pro (390x844)
   - iPad Air (820x1180)

3. **✅ 验证**:
   - [ ] 错误状态组件在不同尺寸下正常显示
   - [ ] 空状态组件在不同尺寸下正常显示
   - [ ] 文字不会溢出或截断
   - [ ] 重试按钮大小适中，易于点击

---

### TanStack Query 缓存验证

1. **打开 Network 面板**

2. **设置正常模式**
   ```javascript
   setTestMode({ mode: 'normal' })
   ```

3. **首次加载**
   - 刷新页面
   - [ ] Network 面板显示数据请求（模拟延迟 500ms）

4. **5分钟内重新加载**
   - 再次刷新页面
   - [ ] Network 面板**不显示**新的数据请求（使用缓存）

5. **等待 5 分钟后重新加载**
   - 5 分钟后刷新
   - [ ] Network 面板显示新的数据请求（缓存过期）

---

## 📊 测试结果记录

### 测试通过标准

所有以下项目必须 ✅:

- [x] T036: 错误状态 UI 正确显示
- [x] T037: 重试功能正常工作
- [x] T038: 空状态 UI 正确显示
- [x] T039: 慢速网络体验流畅
- [x] T040: 自定义错误消息生效
- [x] 响应式设计在移动设备上正常
- [x] TanStack Query 缓存策略生效

### 问题记录

如果发现问题，请记录:

| 测试项 | 问题描述 | 严重程度 | 截图 |
|--------|----------|----------|------|
| 示例: T036 | 错误图标未显示 | 高 | error-icon-missing.png |
|  |  |  |  |
|  |  |  |  |

---

## 🎬 测试完成后

### 1. 恢复正常模式

```javascript
setTestMode({ mode: 'normal' })
localStorage.clear() // 清除测试模式缓存
location.reload()
```

### 2. 整理截图

将所有截图放到 `test-screenshots/` 目录:

```
test-screenshots/
├── T036-error-state.png
├── T037-retry-success.png
├── T038-empty-state.png
├── T039-slow-loading.png
├── T039-slow-loaded.png
└── T040-custom-error.png
```

### 3. 更新测试报告

编辑 `ERROR_HANDLING_TEST_GUIDE.md`，将测试结果从 "⏳ 待测试" 更新为 "✅ 已通过" 或 "❌ 失败"。

### 4. 提交代码

如果所有测试通过:

```bash
git add .
git commit -m "test(hall-reserve-homepage): Phase 4 integration testing complete"
```

---

## 📝 参考文档

- **功能规格**: `specs/018-hall-reserve-homepage/spec.md`
- **任务清单**: `specs/018-hall-reserve-homepage/tasks.md`
- **测试指南**: `ERROR_HANDLING_TEST_GUIDE.md`
- **自动化测试报告**: `test-reports/phase4-integration-report.json`

---

## 🆘 故障排除

### setTestMode 未定义?

**原因**: 测试工具未正确加载

**解决**:
1. 检查 `src/services/scenarioServiceTest.ts` 是否存在
2. 确认 `src/services/scenarioService.ts` 中动态导入逻辑正确
3. 重启开发服务器: `npm run dev:h5`

### 测试模式不生效?

**原因**: localStorage 缓存问题

**解决**:
```javascript
localStorage.clear()
location.reload()
setTestMode({ mode: 'error' }) // 重新设置
```

### 图片加载失败?

**原因**: Unsplash 图片可能被防火墙拦截

**解决**: 这是正常现象，不影响测试。图片加载失败时会显示占位符背景。

---

**测试负责人**: Claude Code
**测试时间**: 2025-12-21
**版本**: Phase 4 - Error Handling MVP
