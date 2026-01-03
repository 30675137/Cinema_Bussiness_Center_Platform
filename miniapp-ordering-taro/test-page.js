/**
 * 页面自动测试脚本
 * 使用 Playwright 进行测试
 */

const { chromium } = require('playwright');

async function testPage() {
  console.log('🚀 启动浏览器测试...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const issues = [];
  const url = 'http://localhost:10089/';
  
  // 监听控制台错误
  page.on('console', msg => {
    if (msg.type() === 'error') {
      issues.push({
        type: 'Console Error',
        severity: 'high',
        message: msg.text(),
        location: msg.location()
      });
    }
  });
  
  // 监听网络错误
  page.on('requestfailed', request => {
    issues.push({
      type: 'Network Error',
      severity: 'high',
      message: `Failed to load: ${request.url()}`,
      error: request.failure().errorText
    });
  });
  
  // 监听页面错误
  page.on('pageerror', error => {
    issues.push({
      type: 'Page Error',
      severity: 'critical',
      message: error.message,
      stack: error.stack
    });
  });
  
  try {
    console.log(`📍 正在访问: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // 等待页面渲染
    await page.waitForTimeout(3000);
    
    // 检查页面标题
    const title = await page.title();
    console.log(`📄 页面标题: ${title}`);
    
    // 检查根元素
    const appRoot = await page.$('#app');
    if (!appRoot) {
      issues.push({
        type: 'DOM Error',
        severity: 'critical',
        message: '#app 根元素不存在'
      });
    } else {
      const appHTML = await appRoot.innerHTML();
      console.log(`📦 #app 内容长度: ${appHTML.length} 字符`);
      
      if (appHTML.trim().length === 0) {
        issues.push({
          type: 'DOM Error',
          severity: 'critical',
          message: '#app 根元素为空，React 未正常挂载'
        });
      }
    }
    
    // 检查是否有预期的组件
    const categoryTabs = await page.$('.CategoryTabs, [class*="CategoryTabs"]');
    const productList = await page.$('.ProductList, [class*="ProductList"]');
    
    console.log(`🔍 分类导航: ${categoryTabs ? '✅ 存在' : '❌ 不存在'}`);
    console.log(`🔍 商品列表: ${productList ? '✅ 存在' : '❌ 不存在'}`);
    
    if (!categoryTabs) {
      issues.push({
        type: 'Component Missing',
        severity: 'high',
        message: 'CategoryTabs 组件未渲染'
      });
    }
    
    if (!productList) {
      issues.push({
        type: 'Component Missing',
        severity: 'high',
        message: 'ProductList 组件未渲染'
      });
    }
    
    // 截图
    await page.screenshot({ path: 'test-screenshot.png', fullPage: true });
    console.log('📸 截图已保存: test-screenshot.png\n');
    
    // 获取性能指标
    const metrics = await page.evaluate(() => {
      const paint = performance.getEntriesByType('paint');
      const navigation = performance.getEntriesByType('navigation')[0];
      
      return {
        fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        domContentLoaded: navigation?.domContentLoadedEventEnd || 0,
        loadComplete: navigation?.loadEventEnd || 0
      };
    });
    
    console.log('⚡ 性能指标:');
    console.log(`  FCP (首次内容绘制): ${Math.round(metrics.fcp)}ms`);
    console.log(`  DOM Content Loaded: ${Math.round(metrics.domContentLoaded)}ms`);
    console.log(`  Load Complete: ${Math.round(metrics.loadComplete)}ms\n`);
    
  } catch (error) {
    issues.push({
      type: 'Test Error',
      severity: 'critical',
      message: error.message,
      stack: error.stack
    });
  } finally {
    await browser.close();
  }
  
  // 生成测试报告
  console.log('=' .repeat(60));
  console.log('📊 测试报告');
  console.log('=' .repeat(60));
  
  if (issues.length === 0) {
    console.log('\n✅ 未发现问题！页面运行正常。\n');
  } else {
    console.log(`\n❌ 发现 ${issues.length} 个问题:\n`);
    
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.type}`);
      console.log(`   ${issue.message}`);
      if (issue.error) console.log(`   错误: ${issue.error}`);
      if (issue.location) console.log(`   位置: ${JSON.stringify(issue.location)}`);
      if (issue.stack) console.log(`   堆栈: ${issue.stack.split('\n')[0]}`);
      console.log('');
    });
  }
  
  console.log('=' .repeat(60));
  
  return issues;
}

testPage().catch(console.error);
