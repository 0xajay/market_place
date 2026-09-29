'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, isLoading, itemCount } = useCart();
  const router = useRouter();
  
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Loading cart...</h2>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Your cart is empty</h2>
        <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  let subtotal = 0;
  items.forEach(item => {
    const price = item.product?.discount_price || item.product?.price || 0;
    subtotal += price * item.quantity;
  });

  const total = subtotal - discountAmount;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'SAVE100') {
      setDiscountAmount(100);
      setCouponMessage('Coupon applied! ₹100 deducted.');
    } else if (couponCode.toUpperCase() === 'MINUS50') {
      setDiscountAmount(50);
      setCouponMessage('Coupon applied! ₹50 deducted.');
    } else {
      setDiscountAmount(0);
      setCouponMessage('Invalid coupon code.');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', marginTop: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Your Shopping Cart</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        <div className="card" style={{ padding: '2rem' }}>
          {items.map(item => {
            const product = item.product;
            if (!product) return null;
            const price = product.discount_price || product.price;

            return (
              <div key={item.id} style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                {product.image_urls && product.image_urls.length > 0 ? (
                  <img src={product.image_urls[0].startsWith('/') ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace('/api', '')}${product.image_urls[0]}` : product.image_urls[0]} alt={product.title} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                ) : (
                  <div style={{ width: '100px', height: '100px', backgroundColor: 'var(--border)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>No Image</span>
                  </div>
                )}
                
                <div style={{ flex: 1 }}>
                  <h3 
                    style={{ fontSize: '1.25rem', marginBottom: '0.5rem', cursor: 'pointer', color: 'var(--primary)', textDecoration: 'underline' }}
                    onClick={() => router.push(`/product?id=${product.id}`)}
                  >
                    {product.title}
                  </h3>
                  <p style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{price}</p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button 
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="btn btn-secondary" 
                      style={{ padding: '0.2rem 0.5rem' }}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="btn btn-secondary" 
                      style={{ padding: '0.2rem 0.5rem' }}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.product_id)}
                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Order Summary</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: discountAmount > 0 ? 'none' : '1px solid var(--border)', paddingBottom: discountAmount > 0 ? '0' : '1.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Subtotal ({itemCount} items)</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          
          {discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Coupon Discount</span>
              <span style={{ color: '#16a34a' }}>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>₹{Math.max(0, total).toFixed(2)}</span>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="Coupon Code" 
                className="input" 
                value={couponCode} 
                onChange={(e) => setCouponCode(e.target.value)}
                style={{ flex: 1, margin: 0 }}
              />
              <button className="btn btn-secondary" onClick={handleApplyCoupon}>Apply</button>
            </div>
            {couponMessage && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: discountAmount > 0 ? '#16a34a' : '#ef4444' }}>
                {couponMessage}
              </p>
            )}
          </div>

          <button 
            onClick={() => router.push(`/checkout${discountAmount > 0 ? `?discount=${discountAmount}` : ''}`)} 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
