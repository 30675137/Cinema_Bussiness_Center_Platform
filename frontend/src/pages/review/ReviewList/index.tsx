/**
 * 商品审核页面
 */

import React from 'react';
import { PagePlaceholder } from '@/components/pages';

const ReviewList: React.FC = () => {
  return (
    <PagePlaceholder
      title="商品审核"
      description="管理商品审核流程，包括新建商品审核、信息变更审核、合规性检查等"
      showSearch={true}
      showActions={true}
      showStats={true}
      statistics={[
        {
          title: '待审核',
          value: 23,
          prefix: null,
          trend: { value: -8.5, isPositive: false }
        },
        {
          title: '今日审核',
          value: 45,
          prefix: null,
          trend: { value: 18.2, isPositive: true }
        },
        {
          title: '审核通过率',
          value: 92.3,
          prefix: null,
          trend: { value: 1.2, isPositive: true }
        }
      ]}
    >
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <h3>商品审核功能</h3>
        <p>这里将显示商品审核的详细功能</p>
      </div>
    </PagePlaceholder>
  );
};

export default ReviewList;