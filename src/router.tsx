import { Navigate, useRoutes } from 'react-router-dom';
import Login from './pages/Login.js';
import AssetList from './pages/AssetList.jsx';
import OverviewList from './pages/OverviewList.jsx';
import AssetDetail from './pages/AssetDetail.js';
import PortfolioAnalysis from './pages/PortfolioAnalysis.js';
import BasicLayout from './layouts/BasicLayout.js';

// 路由守卫：简单用 localStorage 模拟登录
const PrivateRoute = ({ children } : any ) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

export default function Router() {
  return useRoutes([
    { path: '/login', element: <Login /> },
    {
      path: '/',
      element: (
        <PrivateRoute>
          <BasicLayout />
        </PrivateRoute>
      ),
      children: [
        { path: '', element: <Navigate to="asset-list" replace /> },
        { path: 'overview', element: <OverviewList /> },
        { path: 'asset-list', element: <AssetList /> },
        { path: 'asset-detail', element: <AssetDetail /> },
        { path: 'asset-analysis', element: <PortfolioAnalysis /> },
      ],
    },
  ]);
}