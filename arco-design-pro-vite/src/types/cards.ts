// CardType removed, defaults to time

export const CardStatus = {
  UNUSED: 'unused',
  USED: 'used',
  BANNED: 'banned',
  EXPIRED: 'expired',
} as const;

export type CardStatus = (typeof CardStatus)[keyof typeof CardStatus];

export interface CardRecord {
  id: number;
  code: string;
  // type: string; // Deprecated or hidden
  value: number; // Duration in seconds
  is_permanent: boolean;
  status: CardStatus;
  app_id: number;
  creator_id?: number;
  used_by_id?: number;
  used_at?: string;
  created_at: string;
  app?: {
    id: number;
    name: string;
  };
  remark?: string;
  used_by?: {
    id: number;
    username?: string;
    hwid: string;
  };
  device_limit?: number; // 可绑定设备数量
}

export interface CardListQuery {
  page: number;
  pageSize: number;
  code?: string;
  // type?: CardType;
  status?: CardStatus;
  app_id?: number;
  remark?: string;
  used_by?: string;
}

export interface CardListResponse {
  list: CardRecord[];
  total: number;
}

export interface GenerateCardData {
  // type: CardType;
  value: number;
  app_id: number;
  count: number;
  remark?: string;
}
