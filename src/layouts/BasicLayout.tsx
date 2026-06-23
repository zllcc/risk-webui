import { Layout, Button, Typography, Space, ConfigProvider } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogoutOutlined, FileTextOutlined, DashboardOutlined } from '@ant-design/icons';
import locale from 'antd/locale/zh_CN';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function BasicLayout() {
  const navigate = useNavigate();

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 顶部导航：全屏、深色、无左右边距 */}
      <Header
        style={{
          background: '#34495e',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
        }}
      >
        {/* 左侧导航按钮 */}
        <Space size="middle">
          <Button
            type="text"
            icon={<DashboardOutlined />}
            onClick={() => navigate('/overview')}
            style={{ color: '#fff' }}
          >
            总览
          </Button>
          <Button
            type="text"
            icon={<DashboardOutlined />}
            onClick={() => navigate('/asset-list')}
            style={{ color: '#fff' }}
          >
            资产列表
          </Button>
          <Button
            type="text"
            icon={<FileTextOutlined />}
            onClick={() => navigate('/asset-detail')}
            style={{ color: '#fff' }}
          >
            资产详情
          </Button>
          <Button
            type="text"
            icon={<FileTextOutlined />}
            onClick={() => navigate('/asset-analysis')}
            style={{ color: '#fff' }}
          >
            投资组合分析
          </Button>
        </Space>

        {/* 右侧：标题 + 退出 */}
        <Space size="middle">
          <Title level={5} style={{ color: '#fff', margin: 0 }}>
            欢迎，管理员
          </Title>
          <Button
            type="text"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            退出登录
          </Button>
        </Space>
      </Header>

      {/* 内容区：顶部留导航高度，左右自动边距 */}
      <Content
        style={{
          marginTop: 64, // Header 高度
          padding: '24px', // 左右下全局边距
          background: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <ConfigProvider locale={locale}>
          <Outlet /> {/* 子页面渲染在这里 */}
        </ConfigProvider>
      </Content>
    </Layout>
  );
}