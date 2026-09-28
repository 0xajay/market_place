'use client';

import { useState } from 'react';

export default function ProductGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayImages = images && images.length > 0 ? images : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"];

  const nextImage = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const formatImageUrl = (url: string) => {
    return url.startsWith('/') ? `http://localhost:8000${url}` : url;
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', height: '100%' }}>
      {/* Thumbnails (Left side) */}
      {displayImages.length > 1 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          width: '70px',
          overflowY: 'auto',
          flexShrink: 0,
          paddingRight: '4px',
        }}>
          {displayImages.map((img, idx) => (
            <img
              key={idx}
              src={formatImageUrl(img)}
              alt={`Thumbnail ${idx}`}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: '100%',
                height: '70px',
                objectFit: 'cover',
                cursor: 'pointer',
                border: currentIndex === idx ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                borderRadius: '6px',
                opacity: currentIndex === idx ? 1 : 0.6,
                transition: 'opacity 0.2s, border-color 0.2s',
              }}
            />
          ))}
        </div>
      )}

      {/* Main Image */}
      <div style={{ 
        position: 'relative', 
        flexGrow: 1, 
        height: '100%', 
        backgroundColor: '#f7fafc', 
        borderRadius: '8px', 
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        <img
          src={formatImageUrl(displayImages[currentIndex])}
          alt={`Product image ${currentIndex}`}
          onClick={() => setIsModalOpen(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'zoom-in' }}
        />
        
        {displayImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              style={{
                position: 'absolute',
                top: '50%',
                left: '10px',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.9)',
                color: '#1a202c',
                border: '1px solid #e2e8f0',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
                fontSize: '1.2rem',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#fff'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
            >
              &#8249;
            </button>
            <button
              onClick={nextImage}
              style={{
                position: 'absolute',
                top: '50%',
                right: '10px',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.9)',
                color: '#1a202c',
                border: '1px solid #e2e8f0',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
                fontSize: '1.2rem',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#fff'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
            >
              &#8250;
            </button>
          </>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
            style={{
              position: 'fixed',
              bottom: '20px',
              left: '20px',
              background: 'rgba(239, 68, 68, 0.9)', // Red background for high visibility
              border: '2px solid white',
              borderRadius: '8px',
              padding: '10px 20px',
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              transition: 'background 0.2s, transform 0.1s',
              zIndex: 2147483647 // Max z-index to guarantee visibility
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)'}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span>&times;</span> Close
          </button>
          
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ position: 'relative', width: '90%', height: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <img
              src={formatImageUrl(displayImages[currentIndex])}
              alt={`Fullscreen product image ${currentIndex}`}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
            
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(e); }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  &#8249;
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(e); }}
                  style={{
                    position: 'absolute',
                    right: 0,
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  &#8250;
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
