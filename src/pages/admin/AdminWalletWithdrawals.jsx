import { useEffect, useMemo, useState } from 'react';
import { getAdminWalletWithdrawalRequests, updateAdminWalletWithdrawalStatus } from '../../api/afterlogin-admin';
import { formatINR } from '../../utils/currency';

const RefreshIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const CheckIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>;

const ADMIN_NAMES = ['SUBBU', 'ADMIN', 'RAVI', 'PRIYA'];

function normalize(res) {
  const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.content) ? res.content : [];
  return list.map((r, i) => ({
    id: r?.id ?? `W-${i}`,
    userId: r?.userId ?? '',
    name: r?.name ?? '—',
    requestAmount: Number(r?.requestAmount ?? 0),
    initiatedDate: r?.initiatedDate ?? '',
    approveDate: r?.approveDate ?? '',
    rejectedDate: r?.rejectedDate ?? '',
    errorMessage: r?.errorMessage ?? '',
    walletStatus: String(r?.walletStatus ?? 'PENDING').toUpperCase(),
    approvedBy: r?.approvedBy ?? '',
  }));
}

function StatusChip({ status }) {
  const s = String(status ?? '').toUpperCase();
  const cfg = s === 'APPROVED'
    ? { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' }
    : s === 'REJECTED'
      ? { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' }
      : { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
      {s || 'PENDING'}
    </span>
  );
}

function ActionModal({ row, onClose, onSubmit, loading }) {
  const [action, setAction] = useState('APPROVED');
  const [approvedBy, setApprovedBy] = useState(ADMIN_NAMES[0]);
  const [comments, setComments] = useState('');
  const isApprove = action === 'APPROVED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.45)' }} onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>{isApprove ? 'Approve Withdrawal' : 'Reject Withdrawal'}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{row.name} · {formatINR(row.requestAmount)}</p>
        </div>
        <div className="p-5 grid gap-3">
          <div className="flex items-center gap-2 p-1 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
            <button onClick={() => setAction('APPROVED')} className="flex-1 py-2 rounded-lg text-xs font-bold" style={{ background: action === 'APPROVED' ? '#10b981' : 'transparent', color: action === 'APPROVED' ? '#fff' : 'var(--text-muted)' }}>Approve</button>
            <button onClick={() => setAction('REJECTED')} className="flex-1 py-2 rounded-lg text-xs font-bold" style={{ background: action === 'REJECTED' ? '#ef4444' : 'transparent', color: action === 'REJECTED' ? '#fff' : 'var(--text-muted)' }}>Reject</button>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>{isApprove ? 'Approved By' : 'Rejected By'}</label>
            <select value={approvedBy} onChange={e => setApprovedBy(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              {ADMIN_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Comments</label>
            <textarea value={comments} onChange={e => setComments(e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} placeholder="Optional note" />
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Cancel</button>
          <button disabled={loading} onClick={() => onSubmit({ action, approvedBy, comments })} className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60" style={{ background: isApprove ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff' }}>{loading ? 'Submitting…' : (isApprove ? 'Confirm Approve' : 'Confirm Reject')}</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminWalletWithdrawals() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [tab, setTab] = useState('PENDING');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminWalletWithdrawalRequests();
      setRows(normalize(res));
    } catch (e) {
      setError(e?.message ?? 'Failed to load wallet withdrawals');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => ({
    PENDING: rows.filter(r => !['APPROVED', 'REJECTED'].includes(r.walletStatus)).length,
    APPROVED: rows.filter(r => r.walletStatus === 'APPROVED').length,
    REJECTED: rows.filter(r => r.walletStatus === 'REJECTED').length,
    ALL: rows.length,
  }), [rows]);

  const filtered = tab === 'ALL' ? rows : tab === 'PENDING'
    ? rows.filter(r => !['APPROVED', 'REJECTED'].includes(r.walletStatus))
    : rows.filter(r => r.walletStatus === tab);

  const handleAction = async ({ action, approvedBy, comments }) => {
    if (!activeRow) return;
    setSubmitting(true);
    setError('');
    try {
      await updateAdminWalletWithdrawalStatus({
        id: activeRow.id,
        userId: activeRow.userId,
        requestAmount: activeRow.requestAmount,
        initiatedDate: activeRow.initiatedDate,
        approvedBy,
        comments,
        walletStatus: action,
      });
      setRows(prev => prev.map(r => r.id === activeRow.id ? { ...r, walletStatus: action, approvedBy } : r));
      setActiveRow(null);
    } catch (e) {
      setError(e?.message ?? 'Unable to update withdrawal status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6">
      {activeRow && <ActionModal row={activeRow} onClose={() => setActiveRow(null)} onSubmit={handleAction} loading={submitting} />}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Wallet Withdrawals</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Review withdrawal requests raised by users</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}><RefreshIcon /> Refresh</button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(key => (
          <button key={key} onClick={() => setTab(key)} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: tab === key ? '#6366f1' : 'var(--input-bg)', color: tab === key ? '#fff' : 'var(--text-muted)', border: `1px solid ${tab === key ? '#6366f1' : 'var(--border)'}` }}>{key} · {counts[key]}</button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        {loading ? <p className="p-5 text-sm" style={{ color: 'var(--text-muted)' }}>Loading withdrawals…</p> : error ? <p className="p-5 text-sm" style={{ color: '#ef4444' }}>{error}</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--input-bg)' }}>
                  {['Name', 'User ID', 'Amount', 'Initiated', 'Status', 'Approved/Rejected By', 'Actions'].map(h => <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? <tr><td colSpan={7} className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No withdrawal requests in this category</td></tr> : filtered.map((r, i) => {
                  const locked = ['APPROVED', 'REJECTED'].includes(r.walletStatus);
                  return (
                    <tr key={r.id ?? i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{r.name}</td>
                      <td className="py-3 px-4 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{r.userId || '—'}</td>
                      <td className="py-3 px-4 font-bold" style={{ color: '#10b981' }}>{formatINR(r.requestAmount)}</td>
                      <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{r.initiatedDate || '—'}</td>
                      <td className="py-3 px-4"><StatusChip status={r.walletStatus} /></td>
                      <td className="py-3 px-4 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{r.approvedBy || '—'}</td>
                      <td className="py-3 px-4">
                        {locked ? <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Processed</span> : (
                          <button onClick={() => setActiveRow(r)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: 'rgba(59,130,246,0.12)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.25)' }}><CheckIcon /> Action</button>
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
  );
}
