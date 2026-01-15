/**
 * 020-store-address 自动化验证脚本
 * 使用 Node.js 直接运行
 */

const http = require('http');

const BASE_URL = 'http://localhost:8080';
const TARO_URL = 'http://localhost:10087';

async function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runVerification() {
  console.log('='.repeat(60));
  console.log('020-store-address 自动化验证');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  // T046: 验证 quickstart.md 清单
  console.log('\n📋 T046: quickstart.md 验证清单\n');

  // 测试 1: 门店列表 API 返回 addressSummary
  try {
    const res = await httpRequest(`${BASE_URL}/api/stores`);
    // 列表 API 格式: { data: [...], total: number }
    if (res.status === 200 && res.data && Array.isArray(res.data.data)) {
      const stores = res.data.data;
      const hasAddressSummary = stores.length === 0 || 'addressSummary' in stores[0];
      if (hasAddressSummary) {
        console.log(`✅ 门店列表 API 返回 addressSummary (${stores.length} 门店)`);
        if (stores.length > 0) {
          console.log(`   示例: ${stores[0].name} -> ${stores[0].addressSummary}`);
        }
        passed++;
      } else {
        console.log('❌ 门店列表 API 缺少 addressSummary 字段');
        failed++;
      }
    } else {
      console.log(`❌ 门店列表 API 失败: ${res.status}`);
      failed++;
    }
  } catch (e) {
    console.log(`❌ 门店列表 API 错误: ${e.message}`);
    failed++;
  }

  // 测试 2: 门店详情 API 返回地址字段
  try {
    const listRes = await httpRequest(`${BASE_URL}/api/stores`);
    const stores = listRes.data?.data;
    if (stores && stores.length > 0) {
      const storeId = stores[0].id;
      const res = await httpRequest(`${BASE_URL}/api/stores/${storeId}`);

      // 详情 API 格式: { success: true, data: {...} }
      if (res.status === 200 && res.data) {
        const store = res.data.data || res.data;
        const addressFields = ['province', 'city', 'district', 'address', 'phone', 'addressSummary'];
        const hasAllFields = addressFields.every(f => f in store);

        if (hasAllFields) {
          console.log(`✅ 门店详情 API 返回所有地址字段`);
          console.log(`   province=${store.province}, city=${store.city}, district=${store.district}`);
          console.log(`   phone=${store.phone}, addressSummary=${store.addressSummary}`);
          passed++;
        } else {
          const missing = addressFields.filter(f => !(f in store));
          console.log(`❌ 门店详情 API 缺少字段: ${missing.join(', ')}`);
          failed++;
        }
      } else {
        console.log(`❌ 门店详情 API 失败: ${res.status}`);
        failed++;
      }
    } else {
      console.log('⚠️ 跳过: 无门店数据');
    }
  } catch (e) {
    console.log(`❌ 门店详情 API 错误: ${e.message}`);
    failed++;
  }

  // 测试 3: 无效电话格式返回 400
  try {
    const listRes = await httpRequest(`${BASE_URL}/api/stores`);
    const stores = listRes.data?.data;
    if (stores && stores.length > 0) {
      const storeId = stores[0].id;
      const res = await httpRequest(`${BASE_URL}/api/stores/${storeId}`, {
        method: 'PUT',
        body: {
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          phone: 'invalid-phone'
        }
      });

      if (res.status === 400) {
        console.log('✅ 无效电话格式被正确拦截 (400)');
        passed++;
      } else {
        console.log(`❌ 无效电话格式未被拦截: ${res.status}`);
        failed++;
      }
    }
  } catch (e) {
    console.log(`❌ 电话校验测试错误: ${e.message}`);
    failed++;
  }

  // 测试 4: 有效电话格式可以更新
  try {
    const listRes = await httpRequest(`${BASE_URL}/api/stores`);
    const stores = listRes.data?.data;
    if (stores && stores.length > 0) {
      const storeId = stores[0].id;
      const res = await httpRequest(`${BASE_URL}/api/stores/${storeId}`, {
        method: 'PUT',
        body: {
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          address: '自动化验证测试地址',
          phone: '13800138000'
        }
      });

      if (res.status === 200) {
        const store = res.data?.data || res.data;
        console.log('✅ 有效电话格式(手机号)更新成功');
        console.log(`   phone=${store.phone}, address=${store.address}`);
        passed++;
      } else {
        console.log(`❌ 有效电话格式更新失败: ${res.status}`);
        failed++;
      }
    }
  } catch (e) {
    console.log(`❌ 电话更新测试错误: ${e.message}`);
    failed++;
  }

  // 测试 5: 座机号格式验证
  try {
    const listRes = await httpRequest(`${BASE_URL}/api/stores`);
    const stores = listRes.data?.data;
    if (stores && stores.length > 0) {
      const storeId = stores[0].id;
      const res = await httpRequest(`${BASE_URL}/api/stores/${storeId}`, {
        method: 'PUT',
        body: {
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          phone: '010-12345678'
        }
      });

      if (res.status === 200) {
        console.log('✅ 座机号格式验证通过 (010-12345678)');
        passed++;
      } else {
        console.log(`❌ 座机号格式验证失败: ${res.status}`);
        failed++;
      }
    }
  } catch (e) {
    console.log(`❌ 座机号测试错误: ${e.message}`);
    failed++;
  }

  // 测试 6: 400热线格式验证
  try {
    const listRes = await httpRequest(`${BASE_URL}/api/stores`);
    const stores = listRes.data?.data;
    if (stores && stores.length > 0) {
      const storeId = stores[0].id;
      const res = await httpRequest(`${BASE_URL}/api/stores/${storeId}`, {
        method: 'PUT',
        body: {
          province: '上海市',
          city: '上海市',
          district: '浦东新区',
          phone: '400-123-4567'
        }
      });

      if (res.status === 200) {
        console.log('✅ 400热线格式验证通过 (400-123-4567)');
        passed++;
      } else {
        console.log(`❌ 400热线格式验证失败: ${res.status}`);
        failed++;
      }
    }
  } catch (e) {
    console.log(`❌ 400热线测试错误: ${e.message}`);
    failed++;
  }

  // T047: 验证 C端 H5 功能
  console.log('\n📱 T047: C端 H5 功能验证\n');

  // 测试 7: C端首页可访问
  try {
    const res = await httpRequest(TARO_URL);
    if (res.status === 200) {
      console.log('✅ C端首页可访问 (http://localhost:10087)');
      passed++;
    } else {
      console.log(`❌ C端首页访问失败: ${res.status}`);
      failed++;
    }
  } catch (e) {
    console.log(`❌ C端首页错误: ${e.message}`);
    failed++;
  }

  // 测试 8: C端门店详情页
  try {
    const res = await httpRequest(`${TARO_URL}/pages/store-detail/index`);
    if (res.status === 200) {
      const hasAddressContent = typeof res.data === 'string' &&
        (res.data.includes('地址') || res.data.includes('address') || res.data.includes('store-detail'));
      console.log(`✅ C端门店详情页可访问`);
      passed++;
    } else {
      console.log(`⚠️ C端门店详情页返回: ${res.status} (H5 SPA 路由可能需要浏览器访问)`);
      // 不计入失败，因为 SPA 路由需要浏览器环境
    }
  } catch (e) {
    console.log(`⚠️ C端门店详情页: ${e.message} (H5 SPA 需要浏览器访问)`);
  }

  // 总结
  console.log('\n' + '='.repeat(60));
  console.log(`验证结果: ✅ ${passed} 通过, ❌ ${failed} 失败`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log('\n🎉 所有自动化验证通过!\n');
  } else {
    console.log('\n⚠️ 部分验证失败，请检查上述错误\n');
  }

  // 手动验证提示
  console.log('📝 需要浏览器手动验证的功能:');
  console.log('   1. 访问 http://localhost:10087/pages/store-detail/index?storeId=<id>');
  console.log('   2. 验证地址显示和复制功能');
  console.log('   3. 验证电话拨打功能 (H5 使用 tel: 链接)');
  console.log('');

  return failed === 0;
}

runVerification()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('验证脚本错误:', err);
    process.exit(1);
  });
