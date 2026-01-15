import React, { useEffect, useState } from 'react';
import { Card, Button, Space, message, Typography, Alert, Divider, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SPUListPage } from '@/pages/SPUList';
import { spuService } from '@/services/spuService';

const { Title, Paragraph } = Typography;

const TestResults: React.FC<{ results: string[] }> = ({ results }) => {
  return (
    <div style={{ marginTop: 16 }}>
      <Title level={4}>测试结果:</Title>
      {results.map((result, index) => (
        <Alert
          key={index}
          message={result}
          type={result.includes('失败') || result.includes('错误') ? 'error' : 'success'}
          style={{ marginBottom: 8 }}
        />
      ))}
    </div>
  );
};

const SPUListTest: React.FC = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (result: string) => {
    setTestResults((prev) => [...prev, result]);
  };

  // 测试基础功能
  const testBasicFunctionality = async () => {
    addTestResult('开始测试基础功能...');

    try {
      // 测试获取SPU列表
      const response = await spuService.getSPUList({
        page: 1,
        pageSize: 20,
      });

      if (response.success && response.data.list.length > 0) {
        addTestResult(`✅ 成功获取SPU列表，共 ${response.data.list.length} 条数据`);
      } else {
        addTestResult('❌ 获取SPU列表失败');
      }
    } catch (error) {
      addTestResult(`❌ 获取SPU列表时发生错误: ${error}`);
    }
  };

  // 测试搜索功能
  const testSearchFunctionality = async () => {
    addTestResult('开始测试搜索功能...');

    try {
      // 测试关键词搜索
      const searchResponse = await spuService.getSPUList({
        page: 1,
        pageSize: 20,
        keyword: '可口可乐',
      });

      if (searchResponse.success) {
        addTestResult(`✅ 关键词搜索成功，找到 ${searchResponse.data.list.length} 条数据`);

        // 验证搜索结果是否正确
        const allMatchKeyword = searchResponse.data.list.every(
          (item) =>
            item.name.includes('可口可乐') ||
            item.code.includes('可口可乐') ||
            item.description?.includes('可口可乐')
        );

        if (allMatchKeyword) {
          addTestResult('✅ 搜索结果验证通过，所有结果都包含关键词');
        } else {
          addTestResult('❌ 搜索结果验证失败，部分结果不包含关键词');
        }
      } else {
        addTestResult('❌ 关键词搜索失败');
      }
    } catch (error) {
      addTestResult(`❌ 关键词搜索时发生错误: ${error}`);
    }
  };

  // 测试筛选功能
  const testFilterFunctionality = async () => {
    addTestResult('开始测试筛选功能...');

    try {
      // 测试状态筛选
      const statusResponse = await spuService.getSPUList({
        page: 1,
        pageSize: 20,
        status: 'active',
      });

      if (statusResponse.success) {
        addTestResult(`✅ 状态筛选成功，找到 ${statusResponse.data.list.length} 条活跃数据`);

        // 验证筛选结果
        const allActive = statusResponse.data.list.every((item) => item.status === 'active');
        addTestResult(allActive ? '✅ 状态筛选验证通过' : '❌ 状态筛选验证失败');
      }
    } catch (error) {
      addTestResult(`❌ 状态筛选时发生错误: ${error}`);
    }

    try {
      // 测试品牌筛选
      const brandResponse = await spuService.getSPUList({
        page: 1,
        pageSize: 20,
        brandId: 'brand_001',
      });

      if (brandResponse.success) {
        addTestResult(`✅ 品牌筛选成功，找到 ${brandResponse.data.list.length} 条数据`);
      }
    } catch (error) {
      addTestResult(`❌ 品牌筛选时发生错误: ${error}`);
    }
  };

  // 测试排序功能
  const testSortFunctionality = async () => {
    addTestResult('开始测试排序功能...');

    try {
      // 测试按创建时间排序
      const sortResponse = await spuService.getSPUList({
        page: 1,
        pageSize: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (sortResponse.success) {
        addTestResult('✅ 排序功能测试成功');

        // 验证排序是否正确
        const sortedData = sortResponse.data.list;
        if (sortedData.length >= 2) {
          const isSortedCorrectly = sortedData.every((item, index) => {
            if (index === 0) return true;
            return new Date(item.createdAt) <= new Date(sortedData[index - 1].createdAt);
          });
          addTestResult(isSortedCorrectly ? '✅ 排序验证通过' : '❌ 排序验证失败');
        }
      }
    } catch (error) {
      addTestResult(`❌ 排序测试时发生错误: ${error}`);
    }
  };

  // 测试分页功能
  const testPaginationFunctionality = async () => {
    addTestResult('开始测试分页功能...');

    try {
      // 测试第一页
      const page1Response = await spuService.getSPUList({
        page: 1,
        pageSize: 10,
      });

      // 测试第二页
      const page2Response = await spuService.getSPUList({
        page: 2,
        pageSize: 10,
      });

      if (page1Response.success && page2Response.success) {
        addTestResult('✅ 分页功能测试成功');
        addTestResult(`✅ 第1页: ${page1Response.data.list.length} 条数据`);
        addTestResult(`✅ 第2页: ${page2Response.data.list.length} 条数据`);

        // 验证分页数据是否重复
        const page1Ids = new Set(page1Response.data.list.map((item) => item.id));
        const page2Ids = new Set(page2Response.data.list.map((item) => item.id));
        const hasOverlap = [...page1Ids].some((id) => page2Ids.has(id));

        addTestResult(
          hasOverlap ? '❌ 分页数据验证失败，存在重复数据' : '✅ 分页数据验证通过，无重复数据'
        );
      }
    } catch (error) {
      addTestResult(`❌ 分页测试时发生错误: ${error}`);
    }
  };

  // 测试批量操作功能
  const testBatchOperations = async () => {
    addTestResult('开始测试批量操作功能...');

    try {
      // 先获取一些测试数据
      const listResponse = await spuService.getSPUList({
        page: 1,
        pageSize: 5,
      });

      if (listResponse.success && listResponse.data.list.length >= 2) {
        const testIds = listResponse.data.list.slice(0, 2).map((item) => item.id);

        // 测试批量状态更新
        const statusResponse = await spuService.batchUpdateSPUStatus(testIds, 'inactive');
        if (statusResponse.success) {
          addTestResult('✅ 批量状态更新成功');
        } else {
          addTestResult('❌ 批量状态更新失败');
        }

        // 测试批量复制
        const copyResponse = await spuService.batchCopySPU(testIds);
        if (copyResponse.success) {
          addTestResult('✅ 批量复制操作成功');
        } else {
          addTestResult('❌ 批量复制操作失败');
        }

        // 测试批量导出
        const exportResponse = await spuService.batchExportSPU(testIds);
        if (exportResponse.success) {
          addTestResult('✅ 批量导出操作成功');
        } else {
          addTestResult('❌ 批量导出操作失败');
        }

        // 注意：跳过批量删除测试，避免影响数据完整性
        addTestResult('⚠️ 跳过批量删除测试，避免影响数据完整性');
      }
    } catch (error) {
      addTestResult(`❌ 批量操作测试时发生错误: ${error}`);
    }
  };

  // 运行所有测试
  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    addTestResult('🚀 开始运行SPU列表功能自动化测试...');

    await testBasicFunctionality();
    await testSearchFunctionality();
    await testFilterFunctionality();
    await testSortFunctionality();
    await testPaginationFunctionality();
    await testBatchOperations();

    addTestResult('🎉 所有测试完成！');
    setIsLoading(false);
  };

  // 清空测试结果
  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>SPU列表功能测试</Title>
        <Paragraph>
          此页面用于测试SPU列表的各项功能，包括搜索、筛选、排序、分页和批量操作。
        </Paragraph>
      </div>

      {/* 测试控制面板 */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>测试控制面板</Title>
        <Space wrap>
          <Button type="primary" loading={isLoading} onClick={runAllTests}>
            运行所有测试
          </Button>
          <Button onClick={clearResults}>清空测试结果</Button>
          <Button onClick={() => navigate('/spu')}>查看实际页面</Button>
        </Space>

        <Divider />

        <Space wrap>
          <Tag color="blue">基础功能测试</Tag>
          <Tag color="green">搜索功能测试</Tag>
          <Tag color="orange">筛选功能测试</Tag>
          <Tag color="purple">排序功能测试</Tag>
          <Tag color="cyan">分页功能测试</Tag>
          <Tag color="red">批量操作测试</Tag>
        </Space>
      </Card>

      {/* 测试结果 */}
      {testResults.length > 0 && (
        <Card>
          <TestResults results={testResults} />
        </Card>
      )}

      {/* 实际组件展示 */}
      <Card style={{ marginTop: 24 }}>
        <Title level={4}>实际组件展示</Title>
        <Paragraph>以下是实际的SPU列表组件，您可以手动测试各项功能：</Paragraph>

        <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 16 }}>
          <SPUListPage />
        </div>
      </Card>
    </div>
  );
};

export default SPUListTest;
