import axios from 'axios';
import qs from 'query-string';

export interface OperationLogRecord {
  id: number;
  admin_id: number;
  admin_username: string;
  method: string;
  path: string;
  query: string;
  body: string;
  ip: string;
  user_agent: string;
  status_code: number;
  execution_time: number;
  error_message: string;
  created_at: string;
}

export interface OperationLogParams extends Partial<OperationLogRecord> {
  page: number;
  pageSize: number;
  startTime?: string;
  endTime?: string;
}

export interface OperationLogListRes {
  list: OperationLogRecord[];
  total: number;
}

export function queryOperationLogList(params: OperationLogParams) {
  return axios.get<OperationLogListRes>('/operation-logs', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}
