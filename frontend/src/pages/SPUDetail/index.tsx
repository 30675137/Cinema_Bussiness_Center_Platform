import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Space, message, Breadcrumb, Typography, Row, Col, Spin } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  ShareAltOutlined,
  PrinterOutlined,
  DownloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import SPUDetail from '@/components/SPU/SPUDetail';
import SPUEditForm from '@/components/forms/SPUEditForm';
import StatusManager from '@/components/SPU/StatusManager';
import type { SPUItem, SPUStatus } from '@/types/spu';
import { spuService } from '@/services/spuService';
import { Breadcrumb as CustomBreadcrumb } from '@/components/common';

const { Title } = Typography;

interface SPUDetailPageProps {}

const SPUDetailPage: React.FC<SPUDetailPageProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  // 根据 URL 路径自动设置模式
  const isEditPath = location.pathname.endsWith('/edit');
  const [mode, setMode] = useState<'view' | 'edit'>(isEditPath ? 'edit' : 'view');
  const [currentSPU, setCurrentSPU] = useState<SPUItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // 加载 SPU 数据
  useEffect(() => {
    const loadSPUData = async () => {
      if (!id) return;

      try {
        setDataLoading(true);
        const response = await spuService.getSPUDetail(id);
        if (response.success && response.data) {
          setCurrentSPU(response.data);
        } else {
          message.error(response.message || '获取SPU详情失败');
          navigate('/products/spu');
        }
      } catch (error) {
        console.error('Load SPU error:', error);
        message.error('获取SPU详情失败，请重试');
        navigate('/products/spu');
      } finally {
        setDataLoading(false);
      }
    };

    loadSPUData();
  }, [id, navigate]);

  // 当 URL 路径变化时，同步更新模式
  useEffect(() => {
    if (isEditPath && mode !== 'edit') {
      setMode('edit');
    } else if (!isEditPath && mode !== 'view') {
      setMode('view');
    }
  }, [isEditPath, mode]);

  // 面包屑导航
  const breadcrumbItems = [
    { title: '首页', path: '/dashboard' },
    { title: 'SPU管理', path: '/products/spu' },
    { title: mode === 'edit' ? '编辑SPU' : 'SPU详情' },
  ];

  // 处理编辑
  const handleEdit = () => {
    navigate(`/spu/${id}/edit`);
  };

  // 处理保存
  const handleSave = async (updatedData: SPUItem) => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await spuService.updateSPU(id, updatedData);
      if (response.success) {
        setCurrentSPU(response.data || updatedData);
        message.success('SPU更新成功');
        navigate(`/spu/${id}`); // 保存后跳转到详情页
      } else {
        message.error(response.message || '更新失败');
      }
    } catch (error) {
      console.error('Update SPU error:', error);
      message.error('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    navigate(`/spu/${id}`);
  };

  // 处理状态变更
  const handleStatusChange = (newStatus: SPUStatus, reason?: string) => {
    if (currentSPU) {
      setCurrentSPU({
        ...currentSPU,
        status: newStatus,
      });
    }
  };

  // 处理返回
  const handleBack = () => {
    navigate('/products/spu');
  };

  // 处理分享
  const handleShare = () => {
    if (id) {
      const shareUrl = `${window.location.origin}/spu/${id}`;
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          message.success('分享链接已复制到剪贴板');
        })
        .catch(() => {
          message.error('复制链接失败');
        });
    }
  };

  // 处理打印
  const handlePrint = () => {
    window.print();
  };

  // 处理导出
  const handleExport = async () => {
    if (id) {
      try {
        setLoading(true);
        const response = await spuService.exportSPU({ spuId: id });
        if (response.success) {
          // 模拟下载
          const link = document.createElement('a');
          link.href = response.data.downloadUrl;
          link.download = `${currentSPU?.name || 'SPU'}_详情.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          message.success('导出成功');
        }
      } catch (error) {
        message.error('导出失败，请重试');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* 页面标题和导航 */}
      <div style={{ marginBottom: 24 }}>
        <CustomBreadcrumb items={breadcrumbItems} />
      </div>

      {/* 页面标题和操作按钮 */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {mode === 'edit' && (
            <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
              取消编辑
            </Button>
          )}
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {mode === 'edit' ? '编辑SPU' : 'SPU详情'}
            </Title>
            {currentSPU && (
              <div style={{ fontSize: '14px', color: '#666', marginTop: 4 }}>
                {currentSPU.name} ({currentSPU.code})
              </div>
            )}
          </div>
        </div>

        {mode === 'view' && (
          <Space wrap>
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
              编辑
            </Button>
            <Button icon={<ShareAltOutlined />} onClick={handleShare}>
              分享
            </Button>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              打印
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport} loading={loading}>
              导出
            </Button>
            <Button onClick={handleBack}>返回列表</Button>
          </Space>
        )}
      </div>

      {/* 主要内容区域 */}
      {dataLoading ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#666' }}>加载中...</div>
          </div>
        </Card>
      ) : mode === 'view' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* SPU详情组件 */}
          {currentSPU && (
            <>
              <SPUDetail spuId={id} mode="page" onEdit={handleEdit} onClose={handleBack} />

              {/* 状态管理组件 */}
              <StatusManager
                spuId={id!}
                currentStatus={currentSPU.status}
                onStatusChange={handleStatusChange}
                compact={false}
              />
            </>
          )}
        </div>
      ) : (
        /* 编辑模式 */
        <SPUEditForm
          spuId={id}
          mode="edit"
          initialData={currentSPU || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
          loading={loading}
        />
      )}
    </div>
  );
};

export default SPUDetailPage;
