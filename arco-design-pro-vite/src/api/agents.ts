import axios from 'axios';
import type {
  AgentDashboardData,
  AgentUserListQuery,
  AgentUserListResponse,
  AgentCardListQuery,
  AgentCardListResponse,
  GenerateAgentCardData,
  GenerateAgentCardResponse,
} from '@/types/agents';

// 获取代理商仪表盘数据
export function getAgentDashboard() {
  return axios.get<AgentDashboardData>('/agents/dashboard');
}

// 获取代理商下属用户列表
export function getAgentUsers(params: AgentUserListQuery) {
  return axios.get<AgentUserListResponse>('/agents/users', { params });
}

// 获取代理商卡密列表
export function getAgentCards(params: AgentCardListQuery) {
  return axios.get<AgentCardListResponse>('/agents/cards', { params });
}

// 代理商生成卡密
export function generateAgentCards(data: GenerateAgentCardData) {
  return axios.post<GenerateAgentCardResponse>('/agents/cards/generate', data);
}
