import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

export default function Login() {
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    // 模拟登录成功
    localStorage.setItem('token', 'demo-token');
    message.success('登录成功');
    navigate('/asset-list');
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
      }}
    >
      <Card title="系统登录" style={{ width: 400 }}>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="admin" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="123456" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            登录
          </Button>
        </Form>
      </Card>
    </div>
  );
}