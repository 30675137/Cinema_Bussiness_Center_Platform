import React from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Typography,
  Space,
  Divider
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import type { Control, FieldErrors, FieldValues } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { MaterialType } from '@/types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface BasicInfoTabProps {
  control: Control<any>;
  errors: FieldErrors<FieldValues>;
  touched: Record<string, boolean>;
  materialType: MaterialType;
  setValue: (name: string, value: any) => void;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  control,
  errors,
  touched,
  materialType,
  setValue
}) => {
  return (
    <div className="basic-info-tab">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 基础信息 */}
        <div>
          <Title level={4} style={{ marginBottom: 16 }}>
            基础信息
          </Title>
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label="商品名称"
                required
                validateStatus={errors.name ? 'error' : undefined}
                help={errors.name?.message as string}
              >
                <Input
                  placeholder="请输入商品名称"
                  {...control.register('name')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="短标题"
                validateStatus={errors.shortTitle ? 'error' : undefined}
                help={errors.shortTitle?.message as string}
              >
                <Input
                  placeholder="请输入短标题（可选）"
                  {...control.register('shortTitle')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label="商品类目"
                required
                validateStatus={errors.categoryId ? 'error' : undefined}
                help={errors.categoryId?.message as string}
              >
                <Select
                  placeholder="请选择商品类目"
                  {...control.register('categoryId')}
                  onChange={(value) => setValue('categoryId', value)}
                >
                  <Option value="food">食品</Option>
                  <Option value="beverage">饮料</Option>
                  <Option value="merchandise">商品</Option>
                  <Option value="ticket">票券</Option>
                  <Option value="service">服务</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="物料类型"
                required
                validateStatus={errors.materialType ? 'error' : undefined}
                help={errors.materialType?.message as string}
              >
                <Select
                  placeholder="请选择物料类型"
                  {...control.register('materialType')}
                  onChange={(value) => setValue('materialType', value)}
                >
                  <Option value="raw_material">原材料</Option>
                  <Option value="semi_finished">半成品</Option>
                  <Option value="finished_goods">成品</Option>
                  <Option value="consumable">消耗品</Option>
                  <Option value="packaging">包装材料</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="商品描述"
            validateStatus={errors.description ? 'error' : undefined}
            help={errors.description?.message as string}
          >
            <TextArea
              rows={3}
              placeholder="请输入商品描述（可选）"
              {...control.register('description')}
            />
          </Form.Item>
        </div>

        <Divider />

        {/* 价格与规格 */}
        <div>
          <Title level={4} style={{ marginBottom: 16 }}>
            价格与规格
          </Title>
          <Row gutter={[16, 0]}>
            <Col span={8}>
              <Form.Item
                label="基础价格"
                required
                validateStatus={errors.basePrice ? 'error' : undefined}
                help={errors.basePrice?.message as string}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0.00"
                  min={0}
                  max={999999}
                  precision={2}
                  addonBefore="¥"
                  {...control.register('basePrice', {
                    valueAsNumber: true
                  })}
                  onChange={(value) => setValue('basePrice', value || 0)}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="单位"
                validateStatus={errors.unit ? 'error' : undefined}
                help={errors.unit?.message as string}
              >
                <Select
                  placeholder="请选择单位"
                  {...control.register('unit')}
                  onChange={(value) => setValue('unit', value)}
                  allowClear
                >
                  <Option value="个">个</Option>
                  <Option value="件">件</Option>
                  <Option value="盒">盒</Option>
                  <Option value="袋">袋</Option>
                  <Option value="瓶">瓶</Option>
                  <Option value="罐">罐</Option>
                  <Option value="份">份</Option>
                  <Option value="套">套</Option>
                  <Option value="千克">千克</Option>
                  <Option value="克">克</Option>
                  <Option value="升">升</Option>
                  <Option value="毫升">毫升</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="品牌"
                validateStatus={errors.brand ? 'error' : undefined}
                help={errors.brand?.message as string}
              >
                <Input
                  placeholder="请输入品牌（可选）"
                  {...control.register('brand')}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* 物理属性 */}
        <div>
          <Title level={4} style={{ marginBottom: 16 }}>
            物理属性
            <Text type="secondary" style={{ fontWeight: 'normal', marginLeft: 8 }}>
              <InfoCircleOutlined /> 可选填
            </Text>
          </Title>
          <Row gutter={[16, 0]}>
            <Col span={6}>
              <Form.Item
                label="重量(kg)"
                validateStatus={errors.weight ? 'error' : undefined}
                help={errors.weight?.message as string}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0.00"
                  min={0}
                  max={1000000}
                  precision={3}
                  step={0.001}
                  {...control.register('weight', {
                    valueAsNumber: true
                  })}
                  onChange={(value) => setValue('weight', value || undefined)}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="体积(m³)"
                validateStatus={errors.volume ? 'error' : undefined}
                help={errors.volume?.message as string}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0.00"
                  min={0}
                  max={1000000}
                  precision={4}
                  step={0.0001}
                  {...control.register('volume', {
                    valueAsNumber: true
                  })}
                  onChange={(value) => setValue('volume', value || undefined)}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="保质期(天)"
                validateStatus={errors.shelfLife ? 'error' : undefined}
                help={errors.shelfLife?.message as string}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0"
                  min={0}
                  max={36500}
                  precision={0}
                  {...control.register('shelfLife', {
                    valueAsNumber: true
                  })}
                  onChange={(value) => setValue('shelfLife', value || undefined)}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="条形码"
                validateStatus={errors.barcode ? 'error' : undefined}
                help={errors.barcode?.message as string}
              >
                <Input
                  placeholder="请输入条形码"
                  {...control.register('barcode')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="储存条件"
            validateStatus={errors.storageCondition ? 'error' : undefined}
            help={errors.storageCondition?.message as string}
          >
            <Input
              placeholder="请输入储存条件（可选）"
              {...control.register('storageCondition')}
            />
          </Form.Item>
        </div>

        <Divider />

        {/* 状态设置 */}
        <div>
          <Title level={4} style={{ marginBottom: 16 }}>
            状态设置
          </Title>
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label="商品状态"
                required
                validateStatus={errors.status ? 'error' : undefined}
                help={errors.status?.message as string}
              >
                <Select
                  placeholder="请选择商品状态"
                  {...control.register('status')}
                  onChange={(value) => setValue('status', value)}
                >
                  <Option value="draft">草稿</Option>
                  <Option value="active">上架</Option>
                  <Option value="inactive">下架</Option>
                  <Option value="pending">待审核</Option>
                  <Option value="rejected">已驳回</Option>
                  <Option value="discontinued">已停产</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Space>
    </div>
  );
};

export default BasicInfoTab;