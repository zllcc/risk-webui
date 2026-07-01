import React, { useState, useEffect } from 'react';
import { Row, Col, Space, Select, DatePicker, Button } from 'antd';
import type { SelectProps } from 'antd/es/select';
import { queryInvestStrategy, getContractSectorList, getContractList } from '@/api/investApi'
import { getAccountSelectList, getTraderSelectList } from '@/api/accountApi'
import { getReferenceIndexList } from '@/api/overviewApi';
import { ReferenceIndexItem } from '@/types/common';
import { getQuickDateRange } from '@/utils/dateRange';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export interface FilterParams {
  accountCodes: string[];
  tradeNames: string[];
  strategyNames: string[];
  startDate: string | null;
  endDate: string | null;
  referenceIndexConids?: string[];
  conids?: string[];
  sectors?: string[];
}

export const timeShortOpts = ["当日", "近7日", "30日", "YTD", "近1年"];

interface FilterPanelProps {
  onSearch: (params: FilterParams) => void;
  pageType: 'overview' | 'asset' | 'analysis';
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onSearch, pageType }) => {
  // 选中值
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedTraders, setSelectedTraders] = useState<string[]>([]);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [selectedSubjectMatter, setSelectedSubjectMatter] = useState<string[]>([]); // 板块
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]); // 标的

  const [tempTimeQuick, setTempTimeQuick] = useState<string | null>(timeShortOpts[0]);
  const [tempCustomDate, setTempCustomDate] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [benchmarkType, setBenchmarkType] = useState<string[]>([]);

  // 下拉选项数据源（后端接口）
  const [accountOptions, setAccountOptions] = useState<SelectProps['options']>([]);
  const [traderOptions, setTraderOptions] = useState<SelectProps['options']>([]);
  const [strategyList, setStrategyList] = useState<Array<{ value: string; label: string }>>([]);
  const [indexOptions, setIndexOptions] = useState<ReferenceIndexItem[]>([]);
  const [sectorOptions, setSectorOptions] = useState<SelectProps['options']>([]); // 板块下拉
  const [contractOptions, setContractOptions] = useState<SelectProps['options']>([]); // 标的下拉

  // 1. 获取账号下拉
  const fetchAccountList = async () => {
    try {
      const res = await getAccountSelectList('');
      setAccountOptions(res);
    } catch (err) {
      console.error('获取账号列表失败', err);
    }
  };

  // 2. 根据选中账号获取操盘人
  const fetchTraderList = async (codes: string[]) => {
    try {
      const res = await getTraderSelectList({ accountCodes: codes, traderName: '' });
      setTraderOptions(res);
    } catch (err) {
      console.error('获取操盘人列表失败', err);
      setTraderOptions([]);
    }
  };

  // 3. 获取策略下拉
  const fetchStrategyList = async () => {
    try {
      const res = await queryInvestStrategy('');
      setStrategyList(res);
    } catch (err) {
      console.error('获取策略失败', err)
    }
  }

  // 4. 获取基准指数
  const fetchIndexOptions = async () => {
    try {
      const data = await getReferenceIndexList();
      setIndexOptions(data);
    } catch (err) {
      console.error('获取基准指数失败', err);
    }
  };

  // 5. 获取板块下拉
  const fetchSectorOptions = async () => {
    try {
      const res = await getContractSectorList();
      setSectorOptions(res);
    } catch (err) {
      console.error('获取板块列表失败', err);
    }
  };

  // 6. 获取标的下拉（传空symbol查全部）
  const fetchContractOptions = async () => {
    try {
      const res = await getContractList('');
      setContractOptions(res);
    } catch (err) {
      console.error('获取标的列表失败', err);
    }
  };

  // 初始化加载所有基础下拉
  useEffect(() => {
    fetchAccountList();
    fetchIndexOptions();
    fetchStrategyList();
    fetchSectorOptions();
    fetchContractOptions();
  }, [])

  // 选中账号变化，重新拉取操盘人
  useEffect(() => {
    fetchTraderList(selectedAccounts);
  }, [selectedAccounts])

  // 查询按钮
  const handleQuery = () => {
    const tempTimeQuickRange = tempTimeQuick ? getQuickDateRange(tempTimeQuick) : null;
    const startDate = tempCustomDate ? tempCustomDate[0].format('YYYY-MM-DD HH:mm:ss') : (tempTimeQuickRange ? tempTimeQuickRange[0] : null);
    const endDate = tempCustomDate ? tempCustomDate[1].format('YYYY-MM-DD HH:mm:ss') : (tempTimeQuickRange ? tempTimeQuickRange[1] : null);
    const typeParams: {
    referenceIndexConids?: string[];
    conids?: string[];
    sectors?: string[];
    } = pageType === 'overview' ? { referenceIndexConids: benchmarkType } : { conids: selectedSectors, sectors: selectedSubjectMatter };
    onSearch({
      accountCodes: selectedAccounts,
      tradeNames: selectedTraders,
      strategyNames: selectedStrategies,
      startDate,
      endDate,
      ...typeParams
    });
  };

  // 快捷时间切换
  const handleQuickTimeChange = (val: string) => {
    setTempTimeQuick(val);
    setTempCustomDate(null);
  };

  // 自定义日期切换
  const handleDateRangeChange = (vals: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
    setTempCustomDate(vals);
    setTempTimeQuick(null);
  };

  // 切换账号，清空下级选择
  const handleAccountChange = (vals: string[]) => {
    setSelectedAccounts(vals);
  };

  // 切换操盘人，清空策略
  const handleTraderChange = (vals: string[]) => {
    setSelectedTraders(vals);
  };

  // 筛选项配置
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
          placeholder="选择操盘人"
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
          placeholder="选择策略"
          style={{ minWidth: 200 }}
          options={strategyList}
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
          options={timeShortOpts.map(item => ({ value: item, label: item }))}
        />
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
          options={contractOptions}
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
          options={sectorOptions}
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
        <Select
          mode="multiple"
          style={{ width: 200 }}
          allowClear
          options={indexOptions}
          value={benchmarkType}
          onChange={setBenchmarkType}
          placeholder="请选择业绩基准"
        />
      ),
    }
  ]

  return (
    <>
      <Row gutter={[16, 12]} style={{ marginBottom: 12 }} align="middle">
        {formItemArr.map((item, index) => (
          item.isShow && (
            <Col key={index} span={6}>
              <div>{item.label}：</div>
              <Space size="small" align="baseline">
                {item.content}
              </Space>
            </Col>
          )
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