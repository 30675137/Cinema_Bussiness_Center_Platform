import React from 'react';
import { Spin } from 'antd';

interface LoadingProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  spinning?: boolean;
  children?: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'default',
  tip,
  spinning = true,
  children,
  delay,
  className,
  style,
}) => {
  return (
    <Spin
      size={size}
      tip={tip}
      spinning={spinning}
      delay={delay}
      className={className}
      style={style}
    >
      {children}
    </Spin>
  );
};

export default Loading;
