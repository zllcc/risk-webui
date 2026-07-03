import { Form, Input, Button, Card, message, ConfigProvider, theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { darkAlgorithm } = theme;

export default function Login() {
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    localStorage.setItem('token', 'demo-token');
    message.success('登录成功');
    navigate('/asset-list');
  };

  // 登录页独立深色主题配置
  const loginTheme = {
    algorithm: darkAlgorithm,
    token: {
      // 页面底层背景
      colorBgBase: '#0E1117',
      // Card/表单容器背景
      colorBgContainer: '#161B24',
      // 输入框背景
      colorFillAlter: '#1f2937',
      // 边框分割线
      colorBorder: '#2A303C',
      // 主文字
      colorText: '#C9D1D9',
      // 次要文字（占位、描述）
      colorTextSecondary: '#94a3b8',
      // 占位文字
      colorTextPlaceholder: '#64748b',
      // 主题蓝色（按钮、焦点边框、高亮）
      colorPrimary: '#3070ca',
    },
    components: {
      Card: {
        borderRadiusLG: 12,
      },
      Input: {
        borderRadius: 8,
        controlHeight: 44,
        colorFillAlter: '#243042',
      },
      InputPassword: {
        borderRadius: 8,
        controlHeight: 44,
        colorFillAlter: '#243042',
      },
      Button: {
        controlHeightLG: 46,
        borderRadiusLG: 8,
        fontSizeLG: 16,
      },
      Form: {
        labelFontSize: 15,
      }
    }
  };

  return (
    <ConfigProvider theme={loginTheme}>
      <div style={{
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0E1117',
        width: '400px',
        left: '50%',
        marginLeft: '-200px',
        textAlign: 'center',
        marginTop: '120px',
      }}>
        <div style={{
          marginBottom: 64,
          color: '#fff',
          fontSize: 30,
          
        }}>
          家办财务风控系统
        </div>
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
            <Button type="primary" htmlType="submit" block size="large">
              登录
            </Button>
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  );
}