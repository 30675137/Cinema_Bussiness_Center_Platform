import React, { useState } from 'react';
import { Card, Form, Input, Select, Button, Space, DatePicker, Tag } from 'antd';
import { SearchOutlined, ReloadOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { SPUFilters } from '../../../types/spu';
import { CategoryItem } from '../../../types/category';
import { BrandItem } from '../../../types/brand';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface SPUFiltersProps {
  categories: CategoryItem[];
  brands: BrandItem[];
  filters: SPUFilters;
  onSearch: (keyword: string) => void;
  onFilter: (key: string, value: any) => void;
  onReset: () => void;
}

// 状态选项
const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' },
  { label: '草稿', value: 'draft' }
];

// 标签选项（可以从数据中动态获取）
const tagOptions = [
  { label: '饮料', value: '饮料' },
  { label: '碳酸饮料', value: '碳酸饮料' },
  { label: '果汁', value: '果汁' },
  { label: '茶饮料', value: '茶饮料' },
  { label: '零食', value: '零食' },
  { label: '饼干', value: '饼干' },
  { label: '薯片', value: '薯片' },
  { label: '坚果', value: '坚果' },
  { label: '糖果', value: '糖果' },
  { label: '巧克力', value: '巧克力' },
  { label: '新品', value: '新品' },
  { label: '热销', value: '热销' },
  { label: '促销', value: '促销' },
  { label: '推荐', value: '推荐' },
  { label: '进口', value: '进口' },
  { label: '有机', value: '有机' }
];

const SPUFilters: React.FC<SPUFiltersProps> = ({
  categories,
  brands,
  filters,
  onSearch,
  onFilter,
  onReset
}) => {
  const [expanded, setExpanded] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(filters.keyword || '');

  const handleSearch = () => {
    onSearch(searchKeyword.trim());
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const hasAdvancedFilters = filters.brandId || filters.categoryId ||
    filters.status || (filters.tags && filters.tags.length > 0) ||
    filters.dateRange;

  return (
    <Card className="mb-4" title="筛选条件">
      <div className="space-y-4">
        {/* 基础搜索 */}
        <div className="flex gap-4 items-end">
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              搜索关键词
            </label>
            <Input
              placeholder="支持SPU名称、编码搜索"
              value={searchKeyword}
              onChange={handleKeywordChange}
              onKeyPress={handleKeyPress}
              allowClear
              suffix={
                <Button
                  type="text"
                  size="small"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  className="hover:bg-gray-100"
                />
              }
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => onSearch(searchKeyword.trim())}>
              搜索
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={onReset}
              type="default"
            >
              重置
            </Button>

            {hasAdvancedFilters && (
              <Button
                type="link"
                icon={expanded ? <UpOutlined /> : <DownOutlined />}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? '收起筛选' : '展开筛选'}
              </Button>
            )}
          </div>
        </div>

        {/* 高级筛选 */}
        {(expanded || hasAdvancedFilters) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            {/* 品牌筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                品牌
              </label>
              <Select
                placeholder="全部品牌"
                value={filters.brandId}
                onChange={(value) => onFilter('brandId', value)}
                allowClear
                style={{ width: '100%' }}
                showSearch
                filterOption={(input, option) =>
                  option?.children?.toString().toLowerCase().includes(input.toLowerCase())
                }
              >
                {brands.map(brand => (
                  <Option key={brand.id} value={brand.id}>
                    {brand.name}
                  </Option>
                ))}
              </Select>
            </div>

            {/* 分类筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分类
              </label>
              <Select
                placeholder="全部分类"
                value={filters.categoryId}
                onChange={(value) => onFilter('categoryId', value)}
                allowClear
                style={{ width: '100%' }}
                showSearch
                filterOption={(input, option) =>
                  option?.children?.toString().toLowerCase().includes(input.toLowerCase())
                }
              >
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </div>

            {/* 状态筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                状态
              </label>
              <Select
                placeholder="全部状态"
                value={filters.status}
                onChange={(value) => onFilter('status', value)}
                allowClear
                style={{ width: '100%' }}
              >
                {statusOptions.map(status => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </div>

            {/* 标签筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标签
              </label>
              <Select
                mode="multiple"
                placeholder="选择标签"
                value={filters.tags || []}
                onChange={(value) => onFilter('tags', value)}
                allowClear
                style={{ width: '100%' }}
                maxTagCount={2}
                maxTagPlaceholder={(omittedValues) => (
                  <span>+{omittedValues.length}...</span>
                )}
              >
                {tagOptions.map(tag => (
                  <Option key={tag.value} value={tag.value}>
                    {tag.label}
                  </Option>
                ))}
              </Select>
            </div>

            {/* 日期范围筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                创建时间
              </label>
              <RangePicker
                value={filters.dateRange ? [
                  dayjs(filters.dateRange[0]),
                  dayjs(filters.dateRange[1])
                ] : null}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    onFilter('dateRange', [
                      dates[0].startOf('day').toISOString(),
                      dates[1].endOf('day').toISOString()
                    ]);
                  } else {
                    onFilter('dateRange', undefined);
                  }
                }}
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                placeholder={['开始日期', '结束日期']}
              />
            </div>

            {/* 价格范围筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                价格范围
              </label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="最低价"
                  value={filters.minPrice}
                  onChange={(e) => onFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                  style={{ width: '45%' }}
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder="最高价"
                  value={filters.maxPrice}
                  onChange={(e) => onFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                  style={{ width: '45%' }}
                />
              </div>
            </div>

            {/* 库存筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                库存状态
              </label>
              <Select
                placeholder="全部库存"
                value={filters.lowStock}
                onChange={(value) => onFilter('lowStock', value)}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value={true}>库存不足</Option>
                <Option value={false}>库存充足</Option>
              </Select>
            </div>
          </div>
        )}

        {/* 当前筛选条件显示 */}
        {hasAdvancedFilters && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>当前筛选:</span>
              {filters.brandId && (
                <Tag
                  closable
                  onClose={() => onFilter('brandId', undefined)}
                >
                  品牌: {brands.find(b => b.id === filters.brandId)?.name}
                </Tag>
              )}
              {filters.categoryId && (
                <Tag
                  closable
                  onClose={() => onFilter('categoryId', undefined)}
                >
                  分类: {categories.find(c => c.id === filters.categoryId)?.name}
                </Tag>
              )}
              {filters.status && (
                <Tag
                  closable
                  onClose={() => onFilter('status', undefined)}
                >
                  状态: {statusOptions.find(s => s.value === filters.status)?.label}
                </Tag>
              )}
              {filters.tags && filters.tags.length > 0 && (
                <Tag
                  closable
                  onClose={() => onFilter('tags', undefined)}
                >
                  标签: {filters.tags.join(', ')}
                </Tag>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SPUFilters;