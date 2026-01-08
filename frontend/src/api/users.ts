import api from './client';
import { RoleName, User } from '../types';

export async function getUsers() {
  const { data } = await api.get('/users');
  return data as User[];
}

export async function updateUserRole(id: number, roleName: RoleName) {
  const { data } = await api.patch(`/users/${id}/role`, { roleName });
  return data as User;
}
