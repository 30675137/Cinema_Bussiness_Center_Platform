/**
 * 登录页面
 */

import React from 'react';
import { Form, Input, Button, Card, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, ShopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';

const { Title, Text } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUserStore();

  const onFinish = (values: LoginForm) => {
    // 模拟登录逻辑
    login({
      id: '1',
      username: values.username,
      displayName: values.username,
      email: `${values.username}@cinema.com`,
      roles: ['admin'],
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 登录成功后跳转到首页
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <div className="text-center mb-8">
            <Space direction="vertical" size="large">
              <ShopOutlined className="text-6xl text-blue-500" />
              <div>
                <Title level={2} className="mb-2 text-gray-800">
                  影院商品管理中台
                </Title>
                <Text type="secondary" className="text-sm">
                  Cinema Product Management Center
                </Text>
              </div>
            </Space>
          </div>

          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
            layout="vertical"
          >
            <Form.Item
              label="用户名"
              name="username"
              rules={[
                { required: true, message: '请输入用户名!' },
                { min: 3, message: '用户名至少3个字符!' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: '请输入密码!' },
                { min: 6, message: '密码至少6个字符!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-12 text-lg"
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <Divider>
            <Text type="secondary" className="text-xs">
              演示环境
            </Text>
          </Divider>

          <div className="text-center">
            <Space direction="vertical" size="small">
              <Text type="secondary" className="text-xs">
                测试账号：admin / 123456
              </Text>
              <Text type="secondary" className="text-xs">
                支持任意用户名和密码（最少6位）登录
              </Text>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;