import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth';
import { 
  FiCalendar, 
  FiUser, 
  FiLogOut, 
  FiSettings, 
  FiTag, 
  FiUsers, 
  FiClipboard,
  FiMessageSquare 
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AppLayout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Başarıyla çıkış yapıldı');
    navigate('/login');
  };

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <FiCalendar style={{ fontSize: '1.5rem' }} />
          CampusEvent
        </div>
        <nav className="nav">
          <NavLink to="/events">
            <FiCalendar /> Etkinlikler
          </NavLink>
          {role === 'MEMBER' && (
            <NavLink to="/my-registrations">
              <FiClipboard /> Kayıtlarım
            </NavLink>
          )}
          {role === 'ADMIN' && (
            <>
              <NavLink to="/admin/events">
                <FiSettings /> Admin Etkinlikler
              </NavLink>
              <NavLink to="/admin/tags">
                <FiTag /> Admin Etiketler
              </NavLink>
              <NavLink to="/admin/users">
                <FiUsers /> Admin Kullanıcılar
              </NavLink>
              <NavLink to="/admin/registrations">
                <FiClipboard /> Admin Kayıtlar
              </NavLink>
              <NavLink to="/admin/comments">
                <FiMessageSquare /> Admin Yorumlar
              </NavLink>
            </>
          )}
        </nav>
        <div className="user-area">
          <span>
            <FiUser />
            {user && user.name ? `Merhaba, ${user.name}` : ''}
          </span>
          <button className="btn" onClick={handleLogout}>
            <FiLogOut /> Çıkış
          </button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
