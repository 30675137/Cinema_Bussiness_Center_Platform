/**
 * StoreFormFields Component
 *
 * Shared form fields for create/edit store modals
 * Uses Ant Design Form components with React Hook Form integration
 * @since 022-store-crud
 */

import React, { useEffect } from 'react';
import { Form, Input, Select, Row, Col, DatePicker, InputNumber } from 'antd';
import { Controller, useWatch } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import { REGIONS, getCitiesByRegion, PROVINCES } from '../../../constants/regions';
import type { CreateStoreFormData } from '../validations/storeSchema';

interface StoreFormFieldsProps {
  control: Control<CreateStoreFormData>;
  errors?: FieldErrors<CreateStoreFormData>;
  disabled?: boolean;
}

/**
 * Shared form fields component for store create/edit
 */
const StoreFormFields: React.FC<StoreFormFieldsProps> = ({ control, errors, disabled = false }) => {
  // Watch region to update city options
  const selectedRegion = useWatch({ control, name: 'region' });
  const cityOptions = selectedRegion ? getCitiesByRegion(selectedRegion) : [];

  return (
    <>
      {/* 门店名称 */}
      <Form.Item
        label="门店名称"
        required
        validateStatus={errors?.name ? 'error' : undefined}
        help={errors?.name?.message}
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="请输入门店名称"
              maxLength={100}
              disabled={disabled}
              aria-label="门店名称"
            />
          )}
        />
      </Form.Item>

      {/* 区域和城市 */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="区域"
            required
            validateStatus={errors?.region ? 'error' : undefined}
            help={errors?.region?.message}
          >
            <Controller
              name="region"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="请选择区域"
                  options={REGIONS.map((r) => ({ label: r.label, value: r.value }))}
                  disabled={disabled}
                  aria-label="区域"
                />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="城市"
            required
            validateStatus={errors?.city ? 'error' : undefined}
            help={errors?.city?.message}
          >
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder={selectedRegion ? '请选择城市' : '请先选择区域'}
                  options={cityOptions}
                  disabled={disabled || !selectedRegion}
                  aria-label="城市"
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* 省份和区县 */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="省份"
            validateStatus={errors?.province ? 'error' : undefined}
            help={errors?.province?.message}
          >
            <Controller
              name="province"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="请选择省份"
                  options={PROVINCES.map((p) => ({ label: p.label, value: p.value }))}
                  disabled={disabled}
                  allowClear
                  aria-label="省份"
                />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="区县"
            validateStatus={errors?.district ? 'error' : undefined}
            help={errors?.district?.message}
          >
            <Controller
              name="district"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="请输入区县，如朝阳区"
                  maxLength={50}
                  disabled={disabled}
                  aria-label="区县"
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* 详细地址 */}
      <Form.Item
        label="详细地址"
        required
        validateStatus={errors?.address ? 'error' : undefined}
        help={errors?.address?.message}
      >
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <Input.TextArea
              {...field}
              placeholder="请输入详细地址，如建国路1号"
              rows={2}
              disabled={disabled}
              aria-label="详细地址"
            />
          )}
        />
      </Form.Item>

      {/* 联系电话 */}
      <Form.Item
        label="联系电话"
        required
        validateStatus={errors?.phone ? 'error' : undefined}
        help={errors?.phone?.message}
      >
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="手机号或座机号，如13912345678或010-12345678"
              maxLength={20}
              disabled={disabled}
              aria-label="联系电话"
            />
          )}
        />
      </Form.Item>

      {/* 023-store-cinema-fields: 影城信息 */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="开业时间"
            validateStatus={errors?.openingDate ? 'error' : undefined}
            help={errors?.openingDate?.message}
          >
            <Controller
              name="openingDate"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="YYYY-MM-DD，如2012-01-01"
                  maxLength={10}
                  disabled={disabled}
                  aria-label="开业时间"
                />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="面积(平方米)"
            validateStatus={errors?.area ? 'error' : undefined}
            help={errors?.area?.message}
          >
            <Controller
              name="area"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  placeholder="如4147"
                  min={1}
                  style={{ width: '100%' }}
                  disabled={disabled}
                  aria-label="面积"
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="影厅数"
            validateStatus={errors?.hallCount ? 'error' : undefined}
            help={errors?.hallCount?.message}
          >
            <Controller
              name="hallCount"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  placeholder="如7"
                  min={1}
                  style={{ width: '100%' }}
                  disabled={disabled}
                  aria-label="影厅数"
                />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="座位数"
            validateStatus={errors?.seatCount ? 'error' : undefined}
            help={errors?.seatCount?.message}
          >
            <Controller
              name="seatCount"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  placeholder="如785"
                  min={1}
                  style={{ width: '100%' }}
                  disabled={disabled}
                  aria-label="座位数"
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default StoreFormFields;
