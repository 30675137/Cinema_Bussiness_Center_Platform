/**
 * ScenarioPackageEditorPage 主页面组件
 * 场景包多标签页编辑器
 * Feature: 001-scenario-package-tabs
 */

import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Space, Button, Spin, Alert } from 'antd';
import {
  ArrowLeftOutlined,
  InfoCircleOutlined,
  ShoppingOutlined,
  GiftOutlined,
  ClockCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { FormTabs, UnpublishedBadge } from './components';
import { BasicInfoTab, PackagesTab, AddonsTab, TimeSlotsTab, PublishTab } from './components/tabs';
import { useScenarioPackageDetail } from './hooks/useScenarioPackageQueries';
import { useScenarioPackageStore, type TabKey } from './stores/useScenarioPackageStore';

/**
 * 场景包编辑器主页面
 *
 * 功能：
 * 1. 5个标签页：基础信息、套餐配置、加购项、时段模板、发布设置
 * 2. 未保存修改提示
 * 3. 标签页切换时的保存确认
 */
const ScenarioPackageEditorPage: React.FC = () => {
  const { id: packageId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Zustand store
  const { setPackageId, reset: resetStore } = useScenarioPackageStore();

  // 设置当前编辑的场景包ID
  useEffect(() => {
    if (packageId) {
      setPackageId(packageId);
    }
    return () => {
      resetStore();
    };
  }, [packageId, setPackageId, resetStore]);

  // 获取场景包详情
  const { data, isLoading, error, refetch } = useScenarioPackageDetail(packageId || null);

  const packageData = data?.package;

  // 返回列表
  const handleBack = () => {
    navigate('/scenario-packages');
  };

  // 标签页配置
  const tabs = useMemo(() => {
    const tabConfigs: Array<{
      key: TabKey;
      label: string;
      icon: React.ReactNode;
      children: React.ReactNode;
    }> = [
      {
        key: 'basic',
        label: '基础信息',
        icon: <InfoCircleOutlined />,
        children: (
          <BasicInfoTab packageId={packageId!} packageData={packageData} loading={isLoading} />
        ),
      },
      {
        key: 'packages',
        label: '套餐配置',
        icon: <ShoppingOutlined />,
        children: <PackagesTab packageId={packageId!} loading={isLoading} />,
      },
      {
        key: 'addons',
        label: '加购项',
        icon: <GiftOutlined />,
        children: <AddonsTab packageId={packageId!} loading={isLoading} />,
      },
      {
        key: 'timeslots',
        label: '时段模板',
        icon: <ClockCircleOutlined />,
        children: <TimeSlotsTab packageId={packageId!} loading={isLoading} />,
      },
      {
        key: 'publish',
        label: '发布设置',
        icon: <SendOutlined />,
        children: <PublishTab packageId={packageId!} loading={isLoading} />,
      },
    ];

    return tabConfigs;
  }, [packageId, packageData, isLoading]);

  // 加载状态
  if (isLoading && !data) {
    return (
      <div style={{ padding: 100, textAlign: 'center' }}>
        <Spin size="large">
          <div style={{ padding: 20, color: '#999' }}>加载中...</div>
        </Spin>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <Alert
        type="error"
        title="加载失败"
        description={error.message || '获取场景包详情失败'}
        showIcon
        style={{ margin: 24 }}
        action={<Button onClick={() => refetch()}>重试</Button>}
      />
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 页头 */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', background: '#fff' }}>
        <Breadcrumb
          items={[{ title: '场景包管理' }, { title: packageData?.name || '编辑场景包' }]}
          style={{ marginBottom: 12 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack}>
              返回
            </Button>
            <span style={{ fontSize: 18, fontWeight: 500 }}>
              {packageData?.name || '编辑场景包'}
            </span>
            {packageData && <UnpublishedBadge status={packageData.status} />}
          </Space>
        </div>
      </div>

      {/* 标签页内容 */}
      <div style={{ flex: 1, padding: 24, overflow: 'auto', background: '#f5f5f5' }}>
        <FormTabs tabs={tabs} loading={isLoading} error={error?.message || null} />
      </div>
    </div>
  );
};

export default ScenarioPackageEditorPage;
