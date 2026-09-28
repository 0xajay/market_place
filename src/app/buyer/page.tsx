'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getBuyerOrders } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    getBuyerOrders(user.id).then(data => {
      setOrders(data);
      setLoading(false);
    });
  }, [user, router]);

  if (!user || loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading dashboard...</div>;

  return (
    <div className="full-width-bleed" style={{ padding: '3rem 4rem', minHeight: 'calc(100vh - 64px)', background: 'var(--background)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>You haven't placed any orders yet.</h3>
          <button onClick={() => router.push('/')} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.reverse().map((order) => (
            <div 
              key={order.id} 
              className="card card-hoverable" 
              style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onClick={() => setSelectedOrder(order)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Order ID: {order.id}</span>
                  <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>Status: {order.status.toUpperCase()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Date: {new Date(order.created_at || order.createdAt).toLocaleDateString()}</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.25rem' }}>₹{order.total_amount || order.totalAmount}</div>
                </div>
              </div>
              
              <div>
                <h4 style={{ marginBottom: '0.5rem' }}>Items:</h4>
                <ul style={{ listStyle: 'none' }}>
                  {order.items.map((item: any, idx: number) => (
                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: idx < order.items.length - 1 ? '1px dashed var(--border)' : 'none' }}>
                      <span>{item.title} (x{item.quantity})</span>
                      <span>₹{item.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
        }} onClick={() => setSelectedOrder(null)}>
          <div style={{
            background: 'white', borderRadius: '12px', padding: '2.5rem',
            width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
            position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedOrder(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
            >&times;</button>
            
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>Order Details</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Order ID:</span> <span style={{ fontFamily: 'monospace' }}>{selectedOrder.id}</span></p>
              <p style={{ margin: '0 0 0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Date:</span> {new Date(selectedOrder.created_at || selectedOrder.createdAt).toLocaleString()}</p>
              <p style={{ margin: '0 0 0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Status:</span> <span style={{ fontWeight: 600, color: selectedOrder.status === 'pending' ? '#d97706' : '#16a34a' }}>{selectedOrder.status.toUpperCase()}</span></p>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Shipping Address</h4>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{selectedOrder.shipping_address}</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '1.1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Items</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {selectedOrder.items.map((item: any, idx: number) => (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px dashed var(--border)', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f1f5f9', flexShrink: 0 }}>
                        {item.image_url ? (
                          <img src={item.image_url.startsWith('/') ? `http://localhost:8000${item.image_url}` : item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{item.title}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Quantity: {item.quantity}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</div>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem' }}>
                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Total</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>₹{selectedOrder.total_amount || selectedOrder.totalAmount}</span>
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #10b981', color: '#047857' }}>
              <h4 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Payment Successful
              </h4>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Paid via Mock Payment Gateway.</p>
            </div>
            
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
