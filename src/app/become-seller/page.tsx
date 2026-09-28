'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { becomeSeller } from '@/lib/actions';
import { useAuth } from '@/context/AuthContext';

export default function BecomeSellerPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // 1 = Info, 2 = Selfie
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selfieUrl, setSelfieUrl] = useState('');
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    if (!user) router.push('/login');
    else if (user.isSeller) router.push('/seller');
  }, [user, router]);

  // Camera init
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (step === 2 && !selfieUrl) {
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

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) { 
        ctx.drawImage(video, 0, 0); 
        setSelfieUrl(canvas.toDataURL('image/jpeg')); 
        setCameraActive(false); 
      }
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    if (!selfieUrl) { setError('Please capture a selfie'); return; }
    setLoading(true);
    try {
      await becomeSeller(user.id, selfieUrl);
      updateUser({ ...user, isSeller: true });
      router.push('/seller');
    } catch (err: any) {
      setError(err.message || 'Failed to upgrade');
      setLoading(false);
    }
  };

  if (!user || user.isSeller) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', marginTop: '4rem', textAlign: 'center' }}>
      <div className="card" style={{ padding: '3rem' }}>
        {step === 1 ? (
          <>
            <h2 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Become a Seller</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
              Start selling your own products on our marketplace today. It's quick, easy, and completely free to start!
            </p>
            {error && <div style={{ color: 'white', backgroundColor: '#ef4444', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>{error}</div>}
            <button onClick={() => setStep(2)} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Proceed to Verification
            </button>
          </>
        ) : (
          <>
            <h3 style={{ marginBottom: '0.25rem' }}>Face Verification</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              As a seller, we require a clear selfie to verify your identity.
            </p>
            {error && <div style={{ color: 'white', backgroundColor: '#ef4444', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>{error}</div>}
            
            <div style={{ position: 'relative', width: '100%', height: '280px', backgroundColor: '#111', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
              {!selfieUrl && <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              {selfieUrl && <img src={selfieUrl} alt="Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            
            {!selfieUrl ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button onClick={() => setStep(1)} type="button" className="btn btn-secondary">Back</button>
                <button onClick={captureSelfie} type="button" className="btn btn-primary" disabled={!cameraActive}>
                  Capture Selfie
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button onClick={() => setSelfieUrl('')} type="button" className="btn btn-secondary">Retake</button>
                <button onClick={handleUpgrade} type="button" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Upgrading account...' : 'Complete Upgrade'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
