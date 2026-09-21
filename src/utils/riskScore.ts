import type {
  RiskIndicatorDataCountVo,
  RiskIndicatorDataVo,
  RiskIndicatorVo,
} from '@/api/riskScoreApi';
import {
  INDICATOR_LEVEL,
  RULE_TYPE,
  type HitLevel,
  type IndicatorRow,
  type RiskLevel,
  type RiskScoreResult,
  type RuleRange,
  type ScoreDetailGroup,
  type ScoreDetailItem,
} from '@/types/riskScore';

const round1 = (num: number) => Math.round(num * 10) / 10;

/** query-list 返回数据 → 配置页表格行 */
export function buildIndicatorRows(
  list: RiskIndicatorVo[],
  ruleTypes: number[]
): IndicatorRow[] {
  return (list ?? []).map((item, index) => {
    const rules: Record<number, RuleRange> = {};
    (item.ruleList ?? []).forEach((rule) => {
      rules[rule.ruleType] = {
        min: Number(rule.indicatorValueMin ?? 0),
        max: Number(rule.indicatorValueMax ?? 0),
      };
    });
    // 需要展示但未配置的规则类型补空区间，保证可编辑
    ruleTypes.forEach((type) => {
      if (!rules[type]) rules[type] = { min: 0, max: 0 };
    });
    const riskIndicatorId = item.ruleList?.[0]?.riskIndicatorId ?? item.id ?? 0;
    return {
      key: `${item.level}-${riskIndicatorId}-${index}`,
      riskIndicatorId,
      indicatorName: item.indicatorName,
      riskWeight: Number(item.riskWeight ?? 0),
      rules,
    };
  });
}

const resolveLevel = (ratio: number): RiskLevel => {
  if (ratio >= 60) return '高风险';
  if (ratio >= 40) return '中风险';
  return '低风险';
};

/**
 * 指标配置 + query-data 返回 → 评分结果
 *
 * 综合评分直接取后端返回的 point，不再前端推算；
 * L2 明细得分取后端 indicatorPoint，L1 按 status 判定（1 正常 / 2 异常）。
 *
 * @param list query-list 返回的指标配置
 * @param countVo query-data 返回的 RiskIndicatorDataCountVo
 * @param dailyDate 指定日期时只取该日期的指标值
 */
export function calcRiskScore(
  list: RiskIndicatorVo[],
  countVo?: RiskIndicatorDataCountVo | null,
  dailyDate?: string
): RiskScoreResult {
  const dataList: RiskIndicatorDataVo[] = countVo?.riskIndicatorDataList ?? [];

  const valueMap: Record<string, RiskIndicatorDataVo> = {};
  dataList.forEach((item) => {
    if (dailyDate && item.dailyDate && item.dailyDate !== dailyDate) return;
    // 同一指标多条记录时以最新日期为准
    const exist = valueMap[item.indicatorName];
    if (!exist || (item.dailyDate ?? '') >= (exist.dailyDate ?? '')) {
      valueMap[item.indicatorName] = item;
    }
  });

  // L1 硬限额检查的异常值区间取 ruleType=2（黄色预警）
  const rowsL1 = buildIndicatorRows(
    (list ?? []).filter((i) => i.level === INDICATOR_LEVEL.L1),
    [RULE_TYPE.NORMAL, RULE_TYPE.YELLOW]
  );
  const rowsL2 = buildIndicatorRows(
    (list ?? []).filter((i) => i.level === INDICATOR_LEVEL.L2),
    [RULE_TYPE.NORMAL, RULE_TYPE.RED]
  );

  /**
   * 明细行计分
   * - L2（useIndicatorPoint=true）：得分直接取后端 indicatorPoint
   * - L1：按 status 判定，1 正常 0 分 / 2 异常满分（L1 权重为 null，得分恒为 0，仅看状态）
   */
  const toDetail = (rows: IndicatorRow[], useIndicatorPoint: boolean): ScoreDetailItem[] =>
    rows.map((row) => {
      const hit = valueMap[row.indicatorName];
      const value = Number(hit?.indicatorValue ?? 0);
      const status = hit?.status;
      const isAbnormal = status === 2;
      const level: HitLevel = isAbnormal ? 'danger' : 'normal';
      const point = Number(hit?.indicatorPoint ?? 0);
      const score = useIndicatorPoint
        ? Number.isFinite(point)
          ? round1(point)
          : 0
        : isAbnormal
          ? row.riskWeight
          : 0;
      return {
        key: row.key,
        name: row.indicatorName,
        value,
        score,
        fullScore: row.riskWeight,
        level,
        status,
      };
    });

  const l1Items = toDetail(rowsL1, false);
  const l2Items = toDetail(rowsL2, true);

  const sumScore = (items: ScoreDetailItem[]) =>
    round1(items.reduce((sum, i) => sum + i.score, 0));
  const sumFull = (items: ScoreDetailItem[]) =>
    round1(items.reduce((sum, i) => sum + (Number(i.fullScore) || 0), 0));

  const l1Score = sumScore(l1Items);
  const l2Score = sumScore(l2Items);
  const l1FullScore = sumFull(l1Items);
  const l2FullScore = sumFull(l2Items);

  const groups: ScoreDetailGroup[] = [
    {
      key: 'L1',
      title: 'L1 硬限额检查',
      subtotal: l1Score,
      fullScore: l1FullScore,
      items: l1Items,
    },
    {
      key: 'L2',
      title: 'L2 预警评分体系',
      subtotal: l2Score,
      fullScore: l2FullScore,
      items: l2Items,
    },
  ];

  const totalFullScore = round1(l1FullScore + l2FullScore);
  // 综合评分以服务端 point 为准；未返回时回退为明细得分合计
  const point = Number(countVo?.point ?? 0);
  const detailTotal = round1(l1Score + l2Score);
  const totalScore = round1(Number.isFinite(point) ? point : detailTotal);
  const ratio =
    totalFullScore > 0 ? Math.round((totalScore / totalFullScore) * 1000) / 10 : 0;
  // L1 硬限额一旦击穿直接判高风险（L1 无权重，不参与得分）
  const l1Breached = l1Items.some((i) => i.status === 2);

  return {
    totalScore,
    totalFullScore,
    ratio,
    level: l1Breached ? '高风险' : resolveLevel(ratio),
    lastUpdateTime: countVo?.lastUpdateTime ?? null,
    l1Breached,
    l1Score,
    l1FullScore,
    l2Score,
    l2FullScore,
    groups,
  };
}
