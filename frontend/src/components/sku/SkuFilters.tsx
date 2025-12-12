/**
 * SKU筛选器组件
 * 支持关键字搜索、SPU、品牌、类目、状态、是否管理库存等筛选条件
 */
import React, { useEffect } from 'react';
import { Form, Input, Select, Button, Space, Card } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { SkuQueryParams } from '@/types/sku';
import { SkuStatus } from '@/types/sku';
import { useSkuStore } from '@/stores/skuStore';
import { useSpusQuery } from '@/hooks/useSku';
import { useResponsive } from '@/hooks/useResponsive';

const { Option } = Select;

interface SkuFiltersProps {
  onFilter: (values: Partial<SkuQueryParams>) => void;
  onReset: () => void;
  loading?: boolean;
}

/**
 * SKU筛选器组件
 */
export const SkuFilters: React.FC<SkuFiltersProps> = ({
  onFilter,
  onReset,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const { isMobile, isTablet } = useResponsive();
  const store = useSkuStore();
  const filters = store.filters || { status: 'all' };
  const { setFilters, clearFilters } = store;
  const { data: spus = [] } = useSpusQuery();

  // 同步store中的筛选条件到表单
  useEffect(() => {
    if (filters) {
      form.setFieldsValue({
        keyword: filters.keyword,
        spuId: filters.spuId,
        brand: filters.brand,
        categoryId: filters.categoryId,
        status: filters.status || 'all',
        manageInventory: filters.manageInventory,
      });
    }
  }, [filters, form]);

  const handleFinish = (values: any) => {
    const params: Partial<SkuQueryParams> = {
      keyword: values.keyword,
      spuId: values.spuId,
      brand: values.brand,
      categoryId: values.categoryId,
      status: values.status === 'all' ? undefined : values.status,
      manageInventory: values.manageInventory,
    };

    // 更新store
    setFilters(params);
    onFilter(params);
  };

  const handleReset = () => {
    form.resetFields();
    clearFilters();
    onReset();
  };

  // 状态选项
  const statusOptions = [
    { label: '全部', value: 'all' },
    { label: '草稿', value: SkuStatus.DRAFT },
    { label: '启用', value: SkuStatus.ENABLED },
    { label: '停用', value: SkuStatus.DISABLED },
  ];

  // 是否管理库存选项
  const manageInventoryOptions = [
    { label: '全部', value: undefined },
    { label: '是', value: true },
    { label: '否', value: false },
  ];

  // 从SPU列表中提取唯一的品牌和类目
  const brands = Array.from(new Set(spus.map(spu => spu.brand))).sort();
  const categories = Array.from(
    new Set(spus.map(spu => ({ id: spu.categoryId, name: spu.category })))
  ).sort((a, b) => a.name.localeCompare(b.name));

  const formLayout = isMobile
    ? { labelCol: { span: 24 }, wrapperCol: { span: 24 } }
    : { labelCol: { span: 6 }, wrapperCol: { span: 18 } };

  return (
    <Card size="small" style={{ marginBottom: 16 }} data-testid="sku-filters">
      <Form
        form={form}
        onFinish={handleFinish}
        {...formLayout}
        style={{ marginBottom: 0 }}
        data-testid="sku-filters-form"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? '1fr'
              : isTablet
              ? 'repeat(2, 1fr)'
              : 'repeat(4, 1fr)',
            gap: 16,
            marginBottom: 16,
          }}
        >
          <Form.Item label="关键字" name="keyword" style={{ marginBottom: 0 }}>
            <Input
              placeholder="SKU编码/名称/条码"
              prefix={<SearchOutlined />}
              allowClear
              data-testid="sku-filter-keyword"
            />
          </Form.Item>

          <Form.Item label="所属SPU" name="spuId" style={{ marginBottom: 0 }}>
            <Select
              placeholder="选择SPU"
              showSearch
              filterOption={(input, option) =>
                (option?.children as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              allowClear
              data-testid="sku-filter-spu"
            >
              {spus.map((spu) => (
                <Option key={spu.id} value={spu.id}>
                  {spu.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="品牌" name="brand" style={{ marginBottom: 0 }}>
            <Select
              placeholder="选择品牌"
              showSearch
              filterOption={(input, option) =>
                (option?.children as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              allowClear
              data-testid="sku-filter-brand"
            >
              {brands.map((brand) => (
                <Option key={brand} value={brand}>
                  {brand}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="类目" name="categoryId" style={{ marginBottom: 0 }}>
            <Select
              placeholder="选择类目"
              showSearch
              filterOption={(input, option) =>
                (option?.children as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              allowClear
              data-testid="sku-filter-category"
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="状态" name="status" style={{ marginBottom: 0 }}>
            <Select 
              placeholder="选择状态" 
              options={statusOptions}
              data-testid="sku-filter-status"
            />
          </Form.Item>

          <Form.Item
            label="是否管理库存"
            name="manageInventory"
            style={{ marginBottom: 0 }}
          >
            <Select
              placeholder="选择选项"
              options={manageInventoryOptions}
              allowClear
              data-testid="sku-filter-manage-inventory"
            />
          </Form.Item>
        </div>

        <Form.Item
          style={{ marginBottom: 0, textAlign: isMobile ? 'center' : 'right' }}
        >
          <Space>
            <Button 
              onClick={handleReset} 
              icon={<ReloadOutlined />}
              data-testid="sku-filter-reset-button"
            >
              重置
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SearchOutlined />}
              data-testid="sku-filter-submit-button"
            >
              查询
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SkuFilters;

