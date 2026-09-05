import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMigrationOxyloansUserInfo,
  getOxyloansEncryptKey,
  getOxyloansLenderDeals,
} from '../api/afterlogin-user';
import { formatINR } from '../utils/currency';

// ─── Brand colours ──────────────────────────────────────────────────────────
const OX_BLUE   = '#2673bb';
const OX_ORANGE = '#f58311';
const OX_GREEN  = '#35a13e';
const OX_RED    = '#e95330';

// ─── Icons ───────────────────────────────────────────────────────────────────
const BankIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/>
  </svg>
);
const TrendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);
const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
    <circle cx="18" cy="12" r="2"/>
  </svg>
);
const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const LinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n) { return formatINR(n ?? 0); }

function statusColor(s) {
  if (!s) return { bg: 'rgba(99,102,241,0.1)', color: '#818cf8', border: 'rgba(99,102,241,0.25)' };
  const u = s.toUpperCase();
  if (u === 'RUNNING')  return { bg: 'rgba(53,161,62,0.1)',  color: OX_GREEN,  border: 'rgba(53,161,62,0.25)'  };
  if (u === 'CLOSED')   return { bg: 'rgba(233,83,48,0.1)',  color: OX_RED,    border: 'rgba(233,83,48,0.25)'  };
  if (u === 'PENDING')  return { bg: 'rgba(245,131,17,0.1)', color: OX_ORANGE, border: 'rgba(245,131,17,0.25)' };
  return { bg: 'rgba(99,102,241,0.1)', color: '#818cf8', border: 'rgba(99,102,241,0.25)' };
}

function withdrawColor(w) {
  if (!w) return { bg: 'rgba(99,102,241,0.08)', color: '#818cf8' };
  return w.toUpperCase() === 'YES'
    ? { bg: 'rgba(53,161,62,0.1)',  color: OX_GREEN  }
    : { bg: 'rgba(233,83,48,0.08)', color: OX_RED    };
}

function returnTypeLabel(t) {
  if (!t) return '—';
  const map = { MONTHLY: 'Monthly', YEARLY: 'Yearly', QUARTERLY: 'Quarterly', HALFYEARLY: 'Half-Yearly', ENDOFTHEDEAL: 'End of Deal' };
  return map[t.toUpperCase()] ?? t;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color, Icon }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}14`, color }}>
          <Icon />
        </span>
      </div>
      <span className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</span>
      {sub && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</span>}
    </div>
  );
}

// ─── Deal Card ────────────────────────────────────────────────────────────────
function DealCard({ deal, index }) {
  const [open, setOpen] = useState(false);

  const participated = deal.paticipatedAmount ?? 0;
  const roi          = deal.rateOfInterest ?? 0;
  const duration     = deal.dealDuration ?? 0;
  const status       = deal.currentStatus ?? deal.participationStatus ?? '—';
  const borrower     = deal.dealBorrowerName ?? '—';
  const dealAmt      = deal.dealAmount ?? 0;
  const returnType   = deal.lederReturnType ?? deal.ledgerReturnType ?? '';
  const firstInt     = deal.firstInterestDate ?? null;
  const regDate      = deal.registeredDate ?? null;
  const firstPart    = deal.firstParticipationDate ?? null;
  const lastPart     = deal.lastParticipationDate ?? null;
  const withdraw     = deal.withdrawStatus ?? '—';
  const remaining    = deal.remaningingLimitToLender ?? null;
  const feeStatus    = deal.feeStatus ?? null;
  const closingStatus = deal.borrowerClosingStatus ?? null;

  const sc = statusColor(status);
  const wc = withdrawColor(withdraw);

  // accent colour cycles through brand colours
  const accentColors = [OX_BLUE, OX_ORANGE, OX_GREEN, '#818cf8', '#06b6d4'];
  const accent = accentColors[index % accentColors.length];

  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>

      {/* Main row */}
      <div className="flex items-stretch">
        {/* Left accent bar */}
        <div className="w-1 flex-shrink-0 rounded-l-2xl" style={{ background: accent }} />

        <div className="flex-1 p-4 min-w-0">
          {/* Top: name + status badges */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                {deal.dealName ?? `Deal #${deal.dealId}`}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Borrower: <span className="font-semibold">{borrower}</span>
                {duration > 0 && <> · {duration} mo</>}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                {status}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: wc.bg, color: wc.color }}>
                Withdraw: {withdraw}
              </span>
            </div>
          </div>

          {/* KPI chips row */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="flex flex-col">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Participated</span>
              <span className="text-sm font-black" style={{ color: accent }}>{fmt(participated)}</span>
            </div>
            <div className="w-px h-8 flex-shrink-0" style={{ background: 'var(--border)' }} />
            <div className="flex flex-col">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>ROI</span>
              <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{roi}%</span>
            </div>
            <div className="w-px h-8 flex-shrink-0" style={{ background: 'var(--border)' }} />
            <div className="flex flex-col">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Return Type</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{returnTypeLabel(returnType)}</span>
            </div>
            <div className="w-px h-8 flex-shrink-0" style={{ background: 'var(--border)' }} />
            <div className="flex flex-col">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Deal Amount</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{fmt(dealAmt)}</span>
            </div>
            {firstInt && (
              <>
                <div className="w-px h-8 flex-shrink-0" style={{ background: 'var(--border)' }} />
                <div className="flex flex-col">
                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <CalIcon /> 1st Interest
                  </span>
                  <span className="text-xs font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{firstInt}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setOpen(v => !v)}
          className="flex-shrink-0 px-3 flex items-center justify-center transition-all hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
          aria-label={open ? 'Collapse' : 'Expand'}>
          <span className="transition-transform duration-200"
            style={{ display: 'inline-block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <ChevronIcon />
          </span>
        </button>
      </div>

      {/* Expanded details */}
      {open && (
        <div className="px-5 pb-4 pt-0 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 border-t"
          style={{ borderColor: 'var(--border)' }}>
          <Detail label="Deal ID"            value={deal.dealId} />
          <Detail label="Registered"         value={regDate} />
          <Detail label="First Participated" value={firstPart} />
          <Detail label="Last Participated"  value={lastPart} />
          <Detail label="Processing Fee"     value={deal.processingFee != null ? fmt(deal.processingFee) : null} />
          <Detail label="Fee Status"         value={feeStatus} />
          <Detail label="Current Value"      value={deal.currentValue != null ? fmt(deal.currentValue) : null} />
          <Detail label="Remaining Limit"    value={remaining != null ? fmt(remaining) : null} />
          <Detail label="Participation Status" value={deal.participationStatus} />
          <Detail label="Closing Status"     value={closingStatus} />
          <Detail label="Account Type"       value={deal.accountType} />
          <Detail label="Deal Created Type"  value={deal.dealCreatedType} />
          {deal.groupLink && deal.groupLink.trim() !== '' && (
            <div className="col-span-2 sm:col-span-3 flex flex-col gap-0.5 pt-1">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Group Link</span>
              <a href={deal.groupLink} target="_blank" rel="noreferrer"
                className="text-xs font-semibold break-all hover:underline"
                style={{ color: OX_BLUE }}>
                {deal.groupLink}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  if (value == null || value === '' || value === '—') return null;
  return (
    <div className="flex flex-col gap-0.5 pt-2">
      <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{String(value)}</span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function OxyLoansDeals() {
  const navigate = useNavigate();

  // Connection / loading states
  const [checking, setChecking]     = useState(true);   // checking migration info
  const [linked, setLinked]         = useState(false);  // lenderId found + both verified
  const [lenderId, setLenderId]     = useState(null);
  const [lenderName, setLenderName] = useState(null);
  const [mobile, setMobile]         = useState(null);

  // Deals states
  const [deals, setDeals]         = useState([]);
  const [raw, setRaw]             = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // Search / filter
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // ── Load connection info on mount ──────────────────────────────────────────
  useEffect(() => {
    getMigrationOxyloansUserInfo()
      .then(info => {
        const lid = info?.lenderId ?? info?.lender_id ?? null;
        const mobileOk = !!info?.mobileNumberVerified;
        const emailOk  = !!info?.emailVerified;
        if (lid && mobileOk && emailOk) {
          setLenderId(String(lid));
          setLinked(true);
        } else {
          setLinked(false);
        }
      })
      .catch(() => setLinked(false))
      .finally(() => setChecking(false));
  }, []);

  // ── Auto-fetch deals once linked ───────────────────────────────────────────
  const fetchDeals = useCallback(async (lid) => {
    if (!lid) return;
    setLoading(true);
    setError('');
    try {
      const encKey = await getOxyloansEncryptKey();
      const res    = await getOxyloansLenderDeals(String(lid), encKey);
      const list   = Array.isArray(res?.lenderPaticipatedResponseDto)
        ? res.lenderPaticipatedResponseDto
        : [];
      setDeals(list);
      setRaw(res);
      setLenderName(res?.lenderName ?? null);
      setMobile(res?.mobileNumber ?? null);
    } catch (e) {
      setError(e.message ?? 'Failed to load OxyLoans deals');
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (linked && lenderId) fetchDeals(lenderId);
  }, [linked, lenderId, fetchDeals]);

  // ── Derived / filtered deals ───────────────────────────────────────────────
  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      const matchStatus = statusFilter === 'all' ||
        (d.currentStatus ?? d.participationStatus ?? '').toUpperCase() === statusFilter.toUpperCase();
      const q = search.trim().toLowerCase();
      const matchSearch = !q ||
        (d.dealName ?? '').toLowerCase().includes(q) ||
        (d.dealBorrowerName ?? '').toLowerCase().includes(q) ||
        String(d.dealId ?? '').includes(q);
      return matchStatus && matchSearch;
    });
  }, [deals, search, statusFilter]);

  // ── KPI aggregates ─────────────────────────────────────────────────────────
  const totalParticipated = useMemo(
    () => deals.reduce((s, d) => s + (d.paticipatedAmount ?? 0), 0),
    [deals]
  );
  const runningCount = useMemo(
    () => deals.filter(d => (d.currentStatus ?? '').toUpperCase() === 'RUNNING').length,
    [deals]
  );
  const avgRoi = useMemo(() => {
    if (!deals.length) return 0;
    const sum = deals.reduce((s, d) => s + (d.rateOfInterest ?? 0), 0);
    return (sum / deals.length).toFixed(2);
  }, [deals]);
  const withdrawableCount = useMemo(
    () => deals.filter(d => (d.withdrawStatus ?? '').toUpperCase() === 'YES').length,
    [deals]
  );

  // ── Status filter options ──────────────────────────────────────────────────
  const uniqueStatuses = useMemo(() => {
    const set = new Set(deals.map(d => (d.currentStatus ?? d.participationStatus ?? '').toUpperCase()).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [deals]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="grid gap-6">

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2.5"
            style={{ color: 'var(--text-primary)' }}>
            <span style={{ color: OX_ORANGE }}><BankIcon /></span>
            OxyLoans Deals
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Your participated deals fetched live from OxyLoans.
          </p>
        </div>
        {linked && !loading && deals.length > 0 && (
          <button
            onClick={() => fetchDeals(lenderId)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: `linear-gradient(135deg,${OX_ORANGE},#d96b00)`, color: '#fff', boxShadow: '0 4px 14px rgba(245,131,17,0.3)' }}>
            <RefreshIcon /> Refresh
          </button>
        )}
      </div>

      {/* ── State 1: Checking ──────────────────────────────────────────────── */}
      {checking && (
        <div className="flex items-center justify-center gap-3 py-20 rounded-2xl"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <span className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: OX_ORANGE, borderTopColor: 'transparent' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
            Checking OxyLoans account…
          </span>
        </div>
      )}

      {/* ── State 2: Not connected ─────────────────────────────────────────── */}
      {!checking && !linked && (
        <div className="rounded-2xl py-16 flex flex-col items-center gap-5 text-center"
          style={{ background: 'var(--surface-card)', border: '1px dashed var(--border)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: `rgba(245,131,17,0.1)`, border: `1px solid rgba(245,131,17,0.25)`, color: OX_ORANGE }}>
            <LinkIcon />
          </div>
          <div>
            <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              OxyLoans account not connected
            </p>
            <p className="text-sm mt-1.5 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
              Connect and verify your OxyLoans account from the Dashboard to view your lending portfolio here.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: `linear-gradient(135deg,${OX_ORANGE},#d96b00)`, color: '#fff', boxShadow: '0 4px 14px rgba(245,131,17,0.3)' }}>
            Go to Dashboard
          </button>
        </div>
      )}

      {/* ── State 3: Connected — loading deals ────────────────────────────── */}
      {!checking && linked && loading && (
        <div className="flex items-center justify-center gap-3 py-20 rounded-2xl animate-pulse"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <span className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: OX_ORANGE, borderTopColor: 'transparent' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
            Fetching OxyLoans deals…
          </span>
        </div>
      )}

      {/* ── State 4: Error ─────────────────────────────────────────────────── */}
      {!checking && linked && !loading && error && (
        <div className="rounded-2xl p-8 text-center"
          style={{ background: 'var(--surface-card)', border: `1px solid rgba(233,83,48,0.2)` }}>
          <p className="text-2xl mb-3">⚠️</p>
          <p className="text-sm font-semibold" style={{ color: OX_RED }}>{error}</p>
          {lenderId && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Lender ID: <span className="font-mono font-bold" style={{ color: OX_ORANGE }}>{lenderId}</span>
            </p>
          )}
          <button
            onClick={() => fetchDeals(lenderId)}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg,${OX_ORANGE},#d96b00)`, color: '#fff', boxShadow: '0 4px 14px rgba(245,131,17,0.3)' }}>
            Retry
          </button>
        </div>
      )}

      {/* ── State 5: Connected & deals loaded ─────────────────────────────── */}
      {!checking && linked && !loading && !error && (
        <>
          {/* Lender info banner */}
          {(lenderName || mobile) && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl flex-wrap"
              style={{ background: `rgba(38,115,187,0.06)`, border: `1px solid rgba(38,115,187,0.18)` }}>
              <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `rgba(38,115,187,0.12)`, color: OX_BLUE }}>
                <BankIcon />
              </span>
              <div className="flex-1 min-w-0">
                {lenderName && <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{lenderName}</p>}
                {mobile && <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{mobile}</p>}
              </div>
              <span className="text-xs px-3 py-1 rounded-full font-bold"
                style={{ background: 'rgba(53,161,62,0.1)', color: OX_GREEN, border: '1px solid rgba(53,161,62,0.25)' }}>
                ✓ Connected
              </span>
              {lenderId && (
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg"
                  style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  ID: {lenderId}
                </span>
              )}
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Total Participated"
              value={fmt(totalParticipated)}
              sub={`${deals.length} deal${deals.length !== 1 ? 's' : ''}`}
              color={OX_BLUE}
              Icon={WalletIcon}
            />
            <KpiCard
              label="Running Deals"
              value={String(runningCount)}
              sub="Currently active"
              color={OX_GREEN}
              Icon={TrendIcon}
            />
            <KpiCard
              label="Avg. ROI"
              value={`${avgRoi}%`}
              sub="Across all deals"
              color={OX_ORANGE}
              Icon={TrendIcon}
            />
            <KpiCard
              label="Withdrawable"
              value={String(withdrawableCount)}
              sub="Deals with withdraw: YES"
              color="#818cf8"
              Icon={WalletIcon}
            />
          </div>

          {/* Search + Status filter */}
          {deals.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="text"
                placeholder="Search by deal name, borrower or ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 min-w-[180px] px-3 py-2 rounded-xl text-sm"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                {uniqueStatuses.map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={statusFilter === s
                      ? { background: `linear-gradient(135deg,${OX_ORANGE},#d96b00)`, color: '#fff', boxShadow: '0 2px 8px rgba(245,131,17,0.3)' }
                      : { background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }
                    }>
                    {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Deal list */}
          {deals.length === 0 ? (
            <div className="rounded-2xl py-16 flex flex-col items-center gap-4 text-center"
              style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
              <p className="text-3xl">📭</p>
              <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>No OxyLoans deals found</p>
              {lenderName && (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Account: <span className="font-semibold" style={{ color: OX_ORANGE }}>{lenderName}</span>
                </p>
              )}
              {raw?.count != null && (
                <p className="text-xs px-3 py-1 rounded-full"
                  style={{ background: 'rgba(245,131,17,0.08)', color: OX_ORANGE, border: '1px solid rgba(245,131,17,0.2)' }}>
                  Server count: {raw.count}
                </p>
              )}
            </div>
          ) : filteredDeals.length === 0 ? (
            <div className="rounded-2xl py-12 flex flex-col items-center gap-3 text-center"
              style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
              <p className="text-2xl">🔍</p>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>No deals match your filter</p>
              <button onClick={() => { setSearch(''); setStatusFilter('all'); }}
                className="text-xs font-bold px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(245,131,17,0.1)', color: OX_ORANGE, border: '1px solid rgba(245,131,17,0.25)' }}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                Showing {filteredDeals.length} of {deals.length} deal{deals.length !== 1 ? 's' : ''}
              </p>
              {filteredDeals.map((deal, i) => (
                <DealCard key={deal.dealId ?? i} deal={deal} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
