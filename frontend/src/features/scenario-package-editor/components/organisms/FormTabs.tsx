/**
 * FormTabs 有机体组件
 * 场景包编辑器多标签页布局容器
 * Feature: 001-scenario-package-tabs
 */

import React, { useMemo } from 'react';
import { Tabs, Badge, Spin, Alert } from 'antd';
import type { TabsProps } from 'antd';
import { useScenarioPackageStore, type TabKey } from '../../stores/useScenarioPackageStore';
import UnsavedChangesAlert from '../molecules/UnsavedChangesAlert';

interface TabConfig {
  key: TabKey;
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}

interface FormTabsProps {
  /** 标签页配置 */
  tabs: TabConfig[];
  /** 是否正在加载 */
  loading?: boolean;
  /** 加载错误信息 */
  error?: string | null;
  /** 额外的右侧内容 */
  tabBarExtraContent?: React.ReactNode;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
}

/**
 * 场景包编辑器多标签页布局容器
 * 
 * 功能：
 * 1. 5个标签页导航（基础信息、套餐配置、加购项、时段模板、发布设置）
 * 2. 未保存修改提示（标签页红点）
 * 3. 切换标签页时的未保存确认弹窗
 * 
 * @example
 * <FormTabs
 *   tabs={[
 *     { key: 'basic', label: '基础信息', children: <BasicInfoTab /> },
 *     { key: 'packages', label: '套餐配置', children: <PackagesTab /> },
 *   ]}
 *   loading={isLoading}
 * />
 */
const FormTabs: React.FC<FormTabsProps> = ({
  tabs,
  loading = false,
  error = null,
  tabBarExtraContent,
  style,
  className,
}) => {
  const {
    activeTab,
    setActiveTab,
    dirtyTabs,
    showLeaveConfirm,
    hideLeaveConfirmModal,
    confirmLeave,
    isSaving,
  } = useScenarioPackageStore();

  // 构建 Tabs items
  const tabItems: TabsProps['items'] = useMemo(() => {
    return tabs.map((tab) => ({
      key: tab.key,
      label: (
        <span>
          {tab.icon}
          {tab.label}
          {dirtyTabs[tab.key] && (
            <Badge
              dot
              offset={[4, -2]}
              status="warning"
              style={{ marginLeft: 4 }}
            />
          )}
        </span>
      ),
      children: tab.children,
      disabled: tab.disabled,
    }));
  }, [tabs, dirtyTabs]);

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
  };

  // 加载状态
  if (loading) {
    return (
      <div style={{ padding: 100, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <Alert
        type="error"
        title="加载失败"
        message={error}
        showIcon
        style={{ margin: 24 }}
      />
    );
  }

  return (
    <div className={className} style={style}>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        tabBarExtraContent={tabBarExtraContent}
        size="large"
        style={{ marginTop: -8 }}
      />

      {/* 未保存修改确认弹窗 */}
      <UnsavedChangesAlert
        open={showLeaveConfirm}
        onCancel={hideLeaveConfirmModal}
        onConfirm={confirmLeave}
        saving={isSaving}
      />
    </div>
  );
};

export default FormTabs;
