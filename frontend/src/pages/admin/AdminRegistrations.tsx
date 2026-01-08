import React, { useEffect, useState } from 'react';
import { getRegistrations } from '../../api/registrations';
import { Registration } from '../../types';
import { FiClipboard, FiUser, FiCalendar, FiMapPin, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getRegistrations();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserName = (user: any): string => {
    if (!user) return 'Kullanıcı';
    if (typeof user === 'object' && 'name' in user) {
      return typeof user.name === 'string' ? user.name : 'Kullanıcı';
    }
    return 'Kullanıcı';
  };

  const getEventTitle = (event: any): string => {
    if (!event) return 'Etkinlik';
    if (typeof event === 'object' && 'title' in event) {
      return typeof event.title === 'string' ? event.title : 'Etkinlik';
    }
    return 'Etkinlik';
  };

  const getEventLocation = (event: any): string | null => {
    if (!event || typeof event !== 'object' || !('location' in event)) return null;
    return typeof event.location === 'string' ? event.location : null;
  };

  const getEventDate = (event: any, field: 'startAt' | 'endAt'): string | null => {
    if (!event || typeof event !== 'object' || !(field in event)) return null;
    const value = event[field];
    return typeof value === 'string' ? value : null;
  };

  if (loading) {
    return (
      <section className="page">
        <h1>
          <FiClipboard /> Admin Kayıtlar
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
        <FiClipboard /> Admin Kayıtlar
      </h1>
      {registrations.length === 0 ? (
        <div className="card empty-state">
          <FiClipboard style={{ fontSize: '4rem', opacity: 0.3, marginBottom: '1rem' }} />
          <p className="muted" style={{ fontSize: '1.1rem' }}>
            Henüz kayıt bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="table">
          {registrations.map((item) => {
            const userName = getUserName(item.user);
            const eventTitle = getEventTitle(item.event);
            const eventLocation = getEventLocation(item.event);
            const startAt = getEventDate(item.event, 'startAt');
            const endAt = getEventDate(item.event, 'endAt');

            return (
              <div key={item.id} className="table-row">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <FiUser style={{ color: 'var(--primary)' }} />
                    <strong style={{ fontSize: '1.1rem' }}>{userName}</strong>
                    <span className="muted">•</span>
                    <strong style={{ fontSize: '1.1rem' }}>{eventTitle}</strong>
                  </div>
                  {eventLocation && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--gray-600)' }}>
                      <FiMapPin />
                      <span>{eventLocation}</span>
                    </div>
                  )}
                  {startAt && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--gray-600)' }}>
                      <FiCalendar />
                      <span>
                        {new Date(startAt).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      {startAt && endAt && (
                        <>
                          <FiClock style={{ marginLeft: '0.5rem' }} />
                          <span>
                            {new Date(startAt).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {new Date(endAt).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  <span className="muted" style={{ fontSize: '0.85rem' }}>
                    Kayıt tarihi: {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
