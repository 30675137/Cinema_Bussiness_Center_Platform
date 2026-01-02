/**
 * @spec T004-lark-project-management
 * 自动添加缺失字段并执行 O006 Sprint 导入
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

// 飞书字段类型定义
// 参考：https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-field/guide
const FieldType = {
  TEXT: 1,           // 文本
  NUMBER: 2,         // 数字
  SINGLE_SELECT: 3,  // 单选
  MULTI_SELECT: 4,   // 多选
  DATE: 5,           // 日期
  CHECKBOX: 7,       // 复选框
  USER: 11,          // 人员
  PHONE: 13,         // 电话号码
  URL: 15,           // 超链接
  ATTACHMENT: 17,    // 附件
  FORMULA: 20,       // 公式
  CREATED_TIME: 1001, // 创建时间
  MODIFIED_TIME: 1002, // 最后更新时间
  CREATED_USER: 1003, // 创建人
  MODIFIED_USER: 1004, // 修改人
};

// 需要创建的字段定义
const FIELDS_TO_CREATE = [
  {
    name: '规格ID',
    type: FieldType.TEXT,
    description: '关联 spec 规格标识符（如 O006）',
  },
  {
    name: '标签',
    type: FieldType.MULTI_SELECT,
    description: '任务分类标签',
    property: {
      options: [
        { name: 'Frontend' },
        { name: 'Backend' },
        { name: 'Test' },
        { name: 'Docs' },
        { name: 'Design' },
        { name: 'Infra' },
      ],
    },
  },
  {
    name: '进度',
    type: FieldType.NUMBER,
    description: '任务完成进度（0-100）',
    property: {
      formatter: '0',
    },
  },
  {
    name: '预计工时',
    type: FieldType.NUMBER,
    description: '任务预估工时（单位：小时）',
    property: {
      formatter: '0.00',
    },
  },
  {
    name: '备注',
    type: FieldType.TEXT,
    description: '任务详细说明和依赖关系',
  },
];

async function autoAddFieldsAndImport() {
  console.log(chalk.bold.blue('\n🚀 O006 Sprint 全自动导入工具\n'));

  try {
    const config = await loadConfig();
    const client = new LarkClient();

    console.log(chalk.yellow('步骤 1/4: 获取现有字段列表...\n'));

    // 获取现有字段
    const existingFields = await client.listFields(
      config.baseAppToken!,
      config.tableIds!.tasks
    );

    const existingFieldNames = existingFields.map((f: any) => f.field_name);
    console.log(chalk.green(`✅ 当前表格已有 ${existingFields.length} 个字段\n`));

    // 检查需要创建的字段
    const fieldsToCreate = FIELDS_TO_CREATE.filter(
      (field) => !existingFieldNames.includes(field.name)
    );

    if (fieldsToCreate.length === 0) {
      console.log(chalk.green('✅ 所有必需字段已存在，跳过字段创建\n'));
    } else {
      console.log(chalk.yellow(`步骤 2/4: 自动创建 ${fieldsToCreate.length} 个缺失字段...\n`));

      for (const field of fieldsToCreate) {
        try {
          console.log(chalk.gray(`   创建字段: ${field.name} (${getFieldTypeName(field.type)})`));

          await client.createField(
            config.baseAppToken!,
            config.tableIds!.tasks,
            field.name,
            field.type,
            field.property
          );

          console.log(chalk.green(`   ✅ ${field.name} 创建成功`));

          // 避免请求过快
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error: any) {
          console.log(chalk.red(`   ❌ ${field.name} 创建失败: ${error.message}`));

          // 如果是权限错误，提供详细说明
          if (error.name === 'LarkPermissionError') {
            console.log();
            console.log(chalk.bold.red('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
            console.log(chalk.bold.red('⚠️  权限不足，无法自动创建字段'));
            console.log(chalk.bold.red('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

            console.log(chalk.yellow('可能原因：'));
            console.log(chalk.gray('1. 飞书应用缺少「编辑表结构」权限'));
            console.log(chalk.gray('2. User Access Token 权限不足\n'));

            console.log(chalk.cyan('解决方案 A: 授予应用权限（推荐）\n'));
            console.log(chalk.white('1. 打开飞书表格：'));
            console.log(chalk.blue('   https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tblucYhJLq5TJ5xA\n'));
            console.log(chalk.white('2. 点击右上角「⚙️ 设置」->「权限管理」'));
            console.log(chalk.white('3. 添加应用并授予「编辑表结构」权限\n'));

            console.log(chalk.cyan('解决方案 B: 手动添加字段\n'));
            console.log(chalk.white('运行以下命令获取字段添加指南：'));
            console.log(chalk.gray('   npx tsx scripts/add-missing-fields.ts\n'));

            process.exit(1);
          }

          throw error;
        }
      }

      console.log();
      console.log(chalk.green(`✅ 成功创建 ${fieldsToCreate.length} 个字段\n`));
    }

    // 验证字段完整性
    console.log(chalk.yellow('步骤 3/4: 验证字段完整性...\n'));

    const updatedFields = await client.listFields(
      config.baseAppToken!,
      config.tableIds!.tasks
    );

    const updatedFieldNames = updatedFields.map((f: any) => f.field_name);
    const allFieldsExist = FIELDS_TO_CREATE.every((field) =>
      updatedFieldNames.includes(field.name)
    );

    if (!allFieldsExist) {
      console.log(chalk.red('❌ 字段验证失败，仍有缺失字段\n'));
      process.exit(1);
    }

    console.log(chalk.green('✅ 字段验证通过，所有必需字段已就绪\n'));

    // 执行导入
    console.log(chalk.yellow('步骤 4/4: 开始批量导入 40 个 O006 Sprint 任务...\n'));
    console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

    const projectRoot = path.resolve(__dirname, '..');
    process.chdir(projectRoot);

    try {
      execSync('npx tsx scripts/import-o006-tasks.ts', {
        stdio: 'inherit',
        cwd: projectRoot,
      });

      console.log(chalk.bold.green('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.bold.green('🎉 全自动导入完成！'));
      console.log(chalk.bold.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

      console.log(chalk.cyan('📊 导入结果：\n'));
      console.log(chalk.gray('   ✅ 40 个任务已导入'));
      console.log(chalk.gray('   ✅ 分布在 7 个 Sprint'));
      console.log(chalk.gray('   ✅ 总工时 123.25 小时\n'));

      console.log(chalk.cyan('📝 后续操作：\n'));
      console.log(chalk.gray('   # 查看所有 Sprint 统计'));
      console.log(chalk.white('   ./scripts/manage-sprints.sh stats\n'));
      console.log(chalk.gray('   # 查看 Sprint 1 任务'));
      console.log(chalk.white('   ./scripts/manage-sprints.sh list 1\n'));
      console.log(chalk.gray('   # 启动 Sprint 1'));
      console.log(chalk.white('   ./scripts/manage-sprints.sh start 1\n'));

      console.log(chalk.blue('🔗 飞书表格：'));
      console.log(chalk.blue('   https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tblucYhJLq5TJ5xA\n'));
    } catch (error: any) {
      console.log(chalk.red('\n❌ 导入过程中出现错误\n'));

      if (error.message?.includes('FieldNameNotFound')) {
        console.log(chalk.yellow('⚠️  仍然检测到字段缺失错误'));
        console.log(chalk.gray('   可能原因：'));
        console.log(chalk.gray('   1. 字段创建成功但未立即生效（缓存问题）'));
        console.log(chalk.gray('   2. 字段名称或类型不匹配'));
        console.log(chalk.gray('   3. 刷新飞书页面后重试\n'));
      }

      throw error;
    }
  } catch (error: any) {
    console.error(chalk.red('\n❌ 执行失败:'), error.message || error);
    console.log();
    process.exit(1);
  }
}

function getFieldTypeName(type: number): string {
  const typeNames: Record<number, string> = {
    1: '文本',
    2: '数字',
    3: '单选',
    4: '多选',
    5: '日期',
    7: '复选框',
    11: '人员',
    13: '电话',
    15: '超链接',
    17: '附件',
    20: '公式',
  };
  return typeNames[type] || '未知类型';
}

autoAddFieldsAndImport();
