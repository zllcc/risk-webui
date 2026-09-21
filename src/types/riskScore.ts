/**
 * 风险评分（风险管理指标）视图层类型
 * 后端接口：/riskIndicator/pc/query-list、update、query-data、cal
 */

/** 规则类型：1 正常 2 黄色预警 3 红色预警 */
export const RULE_TYPE = {
  NORMAL: 1,
  YELLOW: 2,
  RED: 3,
} as const;

export type RuleTypeValue = 1 | 2 | 3;

/** 指标等级：1 = L1 硬限额检查，2 = L2 预警评分体系 */
export const INDICATOR_LEVEL = {
  L1: 1,
  L2: 2,
} as const;

/** 区间 */
export interface RuleRange {
  min: number;
  max: number;
}

/** 配置页表格行：一个指标 + 各规则类型的区间 + 权重/分值 */
export interface IndicatorRow {
  key: string;
  /** 风险指标 id */
  riskIndicatorId: number;
  /** 指标名称 */
  indicatorName: string;
  /** 权重（L1）/ 分值（L2） */
  riskWeight: number;
  /** ruleType -> 区间 */
  rules: Record<number, RuleRange>;
}

/** 命中等级 */
export type HitLevel = 'normal' | 'warning' | 'danger';

/** 综合风险等级 */
export type RiskLevel = '低风险' | '中风险' | '高风险';

/** 评分明细单项 */
export interface ScoreDetailItem {
  key: string;
  name: string;
  /** 实测指标值 */
  value: number;
  /** 得分 */
  score: number;
  /** 该项满分（权重/分值） */
  fullScore: number;
  level: HitLevel;
  /** 后端返回状态 1正常 2异常 */
  status?: number;
}

/** 评分明细分组 */
export interface ScoreDetailGroup {
  key: string;
  title: string;
  subtotal: number;
  fullScore: number;
  items: ScoreDetailItem[];
}

/** 评分结果 */
export interface RiskScoreResult {
  /** 综合评分：来自 query-data 的 point（后端计算） */
  totalScore: number;
  /** 满分：配置权重合计（L1 权重为 null 记 0） */
  totalFullScore: number;
  /** 得分率（%） */
  ratio: number;
  level: RiskLevel;
  /** 最后计算时间：来自 query-data 的 lastUpdateTime */
  lastUpdateTime?: string | null;
  /** L1 是否存在硬限额击穿 */
  l1Breached: boolean;
  l1Score: number;
  l1FullScore: number;
  l2Score: number;
  l2FullScore: number;
  groups: ScoreDetailGroup[];
}
