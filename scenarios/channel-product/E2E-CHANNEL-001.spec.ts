
import { test, expect } from '@playwright/test';
import { ChannelProductPage } from './pages/ChannelProductPage';

test.describe('渠道商品配置流程验证', () => {
  let channelProductPage: ChannelProductPage;

  test.beforeEach(async ({ page }) => {
    channelProductPage = new ChannelProductPage(page);
  });

  test('E2E-CHANNEL-001: 完整生命周期 - 创建/编辑/上架/下架/删除', async ({ page }) => {
    // 1. Navigate to Channel Product List
    await page.goto('http://localhost:3000/channel-products/mini-program');

    // 2. Create Channel Product
    await channelProductPage.clickCreateButton();
    await channelProductPage.selectSkuInModal(); // Select first available item

    // 3. Configure Product
    await expect(page).toHaveURL(/\/create/);
    await channelProductPage.fillBasicInfo('测试拿铁', 'E2E测试商品描述', 1);

    // Add Specs
    await channelProductPage.addSpecGroup('温度', true);
    await channelProductPage.addSpecOption(0, '热', 0, true);
    await channelProductPage.addSpecOption(0, '冰', 0, false);

    await channelProductPage.save();

    // 4. Verify List & Filter
    await expect(page).toHaveURL(/\/channel-products\/mini-program$/);
    await channelProductPage.search('测试拿铁');
    await expect(page.locator('.ant-table-row').filter({ hasText: '测试拿铁' })).toBeVisible();

    // 5. Publish (上架)
    await channelProductPage.toggleStatus('测试拿铁', '上架');
    await expect(page.locator('.ant-table-row').filter({ hasText: '测试拿铁' }).locator('.ant-tag-success')).toBeVisible();

    // 6. Edit
    await channelProductPage.clickEdit('测试拿铁');
    await expect(page).toHaveURL(/\/edit/);
    await channelProductPage.fillBasicInfo('测试拿铁(已修改)');
    await channelProductPage.save();

    // Verify Edit
    await expect(page).toHaveURL(/\/channel-products\/mini-program$/);
    await channelProductPage.search('测试拿铁(已修改)');
    await expect(page.locator('.ant-table-row').filter({ hasText: '测试拿铁(已修改)' })).toBeVisible();

    // 7. Delete (Must unpublish first)
    await channelProductPage.toggleStatus('测试拿铁(已修改)', '下架');
    await page.waitForTimeout(1000); // Wait for status update
    await channelProductPage.deleteProduct('测试拿铁(已修改)');

    // Verify Deletion
    await expect(page.locator('.ant-table-row').filter({ hasText: '测试拿铁(已修改)' })).not.toBeVisible();
  });
});
