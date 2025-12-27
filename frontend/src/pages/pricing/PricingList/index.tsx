/**
 * 价格管理页面
 */

import React from 'react';
import { PagePlaceholder } from '@/components/pages';

const PricingList: React.FC = () => {
  return (
    <PagePlaceholder
      title="价格管理"
      description="制定和管理商品价格策略，包括定价、促销、折扣等价格体系管理"
      showSearch={true}
      showActions={true}
      showStats={true}
      statistics={[
        {
          title: '活跃价格策略',
          value: 89,
          prefix: null,
          trend: { value: 5.3, isPositive: true }
        },
        {
          title: '促销商品',
          value: 234,
          prefix: null,
          trend: { value: 12.8, isPositive: true }
        },
        {
          title: '平均毛利率',
          value: 32.5,
          prefix: null,
          trend: { value: 2.1, isPositive: true }
        }
      ]}
    >
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <h3>价格管理功能</h3>
        <p>这里将显示价格管理的详细功能</p>
      </div>
    </PagePlaceholder>
  );
};

export default PricingList;