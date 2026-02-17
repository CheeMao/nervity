import axios from 'axios';

export interface OverviewData {
  totalUsers: number;
  todayNewUsers?: number;
  totalApps?: number;
  totalCards?: number;
  usedCards?: number;
  // Admin specific
  totalDevelopers?: number;
  // Developer specific
  totalAgents?: number;
  // Developer & Agent specific
  unusedCards?: number;
  // Agent specific
  balance?: number;
  todaySales?: number;
  monthSales?: number;
}

export interface TrendDataPoint {
  date: string;
  count: number;
}

export interface CardStatsData {
  total: number;
  unused: number;
  used: number;
  banned: number;
}

export function getTrend() {
  return axios.get<any>('/statistics/trend');
}
// 获取总览数据
export function getOverview() {
  return axios.get<OverviewData>('/statistics/overview');
}

// 获取用户增长趋势
export function getUserTrend(days = 7) {
  return axios.get<TrendDataPoint[]>('/statistics/user-trend', {
    params: { days },
  });
}

// 获取卡密统计
export function getCardStats() {
  return axios.get<CardStatsData>('/statistics/card-stats');
}
