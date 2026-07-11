import { Navigate, useRoutes } from 'react-router-dom';
import Login from './pages/Login.js';
import AssetList from './pages/AssetList.tsx';
import OverviewList from './pages/OverviewList.tsx';
import TradeList from './pages/TradeList.tsx';
import PortfolioAnalysis from './pages/PortfolioAnalysis.tsx';
import BasicLayout from './layouts/BasicLayout.tsx';
import TraderPrincipalPage from './pages/TraderPrincipal.tsx';

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
        { path: 'trade-list', element: <TradeList /> },
        { path: 'asset-analysis', element: <PortfolioAnalysis /> },
        { path: 'trader-manage', element: <TraderPrincipalPage /> },
      ],
    },
  ]);
}