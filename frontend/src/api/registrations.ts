import api from './client';
import { Registration } from '../types';

export async function createRegistration(eventId: number) {
  const { data } = await api.post('/registrations', { eventId });
  return data as Registration;
}

export async function deleteRegistration(id: number) {
  const { data } = await api.delete(`/registrations/${id}`);
  return data as { message: string };
}

export async function getMyRegistrations() {
  const { data } = await api.get('/registrations/me');
  return data as Registration[];
}

export async function getRegistrations() {
  const { data } = await api.get('/registrations');
  return data as Registration[];
}
