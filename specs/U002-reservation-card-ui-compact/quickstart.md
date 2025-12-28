# Quick Start: 预约卡片紧凑布局优化

**Feature**: U002-reservation-card-ui-compact
**Date**: 2025-12-24
**Branch**: `U002-reservation-card-ui-compact`

---

## Prerequisites

### Environment Requirements

- **Node.js**: 20.x+
- **Taro CLI**: 3.x (全局安装: `npm install -g @tarojs/cli`)
- **微信开发者工具**: 最新稳定版(用于小程序预览和调试)
- **设计稿**: 750px宽设计稿(如有),用于UI标注对比

### Knowledge Prerequisites

- 熟悉Taro框架基础(组件、样式、rpx单位)
- 了解SCSS/CSS Modules使用
- 了解微信小程序开发者工具基本操作
- 了解U001-reservation-order-management功能(预约单数据结构)

---

## Project Structure

```
hall-reserve-taro/
├── src/
│   ├── components/
│   │   └── ReservationCard/         # 预约卡片组件(本次优化重点)
│   │       ├── index.tsx            # 组件主文件
│   │       ├── index.module.scss    # 组件样式(需修改)
│   │       └── index.config.ts      # 组件配置(无需修改)
│   ├── pages/
│   │   └── my-reservations/         # "我的预约"列表页
│   │       ├── index.tsx            # 页面主文件(无需修改,除非调整列表容器样式)
│   │       └── index.module.scss    # 页面样式(可能需调整容器间距)
│   ├── styles/
│   │   ├── _variables.scss          # 全局样式变量(可选:集中管理卡片样式变量)
│   │   └── _mixins.scss             # 样式mixin(可选:响应式设计工具)
│   └── app.config.ts                # Taro应用配置(无需修改)
├── package.json                      # 依赖配置
├── project.config.json               # 微信小程序项目配置
└── config/
    ├── dev.js                        # 开发环境配置
    └── prod.js                       # 生产环境配置
```

---

## Step 1: Environment Setup

### 1.1 Clone & Checkout Branch

```bash
# 确保当前在项目根目录
cd /Users/lining/qoder/Cinema_Bussiness_Center_Platform

# 检出功能分支
git checkout U002-reservation-card-ui-compact

# 拉取最新代码
git pull origin U002-reservation-card-ui-compact
```

### 1.2 Install Dependencies

```bash
# 进入Taro项目目录
cd hall-reserve-taro

# 安装依赖
npm install

# 验证Taro CLI版本
taro -V  # 应显示 3.x.x
```

### 1.3 Start Dev Server (H5)

```bash
# 启动H5开发服务器
npm run dev:h5

# 浏览器访问 http://localhost:10086
# 导航到 "我的预约" 页面查看现有卡片样式
```

### 1.4 Open WeChat DevTools (小程序)

```bash
# 编译微信小程序
npm run dev:weapp

# 打开微信开发者工具:
# 1. 选择 "导入项目"
# 2. 项目目录: hall-reserve-taro/dist (编译输出目录)
# 3. AppID: 使用测试号或真实AppID
# 4. 预览 "我的预约" 页面
```

---

## Step 2: Understand Current Implementation

### 2.1 Locate ReservationCard Component

```bash
# 查看组件文件
cat hall-reserve-taro/src/components/ReservationCard/index.tsx

# 查看当前样式(优化前基线)
cat hall-reserve-taro/src/components/ReservationCard/index.module.scss
```

### 2.2 Key Files to Modify

| 文件路径 | 修改内容 | 优先级 |
|---------|---------|--------|
| `src/components/ReservationCard/index.module.scss` | 调整字体大小、间距、卡片高度 | **P1 (必须)** |
| `src/components/ReservationCard/index.tsx` | 可能需调整长文本溢出处理逻辑(如添加`-webkit-line-clamp`) | P2 (可选) |
| `src/pages/my-reservations/index.module.scss` | 调整列表容器间距(如果卡片间距变化) | P2 (可选) |
| `src/styles/_variables.scss` | 集中定义样式变量(如果使用全局变量) | P3 (推荐) |

---

## Step 3: Implementation Guide

### 3.1 Backup Current Styles (Optional)

```bash
# 备份当前样式文件,便于对比和回滚
cp src/components/ReservationCard/index.module.scss \
   src/components/ReservationCard/index.module.scss.backup
```

### 3.2 Update SCSS Variables

**修改 `src/components/ReservationCard/index.module.scss`**:

```scss
// 优化前后对照表(参考 data-model.md)
// 优化前 → 优化后

.card {
  // 卡片高度: 400rpx → 280rpx (-30%)
  height: 280rpx; // 修改点 1

  // 垂直内边距: 32rpx → 20rpx
  padding: 20rpx 24rpx; // 修改点 2

  // 卡片间距: 32rpx → 20rpx
  margin-bottom: 20rpx; // 修改点 3

  // 添加分隔线(增强视觉分隔)
  border-bottom: 1rpx solid #e5e5e5; // 修改点 4
}

.title {
  // 标题字体: 36rpx → 30rpx
  font-size: 30rpx; // 修改点 5
  line-height: 1.4; // 修改点 6 (避免文字过紧)

  // 限制2行显示,超出省略
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; // 修改点 7
  overflow: hidden;
  text-overflow: ellipsis;
}

.subtitle {
  // 副标题字体: 30rpx → 26rpx
  font-size: 26rpx; // 修改点 8
  color: #666; // 降低对比度以区分层级
  line-height: 1.3;
}

.price {
  // 金额字体: 36rpx → 32rpx (保持醒目)
  font-size: 32rpx; // 修改点 9
  font-weight: 600; // 加粗
  color: #ff6600; // 强调色
}

.status {
  // 状态标签字体: 26rpx → 24rpx
  font-size: 24rpx; // 修改点 10
  padding: 2rpx 8rpx;
  border-radius: 2rpx;
}

.remarks {
  // 备注字体: 26rpx → 24rpx
  font-size: 24rpx; // 修改点 11
  color: #999;

  // 限制1行显示
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1; // 修改点 12
  overflow: hidden;
  text-overflow: ellipsis;
}

.button {
  // 按钮高度: 80rpx → 64rpx
  height: 64rpx; // 修改点 13

  // 确保最小触控区域 88rpx (44px)
  min-height: 88rpx; // 修改点 14
  padding: 12rpx 24rpx;
}

// 响应式设计: 小屏设备适配
@media (max-width: 375px) {
  .title {
    font-size: 28rpx; // 略微缩小
  }
  .card {
    padding: 16rpx 24rpx; // 减少内边距
  }
}

// 辅助功能: 系统字体放大支持
@media (prefers-font-size: large) {
  .title {
    font-size: 34rpx; // +15%
  }
  .subtitle {
    font-size: 28rpx;
  }
}
```

### 3.3 Test in DevTools

```bash
# H5模式: 刷新浏览器查看效果
# 微信小程序: 编译后自动刷新开发者工具
```

**验证清单**:
- [ ] 一屏显示3-4条完整卡片(优化前为2条)
- [ ] 所有文字清晰可读(不会因过小而模糊)
- [ ] 按钮触控区域足够大(点击无误触)
- [ ] 长文本正确截断(场景包名称2行,备注1行)
- [ ] 卡片间视觉层次清晰(分隔线可见)

---

## Step 4: Testing & Validation

### 4.1 Visual Regression Testing

```bash
# 如果项目已配置Playwright视觉测试
npm run test:visual

# 手动截图对比:
# 1. 在优化前截图保存为 baseline.png
# 2. 在优化后截图保存为 compact.png
# 3. 使用图片对比工具验证差异
```

### 4.2 Multi-Device Testing

**微信开发者工具模拟器测试**:

1. 打开 "调试器" → "模拟器"
2. 切换设备型号:
   - iPhone SE (375 x 667)
   - iPhone 14 (390 x 844)
   - iPad (768 x 1024)
3. 验证在不同屏幕尺寸下卡片布局是否合理

**H5浏览器DevTools测试**:

```bash
# Chrome DevTools → Device Toolbar (Ctrl+Shift+M)
# 切换设备:
# - iPhone SE
# - iPhone 12 Pro
# - iPad
# - 自定义尺寸: 320px (极端小屏)
```

### 4.3 Usability Testing (可选)

邀请2-3名测试用户:

1. 展示优化后的预约列表
2. 要求在5秒内识别卡片中的关键信息:
   - 场景包名称
   - 预订日期
   - 总金额
   - 预约状态
3. 统计识别准确率(目标: ≥90%)

---

## Step 5: Performance Validation

### 5.1 Check Bundle Size

```bash
# 编译生产版本
npm run build:weapp

# 检查主包大小(应 < 2MB)
du -sh dist/

# 检查样式文件增量(应 < 5KB)
ls -lh dist/**/*.wxss | grep ReservationCard
```

### 5.2 FPS Monitoring

**微信开发者工具性能面板**:

1. 打开 "调试器" → "性能"
2. 滚动预约列表
3. 观察FPS(应 ≥ 50 FPS)

**Chrome DevTools Performance**:

```bash
# H5模式下:
# 1. 打开 DevTools → Performance Tab
# 2. 点击 Record
# 3. 滚动预约列表
# 4. 停止 Record
# 5. 查看 FPS 图表(绿线应保持在 50+ FPS)
```

---

## Step 6: Code Review Checklist

### 6.1 Style Review

- [ ] 所有字体大小符合规格要求(主要文本≥28rpx,次要文本≥24rpx)
- [ ] 按钮最小触控区域≥88rpx x 88rpx
- [ ] 卡片高度减少20%-30%(目标: 280rpx)
- [ ] 使用rpx单位(而非固定px)
- [ ] 长文本正确使用`-webkit-line-clamp`截断
- [ ] 响应式媒体查询覆盖极端尺寸设备
- [ ] 辅助功能支持(字体放大/高对比度)
- [ ] 样式变量集中管理(如使用`_variables.scss`)

### 6.2 Code Quality

- [ ] 通过ESLint检查: `npm run lint`
- [ ] 通过Prettier格式化: `npm run format`
- [ ] TypeScript类型检查无错误: `tsc --noEmit`
- [ ] 无console.log或调试代码残留
- [ ] Git commit message遵循Conventional Commits规范

---

## Step 7: Deployment

### 7.1 Commit Changes

```bash
# 添加修改的文件
git add src/components/ReservationCard/index.module.scss
git add src/pages/my-reservations/index.module.scss # (如有修改)

# 提交(遵循Conventional Commits)
git commit -m "feat(U002): 优化预约卡片紧凑布局

- 缩小卡片高度至280rpx(降低30%)
- 调整字体大小(主要文本30rpx,次要文本24-26rpx)
- 优化间距(卡片内20rpx,卡片间20rpx)
- 限制长文本显示(场景包名称2行,备注1行)
- 支持多设备适配和辅助功能

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 推送到远程分支
git push origin U002-reservation-card-ui-compact
```

### 7.2 Create Pull Request (Optional)

```bash
# 使用gh CLI创建PR(如有配置)
gh pr create --title "feat(U002): 预约卡片紧凑布局优化" \
  --body "$(cat <<'EOF'
## Summary
优化小程序预约卡片UI布局,提升预约列表浏览效率。

## Changes
- 卡片高度减少30%(400rpx → 280rpx)
- 字体大小优化(主要文本30rpx,次要文本24-26rpx)
- 间距优化(卡片内/间距缩小至20rpx)
- 长文本截断(场景包名称2行,备注1行)
- 多设备适配(iPhone SE/14/iPad)
- 辅助功能支持(系统字体放大/高对比度)

## Test Plan
- [x] 视觉回归测试(截图对比)
- [x] 多设备测试(微信开发者工具模拟器)
- [x] 可用性测试(用户识别准确率≥90%)
- [x] 性能测试(FPS≥50,包体积<2MB)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Common Issues & Troubleshooting

### Issue 1: 样式未生效

**症状**: 修改SCSS后,微信开发者工具或H5页面样式无变化

**解决方案**:
```bash
# 1. 清除编译缓存
rm -rf dist/

# 2. 重新编译
npm run dev:weapp  # 或 dev:h5

# 3. 微信开发者工具: 点击 "编译" 按钮强制刷新
# 4. H5模式: 硬刷新浏览器(Ctrl+Shift+R)
```

### Issue 2: rpx单位在H5中显示异常

**症状**: H5模式下卡片过大或过小

**解决方案**:
```bash
# 检查Taro配置中的设计稿宽度
cat config/index.js | grep designWidth

# 应为: designWidth: 750 (默认)
# 如果不是,修改为750
```

### Issue 3: 长文本截断不生效

**症状**: 场景包名称超过2行仍继续换行

**解决方案**:
```scss
// 确保使用Webkit私有属性(小程序和现代浏览器支持)
.title {
  display: -webkit-box; // 必须
  -webkit-box-orient: vertical; // 必须
  -webkit-line-clamp: 2; // 必须
  overflow: hidden; // 必须
  text-overflow: ellipsis; // 可选(添加省略号)
}
```

### Issue 4: 按钮点击区域过小

**症状**: 按钮难以点击或误触

**解决方案**:
```scss
.button {
  height: 64rpx; // 视觉高度
  padding: 12rpx 24rpx; // 扩展触控区

  // 使用伪元素扩展点击热区
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: -12rpx;
    bottom: -12rpx;
    left: -12rpx;
    right: -12rpx;
  }
}
```

---

## Next Steps

### After UI Optimization Completed

1. **Design Review**: 提交设计稿或截图给设计师审核,确认符合品牌视觉规范
2. **User Acceptance Testing**: 邀请真实用户测试,收集反馈
3. **Performance Monitoring**: 上线后监控FPS、加载时间等性能指标
4. **Iterate**: 根据用户反馈和数据分析,进一步微调样式

### Related Features to Optimize

- 场景包详情页的信息卡片(可应用类似紧凑布局策略)
- 订单历史页面的订单卡片
- 个人中心的功能菜单卡片

---

## Resources

- [Taro官方文档](https://taro-docs.jd.com/docs/)
- [微信小程序设计指南](https://developers.weixin.qq.com/miniprogram/design/)
- [Apple Human Interface Guidelines - Touch Targets](https://developer.apple.com/design/human-interface-guidelines/inputs/touchscreen-gestures/)
- [Material Design - Touch Targets](https://m3.material.io/foundations/interaction/gestures/touch-targets)
- [WCAG 2.1 AA Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

**Quick Start Status**: ✅ READY FOR DEVELOPMENT
