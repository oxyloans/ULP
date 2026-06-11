import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ADMIN_ROLES } from '../config/adminRoles';

// ─── Icons ────────────────────────────────────────────────────────────────────
const EyeIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const MailIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const LockIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const ShieldIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const FlashIcon  = ({ color }) => <svg viewBox="0 0 24 24" fill="none" stroke={color ?? 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

// ─── Demo role cards (CEO, ACCOUNTS_MANAGER, WALLET_OPS) ─────────────────────
const DEMO_ROLES = ['CEO', 'ACCOUNTS_MANAGER', 'WALLET_OPS', 'HELPDESK'];
const DEMO_REDIRECT_PATH = {
  CEO: '/admin/stats/funds-raised',
  ACCOUNTS_MANAGER: '/admin/interest/sd-lot',
  WALLET_OPS: '/admin/wallet-approvals',
  HELPDESK: '/admin/support',
};

// Short description per role shown on the card
const ROLE_DESC = {
  CEO:              'Dashboard & Stats only',
  ACCOUNTS_MANAGER: 'Interest payouts & Wallet',
  WALLET_OPS:       'Wallet approvals only',
  HELPDESK:         'Support tickets only',
};

export default function HiddenLogin() {
  const navigate              = useNavigate();
  const { hiddenLogin, demoLogin } = useAuth();
  const { theme }             = useTheme();
  const dark                  = theme === 'dark';

  const [credential, setCredential] = useState('');
  const [password,   setPassword]   = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [demoLoading, setDemoLoading] = useState('');

  // Design tokens
  const pageBg  = dark ? '#13172a' : '#eef0f5';
  const cardBg  = dark ? '#1a1f30' : '#ffffff';
  const inputBg = dark ? '#0f1220' : '#eef0f5';
  const textC   = dark ? '#e2e8f0' : '#1e293b';
  const subC    = dark ? '#94a3b8' : '#64748b';
  const iconC   = dark ? '#64748b' : '#94a3b8';
  const outerShadow = dark ? 'd-neu-outer' : 'neu-outer';
  const innerShadow = dark ? 'd-neu-inner d-neu-input-focus' : 'neu-inner neu-input-focus';

  // Real SUPERADMIN login via API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await hiddenLogin(credential.trim(), password);
    setLoading(false);
    if (!result.success) { setError(result.error); return; }
    navigate(result.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  };

  // Demo login — no API call
  const handleDemoLogin = (roleKey) => {
    setDemoLoading(roleKey);
    demoLogin(roleKey);
    // Small delay so the button shows feedback before navigating
    setTimeout(() => navigate(DEMO_REDIRECT_PATH[roleKey] ?? '/admin', { replace: true }), 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: pageBg, transition: 'background 0.4s' }}>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full"
          style={{ background: dark ? 'radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)' : 'radial-gradient(circle,rgba(219,234,254,0.8) 0%,transparent 65%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-6">

        {/* ── Header ── */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4338ca)', boxShadow: '0 6px 20px rgba(99,102,241,0.45)' }}>
            <span className="text-white"><ShieldIcon /></span>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-extrabold" style={{ color: dark ? '#e2e8f0' : '#1e3a8a' }}>
              Admin Access
            </h2>
            <p className="text-xs font-medium mt-1" style={{ color: subC }}>
              Choose a demo role or sign in as Super Admin
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          {/* ── SUPERADMIN real login form ── */}
          <div className={`rounded-[2rem] p-6 ${outerShadow}`} style={{ background: cardBg }}>
            <p className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: subC }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#a855f7' }} />
              Super Admin — Real Login
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email / Mobile */}
              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: subC }}>
                  Email / Mobile
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: iconC }}>
                    <MailIcon />
                  </span>
                  <input
                    type="text"
                    placeholder="user@email.com or 9876543210"
                    value={credential}
                    onChange={e => { setCredential(e.target.value); setError(''); }}
                    required
                    className={`w-full rounded-2xl text-sm font-medium ${innerShadow}`}
                    style={{ padding: '13px 18px 13px 46px', background: inputBg, color: textC, border: 'none' }}
                  />
                </div>
              </div>

              {/* Super Password */}
              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: subC }}>
                  Super Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: iconC }}>
                    <LockIcon />
                  </span>
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    required
                    className={`w-full rounded-2xl text-sm font-medium ${innerShadow}`}
                    style={{ padding: '13px 50px 13px 46px', background: inputBg, color: textC, border: 'none' }}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                    style={{ color: iconC }}>
                    {showPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold"
                  style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-extrabold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg,#a855f7 0%,#7c3aed 100%)',
                  boxShadow: '0 8px 28px rgba(168,85,247,0.4)',
                  letterSpacing: '0.1em',
                }}>
                {loading && (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                  </svg>
                )}
                ACCESS
              </button>
            </form>
          </div>

          {/* ── Demo Role Cards ── */}
          <div className={`rounded-[2rem] p-5 flex flex-col gap-3 ${outerShadow}`}
            style={{ background: cardBg }}>
            <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: subC }}>
              Demo Logins
            </p>

            {DEMO_ROLES.map(roleKey => {
              const def     = ADMIN_ROLES[roleKey];
              const isLoading = demoLoading === roleKey;
              return (
                <button
                  key={roleKey}
                  onClick={() => handleDemoLogin(roleKey)}
                  disabled={!!demoLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                  style={{
                    background: dark ? `${def.color}14` : `${def.color}0f`,
                    border: `1.5px solid ${def.color}35`,
                    boxShadow: isLoading ? `0 0 0 3px ${def.color}30` : 'none',
                  }}>
                  {/* Color dot */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${def.color}20`, border: `1px solid ${def.color}40` }}>
                    {isLoading
                      ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke={def.color} strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                      : <FlashIcon color={def.color} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: def.color }}>{def.label}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: subC }}>{ROLE_DESC[roleKey]}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
                    style={{ background: `${def.color}18`, color: def.color, border: `1px solid ${def.color}30` }}>
                    Demo
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Back to login */}
        <p className="text-center text-sm" style={{ color: subC }}>
          <button onClick={() => navigate('/login')}
            className="font-bold hover:opacity-70 transition-opacity"
            style={{ color: '#6366f1' }}>
            ← Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}
