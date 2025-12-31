/**
 * AddressForm Component Unit Tests
 *
 * @since 020-store-address
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import AddressForm, { type AddressFormData } from '../AddressForm';

// Wrapper component to provide Form context
const TestWrapper: React.FC<{
  initialValues?: Partial<AddressFormData>;
  onValuesChange?: (values: AddressFormData) => void;
}> = ({ initialValues, onValuesChange }) => {
  const [form] = Form.useForm<AddressFormData>();

  return <AddressForm form={form} initialValues={initialValues} showLabels={true} />;
};

describe('AddressForm', () => {
  describe('渲染测试', () => {
    it('应该正确渲染所有表单字段', () => {
      const [form] = Form.useForm<AddressFormData>();
      render(<AddressForm form={form} />);

      expect(screen.getByPlaceholderText('请输入省份')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('请输入城市')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('请输入区县')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('请输入详细地址（如街道、门牌号等）')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('请输入联系电话')).toBeInTheDocument();
    });

    it('应该正确显示初始值', () => {
      const [form] = Form.useForm<AddressFormData>();
      const initialValues: AddressFormData = {
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        address: '建国路88号',
        phone: '13800138000',
      };

      render(<AddressForm form={form} initialValues={initialValues} />);

      expect(screen.getByDisplayValue('北京市')).toBeInTheDocument();
      expect(screen.getByDisplayValue('朝阳区')).toBeInTheDocument();
      expect(screen.getByDisplayValue('建国路88号')).toBeInTheDocument();
      expect(screen.getByDisplayValue('13800138000')).toBeInTheDocument();
    });

    it('禁用状态下表单不可编辑', () => {
      const [form] = Form.useForm<AddressFormData>();
      render(<AddressForm form={form} disabled={true} />);

      const provinceInput = screen.getByPlaceholderText('请输入省份');
      expect(provinceInput).toBeDisabled();
    });
  });

  describe('验证测试', () => {
    it('省份为必填项', async () => {
      const [form] = Form.useForm<AddressFormData>();
      const { container } = render(
        <Form form={form}>
          <AddressForm form={form} />
        </Form>
      );

      // 触发表单验证
      try {
        await form.validateFields();
      } catch (error) {
        // 验证失败是预期的
      }

      await waitFor(() => {
        expect(screen.getByText('请输入省份')).toBeInTheDocument();
      });
    });

    it('城市为必填项', async () => {
      const [form] = Form.useForm<AddressFormData>();
      render(
        <Form form={form}>
          <AddressForm form={form} />
        </Form>
      );

      try {
        await form.validateFields();
      } catch (error) {
        // 验证失败是预期的
      }

      await waitFor(() => {
        expect(screen.getByText('请输入城市')).toBeInTheDocument();
      });
    });

    it('区县为必填项', async () => {
      const [form] = Form.useForm<AddressFormData>();
      render(
        <Form form={form}>
          <AddressForm form={form} />
        </Form>
      );

      try {
        await form.validateFields();
      } catch (error) {
        // 验证失败是预期的
      }

      await waitFor(() => {
        expect(screen.getByText('请输入区县')).toBeInTheDocument();
      });
    });
  });

  describe('电话验证测试', () => {
    it('应该接受有效的手机号', async () => {
      const [form] = Form.useForm<AddressFormData>();
      render(
        <Form form={form}>
          <AddressForm
            form={form}
            initialValues={{
              province: '北京市',
              city: '北京市',
              district: '朝阳区',
            }}
          />
        </Form>
      );

      const phoneInput = screen.getByPlaceholderText('请输入联系电话');
      await userEvent.type(phoneInput, '13800138000');

      // 验证应该通过
      const result = await form.validateFields().catch(() => null);
      expect(result).not.toBeNull();
    });

    it('应该接受有效的座机号', async () => {
      const [form] = Form.useForm<AddressFormData>();
      render(
        <Form form={form}>
          <AddressForm
            form={form}
            initialValues={{
              province: '北京市',
              city: '北京市',
              district: '朝阳区',
            }}
          />
        </Form>
      );

      const phoneInput = screen.getByPlaceholderText('请输入联系电话');
      await userEvent.type(phoneInput, '010-12345678');

      const result = await form.validateFields().catch(() => null);
      expect(result).not.toBeNull();
    });

    it('应该接受400热线', async () => {
      const [form] = Form.useForm<AddressFormData>();
      render(
        <Form form={form}>
          <AddressForm
            form={form}
            initialValues={{
              province: '北京市',
              city: '北京市',
              district: '朝阳区',
            }}
          />
        </Form>
      );

      const phoneInput = screen.getByPlaceholderText('请输入联系电话');
      await userEvent.type(phoneInput, '400-123-4567');

      const result = await form.validateFields().catch(() => null);
      expect(result).not.toBeNull();
    });

    it('应该拒绝无效的电话号码格式', async () => {
      const [form] = Form.useForm<AddressFormData>();
      render(
        <Form form={form}>
          <AddressForm
            form={form}
            initialValues={{
              province: '北京市',
              city: '北京市',
              district: '朝阳区',
            }}
          />
        </Form>
      );

      const phoneInput = screen.getByPlaceholderText('请输入联系电话');
      await userEvent.type(phoneInput, 'invalid-phone');

      try {
        await form.validateFields();
      } catch (error) {
        // 验证失败是预期的
      }

      await waitFor(() => {
        expect(screen.getByText(/电话格式不正确/)).toBeInTheDocument();
      });
    });

    it('电话为选填项，空值应该通过验证', async () => {
      const [form] = Form.useForm<AddressFormData>();
      render(
        <Form form={form}>
          <AddressForm
            form={form}
            initialValues={{
              province: '北京市',
              city: '北京市',
              district: '朝阳区',
            }}
          />
        </Form>
      );

      // 不填写电话，应该通过验证
      const result = await form.validateFields().catch(() => null);
      expect(result).not.toBeNull();
    });
  });

  describe('无障碍测试', () => {
    it('所有输入框应该有 aria-label', () => {
      const [form] = Form.useForm<AddressFormData>();
      render(<AddressForm form={form} />);

      expect(screen.getByLabelText('省份')).toBeInTheDocument();
      expect(screen.getByLabelText('城市')).toBeInTheDocument();
      expect(screen.getByLabelText('区县')).toBeInTheDocument();
      expect(screen.getByLabelText('详细地址')).toBeInTheDocument();
      expect(screen.getByLabelText('联系电话')).toBeInTheDocument();
    });
  });
});
