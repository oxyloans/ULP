import { useState, useEffect } from 'react';
import { getAdminBankDetails, saveBankDetails } from '../../api/afterlogin-admin';

// ─── Icons ────────────────────────────────────────────────────────────────────
const BankIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>;
const PlusIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const RefreshIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const CloseIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const CheckIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>;
const CopyIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;

const ACCOUNT_TYPES = ['SAVINGS', 'CURRENT', 'OVERDRAFT'];

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="transition-all hover:scale-110 flex-shrink-0"
      style={{ color: copied ? '#10b981' : 'var(--text-muted)' }}>
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

const inp = (err) => ({
  background: 'var(--input-bg)',
  border: `1.5px solid ${err ? '#ef4444' : 'var(--border)'}`,
  color: 'var(--text-primary)',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 13,
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
});

function Field({ label, required, error, children }) {
  return (
    <div className="grid gap-1.5">
      <label className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
        {label}{required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
      {error && <p className="text-xs font-medium" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  );
}

// ─── Add Account Modal ────────────────────────────────────────────────────────
function AddAccountModal({ onClose, onSaved }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    bankName: '', accountNumber: '', accountType: 'SAVINGS',
    ifscCode: '', branch: '', addBy: '', accountAddDate: today,
    companyName: '',
  });
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);
  const [saveErr, setSaveErr]   = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.bankName.trim())       e.bankName       = 'Bank name is required';
    if (!form.accountNumber.trim())  e.accountNumber  = 'Account number is required';
    if (!form.ifscCode.trim())       e.ifscCode       = 'IFSC code is required';
    if (!form.branch.trim())         e.branch         = 'Branch is required';
    if (!form.addBy.trim())          e.addBy          = 'Added by is required';
    if (!form.accountAddDate)        e.accountAddDate = 'Date is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true); setSaveErr('');
    try {
      await saveBankDetails(form);
      onSaved();
      onClose();
    } catch (err) {
      setSaveErr(err.message ?? 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.35)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(168,85,247,0.04)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}>
              <BankIcon />
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Add Bank Account</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Save a new admin bank account</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 grid gap-4 overflow-y-auto" style={{ maxHeight: '80vh' }}>

          {/* Company Name */}
          <Field label="Company Name" error={errors.companyName}>
            <input type="text" placeholder="e.g. OxyBricks Pvt Ltd"
              value={form.companyName} onChange={e => set('companyName', e.target.value)}
              style={inp(errors.companyName)} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Bank Name" required error={errors.bankName}>
              <input type="text" placeholder="e.g. HDFC Bank"
                value={form.bankName} onChange={e => set('bankName', e.target.value)}
                style={inp(errors.bankName)} />
            </Field>
            <Field label="Account Type" required>
              <select value={form.accountType} onChange={e => set('accountType', e.target.value)}
                style={{ ...inp(''), appearance: 'none', cursor: 'pointer' }}>
                {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Account Number" required error={errors.accountNumber}>
            <input type="text" placeholder="e.g. 50200012345678"
              value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)}
              style={{ ...inp(errors.accountNumber), fontFamily: "'JetBrains Mono', monospace" }} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="IFSC Code" required error={errors.ifscCode}>
              <input type="text" placeholder="e.g. HDFC0001234"
                value={form.ifscCode} onChange={e => set('ifscCode', e.target.value.toUpperCase())}
                style={{ ...inp(errors.ifscCode), fontFamily: "'JetBrains Mono', monospace" }} />
            </Field>
            <Field label="Branch" required error={errors.branch}>
              <input type="text" placeholder="e.g. Banjara Hills, Hyderabad"
                value={form.branch} onChange={e => set('branch', e.target.value)}
                style={inp(errors.branch)} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Added By" required error={errors.addBy}>
              <input type="text" placeholder="Admin name"
                value={form.addBy} onChange={e => set('addBy', e.target.value)}
                style={inp(errors.addBy)} />
            </Field>
            <Field label="Date Added" required error={errors.accountAddDate}>
              <input type="date" value={form.accountAddDate} onChange={e => set('accountAddDate', e.target.value)}
                style={inp(errors.accountAddDate)} />
            </Field>
          </div>

          {saveErr && (
            <p className="text-sm font-semibold px-3 py-2 rounded-xl"
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              {saveErr}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', boxShadow: '0 4px 14px rgba(168,85,247,0.4)' }}>
              {saving
                ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                : <PlusIcon />}
              {saving ? 'Saving…' : 'Save Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Account Card ─────────────────────────────────────────────────────────────
function AccountCard({ acc }) {
  const typeColor = { SAVINGS: '#10b981', CURRENT: '#6366f1', OVERDRAFT: '#f59e0b' };
  const color = typeColor[acc.accountType] ?? '#818cf8';

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--surface-card)', border: `1px solid ${color}22`, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
      {/* Top accent */}
      <div className="h-1" style={{ background: `linear-gradient(90deg,${color},${color}66)` }} />

      <div className="p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}14`, border: `1px solid ${color}25`, color }}>
              <BankIcon />
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{acc.bankName}</p>
              {acc.companyName && (
                <p className="text-xs font-semibold mt-0.5" style={{ color }}>
                  {acc.companyName}
                </p>
              )}
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{acc.branch}</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold flex-shrink-0"
            style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}>
            {acc.accountType}
          </span>
        </div>

        {/* Details */}
        <div className="grid gap-2">
          {[
            { label: 'Company',     value: acc.companyName,    mono: false, copy: false },
            { label: 'Account No.', value: acc.accountNumber,  mono: true,  copy: true  },
            { label: 'IFSC Code',   value: acc.ifscCode,       mono: true,  copy: true  },
            { label: 'Added By',    value: acc.addBy,          mono: false, copy: false },
            { label: 'Date Added',  value: acc.accountAddDate, mono: false, copy: false },
          ].filter(r => r.value).map(r => (
            <div key={r.label} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
              <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)', minWidth: 80 }}>{r.label}</span>
              <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
                <span className={`text-xs font-semibold truncate ${r.mono ? 'font-mono' : ''}`}
                  style={{ color: 'var(--text-primary)' }}>{r.value ?? '—'}</span>
                {r.copy && r.value && <CopyBtn text={r.value} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminBankAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true); setError('');
    try {
      const data = await getAdminBankDetails();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message ?? 'Failed to load accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const typeCount = (t) => accounts.filter(a => a.accountType === t).length;

  return (
    <>
      {showModal && <AddAccountModal onClose={() => setShowModal(false)} onSaved={fetchAccounts} />}

      <div className="grid gap-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Bank Accounts</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage admin bank accounts for fund transfers</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAccounts}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              <RefreshIcon /> Refresh
            </button>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', boxShadow: '0 4px 14px rgba(168,85,247,0.4)' }}>
              <PlusIcon /> Add Account
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Accounts', value: accounts.length,       color: '#a855f7' },
            { label: 'Savings',        value: typeCount('SAVINGS'),   color: '#10b981' },
            { label: 'Current',        value: typeCount('CURRENT'),   color: '#6366f1' },
            { label: 'Overdraft',      value: typeCount('OVERDRAFT'), color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-4 py-3"
              style={{ background: 'var(--surface-card)', border: `1px solid ${s.color}18`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Content */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-16 rounded-2xl"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading accounts…</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-12 rounded-2xl text-center"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold" style={{ color: '#ef4444' }}>{error}</p>
            <button onClick={fetchAccounts}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.25)' }}>
              <RefreshIcon /> Retry
            </button>
          </div>
        )}

        {!loading && !error && accounts.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 rounded-2xl text-center"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc' }}>
              <BankIcon />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>No bank accounts yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Add your first account to get started</p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', boxShadow: '0 4px 14px rgba(168,85,247,0.35)' }}>
              <PlusIcon /> Add Account
            </button>
          </div>
        )}

        {!loading && !error && accounts.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((acc, i) => <AccountCard key={acc.accountNumber ?? i} acc={acc} />)}
          </div>
        )}
      </div>
    </>
  );
}
