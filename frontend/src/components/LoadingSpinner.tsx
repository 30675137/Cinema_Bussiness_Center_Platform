import React from 'react';
import { Spin } from 'antd';

const LoadingSpinner: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        width: '100%',
      }}
    >
      <Spin size="large" tip="加载中..." />
    </div>
  );
};

export default LoadingSpinner;
