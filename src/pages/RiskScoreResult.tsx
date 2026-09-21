import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Progress,
  Space,
  Typography,
  DatePicker,
  message,
} from 'antd';
import type { TableProps } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  calRiskIndicator,
  queryRiskIndicatorData,
  queryRiskIndicatorList,
} from '@/api/riskScoreApi';
import { calcRiskScore } from '@/utils/riskScore';
import type { HitLevel, RiskScoreResult } from '@/types/riskScore';

const { Title, Text } = Typography;

const LEVEL_COLOR: Record<string, string> = {
  高风险: '#EA4335',
  中风险: '#FBBC04',
  低风险: '#34A853',
  normal: '#34A853',
  warning: '#FBBC04',
  danger: '#EA4335',
};

/** 明细表格行：分组行 / 指标行 / 合计行 */
interface DetailRow {
  rowKey: string;
  rowType: 'group' | 'item' | 'total';
  /** 所属分组（L1 / L2），仅指标行有值 */
  groupKey?: string;
  name: string;
  value?: number;
  score: number;
  fullScore: number;
  level?: HitLevel;
  status?: number;
}

export default function RiskScoreResult() {
  const [dailyDate, setDailyDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [result, setResult] = useState<RiskScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [calcLoading, setCalcLoading] = useState(false);

  const fetchResult = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const [list, countVo] = await Promise.all([
        queryRiskIndicatorList({ orderColumn: 'id', orderType: 'asc' }),
        queryRiskIndicatorData({ dailyDate: date }),
      ]);
      setResult(calcRiskScore(Array.isArray(list) ? list : [], countVo, date));
    } catch {
      message.error('加载风险评分结果失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResult(dailyDate);
  }, [dailyDate, fetchResult]);

  /** 触发计算 */
  const handleCalculate = async () => {
    setCalcLoading(true);
    try {
      await calRiskIndicator({ dailyDate });
      message.success('评分计算完成');
      await fetchResult(dailyDate);
    } catch {
      message.error('评分计算失败');
    } finally {
      setCalcLoading(false);
    }
  };

  /** 明细表格数据：分组条 + 指标行 + 合计行 */
  const detailRows = useMemo<DetailRow[]>(() => {
    if (!result) return [];
    const rows: DetailRow[] = [];
    result.groups.forEach((group) => {
      rows.push({
        rowKey: `group-${group.key}`,
        rowType: 'group',
        name: group.title,
        score: group.subtotal,
        fullScore: group.fullScore,
      });
      group.items.forEach((item) => {
        rows.push({
          rowKey: item.key,
          rowType: 'item',
          groupKey: group.key,
          name: item.name,
          value: item.value,
          score: item.score,
          fullScore: item.fullScore,
          level: item.level,
          status: item.status,
        });
      });
    });
    rows.push({
      rowKey: 'total',
      rowType: 'total',
      name: '合计',
      score: result.totalScore,
      fullScore: result.totalFullScore,
    });
    return rows;
  }, [result]);

  const rowBg = (row: DetailRow) => {
    if (row.rowType === 'group') return 'rgba(255,255,255,0.05)';
    if (row.rowType === 'total') return 'rgba(255,255,255,0.09)';
    return undefined;
  };

  const columns: TableProps<DetailRow>['columns'] = [
    {
      title: '指标',
      dataIndex: 'name',
      onCell: (row) => ({
        colSpan: row.rowType === 'item' ? 1 : 2,
        style: { background: rowBg(row) },
      }),
      render: (_val, row) => (row.rowType === 'item' ? row.name : <b>{row.name}</b>),
    },
    {
      title: '指标值',
      dataIndex: 'value',
      align: 'right',
      width: 180,
      onCell: (row) => ({
        colSpan: row.rowType === 'item' ? 1 : 0,
        style: { background: rowBg(row) },
      }),
      render: (_val, row) => (row.rowType === 'item' ? row.value : null),
    },
    {
      // L1 展示状态，L2 展示「得分 / 满分」
      title: '得分 / 状态',
      dataIndex: 'score',
      align: 'right',
      width: 200,
      onCell: (row) => ({ style: { background: rowBg(row) } }),
      render: (_val, row) => {
        // 分组小计 / 合计行
        if (row.rowType !== 'item') {
          if (row.fullScore <= 0) {
            return <Text type="secondary">不计分</Text>;
          }
          return (
            <b>
              {row.score} / {row.fullScore}
            </b>
          );
        }
        // L1 硬限额检查：按接口 status 展示状态（1 正常绿 / 2 异常红）
        if (row.groupKey === 'L1') {
          if (row.status === 2) {
            return <Tag color="red">异常</Tag>;
          }
          if (row.status === 1) {
            return <Tag color="green">正常</Tag>;
          }
          return <Text type="secondary">无数据</Text>;
        }
        // L2 预警评分体系：得分 / 满分
        return (
          <b style={{ color: LEVEL_COLOR[row.level ?? 'normal'] }}>
            {row.score} / {row.fullScore}
          </b>
        );
      },
    },
  ];

  const levelColor = result ? LEVEL_COLOR[result.level] : '#8A94A6';

  return (
    <Card styles={{ body: { padding: 16 } }}>
      {/* 标题行 + 日期筛选 */}
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 12 }}>
        <Title level={5} style={{ margin: 0 }}>
          风险评分结果明细
        </Title>
        <Space size={8}>
          <Text type="secondary">数据日期</Text>
          <DatePicker
            value={dailyDate ? dayjs(dailyDate) : null}
            onChange={(_, dateStr) => setDailyDate(dateStr as string)}
            allowClear={false}
            placeholder="请选择日期"
          />
          <Button onClick={() => fetchResult(dailyDate)}>查询</Button>
        </Space>
      </Space>

      {/* 综合评分卡片 */}
      {result && (
        <div
          style={{
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            flexWrap: 'wrap',
          }}
        >
          {/* 综合总分 */}
          <div style={{ minWidth: 160 }}>
            <Text type="secondary">综合评分</Text>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 40, fontWeight: 700, color: levelColor, lineHeight: 1.1 }}>
                {result.totalScore}
              </span>
              <Text type="secondary">/ {result.totalFullScore}</Text>
            </div>
            <Space size={4} style={{ marginTop: 6 }}>
              <Tag color={levelColor} style={{ color: levelColor }}>
                {result.level}（{result.ratio}%）
              </Tag>
              {result.l1Breached && <Tag color="red">L1 硬限额击穿</Tag>}
            </Space>
          </div>

          {/* 得分构成 */}
          <div style={{ flex: 1, minWidth: 320 }}>
            <Text type="secondary">得分构成</Text>
            {result.groups.map((group) => (
              <div key={group.key} style={{ marginTop: 8 }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text>{group.title}</Text>
                  <Text>
                    {group.fullScore > 0 ? `${group.subtotal} / ${group.fullScore}` : '不计分'}
                  </Text>
                </Space>
                <Progress
                  percent={
                    group.fullScore > 0
                      ? Math.round((group.subtotal / group.fullScore) * 100)
                      : 0
                  }
                  strokeColor={levelColor}
                  size="small"
                />
              </div>
            ))}
          </div>

          {/* 计算时间 + 计算按钮 */}
          <div style={{ minWidth: 200 }}>
            <Text type="secondary">最后计算时间</Text>
            <div style={{ margin: '6px 0 10px' }}>{result.lastUpdateTime || '--'}</div>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              loading={calcLoading}
              onClick={handleCalculate}
            >
              计算
            </Button>
          </div>
        </div>
      )}

      {/* 指标明细 */}
      <Table<DetailRow>
        rowKey="rowKey"
        bordered
        size="middle"
        loading={loading}
        columns={columns}
        dataSource={detailRows}
        pagination={false}
      />
    </Card>
  );
}
