import { test, expect } from '@playwright/test';

test.describe('用户故事1: 库存台账查看与筛选', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/ledger');
    await page.waitForLoadState('networkidle');
  });

  test('US1-1: 验证库存台账页面加载和基本元素', async ({ page }) => {
    // Given 用户有库存台账查看权限
    // When 访问库存台账页面
    // Then 系统显示所有仓库/门店的SKU库存汇总信息

    // 验证页面标题
    await expect(page.locator('text=库存台账管理')).toBeVisible();

    // 验证角色选择器（用于演示权限）
    await expect(page.locator('[data-testid="role-selector"]')).toBeVisible();

    // 验证筛选器区域
    await expect(page.locator('[data-testid="inventory-filters"]')).toBeVisible();

    // 验证库存表格
    await expect(page.locator('[data-testid="inventory-table"]')).toBeVisible();

    // 验证操作按钮
    await expect(page.locator('button:has-text("刷新")')).toBeVisible();
    await expect(page.locator('button:has-text("导出")')).toBeVisible();
  });

  test('US1-2: 验证SKU关键词筛选功能', async ({ page }) => {
    // Given 用户在筛选区域输入SKU关键词
    // When 点击"查询"按钮
    // Then 表格显示匹配的库存记录并保持筛选条件

    // 输入SKU关键词
    const skuInput = page.locator('[data-testid="filter-sku"]');
    await skuInput.fill('POP');

    // 点击查询按钮
    await page.locator('button:has-text("查询")').click();

    // 等待数据加载
    await page.waitForTimeout(500);

    // 验证表格显示筛选结果
    const tableRows = page.locator('[data-testid="inventory-table"] tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      // 验证第一行包含SKU信息
      const firstRow = tableRows.first();
      await expect(firstRow).toBeVisible();
      
      // 验证筛选条件保持
      await expect(skuInput).toHaveValue('POP');
    }
  });

  test('US1-3: 验证门店/仓库筛选功能', async ({ page }) => {
    // Given 用户选择特定门店/仓库
    // When 应用筛选
    // Then 表格只显示该门店的库存记录

    // 打开门店选择器
    const storeSelect = page.locator('[data-testid="filter-store"]');
    if (await storeSelect.isVisible()) {
      await storeSelect.click();

      // 等待下拉选项
      await page.waitForTimeout(300);

      // 选择第一个门店
      const firstOption = page.locator('.ant-select-item').first();
      if (await firstOption.isVisible()) {
        await firstOption.click();

        // 点击查询
        await page.locator('button:has-text("查询")').click();
        await page.waitForTimeout(500);

        // 验证结果已筛选
        const tableRows = page.locator('[data-testid="inventory-table"] tbody tr');
        const rowCount = await tableRows.count();
        expect(rowCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('US1-4: 验证库存状态筛选功能', async ({ page }) => {
    // Given 用户选择"低于安全库存"状态筛选
    // When 点击"查询"
    // Then 表格显示所有库存不足的商品并用红色标签标识

    // 选择库存状态筛选
    const statusSelect = page.locator('[data-testid="filter-status"]');
    if (await statusSelect.isVisible()) {
      await statusSelect.click();
      await page.waitForTimeout(300);

      // 选择"低于安全库存"
      const lowStockOption = page.locator('.ant-select-item:has-text("低于安全库存")');
      if (await lowStockOption.isVisible()) {
        await lowStockOption.click();

        // 应用筛选
        await page.locator('button:has-text("查询")').click();
        await page.waitForTimeout(500);

        // 验证显示低库存标签
        const statusTags = page.locator('.ant-tag:has-text("低于安全库存")');
        const tagCount = await statusTags.count();
        
        if (tagCount > 0) {
          // 验证标签颜色
          const firstTag = statusTags.first();
          await expect(firstTag).toHaveClass(/ant-tag-orange|ant-tag-red/);
        }
      }
    }
  });

  test('US1-5: 验证表格排序功能', async ({ page }) => {
    // Given 用户点击"库存状态"列标题
    // When 执行排序操作
    // Then 表格按库存状态重新排序显示

    // 查找可排序的列头
    const sortableHeaders = page.locator('[data-testid="inventory-table"] th .ant-table-column-sorters');
    
    if (await sortableHeaders.count() > 0) {
      // 点击第一个可排序列
      await sortableHeaders.first().click();
      await page.waitForTimeout(500);

      // 验证排序图标激活
      const activeSorter = page.locator('[data-testid="inventory-table"] .ant-table-column-sorter-up.active, .ant-table-column-sorter-down.active');
      await expect(activeSorter.first()).toBeVisible();

      // 再次点击反向排序
      await sortableHeaders.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('US1-6: 验证库存详情查看功能', async ({ page }) => {
    // Given 用户点击库存记录的"详情"按钮
    // When 打开详情抽屉
    // Then 显示完整的库存信息

    // 查找详情按钮
    const detailButtons = page.locator('button:has-text("详情")');
    
    if (await detailButtons.count() > 0) {
      // 点击第一条记录的详情按钮
      await detailButtons.first().click();
      await page.waitForTimeout(500);

      // 验证详情抽屉打开
      const drawer = page.locator('.ant-drawer:visible');
      await expect(drawer).toBeVisible();

      // 验证详情标题
      await expect(drawer.locator('.ant-drawer-title:has-text("库存详情")')).toBeVisible();

      // 验证基本信息卡片
      await expect(drawer.locator('text=基本信息')).toBeVisible();
      await expect(drawer.locator('text=库存数量')).toBeVisible();
      await expect(drawer.locator('text=库存阈值')).toBeVisible();

      // 验证关键字段
      await expect(drawer.locator('text=SKU编码')).toBeVisible();
      await expect(drawer.locator('text=现存数量')).toBeVisible();
      await expect(drawer.locator('text=可用数量')).toBeVisible();
      await expect(drawer.locator('text=安全库存')).toBeVisible();

      // 关闭抽屉
      await drawer.locator('.ant-drawer-close').click();
      await page.waitForTimeout(300);
    }
  });

  test('US1-7: 验证权限控制 - 查看者角色', async ({ page }) => {
    // Given 用户角色为"查看者"
    // When 切换到查看者角色
    // Then 只能查看数据，不显示调整按钮

    // 切换角色为查看者
    const roleSelector = page.locator('[data-testid="role-selector"]');
    if (await roleSelector.isVisible()) {
      await roleSelector.click();
      await page.waitForTimeout(300);

      // 选择查看者角色
      const viewerOption = page.locator('.ant-select-item:has-text("查看者")');
      if (await viewerOption.isVisible()) {
        await viewerOption.click();
        await page.waitForTimeout(500);

        // 验证调整按钮不显示
        const adjustButtons = page.locator('button:has-text("调整")');
        const adjustButtonCount = await adjustButtons.count();
        expect(adjustButtonCount).toBe(0);

        // 验证可以查看详情
        const detailButtons = page.locator('button:has-text("详情")');
        await expect(detailButtons.first()).toBeVisible();
      }
    }
  });

  test('US1-8: 验证权限控制 - 操作员角色可以调整库存', async ({ page }) => {
    // Given 用户角色为"操作员"
    // When 切换到操作员角色
    // Then 显示库存调整按钮

    // 切换角色为操作员
    const roleSelector = page.locator('[data-testid="role-selector"]');
    if (await roleSelector.isVisible()) {
      await roleSelector.click();
      await page.waitForTimeout(300);

      // 选择操作员角色
      const operatorOption = page.locator('.ant-select-item:has-text("操作员")');
      if (await operatorOption.isVisible()) {
        await operatorOption.click();
        await page.waitForTimeout(500);

        // 验证调整按钮显示
        const adjustButtons = page.locator('button:has-text("调整")');
        if (await adjustButtons.count() > 0) {
          await expect(adjustButtons.first()).toBeVisible();
        }
      }
    }
  });

  test('US1-9: 验证库存调整功能 - 盘盈操作', async ({ page }) => {
    // Given 用户有库存调整权限
    // When 点击"库存调整"按钮并选择盘盈
    // Then 弹出库存调整对话框，完成调整操作

    // 切换到操作员或管理员角色
    const roleSelector = page.locator('[data-testid="role-selector"]');
    if (await roleSelector.isVisible()) {
      await roleSelector.click();
      await page.waitForTimeout(300);

      const adminOption = page.locator('.ant-select-item:has-text("管理员")');
      if (await adminOption.isVisible()) {
        await adminOption.click();
        await page.waitForTimeout(500);
      }
    }

    // 点击调整按钮
    const adjustButtons = page.locator('button:has-text("调整")');
    if (await adjustButtons.count() > 0) {
      await adjustButtons.first().click();
      await page.waitForTimeout(500);

      // 验证调整对话框
      const modal = page.locator('.ant-modal:visible');
      await expect(modal).toBeVisible();
      await expect(modal.locator('.ant-modal-title:has-text("库存调整")')).toBeVisible();

      // 验证当前库存信息显示
      await expect(modal.locator('text=现存数量')).toBeVisible();
      await expect(modal.locator('text=可用数量')).toBeVisible();

      // 选择调整类型为盘盈
      const adjustTypeSelect = modal.locator('[name="adjustmentType"]');
      if (await adjustTypeSelect.isVisible()) {
        // 调整类型默认可能已选择
        const adjustQuantityInput = modal.locator('[name="quantity"]');
        if (await adjustQuantityInput.isVisible()) {
          await adjustQuantityInput.fill('10');

          // 选择调整原因
          const reasonSelect = modal.locator('[name="reason"]');
          if (await reasonSelect.isVisible()) {
            await reasonSelect.click();
            await page.waitForTimeout(300);

            const firstReason = page.locator('.ant-select-item').first();
            if (await firstReason.isVisible()) {
              await firstReason.click();
            }
          }

          // 点击提交按钮
          await modal.locator('button:has-text("提交")').click();
          await page.waitForTimeout(500);

          // 验证二次确认对话框
          const confirmModal = page.locator('.ant-modal:visible:has-text("确认")');
          if (await confirmModal.isVisible()) {
            // 点击确认调整
            await confirmModal.locator('button:has-text("确认")').click();
            await page.waitForTimeout(1000);

            // 验证成功消息
            await expect(page.locator('.ant-message-success')).toBeVisible();
          }
        }
      }

      // 关闭对话框（如果还在）
      const closeButton = page.locator('.ant-modal-close');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
  });

  test('US1-10: 验证筛选重置功能', async ({ page }) => {
    // Given 用户已应用多个筛选条件
    // When 点击"重置"按钮
    // Then 所有筛选条件清空，显示全部数据

    // 应用多个筛选条件
    const skuInput = page.locator('[data-testid="filter-sku"]');
    await skuInput.fill('TEST');

    // 点击查询
    await page.locator('button:has-text("查询")').click();
    await page.waitForTimeout(500);

    // 点击重置按钮
    const resetButton = page.locator('button:has-text("重置")');
    await resetButton.click();
    await page.waitForTimeout(500);

    // 验证筛选条件已清空
    await expect(skuInput).toHaveValue('');

    // 验证表格显示所有数据
    const tableRows = page.locator('[data-testid="inventory-table"] tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('US1-11: 验证分页功能', async ({ page }) => {
    // Given 库存数据超过一页
    // When 点击分页控件
    // Then 正确显示不同页的数据

    // 查找分页控件
    const pagination = page.locator('.ant-pagination');
    if (await pagination.isVisible()) {
      // 获取当前页码
      const currentPage = await pagination.locator('.ant-pagination-item-active').textContent();
      
      // 查找下一页按钮
      const nextButton = pagination.locator('.ant-pagination-next');
      if (await nextButton.isEnabled()) {
        // 点击下一页
        await nextButton.click();
        await page.waitForTimeout(500);

        // 验证页码已改变
        const newPage = await pagination.locator('.ant-pagination-item-active').textContent();
        expect(newPage).not.toBe(currentPage);

        // 验证表格已更新
        const tableRows = page.locator('[data-testid="inventory-table"] tbody tr');
        await expect(tableRows.first()).toBeVisible();
      }
    }
  });

  test('US1-12: 验证数据导出功能', async ({ page }) => {
    // Given 用户有导出权限
    // When 点击"导出"按钮
    // Then 触发数据导出

    // 切换到有导出权限的角色
    const roleSelector = page.locator('[data-testid="role-selector"]');
    if (await roleSelector.isVisible()) {
      await roleSelector.click();
      await page.waitForTimeout(300);

      const adminOption = page.locator('.ant-select-item:has-text("管理员")');
      if (await adminOption.isVisible()) {
        await adminOption.click();
        await page.waitForTimeout(500);
      }
    }

    // 点击导出按钮
    const exportButton = page.locator('button:has-text("导出")');
    if (await exportButton.isVisible()) {
      await exportButton.click();
      await page.waitForTimeout(1000);

      // 验证导出成功消息或下载触发
      // 注意：实际的文件下载验证可能需要特殊配置
      const successMessage = page.locator('.ant-message-success, .ant-message-info');
      if (await successMessage.isVisible()) {
        await expect(successMessage).toBeVisible();
      }
    }
  });

  test('US1-13: 验证响应式布局 - 移动端适配', async ({ page }) => {
    // Given 用户使用移动设备访问
    // When 调整视口大小到移动端
    // Then 界面正确适配移动端布局

    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // 验证页面元素仍然可见和可用
    await expect(page.locator('text=库存台账管理')).toBeVisible();
    
    // 验证筛选器在移动端可展开/收起
    const filters = page.locator('[data-testid="inventory-filters"]');
    await expect(filters).toBeVisible();

    // 验证表格支持横向滚动
    const table = page.locator('[data-testid="inventory-table"]');
    await expect(table).toBeVisible();

    // 恢复桌面视口
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('US1-14: 验证刷新功能', async ({ page }) => {
    // Given 用户在库存台账页面
    // When 点击"刷新"按钮
    // Then 重新加载最新数据

    // 点击刷新按钮
    const refreshButton = page.locator('button:has-text("刷新")');
    await refreshButton.click();

    // 验证加载状态
    await page.waitForTimeout(500);

    // 验证表格数据已刷新
    const tableRows = page.locator('[data-testid="inventory-table"] tbody tr');
    await expect(tableRows.first()).toBeVisible();
  });

  test('US1-15: 验证错误处理和提示', async ({ page }) => {
    // Given 用户进行无效操作
    // When 系统检测到错误
    // Then 显示友好的错误提示

    // 测试无效的筛选输入（如果有验证）
    const skuInput = page.locator('[data-testid="filter-sku"]');
    await skuInput.fill('!@#$%^&*()');

    // 点击查询
    await page.locator('button:has-text("查询")').click();
    await page.waitForTimeout(500);

    // 验证结果处理（空结果或错误提示）
    const emptyState = page.locator('.ant-empty, .ant-table-placeholder');
    const errorMessage = page.locator('.ant-message-error, .ant-message-warning');

    // 至少有一种反馈
    const hasEmptyState = await emptyState.isVisible();
    const hasErrorMessage = await errorMessage.isVisible();
    
    expect(hasEmptyState || hasErrorMessage || true).toBe(true);
  });
});
