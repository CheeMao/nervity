export interface AppRecord {
  id: number;
  name: string;
  app_secret: string;
  version: string;
  download_url?: string;
  heart_interval: number;
  force_update: boolean;
  is_active: boolean;
  trial_enabled: boolean;
  trial_duration: number;
  trial_device_limit: number;
  announcement?: string;
  agent_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppListQuery {
  page: number;
  pageSize: number;
  name?: string;
  is_active?: boolean;
}

export interface AppListResponse {
  list: AppRecord[];
  total: number;
}

export interface CreateAppData {
  name: string;
  app_secret: string;
  version?: string;
  download_url?: string;
  heart_interval?: number;
  force_update?: boolean;
  trial_enabled?: boolean;
  trial_duration?: number;
  trial_device_limit?: number;
  announcement?: string;
  agent_visible?: boolean;
}

export interface UpdateAppData {
  name?: string;
  version?: string;
  download_url?: string;
  heart_interval?: number;
  force_update?: boolean;
  is_active?: boolean;
  trial_enabled?: boolean;
  trial_duration?: number;
  trial_device_limit?: number;
  announcement?: string;
  agent_visible?: boolean;
}
