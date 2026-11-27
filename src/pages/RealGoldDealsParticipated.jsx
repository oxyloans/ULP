import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRunningDeals } from '../api/afterlogin-user';
import { formatINR } from '../utils/currency';

// ─── Colors ───────────────────────────────────────────────────────────────────
const GOLD   = '#f59e0b';
const GOLD2  = '#fbbf24';
const GREEN  = '#10b981';
const BLUE   = '#6366f1';
const PURPLE = '#a855f7';

// ─── Icons ────────────────────────────────────────────────────────────────────
const GoldBarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <path d="M4 9l1.5-3h13L20 9"/>
    <path d="M3 9h18l-1.6 8.2A2 2 0 0 1 17.44 19H6.56a2 2 0 0 1-1.96-1.8z"/>
    <path d="M3 9h18"/>
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const ChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const TrendUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const CoinsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <circle cx="8" cy="8" r="6"/>
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
    <path d="M7 6h1v4"/>
    <path d="m16.71 13.88.7.71-2.82 2.82"/>
  </svg>
);

const BarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n, decimals = 2) {
  if (n == null || isNaN(n)) return '—';
  return Number(n).toFixed(decimals);
}
function fmtINR(n) {
  if (n == null || isNaN(n)) return '—';
  return formatINR(n);
}
function payoutLabel(type) {
  const map = {
    monthly: 'Monthly',
    quartely: 'Quarterly',
    quarterly: 'Quarterly',
    halfly: 'Half-Yearly',
    halfyearly: 'Half-Yearly',
    yearly: 'Yearly',
    endofthedeal: 'End of Deal',
  };
  return map[type?.toLowerCase()] ?? type ?? '—';
}
function payoutColor(type) {
  const map = {
    monthly: GREEN,
    quartely: BLUE,
    quarterly: BLUE,
    halfly: GOLD,
    halfyearly: GOLD,
    yearly: PURPLE,
    endofthedeal: '#06b6d4',
  };
  return map[type?.toLowerCase()] ?? '#818cf8';
}
function subTypeLabel(type) {
  const map = {
    pledginggold: 'Pledging Gold',
    investment: 'Investment',
  };
  return map[type?.toLowerCase()] ?? type ?? '—';
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color, Icon }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden',
        background: `linear-gradient(135deg, ${color}0e 0%, var(--surface-card, #1a1a2e) 100%)`,
        border: `1px solid ${color}28`,
        boxShadow: hovered ? `0 8px 32px rgba(0,0,0,0.18), 0 0 0 1px ${color}30` : `0 2px 16px rgba(0,0,0,0.1)`,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.22s ease', cursor: 'default',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.7 }} />
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`, filter: 'blur(12px)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14, background: `${color}18`, border: `1px solid ${color}30`, color, boxShadow: `0 0 12px ${color}28` }}>
          <Icon />
        </div>
        <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1,
          color: 'var(--text-primary, #fff)', fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 6, color }}>{label}</p>
        {sub && <p style={{ fontSize: 11, marginTop: 3, color: 'var(--text-muted, #888)' }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Deal card ────────────────────────────────────────────────────────────────
function DealCard({ deal }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const payoutType  = deal.amountTye ?? deal.participationType;
  const pc          = payoutColor(payoutType);
  const topups      = Array.isArray(deal.updatedParticipation) ? deal.updatedParticipation : [];
  const baseAmount  = Number(deal.participatedAmount ?? 0);
  const totalAmount = baseAmount + topups.reduce((s, u) => s + Number(u.updationParticipation ?? u.participatedAmount ?? 0), 0);
  const baseGrams   = Number(deal.participationGoldGrams ?? deal.participatedGoldGrams ?? 0);
  const totalGrams  = baseGrams + topups.reduce((s, u) => s + Number(u.participationGoldGrams ?? u.participatedGoldGrams ?? 0), 0);

  return (
    <div style={{
      borderRadius: 18, overflow: 'hidden',
      background: 'var(--surface-card, #1a1a2e)',
      border: `1px solid ${GOLD}20`,
      boxShadow: '0 2px 16px rgba(0,0,0,0.1)',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Top accent */}
      <div style={{ height: 3, background: `linear-gradient(90deg,${GOLD},${BLUE},${GREEN})` }} />

      <div style={{ padding: '18px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary, #fff)',
                whiteSpace: 'normal', overflowWrap: 'anywhere', lineHeight: 1.35, margin: 0 }}>
                {deal.dealName}
              </h3>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999, flexShrink: 0,
                background: `${pc}18`, color: pc, border: `1px solid ${pc}28` }}>
                {payoutLabel(payoutType)}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999, flexShrink: 0,
                background: `${GOLD}12`, color: GOLD, border: `1px solid ${GOLD}25` }}>
                🪙 Real Gold
              </span>
              {deal.dealSubType && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999, flexShrink: 0,
                  background: `${PURPLE}14`, color: PURPLE, border: `1px solid ${PURPLE}28` }}>
                  {subTypeLabel(deal.dealSubType)}
                </span>
              )}
            </div>
            <p style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted, #888)' }}>
              {String(deal.dealId).slice(0, 18)}…
            </p>
          </div>
          <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: GOLD, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
              {Number(totalGrams.toFixed(2)).toLocaleString()} g
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted, #888)', marginTop: 3 }}>Gold Participated</p>
          </div>
        </div>

        <div style={{ height: 1, margin: '14px 0', background: 'var(--border, rgba(255,255,255,0.07))' }} />

        {/* Stat pills */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Amount',    value: fmtINR(totalAmount),                                      color: GREEN  },
            { label: 'Gold',      value: `${Number(totalGrams.toFixed(2)).toLocaleString()} g`,     color: GOLD   },
            { label: 'ROI',       value: `${fmt(deal.rateOfInterest)}%`,                           color: BLUE   },
            { label: 'Date',      value: deal.participatedDate ?? '—',                             color: PURPLE },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px',
              borderRadius: 10, background: `${s.color}0d`, border: `1px solid ${s.color}1e` }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                background: s.color, boxShadow: `0 0 5px ${s.color}` }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted, #888)' }}>{s.label}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expand toggle */}
      <button onClick={() => setExpanded(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', borderTop: `1px solid ${GOLD}18`,
        border: 'none', borderTopStyle: 'solid', borderTopColor: `${GOLD}18`,
        background: expanded ? `${GOLD}0e` : `${GOLD}07`,
        color: GOLD, fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none',
        transition: 'background 0.18s ease',
      }}>
        <span>{expanded ? 'Hide details' : 'View details'}</span>
        <span style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <ChevronDown />
        </span>
      </button>

      {/* Expanded detail rows */}
      {expanded && (
        <div style={{ padding: '16px 20px', borderTop: `1px solid ${GOLD}10`,
          background: 'var(--input-bg, rgba(255,255,255,0.02))', display: 'grid', gap: 10 }}>
          {[
            { label: 'Deal ID',              value: deal.dealId },
            { label: 'Deal Type',            value: deal.globalDealType ?? '—' },
            { label: 'Deal Sub Type',        value: subTypeLabel(deal.dealSubType) },
            { label: 'Payout Type',          value: payoutLabel(payoutType) },
            { label: 'Gold Participated',    value: `${Number(totalGrams.toFixed(2)).toLocaleString()} g` },
            { label: 'Participated Amount',  value: fmtINR(totalAmount) },
            { label: 'Rate of Interest',     value: `${fmt(deal.rateOfInterest)}%` },
            { label: 'Participated Date',    value: deal.participatedDate ?? '—' },
            { label: 'Minimum Participation', value: fmtINR(deal.minimumParticipation) },
            { label: 'Maximum Participation', value: fmtINR(deal.maxParticipation) },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: 10,
              background: 'var(--surface-card, #1a1a2e)', border: '1px solid var(--border, rgba(255,255,255,0.07))' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted, #888)', fontWeight: 600 }}>{r.label}</span>
              <span style={{ fontSize: 12, color: 'var(--text-primary, #fff)', fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all', textAlign: 'right', maxWidth: '60%' }}>
                {r.value}
              </span>
            </div>
          ))}
          {topups.length > 0 && (
            <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--surface-card, #1a1a2e)',
              border: '1px solid var(--border, rgba(255,255,255,0.07))', display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 11, color: GOLD, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Updated Participations ({topups.length})
              </span>
              {topups.map((u, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-primary)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Top-up #{idx + 1} · {u.updatedDate ?? '—'}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                    {fmtINR(u.updationParticipation ?? u.participatedAmount)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => navigate(`/real-gold-lot/participate/${deal.dealId}`)}
            style={{ marginTop: 4, padding: '9px 0', borderRadius: 12, fontSize: 13, fontWeight: 700,
              background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: '#fff', border: 'none',
              cursor: 'pointer', boxShadow: `0 4px 14px ${GOLD}40` }}>
            Add More Investment
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RealGoldDealsParticipated() {
  const navigate = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [payoutFilter, setPayoutFilter] = useState('all');

  const load = () => {
    setLoading(true);
    setError('');
    getRunningDeals()
      .then(res => setData(res))
      .catch(e => setError(e.message ?? 'Failed to load participations'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Filter to REALGOLD only
  const deals = useMemo(() => {
    const info = data?.participationInfo ?? [];
    const map = new Map();
    info
      .filter(p => p.globalDealType === 'REALGOLD')
      .forEach(item => {
        const payout = item.amountTye ?? item.participationType ?? '';
        const key = `${item.dealId}-${payout}`;
        if (!map.has(key)) map.set(key, item);
        else {
          const prev = map.get(key);
          if (Number(item.participatedAmount ?? 0) > Number(prev.participatedAmount ?? 0))
            map.set(key, item);
        }
      });
    return Array.from(map.values());
  }, [data]);

  const filteredDeals = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deals
      .filter(d => payoutFilter === 'all' || (d.amountTye ?? d.participationType ?? '').toLowerCase() === payoutFilter)
      .filter(d => {
        if (!q) return true;
        return (
          (d.dealName ?? '').toLowerCase().includes(q) ||
          String(d.dealId ?? '').toLowerCase().includes(q) ||
          (d.dealSubType ?? '').toLowerCase().includes(q)
        );
      });
  }, [deals, payoutFilter, search]);

  const totalGoldGrams = deals.reduce((s, d) => {
    const topups = Array.isArray(d.updatedParticipation) ? d.updatedParticipation : [];
    const base = Number(d.participationGoldGrams ?? d.participatedGoldGrams ?? 0);
    const extra = topups.reduce((ts, u) => ts + Number(u.participationGoldGrams ?? u.participatedGoldGrams ?? 0), 0);
    return s + base + extra;
  }, 0);
  const totalParticipatedAmount = deals.reduce((s, d) => {
    const topups = Array.isArray(d.updatedParticipation) ? d.updatedParticipation : [];
    const base = Number(d.participatedAmount ?? 0);
    const extra = topups.reduce((ts, u) => ts + Number(u.updationParticipation ?? u.participatedAmount ?? 0), 0);
    return s + base + extra;
  }, 0);
  const avgRoi = deals.length
    ? deals.reduce((s, d) => s + Number(d.rateOfInterest ?? 0), 0) / deals.length
    : 0;

  const payoutOptions = useMemo(() => {
    const types = Array.from(new Set(deals.map(d => (d.amountTye ?? d.participationType ?? '').toLowerCase()).filter(Boolean)));
    return ['all', ...types];
  }, [deals]);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Hero banner ── */}
      <div style={{
        borderRadius: 20, padding: '28px 32px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(120deg,#78350f 0%,#92400e 25%,#b45309 50%,#d97706 75%,#f59e0b 100%)',
        boxShadow: '0 8px 40px rgba(245,158,11,0.25), 0 2px 8px rgba(0,0,0,0.2)',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
          backgroundSize: '800px 100%', animation: 'shimmer 3s linear infinite' }} />
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180,
          borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.5px', color: '#fff', margin: 0 }}>
                Real Gold Participations
              </h1>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px',
                borderRadius: 999, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
                fontSize: 11, fontWeight: 700, color: '#fff' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80',
                  boxShadow: '0 0 6px #4ade80', display: 'inline-block' }} />
                Live
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0 }}>
              Track your running real gold deal participations
            </p>
          </div>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px',
            borderRadius: 12, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
            <RefreshIcon /> Refresh
          </button>
        </div>
      </div>

      {/* ── KPI strip ── */}
      {!loading && deals.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 16 }}>
          <KpiCard label="Active Deals"     value={deals.length}                                               sub="Real gold positions"      color={GOLD}   Icon={GoldBarIcon} />
          <KpiCard label="Total Gold"       value={`${Number(totalGoldGrams.toFixed(2)).toLocaleString()} g`}  sub="Across all REALGOLD deals" color={BLUE}   Icon={BarIcon}     />
          <KpiCard label="Total Amount"     value={fmtINR(totalParticipatedAmount)}                            sub="Total participated value"  color={GREEN}  Icon={CoinsIcon}   />
          <KpiCard label="Avg. Interest"    value={`${fmt(avgRoi)}%`}                                          sub="Rate of interest"          color={PURPLE} Icon={TrendUp}     />
        </div>
      )}

      {/* ── Search + filter bar ── */}
      <div style={{ borderRadius: 14, padding: '12px 16px', background: 'var(--surface-card)',
        border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ width: 15, height: 15, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by deal name or ID…"
            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              borderRadius: 10, fontSize: 13, background: 'var(--input-bg)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', outline: 'none' }} />
        </div>
        {/* Payout filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {payoutOptions.map(opt => (
            <button key={opt} onClick={() => setPayoutFilter(opt)} style={{
              padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: payoutFilter === opt ? `linear-gradient(135deg,${GOLD},${GOLD2})` : 'var(--input-bg)',
              color: payoutFilter === opt ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${payoutFilter === opt ? GOLD : 'var(--border)'}`,
              boxShadow: payoutFilter === opt ? `0 4px 10px ${GOLD}40` : 'none',
              textTransform: 'capitalize',
            }}>
              {opt === 'all' ? 'All' : payoutLabel(opt)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '48px 0' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${GOLD}`,
            borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Loading real gold participations…</span>
        </div>
      ) : error ? (
        <div style={{ padding: '32px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>{error}</p>
          <button onClick={load} style={{ marginTop: 12, padding: '8px 20px', borderRadius: 10, fontSize: 13,
            fontWeight: 700, background: `${GOLD}12`, color: GOLD, border: `1px solid ${GOLD}25`, cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      ) : filteredDeals.length === 0 ? (
        <div style={{ padding: '56px 0', textAlign: 'center',
          background: 'var(--surface-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🪙</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            {search || payoutFilter !== 'all' ? 'No matching participations' : 'No real gold participations yet'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            {search || payoutFilter !== 'all' ? 'Try adjusting your search or filter.' : 'Participate in a real gold deal to get started.'}
          </p>
          {!search && payoutFilter === 'all' && (
            <button onClick={() => navigate('/real-gold-deals')}
              style={{ padding: '10px 24px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: '#fff', border: 'none',
                cursor: 'pointer', boxShadow: `0 4px 14px ${GOLD}40` }}>
              Browse Real Gold Deals
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {filteredDeals.map((deal, i) => <DealCard key={`${deal.dealId}-${i}`} deal={deal} />)}
        </div>
      )}
    </div>
  );
}
