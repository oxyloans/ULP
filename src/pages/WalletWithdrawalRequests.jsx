import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWalletWithdrawalRequests } from '../api/afterlogin-user';
import { formatINR } from '../utils/currency';

const ArrowLeft = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;

function normalize(res) {
  return Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.withdrawalRequests) ? res.withdrawalRequests : [];
}

export default function WalletWithdrawalRequests() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    getWalletWithdrawalRequests()
      .then(res => setRequests(normalize(res)))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const approvedCount = useMemo(() => requests.filter(r => String(r?.status ?? r?.walletStatus ?? '').toUpperCase() === 'APPROVED').length, [requests]);
  const pendingCount = useMemo(() => requests.filter(r => {
    const s = String(r?.status ?? r?.walletStatus ?? '').toUpperCase();
    return s !== 'APPROVED' && s !== 'REJECTED';
  }).length, [requests]);

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Raised Withdrawal Requests</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Track all requests and approvals</p>
        </div>
        <button onClick={() => navigate('/wallet')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm" style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}><ArrowLeft /> Wallet</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl p-4" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Raised</p><p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{requests.length}</p></div>
        <div className="rounded-2xl p-4" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pending</p><p className="text-xl font-black" style={{ color: '#f59e0b' }}>{pendingCount}</p></div>
        <div className="rounded-2xl p-4" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Approved</p><p className="text-xl font-black" style={{ color: '#10b981' }}>{approvedCount}</p></div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        {loading ? (
          <p className="p-5 text-sm" style={{ color: 'var(--text-muted)' }}>Loading requests…</p>
        ) : requests.length === 0 ? (
          <p className="p-5 text-sm" style={{ color: 'var(--text-muted)' }}>No withdrawal requests found.</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {requests.map((r, i) => {
              const status = String(r?.status ?? r?.walletStatus ?? 'PENDING').toUpperCase();
              const amount = Number(r?.amount ?? 0);
              const createdAt = r?.createdAt ?? r?.createdDate ?? r?.date;
              return (
                <div key={r?.id ?? r?.withdrawalId ?? i} className="p-4 flex items-center justify-between gap-3 flex-wrap" style={{ background: 'var(--surface-card)' }}>
                  <div>
                    <p className="text-base font-black" style={{ color: 'var(--text-primary)' }}>{formatINR(amount)}</p>
                    {createdAt && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{new Date(createdAt).toLocaleString('en-IN')}</p>}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ color: status === 'APPROVED' ? '#10b981' : status === 'REJECTED' ? '#ef4444' : '#f59e0b', background: status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : status === 'REJECTED' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.12)' }}>{status}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
