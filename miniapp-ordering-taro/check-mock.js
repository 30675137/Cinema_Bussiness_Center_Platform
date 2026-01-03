const { chromium } = require('playwright');

async function checkMock() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  await page.goto('http://localhost:10089/', { waitUntil: 'networkidle' });
  
  // 等待加载
  await page.waitForTimeout(3000);
  
  console.log('\n📋 控制台日志:');
  logs.forEach(log => console.log(log));
  
  // 检查页面内容
  const content = await page.content();
  console.log('\n📦 页面包含:');
  console.log('- Mock数据标记:', content.includes('Mock'));
  console.log('- 商品卡片:', content.includes('product-card'));
  console.log('- 分类导航:', content.includes('category-tabs'));
  
  await browser.close();
}

checkMock().catch(console.error);
