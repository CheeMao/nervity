import axios from 'axios';
import type {
  CardRecord,
  CardListQuery,
  CardListResponse,
  GenerateCardData,
} from '@/types/cards';

// 获取卡密列表
export function getCards(params: CardListQuery) {
  return axios.get<CardListResponse>('/cards', { params });
}

// 生成卡密
export function generateCards(data: GenerateCardData) {
  return axios.post<CardRecord[]>('/cards/generate', data);
}

// 删除卡密
export function deleteCard(id: number) {
  return axios.delete(`/cards/${id}`);
}

// 禁用卡密
export function banCard(id: number) {
  return axios.put(`/cards/${id}/ban`);
}

// 启用卡密
export function unbanCard(id: number) {
  return axios.put(`/cards/${id}/unban`);
}
