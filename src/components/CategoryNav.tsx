'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES, SubCategory } from '@/data/categories';

function SubCategoryItem({ sub }: { sub: SubCategory }) {
  const [isHovered, setIsHovered] = useState(false);
  const hasSub = sub.subcategories && sub.subcategories.length > 0;

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative' }}
    >
      <Link href={`/?category=${sub.slug}`} style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        textDecoration: 'none',
        color: isHovered ? 'var(--primary)' : 'inherit',
        backgroundColor: isHovered ? 'rgba(0,0,0,0.02)' : 'transparent',
        fontSize: '0.95rem'
      }}>
        {sub.name}
        {hasSub && <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>▶</span>}
      </Link>

      {isHovered && hasSub && (
        <div style={{
          position: 'absolute',
          top: '-1px',
          left: '100%',
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '0.5rem 0',
          minWidth: '220px',
          zIndex: 51,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          {sub.subcategories!.map(subSub => (
            <SubCategoryItem key={subSub.slug} sub={subSub} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryNav({ currentCategory }: { currentCategory?: string }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  return (
    <div style={{
      display: 'flex',
      gap: '2rem',
      padding: '1rem 0',
      borderBottom: '1px solid var(--border)',
      marginBottom: '2rem',
      overflowX: 'auto',
      scrollbarWidth: 'none',
      position: 'relative'
    }}>
      {/* "All" button */}
      <Link href="/" style={{
        textDecoration: 'none',
        color: !currentCategory ? 'var(--primary)' : 'var(--text-muted)',
        fontWeight: !currentCategory ? 700 : 500,
        whiteSpace: 'nowrap',
        padding: '0.5rem 0'
      }}>
        All Products
      </Link>

      {CATEGORIES.map(category => {
        const isActive = currentCategory === category.slug;
        const isHovered = activeCategory === category.slug;
        const hasSub = category.subcategories && category.subcategories.length > 0;

        return (
          <div 
            key={category.slug}
            onMouseEnter={() => setActiveCategory(category.slug)}
            onMouseLeave={() => setActiveCategory(null)}
            style={{ position: 'relative', cursor: 'pointer' }}
          >
            <Link href={`/?category=${category.slug}`} style={{
              textDecoration: 'none',
              color: isActive || isHovered ? 'var(--primary)' : 'inherit',
              fontWeight: isActive ? 700 : 500,
              whiteSpace: 'nowrap',
              padding: '0.5rem 0',
              display: 'block'
            }}>
              {category.name}
            </Link>

            {isHovered && hasSub && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '0.5rem',
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '0.5rem 0',
                minWidth: '220px',
                zIndex: 50,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                {category.subcategories.map(sub => (
                  <SubCategoryItem key={sub.slug} sub={sub} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
