/**
 * @spec T004-lark-project-management
 * 创建Sprint记录到Sprint表
 */

import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
dotenvConfig({ path: envPath });

import { LarkClient } from '../src/lark/client.js';
import { loadConfig } from '../src/config/config-manager.js';

// Sprint数据定义
interface SprintData {
  name: string;
  description: string;
  phase: string;
  taskCount: number;
  estimatedHours: number;
}

const SPRINT_DATA: SprintData[] = [
  {
    name: 'Sprint-1',
    description: 'Phase 1: Setup & Infrastructure - 创建功能分支、验证Taro项目、启动H5开发服务器、配置active_spec.txt',
    phase: 'Phase 1',
    taskCount: 4,
    estimatedHours: 1.75,
  },
  {
    name: 'Sprint-2',
    description: 'Phase 2: Foundational - 创建类型定义(channelProduct.ts, order.ts)、样式变量、工具函数(priceCalculator.ts)、API服务、TanStack Query Hooks、Zustand购物车Store',
    phase: 'Phase 2',
    taskCount: 12,
    estimatedHours: 29,
  },
  {
    name: 'Sprint-3',
    description: 'Phase 3: User Story 1 - 商品列表页：分类筛选、商品卡片、虚拟滚动、空状态、样式适配iPhone',
    phase: 'Phase 3',
    taskCount: 3,
    estimatedHours: 9.5,
  },
  {
    name: 'Sprint-4',
    description: 'Phase 4: User Story 2 - 商品详情页：详情信息、规格选择器、数量选择器、价格计算、加入购物车',
    phase: 'Phase 4',
    taskCount: 4,
    estimatedHours: 16.5,
  },
  {
    name: 'Sprint-5',
    description: 'Phase 5: User Story 3 - 购物车抽屉：购物车列表、数量编辑、删除商品、总价计算、创建订单',
    phase: 'Phase 5',
    taskCount: 5,
    estimatedHours: 19,
  },
  {
    name: 'Sprint-6',
    description: 'Phase 6: User Story 4 - 订单列表页：订单卡片、状态筛选、分页加载、订单详情抽屉',
    phase: 'Phase 6',
    taskCount: 5,
    estimatedHours: 17.5,
  },
  {
    name: 'Sprint-7',
    description: 'Phase 7: Polish & Cross-Cutting - Loading状态、Error处理、空状态优化、性能优化、单元测试、E2E测试、文档更新',
    phase: 'Phase 7',
    taskCount: 7,
    estimatedHours: 30,
  },
];

async function createSprintRecords() {
  console.log(chalk.bold.blue('\n📋 创建Sprint记录到Sprint表\n'));

  try {
    const config = await loadConfig();
    const client = new LarkClient();
    const appToken = config.baseAppToken!;
    const tableId = config.tableIds!.sprint;

    console.log(chalk.cyan(`📊 Sprint表ID: ${tableId}\n`));

    // Step 1: 检查Sprint表字段
    console.log(chalk.cyan('🔍 Step 1: 检查Sprint表字段...\n'));
    const fields = await client.listFields(appToken, tableId);

    console.log(chalk.cyan('表格字段列表:\n'));
    fields.forEach((field: any) => {
      console.log(chalk.gray(`   - ${field.field_name} (类型: ${field.type})`));
    });
    console.log();

    // Step 2: 创建Sprint记录
    console.log(chalk.cyan('🔄 Step 2: 创建Sprint记录...\n'));

    let successCount = 0;
    let failureCount = 0;
    const failures: Array<{ sprint: string; error: string }> = [];

    for (const sprint of SPRINT_DATA) {
      try {
        await client.createRecord(
          appToken,
          tableId,
          {
            'Sprint 名称': sprint.name, // 注意：字段名有空格
            'Spring描述': sprint.description, // 注意：是"Spring"不是"Sprint"（表格中的typo）
            // 可选字段：如果表中存在这些字段，可以添加
            // '阶段': sprint.phase,
            // '任务数': sprint.taskCount,
            // '预计工时': sprint.estimatedHours,
          }
        );

        successCount++;
        console.log(chalk.green(`   ✅ 创建成功：${sprint.name}`));
        console.log(chalk.gray(`      描述：${sprint.description.substring(0, 80)}...`));

        // 速率限制：每次创建后等待300ms
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error: any) {
        failureCount++;
        failures.push({ sprint: sprint.name, error: error.message });
        console.log(chalk.red(`   ❌ 创建失败：${sprint.name} - ${error.message}`));
      }
    }

    // Step 3: 显示总结
    console.log();
    console.log(chalk.bold.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.bold.cyan('📊 创建结果总结'));
    console.log(chalk.bold.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

    console.log(chalk.green(`✅ 成功创建: ${successCount} 条Sprint记录`));
    console.log(chalk.red(`❌ 创建失败: ${failureCount} 条`));
    console.log();

    if (failures.length > 0) {
      console.log(chalk.red('失败记录：\n'));
      failures.forEach((f, index) => {
        console.log(chalk.yellow(`   ${index + 1}. ${f.sprint}`));
        console.log(chalk.gray(`      错误: ${f.error}\n`));
      });
    }

    console.log(chalk.blue('🔗 查看Sprint表：'));
    console.log(chalk.blue('   https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tbllbcahbnPvidbE\n'));

  } catch (error: any) {
    console.error(chalk.red('\n❌ 执行失败:'), error.message || error);
    console.log();
    process.exit(1);
  }
}

createSprintRecords();
