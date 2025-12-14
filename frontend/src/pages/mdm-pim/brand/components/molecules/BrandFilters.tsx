import React from 'react';
import { Tag, Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import type { BrandFilters as BrandFiltersType } from '../../types/brand.types';
import { BrandType, BrandStatus, BRAND_CONSTANTS } from '../../types/brand.types';

interface BrandFiltersProps {
  filters: BrandFiltersType;
  onClearFilter: (filterKey: keyof BrandFiltersType) => void;
  onClearAll: () => void;
  className?: string;
}

/**
 * 品牌筛选条件显示分子组件
 * 用于显示当前激活的筛选条件，并支持快速清除
 */
const BrandFilters: React.FC<BrandFiltersProps> = ({
  filters,
  onClearFilter,
  onClearAll,
  className
}) => {
  // 获取筛选条件标签
  const getFilterTags = () => {
    const tags: Array<{
      key: keyof BrandFiltersType;
      label: string;
      value: string;
    }> = [];

    if (filters.keyword) {
      tags.push({
        key: 'keyword',
        label: '关键词',
        value: filters.keyword
      });
    }

    if (filters.brandType) {
      tags.push({
        key: 'brandType',
        label: '品牌类型',
        value: BRAND_CONSTANTS.TYPE_LABELS[filters.brandType]
      });
    }

    if (filters.status) {
      tags.push({
        key: 'status',
        label: '状态',
        value: BRAND_CONSTANTS.STATUS_COLORS[filters.status].text
      });
    }

    if (filters.category) {
      tags.push({
        key: 'category',
        label: '类目',
        value: filters.category
      });
    }

    return tags;
  };

  const filterTags = getFilterTags();

  // 如果没有筛选条件，不显示组件
  if (filterTags.length === 0) {
    return null;
  }

  return (
    <div className={`brand-filters ${className || ''}`} data-testid="brand-filters">
      <div className="filters-content">
        <Space wrap className="filter-tags" data-testid="active-filter-tags">
          {filterTags.map((tag) => (
            <Tag
              key={tag.key}
              closable
              onClose={() => onClearFilter(tag.key)}
              closeIcon={<CloseOutlined style={{ fontSize: 10 }} />}
              className="filter-tag"
              data-testid={`filter-tag-${tag.key}`}
            >
              <span className="filter-label">{tag.label}:</span>
              <span className="filter-value">{tag.value}</span>
            </Tag>
          ))}

          <Tag
            onClick={onClearAll}
            className="clear-all-tag"
            data-testid="clear-all-filters"
          >
            清除全部
          </Tag>
        </Space>
      </div>
    </div>
  );
};

export default BrandFilters;