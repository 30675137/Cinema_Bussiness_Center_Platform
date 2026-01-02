/**
 * @spec T004-lark-project-management
 * 自动检查字段并执行 O006 Sprint 导入
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { config as dotenvConfig } from 'dotenv';

// 加载环境变量
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
dotenvConfig({ path: envPath });

import { LarkClient } from '../src/lark/client.js';
import { loadConfig } from '../src/config/config-manager.js';

const REQUIRED_FIELDS = ['标题', '优先级', '状态', '规格ID', '标签', '进度', '预计工时', '备注'];

async function checkFields(): Promise<{ missingFields: string[], hasData: boolean }> {
  console.log(chalk.yellow('🔍 检查飞书表格字段...'));

  try {
    const config = await loadConfig();
    const client = new LarkClient();

    // 尝试搜索记录来推断字段
    const result = await client.searchRecords(
      config.baseAppToken!,
      config.tableIds!.tasks,
      {
        filter: { conjunction: 'and', conditions: [] },
        automatic_fields: true,
      }
    );

    if (result.items.length === 0) {
      console.log(chalk.yellow('⚠️  表格中暂无记录，无法自动检测字段'));
      return { missingFields: REQUIRED_FIELDS, hasData: false };
    }

    const existingFields = Object.keys(result.items[0].fields);
    const missingFields = REQUIRED_FIELDS.filter(f => !existingFields.includes(f));

    return { missingFields, hasData: true };
  } catch (error) {
    console.log(chalk.red('❌ 检查字段失败'));
    throw error;
  }
}

async function main() {
  console.log(chalk.bold.blue('\n🚀 O006 Sprint 自动导入工具\n'));

  try {
    // 步骤 1: 检查字段
    const { missingFields, hasData } = await checkFields();

    if (!hasData) {
      console.log(chalk.yellow('\n📋 表格中没有数据，无法自动检测字段状态'));
      console.log(chalk.gray('   建议：先手动在飞书表格中创建一条测试记录'));
      console.log(chalk.gray('   然后重新运行此脚本\n'));

      console.log(chalk.cyan('📝 需要的字段清单：'));
      REQUIRED_FIELDS.forEach((field, i) => {
        console.log(chalk.gray(`   ${i + 1}. ${field}`));
      });
      console.log();

      console.log(chalk.blue('🔗 飞书表格链接：'));
      console.log(chalk.blue('   https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tblucYhJLq5TJ5xA\n'));

      process.exit(1);
    }

    if (missingFields.length > 0) {
      // 有缺失字段，显示指引
      console.log(chalk.red(`❌ 检测到 ${missingFields.length} 个缺失字段：\n`));

      missingFields.forEach((field, i) => {
        console.log(chalk.yellow(`   ${i + 1}. ${field}`));
      });
      console.log();

      console.log(chalk.bold.cyan('📝 请按以下步骤添加缺失字段：\n'));

      console.log(chalk.white('1. 打开飞书表格（自动复制到剪贴板）'));
      console.log(chalk.blue('   https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tblucYhJLq5TJ5xA\n'));

      console.log(chalk.white('2. 添加缺失字段：'));
      missingFields.forEach((field) => {
        const fieldInfo: Record<string, string> = {
          '规格ID': '文本类型',
          '预计工时': '数字类型',
          '标签': '多选类型（选项：Frontend, Backend, Test, Docs, Design, Infra）',
          '进度': '数字类型',
          '备注': '文本类型',
        };
        console.log(chalk.gray(`   • ${field}: ${fieldInfo[field] || '未知类型'}`));
      });
      console.log();

      console.log(chalk.white('3. 添加完成后，重新运行此脚本：'));
      console.log(chalk.gray('   npx tsx scripts/auto-import-with-check.ts\n'));

      console.log(chalk.yellow('💡 提示：字段名称必须完全一致（包括中文字符）\n'));

      process.exit(1);
    }

    // 步骤 2: 字段完备，开始导入
    console.log(chalk.green('✅ 所有必需字段已存在！\n'));
    console.log(chalk.cyan('🚀 开始执行 O006 Sprint 批量导入...\n'));

    // 切换到项目根目录
    const projectRoot = path.resolve(__dirname, '..');
    process.chdir(projectRoot);

    // 执行导入脚本
    try {
      execSync('npx tsx scripts/import-o006-tasks.ts', {
        stdio: 'inherit',
        cwd: projectRoot,
      });

      console.log(chalk.bold.green('\n✅ Sprint 导入完成！\n'));

      console.log(chalk.cyan('📊 后续操作：\n'));
      console.log(chalk.gray('   # 查看所有 Sprint 统计'));
      console.log(chalk.white('   ./scripts/manage-sprints.sh stats\n'));

      console.log(chalk.gray('   # 查看 Sprint 1 任务'));
      console.log(chalk.white('   ./scripts/manage-sprints.sh list 1\n'));

      console.log(chalk.gray('   # 启动 Sprint 1'));
      console.log(chalk.white('   ./scripts/manage-sprints.sh start 1\n'));

    } catch (error: any) {
      console.log(chalk.red('\n❌ 导入过程中出现错误\n'));

      if (error.message?.includes('FieldNameNotFound')) {
        console.log(chalk.yellow('⚠️  仍然检测到 FieldNameNotFound 错误'));
        console.log(chalk.gray('   可能原因：'));
        console.log(chalk.gray('   1. 字段名称不完全匹配（检查中文字符）'));
        console.log(chalk.gray('   2. 字段类型不正确'));
        console.log(chalk.gray('   3. 缓存问题（刷新飞书表格页面）\n'));
      }

      throw error;
    }

  } catch (error: any) {
    console.error(chalk.red('\n❌ 执行失败:'), error.message || error);
    process.exit(1);
  }
}

main();
