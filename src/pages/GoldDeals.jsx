import { useState, useEffect } from 'react';
import { getGoldDealsEarnings, getGoldGrowthDetail } from '../api/afterlogin-user';

// ─── Colors ───────────────────────────────────────────────────────────────────
const GOLD   = '#f59e0b';
const GOLD2  = '#fbbf24';
const GREEN  = '#10b981';
const BLUE   = '#6366f1';
const PURPLE = '#a855f7';

// ─── Icons ────────────────────────────────────────────────────────────────────
const GoldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <circle cx="12" cy="12" r="10" />
    <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor" stroke="none" fontWeight="bold">₹</text>
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const ChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const TrendUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const CoinsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
    <path d="m16.71 13.88.7.71-2.82 2.82" />
  </svg>
);

const BarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ZapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n, decimals = 2) {
  if (n == null || isNaN(n)) return '—';
  return Number(n).toFixed(decimals);
}

function fmtINR(n) {
  if (n == null || isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000)   return `₹${(n / 100000).toFixed(2)}L`;
  if (abs >= 1000)     return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function payoutLabel(type) {
  const map = { monthly: 'Monthly', quarterly: 'Quarterly', halfyearly: 'Half-Yearly', yearly: 'Yearly' };
  return map[type?.toLowerCase()] ?? type ?? '—';
}

function payoutColor(type) {
  const map = { monthly: GREEN, quarterly: BLUE, halfyearly: GOLD, yearly: PURPLE };
  return map[type?.toLowerCase()] ?? '#818cf8';
}

// ─── Animated progress bar ────────────────────────────────────────────────────
function ProgressBar({ pct, color }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(Math.min(pct, 100)), 200);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div style={{
      height: 6, borderRadius: 999, overflow: 'hidden',
      background: 'var(--bar-track, rgba(255,255,255,0.08))'
    }}>
      <div style={{
        height: '100%', borderRadius: 999,
        width: `${w}%`,
        background: `linear-gradient(90deg, ${color}, ${color}99)`,
        boxShadow: `0 0 8px ${color}66`,
        transition: 'width 1s cubic-bezier(0.4,0,0.2,1)'
      }} />
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color, Icon }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 18,
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${color}0e 0%, var(--surface-card, #1a1a2e) 100%)`,
        border: `1px solid ${color}28`,
        boxShadow: hovered
          ? `0 8px 32px rgba(0,0,0,0.18), 0 0 0 1px ${color}30, inset 0 1px 0 ${color}18`
          : `0 2px 16px rgba(0,0,0,0.1), inset 0 1px 0 ${color}12`,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.22s ease',
        cursor: 'default',
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: 0.7,
      }} />

      {/* Radial glow top-right */}
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
        filter: 'blur(12px)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon box */}
        <div style={{
          width: 38, height: 38, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14,
          background: `${color}18`,
          border: `1px solid ${color}30`,
          color,
          boxShadow: `0 0 12px ${color}28`,
        }}>
          <Icon />
        </div>

        {/* Value */}
        <p style={{
          fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1,
          color: 'var(--text-primary, #fff)',
          fontFamily: "'JetBrains Mono', monospace",
        }}>{value}</p>

        {/* Label */}
        <p style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', marginTop: 6, color,
        }}>{label}</p>

        {/* Sub */}
        {sub && (
          <p style={{ fontSize: 11, marginTop: 3, color: 'var(--text-muted, #888)' }}>{sub}</p>
        )}
      </div>
    </div>
  );
}

// ─── Gold Growth Detail Panel ─────────────────────────────────────────────────
function GoldGrowthPanel({ dealId }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    setLoading(true); setError('');
    getGoldGrowthDetail(dealId)
      .then(res => setData(Array.isArray(res) ? res : [res]))
      .catch(e => setError(e.message ?? 'Failed to load gold growth data'))
      .finally(() => setLoading(false));
  }, [dealId]);

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '20px 22px',
      borderTop: `1px solid ${GOLD}22`,
      background: `${GOLD}05`,
    }}>
      {/* Spinner */}
      <div style={{
        width: 18, height: 18, borderRadius: '50%',
        border: `2px solid ${GOLD}40`,
        borderTopColor: GOLD,
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #888)' }}>
        Loading gold growth data…
      </span>
    </div>
  );

  if (error) return (
    <div style={{
      padding: '14px 22px', fontSize: 12, fontWeight: 600, color: '#ef4444',
      borderTop: `1px solid ${GOLD}22`, background: `${GOLD}05`,
    }}>{error}</div>
  );

  if (!data?.length) return (
    <div style={{
      padding: '14px 22px', fontSize: 12, color: 'var(--text-muted, #888)',
      borderTop: `1px solid ${GOLD}22`, background: `${GOLD}05`,
    }}>No growth data available</div>
  );

  return (
    <div style={{
      borderTop: `1px solid ${GOLD}22`,
      background: `${GOLD}04`,
      padding: '18px 22px',
    }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${GOLD}18`, border: `1px solid ${GOLD}30`, color: GOLD,
        }}>
          <CoinsIcon />
        </div>
        <p style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: GOLD,
        }}>Gold Growth Breakdown</p>
      </div>

      <div style={{ display: 'grid', gap: 14 }}>
        {data.map((g, i) => (
          <div key={g.participationId ?? i} style={{
            borderRadius: 14,
            padding: '16px 18px',
            background: `${GOLD}07`,
            border: `1px solid ${GOLD}20`,
            display: 'grid', gap: 14,
          }}>
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted, #888)' }}>
                  ID:{' '}
                  <span style={{ color: 'var(--text-primary, #fff)' }}>
                    {String(g.participationId ?? '').slice(0, 14)}…
                  </span>
                </p>
                <p style={{ fontSize: 11, marginTop: 4, color: 'var(--text-muted, #888)' }}>
                  Transferred:{' '}
                  <span style={{ fontWeight: 700, color: 'var(--text-primary, #fff)' }}>{g.amountTransferDate}</span>
                  {'  ·  '}
                  Approved:{' '}
                  <span style={{ fontWeight: 700, color: 'var(--text-primary, #fff)' }}>{g.adminApprovedDate}</span>
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontSize: 22, fontWeight: 800, color: GREEN,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{fmtINR(g.approvedAmount)}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted, #888)', marginTop: 2 }}>Approved Amount</p>
              </div>
            </div>

            {/* Stats 2×4 grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 8,
            }}>
              {[
                { label: 'Gold Allocated',    value: `${fmt(g.goldAllocationForParticipatedAmount)} g`, color: GOLD   },
                { label: 'Offer Growth',      value: `${fmt(g.offerGoldGrowth)}%`,                      color: GOLD2  },
                { label: 'Growth %',          value: `${fmt(g.goldGrowthPercentage)}%`,                 color: GREEN  },
                { label: 'Growth Amount',     value: fmtINR(g.goldGrowthAmount),                        color: GREEN  },
                { label: 'Full Gold Value',   value: fmtINR(g.fullGoldGrowthAmount),                    color: BLUE   },
                { label: 'Current Rate',      value: `₹${(g.currentDayGoldRate ?? 0).toLocaleString('en-IN')}/g`, color: GOLD },
                { label: 'Entry Rate',        value: `₹${(g.onParticipatedGoldRate ?? 0).toLocaleString('en-IN')}/g`, color: 'var(--text-muted, #888)' },
              ].map(s => (
                <div key={s.label} style={{
                  borderRadius: 10, padding: '10px 12px',
                  background: `${s.color === 'var(--text-muted, #888)' ? 'rgba(255,255,255' : s.color.replace('#', 'rgba(').replace(/(..)(..)(..)/, (_, r, g2, b) => `${parseInt(r,16)},${parseInt(g2,16)},${parseInt(b,16)}`)}08)`,
                  border: `1px solid ${s.color === 'var(--text-muted, #888)' ? 'rgba(255,255,255,0.08)' : s.color + '20'}`,
                }}>
                  <p style={{ fontSize: 10, color: 'var(--text-muted, #888)', marginBottom: 4 }}>{s.label}</p>
                  <p style={{
                    fontSize: 13, fontWeight: 800, color: s.color,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Rate comparison */}
            {g.onParticipatedGoldRate > 0 && g.currentDayGoldRate > 0 && (() => {
              const gainPct = ((g.currentDayGoldRate - g.onParticipatedGoldRate) / g.onParticipatedGoldRate) * 100;
              return (
                <div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: 8, flexWrap: 'wrap', gap: 6,
                  }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted, #888)' }}>
                      Entry ₹{g.onParticipatedGoldRate?.toLocaleString('en-IN')}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 10px',
                      borderRadius: 999, background: `${GREEN}18`,
                      border: `1px solid ${GREEN}30`, color: GREEN,
                    }}>
                      +{fmt(gainPct)}% gain
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted, #888)' }}>
                      Current ₹{g.currentDayGoldRate?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <ProgressBar
                    pct={Math.min(gainPct * 5, 100)}
                    color={GREEN}
                  />
                </div>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Deal Card ────────────────────────────────────────────────────────────────
function DealCard({ deal }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered]   = useState(false);
  const pc = payoutColor(deal.participationType);
  const hasGoldGrowth = deal.goldGrowthPercentage > 0;
  const total = deal.totalUserEarnedPercentage || 0;
  const interestPct = total > 0 ? (deal.interestEarnedPercentage / total) * 100 : 0;
  const goldPct     = total > 0 ? (deal.goldGrowthPercentage / total) * 100 : 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 18,
        overflow: 'hidden',
        background: 'var(--surface-card, #1a1a2e)',
        border: `1px solid ${hasGoldGrowth ? `${GOLD}28` : 'var(--border, rgba(255,255,255,0.08))'}`,
        boxShadow: hovered
          ? `0 8px 32px rgba(0,0,0,0.18), 4px 0 0 ${pc} inset`
          : `0 2px 12px rgba(0,0,0,0.08), 3px 0 0 ${pc} inset`,
        transition: 'box-shadow 0.22s ease',
        /* left accent border via inset box-shadow */
      }}
    >
      {/* Card body */}
      <div style={{ padding: '18px 20px' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          {/* Left */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <h3 style={{
                fontSize: 15, fontWeight: 800,
                color: 'var(--text-primary, #fff)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                maxWidth: 220,
              }}>{deal.dealName}</h3>
              {/* Payout badge */}
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 10px',
                borderRadius: 999, flexShrink: 0,
                background: `${pc}18`, color: pc, border: `1px solid ${pc}28`,
              }}>{payoutLabel(deal.participationType)}</span>
            </div>
            {/* Deal ID mono */}
            <p style={{
              fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--text-muted, #888)',
            }}>{String(deal.dealId).slice(0, 18)}…</p>
          </div>

          {/* Right: total earned */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{
              fontSize: 24, fontWeight: 800, color: GREEN,
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: 1,
            }}>+{fmt(deal.totalUserEarnedPercentage)}%</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted, #888)', marginTop: 3 }}>Total Earned</p>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: 1, margin: '14px 0',
          background: 'var(--border, rgba(255,255,255,0.07))',
        }} />

        {/* Stat pills row */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Interest',    value: `${fmt(deal.interestEarnedPercentage)}%`, color: BLUE,  dot: true },
            { label: 'Gold Growth', value: `${fmt(deal.goldGrowthPercentage)}%`,      color: GOLD,  dot: true },
            { label: 'Total',       value: `${fmt(deal.totalUserEarnedPercentage)}%`, color: GREEN, dot: true },
          ].map(s => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '6px 12px', borderRadius: 10,
              background: `${s.color}0d`, border: `1px solid ${s.color}1e`,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                background: s.color, boxShadow: `0 0 5px ${s.color}`,
              }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted, #888)' }}>{s.label}</span>
              <span style={{
                fontSize: 12, fontWeight: 800, color: s.color,
                fontFamily: "'JetBrains Mono', monospace",
              }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Segmented progress bar */}
        {total > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{
              height: 8, borderRadius: 999, overflow: 'hidden',
              display: 'flex', gap: 2,
              background: 'var(--bar-track, rgba(255,255,255,0.06))',
            }}>
              <SegBar pct={interestPct} color={BLUE} />
              {deal.goldGrowthPercentage > 0 && <SegBar pct={goldPct} color={GOLD} />}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
              <span style={{ fontSize: 10, color: BLUE }}>Interest {fmt(deal.interestEarnedPercentage)}%</span>
              {deal.goldGrowthPercentage > 0 && (
                <span style={{ fontSize: 10, color: GOLD }}>Gold Growth {fmt(deal.goldGrowthPercentage)}%</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expand button */}
      {hasGoldGrowth && (
        <button
          onClick={() => setExpanded(o => !o)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 20px',
            borderTop: `1px solid ${GOLD}18`,
            borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
            background: expanded ? `${GOLD}0e` : `${GOLD}07`,
            color: GOLD, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', outline: 'none',
            transition: 'background 0.18s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = `${GOLD}14`}
          onMouseLeave={e => e.currentTarget.style.background = expanded ? `${GOLD}0e` : `${GOLD}07`}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <CoinsIcon />
            View Gold Growth Details
          </span>
          <span style={{
            display: 'inline-flex',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.22s ease',
          }}>
            <ChevronDown />
          </span>
        </button>
      )}

      {/* Expanded panel */}
      {expanded && <GoldGrowthPanel dealId={deal.dealId} dealName={deal.dealName} />}
    </div>
  );
}

// Animated segment for the segmented bar
function SegBar({ pct, color }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 250);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div style={{
      height: '100%',
      width: `${w}%`,
      background: color,
      boxShadow: `0 0 6px ${color}66`,
      transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
      borderRadius: 999,
    }} />
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function GoldDeals() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = () => {
    setLoading(true); setError('');
    getGoldDealsEarnings()
      .then(res => setData(res))
      .catch(e => setError(e.message ?? 'Failed to load gold deals'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const deals = data?.userEarenInfoResponse ?? [];

  // ── Loading ──
  if (loading) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 20, padding: '80px 0',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-ring {
          0%   { transform: scale(0.9); opacity: 0.7; }
          50%  { transform: scale(1.1); opacity: 0.3; }
          100% { transform: scale(0.9); opacity: 0.7; }
        }
      `}</style>
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        {/* Pulsing ring */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `2px solid ${GOLD}40`,
          animation: 'pulse-ring 1.6s ease-in-out infinite',
        }} />
        {/* Spinner */}
        <div style={{
          position: 'absolute', inset: 8, borderRadius: '50%',
          border: `3px solid ${GOLD}30`,
          borderTopColor: GOLD,
          animation: 'spin 0.9s linear infinite',
        }} />
        {/* Center icon */}
        <div style={{
          position: 'absolute', inset: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: GOLD,
        }}>
          <GoldIcon />
        </div>
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted, #888)' }}>
        Loading gold deals…
      </p>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 16, padding: '80px 0',
    }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>{error}</p>
      <button onClick={load} style={{
        padding: '8px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700,
        background: `${GOLD}18`, color: GOLD, border: `1px solid ${GOLD}30`,
        cursor: 'pointer',
      }}>Retry</button>
    </div>
  );

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>

      {/* ── Hero Banner ── */}
      <div style={{
        borderRadius: 20,
        padding: '28px 32px',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(120deg, #78350f 0%, #92400e 25%, #b45309 50%, #d97706 75%, #f59e0b 100%)`,
        boxShadow: `0 8px 40px rgba(245,158,11,0.25), 0 2px 8px rgba(0,0,0,0.2)`,
      }}>
        {/* Shimmer overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
          backgroundSize: '800px 100%',
          animation: 'shimmer 3s linear infinite',
        }} />
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 180, height: 180,
          borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, right: 80, width: 100, height: 100,
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
        }} />

        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16,
        }}>
          {/* Left: title block */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{
                fontSize: 30, fontWeight: 900, letterSpacing: '-0.5px',
                color: '#fff', margin: 0,
              }}>Gold Deals</h1>
              {/* Live badge */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', borderRadius: 999,
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.3)',
                fontSize: 11, fontWeight: 700, color: '#fff',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#4ade80',
                  boxShadow: '0 0 6px #4ade80',
                  display: 'inline-block',
                }} />
                Live
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0 }}>
              Track your gold investment performance
            </p>
          </div>

          {/* Right: refresh */}
          <button onClick={load} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 18px', borderRadius: 12,
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', backdropFilter: 'blur(8px)',
            transition: 'background 0.18s ease',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <RefreshIcon /> Refresh
          </button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      {/* <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 14,
      }}>
        <KpiCard
          label="Total Earned"
          value={`${fmt(data?.allDealsEarnedPercentage)}%`}
          sub="Across all deals"
          color={GREEN}
          Icon={TrendUp}
        />
        <KpiCard
          label="Avg per Deal"
          value={`${fmt(data?.averageAllDealsPercentage)}%`}
          sub="Average return"
          color={GOLD}
          Icon={ZapIcon}
        />
        <KpiCard
          label="Active Deals"
          value={String(deals.length)}
          sub="Participated deals"
          color={BLUE}
          Icon={BarIcon}
        />
        <KpiCard
          label="Gold Growth Deals"
          value={String(deals.filter(d => d.goldGrowthPercentage > 0).length)}
          sub="With gold appreciation"
          color={PURPLE}
          Icon={ShieldIcon}
        />
      </div> */}

      {/* ── Deals list ── */}
      {deals.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 14, padding: '60px 0',
          borderRadius: 18,
          background: 'var(--surface-card, #1a1a2e)',
          border: '1px solid var(--border, rgba(255,255,255,0.08))',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${GOLD}12`, border: `1px solid ${GOLD}25`, color: GOLD,
          }}>
            <CoinsIcon />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #fff)', marginBottom: 6 }}>
              No gold deals found
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted, #888)' }}>
              You haven't participated in any gold deals yet.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {deals.map(deal => (
            <DealCard key={`${deal.dealId}-${deal.participationType}`} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
