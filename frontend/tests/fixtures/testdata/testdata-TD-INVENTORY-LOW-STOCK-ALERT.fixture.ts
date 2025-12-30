/**
 * @spec T004-e2e-testdata-planner
 * Auto-generated fixture for TD-INVENTORY-LOW-STOCK-ALERT
 * ⚠️  DO NOT EDIT MANUALLY - This file is auto-generated
 * Generated at: 2025-12-30T22:00:00Z
 * Blueprint: testdata/blueprints/inventory-low-stock-alert.blueprint.yaml
 */
import { test as base } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface TD_INVENTORY_LOW_STOCK_ALERT_Data {
  adminBaseUrl: string;
  manager_user: {
    username: string;
    password: string;
    email: string;
  };
  safety_stock_config: {
    sku_id: string;
    safety_stock_threshold: number;
    warning_threshold: number;
  };
  product_sku: {
    id: string;
    name: string;
    initial_stock: number;
    current_stock: number;
    unit: string;
  };
  alert_notification: {
    type: string;
    severity: string;
    sku_id: string;
    sku_name: string;
    current_stock: number;
    safety_threshold: number;
    recommended_restock: number;
  };
  manager_email: {
    to: string;
    subject: string;
    body_contains: string[];
  };
}

export const test = base.extend<{ TD_INVENTORY_LOW_STOCK_ALERT: TD_INVENTORY_LOW_STOCK_ALERT_Data }>({
  TD_INVENTORY_LOW_STOCK_ALERT: async ({}, use) => {
    // Setup: Load seed data
    const seedPath = path.join(process.cwd(), '..', 'testdata', 'seeds', 'inventory-low-stock-alert.json');
    const seedContent = await fs.readFile(seedPath, 'utf-8');
    const seedData = JSON.parse(seedContent);
    const testData = seedData.find((item: any) => item.key === 'low-stock-alert-scenario');

    if (!testData) {
      throw new Error('Seed key "low-stock-alert-scenario" not found in testdata/seeds/inventory-low-stock-alert.json');
    }

    // Remove the 'key' property before using
    const { key, ...data } = testData;

    await use(data as TD_INVENTORY_LOW_STOCK_ALERT_Data);

    // No teardown for seed strategy
  },
});

export { expect } from '@playwright/test';
