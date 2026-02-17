import axios from 'axios';
import type { RouteRecordNormalized } from 'vue-router';
import { UserState } from '@/store/modules/user/types';

export interface LoginData {
  username: string;
  password: string;
  code?: string;
}

export interface LoginRes {
  access_token: string;
  role: string;
  role_id?: number;
  role_name?: string;
  permissions?: string[];
}

export function login(data: LoginData) {
  return axios.post<LoginRes>('/auth/login', data);
}

export function logout() {
  return Promise.resolve({ data: {} });
}

export function getUserInfo() {
  return axios.get<UserState>('/users/profile');
}

export function getMenuList() {
  return Promise.resolve({ data: [] });
}

// 注册类型
export type RegisterType = 'developer' | 'agent';

// 公开注册请求数据
export interface PublicRegisterData {
  username: string;
  password: string;
  registerType: RegisterType;
  developerUsername?: string;
  email?: string;
}

// 公开注册响应
export interface PublicRegisterRes {
  message: string;
  userId: number;
  username: string;
  isActive: boolean;
}

// 开发者查询响应
export interface DeveloperLookupRes {
  id: number;
  username: string;
}

// 公开注册
export function publicRegister(data: PublicRegisterData) {
  return axios.post<PublicRegisterRes>('/users/public-register', data);
}

// 查询开发者
export function lookupDeveloper(username: string) {
  return axios.get<DeveloperLookupRes>('/users/developer-lookup', {
    params: { username },
  });
}
// 2FA Endpoints
export function generateTotp() {
  return axios.post<{ secret: string; otpauthUrl: string; qrCode: string }>(
    '/auth/2fa/generate'
  );
}

export function enableTotp(data: { code: string }) {
  return axios.post('/auth/2fa/enable', data);
}

export function disableTotp(data: { code: string }) {
  return axios.post('/auth/2fa/disable', data);
}

export function changePassword(password: string) {
  return axios.post('/users/change-password', { password });
}
