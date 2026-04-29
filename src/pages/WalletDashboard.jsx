import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDepositSlip, analyzeDepositSlip, getWalletBalance, getUserProfile, getAdminBankDetailsInfo } from '../api/afterlogin-user';

const USE_DUMMY = false; // wallet balance now fetched from real API

// ─── Icons ────────────────────────────────────────────────────────────────────
const WalletIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="18" cy="12" r="2"/></svg>;
const HistoryIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const UploadIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const FileIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const CheckIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>;
const ArrowRight  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const TrendUp     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

function fmtINR(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

// ─── Virtual Debit Card ───────────────────────────────────────────────────────
function VirtualCard({ data, profile }) {
  return (
    <div className="relative rounded-2xl p-6 overflow-hidden select-none"
      style={{
        background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)',
        boxShadow: '0 20px 60px rgba(99,102,241,0.35), 0 0 0 1px rgba(99,102,241,0.2)',
        minHeight: 200,
      }}>
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'rgba(129,140,248,0.15)', filter: 'blur(20px)' }} />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: 'rgba(99,102,241,0.2)', filter: 'blur(16px)' }} />

      {/* Top row */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
            <WalletIcon />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-white opacity-80">Oxy Wallet</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="live-dot" style={{ width: 6, height: 6 }} />
          <span className="text-xs font-semibold text-white opacity-70">Active</span>
        </div>
      </div>

      {/* User name + ID */}
      {/* <div className="relative mb-3">
        <p className="text-sm font-black text-white leading-tight">
          {profile?.name || profile?.fullName || '—'}
        </p>
        <p className="text-xs text-white opacity-50 mt-0.5">
          {profile?.email || profile?.userId || '—'}
        </p>
      </div> */}

      {/* Balance */}
      <div className="relative mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-white opacity-60 mb-1">Available Balance</p>
        <p className="text-4xl font-black text-white" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", letterSpacing: '-0.02em' }}>
          {fmtINR(data.availableBalance)}
        </p>
      </div>

      {/* Bottom stats */}
      <div className="relative grid grid-cols-3 gap-3">
        {[
          { label: 'Total Deposited', value: fmtINR(data.totalDeposited) },
          { label: 'Total Earnings',  value: fmtINR(data.totalEarnings)  },
          { label: 'Pending Credit',  value: fmtINR(data.pendingCredits) },
        ].map(s => (
          <div key={s.label}>
            <p className="text-xs text-white opacity-50 mb-0.5" style={{ fontSize: 9 }}>{s.label}</p>
            <p className="text-sm font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Deposit Slip Upload Form ─────────────────────────────────────────────────
function DepositSlipForm({ adminBanks }) {
  const [form, setForm] = useState({ amount: '', refId: '', date: '', bank: '', remarks: '', companyName: 'PINK SCOPE PROPERTIES' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileRef = useRef(null);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(parseInt(form.amount.replace(/,/g, ''), 10))) e.amount = 'Enter a valid amount';
    if (!form.date) e.date = 'Date is required';
    if (!file) e.file = 'Please upload a deposit slip';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError('');
    try {
      const amount = parseInt(form.amount.replace(/,/g, ''), 10);
      await uploadDepositSlip({
        file,
        transactionAmount: amount,
        transactionDate:   form.date,   // YYYY-MM-DD
        utrNumber:         form.refId,
        companyName:       form.companyName
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message ?? 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFile = async (f) => {
    if (!f) return;
    const allowed = f.type.startsWith('image/') || f.type === 'application/pdf';
    if (!allowed) return;
    setFile(f);
    setErrors(e => ({ ...e, file: '' }));
    setAnalysis(null);

    // Generate preview for images
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }

    // Auto-analyze via real API
    setAnalyzing(true);
    try {
      const result = await analyzeDepositSlip(f);
      setAnalysis(result);
      if (result.valid) {
        setForm(prev => ({
          ...prev,
          amount: typeof result.amount === 'number'
            ? result.amount.toLocaleString('en-IN')
            : String(result.amount ?? ''),
          refId:  result.refId  ?? prev.refId,
          date:   result.date   ?? prev.date,
        }));
      }
    } catch {
      setAnalysis({ valid: false, notes: 'Could not analyze slip. Please fill details manually.' });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  if (submitted) return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}>
        <CheckIcon />
      </div>
      <div>
        <p className="text-base font-black" style={{ color: 'var(--text-primary)' }}>Slip Submitted!</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your deposit slip is under review. Balance will be credited after admin approval.</p>
      </div>
      <button onClick={() => { setSubmitted(false); setForm({ amount: '', refId: '', date: '', bank: '', remarks: '', companyName: 'PINK SCOPE PROPERTIES' }); setFile(null); setPreview(null); setAnalysis(null); }}
        className="px-5 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
        style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
        Submit Another
      </button>
    </div>
  );

  const inputStyle = (key) => ({
    background: 'var(--input-bg)',
    border: `1.5px solid ${errors[key] ? '#ef4444' : 'var(--border)'}`,
    color: 'var(--text-primary)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    width: '100%',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  });

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Deposit Slip Upload</h3>

      {/* File dropzone */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Deposit Slip (Image / PDF)</label>
        <div
          onClick={() => fileRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all overflow-hidden"
          style={{
            border: `2px dashed ${errors.file ? '#ef4444' : file ? '#10b981' : 'var(--border)'}`,
            background: file ? 'rgba(16,185,129,0.05)' : 'var(--input-bg)',
            padding: preview ? 0 : '20px 16px',
            minHeight: 100,
          }}>
          {analyzing ? (
            <div className="flex flex-col items-center gap-2 py-5">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }} />
              <p className="text-xs font-semibold" style={{ color: '#818cf8' }}>Analyzing slip…</p>
            </div>
          ) : preview ? (
            <div className="relative w-full">
              <img src={preview} alt="Slip preview" className="w-full object-cover rounded-xl" style={{ maxHeight: 160 }} />
              <div className="absolute inset-0 flex items-end justify-center pb-2 rounded-xl"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}>
                <p className="text-xs font-semibold text-white">{file.name} · Click to replace</p>
              </div>
            </div>
          ) : file ? (
            <>
              <span style={{ color: '#10b981' }}><FileIcon /></span>
              <p className="text-sm font-semibold text-center" style={{ color: '#10b981' }}>{file.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB · Click to replace</p>
            </>
          ) : (
            <>
              <span style={{ color: 'var(--text-muted)' }}><UploadIcon /></span>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Drop file here or click to browse</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>JPG, PNG, PDF up to 10MB · Auto-fills form</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
          onChange={e => handleFile(e.target.files?.[0])} />
        {errors.file && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.file}</p>}
      </div>

      {/* Analysis result banner */}
      {analysis && (
        <div className="rounded-xl px-4 py-3 flex items-start gap-3"
          style={{
            background: analysis.valid ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)',
            border: `1px solid ${analysis.valid ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
          }}>
          <span className="text-lg flex-shrink-0">{analysis.valid ? '✅' : '⚠️'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold" style={{ color: analysis.valid ? '#10b981' : '#ef4444' }}>
              {analysis.valid ? `Slip Verified · ${analysis.confidence}% confidence` : 'Verification Failed'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{analysis.notes}</p>
            {analysis.valid && (
              <p className="text-xs mt-1 font-semibold" style={{ color: '#818cf8' }}>
                Fields auto-filled ↓ Please review before submitting.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Amount */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Amount (₹)</label>
        <input type="text" inputMode="numeric" placeholder="e.g. 50,000"
          value={form.amount}
          onChange={e => set('amount', e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ','))}
          style={{ ...inputStyle('amount'), fontFamily: "'JetBrains Mono', monospace" }} />
        {errors.amount && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.amount}</p>}
      </div>

      {/* Ref ID — UTR number */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
          UTR / Reference ID <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
        </label>
        <input type="text" placeholder="e.g. NEFT2025051001"
          value={form.refId} onChange={e => set('refId', e.target.value)}
          style={{ ...inputStyle('refId'), fontFamily: "'JetBrains Mono', monospace" }} />
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Transaction Date</label>
        <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
          style={inputStyle('date')} />
        {errors.date && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.date}</p>}
      </div>

      {/* Company Name */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Company Name
        </label>
        <select
          value={form.companyName}
          onChange={e => set('companyName', e.target.value)}
          style={{ ...inputStyle('companyName'), appearance: 'none', cursor: 'pointer' }}>
          <option value="">— Select company —</option>
          {(adminBanks ?? []).map((b, i) => (
            <option key={b.id ?? i} value={b.companyName ?? b.accountName ?? b.name}>
              {b.companyName ?? b.accountName ?? b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
          style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 flex-shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {submitError}
        </div>
      )}

      <button type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg,#6366f1,#4338ca)', color: '#fff', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}
        onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; }}>
        {submitting && (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
          </svg>
        )}
        {submitting ? 'Submitting…' : 'Submit Deposit Slip'}
      </button>
    </form>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function WalletDashboard() {
  const navigate = useNavigate();

  // Real wallet state — all zeros until API responds
  const [availableBalance, setAvailableBalance] = useState(null);
  const [totalDeposited,   setTotalDeposited]   = useState(null);
  const [totalEarnings,    setTotalEarnings]     = useState(null);
  const [pendingCredits,   setPendingCredits]    = useState(null);
  const [balanceLoading,   setBalanceLoading]    = useState(true);
  const [profile,          setProfile]           = useState(null);
  const [adminBanks,       setAdminBanks]        = useState([]);

  useEffect(() => {
    // Fetch wallet balance
    getWalletBalance()
      .then(raw => {
        if (raw && typeof raw.currentWalletAmount === 'number') {
          setAvailableBalance(raw.currentWalletAmount);
          const responses = Array.isArray(raw.walletResponses) ? raw.walletResponses : [];
          const credits   = responses.filter(r => (r.transactionType ?? '').toLowerCase() === 'credit');
          const debits    = responses.filter(r => (r.transactionType ?? '').toLowerCase() === 'debit');
          const pending   = responses.filter(r => !r.approvedBy);
          setTotalDeposited(credits.reduce((s, r) => s + (r.amount ?? 0), 0));
          setTotalEarnings(debits.reduce((s, r) => s + (r.amount ?? 0), 0));
          setPendingCredits(pending.reduce((s, r) => s + (r.amount ?? 0), 0));
        }
      })
      .catch(() => {})
      .finally(() => setBalanceLoading(false));

    // Fetch user profile
    getUserProfile()
      .then(p => { if (p) setProfile(p); })
      .catch(() => {});

    // Fetch admin bank details for company dropdown
    getAdminBankDetailsInfo()
      .then(data => { if (Array.isArray(data)) setAdminBanks(data); else if (data) setAdminBanks([data]); })
      .catch(() => {});
  }, []);

  // Build display object — null means "loading / unknown"
  const data = {
    availableBalance: availableBalance ?? 0,
    totalDeposited:   totalDeposited   ?? 0,
    totalEarnings:    totalEarnings    ?? 0,
    pendingCredits:   pendingCredits   ?? 0,
  };

  return (
    <div className="grid gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Wallet</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage your funds and deposit slips</p>
        </div>
        <button onClick={() => navigate('/wallet/history')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105"
          style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          <HistoryIcon /> Transaction History <ArrowRight />
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left: virtual card + quick stats */}
        <div className="grid gap-5 content-start">
          {balanceLoading ? (
            <div className="rounded-2xl shimmer-bg" style={{ minHeight: 200 }} />
          ) : (
            <VirtualCard data={data} profile={profile} />
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Available Balance', value: balanceLoading ? '…' : fmtINR(data.availableBalance), color: '#6366f1', Icon: WalletIcon },
              { label: 'Total Deposited',   value: balanceLoading ? '…' : fmtINR(data.totalDeposited),   color: '#10b981', Icon: TrendUp   },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-4"
                style={{ background: 'var(--surface-card)', border: `1px solid ${s.color}18`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: `${s.color}14`, border: `1px solid ${s.color}25`, color: s.color }}>
                    <s.Icon />
                  </div>
                </div>
                <p className="text-xl font-extrabold" style={{ color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* View history CTA */}
          <button onClick={() => navigate('/wallet/history')}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all"
            style={{
              background: 'var(--surface-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--row-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-card)'; e.currentTarget.style.transform = ''; }}>
            <HistoryIcon />
            View Full Transaction History
            <ArrowRight />
          </button>
        </div>

        {/* Right: deposit slip form */}
        <div className="rounded-2xl p-5"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <DepositSlipForm adminBanks={adminBanks} />
        </div>
      </div>
    </div>
  );
}
