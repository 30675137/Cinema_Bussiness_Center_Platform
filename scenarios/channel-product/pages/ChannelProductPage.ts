
import { Page, Locator, expect } from '@playwright/test';

export class ChannelProductPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async clickCreateButton() {
    // Try getByText which is direct and ignores button structure complexity
    await this.page.getByText('新增商品').click();
  }

  async selectSkuInModal() {
    // First, click the "打开 SKU 选择器" button to open the modal
    await this.page.getByRole('button', { name: '打开 SKU 选择器' }).click();

    // Wait for modal to appear
    await expect(this.page.locator('.ant-modal-content')).toBeVisible({ timeout: 10000 });

    // Ant Design Table row selection (first row with radio/checkbox usually)
    // Clicking the row should select it if onRow is configured, otherwise look for selection input
    await this.page.locator('.ant-table-row').first().click();

    // Click OK/Confirm
    await this.page.getByRole('button', { name: '确 定' }).click();
  }

  async fillBasicInfo(displayName: string, description?: string, sortOrder?: number) {
    await this.page.locator('#displayName').fill(displayName);
    if (description) {
      await this.page.locator('#description').fill(description);
    }
    if (sortOrder !== undefined) {
      await this.page.locator('#sortOrder').fill(sortOrder.toString());
    }
  }

  async addSpecGroup(name: string, required: boolean) {
    await this.page.getByRole('button', { name: '添加规格' }).click();

    // Locate the newly added spec group (last one)
    const specGroups = this.page.locator('.ant-card-head-title');
    const count = await specGroups.count();
    const lastIndex = count - 1; // Assuming 0-based for input names like specs[0]

    // We can use the name attribute based index if we track it,
    // or just assume we are editing the last one added.
    // Based on implementation: name={[name, 'name']}

    // Since Form.List adds items, the input IDs might be complex.
    // Best to find inputs within the last Card.
    const lastCard = this.page.locator('.ant-card').last();

    await lastCard.locator('input[placeholder*="规格名称"]').fill(name);

    if (required) {
       // Switch handling
       const switchBtn = lastCard.locator('button[role="switch"]').first(); // Assuming first switch is required
       const isChecked = await switchBtn.getAttribute('aria-checked') === 'true';
       if (!isChecked) {
         await switchBtn.click();
       }
    }
  }

  async addSpecOption(groupIndex: number, name: string, priceAdjust: number, isDefault: boolean) {
    const card = this.page.locator('.ant-card').nth(groupIndex); // Filter to basic info card? No, spec cards are separate
    // Actually SpecGroupCard wraps the content.
    // ChannelProductBasicForm has one main Card "基础信息".
    // SpecEditor renders SpecGroupCards.

    // Let's refine locator:
    // The "Basic Info" card has title "基础信息".
    // Spec cards have inputs in title.

    // Let's assume groupIndex 0 maps to the first spec card (which is effectively the 2nd card on page if Basic Info is 1st)
    // But SpecGroupCard is inside SpecEditor.

    // Let's use button text to find the right card context if possible,
    // or just rely on DOM order.
    // The specs are rendered AFTER the basic info form fields? No, inside the form.

    // Wait, SpecEditor is rendered at the bottom of ChannelProductBasicForm.

    // Find the card that has the "添加选项" button we want to click.
    // If groupIndex is 0, it's the first spec card.

    // The spec cards are identifiable by having "移除规格" button.
    const specCards = this.page.locator('.ant-card:has-text("移除规格")');
    const targetCard = specCards.nth(groupIndex);

    await targetCard.getByRole('button', { name: '添加选项' }).click();

    // Find the last added row in this card
    // SpecOptionRow
    const rows = targetCard.locator('.ant-space-item'); // This relies on Space implementation details
    // Better: inputs inside the Form.List

    // SpecOptionRow has inputs: name, priceAdjust, switch
    // It's rendered via fields.map.

    // We need to fill the LAST inputs in this card.
    await targetCard.locator('input[placeholder="选项名称"]').last().fill(name);
    await targetCard.locator('input[placeholder="调价(分)"]').last().fill(priceAdjust.toString());

    if (isDefault) {
       const switchBtn = targetCard.locator('button[role="switch"]').last();
       const isChecked = await switchBtn.getAttribute('aria-checked') === 'true';
       if (!isChecked) {
         await switchBtn.click();
       }
    }
  }

  async save() {
    await this.page.getByRole('button', { name: '保 存' }).click();
  }

  async search(keyword: string) {
    await this.page.locator('input[placeholder*="搜索"]').fill(keyword);
    // Debounce might delay, or need Enter?
    // Based on implementation, it listens to onValuesChange? No, usually Enter or just type.
    // Filter component: <Input ... allowClear />
    // It doesn't seem to have a submit button, usually filters automatically or on Enter.
    // Let's press Enter to be safe.
    await this.page.locator('input[placeholder*="搜索"]').press('Enter');
    await this.page.waitForTimeout(500); // Wait for table refresh
  }

  async toggleStatus(productName: string, action: '上架' | '下架') {
    const row = this.page.locator('.ant-table-row').filter({ hasText: productName });
    await row.getByRole('button', { name: action }).click();
  }

  async clickEdit(productName: string) {
    const row = this.page.locator('.ant-table-row').filter({ hasText: productName });
    await row.getByRole('button', { name: '编辑' }).click();
  }

  async deleteProduct(productName: string) {
    const row = this.page.locator('.ant-table-row').filter({ hasText: productName });
    await row.getByRole('button', { name: '删除' }).click();

    // Confirm Popconfirm
    await this.page.getByRole('button', { name: '确 定' }).click();
  }
}
