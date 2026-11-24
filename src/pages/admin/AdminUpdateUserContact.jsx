import { useState } from 'react';
import { Modal } from 'antd';
import { updateEmailAndMobileNumber } from '../../api/afterlogin-admin';

// ─── Icons ────────────────────────────────────────────────────────────────────
const ContactIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const CheckIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="20 6 9 17 4 12"/></svg>;
const InfoIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const SendIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const CloseIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

// ─── Shared input style ───────────────────────────────────────────────────────
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

// ─── Field wrapper ────────────────────────────────────────────────────────────
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
function Section({ title, subtitle }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <div className="shrink-0">
        <p className="text-xs font-black uppercase tracking-widest whitespace-nowrap"
          style={{ color: 'var(--text-muted)' }}>{title}</p>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>{subtitle}</p>}
      </div>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const EMPTY = {
  oldEmail:        '',
  oldMobileNumber: '',
  newEmail:        '',
  newMobileNumber: '',
  testUser:        false,
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminUpdateUserContact() {
  const [form,       setForm]       = useState(EMPTY);
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    const oldEmail  = form.oldEmail.trim();
    const oldMobile = form.oldMobileNumber.trim();
    const newEmail  = form.newEmail.trim();
    const newMobile = form.newMobileNumber.trim();

    // At least one old value required (to identify the user)
    if (!oldEmail && !oldMobile) {
      e.oldEmail        = 'Provide the current email or mobile to identify the user';
      e.oldMobileNumber = 'Provide the current mobile or email to identify the user';
    }
    if (oldEmail  && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(oldEmail))
      e.oldEmail = 'Enter a valid email address';
    if (oldMobile && !/^[6-9]\d{9}$/.test(oldMobile))
      e.oldMobileNumber = 'Must be a valid 10-digit Indian mobile';

    // At least one new value required (something to update)
    if (!newEmail && !newMobile) {
      e.newEmail        = 'Provide at least one new value to update';
      e.newMobileNumber = 'Provide at least one new value to update';
    }
    if (newEmail  && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(newEmail))
      e.newEmail = 'Enter a valid email address';
    if (newMobile && !/^[6-9]\d{9}$/.test(newMobile))
      e.newMobileNumber = 'Must be a valid 10-digit Indian mobile';

    return e;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    const snapshot = { ...form };

    try {
      await updateEmailAndMobileNumber({
        // query params — identify the user
        oldEmail:        form.oldEmail.trim()        || undefined,
        oldMobileNumber: form.oldMobileNumber.trim() || undefined,
        // body — new values to set
        newEmail:        form.newEmail.trim()        || undefined,
        newMobileNumber: form.newMobileNumber.trim() || undefined,
        testUser:        form.testUser,
      });
      setLastUpdate(snapshot);
      setForm(EMPTY);
      setErrors({});
    } catch (err) {
      const raw = err?.data?.message ?? err?.message ?? '';
      const msg = (raw && raw !== 'Network error') ? raw : 'Update failed. Please try again.';
      Modal.error({
        title:    'Update Failed',
        content:  msg,
        centered: true,
        okButtonProps: {
          style: {
            background:  'rgba(168,85,247,0.9)',
            borderColor: 'rgba(168,85,247,0.9)',
            color:       '#fff',
          },
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => { setForm(EMPTY); setErrors({}); setLastUpdate(null); };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="grid gap-5 max-w-2xl">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}>
          <ContactIcon />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>Admin</p>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Update User Contact</h1>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(38,115,187,0.07)', border: '1px solid rgba(38,115,187,0.18)' }}>
        <span style={{ color: '#2673bb', marginTop: 1 }}><InfoIcon /></span>
        <p className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Enter the user&apos;s <strong>current</strong> email or mobile to identify them, then enter the <strong>new</strong> values to update. At least one field in each section is required.
        </p>
      </div>

      {/* Success banner */}
      {lastUpdate && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
          <span style={{ color: '#10b981', marginTop: 1 }}><CheckIcon /></span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold mb-1" style={{ color: '#10b981' }}>Contact updated successfully</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
              {lastUpdate.oldEmail        && <><span className="font-medium" style={{ color: 'var(--text-primary)' }}>Old email:</span> {lastUpdate.oldEmail}<br /></>}
              {lastUpdate.oldMobileNumber && <><span className="font-medium" style={{ color: 'var(--text-primary)' }}>Old mobile:</span> {lastUpdate.oldMobileNumber}<br /></>}
              {lastUpdate.newEmail        && <><span className="font-medium" style={{ color: 'var(--text-primary)' }}>New email:</span> {lastUpdate.newEmail}<br /></>}
              {lastUpdate.newMobileNumber && <><span className="font-medium" style={{ color: 'var(--text-primary)' }}>New mobile:</span> {lastUpdate.newMobileNumber}</>}
            </p>
          </div>
          <button type="button" onClick={() => setLastUpdate(null)}
            className="transition-opacity hover:opacity-100 opacity-50"
            style={{ color: 'var(--text-muted)' }} aria-label="Dismiss">
            <CloseIcon />
          </button>
        </div>
      )}

      {/* Form card */}
      <form onSubmit={handleSubmit}
        className="rounded-2xl overflow-hidden grid gap-0"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        {/* Card header */}
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Contact Details</p>
        </div>

        <div className="p-6 grid gap-5">

          {/* ── Current details (search params) ── */}
          <Section title="Current Details" subtitle="Used to identify the user" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Current Email" error={errors.oldEmail} hint="Leave blank if using mobile to identify">
              <input
                type="email"
                placeholder="current@example.com"
                value={form.oldEmail}
                onChange={e => set('oldEmail', e.target.value)}
                style={inp(errors.oldEmail)}
              />
            </Field>

            <Field label="Current Mobile Number" error={errors.oldMobileNumber} hint="Leave blank if using email to identify">
              <input
                placeholder="9876543210"
                value={form.oldMobileNumber}
                onChange={e => set('oldMobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                style={{ ...inp(errors.oldMobileNumber), fontFamily: 'monospace', letterSpacing: '0.05em' }}
              />
            </Field>
          </div>

          {/* ── New details (request body) ── */}
          <Section title="New Details" subtitle="Values to update" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="New Email" error={errors.newEmail} hint="Leave blank if not updating email">
              <input
                type="email"
                placeholder="new@example.com"
                value={form.newEmail}
                onChange={e => set('newEmail', e.target.value)}
                style={inp(errors.newEmail)}
              />
            </Field>

            <Field label="New Mobile Number" error={errors.newMobileNumber} hint="Leave blank if not updating mobile">
              <input
                placeholder="9876543210"
                value={form.newMobileNumber}
                onChange={e => set('newMobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                style={{ ...inp(errors.newMobileNumber), fontFamily: 'monospace', letterSpacing: '0.05em' }}
              />
            </Field>
          </div>

          {/* ── Options ── */}
          <Section title="Options" />

          <div className="grid gap-1.5">
            <button type="button" onClick={() => set('testUser', !form.testUser)}
              className="flex items-center gap-3 text-left w-fit">
              <span className="relative inline-block flex-shrink-0" style={{ width: 44, height: 24 }}>
                <span className="absolute inset-0 rounded-full transition-colors"
                  style={{
                    background:  form.testUser ? 'rgba(168,85,247,0.7)' : 'var(--input-bg)',
                    border:      '1.5px solid',
                    borderColor: form.testUser ? 'rgba(168,85,247,0.7)' : 'var(--border)',
                  }} />
                <span className="absolute rounded-full transition-transform"
                  style={{
                    width: 18, height: 18, top: 2, left: 2,
                    background: form.testUser ? '#fff' : 'var(--text-muted)',
                    transform:  `translateX(${form.testUser ? 20 : 0}px)`,
                  }} />
              </span>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Test User</span>
            </button>
            <p className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.65, paddingLeft: 56 }}>
              Toggle on if this update applies to a test user account.
            </p>
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={submitting}
              className="flex-1 py-3 rounded-xl text-sm font-black transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg,rgba(168,85,247,0.9),rgba(126,34,206,0.9))',
                color:      '#fff',
                boxShadow:  '0 4px 20px rgba(168,85,247,0.3)',
              }}>
              {submitting
                ? <><div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} /> Updating…</>
                : <><SendIcon /> Update Contact</>
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
