# Research Findings: 预约卡片紧凑布局优化

**Feature**: U002-reservation-card-ui-compact
**Date**: 2025-12-24
**Purpose**: 研究Taro UI优化最佳实践、响应式设计模式和移动端触控规范,为预约卡片紧凑布局优化提供技术决策依据

---

## 1. Taro rpx单位与响应式设计

### Decision
使用Taro的rpx单位(750设计稿基准)进行样式定义,结合CSS变量实现灵活的间距和字体大小调整。

### Rationale
- **跨端一致性**: rpx单位在微信小程序和H5中都能自动转换为适配当前设备的尺寸,无需手动计算
- **设计稿对齐**: 750px设计稿基准是业界标准,设计师交付的标注可以直接转换(1px = 2rpx)
- **维护性**: 使用CSS变量(如`--card-padding: 24rpx`)可以集中管理间距和字体,方便批量调整

### Alternatives Considered
- **固定px单位**: 无法适配不同设备,在小屏和大屏上显示效果差异大
- **百分比单位**: 对于字体和间距的控制不够精确,难以满足设计要求
- **em/rem单位**: Taro小程序环境中rem支持有限,rpx是更可靠的选择

### Implementation Notes
```scss
// 定义CSS变量(在全局或组件级别)
.reservation-card {
  --card-height: 280rpx; // 优化前: 400rpx
  --title-font-size: 30rpx; // 优化前: 36rpx (主要文本 ≥ 28rpx)
  --subtitle-font-size: 26rpx; // 优化前: 30rpx (次要文本 24-26rpx)
  --card-padding-vertical: 20rpx; // 优化前: 32rpx
  --card-padding-horizontal: 24rpx; // 保持不变
  --line-height: 1.4; // 优化行高,避免文字拥挤
  --button-height: 64rpx; // 优化前: 80rpx (最小触控区 88x88rpx)
}
```

---

## 2. 移动端触控区域最佳实践

### Decision
按钮最小点击热区设置为88rpx x 88rpx(相当于44px x 44px),符合Apple HIG和Android Material Design规范。

### Rationale
- **Apple Human Interface Guidelines**: 推荐最小触控目标44x44pt,在2倍屏上为88x88px
- **Android Material Design**: 推荐最小触控目标48x48dp,在标准密度下为48x48px
- **用户体验**: 小于44px的按钮容易导致误触或点击困难,尤其是在移动中或单手操作时

### Alternatives Considered
- **更大的触控区域(60px以上)**: 占用空间过大,与紧凑布局目标冲突
- **更小的触控区域(32px)**: 不符合移动端规范,会降低可用性

### Implementation Notes
```scss
.button {
  height: 64rpx; // 视觉高度(32px equivalent)
  padding: 12rpx 24rpx; // 内边距扩展触控区域
  min-height: 88rpx; // 最小点击热区(44px equivalent)

  // 使用伪元素扩展点击区域(如果视觉高度小于最小触控区)
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

## 3. 字体大小与可读性平衡

### Decision
主要文本(场景包名称、日期)使用28-30rpx(14-15px),次要文本(备注、描述)使用24-26rpx(12-13px),金额信息使用30-32rpx并加粗。

### Rationale
- **可读性底线**: 移动端最小可读字体为12px(24rpx),低于此值会导致阅读困难,尤其是对于40岁以上用户
- **视觉层级**: 通过字体大小差异(主要文本vs次要文本)建立清晰的信息层级,帮助用户快速获取关键信息
- **品牌一致性**: 参考Taro UI和常见小程序的字体规范,确保与其他页面风格一致

### Alternatives Considered
- **更小的字体(10px以下)**: 虽然能进一步缩小卡片,但会严重影响可读性,违背可用性原则
- **固定字体大小**: 无法适应系统字体放大功能,不符合辅助功能要求

### Implementation Notes
```scss
.reservation-card {
  &__title {
    font-size: 30rpx; // 主要文本(场景包名称)
    font-weight: 500;
    line-height: 1.4;
  }

  &__subtitle {
    font-size: 26rpx; // 次要文本(日期、时段)
    color: #666; // 降低颜色对比度以区分层级
    line-height: 1.3;
  }

  &__price {
    font-size: 32rpx; // 金额信息(醒目显示)
    font-weight: 600;
    color: #ff6600; // 强调色
  }
}

// 支持系统字体放大(辅助功能)
@media (prefers-font-size: large) {
  .reservation-card__title {
    font-size: 34rpx; // 增加15%
  }
  .reservation-card__subtitle {
    font-size: 28rpx;
  }
}
```

---

## 4. 卡片间距与视觉呼吸感

### Decision
卡片内部垂直间距缩小至16-20rpx,卡片之间间距缩小至16-24rpx,使用1rpx分隔线增强视觉分隔。

### Rationale
- **信息密度提升**: 通过减少冗余间距,在一屏内显示更多卡片(3-4条 vs 2条)
- **视觉呼吸感保持**: 适度的间距(16-24rpx)避免卡片显得过于拥挤,保持舒适的视觉体验
- **分隔线辅助**: 使用细线(1rpx)作为卡片边界,在紧凑布局下保持清晰的卡片边界

### Alternatives Considered
- **完全移除间距**: 卡片紧贴,视觉上过于压抑,用户难以区分不同卡片
- **保持原间距(32rpx以上)**: 无法实现紧凑布局目标,一屏仍只能显示2条卡片

### Implementation Notes
```scss
.reservation-card {
  padding: 20rpx 24rpx; // 内边距(优化前: 32rpx)
  margin-bottom: 20rpx; // 卡片间距(优化前: 32rpx)
  border-bottom: 1rpx solid #e5e5e5; // 分隔线增强视觉分隔

  &__row {
    margin-bottom: 16rpx; // 行间距(优化前: 24rpx)

    &:last-child {
      margin-bottom: 0; // 最后一行无底部间距
    }
  }
}
```

---

## 5. 长文本溢出处理策略

### Decision
场景包名称限制为2行显示,超出部分使用省略号截断;备注信息限制为1行显示,点击卡片查看详情时展开完整内容。

### Rationale
- **高度一致性**: 通过限制最大行数,确保所有卡片高度统一,避免因文本长度导致布局不一致
- **关键信息优先**: 场景包名称是核心信息,允许2行显示;备注是次要信息,1行显示即可
- **详情页补充**: 用户可以点击卡片进入详情页查看完整内容,列表页无需展示所有细节

### Alternatives Considered
- **不限制行数,允许文本换行**: 导致卡片高度不一致,影响紧凑布局效果
- **完全截断为1行**: 场景包名称可能被过度截断,影响信息识别

### Implementation Notes
```scss
.reservation-card__title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; // 最多显示2行
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 84rpx; // 2行高度(30rpx * 1.4行高 * 2)
}

.reservation-card__remarks {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1; // 最多显示1行
  overflow: hidden;
  text-overflow: ellipsis;
  color: #999; // 降低视觉权重
}
```

---

## 6. 多设备适配策略

### Decision
使用Taro的rpx单位自动适配不同屏幕宽度,对于极端小屏(320px)和大屏(768px以上)使用媒体查询微调字体和间距。

### Rationale
- **自动适配**: rpx单位在不同设备上自动缩放,大部分情况下无需手动适配
- **边缘优化**: 对于极端尺寸设备(iPhone SE 320px, iPad 768px),使用媒体查询微调,确保可用性
- **主流优先**: 优先适配主流设备(375px-414px宽),边缘设备作为次要考虑

### Alternatives Considered
- **仅使用rpx,不做额外适配**: 在极端小屏上文字可能过小,在大屏上文字过大
- **为每种设备单独设计样式**: 维护成本高,不符合"一次编写,多端运行"的Taro理念

### Implementation Notes
```scss
// 小屏设备(iPhone SE: 320px-375px)
@media (max-width: 375px) {
  .reservation-card {
    --title-font-size: 28rpx; // 略微缩小字体
    --card-padding-vertical: 16rpx; // 减少内边距
  }
}

// 大屏设备(iPad: 768px+)
@media (min-width: 768px) {
  .reservation-card {
    --title-font-size: 32rpx; // 增大字体
    --card-padding-vertical: 24rpx; // 增加内边距
    max-width: 600px; // 限制最大宽度,避免过宽
    margin: 0 auto; // 居中显示
  }
}
```

---

## 7. 辅助功能支持

### Decision
使用相对单位(rpx)和媒体查询`prefers-font-size`支持系统字体放大,确保文字与背景对比度≥4.5:1(WCAG 2.1 AA标准)。

### Rationale
- **包容性设计**: 支持视力障碍用户或习惯大字体的用户,符合无障碍设计原则
- **法规合规**: WCAG 2.1 AA是国际通用的可访问性标准,部分地区(如欧盟、美国)有法律要求
- **用户群体**: 影院场景包客户可能包含40岁以上用户,需要考虑老龄化用户需求

### Alternatives Considered
- **忽略辅助功能**: 节省开发时间,但不符合包容性设计原则和法规要求
- **仅支持高对比度模式**: 覆盖范围有限,无法满足字体放大需求

### Implementation Notes
```scss
// 支持系统字体放大
@media (prefers-font-size: large) {
  .reservation-card {
    --title-font-size: 34rpx; // 增加约15%
    --subtitle-font-size: 28rpx;
    --card-padding-vertical: 24rpx; // 增加间距以适应更大字体
  }
}

// 确保文字与背景对比度
.reservation-card {
  background-color: #ffffff;
  color: #333333; // 对比度 = 12.63:1 (超过4.5:1标准)

  &__subtitle {
    color: #666666; // 对比度 = 5.74:1 (符合AA标准)
  }

  &__remarks {
    color: #999999; // 对比度 = 2.85:1 (仅用于次要信息,可接受)
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  .reservation-card {
    border: 2rpx solid #000; // 增强边框对比度

    &__subtitle {
      color: #333; // 提升次要文本对比度
    }
  }
}
```

---

## 8. 视觉测试与回归验证

### Decision
使用截图对比工具(如Playwright的`toHaveScreenshot`)进行视觉回归测试,结合真机预览验证实际效果。

### Rationale
- **自动化验证**: 截图对比可以自动检测样式变更是否符合预期,避免手动检查遗漏
- **真机测试**: 微信开发者工具预览和真机测试可以发现仅在特定设备上出现的问题
- **持续集成**: 视觉测试可以集成到CI/CD流程,确保后续代码变更不会破坏UI

### Alternatives Considered
- **仅手动测试**: 耗时且容易遗漏边缘情况,无法持续验证
- **不做视觉测试**: 依赖开发者主观判断,可能忽略细微的样式问题

### Implementation Notes
```typescript
// Playwright视觉回归测试示例
test('预约卡片紧凑布局优化 - 截图对比', async ({ page }) => {
  await page.goto('/pages/my-reservations/index');
  await page.waitForSelector('.reservation-card');

  // 截图对比(与baseline对比)
  await expect(page).toHaveScreenshot('reservation-list-compact.png', {
    maxDiffPixels: 100, // 允许100像素差异
  });
});

// 真机预览验证清单
// 1. 微信开发者工具 - 模拟器测试(iPhone SE, iPhone 14, iPad)
// 2. 微信真机预览 - 实际设备测试(扫码预览)
// 3. H5浏览器 - Chrome DevTools设备模式测试
// 4. 可用性测试 - 邀请测试用户识别关键信息(5秒内准确率)
```

---

## 9. 样式文件组织结构

### Decision
使用SCSS Modules + CSS变量组合,将样式变量集中管理在`_variables.scss`中,组件样式使用`ReservationCard.module.scss`。

### Rationale
- **模块化**: SCSS Modules避免全局样式污染,确保样式仅作用于当前组件
- **变量复用**: CSS变量可以在运行时动态调整(如响应媒体查询),便于维护和扩展
- **团队协作**: 集中管理的变量文件便于团队成员理解和修改设计token

### Alternatives Considered
- **内联样式**: 无法复用,维护成本高
- **全局CSS**: 容易产生样式冲突,不符合组件化原则

### Implementation Notes
```scss
// _variables.scss (全局或功能级别)
$card-height-default: 400rpx;
$card-height-compact: 280rpx;
$title-font-size-default: 36rpx;
$title-font-size-compact: 30rpx;

// ReservationCard.module.scss
@import './variables';

.card {
  height: $card-height-compact;
  padding: 20rpx 24rpx;

  .title {
    font-size: $title-font-size-compact;
  }
}
```

---

## Summary

所有技术决策已明确,关键决策包括:
1. 使用Taro rpx单位(750设计稿基准)进行响应式设计
2. 按钮最小触控区域88rpx x 88rpx(符合Apple HIG和Android规范)
3. 主要文本28-30rpx,次要文本24-26rpx,金额32rpx加粗
4. 卡片内间距16-20rpx,卡片间距16-24rpx,使用1rpx分隔线
5. 长文本限制行数(场景包名称2行,备注1行)并使用省略号
6. 多设备适配(rpx自动缩放+媒体查询微调极端尺寸)
7. 辅助功能支持(系统字体放大+高对比度模式+WCAG 2.1 AA对比度)
8. 视觉回归测试(截图对比)+ 真机预览验证
9. SCSS Modules + CSS变量组合管理样式

**Ready for Phase 1**: 可进入数据模型和快速入门文档生成阶段(本功能为纯UI优化,无数据模型变更,无API契约)。
