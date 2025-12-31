/**
 * @spec T004-e2e-testdata-planner
 * Auto-generated fixture for TD-INVENTORY-BOM-DEDUCTION
 * ⚠️  DO NOT EDIT MANUALLY - This file is auto-generated
 * Generated at: 2025-12-30T22:00:00Z
 * Blueprint: testdata/blueprints/inventory-bom-deduction.blueprint.yaml
 */
import { test as base } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface BomMaterial {
  skuId: string;
  skuName: string;
  initial_stock: number;
  required_quantity: number;
  unit: string;
}

export interface TD_INVENTORY_BOM_DEDUCTION_Data {
  h5BaseUrl: string;
  user_normal: {
    phone: string;
    verifyCode: string;
  };
  product_with_bom: {
    id: string;
    name: string;
    price: number;
  };
  bom_materials: BomMaterial[];
  order_data: {
    product_id: string;
    quantity: number;
    total_price: number;
  };
  payment_wechat: {
    method: string;
    amount: number;
  };
}

export const test = base.extend<{ TD_INVENTORY_BOM_DEDUCTION: TD_INVENTORY_BOM_DEDUCTION_Data }>({
  TD_INVENTORY_BOM_DEDUCTION: async ({}, use) => {
    // Setup: Load seed data
    const seedPath = path.join(
      process.cwd(),
      '..',
      'testdata',
      'seeds',
      'inventory-bom-deduction.json'
    );
    const seedContent = await fs.readFile(seedPath, 'utf-8');
    const seedData = JSON.parse(seedContent);
    const testData = seedData.find((item: any) => item.key === 'bom-deduction-scenario');

    if (!testData) {
      throw new Error(
        'Seed key "bom-deduction-scenario" not found in testdata/seeds/inventory-bom-deduction.json'
      );
    }

    // Remove the 'key' property before using
    const { key, ...data } = testData;

    await use(data as TD_INVENTORY_BOM_DEDUCTION_Data);

    // No teardown for seed strategy
  },
});

export { expect } from '@playwright/test';
