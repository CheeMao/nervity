export type RoleType = '' | '*' | 'admin' | 'developer' | 'agent' | 'user';
export interface UserState {
  name?: string;
  avatar?: string;
  job?: string;
  organization?: string;
  location?: string;
  email?: string;
  introduction?: string;
  personalWebsite?: string;
  jobName?: string;
  organizationName?: string;
  locationName?: string;
  phone?: string;
  registrationDate?: string;
  accountId?: string;
  certification?: number;
  role: RoleType;
  role_id?: number;
  role_name?: string;
  permissions?: string[];
  balance?: number;
  discount_rate?: number;
  level?: number;
  agent?: {
    level: number;
    discount_rate: number;
  };
}
