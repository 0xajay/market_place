'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, sendMockOTP, verifyMockOTP, checkEmailExists, googleAuth, googleLogin } from '@/lib/actions';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

declare global {
  interface Window {
    google: any;
  }
}

// Map snake_case API response to camelCase for AuthContext
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

export default function RegisterPage() {
  const router = useRouter();
  const { login, updateUser } = useAuth();

  // "email" flow: 1 → 2 → 'role' → (if seller) 'selfie' → done
  // "sso" flow:   straight to 'role' step
  const [step, setStep] = useState<1 | 2 | 'role' | 'selfie'>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // true when a real Google Client ID is configured at runtime
  const [hasSso, setHasSso] = useState(false);
  const [ssoPayload, setSsoPayload] = useState<any>(null); // temp store for Google payload before registration
  const [isSellerRole, setIsSellerRole] = useState(false);

  // Handle cross-page SSO state
  useEffect(() => {
    const pendingSso = sessionStorage.getItem('pendingSsoPayload');
    if (pendingSso) {
      try {
        const parsed = JSON.parse(pendingSso);
        setSsoPayload(parsed);
        sessionStorage.removeItem('pendingSsoPayload');
        setStep(2);
      } catch (e) {}
    }
  }, []);

  // Step 1 State
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');

  // Step 2 State
  const [phone, setPhone] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');

  // Step 3 State (Selfie)
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selfieUrl, setSelfieUrl] = useState('');
  const [cameraActive, setCameraActive] = useState(false);

  // Load Google Identity Services script only when a real client ID is set
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

  // Init Google button when on step 1
  useEffect(() => {
    if (step !== 1) return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID') return;

    const timer = setTimeout(() => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'outline', size: 'large', width: 330, text: 'continue_with' }
      );
    }, 800);
    return () => clearTimeout(timer);
  }, [step]);

  // Camera init for selfie
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (step === 'selfie' && !selfieUrl) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            setCameraActive(true);
          }
        })
        .catch(() => setError('Failed to access camera. Please allow camera permissions.'));
    }
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [step, selfieUrl]);

  // ── Google SSO Handler ────────────────────────────────────────────────────
  const handleGoogleResponse = async (response: any) => {
    setError('');
    setLoading(true);
    try {
      // Decode the JWT credential (header.payload.signature — we only need payload)
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const { sub: googleId, email, name, picture } = payload;

      try {
        const user = await googleLogin(googleId, email, name, picture);
        const normalized = normalizeUser(user);
        login(normalized);
        router.push('/');
        return;
      } catch (loginErr: any) {
        if (loginErr.message && loginErr.message.includes("Account not found")) {
          setSsoPayload({ googleId, email, displayName: name, avatarUrl: picture });
          setStep(2);
        } else {
          setError(loginErr.message || 'Google login failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in parsing failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Role Selection ──────────────────────────────────────
  const handleRoleSelect = async (isSeller: boolean) => {
    setIsSellerRole(isSeller);
    if (isSeller) {
      setStep('selfie');
    } else {
      await handleFinalSubmit(false); // pass explicitly because state might not have updated
    }
  };

  // ── Email OTP ─────────────────────────────────────────────────────────────
  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) { setError('Please fill in all fields'); return; }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters and contain a letter, number and special character.');
      return;
    }

    setError(''); setLoading(true);
    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists) { setError('An account with this email already exists.'); return; }
      await sendMockOTP(email);
      setEmailOtpSent(true);
      alert('Mock OTP sent! Use 123456');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOtp) return;
    setError(''); setLoading(true);
    try {
      await verifyMockOTP(email, emailOtp);
      setStep(2);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── Phone OTP ─────────────────────────────────────────────────────────────
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) { setError('Please enter a phone number'); return; }
    setError(''); setLoading(true);
    try {
      await sendMockOTP(phone);
      setPhoneOtpSent(true);
      alert('Mock OTP sent! Use 123456');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOtp) return;
    setError(''); setLoading(true);
    try {
      await verifyMockOTP(phone, phoneOtp);
      setStep('role');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── Selfie ────────────────────────────────────────────────────────────────
  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.drawImage(video, 0, 0); setSelfieUrl(canvas.toDataURL('image/jpeg')); setCameraActive(false); }
    }
  };

  const handleFinalSubmit = async (sellerFlag = isSellerRole) => {
    if (sellerFlag && !selfieUrl) { setError('Please capture a selfie'); return; }
    setError(''); setLoading(true);
    try {
      let user;
      if (ssoPayload) {
        user = await googleAuth(ssoPayload.googleId, ssoPayload.email, ssoPayload.displayName, sellerFlag, ssoPayload.avatarUrl, phone, selfieUrl || undefined);
      } else {
        user = await registerUser(email, password, displayName, phone, sellerFlag, selfieUrl || undefined);
      }
      const normalized = normalizeUser(user);
      login(normalized);
      router.push('/');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const stepLabel = step === 'role' ? 'Role Selection' : `Step ${step} of 3`;

  const divider = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
      <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or continue with email</span>
      <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '460px', margin: '0 auto', marginTop: '3.5rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.25rem' }}>Create an Account</h2>
        <p style={{ textAlign: 'center', marginBottom: '1.75rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {stepLabel}
        </p>

        {error && (
          <div style={{ color: '#c62828', backgroundColor: '#fdecea', border: '1px solid #f5c6c6', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {/* ── Role Selection ── */}
        {step === 'role' && (
          <div>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Welcome! To get started, tell us how you plan to use the platform.
            </p>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <button
                onClick={() => handleRoleSelect(false)}
                disabled={loading}
                style={{
                  padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', textAlign: 'left', backgroundColor: 'var(--surface)',
                  transition: 'border-color 0.15s',
                }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>🛒 I'm a Buyer</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Browse and purchase products from sellers.</div>
              </button>
              <button
                onClick={() => handleRoleSelect(true)}
                disabled={loading}
                style={{
                  padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', textAlign: 'left', backgroundColor: 'var(--surface)',
                  transition: 'border-color 0.15s',
                }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>🏪 I'm a Seller</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>List products and manage your store.</div>
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
              You can switch roles later from your account settings.
            </p>
          </div>
        )}

        {/* ── Step 1: Email / Google ── */}
        {step === 1 && (
          <div>
            {/* Google Sign-In Button */}
            <div id="google-signin-btn" style={{ width: '100%', minHeight: '44px', display: 'flex', justifyContent: 'center' }} />

            {/* Mock SSO button — only shown when no real Client ID is wired up */}
            {!hasSso && (
              <button
                onClick={async () => {
                  const email = window.prompt("Mock SSO: Enter email address", "testuser@gmail.com");
                  if (!email) return;
                  const name = window.prompt("Mock SSO: Enter display name", "Test User");
                  if (!name) return;

                  setError('');
                  setLoading(true);
                  const mockGoogleId = "mock_g_id_" + Math.random().toString(36).substring(2, 9);
                  
                  try {
                    const user = await googleLogin(mockGoogleId, email, name, undefined);
                    const normalized = normalizeUser(user);
                    login(normalized);
                    router.push('/');
                    return;
                  } catch (loginErr: any) {
                    if (loginErr.message && loginErr.message.includes("Account not found")) {
                      setSsoPayload({ googleId: mockGoogleId, email, displayName: name, avatarUrl: undefined });
                      setStep(2);
                    } else {
                      setError(loginErr.message || 'Mock SSO failed');
                    }
                  } finally {
                    setLoading(false);
                  }
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
                Continue with Google (mock)
              </button>
            )}

            {divider}

            {!emailOtpSent ? (
              <form onSubmit={handleSendEmailOtp}>
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" required className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input type="email" required className="input" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <input type="password" required className="input" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Email OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmail}>
                <div className="input-group">
                  <label>Enter Email OTP</label>
                  <input type="text" required className="input" value={emailOtp} onChange={e => setEmailOtp(e.target.value)} placeholder="123456" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </form>
            )}

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Already have an account? <Link href="/login">Login here</Link>
            </p>
          </div>
        )}

        {/* ── Step 2: Phone OTP ── */}
        {step === 2 && (
          <div>
            <h3 style={{ marginBottom: '0.25rem' }}>Phone Verification</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              We'll send a one-time code to your mobile number.
            </p>
            {!phoneOtpSent ? (
              <form onSubmit={handleSendPhoneOtp}>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input type="tel" required className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                  {loading ? 'Sending...' : 'Send SMS OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPhone}>
                <div className="input-group">
                  <label>Enter Phone OTP</label>
                  <input type="text" required className="input" value={phoneOtp} onChange={e => setPhoneOtp(e.target.value)} placeholder="123456" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── Step 4: Selfie (Sellers Only) ── */}
        {step === 'selfie' && (
          <div>
            <h3 style={{ marginBottom: '0.25rem' }}>Face Verification</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              Please take a clear selfie to complete registration.
            </p>
            <div style={{ position: 'relative', width: '100%', height: '280px', backgroundColor: '#111', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
              {!selfieUrl && <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              {selfieUrl && <img src={selfieUrl} alt="Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            {!selfieUrl ? (
              <button onClick={captureSelfie} type="button" className="btn btn-primary" style={{ width: '100%' }} disabled={!cameraActive}>
                Capture Selfie
              </button>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button onClick={() => setSelfieUrl('')} type="button" className="btn btn-secondary">Retake</button>
                <button onClick={() => handleFinalSubmit()} type="button" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Registering...' : 'Complete Registration'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
