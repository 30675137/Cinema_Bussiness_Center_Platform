/**
 * useFormDirtyState Hook
 * 表单脏状态管理
 * Feature: 001-scenario-package-tabs
 */

import { useEffect, useCallback } from 'react';
import type { UseFormReturn, FieldValues } from 'react-hook-form';
import { useScenarioPackageStore, type TabKey } from '../stores/useScenarioPackageStore';

interface UseFormDirtyStateOptions<TFieldValues extends FieldValues> {
  /** React Hook Form 实例 */
  form: UseFormReturn<TFieldValues>;
  /** 当前标签页 */
  tabKey: TabKey;
  /** 原始数据（用于比较） */
  originalData?: TFieldValues;
}

/**
 * 表单脏状态管理 Hook
 *
 * 自动监听表单变化并更新 Zustand store 中的脏状态
 *
 * @example
 * const form = useForm<BasicInfoFormData>();
 * useFormDirtyState({ form, tabKey: 'basic', originalData: serverData });
 */
export function useFormDirtyState<TFieldValues extends FieldValues>({
  form,
  tabKey,
  originalData,
}: UseFormDirtyStateOptions<TFieldValues>) {
  const setDirty = useScenarioPackageStore((state) => state.setDirty);
  const { isDirty, dirtyFields } = form.formState;

  // 监听表单脏状态变化
  useEffect(() => {
    setDirty(tabKey, isDirty);
  }, [isDirty, tabKey, setDirty]);

  // 组件卸载时清除脏状态
  useEffect(() => {
    return () => {
      setDirty(tabKey, false);
    };
  }, [tabKey, setDirty]);

  // 重置表单到原始数据
  const resetToOriginal = useCallback(() => {
    if (originalData) {
      form.reset(originalData);
    }
  }, [form, originalData]);

  // 检查特定字段是否已修改
  const isFieldDirty = useCallback(
    (fieldName: keyof TFieldValues) => {
      return Boolean(dirtyFields[fieldName as string]);
    },
    [dirtyFields]
  );

  return {
    isDirty,
    dirtyFields,
    resetToOriginal,
    isFieldDirty,
  };
}
