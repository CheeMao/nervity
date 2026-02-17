import axios from 'axios';
import type {
  AppRecord,
  AppListQuery,
  AppListResponse,
  CreateAppData,
  UpdateAppData,
} from '@/types/apps';

// 获取应用列表
export function getApps(params: AppListQuery) {
  return axios.get<AppListResponse>('/apps', { params });
}

// 获取单个应用
export function getApp(id: number) {
  return axios.get<AppRecord>(`/apps/${id}`);
}

// 创建应用
export function createApp(data: CreateAppData) {
  return axios.post<AppRecord>('/apps', data);
}

// 更新应用
export function updateApp(id: number, data: UpdateAppData) {
  return axios.put<AppRecord>(`/apps/${id}`, data);
}

// 删除应用
export function deleteApp(id: number) {
  return axios.delete(`/apps/${id}`);
}
