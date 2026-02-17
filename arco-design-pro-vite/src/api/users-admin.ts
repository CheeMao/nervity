import axios from 'axios';
import type {
  UserRecord,
  UserListQuery,
  UserListResponse,
  UpdateUserData,
  CreateUserData,
} from '@/types/users';

// 获取用户列表
export function getUsers(params: UserListQuery) {
  return axios.get<UserListResponse>('/users', { params });
}

// 获取单个用户
export function getUser(id: number) {
  return axios.get<UserRecord>(`/users/${id}`);
}

// 更新用户
export function updateUser(id: number, data: UpdateUserData) {
  return axios.put<UserRecord>(`/users/${id}`, data);
}

// 删除用户
export function deleteUser(id: number) {
  return axios.delete(`/users/${id}`);
}

// 创建用户（统一接口，根据当前用户角色自动限制可创建的用户类型）
export function createUser(data: CreateUserData) {
  return axios.post<UserRecord>('/users/create', data);
}
