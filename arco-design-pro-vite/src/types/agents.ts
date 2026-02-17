export interface AgentDashboardData {
  totalUsers: number;
  todayNewUsers: number;
  totalCards: number;
  usedCards: number;
  balance: number;
  level: number;
  discountRate: number;
}

export interface AgentUserRecord {
  id: number;
  username: string;
  email?: string;
  role: string;
  balance: number;
  is_active: boolean;
  created_at: string;
}

export interface AgentCardRecord {
  id: number;
  code: string;
  type: string;
  value: number;
  status: string;
  app?: { id: number; name: string };
  created_at: string;
}

export interface AgentUserListQuery {
  page: number;
  pageSize: number;
}

export interface AgentUserListResponse {
  list: AgentUserRecord[];
  total: number;
}

export interface AgentCardListQuery {
  page: number;
  pageSize: number;
}

export interface AgentCardListResponse {
  list: AgentCardRecord[];
  total: number;
}

export interface GenerateAgentCardData {
  type: string;
  value: number;
  app_id: number;
  count: number;
}

export interface GenerateAgentCardResponse {
  created: number;
  cards: string[]; // List of generated card codes
}
