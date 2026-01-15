// @spec P006-fix-sku-edit-data
// Page Object for SKU Edit Page

import { Page, Locator } from '@playwright/test';

/**
 * SKUEditPage - SKU编辑页面
 */
export class SKUEditPage {
  readonly page: Page;
  readonly spuInfoSection: Locator;
  readonly spuNameField: Locator;
  readonly spuCategoryField: Locator;
  readonly spuBrandField: Locator;
  readonly spuDescriptionField: Locator;
  readonly skuCodeField: Locator;
  readonly skuNameField: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // SPU信息区域
    this.spuInfoSection = page.locator('[data-testid="spu-info-section"]');
    this.spuNameField = page.locator('[data-testid="spu-name"]');
    this.spuCategoryField = page.locator('[data-testid="spu-category"]');
    this.spuBrandField = page.locator('[data-testid="spu-brand"]');
    this.spuDescriptionField = page.locator('[data-testid="spu-description"]');

    // SKU基本信息字段
    this.skuCodeField = page.locator('[data-testid="sku-code"]');
    this.skuNameField = page.locator('[data-testid="sku-name"]');

    // 操作按钮
    this.saveButton = page.locator('button:has-text("保存")').first();
    this.cancelButton = page.locator('button:has-text("取消")').first();
  }

  /**
   * 等待页面加载完成
   * @param timeout - 超时时间（毫秒）
   */
  async waitForLoad(timeout: number = 5000): Promise<void> {
    // 等待SPU信息区域加载
    await this.spuInfoSection.waitFor({ state: 'visible', timeout });

    // 等待网络空闲
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 获取SPU名称文本
   */
  async getSPUName(): Promise<string | null> {
    return await this.spuNameField.textContent();
  }

  /**
   * 获取SPU分类文本
   */
  async getSPUCategory(): Promise<string | null> {
    return await this.spuCategoryField.textContent();
  }

  /**
   * 获取SPU品牌文本
   */
  async getSPUBrand(): Promise<string | null> {
    return await this.spuBrandField.textContent();
  }

  /**
   * 获取SPU描述文本
   */
  async getSPUDescription(): Promise<string | null> {
    return await this.spuDescriptionField.textContent();
  }

  /**
   * 检查SPU字段是否为只读
   */
  async isSPUReadonly(): Promise<boolean> {
    // 检查SPU信息区域内的所有input和textarea是否为只读
    const inputs = this.spuInfoSection.locator('input, textarea');
    const count = await inputs.count();

    if (count === 0) {
      // 如果没有input/textarea，检查是否使用了只读的展示组件（如Descriptions）
      const descriptions = this.spuInfoSection.locator('.ant-descriptions, [class*="readonly"]');
      return await descriptions.count() > 0;
    }

    // 检查每个input/textarea是否有readonly或disabled属性
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const isReadonly = await input.getAttribute('readonly');
      const isDisabled = await input.getAttribute('disabled');

      if (!isReadonly && !isDisabled) {
        return false; // 找到可编辑的字段
      }
    }

    return true; // 所有字段都是只读
  }

  /**
   * 更新SKU名称
   * @param newName - 新的SKU名称
   */
  async updateSKUName(newName: string): Promise<void> {
    await this.skuNameField.fill(newName);
  }

  /**
   * 保存修改
   */
  async save(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 取消修改
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
