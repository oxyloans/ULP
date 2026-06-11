import { useState, useEffect, useCallback } from 'react';
import { getAllMigratedUsers, approveMigratedUser } from '../../api/afterlogin-admin';

const APPROVED_BY_OPTIONS = ['SUBBU', 'ADMIN'];
const PAGE_SIZE = 20;
const EXCLUDED_USER_IDS = new Set(['d70aeb27-9800-4a2a-ac56-54648554db92']);

// ─── Icons ────────────────────────────────────────────────────────────────────
const MigrateIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const RefreshIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
const CloseIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const SearchIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const CopyIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const TickIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>;
const ChevLeft   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevRight  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>;
const ChevDown   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="6 9 12 15 18 9"/></svg>;

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = (e) => {
    e.stopPropagation();
    if (!text || text === '—') return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button onClick={handle} title={copied ? 'Copied!' : 'Copy'}
      className="inline-flex items-center justify-center w-5 h-5 rounded transition-all hover:scale-110 flex-shrink-0"
      style={{ background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(168,85,247,0.1)', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(168,85,247,0.2)'}`, color: copied ? '#10b981' : '#c084fc' }}>
      {copied ? <TickIcon /> : <CopyIcon />}
    </button>
  );
}

// ─── Consent chip ─────────────────────────────────────────────────────────────
function ConsentChip({ value }) {
  const yes = String(value ?? '').toLowerCase() === 'yes';
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: yes ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: yes ? '#10b981' : '#ef4444', border: `1px solid ${yes ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: yes ? '#10b981' : '#ef4444' }} />
      {yes ? 'Yes' : 'No'}
    </span>
  );
}

// ─── Approve / Reject confirmation modal ─────────────────────────────────────
function ApproveConfirmModal({ user, onConfirm, onCancel, loading, error }) {
  const [approvedBy, setApprovedBy] = useState('');
  const [action,     setAction]     = useState('APPROVED');
  const [touched,    setTouched]    = useState(false);

  const isApprove = action === 'APPROVED';

  const handleConfirm = () => {
    setTouched(true);
    if (!approvedBy) return;
    onConfirm(approvedBy, action);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}>
      <div className="rounded-2xl overflow-hidden w-full max-w-sm"
        style={{ background: 'var(--surface-card)', border: `1px solid ${isApprove ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}
        onClick={e => e.stopPropagation()}>

        {/* Icon + title */}
        <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: isApprove ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${isApprove ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
            {isApprove
              ? <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            }
          </div>
          <div>
            <h3 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {isApprove ? 'Confirm Approval' : 'Confirm Rejection'}
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {isApprove ? 'Approve' : 'Reject'} migration for
            </p>
            <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {user.userName ?? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>No name</span>}
              {user.lenderId && <span className="font-mono ml-1.5 text-xs" style={{ color: '#c084fc' }}>({user.lenderId})</span>}
            </p>
          </div>
        </div>

        {/* Action toggle */}
        <div className="mx-6 mb-4 flex gap-1.5 p-1 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
          {[{ key: 'APPROVED', label: '✓ Approve', color: '#10b981' }, { key: 'CANCELLED', label: '✕ Reject', color: '#ef4444' }].map(opt => (
            <button key={opt.key} onClick={() => setAction(opt.key)}
              className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
              style={{
                background: action === opt.key ? opt.color : 'transparent',
                color:      action === opt.key ? '#fff' : 'var(--text-muted)',
                boxShadow:  action === opt.key ? `0 2px 8px ${opt.color}40` : 'none',
              }}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* By dropdown */}
        <div className="mx-6 mb-4 grid gap-1.5">
          <label className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
            {isApprove ? 'Approved' : 'Rejected'} By <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div className="relative">
            <select
              value={approvedBy}
              onChange={e => { setApprovedBy(e.target.value); setTouched(false); }}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer transition-all"
              style={{
                background: 'var(--input-bg)',
                border: `1px solid ${touched && !approvedBy ? '#ef4444' : 'rgba(168,85,247,0.3)'}`,
                color: approvedBy ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: touched && !approvedBy ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none',
              }}>
              <option value="" disabled>Select person…</option>
              {APPROVED_BY_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              <ChevDown />
            </span>
          </div>
          {touched && !approvedBy && (
            <p className="text-xs" style={{ color: '#ef4444' }}>Please select a person</p>
          )}
        </div>

        {/* API error */}
        {error && (
          <div className="mx-6 mb-4 px-4 py-2.5 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-40"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2"
            style={{
              background: isApprove ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)',
              color: '#fff',
              boxShadow: isApprove ? '0 4px 14px rgba(16,185,129,0.35)' : '0 4px 14px rgba(239,68,68,0.35)',
            }}>
            {loading && <span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />}
            {loading ? 'Submitting…' : isApprove ? 'Yes, Approve' : 'Yes, Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inline approve button (table row) ───────────────────────────────────────
function InlineApproveBtn({ user, onApproved }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [approving,   setApproving]   = useState(false);
  const [approveErr,  setApproveErr]  = useState('');
  const [approved,    setApproved]    = useState(false);

  const handleConfirm = async (approvedBy, migrationStatus) => {
    setApproving(true);
    setApproveErr('');
    console.log('Approving with:', { userId: user.userId, approvedBy, migrationStatus, id:user.id});
    try {
      await approveMigratedUser(user.userId, approvedBy, migrationStatus,user.id);
      setApproved(migrationStatus);
      setShowConfirm(false);
      onApproved?.(user.userId, migrationStatus, approvedBy,user.id);
    } catch (e) {
      setApproveErr(e.message ?? 'Approval failed.');
    } finally {
      setApproving(false);
    }
  };

  if (approved) {
    const isApproved = approved === 'APPROVED';
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{
          background: isApproved ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          color:      isApproved ? '#10b981' : '#ef4444',
          border:     `1px solid ${isApproved ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
        }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: isApproved ? '#10b981' : '#ef4444' }} />
        {isApproved ? 'Approved' : 'Rejected'}
      </span>
    );
  }

  return (
    <>
      <button
        disabled={user.migrationStatus === "APPROVED" || user.migrationStatus === "CANCELLED"}
        title={user.migrationStatus ? 'Already processed' : 'Approve migration'}
        onClick={e => { e.stopPropagation(); setApproveErr(''); setShowConfirm(true); }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
        style={{ background: user.migrationStatus === "APPROVED" ? 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(16,185,129,0.08))' : user.migrationStatus === "CANCELLED" ? 'linear-gradient(135deg,rgba(239,68,68,0.2),rgba(239,68,68,0.08))' : 'linear-gradient(135deg,rgba(0,0,0,0.2),rgba(0,0,0,0.08))', color: user.migrationStatus === "APPROVED" ? '#10b981' : user.migrationStatus === "CANCELLED" ? '#ef4444' : '#000', border: user.migrationStatus === "APPROVED" || user.migrationStatus === "CANCELLED" ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(0,0,0,0.3)', boxShadow: '0 2px 8px rgba(16,185,129,0.15)' }}>
        {user.migrationStatus === "APPROVED"  ? 'Already processed' : user.migrationStatus === "CANCELLED" ? 'Cancelled' : 'Approve migration'}
      </button>
      {showConfirm && (
        <ApproveConfirmModal
          user={user}
          onConfirm={handleConfirm}
          onCancel={() => { setShowConfirm(false); setApproveErr(''); }}
          loading={approving}
          error={approveErr}
        />
      )}
    </>
  );
}

// ─── Detail drawer ────────────────────────────────────────────────────────────
function DetailDrawer({ user, onClose, onApproved }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [approving,   setApproving]   = useState(false);
  const [approveErr,  setApproveErr]  = useState('');
  const [approved,    setApproved]    = useState(false);

  if (!user) return null;

  const rows = [
    { label: 'User ID',           value: user.userId           ?? '—', copy: true  },
    { label: 'Lender ID',         value: user.lenderId         ?? '—', copy: true  },
    { label: 'Username',          value: user.userName         ?? '—', copy: false },
    { label: 'Mobile Number',     value: user.mobileNumber     ?? '—', copy: false },
    { label: 'Migration Status',  value: user.migrationStatus  ?? '—', copy: false },
    { label: 'Migration Consent', value: user.migrationConsent ?? '—', copy: false },
    { label: 'Approved By',       value: user.approvedBy       || '—', copy: false },
    { label: 'Migrated On',       value: user.migratedDate ?? user.migratedOn ?? user.createdDate ?? '—', copy: false },
  ];

  const handleConfirm = async (approvedBy, migrationStatus) => {
    setApproving(true);
    setApproveErr('');
    console.log('Approving with:', { userId: user.userId, approvedBy, migrationStatus ,id:user.id});
    try {
      await approveMigratedUser(user.userId, approvedBy, migrationStatus,user.id);
      setApproved(migrationStatus);
      setShowConfirm(false);
      onApproved?.(user.userId, migrationStatus, approvedBy,user.id);
      setTimeout(() => onClose(), 800);
    } catch (e) {
      setApproveErr(e.message ?? 'Approval failed. Please try again.');
    } finally {
      setApproving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}>
        <div className="w-full max-w-sm h-full flex flex-col overflow-y-auto"
          style={{ background: 'var(--surface-card)', borderLeft: '1px solid rgba(168,85,247,0.25)', boxShadow: '-8px 0 40px rgba(0,0,0,0.3)' }}
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border)', background: 'rgba(168,85,247,0.05)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
                style={{ background: 'linear-gradient(135deg,rgba(168,85,247,0.3),rgba(168,85,247,0.1))', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
                {(user.userName ?? '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user.userName ?? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>No name</span>}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Migration Details</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <CloseIcon />
            </button>
          </div>

          {/* Fields */}
          <div className="p-5 grid gap-3">
            {rows.map(({ label, value, copy }) => (
              <div key={label} className="rounded-xl px-4 py-3"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                <p className="text-xs uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                {label === 'Migration Consent' ? (
                  <ConsentChip value={value} />
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold break-all flex-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
                    {copy && value !== '—' && <CopyBtn text={value} />}
                  </div>
                )}
              </div>
            ))}

            {/* Approve button */}
            <div className="pt-1">
              {approved ? (
                (() => {
                  const isApproved = approved === 'APPROVED';
                  // const isRejected = approved === 'CANCELLED';
                  return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold"
                      style={{
                        background: isApproved ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color:      isApproved ? '#10b981' : '#ef4444',
                        border:     `1px solid ${isApproved ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                      }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: isApproved ? '#10b981' : '#ef4444' }} />
                      {isApproved ? 'Approved' : 'Rejected'}
                    </span>
                  );
                })()
              ) : (
                <button onClick={() => { setApproveErr(''); setShowConfirm(true); }}
                  disabled = {approved === "APPROVED" || user.migrationStatus === "CANCELLED"}
                  className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.01]"
                  style={{ background: user.migrationStatus === "APPROVED" ? 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(16,185,129,0.08))' : user.migrationStatus === "CANCELLED" ? 'linear-gradient(135deg,rgba(239,68,68,0.2),rgba(239,68,68,0.08))' : 'linear-gradient(135deg,rgba(0,0,0,0.2),rgba(0,0,0,0.08))', color: user.migrationStatus === "APPROVED" ? '#10b981' : user.migrationStatus === "CANCELLED" ? '#ef4444' : '#000', border: '1px solid rgba(16,185,129,0.3)', boxShadow: user.migrationStatus === "APPROVED" ? '0 2px 10px rgba(16,185,129,0.15)' : '0 2px 10px rgba(160, 2, 2, 0.15)' }}>
                   {user.migrationStatus === "APPROVED" ? 'Already processed' : user.migrationStatus === "CANCELLED" ? 'Cancelled' : 'Approve migration'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ApproveConfirmModal
          user={user}
          onConfirm={handleConfirm}
          onCancel={() => { setShowConfirm(false); setApproveErr(''); }}
          loading={approving}
          error={approveErr}
        />
      )}
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminMigratedUsers() {
  const [allData,    setAllData]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [page,       setPage]       = useState(0);
  const [selected,   setSelected]   = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');
  const [statusView, setStatusView] = useState('REQUESTED');

  const load = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    getAllMigratedUsers()
      .then(res => {
        const list = Array.isArray(res) ? res : res?.data ?? res?.users ?? res?.content ?? [];
        setAllData(list.filter(u => !EXCLUDED_USER_IDS.has(u?.userId)));
        setPage(0);
      })
      .catch(e => setError(e.message ?? 'Failed to load migrated users'))
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Search filter ─────────────────────────────────────────────────────────
  const getBucket = (status) => {
    const normalized = String(status ?? '').toUpperCase();
    if (normalized === 'APPROVED') return 'APPROVED';
    if (normalized === 'CANCELLED' || normalized === 'REJECTED') return 'CANCELLED';
    return 'REQUESTED';
  };

  const bucketedCounts = allData.reduce((acc, u) => {
    const key = getBucket(u?.migrationStatus);
    acc[key] += 1;
    return acc;
  }, { REQUESTED: 0, APPROVED: 0, CANCELLED: 0 });

  const q = search.trim().toLowerCase();
  const filtered = allData
    .filter(u => getBucket(u?.migrationStatus) === statusView)
    .filter(u => {
      if (!q) return true;
      return Object.values(u).some(v =>
        v !== null && v !== undefined && String(v).toLowerCase().includes(q)
      );
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSearch  = (val) => { setSearch(val); setPage(0); };
  const handleApproved = (userId, migrationStatus, approvedBy,id) => {
    setAllData(prev =>
      prev.map(u =>
        u.userId === userId
          ? { ...u, migrationStatus, approvedBy: approvedBy ?? u.approvedBy, id }
          : u
      )
    );
    setSelected(prev =>
      prev?.userId === userId
        ? { ...prev, migrationStatus, approvedBy: approvedBy ?? prev.approvedBy, id }
        : prev
    );
  };

  const cols = ['#', 'Username', 'Lender ID', 'Mobile', 'User ID', 'Status', 'Consent', 'Migrated On', 'Action'];

  const getCell = (u, col, idx) => {
    switch (col) {
      case '#':
        return <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>{page * PAGE_SIZE + idx + 1}</span>;
      case 'Username':
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.25)' }}>
              {(u.userName ?? '?').charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {u.userName ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}
            </span>
          </div>
        );
      case 'Lender ID':
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>
              {u.lenderId ?? '—'}
            </span>
            {u.lenderId && <CopyBtn text={u.lenderId} />}
          </div>
        );
      case 'Mobile':
        return <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>{u.mobileNumber ?? '—'}</span>;
      case 'User ID':
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
              {u.userId ? `${u.userId.slice(0, 8)}…` : '—'}
            </span>
            {u.userId && <CopyBtn text={u.userId} />}
          </div>
        );
      case 'Status': {
        const s = (u.migrationStatus ?? '').toUpperCase();
        const style = s === 'APPROVED'
          ? { bg: 'rgba(16,185,129,0.1)',  color: '#10b981', border: 'rgba(16,185,129,0.25)'  }
          : s === 'REJECTED' || s === 'CANCELLED'
          ? { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444', border: 'rgba(239,68,68,0.25)'   }
          : { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b', border: 'rgba(245,158,11,0.25)'  };
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: style.color }} />
            {u.migrationStatus ?? '—'}
          </span>
        );
      }
      case 'Consent':
        return <ConsentChip value={u.migrationConsent} />;
      case 'Migrated On':
        return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.migratedDate ?? u.migratedOn ?? u.createdDate ?? '—'}</span>;
      case 'Action':
        return (
          <div onClick={e => e.stopPropagation()}>
            <InlineApproveBtn user={u} onApproved={handleApproved} />
          </div>
        );
      default:
        return '—';
    }
  };

  return (
    <div className="grid gap-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }}>
            <MigrateIcon />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#c084fc' }}>Admin</p>
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Migrated Users</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {allData.length > 0 && (
            <div className="px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.25)' }}>
              {allData.length.toLocaleString('en-IN')} migrated
            </div>
          )}
          <button onClick={() => load(true)} disabled={refreshing}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <span className={refreshing ? 'animate-spin' : ''}><RefreshIcon /></span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: 'REQUESTED', label: 'Requested', color: '#f59e0b' },
          { key: 'APPROVED', label: 'Approved', color: '#10b981' },
          { key: 'CANCELLED', label: 'Cancelled', color: '#ef4444' },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => { setStatusView(key); setPage(0); }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: statusView === key ? color : 'var(--input-bg)',
              color: statusView === key ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${statusView === key ? 'transparent' : 'var(--border)'}`,
            }}>
            {label} ({bucketedCounts[key].toLocaleString('en-IN')})
          </button>
        ))}
      </div>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}><SearchIcon /></span>
        <input type="text" value={search} onChange={e => handleSearch(e.target.value)}
          placeholder="Search by username, lender ID, mobile or user ID…"
          className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        {search && (
          <button onClick={() => handleSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
            <CloseIcon />
          </button>
        )}
      </div>
      {search && !loading && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {filtered.length === 0 ? 'No results found' : `${filtered.length} result${filtered.length > 1 ? 's' : ''} for "${search}"`}
        </p>
      )}

      {/* Table card */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--card-bg)', border: '1px solid rgba(168,85,247,0.18)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

        <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-2"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(168,85,247,0.04)' }}>
          <div className="flex items-center gap-2" style={{ color: '#c084fc' }}>
            <MigrateIcon />
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {search ? `${statusView} Search Results` : `${statusView} Records`}
            </span>
          </div>
          {!loading && filtered.length > 0 && totalPages > 1 && (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>
              Page {page + 1} of {totalPages}
            </span>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-16">
            <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading migrated users…</span>
          </div>
        )}

        {!loading && error && (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
            <button onClick={() => load()} className="mt-3 text-xs underline" style={{ color: '#c084fc' }}>Retry</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-3xl mb-3">{search ? '🔍' : '📦'}</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {search ? 'No matching users' : 'No migrated users yet'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {search ? 'Try a different search term' : 'Migration records will appear here'}
            </p>
          </div>
        )}

        {!loading && !error && pageData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                  {cols.map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold whitespace-nowrap"
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((u, idx) => (
                  <tr key={u.lenderId ?? u.userId ?? idx}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onClick={() => setSelected(u)}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(168,85,247,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {cols.map(col => (
                      <td key={col} className="py-3.5 px-4 whitespace-nowrap">{getCell(u, col, idx)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3"
            style={{ borderTop: '1px solid var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-30"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <ChevLeft />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: p === page ? 'linear-gradient(135deg,#a855f7,#7c3aed)' : 'var(--input-bg)',
                      color:      p === page ? '#fff' : 'var(--text-muted)',
                      border:     `1px solid ${p === page ? 'transparent' : 'var(--border)'}`,
                      boxShadow:  p === page ? '0 2px 8px rgba(168,85,247,0.35)' : 'none',
                    }}>
                    {p + 1}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-30"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <ChevRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <DetailDrawer
          user={selected}
          onClose={() => setSelected(null)}
          onApproved={handleApproved}
        />
      )}
    </div>
  );
}
