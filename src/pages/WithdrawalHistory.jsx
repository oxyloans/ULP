import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserWithdrawalRequests } from '../api/afterlogin-user';
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
const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 .49-5" />
    <polyline points="12 7 12 12 15 15" />
  </svg>
);
const BankIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11" />
  </svg>
);
const TagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

/* ── Status config ──────────────────────────────────────────── */
const STATUS_CONFIG = {
  APPROVED:  { label: 'Approved',  color: '#10b981', bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.25)',  Icon: CheckCircle },
  COMPLETED: { label: 'Completed', color: '#10b981', bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.25)',  Icon: CheckCircle },
  REJECTED:  { label: 'Rejected',  color: '#ef4444', bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.22)',   Icon: XCircle     },
  INITIATED: { label: 'Initiated', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.25)',  Icon: ClockIcon   },
  PENDING:   { label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.25)',  Icon: ClockIcon   },
};

function getStatusCfg(status) {
  return STATUS_CONFIG[String(status ?? '').toUpperCase()] ?? STATUS_CONFIG.PENDING;
}

/* ── Helpers ────────────────────────────────────────────────── */
function fmtDate(raw) {
  if (!raw) return null;
  // already DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
  const d = new Date(raw);
  if (isNaN(d)) return raw;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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

/* ── Badge ──────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = getStatusCfg(status);
  return (
    <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <cfg.Icon />
      {cfg.label}
    </span>
  );
}

/* ── Withdrawal Card ────────────────────────────────────────── */
function WithdrawalCard({ item, index, type }) {
  const principalCfg = getStatusCfg(item.withdrawalStatus);
  const interestCfg  = getStatusCfg(item.withdrawalInterestStatus);

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 transition-all"
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        borderLeft: `4px solid ${principalCfg.color}`,
      }}>

      {/* Top row: amount + deal label */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold mb-0.5 truncate"
            style={{ color: 'var(--text-muted)' }}>
            #{index + 1} · {item.dealName ?? 'Deal'}
          </p>
          <p className="text-2xl font-black"
            style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>
            {formatINR(item.withdrawalAmount ?? 0)}
          </p>
        </div>
        <StatusBadge status={item.withdrawalStatus} />
      </div>

      {/* Amounts row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl px-3 py-2.5"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
          <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Principal</p>
          <p className="text-sm font-black" style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            {formatINR(item.withdrawalAmount ?? 0)}
          </p>
        </div>
        <div className="rounded-xl px-3 py-2.5"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
          <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Withdrawal Interest</p>
          <p className="text-sm font-black" style={{ color: '#f59e0b', fontFamily: 'monospace' }}>
            {item.withdrawalInterest ?? 0}%
          </p>
        </div>
      </div>

      {/* Status row */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
          style={{ background: principalCfg.bg, border: `1px solid ${principalCfg.border}`, color: principalCfg.color }}>
          <principalCfg.Icon />
          <span className="font-semibold">Principal: {item.withdrawalStatus}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
          style={{ background: interestCfg.bg, border: `1px solid ${interestCfg.border}`, color: interestCfg.color }}>
          <interestCfg.Icon />
          <span className="font-semibold">Interest: {item.withdrawalInterestStatus}</span>
        </div>
      </div>

      {/* Meta info */}
      <div className="grid gap-1.5">
        {item.initiatedDate && (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#94a3b8' }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Initiated</span>
              &nbsp;·&nbsp;{fmtDate(item.initiatedDate)}
            </p>
          </div>
        )}
        {item.daysDifference != null && (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#94a3b8' }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Days held</span>
              &nbsp;·&nbsp;{item.daysDifference} day{item.daysDifference !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Bank details */}
      {(item.accNo || item.ifsc) && (
        <div className="rounded-xl px-3 py-2.5 flex items-start gap-2"
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <span style={{ color: '#818cf8', marginTop: 1 }}><BankIcon /></span>
          <div className="flex flex-col gap-0.5">
            {item.bankName && (
              <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{item.bankName}</p>
            )}
            {item.accNo && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                A/C: <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{item.accNo}</span>
              </p>
            )}
            {item.ifsc && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                IFSC: <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{item.ifsc}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Remarks */}
      {item.remarks && (
        <div className="rounded-xl px-3 py-2.5 flex items-start gap-2"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <span style={{ color: '#f59e0b', marginTop: 1 }}><TagIcon /></span>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Remarks:&nbsp;</span>
            {item.remarks}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Section with title + grid ──────────────────────────────── */
function Section({ title, items, accentColor, emptyMsg }) {
  if (items.length === 0) {
    return (
      <div>
        <h2 className="text-base font-black mb-3" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <div className="rounded-2xl px-5 py-8 text-center"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{emptyMsg}</p>
        </div>
      </div>
    );
  }
  return (
    <div>
      {/* <div className="flex items-center gap-2 mb-3">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: accentColor }} />
        <h2 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full ml-1"
          style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}33` }}>
          {items.length}
        </span>
      </div> */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <WithdrawalCard key={item.id ?? i} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}

/* ── Skeleton ───────────────────────────────────────────────── */
function SkeletonCard() {
  return <div className="rounded-2xl shimmer-bg" style={{ minHeight: 200 }} />;
}

/* ── Empty State ────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        <HistoryIcon />
      </div>
      <div>
        <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>No withdrawal history</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          You haven't made any withdrawal requests yet.
        </p>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function WithdrawalHistory() {
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(true);
  const [principal, setPrincipal] = useState([]);
  const [interest, setInterest]   = useState([]);

  useEffect(() => {
    getUserWithdrawalRequests()
      .then(res => {
        setPrincipal(res?.principalWithdrawalList ?? []);
        setInterest(res?.withdrawalInterestList   ?? []);
      })
      .catch(() => {
        setPrincipal([]);
        setInterest([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalPrincipal = useMemo(
    () => principal.reduce((s, r) => s + Number(r.withdrawalAmount ?? 0), 0),
    [principal]
  );
  const totalInterestAmt = useMemo(
    () => interest.reduce((s, r) => s + Number(r.withdrawalAmount ?? 0), 0),
    [interest]
  );
  const hasData = principal.length > 0 || interest.length > 0;

  return (
    <div className="grid gap-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            Withdrawal History
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Principal &amp; interest withdrawal requests
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm"
          style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          <ArrowLeft /> Back
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Principal Requests" value={loading ? '—' : principal.length} color="#6366f1" />
        <StatCard label="Interest Requests"  value={loading ? '—' : interest.length}  color="#f59e0b" />
        <StatCard
          label="Total Principal"
          value={loading ? '—' : formatINR(totalPrincipal)}
          color="#6366f1"
        />
        <StatCard
          label="Total Interest Amt"
          value={loading ? '—' : formatINR(totalInterestAmt)}
          color="#f59e0b"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : !hasData ? (
        <div className="rounded-2xl"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <EmptyState />
        </div>
      ) : (
        <div className="grid gap-8">
          <Section
            // title="Withdrawals"
            items={principal}
            accentColor="#6366f1"
            emptyMsg="No principal withdrawal requests found."
          />
        </div>
      )}
    </div>
  );
}
