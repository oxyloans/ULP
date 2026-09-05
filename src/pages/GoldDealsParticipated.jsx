import { Fragment, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'antd';
import {
  downloadGoldMouForCurrentUser,
  getAllParticipationByUser,
  getGoldDealsEarnings,
  getGoldGrowthDetail,
  getRunningDeals,
  getWalletBalance,
  getUserViewInterestStatement,
  participateInDeal,
  userWithdrawalReturned,
} from '../api/afterlogin-user';
import { formatINR } from '../utils/currency';

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
  return formatINR(n);
}

function payoutLabel(type) {
  const map = { monthly: 'Monthly', quarterly: 'Quarterly', halfyearly: 'Half-Yearly', yearly: 'Yearly' };
  return map[type?.toLowerCase()] ?? type ?? '—';
}

function payoutColor(type) {
  const map = { monthly: GREEN, quarterly: BLUE, halfyearly: GOLD, yearly: PURPLE };
  return map[type?.toLowerCase()] ?? '#818cf8';
}

function normalizeStatusLabel(status) {
  const key = String(status ?? '').toUpperCase();
  if (key === 'CALLFORMONEY') return 'CALL FOR MONEY';
  if (key === 'VIEWANDAPPROVE') return 'VIEW & APPROVE';
  if (key === 'NOTVIEW') return 'NOT VIEWED';
  return key || 'PARTICIPATED';
}

function dedupeRunningDeals(rows) {
  const map = new Map();
  (rows ?? []).forEach(item => {
    const key = `${item?.dealId ?? ''}-${item?.participationType ?? ''}`;
    if (!key || key === '-') return;
    if (!map.has(key)) {
      map.set(key, item);
      return;
    }
    const prev = map.get(key);
    // Keep the entry with the highest total percentage when duplicates are returned.
    if (Number(item?.totalUserEarnedPercentage ?? 0) > Number(prev?.totalUserEarnedPercentage ?? 0)) {
      map.set(key, item);
    }
  });
  return Array.from(map.values());
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
function DealCard({ deal, onOpenDetails, onDownloadMou, onRealizationPayout }) {
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
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <h3 style={{
                fontSize: 15, fontWeight: 800,
                color: 'var(--text-primary, #fff)',
                whiteSpace: 'normal',
                overflowWrap: 'anywhere',
                lineHeight: 1.35,
                margin: 0,
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
          <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
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

        {/* Actions row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <button
            onClick={onRealizationPayout}
            style={{
              padding: '5px 9px',
              borderRadius: 9,
              fontSize: 11,
              fontWeight: 700,
              border: `1px solid ${BLUE}35`,
              background: `${BLUE}12`,
              color: BLUE,
              cursor: 'pointer',
            }}>
            Realization Payout
          </button>
          <button
            onClick={onDownloadMou}
            style={{
              padding: '5px 9px',
              borderRadius: 9,
              fontSize: 11,
              fontWeight: 700,
              border: `1px solid ${PURPLE}35`,
              background: `${PURPLE}12`,
              color: PURPLE,
              cursor: 'pointer',
            }}>
            Download MOU
          </button>
          <button
            onClick={onOpenDetails}
            style={{
              padding: '5px 10px',
              borderRadius: 9,
              fontSize: 11,
              fontWeight: 700,
              border: `1px solid ${GOLD}35`,
              background: `${GOLD}12`,
              color: GOLD,
              cursor: 'pointer',
            }}>
            View Details
          </button>
        </div>

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

function ProcessedDealCard({ deal, onDownloadMou, onRealizationPayout, onOpenDetails }) {
  const status = (deal.userParticipationStatus ?? 'PARTICIPATED').toUpperCase();
  const auctionLabel = (deal.auctionType ?? '').toLowerCase() === 'open' ? 'Open' : 'Closed';
  const statusColor = status === 'MOU' ? GREEN : status === 'CALLFORMONEY' ? GOLD : BLUE;

  return (
    <div style={{
      borderRadius: 20,
      overflow: 'hidden',
      background: 'var(--surface-card, #1a1a2e)',
      border: `1px solid ${statusColor}2b`,
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      position: 'relative',
    }}>
      {/* top accent */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${statusColor}, ${statusColor}55)`,
      }} />

      <div style={{ padding: '16px 16px 14px', display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <p style={{
              fontSize: 13,
              lineHeight: 1.35,
              fontWeight: 800,
              letterSpacing: '0.01em',
              color: 'var(--text-primary, #fff)',
              maxWidth: 250,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {deal.propertyName}
            </p>
            <p style={{ fontSize: 10, marginTop: 6, color: 'var(--text-muted, #888)', fontFamily: "'JetBrains Mono', monospace" }}>
              {String(deal.propertyId ?? '').slice(0, 8)}...{String(deal.propertyId ?? '').slice(-4)}
            </p>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 800, padding: '5px 10px',
            borderRadius: 999, color: statusColor, background: `${statusColor}18`,
            border: `1px solid ${statusColor}33`,
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}>{normalizeStatusLabel(status)}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
          <div style={{ padding: '8px 10px', borderRadius: 12, background: `${BLUE}10`, border: `1px solid ${BLUE}25` }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted, #888)', fontWeight: 600 }}>Contributed</span>
            <p style={{ marginTop: 4, fontSize: 14, fontWeight: 900, color: BLUE, fontFamily: "'JetBrains Mono', monospace" }}>
              {fmtINR(deal.participatedAmount)}
            </p>
          </div>
          <div style={{ padding: '8px 10px', borderRadius: 12, background: `${GREEN}10`, border: `1px solid ${GREEN}25` }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted, #888)', fontWeight: 600 }}>Reserved</span>
            <p style={{ marginTop: 4, fontSize: 14, fontWeight: 900, color: GREEN, fontFamily: "'JetBrains Mono', monospace" }}>
              {fmtINR(deal.reservedPrice)}
            </p>
          </div>
          <div style={{ padding: '8px 10px', borderRadius: 12, background: `${PURPLE}10`, border: `1px solid ${PURPLE}25` }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted, #888)', fontWeight: 600 }}>Type</span>
            <p style={{ marginTop: 4, fontSize: 14, fontWeight: 900, color: PURPLE }}>
              {auctionLabel}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={onRealizationPayout}
            style={{
              padding: '8px 12px',
              borderRadius: 11,
              fontSize: 12,
              fontWeight: 800,
              border: `1px solid ${BLUE}35`,
              background: `${BLUE}12`,
              color: BLUE,
              cursor: 'pointer',
            }}>
            Realization Payout
          </button>
          <button
            onClick={onDownloadMou}
            style={{
              padding: '8px 12px',
              borderRadius: 11,
              fontSize: 12,
              fontWeight: 800,
              border: `1px solid ${PURPLE}35`,
              background: `${PURPLE}12`,
              color: PURPLE,
              cursor: 'pointer',
            }}>
            Download MOU
          </button>
          <button
            onClick={onOpenDetails}
            style={{
              padding: '5px 10px',
              borderRadius: 9,
              fontSize: 11,
              fontWeight: 700,
              border: `1px solid ${GOLD}35`,
              background: `${GOLD}12`,
              color: GOLD,
              cursor: 'pointer',
            }}>
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Gold Withdrawal Modal ────────────────────────────────────────────────────
const RED = '#ef4444';

function GoldWithdrawalModal({ deal, totalInvested, onClose, onSuccess }) {
  const [amount, setAmount]   = useState('');
  const [step, setStep]       = useState('input'); // 'input' | 'confirm' | 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const parsed  = parseFloat(amount);
  const isValid = !isNaN(parsed) && parsed > 0 && parsed <= totalInvested;

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await userWithdrawalReturned({ dealId: deal.dealId, withdrawalAmount: parsed });
      setStep('success');
    } catch (e) {
      setError(e?.message ?? 'Withdrawal request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open
      onCancel={step === 'success' ? () => { onSuccess(); onClose(); } : onClose}
      footer={null}
      title={
        <div style={{ paddingRight: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: RED, margin: 0 }}>
            Withdrawal Request
          </p>
          <h2 style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {deal.dealName}
          </h2>
        </div>
      }
      styles={{
        content: { background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: '0 32px 80px rgba(0,0,0,0.35)' },
        header:  { background: 'transparent', borderBottom: '1px solid var(--border)', paddingBottom: 12 },
        body:    { padding: 20 },
        close:   { color: 'var(--text-muted)' },
      }}
      width="min(480px, 96vw)"
      centered
    >
      {step === 'success' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${GREEN}18`, border: `2px solid ${GREEN}40` }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Withdrawal Requested!</p>
            <p style={{ fontSize: 13, marginTop: 6, color: 'var(--text-muted)' }}>
              Your withdrawal of{' '}
              <span style={{ fontWeight: 700, color: GREEN }}>{fmtINR(parsed)}</span>
              {' '}from <span style={{ fontWeight: 600 }}>{deal.dealName}</span> has been submitted successfully.
            </p>
          </div>
          <button
            onClick={() => { onSuccess(); onClose(); }}
            style={{ padding: '10px 28px', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', border: 'none', background: `linear-gradient(135deg,${GREEN},#059669)`, boxShadow: `0 4px 14px ${GREEN}40` }}
          >
            Done
          </button>
        </div>
      ) : step === 'confirm' ? (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ borderRadius: 12, padding: 16, background: `${RED}08`, border: `1px solid ${RED}25` }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Confirm Withdrawal</p>
            <p style={{ fontSize: 12, marginTop: 4, color: 'var(--text-muted)' }}>You are about to request a withdrawal of:</p>
            <p style={{ fontSize: 26, fontWeight: 900, marginTop: 8, color: RED, fontFamily: "'JetBrains Mono',monospace" }}>{fmtINR(parsed)}</p>
            <p style={{ fontSize: 12, marginTop: 4, color: 'var(--text-muted)' }}>
              from <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{deal.dealName}</span>
            </p>
          </div>
          {error && <p style={{ fontSize: 12, fontWeight: 600, color: RED, margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { setStep('input'); setError(''); }}
              disabled={loading}
              style={{ flex: 1, padding: '10px 0', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{ flex: 1, padding: '10px 0', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', border: 'none', background: loading ? `${RED}60` : `linear-gradient(135deg,${RED},#dc2626)`, boxShadow: `0 4px 14px ${RED}35` }}
            >
              {loading ? 'Processing…' : 'Confirm Withdrawal'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ borderRadius: 12, padding: 12, background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Total Invested</p>
            <p style={{ fontSize: 18, fontWeight: 900, color: BLUE, fontFamily: "'JetBrains Mono',monospace", margin: '4px 0 0' }}>{fmtINR(totalInvested)}</p>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              Withdrawal Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Enter amount"
              min={1}
              max={totalInvested}
              style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 14px', borderRadius: 12, fontSize: 13, fontWeight: 600, outline: 'none', background: 'var(--input-bg)', border: `1px solid ${amount && !isValid ? RED : 'var(--border)'}`, color: 'var(--text-primary)', boxSizing: 'border-box' }}
            />
            {amount && !isValid && (
              <p style={{ fontSize: 11, marginTop: 4, color: RED }}>Enter a valid amount between ₹1 and {fmtINR(totalInvested)}</p>
            )}
          </div>
          <button
            onClick={() => setStep('confirm')}
            disabled={!isValid}
            style={{ width: '100%', padding: '11px 0', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', cursor: isValid ? 'pointer' : 'not-allowed', border: 'none', background: isValid ? `linear-gradient(135deg,${RED},#dc2626)` : `${RED}40`, boxShadow: isValid ? `0 4px 14px ${RED}35` : 'none' }}
          >
            Proceed to Confirm
          </button>
        </div>
      )}
    </Modal>
  );
}

// ─── Gold Add More Modal ───────────────────────────────────────────────────────
const PAYOUT_OPTIONS = [
  { value: 'MONTHLY',      label: 'Monthly'      },
  { value: 'QUARTELY',     label: 'Quarterly'    },
  { value: 'HALFLY',       label: 'Half-Yearly'  },
  { value: 'YEARLY',       label: 'Yearly'       },
  { value: 'ENDOFTHEDEAL', label: 'End of Deal'  },
];

function GoldAddMoreModal({ deal, onClose, onSuccess }) {
  // Payout type is locked to the existing participation's choice
  const lockedPayout = deal.amountTye ?? 'MONTHLY';

  const [amount, setAmount]         = useState('');
  const [step, setStep]             = useState('input'); // 'input' | 'confirm' | 'success'
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);

  // Load wallet balance on mount
  useEffect(() => {
    getWalletBalance()
      .then(data => {
        const bal = data?.currentWalletAmount ?? null;
        setWalletBalance(typeof bal === 'number' ? bal : null);
      })
      .catch(() => setWalletBalance(null))
      .finally(() => setWalletLoading(false));
  }, []);

  const parsed         = parseFloat(amount);
  const totalInvested  = deal._totalInvested ?? 0;
  const maxParticipation = deal._maxParticipation ?? 0;  // 0 means no cap
  const balance        = walletBalance ?? 0;
  const balanceAfter   = balance - (parsed || 0);

  // Validation
  const walletInsufficient = !isNaN(parsed) && parsed > 0 && parsed > balance;
  const belowMin           = !isNaN(parsed) && parsed > 0 && parsed < 1;
  const exceedsMax         = maxParticipation > 0 && !isNaN(parsed) && parsed > 0 && (totalInvested + parsed) > maxParticipation;
  const hasError           = walletInsufficient || belowMin || exceedsMax;
  const isValid            = !isNaN(parsed) && parsed > 0 && !hasError;
  const remainingCapacity  = maxParticipation > 0 ? Math.max(0, maxParticipation - totalInvested) : null;

  const getValidationMsg = () => {
    if (walletInsufficient) return `Exceeds your wallet balance of ${fmtINR(balance)}`;
    if (exceedsMax)         return `Exceeds per-user maximum. You can add at most ${fmtINR(remainingCapacity)} more (max ${fmtINR(maxParticipation)}, invested ${fmtINR(totalInvested)})`;
    if (belowMin)           return 'Enter an amount greater than ₹0';
    return '';
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await participateInDeal({
        dealId:             deal.dealId,
        lenderReturnsType:  lockedPayout,
        participatedAmount: parsed,
        rateofinterest:     deal.rateOfInterest ?? 0,
      });
      setStep('success');
    } catch (e) {
      setError(e?.message ?? 'Participation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const payoutLabel = PAYOUT_OPTIONS.find(o => o.value === lockedPayout)?.label ?? lockedPayout;

  return (
    <Modal
      open
      onCancel={step === 'success' ? () => { onSuccess(); onClose(); } : onClose}
      footer={null}
      title={
        <div style={{ paddingRight: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: GREEN, margin: 0 }}>
            Add More Funds
          </p>
          <h2 style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {deal.dealName}
          </h2>
        </div>
      }
      styles={{
        content: { background: 'var(--surface-card)', border: `1px solid ${GREEN}28`, borderRadius: 16, boxShadow: '0 32px 80px rgba(0,0,0,0.35)' },
        header:  { background: 'transparent', borderBottom: '1px solid var(--border)', paddingBottom: 12 },
        body:    { padding: 20 },
        close:   { color: 'var(--text-muted)' },
      }}
      width="min(480px, 96vw)"
      centered
    >
      {step === 'success' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${GREEN}18`, border: `2px solid ${GREEN}40` }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Funds Added!</p>
            <p style={{ fontSize: 13, marginTop: 6, color: 'var(--text-muted)' }}>
              Your top-up of{' '}
              <span style={{ fontWeight: 700, color: GREEN }}>{fmtINR(parsed)}</span>
              {' '}to <span style={{ fontWeight: 600 }}>{deal.dealName}</span> has been submitted.
            </p>
          </div>
          <button
            onClick={() => { onSuccess(); onClose(); }}
            style={{ padding: '10px 28px', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', border: 'none', background: `linear-gradient(135deg,${GREEN},#059669)`, boxShadow: `0 4px 14px ${GREEN}40` }}
          >
            Done
          </button>
        </div>

      ) : step === 'confirm' ? (
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ borderRadius: 12, padding: 16, background: `${GREEN}08`, border: `1px solid ${GREEN}25` }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>You are about to add:</p>
            <p style={{ fontSize: 26, fontWeight: 900, marginTop: 6, color: GREEN, fontFamily: "'JetBrains Mono',monospace" }}>{fmtINR(parsed)}</p>
          </div>

          {/* Summary rows */}
          <div style={{ display: 'grid', gap: 6 }}>
            {[
              { label: 'Deal',            value: deal.dealName,              color: 'var(--text-primary)' },
              { label: 'Payout Type',     value: payoutLabel,                color: GOLD                  },
              { label: 'ROI',             value: `${deal.rateOfInterest ?? 0}%`, color: BLUE              },
              { label: 'Existing Total',  value: fmtINR(totalInvested),      color: BLUE                  },
              { label: 'New Total',       value: fmtINR(totalInvested + parsed), color: GREEN             },
              { label: 'Wallet After',    value: fmtINR(balanceAfter),       color: balanceAfter >= 0 ? GREEN : RED },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: r.color, fontFamily: "'JetBrains Mono',monospace" }}>{r.value}</span>
              </div>
            ))}
          </div>

          {error && <p style={{ fontSize: 12, fontWeight: 600, color: RED, margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { setStep('input'); setError(''); }}
              disabled={loading}
              style={{ flex: 1, padding: '10px 0', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{ flex: 1, padding: '10px 0', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', border: 'none', background: loading ? `${GREEN}60` : `linear-gradient(135deg,${GREEN},#059669)`, boxShadow: `0 4px 14px ${GREEN}35` }}
            >
              {loading ? 'Processing…' : 'Confirm Top-Up'}
            </button>
          </div>
        </div>

      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {/* Wallet + investment summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ borderRadius: 12, padding: 12, background: `${BLUE}0d`, border: `1px solid ${BLUE}20` }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Wallet Balance</p>
              {walletLoading
                ? <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', margin: '4px 0 0' }}>Loading…</p>
                : <p style={{ fontSize: 15, fontWeight: 900, color: BLUE, fontFamily: "'JetBrains Mono',monospace", margin: '4px 0 0' }}>{fmtINR(balance)}</p>
              }
            </div>
            <div style={{ borderRadius: 12, padding: 12, background: `${GOLD}0d`, border: `1px solid ${GOLD}20` }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Already Invested</p>
              <p style={{ fontSize: 15, fontWeight: 900, color: GOLD, fontFamily: "'JetBrains Mono',monospace", margin: '4px 0 0' }}>{fmtINR(totalInvested)}</p>
            </div>
          </div>

          {/* Max capacity bar — only shown when maxParticipation is set */}
          {maxParticipation > 0 && (
            <div style={{ borderRadius: 12, padding: '10px 14px', background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Capacity Used</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtINR(totalInvested)} / {fmtINR(maxParticipation)}</span>
                  {remainingCapacity > 0
                    ? <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: `${GREEN}12`, color: GREEN, border: `1px solid ${GREEN}25` }}>{fmtINR(remainingCapacity)} available</span>
                    : <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: `${RED}12`, color: RED, border: `1px solid ${RED}25` }}>Max reached</span>
                  }
                </div>
              </div>
              <div style={{ height: 6, borderRadius: 999, overflow: 'hidden', background: 'var(--border)' }}>
                <div style={{
                  height: '100%', borderRadius: 999,
                  width: `${Math.min((totalInvested / maxParticipation) * 100, 100)}%`,
                  background: remainingCapacity > 0 ? `linear-gradient(90deg,${BLUE},${GREEN})` : `linear-gradient(90deg,${RED},#dc2626)`,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          )}

          {/* Locked payout type — read-only to match existing participation */}
          <div style={{ borderRadius: 12, padding: '10px 14px', background: `${BLUE}08`, border: `1px solid ${BLUE}20`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Payout Type</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: BLUE, margin: '2px 0 0' }}>{payoutLabel}</p>
            </div>
            <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 999, background: `${BLUE}15`, color: BLUE, border: `1px solid ${BLUE}25` }}>
              Locked to existing choice
            </span>
          </div>

          {/* Amount input */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              Amount to Add
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => { setAmount(e.target.value); setError(''); }}
              placeholder="Enter amount"
              min={1}
              style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 14px', borderRadius: 12, fontSize: 13, fontWeight: 600, outline: 'none', background: 'var(--input-bg)', border: `1px solid ${amount && hasError ? RED : 'var(--border)'}`, color: 'var(--text-primary)', boxSizing: 'border-box' }}
            />
            {amount && hasError && (
              <p style={{ fontSize: 11, marginTop: 4, color: RED }}>{getValidationMsg()}</p>
            )}
            {/* Wallet after preview */}
            {isValid && (
              <p style={{ fontSize: 11, marginTop: 4, color: balanceAfter >= 0 ? GREEN : RED }}>
                Wallet after: {fmtINR(balanceAfter)}
              </p>
            )}
          </div>

          <button
            onClick={() => setStep('confirm')}
            disabled={!isValid || (maxParticipation > 0 && remainingCapacity <= 0)}
            style={{ width: '100%', padding: '11px 0', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', cursor: (isValid && !(maxParticipation > 0 && remainingCapacity <= 0)) ? 'pointer' : 'not-allowed', border: 'none', background: (isValid && !(maxParticipation > 0 && remainingCapacity <= 0)) ? `linear-gradient(135deg,${GREEN},#059669)` : `${GREEN}40`, boxShadow: (isValid && !(maxParticipation > 0 && remainingCapacity <= 0)) ? `0 4px 14px ${GREEN}35` : 'none' }}
          >
            {maxParticipation > 0 && remainingCapacity <= 0 ? 'Maximum Reached' : 'Preview Top-Up'}
          </button>
        </div>
      )}
    </Modal>
  );
}

// ─── Gold Interest Statement Modal ───────────────────────────────────────────
function interestStatusChipGold(status) {
  const s = (status ?? '').toUpperCase();
  if (s === 'PAID') return (
    <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 999, background: `${GREEN}14`, color: GREEN, border: `1px solid ${GREEN}30` }}>PAID</span>
  );
  if (s === 'NOTYETPAID' || s === 'NOT YET PAID') return (
    <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 999, background: `${GOLD}14`, color: GOLD, border: `1px solid ${GOLD}30` }}>NOT YET PAID</span>
  );
  return (
    <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 999, background: 'rgba(239,68,68,0.1)', color: RED, border: '1px solid rgba(239,68,68,0.2)' }}>
      {s || 'PENDING'}
    </span>
  );
}

function GoldInterestStatementModal({ deal, onClose }) {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [expandedIdx, setExpandedIdx] = useState(null);

  const load = () => {
    if (!deal?.dealId) return;
    setLoading(true);
    setError('');
    getUserViewInterestStatement(deal.dealId)
      .then(res => setData(res))
      .catch(e => setError(e?.message ?? 'Failed to load interest statement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [deal?.dealId]);

  const rows = data?.participationInterestStatement ?? [];
  const totalInterest = useMemo(() => rows.reduce((sum, r) => sum + Number(r?.interestAmount ?? 0), 0), [rows]);
  const firstRow = rows[0] ?? {};
  const participationAmount = data?.totalParticipationAmount ?? firstRow?.participationAmount ?? null;
  const participationDate   = firstRow?.participationDate ?? null;

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      title={
        <div style={{ paddingRight: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: GOLD, margin: 0 }}>Interest Statement</p>
          <h2 style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {deal?.dealName ?? 'Gold Deal'}
          </h2>
        </div>
      }
      styles={{
        content: { background: 'var(--surface-card)', border: `1px solid ${GOLD}28`, borderRadius: 16, boxShadow: '0 32px 80px rgba(0,0,0,0.35)' },
        header:  { background: 'transparent', borderBottom: '1px solid var(--border)', paddingBottom: 12 },
        body:    { padding: '16px 0 0 0' },
        close:   { color: 'var(--text-muted)' },
      }}
      width="min(960px, 96vw)"
      centered
    >
      <div style={{ overflowY: 'auto', padding: '12px 20px 20px', display: 'grid', gap: 16, maxHeight: '68vh' }}>

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '56px 0' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${GOLD}40`, borderTopColor: GOLD, animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Loading interest statement…</span>
          </div>
        )}

        {!loading && error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: RED, margin: 0 }}>{error}</p>
            <button onClick={load} style={{ padding: '7px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: `${GOLD}12`, color: GOLD, border: `1px solid ${GOLD}28`, cursor: 'pointer' }}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* KPI strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {[
                { label: 'Amount Invested',  value: participationAmount != null ? fmtINR(participationAmount) : '—', color: BLUE   },
                { label: 'Participation Date', value: participationDate ?? '—',                                        color: GREEN  },
                { label: 'Total Interest',   value: fmtINR(totalInterest),                                             color: GOLD   },
                { label: 'ROI',              value: data?.roi != null ? `${data.roi}%` : '—',                          color: PURPLE },
              ].map(k => (
                <div key={k.label} style={{ borderRadius: 12, padding: '10px 14px', background: `${k.color}0e`, border: `1px solid ${k.color}28` }}>
                  <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: 0 }}>{k.label}</p>
                  <p style={{ fontSize: 15, fontWeight: 900, color: k.color, fontFamily: "'JetBrains Mono',monospace", margin: '4px 0 0' }}>{k.value}</p>
                </div>
              ))}
            </div>

            {/* Schedule table */}
            {rows.length > 0 ? (
              <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-card)' }}>
                {/* Table header bar */}
                <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderBottom: '1px solid var(--border)', background: 'var(--input-bg)' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: GOLD }}>Monthly Interest Schedule</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999, background: `${GOLD}14`, color: GOLD, border: `1px solid ${GOLD}28` }}>
                    {rows.length} months
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: 12, minWidth: 600, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--table-header-bg, rgba(255,255,255,0.03))' }}>
                        {['#', 'Interest Date', 'Days', 'Interest', 'Paid Date', 'Status'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, idx) => {
                        const hasBreakup = Array.isArray(row?.updationParticiInterestStatement) && row.updationParticiInterestStatement.length > 0;
                        const isExp = expandedIdx === idx;
                        // handle both field name variants (SDLOT vs ASSET)
                        const intDate  = row?.actualInterestDate ?? row?.interestDate ?? '—';
                        const days     = row?.days ?? row?.noOfDays ?? '—';
                        const paidDate = row?.paidDate ?? row?.disbursedDate ?? '—';
                        return (
                          <Fragment key={idx}>
                            <tr style={{ borderTop: '1px solid var(--border)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover, rgba(255,255,255,0.03))'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-muted)' }}>{idx + 1}</td>
                              <td style={{ padding: '10px 12px', fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{intDate}</td>
                              <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)' }}>{days}</td>
                              <td style={{ padding: '10px 12px', fontWeight: 900, fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'nowrap', color: GOLD }}>
                                {fmtINR(row?.interestAmount ?? 0)}
                                {hasBreakup && (
                                  <button
                                    onClick={() => setExpandedIdx(isExp ? null : idx)}
                                    style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: `1px solid ${PURPLE}40`, background: `${PURPLE}14`, color: PURPLE }}>
                                    {isExp ? 'Close' : 'Breakup'}
                                  </button>
                                )}
                              </td>
                              <td style={{ padding: '10px 12px', fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{paidDate}</td>
                              <td style={{ padding: '10px 12px' }}>{interestStatusChipGold(row?.status)}</td>
                            </tr>

                            {/* First-month top-up breakup */}
                            {isExp && hasBreakup && (
                              <tr style={{ borderTop: '1px solid var(--border)', background: 'var(--input-bg, rgba(255,255,255,0.02))' }}>
                                <td colSpan={6} style={{ padding: 12 }}>
                                  <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${PURPLE}28` }}>
                                    <div style={{ padding: '7px 14px', background: `${PURPLE}10`, borderBottom: `1px solid ${PURPLE}20` }}>
                                      <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: PURPLE }}>
                                        First Month Breakup — {row.updationParticiInterestStatement.length + 1} entries
                                      </span>
                                    </div>
                                    <div style={{ overflowX: 'auto', maxHeight: 220, overflowY: 'auto' }}>
                                      <table style={{ width: '100%', fontSize: 11, minWidth: 520, borderCollapse: 'collapse' }}>
                                        <thead>
                                          <tr style={{ background: 'var(--table-header-bg, rgba(255,255,255,0.03))' }}>
                                            {['#', 'Part. Date', 'Days', 'Invested', 'Interest', 'Status'].map(h => (
                                              <th key={h} style={{ textAlign: 'left', padding: '7px 10px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr style={{ borderTop: '1px solid var(--border)' }}>
                                            <td style={{ padding: '7px 10px', fontWeight: 700, color: 'var(--text-muted)' }}>1</td>
                                            <td style={{ padding: '7px 10px', color: 'var(--text-primary)' }}>{row?.participationDate ?? '—'}</td>
                                            <td style={{ padding: '7px 10px', color: 'var(--text-muted)' }}>{days}</td>
                                            <td style={{ padding: '7px 10px', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: BLUE }}>{row?.participationAmount != null ? fmtINR(row.participationAmount) : '—'}</td>
                                            <td style={{ padding: '7px 10px', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: GOLD }}>{fmtINR(row?.interestAmount ?? 0)}</td>
                                            <td style={{ padding: '7px 10px' }}>{interestStatusChipGold(row?.status)}</td>
                                          </tr>
                                          {row.updationParticiInterestStatement.map((upd, uIdx) => (
                                            <tr key={uIdx} style={{ borderTop: '1px solid var(--border)' }}>
                                              <td style={{ padding: '7px 10px', fontWeight: 700, color: 'var(--text-muted)' }}>{uIdx + 2}</td>
                                              <td style={{ padding: '7px 10px', color: 'var(--text-primary)' }}>{upd?.participationDate ?? '—'}</td>
                                              <td style={{ padding: '7px 10px', color: 'var(--text-muted)' }}>{upd?.days ?? '—'}</td>
                                              <td style={{ padding: '7px 10px', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: BLUE }}>{upd?.participationAmount != null ? fmtINR(upd.participationAmount) : '—'}</td>
                                              <td style={{ padding: '7px 10px', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: GOLD }}>{fmtINR(upd?.interestAmount ?? 0)}</td>
                                              <td style={{ padding: '7px 10px' }}>{interestStatusChipGold(upd?.status)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                        <tfoot>
                                          <tr style={{ borderTop: `2px solid ${PURPLE}28`, background: `${PURPLE}08` }}>
                                            <td colSpan={3} style={{ padding: '7px 10px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: PURPLE }}>Total</td>
                                            <td style={{ padding: '7px 10px', fontWeight: 900, fontFamily: "'JetBrains Mono',monospace", color: BLUE }}>
                                              {fmtINR((row?.participationAmount ?? 0) + row.updationParticiInterestStatement.reduce((s, u) => s + Number(u?.participationAmount ?? 0), 0))}
                                            </td>
                                            <td style={{ padding: '7px 10px', fontWeight: 900, fontFamily: "'JetBrains Mono',monospace", color: GOLD }}>
                                              {fmtINR((row?.interestAmount ?? 0) + row.updationParticiInterestStatement.reduce((s, u) => s + Number(u?.interestAmount ?? 0), 0))}
                                            </td>
                                            <td />
                                          </tr>
                                        </tfoot>
                                      </table>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: `2px solid var(--border)`, background: `${GOLD}14` }}>
                        <td colSpan={3} style={{ padding: '10px 12px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: GOLD }}>Total Interest</td>
                        <td style={{ padding: '10px 12px', fontWeight: 900, fontFamily: "'JetBrains Mono',monospace", color: GOLD }}>{fmtINR(totalInterest)}</td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: '32px 0', textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                No interest schedule available for this deal.
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

// ─── ULP Deal Card ────────────────────────────────────────────────────────────
const PAYOUT_MAP_ULP = { MONTHLY: 'Monthly', QUARTELY: 'Quarterly', HALFLY: 'Half-Yearly', YEARLY: 'Yearly', ENDOFTHEDEAL: 'End of Deal' };

function UlpDealCard({ p, onAddMore, onWithdraw, onViewInterest }) {
  const [expanded, setExpanded] = useState(false);

  const payLabel = PAYOUT_MAP_ULP[p.amountTye] ?? p.amountTye ?? '—';

  const allEntries = [
    {
      type:   'initial',
      label:  'Initial Participation',
      date:   p.participatedDate ?? '—',
      amount: p.participatedAmount ?? 0,
      roi:    p.rateOfInterest ?? 0,
      payout: p.amountTye,
    },
    ...(p.updatedParticipation ?? []).map((u, idx) => ({
      type:   'topup',
      label:  `Top-up #${idx + 1}`,
      date:   u.updatedDate ?? '—',
      amount: u.updationParticipation ?? 0,
      roi:    u.rateOfInterest ?? p.rateOfInterest ?? 0,
      payout: u.amountTye ?? p.amountTye,
    })),
  ];

  const totalInvested = allEntries.reduce((s, e) => s + e.amount, 0);
  const hasUpdates    = (p.updatedParticipation ?? []).length > 0;

  return (
    <div style={{
      borderRadius: 18, overflow: 'hidden',
      background: 'var(--surface-card, #1a1a2e)',
      border: '1px solid #10b98128',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      transition: 'box-shadow 0.2s ease',
    }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg,#10b981,#059669)' }} />
      <div style={{ padding: '16px 20px', display: 'grid', gap: 10 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary, #fff)', margin: 0 }}>{p.dealName}</p>
            <p style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: 'var(--text-muted, #888)', marginTop: 4 }}>
              {String(p.dealId ?? '').slice(0, 18)}…
            </p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#10b98118', color: '#10b981', border: '1px solid #10b98128' }}>
            {payLabel}
          </span>
        </div>

        {/* Stat pills */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Invested', value: formatINR(totalInvested),        color: '#6366f1' },
            { label: 'ROI',            value: `${p.rateOfInterest ?? 0}%`,     color: '#f59e0b' },
            { label: 'Since',          value: p.participatedDate ?? '—',       color: '#10b981' },
            { label: 'Entries',        value: String(allEntries.length),        color: '#818cf8' },
          ].map(s => (
            <div key={s.label} style={{ padding: '8px 14px', borderRadius: 12, background: `${s.color}0d`, border: `1px solid ${s.color}20` }}>
              <p style={{ fontSize: 10, color: 'var(--text-muted, #888)', margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono',monospace", margin: '4px 0 0' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Action buttons — single row, equal width */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, paddingTop: 4 }}>
          {/* View Entries toggle */}
          <button
            onClick={() => setExpanded(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '7px 0', borderRadius: 10,
              fontSize: 12, fontWeight: 700,
              border: `1px solid ${expanded ? '#818cf8' : 'var(--border, rgba(255,255,255,0.1))'}`,
              background: expanded ? '#818cf812' : 'var(--input-bg, rgba(255,255,255,0.04))',
              color: expanded ? '#818cf8' : 'var(--text-muted, #888)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, flexShrink: 0 }}>
              <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
            </svg>
            Entries
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ width: 11, height: 11, flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {/* View Interest Statement */}
          <button
            onClick={() => onViewInterest(p)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '7px 0', borderRadius: 10,
              fontSize: 12, fontWeight: 700,
              border: `1px solid ${GOLD}35`,
              background: `${GOLD}0d`,
              color: GOLD,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, flexShrink: 0 }}>
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            Interest
          </button>

          <button
            onClick={() => onAddMore(p, totalInvested)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '7px 0', borderRadius: 10,
              fontSize: 12, fontWeight: 700,
              border: '1px solid #10b98135', background: '#10b98112', color: '#10b981',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, flexShrink: 0 }}>
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add More
          </button>

          <button
            onClick={() => onWithdraw(p, totalInvested)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '7px 0', borderRadius: 10,
              fontSize: 12, fontWeight: 700,
              border: `1px solid ${RED}35`, background: `${RED}0d`, color: RED,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, flexShrink: 0 }}>
              <path d="M12 2v20M17 7l-5-5-5 5M17 17l-5 5-5-5"/>
            </svg>
            Withdrawal
          </button>
        </div>
      </div>

      {/* ── Expanded: Investment History ── */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(129,140,248,0.15)' }}>
          {/* Section header */}
          <div style={{
            padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(129,140,248,0.05)',
            borderBottom: '1px solid rgba(129,140,248,0.12)',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818cf8' }}>
              Investment Timeline · {allEntries.length} {allEntries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          <div style={{ padding: '12px 16px', display: 'grid', gap: 8 }}>
            {/* Initial participation */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 12,
              background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: BLUE, boxShadow: `0 0 6px ${BLUE}` }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary, #fff)', margin: 0 }}>Initial Participation</p>
                <p style={{ fontSize: 10, marginTop: 2, color: 'var(--text-muted, #888)' }}>{p.participatedDate ?? '—'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: BLUE, fontFamily: "'JetBrains Mono',monospace", margin: 0 }}>
                  {formatINR(p.participatedAmount ?? 0)}
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-muted, #888)', marginTop: 2 }}>{p.rateOfInterest ?? 0}% · {PAYOUT_MAP_ULP[p.amountTye] ?? p.amountTye}</p>
              </div>
            </div>

            {/* Top-up entries */}
            {(p.updatedParticipation ?? []).map((u, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 12,
                background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: GREEN, boxShadow: `0 0 6px ${GREEN}` }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary, #fff)', margin: 0 }}>Top-up #{idx + 1}</p>
                  <p style={{ fontSize: 10, marginTop: 2, color: 'var(--text-muted, #888)' }}>{u.updatedDate ?? '—'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: GREEN, fontFamily: "'JetBrains Mono',monospace", margin: 0 }}>
                    {formatINR(u.updationParticipation ?? 0)}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted, #888)', marginTop: 2 }}>
                    {u.rateOfInterest ?? p.rateOfInterest ?? 0}% · {PAYOUT_MAP_ULP[u.amountTye ?? p.amountTye] ?? u.amountTye ?? '—'}
                  </p>
                </div>
              </div>
            ))}

            {/* Total row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 14px', borderRadius: 10,
              background: 'rgba(129,140,248,0.08)', borderTop: '1px solid rgba(129,140,248,0.2)',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#818cf8' }}>Total</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: '#818cf8', fontFamily: "'JetBrains Mono',monospace" }}>
                {formatINR(totalInvested)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function GoldDealsParticipated() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ulp');
  const [search, setSearch] = useState('');
  const [runningPayoutFilter, setRunningPayoutFilter] = useState('all');
  const [processedStatusFilter, setProcessedStatusFilter] = useState('all');
  const [processedAuctionFilter, setProcessedAuctionFilter] = useState('all');

  // Modal state
  const [withdrawDeal, setWithdrawDeal]   = useState(null); // { deal, totalInvested }
  const [addMoreDeal, setAddMoreDeal]     = useState(null); // deal object
  const [interestDeal, setInterestDeal]   = useState(null); // deal object for interest statement

  const [runningData, setRunningData]         = useState(null);
  const [runningLoading, setRunningLoading]   = useState(true);
  const [runningError, setRunningError]       = useState('');

  const [processedData, setProcessedData]     = useState(null);
  const [processedLoading, setProcessedLoading] = useState(false);
  const [processedError, setProcessedError]   = useState('');
  const [processedBonusTotal, setProcessedBonusTotal] = useState(0);
  const [processedGrowthDealsCount, setProcessedGrowthDealsCount] = useState(0);
  const [processedBonusLoading, setProcessedBonusLoading] = useState(false);

  // ULP tab — GOLD deals from getRunningDeals
  const [ulpData, setUlpData]         = useState(null);
  const [ulpLoading, setUlpLoading]   = useState(false);
  const [ulpError, setUlpError]       = useState('');

  const loadRunning = () => {
    setRunningLoading(true);
    setRunningError('');
    getGoldDealsEarnings()
      .then(res => setRunningData(res))
      .catch(e => setRunningError(e.message ?? 'Failed to load running gold deals'))
      .finally(() => setRunningLoading(false));
    getRunningDeals()
      .then(res => setUlpData(res))
      .catch(e => setUlpError(e.message ?? 'Failed to load ULP deals'))
      .finally(() => setUlpLoading(false));
  };

  const loadProcessed = () => {
    setProcessedLoading(true);
    setProcessedError('');
    getAllParticipationByUser()
      .then(res => setProcessedData(res))
      .catch(e => setProcessedError(e.message ?? 'Failed to load processed participations'))
      .finally(() => setProcessedLoading(false));
  };

  useEffect(() => { loadRunning(); }, []);

  const openRunningTab = () => {
    setActiveTab('running');
  };

  const openProcessedTab = () => {
    setActiveTab('processed');
    if (!processedData && !processedLoading) loadProcessed();
  };

  const loadUlp = () => {
    setUlpLoading(true);
    setUlpError('');
    getRunningDeals()
      .then(res => setUlpData(res))
      .catch(e => setUlpError(e.message ?? 'Failed to load ULP deals'))
      .finally(() => setUlpLoading(false));
  };

  const openUlpTab = () => {
    setActiveTab('ulp');
    if (!ulpData && !ulpLoading) loadUlp();
  };

  const runningDeals = useMemo(
    () => dedupeRunningDeals(runningData?.userEarenInfoResponse ?? []),
    [runningData]
  );
  const runningDealsCount = runningDeals.length;
  const runningTotalEarnedPct = Number(runningData?.allDealsEarnedPercentage ?? 0);
  const runningAvgEarnedPct = Number(runningData?.averageAllDealsPercentage ?? 0);
  const runningAvgGoldGrowthPct = runningDealsCount
    ? runningDeals.reduce((sum, deal) => sum + Number(deal?.goldGrowthPercentage ?? 0), 0) / runningDealsCount
    : 0;
  const processedDeals = useMemo(() => {
    const source = (processedData?.userParticipatedList ?? []).filter(d => d?.propertyType === 'GOLDLOT');
    const byPropertyId = new Map();
    source.forEach(item => {
      const key = String(item?.propertyId ?? '');
      if (!key) return;
      if (!byPropertyId.has(key)) {
        byPropertyId.set(key, item);
      }
    });
    return Array.from(byPropertyId.values());
  }, [processedData]);
  const totalProcessedAmount = processedDeals.reduce((sum, d) => sum + Number(d?.participatedAmount ?? 0), 0);
  const processedMouCount = processedDeals.filter(d => (d.userParticipationStatus ?? '').toUpperCase() === 'MOU').length;
  const processedCallForMoneyCount = processedDeals.filter(d => (d.userParticipationStatus ?? '').toUpperCase() === 'CALLFORMONEY').length;
  const processedAvgContribution = processedDeals.length ? totalProcessedAmount / processedDeals.length : 0;
  const processedStatuses = useMemo(() => {
    const statuses = Array.from(new Set(processedDeals.map(d => (d.userParticipationStatus ?? '').toUpperCase()).filter(Boolean)));
    return statuses.sort();
  }, [processedDeals]);

  useEffect(() => {
    let ignore = false;

    const loadProcessedBonus = async () => {
      if (processedDeals.length === 0) {
        setProcessedBonusTotal(0);
        setProcessedGrowthDealsCount(0);
        return;
      }

      setProcessedBonusLoading(true);
      try {
        const uniquePropertyIds = Array.from(new Set(processedDeals.map(d => d?.propertyId).filter(Boolean)));
        const responses = await Promise.all(
          uniquePropertyIds.map(async propertyId => {
            try {
              const res = await getGoldGrowthDetail(propertyId);
              const rows = Array.isArray(res) ? res : (res ? [res] : []);
              const total = rows.reduce((sum, row) => sum + Number(row?.goldGrowthAmount ?? 0), 0);
              return { total, hasRows: rows.length > 0 };
            } catch {
              return { total: 0, hasRows: false };
            }
          })
        );

        if (ignore) return;

        const totalBonus = responses.reduce((sum, item) => sum + Number(item.total ?? 0), 0);
        const growthDealCount = responses.filter(item => item.hasRows).length;
        setProcessedBonusTotal(totalBonus);
        setProcessedGrowthDealsCount(growthDealCount);
      } finally {
        if (!ignore) setProcessedBonusLoading(false);
      }
    };

    if (activeTab === 'processed') {
      loadProcessedBonus();
    }

    return () => {
      ignore = true;
    };
  }, [activeTab, processedDeals]);

  const filteredRunningDeals = useMemo(() => {
    const q = search.trim().toLowerCase();
    return runningDeals
      .filter(d => runningPayoutFilter === 'all' || (d.participationType ?? '').toLowerCase() === runningPayoutFilter)
      .filter(d => {
        if (!q) return true;
        return (
          (d.dealName ?? '').toLowerCase().includes(q) ||
          String(d.dealId ?? '').toLowerCase().includes(q) ||
          (d.participationType ?? '').toLowerCase().includes(q)
        );
      });
  }, [runningDeals, runningPayoutFilter, search]);

  const filteredProcessedDeals = useMemo(() => {
    const q = search.trim().toLowerCase();
    return processedDeals
      .filter(d => processedStatusFilter === 'all' || (d.userParticipationStatus ?? '').toUpperCase() === processedStatusFilter)
      .filter(d => {
        if (processedAuctionFilter === 'all') return true;
        return (d.auctionType ?? '').toLowerCase() === processedAuctionFilter;
      })
      .filter(d => {
        if (!q) return true;
        return (
          (d.propertyName ?? '').toLowerCase().includes(q) ||
          String(d.propertyId ?? '').toLowerCase().includes(q)
        );
      });
  }, [processedDeals, processedStatusFilter, processedAuctionFilter, search]);

  const isLoading = activeTab === 'running' ? runningLoading : processedLoading;
  const error = activeTab === 'running' ? runningError : processedError;

  // ULP tab deals: GOLD participations from getRunningDeals
  const ulpDeals = useMemo(() => {
    return (ulpData?.participationInfo ?? []).filter(p => p.globalDealType === 'GOLD');
  }, [ulpData]);

  const filteredUlpDeals = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ulpDeals;
    return ulpDeals.filter(d =>
      (d.dealName ?? '').toLowerCase().includes(q) ||
      String(d.dealId ?? '').toLowerCase().includes(q)
    );
  }, [ulpDeals, search]);
  const handleDownloadMou = async (deal) => {
    try {
      const blob = await downloadGoldMouForCurrentUser(deal.dealId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MoU_${deal.dealName ?? 'Gold_Deal'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setRunningError(e.message ?? 'Failed to download MOU.');
    }
  };

  const handleDownloadMouByProperty = async (deal) => {
    try {
      const blob = await downloadGoldMouForCurrentUser(deal.propertyId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MoU_${deal.propertyName ?? 'Gold_Deal'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setProcessedError(e.message ?? 'Failed to download MOU.');
    }
  };

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
              {activeTab === 'running' ? 'Track your running gold deal performance' : 'Track processed gold participations'}
            </p>
          </div>

          {/* Right: refresh */}
          <button onClick={() => activeTab === 'running' ? loadRunning() : activeTab === 'ulp' ? loadUlp() : loadProcessed()} style={{
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

      {/* ── Tab Bar (separate from hero for better visibility) ── */}
      <div style={{
        borderRadius: 14,
        padding: '10px 12px',
        background: 'var(--surface-card, #1a1a2e)',
        border: '1px solid var(--border, rgba(255,255,255,0.08))',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={openRunningTab}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 800,
              color: activeTab === 'running' ? '#fff' : 'var(--text-muted, #888)',
              background: activeTab === 'running' ? `linear-gradient(135deg, ${BLUE}, #4f46e5)` : 'var(--input-bg)',
              border: `1px solid ${activeTab === 'running' ? BLUE : 'var(--border, rgba(255,255,255,0.12))'}`,
              cursor: 'pointer',
              boxShadow: activeTab === 'running' ? `0 4px 14px ${BLUE}45` : 'none',
            }}>
            Running
          </button>
          <button
            onClick={openProcessedTab}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 800,
              color: activeTab === 'processed' ? '#fff' : 'var(--text-muted, #888)',
              background: activeTab === 'processed' ? `linear-gradient(135deg, ${GOLD}, #d97706)` : 'var(--input-bg)',
              border: `1px solid ${activeTab === 'processed' ? GOLD : 'var(--border, rgba(255,255,255,0.12))'}`,
              cursor: 'pointer',
              boxShadow: activeTab === 'processed' ? `0 4px 14px ${GOLD}45` : 'none',
            }}>
            Processed
          </button>
          <button
            onClick={openUlpTab}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 800,
              color: activeTab === 'ulp' ? '#fff' : 'var(--text-muted, #888)',
              background: activeTab === 'ulp' ? `linear-gradient(135deg, #10b981, #059669)` : 'var(--input-bg)',
              border: `1px solid ${activeTab === 'ulp' ? '#10b981' : 'var(--border, rgba(255,255,255,0.12))'}`,
              cursor: 'pointer',
              boxShadow: activeTab === 'ulp' ? `0 4px 14px #10b98145` : 'none',
            }}>
            ULP
          </button>
        </div>

        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted, #888)', margin: 0 }}>
          {activeTab === 'running' ? 'Showing running deals' : activeTab === 'ulp' ? 'Showing ULP gold deals' : 'Showing processed deals'}
        </p>
      </div>

      {/* ── Filters ── */}
      <div style={{
        borderRadius: 14,
        padding: '12px',
        background: 'var(--surface-card, #1a1a2e)',
        border: '1px solid var(--border, rgba(255,255,255,0.08))',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        display: 'grid',
        gap: 10,
      }}>
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={activeTab === 'running' ? 'Search by deal name, id, payout' : activeTab === 'ulp' ? 'Search by deal name, id' : 'Search by property name, id'}
            style={{
              borderRadius: 10,
              padding: '9px 10px',
              fontSize: 12,
              outline: 'none',
              border: '1px solid var(--border, rgba(255,255,255,0.08))',
              background: 'var(--input-bg, rgba(255,255,255,0.04))',
              color: 'var(--text-primary, #fff)',
            }}
          />

          {activeTab === 'running' ? (
            <select
              value={runningPayoutFilter}
              onChange={e => setRunningPayoutFilter(e.target.value)}
              style={{
                borderRadius: 10,
                padding: '9px 10px',
                fontSize: 12,
                outline: 'none',
                border: '1px solid var(--border, rgba(255,255,255,0.08))',
                background: 'var(--input-bg, rgba(255,255,255,0.04))',
                color: 'var(--text-primary, #fff)',
              }}>
              <option value="all">All Payout Types</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="halfyearly">Half-Yearly</option>
              <option value="yearly">Yearly</option>
            </select>
          ) : (
            <>
              <select
                value={processedStatusFilter}
                onChange={e => setProcessedStatusFilter(e.target.value)}
                style={{
                  borderRadius: 10,
                  padding: '9px 10px',
                  fontSize: 12,
                  outline: 'none',
                  border: '1px solid var(--border, rgba(255,255,255,0.08))',
                  background: 'var(--input-bg, rgba(255,255,255,0.04))',
                  color: 'var(--text-primary, #fff)',
                }}>
                <option value="all">All Status</option>
                {processedStatuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={processedAuctionFilter}
                onChange={e => setProcessedAuctionFilter(e.target.value)}
                style={{
                  borderRadius: 10,
                  padding: '9px 10px',
                  fontSize: 12,
                  outline: 'none',
                  border: '1px solid var(--border, rgba(255,255,255,0.08))',
                  background: 'var(--input-bg, rgba(255,255,255,0.04))',
                  color: 'var(--text-primary, #fff)',
                }}>
                <option value="all">All Types</option>
                <option value="open">Open</option>
                <option value="close">Closed</option>
              </select>
            </>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted, #888)' }}>
            {activeTab === 'running'
              ? `${filteredRunningDeals.length} result(s)`
              : `${filteredProcessedDeals.length} result(s)`}
          </p>
          <button
            onClick={() => {
              setSearch('');
              setRunningPayoutFilter('all');
              setProcessedStatusFilter('all');
              setProcessedAuctionFilter('all');
            }}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid var(--border, rgba(255,255,255,0.08))',
              background: 'var(--input-bg, rgba(255,255,255,0.04))',
              color: 'var(--text-primary, #fff)',
            }}>
            Reset Filters
          </button>
        </div>
      </div>

      {activeTab === 'running' && (
        <div style={{ display: 'grid', gap: 12 }}>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 12,
          }}>
            <KpiCard label="Gold Deals" value={String(runningDealsCount)} sub="Running records" color={BLUE} Icon={BarIcon} />
            <KpiCard label="Total Earned %" value={`${fmt(runningTotalEarnedPct)}%`} sub="All running deals" color={GOLD} Icon={CoinsIcon} />
            <KpiCard
              label="Avg Earned %"
              value={`${fmt(runningAvgEarnedPct)}%`}
              sub="Per deal average"
              color={GREEN}
              Icon={TrendUp}
            />
            <KpiCard
              label="Avg Gold Growth %"
              value={`${fmt(runningAvgGoldGrowthPct)}%`}
              sub="Across running deals"
              color={PURPLE}
              Icon={ZapIcon}
            />
          </div>
        </div>
      )}

      {activeTab !== 'ulp' && (isLoading ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 20, padding: '80px 0',
        }}>
          <div style={{ position: 'relative', width: 64, height: 64 }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: `2px solid ${GOLD}40`,
              animation: 'pulse-ring 1.6s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', inset: 8, borderRadius: '50%',
              border: `3px solid ${GOLD}30`,
              borderTopColor: GOLD,
              animation: 'spin 0.9s linear infinite',
            }} />
            <div style={{
              position: 'absolute', inset: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: GOLD,
            }}>
              <GoldIcon />
            </div>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted, #888)' }}>
            {activeTab === 'running' ? 'Loading running gold deals…' : 'Loading processed gold participations…'}
          </p>
        </div>
      ) : error ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 16, padding: '80px 0',
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>{error}</p>
          <button onClick={() => activeTab === 'running' ? loadRunning() : activeTab === 'ulp' ? loadUlp() : loadProcessed()} style={{
            padding: '8px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700,
            background: `${GOLD}18`, color: GOLD, border: `1px solid ${GOLD}30`,
            cursor: 'pointer',
          }}>Retry</button>
        </div>
      ) : (activeTab === 'running' ? filteredRunningDeals.length === 0 : filteredProcessedDeals.length === 0) ? (
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
              {activeTab === 'running' ? 'No running gold deals found' : 'No processed GOLDLOT records found'}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted, #888)' }}>
              {activeTab === 'running'
                ? "You haven't participated in any gold deals yet."
                : 'Processed tab only shows propertyType = GOLDLOT.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'running' && (
            <div
              key="running-cards"
              style={{
                display: 'grid',
                gap: 14,
                gridTemplateColumns: '1fr',
              }}
            >
              {filteredRunningDeals.map(deal => (
                <DealCard
                  key={`${deal.dealId}-${deal.participationType}`}
                  deal={deal}
                  onDownloadMou={() => handleDownloadMou(deal)}
                  onRealizationPayout={() => navigate(`/interestPaymentDates/${deal.dealId}/`)}
                  onOpenDetails={() => navigate(`/gold-deals/participation/${deal.dealId}`, {
                    state: {
                      propertyId: deal.dealId,
                      propertyType: 'GOLDLOT',
                      auctionType: 'Open',
                      userParticipationStatus: 'MOU',
                    },
                  })}
                />
              ))}
            </div>
          )}

          {activeTab === 'processed' && (
            <div
              key="processed-cards"
              style={{
                display: 'grid',
                gap: 14,
                gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))',
              }}
            >
              {filteredProcessedDeals.map(deal => (
                <ProcessedDealCard
                  key={`${deal.propertyId}-${deal.userParticipationStatus}-${deal.participatedAmount}`}
                  deal={deal}
                  onDownloadMou={() => handleDownloadMouByProperty(deal)}
                  onRealizationPayout={() => navigate(`/interestPaymentDates/${deal.propertyId}/`)}
                  onOpenDetails={() => navigate(`/gold-deals/participation/${deal.propertyId}`, {
                    state: {
                      propertyId: deal.propertyId,
                      propertyType: 'GOLDLOT',
                      auctionType: 'Open',
                      userParticipationStatus: deal.userParticipationStatus,
                    },
                  })}
                />
              ))}
            </div>
          )}
        </>
      ))}

      {/* ── ULP Tab ── */}
      {activeTab === 'ulp' && (
        <>
          {ulpLoading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '48px 0' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #10b98140', borderTopColor: '#10b981', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted, #888)' }}>Loading ULP deals…</span>
            </div>
          )}
          {!ulpLoading && ulpError && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>{ulpError}</p>
              <button onClick={loadUlp} style={{ marginTop: 12, padding: '8px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, background: '#10b98118', color: '#10b981', border: '1px solid #10b98130', cursor: 'pointer' }}>Retry</button>
            </div>
          )}
          {!ulpLoading && !ulpError && filteredUlpDeals.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '64px 0', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#10b98112', border: '1px solid #10b98130', color: '#10b981' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 32, height: 32 }}>
                  <circle cx="12" cy="12" r="10"/><path d="M9 9h1.5a1.5 1.5 0 0 1 0 3H9v3"/><path d="M9 12h3"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary, #fff)', margin: 0 }}>No ULP participations found</p>
                <p style={{ fontSize: 13, marginTop: 6, color: 'var(--text-muted, #888)' }}>Your Gold deal participations will appear here.</p>
              </div>
            </div>
          )}
          {!ulpLoading && !ulpError && filteredUlpDeals.length > 0 && (
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))' }}>
              {filteredUlpDeals.map((p, i) => (
                <UlpDealCard
                  key={p.dealId ?? i}
                  p={p}
                  onAddMore={(deal, totalInvested) => setAddMoreDeal({ ...deal, _totalInvested: totalInvested, _maxParticipation: deal.maxParticipation ?? 0 })}
                  onWithdraw={(deal, totalInvested) => setWithdrawDeal({ deal, totalInvested })}
                  onViewInterest={(deal) => setInterestDeal(deal)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Modals ── */}
      {withdrawDeal && (
        <GoldWithdrawalModal
          deal={withdrawDeal.deal}
          totalInvested={withdrawDeal.totalInvested}
          onClose={() => setWithdrawDeal(null)}
          onSuccess={() => { setWithdrawDeal(null); loadUlp(); }}
        />
      )}
      {addMoreDeal && (
        <GoldAddMoreModal
          deal={addMoreDeal}
          onClose={() => setAddMoreDeal(null)}
          onSuccess={() => { setAddMoreDeal(null); loadUlp(); }}
        />
      )}
      {interestDeal && (
        <GoldInterestStatementModal
          deal={interestDeal}
          onClose={() => setInterestDeal(null)}
        />
      )}
    </div>
  );
}
