/**
 * @spec O005-channel-product-config
 * Channel SKU Selector Wrapper
 *
 * Reuse SKUSelectorModal to select FINISHED_PRODUCT SKUs
 */

import React from 'react';
import { SKUSelectorModal } from '@/components/molecules/SKUSelectorModal';
import type { SKU } from '@/types/sku';

export interface ChannelSkuSelectorProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (sku: SKU) => void;
  excludeSkuIds?: string[];
}

export const ChannelSkuSelector: React.FC<ChannelSkuSelectorProps> = ({
  visible,
  onCancel,
  onSelect,
  excludeSkuIds = [],
}) => {
  return (
    <SKUSelectorModal
      visible={visible}
      onCancel={onCancel}
      onSelect={onSelect}
      skuType="finished_product"
      title="选择成品 SKU"
      excludeSkuIds={excludeSkuIds}
      showTypeColumn={false}
    />
  );
};
