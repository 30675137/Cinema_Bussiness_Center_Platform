/**
 * SPU列表功能测试脚本
 * 在Node.js环境中运行，测试核心API和逻辑
 */

import { spuService } from '@/services/spuService';
import type { SPUQueryParams } from '@/types/spu';

interface TestResult {
  name: string;
  status: 'pass' | 'fail';
  message: string;
  duration?: number;
}

class SPULISTests {
  private results: TestResult[] = [];

  private async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    try {
      await testFn();
      this.results.push({
        name,
        status: 'pass',
        message: '✅ 测试通过',
        duration: Date.now() - startTime,
      });
      console.log(`✅ ${name}`);
    } catch (error) {
      this.results.push({
        name,
        status: 'fail',
        message: `❌ 测试失败: ${error}`,
        duration: Date.now() - startTime,
      });
      console.log(`❌ ${name}: ${error}`);
    }
  }

  async testBasicFunctionality(): Promise<void> {
    await this.runTest('基础功能测试 - 获取SPU列表', async () => {
      const response = await spuService.getSPUList({
        page: 1,
        pageSize: 20,
      });

      if (!response.success) {
        throw new Error('API调用失败');
      }

      if (!response.data || !response.data.list || response.data.list.length === 0) {
        throw new Error('没有返回数据');
      }

      console.log(`📊 获取到 ${response.data.list.length} 条SPU数据`);
      console.log(
        `📄 分页信息: 第${response.data.page}页，每页${response.data.pageSize}条，共${response.data.total}条`
      );
    });
  }

  async testSearchFunctionality(): Promise<void> {
    await this.runTest('搜索功能测试 - 关键词搜索', async () => {
      const keyword = '可口可乐';
      const response = await spuService.getSPUList({
        page: 1,
        pageSize: 10,
        keyword,
      });

      if (!response.success) {
        throw new Error('搜索API调用失败');
      }

      console.log(`🔍 搜索关键词"${keyword}"，找到 ${response.data.list.length} 条结果`);

      // 验证搜索结果的相关性
      const relevantResults = response.data.list.filter(
        (item) =>
          item.name.includes(keyword) ||
          item.code.includes(keyword) ||
          item.description?.includes(keyword)
      );

      if (relevantResults.length !== response.data.list.length) {
        console.warn(`⚠️ 搜索结果中可能有不相关数据`);
      }

      console.log(`📝 相关结果: ${relevantResults.length}/${response.data.list.length}`);
    });
  }

  async testFilterFunctionality(): Promise<void> {
    await this.runTest('筛选功能测试 - 状态筛选', async () => {
      // 测试按状态筛选
      const statusResponse = await spuService.getSPUList({
        page: 1,
        pageSize: 10,
        status: 'active',
      });

      if (!statusResponse.success) {
        throw new Error('状态筛选API调用失败');
      }

      const allActive = statusResponse.data.list.every((item) => item.status === 'active');
      if (!allActive) {
        throw new Error('状态筛选结果不正确');
      }

      console.log(`🏷️ 状态筛选结果: ${statusResponse.data.list.length} 条活跃数据`);
    });

    await this.runTest('筛选功能测试 - 品牌筛选', async () => {
      const brandResponse = await spuService.getSPUList({
        page: 1,
        pageSize: 10,
        brandId: 'brand_001',
      });

      if (!brandResponse.success) {
        throw new Error('品牌筛选API调用失败');
      }

      console.log(`🏢 品牌筛选结果: ${brandResponse.data.list.length} 条数据`);
    });
  }

  async testSortFunctionality(): Promise<void> {
    await this.runTest('排序功能测试 - 按创建时间排序', async () => {
      const response = await spuService.getSPUList({
        page: 1,
        pageSize: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (!response.success) {
        throw new Error('排序API调用失败');
      }

      const sortedData = response.data.list;
      if (sortedData.length >= 2) {
        const isSortedCorrectly = sortedData.every((item, index) => {
          if (index === 0) return true;
          return new Date(item.createdAt) <= new Date(sortedData[index - 1].createdAt);
        });

        if (!isSortedCorrectly) {
          throw new Error('排序结果不正确');
        }
      }

      console.log(`⏰ 排序测试通过，按创建时间降序排列`);
    });
  }

  async testPaginationFunctionality(): Promise<void> {
    await this.runTest('分页功能测试', async () => {
      // 测试第一页
      const page1Response = await spuService.getSPUList({
        page: 1,
        pageSize: 5,
      });

      // 测试第二页
      const page2Response = await spuService.getSPUList({
        page: 2,
        pageSize: 5,
      });

      if (!page1Response.success || !page2Response.success) {
        throw new Error('分页API调用失败');
      }

      console.log(`📄 第1页: ${page1Response.data.list.length} 条数据`);
      console.log(`📄 第2页: ${page2Response.data.list.length} 条数据`);

      // 验证分页数据不重复
      const page1Ids = new Set(page1Response.data.list.map((item) => item.id));
      const page2Ids = new Set(page2Response.data.list.map((item) => item.id));
      const hasOverlap = [...page1Ids].some((id) => page2Ids.has(id));

      if (hasOverlap) {
        throw new Error('分页数据存在重复');
      }

      console.log(`🔢 分页数据验证通过，无重复数据`);
    });
  }

  async testBatchOperations(): Promise<void> {
    await this.runTest('批量操作功能测试', async () => {
      // 先获取一些测试数据
      const listResponse = await spuService.getSPUList({
        page: 1,
        pageSize: 3,
      });

      if (!listResponse.success || listResponse.data.list.length < 2) {
        throw new Error('无法获取测试数据');
      }

      const testIds = listResponse.data.list.slice(0, 2).map((item) => item.id);
      console.log(`🎯 选中测试数据: ${testIds.join(', ')}`);

      // 测试批量状态更新
      const statusResponse = await spuService.batchUpdateSPUStatus(testIds, 'inactive');
      if (!statusResponse.success) {
        throw new Error('批量状态更新失败');
      }
      console.log(`✅ 批量状态更新成功`);

      // 测试批量复制
      const copyResponse = await spuService.batchCopySPU(testIds);
      if (!copyResponse.success) {
        throw new Error('批量复制失败');
      }
      console.log(`📋 批量复制成功`);

      // 测试批量导出
      const exportResponse = await spuService.batchExportSPU(testIds);
      if (!exportResponse.success) {
        throw new Error('批量导出失败');
      }
      console.log(`📤 批量导出成功`);
    });
  }

  async testComponentLogic(): Promise<void> {
    await this.runTest('组件逻辑测试 - Mock数据生成', async () => {
      // 测试Mock数据生成器
      const response = await spuService.getSPUList({
        page: 1,
        pageSize: 50,
      });

      if (!response.success) {
        throw new Error('Mock数据生成失败');
      }

      const mockData = response.data.list;

      // 验证Mock数据质量
      const hasRequiredFields = mockData.every(
        (item) => item.id && item.code && item.name && item.status
      );

      if (!hasRequiredFields) {
        throw new Error('Mock数据缺少必要字段');
      }

      // 统计数据分布
      const statusCount = mockData.reduce(
        (acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      console.log(`📊 Mock数据统计: 共${mockData.length}条`);
      console.log(`📈 状态分布:`, statusCount);
      console.log(`🏷️ 品牌数量: ${new Set(mockData.map((item) => item.brand?.name)).size}`);
      console.log(`📂 分类数量: ${new Set(mockData.map((item) => item.category?.name)).size}`);
    });
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 开始运行SPU列表功能测试...\n');

    await this.testBasicFunctionality();
    await this.testSearchFunctionality();
    await this.testFilterFunctionality();
    await this.testSortFunctionality();
    await this.testPaginationFunctionality();
    await this.testBatchOperations();
    await this.testComponentLogic();

    this.printSummary();
  }

  private printSummary(): void {
    console.log('\n📊 测试结果汇总:');
    console.log('='.repeat(50));

    let passCount = 0;
    let failCount = 0;
    let totalDuration = 0;

    this.results.forEach((result) => {
      const icon = result.status === 'pass' ? '✅' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${icon} ${result.name}${duration}`);

      if (result.status === 'pass') {
        passCount++;
      } else {
        failCount++;
        console.log(`   ${result.message}`);
      }

      totalDuration += result.duration || 0;
    });

    console.log('='.repeat(50));
    console.log(`📈 总计: ${this.results.length} 个测试`);
    console.log(`✅ 通过: ${passCount} 个`);
    console.log(`❌ 失败: ${failCount} 个`);
    console.log(`⏱️ 总耗时: ${totalDuration}ms`);

    if (failCount === 0) {
      console.log('\n🎉 所有测试都通过了！SPU列表功能运行正常。');
    } else {
      console.log(`\n⚠️ 有 ${failCount} 个测试失败，需要检查相关功能。`);
    }
  }
}

// 导出测试类
export { SPULISTests };

// 如果在Node.js环境中直接运行
if (typeof window === 'undefined') {
  const tests = new SPULISTests();
  tests.runAllTests().catch(console.error);
}
