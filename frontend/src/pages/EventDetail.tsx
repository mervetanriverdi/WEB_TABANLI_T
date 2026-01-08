import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createComment, deleteComment, getEventComments } from '../api/comments';
import { getEvent } from '../api/events';
import { createRegistration, deleteRegistration, getMyRegistrations } from '../api/registrations';
import { Comment, Event, Registration } from '../types';
import { useAuth } from '../state/auth';
import {
  FiMapPin,
  FiCalendar,
  FiClock,
  FiUsers,
  FiArrowLeft,
  FiMessageSquare,
  FiSend,
  FiTrash2,
  FiUser,
  FiCheckCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function EventDetailPage() {
  const { id } = useParams();
  const eventId = Number(id);
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [myRegistration, setMyRegistration] = useState<Registration | null>(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [commenting, setCommenting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [eventData, commentData] = await Promise.all([
        getEvent(eventId),
        getEventComments(eventId),
      ]);
      setEvent(eventData);
      setComments(commentData);
      if (role === 'MEMBER') {
        const registrations = await getMyRegistrations();
        const found = registrations.find((item) => item.eventId === eventId) || null;
        setMyRegistration(found);
      }
    } catch {
      toast.error('Etkinlik detayı yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isNaN(eventId)) {
      load();
    }
  }, [eventId]);

  const tags = useMemo(() => {
    return (
      event?.eventTags
        ?.map((item) => {
          if (item.tag && typeof item.tag === 'object' && 'name' in item.tag) {
            return typeof item.tag.name === 'string' ? item.tag.name : '';
          }
          return '';
        })
        .filter((name): name is string => typeof name === 'string' && name.length > 0) || []
    );
  }, [event]);

  const handleRegister = async () => {
    try {
      setRegistering(true);
      await createRegistration(eventId);
      const registrations = await getMyRegistrations();
      const found = registrations.find((item) => item.eventId === eventId) || null;
      setMyRegistration(found);
      toast.success('Etkinliğe başarıyla kaydoldunuz!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Kayıt işlemi başarısız.');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancel = async () => {
    if (!myRegistration) return;
    if (!window.confirm('Kaydınızı iptal etmek istediğinize emin misiniz?')) return;

    try {
      await deleteRegistration(myRegistration.id);
      setMyRegistration(null);
      toast.success('Kayıt iptal edildi.');
    } catch {
      toast.error('Kayıt iptal edilemedi.');
    }
  };

  const handleAddComment = async (eventItem: React.FormEvent) => {
    eventItem.preventDefault();
    if (!commentText.trim()) {
      toast.error('Yorum boş olamaz.');
      return;
    }
    try {
      setCommenting(true);
      await createComment(eventId, commentText.trim());
      setCommentText('');
      const updated = await getEventComments(eventId);
      setComments(updated);
      toast.success('Yorum eklendi.');
    } catch {
      toast.error('Yorum eklenemedi.');
    } finally {
      setCommenting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Yorumu silmek istediğinize emin misiniz?')) return;

    try {
      await deleteComment(commentId);
      const updated = await getEventComments(eventId);
      setComments(updated);
      toast.success('Yorum silindi.');
    } catch {
      toast.error('Yorum silinemedi.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <section className="page">
        <div className="card">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text"></div>
        </div>
      </section>
    );
  }

  if (!event) {
    return (
      <section className="page">
        <div className="card">
          <p className="error">Etkinlik bulunamadı.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <button
        className="btn"
        onClick={() => navigate(-1)}
        style={{ marginBottom: '1rem', alignSelf: 'flex-start' }}
      >
        <FiArrowLeft /> Geri Dön
      </button>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: '1rem', color: 'var(--gray-900)' }}>{event.title}</h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiMapPin style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
            <span className="muted" style={{ fontWeight: 500 }}>
              {event.location}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiCalendar style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
            <span className="muted" style={{ fontWeight: 500 }}>
              {formatDate(event.startAt)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiClock style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
            <span className="muted" style={{ fontWeight: 500 }}>
              {new Date(event.startAt).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              -{' '}
              {new Date(event.endAt).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiUsers style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
            <span className="muted" style={{ fontWeight: 500 }}>
              Kapasite: {event.capacity}
            </span>
          </div>
          {event.createdBy && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiUser style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
              <span className="muted" style={{ fontWeight: 500 }}>
                Oluşturan:{' '}
                {typeof event.createdBy === 'object' && 'name' in event.createdBy
                  ? typeof event.createdBy.name === 'string'
                    ? event.createdBy.name
                    : 'Bilinmiyor'
                  : 'Bilinmiyor'}
              </span>
            </div>
          )}
        </div>

        <p style={{ lineHeight: '1.8', marginBottom: '1rem', color: 'var(--gray-700)' }}>
          {event.description}
        </p>

        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            {tags.map((tagName, idx) => (
              <span key={idx} className="tag-badge">
                {tagName}
              </span>
            ))}
          </div>
        )}
      </div>

      {role === 'MEMBER' && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>
            {myRegistration ? (
              <>
                <FiCheckCircle style={{ color: 'var(--primary)', marginRight: '0.5rem' }} />
                Kayıtlısınız
              </>
            ) : (
              'Kayıt İşlemleri'
            )}
          </h3>
          {myRegistration ? (
            <button className="btn danger" onClick={handleCancel}>
              <FiTrash2 /> Kaydı İptal Et
            </button>
          ) : (
            <button
              className="btn primary"
              onClick={handleRegister}
              disabled={registering}
            >
              {registering ? 'Kaydediliyor...' : (
                <>
                  <FiCheckCircle /> Kayıt Ol
                </>
              )}
            </button>
          )}
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiMessageSquare /> Yorumlar ({comments.length})
        </h3>
        {comments.length === 0 ? (
          <div className="empty-state">
            <p className="muted">Henüz yorum yapılmamış.</p>
          </div>
        ) : (
          <ul className="list">
            {comments.map((comment) => {
              const canDelete = role === 'ADMIN' || comment.userId === user?.id;
              return (
                <li key={comment.id} className="list-item">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <FiUser style={{ color: 'var(--gray-500)' }} />
                      <strong>{comment.user?.name || 'Kullanıcı'}</strong>
                      <span className="muted" style={{ fontSize: '0.85rem' }}>
                        • {formatDateTime(comment.createdAt)}
                      </span>
                    </div>
                    <p style={{ margin: 0, lineHeight: '1.6', color: 'var(--gray-700)' }}>
                      {comment.content}
                    </p>
                  </div>
                  {canDelete && (
                    <button
                      className="btn danger"
                      onClick={() => handleDeleteComment(comment.id)}
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {role === 'MEMBER' && (
          <form className="comment-form" onSubmit={handleAddComment}>
            <textarea
              placeholder="Yorumunuzu yazın..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
            />
            <button className="btn primary" type="submit" disabled={commenting}>
              {commenting ? 'Gönderiliyor...' : (
                <>
                  <FiSend /> Yorum Ekle
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
