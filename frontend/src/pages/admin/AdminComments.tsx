import React, { useEffect, useState } from 'react';
import { deleteComment, getComments } from '../../api/comments';
import { Comment } from '../../types';
import { FiMessageSquare, FiTrash2, FiUser, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getComments();
      setComments(data);
    } catch {
      toast.error('Yorumlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number, userName: string) => {
    if (!window.confirm(`${userName} kullanıcısının yorumunu silmek istediğinize emin misiniz?`)) return;

    try {
      await deleteComment(id);
      await load();
      toast.success('Yorum silindi.');
    } catch {
      toast.error('Yorum silinemedi.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
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

  if (loading) {
    return (
      <section className="page">
        <h1>
          <FiMessageSquare /> Admin Yorumlar
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
        <FiMessageSquare /> Admin Yorumlar
      </h1>
      {comments.length === 0 ? (
        <div className="card empty-state">
          <FiMessageSquare style={{ fontSize: '4rem', opacity: 0.3, marginBottom: '1rem' }} />
          <p className="muted" style={{ fontSize: '1.1rem' }}>
            Henüz yorum bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="table">
          {comments.map((comment) => {
            const userName = getUserName(comment.user);
            const eventTitle = getEventTitle(comment.event);

            return (
              <div key={comment.id} className="table-row">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <FiUser style={{ color: 'var(--primary)' }} />
                    <strong>{userName}</strong>
                    <span className="muted">•</span>
                    <strong>{eventTitle}</strong>
                  </div>
                  <p style={{ marginBottom: '0.5rem', lineHeight: '1.6', color: 'var(--gray-700)' }}>
                    {comment.content}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiCalendar style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }} />
                    <span className="muted" style={{ fontSize: '0.85rem' }}>
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="actions">
                  <button
                    className="btn danger"
                    onClick={() => handleDelete(comment.id, userName)}
                  >
                    <FiTrash2 /> Sil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
