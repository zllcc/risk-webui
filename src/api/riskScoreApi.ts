import request from './request';
import type { IndicatorRow, RuleTypeValue } from '@/types/riskScore';

// ===================== 风险管理指标接口 =====================
// 统一入参（查询列表 / 查询指标值 / 计算 / 更新 均复用该结构）
export interface RiskIndicatorBo {
  pageNum?: number;
  pageSize?: number;
  orderColumn?: string;
  orderType?: string;
  dateType?: number | null;
  startDate?: string;
  endDate?: string;
  idList?: number[];
  /** 资产类型 */
  secType?: string;
  /** 风险指标 risk_indicator 的 id */
  riskIndicatorId?: number;
  /** 规则类型 1正常 2黄色预警 3红色预警 */
  ruleType?: number;
  /** 指标值最小值 */
  indicatorValueMin?: number;
  /** 指标值最大值 */
  indicatorValueMax?: number;
  /** 日期 */
  dailyDate?: string;
  /** 权重/分值（更新时一并提交，后端未接收则忽略） */
  riskWeight?: number;
}

/** 规则配置 */
export interface RiskIndicatorRuleVo {
  riskIndicatorId: number;
  indicatorName: string;
  indicatorValueMin: number;
  indicatorValueMax: number;
  /** 1正常 2黄色预警 3红色预警 */
  ruleType: number;
}

/** 指标配置（query-list 返回） */
export interface RiskIndicatorVo {
  /** 风险指标 risk_indicator 的 id */
  id?: number;
  indicatorName: string;
  /** 等级 1=L1 硬限额检查 2=L2 预警评分体系 */
  level: number;
  /** 权重/分值 */
  riskWeight: number;
  ruleList: RiskIndicatorRuleVo[];
}

/** 指标值明细（query-data 返回的 riskIndicatorDataList 元素） */
export interface RiskIndicatorDataVo {
  /** 指标名称 */
  indicatorName: string;
  /** 日期 */
  dailyDate: string;
  /** 风险指标值 */
  indicatorValue: number;
  /** 状态 1正常 2异常 */
  status: number;
  /** 指标得分（L2 得分取该字段） */
  indicatorPoint?: number | null;
}

/** 指标值 + 综合评分（query-data 返回） */
export interface RiskIndicatorDataCountVo {
  /** 分数（后端计算的综合评分） */
  point: number;
  /** 最后计算时间 */
  lastUpdateTime: string | null;
  /** 指标值明细 */
  riskIndicatorDataList: RiskIndicatorDataVo[];
}

/**
 * 风险指标配置列表
 */
export function queryRiskIndicatorList(params: RiskIndicatorBo = {}) {
  return request<RiskIndicatorVo[]>({
    url: '/riskIndicator/pc/query-list',
    method: 'POST',
    data: params,
  });
}

/**
 * 风险指标规则值更新（按当前 Tab 的指标行提交）
 */
export function updateRiskIndicator(list: RiskIndicatorBo[]) {
  return request<boolean>({
    url: '/riskIndicator/pc/update',
    method: 'POST',
    data: list,
  });
}

/**
 * 风险指标值 + 综合评分（结果明细）
 * 返回 RiskIndicatorDataCountVo：point 分数 / lastUpdateTime 最后计算时间 /
 * riskIndicatorDataList 指标值明细
 */
export function queryRiskIndicatorData(
  params: RiskIndicatorBo = {}
): Promise<RiskIndicatorDataCountVo> {
  // 响应拦截器已取出 data.data，此处仅对齐 TS 类型
  return request<RiskIndicatorDataCountVo>({
    url: '/riskIndicator/pc/query-data',
    method: 'POST',
    data: params,
  }) as unknown as Promise<RiskIndicatorDataCountVo>;
}

/**
 * 触发风险指标计算
 */
export function calRiskIndicator(params: RiskIndicatorBo = {}) {
  return request<boolean>({
    url: '/riskIndicator/pc/cal',
    method: 'POST',
    data: params,
  });
}

/** 配置行 → 更新接口入参（每个规则类型一行） */
export function buildUpdatePayload(rows: IndicatorRow[]): RiskIndicatorBo[] {
  const payload: RiskIndicatorBo[] = [];
  rows.forEach((row) => {
    Object.keys(row.rules).forEach((typeKey) => {
      const ruleType = Number(typeKey) as RuleTypeValue;
      const range = row.rules[ruleType];
      payload.push({
        riskIndicatorId: row.riskIndicatorId,
        ruleType,
        indicatorValueMin: Number(range.min) || 0,
        indicatorValueMax: Number(range.max) || 0,
        riskWeight: Number(row.riskWeight) || 0,
      });
    });
  });
  return payload;
}
