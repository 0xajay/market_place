'use client';

import { useState } from 'react';

export default function ImageSlider({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <img
        src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"
        alt="Placeholder"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <img
        src={images[currentIndex].startsWith('/') ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace('/api', '')}${images[currentIndex]}` : images[currentIndex]}
        alt={`Slide ${currentIndex}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            style={{
              position: 'absolute',
              top: '50%',
              left: '5px',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            &#8249;
          </button>
          <button
            onClick={nextImage}
            style={{
              position: 'absolute',
              top: '50%',
              right: '5px',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            &#8250;
          </button>
        </>
      )}
    </div>
  );
}
