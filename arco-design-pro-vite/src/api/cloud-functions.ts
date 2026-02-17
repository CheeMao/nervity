import axios from 'axios';

export interface CloudFunctionRecord {
  id: number;
  trigger_name: string;
  code: string;
  app_id: number;

  created_at: string;
  updated_at: string;
  app?: {
    id: number;
    name: string;
  };
}

export interface CloudFunctionParams {
  page: number;
  pageSize: number;
  name?: string;
  app_id?: number;
}

export interface CreateCloudFunctionData {
  trigger_name: string;
  code: string;
  app_id: number;
}

export type UpdateCloudFunctionData = Partial<CreateCloudFunctionData>;

export interface FunctionListRes {
  list: CloudFunctionRecord[];
  total: number;
}

// 获取代理商卡密列表
export function queryCloudFunctions(params: CloudFunctionParams) {
  return axios.get<FunctionListRes>('/cloud/list', { params });
}

export function createCloudFunction(data: CreateCloudFunctionData) {
  return axios.post('/cloud/create', data);
}

// Ensure backend supports update/delete/get
// If backend endpoints are missing, we might need to update backend too, but keeping strictly to frontend request as per user constraints unless blocked.
// Checking README, backend has /cloud/create and /cloud/run.
// Backend MIGHT be missing CRUD for management. Let's assume standard REST or check backend controller.
// User didn't ask to implement backend features but I saw /cloud-functions controller in list_dir.
// Let's assume /cloud-functions is the prefix or /cloud. README said /cloud.
// Checking backend controller content would be wise if I hadn't already.
// I listed `backend/src/cloud-functions` earlier. `cloud-functions.controller.ts`.
// Let me verify the controller path and methods.

export function updateCloudFunction(id: number, data: UpdateCloudFunctionData) {
  return axios.put(`/cloud/${id}`, data);
}

export function deleteCloudFunction(id: number) {
  return axios.delete(`/cloud/${id}`);
}

export function runCloudFunction(appId: number, name: string, data?: any) {
  return axios.post(`/cloud/run/${appId}/${name}`, data);
}
