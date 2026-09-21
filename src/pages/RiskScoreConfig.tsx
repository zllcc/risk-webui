import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { Card, Tabs, Table, InputNumber, Button, Space, Typography, message } from 'antd';
import type { TableProps } from 'antd';
import {
  buildUpdatePayload,
  queryRiskIndicatorList,
  updateRiskIndicator,
} from '@/api/riskScoreApi';
import { buildIndicatorRows } from '@/utils/riskScore';
import {
  INDICATOR_LEVEL,
  RULE_TYPE,
  type IndicatorRow,
  type RuleRange,
} from '@/types/riskScore';

const { Title, Text } = Typography;

/** 信号色 */
const SIGNAL = { green: '#34A853', yellow: '#FBBC04', red: '#EA4335' };

const Dot = ({ color }: { color: string }) => (
  <span
    style={{
      display: 'inline-block',
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: color,
      marginRight: 6,
      verticalAlign: 'middle',
    }}
  />
);

const NumInput = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) => (
  <InputNumber
    size="small"
    value={value}
    step={1}
    controls={false}
    style={{ width: 72 }}
    onChange={(val) => onChange(Number(val ?? 0))}
  />
);

/** 区间输入：[min] ~ [max] */
const RangeInput = ({
  range,
  onChange,
}: {
  range: RuleRange;
  onChange: (type: 'min' | 'max', val: number) => void;
}) => (
  <Space size={4}>
    <NumInput value={range.min} onChange={(val) => onChange('min', val)} />
    <span style={{ color: '#8A94A6' }}>~</span>
    <NumInput value={range.max} onChange={(val) => onChange('max', val)} />
  </Space>
);

export default function RiskScoreConfig() {
  const [activeTab, setActiveTab] = useState<'l1' | 'l2'>('l1');
  const [rowsL1, setRowsL1] = useState<IndicatorRow[]>([]);
  const [rowsL2, setRowsL2] = useState<IndicatorRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /** 加载指标配置 */
  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const list = await queryRiskIndicatorList({ orderColumn: 'id', orderType: 'asc' });
      const data = Array.isArray(list) ? list : [];
      // L1 硬限额检查：异常值区间取 ruleType=2（黄色预警）
      setRowsL1(
        buildIndicatorRows(
          data.filter((i) => i.level === INDICATOR_LEVEL.L1),
          [RULE_TYPE.NORMAL, RULE_TYPE.YELLOW]
        )
      );
      setRowsL2(
        buildIndicatorRows(
          data.filter((i) => i.level === INDICATOR_LEVEL.L2),
          [RULE_TYPE.NORMAL, RULE_TYPE.RED]
        )
      );
    } catch {
      message.error('加载风险指标配置失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateRows = (
    setter: Dispatch<SetStateAction<IndicatorRow[]>>,
    key: string,
    patch: Partial<IndicatorRow>
  ) => {
    setter((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const updateRange = (
    setter: Dispatch<SetStateAction<IndicatorRow[]>>,
    key: string,
    ruleType: number,
    type: 'min' | 'max',
    val: number
  ) => {
    setter((prev) =>
      prev.map((row) =>
        row.key === key
          ? {
              ...row,
              rules: {
                ...row.rules,
                [ruleType]: { ...row.rules[ruleType], [type]: val },
              },
            }
          : row
      )
    );
  };

  const l2ScoreTotal = useMemo(
    () => Math.round(rowsL2.reduce((sum, i) => sum + (Number(i.riskWeight) || 0), 0) * 10) / 10,
    [rowsL2]
  );

  /** 校验当前 Tab */
  const validate = (rows: IndicatorRow[]) => {
    for (const row of rows) {
      for (const range of Object.values(row.rules)) {
        if (Number(range.min) > Number(range.max)) {
          message.warning(`【${row.indicatorName}】区间最小值不能大于最大值`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    const isL1 = activeTab === 'l1';
    const rows = isL1 ? rowsL1 : rowsL2;
    if (!rows.length) {
      message.warning('暂无可保存的指标配置');
      return;
    }
    if (!validate(rows)) return;
    setSaving(true);
    try {
      await updateRiskIndicator(buildUpdatePayload(rows));
      message.success(isL1 ? 'L1 硬限额检查配置已保存' : 'L2 预警评分体系配置已保存');
      fetchConfig();
    } catch {
      message.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  /** 重置：丢弃未保存修改，恢复为服务端配置 */
  const handleReset = () => {
    fetchConfig();
    message.info('已恢复为服务端保存的配置');
  };

  // ========== L1 表格列 ==========
  const l1Columns: TableProps<IndicatorRow>['columns'] = [
    { title: '指标', dataIndex: 'indicatorName', width: 260 },
    {
      title: (
        <span>
          <Dot color={SIGNAL.green} />
          正常值区间
        </span>
      ),
      width: 240,
      render: (_val, row) => (
        <RangeInput
          range={row.rules[RULE_TYPE.NORMAL]}
          onChange={(type, val) =>
            updateRange(setRowsL1, row.key, RULE_TYPE.NORMAL, type, val)
          }
        />
      ),
    },
    {
      title: (
        <span>
          <Dot color={SIGNAL.red} />
          异常值区间
        </span>
      ),
      width: 240,
      render: (_val, row) => (
        <RangeInput
          range={row.rules[RULE_TYPE.YELLOW]}
          onChange={(type, val) =>
            updateRange(setRowsL1, row.key, RULE_TYPE.YELLOW, type, val)
          }
        />
      ),
    },
  ];

  // ========== L2 表格列 ==========
  const l2Columns: TableProps<IndicatorRow>['columns'] = [
    { title: '指标', dataIndex: 'indicatorName', width: 220 },
    {
      title: (
        <span>
          <Dot color={SIGNAL.green} />
          正常值区间
        </span>
      ),
      width: 220,
      render: (_val, row) => (
        <RangeInput
          range={row.rules[RULE_TYPE.NORMAL]}
          onChange={(type, val) =>
            updateRange(setRowsL2, row.key, RULE_TYPE.NORMAL, type, val)
          }
        />
      ),
    },
    {
      title: (
        <span>
          <Dot color={SIGNAL.red} />
          异常值区间
        </span>
      ),
      width: 220,
      render: (_val, row) => (
        <RangeInput
          range={row.rules[RULE_TYPE.RED]}
          onChange={(type, val) => updateRange(setRowsL2, row.key, RULE_TYPE.RED, type, val)}
        />
      ),
    },
    {
      title: '分值',
      dataIndex: 'riskWeight',
      width: 120,
      render: (_val, row) => (
        <NumInput
          value={row.riskWeight}
          onChange={(val) => updateRows(setRowsL2, row.key, { riskWeight: val })}
        />
      ),
    },
  ];

  return (
    <Card styles={{ body: { padding: 16 } }}>
      <div style={{ marginBottom: 12 }}>
        <Title level={5} style={{ margin: 0 }}>
          风险评分配置
        </Title>
        <Text type="secondary" style={{ fontSize: 12 }}>
          L1 硬限额检查 / L2 预警评分体系均按正常值区间与异常值区间配置；正常区间为规则类型 1，L1 异常区间取规则类型 2（黄色预警），L2 异常区间取规则类型 3（红色预警）
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'l1' | 'l2')}
        items={[
          {
            key: 'l1',
            label: 'L1 硬限额检查',
            children: (
              <Table<IndicatorRow>
                rowKey="key"
                bordered
                size="middle"
                loading={loading}
                columns={l1Columns}
                dataSource={rowsL1}
                pagination={false}
                locale={{ emptyText: '暂无 L1（等级1）指标配置' }}
              />
            ),
          },
          {
            key: 'l2',
            label: 'L2 预警评分体系',
            children: (
              <Table<IndicatorRow>
                rowKey="key"
                bordered
                size="middle"
                loading={loading}
                columns={l2Columns}
                dataSource={rowsL2}
                pagination={false}
                locale={{ emptyText: '暂无 L2（等级2）指标配置' }}
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <b>分值合计</b>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>
                      <b>{l2ScoreTotal}</b>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />
            ),
          },
        ]}
      />

      <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 16 }}>
        <Button onClick={handleReset}>重置</Button>
        <Button type="primary" loading={saving} onClick={handleSave}>
          保存
        </Button>
      </Space>
    </Card>
  );
}
