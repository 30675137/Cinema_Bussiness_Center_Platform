/**
 * Attribute Dictionary Management Page
 *
 * Main entry component for attribute dictionary management.
 * Provides tab-based navigation between:
 * - 字典管理 (Dictionary Management) - User Story 1
 * - 属性模板 (Attribute Templates) - User Story 2
 */

import React, { useState } from 'react';
import { Card, Tabs, Typography } from 'antd';
import DictionaryTypeList from './components/organisms/DictionaryTypeList';
import type { AttributePageTab } from './types/attribute.types';

const { Title } = Typography;

/**
 * Attribute Dictionary Management Page Component
 */
const AttributeManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AttributePageTab>('dictionary');

  const handleTabChange = (key: string) => {
    setActiveTab(key as AttributePageTab);
  };

  const tabItems = [
    {
      key: 'dictionary',
      label: '字典管理',
      children: <DictionaryTypeList />,
    },
    {
      key: 'template',
      label: '属性模板',
      children: (
        <div>
          {/* TODO: Implement TemplateList component (T047) */}
          <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
            属性模板组件待实现 (User Story 2)
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="attribute-management-page" style={{ padding: '24px' }}>
      <Card bordered={false}>
        <Title level={4} style={{ marginBottom: 24 }}>
          属性字典管理
        </Title>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          destroyInactiveTabPane={false}
        />
      </Card>
    </div>
  );
};

export default AttributeManagement;
