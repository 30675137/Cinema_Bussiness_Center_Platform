/**
 * useAutoSave Hook
 * 自动保存功能
 * Feature: 001-scenario-package-tabs
 */

import { useEffect, useRef, useCallback } from 'react';
import type { UseFormReturn, FieldValues } from 'react-hook-form';
import { message } from 'antd';

interface UseAutoSaveOptions<TFieldValues extends FieldValues> {
  /** React Hook Form 实例 */
  form: UseFormReturn<TFieldValues>;
  /** 保存函数 */
  onSave: (data: TFieldValues) => Promise<void>;
  /** 自动保存延迟（毫秒），默认 3000ms */
  delay?: number;
  /** 是否启用自动保存 */
  enabled?: boolean;
  /** 保存成功回调 */
  onSuccess?: () => void;
  /** 保存失败回调 */
  onError?: (error: Error) => void;
  /** 是否显示保存提示 */
  showMessage?: boolean;
}

/**
 * 自动保存 Hook
 * 
 * 当表单数据变化时，延迟一段时间后自动保存
 * 
 * @example
 * const form = useForm<BasicInfoFormData>();
 * useAutoSave({
 *   form,
 *   onSave: async (data) => { await api.save(data); },
 *   delay: 3000,
 *   enabled: true,
 * });
 */
export function useAutoSave<TFieldValues extends FieldValues>({
  form,
  onSave,
  delay = 3000,
  enabled = true,
  onSuccess,
  onError,
  showMessage = true,
}: UseAutoSaveOptions<TFieldValues>) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const savingRef = useRef(false);
  const lastSavedDataRef = useRef<string>('');

  const { watch, formState: { isDirty, isValid } } = form;

  // 清除定时器
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 执行保存
  const doSave = useCallback(async (data: TFieldValues) => {
    if (savingRef.current) return;

    const dataString = JSON.stringify(data);
    if (dataString === lastSavedDataRef.current) {
      return; // 数据没有变化，不需要保存
    }

    try {
      savingRef.current = true;
      await onSave(data);
      lastSavedDataRef.current = dataString;
      
      if (showMessage) {
        message.success('自动保存成功');
      }
      onSuccess?.();
    } catch (error) {
      if (showMessage) {
        message.error('自动保存失败');
      }
      onError?.(error as Error);
    } finally {
      savingRef.current = false;
    }
  }, [onSave, onSuccess, onError, showMessage]);

  // 监听表单变化
  useEffect(() => {
    if (!enabled) return;

    const subscription = watch((data) => {
      if (!isDirty || !isValid) return;

      clearTimer();

      timerRef.current = setTimeout(() => {
        doSave(data as TFieldValues);
      }, delay);
    });

    return () => {
      subscription.unsubscribe();
      clearTimer();
    };
  }, [watch, isDirty, isValid, enabled, delay, clearTimer, doSave]);

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  // 手动触发保存
  const saveNow = useCallback(async () => {
    clearTimer();
    const data = form.getValues();
    await doSave(data);
  }, [form, doSave, clearTimer]);

  // 取消自动保存
  const cancelAutoSave = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  return {
    saveNow,
    cancelAutoSave,
    isSaving: savingRef.current,
  };
}
