import axios from 'axios';

export interface DeviceInfo {
  id: number;
  hwid: string;
  device_name?: string;
  status: string;
  last_heartbeat?: string;
  is_banned: boolean;
}

export interface EndUserRecord {
  id: number;
  username?: string;
  hwid: string;
  app_id: number;
  agent_id: number;
  max_devices: number;
  expire_time?: string;
  is_active: boolean;
  last_ip?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
  device_count?: number;
  devices?: DeviceInfo[];
  app?: {
    id: number;
    name: string;
  };
}

export interface EndUserParams {
  page: number;
  pageSize: number;
  keyword?: string; // username or hwid
  app_id?: number;
  agent_id?: number; // Admin only
  is_active?: boolean;
}

export interface EndUserListRes {
  list: EndUserRecord[];
  total: number;
}

export interface CreateEndUserData {
  username?: string;
  password?: string;
  hwid?: string;
  app_id: number;
  agent_id?: number;
  expire_time?: string;
  is_active?: boolean;
  max_devices?: number;
}

export interface UpdateEndUserData {
  username?: string;
  password?: string;
  is_active?: boolean;
  expire_time?: string;
  hwid?: string; // Usually for unbind (empty string)
}

export function queryEndUsers(params: EndUserParams) {
  return axios.get<EndUserListRes>('/end-users', { params });
}

export function getEndUser(id: number) {
  return axios.get<EndUserRecord>(`/end-users/${id}`);
}

// Admin/Agent usually don't manually create end users (they register via client), but API supports it
export function createEndUser(data: CreateEndUserData) {
  return axios.post('/end-users', data);
}

export function updateEndUser(id: number, data: UpdateEndUserData) {
  return axios.put(`/end-users/${id}`, data);
}

export function deleteEndUser(id: number) {
  return axios.delete(`/end-users/${id}`);
}

export function unbindEndUserHwid(id: number) {
  return axios.put(`/end-users/${id}/unbind-hwid`);
}
