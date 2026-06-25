import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDepositSlip, analyzeDepositSlip, getWalletBalance, getUserProfile, getAdminBankDetailsInfo, walletWithdrawal, getWalletWithdrawalRequests } from '../api/afterlogin-user';
import { formatINR } from '../utils/currency';

const WalletIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="18" cy="12" r="2"/></svg>;
const HistoryIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const UploadIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const FileIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const CheckIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>;
const ArrowRight  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const TrendUp     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

function fmtINR(n) { return formatINR(n ?? 0); }

function normalizeRequests(res) {
  return Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.withdrawalRequests) ? res.withdrawalRequests : [];
}

function VirtualCard({ data }) {
  return (
    <div className="relative rounded-2xl p-6 overflow-hidden select-none" style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)', boxShadow: '0 20px 60px rgba(99,102,241,0.35), 0 0 0 1px rgba(99,102,241,0.2)', minHeight: 200 }}>
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'rgba(129,140,248,0.15)', filter: 'blur(20px)' }} />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'rgba(99,102,241,0.2)', filter: 'blur(16px)' }} />
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}><WalletIcon /></div>
          <span className="text-xs font-bold uppercase tracking-widest text-white opacity-80">Oxy Wallet</span>
        </div>
        <div className="flex items-center gap-1"><span className="live-dot" style={{ width: 6, height: 6 }} /><span className="text-xs font-semibold text-white opacity-70">Active</span></div>
      </div>
      <div className="relative mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-white opacity-60 mb-1">Available Balance</p>
        <p className="text-4xl font-black text-white" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", letterSpacing: '-0.02em' }}>{fmtINR(data.availableBalance)}</p>
      </div>
      <div className="relative grid grid-cols-3 gap-3">
        {[{ label: 'Total Deposited', value: fmtINR(data.totalDeposited) },].map(s => (
          <div key={s.label}><p className="text-xs text-white opacity-50 mb-0.5" style={{ fontSize: 9 }}>{s.label}</p><p className="text-sm font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</p></div>
        ))}
      </div>
    </div>
  );
}

function DepositSlipForm({ adminBanks }) {
  const [form, setForm] = useState({ amount: '', refId: '', date: '', companyName: 'PINK SCOPE PROPERTIES' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileRef = useRef(null);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };
  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(parseInt(form.amount.replace(/,/g, ''), 10))) e.amount = 'Enter a valid amount';
    if (!form.refId) e.refId = 'Reference ID is required';
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
      await uploadDepositSlip({ file, transactionAmount: parseInt(form.amount.replace(/,/g, ''), 10), transactionDate: form.date, utrNumber: form.refId, companyName: form.companyName });
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
    if (f.type.startsWith('image/')) setPreview(URL.createObjectURL(f)); else setPreview(null);
    setAnalyzing(true);
    try {
      const result = await analyzeDepositSlip(f);
      if (result?.valid) {
        setForm(prev => ({ ...prev, amount: typeof result.amount === 'number' ? result.amount.toLocaleString('en-IN') : String(result.amount ?? ''), refId: result.refId ?? prev.refId, date: result.date ?? prev.date }));
      }
    } catch {}
    finally { setAnalyzing(false); }
  };

  if (submitted) return <div className="flex flex-col items-center justify-center gap-4 py-10 text-center"><div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}><CheckIcon /></div><div><p className="text-base font-black" style={{ color: 'var(--text-primary)' }}>Slip Submitted!</p><p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your deposit slip is under review. Balance will be credited after admin approval.</p></div></div>;

  const inputStyle = (key) => ({ background: 'var(--input-bg)', border: `1.5px solid ${errors[key] ? '#ef4444' : 'var(--border)'}`, color: 'var(--text-primary)', borderRadius: 10, padding: '10px 14px', fontSize: 13, width: '100%', outline: 'none', fontFamily: 'inherit' });

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Deposit Slip Upload</h3>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Deposit Slip (Image / PDF)</label>
        <div onClick={() => fileRef.current?.click()} onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }} onDragOver={e => e.preventDefault()} className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all overflow-hidden" style={{ border: `2px dashed ${errors.file ? '#ef4444' : file ? '#10b981' : 'var(--border)'}`, background: file ? 'rgba(16,185,129,0.05)' : 'var(--input-bg)', padding: preview ? 0 : '20px 16px', minHeight: 100 }}>
          {analyzing ? <p className="text-xs font-semibold" style={{ color: '#818cf8' }}>Analyzing slip…</p> : preview ? <img src={preview} alt="Slip preview" className="w-full object-cover rounded-xl" style={{ maxHeight: 160 }} /> : file ? <><span style={{ color: '#10b981' }}><FileIcon /></span><p className="text-sm font-semibold text-center" style={{ color: '#10b981' }}>{file.name}</p></> : <><span style={{ color: 'var(--text-muted)' }}><UploadIcon /></span><p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Drop file here or click to browse</p></>}
        </div>
        <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
      </div>
      <div><label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Amount (₹)</label><input type="text" inputMode="numeric" value={form.amount} onChange={e => set('amount', e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ','))} style={{ ...inputStyle('amount'), fontFamily: "'JetBrains Mono', monospace" }} /></div>
      <div><label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>UTR / Reference ID</label><input type="text" value={form.refId} onChange={e => set('refId', e.target.value)} style={{ ...inputStyle('refId'), fontFamily: "'JetBrains Mono', monospace" }} /></div>
      <div><label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Transaction Date</label><input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inputStyle('date')} /></div>
      <div><label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Company Name</label><select value={form.companyName} onChange={e => set('companyName', e.target.value)} style={{ ...inputStyle('companyName'), appearance: 'none', cursor: 'pointer' }}>{(adminBanks ?? []).map((b, i) => <option key={b.id ?? i} value={b.companyName ?? b.accountName ?? b.name}>{b.companyName ?? b.accountName ?? b.name}</option>)}</select></div>
      {submitError && <p className="text-xs" style={{ color: '#ef4444' }}>{submitError}</p>}
      <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl font-black text-sm transition-all disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#6366f1,#4338ca)', color: '#fff' }}>{submitting ? 'Submitting…' : 'Submit Deposit Slip'}</button>
    </form>
  );
}

function WithdrawalModal({ open, onClose, availableBalance, requests, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const pendingRequests = useMemo(() => requests.filter(r => {
    const s = String(r?.status ?? r?.walletStatus ?? '').toUpperCase();
    return s !== 'APPROVED' && s !== 'REJECTED';
  }), [requests]);
  const pendingAmount = pendingRequests.reduce((sum, r) => sum + Number(r?.amount ?? 0), 0);
  const remainingWithdrawable = Math.max(0, Number(availableBalance ?? 0) - pendingAmount);

  useEffect(() => {
    if (!open) {
      setAmount('');
      setError('');
      setSuccess('');
    }
  }, [open]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    const clean = Number(String(amount).replace(/,/g, ''));
    if (!clean || clean <= 0) return setError('Enter a valid withdrawal amount.');
    if (Number(availableBalance ?? 0) <= 0) return setError('No wallet balance available for withdrawal.');
    if (pendingRequests.length > 0) return setError('You already have a pending withdrawal request. Wait for approval/rejection.');
    if (clean > Number(availableBalance ?? 0)) return setError('Withdrawal amount exceeds available balance.');
    if (clean > remainingWithdrawable) return setError(`You can withdraw up to ${fmtINR(remainingWithdrawable)} after considering pending requests.`);

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await walletWithdrawal(clean);
      setSuccess('Withdrawal request raised successfully.');
      onSuccess?.();
      setAmount('');
    } catch (err) {
      setError(err?.message ?? 'Failed to raise withdrawal request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(2,6,23,0.55)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg rounded-3xl overflow-hidden" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 30px 80px rgba(2,6,23,0.45)' }}>
        <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg,#0f172a,#1d4ed8)' }}>
          <div className="flex items-center justify-between"><h3 className="text-lg font-black text-white">Wallet Withdraw</h3><button onClick={onClose} className="text-white text-sm font-bold">Close</button></div>
          <p className="text-xs mt-1 text-blue-100">Smart checks enabled for balance, raised requests and remaining limit.</p>
        </div>
        <div className="p-6 grid gap-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl p-3" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}><p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Balance</p><p className="text-sm font-bold" style={{ color: '#0ea5e9' }}>{fmtINR(availableBalance)}</p></div>
            <div className="rounded-xl p-3" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}><p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Pending</p><p className="text-sm font-bold" style={{ color: '#f59e0b' }}>{fmtINR(pendingAmount)}</p></div>
            <div className="rounded-xl p-3" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}><p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Remaining</p><p className="text-sm font-bold" style={{ color: '#10b981' }}>{fmtINR(remainingWithdrawable)}</p></div>
          </div>
          <form onSubmit={submit} className="grid gap-3">
            <input type="text" inputMode="numeric" placeholder="Enter withdrawal amount" value={amount} onChange={e => { setAmount(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')); setError(''); }} style={{ background: 'var(--input-bg)', border: '1.5px solid var(--border)', color: 'var(--text-primary)', borderRadius: 12, padding: '12px 14px', fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }} />
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', color: '#fff' }}>{loading ? 'Submitting…' : 'Raise Withdrawal Request'}</button>
          </form>
          {error && <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>{error}</p>}
          {success && <p className="text-xs font-semibold" style={{ color: '#10b981' }}>{success}</p>}
        </div>
      </div>
    </div>
  );
}

export default function WalletDashboard() {
  const navigate = useNavigate();
  const [availableBalance, setAvailableBalance] = useState(null);
  const [totalDeposited, setTotalDeposited] = useState(null);
  const [totalEarnings, setTotalEarnings] = useState(null);
  const [pendingCredits, setPendingCredits] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [adminBanks, setAdminBanks] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  const loadWithdrawalRequests = async () => {
    try {
      setWithdrawalRequests(normalizeRequests(await getWalletWithdrawalRequests()));
    } catch {
      setWithdrawalRequests([]);
    }
  };

  useEffect(() => {
    getWalletBalance().then(raw => {
      if (raw && typeof raw.currentWalletAmount === 'number') {
        setAvailableBalance(raw.currentWalletAmount);
        const responses = Array.isArray(raw.walletResponses) ? raw.walletResponses : [];
        const credits = responses.filter(r => (r.transactionType ?? '').toLowerCase() === 'credit');
        const debits = responses.filter(r => (r.transactionType ?? '').toLowerCase() === 'debit');
        const pending = responses.filter(r => !r.approvedBy);
        setTotalDeposited(credits.reduce((s, r) => s + (r.amount ?? 0), 0));
        setTotalEarnings(debits.reduce((s, r) => s + (r.amount ?? 0), 0));
        setPendingCredits(pending.reduce((s, r) => s + (r.amount ?? 0), 0));
      }
    }).catch(() => {}).finally(() => setBalanceLoading(false));
    getUserProfile().catch(() => {});
    getAdminBankDetailsInfo().then(data => { if (Array.isArray(data)) setAdminBanks(data); else if (data) setAdminBanks([data]); }).catch(() => {});
    loadWithdrawalRequests();
  }, []);

  const approvedCount = withdrawalRequests.filter(r => String(r?.status ?? r?.walletStatus ?? '').toUpperCase() === 'APPROVED').length;
  const raisedCount = withdrawalRequests.length;
  const data = { availableBalance: availableBalance ?? 0, totalDeposited: totalDeposited ?? 0, totalEarnings: totalEarnings ?? 0, pendingCredits: pendingCredits ?? 0 };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Wallet</h1><p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage your funds and deposit slips</p></div>
        <button onClick={() => navigate('/wallet/history')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105" style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}><HistoryIcon /> Transaction History <ArrowRight /></button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-5 content-start">
          {balanceLoading ? <div className="rounded-2xl shimmer-bg" style={{ minHeight: 200 }} /> : <VirtualCard data={data} />}
          {/* <div className="grid grid-cols-2 gap-4">
            {[{ label: 'Available Balance', value: balanceLoading ? '…' : fmtINR(data.availableBalance), color: '#6366f1', Icon: WalletIcon }, { label: 'Total Deposited', value: balanceLoading ? '…' : fmtINR(data.totalDeposited), color: '#10b981', Icon: TrendUp }].map(s => (
              <div key={s.label} className="rounded-2xl p-4" style={{ background: 'var(--surface-card)', border: `1px solid ${s.color}18`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}><div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}14`, border: `1px solid ${s.color}25`, color: s.color }}><s.Icon /></div><p className="text-xl font-extrabold" style={{ color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</p><p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p></div>
            ))}
          </div> */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={() => navigate('/wallet/history')} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all" style={{ background: 'var(--surface-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}><HistoryIcon />Transaction History</button>
            <button onClick={() => setWithdrawModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all" style={{ background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', color: '#fff', border: '1px solid rgba(37,99,235,0.4)', boxShadow: '0 8px 20px rgba(37,99,235,0.28)' }}><WalletIcon />Wallet Withdraw</button>
            <button onClick={() => navigate('/wallet/withdrawal-requests')} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all" style={{ background: 'var(--surface-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}><TrendUp />Raised Requests ({raisedCount}/{approvedCount})</button>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <DepositSlipForm adminBanks={adminBanks} />
        </div>
      </div>

      <WithdrawalModal
        open={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        availableBalance={data.availableBalance}
        requests={withdrawalRequests}
        onSuccess={loadWithdrawalRequests}
      />
    </div>
  );
}
