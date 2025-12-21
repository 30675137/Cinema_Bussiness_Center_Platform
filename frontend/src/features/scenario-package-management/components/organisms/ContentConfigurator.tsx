/**
 * 内容配置器组件
 *
 * 整合规则配置、硬权益、软权益、服务项目的完整配置界面
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */
import React, { useMemo } from 'react';
import { Card, Typography, Divider, Space, Statistic, Row, Col, Alert } from 'antd';
import {
  DollarOutlined,
  PercentageOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import {
  RuleConfigurator,
  BenefitSelector,
  ItemSelector,
  ServiceSelector,
} from '../molecules';
import type {
  PackageRule,
  PackageBenefit,
  PackageItem,
  PackageService,
  PackageContent,
} from '../../types';

const { Title, Text } = Typography;

export interface ContentConfiguratorProps {
  /** 使用规则 */
  rule?: Partial<PackageRule>;
  /** 内容组合 */
  content?: Partial<PackageContent>;
  /** 当前打包价格（用于计算优惠比例） */
  packagePrice?: number;
  /** 规则变更回调 */
  onRuleChange?: (rule: Partial<PackageRule>) => void;
  /** 硬权益变更回调 */
  onBenefitsChange?: (benefits: PackageBenefit[]) => void;
  /** 单品变更回调 */
  onItemsChange?: (items: PackageItem[]) => void;
  /** 服务变更回调 */
  onServicesChange?: (services: PackageService[]) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 内容配置器
 *
 * 整合场景包的所有内容配置：
 * - 使用规则（时长、人数）
 * - 硬权益（观影优惠）
 * - 软权益（单品）
 * - 服务项目
 * - 价格汇总
 */
export const ContentConfigurator: React.FC<ContentConfiguratorProps> = ({
  rule = {},
  content = { benefits: [], items: [], services: [] },
  packagePrice,
  onRuleChange,
  onBenefitsChange,
  onItemsChange,
  onServicesChange,
  disabled = false,
}) => {
  // 计算价格汇总
  const priceStats = useMemo(() => {
    const benefits = content.benefits || [];
    const items = content.items || [];
    const services = content.services || [];

    // 单品总价
    const itemsTotal = items.reduce(
      (sum, item) => sum + item.itemPriceSnapshot * item.quantity,
      0
    );

    // 服务总价
    const servicesTotal = services.reduce(
      (sum, service) => sum + service.servicePriceSnapshot,
      0
    );

    // 参考总价（不含硬权益，因为硬权益是优惠）
    const referencePrice = itemsTotal + servicesTotal;

    // 优惠金额和比例
    const discountAmount = packagePrice ? referencePrice - packagePrice : 0;
    const discountPercentage =
      referencePrice > 0 && packagePrice
        ? ((discountAmount / referencePrice) * 100).toFixed(1)
        : 0;

    return {
      itemsTotal,
      servicesTotal,
      referencePrice,
      discountAmount,
      discountPercentage,
      benefitCount: benefits.length,
      itemCount: items.length,
      serviceCount: services.length,
    };
  }, [content, packagePrice]);

  return (
    <div className="content-configurator">
      {/* 规则配置 */}
      <RuleConfigurator
        value={rule}
        onChange={onRuleChange}
        disabled={disabled}
      />

      <Divider />

      {/* 硬权益配置 */}
      <BenefitSelector
        value={content.benefits || []}
        onChange={onBenefitsChange}
        disabled={disabled}
      />

      <Divider />

      {/* 单品配置 */}
      <ItemSelector
        value={content.items || []}
        onChange={onItemsChange}
        disabled={disabled}
      />

      <Divider />

      {/* 服务配置 */}
      <ServiceSelector
        value={content.services || []}
        onChange={onServicesChange}
        disabled={disabled}
      />

      <Divider />

      {/* 价格汇总 */}
      <Card
        size="small"
        title={
          <span>
            <ProfileOutlined style={{ marginRight: 8 }} />
            内容汇总
          </span>
        }
        className="price-summary"
      >
        <Row gutter={24}>
          <Col span={6}>
            <Statistic
              title="硬权益"
              value={priceStats.benefitCount}
              suffix="项"
              valueStyle={{ fontSize: 20 }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="单品"
              value={priceStats.itemCount}
              suffix="种"
              valueStyle={{ fontSize: 20 }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="服务"
              value={priceStats.serviceCount}
              suffix="项"
              valueStyle={{ fontSize: 20 }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="参考总价"
              value={priceStats.referencePrice}
              precision={2}
              prefix="¥"
              valueStyle={{ fontSize: 20, color: '#1890ff' }}
            />
          </Col>
        </Row>

        {packagePrice !== undefined && priceStats.referencePrice > 0 && (
          <>
            <Divider style={{ margin: '16px 0' }} />
            <Row gutter={24}>
              <Col span={8}>
                <Statistic
                  title="打包价格"
                  value={packagePrice}
                  precision={2}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="优惠金额"
                  value={priceStats.discountAmount}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: '#f5222d' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="优惠比例"
                  value={priceStats.discountPercentage}
                  suffix="%"
                  prefix={<PercentageOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
            </Row>
          </>
        )}

        {priceStats.referencePrice === 0 && (
          <Alert
            type="info"
            message="请添加单品或服务以计算参考总价"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Card>
    </div>
  );
};

export default ContentConfigurator;
