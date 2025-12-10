import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Row,
  Col,
  Card,
  Collapse,
  Tag,
  AutoComplete
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  ClearOutlined,
  FilterOutlined,
  ShoppingCartOutlined,
  ShopOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { debounce } from 'lodash-es';

import {
  TransactionType,
  SourceType,
  TRANSACTION_TYPE_OPTIONS,
  SOURCE_TYPE_OPTIONS
} from '@/types/inventory';

const { RangePicker } = DatePicker;
const { Panel } = Collapse;

interface InventorySearchPanelProps {
  form: any;
  onSearch: (values: any) => void;
  onReset: () => void;
  onSKUSelect: (skuIds: string[]) => void;
  onStoreSelect: (storeIds: string[]) => void;
  loading?: boolean;
}

// 模拟SKU数据
const mockSKUs = [
  { id: 'SKU001', name: '可口可乐330ml', code: 'SKU001', category: '饮料' },
  { id: 'SKU002', name: '爆米花中份', code: 'SKU002', category: '零食' },
  { id: 'SKU003', name: '电影票-成人', code: 'SKU003', category: '票务' },
  { id: 'SKU004', name: '3D眼镜', code: 'SKU004', category: '设备' },
  { id: 'SKU005', name: '热狗套餐', code: 'SKU005', category: '套餐' }
];

// 模拟门店数据
const mockStores = [
  { id: 'STORE001', name: '万达影城CBD店', code: 'WM001', address: '北京市朝阳区CBD' },
  { id: 'STORE002', name: '万达影城三里屯店', code: 'WM002', address: '北京市朝阳区三里屯' },
  { id: 'STORE003', name: '万达影城五道口店', code: 'WM003', address: '北京市海淀区五道口' },
  { id: 'STORE004', name: '万达影城西单店', code: 'WM004', address: '北京市西城区西单' }
];

const InventorySearchPanel: React.FC<InventorySearchPanelProps> = ({
  form,
  onSearch,
  onReset,
  onSKUSelect,
  onStoreSelect,
  loading = false
}) => {
  const [selectedSKUs, setSelectedSKUs] = useState<string[]>([]);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);

  // 处理搜索
  const handleSearch = () => {
    form.validateFields().then(values => {
      onSearch(values);
    });
  };

  // 处理重置
  const handleReset = () => {
    form.resetFields();
    setSelectedSKUs([]);
    setSelectedStores([]);
    onSKUSelect([]);
    onStoreSelect([]);
    onReset();
  };

  // 处理SKU选择
  const handleSKUChange = (skuIds: string[]) => {
    setSelectedSKUs(skuIds);
    onSKUSelect(skuIds);
  };

  // 处理门店选择
  const handleStoreChange = (storeIds: string[]) => {
    setSelectedStores(storeIds);
    onStoreSelect(storeIds);
  };

  // SKU搜索建议
  const handleSKUSearch = debounce((value: string) => {
    console.log('搜索SKU:', value);
  }, 300);

  // 门店搜索建议
  const handleStoreSearch = debounce((value: string) => {
    console.log('搜索门店:', value);
  }, 300);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        dateRange: [dayjs().subtract(7, 'day'), dayjs()],
        transactionType: [],
        sourceType: []
      }}
    >
      <Row gutter={[16, 16]}>
        {/* 基础搜索条件 */}
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="商品搜索" name="keyword">
            <Input
              placeholder="输入商品名称、编码或门店信息"
              prefix={<SearchOutlined />}
              allowClear
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Form.Item label="商品选择" name="skuIds">
            <Select
              mode="multiple"
              placeholder="选择要查询的商品"
              value={selectedSKUs}
              onChange={handleSKUChange}
              onSearch={handleSKUSearch}
              filterOption={false}
              showSearch
              allowClear
              style={{ width: '100%' }}
            >
              {mockSKUs.map(sku => (
                <Select.Option key={sku.id} value={sku.id}>
                  <Space>
                    <ShoppingCartOutlined />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{sku.name}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {sku.code} | {sku.category}
                      </div>
                    </div>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Form.Item label="门店选择" name="storeIds">
            <Select
              mode="multiple"
              placeholder="选择要查询的门店"
              value={selectedStores}
              onChange={handleStoreChange}
              onSearch={handleStoreSearch}
              filterOption={false}
              showSearch
              allowClear
              style={{ width: '100%' }}
            >
              {mockStores.map(store => (
                <Select.Option key={store.id} value={store.id}>
                  <Space>
                    <ShopOutlined />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{store.name}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {store.code} | {store.address}
                      </div>
                    </div>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {/* 时间范围 */}
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="时间范围" name="dateRange">
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
              format="YYYY-MM-DD"
              showTime={false}
            />
          </Form.Item>
        </Col>

        {/* 操作按钮 */}
        <Col xs={24} sm={12} md={16}>
          <Form.Item label=" " colon={false}>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={loading}
              >
                搜索
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                disabled={loading}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Col>
      </Row>

      {/* 高级搜索条件 */}
      <Collapse ghost style={{ marginTop: '16px' }}>
        <Panel
          header={
            <Space>
              <FilterOutlined />
              高级筛选
            </Space>
          }
          key="advanced"
        >
          <Row gutter={[16, 16]}>
            {/* 交易类型 */}
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="交易类型" name="transactionType">
                <Select
                  mode="multiple"
                  placeholder="选择交易类型"
                  allowClear
                  style={{ width: '100%' }}
                >
                  {TRANSACTION_TYPE_OPTIONS.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      <Tag color={option.color}>{option.label}</Tag>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* 来源类型 */}
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="来源类型" name="sourceType">
                <Select
                  mode="multiple"
                  placeholder="选择来源类型"
                  allowClear
                  style={{ width: '100%' }}
                >
                  {SOURCE_TYPE_OPTIONS.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      <Tag color={option.color}>{option.label}</Tag>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* 批次号 */}
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="批次号" name="batchNumber">
                <Input placeholder="输入批次号" allowClear />
              </Form.Item>
            </Col>

            {/* 操作人 */}
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="操作人" name="operatorId">
                <Input placeholder="输入操作人" allowClear />
              </Form.Item>
            </Col>

            {/* 最低数量 */}
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="最低数量" name="minQuantity">
                <Input
                  type="number"
                  placeholder="输入最低数量"
                  min={0}
                  allowClear
                />
              </Form.Item>
            </Col>

            {/* 最高数量 */}
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="最高数量" name="maxQuantity">
                <Input
                  type="number"
                  placeholder="输入最高数量"
                  min={0}
                  allowClear
                />
              </Form.Item>
            </Col>

            {/* 单价范围 */}
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="最低单价" name="minUnitCost">
                <Input
                  type="number"
                  placeholder="输入最低单价"
                  min={0}
                  step={0.01}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item label="最高单价" name="maxUnitCost">
                <Input
                  type="number"
                  placeholder="输入最高单价"
                  min={0}
                  step={0.01}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          {/* 已选择的条件显示 */}
          {(selectedSKUs.length > 0 || selectedStores.length > 0) && (
            <Row style={{ marginTop: '16px' }}>
              <Col span={24}>
                <Space wrap>
                  {selectedSKUs.length > 0 && (
                    <div>
                      <span style={{ marginRight: '8px', color: '#999' }}>已选商品:</span>
                      {selectedSKUs.map(skuId => {
                        const sku = mockSKUs.find(s => s.id === skuId);
                        return sku ? (
                          <Tag
                            key={skuId}
                            closable
                            onClose={() => {
                              const newSKUs = selectedSKUs.filter(id => id !== skuId);
                              setSelectedSKUs(newSKUs);
                              onSKUSelect(newSKUs);
                            }}
                          >
                            {sku.name}
                          </Tag>
                        ) : null;
                      })}
                    </div>
                  )}

                  {selectedStores.length > 0 && (
                    <div>
                      <span style={{ marginRight: '8px', color: '#999' }}>已选门店:</span>
                      {selectedStores.map(storeId => {
                        const store = mockStores.find(s => s.id === storeId);
                        return store ? (
                          <Tag
                            key={storeId}
                            closable
                            onClose={() => {
                              const newStores = selectedStores.filter(id => id !== storeId);
                              setSelectedStores(newStores);
                              onStoreSelect(newStores);
                            }}
                          >
                            {store.name}
                          </Tag>
                        ) : null;
                      })}
                    </div>
                  )}
                </Space>
              </Col>
            </Row>
          )}

          {/* 快速搜索按钮组 */}
          <Row style={{ marginTop: '16px' }}>
            <Col span={24}>
              <Space wrap>
                <Text type="secondary">快速筛选:</Text>
                <Button
                  size="small"
                  onClick={() => {
                    form.setFieldsValue({
                      transactionType: [
                        TransactionType.PURCHASE_IN,
                        TransactionType.TRANSFER_IN,
                        TransactionType.PRODUCTION_IN
                      ]
                    });
                    handleSearch();
                  }}
                >
                  入库记录
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    form.setFieldsValue({
                      transactionType: [
                        TransactionType.SALE_OUT,
                        TransactionType.TRANSFER_OUT,
                        TransactionType.DAMAGE_OUT
                      ]
                    });
                    handleSearch();
                  }}
                >
                  出库记录
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    form.setFieldsValue({
                      dateRange: [dayjs().subtract(1, 'day'), dayjs()]
                    });
                    handleSearch();
                  }}
                >
                  昨天
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    form.setFieldsValue({
                      dateRange: [dayjs().subtract(7, 'day'), dayjs()]
                    });
                    handleSearch();
                  }}
                >
                  最近7天
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    form.setFieldsValue({
                      dateRange: [dayjs().subtract(30, 'day'), dayjs()]
                    });
                    handleSearch();
                  }}
                >
                  最近30天
                </Button>
              </Space>
            </Col>
          </Row>
        </Panel>
      </Collapse>
    </Form>
  );
};

export default InventorySearchPanel;