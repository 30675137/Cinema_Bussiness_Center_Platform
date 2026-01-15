import { test, expect } from '@playwright/test';
import { join } from 'path';
import { readFileSync } from 'fs';

test.describe('品牌LOGO上传功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mdm-pim/brands');
    await page.waitForSelector('[data-testid="brand-table"]', { timeout: 5000 });
    await page.click('[data-testid="new-brand-button"]');
    await expect(page.locator('[data-testid="brand-drawer"]')).toBeVisible();
  });

  test('应该显示LOGO上传区域', async ({ page }) => {
    // 验证LOGO上传组件存在
    await expect(page.locator('[data-testid="brand-logo-upload"]')).toBeVisible();
    await expect(page.locator('[data-testid="logo-upload-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="logo-upload-text"]')).toBeVisible();

    // 验证上传提示信息
    await expect(page.locator('[data-testid="logo-upload-text"]')).toContainText(
      '点击或拖拽文件到此区域上传'
    );
    await expect(page.locator('[data-testid="logo-upload-hint"]')).toContainText(
      '支持 JPG、PNG、GIF 格式，文件大小不超过 2MB'
    );
  });

  test('应该支持点击上传LOGO', async ({ page }) => {
    // Mock文件选择
    const fileInput = page.locator('[data-testid="logo-file-input"]');
    await expect(fileInput).toBeAttachedToDOM();

    // 模拟文件选择
    const imagePath = join(__dirname, '../fixtures/test-logo.png');
    await fileInput.setInputFiles(imagePath);

    // 验证文件已选择并显示预览
    await expect(page.locator('[data-testid="logo-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="logo-preview-image"]')).toBeVisible();
  });

  test('应该支持拖拽上传LOGO', async ({ page }) => {
    // 创建测试文件
    const testFile = Buffer.from('fake-image-data');

    // 模拟拖拽上传
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      const file = new File(['test'], 'test-logo.png', { type: 'image/png' });
      dt.items.add(file);
      return dt;
    });

    // 执行拖拽
    await page
      .locator('[data-testid="logo-upload-area"]')
      .dispatchEvent('dragover', { dataTransfer });
    await page.locator('[data-testid="logo-upload-area"]').dispatchEvent('drop', { dataTransfer });

    // 验证拖拽后显示上传状态
    await expect(page.locator('[data-testid="logo-uploading"]')).toBeVisible();
    await expect(page.locator('[data-testid="logo-uploading"]')).toContainText('正在上传...');
  });

  test('应该验证文件格式', async ({ page }) => {
    // 创建一个无效格式的文件（例如，文本文件）
    const invalidFile = Buffer.from('not-an-image');

    // 模拟上传无效格式文件
    await page
      .evaluateHandle(() => {
        const dt = new DataTransfer();
        const file = new File(['not-an-image'], 'test.txt', { type: 'text/plain' });
        dt.items.add(file);
        return dt;
      })
      .then((dataTransfer) => {
        return page
          .locator('[data-testid="logo-upload-area"]')
          .dispatchEvent('drop', { dataTransfer });
      });

    // 验证格式错误提示
    await expect(page.locator('[data-testid="logo-format-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="logo-format-error"]')).toContainText(
      '不支持的文件格式'
    );
    await expect(page.locator('[data-testid="logo-format-error"]')).toContainText(
      '请上传 JPG、PNG 或 GIF 格式的图片'
    );
  });

  test('应该验证文件大小', async ({ page }) => {
    // Mock大文件检测
    await page.route('**/api/v1/brands/*/logo', (route) => {
      // 模拟服务器返回文件过大错误
      route.fulfill({
        status: 413,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: '文件大小超过限制',
          },
          timestamp: new Date().toISOString(),
        }),
      });
    });

    // 模拟上传大文件
    await page
      .evaluateHandle(() => {
        const dt = new DataTransfer();
        // 创建一个表示大文件的文件对象
        const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large-logo.png', {
          type: 'image/png',
        }); // 3MB
        dt.items.add(largeFile);
        return dt;
      })
      .then((dataTransfer) => {
        return page
          .locator('[data-testid="logo-upload-area"]')
          .dispatchEvent('drop', { dataTransfer });
      });

    // 验证文件大小错误提示
    await expect(page.locator('[data-testid="logo-size-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="logo-size-error"]')).toContainText(
      '文件大小超过 2MB 限制'
    );
  });

  test('应该显示上传进度', async ({ page }) => {
    // Mock上传进度
    let progressValue = 0;
    await page.route('**/api/v1/brands/*/logo', (route) => {
      // 模拟渐进式响应
      progressValue += 25;
      if (progressValue < 100) {
        route.fulfill({
          status: 202,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { progress: progressValue },
            message: 'Uploading...',
            timestamp: new Date().toISOString(),
          }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              logoUrl: 'https://example.com/uploaded-logo.png',
              updatedAt: new Date().toISOString(),
            },
            message: 'Logo uploaded successfully',
            timestamp: new Date().toISOString(),
          }),
        });
      }
    });

    // 模拟文件上传
    const fileInput = page.locator('[data-testid="logo-file-input"]');
    await fileInput.setInputFiles('test-logo.png');

    // 验证进度条显示
    await expect(page.locator('[data-testid="logo-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="logo-progress-bar"]')).toBeVisible();
  });

  test('应该成功上传LOGO', async ({ page }) => {
    // Mock成功上传响应
    await page.route('**/api/v1/brands/*/logo', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            logoUrl: 'https://example.com/brand-logos/test-logo.png',
            updatedAt: new Date().toISOString(),
          },
          message: 'Logo uploaded successfully',
          timestamp: new Date().toISOString(),
        }),
      });
    });

    // 模拟文件上传
    const fileInput = page.locator('[data-testid="logo-file-input"]');
    await fileInput.setInputFiles('test-logo.png');

    // 等待上传完成
    await page.waitForTimeout(1000);

    // 验证成功状态
    await expect(page.locator('[data-testid="logo-upload-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="logo-preview-image"]')).toHaveAttribute(
      'src',
      /test-logo\.png/
    );

    // 验证删除按钮出现
    await expect(page.locator('[data-testid="logo-delete-button"]')).toBeVisible();
  });

  test('应该能够删除已上传的LOGO', async ({ page }) => {
    // 先模拟成功上传
    await page.route('**/api/v1/brands/*/logo', (route) => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Logo deleted successfully',
            timestamp: new Date().toISOString(),
          }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              logoUrl: 'https://example.com/brand-logos/test-logo.png',
              updatedAt: new Date().toISOString(),
            },
            message: 'Logo uploaded successfully',
            timestamp: new Date().toISOString(),
          }),
        });
      }
    });

    // 上传文件
    const fileInput = page.locator('[data-testid="logo-file-input"]');
    await fileInput.setInputFiles('test-logo.png');
    await page.waitForTimeout(1000);

    // 点击删除按钮
    await page.click('[data-testid="logo-delete-button"]');

    // 验证删除确认对话框
    await expect(page.locator('[data-testid="logo-delete-confirm"]')).toBeVisible();
    await expect(page.locator('[data-testid="logo-delete-confirm"]')).toContainText(
      '确定要删除品牌LOGO吗？'
    );

    // 确认删除
    await page.click('[data-testid="confirm-delete-button"]');

    // 验证删除成功，恢复上传区域
    await expect(page.locator('[data-testid="logo-upload-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="logo-preview-image"]')).not.toBeVisible();
  });

  test('应该处理上传错误', async ({ page }) => {
    // Mock上传错误
    await page.route('**/api/v1/brands/*/logo', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'UPLOAD_FAILED',
            message: '服务器上传失败',
          },
          timestamp: new Date().toISOString(),
        }),
      });
    });

    // 模拟文件上传
    const fileInput = page.locator('[data-testid="logo-file-input"]');
    await fileInput.setInputFiles('test-logo.png');
    await page.waitForTimeout(1000);

    // 验证错误状态
    await expect(page.locator('[data-testid="logo-upload-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="logo-upload-error"]')).toContainText('上传失败');

    // 验证重试按钮
    await expect(page.locator('[data-testid="logo-retry-button"]')).toBeVisible();
  });

  test('应该支持重新上传LOGO', async ({ page }) => {
    // Mock上传响应
    await page.route('**/api/v1/brands/*/logo', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            logoUrl: 'https://example.com/brand-logos/new-logo.png',
            updatedAt: new Date().toISOString(),
          },
          message: 'Logo uploaded successfully',
          timestamp: new Date().toISOString(),
        }),
      });
    });

    // 先上传一个文件
    const fileInput = page.locator('[data-testid="logo-file-input"]');
    await fileInput.setInputFiles('old-logo.png');
    await page.waitForTimeout(1000);

    // 验证第一个文件已上传
    await expect(page.locator('[data-testid="logo-preview-image"]')).toHaveAttribute(
      'src',
      /old-logo\.png/
    );

    // 点击重新上传按钮
    await page.click('[data-testid="logo-reupload-button"]');

    // 选择新文件
    await fileInput.setInputFiles('new-logo.png');
    await page.waitForTimeout(1000);

    // 验证新文件已上传
    await expect(page.locator('[data-testid="logo-preview-image"]')).toHaveAttribute(
      'src',
      /new-logo\.png/
    );
  });

  test('应该显示LOGO预览', async ({ page }) => {
    // Mock成功上传
    await page.route('**/api/v1/brands/*/logo', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            logoUrl: 'https://example.com/brand-logos/preview-logo.png',
            updatedAt: new Date().toISOString(),
          },
          message: 'Logo uploaded successfully',
          timestamp: new Date().toISOString(),
        }),
      });
    });

    // 上传文件
    const fileInput = page.locator('[data-testid="logo-file-input"]');
    await fileInput.setInputFiles('preview-logo.png');
    await page.waitForTimeout(1000);

    // 验证预览功能
    await expect(page.locator('[data-testid="logo-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="logo-preview-image"]')).toBeVisible();

    // 点击预览图片
    await page.click('[data-testid="logo-preview-image"]');

    // 验证图片预览模态框
    await expect(page.locator('[data-testid="logo-preview-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="logo-preview-full-image"]')).toBeVisible();
  });

  test('应该在上传时禁用保存按钮', async ({ page }) => {
    // Mock慢速上传
    await page.route('**/api/v1/brands/*/logo', (route) => {
      // 延迟响应，模拟慢速上传
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              logoUrl: 'https://example.com/brand-logos/slow-logo.png',
              updatedAt: new Date().toISOString(),
            },
            message: 'Logo uploaded successfully',
            timestamp: new Date().toISOString(),
          }),
        });
      }, 2000);
    });

    // 上传文件
    const fileInput = page.locator('[data-testid="logo-file-input"]');
    await fileInput.setInputFiles('slow-logo.png');

    // 验证上传中保存按钮被禁用
    await expect(page.locator('[data-testid="save-brand-button"]')).toBeDisabled();
    await expect(page.locator('[data-testid="logo-uploading"]')).toBeVisible();

    // 等待上传完成
    await page.waitForTimeout(2500);

    // 验证上传完成后保存按钮恢复可用
    await expect(page.locator('[data-testid="save-brand-button"]')).not.toBeDisabled();
    await expect(page.locator('[data-testid="logo-uploading"]')).not.toBeVisible();
  });
});
