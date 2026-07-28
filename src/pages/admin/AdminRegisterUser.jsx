import { useState } from 'react';
import { Modal } from 'antd';
import { adminRegisterUser } from '../../api/afterlogin-admin';

// ─── Icons ────────────────────────────────────────────────────────────────────
const UserIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>;
const CheckIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="20 6 9 17 4 12"/></svg>;
const EyeIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

// ─── Shared input style (mirrors CreateDeal) ──────────────────────────────────
const inp = (err) => ({
  background:   'var(--input-bg)',
  border:       `1.5px solid ${err ? '#ef4444' : 'var(--border)'}`,
  color:        'var(--text-primary)',
  borderRadius: 10,
  padding:      '11px 14px',
  fontSize:     13,
  width:        '100%',
  outline:      'none',
  fontFamily:   'inherit',
  transition:   'border-color 0.15s, box-shadow 0.15s',
});

// ─── Field wrapper (mirrors CreateDeal) ──────────────────────────────────────
function Field({ label, required, error, hint, children }) {
  return (
    <div className="grid gap-1.5 min-w-0">
      <label className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
        {label}{required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
      {hint  && !error && <p className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.65 }}>{hint}</p>}
      {error && <p className="text-xs font-medium" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function Section({ title }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <p className="text-xs font-black uppercase tracking-widest whitespace-nowrap"
        style={{ color: 'var(--text-muted)' }}>{title}</p>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const EMPTY = { firstName: '', lastName: '', email: '', mobile: '', gender: '', password: '', referId: '' };

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminRegisterUser() {
  const [form,       setForm]       = useState(EMPTY);
  const [errors,     setErrors]     = useState({});
  const [showPw,     setShowPw]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [lastId,     setLastId]     = useState('');

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.firstName.trim())  e.firstName = 'First name is required';
    if (!form.lastName.trim())   e.lastName  = 'Last name is required';
    if (!form.email.trim())      e.email     = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(form.email)) e.email = 'Enter a valid email';
    if (!form.mobile)            e.mobile    = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = 'Must be a valid 10-digit Indian mobile';
    if (!form.gender)            e.gender    = 'Select a gender';
    if (!form.password.trim())   e.password  = 'Password is required';
    else if (form.password.trim().length < 8) e.password = 'At least 8 characters required';
    return e;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const res   = await adminRegisterUser({
        firstName:    form.firstName.trim(),
        lastName:     form.lastName.trim(),
        email:        form.email.trim(),
        gender:       form.gender,
        mobileNumber: form.mobile,
        password:     form.password.trim(),
        referId:      form.referId.trim(),
      });
      setLastId(res?.userId ?? res?.data?.userId ?? '');
      setSubmitted(true);
    } catch (err) {
      const status = err.status ?? 0;
      const raw    = err.data?.message ?? err.message ?? '';
      const msg    = (raw && raw !== 'Network error')
        ? raw
        : (status === 409 || status === 302)
          ? 'This mobile number or email is already registered.'
          : 'Registration failed. Please try again.';
      Modal.error({
        title:   'Registration Failed',
        content: msg,
        centered: true,
        okButtonProps: {
          style: {
            background: 'rgba(168,85,247,0.9)',
            borderColor: 'rgba(168,85,247,0.9)',
            color: '#fff',
          },
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(EMPTY); setErrors({});
    setSubmitted(false); setLastId('');
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) return (
    <div className="grid gap-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}>
          <UserIcon />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>Admin</p>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Register New User</h1>
        </div>
      </div>

      <div className="rounded-2xl p-8 flex flex-col items-center gap-5 text-center"
        style={{ background: 'var(--surface-card)', border: '1px solid rgba(16,185,129,0.25)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}>
          <CheckIcon />
        </div>
        <div>
          <h2 className="text-lg font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>User Registered</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {form.firstName || 'The user'} has been successfully registered.
          </p>
          {lastId && (
            <p className="text-xs font-mono mt-2 px-3 py-1.5 rounded-lg inline-block"
              style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Lender ID: {lastId}
            </p>
          )}
        </div>
        <button onClick={handleReset}
          className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
          style={{ background: 'rgba(168,85,247,0.14)', color: '#c084fc', border: '1.5px solid rgba(168,85,247,0.35)' }}>
          Register Another User
        </button>
      </div>
    </div>
  );

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="grid gap-5 max-w-2xl">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}>
          <UserIcon />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>Admin</p>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Register New User</h1>
        </div>
      </div>

      {/* Form card */}
      <form onSubmit={handleSubmit}
        className="rounded-2xl overflow-hidden grid gap-0"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        {/* Card header */}
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>User Details</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No OTP required — admin-initiated</p>
        </div>

        <div className="p-6 grid gap-5">

          {/* ── Personal Info ── */}
          <Section title="Personal Info" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" required error={errors.firstName}>
              <input placeholder="e.g. Rajesh" value={form.firstName}
                onChange={e => set('firstName', e.target.value)}
                style={inp(errors.firstName)} />
            </Field>
            <Field label="Last Name" required error={errors.lastName}>
              <input placeholder="e.g. Varma" value={form.lastName}
                onChange={e => set('lastName', e.target.value)}
                style={inp(errors.lastName)} />
            </Field>
          </div>

          <Field label="Gender" required error={errors.gender}>
            <div className="flex gap-2">
              {['Male', 'Female', 'Other'].map(g => (
                <button key={g} type="button" onClick={() => set('gender', g)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
                  style={form.gender === g ? {
                    background: 'linear-gradient(135deg,rgba(168,85,247,0.9),rgba(126,34,206,0.9))',
                    color: '#fff',
                    border: '1.5px solid rgba(168,85,247,0.6)',
                    boxShadow: '0 2px 10px rgba(168,85,247,0.3)',
                  } : {
                    background: 'var(--input-bg)',
                    color: 'var(--text-muted)',
                    border: `1.5px solid ${errors.gender ? '#ef4444' : 'var(--border)'}`,
                  }}>
                  {g}
                </button>
              ))}
            </div>
          </Field>

          {/* ── Contact ── */}
          <Section title="Contact" />

          <Field label="Email Address" required error={errors.email}>
            <input type="email" placeholder="user@example.com" value={form.email}
              onChange={e => set('email', e.target.value)}
              style={inp(errors.email)} />
          </Field>

          <Field label="Mobile Number" required error={errors.mobile} hint="10-digit Indian mobile — no OTP verification">
            <input placeholder="9876543210" value={form.mobile}
              onChange={e => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
              maxLength={10}
              style={{ ...inp(errors.mobile), fontFamily: 'monospace', letterSpacing: '0.05em' }} />
          </Field>

          {/* ── Security ── */}
          <Section title="Security" />

          <Field label="Password" required error={errors.password} hint="Min 8 characters">
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                style={{ ...inp(errors.password), paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100 opacity-50"
                style={{ color: 'var(--text-muted)' }}>
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </Field>

          {/* ── Optional ── */}
          <Section title="Optional" />

          <Field label="Referral ID" hint="Leave blank if not applicable">
            <input placeholder="e.g. LR-1234" value={form.referId}
              onChange={e => set('referId', e.target.value)}
              style={inp()} />
          </Field>

          {/* ── Actions ── */}
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={submitting}
              className="flex-1 py-3 rounded-xl text-sm font-black transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg,rgba(168,85,247,0.9),rgba(126,34,206,0.9))',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(168,85,247,0.3)',
              }}>
              {submitting
                ? <><div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} /> Registering…</>
                : <><UserIcon /> Register User</>
              }
            </button>
            <button type="button" onClick={handleReset}
              className="px-5 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
              style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1.5px solid var(--border)' }}>
              Reset
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
