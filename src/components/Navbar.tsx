'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '1rem 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
          IndoNumis
        </Link>
        
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/" style={{ fontWeight: 500 }}>Marketplace</Link>
          
          {user ? (
            <>
              {user.isSeller ? (
                <Link href="/seller" style={{ fontWeight: 500 }}>Seller Dashboard</Link>
              ) : (
                <Link href="/become-seller" style={{ fontWeight: 500 }}>Become a Seller</Link>
              )}
              <Link href="/buyer" style={{ fontWeight: 500 }}>My Orders</Link>
              
              <Link href="/cart" style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                🛒 Cart
                {itemCount > 0 && (
                  <span style={{ backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                    {itemCount}
                  </span>
                )}
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Hi, {user.displayName}</span>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', marginLeft: '1rem' }}>
              <Link href="/login" className="btn btn-secondary">Login</Link>
              <Link href="/register" className="btn btn-primary">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
