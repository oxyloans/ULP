import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWalletWithdrawalRequests } from '../api/afterlogin-user';
import { formatINR } from '../utils/currency';

/* ── Icons ─────────────────────────────────────────────────── */
const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const CheckCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const XCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" /><circle cx="18" cy="12" r="2" />
  </svg>
);

/* ── Helpers ────────────────────────────────────────────────── */
function normalize(res) {
  return Array.isArray(res)
    ? res
    : Array.isArray(res?.data)
    ? res.data
    : Array.isArray(res?.withdrawalRequests)
    ? res.withdrawalRequests
    : [];
}

function fmtDate(raw) {
  if (!raw || raw === 'Not rejected yet') return null;
  const d = new Date(raw);
  if (isNaN(d)) return raw;
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function getStatus(r) {
  return String(r?.status ?? r?.walletStatus ?? 'PENDING').toUpperCase();
}

const STATUS_CONFIG = {
  APPROVED: {
    label: 'Approved',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.10)',
    border: 'rgba(16,185,129,0.25)',
    Icon: CheckCircle,
    cardAccent: 'rgba(16,185,129,0.06)',
  },
  REJECTED: {
    label: 'Rejected',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.10)',
    border: 'rgba(239,68,68,0.22)',
    Icon: XCircle,
    cardAccent: 'rgba(239,68,68,0.05)',
  },
  PENDING: {
    label: 'Pending',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.10)',
    border: 'rgba(245,158,11,0.25)',
    Icon: ClockIcon,
    cardAccent: 'rgba(245,158,11,0.05)',
  },
};

function getStatusConfig(status) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
}

/* ── Stat Card ──────────────────────────────────────────────── */
function StatCard({ label, value, color, sub }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-1"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
      <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-2xl font-black" style={{ color: color ?? 'var(--text-primary)' }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

/* ── Request Card ───────────────────────────────────────────── */
function RequestCard({ r, index }) {
  const status = getStatus(r);
  const cfg = getStatusConfig(status);
  const amount = Number(r?.requestAmount ?? r?.amount ?? 0);
  const initiated = fmtDate(r?.initiatedDate ?? r?.createdAt ?? r?.date);
  const approved = fmtDate(r?.approveDate ?? r?.approvedDate);
  const rejected = fmtDate(r?.rejectedDate);

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 transition-all"
      style={{
        background: 'var(--surface-card)',
        border: `1px solid var(--border)`,
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        borderLeft: `4px solid ${cfg.color}`,
      }}
    >
      {/* Top row: amount + status badge */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
            Request #{index + 1}
          </p>
          <p
            className="text-2xl font-black"
            style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
          >
            {formatINR(amount)}
          </p>
        </div>

        <span
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          <cfg.Icon />
          {cfg.label}
        </span>
      </div>

      {/* Timeline dates */}
      <div className="grid gap-2">
        {initiated && (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#94a3b8' }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Initiated</span>
              &nbsp;·&nbsp;{initiated}
            </p>
          </div>
        )}
        {status === 'APPROVED' && approved && (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#10b981' }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: '#10b981' }}>Approved</span>
              &nbsp;·&nbsp;{approved}
            </p>
          </div>
        )}
        {status === 'REJECTED' && rejected && (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#ef4444' }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: '#ef4444' }}>Rejected</span>
              &nbsp;·&nbsp;{rejected}
            </p>
          </div>
        )}
      </div>

      {/* Status message for pending */}
      {status === 'PENDING' && (
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <ClockIcon />
          <p className="text-xs font-medium" style={{ color: '#d97706' }}>
            Your request is under review. You'll be notified once processed.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Empty State ────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
      >
        <WalletIcon />
      </div>
      <div>
        <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>No withdrawal requests</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          You haven't raised any withdrawal requests yet.
        </p>
      </div>
    </div>
  );
}

/* ── Skeleton ───────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 grid gap-4 shimmer-bg" style={{ minHeight: 130 }} />
  );
}

/* ── Main Page ──────────────────────────────────────────────── */
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

  const totalAmount = useMemo(
    () => requests.reduce((s, r) => s + Number(r?.requestAmount ?? r?.amount ?? 0), 0),
    [requests]
  );
  const approvedCount = useMemo(
    () => requests.filter(r => getStatus(r) === 'APPROVED').length,
    [requests]
  );
  const pendingCount = useMemo(
    () => requests.filter(r => getStatus(r) === 'PENDING').length,
    [requests]
  );
  const rejectedCount = useMemo(
    () => requests.filter(r => getStatus(r) === 'REJECTED').length,
    [requests]
  );

  return (
    <div className="grid gap-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            Withdrawal Requests
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Track the status of your withdrawal requests
          </p>
        </div>
        <button
          onClick={() => navigate('/wallet')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm"
          style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        >
          <ArrowLeft /> Back to Wallet
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Requests" value={loading ? '—' : requests.length} />
        <StatCard label="Approved" value={loading ? '—' : approvedCount} color="#10b981" />
        <StatCard label="Pending" value={loading ? '—' : pendingCount} color="#f59e0b" />
        <StatCard label="Rejected" value={loading ? '—' : rejectedCount} color="#ef4444" />
      </div>

      {/* Total requested amount banner */}
      {!loading && requests.length > 0 && (
        <div
          className="rounded-2xl px-5 py-4 flex items-center justify-between gap-3 flex-wrap"
          style={{
            background: 'linear-gradient(135deg,#1e1b4b,#312e81)',
            border: '1px solid rgba(99,102,241,0.3)',
          }}
        >
          <div>
            <p className="text-xs font-semibold text-indigo-200">Total Amount Requested</p>
            <p
              className="text-2xl font-black text-white mt-0.5"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {formatINR(totalAmount)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-200">
            <span
              className="px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              {requests.length} request{requests.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Request list */}
      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : requests.length === 0 ? (
        <div
          className="rounded-2xl"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
        >
          <EmptyState />
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((r, i) => (
            <RequestCard key={r?.id ?? r?.withdrawalId ?? i} r={r} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
