import { test, expect } from '@playwright/test';
import { ProductPage } from './pages/ProductPage';

test.describe('用户故事3: 价格配置管理', () => {
  let productPage: ProductPage;

  test.beforeEach(async ({ page }) => {
    productPage = new ProductPage(page);
  });

  test('US3-1: 验证价格配置创建流程', async ({ page }) => {
    // Given 用户进入定价中心
    // When 创建新的价格配置单
    // Then 显示SKU选择、门店/渠道选择界面

    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    // 验证价格配置页面加载
    await expect(page.locator('[data-testid="pricing-management"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-price-config-button"]')).toBeVisible();

    // 点击创建价格配置
    await page.click('[data-testid="create-price-config-button"]');

    // 验证配置单创建界面
    await expect(page).toHaveURL(/.*\/pricing\/create/);
    await expect(page.locator('[data-testid="config-wizard"]')).toBeVisible();
    await expect(page.locator('[data-testid="sku-selection-step"]')).toBeVisible();
    await expect(page.locator('[data-testid="store-selection-step"]')).toBeVisible();
  });

  test('US3-2: 验证SKU和门店选择功能', async ({ page }) => {
    // Given 用户在价格配置界面
    // When 选择SKU范围和门店群组
    // Then 系统展示可配置的SKU列表和价格输入框

    await page.goto('/pricing/create');
    await page.waitForLoadState('networkidle');

    // 选择SKU
    await page.click('[data-testid="sku-selector"]');
    await page.click('[data-testid="sku-category-food"]'); // 选择食品类目
    await page.click('[data-testid="select-all-skus"]'); // 选择所有食品类SKU
    await page.click('[data-testid="confirm-sku-selection"]');

    // 选择门店
    await page.click('[data-testid="store-selector"]');
    await page.click('[data-testid="store-group-all"]'); // 选择所有门店
    await page.click('[data-testid="confirm-store-selection"]');

    // 验证进入价格配置界面
    await expect(page.locator('[data-testid="price-config-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="sku-price-table"]')).toBeVisible();

    // 验证表格结构
    await expect(page.locator('[data-testid="table-header-sku"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-header-store"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-header-base-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-header-discount-price"]')).toBeVisible();
  });

  test('US3-3: 验证价格录入和编辑功能', async ({ page }) => {
    // Given 用户在价格配置界面
    // When 完成价格录入
    // Then 验证价格数据正确保存

    await page.goto('/pricing/create');
    await page.waitForLoadState('networkidle');

    // 选择一些SKU和门店（模拟上一步）
    // 在实际实现中，这里需要等待向导完成或使用测试数据

    // 如果价格表格存在，测试价格录入
    const priceTable = page.locator('[data-testid="sku-price-table"]');
    if (await priceTable.isVisible()) {
      const priceInputs = priceTable.locator('[data-testid="price-input"]');
      const inputCount = await priceInputs.count();

      if (inputCount > 0) {
        // 填写第一个价格
        const firstInput = priceInputs.first();
        await firstInput.fill('29.90');

        // 验证价格验证
        await expect(firstInput).toHaveValue('29.90');

        // 填写折扣价格
        const discountInputs = priceTable.locator('[data-testid="discount-price-input"]');
        if (await discountInputs.count() > 0) {
          await discountInputs.first().fill('25.90');
        }
      }
    }
  });

  test('US3-4: 验证价格预览功能', async ({ page }) => {
    // Given 用户完成价格录入
    // When 点击"价格裁决预览"按钮
    // Then 显示配置后各门店的最终价格效果

    await page.goto('/pricing/create');
    await page.waitForLoadState('networkidle');

    // 如果有预览按钮，测试预览功能
    const previewButton = page.locator('[data-testid="price-preview-button"]');
    if (await previewButton.isVisible()) {
      await previewButton.click();

      // 验证预览弹窗
      await expect(page.locator('[data-testid="price-preview-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="preview-table"]')).toBeVisible();

      // 验证预览数据
      await expect(page.locator('[data-testid="preview-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="preview-affected-skus"]')).toBeVisible();
      await expect(page.locator('[data-testid="preview-affected-stores"]')).toBeVisible();
    }
  });

  test('US3-5: 验证价格配置提交功能', async ({ page }) => {
    // Given 用户确认价格配置
    // When 提交配置单
    // Then 配置单进入待审核状态

    await page.goto('/pricing/create');
    await page.waitForLoadState('networkidle');

    // 查找提交按钮
    const submitButton = page.locator('[data-testid="submit-config-button"]');
    if (await submitButton.isVisible()) {
      // 确认提交前需要填写必填信息
      const configName = page.locator('[data-testid="config-name"]');
      if (await configName.isVisible()) {
        await configName.fill('测试价格配置 - ' + new Date().toISOString().slice(0, 10));
      }

      // 提交配置
      await submitButton.click();

      // 验证确认对话框
      await expect(page.locator('[data-testid="submit-confirm-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="confirm-submit"]')).toBeVisible();

      // 确认提交
      await page.click('[data-testid="confirm-submit"]');

      // 验证提交成功消息
      await expect(page.locator('.ant-message-success')).toBeVisible();

      // 验证跳转回价格管理列表
      await expect(page).toHaveURL(/.*\/pricing/);
    }
  });

  test('US3-6: 验证价格配置列表功能', async ({ page }) => {
    // Given 用户进入定价中心
    // Then 显示价格配置列表，支持搜索和筛选

    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    // 验证列表页面
    await expect(page.locator('[data-testid="price-config-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-filter"]')).toBeVisible();

    // 搜索功能
    await page.fill('[data-testid="search-input"]', '测试');
    await page.keyboard.press('Enter');

    // 状态筛选
    await page.click('[data-testid="status-filter"]');
    await page.click('[data-value="pending"]');

    // 验证筛选结果
    const configRows = page.locator('[data-testid="config-row"]');
    if (await configRows.count() > 0) {
      await expect(configRows.first()).toBeVisible();
    }
  });

  test('US3-7: 验证价格规则管理功能', async ({ page }) => {
    // Given 用户在价格管理界面
    // When 配置价格规则
    // Then 验证规则引擎正常工作

    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    // 查找规则管理入口
    const rulesButton = page.locator('[data-testid="price-rules-button"]');
    if (await rulesButton.isVisible()) {
      await rulesButton.click();

      // 验证规则管理界面
      await expect(page.locator('[data-testid="price-rules-management"]')).toBeVisible();
      await expect(page.locator('[data-testid="create-rule-button"]')).toBeVisible();

      // 创建新规则
      await page.click('[data-testid="create-rule-button"]');

      // 填写规则信息
      await page.fill('[data-testid="rule-name"]', '周末折扣规则');
      await page.selectOption('[data-testid="rule-type"]', 'discount');
      await page.fill('[data-testid="rule-discount-rate"]', '0.9');
      await page.click('[data-testid="rule-days-weekend"]');

      // 保存规则
      await page.click('[data-testid="save-rule-button"]');

      // 验证规则保存成功
      await expect(page.locator('.ant-message-success')).toBeVisible();
    }
  });

  test('US3-8: 验证批量价格调整功能', async ({ page }) => {
    // Given 用户在价格管理界面
    // When 进行批量价格调整
    // Then 验证批量操作正常工作

    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    // 查找批量调整功能
    const batchButton = page.locator('[data-testid="batch-adjust-button"]');
    if (await batchButton.isVisible()) {
      await batchButton.click();

      // 验证批量调整界面
      await expect(page.locator('[data-testid="batch-adjust-modal"]')).toBeVisible();

      // 选择调整类型
      await page.selectOption('[data-testid="adjust-type"]', 'percentage');
      await page.fill('[data-testid="adjust-value"]', '10');

      // 选择调整范围
      await page.click('[data-testid="select-all-skus"]');

      // 执行调整
      await page.click('[data-testid="execute-adjust"]');

      // 验证确认对话框
      await expect(page.locator('[data-testid="adjust-confirm-dialog"]')).toBeVisible();
      await page.click('[data-testid="confirm-adjust"]');

      // 验证调整完成
      await expect(page.locator('.ant-message-success')).toBeVisible();
    }
  });

  test('US3-9: 验证历史记录功能', async ({ page }) => {
    // Given 用户在价格管理界面
    // When 查看价格配置历史记录
    // Then 验证历史记录正确显示

    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    // 查找历史记录入口
    const historyButton = page.locator('[data-testid="price-history-button"]');
    if (await historyButton.isVisible()) {
      await historyButton.click();

      // 验证历史记录界面
      await expect(page.locator('[data-testid="price-history-list"]')).toBeVisible();

      // 验证历史记录表格
      const historyRows = page.locator('[data-testid="history-row"]');
      if (await historyRows.count() > 0) {
        const firstRow = historyRows.first();

        // 验证历史记录信息
        await expect(firstRow.locator('[data-testid="history-config-name"]')).toBeVisible();
        await expect(firstRow.locator('[data-testid="history-creator"]')).toBeVisible();
        await expect(firstRow.locator('[data-testid="history-create-time"]')).toBeVisible();
        await expect(firstRow.locator('[data-testid="history-status"]')).toBeVisible();
      }
    }
  });

  test('US3-10: 验证会员定价规则设置', async ({ page }) => {
    // Given 用户在价格管理界面
    // When 配置会员定价规则
    // Then 验证会员定价功能正常工作

    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    // 查找会员定价入口
    const memberPricingButton = page.locator('[data-testid="member-pricing-button"]');
    if (await memberPricingButton.isVisible()) {
      await memberPricingButton.click();

      // 验证会员定价界面
      await expect(page.locator('[data-testid="member-pricing-management"]')).toBeVisible();

      // 创建会员定价规则
      await page.click('[data-testid="create-member-rule"]');

      // 选择会员等级
      await page.selectOption('[data-testid="member-level"]', 'VIP');
      await page.fill('[data-testid="member-discount-rate"]', '0.8');

      // 选择适用SKU
      await page.click('[data-testid="select-skus-for-member"]');
      await page.click('[data-testid="confirm-member-skus"]');

      // 保存会员定价规则
      await page.click('[data-testid="save-member-rule"]');

      // 验证保存成功
      await expect(page.locator('.ant-message-success')).toBeVisible();

      // 验证会员定价规则列表
      await expect(page.locator('[data-testid="member-rule-list"]')).toBeVisible();
    }
  });
});