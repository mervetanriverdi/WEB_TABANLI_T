import api from './client';
import { Event } from '../types';

export interface EventPayload {
  title: string;
  description: string;
  location: string;
  startAt: string;
  endAt: string;
  capacity: number;
  adminIds?: number[];
}

export async function getEvents() {
  const { data } = await api.get('/events');
  return data as Event[];
}

export async function getEvent(id: number) {
  const { data } = await api.get(`/events/${id}`);
  return data as Event;
}

export async function createEvent(payload: EventPayload) {
  const { data } = await api.post('/events', payload);
  return data as Event;
}

export async function updateEvent(id: number, payload: Partial<EventPayload>) {
  const { data } = await api.patch(`/events/${id}`, payload);
  return data as Event;
}

export async function deleteEvent(id: number) {
  const { data } = await api.delete(`/events/${id}`);
  return data as { message: string };
}

export async function updateEventTags(id: number, tagIds: number[]) {
  const { data } = await api.put(`/events/${id}/tags`, { tagIds });
  return data as Event;
}
