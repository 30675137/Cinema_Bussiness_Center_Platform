const { chromium } = require('playwright');

async function testPage() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const errors = [];
  const warnings = [];
  
  page.on('console', msg => {
    const text = msg.text();
    console.log(`[Console ${msg.type()}]`, text);
    if (msg.type() === 'error') errors.push(text);
    if (msg.type() === 'warning') warnings.push(text);
  });
  
  page.on('pageerror', error => {
    console.log('[Page Error]', error.message);
    errors.push(error.message);
  });
  
  await page.goto('http://localhost:10090/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  const html = await page.content();
  console.log('\n=== HTML Length:', html.length);
  
  const appContent = await page.$eval('#app', el => el.innerHTML);
  console.log('=== #app Content:', appContent.substring(0, 500));
  
  console.log('\n=== Errors:', errors);
  console.log('=== Warnings:', warnings);
  
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
  
  setTimeout(() => browser.close(), 30000);
}

testPage().catch(console.error);
