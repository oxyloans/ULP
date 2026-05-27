import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { get, patch, getUserId, getToken } from '../api/client';
import { BASE_URL } from '../api/client';
import { useProfile as useProfileContext } from '../context/ProfileContext';

// ─── Icons ────────────────────────────────────────────────────────────────────
const EditIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const CheckIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>;
const SpinIcon    = () => <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>;
const EyeIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const UserIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const PhoneIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const MapPinIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const CalIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const BankIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>;
const CardIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const ArrowLeft   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const ShieldIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inputStyle = (err) => ({
  background: 'var(--input-bg)',
  border: `1.5px solid ${err ? '#ef4444' : 'var(--border)'}`,
  color: 'var(--text-primary)',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 13,
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
});

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  );
}

function InfoRow({ icon, label, value, mono }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="mt-0.5 flex-shrink-0" style={{ color: '#818cf8' }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-sm font-semibold break-words" style={{ color: 'var(--text-primary)', fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</p>
      </div>
    </div>
  );
}

function Badge({ verified, label }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
      style={verified
        ? { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }
        : { background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }
      }>
      {verified ? <CheckIcon /> : '⚠'}
      {label}
    </span>
  );
}

function fmtDob(dob) {
  if (!dob) return '';
  const [y, m, d] = dob.split('-');
  if (!y || !m || !d || parseInt(y) < 1900) return '';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d} ${months[parseInt(m) - 1]} ${y}`;
}

// ══════════════════════════════════════════════════════════════════════════════
// PROFILE VIEW
// ══════════════════════════════════════════════════════════════════════════════
function ProfileView({ profile, onEdit, onEditBank, onEditPan }) {
  const initials = `${(profile.firstName ?? '')[0] ?? ''}${(profile.lastName ?? '')[0] ?? ''}`.toUpperCase();
  const fullName = `${(profile.firstName ?? '').trim()} ${(profile.lastName ?? '').trim()}`.trim();

  return (
    <div className="grid gap-5">
      {/* Hero card */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#1e1b4b 100%)',
          boxShadow: '0 20px 60px rgba(99,102,241,0.25)',
        }}>
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
          style={{ background: 'rgba(129,140,248,0.15)', filter: 'blur(20px)' }} />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full pointer-events-none"
          style={{ background: 'rgba(99,102,241,0.2)', filter: 'blur(16px)' }} />

        <div className="relative flex items-center gap-4 flex-wrap">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl font-black text-white"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            {initials || <UserIcon />}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-white leading-tight">{fullName || '—'}</h2>
            <p className="text-sm text-white opacity-60 mt-0.5">{profile.email || '—'}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge verified={profile.panVerified}  label={profile.panVerified  ? 'PAN Verified'  : 'PAN Pending'} />
              <Badge verified={profile.bankVerified} label={profile.bankVerified ? 'Bank Verified' : 'Bank Pending'} />
            </div>
          </div>

          <button onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105 flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
            <EditIcon /> Edit Profile
          </button>
        </div>
      </div>

      {/* Two-column info grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Personal details */}
        <div className="rounded-2xl p-5"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Personal Info</p>
            <button onClick={onEdit} className="flex items-center gap-1 text-xs font-bold transition-opacity hover:opacity-80" style={{ color: '#818cf8' }}>
              <EditIcon /> Edit
            </button>
          </div>
          <InfoRow icon={<MailIcon />}   label="Email"          value={profile.email} />
          <InfoRow icon={<PhoneIcon />}  label="Mobile"         value={profile.mobileNumber} />
          <InfoRow icon={<CalIcon />}    label="Date of Birth"  value={fmtDob(profile.dob)} />
          <InfoRow icon={<UserIcon />}   label="Gender"         value={profile.gender} />
          <InfoRow icon={<MapPinIcon />} label="Address"        value={profile.address} />
          <InfoRow icon={<MapPinIcon />} label="City / State"   value={[profile.city, profile.state].filter(Boolean).join(', ')} />
          <InfoRow icon={<MapPinIcon />} label="Pincode"        value={profile.pinCode} />
          <InfoRow icon={<MapPinIcon />} label="Country"        value={profile.country} />
        </div>

        {/* KYC details */}
        <div className="grid gap-5 content-start">
          {/* Bank */}
          <div className="rounded-2xl p-5"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                  <BankIcon />
                </div>
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Bank Account</p>
              </div>
              <button onClick={onEditBank} className="flex items-center gap-1 text-xs font-bold" style={{ color: '#818cf8' }}>
                <EditIcon /> {profile.bankVerified ? 'Update' : 'Add'}
              </button>
            </div>
            {profile.bankVerified ? (
              <div className="flex items-center gap-2">
                <Badge verified label="Verified" />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Bank account linked</span>
              </div>
            ) : (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No bank account linked. Add one to enable withdrawals.</p>
            )}
          </div>

          {/* PAN */}
          <div className="rounded-2xl p-5"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                  <CardIcon />
                </div>
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>PAN Card</p>
              </div>
              <button onClick={onEditPan} className="flex items-center gap-1 text-xs font-bold" style={{ color: '#818cf8' }}>
                <EditIcon /> {profile.panVerified ? 'Update' : 'Verify'}
              </button>
            </div>
            {profile.panVerified && profile.panNumber ? (
              <div className="flex items-center gap-3">
                <Badge verified label="Verified" />
                <span className="text-sm font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                  {profile.panNumber.slice(0, 2)}{'•'.repeat(6)}{profile.panNumber.slice(-2)}
                </span>
              </div>
            ) : (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>PAN not verified. Verify to unlock full features.</p>
            )}
          </div>

          {/* Security */}
          <div className="rounded-2xl p-5"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                <ShieldIcon />
              </div>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Account Security</p>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Email verified</span>
                <Badge verified={profile.emailVerified} label={profile.emailVerified ? 'Yes' : 'No'} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>WhatsApp verified</span>
                <Badge verified={!!profile.whatsappVerified} label={profile.whatsappVerified ? 'Yes' : 'No'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EDIT PERSONAL INFO
// ══════════════════════════════════════════════════════════════════════════════
function EditPersonalInfo({ profile, onBack, onSaved }) {
  const userId = getUserId();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const today = new Date().toISOString().slice(0, 10);
  const hasExistingMobileNumber = !!(profile.mobileNumber ?? '').trim();

  const [form, setForm] = useState({
    firstName:    (profile.firstName    ?? '').trim(),
    lastName:     (profile.lastName     ?? '').trim(),
    dob:          (() => { const d = profile.dob ?? ''; return d && parseInt(d.split('-')[0]) >= 1900 ? d : ''; })(),
    gender:       profile.gender       ?? '',
    address:      profile.address      ?? '',
    city:         profile.city         ?? '',
    state:        profile.state        ?? '',
    pinCode:      profile.pinCode      ?? '',
    country:      profile.country      ?? '',
    email:        profile.email        ?? '',
    mobileNumber: profile.mobileNumber ?? '',
  });

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.firstName) e.firstName = 'Required';
    if (!form.lastName)  e.lastName  = 'Required';
    if (!form.dob) {
      e.dob = 'Required';
    } else {
      const dobDate = new Date(form.dob);
      if (Number.isNaN(dobDate.getTime())) {
        e.dob = 'Enter a valid date';
      } else if (form.dob > today) {
        e.dob = 'Date of birth cannot be in the future';
      }
    }
    if (!form.gender)    e.gender    = 'Required';
    if (!form.address?.trim()) {
      e.address = 'Required';
    } else if (form.address.trim().length < 5) {
      e.address = 'Address is too short';
    }
    if (!form.city)      e.city      = 'Required';
    if (!form.state)     e.state     = 'Required';
    if (!form.pinCode)   e.pinCode   = 'Required';
    if (!form.country)   e.country   = 'Required';
    const normalizedMobile = (form.mobileNumber ?? '').replace(/\D/g, '');
    if (!form.mobileNumber?.trim()) {
      e.mobileNumber = 'Mobile number is missing';
    } else if (normalizedMobile.length < 7 || normalizedMobile.length > 15) {
      e.mobileNumber = 'Enter a valid mobile number';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error('Please fill all required details');
      return;
    }
    setSaving(true);
    try {
      await patch('/student-service/user/profile/update', {
        ...form, consent: true, designation: '', message: '', organization: '', userId,
      });
      toast.success('Profile updated');
      onSaved({ ...profile, ...form });
    } catch (err) {
      toast.error(err.message ?? 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <ArrowLeft />
        </button>
        <div>
          <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>Edit Personal Info</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Update your personal details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" error={errors.firstName}>
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)} style={inputStyle(errors.firstName)} placeholder="John" />
            </Field>
            <Field label="Last Name" error={errors.lastName}>
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)} style={inputStyle(errors.lastName)} placeholder="Doe" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date of Birth" error={errors.dob}>
              <input
                type="date"
                value={form.dob}
                max={today}
                onChange={e => set('dob', e.target.value)}
                style={inputStyle(errors.dob)}
              />
            </Field>
            <Field label="Gender" error={errors.gender}>
              <select value={form.gender} onChange={e => set('gender', e.target.value)} style={inputStyle(errors.gender)}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>
          </div>

          <Field label="Address" error={errors.address}>
            <textarea value={form.address} onChange={e => set('address', e.target.value)}
              style={{ ...inputStyle(errors.address), resize: 'vertical', minHeight: 72 }}
              placeholder="Street address" />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="City" error={errors.city}>
              <input value={form.city} onChange={e => set('city', e.target.value)} style={inputStyle(errors.city)} placeholder="City" />
            </Field>
            <Field label="State" error={errors.state}>
              <input value={form.state} onChange={e => set('state', e.target.value)} style={inputStyle(errors.state)} placeholder="State" />
            </Field>
            <Field label="Pincode" error={errors.pinCode}>
              <input value={form.pinCode} onChange={e => set('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))} style={inputStyle(errors.pinCode)} placeholder="560001" />
            </Field>
          </div>

          <Field label="Country" error={errors.country}>
            <input value={form.country} onChange={e => set('country', e.target.value)} style={inputStyle(errors.country)} placeholder="India" />
          </Field>

          {/* Read-only */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email (read-only)">
              <input value={form.email} readOnly style={{ ...inputStyle(false), opacity: 0.5, cursor: 'not-allowed' }} />
            </Field>
            <Field label={hasExistingMobileNumber ? 'Mobile (read-only)' : 'Mobile'} error={errors.mobileNumber}>
              <input
                type="tel"
                value={form.mobileNumber}
                readOnly={hasExistingMobileNumber}
                onChange={e => !hasExistingMobileNumber && set('mobileNumber', e.target.value.slice(0, 20))}
                style={{
                  ...inputStyle(errors.mobileNumber),
                  opacity: hasExistingMobileNumber ? 0.5 : 1,
                  cursor: hasExistingMobileNumber ? 'not-allowed' : 'text',
                }}
              />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onBack}
              className="px-5 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#6366f1,#4338ca)', color: '#fff', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}>
              {saving ? <SpinIcon /> : <CheckIcon />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EDIT BANK DETAILS
// ══════════════════════════════════════════════════════════════════════════════
function EditBankDetails({ profile, onBack, onSaved }) {
  const userId = getUserId();
  const [savedAccount, setSavedAccount] = useState('');
  const [savedIfsc,    setSavedIfsc]    = useState('');
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showAccNum,   setShowAccNum]   = useState(false);
  const [showInput,    setShowInput]    = useState(false);

  const [form, setForm] = useState({
    accountNumber: '', confirmAccountNumber: '', ifscCode: '',
  });
  const [errors,      setErrors]      = useState({});
  const [verifying,   setVerifying]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [details,     setDetails]     = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    get(`/oxybrick-service/fee/BasedOnUserId?userId=${userId}`)
      .then(data => { setSavedAccount(data.accountNumber ?? ''); setSavedIfsc(data.ifsc ?? ''); })
      .catch(() => {})
      .finally(() => setFetchLoading(false));
  }, [userId]);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const verifyBank = async () => {
    const e = {};
    if (!form.accountNumber)                                  e.accountNumber        = 'Required';
    if (!form.ifscCode)                                       e.ifscCode             = 'Required';
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode)) e.ifscCode             = 'Invalid IFSC (e.g. SBIN0001234)';
    if (form.accountNumber !== form.confirmAccountNumber)     e.confirmAccountNumber = 'Account numbers do not match';
    if (Object.keys(e).length) { setErrors(e); return; }

    setVerifying(true);
    try {
      const res = await import('axios').then(m => m.default({
        method: 'post',
        url: `${BASE_URL}/notification-service/send/verifyBankAccountAndIfsc?bankAccount=${form.accountNumber}&ifscCode=${form.ifscCode}`,
        headers: { Authorization: `Bearer ${getToken()}` },
      }));
      const d = res.data;
      if (d.accountStatus === 'INVALID' || d.accountStatus === 'UNABLE_TO_VALIDATE') {
        toast.error(`${d.accountStatus}: ${d.message}`);
      } else {
        setDetails(d.data);
        setShowDetails(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const saveBank = async () => {
    setSaving(true);
    try {
      await import('axios').then(m => m.default({
        method: 'patch',
        url: `${BASE_URL}/oxybrick-service/fee/update-bankaccount?account_number=${form.accountNumber}&ifsc=${form.ifscCode}&user_id=${userId}`,
        headers: { Authorization: `Bearer ${getToken()}` },
      }));
      toast.success('Bank details saved');
      onSaved({ ...profile, bankVerified: true });
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Save failed');
      setSaving(false);
    }
  };

  const maskedAccount = savedAccount
    ? '•'.repeat(Math.max(0, savedAccount.length - 4)) + savedAccount.slice(-4)
    : '';

  return (
    <div className="grid gap-6 max-w-lg">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <ArrowLeft />
        </button>
        <div>
          <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>Bank Details</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Link or update your bank account</p>
        </div>
      </div>

      {/* ── Currently linked account ── */}
      {fetchLoading ? (
        <div className="h-20 rounded-2xl shimmer-bg" />
      ) : savedAccount ? (
        <div className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(16,185,129,0.3)', background: 'linear-gradient(135deg,rgba(16,185,129,0.06),rgba(16,185,129,0.02))' }}>
          <div className="px-5 py-4 flex items-center gap-4">
            {/* icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
              <BankIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: '#10b981' }}>
                Currently Linked Account
              </p>
              <p className="text-sm font-bold font-mono tracking-wider" style={{ color: 'var(--text-primary)' }}>
                {showAccNum ? savedAccount : maskedAccount}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>IFSC: {savedIfsc}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button type="button" onClick={() => setShowAccNum(v => !v)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                {showAccNum ? <EyeOffIcon /> : <EyeIcon />}
              </button>
              {!showInput && (
                <button type="button" onClick={() => setShowInput(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                  style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                  Update
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Form ── */}
      {(!savedAccount || showInput) && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

          {/* form header strip */}
          <div className="px-5 py-3 flex items-center gap-2"
            style={{ borderBottom: '1px solid var(--border)', background: 'rgba(99,102,241,0.03)' }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
              <BankIcon />
            </div>
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              {savedAccount ? 'Update Account' : 'Add Account'}
            </span>
          </div>

          <div className="p-5 grid gap-4">
            {/* Account Number */}
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Account Number</label>
              <div className="relative">
                <input
                  type="password"
                  value={form.accountNumber}
                  onChange={e => set('accountNumber', e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter account number"
                  style={{
                    ...inputStyle(errors.accountNumber),
                    paddingLeft: '2.75rem',
                  }}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: 'var(--text-primary)' }}>
                  <CardIcon />
                </span>
              </div>
              {errors.accountNumber && (
                <p className="text-xs font-medium" style={{ color: '#f87171' }}>{errors.accountNumber}</p>
              )}
            </div>

            {/* Confirm Account Number */}
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Confirm Account Number</label>
              <div className="relative">
                <input
                  value={form.confirmAccountNumber}
                  onChange={e => set('confirmAccountNumber', e.target.value.replace(/\D/g, ''))}
                  placeholder="Re-enter account number"
                  style={{
                    ...inputStyle(errors.confirmAccountNumber),
                    paddingLeft: '2.75rem',
                  }}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: 'var(--text-primary)' }}>
                  <CardIcon />
                </span>
              </div>
              {errors.confirmAccountNumber && (
                <p className="text-xs font-medium" style={{ color: '#f87171' }}>{errors.confirmAccountNumber}</p>
              )}
            </div>

            {/* IFSC Code */}
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>IFSC Code</label>
              <div className="relative">
                <input
                  value={form.ifscCode}
                  onChange={e => set('ifscCode', e.target.value.toUpperCase())}
                  placeholder="e.g. SBIN0001234"
                  maxLength={11}
                  style={{
                    ...inputStyle(errors.ifscCode),
                    paddingLeft: '2.75rem',
                    fontFamily: 'monospace',
                    letterSpacing: '0.08em',
                  }}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: 'var(--text-primary)' }}>
                  <ShieldIcon />
                </span>
              </div>
              {errors.ifscCode && (
                <p className="text-xs font-medium" style={{ color: '#f87171' }}>{errors.ifscCode}</p>
              )}
            </div>

            {/* Verified details panel */}
            {showDetails && details && (
              <div className="rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(16,185,129,0.3)', background: 'linear-gradient(135deg,rgba(16,185,129,0.06),rgba(16,185,129,0.02))' }}>
                <div className="px-4 py-2.5 flex items-center gap-2"
                  style={{ borderBottom: '1px solid rgba(16,185,129,0.15)' }}>
                  <span style={{ color: '#10b981' }}><CheckIcon /></span>
                  <p className="text-xs font-bold" style={{ color: '#10b981' }}>Account Verified</p>
                </div>
                <div className="px-4 py-3 grid gap-2">
                  {Object.entries(details).map(([k, v]) => v ? (
                    <div key={k} className="flex items-center justify-between gap-4">
                      <span className="text-xs capitalize" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                        {k.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-xs font-semibold text-right" style={{ color: 'var(--text-primary)' }}>{v}</span>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button type="button" onClick={showInput ? () => setShowInput(false) : onBack}
                className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
                style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
              {!showDetails ? (
                <button type="button" onClick={verifyBank} disabled={verifying}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#4338ca)', color: '#fff', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}>
                  {verifying ? <SpinIcon /> : <ShieldIcon />}
                  {verifying ? 'Verifying…' : 'Verify Account'}
                </button>
              ) : (
                <button type="button" onClick={saveBank} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}>
                  {saving ? <SpinIcon /> : <CheckIcon />}
                  {saving ? 'Saving…' : 'Save Bank Details'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EDIT PAN CARD
// ══════════════════════════════════════════════════════════════════════════════
function EditPanCard({ profile, onBack, onSaved }) {
  const userId = getUserId();
  const [panNumber,     setPanNumber]     = useState(profile.panNumber.trim() ?? '');
  const [name,          setName]          = useState(`${(profile.firstName ?? '').trim()} ${(profile.lastName ?? '').trim()}`.trim());
  const [panError,      setPanError]      = useState('');
  const [nameError,     setNameError]     = useState('');
  const [confirmModal,  setConfirmModal]  = useState(false);
  const [confirmLoader, setConfirmLoader] = useState(false);
  const [verifyLoader,  setVerifyLoader]  = useState(false);
  const [apiError,      setApiError]      = useState('');

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  const handleCheck = async () => {
    let ok = true;
    if (!name.trim())               { setNameError('Name is required'); ok = false; }
    if (!panNumber)                 { setPanError('PAN number is required'); ok = false; }
    else if (!panRegex.test(panNumber)) { setPanError('Invalid PAN (e.g. ABCDE1234F)'); ok = false; }
    if (!ok) return;

    setConfirmLoader(true); setApiError('');
    try {
      const res = await import('axios').then(m => m.default.get(
        `${BASE_URL}/notification-service/send/verifyPan?name=${encodeURIComponent(name)}&pan=${panNumber}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      ));
      if (res.data.valid === 'true' || res.data.valid === true) {
        setConfirmModal(true);
      } else {
        setApiError('PAN verification failed. Please check the details.');
      }
    } catch (err) {
      setApiError(err.response?.data?.error ?? 'PAN verification failed');
    } finally {
      setConfirmLoader(false);
    }
  };

  const handleSave = async () => {
    setVerifyLoader(true);
    try {
      await import('axios').then(m => m.default.patch(
        `${BASE_URL}/auth-service/user/update-address?address=${encodeURIComponent(profile.address ?? '')}&mobileNumber=${profile.mobileNumber ?? ''}&panNumber=${panNumber}`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      ));
      toast.success('PAN verified successfully');
      onSaved({ ...profile, panVerified: true, panNumber });
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'PAN update failed');
      setConfirmModal(false);
    } finally {
      setVerifyLoader(false);
    }
  };

  return (
    <div className="grid gap-6 max-w-lg">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <ArrowLeft />
        </button>
        <div>
          <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>PAN Card</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {profile.panVerified ? 'Update your PAN details' : 'Verify your PAN card'}
          </p>
        </div>
      </div>

      {/* ── Currently verified PAN ── */}
      {profile.panVerified && profile.panNumber && (
        <div className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(16,185,129,0.3)', background: 'linear-gradient(135deg,rgba(16,185,129,0.06),rgba(16,185,129,0.02))' }}>
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
              <CardIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: '#10b981' }}>
                Verified PAN
              </p>
              <p className="text-sm font-bold font-mono tracking-widest" style={{ color: 'var(--text-primary)' }}>
                {profile.panNumber.slice(0, 2)}{'•'.repeat(6)}{profile.panNumber.slice(-2)}
              </p>
            </div>
            <Badge verified label="Verified" />
          </div>
        </div>
      )}

      {/* ── Form ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

        {/* form header strip */}
        <div className="px-5 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(99,102,241,0.03)' }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
            <CardIcon />
          </div>
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {profile.panVerified ? 'Update PAN' : 'Verify PAN'}
          </span>
        </div>

        <div className="p-5 grid gap-4">
          {/* Name */}
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Name (as on PAN)</label>
            <div className="relative">
              <input
                value={name}
                onChange={e => { setName(e.target.value.toUpperCase()); setNameError(''); }}
                placeholder="JOHN DOE"
                style={{ ...inputStyle(!!nameError), paddingLeft: '2.75rem' }}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: 'var(--text-primary)' }}>
                <UserIcon />
              </span>
            </div>
            {nameError && <p className="text-xs font-medium" style={{ color: '#f87171' }}>{nameError}</p>}
          </div>

          {/* PAN Number */}
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>PAN Number</label>
            <div className="relative">
              <input
                value={panNumber.trim()}
                onChange={e => { setPanNumber(e.target.value.toUpperCase()); setPanError(''); setApiError(''); }}
                placeholder="ABCDE1234F"
                maxLength={10}
                style={{
                  ...inputStyle(!!panError),
                  paddingLeft: '2.75rem',
                  fontFamily: 'monospace',
                  letterSpacing: '0.12em',
                }}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: 'var(--text-primary)' }}>
                <ShieldIcon />
              </span>
            </div>
            {panError && <p className="text-xs font-medium" style={{ color: '#f87171' }}>{panError}</p>}
          </div>

          {/* API error */}
          {apiError && (
            <div className="px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold"
              style={{ color: '#dc2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)' }}>
              <span className="text-base">⚠</span> {apiError}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onBack}
              className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Cancel
            </button>
            <button type="button" onClick={handleCheck} disabled={confirmLoader}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#6366f1,#4338ca)', color: '#fff', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}>
              {confirmLoader ? <SpinIcon /> : <ShieldIcon />}
              {confirmLoader ? 'Checking…' : 'Verify PAN'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Confirm modal ── */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl overflow-hidden w-full max-w-sm"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

            {/* modal header */}
            <div className="px-5 py-4 flex items-center gap-3"
              style={{ borderBottom: '1px solid var(--border)', background: 'rgba(99,102,241,0.03)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                <CardIcon />
              </div>
              <div>
                <p className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>Confirm PAN Details</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Review before saving</p>
              </div>
            </div>

            {/* modal body */}
            <div className="p-5 grid gap-4">
              <div className="rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--border)', background: 'var(--input-bg)' }}>
                <div className="flex items-center justify-between px-4 py-2.5"
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Name</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>PAN Number</span>
                  <span className="text-xs font-bold font-mono tracking-widest" style={{ color: 'var(--text-primary)' }}>{panNumber}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleSave} disabled={verifyLoader}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>
                  {verifyLoader ? <SpinIcon /> : <CheckIcon />}
                  {verifyLoader ? 'Saving…' : 'Confirm & Save'}
                </button>
                <button onClick={() => setConfirmModal(false)} disabled={verifyLoader}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT — Profile Page
// ══════════════════════════════════════════════════════════════════════════════
export default function Profile() {
  const userId = getUserId();
  const profileCtx = useProfileContext();
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  // view | edit-personal | edit-bank | edit-pan
  const [screen,   setScreen]   = useState('view');

  useEffect(() => {
    get(`/student-service/user/profile?id=${userId}`)
      .then(data => setProfile(data))
      .catch(() => setProfile({}))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div className="grid gap-5">
      <div className="h-8 w-48 rounded-xl shimmer-bg" />
      <div className="h-36 rounded-2xl shimmer-bg" />
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="h-64 rounded-2xl shimmer-bg" />
        <div className="grid gap-5">
          <div className="h-28 rounded-2xl shimmer-bg" />
          <div className="h-28 rounded-2xl shimmer-bg" />
        </div>
      </div>
    </div>
  );

  // Page title (only shown on view screen)
  return (
    <div className="grid gap-1">
      {screen === 'view' && (
        <div className="mb-4">
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Your account details and KYC status</p>
        </div>
      )}

      {screen === 'view' && (
        <ProfileView
          profile={profile}
          onEdit={() => setScreen('edit-personal')}
          onEditBank={() => setScreen('edit-bank')}
          onEditPan={() => setScreen('edit-pan')}
        />
      )}

      {screen === 'edit-personal' && (
        <EditPersonalInfo
          profile={profile}
          onBack={() => setScreen('view')}
          onSaved={(updated) => { setProfile(updated); profileCtx?.refresh?.(); setScreen('view'); }}
        />
      )}

      {screen === 'edit-bank' && (
        <div className="flex justify-center">
          <div className="w-full max-w-lg">
            <EditBankDetails
              profile={profile}
              onBack={() => setScreen('view')}
              onSaved={(updated) => { setProfile(updated); profileCtx?.refresh?.(); setScreen('view'); }}
            />
          </div>
        </div>
      )}

      {screen === 'edit-pan' && (
        <div className="flex justify-center">
          <div className="w-full max-w-lg">
            <EditPanCard
              profile={profile}
              onBack={() => setScreen('view')}
              onSaved={(updated) => { setProfile(updated); profileCtx?.refresh?.(); setScreen('view'); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
