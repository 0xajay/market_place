'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminGetUsers, adminDeleteUser, adminDeleteAllUsers } from '@/lib/actions';

type User = {
  id: string;
  email: string;
  display_name: string;
  is_seller: boolean;
  auth_type: string;
  phone_number?: string;
  created_at: string;
};

type ModalState = {
  open: boolean;
  mode: 'single' | 'all';
  userId?: string;
  userName?: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalState>({ open: false, mode: 'single' });

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) { router.replace('/admin'); return; }
    setToken(t);
  }, []);

  const fetchUsers = useCallback(async (t: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await adminGetUsers(t);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchUsers(token);
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };

  const confirmDelete = (userId: string, userName: string) => {
    setModal({ open: true, mode: 'single', userId, userName });
  };

  const confirmDeleteAll = () => {
    setModal({ open: true, mode: 'all' });
  };

  const executeDelete = async () => {
    setModal(m => ({ ...m, open: false }));
    setError('');
    if (modal.mode === 'single' && modal.userId) {
      setActionLoading(modal.userId);
      try {
        await adminDeleteUser(modal.userId, token);
        setUsers(prev => prev.filter(u => u.id !== modal.userId));
      } catch (err: any) { setError(err.message); }
      finally { setActionLoading(null); }
    } else {
      setActionLoading('all');
      try {
        await adminDeleteAllUsers(token);
        setUsers([]);
      } catch (err: any) { setError(err.message); }
      finally { setActionLoading(null); }
    }
  };

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    sellers: users.filter(u => u.is_seller).length,
    buyers: users.filter(u => !u.is_seller).length,
    sso: users.filter(u => u.auth_type === 'google').length,
  };

  const inputStyle: React.CSSProperties = {
    padding: '0.5rem 0.875rem',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '0.875rem',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    color: '#2d3748',
    backgroundColor: '#fff',
  };

  return (
    <div className="full-width-bleed" style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#f0f4f9', fontFamily: 'Inter, sans-serif' }}>

      {/* Confirm Modal */}
      {modal.open && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '6px', padding: '2rem',
            maxWidth: '400px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: '#1a202c' }}>
              {modal.mode === 'all' ? 'Delete ALL Users?' : 'Delete User?'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '1.5rem' }}>
              {modal.mode === 'all'
                ? 'This will permanently delete ALL users, their products, and all orders. This action cannot be undone.'
                : `This will permanently delete "${modal.userName}" and all their associated data.`}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setModal(m => ({ ...m, open: false }))}
                style={{ ...inputStyle, cursor: 'pointer', padding: '0.5rem 1rem' }}
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                style={{
                  padding: '0.5rem 1.25rem', backgroundColor: '#e53935',
                  color: 'white', border: 'none', borderRadius: '4px',
                  fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Nav */}
      <nav style={{
        backgroundColor: '#1e2a3a', color: 'white',
        padding: '0 1.5rem', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '28px', height: '28px', backgroundColor: '#387ed1',
            borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Admin Console</span>
          <span style={{
            fontSize: '0.7rem', backgroundColor: '#387ed1', color: 'white',
            padding: '0.15rem 0.5rem', borderRadius: '20px', fontWeight: 500,
          }}>
            Marketplace
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
            color: '#a0aec0', padding: '0.35rem 0.875rem',
            borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem',
          }}
        >
          Sign Out
        </button>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Page Title */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 600, color: '#1a202c', margin: 0 }}>
            User Management
          </h1>
          <p style={{ color: '#718096', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Manage all registered marketplace users
          </p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
          {[
            { label: 'Total Users', value: stats.total, color: '#387ed1' },
            { label: 'Sellers', value: stats.sellers, color: '#38a169' },
            { label: 'Buyers', value: stats.buyers, color: '#d69e2e' },
            { label: 'Google SSO', value: stats.sso, color: '#718096' },
          ].map(stat => (
            <div key={stat.label} style={{
              backgroundColor: '#fff', border: '1px solid #e2e8f0',
              borderRadius: '6px', padding: '1.25rem',
              borderTop: `3px solid ${stat.color}`,
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: stat.color }}>
                {loading ? '—' : stat.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.25rem' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: '#fff5f5', border: '1px solid #feb2b2', color: '#c53030',
            padding: '0.75rem 1rem', borderRadius: '4px', fontSize: '0.875rem',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        {/* Table Card */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>

          {/* Toolbar */}
          <div style={{
            padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, flex: 1, border: 'none', padding: '0' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => fetchUsers(token)}
                style={{
                  ...inputStyle, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: '0.4rem',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                Refresh
              </button>
              <button
                id="delete-all-btn"
                onClick={confirmDeleteAll}
                disabled={users.length === 0 || actionLoading === 'all'}
                style={{
                  padding: '0.5rem 1rem', cursor: users.length === 0 ? 'not-allowed' : 'pointer',
                  backgroundColor: users.length === 0 ? '#fef2f2' : '#fff5f5',
                  color: '#e53935', border: '1px solid #fca5a5',
                  borderRadius: '4px', fontSize: '0.875rem', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  opacity: users.length === 0 ? 0.5 : 1,
                }}
              >
                {actionLoading === 'all' ? 'Deleting…' : '🗑 Delete All Users'}
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f7fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Name', 'Email', 'Role', 'Auth', 'Phone', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '0.75rem 1rem', textAlign: 'left',
                      fontWeight: 500, color: '#4a5568', whiteSpace: 'nowrap',
                      fontSize: '0.8rem', letterSpacing: '0.02em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#a0aec0' }}>
                      <div style={{ fontSize: '0.875rem' }}>Loading users…</div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                      <div style={{ color: '#718096', fontSize: '0.875rem' }}>
                        {search ? 'No users match your search' : 'No users registered yet'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((user, i) => (
                    <tr key={user.id} style={{
                      borderBottom: '1px solid #edf2f7',
                      backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa',
                      transition: 'background-color 0.1s',
                    }}
                      onMouseOver={e => (e.currentTarget.style.backgroundColor = '#ebf4ff')}
                      onMouseOut={e => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#fff' : '#fafafa')}
                    >
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            backgroundColor: '#387ed1', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem', fontWeight: 600, flexShrink: 0,
                          }}>
                            {user.display_name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500, color: '#2d3748' }}>
                            {user.display_name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#4a5568' }}>
                        {user.email}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          display: 'inline-block', padding: '0.2rem 0.6rem',
                          borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500,
                          backgroundColor: user.is_seller ? '#f0fff4' : '#ebf4ff',
                          color: user.is_seller ? '#276749' : '#2b6cb0',
                          border: `1px solid ${user.is_seller ? '#9ae6b4' : '#bee3f8'}`,
                        }}>
                          {user.is_seller ? '🏪 Seller' : '🛒 Buyer'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          display: 'inline-block', padding: '0.2rem 0.6rem',
                          borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500,
                          backgroundColor: user.auth_type === 'google' ? '#fff8f1' : '#f7fafc',
                          color: user.auth_type === 'google' ? '#c05621' : '#4a5568',
                          border: `1px solid ${user.auth_type === 'google' ? '#fbd38d' : '#e2e8f0'}`,
                        }}>
                          {user.auth_type === 'google' ? 'Google' : 'Email'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#718096' }}>
                        {user.phone_number || <span style={{ color: '#cbd5e0' }}>—</span>}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#718096', whiteSpace: 'nowrap' }}>
                        {new Date(user.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <button
                          onClick={() => confirmDelete(user.id, user.display_name)}
                          disabled={actionLoading === user.id}
                          style={{
                            backgroundColor: 'transparent', border: '1px solid #fca5a5',
                            color: '#e53935', padding: '0.3rem 0.75rem',
                            borderRadius: '4px', fontSize: '0.8rem',
                            cursor: actionLoading === user.id ? 'not-allowed' : 'pointer',
                            fontWeight: 500,
                          }}
                          onMouseOver={e => (e.currentTarget.style.backgroundColor = '#fff5f5')}
                          onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {actionLoading === user.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div style={{
              padding: '0.75rem 1.25rem', borderTop: '1px solid #edf2f7',
              color: '#a0aec0', fontSize: '0.8rem',
            }}>
              Showing {filtered.length} of {users.length} user{users.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
