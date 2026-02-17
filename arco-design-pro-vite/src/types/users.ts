export const UserRole = {
  ADMIN: 'admin',
  DEVELOPER: 'developer',
  AGENT: 'agent',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface UserRecord {
  id: number;
  username: string;
  email?: string;
  role: string; // The backend might return string freely, but normally matches UserRole
  role_id?: number;
  role_name?: string;
  permissions?: string[];
  role_relation?: { id: number; name: string };
  balance: number;
  is_active: boolean;
  remark?: string;

  level?: number;
  discount_rate?: number;

  expire_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserListQuery {
  page: number;
  pageSize: number;
  username?: string;
  role?: string;
  is_active?: boolean;
  remark?: string;
  created_at_start?: string;
  created_at_end?: string;
}

export interface UserListResponse {
  list: UserRecord[];
  total: number;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  role?: string;
  role_id?: number;
  balance?: number;
  is_active?: boolean;

  password?: string;
  expire_at?: string;
  remark?: string;

  level?: number;
  discount_rate?: number;
}

export interface CreateUserData {
  username: string;
  password: string;
  email?: string;
  role?: UserRole;
  balance?: number;
  is_active?: boolean;
  expire_at?: string;
  remark?: string;
  level?: number;
  discount_rate?: number;
}
