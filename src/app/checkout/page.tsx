'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProduct, placeOrder } from '@/lib/actions';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items: cartItems, clearCart, isLoading: isCartLoading } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const discountParam = searchParams.get('discount');
  const discountValue = discountParam ? parseFloat(discountParam) : 0;
  
  const [product, setProduct] = useState<any>(null);
  const [isProductLoading, setIsProductLoading] = useState(!!productId);
  
  // Detailed address fields
  const [houseName, setHouseName] = useState('');
  const [street, setStreet] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setAddressState] = useState('');
  const [country, setCountry] = useState('');
  const [pincode, setPincode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Mock payment state
  const [paymentStep, setPaymentStep] = useState<'none' | 'processing' | 'success' | 'done'>('none');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
    if (productId) {
      getProduct(productId).then(p => {
        if (p) setProduct(p);
        else setError('Product not found');
        setIsProductLoading(false);
      });
    }
  }, [user, productId, router]);

  const isCartCheckout = !productId;
  const checkoutItems = isCartCheckout ? cartItems.map(item => ({ product: item.product, quantity: item.quantity })) : (product ? [{ product, quantity: 1 }] : []);
  
  let subtotal = 0;
  checkoutItems.forEach(item => {
    const price = item.product?.discount_price || item.product?.price || 0;
    subtotal += price * item.quantity;
  });
  
  // Note: For direct checkout, product.discount_price vs product.price is already handled above.
  // The 'discountValue' is the extra cart-level coupon discount applied.
  const finalTotalAmount = Math.max(0, subtotal - discountValue);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    
    setError('');
    setPaymentStep('processing');
    
    // Simulate payment gateway delay
    setTimeout(async () => {
      try {
        setPaymentStep('success');
        
        const apiItems = checkoutItems.map(item => {
          const finalPrice = item.product.discount_price ? item.product.discount_price : item.product.price;
          return {
            productId: item.product.id,
            sellerId: item.product.seller_id,
            title: item.product.title,
            price: finalPrice,
            quantity: item.quantity,
            image_url: item.product.image_urls?.[0] || null
          };
        });
        
        const fullAddress = `${houseName}, ${street}, ${district}, ${state}, ${country} - ${pincode}`;
        
        await placeOrder(user.id, apiItems, finalTotalAmount, fullAddress);
        
        if (isCartCheckout) {
          await clearCart();
        }

        // Wait on success screen briefly before redirecting
        setTimeout(() => {
          setPaymentStep('done');
          router.push('/buyer');
        }, 2000);
      } catch (err: any) {
        setError(err.message || 'Failed to place order');
        setPaymentStep('none');
      }
    }, 2500); // Mock payment processing time
  };

  if (!user) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Redirecting to login...</div>;
  if (productId && isProductLoading && !error) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading product...</div>;
  if (isCartCheckout && isCartLoading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading cart...</div>;
  if (paymentStep === 'done') return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Redirecting to dashboard...</div>;
  
  if (checkoutItems.length === 0 && !error) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>No items to checkout.</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', marginTop: '3rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Checkout</h1>
      
      {error && <div style={{ color: 'white', backgroundColor: '#ef4444', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>{error}</div>}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Shipping Details */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Shipping Details</h3>
          <form onSubmit={handleCheckout}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label>House Name / Flat No.</label>
                <input required type="text" className="input" value={houseName} onChange={e => setHouseName(e.target.value)} />
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label>Street</label>
                <input required type="text" className="input" value={street} onChange={e => setStreet(e.target.value)} />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label>District / City</label>
                <input required type="text" className="input" value={district} onChange={e => setDistrict(e.target.value)} />
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label>State</label>
                <input required type="text" className="input" value={state} onChange={e => setAddressState(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label>Country</label>
                <input required type="text" className="input" value={country} onChange={e => setCountry(e.target.value)} />
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label>Pincode / ZIP</label>
                <input required type="text" className="input" value={pincode} onChange={e => setPincode(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '2rem' }} disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Order & Pay'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>Order Summary</h3>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
            {checkoutItems.map((item, idx) => {
              const product = item.product;
              const price = product.discount_price || product.price;
              
              return (
                <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: idx < checkoutItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f1f5f9', flexShrink: 0 }}>
                    {product.image_urls && product.image_urls.length > 0 && (
                      <img src={product.image_urls[0].startsWith('/') ? `http://localhost:8000${product.image_urls[0]}` : product.image_urls[0]} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: '0 0 0.25rem' }}>{product.title}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Qty: {item.quantity}</p>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    ₹{price * item.quantity}
                  </div>
                </div>
              );
            })}
          </div>
          
          {discountValue > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Coupon Discount</span>
              <span style={{ color: '#16a34a' }}>-₹{discountValue.toFixed(2)}</span>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 600 }}>Total</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>₹{finalTotalAmount.toFixed(2)}</span>
          </div>
        </div>

      </div>

      {/* Mock Payment Modal Overlay */}
      {(paymentStep === 'processing' || paymentStep === 'success') && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '3rem',
            width: '90%', maxWidth: '400px', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {paymentStep === 'processing' ? (
              <div className="animate-fade-in">
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%', border: '4px solid #f1f5f9',
                  borderTopColor: 'var(--primary)', margin: '0 auto 1.5rem',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem' }}>Processing Payment...</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Securely communicating with mock bank gateway.</p>
                <style>{`
                  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%', background: '#10b981', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#10b981' }}>Payment Successful!</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Order placed successfully. Redirecting...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
