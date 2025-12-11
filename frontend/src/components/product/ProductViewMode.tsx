/**
 * 商品查看模式组件
 */

import React from 'react';
import { Descriptions, Tag, Space, Image } from 'antd';
import type { Product, ProductStatus } from '@/types/product';

interface ProductViewModeProps {
  product: Product;
}

/**
 * 商品查看模式组件
 */
const ProductViewMode: React.FC<ProductViewModeProps> = ({ product }) => {
  const getStatusTag = (status: ProductStatus) => {
    const statusMap = {
      draft: { color: 'default', text: '草稿' },
      pending_review: { color: 'processing', text: '待审核' },
      published: { color: 'success', text: '已发布' },
      rejected: { color: 'error', text: '已驳回' },
      offline: { color: 'warning', text: '已下线' },
      abnormal: { color: 'red', text: '异常' }
    };

    const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '-';
    return `¥${price.toFixed(2)}`;
  };

  const formatDateTime = (dateTime?: string) => {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleString('zh-CN');
  };

  return (
    <div className="product-view-mode p-4">
      <Descriptions title="商品详情" bordered column={2}>
        <Descriptions.Item label="商品SKU">{product.sku}</Descriptions.Item>
        <Descriptions.Item label="商品名称">{product.name}</Descriptions.Item>
        <Descriptions.Item label="条形码">{product.barcode || '-'}</Descriptions.Item>
        <Descriptions.Item label="物料类型">{product.materialType || '-'}</Descriptions.Item>

        <Descriptions.Item label="品牌">{product.brand?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="类目">{product.category?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="单位">{product.unit?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="状态">{getStatusTag(product.status)}</Descriptions.Item>

        <Descriptions.Item label="基础价">{formatPrice(product.basePrice)}</Descriptions.Item>
        <Descriptions.Item label="成本价">{formatPrice(product.costPrice)}</Descriptions.Item>
        <Descriptions.Item label="当前库存">{product.currentStock || 0}</Descriptions.Item>
        <Descriptions.Item label="安全库存">{product.safetyStock || '-'}</Descriptions.Item>

        <Descriptions.Item label="描述" span={2}>{product.description || '-'}</Descriptions.Item>

        <Descriptions.Item label="商品图片" span={2}>
          {product.content?.images && product.content.images.length > 0 ? (
            <Space wrap>
              {product.content.images.map((image, index) => (
                <Image
                  key={index}
                  width={80}
                  height={80}
                  src={image}
                  alt={`${product.name}-${index + 1}`}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
              ))}
            </Space>
          ) : '-'}
        </Descriptions.Item>

        <Descriptions.Item label="创建人">{product.createdBy || '-'}</Descriptions.Item>
        <Descriptions.Item label="创建时间">{formatDateTime(product.createdAt)}</Descriptions.Item>
        <Descriptions.Item label="更新人">{product.updatedBy || '-'}</Descriptions.Item>
        <Descriptions.Item label="更新时间">{formatDateTime(product.updatedAt)}</Descriptions.Item>

        {product.publishedAt && (
          <Descriptions.Item label="发布时间" span={2}>{formatDateTime(product.publishedAt)}</Descriptions.Item>
        )}
      </Descriptions>
    </div>
  );
};

export default ProductViewMode;
