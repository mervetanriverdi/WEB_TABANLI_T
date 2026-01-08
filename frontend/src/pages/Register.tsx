import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api/auth';
import { FiUser, FiMail, FiLock, FiUserPlus, FiLogIn } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await registerApi({ name, email, password });
      toast.success('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Kayıt başarısız. Bilgileri kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card" onSubmit={handleSubmit}>
        <h1>
          <FiUserPlus style={{ fontSize: '2rem', marginBottom: '1rem' }} />
          Kayıt Ol
        </h1>
        <label className="field">
          <span>
            <FiUser style={{ marginRight: '0.5rem' }} />
            Ad Soyad
          </span>
          <input
            type="text"
            placeholder="Adınız ve soyadınız"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </label>
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
            Şifre (En az 6 karakter)
          </span>
          <input
            type="password"
            placeholder="Şifrenizi oluşturun"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>
        <button className="btn primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
          <FiUserPlus />
          {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
        </button>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button className="link" type="button" onClick={() => navigate('/login')}>
            <FiLogIn style={{ marginRight: '0.5rem' }} />
            Zaten hesabınız var mı? Giriş Yap
          </button>
        </div>
      </form>
    </div>
  );
}
