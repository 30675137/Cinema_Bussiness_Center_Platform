/**
 * 场景包编辑器 Feature 入口
 * Feature: 001-scenario-package-tabs
 */

// Types
export * from './types';

// Components
export * from './components';

// Store
export {
  useScenarioPackageStore,
  selectPackageId,
  selectActiveTab,
  selectIsDirty,
  selectIsSaving,
  selectShowLeaveConfirm,
} from './stores/useScenarioPackageStore';
export type { TabKey } from './stores/useScenarioPackageStore';

// Hooks
export {
  scenarioPackageEditorKeys,
  useScenarioPackageDetail,
  usePackageTiers,
  useAllAddOnItems,
  usePackageAddOns,
  useTimeSlotTemplates,
  useTimeSlotOverrides,
  usePublishValidation,
  useUpdateBasicInfo,
  useCreatePackageTier,
  useUpdatePackageTier,
  useDeletePackageTier,
  useReorderPackageTiers,
  useUpdatePackageAddOns,
  useCreateTimeSlotTemplate,
  useUpdateTimeSlotTemplate,
  useDeleteTimeSlotTemplate,
  useCreateTimeSlotOverride,
  useDeleteTimeSlotOverride,
  useUpdatePublishSettings,
  usePublishPackage,
  useArchivePackage,
} from './hooks/useScenarioPackageQueries';

export { useFormDirtyState } from './hooks/useFormDirtyState';
export { useAutoSave } from './hooks/useAutoSave';

// Schemas
export {
  BasicInfoFormSchema,
  PackageTierFormSchema,
  UpdateAddOnsFormSchema,
  TimeSlotTemplateFormSchema,
  TimeSlotOverrideFormSchema,
  PublishSettingsFormSchema,
  validationSchemas,
} from './schemas/validationSchemas';
export type {
  BasicInfoFormData,
  PackageTierFormData,
  UpdateAddOnsFormData,
  TimeSlotTemplateFormData,
  TimeSlotOverrideFormData,
  PublishSettingsFormData,
} from './schemas/validationSchemas';

// API Client
export { scenarioPackageApi } from './services/apiClient';

// Utils (Phase 8 Polish)
export * from './utils';

// Page
export { default as ScenarioPackageEditorPage } from './ScenarioPackageEditorPage';
