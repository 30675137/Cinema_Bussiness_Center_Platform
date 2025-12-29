#!/usr/bin/env node
/**
 * @spec P005-bom-inventory-deduction
 * Auto-insert test data using Node.js pg client
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: 'aws-1-us-east-2.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.fxhgyxceqrmnpezluaht',
  password: 'ppkZ8sGUEHB0qjFs',
  ssl: { rejectUnauthorized: false }
});

async function insertTestData() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully');

    const sqlFile = path.join(__dirname, '../backend/insert-test-data.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('\n📝 Executing SQL...');
    const result = await client.query(sql);

    console.log('\n✅ Test data inserted successfully!');
    console.log('\n📊 Verification:');

    // Verify inserted data
    const verifyQueries = [
      { name: 'Stores', sql: "SELECT COUNT(*) FROM stores WHERE id = '00000000-0000-0000-0000-000000000099'::uuid" },
      { name: 'SKUs', sql: "SELECT COUNT(*) FROM skus WHERE id::text LIKE '11111111%' OR id::text LIKE '22222222%'" },
      { name: 'Inventory', sql: "SELECT COUNT(*) FROM store_inventory WHERE store_id = '00000000-0000-0000-0000-000000000099'::uuid" },
      { name: 'BOM Components', sql: "SELECT COUNT(*) FROM bom_components WHERE finished_product_id::text LIKE '22222222%'" }
    ];

    for (const query of verifyQueries) {
      const res = await client.query(query.sql);
      console.log(`  ✓ ${query.name}: ${res.rows[0].count}`);
    }

    console.log('\n✅ All test data ready for E2E tests!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

insertTestData();
