'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '@/lib/actions';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Already logged in? redirect
    if (typeof window !== 'undefined' && localStorage.getItem('admin_token')) {
      router.replace('/admin/dashboard');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await adminLogin(username, password);
      localStorage.setItem('admin_token', data.token);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="full-width-bleed" style={{
      minHeight: 'calc(100vh - 64px)', backgroundColor: '#f0f4f9',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: '380px',
        backgroundColor: '#fff', border: '1px solid #e2e8f0',
        borderRadius: '6px', padding: '2.5rem',
      }}>
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '48px', height: '48px', borderRadius: '8px',
            backgroundColor: '#387ed1', marginBottom: '1rem',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a202c', margin: 0 }}>
            Admin Console
          </h1>
          <p style={{ color: '#718096', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Marketplace Management
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fff5f5', border: '1px solid #feb2b2',
            color: '#c53030', padding: '0.75rem', borderRadius: '4px',
            fontSize: '0.875rem', marginBottom: '1.25rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#4a5568', marginBottom: '0.375rem' }}>
              Username
            </label>
            <input
              id="admin-username"
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              style={{
                width: '100%', padding: '0.6rem 0.875rem',
                border: '1px solid #e2e8f0', borderRadius: '4px',
                fontSize: '0.875rem', outline: 'none',
                fontFamily: 'Inter, sans-serif', color: '#2d3748',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#387ed1')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#4a5568', marginBottom: '0.375rem' }}>
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '0.6rem 0.875rem',
                border: '1px solid #e2e8f0', borderRadius: '4px',
                fontSize: '0.875rem', outline: 'none',
                fontFamily: 'Inter, sans-serif', color: '#2d3748',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#387ed1')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          <button
            id="admin-login-btn"
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.625rem',
              backgroundColor: loading ? '#7fb3e8' : '#387ed1',
              color: 'white', border: 'none', borderRadius: '4px',
              fontSize: '0.875rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif', transition: 'background-color 0.15s',
            }}
            onMouseOver={e => { if (!loading) (e.currentTarget.style.backgroundColor = '#2b66b0'); }}
            onMouseOut={e => { if (!loading) (e.currentTarget.style.backgroundColor = '#387ed1'); }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#a0aec0', marginTop: '1.5rem' }}>
          Restricted access. Authorised personnel only.
        </p>
      </div>
    </div>
  );
}
