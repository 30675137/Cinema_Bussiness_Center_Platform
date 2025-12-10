import { test, expect } from '@playwright/test';
import { ProductPage } from './pages/ProductPage';
import { formInputs } from './fixtures/test-data';

test.describe('用户故事2: 商品创建与编辑', () => {
  let productPage: ProductPage;

  test.beforeEach(async ({ page }) => {
    productPage = new ProductPage(page);
    await productPage.goto();
  });

  test('US2-1: 验证商品创建流程完整', async ({ page }) => {
    // Given 用户进入商品创建界面
    // When 填写必填的基础信息
    // Then 系统验证必填字段并允许继续下一步

    await productPage.clickCreateProduct();

    // 填写基本信息
    await productPage.fillBasicInfo({
      name: formInputs.product.name,
      sku: formInputs.product.sku,
      category: formInputs.product.category,
      materialType: formInputs.product.materialType,
      description: formInputs.product.description,
      price: formInputs.product.price
    });

    // 验证必填字段验证
    await expect(page.locator('[data-testid="product-name"]')).toHaveValue(formInputs.product.name);
    await expect(page.locator('[data-testid="product-sku"]')).toHaveValue(formInputs.product.sku);

    // 切换到内容管理Tab
    await productPage.fillContentTab({
      title: formInputs.product.name + ' - 标题',
      shortTitle: formInputs.product.name,
      description: formInputs.product.description,
      shortDescription: '简短描述'
    });

    // 保存商品
    await productPage.saveProduct();

    // 验证保存成功消息
    await expect(page.locator('.ant-message-success')).toBeVisible();

    // 验证跳转回商品列表
    await expect(page).toHaveURL(/.*\/products/);
  });

  test('US2-2: 验证商品表单验证功能', async ({ page }) => {
    // Given 用户进入商品创建界面
    // When 提交空表单或必填字段缺失
    // Then 系统显示验证错误信息

    await productPage.clickCreateProduct();

    // 尝试直接保存不填写任何信息
    await productPage.saveProduct();

    // 验证验证错误消息
    await expect(page.locator('[data-testid="form-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-name-required"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-sku-required"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-category-required"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-material-type-required"]')).toBeVisible();
  });

  test('US2-3: 验证多Tab设计功能', async ({ page }) => {
    // Given 用户在商品编辑界面
    // When 切换不同的Tab
    // Then 显示对应的信息和编辑控件

    await productPage.clickCreateProduct();

    // 验证默认激活基础信息Tab
    await expect(page.locator('[data-testid="basic-info-tab"]')).toHaveClass(/active/);
    await expect(page.locator('[data-testid="basic-info-form"]')).toBeVisible();

    // 切换到内容管理Tab
    await page.locator('[data-testid="content-tab"]').click();
    await expect(page.locator('[data-testid="content-tab"]')).toHaveClass(/active/);
    await expect(page.locator('[data-testid="content-form"]')).toBeVisible();

    // 切换到规格与属性Tab
    await page.locator('[data-testid="specs-tab"]').click();
    await expect(page.locator('[data-testid="specs-tab"]')).toHaveClass(/active/);
    await expect(page.locator('[data-testid="specs-form"]')).toBeVisible();

    // 切换到BOM/配方Tab
    await page.locator('[data-testid="bom-tab"]').click();
    await expect(page.locator('[data-testid="bom-tab"]')).toHaveClass(/active/);
    await expect(page.locator('[data-testid="bom-form"]')).toBeVisible();
  });

  test('US2-4: 验证BOM/配方Tab显示逻辑', async ({ page }) => {
    // Given 用户选择成品作为物料类型
    // When 切换到BOM/配方Tab
    // Then 显示配方配置界面

    await productPage.clickCreateProduct();

    // 选择成品物料类型
    await page.click('[data-testid="material-type"]');
    await page.click('[data-value="成品"]');

    // 切换到BOM/配方Tab
    await page.locator('[data-testid="bom-tab"]').click();

    // 验证BOM配置界面显示
    await expect(page.locator('[data-testid="bom-config"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-material-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="bom-table"]')).toBeVisible();

    // 选择商品物料类型
    await page.click('[data-testid="material-type"]');
    await page.click('[data-value="商品"]');

    // 验证BOM/配方Tab不显示或禁用
    const bomTab = page.locator('[data-testid="bom-tab"]');
    await expect(bomTab).toHaveClass(/disabled/);
  });

  test('US2-5: 验证表单脏状态跟踪', async ({ page }) => {
    // Given 用户在商品编辑界面
    // When 修改表单内容后尝试离开
    // Then 系统显示确认对话框

    await productPage.clickCreateProduct();

    // 填写部分信息
    await page.fill('[data-testid="product-name"]', '测试商品');
    await page.fill('[data-testid="product-sku"]', 'TEST001');

    // 尝试离开页面（点击取消）
    await productPage.cancelEdit();

    // 验证确认对话框出现
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirm-title"]')).toContainText('确认离开');
    await expect(page.locator('[data-testid="confirm-message"]')).toContainText('您有未保存的修改');

    // 确认离开
    await page.click('[data-testid="confirm-yes"]');

    // 验证返回商品列表
    await expect(page).toHaveURL(/.*\/products/);
  });

  test('US2-6: 验证SKU重复验证', async ({ page }) => {
    // Given 用户在商品创建界面
    // When 输入已存在的SKU
    // Then 系统显示重复错误信息

    await productPage.clickCreateProduct();

    // 使用已存在的SKU（假设存在）
    await page.fill('[data-testid="product-sku"]', 'POP001-L');

    // 触发验证
    await page.blur('[data-testid="product-sku"]');

    // 验证重复错误消息
    await expect(page.locator('[data-testid="error-sku-duplicate"]')).toBeVisible();
  });

  test('US2-7: 验证商品编辑功能', async ({ page }) => {
    // Given 用户选择编辑现有商品
    // When 修改商品信息
    // Then 验证修改功能正常工作

    await productPage.goto();

    // 查找第一个商品的编辑按钮
    const firstRow = page.locator('[data-testid="product-row"]').first();
    const editButton = firstRow.locator('[data-testid="edit-button"]');
    await expect(editButton).toBeVisible();

    // 点击编辑
    await editButton.click();

    // 验证编辑表单加载
    await expect(page).toHaveURL(/.*\/products\/edit\/.+/);
    await expect(page.locator('[data-testid="product-form"]')).toBeVisible();

    // 验证表单中有现有数据
    await expect(page.locator('[data-testid="product-name"]')).toHaveValue(/\S+/);
    await expect(page.locator('[data-testid="product-sku"]')).toHaveValue(/\S+/);

    // 修改商品名称
    const newName = '修改后的商品名称';
    await page.fill('[data-testid="product-name"]', newName);

    // 保存修改
    await productPage.saveProduct();

    // 验证保存成功
    await expect(page.locator('.ant-message-success')).toBeVisible();

    // 返回列表验证修改生效
    await page.goto('/products');
    await productPage.searchProduct(newName);
    await productPage.verifyProductExists('', newName);
  });

  test('US2-8: 验证规格矩阵生成功能', async ({ page }) => {
    // Given 用户在规格配置Tab
    // When 添加规格项
    // Then 自动生成SKU矩阵

    await productPage.clickCreateProduct();
    await page.locator('[data-testid="specs-tab"]').click();

    // 添加颜色规格
    await page.click('[data-testid="add-spec-button"]');
    await page.fill('[data-testid="spec-name"]', '颜色');
    await page.click('[data-testid="add-spec-value"]');
    await page.fill('[data-testid="spec-value"]', '红色');
    await page.click('[data-testid="save-spec-value"]');
    await page.fill('[data-testid="spec-value"]', '蓝色');
    await page.click('[data-testid="save-spec-value"]');
    await page.click('[data-testid="save-spec"]');

    // 添加尺寸规格
    await page.click('[data-testid="add-spec-button"]');
    await page.fill('[data-testid="spec-name"]', '尺寸');
    await page.click('[data-testid="add-spec-value"]');
    await page.fill('[data-testid="spec-value"]', 'S');
    await page.click('[data-testid="save-spec-value"]');
    await page.fill('[data-testid="spec-value"]', 'M');
    await page.click('[data-testid="save-spec-value"]');
    await page.click('[data-testid="save-spec"]');

    // 验证SKU矩阵生成
    await expect(page.locator('[data-testid="sku-matrix"]')).toBeVisible();
    await expect(page.locator('[data-testid="sku-row"]')).toHaveCount(4); // 2颜色 x 2尺寸 = 4个SKU
  });

  test('US2-9: 验证图片上传功能', async ({ page }) => {
    // Given 用户在内容管理Tab
    // When 上传商品图片
    // Then 图片正确显示并可管理

    await productPage.clickCreateProduct();
    await page.locator('[data-testid="content-tab"]').click();

    // 点击上传按钮
    const uploadButton = page.locator('[data-testid="image-upload-button"]');
    if (await uploadButton.isVisible()) {
      await uploadButton.click();

      // 模拟文件选择（在实际测试中需要准备测试图片文件）
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('tests/fixtures/test-image.jpg');

      // 验证图片上传区域显示
      await expect(page.locator('[data-testid="image-preview"]')).toBeVisible();

      // 验证删除按钮
      await expect(page.locator('[data-testid="remove-image"]')).toBeVisible();
    }
  });

  test('US2-10: 验证PIM渠道覆写功能', async ({ page }) => {
    // Given 用户在内容管理Tab
    // When 配置渠道特定内容
    // Then 验证渠道覆写功能正常工作

    await productPage.clickCreateProduct();
    await page.locator('[data-testid="content-tab"]').click();

    // 启用渠道覆写
    const channelOverrideToggle = page.locator('[data-testid="channel-override-toggle"]');
    if (await channelOverrideToggle.isVisible()) {
      await channelOverrideToggle.click();

      // 验证渠道配置界面出现
      await expect(page.locator('[data-testid="channel-config"]')).toBeVisible();

      // 配置小程序渠道的短标题
      await page.click('[data-testid="channel-miniprogram"]');
      await page.fill('[data-testid="mini-program-short-title"]', '小程序专用短标题');

      // 配置APP渠道的短描述
      await page.click('[data-testid="channel-app"]');
      await page.fill('[data-testid="app-short-description"]', 'APP专用短描述');

      // 验证预览功能
      await page.click('[data-testid="preview-button"]');
      await expect(page.locator('[data-testid="preview-modal"]')).toBeVisible();

      // 验证不同渠道的预览内容
      await expect(page.locator('[data-testid="preview-miniprogram"]')).toContainText('小程序专用短标题');
      await expect(page.locator('[data-testid="preview-app"]')).toContainText('APP专用短描述');
    }
  });
});