import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '@/data/categories';

interface CategorySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (categorySlug: string, subcategorySlug: string, subSubcategorySlug: string) => void;
  initialCategory?: string;
  initialSubcategory?: string;
  initialSubSubcategory?: string;
}

export default function CategorySelectorModal({
  isOpen,
  onClose,
  onSelect,
  initialCategory = '',
  initialSubcategory = '',
  initialSubSubcategory = ''
}: CategorySelectorModalProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategory);
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState(initialSubSubcategory);

  // Sync with initial props when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(initialCategory);
      setSelectedSubcategory(initialSubcategory);
      setSelectedSubSubcategory(initialSubSubcategory);
    }
  }, [isOpen, initialCategory, initialSubcategory, initialSubSubcategory]);

  if (!isOpen) return null;

  const categoryObj = CATEGORIES.find(c => c.slug === selectedCategory);
  const subcategoryObj = categoryObj?.subcategories?.find(s => s.slug === selectedSubcategory);

  const handleConfirm = () => {
    onSelect(selectedCategory, selectedSubcategory, selectedSubSubcategory);
    onClose();
  };

  const isComplete = selectedCategory !== '';

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="card animate-fade-in" style={{
        width: '900px',
        maxWidth: '95vw',
        height: '600px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8f9fa'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Select Category</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Miller Columns Body */}
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          background: '#fff'
        }}>
          {/* Column 1: Categories */}
          <div style={{ flex: 1, borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
            <div style={{ padding: '0.5rem' }}>
              {CATEGORIES.map(c => {
                const isSelected = selectedCategory === c.slug;
                const hasChildren = c.subcategories && c.subcategories.length > 0;
                return (
                  <div
                    key={c.slug}
                    onClick={() => {
                      setSelectedCategory(c.slug);
                      setSelectedSubcategory('');
                      setSelectedSubSubcategory('');
                    }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      margin: '0.125rem 0',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: isSelected ? 'var(--primary)' : 'transparent',
                      color: isSelected ? '#fff' : 'var(--text-main)',
                      fontWeight: isSelected ? 500 : 400
                    }}
                  >
                    <span>{c.name}</span>
                    {hasChildren && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Subcategories */}
          <div style={{ flex: 1, borderRight: '1px solid var(--border)', overflowY: 'auto', background: categoryObj ? '#fff' : '#fafafa' }}>
            {categoryObj && categoryObj.subcategories ? (
              <div style={{ padding: '0.5rem' }}>
                {categoryObj.subcategories.map(s => {
                  const isSelected = selectedSubcategory === s.slug;
                  const hasChildren = s.subcategories && s.subcategories.length > 0;
                  return (
                    <div
                      key={s.slug}
                      onClick={() => {
                        setSelectedSubcategory(s.slug);
                        setSelectedSubSubcategory('');
                      }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        margin: '0.125rem 0',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: isSelected ? 'var(--primary)' : 'transparent',
                        color: isSelected ? '#fff' : 'var(--text-main)',
                        fontWeight: isSelected ? 500 : 400
                      }}
                    >
                      <span>{s.name}</span>
                      {hasChildren && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                {categoryObj ? 'No subcategories' : 'Select a category'}
              </div>
            )}
          </div>

          {/* Column 3: Sub-subcategories */}
          <div style={{ flex: 1, overflowY: 'auto', background: subcategoryObj ? '#fff' : '#fafafa' }}>
            {subcategoryObj && subcategoryObj.subcategories ? (
              <div style={{ padding: '0.5rem' }}>
                {subcategoryObj.subcategories.map(ss => {
                  const isSelected = selectedSubSubcategory === ss.slug;
                  return (
                    <div
                      key={ss.slug}
                      onClick={() => setSelectedSubSubcategory(ss.slug)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        margin: '0.125rem 0',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: isSelected ? 'var(--primary)' : 'transparent',
                        color: isSelected ? '#fff' : 'var(--text-main)',
                        fontWeight: isSelected ? 500 : 400
                      }}
                    >
                      <span>{ss.name}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                {subcategoryObj ? 'No further subcategories' : 'Select a subcategory'}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          background: '#f8f9fa'
        }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            disabled={!isComplete}
            className="btn btn-primary" 
            style={{ padding: '0.5rem 1.5rem' }}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
}
