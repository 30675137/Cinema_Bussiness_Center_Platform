import React from 'react'
import { Layout } from 'antd'
import { Breadcrumb } from '@/components/common/Breadcrumb'

const { Content } = Layout

interface ContentProps {
  children: React.ReactNode
  title?: string
  breadcrumb?: Array<{ title: string; path?: string }>
  extra?: React.ReactNode
}

const ContentLayout: React.FC<ContentProps> = ({
  children,
  title,
  breadcrumb,
  extra
}) => {
  return (
    <Layout style={{ marginLeft: 256, minHeight: '100vh' }}>
      <Content
        style={{
          padding: '24px',
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {title && (
          <div
            style={{
              padding: '16px 24px',
              marginBottom: '16px',
              background: '#fff',
              borderRadius: '8px',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              {breadcrumb && (
                <Breadcrumb
                  items={breadcrumb}
                  style={{ marginBottom: '8px' }}
                />
              )}
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                {title}
              </h1>
            </div>
            {extra && (
              <div>
                {extra}
              </div>
            )}
          </div>
        )}

        <div
          style={{
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
            padding: '24px',
          }}
        >
          {children}
        </div>
      </Content>
    </Layout>
  )
}

export default ContentLayout