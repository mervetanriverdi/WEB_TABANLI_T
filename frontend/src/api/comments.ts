import api from './client';
import { Comment } from '../types';

export async function getEventComments(eventId: number) {
  const { data } = await api.get(`/events/${eventId}/comments`);
  return data as Comment[];
}

export async function createComment(eventId: number, content: string) {
  const { data } = await api.post('/comments', { eventId, content });
  return data as Comment;
}

export async function deleteComment(id: number) {
  const { data } = await api.delete(`/comments/${id}`);
  return data as { message: string };
}

export async function getComments() {
  const { data } = await api.get('/comments');
  return data as Comment[];
}
