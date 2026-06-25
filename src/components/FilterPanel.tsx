import React, { useState, useMemo, useEffect } from 'react';
import { Row, Col, Space, Select, DatePicker, Button } from 'antd';
import type { SelectProps } from 'antd/es/select';
import { getInvestStrategy } from '@/api/investApi'
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface TreeOption {
  value: string;
  label: string;
  children?: TreeOption[];
}
export interface FilterParams {
  accountKeys: string[];
  traderKeys: string[];
  strategyKeys: string[];
  timeQuick: string | null;
  customDate: [dayjs.Dayjs, dayjs.Dayjs] | null;
  benchmarkType: string;
}

const originTreeData: TreeOption[] = [
  {
    value: 'accA',
    label: '账户A',
    children: [
      {
        value: 'guo',
        label: '郭老师',
        children: [
          { value: 'stock', label: '股票策略' },
          { value: 'option', label: '期权策略' },
        ],
      },
      {
        value: 'hu',
        label: '胡总',
        children: [{ value: 'bond', label: '固收策略' }],
      },
    ],
  },
  {
    value: 'accB',
    label: '账户B',
    children: [
      {
        value: 'kuka',
        label: 'KUKA',
        children: [{ value: 'mix', label: '混合策略' }],
      },
    ],
  },
];

export const timeShortOpts = ["当日", "近7日", "30日", "YTD", "近1年"];

interface FilterPanelProps {
  onSearch: (params: FilterParams) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onSearch }) => {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedTraders, setSelectedTraders] = useState<string[]>([]);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);

  const [tempTimeQuick, setTempTimeQuick] = useState<string | null>(timeShortOpts[0]);
  const [tempCustomDate, setTempCustomDate] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [benchmarkType, setBenchmarkType] = useState('default');

  const [strategyList, setStrategyList] = useState<Array<{ strategyName: string }>>([])

  const fetchData = async () => {
    try {
      // 传搜索关键词，空字符串查询全部
      const res = await getInvestStrategy('')
      console.log('获取策略', res)
      setStrategyList(res)
    } catch (err) {
      console.error('获取策略失败', err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])


  const accountOptions = useMemo(() => originTreeData.map(acc => ({ value: acc.value, label: acc.label })), []);

  const traderOptions = useMemo(() => {
    const traders: SelectProps['options'] = [];
    originTreeData.forEach(acc => {
      if (selectedAccounts.includes(acc.value)) {
        acc.children?.forEach(trader => {
          traders.push({ value: trader.value, label: trader.label });
        });
      }
    });
    return traders;
  }, [selectedAccounts]);

  const strategyOptions = useMemo(() => {
    const strategies: SelectProps['options'] = [];
    originTreeData.forEach(acc => {
      acc.children?.forEach(trader => {
        if (selectedTraders.includes(trader.value)) {
          trader.children?.forEach(str => {
            strategies.push({ value: str.value, label: str.label });
          });
        }
      });
    });
    return strategies;
  }, [selectedTraders]);

  const handleQuery = () => {
    onSearch({
      accountKeys: selectedAccounts,
      traderKeys: selectedTraders,
      strategyKeys: selectedStrategies,
      timeQuick: tempTimeQuick,
      customDate: tempCustomDate,
      benchmarkType,
    });
  };

  const handleQuickTimeChange = (val: string) => {
    setTempTimeQuick(val);
    setTempCustomDate(null);
  };

  const handleDateRangeChange = (vals: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
    setTempCustomDate(vals);
    setTempTimeQuick(null);
  };

  const handleAccountChange = (vals: string[]) => {
    setSelectedAccounts(vals);
    setSelectedTraders([]);
    setSelectedStrategies([]);
  };
  const handleTraderChange = (vals: string[]) => {
    setSelectedTraders(vals);
    setSelectedStrategies([]);
  };

  return (
    <>
      <Row gutter={[16, 12]} style={{ marginBottom: 12 }} align="middle">
        <Col>
          <Space size="small" align="baseline">
            <span>账号：</span>
            <Select
              mode="multiple"
              placeholder="多选账号"
              style={{ minWidth: 200 }}
              options={accountOptions}
              value={selectedAccounts}
              onChange={handleAccountChange}
              allowClear
            />
          </Space>
        </Col>
        <Col>
          <Space size="small" align="baseline">
            <span>操盘人：</span>
            <Select
              mode="multiple"
              placeholder="先选账号再选操盘人"
              style={{ minWidth: 200 }}
              options={traderOptions}
              value={selectedTraders}
              onChange={handleTraderChange}
              allowClear
            />
          </Space>
        </Col>
        <Col>
          <Space size="small" align="baseline">
            <span>策略：</span>
            <Select
              mode="multiple"
              placeholder="先选操盘人再选策略"
              style={{ minWidth: 200 }}
              options={strategyList}
              value={selectedStrategies}
              onChange={setSelectedStrategies}
              allowClear
            />
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 12]} style={{ marginBottom: 24 }} align="middle">
        <Col>
          <Space size="small" align="baseline">
            <span>快捷时间段：</span>
            <Select
              value={tempTimeQuick}
              onChange={handleQuickTimeChange}
              style={{ width: 100 }}
            >
              {timeShortOpts.map((item) => (
                <Select.Option key={item} value={item}>{item}</Select.Option>
              ))}
            </Select>
          </Space>
        </Col>
        <Col>
          <Space size="small" align="baseline">
            <span>自定义区间：</span>
            <RangePicker
              value={tempCustomDate}
              onChange={handleDateRangeChange}
            />
          </Space>
        </Col>
        <Col>
          <Space size="small" align="baseline">
            <span>业绩基准：</span>
            <Select value={benchmarkType} onChange={setBenchmarkType} style={{ width: 130 }}>
              <Select.Option value="default">默认对应关系</Select.Option>
              <Select.Option value="custom">可手动切换</Select.Option>
            </Select>
          </Space>
        </Col>
        <Col>
          <Button type="primary" onClick={handleQuery}>查询</Button>
        </Col>
      </Row>
    </>
  );
};

export default FilterPanel;