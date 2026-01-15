import { useMemo, useCallback, useEffect, useState } from 'react';
import {
  Input,
  InputNumber,
  Select,
  Checkbox,
  Radio,
  Switch,
  DatePicker,
  TimePicker,
  Upload,
  Form,
  Typography,
  Space,
} from 'antd';
import { UploadOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { cn } from '@/utils/cn';
import type { FormFieldProps, FormFieldConfig } from './types';
import { FormFieldType } from './types';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

/**
 * FormField 组件 - 标准化的表单字段组件
 */
function FormField({
  config,
  value,
  onChange,
  error,
  validateTrigger = 'onChange',
  formValues = {},
  layout = 'horizontal',
  labelWidth,
  colon = true,
  size = 'middle',
  className,
  style,
}: FormFieldProps) {
  const [internalValue, setInternalValue] = useState(value ?? config.defaultValue);
  const [isTouched, setIsTouched] = useState(false);

  // 计算字段可见性
  const isVisible = useMemo(() => {
    if (typeof config.visible === 'function') {
      return config.visible(formValues);
    }
    return config.visible !== false;
  }, [config.visible, formValues]);

  // 处理字段依赖
  const finalConfig = useMemo(() => {
    let updatedConfig = { ...config };

    if (config.dependencies) {
      config.dependencies.forEach((dep) => {
        const depValue = formValues[dep.field];
        const conditionMet = dep.condition(depValue);
        const targetConfig = conditionMet ? dep.then : dep.else;

        updatedConfig = {
          ...updatedConfig,
          ...targetConfig,
        };
      });
    }

    return updatedConfig;
  }, [config, formValues]);

  // 验证字段值
  const validateField = useCallback(
    (val: any): string | null => {
      if (!finalConfig.rules) return null;

      for (const rule of finalConfig.rules) {
        // 必填验证
        if (rule.required && (val === undefined || val === null || val === '')) {
          return rule.message || `${finalConfig.label}是必填项`;
        }

        // 跳过空值的其他验证
        if (val === undefined || val === null || val === '') continue;

        // 类型验证
        if (rule.type) {
          switch (rule.type) {
            case 'email':
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                return rule.message || `${finalConfig.label}格式不正确`;
              }
              break;
            case 'number':
              if (isNaN(Number(val))) {
                return rule.message || `${finalConfig.label}必须是数字`;
              }
              break;
            case 'url':
              try {
                new URL(val);
              } catch {
                return rule.message || `${finalConfig.label}URL格式不正确`;
              }
              break;
          }
        }

        // 长度验证
        if (rule.min !== undefined && String(val).length < rule.min) {
          return rule.message || `${finalConfig.label}长度不能少于${rule.min}位`;
        }
        if (rule.max !== undefined && String(val).length > rule.max) {
          return rule.message || `${finalConfig.label}长度不能超过${rule.max}位`;
        }

        // 正则验证
        if (rule.pattern && !rule.pattern.test(String(val))) {
          return rule.message || `${finalConfig.label}格式不正确`;
        }

        // 自定义验证
        if (rule.validator) {
          const result = rule.validator(val);
          if (result !== true) {
            return typeof result === 'string'
              ? result
              : rule.message || `${finalConfig.label}验证失败`;
          }
        }
      }

      return null;
    },
    [finalConfig]
  );

  // 处理值变化
  const handleChange = useCallback(
    (val: any) => {
      setInternalValue(val);

      if (validateTrigger === 'onChange' || isTouched) {
        const errorMessage = validateField(val);
        // 可以通过回调传递错误信息
      }

      onChange?.(val, finalConfig.name);
    },
    [onChange, finalConfig.name, validateTrigger, isTouched, validateField]
  );

  // 处理失焦事件
  const handleBlur = useCallback(() => {
    setIsTouched(true);
    if (validateTrigger === 'onBlur') {
      const errorMessage = validateField(internalValue);
      // 可以通过回调传递错误信息
    }
  }, [validateTrigger, internalValue, validateField]);

  // 同步外部value变化
  useEffect(() => {
    setInternalValue(value ?? finalConfig.defaultValue);
  }, [value, finalConfig.defaultValue]);

  // 渲染表单控件
  const renderFormControl = useCallback(() => {
    const commonProps = {
      size,
      disabled: finalConfig.disabled,
      placeholder: finalConfig.placeholder,
      className: finalConfig.className,
      style: { width: '100%', ...finalConfig.style },
    };

    switch (finalConfig.type) {
      case FormFieldType.INPUT:
        return (
          <Input
            {...commonProps}
            {...finalConfig.inputProps}
            value={internalValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            readOnly={finalConfig.readOnly}
          />
        );

      case FormFieldType.TEXTAREA:
        return (
          <TextArea
            {...commonProps}
            {...finalConfig.inputProps}
            value={internalValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            readOnly={finalConfig.readOnly}
            rows={4}
          />
        );

      case FormFieldType.PASSWORD:
        return (
          <Input.Password
            {...commonProps}
            {...finalConfig.inputProps}
            value={internalValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            readOnly={finalConfig.readOnly}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        );

      case FormFieldType.NUMBER:
        return (
          <InputNumber
            {...commonProps}
            {...finalConfig.inputProps}
            value={internalValue}
            onChange={(val) => handleChange(val)}
            onBlur={handleBlur}
            readOnly={finalConfig.readOnly}
          />
        );

      case FormFieldType.SELECT:
        return (
          <Select
            {...commonProps}
            {...finalConfig.selectProps}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            {finalConfig.options?.map((option) => (
              <Option key={String(option.value)} value={option.value} disabled={option.disabled}>
                <Space>
                  {option.icon}
                  {option.label}
                </Space>
              </Option>
            ))}
          </Select>
        );

      case FormFieldType.MULTI_SELECT:
        return (
          <Select
            {...commonProps}
            {...finalConfig.selectProps}
            mode="multiple"
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            {finalConfig.options?.map((option) => (
              <Option key={String(option.value)} value={option.value} disabled={option.disabled}>
                <Space>
                  {option.icon}
                  {option.label}
                </Space>
              </Option>
            ))}
          </Select>
        );

      case FormFieldType.CHECKBOX:
        return (
          <Checkbox
            {...finalConfig.checkboxProps}
            checked={internalValue}
            onChange={(e) => handleChange(e.target.checked)}
            onBlur={handleBlur}
            disabled={finalConfig.disabled}
          >
            {finalConfig.options?.map((option, index) => (
              <Checkbox key={String(option.value)} value={option.value} disabled={option.disabled}>
                <Space>
                  {option.icon}
                  {option.label}
                </Space>
              </Checkbox>
            ))}
          </Checkbox>
        );

      case FormFieldType.RADIO:
        return (
          <Radio.Group
            {...finalConfig.radioProps}
            value={internalValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            disabled={finalConfig.disabled}
          >
            {finalConfig.options?.map((option) => (
              <Radio key={String(option.value)} value={option.value} disabled={option.disabled}>
                <Space>
                  {option.icon}
                  {option.label}
                </Space>
              </Radio>
            ))}
          </Radio.Group>
        );

      case FormFieldType.SWITCH:
        return (
          <Switch
            {...finalConfig.switchProps}
            checked={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={finalConfig.disabled}
          />
        );

      case FormFieldType.DATE_PICKER:
        return (
          <DatePicker
            {...commonProps}
            {...finalConfig.datePickerProps}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ width: '100%', ...finalConfig.style }}
          />
        );

      case FormFieldType.DATE_RANGE_PICKER:
        return (
          <RangePicker
            {...commonProps}
            {...finalConfig.datePickerProps}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ width: '100%', ...finalConfig.style }}
          />
        );

      case FormFieldType.TIME_PICKER:
        return (
          <TimePicker
            {...commonProps}
            {...finalConfig.timePickerProps}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ width: '100%', ...finalConfig.style }}
          />
        );

      case FormFieldType.FILE_UPLOAD:
        return (
          <Upload {...finalConfig.inputProps} disabled={finalConfig.disabled}>
            <Button
              icon={<UploadOutlined />}
              disabled={finalConfig.disabled}
              classNames={{
                root: 'upload-button',
              }}
            >
              上传文件
            </Button>
          </Upload>
        );

      case FormFieldType.CUSTOM:
        return finalConfig.render
          ? finalConfig.render(internalValue, handleChange, finalConfig)
          : null;

      default:
        return null;
    }
  }, [finalConfig, internalValue, handleChange, handleBlur]);

  // 如果不可见，返回null
  if (!isVisible) {
    return null;
  }

  // 垂直布局
  if (layout === 'vertical') {
    return (
      <Form.Item
        className={cn('form-field-vertical', className)}
        style={style}
        validateStatus={error ? 'error' : undefined}
        help={error || finalConfig.description}
        label={
          <Space>
            <Text strong>{finalConfig.label}</Text>
            {finalConfig.required && <Text type="danger">*</Text>}
          </Space>
        }
      >
        {renderFormControl()}
      </Form.Item>
    );
  }

  // 内联布局
  if (layout === 'inline') {
    return (
      <Form.Item
        className={cn('form-field-inline', className)}
        style={style}
        validateStatus={error ? 'error' : undefined}
        help={error}
        colon={colon}
        label={finalConfig.label}
      >
        {renderFormControl()}
      </Form.Item>
    );
  }

  // 水平布局（默认）
  return (
    <Form.Item
      className={cn('form-field-horizontal', className)}
      style={style}
      validateStatus={error ? 'error' : undefined}
      help={error || finalConfig.description}
      colon={colon}
      label={
        <Space style={{ width: labelWidth }}>
          <Text>{finalConfig.label}</Text>
          {finalConfig.required && <Text type="danger">*</Text>}
        </Space>
      }
      labelCol={{ style: { width: labelWidth } }}
    >
      {renderFormControl()}
    </Form.Item>
  );
}

// 导出类型
export type {
  FormFieldProps,
  FormFieldConfig,
  FormFieldOption,
  FormFieldRule,
  FormFieldType,
} from './types';

export default FormField;
