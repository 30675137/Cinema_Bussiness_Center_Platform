/**
 * 场景包预览页（MVP占位符）
 */

import React from 'react';
import { Card, Alert } from 'antd';
import { useParams } from 'react-router-dom';

const ScenarioPackagePreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div style={{ padding: '24px' }}>
      <Card title="场景包预览">
        <Alert
          message="MVP版本提示"
          description={`预览功能开发中... 场景包ID: ${id}`}
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
};

export default ScenarioPackagePreviewPage;
