'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProductActions({ productId }: { productId: string }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(productId, 1);
    setIsAdding(false);
    // Optional: show a toast here instead of alert, but alert works for simplicity if toast isn't set up
  };

  const handleBuyNow = () => {
    router.push(`/checkout?productId=${productId}`);
  };

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <button 
        onClick={handleAddToCart} 
        disabled={isAdding}
        className="btn btn-secondary" 
        style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
      >
        {isAdding ? 'Adding...' : 'Add to Cart'}
      </button>
      <button 
        onClick={handleBuyNow} 
        className="btn btn-primary" 
        style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
      >
        Checkout
      </button>
    </div>
  );
}
