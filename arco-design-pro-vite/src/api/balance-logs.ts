import axios from 'axios';
import qs from 'query-string';

export interface BalanceLog {
  id: number;
  user_id: number;
  amount: number;
  type: string;
  description: string;
  balance_after: number;
  created_at: string;
  user?: {
    id: number;
    username: string;
  };
  operator?: {
    id: number;
    username: string;
  };
}

export interface BalanceLogParams extends Partial<BalanceLog> {
  page: number;
  pageSize: number;
  userId?: number;
}

export interface BalanceLogListRes {
  list: BalanceLog[];
  total: number;
}

export function queryBalanceLogs(params: BalanceLogParams) {
  return axios.get<BalanceLogListRes>('/balance-logs', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}
