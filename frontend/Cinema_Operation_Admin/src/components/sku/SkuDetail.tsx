/**
 * SKU详情组件
 * 以只读方式展示SKU的完整信息，包括所有字段和关联信息入口
 */
import React from 'react';
import {
  Drawer,
  Descriptions,
  Tag,
  Space,
  Button,
  Divider,
  Typography,
  Empty,
  Modal,
  message,
} from 'antd';
import { showError, showSuccess } from '@/utils/errorHandler';
import {
  EditOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { SKU, SkuStatus } from '@/types/sku';
import { useSkuStore } from '@/stores/skuStore';
import { useSkuQuery, useToggleSkuStatusMutation } from '@/hooks/useSku';
import { canEnableSku, canDisableSku } from '@/utils/skuHelpers';
import {
  getSkuStatusText,
  getSkuStatusColor,
  formatSkuCode,
  formatBarcode,
  formatSkuCreatedTime,
  formatSkuUpdatedTime,
} from '@/utils/skuHelpers';

const { Text, Title } = Typography;

interface SkuDetailProps {
  open: boolean;
  skuId: string | null;
  onClose: () => void;
  onEdit?: (skuId: string) => void;
}

/**
 * SKU详情组件
 */
export const SkuDetail: React.FC<SkuDetailProps> = ({
  open,
  skuId,
  onClose,
  onEdit,
}) => {
  const { closeDetailDrawer, openFormDrawer } = useSkuStore();
  
  // 获取SKU详情
  const { data: skuData, isLoading: loading, error: detailError, refetch } = useSkuQuery(
    skuId || null,
    open && !!skuId
  );

  // 状态切换Mutation
  const toggleStatusMutation = useToggleSkuStatusMutation();

  // 处理编辑
  const handleEdit = () => {
    if (skuId) {
      closeDetailDrawer();
      openFormDrawer('edit', skuId);
      onEdit?.(skuId);
    }
  };

  // 处理状态切换
  const handleToggleStatus = (status: SkuStatus) => {
    if (!skuData || !skuId) return;

    const statusText = status === SkuStatus.ENABLED ? '启用' : '停用';
    const confirmText =
      status === SkuStatus.DISABLED
        ? `确定要停用SKU "${skuData.name}" 吗？`
        : `确定要启用SKU "${skuData.name}" 吗？`;

    Modal.confirm({
      title: `确认${statusText}`,
      content: confirmText,
      onOk: async () => {
        try {
          await toggleStatusMutation.mutateAsync({
            id: skuId,
            status,
          });
          // 成功消息已在 mutation 的 onSuccess 中显示
          refetch();
        } catch (error: any) {
          showError(error, `${statusText}失败`);
        }
      },
    });
  };

  // 处理关闭
  const handleClose = () => {
    closeDetailDrawer();
    onClose();
  };

  if (!skuData && !loading) {
    return (
      <Drawer
        title="SKU详情"
        open={open}
        onClose={handleClose}
        width={800}
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={handleClose}>关闭</Button>
          </Space>
        }
      >
        <Empty description="SKU信息不存在" />
      </Drawer>
    );
  }

  return (
    <Drawer
      title={
        <Space>
          <span>SKU详情</span>
          {skuData && (
            <Tag color={getSkuStatusColor(skuData.status)}>
              {getSkuStatusText(skuData.status)}
            </Tag>
          )}
        </Space>
      }
      open={open}
      onClose={handleClose}
      width={800}
      loading={loading}
      data-testid="sku-detail-drawer"
      footer={
        <Space style={{ float: 'right' }}>
          {skuData && canEnableSku(skuData) && (
            <Button
              icon={<CheckCircleOutlined />}
              onClick={() => handleToggleStatus(SkuStatus.ENABLED)}
              data-testid={`sku-detail-enable-button-${skuData.id}`}
            >
              启用
            </Button>
          )}
          {skuData && canDisableSku(skuData) && (
            <Button
              danger
              icon={<StopOutlined />}
              onClick={() => handleToggleStatus(SkuStatus.DISABLED)}
              data-testid={`sku-detail-disable-button-${skuData.id}`}
            >
              停用
            </Button>
          )}
          {skuData && (
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={handleEdit}
              data-testid={`sku-detail-edit-button-${skuData.id}`}
            >
              编辑
            </Button>
          )}
          <Button 
            onClick={handleClose}
            data-testid="sku-detail-close-button"
          >
            关闭
          </Button>
        </Space>
      }
    >
      {skuData && (
        <div>
          {/* 基础信息 */}
          <Title level={5}>基础信息</Title>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="SKU编码">
              <Text strong>{formatSkuCode(skuData.code)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="SKU名称">
              <Text strong>{skuData.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="所属SPU">{skuData.spuName}</Descriptions.Item>
            <Descriptions.Item label="品牌">{skuData.brand}</Descriptions.Item>
            <Descriptions.Item label="类目" span={2}>
              {skuData.category}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* 规格属性 */}
          <Title level={5}>规格属性</Title>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="规格/型号">
              {skuData.spec || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="口味">
              {skuData.flavor || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="包装形式" span={2}>
              {skuData.packaging || '-'}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* 单位配置 */}
          <Title level={5}>单位配置</Title>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="主库存单位">
              {skuData.mainUnit}
            </Descriptions.Item>
            <Descriptions.Item label="销售单位" span={2}>
              {skuData.salesUnits && skuData.salesUnits.length > 0 ? (
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {skuData.salesUnits.map((su) => (
                    <div key={su.id}>
                      <Text strong>{su.unit}</Text>
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        (1 {su.unit} = {su.conversionRate} {skuData.mainUnit})
                      </Text>
                      {!su.enabled && (
                        <Tag color="default" style={{ marginLeft: 8 }}>
                          已禁用
                        </Tag>
                      )}
                    </div>
                  ))}
                </Space>
              ) : (
                '-'
              )}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* 条码信息 */}
          <Title level={5}>条码信息</Title>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="主条码">
              {formatBarcode(skuData.mainBarcode)}
            </Descriptions.Item>
            <Descriptions.Item label="其他条码">
              {skuData.otherBarcodes && skuData.otherBarcodes.length > 0 ? (
                <Space direction="vertical" size="small">
                  {skuData.otherBarcodes.map((barcode) => (
                    <div key={barcode.id}>
                      <Text>{formatBarcode(barcode.code)}</Text>
                      {barcode.remark && (
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          ({barcode.remark})
                        </Text>
                      )}
                    </div>
                  ))}
                </Space>
              ) : (
                '-'
              )}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* 其他配置 */}
          <Title level={5}>其他配置</Title>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="是否管理库存">
              <Tag color={skuData.manageInventory ? 'success' : 'default'}>
                {skuData.manageInventory ? '是' : '否'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="是否允许负库存">
              <Tag color={skuData.allowNegativeStock ? 'warning' : 'default'}>
                {skuData.allowNegativeStock ? '是' : '否'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="最小起订量">
              {skuData.minOrderQty || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="最小销售量">
              {skuData.minSaleQty || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={getSkuStatusColor(skuData.status)}>
                {getSkuStatusText(skuData.status)}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* 关联信息 */}
          <Title level={5}>关联信息</Title>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="关联BOM">
              {skuData.bomCount !== undefined ? (
                <Button
                  type="link"
                  icon={<LinkOutlined />}
                  onClick={() => {
                    // TODO: 跳转到BOM管理页面
                    console.log('跳转到BOM管理:', skuData.id);
                  }}
                >
                  {skuData.bomCount} 个
                </Button>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="关联价格规则">
              {skuData.priceRuleCount !== undefined ? (
                <Button
                  type="link"
                  icon={<LinkOutlined />}
                  onClick={() => {
                    // TODO: 跳转到价格规则页面
                    console.log('跳转到价格规则:', skuData.id);
                  }}
                >
                  {skuData.priceRuleCount} 个
                </Button>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="当前库存">
              {skuData.stockTotal !== undefined ? (
                <Button
                  type="link"
                  icon={<LinkOutlined />}
                  onClick={() => {
                    // TODO: 跳转到库存管理页面
                    console.log('跳转到库存管理:', skuData.id);
                  }}
                >
                  {skuData.stockTotal} {skuData.mainUnit}
                </Button>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="关联场景包">
              {skuData.scenePackageCount !== undefined ? (
                <Button
                  type="link"
                  icon={<LinkOutlined />}
                  onClick={() => {
                    // TODO: 跳转到场景包管理页面
                    console.log('跳转到场景包管理:', skuData.id);
                  }}
                >
                  {skuData.scenePackageCount} 个
                </Button>
              ) : (
                '-'
              )}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* 元数据 */}
          <Title level={5}>元数据</Title>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="创建时间">
              {formatSkuCreatedTime(skuData)}
            </Descriptions.Item>
            <Descriptions.Item label="创建人">
              {skuData.createdByName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {formatSkuUpdatedTime(skuData)}
            </Descriptions.Item>
            <Descriptions.Item label="最近编辑人">
              {skuData.updatedByName || '-'}
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Drawer>
  );
};

export default SkuDetail;

