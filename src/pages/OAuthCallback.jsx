import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
  const navigate      = useNavigate();
  const location      = useLocation();
  const { googleLogin } = useAuth();
  const [status, setStatus] = useState('Processing…');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token  = params.get('token');
    const error  = params.get('error');

    if (error) {
      setStatus(`Sign-in failed: ${decodeURIComponent(error)}`);
      setIsError(true);
      setTimeout(() => navigate('/login', { replace: true }), 3000);
      return;
    }

    if (!token) {
      setStatus('No token received. Redirecting to login…');
      setIsError(true);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
      return;
    }

    // Exchange token for user info and set session
    googleLogin(token).then(result => {
      if (result.success) {
        navigate(result.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      } else {
        setStatus(result.error ?? 'Sign-in failed. Redirecting…');
        setIsError(true);
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5"
      style={{ background: 'var(--bg-page, #eef0f5)' }}>

      {!isError ? (
        <>
          {/* Spinner */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full"
              style={{ border: '2px solid rgba(59,130,246,0.15)' }} />
            <div className="absolute inset-0 rounded-full animate-spin"
              style={{ border: '2.5px solid transparent', borderTopColor: '#3b82f6', borderRightColor: '#10b981', animationDuration: '0.85s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-base font-bold" style={{ color: '#1e3a8a' }}>Signing you in with Google</p>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>{status}</p>
          </div>
        </>
      ) : (
        <>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="w-7 h-7">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-base font-bold" style={{ color: '#dc2626' }}>Sign-in Failed</p>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>{status}</p>
            <p className="text-xs mt-2" style={{ color: '#94a3b8' }}>Redirecting to login…</p>
          </div>
        </>
      )}
    </div>
  );
}
