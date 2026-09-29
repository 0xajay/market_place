'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, googleLogin } from '@/lib/actions';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

declare global {
  interface Window {
    google: any;
  }
}

function normalizeUser(raw: any) {
  return {
    id: raw.id,
    email: raw.email,
    displayName: raw.display_name,
    isSeller: raw.is_seller,
    phoneNumber: raw.phone_number,
    selfieUrl: raw.selfie_url,
    authType: raw.auth_type,
    avatarUrl: raw.avatar_url,
  };
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSso, setHasSso] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (clientId && clientId !== 'YOUR_GOOGLE_CLIENT_ID') {
      setHasSso(true);
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      return () => {
        if (document.body.contains(script)) document.body.removeChild(script);
      };
    }
  }, []);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID') return;

    const timer = setTimeout(() => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-login-btn'),
        { theme: 'outline', size: 'large', width: 330, text: 'signin_with' }
      );
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleResponse = async (response: any) => {
    setError('');
    setLoading(true);
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const { sub: googleId, email, name, picture } = payload;

      const user = await googleLogin(googleId, email, name, picture);
      const normalized = normalizeUser(user);
      login(normalized);
      router.push('/');
    } catch (err: any) {
      if (err.message && err.message.includes("Account not found")) {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        const { sub: googleId, email, name, picture } = payload;
        sessionStorage.setItem('pendingSsoPayload', JSON.stringify({ googleId, email, displayName: name, avatarUrl: picture }));
        router.push('/register');
      } else {
        setError(err.message || 'Google login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      const normalized = normalizeUser(user);
      login(normalized);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const divider = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
      <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or continue with email</span>
      <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', marginTop: '4rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Welcome Back</h2>
        {error && (
          <div style={{ color: '#c62828', backgroundColor: '#fdecea', border: '1px solid #f5c6c6', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}
        
        {/* Google Sign-In Button */}
        <div id="google-login-btn" style={{ width: '100%', minHeight: '44px', display: 'flex', justifyContent: 'center' }} />

        {/* Mock SSO button */}
        {!hasSso && (
          <button
            onClick={async () => {
              const email = window.prompt("Mock SSO: Enter email address", "testuser@gmail.com");
              if (!email) return;
              
              setError('');
              setLoading(true);
              try {
                // Since this is mock login, we don't know their real mock_g_id.
                // We just pass the email and hope the backend matches it.
                const mockGoogleId = "mock_g_id_login"; 
                const user = await googleLogin(mockGoogleId, email, "Mock User", undefined);
                const normalized = normalizeUser(user);
                login(normalized);
                router.push('/');
              } catch (err: any) {
                if (err.message && err.message.includes("Account not found")) {
                  const mockGoogleId = "mock_g_id_login"; 
                  sessionStorage.setItem('pendingSsoPayload', JSON.stringify({ googleId: mockGoogleId, email, displayName: "Mock User", avatarUrl: undefined }));
                  router.push('/register');
                } else {
                  setError(err.message);
                }
              } finally { setLoading(false); }
            }}
            disabled={loading}
            style={{
              width: '100%', padding: '0.6rem 1rem', border: '1px solid #dadce0',
              borderRadius: 'var(--radius-sm)', backgroundColor: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              fontSize: '0.875rem', fontWeight: 500, color: '#3c4043',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Sign in with Google (mock)
          </button>
        )}

        {divider}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" required className="input" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" required className="input" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link href="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
