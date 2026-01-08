import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteRegistration, getMyRegistrations } from '../api/registrations';
import { Registration } from '../types';
import { FiCalendar, FiMapPin, FiClock, FiTrash2, FiClipboard } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getMyRegistrations();
      setRegistrations(data);
    } catch {
      toast.error('Kayıtlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id: number, eventTitle: string) => {
    if (!window.confirm(`${eventTitle} etkinliğine olan kaydınızı iptal etmek istediğinize emin misiniz?`)) return;

    try {
      await deleteRegistration(id);
      await load();
      toast.success('Kayıt iptal edildi.');
    } catch {
      toast.error('Kayıt iptal edilemedi.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <section className="page">
        <h1>
          <FiClipboard /> Kayıtlarım
        </h1>
        <div className="list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="list-item">
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
        <FiClipboard /> Kayıtlarım
      </h1>
      {registrations.length === 0 ? (
        <div className="card empty-state">
          <FiCalendar style={{ fontSize: '4rem', opacity: 0.3, marginBottom: '1rem' }} />
          <p className="muted" style={{ fontSize: '1.1rem' }}>
            Henüz hiçbir etkinliğe kayıt olmadınız.
          </p>
          <Link to="/events" className="btn primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            <FiCalendar /> Etkinlikleri Görüntüle
          </Link>
        </div>
      ) : (
        <div className="list">
          {registrations.map((item) => (
            <div key={item.id} className="list-item">
              <div style={{ flex: 1 }}>
                <Link
                  to={`/events/${item.eventId}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '0.5rem' }}>
                    {item.event?.title || 'Etkinlik'}
                  </strong>
                </Link>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  {item.event?.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                      <FiMapPin />
                      <span>{item.event.location}</span>
                    </div>
                  )}
                  {item.event?.startAt && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                      <FiCalendar />
                      <span>{formatDate(item.event.startAt)}</span>
                    </div>
                  )}
                  {item.event?.startAt && item.event?.endAt && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                      <FiClock />
                      <span>
                        {formatTime(item.event.startAt)} - {formatTime(item.event.endAt)}
                      </span>
                    </div>
                  )}
                </div>
                <span className="muted" style={{ fontSize: '0.85rem' }}>
                  Kayıt tarihi: {formatDate(item.createdAt)}
                </span>
              </div>
              <button
                className="btn danger"
                onClick={() => handleCancel(item.id, item.event?.title || 'Etkinlik')}
              >
                <FiTrash2 /> İptal Et
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
