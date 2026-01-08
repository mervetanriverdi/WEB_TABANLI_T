import React, { useEffect, useState } from 'react';
import { createTag, deleteTag, getTags, updateTag } from '../../api/tags';
import { Tag } from '../../types';
import { FiTag, FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const load = async () => {
    try {
      setPageLoading(true);
      const data = await getTags();
      setTags(data);
    } catch {
      toast.error('Etiketler yüklenemedi.');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await updateTag(editing.id, { name });
        toast.success('Etiket güncellendi.');
      } else {
        await createTag({ name });
        toast.success('Etiket oluşturuldu.');
      }
      setName('');
      setEditing(null);
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Etiket kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (tag: Tag) => {
    setEditing(tag);
    setName(tag.name);
  };

  const handleCancel = () => {
    setEditing(null);
    setName('');
  };

  const handleDelete = async (id: number, tagName: string) => {
    if (!window.confirm(`${tagName} etiketini silmek istediğinize emin misiniz?`)) return;

    try {
      await deleteTag(id);
      await load();
      toast.success('Etiket silindi.');
    } catch {
      toast.error('Etiket silinemedi.');
    }
  };

  if (pageLoading) {
    return (
      <section className="page">
        <h1>
          <FiTag /> Admin Etiketler
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
        <FiTag /> Admin Etiketler
      </h1>
      <form className="card" onSubmit={handleSubmit}>
        <h3>
          {editing ? (
            <>
              <FiEdit2 /> Etiket Güncelle
            </>
          ) : (
            <>
              <FiPlus /> Yeni Etiket
            </>
          )}
        </h3>
        <label className="field">
          <span>Etiket Adı</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Etiket adını girin"
          />
        </label>
        <div className="actions">
          <button className="btn primary" type="submit" disabled={loading}>
            <FiSave /> {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          {editing && (
            <button className="btn" type="button" onClick={handleCancel}>
              <FiX /> Vazgeç
            </button>
          )}
        </div>
      </form>
      {tags.length === 0 ? (
        <div className="card empty-state">
          <p className="muted" style={{ fontSize: '1.1rem' }}>
            Henüz etiket bulunmuyor. Yeni bir etiket oluşturun.
          </p>
        </div>
      ) : (
        <div className="table">
          {tags.map((tag) => (
            <div key={tag.id} className="table-row">
              <div>
                <span className="tag-badge" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                  {tag.name}
                </span>
              </div>
              <div className="actions">
                <button className="btn" onClick={() => startEdit(tag)}>
                  <FiEdit2 /> Düzenle
                </button>
                <button className="btn danger" onClick={() => handleDelete(tag.id, tag.name)}>
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
