import { useState, useEffect } from 'react';
import { getPendingApprovals, approveRequest, rejectRequest, getAllUsers } from '../../api/afterlogin-admin';

const statusChip = { Approved: 'chip-green', Pending: 'chip-orange', Rejected: 'chip-red' };

function RequestCard({ req, onApprove, onReject, loading }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--card-bg)', border: '1px solid rgba(245,158,11,0.2)' }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
          {req.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{req.name}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>📧 {req.email}</span>
            <span>📱 {req.phone}</span>
            <span className="font-mono" style={{ color: 'var(--brand)' }}>🪪 {req.lrId}</span>
            <span>📅 {req.submittedOn}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onApprove(req.id)}
          disabled={loading === req.id}
          className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50 chip-green">
          {loading === req.id ? '…' : '✓ Approve'}
        </button>
        <button
          onClick={() => onReject(req.id)}
          disabled={loading === req.id}
          className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50 chip-red">
          {loading === req.id ? '…' : '✕ Reject'}
        </button>
      </div>
    </div>
  );
}

export default function AdminApprovals() {
  const [pending,  setPending]  = useState([]);
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [loading,  setLoading]  = useState(null);
  const [tab, setTab] = useState('pending');

  useEffect(() => {
    getPendingApprovals().then(d => { if (Array.isArray(d)) setPending(d); }).catch(() => {});
    getAllUsers().then(d => {
      if (Array.isArray(d)) {
        setApproved(d.filter(m => m.status === 'Approved'));
        setRejected(d.filter(m => m.status === 'Rejected'));
      }
    }).catch(() => {});
  }, []);

  const handleApprove = async (id) => {
    setLoading(id);
    try {
      await approveRequest(id);
      const req = pending.find(r => r.id === id);
      setPending(p => p.filter(r => r.id !== id));
      if (req) setApproved(p => [...p, { ...req, status: 'Approved' }]);
    } catch (e) { console.error(e); }
    setLoading(null);
  };

  const handleReject = async (id) => {
    setLoading(id);
    try {
      await rejectRequest(id);
      const req = pending.find(r => r.id === id);
      setPending(p => p.filter(r => r.id !== id));
      if (req) setRejected(p => [...p, { ...req, status: 'Rejected' }]);
    } catch (e) { console.error(e); }
    setLoading(null);
  };

  const tabs = [
    { key: 'pending',  label: 'Pending',  count: pending.length,  color: '#f59e0b' },
    { key: 'approved', label: 'Approved', count: approved.length, color: '#10b981' },
    { key: 'rejected', label: 'Rejected', count: rejected.length, color: '#ef4444' },
  ];

  return (
    <div className="grid gap-5">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {tabs.map(t => (
          <div key={t.key} className="rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02]"
            onClick={() => setTab(t.key)}
            style={{ background: 'var(--card-bg)', border: `1px solid ${t.color}${tab === t.key ? '60' : '25'}` }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: t.color }}>{t.label}</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{t.count}</p>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={tab === t.key ? { background: 'var(--brand)', color: '#fff' } : { color: 'var(--text-muted)' }}>
            {t.label}
            {t.count > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                style={{ background: tab === t.key ? 'rgba(255,255,255,0.25)' : 'var(--surface-elevated)' }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pending requests */}
      {tab === 'pending' && (
        pending.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <p className="text-4xl mb-3">✅</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>All caught up!</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>No pending requests</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map(req => (
              <RequestCard key={req.id} req={req} onApprove={handleApprove} onReject={handleReject} loading={loading} />
            ))}
          </div>
        )
      )}

      {/* Approved list */}
      {tab === 'approved' && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                {['Member', 'LR ID', 'Contact', 'Joined', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {approved.map(m => (
                <tr key={m.id} className="table-row-hover transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{m.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs" style={{ color: 'var(--brand)' }}>{m.lrId}</td>
                  <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{m.phone}</td>
                  <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{m.joinedOn}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold chip-green">Approved</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejected list */}
      {tab === 'rejected' && (
        rejected.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No rejected requests</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {rejected.map(r => (
              <div key={r.id} className="flex items-center justify-between gap-3 p-4 rounded-xl"
                style={{ background: 'var(--card-bg)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{r.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.email} · {r.lrId}</p>
                </div>
                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold chip-red">Rejected</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
