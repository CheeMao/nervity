import axios from 'axios';
import qs from 'query-string';

export interface BlacklistRecord {
  id: number;
  type: 'IP' | 'HWID';
  value: string;
  reason: string;
  expired_at: string | null;
  operator_username: string;
  created_at: string;
}

export interface BlacklistParams {
  page: number;
  pageSize: number;
  type?: 'IP' | 'HWID';
  value?: string;
}

export interface BlacklistListRes {
  list: BlacklistRecord[];
  total: number;
}

export interface CreateBlacklistParams {
  type: 'IP' | 'HWID';
  value: string;
  reason?: string;
  expired_at?: string;
}

export function queryBlacklist(params: BlacklistParams) {
  return axios.get<BlacklistListRes>('/access-control/blacklist', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function createBlacklist(data: CreateBlacklistParams) {
  return axios.post('/access-control/blacklist', data);
}

export function deleteBlacklist(id: number) {
  return axios.delete(`/access-control/blacklist/${id}`);
}
