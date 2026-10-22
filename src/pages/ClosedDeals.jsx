import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClosedDeals } from '../api/afterlogin-user';
import { formatINR } from '../utils/currency';

/* ── Palette ─────────────────────────────────────────────────────────────── */
const INDIGO = '#6366f1';
const AMBER  = '#f59e0b';
const RED    = '#ef4444';
const PURPLE = '#818cf8';

/* ── Icons ───────────────────────────────────────────────────────────────── */
const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const CalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const CoinsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="8" cy="8" r="6"/>
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
    <path d="M7 6h1v4"/>
    <path d="m16.71 13.88.7.71-2.82 2.82"/>
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function fmtINR(n) {
  return formatINR(n ?? 0);
}

function fmtDate(raw) {
  if (!raw) return '—';
  // Already DD/MM/YYYY — return as-is
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
  const d = new Date(raw);
  if (isNaN(d)) return raw;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ── Payout chip ─────────────────────────────────────────────────────────── */
function PayoutChip({ type }) {
  if (!type) return null;
  const label = {
    MONTHLY:      'Monthly',
    QUARTELY:     'Quarterly',
    HALFLY:       'Half-Yearly',
    YEARLY:       'Yearly',
    ENDOFTHEDEAL: 'End of Deal',
  }[type] ?? type;

  return (
    <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full"
      style={{ background: `${PURPLE}14`, color: PURPLE, border: `1px solid ${PURPLE}28` }}>
      {label}
    </span>
  );
}

/* ── Deal type chip ──────────────────────────────────────────────────────── */
function TypeChip({ globalDealType, dealSubType }) {
  const label = globalDealType ?? dealSubType;
  if (!label) return null;
  return (
    <span className="text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full"
      style={{ background: `${INDIGO}14`, color: INDIGO, border: `1px solid ${INDIGO}28` }}>
      {label}
    </span>
  );
}

/* ── Stat Card ───────────────────────────────────────────────────────────── */
function StatCard({ label, value, color, icon }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}>{label}</p>
        <span style={{ color: color ?? INDIGO, opacity: 0.7 }}>{icon}</span>
      </div>
      <p className="text-xl font-black"
        style={{ color: color ?? 'var(--text-primary)', fontFamily: "'JetBrains Mono',monospace" }}>
        {value}
      </p>
    </div>
  );
}

/* ── Deal Card ───────────────────────────────────────────────────────────── */
function DealCard({ deal, index }) {
  const [expanded, setExpanded] = useState(false);

  // Exact field names from the API response
  const dealName         = deal.dealName        ?? `Deal #${index + 1}`;
  const amount           = Number(deal.participatedAmount   ?? 0);
  const roi              = deal.rateOfInterest  ?? null;           // e.g. 1.6
  const participatedDate = deal.participatedDate ?? null;          // "29/04/2026"
  const amountType       = deal.amountTye       ?? null;           // "MONTHLY"
  const globalDealType   = deal.globalDealType  ?? null;           // "SDLOT"
  const dealSubType      = deal.dealSubType      ?? null;           // "STUDENT"
  const updatedAmt       = deal.updatedParticipation ?? null;

  return (
    <div
      className="rounded-2xl overflow-hidden transition-shadow hover:shadow-lg"
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        borderLeft: `4px solid ${RED}`,
      }}>

      {/* ── Card header ── */}
      <div className="p-4 pb-3">
        {/* Row 1: index + chips + closed badge */}
        <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}>#{index + 1}</span>
            <TypeChip globalDealType={globalDealType} dealSubType={dealSubType} />
            <PayoutChip type={amountType} />
          </div>
          <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ color: RED, background: `${RED}12`, border: `1px solid ${RED}28` }}>
            <LockIcon />
            CLOSED
          </span>
        </div>

        {/* Deal name */}
        <h3 className="text-base font-black leading-snug" style={{ color: 'var(--text-primary)' }}>
          {dealName}
        </h3>

        {/* Participated amount */}
        <p className="text-2xl font-black mt-2 tabular-nums"
          style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono',monospace" }}>
          {fmtINR(amount)}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Amount Participated</p>
      </div>

      {/* ── KPI row ── */}
      <div className="px-4 pb-3">
        {/* ROI */}
        <div className="rounded-xl px-3 py-2.5"
          style={{ background: `${AMBER}0d`, border: `1px solid ${AMBER}25` }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}>ROI / Month</p>
          <p className="text-sm font-black mt-0.5 tabular-nums"
            style={{ color: AMBER, fontFamily: "'JetBrains Mono',monospace" }}>
            {roi != null ? `${roi}%` : '—'}
          </p>
        </div>
      </div>

      {/* ── Participated date ── */}
      {participatedDate && (
        <div className="flex items-center gap-1.5 px-4 pb-3 text-xs"
          style={{ color: 'var(--text-muted)' }}>
          <CalIcon />
          <span>Participated on&nbsp;
            <strong style={{ color: 'var(--text-primary)' }}>{fmtDate(participatedDate)}</strong>
          </span>
        </div>
      )}

      {/* ── Expand toggle ── */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-all"
        style={{
          borderTop: '1px solid var(--border)',
          color: INDIGO,
          background: `${INDIGO}06`,
        }}>
        <span>{expanded ? 'Hide Details' : 'View Details'}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* ── Expanded details ── */}
      {expanded && (
        <div className="px-4 pb-4 pt-3 grid gap-2"
          style={{ background: 'var(--input-bg)' }}>

          {/* Deal ID */}
          {deal.dealId && (
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>Deal ID</span>
              <span className="text-[11px] font-mono text-right break-all"
                style={{ color: 'var(--text-muted)' }}>
                {deal.dealId}
              </span>
            </div>
          )}

          {/* Min / Max participation */}
          {deal.minimumParticipation != null && (
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Min Participation</span>
              <span className="text-xs font-bold tabular-nums"
                style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono',monospace" }}>
                {fmtINR(deal.minimumParticipation)}
              </span>
            </div>
          )}
          {deal.maxParticipation != null && (
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Max Participation</span>
              <span className="text-xs font-bold tabular-nums"
                style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono',monospace" }}>
                {fmtINR(deal.maxParticipation)}
              </span>
            </div>
          )}

          {/* Updated participation */}
          {updatedAmt != null && (
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Updated Participation</span>
              <span className="text-xs font-bold tabular-nums"
                style={{ color: PURPLE, fontFamily: "'JetBrains Mono',monospace" }}>
                {fmtINR(updatedAmt)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return <div className="rounded-2xl shimmer-bg" style={{ minHeight: 230 }} />;
}

/* ── Empty State ─────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        <LockIcon />
      </div>
      <div>
        <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>No closed deals</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          You don't have any closed deals yet.
        </p>
      </div>
    </div>
  );
}

/* ── Pagination ──────────────────────────────────────────────────────────── */
function Pagination({ page, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={onPrev}
        disabled={page === 0}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
        <ChevronLeft /> Prev
      </button>
      <span className="text-sm font-semibold px-3" style={{ color: 'var(--text-muted)' }}>
        Page {page + 1} of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page + 1 >= totalPages}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
        Next <ChevronRight />
      </button>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
const PAGE_SIZE = 10;

export default function ClosedDeals() {
  const navigate = useNavigate();

  const [meta, setMeta]         = useState(null);   // { userId, userName, mobileNumber }
  const [deals, setDeals]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [page, setPage]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback((pageIndex) => {
    setLoading(true);
    setError('');
    getClosedDeals({ pageIndex, pageSize: PAGE_SIZE })
      .then(res => {
        // Exact API shape:
        // { userId, userName, mobileNumber, closedDealsCount,
        //   pageIndex, pageSize, participationInfo: [...] }
        setMeta({
          userName:     res.userName     ?? null,
          mobileNumber: res.mobileNumber ?? null,
        });

        const list = res?.participationInfo ?? [];
        setDeals(list);

        const count = res?.closedDealsCount ?? list.length;
        setTotalPages(Math.max(1, Math.ceil(count / PAGE_SIZE)));
      })
      .catch(e => {
        setError(e?.message ?? 'Failed to load closed deals. Please try again.');
        setDeals([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  // Page-level totals
  const totalInvested = deals.reduce(
    (s, d) => s + Number(d.participatedAmount ?? 0), 0
  );

  return (
    <div className="grid gap-6 w-full">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ color: RED }}><LockIcon /></span>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
              Closed Deals
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Deals that have completed their tenure
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => load(page)}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{
              background: `${INDIGO}12`,
              color: INDIGO,
              border: `1px solid ${INDIGO}28`,
              opacity: loading ? 0.6 : 1,
            }}>
            <RefreshIcon /> Refresh
          </button>
        </div>
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
        <StatCard
          label="Closed Deals"
          value={loading ? '—' : deals.length}
          color={RED}
          icon={<LockIcon />}
        />
        <StatCard
          label="Total Invested"
          value={loading ? '—' : fmtINR(totalInvested)}
          color={INDIGO}
          icon={<CoinsIcon />}
        />

      </div>

      {/* ── Error state ── */}
      {!loading && error && (
        <div className="rounded-2xl px-5 py-6 flex flex-col items-center gap-3 text-center"
          style={{ background: 'var(--surface-card)', border: `1px solid ${RED}30` }}>
          <p className="text-sm font-bold" style={{ color: RED }}>{error}</p>
          <button
            onClick={() => load(page)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ background: `${INDIGO}12`, color: INDIGO, border: `1px solid ${INDIGO}28` }}>
            <RefreshIcon /> Retry
          </button>
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : !error && deals.length === 0 ? (
        <div className="rounded-2xl"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <EmptyState />
        </div>
      ) : !error && (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal, i) => (
              <DealCard
                key={deal.dealId ?? i}
                deal={deal}
                index={page * PAGE_SIZE + i}
              />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage(p => Math.max(0, p - 1))}
            onNext={() => setPage(p => p + 1)}
          />
        </>
      )}
    </div>
  );
}
