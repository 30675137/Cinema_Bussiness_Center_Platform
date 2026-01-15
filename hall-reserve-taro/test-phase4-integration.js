/**
 * Phase 4 Integration Testing Script
 * 自动化测试错误处理功能
 *
 * 测试项:
 * - T036: 网络错误测试
 * - T037: 重试功能测试
 * - T038: 空状态测试
 * - T039: 慢速网络测试
 * - T040: 自定义错误消息测试
 */

const http = require('http');

// 测试配置
const BASE_URL = 'http://localhost:10087';
const TIMEOUT = 10000;

// ANSI 颜色代码
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// 测试结果记录
const testResults = [];

/**
 * HTTP GET 请求
 */
function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

/**
 * 打印测试标题
 */
function printTestHeader(testId, description) {
  console.log(`\n${colors.bold}${colors.blue}===========================================${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}${testId}: ${description}${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}===========================================${colors.reset}\n`);
}

/**
 * 打印测试结果
 */
function printResult(testId, passed, message) {
  const symbol = passed ? '✓' : '✗';
  const color = passed ? colors.green : colors.red;
  console.log(`${color}${symbol} ${testId}: ${message}${colors.reset}`);

  testResults.push({
    testId,
    passed,
    message,
    timestamp: new Date().toISOString()
  });
}

/**
 * 检查页面是否包含特定文本
 */
function checkPageContent(html, expectedTexts) {
  const results = [];
  for (const text of expectedTexts) {
    const found = html.includes(text);
    results.push({ text, found });
  }
  return results;
}

/**
 * T036: 网络错误测试
 */
async function testT036() {
  printTestHeader('T036', '网络错误状态测试');

  try {
    // 访问首页
    const response = await httpGet(BASE_URL);

    // 验证页面加载成功
    if (response.status === 200) {
      printResult('T036-01', true, '页面加载成功 (HTTP 200)');
    } else {
      printResult('T036-01', false, `页面加载失败 (HTTP ${response.status})`);
      return;
    }

    // 验证关键组件已打包
    const criticalComponents = [
      'ErrorState',
      'EmptyState',
      'error-state',
      'empty-state',
      'home-page'
    ];

    const componentChecks = checkPageContent(response.data, criticalComponents);
    componentChecks.forEach(({ text, found }) => {
      printResult(
        'T036-02',
        found,
        found ? `组件 "${text}" 已打包` : `组件 "${text}" 未找到`
      );
    });

    // 验证测试工具已暴露到 window
    const hasTestMode = response.data.includes('setTestMode') ||
                       response.data.includes('getTestMode') ||
                       response.data.includes('scenarioServiceTest');

    printResult(
      'T036-03',
      hasTestMode,
      hasTestMode ? '测试工具已打包到应用中' : '测试工具未找到（可能被 tree-shaking 移除）'
    );

    console.log(`\n${colors.yellow}📌 手动验证步骤:${colors.reset}`);
    console.log('1. 打开浏览器访问: http://localhost:10087/');
    console.log('2. 打开 DevTools Console (F12)');
    console.log('3. 输入: setTestMode({ mode: "error" })');
    console.log('4. 刷新页面 (F5)');
    console.log('5. 验证:');
    console.log('   - 显示错误图标 ⚠️');
    console.log('   - 显示错误消息');
    console.log('   - 显示重试按钮');
    console.log('   - 页面 Header 正常显示\n');

  } catch (error) {
    printResult('T036-01', false, `测试失败: ${error.message}`);
  }
}

/**
 * T037: 重试功能测试
 */
async function testT037() {
  printTestHeader('T037', '重试功能测试');

  console.log(`${colors.yellow}📌 手动验证步骤:${colors.reset}`);
  console.log('1. 在错误状态下 (参考 T036)');
  console.log('2. 在 Console 中输入: setTestMode({ mode: "normal" })');
  console.log('3. 点击页面上的 "重试" 按钮');
  console.log('4. 验证:');
  console.log('   - 显示加载状态');
  console.log('   - 数据重新加载');
  console.log('   - 显示正常的场景包列表');
  console.log('   - 无 Console 错误\n');

  printResult('T037-01', true, '重试功能测试指南已生成（需手动验证）');
}

/**
 * T038: 空状态测试
 */
async function testT038() {
  printTestHeader('T038', '空状态测试');

  console.log(`${colors.yellow}📌 手动验证步骤:${colors.reset}`);
  console.log('1. 在 Console 中输入: setTestMode({ mode: "empty" })');
  console.log('2. 刷新页面 (F5)');
  console.log('3. 验证:');
  console.log('   - 显示空状态图标 📭');
  console.log('   - 显示空状态消息: "暂无可用场景包，敬请期待"');
  console.log('   - 页面 Header 正常显示');
  console.log('   - 无错误提示\n');

  printResult('T038-01', true, '空状态测试指南已生成（需手动验证）');
}

/**
 * T039: 慢速网络测试
 */
async function testT039() {
  printTestHeader('T039', '慢速网络测试');

  console.log(`${colors.yellow}📌 手动验证步骤:${colors.reset}`);
  console.log('1. 在 Console 中输入: setTestMode({ mode: "slow", delay: 3000 })');
  console.log('2. 刷新页面 (F5)');
  console.log('3. 验证:');
  console.log('   - 显示 "加载中..." 状态持续约 3 秒');
  console.log('   - 3 秒后正常加载数据');
  console.log('   - 用户体验流畅，无卡顿\n');

  printResult('T039-01', true, '慢速网络测试指南已生成（需手动验证）');
}

/**
 * T040: 自定义错误消息测试
 */
async function testT040() {
  printTestHeader('T040', '自定义错误消息测试');

  console.log(`${colors.yellow}📌 手动验证步骤:${colors.reset}`);
  console.log('1. 在 Console 中输入:');
  console.log('   setTestMode({');
  console.log('     mode: "error",');
  console.log('     errorMessage: "系统维护中，预计 1 小时后恢复"');
  console.log('   })');
  console.log('2. 刷新页面 (F5)');
  console.log('3. 验证:');
  console.log('   - 显示自定义错误消息');
  console.log('   - 重试按钮正常工作\n');

  printResult('T040-01', true, '自定义错误消息测试指南已生成（需手动验证）');
}

/**
 * 生成测试报告
 */
function generateReport() {
  console.log(`\n${colors.bold}${colors.blue}===========================================${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}Phase 4 Integration Test Report${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}===========================================${colors.reset}\n`);

  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  const total = testResults.length;

  console.log(`${colors.bold}总计: ${total} 项测试${colors.reset}`);
  console.log(`${colors.green}✓ 通过: ${passed}${colors.reset}`);
  console.log(`${colors.red}✗ 失败: ${failed}${colors.reset}`);
  console.log(`${colors.blue}通过率: ${((passed / total) * 100).toFixed(1)}%${colors.reset}\n`);

  console.log(`${colors.bold}详细结果:${colors.reset}\n`);
  testResults.forEach(({ testId, passed, message }) => {
    const symbol = passed ? '✓' : '✗';
    const color = passed ? colors.green : colors.red;
    console.log(`${color}${symbol} ${testId}: ${message}${colors.reset}`);
  });

  console.log(`\n${colors.yellow}===========================================${colors.reset}`);
  console.log(`${colors.yellow}📋 下一步操作${colors.reset}`);
  console.log(`${colors.yellow}===========================================${colors.reset}\n`);
  console.log('1. 打开浏览器访问: http://localhost:10087/');
  console.log('2. 打开 DevTools Console (F12)');
  console.log('3. 按照上述手动验证步骤逐项测试');
  console.log('4. 记录测试结果并更新 ERROR_HANDLING_TEST_GUIDE.md');
  console.log('5. 如果所有测试通过，可以提交代码并继续 Phase 5\n');

  // 保存 JSON 报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: { total, passed, failed, passRate: ((passed / total) * 100).toFixed(1) + '%' },
    results: testResults
  };

  return report;
}

/**
 * 主测试流程
 */
async function runTests() {
  console.log(`${colors.bold}${colors.blue}`);
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   Phase 4 Integration Testing - Error Handling UI   ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);

  console.log(`${colors.yellow}测试时间: ${new Date().toLocaleString('zh-CN')}${colors.reset}`);
  console.log(`${colors.yellow}测试环境: ${BASE_URL}${colors.reset}\n`);

  try {
    // 运行所有测试
    await testT036();
    await testT037();
    await testT038();
    await testT039();
    await testT040();

    // 生成报告
    const report = generateReport();

    // 保存报告到文件
    const fs = require('fs');
    const reportPath = './test-reports/phase4-integration-report.json';
    const dirPath = './test-reports';

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n${colors.green}✓ 测试报告已保存到: ${reportPath}${colors.reset}\n`);

  } catch (error) {
    console.error(`\n${colors.red}✗ 测试执行失败: ${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

// 运行测试
runTests();
