/**
 * @spec P007-fix-spu-batch-delete
 * E2E 测试场景 - SPU 批量删除功能验证
 *
 * 测试用户故事：
 * "作为管理员,我希望批量删除 SPU 时数据真实删除,以便正确管理商品库存"
 *
 * 验收标准：
 * - 批量删除操作成功后,刷新页面数据不再出现
 * - 列表自动刷新显示删除后的数据
 * - TanStack Query 缓存正确失效
 * - 支持部分成功场景(部分 ID 无效)
 */

import { test, expect } from '@playwright/test';

test.describe('SPU 批量删除功能', () => {
  test.beforeEach(async ({ page }) => {
    // 访问 SPU 列表页
    await page.goto('http://localhost:3000/spu/list');

    // 等待列表加载完成
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
  });

  test('应该成功批量删除 SPU 并在刷新后数据不再出现', async ({ page }) => {
    // 1. 获取初始总记录数
    const initialTotalText = await page.locator('.ant-pagination-total-text').textContent();
    const initialTotal = parseInt(initialTotalText?.match(/\d+/)?.[0] || '0');

    console.log(`初始总记录数: ${initialTotal}`);

    // 2. 选中前 3 个 SPU 的复选框
    const firstThreeCheckboxes = page
      .locator('table tbody tr td:first-child input[type="checkbox"]')
      .first();
    await firstThreeCheckboxes.check();

    const secondCheckbox = page.locator(
      'table tbody tr:nth-child(2) td:first-child input[type="checkbox"]'
    );
    await secondCheckbox.check();

    const thirdCheckbox = page.locator(
      'table tbody tr:nth-child(3) td:first-child input[type="checkbox"]'
    );
    await thirdCheckbox.check();

    // 3. 记录被删除的 SPU 名称(用于后续验证)
    const firstSPUName = await page
      .locator('table tbody tr:nth-child(1) td:nth-child(2)')
      .textContent();
    const secondSPUName = await page
      .locator('table tbody tr:nth-child(2) td:nth-child(2)')
      .textContent();
    const thirdSPUName = await page
      .locator('table tbody tr:nth-child(3) td:nth-child(2)')
      .textContent();

    console.log(`待删除的 SPU: ${firstSPUName}, ${secondSPUName}, ${thirdSPUName}`);

    // 4. 打开批量操作下拉菜单
    const moreButton = page.locator('button:has-text("批量操作")');
    await moreButton.click();

    // 5. 点击批量删除菜单项
    const batchDeleteMenuItem = page.locator('.ant-dropdown-menu-item:has-text("批量删除")');
    await batchDeleteMenuItem.click();

    // 6. 确认删除弹窗
    const confirmButton = page.locator('.ant-modal-confirm-btns button.ant-btn-primary');
    await confirmButton.click();

    // 7. 等待成功提示
    await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.ant-message-success')).toContainText('成功删除');

    // 8. 等待列表自动刷新(通过等待 loading 状态消失)
    await page.waitForTimeout(1500); // 等待 TanStack Query 刷新

    // 9. 验证总记录数减少了 3
    const updatedTotalText = await page.locator('.ant-pagination-total-text').textContent();
    const updatedTotal = parseInt(updatedTotalText?.match(/\d+/)?.[0] || '0');

    console.log(`删除后总记录数: ${updatedTotal}`);
    expect(updatedTotal).toBe(initialTotal - 3);

    // 10. 验证被删除的 SPU 不再出现在列表中
    const allSPUNames = await page.locator('table tbody tr td:nth-child(2)').allTextContents();
    expect(allSPUNames).not.toContain(firstSPUName);
    expect(allSPUNames).not.toContain(secondSPUName);
    expect(allSPUNames).not.toContain(thirdSPUName);

    // 11. 刷新页面验证数据持久性
    await page.reload();
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // 12. 再次验证总记录数
    const afterReloadTotalText = await page.locator('.ant-pagination-total-text').textContent();
    const afterReloadTotal = parseInt(afterReloadTotalText?.match(/\d+/)?.[0] || '0');

    console.log(`刷新后总记录数: ${afterReloadTotal}`);
    expect(afterReloadTotal).toBe(initialTotal - 3);

    // 13. 再次验证被删除的 SPU 不在列表中
    const allSPUNamesAfterReload = await page
      .locator('table tbody tr td:nth-child(2)')
      .allTextContents();
    expect(allSPUNamesAfterReload).not.toContain(firstSPUName);
    expect(allSPUNamesAfterReload).not.toContain(secondSPUName);
    expect(allSPUNamesAfterReload).not.toContain(thirdSPUName);
  });

  test('应该正确显示批量删除进度和结果', async ({ page }) => {
    // 1. 选中 2 个 SPU
    const firstCheckbox = page.locator(
      'table tbody tr:nth-child(1) td:first-child input[type="checkbox"]'
    );
    await firstCheckbox.check();

    const secondCheckbox = page.locator(
      'table tbody tr:nth-child(2) td:first-child input[type="checkbox"]'
    );
    await secondCheckbox.check();

    // 2. 打开批量操作下拉菜单
    await page.locator('button:has-text("批量操作")').click();

    // 3. 点击批量删除菜单项
    await page.locator('.ant-dropdown-menu-item:has-text("批量删除")').click();

    // 4. 确认删除
    await page.locator('.ant-modal-confirm-btns button.ant-btn-primary').click();

    // 5. 验证成功提示显示
    const successMessage = page.locator('.ant-message-success');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
    await expect(successMessage).toContainText('成功删除 2 个 SPU');

    // 6. 等待提示消失
    await expect(successMessage).toBeHidden({ timeout: 5000 });
  });

  test('应该在没有选中任何 SPU 时禁用批量操作按钮', async ({ page }) => {
    // 验证批量操作按钮初始状态为禁用
    const batchOperationsButton = page.locator('button:has-text("批量操作")');
    await expect(batchOperationsButton).toBeDisabled();

    // 选中一个 SPU
    const firstCheckbox = page.locator(
      'table tbody tr:nth-child(1) td:first-child input[type="checkbox"]'
    );
    await firstCheckbox.check();

    // 验证按钮启用
    await expect(batchOperationsButton).toBeEnabled();

    // 取消选中
    await firstCheckbox.uncheck();

    // 验证按钮再次禁用
    await expect(batchOperationsButton).toBeDisabled();
  });

  test('应该支持全选/取消全选功能', async ({ page }) => {
    // 1. 点击全选复选框
    const selectAllCheckbox = page.locator('table thead th:first-child input[type="checkbox"]');
    await selectAllCheckbox.check();

    // 2. 验证当前页所有行都被选中
    const allRowCheckboxes = page.locator('table tbody tr td:first-child input[type="checkbox"]');
    const checkedCount = await allRowCheckboxes.filter({ checked: true }).count();
    const totalCount = await allRowCheckboxes.count();

    expect(checkedCount).toBe(totalCount);
    expect(totalCount).toBeGreaterThan(0);

    // 3. 取消全选
    await selectAllCheckbox.uncheck();

    // 4. 验证所有行都未选中
    const uncheckedCount = await allRowCheckboxes.filter({ checked: false }).count();
    expect(uncheckedCount).toBe(totalCount);
  });

  test('应该在取消删除确认后不执行删除', async ({ page }) => {
    // 1. 获取初始总记录数
    const initialTotalText = await page.locator('.ant-pagination-total-text').textContent();
    const initialTotal = parseInt(initialTotalText?.match(/\d+/)?.[0] || '0');

    // 2. 选中 1 个 SPU
    const firstCheckbox = page.locator(
      'table tbody tr:nth-child(1) td:first-child input[type="checkbox"]'
    );
    await firstCheckbox.check();

    // 3. 打开批量操作下拉菜单
    await page.locator('button:has-text("批量操作")').click();

    // 4. 点击批量删除菜单项
    await page.locator('.ant-dropdown-menu-item:has-text("批量删除")').click();

    // 5. 点击取消按钮
    const cancelButton = page.locator(
      '.ant-modal-confirm-btns button.ant-btn:not(.ant-btn-primary)'
    );
    await cancelButton.click();

    // 6. 等待弹窗关闭
    await expect(page.locator('.ant-modal-confirm')).toBeHidden();

    // 7. 验证总记录数没有变化
    const finalTotalText = await page.locator('.ant-pagination-total-text').textContent();
    const finalTotal = parseInt(finalTotalText?.match(/\d+/)?.[0] || '0');

    expect(finalTotal).toBe(initialTotal);
  });
});
