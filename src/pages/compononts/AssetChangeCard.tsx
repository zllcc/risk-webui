import React from 'react';
import { Tooltip, Typography, Divider } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

// 单行列数据类型
export interface AssetRowItem {
  label: string;       // 类别名称
  startVal: number;     // 期初数值
  endVal: number;       // 期末数值
  changeVal: number;    // 变动值
  tipDesc?: string;     // 鼠标悬浮提示文案
}

interface AssetChangeCardProps {
  currency: string;     // 币种 USD / CNY
  dataList: AssetRowItem[];
  onRefresh?: () => void;
}

// 数字格式化 自动转 M 百万展示
const formatMoney = (num: number) => {
  const mVal = num / 1000000;
  return `${mVal.toFixed(2)}M`;
};

const AssetChangeCard: React.FC<AssetChangeCardProps> = ({
  currency,
  dataList,
  onRefresh,
}) => {
  return (
    <>
      {/* 表头 */}
      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr', marginBottom: 12 }}>
        <Text type="secondary">类别</Text>
        <Text type="secondary" style={{ textAlign: 'center' }}>开始</Text>
        <Text type="secondary" style={{ textAlign: 'center' }}>结束</Text>
        <Text type="secondary" style={{ textAlign: 'center' }}>变动</Text>
      </div>

      {/* 分割线 */}
      <Divider />

      {/* 数据行循环渲染 */}
      {dataList.map((row) => {
        const changeTextColor = row.changeVal < 0 ? '#f5222d' : undefined;
        return (
          <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr', marginBottom: 18, alignItems: 'center' }}>
            <Text>{row.label}</Text>

            {/* 期初 */}
            <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Text>{formatMoney(row.startVal)}</Text>
              {row.tipDesc && (
                <Tooltip title={row.tipDesc}>
                  <InfoCircleOutlined style={{ color: '#1677ff' }} />
                </Tooltip>
              )}
            </div>

            {/* 期末 */}
            <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Text>{formatMoney(row.endVal)}</Text>
              {row.tipDesc && (
                <Tooltip title={row.tipDesc}>
                  <InfoCircleOutlined style={{ color: '#1677ff' }} />
                </Tooltip>
              )}
            </div>

            {/* 变动值 负数红色 */}
            <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Text style={{ color: changeTextColor }}>{formatMoney(row.changeVal)}</Text>
              {row.tipDesc && (
                <Tooltip title={row.tipDesc}>
                  <InfoCircleOutlined style={{ color: '#1677ff' }} />
                </Tooltip>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default AssetChangeCard;