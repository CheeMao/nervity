import axios from 'axios';

export interface RemoteVariableRecord {
  id: number;
  key: string;
  value: string;
  description?: string;
  app_id: number;

  created_at: string;
  updated_at: string;
  app?: {
    id: number;
    name: string;
  };
}

export interface RemoteVariableParams {
  page: number;
  pageSize: number;
  key?: string;
  app_id?: number;
}

export interface CreateRemoteVariableData {
  key: string;
  value: string;
  description?: string;
  app_id: number;
}

export type UpdateRemoteVariableData = Partial<CreateRemoteVariableData>;

export interface VariableListRes {
  list: RemoteVariableRecord[];
  total: number;
}

export function queryRemoteVariables(params: RemoteVariableParams) {
  return axios.get<VariableListRes>('/remote-variables', { params });
}

export function createRemoteVariable(data: CreateRemoteVariableData) {
  return axios.post('/remote-variables', data);
}

export function updateRemoteVariable(
  id: number,
  data: UpdateRemoteVariableData
) {
  return axios.put(`/remote-variables/${id}`, data);
}

export function deleteRemoteVariable(id: number) {
  return axios.delete(`/remote-variables/${id}`);
}
