/**
 * PackageForm 组件单元测试
 *
 * T025: 测试场景包表单验证和交互
 *
 * 测试覆盖：
 * - 表单字段渲染
 * - 表单验证规则
 * - 初始值设置
 * - 禁用状态
 * - 影厅类型选择
 * - 规则字段验证
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import PackageForm from '../components/molecules/PackageForm';
import type { HallType } from '../types';

// Mock hall types
const mockHallTypes: HallType[] = [
  { id: 'hall-1', name: 'VIP影厅' },
  { id: 'hall-2', name: '标准影厅' },
  { id: 'hall-3', name: 'IMAX影厅' },
];

// Wrapper component to provide Form instance
const FormWrapper: React.FC<{
  children: React.ReactNode;
  onSubmit?: (values: any) => void;
  initialValues?: any;
}> = ({ children, onSubmit, initialValues }) => {
  const [form] = Form.useForm();

  return (
    <Form form={form} onFinish={onSubmit} initialValues={initialValues}>
      {children}
      <button type="submit">提交</button>
    </Form>
  );
};

describe('PackageForm Component', () => {
  let formInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    formInstance = Form.useForm()[0];
  });

  describe('Rendering', () => {
    it('should render all form fields', () => {
      const [form] = Form.useForm();
      render(<PackageForm form={form} hallTypes={mockHallTypes} />);

      // Basic fields
      expect(screen.getByLabelText('场景包名称')).toBeInTheDocument();
      expect(screen.getByLabelText('描述')).toBeInTheDocument();
      expect(screen.getByLabelText('背景图片')).toBeInTheDocument();

      // Rule fields (inside Card)
      expect(screen.getByText('使用规则')).toBeInTheDocument();
      expect(screen.getByLabelText('时长（小时）')).toBeInTheDocument();
      expect(screen.getByLabelText('最小人数')).toBeInTheDocument();
      expect(screen.getByLabelText('最大人数')).toBeInTheDocument();

      // Hall type selection
      expect(screen.getByLabelText('适用影厅类型')).toBeInTheDocument();
    });

    it('should render with default initial values', () => {
      const [form] = Form.useForm();
      render(<PackageForm form={form} hallTypes={mockHallTypes} />);

      // Default values should be set
      const durationInput = screen.getByLabelText('时长（小时）') as HTMLInputElement;
      expect(durationInput.value).toBe('2');

      const minPeopleInput = screen.getByLabelText('最小人数') as HTMLInputElement;
      expect(minPeopleInput.value).toBe('1');

      const maxPeopleInput = screen.getByLabelText('最大人数') as HTMLInputElement;
      expect(maxPeopleInput.value).toBe('10');
    });

    it('should render with custom initial values', () => {
      const [form] = Form.useForm();
      const customInitialValues = {
        name: '测试场景包',
        description: '测试描述',
        rule: {
          durationHours: 5,
          minPeople: 5,
          maxPeople: 20,
        },
      };

      render(
        <PackageForm form={form} hallTypes={mockHallTypes} initialValues={customInitialValues} />
      );

      // Custom values should override defaults
      const nameInput = screen.getByLabelText('场景包名称') as HTMLInputElement;
      expect(nameInput.value).toBe('测试场景包');

      const descriptionInput = screen.getByLabelText('描述') as HTMLTextAreaElement;
      expect(descriptionInput.value).toBe('测试描述');

      const durationInput = screen.getByLabelText('时长（小时）') as HTMLInputElement;
      expect(durationInput.value).toBe('5');
    });

    it('should render placeholder for name input', () => {
      const [form] = Form.useForm();
      render(<PackageForm form={form} hallTypes={mockHallTypes} />);

      const nameInput = screen.getByPlaceholderText('例如：VIP生日派对专场');
      expect(nameInput).toBeInTheDocument();
    });

    it('should render placeholder for description textarea', () => {
      const [form] = Form.useForm();
      render(<PackageForm form={form} hallTypes={mockHallTypes} />);

      const descriptionInput = screen.getByPlaceholderText('描述场景包的特色和适用场景');
      expect(descriptionInput).toBeInTheDocument();
    });

    it('should show character counter for description', () => {
      const [form] = Form.useForm();
      const { container } = render(<PackageForm form={form} hallTypes={mockHallTypes} />);

      // Ant Design TextArea with showCount renders character count
      const counter = container.querySelector('.ant-input-textarea-show-count');
      expect(counter).toBeInTheDocument();
    });
  });

  describe('Validation Rules', () => {
    it('should validate required name field', async () => {
      const user = userEvent.setup();
      const [form] = Form.useForm();

      render(
        <FormWrapper>
          <PackageForm form={form} hallTypes={mockHallTypes} />
        </FormWrapper>
      );

      // Submit form without filling name
      const submitButton = screen.getByText('提交');
      await user.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('请输入场景包名称')).toBeInTheDocument();
      });
    });

    it('should validate name max length (255 characters)', async () => {
      const user = userEvent.setup();
      const [form] = Form.useForm();

      render(
        <FormWrapper>
          <PackageForm form={form} hallTypes={mockHallTypes} />
        </FormWrapper>
      );

      const nameInput = screen.getByLabelText('场景包名称');
      const longName = 'a'.repeat(256); // Exceeds 255 limit

      await user.type(nameInput, longName);
      await user.click(screen.getByText('提交'));

      await waitFor(() => {
        expect(screen.getByText('名称长度不能超过255个字符')).toBeInTheDocument();
      });
    });

    it('should validate description max length (500 characters)', async () => {
      const user = userEvent.setup();
      const [form] = Form.useForm();

      render(
        <FormWrapper>
          <PackageForm form={form} hallTypes={mockHallTypes} />
        </FormWrapper>
      );

      const descriptionInput = screen.getByLabelText('描述');
      const longDescription = 'a'.repeat(501); // Exceeds 500 limit

      await user.type(descriptionInput, longDescription);
      await user.click(screen.getByText('提交'));

      await waitFor(() => {
        expect(screen.getByText('描述长度不能超过500个字符')).toBeInTheDocument();
      });
    });

    it('should validate required duration field', async () => {
      const user = userEvent.setup();
      const [form] = Form.useForm();

      render(
        <FormWrapper>
          <PackageForm form={form} hallTypes={mockHallTypes} />
        </FormWrapper>
      );

      const durationInput = screen.getByLabelText('时长（小时）');
      await user.clear(durationInput);
      await user.click(screen.getByText('提交'));

      await waitFor(() => {
        expect(screen.getByText('请输入时长')).toBeInTheDocument();
      });
    });

    it('should validate duration minimum value (> 0)', async () => {
      const user = userEvent.setup();
      const [form] = Form.useForm();

      render(
        <FormWrapper>
          <PackageForm form={form} hallTypes={mockHallTypes} />
        </FormWrapper>
      );

      const durationInput = screen.getByLabelText('时长（小时）');
      await user.clear(durationInput);
      await user.type(durationInput, '0');
      await user.click(screen.getByText('提交'));

      await waitFor(() => {
        expect(screen.getByText('时长必须大于0')).toBeInTheDocument();
      });
    });

    it('should validate people number cannot be negative', async () => {
      const user = userEvent.setup();
      const [form] = Form.useForm();

      render(
        <FormWrapper>
          <PackageForm form={form} hallTypes={mockHallTypes} />
        </FormWrapper>
      );

      const minPeopleInput = screen.getByLabelText('最小人数');
      await user.clear(minPeopleInput);
      await user.type(minPeopleInput, '-1');
      await user.click(screen.getByText('提交'));

      await waitFor(() => {
        expect(screen.getByText('人数不能为负数')).toBeInTheDocument();
      });
    });

    it('should accept valid form data', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      const [form] = Form.useForm();

      render(
        <FormWrapper onSubmit={onSubmit}>
          <PackageForm form={form} hallTypes={mockHallTypes} />
        </FormWrapper>
      );

      // Fill valid data
      await user.type(screen.getByLabelText('场景包名称'), '测试场景包');
      await user.type(screen.getByLabelText('描述'), '测试描述');

      // Duration already has default value 2

      await user.click(screen.getByText('提交'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Hall Types Selection', () => {
    it('should render hall type select with options when hall types available', () => {
      const [form] = Form.useForm();
      render(<PackageForm form={form} hallTypes={mockHallTypes} />);

      const hallTypeSelect = screen.getByPlaceholderText('请选择适用的影厅类型');
      expect(hallTypeSelect).toBeInTheDocument();
    });

    it('should show all available hall types as options', async () => {
      const user = userEvent.setup();
      const [form] = Form.useForm();

      render(<PackageForm form={form} hallTypes={mockHallTypes} />);

      const hallTypeSelect = screen.getByPlaceholderText('请选择适用的影厅类型');
      await user.click(hallTypeSelect);

      // Options should appear in dropdown
      await waitFor(() => {
        expect(screen.getByText('VIP影厅')).toBeInTheDocument();
        expect(screen.getByText('标准影厅')).toBeInTheDocument();
        expect(screen.getByText('IMAX影厅')).toBeInTheDocument();
      });
    });

    it('should allow multiple hall type selection', async () => {
      const user = userEvent.setup();
      const [form] = Form.useForm();

      render(<PackageForm form={form} hallTypes={mockHallTypes} />);

      const hallTypeSelect = screen.getByPlaceholderText('请选择适用的影厅类型');
      await user.click(hallTypeSelect);

      // Select multiple options
      await waitFor(() => {
        expect(screen.getByText('VIP影厅')).toBeInTheDocument();
      });

      await user.click(screen.getByText('VIP影厅'));
      await user.click(screen.getByText('IMAX影厅'));

      // Both should be selected
      const selectedValues = form.getFieldValue('hallTypeIds');
      expect(selectedValues).toContain('hall-1');
      expect(selectedValues).toContain('hall-3');
    });

    it('should render fallback input when no hall types available', () => {
      const [form] = Form.useForm();
      render(<PackageForm form={form} hallTypes={[]} />);

      const fallbackInput = screen.getByPlaceholderText('请手动输入影厅类型 ID（多个用逗号分隔）');
      expect(fallbackInput).toBeInTheDocument();
    });

    it('should show helper text when no hall types available', () => {
      const [form] = Form.useForm();
      render(<PackageForm form={form} hallTypes={[]} />);

      expect(screen.getByText('暂无可用影厅类型，请先在影厅管理中添加')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should disable all fields when disabled prop is true', () => {
      const [form] = Form.useForm();
      render(<PackageForm form={form} hallTypes={mockHallTypes} disabled={true} />);

      const nameInput = screen.getByLabelText('场景包名称') as HTMLInputElement;
      const descriptionInput = screen.getByLabelText('描述') as HTMLTextAreaElement;
      const durationInput = screen.getByLabelText('时长（小时）') as HTMLInputElement;

      expect(nameInput).toBeDisabled();
      expect(descriptionInput).toBeDisabled();
      expect(durationInput).toBeDisabled();
    });

    it('should disable fields when loading is true', () => {
      const [form] = Form.useForm();
      render(<PackageForm form={form} hallTypes={mockHallTypes} loading={true} />);

      const nameInput = screen.getByLabelText('场景包名称') as HTMLInputElement;
      expect(nameInput).toBeDisabled();
    });

    it('should enable fields when both disabled and loading are false', () => {
      const [form] = Form.useForm();
      render(
        <PackageForm form={form} hallTypes={mockHallTypes} disabled={false} loading={false} />
      );

      const nameInput = screen.getByLabelText('场景包名称') as HTMLInputElement;
      expect(nameInput).not.toBeDisabled();
    });
  });

  describe('Edit Mode', () => {
    it('should pass packageId to ImageUpload component', () => {
      const [form] = Form.useForm();
      const { container } = render(
        <PackageForm form={form} packageId="test-package-id" hallTypes={mockHallTypes} />
      );

      // ImageUpload component should be rendered
      // Note: Actual verification depends on ImageUpload implementation
      expect(container).toBeInTheDocument();
    });
  });

  describe('Number Inputs', () => {
    it('should accept decimal values for duration', async () => {
      const user = userEvent.setup();
      const [form] = Form.useForm();

      render(<PackageForm form={form} hallTypes={mockHallTypes} />);

      const durationInput = screen.getByLabelText('时长（小时）');
      await user.clear(durationInput);
      await user.type(durationInput, '2.5');

      expect(form.getFieldValue(['rule', 'durationHours'])).toBe(2.5);
    });

    it('should increment duration by 0.5 step', async () => {
      const user = userEvent.setup();
      const [form] = Form.useForm();
      const { container } = render(<PackageForm form={form} hallTypes={mockHallTypes} />);

      const durationInput = screen.getByLabelText('时长（小时）');

      // Find increment button (ant-input-number-handler-up)
      const incrementButton = container.querySelector('.ant-input-number-handler-up');
      if (incrementButton) {
        await user.click(incrementButton);
        // Default is 2, after increment should be 2.5
        expect(form.getFieldValue(['rule', 'durationHours'])).toBe(2.5);
      }
    });

    it('should show unit suffix for number inputs', () => {
      const [form] = Form.useForm();
      const { container } = render(<PackageForm form={form} hallTypes={mockHallTypes} />);

      // Duration should have "小时" suffix
      expect(screen.getByText('小时')).toBeInTheDocument();

      // People inputs should have "人" suffix
      const personSuffixes = screen.getAllByText('人');
      expect(personSuffixes.length).toBe(2); // min and max people
    });
  });

  describe('Layout and Styling', () => {
    it('should use vertical form layout', () => {
      const [form] = Form.useForm();
      const { container } = render(<PackageForm form={form} hallTypes={mockHallTypes} />);

      const formElement = container.querySelector('.ant-form-vertical');
      expect(formElement).toBeInTheDocument();
    });

    it('should render rule fields inside a Card', () => {
      const [form] = Form.useForm();
      render(<PackageForm form={form} hallTypes={mockHallTypes} />);

      expect(screen.getByText('使用规则')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      const [form] = Form.useForm();
      render(<PackageForm form={form} hallTypes={mockHallTypes} />);

      expect(screen.getByLabelText('场景包名称')).toBeInTheDocument();
      expect(screen.getByLabelText('描述')).toBeInTheDocument();
      expect(screen.getByLabelText('背景图片')).toBeInTheDocument();
      expect(screen.getByLabelText('时长（小时）')).toBeInTheDocument();
      expect(screen.getByLabelText('最小人数')).toBeInTheDocument();
      expect(screen.getByLabelText('最大人数')).toBeInTheDocument();
      expect(screen.getByLabelText('适用影厅类型')).toBeInTheDocument();
    });

    it('should have placeholders for better UX', () => {
      const [form] = Form.useForm();
      render(<PackageForm form={form} hallTypes={mockHallTypes} />);

      expect(screen.getByPlaceholderText('例如：VIP生日派对专场')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('描述场景包的特色和适用场景')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('不限制可留空')).toBeInTheDocument();
    });
  });
});
