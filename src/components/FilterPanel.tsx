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
  subjectMatterKeys: string[];
  sectorKeys: string[];
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
export const subjectMatterOpts = ["Apple", "NVIDIA", "Tesla", "Microsoft", "Amazon", "Google", "Meta", "Netflix", "AMD", "Intel"];
export const sectorOpts = ["Energy", "Materials", "Industrials", "ConsumerDiscretionary", "ConsumerStaples", "HealthCare", "Financials", "InformationTechnology", "CommunicationServices", "Utilities", "RealEstate"];


interface FilterPanelProps {
  onSearch: (params: FilterParams) => void;
  pageType: 'overview' | 'asset' | 'analysis';
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onSearch, pageType }) => {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]); // 账号选择
  const [selectedTraders, setSelectedTraders] = useState<string[]>([]); // 操盘人选择
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]); // 策略选择
  const [selectedSubjectMatter, setSelectedSubjectMatter] = useState<string[]>([]); // 板块选择
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]); // 标的选择

  const [tempTimeQuick, setTempTimeQuick] = useState<string | null>(timeShortOpts[0]); // 快捷时间段选择
  const [tempCustomDate, setTempCustomDate] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null); // 自定义时间段选择
  const [benchmarkType, setBenchmarkType] = useState('default'); // 业绩基准选择

  const [strategyList, setStrategyList] = useState<Array<{ strategyName: string }>>([]) // 策略列表

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

  const handleQuery = () => {
    onSearch({
      accountKeys: selectedAccounts,
      traderKeys: selectedTraders,
      strategyKeys: selectedStrategies,
      timeQuick: tempTimeQuick,
      customDate: tempCustomDate,
      benchmarkType,
      subjectMatterKeys: selectedSubjectMatter,
      sectorKeys: selectedSectors,
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

  // 总览：三项、时间、业绩基准
  // 资产：三项、时间、模块、标的
  // 分析：三项、时间

  const formItemArr = [
    {
      label: '账号',
      isShow: true,
      content: (
        <Select
          mode="multiple"
          placeholder="多选账号"
          style={{ minWidth: 200 }}
          options={accountOptions}
          value={selectedAccounts}
          onChange={handleAccountChange}
          allowClear
        />
      ),
    },
    {
      label: '操盘人',
      isShow: true,
      content: (
        <Select
          mode="multiple"
          placeholder="先选账号再选操盘人"
          style={{ minWidth: 200 }}
          options={traderOptions}
          value={selectedTraders}
          onChange={handleTraderChange}
          allowClear
        />
      ),
    },
    {
      label: '策略',
      isShow: true,
      content: (
        <Select
          mode="multiple"
          placeholder="先选操盘人再选策略"
          style={{ minWidth: 200 }}
          options={strategyList.map(item => ({ value: item.strategyName, label: item.strategyName }))}
          value={selectedStrategies}
          onChange={setSelectedStrategies}
          allowClear
        />
      ),
    },
    {
      label: '快捷时间段',
      isShow: true,
      content: (
        <Select
          value={tempTimeQuick}
          onChange={handleQuickTimeChange}
          style={{ width: 200 }}
        >
          {timeShortOpts.map((item) => (
            <Select.Option key={item} value={item}>{item}</Select.Option>
          ))}
        </Select>
      ),
    },
    {
      label: '自定义区间',
      isShow: true,
      content: (
        <RangePicker
          value={tempCustomDate}
          onChange={handleDateRangeChange}
        />
      ),
    },
    {
      label: '标的',
      isShow: pageType === 'asset',
      content: (
        <Select
          mode="multiple"
          placeholder="选择标的"
          style={{ minWidth: 200 }}
          options={sectorOpts.map(item => ({ value: item, label: item }))}
          value={selectedSectors}
          onChange={(val) => setSelectedSectors(val)}
          allowClear
        />
      ),
    },
    {
      label: '板块',
      isShow: pageType === 'asset',
      content: (
        <Select
          mode="multiple"
          placeholder="选择板块"
          style={{ minWidth: 200 }}
          options={subjectMatterOpts.map(item => ({ value: item, label: item }))}
          value={selectedSubjectMatter}
          onChange={setSelectedSubjectMatter}
          allowClear
        />
      ),
    },
    {
      label: '业绩基准',
      isShow: pageType === 'overview',
      content: (
        <Select value={benchmarkType} onChange={setBenchmarkType} style={{ width: 200 }}>
          <Select.Option value="default">默认对应关系</Select.Option>
          <Select.Option value="custom">可手动切换</Select.Option>
        </Select>
      ),
    }
  ]

  return (
    <>
      <Row gutter={[16, 12]} style={{ marginBottom: 12 }} align="middle">
        {formItemArr.map((item, index) => (
          item.isShow && <Col key={index} span={6}>
            <div>{item.label}：</div>
            <Space size="small" align="baseline">
              {item.content}
            </Space>
          </Col>
        ))}
      </Row>
      <Row style={{ marginBottom: 24 }} align="middle" justify="end">
        <Col>
          <Button type="primary" onClick={handleQuery}>查询</Button>
        </Col>
      </Row>
    </>
  );
};

export default FilterPanel;