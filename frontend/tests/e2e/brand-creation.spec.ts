import { test, expect } from '@playwright/test';

test.describe('品牌创建功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mdm-pim/brands');
    // 等待页面加载完成
    await page.waitForSelector('[data-testid="brand-table"]', { timeout: 5000 });
  });

  test('应该能够打开品牌创建抽屉', async ({ page }) => {
    // 点击新建品牌按钮
    await page.click('[data-testid="new-brand-button"]');

    // 验证品牌创建抽屉打开
    await expect(page.locator('[data-testid="brand-drawer"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-drawer-title"]')).toContainText('新建品牌');
  });

  test('应该显示所有必需的表单字段', async ({ page }) => {
    // 打开品牌创建抽屉
    await page.click('[data-testid="new-brand-button"]');

    // 验证必需字段存在
    await expect(page.locator('[data-testid="brand-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-name-input"]')).toHaveAttribute('required');

    await expect(page.locator('[data-testid="brand-type-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-type-select"]')).toHaveAttribute('required');

    // 验证可选字段存在
    await expect(page.locator('[data-testid="english-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="primary-categories-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="company-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-level-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-tags-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-description-textarea"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-status-select"]')).toBeVisible();
  });

  test('应该能够填写品牌基本信息', async ({ page }) => {
    // 打开品牌创建抽屉
    await page.click('[data-testid="new-brand-button"]');

    // 填写品牌名称（必填）
    await page.fill('[data-testid="brand-name-input"]', '测试品牌');

    // 选择品牌类型（必填）
    await page.click('[data-testid="brand-type-select"]');
    await page.getByRole('option', { name: '自有品牌' }).click();

    // 填写英文名（可选）
    await page.fill('[data-testid="english-name-input"]', 'Test Brand');

    // 填写所属公司
    await page.fill('[data-testid="company-input"]', '测试公司');

    // 选择品牌等级
    await page.click('[data-testid="brand-level-select"]');
    await page.getByRole('option', { name: 'A级' }).click();

    // 验证输入内容
    await expect(page.locator('[data-testid="brand-name-input"]')).toHaveValue('测试品牌');
    await expect(page.locator('[data-testid="brand-type-select"]')).toHaveValue('own');
    await expect(page.locator('[data-testid="english-name-input"]')).toHaveValue('Test Brand');
    await expect(page.locator('[data-testid="company-input"]')).toHaveValue('测试公司');
  });

  test('应该能够选择主营类目', async ({ page }) => {
    // 打开品牌创建抽屉
    await page.click('[data-testid="new-brand-button"]');

    // 选择主营类目
    await page.click('[data-testid="primary-categories-select"]');
    await page.getByRole('option', { name: '饮料' }).click();
    await page.getByRole('option', { name: '食品' }).click();

    // 验证选择结果（具体验证方式取决于组件实现）
    // 这里可以检查类目标签是否显示
  });

  test('应该能够添加品牌标签', async ({ page }) => {
    // 打开品牌创建抽屉
    await page.click('[data-testid="new-brand-button"]');

    // 添加品牌标签
    const tagsInput = page.locator('[data-testid="brand-tags-input"]');
    await tagsInput.fill('国产品牌');
    await page.keyboard.press('Enter');
    await tagsInput.fill('知名品牌');
    await page.keyboard.press('Enter');

    // 验证标签已添加
    await expect(page.locator('[data-testid="brand-tag-item"]').first()).toContainText('国产品牌');
    await expect(page.locator('[data-testid="brand-tag-item"]').last()).toContainText('知名品牌');
  });

  test('应该能够设置品牌状态', async ({ page }) => {
    // 打开品牌创建抽屉
    await page.click('[data-testid="new-brand-button"]');

    // 默认应该选择草稿状态
    await expect(page.locator('[data-testid="brand-status-select"]')).toHaveValue('draft');

    // 更改为启用状态
    await page.click('[data-testid="brand-status-select"]');
    await page.getByRole('option', { name: '启用' }).click();

    // 验证状态更改
    await expect(page.locator('[data-testid="brand-status-select"]')).toHaveValue('enabled');
  });

  test('应该能够填写品牌描述', async ({ page }) => {
    // 打开品牌创建抽屉
    await page.click('[data-testid="new-brand-button"]');

    // 填写品牌描述
    const description = '这是一个测试品牌，用于验证品牌创建功能的完整性。';
    await page.fill('[data-testid="brand-description-textarea"]', description);

    // 验证描述内容
    await expect(page.locator('[data-testid="brand-description-textarea"]')).toHaveValue(description);
  });

  test('应该验证必填字段', async ({ page }) => {
    // 打开品牌创建抽屉
    await page.click('[data-testid="new-brand-button"]');

    // 直接点击保存按钮，不填写任何信息
    await page.click('[data-testid="save-brand-button"]');

    // 验证错误提示
    await expect(page.locator('[data-testid="brand-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-type-error"]')).toBeVisible();

    // 验证错误消息
    await expect(page.locator('[data-testid="brand-name-error"]')).toContainText('品牌名称不能为空');
    await expect(page.locator('[data-testid="brand-type-error"]')).toContainText('请选择品牌类型');
  });

  test('应该验证品牌名称重复', async ({ page }) => {
    // Mock已存在的品牌数据
    await page.route('**/api/v1/brands**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'existing-brand',
              name: '已有品牌',
              brandType: 'own',
              status: 'enabled'
            }
          ],
          pagination: { current: 1, pageSize: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
          message: 'Success',
          timestamp: new Date().toISOString()
        })
      });
    });

    // Mock品牌创建API返回重复错误
    await page.route('**/api/v1/brands', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: {
              code: 'DUPLICATE_BRAND',
              message: '系统中已存在同名品牌',
              details: [
                { field: 'name', message: '品牌名称在同类型中已存在' }
              ]
            },
            timestamp: new Date().toISOString()
          })
        });
      }
    });

    // 打开品牌创建抽屉
    await page.click('[data-testid="new-brand-button"]');

    // 填写重复的品牌名称
    await page.fill('[data-testid="brand-name-input"]', '已有品牌');
    await page.click('[data-testid="brand-type-select"]');
    await page.getByRole('option', { name: '自有品牌' }).click();

    // 尝试保存
    await page.click('[data-testid="save-brand-button"]');

    // 验证重复错误提示
    await expect(page.locator('[data-testid="duplicate-brand-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="duplicate-brand-error"]')).toContainText('系统中已存在同名品牌');
  });

  test('应该能够成功创建品牌', async ({ page }) => {
    // Mock品牌创建API成功响应
    await page.route('**/api/v1/brands', (route) => {
      if (route.request().method() === 'POST') {
        const requestData = JSON.parse(route.request().postData() || '{}');

        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'new-brand-' + Date.now(),
              brandCode: 'BRAND' + Date.now(),
              name: requestData.name,
              englishName: requestData.englishName,
              brandType: requestData.brandType,
              primaryCategories: requestData.primaryCategories || [],
              company: requestData.company,
              brandLevel: requestData.brandLevel,
              tags: requestData.tags || [],
              description: requestData.description,
              logoUrl: null,
              status: requestData.status || 'draft',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: 'admin',
              updatedBy: 'admin'
            },
            message: 'Brand created successfully',
            timestamp: new Date().toISOString()
          })
        });
      }
    });

    // Mock更新后的品牌列表
    await page.route('**/api/v1/brands*', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 'new-brand-123',
                brandCode: 'BRAND123',
                name: '新测试品牌',
                englishName: 'New Test Brand',
                brandType: 'own',
                primaryCategories: ['饮料'],
                company: '测试公司',
                brandLevel: 'A',
                tags: ['新品牌'],
                description: '测试品牌描述',
                logoUrl: null,
                status: 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'admin',
                updatedBy: 'admin'
              }
            ],
            pagination: { current: 1, pageSize: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
            message: 'Success',
            timestamp: new Date().toISOString()
          })
        });
      }
    });

    // 打开品牌创建抽屉
    await page.click('[data-testid="new-brand-button"]');

    // 填写完整的品牌信息
    await page.fill('[data-testid="brand-name-input"]', '新测试品牌');
    await page.fill('[data-testid="english-name-input"]', 'New Test Brand');
    await page.click('[data-testid="brand-type-select"]');
    await page.getByRole('option', { name: '自有品牌' }).click();
    await page.fill('[data-testid="company-input"]', '测试公司');
    await page.click('[data-testid="brand-level-select"]');
    await page.getByRole('option', { name: 'A级' }).click();

    // 点击保存
    await page.click('[data-testid="save-brand-button"]');

    // 验证成功消息
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('品牌创建成功');

    // 验证抽屉关闭
    await expect(page.locator('[data-testid="brand-drawer"]')).not.toBeVisible();

    // 验证品牌列表刷新并包含新品牌
    await expect(page.locator('[data-testid="brand-table"]')).toBeVisible();
    await expect(page.getByText('新测试品牌')).toBeVisible();
  });

  test('应该能够取消品牌创建', async ({ page }) => {
    // 打开品牌创建抽屉
    await page.click('[data-testid="new-brand-button"]');

    // 填写一些信息
    await page.fill('[data-testid="brand-name-input"]', '要取消的品牌');
    await page.fill('[data-testid="english-name-input"]', 'Brand to Cancel');

    // 点击取消按钮
    await page.click('[data-testid="cancel-brand-button"]');

    // 验证抽屉关闭
    await expect(page.locator('[data-testid="brand-drawer"]')).not.toBeVisible();

    // 验证品牌列表没有变化
    await expect(page.locator('[data-testid="brand-table"]')).toBeVisible();
    await expect(page.getByText('要取消的品牌')).not.toBeVisible();
  });

  test('应该处理未保存修改的确认', async ({ page }) => {
    // 打开品牌创建抽屉
    await page.click('[data-testid="new-brand-button"]');

    // 填写一些信息
    await page.fill('[data-testid="brand-name-input"]', '未保存的品牌');

    // 尝试关闭抽屉（通过点击遮罩层或关闭按钮）
    await page.click('[data-testid="drawer-close-button"]');

    // 验证确认对话框出现
    await expect(page.locator('[data-testid="unsaved-changes-dialog"]')).toBeVisible();
    await expect(page.locator('[data-testid="unsaved-changes-dialog"]')).toContainText('当前有未保存的修改，确定要关闭吗？');

    // 点击确认关闭
    await page.click('[data-testid="confirm-close-button"]');

    // 验证抽屉关闭
    await expect(page.locator('[data-testid="brand-drawer"]')).not.toBeVisible();
  });

  test('应该处理品牌创建过程中的错误', async ({ page }) => {
    // Mock品牌创建API错误
    await page.route('**/api/v1/brands', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: '服务器内部错误'
            },
            timestamp: new Date().toISOString()
          })
        });
      }
    });

    // 打开品牌创建抽屉
    await page.click('[data-testid="new-brand-button"]');

    // 填写品牌信息
    await page.fill('[data-testid="brand-name-input"]', '错误测试品牌');
    await page.click('[data-testid="brand-type-select"]');
    await page.getByRole('option', { name: '自有品牌' }).click();

    // 尝试保存
    await page.click('[data-testid="save-brand-button"]');

    // 验证错误消息显示
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('创建失败');

    // 验证抽屉仍然打开，允许用户重试
    await expect(page.locator('[data-testid="brand-drawer"]')).toBeVisible();
  });
});