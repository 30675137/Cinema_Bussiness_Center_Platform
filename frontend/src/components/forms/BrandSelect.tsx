import React, { useState, useEffect, useMemo } from 'react';
import { Select, Spin, Input, Button } from 'antd';
import type { SelectProps } from 'antd/es/select';
import type { Brand } from '@/types/spu';

const { Option } = Select;
const { Search } = Input;

interface BrandSelectProps extends Omit<SelectProps, 'options' | 'children'> {
  brands?: Brand[];
  loading?: boolean;
  onSearch?: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  showSearch?: boolean;
  filterOption?: boolean | ((input: string, option: any) => boolean);
}

export const BrandSelect: React.FC<BrandSelectProps> = ({
  brands = [],
  loading: externalLoading = false,
  onSearch,
  placeholder = '请选择品牌',
  allowClear = true,
  showSearch = true,
  filterOption = true,
  value,
  onChange,
  ...restProps
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);

  // 过滤品牌列表
  const filteredBrands = useMemo(() => {
    if (!searchValue || !filterOption) {
      return brands;
    }

    const lowerSearchValue = searchValue.toLowerCase();
    return brands.filter(
      (brand) =>
        brand.name.toLowerCase().includes(lowerSearchValue) ||
        brand.code?.toLowerCase().includes(lowerSearchValue) ||
        (brand.description && brand.description.toLowerCase().includes(lowerSearchValue))
    );
  }, [brands, searchValue, filterOption]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchValue(value);

    if (onSearch) {
      setLoading(true);
      onSearch(value);
      // 模拟搜索延迟
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  // 渲染品牌选项
  const renderBrandOption = (brand: Brand) => {
    return (
      <Option key={brand.id} value={brand.id}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {brand.logo && (
              <img
                src={brand.logo}
                alt={brand.name}
                style={{ width: 20, height: 20, marginRight: 8, borderRadius: 2 }}
                onError={(e) => {
                  // 图片加载失败时隐藏
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <span style={{ fontWeight: 500 }}>{brand.name}</span>
            {brand.code && (
              <span style={{ marginLeft: 8, color: '#999', fontSize: '12px' }}>({brand.code})</span>
            )}
          </div>
          {brand.status && (
            <span
              style={{
                fontSize: '12px',
                color: brand.status === 'active' ? '#52c41a' : '#999',
                backgroundColor: brand.status === 'active' ? '#f6ffed' : '#f5f5f5',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {brand.status === 'active' ? '启用' : '停用'}
            </span>
          )}
        </div>
        {brand.description && (
          <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
            {brand.description}
          </div>
        )}
      </Option>
    );
  };

  // 自定义过滤函数
  const customFilterOption = (input: string, option: any) => {
    if (typeof filterOption === 'function') {
      return filterOption(input, option);
    }

    if (filterOption === false) {
      return true;
    }

    const brand = brands.find((b) => b.id === option.value);
    if (!brand) return false;

    const lowerInput = input.toLowerCase();
    return (
      brand.name.toLowerCase().includes(lowerInput) ||
      (brand.code && brand.code.toLowerCase().includes(lowerInput)) ||
      (brand.description && brand.description.toLowerCase().includes(lowerInput))
    );
  };

  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      allowClear={allowClear}
      showSearch={showSearch}
      filterOption={customFilterOption}
      onSearch={handleSearch}
      loading={externalLoading || loading}
      notFoundContent={externalLoading || loading ? <Spin size="small" /> : '暂无品牌数据'}
      {...restProps}
    >
      {filteredBrands.map(renderBrandOption)}
    </Select>
  );
};

// 品牌选择组件（带搜索框）
export const BrandSelectWithSearch: React.FC<BrandSelectProps> = (props) => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (props.onSearch) {
      props.onSearch(value);
    }
  };

  return (
    <div>
      {searchVisible && (
        <div style={{ marginBottom: 8 }}>
          <Search
            placeholder="搜索品牌名称或编码"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={handleSearch}
            style={{ width: '100%' }}
            allowClear
          />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <BrandSelect
          {...props}
          style={{ flex: 1 }}
          filterOption={false} // 禁用内置过滤，使用外部搜索
        />
        <Button
          type="link"
          size="small"
          onClick={() => setSearchVisible(!searchVisible)}
          style={{ marginLeft: 8, flexShrink: 0 }}
        >
          {searchVisible ? '收起搜索' : '展开搜索'}
        </Button>
      </div>
    </div>
  );
};

// 多选品牌组件
export const BrandMultiSelect: React.FC<BrandSelectProps> = (props) => {
  return (
    <BrandSelect
      {...props}
      mode="multiple"
      placeholder={props.placeholder || '请选择品牌（可多选）'}
      maxTagCount="responsive"
      optionFilterProp="children"
    />
  );
};

// 品牌选择组件（只显示已选品牌）
export const BrandDisplay: React.FC<{
  brandId?: string;
  brands?: Brand[];
  showCode?: boolean;
  showStatus?: boolean;
}> = ({ brandId, brands = [], showCode = true, showStatus = true }) => {
  const brand = brands.find((b) => b.id === brandId);

  if (!brand) {
    return <span style={{ color: '#999' }}>未选择品牌</span>;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {brand.logo && (
        <img
          src={brand.logo}
          alt={brand.name}
          style={{ width: 16, height: 16, marginRight: 6, borderRadius: 2 }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      <span style={{ fontWeight: 500 }}>{brand.name}</span>
      {showCode && brand.code && (
        <span style={{ marginLeft: 6, color: '#999', fontSize: '12px' }}>({brand.code})</span>
      )}
      {showStatus && brand.status && (
        <span
          style={{
            marginLeft: 6,
            fontSize: '12px',
            color: brand.status === 'active' ? '#52c41a' : '#999',
            backgroundColor: brand.status === 'active' ? '#f6ffed' : '#f5f5f5',
            padding: '1px 4px',
            borderRadius: '2px',
          }}
        >
          {brand.status === 'active' ? '启用' : '停用'}
        </span>
      )}
    </div>
  );
};

export default BrandSelect;
