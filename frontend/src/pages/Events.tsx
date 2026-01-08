import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../api/events';
import { getTags } from '../api/tags';
import { Event, Tag } from '../types';
import { FiMapPin, FiCalendar, FiClock, FiFilter, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [eventData, tagData] = await Promise.all([getEvents(), getTags()]);
        setEvents(eventData);
        setTags(tagData);
      } catch {
        toast.error('Etkinlikler yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = events;

    if (selectedTagId) {
      const tagId = Number(selectedTagId);
      result = result.filter((event) =>
        event.eventTags?.some((tag) => tag.tagId === tagId || tag.tag?.id === tagId),
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query),
      );
    }

    return result;
  }, [events, selectedTagId, searchQuery]);

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
          <FiCalendar /> Etkinlikler
        </h1>
        <div className="grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>
          <FiCalendar /> Etkinlikler
        </h1>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: '1', minWidth: '200px' }}>
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Etkinlik ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter">
            <FiFilter style={{ color: 'var(--gray-500)' }} />
            <select
              value={selectedTagId}
              onChange={(e) => setSelectedTagId(e.target.value)}
            >
              <option value="">Tüm Etiketler</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state">
          <p className="muted" style={{ fontSize: '1.1rem' }}>
            {searchQuery || selectedTagId
              ? 'Aradığınız kriterlere uygun etkinlik bulunamadı.'
              : 'Henüz etkinlik bulunmuyor.'}
          </p>
        </div>
      ) : (
        <div className="grid">
          {filtered.map((event) => {
            const tags = event.eventTags
              ?.map((et) => {
                if (et.tag && typeof et.tag === 'object' && 'name' in et.tag) {
                  return typeof et.tag.name === 'string' ? et.tag.name : null;
                }
                return null;
              })
              .filter((name): name is string => typeof name === 'string') || [];
            return (
              <Link key={event.id} className="card event-card" to={`/events/${event.id}`}>
                <h3>{event.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <FiMapPin style={{ color: 'var(--gray-500)' }} />
                  <span className="muted">{event.location}</span>
                </div>
                <div className="event-date">
                  <FiCalendar style={{ color: 'var(--primary)' }} />
                  <span>{formatDate(event.startAt)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <FiClock style={{ color: 'var(--gray-500)' }} />
                  <span className="muted">
                    {formatTime(event.startAt)} - {formatTime(event.endAt)}
                  </span>
                </div>
                {tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                    {tags.slice(0, 3).map((tagName, idx) => (
                      <span key={idx} className="tag-badge">
                        {tagName}
                      </span>
                    ))}
                    {tags.length > 3 && (
                      <span className="tag-badge" style={{ background: 'var(--gray-400)' }}>
                        +{tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
