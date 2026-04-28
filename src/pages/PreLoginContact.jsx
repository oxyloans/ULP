import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const SunIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const MoonIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const SendIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const BackIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const MailIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const PhoneIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;

const CATEGORIES = ['OxyLoans', 'OxyBricks', 'Offline Payments', 'Account Access', 'Other'];

const inputStyle = {
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  color: 'var(--text-primary)',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 13,
  width: '100%',
  outline: 'none',
};

export default function PreLoginContact() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const [form, setForm] = useState({ name: '', email: '', phone: '', category: 'OxyLoans', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--surface)' }}>

      {/* Background blobs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(245,158,11,0.08) 0%,transparent 70%)', filter: 'blur(40px)' }} />

      {/* Theme toggle */}
      <button onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="absolute top-5 right-5 w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: isDark ? '#f59e0b' : '#6366f1' }}>
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>

      <div className="w-full max-w-lg relative z-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/login"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <BackIcon />
          </Link>
          <div>
            <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>Contact Support</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>We'll get back to you within 24 hours</p>
          </div>
        </div>

        {submitted ? (
          <div className="rounded-2xl p-10 text-center"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Request Submitted!</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Our support team will contact you at <strong>{form.email}</strong> within 24 hours.</p>
            <Link to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#6366f1,#4338ca)', color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl p-6"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

            {/* Contact info strip */}
            <div className="flex gap-4 mb-5 pb-5 flex-wrap" style={{ borderBottom: '1px solid var(--border)' }}>
              {[
                { Icon: MailIcon,  label: 'support@oxyloans.com', color: '#6366f1' },
                { Icon: PhoneIcon, label: '+91 98765 43210',       color: '#10b981' },
              ].map(c => (
                <div key={c.label} className="flex items-center gap-2">
                  <span style={{ color: c.color }}><c.Icon /></span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{c.label}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="grid gap-3.5">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Full Name *</label>
                  <input style={inputStyle} placeholder="Your name" value={form.name} onChange={e => set('name', e.target.value)} required
                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.boxShadow = 'none'; }} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Email *</label>
                  <input style={inputStyle} type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} required
                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.boxShadow = 'none'; }} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Phone</label>
                  <input style={inputStyle} placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => set('phone', e.target.value)}
                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.boxShadow = 'none'; }} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Category</label>
                  <select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Subject *</label>
                <input style={inputStyle} placeholder="Brief description of your issue" value={form.subject} onChange={e => set('subject', e.target.value)} required
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.boxShadow = 'none'; }} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Message *</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }} placeholder="Describe your issue in detail..." value={form.message} onChange={e => set('message', e.target.value)} required
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.boxShadow = 'none'; }} />
              </div>
              <button type="submit" disabled={loading}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-60 mt-1"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4338ca)', color: '#fff', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
                {loading ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg> : <SendIcon />}
                {loading ? 'Submitting…' : 'Submit Request'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
