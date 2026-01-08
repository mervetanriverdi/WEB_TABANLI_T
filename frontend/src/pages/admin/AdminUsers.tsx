import React, { useEffect, useState } from 'react';
import { getUsers, updateUserRole } from '../../api/users';
import { RoleName, User } from '../../types';
import { FiUsers, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch {
      toast.error('Kullanıcılar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = async (id: number, role: RoleName, userName: string) => {
    try {
      await updateUserRole(id, role);
      await load();
      toast.success(`${userName} kullanıcısının rolü ${role} olarak güncellendi.`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Rol güncellenemedi.');
    }
  };

  // user.role bir obje olabilir {id, name} veya string olabilir, bu yüzden güvenli bir şekilde string'e çeviriyoruz
  const getRoleName = (role: any): RoleName => {
    if (!role) return 'MEMBER';
    if (typeof role === 'string') {
      return role as RoleName;
    }
    if (typeof role === 'object' && 'name' in role) {
      const name = role.name;
      if (typeof name === 'string' && (name === 'ADMIN' || name === 'MEMBER')) {
        return name as RoleName;
      }
    }
    return 'MEMBER';
  };

  if (loading) {
    return (
      <section className="page">
        <h1>
          <FiUsers /> Admin Kullanıcılar
        </h1>
        <div className="table">
          {[1, 2, 3].map((i) => (
            <div key={i} className="table-row">
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-text"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <h1>
        <FiUsers /> Admin Kullanıcılar
      </h1>
      {users.length === 0 ? (
        <div className="card empty-state">
          <p className="muted" style={{ fontSize: '1.1rem' }}>
            Kullanıcı bulunamadı.
          </p>
        </div>
      ) : (
        <div className="table">
          {users.map((user) => {
            const roleName = getRoleName(user.role);
            const isAdmin = roleName === 'ADMIN';

            return (
              <div key={user.id} className="table-row">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    {isAdmin ? (
                      <FiShield style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
                    ) : (
                      <FiUsers style={{ color: 'var(--gray-500)', fontSize: '1.25rem' }} />
                    )}
                    <strong style={{ fontSize: '1.1rem' }}>{user.name}</strong>
                    <span
                      className="tag-badge"
                      style={{
                        background: isAdmin
                          ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                          : 'var(--gray-400)',
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.75rem',
                      }}
                    >
                      {roleName}
                    </span>
                  </div>
                  <div className="muted">{user.email}</div>
                </div>
                <div className="actions">
                  <select
                    value={roleName}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as RoleName, user.name)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: '2px solid var(--gray-200)',
                      background: '#fff',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
