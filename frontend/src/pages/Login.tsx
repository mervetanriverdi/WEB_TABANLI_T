import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api/auth';
import { useAuth } from '../state/auth';
import { FiMail, FiLock, FiLogIn, FiUserPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await loginApi({ email, password });
      auth.login({ token: data.accessToken, user: data.user });
      toast.success(`Hoş geldiniz, ${data.user.name}!`);
      if (data.user.role === 'ADMIN') {
        navigate('/admin/events');
      } else {
        navigate('/events');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Giriş başarısız. Bilgileri kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card" onSubmit={handleSubmit}>
        <h1>
          <FiLogIn style={{ fontSize: '2rem', marginBottom: '1rem' }} />
          Giriş Yap
        </h1>
        <label className="field">
          <span>
            <FiMail style={{ marginRight: '0.5rem' }} />
            E-posta
          </span>
          <input
            type="email"
            placeholder="ornek@eposta.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="field">
          <span>
            <FiLock style={{ marginRight: '0.5rem' }} />
            Şifre
          </span>
          <input
            type="password"
            placeholder="Şifrenizi girin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <button className="btn primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
          <FiLogIn />
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button className="link" type="button" onClick={() => navigate('/register')}>
            <FiUserPlus style={{ marginRight: '0.5rem' }} />
            Hesabınız yok mu? Kayıt Ol
          </button>
        </div>
      </form>
    </div>
  );
}
