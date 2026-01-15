/**
 * Playwright 测试自动修复脚本
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 开始运行 Playwright 测试...\n');

// 测试配置
const testFile = 'products-workspace.spec.ts';
const testDir = path.join(__dirname, 'tests', 'e2e');
const testPath = path.join(testDir, testFile);

// 检查测试文件是否存在
if (!fs.existsSync(testPath)) {
  console.error(`❌ 测试文件不存在: ${testPath}`);
  process.exit(1);
}

console.log(`📝 测试文件: ${testPath}\n`);

try {
  // 运行测试
  console.log('🚀 运行测试...\n');
  const output = execSync(`npx playwright test ${testFile} --reporter=list`, {
    cwd: __dirname,
    encoding: 'utf-8',
    stdio: 'pipe',
  });

  console.log(output);
  console.log('\n✅ 所有测试通过！');
} catch (error) {
  console.error('\n❌ 测试失败！\n');

  const output = error.stdout || error.stderr || error.message;
  console.log(output);

  // 分析错误
  console.log('\n🔍 分析错误...\n');

  const issues = [];

  // 检测常见问题
  if (output.includes('Timeout') || output.includes('timeout')) {
    issues.push({
      type: 'TIMEOUT',
      message: '页面加载或元素查找超时',
      fix: '增加等待时间或检查元素选择器',
    });
  }

  if (output.includes('not visible') || output.includes('not found')) {
    issues.push({
      type: 'ELEMENT_NOT_FOUND',
      message: '元素未找到或不可见',
      fix: '检查 data-testid 是否正确添加到组件',
    });
  }

  if (output.includes('console.error') || output.includes('Error:')) {
    issues.push({
      type: 'CONSOLE_ERROR',
      message: '页面存在控制台错误',
      fix: '检查浏览器控制台的具体错误信息',
    });
  }

  if (output.includes('Connection refused') || output.includes('ECONNREFUSED')) {
    issues.push({
      type: 'SERVER_NOT_RUNNING',
      message: '开发服务器未运行',
      fix: '启动开发服务器: npm run dev',
    });
  }

  // 输出问题分析
  if (issues.length > 0) {
    console.log('📋 发现的问题:\n');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.type}]`);
      console.log(`   问题: ${issue.message}`);
      console.log(`   建议: ${issue.fix}\n`);
    });
  }

  // 尝试自动修复
  console.log('🔧 尝试自动修复...\n');

  // 修复建议
  console.log('💡 修复建议:');
  console.log('1. 确保开发服务器正在运行: cd frontend && npm run dev');
  console.log('2. 检查所有组件是否添加了 data-testid 属性');
  console.log('3. 查看浏览器控制台是否有 JavaScript 错误');
  console.log('4. 运行测试查看详细报告: npx playwright test --ui');

  console.log('\n📊 生成测试报告...');
  try {
    execSync('npx playwright show-report', {
      cwd: __dirname,
      stdio: 'inherit',
    });
  } catch (reportError) {
    console.log('报告生成失败，跳过');
  }

  process.exit(1);
}
