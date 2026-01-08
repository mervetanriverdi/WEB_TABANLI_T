import api from './client';
import { User } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post('/auth/register', payload);
  return data as User;
}

export async function login(payload: LoginPayload) {
  const { data } = await api.post('/auth/login', payload);
  return data as LoginResponse;
}
