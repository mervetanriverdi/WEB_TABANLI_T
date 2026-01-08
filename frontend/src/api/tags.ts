import api from './client';
import { Tag } from '../types';

export interface TagPayload {
  name: string;
}

export async function getTags() {
  const { data } = await api.get('/tags');
  return data as Tag[];
}

export async function createTag(payload: TagPayload) {
  const { data } = await api.post('/tags', payload);
  return data as Tag;
}

export async function updateTag(id: number, payload: TagPayload) {
  const { data } = await api.patch(`/tags/${id}`, payload);
  return data as Tag;
}

export async function deleteTag(id: number) {
  const { data } = await api.delete(`/tags/${id}`);
  return data as { message: string };
}
