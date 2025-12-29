#!/usr/bin/env node
/**
 * @spec P005-bom-inventory-deduction
 * Automated Database Setup Script
 *
 * Purpose: Automatically execute SQL scripts via Supabase REST API
 * Usage: node scripts/auto-setup-database.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Supabase Configuration
const SUPABASE_URL = 'https://fxhgyxceqrmnpezluaht.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4aGd5eGNlcXJtbnBlemx1YWh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDcyNTc5MCwiZXhwIjoyMDUwMzAxNzkwfQ.Dqfr6mKjzVLAV3bOBSo0T7f6vJWDXm3aCd4-9RJBRdE';

// SQL Scripts to execute
const scripts = [
  {
    name: 'V054 - Create Tables',
    file: 'backend/src/main/resources/db/migration/V054__p005_manual_setup.sql'
  },
  {
    name: 'Test Data Setup',
    file: 'tests/e2e/setup-test-data-direct.sql'
  }
];

/**
 * Execute SQL via Supabase PostgREST API
 * Note: Supabase REST API doesn't support direct SQL execution
 * We'll use a workaround: execute via RPC function
 */
async function executeSQLViaSupabase(sql, description) {
  console.log(`\n📊 执行: ${description}...`);

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`   发现 ${statements.length} 条 SQL 语句`);

  // Note: This is a simplified approach
  // For production, you'd want to use @supabase/supabase-js with proper connection
  console.log(`   ⚠️  Supabase REST API 不支持直接 SQL 执行`);
  console.log(`   推荐方式: 使用 Supabase SQL Editor 或 PostgreSQL 客户端\n`);

  return false;
}

/**
 * Alternative: Use PostgreSQL client (if available)
 */
async function executeSQLViaPostgres(sql, description) {
  const { execSync } = require('child_process');

  console.log(`\n📊 执行: ${description}...`);

  // Save SQL to temp file
  const tempFile = `/tmp/p005-setup-${Date.now()}.sql`;
  fs.writeFileSync(tempFile, sql);

  try {
    const cmd = `PGPASSWORD='Pgsql.2024' psql -h aws-0-ap-southeast-1.pooler.supabase.com -p 6543 -U postgres.fxhgyxceqrmnpezluaht -d postgres -f ${tempFile}`;

    const output = execSync(cmd, { encoding: 'utf-8' });
    console.log('✅ 执行成功!');
    console.log(output);

    // Clean up
    fs.unlinkSync(tempFile);
    return true;
  } catch (error) {
    console.error('❌ 执行失败:', error.message);

    // Check if psql is not installed
    if (error.message.includes('command not found')) {
      console.log('\n⚠️  psql 未安装. 请使用以下方式之一:');
      console.log('   1. 安装 PostgreSQL: brew install postgresql');
      console.log('   2. 使用 Supabase Dashboard SQL Editor (推荐)');
      console.log('   3. 使用下面提供的 Node.js + pg 库方案\n');
    }

    fs.unlinkSync(tempFile);
    return false;
  }
}

/**
 * Alternative: Use node-postgres library
 */
async function executeSQLViaNodePg(sql, description) {
  try {
    const { Client } = require('pg');

    const client = new Client({
      host: 'aws-0-ap-southeast-1.pooler.supabase.com',
      port: 6543,
      user: 'postgres.fxhgyxceqrmnpezluaht',
      password: 'Pgsql.2024',
      database: 'postgres',
      ssl: { rejectUnauthorized: false }
    });

    console.log(`\n📊 执行: ${description}...`);
    console.log('   连接数据库...');

    await client.connect();
    console.log('   ✅ 连接成功');

    // Execute SQL
    const result = await client.query(sql);
    console.log('   ✅ SQL 执行成功!');

    if (result.rows && result.rows.length > 0) {
      console.log('   📊 结果:');
      console.table(result.rows);
    }

    await client.end();
    return true;

  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('\n⚠️  pg 库未安装. 正在安装...');
      const { execSync } = require('child_process');
      try {
        execSync('npm install pg', { stdio: 'inherit' });
        console.log('✅ pg 库安装成功! 请重新运行此脚本.');
        process.exit(0);
      } catch (installError) {
        console.error('❌ 安装失败:', installError.message);
        return false;
      }
    } else {
      console.error('❌ 执行失败:', error.message);
      return false;
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 P005 数据库自动配置工具');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const projectRoot = path.resolve(__dirname, '..');

  for (const script of scripts) {
    const sqlFile = path.join(projectRoot, script.file);

    if (!fs.existsSync(sqlFile)) {
      console.error(`❌ 文件不存在: ${sqlFile}`);
      continue;
    }

    const sql = fs.readFileSync(sqlFile, 'utf-8');

    // Try different methods in order of preference
    let success = false;

    // Method 1: Use node-postgres (best for automation)
    try {
      success = await executeSQLViaNodePg(sql, script.name);
      if (success) continue;
    } catch (error) {
      // Continue to next method
    }

    // Method 2: Use psql command (if installed)
    try {
      success = await executeSQLViaPostgres(sql, script.name);
      if (success) continue;
    } catch (error) {
      // Continue to fallback
    }

    // Method 3: Show manual instructions
    if (!success) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 手动执行方式:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('1️⃣ 打开 Supabase Dashboard:');
      console.log('   https://supabase.com/dashboard/project/fxhgyxceqrmnpezluaht/editor\n');
      console.log('2️⃣ 点击 "SQL Editor" → "New query"\n');
      console.log('3️⃣ 复制以下 SQL 内容:\n');
      console.log(`📄 文件路径: ${script.file}\n`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(sql.substring(0, 500) + '...\n');
      console.log('4️⃣ 粘贴到 SQL Editor 并点击 "RUN"\n');
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 配置流程完成!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📋 后续步骤:');
  console.log('   1. 重启后端服务');
  console.log('   2. 运行 E2E 测试');
  console.log('   3. 查看测试报告\n');
}

// Run
main().catch(console.error);
