import React from 'react';
import { Tag } from '../types';
import { FiCheck } from 'react-icons/fi';

interface Props {
  tags: Tag[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export default function TagMultiSelect({ tags, selectedIds, onChange }: Props) {
  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (tags.length === 0) {
    return (
      <div className="tag-list" style={{ padding: '1rem', textAlign: 'center' }}>
        <p className="muted">Etiket bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="tag-list">
      {tags.map((tag) => {
        const isSelected = selectedIds.includes(tag.id);
        return (
          <label
            key={tag.id}
            className="tag-item"
            style={{
              borderColor: isSelected ? 'var(--primary)' : 'var(--gray-200)',
              background: isSelected ? 'rgba(16, 185, 129, 0.1)' : '#fff',
              color: isSelected ? 'var(--primary)' : 'var(--gray-700)',
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggle(tag.id)}
              style={{ display: 'none' }}
            />
            {isSelected && (
              <FiCheck style={{ fontSize: '1rem', fontWeight: 'bold' }} />
            )}
            <span style={{ fontWeight: isSelected ? 600 : 500 }}>{tag.name}</span>
          </label>
        );
      })}
    </div>
  );
}
