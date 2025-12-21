/**
 * Chrome DevTools 全量测试脚本
 * 测试场景包首页的所有功能
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// 测试配置
const TEST_URL = 'http://localhost:10087/';
const SCREENSHOT_DIR = path.join(__dirname, 'test-screenshots');
const REPORT_FILE = path.join(__dirname, 'test-report.json');

// 创建截图目录
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// 测试结果收集
const testResults = {
  timestamp: new Date().toISOString(),
  url: TEST_URL,
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

// 辅助函数：记录测试结果
function recordTest(name, status, details = {}) {
  const result = {
    name,
    status, // 'passed', 'failed', 'warning'
    timestamp: new Date().toISOString(),
    ...details
  };

  testResults.tests.push(result);
  testResults.summary.total++;

  if (status === 'passed') {
    testResults.summary.passed++;
    console.log(`✅ ${name}`);
  } else if (status === 'failed') {
    testResults.summary.failed++;
    console.error(`❌ ${name}`);
    if (details.error) console.error(`   Error: ${details.error}`);
  } else if (status === 'warning') {
    testResults.summary.warnings++;
    console.warn(`⚠️  ${name}`);
    if (details.message) console.warn(`   Warning: ${details.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting Chrome DevTools Testing...\n');
  console.log(`Target URL: ${TEST_URL}\n`);

  let browser;
  let page;

  try {
    // 启动浏览器
    browser = await puppeteer.launch({
      headless: false, // 可视化模式，方便观察
      devtools: true,  // 自动打开 DevTools
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    page = await browser.newPage();

    // 设置视口大小
    await page.setViewport({ width: 375, height: 667 }); // iPhone 6/7/8 尺寸

    console.log('📱 Browser launched with viewport: 375x667\n');

    // ==================== 测试 1: 页面加载 ====================
    console.log('--- Test 1: Page Load Performance ---');

    const consoleMessages = [];
    const consoleErrors = [];
    const consoleWarnings = [];

    // 监听 console 消息
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push({ type: msg.type(), text });

      if (msg.type() === 'error') {
        consoleErrors.push(text);
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(text);
      }
    });

    // 监听页面错误
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // 辅助函数：延迟
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // 加载页面并测量性能
    const navigationStart = Date.now();
    await page.goto(TEST_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    const navigationEnd = Date.now();
    const loadTime = navigationEnd - navigationStart;

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-initial-load.png'),
      fullPage: true
    });

    recordTest('Page Load Time', loadTime < 5000 ? 'passed' : 'warning', {
      loadTime: `${loadTime}ms`,
      expected: '< 5000ms'
    });

    // ==================== 测试 2: Console 错误检查 ====================
    console.log('\n--- Test 2: Console Messages ---');

    await delay(2000); // 等待 2 秒让所有 console 消息输出

    if (pageErrors.length > 0) {
      recordTest('Page Errors', 'failed', {
        error: `Found ${pageErrors.length} page errors`,
        errors: pageErrors
      });
    } else {
      recordTest('Page Errors', 'passed', {
        message: 'No page errors found'
      });
    }

    if (consoleErrors.length > 0) {
      recordTest('Console Errors', 'failed', {
        error: `Found ${consoleErrors.length} console errors`,
        errors: consoleErrors
      });
    } else {
      recordTest('Console Errors', 'passed', {
        message: 'No console errors found'
      });
    }

    if (consoleWarnings.length > 0) {
      recordTest('Console Warnings', 'warning', {
        message: `Found ${consoleWarnings.length} console warnings`,
        warnings: consoleWarnings.slice(0, 5) // 只显示前5个
      });
    } else {
      recordTest('Console Warnings', 'passed', {
        message: 'No console warnings found'
      });
    }

    // ==================== 测试 3: DOM 元素检查 ====================
    console.log('\n--- Test 3: DOM Elements ---');

    // 检查首页标题
    const heroTitle = await page.$eval('.hero .title', el => el.textContent).catch(() => null);
    recordTest('Hero Title Exists', heroTitle ? 'passed' : 'failed', {
      text: heroTitle || 'Not found'
    });

    // 检查场景包列表
    const scenarioCards = await page.$$('.scenario-card');
    recordTest('Scenario Cards Count', scenarioCards.length === 3 ? 'passed' : 'failed', {
      expected: 3,
      actual: scenarioCards.length
    });

    // 检查加载状态
    const loadingContainer = await page.$('.loading-container');
    recordTest('Loading State Hidden', !loadingContainer ? 'passed' : 'warning', {
      message: loadingContainer ? 'Loading container still visible' : 'Loading completed'
    });

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-dom-elements.png'),
      fullPage: true
    });

    // ==================== 测试 4: Network 请求 ====================
    console.log('\n--- Test 4: Network Requests ---');

    const networkRequests = [];
    const failedRequests = [];

    page.on('response', response => {
      const request = response.request();
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        status: response.status(),
        contentType: response.headers()['content-type']
      });

      if (response.status() >= 400) {
        failedRequests.push({
          url: request.url(),
          status: response.status()
        });
      }
    });

    // 刷新页面以捕获网络请求
    await page.reload({ waitUntil: 'networkidle2' });
    await delay(2000);

    recordTest('Failed Network Requests', failedRequests.length === 0 ? 'passed' : 'failed', {
      count: failedRequests.length,
      requests: failedRequests
    });

    // ==================== 测试 5: 图片加载 ====================
    console.log('\n--- Test 5: Image Loading ---');

    const images = await page.$$eval('.scenario-card .image', imgs =>
      imgs.map(img => ({
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
        error: img.classList.contains('error')
      }))
    );

    const loadedImages = images.filter(img => img.complete && img.naturalWidth > 0);
    const failedImages = images.filter(img => img.error || (img.complete && img.naturalWidth === 0));

    recordTest('Images Loaded', loadedImages.length === images.length ? 'passed' : 'warning', {
      total: images.length,
      loaded: loadedImages.length,
      failed: failedImages.length
    });

    if (failedImages.length > 0) {
      recordTest('Failed Images', 'warning', {
        count: failedImages.length,
        images: failedImages.map(img => img.src)
      });
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-images-loaded.png'),
      fullPage: true
    });

    // ==================== 测试 6: 图片懒加载 ====================
    console.log('\n--- Test 6: Image Lazy Loading ---');

    // 检查 lazyLoad 属性
    const lazyLoadEnabled = await page.$$eval('.scenario-card .image', imgs =>
      imgs.every(img => img.hasAttribute('lazyload') || img.loading === 'lazy')
    );

    recordTest('Lazy Load Enabled', lazyLoadEnabled ? 'passed' : 'warning', {
      message: lazyLoadEnabled ? 'All images have lazy loading' : 'Some images missing lazy load attribute'
    });

    // ==================== 测试 7: 评分显示 ====================
    console.log('\n--- Test 7: Rating Display ---');

    const ratingBadges = await page.$$('.rating-badge');
    const scenarioData = await page.evaluate(() => {
      return window.__SCENARIO_DATA__ || [];
    });

    recordTest('Rating Badges Count', ratingBadges.length > 0 ? 'passed' : 'warning', {
      count: ratingBadges.length,
      message: ratingBadges.length === 0 ? 'No rating badges found (check if ratings are null)' : 'Rating badges displayed'
    });

    // ==================== 测试 8: TanStack Query DevTools ====================
    console.log('\n--- Test 8: TanStack Query Cache ---');

    // 检查 React Query 是否已初始化
    const queryClientExists = await page.evaluate(() => {
      return window.__REACT_QUERY_DEVTOOLS__ !== undefined ||
             document.querySelector('[data-reactroot]') !== null;
    });

    recordTest('React Query Initialized', queryClientExists ? 'passed' : 'warning', {
      message: queryClientExists ? 'React Query is active' : 'Cannot detect React Query'
    });

    // ==================== 测试 9: 缓存策略验证 ====================
    console.log('\n--- Test 9: Cache Strategy ---');

    const firstLoadRequests = networkRequests.length;

    // 等待 2 秒后刷新，验证缓存
    await delay(2000);
    const beforeReload = networkRequests.length;

    await page.reload({ waitUntil: 'networkidle2' });
    await delay(2000);

    const afterReload = networkRequests.length;
    const newRequests = afterReload - beforeReload;

    recordTest('Cache Strategy', newRequests < firstLoadRequests ? 'passed' : 'warning', {
      firstLoad: firstLoadRequests,
      secondLoad: newRequests,
      message: newRequests < firstLoadRequests ? 'Caching is working' : 'Possible cache miss'
    });

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '04-after-reload.png'),
      fullPage: true
    });

    // ==================== 测试 10: 响应式布局 ====================
    console.log('\n--- Test 10: Responsive Layout ---');

    // 测试不同视口大小
    const viewports = [
      { name: 'iPhone 6/7/8', width: 375, height: 667 },
      { name: 'iPhone 6/7/8 Plus', width: 414, height: 736 },
      { name: 'iPad', width: 768, height: 1024 }
    ];

    for (const viewport of viewports) {
      await page.setViewport(viewport);
      await delay(500);

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `05-responsive-${viewport.width}x${viewport.height}.png`),
        fullPage: true
      });

      recordTest(`Responsive Layout (${viewport.name})`, !hasHorizontalScroll ? 'passed' : 'warning', {
        viewport: `${viewport.width}x${viewport.height}`,
        horizontalScroll: hasHorizontalScroll
      });
    }

    // ==================== 测试 11: 性能指标 ====================
    console.log('\n--- Test 11: Performance Metrics ---');

    const metrics = await page.metrics();
    const performanceData = await page.evaluate(() => {
      const perf = window.performance;
      const timing = perf.timing;

      return {
        navigationStart: timing.navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,
        firstPaint: perf.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: perf.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime
      };
    });

    recordTest('DOM Content Loaded', performanceData.domContentLoaded < 3000 ? 'passed' : 'warning', {
      time: `${performanceData.domContentLoaded}ms`,
      expected: '< 3000ms'
    });

    recordTest('First Contentful Paint', performanceData.firstContentfulPaint < 2000 ? 'passed' : 'warning', {
      time: `${Math.round(performanceData.firstContentfulPaint)}ms`,
      expected: '< 2000ms'
    });

    recordTest('JavaScript Heap Size', metrics.JSHeapUsedSize < 50000000 ? 'passed' : 'warning', {
      size: `${Math.round(metrics.JSHeapUsedSize / 1024 / 1024)}MB`,
      expected: '< 50MB'
    });

    // ==================== 测试 12: 交互功能 ====================
    console.log('\n--- Test 12: User Interactions ---');

    await page.setViewport({ width: 375, height: 667 });
    await page.reload({ waitUntil: 'networkidle2' });
    await delay(1000);

    // 测试场景包卡片点击
    const firstCard = await page.$('.scenario-card');
    if (firstCard) {
      await firstCard.click();
      await delay(1000);

      // 检查是否导航到详情页
      const currentUrl = page.url();
      recordTest('Card Click Navigation', currentUrl.includes('/detail') || currentUrl.includes('id=') ? 'passed' : 'warning', {
        currentUrl,
        message: currentUrl.includes('/detail') ? 'Navigated to detail page' : 'Navigation may not be implemented yet'
      });

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '06-after-click.png'),
        fullPage: true
      });

      // 返回首页
      await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    }

  } catch (error) {
    recordTest('Test Execution', 'failed', {
      error: error.message,
      stack: error.stack
    });
  } finally {
    // 保存测试报告
    fs.writeFileSync(REPORT_FILE, JSON.stringify(testResults, null, 2));

    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Summary');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${testResults.summary.total}`);
    console.log(`✅ Passed: ${testResults.summary.passed}`);
    console.log(`❌ Failed: ${testResults.summary.failed}`);
    console.log(`⚠️  Warnings: ${testResults.summary.warnings}`);
    console.log('='.repeat(50));
    console.log(`\n📄 Full report saved to: ${REPORT_FILE}`);
    console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}`);

    if (browser) {
      await browser.close();
    }

    // 如果有失败的测试，退出码为 1
    process.exit(testResults.summary.failed > 0 ? 1 : 0);
  }
}

// 运行测试
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
