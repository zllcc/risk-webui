import { Layout, Button, Typography, Space, ConfigProvider, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogoutOutlined, FileTextOutlined, DashboardOutlined } from '@ant-design/icons';
import locale from 'antd/locale/zh_CN';
const { darkAlgorithm } = theme;

const { Header, Content } = Layout;
const { Title } = Typography;

// 导航菜单配置，统一管理路由、名称、图标
const navMenus = [
  { path: '/overview', label: '总览', icon: <DashboardOutlined /> },
    { path: '/asset-list', label: '持仓列表', icon: <DashboardOutlined /> },
  { path: '/trade-list', label: '交易列表', icon: <FileTextOutlined /> },
  { path: '/asset-analysis', label: '投资组合分析', icon: <FileTextOutlined /> },
  { path: '/trader', label: '交易员本金', icon: <FileTextOutlined /> },
];

export default function BasicLayout() {
  const navigate = useNavigate();
  // 获取当前路由地址
  const location = useLocation();
  const currentPath = location.pathname;

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
          background: '#161B24',
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
        {/* 左侧导航按钮，循环渲染自动判断高亮 */}
        <Space
          size="middle"
        >
          <Title level={4} style={{ color: '#fff', marginRight: 24, marginBottom: 0 }}>
            家办财务风控系统
          </Title>
          {navMenus.map((item) => {
            // 判断是否为当前选中路由
            const isActive = currentPath === item.path;
            return (
              <div
                style={{
                  background: isActive ? 'rgba(48, 112, 202, 0.22)' : 'transparent',
                  borderRadius: 4,
                }}
              >
              <Button
                key={item.path}
                type="text"
                onClick={() => navigate(item.path)}
                style={{
                  color: isActive ? '#fff' : '#B8C2D6',
                  height: '100%'
                }}
              >
                {item.label}
              </Button>
              </div>
            );
          })}
        </Space>

        {/* 右侧：标题 + 退出 */}
        <Space size="middle">
          <Title level={5} style={{ color: '#B8C2D6', margin: 0 }}>
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
          background: 'rgb(24,34,54)',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <ConfigProvider
          locale={locale}
          theme={{
            algorithm: darkAlgorithm, // 开启全局深色算法
            // 自定义深色主色调（可选，默认蓝色）
            token: {
              colorPrimary: '#1677ff',
              colorBgBase: '#0E1117', // 全局背景色
            },
          }}
        >
          <Outlet /> {/* 子页面渲染在这里 */}
        </ConfigProvider>
      </Content>
    </Layout>
  );
}