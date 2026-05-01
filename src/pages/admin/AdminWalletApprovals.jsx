import { useState, useEffect } from 'react';
import { getWalletSlips, approveWalletSlip, rejectWalletSlip } from '../../api/afterlogin-admin';
import FilePreviewModal from '../../components/FilePreviewModal';

// ─── Icons ────────────────────────────────────────────────────────────────────
const CheckIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const EyeIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const CloseIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const WalletIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="18" cy="12" r="2"/></svg>;
const RefreshIcon= () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;

function fmtINR(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);
}

// ─── Map API response → internal shape ───────────────────────────────────────
// walletStatus: UPLOADED | APPROVED | REJECTED | REVIEW
const STATUS_MAP = { UPLOADED: 'REVIEW', APPROVED: 'APPROVE', REJECTED: 'REJECT', REVIEW: 'REVIEW' };

function mapTxn(raw, idx) {
  return {
    id:                  raw.documentId ?? `TXN-${idx}`,
    userId:              raw.userId ?? '',
    userName:            ((raw.userName ?? '').trim()) || (raw.userId ?? '—'),
    description:         raw.utrNumber ? `Deposit · UTR ${raw.utrNumber}` : 'Deposit Slip',
    date:                raw.transactionDate ?? '—',
    amount:              raw.transactionAmount ?? 0,
    status:              STATUS_MAP[raw.walletStatus] ?? 'REVIEW',
    rawStatus:           raw.walletStatus,
    utrNumber:           raw.utrNumber ?? null,
    documentId:          raw.documentId ?? null,
    slipUrl:             raw.transactionSlipUrl ?? null,
    hasSlip:             !!raw.transactionSlipUrl,
    fundTransferCompany: raw.fundTransferompany ?? raw.fundTransferCompany ?? null,
  };
}

const STATUS_CONFIG = {
  APPROVE: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', label: 'Approved'  },
  REJECT:  { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', label: 'Rejected'  },
  REVIEW:  { bg: '#fef3c7', text: '#d97706', border: '#fde68a', label: 'In Review', pulse: true },
};

function StatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.REVIEW;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
      {cfg.pulse
        ? <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.text, animation: 'livePulse 1.5s infinite' }} />
        : <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.text }} />}
      {cfg.label}
    </span>
  );
}

// ─── Admin names for "Approved By" dropdown ───────────────────────────────────
const ADMIN_NAMES = ['subbu', 'admin', 'ravi', 'priya', 'vikram'];

// ─── Confirmation Modal ───────────────────────────────────────────────────────
function ConfirmModal({ txn, action, onConfirm, onCancel, loading }) {
  const isApprove = action === 'approve';
  const [approvedBy, setApprovedBy] = useState(ADMIN_NAMES[0]);
  const [comments, setComments]     = useState(isApprove ? 'Approved by admin' : 'Rejected by admin');
  const [utrRef, setUtrRef]         = useState(txn.utrNumber ?? '');

  const accentColor = isApprove ? '#059669' : '#dc2626';
  const accentBg    = isApprove ? '#ecfdf5' : '#fef2f2';
  const accentBorder= isApprove ? '#a7f3d0' : '#fecaca';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.35)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)', background: `${accentColor}08` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: accentBg, border: `1px solid ${accentBorder}`, color: accentColor }}>
              {isApprove ? <CheckIcon /> : <XIcon />}
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                {isApprove ? 'Approve Deposit' : 'Reject Deposit'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {fmtINR(txn.amount)} · {txn.date}
              </p>
            </div>
          </div>
          <button onClick={onCancel}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 grid gap-4">

          {/* UTR / Ref Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--text-muted)' }}>
              UTR / Ref Number
              {txn.utrNumber && (
                <span className="ml-2 normal-case font-semibold px-1.5 py-0.5 rounded-md"
                  style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)', fontSize: 10 }}>
                  pre-filled
                </span>
              )}
            </label>
            <input
              type="text"
              value={utrRef}
              onChange={e => setUtrRef(e.target.value)}
              placeholder="Enter UTR or reference number"
              className="w-full rounded-xl text-sm font-mono outline-none"
              style={{
                padding: '10px 14px',
                background: 'var(--input-bg)',
                border: `1.5px solid ${utrRef ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                color: 'var(--text-primary)',
                letterSpacing: '0.04em',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--text-muted)' }}>Approved By</label>
            <select value={approvedBy} onChange={e => setApprovedBy(e.target.value)}
              className="w-full rounded-xl text-sm font-semibold outline-none"
              style={{ padding: '10px 14px', background: 'var(--input-bg)', border: '1.5px solid var(--border)', color: 'var(--text-primary)', appearance: 'none', cursor: 'pointer' }}>
              {ADMIN_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--text-muted)' }}>Comments</label>
            <textarea value={comments} onChange={e => setComments(e.target.value)}
              rows={3} placeholder="Add a comment…"
              className="w-full rounded-xl text-sm outline-none resize-none"
              style={{ padding: '10px 14px', background: 'var(--input-bg)', border: '1.5px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'inherit' }} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Cancel
          </button>
          <button onClick={() => onConfirm({ approvedBy, comments, utrNumber: utrRef.trim() })}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: isApprove ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', boxShadow: `0 4px 14px ${accentColor}40` }}>
            {loading
              ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
              : isApprove ? <><CheckIcon /> Confirm Approve</> : <><XIcon /> Confirm Reject</>}
          </button>
        </div>
      </div>
    </div>
  );
}


export default function AdminWalletApprovals() {
  const [txns, setTxns]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [fetchErr, setFetchErr] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [slipUrl, setSlipUrl]   = useState(null);
  const [tab, setTab]           = useState('REVIEW');
  const [confirmModal, setConfirmModal] = useState(null);

  const fetchSlips = async () => {
    setLoading(true); setFetchErr('');
    try {
      const raw = await getWalletSlips();
      setTxns((Array.isArray(raw) ? raw : []).map(mapTxn));
    } catch (err) { setFetchErr(err.message ?? 'Failed to load.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSlips(); }, []);

  const handleConfirm = async ({ approvedBy, comments, utrNumber }) => {
    if (!confirmModal) return;
    const { txn, action } = confirmModal;
    setActionLoading(true);
    try {
      const payload = {
        utrNumber: utrNumber || txn.utrNumber,   // use modal value (editable), fallback to txn
        transactionAmount: txn.amount,
        transactionDate: txn.date.includes('/') ? txn.date.split('/').reverse().join('-') : txn.date,
        approvedBy, comments,
      };
      if (action === 'approve') {
        await approveWalletSlip(payload);
        setTxns(prev => prev.map(t => t.id === txn.id ? { ...t, status: 'APPROVE', rawStatus: 'APPROVED' } : t));
      } else {
        await rejectWalletSlip(payload);
        setTxns(prev => prev.map(t => t.id === txn.id ? { ...t, status: 'REJECT', rawStatus: 'REJECTED' } : t));
      }
      setConfirmModal(null);
    } catch (err) { console.error(err.message); }
    finally { setActionLoading(false); }
  };

  const tabs = [
    { key: 'REVIEW',  label: 'Pending',  color: '#d97706' },
    { key: 'APPROVE', label: 'Approved', color: '#059669' },
    { key: 'REJECT',  label: 'Rejected', color: '#dc2626' },
    { key: 'ALL',     label: 'All',      color: '#6366f1' },
  ];
  const filtered = tab === 'ALL' ? txns : txns.filter(t => t.status === tab);

  // Detect duplicate UTR numbers across ALL transactions
  const utrCounts = {};
  txns.forEach(t => { if (t.utrNumber) utrCounts[t.utrNumber] = (utrCounts[t.utrNumber] || 0) + 1; });
  const isDuplicateUtr = (utr) => utr && utrCounts[utr] > 1;
  const counts = {
    REVIEW:  txns.filter(t => t.status === 'REVIEW').length,
    APPROVE: txns.filter(t => t.status === 'APPROVE').length,
    REJECT:  txns.filter(t => t.status === 'REJECT').length,
    ALL:     txns.length,
  };
  const totalPending = txns.filter(t => t.status === 'REVIEW').reduce((s, t) => s + t.amount, 0);

  return (
    <>
      {slipUrl && <FilePreviewModal url={slipUrl} name="Deposit Slip" onClose={() => setSlipUrl(null)} />}
      {confirmModal && (
        <ConfirmModal
          txn={confirmModal.txn}
          action={confirmModal.action}
          loading={actionLoading}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      <div className="grid gap-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Wallet Approvals</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Review and approve user deposit slips</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchSlips}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              <RefreshIcon /> Refresh
            </button>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <WalletIcon />
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Pending Credit</p>
                <p className="text-base font-black" style={{ color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>{fmtINR(totalPending)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {tabs.map(t => (
            <div key={t.key} onClick={() => setTab(t.key)}
              className="rounded-xl px-4 py-3 cursor-pointer transition-all hover:scale-[1.02]"
              style={{ background: 'var(--surface-card)', border: `1px solid ${tab === t.key ? t.color + '50' : t.color + '18'}`, boxShadow: tab === t.key ? `0 0 16px ${t.color}18` : '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p className="text-2xl font-extrabold" style={{ color: t.color }}>{counts[t.key]}</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl w-fit"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{ background: tab === t.key ? `linear-gradient(135deg,${t.color},${t.color}cc)` : 'transparent', color: tab === t.key ? '#fff' : 'var(--text-muted)', boxShadow: tab === t.key ? `0 2px 8px ${t.color}40` : 'none' }}>
              {t.label} · {counts[t.key]}
            </button>
          ))}
        </div>

        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          {loading && (
            <div className="flex items-center justify-center gap-3 py-16">
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading slips…</span>
            </div>
          )}
          {!loading && fetchErr && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm font-semibold" style={{ color: '#ef4444' }}>{fetchErr}</p>
              <button onClick={fetchSlips} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.25)' }}>
                <RefreshIcon /> Retry
              </button>
            </div>
          )}
          {!loading && !fetchErr && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--input-bg)' }}>
                    {['User', 'Description', 'Amount', 'Date', 'Fund Transfer To', 'Status', 'Slip', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No transactions in this category</td></tr>
                  ) : filtered.map(txn => {
                    const isDup = isDuplicateUtr(txn.utrNumber);
                    return (
                    <tr key={txn.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        outline: isDup ? '2px solid rgba(239,68,68,0.5)' : 'none',
                        outlineOffset: '-1px',
                        background: isDup ? 'rgba(239,68,68,0.03)' : 'transparent',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = isDup ? 'rgba(239,68,68,0.06)' : 'var(--row-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = isDup ? 'rgba(239,68,68,0.03)' : 'transparent'}>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: 'rgba(168,85,247,0.12)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>
                            {(txn.userName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{txn.userName}</p>
                            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>…{txn.userId.slice(-4)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{txn.description}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{txn.rawStatus}</p>
                          {isDup && (
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                              style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.3)' }}>
                              ⚠ Duplicate UTR
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-extrabold" style={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>+{fmtINR(txn.amount)}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{txn.date}</td>
                      <td className="py-3.5 px-4">
                        {txn.fundTransferCompany
                          ? <span className="text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap"
                              style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706', border: '1px solid rgba(245,158,11,0.25)' }}>
                              {txn.fundTransferCompany}
                            </span>
                          : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td className="py-3.5 px-4"><StatusChip status={txn.status} /></td>
                      <td className="py-3.5 px-4">
                        {txn.hasSlip
                          ? <button onClick={() => setSlipUrl(txn.slipUrl)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                              style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
                              <EyeIcon /> View
                            </button>
                          : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        {txn.status === 'REVIEW' ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => setConfirmModal({ txn, action: 'approve' })}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                              style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                              <CheckIcon /> Approve
                            </button>
                            <button onClick={() => setConfirmModal({ txn, action: 'reject' })}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                              <XIcon /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                            {txn.status === 'APPROVE' ? '✓ Approved' : txn.status === 'REJECT' ? '✕ Rejected' : '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
