const WebSocket = require('ws');

async function verify() {
  const pages = await fetch('http://localhost:9222/json').then(r => r.json());
  const menuPage = pages.find(p => p.url.includes('/pages/menu'));
  if (!menuPage) {
    console.log('❌ 未找到菜单页面');
    process.exit(1);
  }
  
  const ws = new WebSocket(menuPage.webSocketDebuggerUrl);
  
  ws.on('open', () => {
    const script = `
      (function() {
        const result = { categories: [], products: 0, prices: [], images: 0, imagesLoaded: 0, errors: [], hasSkeleton: false, hasEmptyState: false };
        document.querySelectorAll('.category-item, [class*="category"]').forEach(el => {
          if (el.textContent && el.textContent.trim()) result.categories.push(el.textContent.trim().substring(0, 20));
        });
        result.products = document.querySelectorAll('.product-card, .grid-item').length;
        document.querySelectorAll('[class*="price"], .currency').forEach(el => {
          const text = el.textContent.trim();
          if (text && (text.includes('¥') || /^[0-9.]+$/.test(text))) result.prices.push(text);
        });
        const imgs = document.querySelectorAll('img, image');
        result.images = imgs.length;
        result.imagesLoaded = Array.from(imgs).filter(i => i.src && !i.src.includes('undefined')).length;
        if (document.querySelector('.error-state')) result.errors.push('error-state');
        result.hasSkeleton = !!document.querySelector('[class*="skeleton"]');
        result.hasEmptyState = !!document.querySelector('.empty-state');
        return JSON.stringify(result);
      })()
    `;
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: script, returnByValue: true } }));
  });
  
  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    if (msg.result && msg.result.result) {
      const r = JSON.parse(msg.result.result.value);
      console.log('=== O009 前端功能验证 ===');
      console.log('1. 分类标签:', r.categories.length > 0 ? '✅' : '❌', '数量:', r.categories.length);
      console.log('   内容:', r.categories.slice(0, 5).join(' | '));
      console.log('2. 商品卡片:', r.products > 0 ? '✅' : '❌', '数量:', r.products);
      console.log('3. 价格显示:', r.prices.length > 0 ? '✅' : '❌', '样本:', r.prices.slice(0, 3).join(', '));
      console.log('4. 图片加载:', r.imagesLoaded > 0 ? '✅' : '❌', r.imagesLoaded + '/' + r.images);
      console.log('5. 骨架屏:', r.hasSkeleton ? '显示中' : '已隐藏', '✅');
      console.log('6. 错误状态:', r.errors.length === 0 ? '无错误 ✅' : r.errors.join(', ') + ' ❌');
      console.log('7. 空状态:', r.hasEmptyState ? '显示中' : '未显示');
      console.log('=== 验证完成 ===');
      ws.close();
      process.exit(0);
    }
  });
  setTimeout(() => { ws.close(); process.exit(1); }, 10000);
}
verify().catch(console.error);
