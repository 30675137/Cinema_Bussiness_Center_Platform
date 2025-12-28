/**
 * BasicInfoTab 组件
 * 场景包基础信息标签页
 * Feature: 001-scenario-package-tabs
 */

import React from 'react';
import { Skeleton } from 'antd';
import { EditableCard } from '../';
import BasicInfoForm from '../forms/BasicInfoForm';
import { useScenarioPackageStore } from '../../stores/useScenarioPackageStore';
import type { ScenarioPackage } from '../../types';
import type { BasicInfoFormData } from '../../schemas/validationSchemas';

interface BasicInfoTabProps {
  /** 场景包ID */
  packageId: string;
  /** 场景包数据 */
  packageData?: ScenarioPackage;
  /** 是否加载中 */
  loading?: boolean;
}

/**
 * 场景包基础信息标签页
 */
const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  packageId,
  packageData,
  loading = false,
}) => {
  const isDirty = useScenarioPackageStore((state) => state.dirtyTabs.basic);

  // 将服务端数据转换为表单数据
  const initialData: BasicInfoFormData | undefined = packageData
    ? {
        name: packageData.name,
        description: packageData.description || '',
        category: packageData.category,
        mainImage: packageData.mainImage,
      }
    : undefined;

  if (loading) {
    return (
      <EditableCard title="基础信息" description="配置场景包名称、分类和主图">
        <Skeleton active paragraph={{ rows: 6 }} />
      </EditableCard>
    );
  }

  return (
    <EditableCard
      title="基础信息"
      description="配置场景包名称、分类和主图"
      isDirty={isDirty}
    >
      <BasicInfoForm
        packageId={packageId}
        initialData={initialData}
      />
    </EditableCard>
  );
};

export default BasicInfoTab;
