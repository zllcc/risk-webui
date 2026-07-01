import dayjs from 'dayjs';

// 快捷时间枚举，和下拉选项一一对应
export type TimeRangeType = '当日' | '近7日' | '30日' | 'YTD' | '近一年';

/**
 * 根据快捷类型计算 [startDate, endDate]
 * @param type 快捷时间类型
 * @returns [开始日期字符串, 结束日期字符串] 格式 YYYY-MM-DD HH:mm:ss
 */
export function getQuickDateRange(type: TimeRangeType): [string, string] {
  const today = dayjs();
  const end = today.format('YYYY-MM-DD HH:mm:ss');

  switch (type) {
    case '当日':
      return [end, end];
    case '近7日':
      return [today.subtract(6, 'day').format('YYYY-MM-DD HH:mm:ss'), end];
    case '30日':
      return [today.subtract(29, 'day').format('YYYY-MM-DD HH:mm:ss'), end];
    case 'YTD':
      // Year To Date：当年1月1日 ~ 今日
      return [`${today.year()}-01-01`, end];
    case '近一年':
      return [today.subtract(1, 'year').format('YYYY-MM-DD HH:mm:ss'), end];
    default:
      // 默认当日兜底
      return [end, end];
  }
}