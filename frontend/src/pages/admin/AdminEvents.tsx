import React, { useEffect, useMemo, useState } from 'react';
import { createEvent, deleteEvent, getEvents, updateEvent, updateEventTags } from '../../api/events';
import { getTags } from '../../api/tags';
import { getUsers } from '../../api/users';
import { Event, Tag, User } from '../../types';
import TagMultiSelect from '../../components/TagMultiSelect';
import { FiPlus, FiEdit2, FiTrash2, FiSettings, FiSave, FiX, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

const emptyForm = {
  title: '',
  description: '',
  location: '',
  startAt: '',
  endAt: '',
  capacity: 1,
};

function toInputDate(value: string) {
  if (!value) return '';
  const date = new Date(value);
  return date.toISOString().slice(0, 16);
}

function toIso(value: string) {
  if (!value) return '';
  return new Date(value).toISOString();
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedAdmins, setSelectedAdmins] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const load = async () => {
    try {
      setPageLoading(true);
      const [eventData, tagData, userData] = await Promise.all([getEvents(), getTags(), getUsers()]);
      setEvents(eventData);
      setTags(tagData);
      setUsers(userData);
    } catch {
      toast.error('Veriler yüklenemedi.');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (key: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const startEditing = (event: Event) => {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description,
      location: event.location,
      startAt: toInputDate(event.startAt),
      endAt: toInputDate(event.endAt),
      capacity: event.capacity,
    });
    setSelectedTags(event.eventTags?.map((item) => item.tagId) || []);
    setSelectedAdmins(event.eventAdmins?.map((item) => item.adminId) || []);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setSelectedTags([]);
    setSelectedAdmins([]);
  };

  const handleSubmit = async (eventItem: React.FormEvent) => {
    eventItem.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateEvent(editingId, {
          title: form.title,
          description: form.description,
          location: form.location,
          startAt: toIso(form.startAt),
          endAt: toIso(form.endAt),
          capacity: Number(form.capacity),
          adminIds: selectedAdmins.length > 0 ? selectedAdmins : undefined,
        });
        await updateEventTags(editingId, selectedTags);
        toast.success('Etkinlik güncellendi.');
      } else {
        const created = await createEvent({
          title: form.title,
          description: form.description,
          location: form.location,
          startAt: toIso(form.startAt),
          endAt: toIso(form.endAt),
          capacity: Number(form.capacity),
          adminIds: selectedAdmins.length > 0 ? selectedAdmins : undefined,
        });
        await updateEventTags(created.id, selectedTags);
        toast.success('Etkinlik oluşturuldu.');
      }
      await load();
      resetForm();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Etkinlik kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`${title} etkinliğini silmek istediğinize emin misiniz?`)) return;

    try {
      await deleteEvent(id);
      await load();
      toast.success('Etkinlik silindi.');
    } catch {
      toast.error('Etkinlik silinemedi.');
    }
  };

  const tagMap = useMemo(
    () =>
      new Map(
        tags
          .filter((tag) => tag && typeof tag === 'object' && 'id' in tag && 'name' in tag)
          .map((tag) => [tag.id, typeof tag.name === 'string' ? tag.name : ''])
      ),
    [tags],
  );

  if (pageLoading) {
    return (
      <section className="page">
        <h1>
          <FiSettings /> Admin Etkinlikler
        </h1>
        <div className="card">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <h1>
        <FiSettings /> Admin Etkinlikler
      </h1>

      <form className="card" onSubmit={handleSubmit}>
        <h3>
          {editingId ? (
            <>
              <FiEdit2 /> Etkinlik Güncelle
            </>
          ) : (
            <>
              <FiPlus /> Yeni Etkinlik
            </>
          )}
        </h3>
        <div className="form-grid">
          <label className="field">
            <span>Başlık</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Konum</span>
            <input
              type="text"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Başlangıç</span>
            <input
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => handleChange('startAt', e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Bitiş</span>
            <input
              type="datetime-local"
              value={form.endAt}
              onChange={(e) => handleChange('endAt', e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Kapasite</span>
            <input
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => handleChange('capacity', Number(e.target.value))}
              required
            />
          </label>
          <label className="field" style={{ gridColumn: '1 / -1' }}>
            <span>Açıklama</span>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
              rows={4}
            />
          </label>
        </div>
        <div className="field">
          <span>Etiketler</span>
          <TagMultiSelect tags={tags} selectedIds={selectedTags} onChange={setSelectedTags} />
        </div>
        <div className="field">
          <span>Yetkili Adminler</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {users
              .filter((user) => {
                const roleName = typeof user.role === 'object' && 'name' in user.role
                  ? user.role.name
                  : user.role;
                return roleName === 'ADMIN';
              })
              .map((admin) => {
                const isSelected = selectedAdmins.includes(admin.id);
                return (
                  <button
                    key={admin.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedAdmins(selectedAdmins.filter((id) => id !== admin.id));
                      } else {
                        setSelectedAdmins([...selectedAdmins, admin.id]);
                      }
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--gray-300)'}`,
                      background: isSelected ? 'var(--primary)' : 'transparent',
                      color: isSelected ? 'white' : 'var(--gray-700)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '0.9rem',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {admin.name}
                  </button>
                );
              })}
          </div>
          <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Etkinliği yönetebilecek adminleri seçin. Oluşturan admin otomatik olarak eklenir.
          </p>
        </div>
        <div className="actions">
          <button className="btn primary" type="submit" disabled={loading}>
            <FiSave /> {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          {editingId && (
            <button className="btn" type="button" onClick={resetForm}>
              <FiX /> Vazgeç
            </button>
          )}
        </div>
      </form>

      {events.length === 0 ? (
        <div className="card empty-state">
          <p className="muted" style={{ fontSize: '1.1rem' }}>
            Henüz etkinlik bulunmuyor. Yeni bir etkinlik oluşturun.
          </p>
        </div>
      ) : (
        <div className="table">
          {events.map((event) => (
            <div key={event.id} className="table-row">
              <div>
                <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '0.5rem' }}>
                  {event.title}
                </strong>
                <div className="muted" style={{ marginBottom: '0.25rem' }}>
                  {event.location}
                </div>
                {event.createdBy && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <FiUser style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }} />
                    <span className="muted" style={{ fontSize: '0.85rem' }}>
                      Oluşturan: {typeof event.createdBy === 'object' && 'name' in event.createdBy
                        ? typeof event.createdBy.name === 'string'
                          ? event.createdBy.name
                          : 'Bilinmiyor'
                        : 'Bilinmiyor'}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {event.eventTags?.map((item) => {
                    let tagName: string | null = null;
                    
                    // Önce item.tag objesinden name'i almayı dene
                    if (item.tag && typeof item.tag === 'object' && 'name' in item.tag) {
                      const name = item.tag.name;
                      if (typeof name === 'string') {
                        tagName = name;
                      }
                    }
                    
                    // Eğer tagName hala null ise, tagMap'ten al
                    if (!tagName) {
                      const mapValue = tagMap.get(item.tagId);
                      if (typeof mapValue === 'string') {
                        tagName = mapValue;
                      }
                    }
                    
                    return tagName ? (
                      <span key={item.tagId} className="tag-badge">
                        {String(tagName)}
                      </span>
                    ) : null;
                  })}
                  {(!event.eventTags || event.eventTags.length === 0) && (
                    <span className="muted" style={{ fontSize: '0.85rem' }}>Etiket yok</span>
                  )}
                </div>
              </div>
              <div className="actions">
                <button className="btn" onClick={() => startEditing(event)}>
                  <FiEdit2 /> Düzenle
                </button>
                <button className="btn danger" onClick={() => handleDelete(event.id, event.title)}>
                  <FiTrash2 /> Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
