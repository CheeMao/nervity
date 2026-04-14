export interface AppRecord {
  id: number;
  name: string;
  app_secret: string;
  version: string;
  min_supported_version?: string | null;
  release_channel: string;
  download_url?: string;
  heart_interval: number;
  heartbeat_timeout_multiplier: number;
  force_update: boolean;
  is_active: boolean;
  trial_enabled: boolean;
  trial_duration: number;
  trial_device_limit: number;
  announcement?: string;
  agent_visible: boolean;
  metadata?: Record<string, any> | null;
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
  min_supported_version?: string | null;
  release_channel?: string;
  download_url?: string;
  heart_interval?: number;
  heartbeat_timeout_multiplier?: number;
  force_update?: boolean;
  trial_enabled?: boolean;
  trial_duration?: number;
  trial_device_limit?: number;
  announcement?: string;
  agent_visible?: boolean;
  metadata?: Record<string, any> | null;
}

export interface UpdateAppData {
  name?: string;
  version?: string;
  min_supported_version?: string | null;
  release_channel?: string;
  download_url?: string;
  heart_interval?: number;
  heartbeat_timeout_multiplier?: number;
  force_update?: boolean;
  is_active?: boolean;
  trial_enabled?: boolean;
  trial_duration?: number;
  trial_device_limit?: number;
  announcement?: string;
  agent_visible?: boolean;
  metadata?: Record<string, any> | null;
}
