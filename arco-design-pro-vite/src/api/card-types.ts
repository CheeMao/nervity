import axios from 'axios';

export interface CardTypeRecord {
  id: number;
  name: string;
  value: number; // in seconds
  is_permanent: boolean;
  price: number;
  app_id: number;
  created_at: string;
  updated_at: string;
  app?: {
    name: string;
  };
  device_limit: number;
}

export interface CardTypeListQuery {
  page: number;
  pageSize: number;
  app_id?: number;
  name?: string;
}

export interface CreateCardTypeData {
  name: string;
  value: number;
  is_permanent?: boolean;
  price: number;
  app_id: number;
  device_limit: number;
}

export interface UpdateCardTypeData {
  name?: string;
  value?: number;
  is_permanent?: boolean;
  price?: number;
  device_limit?: number;
}

export function getCardTypes(params?: CardTypeListQuery) {
  return axios.get<{ list: CardTypeRecord[]; total: number }>('/card-types', {
    params,
  });
}

export function createCardType(data: CreateCardTypeData) {
  return axios.post<CardTypeRecord>('/card-types', data);
}

export function updateCardType(id: number, data: UpdateCardTypeData) {
  return axios.patch<CardTypeRecord>(`/card-types/${id}`, data);
}

export function deleteCardType(id: number) {
  return axios.delete(`/card-types/${id}`);
}
