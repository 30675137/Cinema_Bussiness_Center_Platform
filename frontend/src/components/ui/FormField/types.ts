import { ReactNode } from 'react';
import { InputProps, SelectProps, CheckboxProps, RadioProps, DatePickerProps, TimePickerProps, SwitchProps } from 'antd';

/**
 * 表单字段类型枚举
 */
export enum FormFieldType {
  INPUT = 'input',
  TEXTAREA = 'textarea',
  PASSWORD = 'password',
  NUMBER = 'number',
  SELECT = 'select',
  MULTI_SELECT = 'multiSelect',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  SWITCH = 'switch',
  DATE_PICKER = 'datePicker',
  DATE_RANGE_PICKER = 'dateRangePicker',
  TIME_PICKER = 'timePicker',
  FILE_UPLOAD = 'fileUpload',
  CUSTOM = 'custom',
}

/**
 * 选择器选项接口
 */
export interface FormFieldOption {
  /** 选项标签 */
  label: string;
  /** 选项值 */
  value: string | number | boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 选项图标 */
  icon?: ReactNode;
}

/**
 * 验证规则接口
 */
export interface FormFieldRule {
  /** 是否必填 */
  required?: boolean;
  /** 错误消息 */
  message?: string;
  /** 最小长度 */
  min?: number;
  /** 最大长度 */
  max?: number;
  /** 正则表达式 */
  pattern?: RegExp;
  /** 自定义验证函数 */
  validator?: (value: any) => boolean | string;
  /** 字段类型验证 */
  type?: 'string' | 'number' | 'email' | 'url' | 'date';
}

/**
 * 表单字段配置接口
 */
export interface FormFieldConfig {
  /** 字段名称 */
  name: string;
  /** 字段标签 */
  label: string;
  /** 字段类型 */
  type: FormFieldType;
  /** 默认值 */
  defaultValue?: any;
  /** 占位符 */
  placeholder?: string;
  /** 是否必填 */
  required?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readOnly?: boolean;
  /** 字段描述 */
  description?: string;
  /** 验证规则 */
  rules?: FormFieldRule[];
  /** 选择器选项（用于SELECT、CHECKBOX、RADIO类型） */
  options?: FormFieldOption[];
  /** 输入框配置（用于INPUT、TEXTAREA、PASSWORD、NUMBER类型） */
  inputProps?: Partial<InputProps>;
  /** 选择器配置（用于SELECT、MULTI_SELECT类型） */
  selectProps?: Partial<SelectProps>;
  /** 复选框配置（用于CHECKBOX类型） */
  checkboxProps?: Partial<CheckboxProps>;
  /** 单选框配置（用于RADIO类型） */
  radioProps?: Partial<RadioProps>;
  /** 日期选择器配置（用于DATE_PICKER、DATE_RANGE_PICKER类型） */
  datePickerProps?: Partial<DatePickerProps>;
  /** 时间选择器配置（用于TIME_PICKER类型） */
  timePickerProps?: Partial<TimePickerProps>;
  /** 开关配置（用于SWITCH类型） */
  switchProps?: Partial<SwitchProps>;
  /** 自定义渲染函数（用于CUSTOM类型） */
  render?: (value: any, onChange: (value: any) => void, config: FormFieldConfig) => ReactNode;
  /** 字段依赖配置 */
  dependencies?: {
    /** 依赖的字段名 */
    field: string;
    /** 依赖条件 */
    condition: (depValue: any) => boolean;
    /** 条件满足时的配置 */
    then: Partial<FormFieldConfig>;
    /** 条件不满足时的配置 */
    else: Partial<FormFieldConfig>;
  }[];
  /** 字段宽度 */
  width?: number | string;
  /** 是否显示 */
  visible?: boolean | ((values: Record<string, any>) => boolean);
  /** 字段额外类名 */
  className?: string;
  /** 字段样式 */
  style?: React.CSSProperties;
}

/**
 * FormField组件Props接口
 */
export interface FormFieldProps {
  /** 字段配置 */
  config: FormFieldConfig;
  /** 字段值 */
  value?: any;
  /** 值变化回调 */
  onChange?: (value: any, name: string) => void;
  /** 错误状态 */
  error?: string;
  /** 触发验证 */
  validateTrigger?: 'onChange' | 'onBlur' | 'onSubmit';
  /** 表单值上下文（用于依赖字段） */
  formValues?: Record<string, any>;
  /** 布局方式 */
  layout?: 'horizontal' | 'vertical' | 'inline';
  /** 标签宽度（horizontal布局时） */
  labelWidth?: number | string;
  /** 是否显示冒号 */
  colon?: boolean;
  /** 组件大小 */
  size?: 'small' | 'middle' | 'large';
  /** 额外类名 */
  className?: string;
  /** 额外样式 */
  style?: React.CSSProperties;
}