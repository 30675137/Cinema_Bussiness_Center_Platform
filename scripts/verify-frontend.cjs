const WebSocket = require('ws');

async function verify() {
  const pages = await fetch('http://localhost:9222/json').then(r => r.json());
  const menuPage = pages.find(p => p.url.includes('/pages/menu'));
  
  if (!menuPage) {
    console.log('❌ 未找到菜单页面');
    process.exit(1);
  }
  
  console.log('页面标题:', menuPage.title);
  console.log('页面URL:', menuPage.url);
  console.log('');
  
  const ws = new WebSocket(menuPage.webSocketDebuggerUrl);
  
  ws.on('open', () => {
    const script = `
      (function() {
        const result = { 
          categories: [], 
          products: 0, 
          prices: [], 
          images: 0, 
          imagesLoaded: 0, 
          hasSkeleton: false, 
          hasEmptyState: false,
          hasError: false
        };
        
        // 检查分类
        document.querySelectorAll('.category-item, [class*="category"]').forEach(el => {
          const text = el.textContent ? el.textContent.trim() : '';
          if (text && text.length < 20 && !result.categories.includes(text)) {
            result.categories.push(text);
          }
        });
        
        // 检查商品卡片
        result.products = document.querySelectorAll('.product-card, .grid-item').length;
        
        // 检查价格
        document.querySelectorAll('[class*="price"], .currency').forEach(el => {
          const text = el.textContent ? el.textContent.trim() : '';
          if (text && (text.includes('¥') || /^[0-9.]+$/.test(text))) {
            result.prices.push(text);
          }
        });
        
        // 检查图片
        const imgs = document.querySelectorAll('img, image');
        result.images = imgs.length;
        result.imagesLoaded = Array.from(imgs).filter(i => i.src && !i.src.includes('undefined')).length;
        
        // 检查状态
        result.hasSkeleton = !!document.querySelector('[class*="skeleton"]');
        result.hasEmptyState = !!document.querySelector('.empty-state, [class*="empty"]');
        result.hasError = !!document.querySelector('.error-state');
        
        return JSON.stringify(result);
      })()
    `;
    
    ws.send(JSON.stringify({ 
      id: 1, 
      method: 'Runtime.evaluate', 
      params: { expression: script, returnByValue: true } 
    }));
  });
  
  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    if (msg.result && msg.result.result) {
      const r = JSON.parse(msg.result.result.value);
      
      console.log('=== O009 前端功能验证 ===');
      console.log('');
      console.log('1. 分类标签:', r.categories.length > 0 ? '✅' : '❌', '数量:', r.categories.length);
      if (r.categories.length > 0) {
        console.log('   内容:', r.categories.slice(0, 6).join(' | '));
      }
      console.log('2. 商品卡片:', r.products > 0 ? '✅' : '❌', '数量:', r.products);
      console.log('3. 价格显示:', r.prices.length > 0 ? '✅' : '❌', '样本:', r.prices.slice(0, 4).join(', '));
      console.log('4. 图片加载:', r.imagesLoaded + '/' + r.images, r.imagesLoaded > 0 ? '✅' : '⚠️');
      console.log('5. 骨架屏:', r.hasSkeleton ? '显示中' : '已隐藏 ✅');
      console.log('6. 错误状态:', r.hasError ? '❌ 显示错误' : '✅ 无错误');
      console.log('7. 空状态:', r.hasEmptyState ? '显示中' : '未显示');
      console.log('');
      console.log('=== 验证完成 ===');
      
      ws.close();
      process.exit(0);
    }
  });
  
  ws.on('error', (err) => {
    console.log('WebSocket错误:', err.message);
    process.exit(1);
  });
  
  setTimeout(() => { 
    console.log('超时');
    ws.close(); 
    process.exit(1); 
  }, 15000);
}

verify().catch(err => {
  console.log('错误:', err.message);
  process.exit(1);
});
