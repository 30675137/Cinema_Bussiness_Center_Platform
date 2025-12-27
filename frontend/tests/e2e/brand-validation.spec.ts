import { test, expect } from '@playwright/test';

test.describe('品牌表单验证', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mdm-pim/brands');
    await page.waitForSelector('[data-testid="brand-table"]', { timeout: 5000 });
    await page.click('[data-testid="new-brand-button"]');
    await expect(page.locator('[data-testid="brand-drawer"]')).toBeVisible();
  });

  test('应该验证品牌名称必填', async ({ page }) => {
    // 不填写品牌名称，直接点击保存
    await page.click('[data-testid="save-brand-button"]');

    // 验证错误提示
    await expect(page.locator('[data-testid="brand-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-name-error"]')).toContainText('品牌名称不能为空');

    // 品牌名称输入框应该高亮显示错误状态
    await expect(page.locator('[data-testid="brand-name-input"]')).toHaveClass(/.*error.*/);
  });

  test('应该验证品牌名称长度限制', async ({ page }) => {
    // 品牌名称过长
    const longName = 'a'.repeat(101); // 超过100字符限制
    await page.fill('[data-testid="brand-name-input"]', longName);
    await page.click('[data-testid="save-brand-button"]');

    // 验证长度错误提示
    await expect(page.locator('[data-testid="brand-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-name-error"]')).toContainText('品牌名称不能超过100字符');
  });

  test('应该验证品牌名称不能包含特殊字符', async ({ page }) => {
    // 品牌名称包含特殊字符
    await page.fill('[data-testid="brand-name-input"]', '测试<script>alert("xss")</script>品牌');
    await page.click('[data-testid="save-brand-button"]');

    // 验证特殊字符错误提示
    await expect(page.locator('[data-testid="brand-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-name-error"]')).toContainText('品牌名称包含非法字符');
  });

  test('应该验证品牌类型必填', async ({ page }) => {
    // 不选择品牌类型，直接点击保存
    await page.click('[data-testid="save-brand-button"]');

    // 验证错误提示
    await expect(page.locator('[data-testid="brand-type-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-type-error"]')).toContainText('请选择品牌类型');
  });

  test('应该验证英文名长度限制', async ({ page }) => {
    // 英文名称过长
    const longEnglishName = 'a'.repeat(201); // 超过200字符限制
    await page.fill('[data-testid="english-name-input"]', longEnglishName);
    await page.click('[data-testid="save-brand-button"]');

    // 验证长度错误提示
    await expect(page.locator('[data-testid="english-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="english-name-error"]')).toContainText('英文名不能超过200字符');
  });

  test('应该验证主营类目必选', async ({ page }) => {
    // 清空主营类目选择
    await page.click('[data-testid="primary-categories-select"]');
    // 不选择任何选项，点击其他地方关闭选择器

    await page.click('[data-testid="save-brand-button"]');

    // 验证错误提示
    await expect(page.locator('[data-testid="primary-categories-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="primary-categories-error"]')).toContainText('请选择至少一个主营类目');
  });

  test('应该验证公司名称长度限制', async ({ page }) => {
    // 公司名称过长
    const longCompanyName = 'a'.repeat(201); // 超过200字符限制
    await page.fill('[data-testid="company-input"]', longCompanyName);
    await page.click('[data-testid="save-brand-button"]');

    // 验证长度错误提示
    await expect(page.locator('[data-testid="company-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="company-error"]')).toContainText('公司名称不能超过200字符');
  });

  test('应该验证品牌等级长度限制', async ({ page }) => {
    // 品牌等级过长
    const longBrandLevel = 'a'.repeat(51); // 超过50字符限制
    await page.click('[data-testid="brand-level-select"]');
    // 这里假设可以输入自定义值
    await page.fill('[data-testid="brand-level-custom-input"]', longBrandLevel);
    await page.click('[data-testid="save-brand-button"]');

    // 验证长度错误提示
    await expect(page.locator('[data-testid="brand-level-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-level-error"]')).toContainText('品牌等级不能超过50字符');
  });

  test('应该验证品牌标签数量限制', async ({ page }) => {
    const tagsInput = page.locator('[data-testid="brand-tags-input"]');

    // 添加超过10个标签
    for (let i = 1; i <= 12; i++) {
      await tagsInput.fill(`标签${i}`);
      await page.keyboard.press('Enter');
    }

    await page.click('[data-testid="save-brand-button"]');

    // 验证标签数量错误提示
    await expect(page.locator('[data-testid="brand-tags-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-tags-error"]')).toContainText('标签不能超过10个');
  });

  test('应该验证品牌描述长度限制', async ({ page }) => {
    // 品牌描述过长
    const longDescription = 'a'.repeat(1001); // 超过1000字符限制
    await page.fill('[data-testid="brand-description-textarea"]', longDescription);
    await page.click('[data-testid="save-brand-button"]');

    // 验证长度错误提示
    await expect(page.locator('[data-testid="brand-description-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-description-error"]')).toContainText('品牌介绍不能超过1000字符');
  });

  test('应该实时验证品牌名称', async ({ page }) => {
    // 监听实时验证
    await page.fill('[data-testid="brand-name-input"]', '');
    // 输入一个字符然后清空
    await page.fill('[data-testid="brand-name-input"]', 'a');
    await page.keyboard.press('Backspace');

    // 验证实时错误提示
    await expect(page.locator('[data-testid="brand-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-name-error"]')).toContainText('品牌名称不能为空');

    // 输入有效内容后错误消失
    await page.fill('[data-testid="brand-name-input"]', '有效品牌名称');
    await expect(page.locator('[data-testid="brand-name-error"]')).not.toBeVisible();
  });

  test('应该验证品牌名称重复（实时）', async ({ page }) => {
    // Mock品牌检查API
    await page.route('**/api/v1/brands/check-name', (route) => {
      const url = new URL(route.request().url());
      const name = url.searchParams.get('name');
      const type = url.searchParams.get('brandType');

      if (name === '重复品牌名称' && type === 'own') {
        route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: {
              code: 'DUPLICATE_BRAND',
              message: '品牌名称在同类型中已存在'
            }
          })
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { available: true }
          })
        });
      }
    });

    // 输入重复的品牌名称
    await page.fill('[data-testid="brand-name-input"]', '重复品牌名称');
    await page.click('[data-testid="brand-type-select"]');
    await page.getByRole('option', { name: '自有品牌' }).click();

    // 等待防抖时间
    await page.waitForTimeout(500);

    // 验证重复错误提示
    await expect(page.locator('[data-testid="brand-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-name-error"]')).toContainText('品牌名称在同类型中已存在');

    // 修改为不重复的名称
    await page.fill('[data-testid="brand-name-input"]', '唯一品牌名称');
    await page.waitForTimeout(500);

    // 验证错误提示消失
    await expect(page.locator('[data-testid="brand-name-error"]')).not.toBeVisible();
  });

  test('应该验证英文名格式', async ({ page }) => {
    // 英文名包含非法字符
    await page.fill('[data-testid="english-name-input"]', 'English Name 中文');
    await page.click('[data-testid="save-brand-button"]');

    // 验证格式错误提示
    await expect(page.locator('[data-testid="english-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="english-name-error"]')).toContainText('英文名只能包含英文字母、数字和常用符号');
  });

  test('应该验证表单完整性', async ({ page }) => {
    // 只填写部分必填字段
    await page.fill('[data-testid="brand-name-input"]', '部分填写的品牌');
    // 不选择品牌类型

    await page.click('[data-testid="save-brand-button"]');

    // 验证所有错误提示
    await expect(page.locator('[data-testid="brand-name-error"]')).not.toBeVisible(); // 品牌名称已填写
    await expect(page.locator('[data-testid="brand-type-error"]')).toBeVisible(); // 品牌类型未填写

    // 验证保存按钮被禁用
    await expect(page.locator('[data-testid="save-brand-button"]')).toBeDisabled();
  });

  test('应该清除字段错误状态', async ({ page }) => {
    // 先触发错误
    await page.click('[data-testid="save-brand-button"]');
    await expect(page.locator('[data-testid="brand-name-error"]')).toBeVisible();

    // 修正错误
    await page.fill('[data-testid="brand-name-input"]', '修正后的品牌名称');
    await page.click('[data-testid="brand-type-select"]');
    await page.getByRole('option', { name: '自有品牌' }).click();

    // 验证错误状态清除
    await expect(page.locator('[data-testid="brand-name-error"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="brand-type-error"]')).not.toBeVisible();

    // 输入框错误样式清除
    await expect(page.locator('[data-testid="brand-name-input"]')).not.toHaveClass(/.*error.*/);
  });

  test('应该支持表单重置', async ({ page }) => {
    // 填写表单数据
    await page.fill('[data-testid="brand-name-input"]', '测试品牌');
    await page.fill('[data-testid="english-name-input"]', 'Test Brand');
    await page.fill('[data-testid="company-input"]', '测试公司');
    await page.fill('[data-testid="brand-description-textarea"]', '测试描述');

    // 点击重置按钮
    await page.click('[data-testid="reset-form-button"]');

    // 验证所有字段被清空
    await expect(page.locator('[data-testid="brand-name-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="english-name-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="company-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="brand-description-textarea"]')).toHaveValue('');

    // 验证选择器恢复默认值
    await expect(page.locator('[data-testid="brand-type-select"]')).toHaveValue('');
    await expect(page.locator('[data-testid="brand-status-select"]')).toHaveValue('draft'); // 默认草稿
  });

  test('应该处理网络错误时的验证状态', async ({ page }) => {
    // Mock网络错误
    await page.route('**/api/v1/brands/check-name', (route) => {
      route.abort('failed');
    });

    // 输入品牌名称进行验证
    await page.fill('[data-testid="brand-name-input"]', '网络测试品牌');
    await page.click('[data-testid="brand-type-select"]');
    await page.getByRole('option', { name: '自有品牌' }).click();

    // 等待防抖时间
    await page.waitForTimeout(500);

    // 验证网络错误提示
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="network-error"]')).toContainText('网络连接异常，请稍后重试');

    // 验证可以重新尝试
    await page.fill('[data-testid="brand-name-input"]', '重新测试品牌');
    await page.waitForTimeout(500);

    // 验证错误提示消失或更新
    // 具体验证逻辑取决于实现
  });
});