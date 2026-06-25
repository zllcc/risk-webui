import React, { useState } from 'react';
import { Divider, Checkbox, Input, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
const { Text } = Typography;

interface AccountItem {
  id: string;
  name: string;
  type: string;
  totalAsset: number;
  profitRate: number;
  deposit: number;
  withdraw: number;
}

// ===================== 模拟账户数据 =====================
const accountList: AccountItem[] = [
  { id: 'U10726086', name: 'U10726086', type: '机构', totalAsset: 23590000, profitRate: -7.87, deposit: 0, withdraw: 0 },
  { id: 'U10045181', name: 'U10045181', type: '机构', totalAsset: 12860000, profitRate: 2.15, deposit: 50000, withdraw: 0 },
  { id: 'U10620502', name: 'U10620502', type: '机构', totalAsset: 8920000, profitRate: 1.02, deposit: 20000, withdraw: 10000 },
  { id: 'U10641367', name: 'U10641367', type: '机构', totalAsset: 5600000, profitRate: 0.35, deposit: 0, withdraw: 30000 },
];
// 账户弹窗内容
const AccountModalContent: React.FC = () => {
  const [searchKey, setSearchKey] = useState('');

  // 过滤账户
  const filterAccounts = accountList.filter(item => item.name.includes(searchKey));
  const [selectedIds, setSelectedIds] = useState<string[]>([accountList[0].id]);
  const [currentAccount, setCurrentAccount] = useState<AccountItem>(accountList[0]);

  // 多选账户
  const toggleSelectAcc = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(i => i !== id));
    }
  };

  // 单选账户（弹窗点击选中）
  const selectSingleAcc = (acc: AccountItem) => {
    setCurrentAccount(acc);
    setSelectedIds([acc.id]);
  };
  return(<>
    <Input
      placeholder="搜索账户"
      prefix={<SearchOutlined />}
      value={searchKey}
      onChange={e => setSearchKey(e.target.value)}
      style={{ marginBottom: 16 }}
    />
    <div style={{ maxHeight: 500, overflowY: 'auto' }}>
      {filterAccounts.map(acc => (
        <div
          key={acc.id}
          style={{
            padding: 12,
            border: '1px solid #eee',
            borderRadius: 4,
            marginBottom: 8,
            cursor: 'pointer',
            background: currentAccount.id === acc.id ? '#e8f0fe' : '#fff'
          }}
          onClick={() => selectSingleAcc(acc)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Checkbox
              checked={selectedIds.includes(acc.id)}
              onChange={e => {
                e.stopPropagation();
                toggleSelectAcc(acc.id, e.target.checked);
              }}
            >
              {acc.name}
            </Checkbox>
            <Text type="secondary">{acc.type}</Text>
          </div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
            总资产：{(acc.totalAsset / 1000000).toFixed(2)}M USD
            <span style={{ marginLeft: 12, color: acc.profitRate >= 0 ? '#2e7d32' : '#d32f2f' }}>
              收益率：{acc.profitRate >= 0 ? '+' : ''}{acc.profitRate}%
            </span>
          </div>
        </div>
      ))}
    </div>
    <Divider />
    <Text>已选择 {selectedIds.length} 个账户</Text>
  </>)
};

export default AccountModalContent;
