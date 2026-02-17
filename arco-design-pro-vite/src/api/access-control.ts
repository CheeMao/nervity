import axios from 'axios';

export interface Permission {
  id: number;
  code: string;
  description: string;
  module: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  is_system: boolean;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

export function getRoles() {
  return axios.get<Role[]>('/access-control/roles');
}

export function createRole(data: {
  name: string;
  description: string;
  permissionIds: number[];
}) {
  return axios.post<Role>('/access-control/roles', data);
}

export function updateRole(
  id: number,
  data: { name?: string; description?: string; permissionIds?: number[] }
) {
  return axios.put<Role>(`/access-control/roles/${id}`, data);
}

export function deleteRole(id: number) {
  return axios.delete(`/access-control/roles/${id}`);
}

export function getPermissions() {
  return axios.get<Permission[]>('/access-control/permissions');
}
