/**
 * 商品列表页面
 */

import React from 'react';
import { PagePlaceholder } from '@/components/pages';

const ProductList: React.FC = () => {
  return (
    <PagePlaceholder
      title="商品管理"
      description="管理和维护所有商品信息，包括SPU、SKU、库存等"
      showSearch={true}
      showActions={true}
      showStats={true}
      statistics={[
        {
          title: '总商品数',
          value: 1234,
          prefix: null,
          trend: { value: 12.5, isPositive: true }
        },
        {
          title: '在售商品',
          value: 892,
          prefix: null,
          trend: { value: 5.8, isPositive: true }
        },
        {
          title: '库存预警',
          value: 23,
          prefix: null,
          trend: { value: -15.2, isPositive: false }
        }
      ]}
    >
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <h3>商品列表功能</h3>
        <p>这里将显示商品管理的详细功能</p>
      </div>
    </PagePlaceholder>
  );
};

export default ProductList;