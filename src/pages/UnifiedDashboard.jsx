import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMode } from '../context/ModeContext';
import { useFamily } from '../context/FamilyContext';
import { useAuth } from '../context/AuthContext';
import { getMemberFinancials, getFamilyAggregate, getUserProfile, getRunningDeals, migrateUserData, getUserOfflineParticipationDealsInfo, getGoldDealsEarnings, getGoldGrowthDetail, getFamilyMembersForOxyloans, getOxyloansEncryptKey, getOxyloansLenderContactInfo, sendOxyloansUlpMobileOtp, verifyOxyloansUlpMobileOtp, sendOxyloansUlpEmailOtp, verifyOxyloansUlpEmailOtp, getOxyloansLenderDeals, getMigrationOxyloansUserInfo } from '../api/afterlogin-user';
import { formatINR } from '../utils/currency';
import ProfileWarningBanner from '../components/ProfileWarningBanner';

//  SVG Icons 
const I = {
  TrendUp:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  TrendDown:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  Percent:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
  Activity:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  CheckCircle:() => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  XCircle:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  BarChart:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  Bank:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>,
  Package:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Building:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  Zap:        () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Clock:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Wallet:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="18" cy="12" r="2"/></svg>,
  CreditCard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  FileText:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Users:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  PieChart:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  ArrowRight: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MEMBER_COLORS = { 'FM-001': '#2673bb', 'FM-002': '#e95330', 'FM-003': '#35a13e' };

// ─── Shared primitives ────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, trend, trendUp, color, Icon, badge }) {
  return (
    <div className="relative rounded-xl p-4 overflow-hidden cursor-default"
      style={{
        background: `linear-gradient(135deg,${color}0e 0%,var(--card-bg) 100%)`,
        border: `1px solid ${color}22`,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        boxShadow: `0 2px 12px rgba(0,0,0,0.08),inset 0 1px 0 ${color}10`,
        transition: 'transform 0.2s ease,box-shadow 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 6px 20px rgba(0,0,0,0.12),0 0 14px ${color}15,inset 0 1px 0 ${color}18`; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 2px 12px rgba(0,0,0,0.08),inset 0 1px 0 ${color}10`; }}
    >
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle,${color}15 0%,transparent 70%)`, filter: 'blur(12px)' }} />
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg,transparent,${color}30,transparent)` }} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${color}14`, border: `1px solid ${color}25`, color, boxShadow: `0 0 8px ${color}15` }}>
            <Icon />
          </div>
          {trend && (
            <div className="flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: trendUp ? 'rgba(53,161,62,0.1)' : 'rgba(233,83,48,0.1)', color: trendUp ? '#35a13e' : '#e95330', border: `1px solid ${trendUp ? 'rgba(53,161,62,0.2)' : 'rgba(233,83,48,0.2)'}`, fontSize: 10 }}>
              {trendUp ? <I.TrendUp /> : <I.TrendDown />}
              <span>{trend}</span>
            </div>
          )}
        </div>
        <p className="text-2xl font-extrabold tracking-tight mb-0.5 leading-none" style={{ color: 'var(--text-primary)' }}>{value}</p>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
        {badge && (
          <div className="mt-1.5 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
            style={{ background: `${color}10`, color, border: `1px solid ${color}18` }}>{badge}</div>
        )}
      </div>
    </div>
  );
}

function Chip({ status }) {
  const map = {
    Active:   { bg: 'rgba(53,161,62,0.1)',   color: '#35a13e', border: 'rgba(53,161,62,0.22)'  },
    Pending:  { bg: 'rgba(245,131,17,0.1)',  color: '#f58311', border: 'rgba(245,131,17,0.22)' },
    Closed:   { bg: 'rgba(38,115,187,0.1)',  color: '#2673bb', border: 'rgba(38,115,187,0.22)' },
    Verified: { bg: 'rgba(53,161,62,0.1)',   color: '#35a13e', border: 'rgba(53,161,62,0.22)'  },
    Rejected: { bg: 'rgba(233,83,48,0.1)',   color: '#e95330', border: 'rgba(233,83,48,0.22)'  },
  };
  const s = map[status] ?? map.Closed;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 4px ${s.color}` }} />
      {status === 'Active' ? 'Running' : status}
    </span>
  );
}

function SectionHeader({ icon: Icon, accent, platform, title, live }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30`, color: accent, boxShadow: `0 0 18px ${accent}18` }}>
          <Icon />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: accent }}>{platform}</p>
          <h2 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        </div>
      </div>
      {live && (
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(53,161,62,0.08)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.2)' }}>
          <span className="live-dot" style={{ width: 6, height: 6 }} />
          <span className="font-semibold">Live</span>
        </div>
      )}
    </div>
  );
}

function GlassPanel({ children, accent = '#2673bb', style = {} }) {
  return (
    <div className="rounded-2xl p-5"
      style={{
        background: `linear-gradient(135deg,${accent}08 0%,var(--card-bg) 100%)`,
        border: `1px solid ${accent}18`,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        boxShadow: `0 4px 20px rgba(0,0,0,0.08),inset 0 1px 0 ${accent}10`,
        ...style,
      }}>
      {children}
    </div>
  );
}

function TableWrap({ children, accent = '#2673bb' }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--table-bg)',
        border: `1px solid ${accent}18`,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,transparent,var(--border),transparent)' }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--border)' }} />
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,transparent,var(--border),transparent)' }} />
    </div>
  );
}

// ─── Animated bar chart ───────────────────────────────────────────────────────
function AnimatedBarChart({ data, accent = '#2673bb', label = 'Monthly Interest' }) {
  const [heights, setHeights] = useState(data.map(() => 0));
  const max = Math.max(...data);
  useEffect(() => {
    setHeights(data.map(() => 0));
    const timers = data.map((v, i) =>
      setTimeout(() => setHeights(prev => { const n = [...prev]; n[i] = (v / max) * 100; return n; }), i * 55)
    );
    return () => timers.forEach(clearTimeout);
  }, [data.join(',')]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: accent }}>{label}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>₹ — {(() => { const n = new Date(); const s = n.getMonth() < 3 ? n.getFullYear()-1 : n.getFullYear(); return `FY ${s}-${String(s+1).slice(2)}`; })()}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full"
          style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}25` }}>
          <I.Activity />
          <span className="live-dot" style={{ width: 5, height: 5 }} />
        </div>
      </div>
      <div className="flex items-end gap-1" style={{ height: 80 }}>
        {data.map((v, i) => {
          const isLast = i === data.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group cursor-pointer">
              <div className="relative w-full flex flex-col justify-end" style={{ height: 68 }}>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10
                  text-xs px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none"
                  style={{ background: `${accent}ee`, color: '#fff', fontSize: 9 }}>
                  {formatINR(v)}
                </div>
                <div className="w-full rounded-t"
                  style={{
                    height: `${heights[i]}%`,
                    transition: 'height 0.65s cubic-bezier(0.34,1.56,0.64,1)',
                    background: isLast ? `linear-gradient(180deg,${accent}cc,${accent})` : `${accent}30`,
                    boxShadow: isLast ? `0 0 10px ${accent}55` : 'none',
                  }} />
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 7 }}>{MONTHS[i].slice(0, 1)}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-5 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        {[
          { label: 'Latest',     value: formatINR(data[data.length - 1]), color: accent },
          { label: 'Total',      value: formatINR(data.reduce((a, b) => a + b, 0)), color: 'var(--text-primary)' },
          { label: 'Avg/Month',  value: formatINR(data.reduce((a, b) => a + b, 0) / data.length), color: '#35a13e' },
        ].map(s => (
          <div key={s.label}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Donut ring ───────────────────────────────────────────────────────────────
function DonutRing({ pct, color, size = 110, centerLabel, sub }) {
  const [animPct, setAnimPct] = useState(0);
  const r = 34, cx = 50, cy = 50, circ = 2 * Math.PI * r;
  useEffect(() => { setAnimPct(0); const t = setTimeout(() => setAnimPct(pct), 300); return () => clearTimeout(t); }, [pct]);
  const dash = (animPct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bar-track)" strokeWidth="8" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 5px ${color})` }} />
        <text x="50" y="47" textAnchor="middle" fontSize="14" fontWeight="800" style={{ fill: 'var(--text-primary)', fontFamily: 'inherit' }}>{pct}%</text>
        <text x="50" y="60" textAnchor="middle" fontSize="7.5" style={{ fill: 'var(--text-muted)', fontFamily: 'inherit' }}>{centerLabel}</text>
      </svg>
      {sub && <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

// ─── Status bars ──────────────────────────────────────────────────────────────
function StatusBars({ deals }) {
  const [widths, setWidths] = useState({ Running: 0, Pending: 0, Closed: 0 });
  const total = deals.length || 1;
  const groups = {
    Running: { count: deals.filter(d => d.status === 'Active').length,  color: '#35a13e', glow: 'rgba(53,161,62,0.4)' },
    Pending: { count: deals.filter(d => d.status === 'Pending').length, color: '#f58311', glow: 'rgba(245,131,17,0.4)'  },
    Closed:  { count: deals.filter(d => d.status === 'Closed').length,  color: '#2673bb', glow: 'rgba(38,115,187,0.4)'  },
  };
  useEffect(() => {
    const t = setTimeout(() => setWidths({
      Running: Math.round((groups.Running.count / total) * 100),
      Pending: Math.round((groups.Pending.count / total) * 100),
      Closed:  Math.round((groups.Closed.count  / total) * 100),
    }), 400);
    return () => clearTimeout(t);
  }, [deals.length]);
  return (
    <div>
      <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: '#2673bb' }}>Loan Status</p>
      <div className="grid gap-3.5">
        {Object.entries(groups).map(([lbl, g]) => (
          <div key={lbl}>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: g.color, boxShadow: `0 0 5px ${g.glow}` }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{lbl}</span>
              </div>
              <span className="text-xs font-bold tabular-nums" style={{ color: g.color }}>{g.count}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bar-track)' }}>
              <div className="h-full rounded-full"
                style={{ width: `${widths[lbl]}%`, background: `linear-gradient(90deg,${g.color},${g.color}88)`, boxShadow: `0 0 6px ${g.glow}`, transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)' }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Loans</span>
        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{deals.length}</span>
      </div>
    </div>
  );
}

// ─── Dual-series animated bar chart ─────────────────────────────────────────
function DualBarChart({ olData, offData, memberColor, labels = { ol: 'OxyLoans', off: 'Offline' } }) {
  const [period, setPeriod] = useState('monthly');

  // Dynamic FY: Indian FY starts April, so if current month < April use previous year
  const now = new Date();
  const fyStart = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  const fyLabel = `FY ${fyStart}-${String(fyStart + 1).slice(2)}`;

  // Aggregate data based on selected period
  const aggregate = (data, p) => {
    if (p === 'monthly')    return data; // 12 bars
    if (p === 'quarterly')  return [0,1,2,3].map(q => data.slice(q*3, q*3+3).reduce((a,b)=>a+b,0));
    if (p === 'halfyearly') return [data.slice(0,6).reduce((a,b)=>a+b,0), data.slice(6).reduce((a,b)=>a+b,0)];
    if (p === 'yearly')     return [data.reduce((a,b)=>a+b,0)];
    return data;
  };

  const periodLabels = {
    monthly:    MONTHS.map(m => m.slice(0,3)),
    quarterly:  ['Q1 (Apr-Jun)', 'Q2 (Jul-Sep)', 'Q3 (Oct-Dec)', 'Q4 (Jan-Mar)'],
    halfyearly: ['H1 (Apr-Sep)', 'H2 (Oct-Mar)'],
    yearly:     [fyLabel],
  };

  const aggOl  = aggregate(olData,  period);
  const aggOff = aggregate(offData, period);
  const barLabels = periodLabels[period];
  const max = Math.max(...aggOl, ...aggOff) || 1;

  const [heights, setHeights] = useState(aggOl.map(() => ({ ol: 0, off: 0 })));

  useEffect(() => {
    setHeights(aggOl.map(() => ({ ol: 0, off: 0 })));
    const timers = aggOl.map((_, i) =>
      setTimeout(() => setHeights(prev => {
        const n = [...prev]; n[i] = { ol: (aggOl[i] / max) * 100, off: (aggOff[i] / max) * 100 }; return n;
      }), i * 80)
    );
    return () => timers.forEach(clearTimeout);
  }, [aggOl.join(','), aggOff.join(','), period]);

  const PERIODS = [
    { key: 'monthly',    label: 'Monthly'    },
    { key: 'quarterly',  label: 'Quarterly'  },
    { key: 'halfyearly', label: 'Half-Yearly'},
    { key: 'yearly',     label: 'Yearly'     },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: memberColor }}>
            {PERIODS.find(p => p.key === period)?.label} Overview
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>₹ — {fyLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          {[{ label: labels.ol, color: '#2673bb' }, { label: labels.off, color: '#f58311' }].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
              <span style={{ color: 'var(--text-muted)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Period selector pills */}
      {/* <div className="flex gap-1 mb-3 p-0.5 rounded-xl w-fit" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
        {PERIODS.map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)}
            className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
            style={{
              background: period === p.key ? memberColor : 'transparent',
              color: period === p.key ? '#fff' : 'var(--text-muted)',
              boxShadow: period === p.key ? `0 2px 8px ${memberColor}40` : 'none',
            }}>
            {p.label}
          </button>
        ))}
      </div> */}

      {/* Bars */}
      <div className="flex items-end gap-2" style={{ height: 90 }}>
        {aggOl.map((_, i) => (
          <div key={i} className="flex-1 flex items-end gap-0.5 group cursor-pointer">
            <div className="flex-1 flex flex-col justify-end relative" style={{ height: 80 }}>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 text-xs px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none"
                style={{ background: '#2673bbee', color: '#fff', fontSize: 9 }}>
                {formatINR(aggOl[i])}
              </div>
              <div className="w-full rounded-t"
                style={{ height: `${heights[i]?.ol ?? 0}%`, transition: 'height 0.65s cubic-bezier(0.34,1.56,0.64,1)', background: 'linear-gradient(180deg,#5b9fd4,#2673bb)', boxShadow: (heights[i]?.ol ?? 0) > 60 ? '0 0 8px #2673bb55' : 'none' }} />
            </div>
            <div className="flex-1 flex flex-col justify-end relative" style={{ height: 80 }}>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 text-xs px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none"
                style={{ background: '#f58311ee', color: '#fff', fontSize: 9 }}>
                {formatINR(aggOff[i])}
              </div>
              <div className="w-full rounded-t"
                style={{ height: `${heights[i]?.off ?? 0}%`, transition: 'height 0.65s cubic-bezier(0.34,1.56,0.64,1)', background: 'linear-gradient(180deg,#ffa040,#f58311)', boxShadow: (heights[i]?.off ?? 0) > 60 ? '0 0 8px #f5831155' : 'none' }} />
            </div>
          </div>
        ))}
      </div>

      {/* X-axis labels */}
      <div className="flex gap-2 mt-1">
        {barLabels.map((lbl, i) => (
          <div key={i} className="flex-1 text-center truncate" style={{ fontSize: 7, color: 'var(--text-muted)' }}>{lbl}</div>
        ))}
      </div>

      {/* Footer totals */}
      <div className="flex items-center gap-5 mt-3 pt-3 flex-wrap" style={{ borderTop: '1px solid var(--border)' }}>
        {[
          { label: labels.ol,  value: aggOl,  color: '#2673bb' },
          { label: labels.off, value: aggOff, color: '#f58311' },
          { label: 'Combined', value: aggOl.map((v,i) => v + aggOff[i]), color: memberColor },
        ].map(s => {
          const total = s.value.reduce((a,b) => a+b, 0); // raw ₹
          const display = formatINR(total);
          return (
            <div key={s.label}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-sm font-bold" style={{ color: s.color }}>{display}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Multi-segment donut chart ────────────────────────────────────────────────
function MultiDonut({ segments, size = 130 }) {
  const [anim, setAnim] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnim(true), 300); return () => clearTimeout(t); }, []);

  const r = 36, cx = 50, cy = 50, circ = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;
  const arcs = segments.map(seg => {
    const pct  = seg.value / total;
    const dash = anim ? pct * circ : 0;
    const gap  = circ - dash;
    const rot  = offset * 360 - 90;
    offset += pct;
    return { ...seg, dash, gap, rot, pct: Math.round(pct * 100) };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bar-track)" strokeWidth="10" />
        {arcs.map((arc, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={arc.color} strokeWidth="10"
            strokeDasharray={`${arc.dash} ${arc.gap}`}
            strokeLinecap="butt"
            transform={`rotate(${arc.rot} 50 50)`}
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 4px ${arc.color}88)` }}
          />
        ))}
        <text x="50" y="46" textAnchor="middle" fontSize="11" fontWeight="800" style={{ fill: 'var(--text-primary)', fontFamily: 'inherit' }}>{segments.length}</text>
        <text x="50" y="57" textAnchor="middle" fontSize="6.5" style={{ fill: 'var(--text-muted)', fontFamily: 'inherit' }}>types</text>
      </svg>
      <div className="grid gap-1.5 w-full">
        {arcs.map(arc => (
          <div key={arc.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: arc.color, boxShadow: `0 0 5px ${arc.color}88` }} />
            <span className="text-xs flex-1" style={{ color: 'var(--text-muted)' }}>{arc.label}</span>
            <span className="text-xs font-bold tabular-nums" style={{ color: arc.color }}>{arc.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── OxyLoans rate bar (animated) ─────────────────────────────────────────────
function OLRateBar({ pct, color }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 400); return () => clearTimeout(t); }, [pct]);
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bar-track)' }}>
      <div className="h-full rounded-full"
        style={{ width: `${w}%`, background: `linear-gradient(90deg,${color},${color}88)`, boxShadow: `0 0 6px ${color}55`, transition: 'width 1.1s cubic-bezier(0.34,1.56,0.64,1)' }} />
    </div>
  );
}

// ─── OxyLoans section ─────────────────────────────────────────────────────────
function OxyLoansSection({ fin, memberColor }) {
  const ol = fin.oxyloans;
  const running = ol.deals.filter(d => d.status === 'Active');
  const closed  = ol.deals.filter(d => d.status === 'Closed');
  const pending = ol.deals.filter(d => d.status === 'Pending');

  const runningAmt = running.reduce((sum, d) => {
    const n = parseFloat(d.amount.replace(/[₹,]/g, ''));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);
  const closedAmt = closed.reduce((sum, d) => {
    const n = parseFloat(d.amount.replace(/[₹,]/g, ''));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);
  const fmtAmt = (n) => formatINR(n ?? 0);

  const kpis = [
    { label: 'Monthly Interest', value: ol.monthlyInterest, sub: 'Earned this month',                    trend: '+8.3%', trendUp: true,  color: memberColor,  Icon: I.Percent,     badge: 'vs last month'              },
    { label: 'Running Deals',    value: String(ol.running), sub: `${fmtAmt(runningAmt)} active amount`,  trend: null,    trendUp: true,  color: '#35a13e',    Icon: I.Activity,    badge: `${ol.running} active deals` },
    { label: 'Closed Deals',     value: String(ol.closed),  sub: `${fmtAmt(closedAmt)} total repaid`,   trend: null,    trendUp: true,  color: '#2673bb',    Icon: I.CheckCircle, badge: 'All settled'                },
    { label: 'Total Invested',   value: ol.totalInvested,   sub: `${ol.deals.length} deals total`,      trend: '+2.2×', trendUp: true,  color: '#f58311',    Icon: I.Wallet,      badge: 'YoY growth'                 },
  ];

  // Deal amount donut: running vs closed amounts
  const runningPct = ol.deals.length > 0 ? Math.round((running.length / ol.deals.length) * 100) : 0;
  const amtSegments = [
    { label: 'Running', value: runningAmt,  color: '#35a13e' },
    { label: 'Closed',  value: closedAmt,   color: '#2673bb' },
    { label: 'Pending', value: ol.deals.filter(d=>d.status==='Pending').reduce((s,d)=>{ const n=parseFloat(d.amount.replace(/[₹,]/g,'')); return s+(isNaN(n)?0:n); },0), color: '#f58311' },
  ].filter(s => s.value > 0);

  // Rate distribution bars
  const rateGroups = ol.deals.reduce((acc, d) => {
    acc[d.rate] = (acc[d.rate] || 0) + 1; return acc;
  }, {});
  const rateColors = ['#2673bb','#35a13e','#f58311','#e95330','#2673bb'];
  const rateEntries = Object.entries(rateGroups);
  const maxRateCount = Math.max(...rateEntries.map(([,c])=>c), 1);

  return (
    <div className="grid gap-5">
      <SectionHeader icon={I.Bank} accent={memberColor} platform="OxyLoans" title="My Lending Portfolio" live />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px]">
        <GlassPanel accent={memberColor}><AnimatedBarChart data={ol.monthlyChart} accent={memberColor} /></GlassPanel>
        <GlassPanel accent="#35a13e" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <DonutRing pct={runningPct} color="#35a13e" size={110} centerLabel="Running" sub={`${ol.running} of ${ol.deals.length}`} />
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#35a13e' }}>Active Rate</p>
        </GlassPanel>
        <GlassPanel accent={memberColor}><StatusBars deals={ol.deals} /></GlassPanel>
      </div>
      {/* Extra charts row */}
      <div className="grid gap-4 lg:grid-cols-[160px_1fr]">
        {/* Deal amount donut */}
        <GlassPanel accent={memberColor} style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6 }}>
          <MultiDonut segments={amtSegments} size={120} />
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: memberColor }}>Amount Split</p>
        </GlassPanel>
        {/* Interest rate distribution */}
        <GlassPanel accent={memberColor}>
          <p className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color: memberColor }}>Interest Rate Distribution</p>
          <div className="grid gap-3">
            {rateEntries.map(([rate, count], i) => (
              <div key={rate}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: rateColors[i % rateColors.length], boxShadow: `0 0 5px ${rateColors[i % rateColors.length]}88` }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{rate}</span>
                  </div>
                  <span className="text-xs font-bold tabular-nums" style={{ color: rateColors[i % rateColors.length] }}>{count} deal{count > 1 ? 's' : ''}</span>
                </div>
                <OLRateBar pct={Math.round((count / maxRateCount) * 100)} color={rateColors[i % rateColors.length]} />
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Unique Rates</span>
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{rateEntries.length}</span>
          </div>
        </GlassPanel>
      </div>
      <TableWrap accent={memberColor}>
        <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-3"
          style={{ borderBottom: '1px solid var(--table-header-border)', background: 'var(--table-ol-header-accent)' }}>
          <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <I.BarChart /><h3 className="text-sm font-bold ml-1" style={{ color: 'var(--text-primary)' }}>My Loan Deals</h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[{ l: 'Running', c: running.length, col: '#35a13e' }, { l: 'Pending', c: pending.length, col: '#f58311' }, { l: 'Closed', c: closed.length, col: '#2673bb' }].map(b => (
              <span key={b.l} className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: `${b.col}12`, color: b.col, border: `1px solid ${b.col}25` }}>{b.l} · {b.c}</span>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--table-header-border)', background: 'var(--table-header-bg)' }}>
                {['Deal ID','Borrower','Lender','Amount','Rate','Due Date','Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ol.deals.map(d => (
                <tr key={d.id} className="transition-colors" style={{ borderBottom: '1px solid var(--table-row-border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="py-3.5 px-4"><span className="font-mono text-xs px-2.5 py-1 rounded-lg" style={{ background: 'var(--deal-id-bg)', color: 'var(--deal-id-color)', border: '1px solid var(--deal-id-border)' }}>{d.id}</span></td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'var(--avatar-bg)', color: 'var(--avatar-color)', border: '1px solid var(--avatar-border)' }}>{d.borrower.charAt(0)}</div>
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{d.borrower}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{d.lender}</td>
                  <td className="py-3.5 px-4 font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{d.amount}</td>
                  <td className="py-3.5 px-4"><span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: 'var(--rate-bg)', color: 'var(--rate-color)', border: '1px solid var(--rate-border)' }}>{d.rate}</span></td>
                  <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{d.due}</td>
                  <td className="py-3.5 px-4"><Chip status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableWrap>
    </div>
  );
}

//  Interest Statement Modal 
function InterestModal({ payment, onClose }) {
  if (!payment) return null;
  const principal = parseFloat(payment.amount.replace(/[,]/g, '')) || 0;
  const monthly   = Math.round(principal * 0.015);
  const fyears = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];
  const [selectedFY, setSelectedFY] = useState('2025-2026');
  const fyStart = parseInt(selectedFY.split('-')[0]);
  const fyMonths = [
    { key: `APR-${fyStart}`,   }, { key: `MAY-${fyStart}`,   },
    { key: `JUN-${fyStart}`,   }, { key: `JUL-${fyStart}`,   },
    { key: `AUG-${fyStart}`,   }, { key: `SEP-${fyStart}`,   },
    { key: `OCT-${fyStart}`,   }, { key: `NOV-${fyStart}`,   },
    { key: `DEC-${fyStart}`,   }, { key: `JAN-${fyStart+1}`, },
    { key: `FEB-${fyStart+1}`, }, { key: `MAR-${fyStart+1}`, },
  ];
  const paidData = {
    '2025-2026': {
      [`APR-${fyStart}`]: { paid: monthly,                    paidDate: '04-May-2025', mode: 'Online' },
      [`MAY-${fyStart}`]: { paid: monthly,                    paidDate: '28-May-2025', mode: 'CX'     },
      [`JUN-${fyStart}`]: { paid: monthly,                    paidDate: '15-Jul-2025', mode: 'Online' },
      [`JUL-${fyStart}`]: null,
      [`AUG-${fyStart}`]: { paid: monthly,                    paidDate: '30-Aug-2025', mode: 'Offline'},
      [`SEP-${fyStart}`]: { paid: Math.round(monthly * 0.84), paidDate: '14-Oct-2025', mode: 'CX'     },
      [`OCT-${fyStart}`]: null, [`NOV-${fyStart}`]: null, [`DEC-${fyStart}`]: null,
      [`JAN-${fyStart+1}`]: null, [`FEB-${fyStart+1}`]: null, [`MAR-${fyStart+1}`]: null,
    },
    '2024-2025': Object.fromEntries(
      ['APR-2024','MAY-2024','JUN-2024','JUL-2024','AUG-2024','SEP-2024',
       'OCT-2024','NOV-2024','DEC-2024','JAN-2025','FEB-2025','MAR-2025'].map((k, i) => [
        k, {
          paid: monthly,
          paidDate: `${String(i+5).padStart(2,'0')}-${['May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr'][i]}-${k.includes('2025') ? '2025' : '2024'}`,
          mode: ['Online','CX','Online','Offline','Online','CX','Online','Offline','CX','Online','Online','CX'][i],
        }
      ])
    ),
  };
  const fyData = paidData[selectedFY] ?? {};
  const totalPaid  = fyMonths.reduce((s, m) => s + (fyData[m.key]?.paid ?? 0), 0);
  const paidCount  = fyMonths.filter(m => fyData[m.key]).length;
  const onlineCount  = fyMonths.filter(m => fyData[m.key]?.mode === 'Online').length;
  const cxCount      = fyMonths.filter(m => fyData[m.key]?.mode === 'CX').length;
  const offlineCount = fyMonths.filter(m => fyData[m.key]?.mode === 'Offline').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="rounded-2xl overflow-hidden w-full max-w-2xl flex flex-col"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Statement</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {payment.name}  <span className="font-mono font-bold" style={{ color: '#f58311' }}>{payment.ref}</span>
              {'  '}Principal: <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{payment.amount}</span>
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* FY tabs */}
        <div className="px-6 py-4 flex gap-3 flex-wrap flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          {fyears.map(fy => {
            const isActive = selectedFY === fy;
            return (
              <button key={fy} onClick={() => setSelectedFY(fy)}
                className="px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={{
                  background: isActive ? '#2673bb' : 'transparent',
                  color: isActive ? '#fff' : '#2673bb',
                  border: '2px solid #2673bb',
                  boxShadow: isActive ? '0 4px 14px rgba(38,115,187,0.35)' : 'none',
                }}>
                {fy}
              </button>
            );
          })}
        </div>

        {/* Summary strip */}
        <div className="px-6 py-3 flex items-center gap-6 flex-wrap flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
          {[
            { label: 'Monthly Interest', value: `${monthly.toLocaleString('en-IN')}`, color: '#f58311' },
            { label: 'Months Paid',      value: `${paidCount} / 12`,                   color: '#35a13e' },
            { label: 'Total Paid (FY)',  value: `${totalPaid.toLocaleString('en-IN')}`, color: '#2673bb' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-sm font-extrabold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
          {/* Mode breakdown */}
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            {[
              { label: 'Online',  count: onlineCount,  color: '#35a13e', bg: 'rgba(53,161,62,0.1)',  border: 'rgba(53,161,62,0.2)'  },
              { label: 'CX',      count: cxCount,      color: '#e95330', bg: 'rgba(233,83,48,0.1)',  border: 'rgba(233,83,48,0.2)'  },
              { label: 'Offline', count: offlineCount, color: '#2673bb', bg: 'rgba(38,115,187,0.1)',  border: 'rgba(38,115,187,0.2)'  },
            ].map(m => (
              <span key={m.label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
                {m.label} · {m.count}
              </span>
            ))}
          </div>
        </div>

        {/* Scrollable table */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0" style={{ background: 'var(--surface-card)', zIndex: 1 }}>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['Month Name', 'To be Paid', 'Paid', 'Paid Date', 'Mode'].map(h => (
                  <th key={h} className="text-left py-4 px-6 font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fyMonths.map(m => {
                const row = fyData[m.key];
                const isPaid = !!row;
                return (
                  <tr key={m.key} className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="py-4 px-6 font-semibold" style={{ color: 'var(--text-primary)' }}>{m.key}</td>
                    <td className="py-4 px-6 font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{monthly.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-6 font-semibold tabular-nums" style={{ color: isPaid ? '#35a13e' : 'var(--text-muted)' }}>
                      {isPaid ? row.paid.toLocaleString('en-IN') : '-'}
                    </td>
                    <td className="py-4 px-6" style={{ color: isPaid ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {isPaid ? row.paidDate : '-'}
                    </td>
                    <td className="py-4 px-6">
                      {isPaid ? (() => {
                        const modeStyle = {
                          Online:  { bg: 'rgba(53,161,62,0.1)',  color: '#35a13e', border: 'rgba(53,161,62,0.2)'  },
                          CX:      { bg: 'rgba(233,83,48,0.1)',  color: '#e95330', border: 'rgba(233,83,48,0.2)'  },
                          Offline: { bg: 'rgba(38,115,187,0.1)',  color: '#2673bb', border: 'rgba(38,115,187,0.2)'  },
                        };
                        const ms = modeStyle[row.mode] ?? modeStyle.Offline;
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: ms.bg, color: ms.color, border: `1px solid ${ms.border}` }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: ms.color }} />
                            {row.mode}
                          </span>
                        );
                      })() : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Running / Participated Deals ────────────────────────────────────────────
function RunningDealsSection() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [expanded, setExpanded] = useState(null);
  const [statusFilter, setStatusFilter] = useState('Active');
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    getRunningDeals()
      .then(d => { if (d) setData(d); })
      .catch(e => setError(e.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
      
  }, []);

  const fmtINR = (n) => formatINR(n ?? 0);

  const participations = data?.participationInfo ?? [];
  
  // Filter by status (Active/Closed) - for now all are active, but structure is ready
  const statusFiltered = statusFilter === 'Active' 
    ? participations 
    : participations.filter(p => p.dealStatus === 'CLOSED' || p.dealStatus === 'ACHIEVED');
  
  // Filter by type (All/Offline/Online/CX/Remaining)
  const typeFiltered = typeFilter === 'All' 
    ? statusFiltered
    : statusFiltered.filter(p => {
        if (typeFilter === 'Remaining') {
          // Show deals with remaining capacity
          return (p.remainingDealValue ?? 0) > 0;
        }
        // For Offline/Online/CX - filter by amountTye or payment mode
        return p.amountTye === typeFilter || p.paymentMode === typeFilter;
      });

  const totalInvested  = participations.reduce((s, p) => s + (p.participatedAmount ?? 0), 0);
  const totalUpdated   = participations.reduce((s, p) => s + (p.updatedParticipation?.reduce((ss, u) => ss + (u.updationParticipation ?? 0), 0) ?? 0), 0);

  return (
    <div className="grid gap-5">
      <SectionHeader icon={I.Activity} accent="#35a13e" platform="SD Lots" title="My Participated Deals" live />

      {loading && (
        <div className="flex items-center justify-center gap-3 py-10 rounded-2xl"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#35a13e', borderTopColor: 'transparent' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading deals…</span>
        </div>
      )}

      {!loading && error && (
        <div className="py-8 text-center rounded-2xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: '#e95330' }}>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Summary strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Active Deals',     value: String(participations.length),  color: '#35a13e' },
              { label: 'Total Invested',   value: fmtINR(totalInvested),          color: '#2673bb' },
              { label: 'Total Updated',    value: fmtINR(totalUpdated),           color: '#f58311' },
              { label: 'Avg ROI',          value: participations.length ? `${(participations.reduce((s,p) => s + (p.rateOfInterest ?? 0), 0) / participations.length).toFixed(1)}%` : '—', color: '#2673bb' },
            ].map(s => (
              <div key={s.label} className="rounded-xl px-4 py-3"
                style={{ background: `${s.color}0a`, border: `1px solid ${s.color}20` }}>
                <p className="text-xl font-extrabold" style={{ color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Table with filters */}
          <TableWrap accent="#35a13e">
            <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3"
              style={{ borderBottom: '1px solid var(--border)', background: 'rgba(53,161,62,0.04)' }}>
              
              {/* Status tabs: Active / Closed */}
              <div className="flex items-center gap-1.5">
                <I.BarChart />
                <div className="flex gap-1 ml-1 p-0.5 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                  {[
                    { label: 'Active', count: participations.length, color: '#35a13e' }, 
                    { label: 'Closed', count: 0, color: '#2673bb' }
                  ].map(t => (
                    <button key={t.label} onClick={() => { setStatusFilter(t.label); setTypeFilter('All'); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{ 
                        background: statusFilter === t.label ? `${t.color}18` : 'transparent', 
                        color: statusFilter === t.label ? t.color : 'var(--text-muted)', 
                        border: `1px solid ${statusFilter === t.label ? t.color + '30' : 'transparent'}` 
                      }}>
                      {t.label} · {t.count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type filters: All / Offline / Online / CX / Remaining */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['All', 'Offline', 'Online', 'CX'].map(type => {
                  const typeColors = { 
                    All: '#35a13e', 
                    Offline: '#2673bb', 
                    Online: '#35a13e', 
                    CX: '#e95330',
                    Remaining: '#f58311'
                  };
                  const tc = typeColors[type];
                  const isActive = typeFilter === type;
                  const cnt = type === 'All' 
                    ? statusFiltered.length 
                    : type === 'Remaining'
                    ? statusFiltered.filter(p => (p.remainingDealValue ?? 0) > 0).length
                    : statusFiltered.filter(p => p.amountTye === type || p.paymentMode === type).length;
                  
                  return (
                    <button key={type} onClick={() => setTypeFilter(type)}
                      className="text-xs px-2.5 py-1 rounded-full font-semibold transition-all"
                      style={{ 
                        background: isActive ? `${tc}18` : 'var(--input-bg)', 
                        color: isActive ? tc : 'var(--text-muted)', 
                        border: `1px solid ${isActive ? tc + '35' : 'var(--border)'}`, 
                        boxShadow: isActive ? `0 0 8px ${tc}20` : 'none' 
                      }}>
                      {type} · {cnt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--table-header-bg)' }}>
                    {['#', 'Deal Name', 'Payout Type', 'Total Invested', 'ROI %', 'Min/Max', 'Participated Date', 'Status'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {typeFiltered.length === 0 ? (
                    <tr><td colSpan={9} className="py-12 text-center">
                      <p className="text-3xl mb-3">📊</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No deals found</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Try changing the filters</p>
                    </td></tr>
                  ) : typeFiltered.map((p, i) => {
                    const updatesTotal = (p.updatedParticipation ?? []).reduce((s, u) => s + (u.updationParticipation ?? 0), 0);
                    const totalInvested = (p.participatedAmount ?? 0) + updatesTotal;
                    const isOpen = expanded === i;

                    return (
                      <React.Fragment key={p.dealId ?? i}>
                        <tr className="transition-colors cursor-pointer" 
                          style={{ borderBottom: '1px solid var(--table-row-border)' }}
                          onClick={() => setExpanded(isOpen ? null : i)}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          
                          <td className="py-3.5 px-4 font-bold" style={{ color: 'var(--text-primary)' }}>{i + 1}</td>
                          
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(53,161,62,0.12)', border: '1px solid rgba(53,161,62,0.25)', color: '#35a13e' }}>
                                <I.Activity />
                              </div>
                              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{p.dealName}</span>
                            </div>
                          </td>
                          
                          <td className="py-3.5 px-4">
                            <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                              style={{ background: 'rgba(38,115,187,0.1)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.2)' }}>
                              {p.amountTye}
                            </span>
                          </td>
                          
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-sm" style={{ color: '#2673bb', fontFamily: "'JetBrains Mono', monospace" }}>{fmtINR(totalInvested)}</p>
                            {updatesTotal > 0 && (
                              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                {fmtINR(p.participatedAmount)} + {fmtINR(updatesTotal)}
                              </p>
                            )}
                          </td>
                          
                          <td className="py-3.5 px-4">
                            <span className="text-sm font-black" style={{ color: '#f58311', fontFamily: "'JetBrains Mono', monospace" }}>
                              {p.rateOfInterest}%
                            </span>
                          </td>
                          
                          <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                            {fmtINR(p.minimumParticipation ?? 0)} / {fmtINR(p.maxParticipation ?? 0)}
                          </td>
                          
                          <td className="py-3.5 px-4 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                            {p.participatedDate}
                          </td>
                          
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                                style={{ background: 'rgba(53,161,62,0.12)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.25)' }}>
                                Active
                              </span>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                className="w-3.5 h-3.5 transition-transform"
                                style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                <polyline points="6 9 12 15 18 9"/>
                              </svg>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded row: update history */}
                        {isOpen && p.updatedParticipation?.length > 0 && (
                          <tr>
                            <td colSpan={8} style={{ padding: 0, borderBottom: '1px solid var(--border)' }}>
                              <div style={{ background: 'var(--input-bg)', padding: '1.25rem' }}>
                                <div className="flex items-center gap-2 mb-3 px-2"
                                  style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: '#2673bb' }}>
                                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                  </svg>
                                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#2673bb' }}>Update History</span>
                                </div>
                                <div className="grid gap-2">
                                  {/* Original participation */}
                                  <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl"
                                    style={{ background: 'rgba(38,115,187,0.06)', border: '1px solid rgba(38,115,187,0.15)' }}>
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#2673bb' }} />
                                    <div className="flex-1">
                                      <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Initial Participation</p>
                                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{p.participatedDate}</p>
                                    </div>
                                    <p className="text-sm font-extrabold" style={{ color: '#2673bb', fontFamily: "'JetBrains Mono', monospace" }}>{fmtINR(p.participatedAmount)}</p>
                                  </div>
                                  {/* Updates */}
                                  {p.updatedParticipation.map((u, j) => (
                                    <div key={j} className="flex items-center gap-4 px-4 py-2.5 rounded-xl"
                                      style={{ background: 'rgba(53,161,62,0.06)', border: '1px solid rgba(53,161,62,0.15)' }}>
                                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#35a13e' }} />
                                      <div className="flex-1">
                                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                                          Update #{j + 1}
                                          {u.amountTye && <span className="ml-2 font-normal" style={{ color: 'var(--text-muted)' }}>· {u.amountTye}</span>}
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{u.updatedDate}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-extrabold" style={{ color: '#35a13e', fontFamily: "'JetBrains Mono', monospace" }}>{fmtINR(u.updationParticipation)}</p>
                                        {u.rateOfInterest && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.rateOfInterest}% ROI</p>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TableWrap>
        </>
      )}
    </div>
  );
}

// ─── Compact My Participations (up to 5) ─────────────────────────────────────
// function CompactParticipationsSection() {
//   const navigate = useNavigate();
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     getRunningDeals()
//       .then(d => { if (d) setData(d); })
//       .catch(e => setError(e.message ?? 'Failed to load'))
//       .finally(() => setLoading(false));
//   }, []);

//   const fmtINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);

//   const participations = (data?.participationInfo ?? []).slice(0, 5); // Show only first 5
//   const totalCount = data?.participationInfo?.length ?? 0;
//   const hasMore = totalCount > 5;

//   if (loading) return (
//     <div className="rounded-2xl p-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
//       <div className="flex items-center justify-center gap-3 py-8">
//         <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#35a13e', borderTopColor: 'transparent' }} />
//         <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading participations…</span>
//       </div>
//     </div>
//   );

//   if (error || participations.length === 0) return null;

//   return (
//     <div className="grid gap-4">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-xl flex items-center justify-center"
//             style={{ background: 'rgba(53,161,62,0.12)', border: '1px solid rgba(53,161,62,0.25)', color: '#35a13e' }}>
//             <I.Activity />
//           </div>
//           <div>
//             <h3 className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>My Participations</h3>
//             <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
//               Showing {participations.length} of {totalCount} active deals
//             </p>
//           </div>
//         </div>
//         {hasMore && (
//           <button onClick={() => navigate('/my-participations')}
//             className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
//             style={{ background: 'rgba(53,161,62,0.1)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.25)' }}>
//             View All ({totalCount})
//             <I.ArrowRight />
//           </button>
//         )}
//       </div>

//       <TableWrap accent="#35a13e">
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--table-header-bg)' }}>
//                 {['#', 'Deal Name', 'Payout Type', 'Invested', 'ROI %', 'Participated Date', 'Updates', 'Status'].map(h => (
//                   <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {participations.map((p, i) => {
//                 const latestUpdate = p.updatedParticipation?.[p.updatedParticipation.length - 1];
//                 const currentAmount = latestUpdate?.updationParticipation ?? p.participatedAmount;
//                 const growth = currentAmount - p.participatedAmount;
//                 const growthPct = p.participatedAmount > 0 ? ((growth / p.participatedAmount) * 100).toFixed(1) : 0;

//                 return (
//                   <tr key={p.dealId ?? i} className="transition-colors cursor-pointer" 
//                     style={{ borderBottom: '1px solid var(--table-row-border)' }}
//                     onClick={() => navigate('/my-participations')}
//                     onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
//                     onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    
//                     <td className="py-3.5 px-4 font-bold" style={{ color: 'var(--text-primary)' }}>{i + 1}</td>
                    
//                     <td className="py-3.5 px-4">
//                       <div className="flex items-center gap-2">
//                         <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
//                           style={{ background: 'rgba(53,161,62,0.12)', border: '1px solid rgba(53,161,62,0.25)', color: '#35a13e' }}>
//                           <I.Activity />
//                         </div>
//                         <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{p.dealName}</span>
//                       </div>
//                     </td>
                    
//                     <td className="py-3.5 px-4">
//                       <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
//                         style={{ background: 'rgba(38,115,187,0.1)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.2)' }}>
//                         {p.amountTye}
//                       </span>
//                     </td>
                    
//                     <td className="py-3.5 px-4">
//                       <div>
//                         <p className="font-bold text-sm" style={{ color: '#2673bb', fontFamily: "'JetBrains Mono', monospace" }}>{fmtINR(p.participatedAmount)}</p>
//                         {growth !== 0 && (
//                           <p className="text-xs font-semibold mt-0.5" style={{ color: growth > 0 ? '#35a13e' : '#e95330' }}>
//                             {growth > 0 ? '+' : ''}{growthPct}%
//                           </p>
//                         )}
//                       </div>
//                     </td>
                    
//                     <td className="py-3.5 px-4">
//                       <span className="text-sm font-black" style={{ color: '#f58311', fontFamily: "'JetBrains Mono', monospace" }}>
//                         {p.rateOfInterest}%
//                       </span>
//                     </td>
                    
//                     <td className="py-3.5 px-4 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
//                       {p.participatedDate}
//                     </td>
                    
//                     <td className="py-3.5 px-4 text-center">
//                       <span className="text-xs px-2 py-0.5 rounded-full font-bold"
//                         style={{ background: 'rgba(245,131,17,0.1)', color: '#f58311', border: '1px solid rgba(245,131,17,0.2)' }}>
//                         {p.updatedParticipation?.length ?? 0}
//                       </span>
//                     </td>
                    
//                     <td className="py-3.5 px-4">
//                       <span className="text-xs px-2 py-0.5 rounded-full font-bold"
//                         style={{ background: 'rgba(53,161,62,0.12)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.25)' }}>
//                         Active
//                       </span>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </TableWrap>

//       {hasMore && (
//         <div className="flex justify-center">
//           <button onClick={() => navigate('/my-participations')}
//             className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105"
//             style={{ background: 'linear-gradient(135deg,#35a13e,#22c55e)', color: '#fff', boxShadow: '0 4px 16px rgba(53,161,62,0.35)' }}>
//             View All {totalCount} Participations
//             <I.ArrowRight />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// ─── Offline section ──────────────────────────────────────────────────────────
function OfflineSection({ fin, memberColor }) {
  const off = fin.offline;
  const [modeFilter, setModeFilter] = useState('All');
  const [dealTab, setDealTab] = useState('Active');
  const [dealSummaryOpen, setDealSummaryOpen] = useState(false);
  const [interestPayment, setInterestPayment] = useState(null);
  const [participationData, setParticipationData] = useState(null);
  const [migratedDeals, setMigratedDeals] = useState([]);
  const [goldEarningsData, setGoldEarningsData] = useState(null);
  const [goldInvestedByDealId, setGoldInvestedByDealId] = useState({});
  const [goldApprovedDateByDealId, setGoldApprovedDateByDealId] = useState({});
  const PAYOUT_LABELS = { MONTHLY: 'Monthly', QUARTELY: 'Quarterly', HALFLY: 'Half-Yearly', YEARLY: 'Yearly', ENDOFTHEDEAL: 'End of Deal' };
  const PAYOUT_COLORS = { MONTHLY: '#35a13e', QUARTELY: '#2673bb', HALFLY: '#f58311', YEARLY: '#e95330', ENDOFTHEDEAL: '#6366f1' };

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      // Fetch lenderId for the logged-in user from migration info
      let migratedLenderId = null;
      try {
        const migInfo = await getMigrationOxyloansUserInfo();
        migratedLenderId = migInfo?.lenderId ?? migInfo?.lender_id ?? null;
      } catch { /* fall through — getUserOfflineParticipationDealsInfo uses userId as fallback */ }

      const [runningRes, migratedRes, goldRes] = await Promise.allSettled([
        getRunningDeals(),
        getUserOfflineParticipationDealsInfo(migratedLenderId),
        getGoldDealsEarnings(),
      ]);
      if (ignore) return;

      if (runningRes.status === 'fulfilled' && runningRes.value) {
        setParticipationData(runningRes.value);
      }
      if (migratedRes.status === 'fulfilled') {
        setMigratedDeals(Array.isArray(migratedRes.value) ? migratedRes.value : []);
      } else {
        setMigratedDeals([]);
      }
      if (goldRes.status === 'fulfilled' && goldRes.value) {
        setGoldEarningsData(goldRes.value);
        const runningGold = Array.isArray(goldRes.value?.userEarenInfoResponse) ? goldRes.value.userEarenInfoResponse : [];
        const uniqueDealIds = Array.from(new Set(runningGold.map(d => String(d?.dealId ?? '')).filter(Boolean)));
        if (uniqueDealIds.length === 0) {
          setGoldInvestedByDealId({});
          setGoldApprovedDateByDealId({});
          return;
        }
        const growthResults = await Promise.allSettled(uniqueDealIds.map(dealId => getGoldGrowthDetail(dealId)));
        if (ignore) return;
        const amountMap = {};
        const approvedDateMap = {};
        growthResults.forEach((res, idx) => {
          const dealId = uniqueDealIds[idx];
          if (res.status !== 'fulfilled') return;
          const rows = Array.isArray(res.value) ? res.value : (res.value ? [res.value] : []);
          approvedDateMap[dealId] = rows[0]?.adminApprovedDate ?? '';
          const totalApproved = rows.reduce((sum, row) => (
            sum + Number(
              row?.approvedAmount
              ?? row?.participatedAmount
              ?? row?.participationAmount
              ?? row?.amount
              ?? 0
            )
          ), 0);
          amountMap[dealId] = totalApproved;
        });
        setGoldInvestedByDealId(amountMap);
        setGoldApprovedDateByDealId(approvedDateMap);
      } else {
        setGoldEarningsData(null);
        setGoldInvestedByDealId({});
        setGoldApprovedDateByDealId({});
      }
    };
    load().catch(() => {});
    return () => { ignore = true; };
  }, []);

  //  Helpers 
  const fmtAmt = (n) => {
    const value = Number(n ?? 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0);
  };

  // Parse "DD/MM/YYYY"  0-based month index
  const parseMonth = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return -1;
    const value = dateStr.trim();
    if (!value) return -1;
    if (value.includes('/')) {
      const parts = value.split('/');
      return parts.length === 3 ? parseInt(parts[1], 10) - 1 : -1;
    }
    if (value.includes('-')) {
      const parts = value.split('-');
      if (parts.length !== 3) return -1;
      if (parts[0].length === 4) return parseInt(parts[1], 10) - 1; // YYYY-MM-DD
      return parseInt(parts[1], 10) - 1; // DD-MM-YYYY
    }
    return -1;
  };
  const parseDdMmYyyy = (value) => {
    if (!value || typeof value !== 'string') return null;
    const [dd, mm, yyyy] = value.split('/');
    const d = Number(dd);
    const m = Number(mm);
    const y = Number(yyyy);
    if (!d || !m || !y) return null;
    const dt = new Date(y, m - 1, d);
    return Number.isNaN(dt.getTime()) ? null : dt;
  };
  const dedupeGoldDeals = (rows) => {
    const map = new Map();
    (rows ?? []).forEach((item) => {
      const key = `${item?.dealId ?? ''}-${item?.participationType ?? ''}`;
      if (!key || key === '-') return;
      if (!map.has(key)) {
        map.set(key, item);
        return;
      }
      const prev = map.get(key);
      if (Number(item?.totalUserEarnedPercentage ?? 0) > Number(prev?.totalUserEarnedPercentage ?? 0)) {
        map.set(key, item);
      }
    });
    return Array.from(map.values());
  };
  const mergeMigratedByRoi = (items) => {
    const groups = new Map();
    for (const item of items ?? []) {
      const currentPrincipal = Number(item?.currentPrincipalAmount ?? 0);
      if (!(currentPrincipal > 0)) continue;
      const key = `${item?.dealName ?? 'Unknown'}|${item?.roi ?? 0}`;
      if (!groups.has(key)) {
        groups.set(key, {
          dealName: item?.dealName ?? 'Unknown',
          roi: Number(item?.roi ?? 0),
          payOutType: item?.payOutType ?? null,
          earliestDate: item?.participationDate ?? null,
          entries: [],
        });
      }
      const g = groups.get(key);
      g.entries.push(item);
      g.payOutType = g.payOutType ?? item?.payOutType ?? null;
      const oldDate = parseDdMmYyyy(g.earliestDate);
      const nextDate = parseDdMmYyyy(item?.participationDate);
      if (!oldDate || (nextDate && nextDate < oldDate)) {
        g.earliestDate = item?.participationDate ?? g.earliestDate;
      }
    }
    return Array.from(groups.values()).map(g => {
      const currentPrincipalTotal = g.entries.reduce((s, e) => s + Number(e?.currentPrincipalAmount ?? 0), 0);
      const monthlyInterestTotal = g.entries.reduce(
        (s, e) => s + monthlyEquivalent(Number(e?.currentPrincipalAmount ?? 0), 'MONTHLY', Number(e?.roi ?? g.roi ?? 0)),
        0
      );
      const sortedEntries = [...g.entries].sort((a, b) => {
        const ad = parseDdMmYyyy(a?.participationDate);
        const bd = parseDdMmYyyy(b?.participationDate);
        if (!ad && !bd) return 0;
        if (!ad) return 1;
        if (!bd) return -1;
        return ad - bd;
      });
      return {
        ...g,
        participationAmount: currentPrincipalTotal,
        monthlyInterest: monthlyInterestTotal,
        entryCount: sortedEntries.length,
        entries: sortedEntries,
      };
    });
  };

  //  Build 12-month arrays from real participation data 
  const participations = participationData?.participationInfo ?? [];
  const mergedMigrated = mergeMigratedByRoi(migratedDeals);
  const dedupedGoldDeals = dedupeGoldDeals(goldEarningsData?.userEarenInfoResponse ?? []);
  const migratedInvested = mergedMigrated.reduce((s, d) => s + Number(d?.participationAmount ?? 0), 0);
  const migratedMonthlyInterest = mergedMigrated.reduce((s, d) => s + Number(d?.monthlyInterest ?? 0), 0);
  const migratedDealCount = mergedMigrated.length;
  const migratedEntryCount = mergedMigrated.reduce((s, d) => s + Number(d?.entryCount ?? 0), 0);
  const getGoldInvestedAmount = (d) => Number(
    d?.participatedAmount
    ?? d?.participationAmount
    ?? d?.investedAmount
    ?? d?.totalInvestedAmount
    ?? d?.approvedAmount
    ?? d?.amount
    ?? 0
  );
  const goldDealsInvested = dedupedGoldDeals.reduce((s, d) => {
    const dealId = String(d?.dealId ?? '');
    const resolved = Number(goldInvestedByDealId[dealId] ?? 0);
    return s + (resolved > 0 ? resolved : getGoldInvestedAmount(d));
  }, 0);
  const goldDealsCount = dedupedGoldDeals.length;
  const monthlyInvested    = Array(12).fill(0);
  const monthlyInterestArr = Array(12).fill(0);

  participations.forEach(p => {
    const amount = p.participatedAmount ?? 0;
    const roi    = p.rateOfInterest ?? 0;
    const month  = parseMonth(p.participatedDate);

    if (month >= 0 && month < 12) monthlyInvested[month] += amount; // store in raw ₹

    // roi is per payout period — convert to monthly equivalent
    let monthlyRate = 0;
    if      (p.amountTye === 'MONTHLY')      monthlyRate = roi / 100;
    else if (p.amountTye === 'QUARTELY')     monthlyRate = (roi / 100) / 3;
    else if (p.amountTye === 'HALFLY')       monthlyRate = (roi / 100) / 6;
    else if (p.amountTye === 'YEARLY')       monthlyRate = (roi / 100) / 12;

    const earning = amount * monthlyRate; // raw ₹
    if (month >= 0 && earning > 0) {
      for (let m = month; m < 12; m++) monthlyInterestArr[m] += earning;
    }

    (p.updatedParticipation ?? []).forEach(u => {
      const uMonth  = parseMonth(u.updatedDate);
      const uAmount = u.updationParticipation ?? 0;
      if (uMonth >= 0 && uMonth < 12) monthlyInvested[uMonth] += uAmount; // raw ₹
      const uEarning = uAmount * monthlyRate; // raw ₹
      if (uMonth >= 0 && uEarning > 0) {
        for (let m = uMonth; m < 12; m++) monthlyInterestArr[m] += uEarning;
      }
    });
  });

  mergedMigrated.forEach((d) => {
    const month = parseMonth(d?.earliestDate);
    const amount = Number(d?.participationAmount ?? 0);
    const monthly = Number(d?.monthlyInterest ?? 0);
    if (month >= 0 && month < 12) {
      monthlyInvested[month] += amount;
      if (monthly > 0) {
        for (let m = month; m < 12; m++) monthlyInterestArr[m] += monthly;
      }
    }
  });
  const goldTimelineSource = dedupedGoldDeals;
  goldTimelineSource.forEach((d) => {
    const month = parseMonth(d?.participatedDate ?? d?.participationDate ?? d?.createdDate ?? d?.updatedDate);
    const amount = getGoldInvestedAmount(d);
    if (month >= 0 && month < 12 && amount > 0) {
      monthlyInvested[month] += amount;
    }
  });

  // Keep raw ₹ — no division, no rounding
  const investedChart = monthlyInvested.map(v => Number(v ?? 0));
  const interestChart = monthlyInterestArr.map(v => Number(v ?? 0));

  //  KPI values 
  const runningTotalInvested = participations.reduce((s, p) => {
    const updates = (p.updatedParticipation ?? []).reduce((ss, u) => ss + (u.updationParticipation ?? 0), 0);
    return s + (p.participatedAmount ?? 0) + updates;
  }, 0);
  const totalInvested = runningTotalInvested + migratedInvested + goldDealsInvested;
  const currentMonth  = new Date().getMonth();

  // Also compute total monthly interest the same way as MyParticipations (sum all entries)
  const runningMonthlyInterest = participations.reduce((sum, p) => {
    const roi = p.rateOfInterest ?? 0;
    const entries = [
      { amount: p.participatedAmount ?? 0, payout: p.amountTye },
      ...(p.updatedParticipation ?? []).map(u => ({ amount: u.updationParticipation ?? 0, payout: u.amountTye ?? p.amountTye })),
    ];
    return sum + entries.reduce((s, e) => {
      if (!e.amount) return s;
      let mr = 0;
      if      (e.payout === 'MONTHLY')      mr = roi / 100;
      else if (e.payout === 'QUARTELY')     mr = (roi / 100) / 3;
      else if (e.payout === 'HALFLY')       mr = (roi / 100) / 6;
      else if (e.payout === 'YEARLY')       mr = (roi / 100) / 12;
      return s + (e.amount * mr);
    }, 0);
  }, 0);
  const totalMonthlyInterest = runningMonthlyInterest + migratedMonthlyInterest;

  function monthlyEquivalent(amount, payout, roi) {
    if (!amount) return 0;
    let mr = 0;
    if      (payout === 'MONTHLY')      mr = roi / 100;
    else if (payout === 'QUARTELY')     mr = (roi / 100) / 3;
    else if (payout === 'HALFLY')       mr = (roi / 100) / 6;
    else if (payout === 'YEARLY')       mr = (roi / 100) / 12;
    return amount * mr;
  }

  const getDealBucket = (p) => {
    const text = `${p?.dealName ?? ''} ${p?.dealType ?? ''} ${p?.category ?? ''}`.toLowerCase();
    if (text.includes('gold')) return 'gold';
    if (text.includes('asset') || text.includes('property')) return 'asset';
    return 'sd';
  };

  const summaryRows = [
    { key: 'sd', label: 'SD Lot' },
    { key: 'gold', label: 'Gold Deals' },
    { key: 'asset', label: 'Asset' },
  ].map(row => ({
    ...row,
    deals: 0,
    monthly: 0,
    quarterly: 0,
    halfYearly: 0,
    yearly: 0,
    activeDeals: 0,
    closedDeals: 0,
    totalInvested: 0,
  }));

  const addPayoutCount = (row, payoutType, weight = 1) => {
    const t = normalizePayoutType(payoutType);
    if (t === 'MONTHLY') row.monthly += weight;
    else if (t === 'QUARTELY') row.quarterly += weight;
    else if (t === 'HALFLY') row.halfYearly += weight;
    else if (t === 'YEARLY') row.yearly += weight;
  };

  const summaryMap = Object.fromEntries(summaryRows.map(r => [r.key, r]));
  participations.forEach((p) => {
    const bucket = getDealBucket(p);
    const row = summaryMap[bucket];
    if (!row) return;

    const updates = p.updatedParticipation ?? [];
    const investedFromUpdates = updates.reduce((s, u) => s + (u.updationParticipation ?? 0), 0);
    const isClosed = p.dealStatus === 'CLOSED' || p.dealStatus === 'ACHIEVED';
    const roi = p.rateOfInterest ?? 0;

    row.deals += 1;
    row.totalInvested += (p.participatedAmount ?? 0) + investedFromUpdates;
    addPayoutCount(row, p.amountTye, 1);
    updates.forEach((u) => addPayoutCount(row, u.amountTye ?? p.amountTye, 1));
    if (isClosed) row.closedDeals += 1;
    else row.activeDeals += 1;
  });
  mergedMigrated.forEach((d) => {
    const bucket = getDealBucket(d);
    const row = summaryMap[bucket];
    if (!row) return;
    row.deals += 1;
    row.activeDeals += 1;
    row.totalInvested += Number(d?.participationAmount ?? 0);
    addPayoutCount(row, d?.payOutType, Number(d?.entryCount ?? 1) || 1);
  });
  if (summaryMap.gold) {
    summaryMap.gold.deals += goldDealsCount;
    summaryMap.gold.activeDeals += goldDealsCount;
    summaryMap.gold.totalInvested += goldDealsInvested;
    dedupedGoldDeals.forEach((d) => addPayoutCount(summaryMap.gold, d?.participationType, 1));
  }

  const totalSummary = summaryRows.reduce((acc, r) => ({
    key: 'total',
    label: 'Total',
    deals: acc.deals + r.deals,
    monthly: acc.monthly + r.monthly,
    quarterly: acc.quarterly + r.quarterly,
    halfYearly: acc.halfYearly + r.halfYearly,
    yearly: acc.yearly + r.yearly,
    activeDeals: acc.activeDeals + r.activeDeals,
    closedDeals: acc.closedDeals + r.closedDeals,
    totalInvested: acc.totalInvested + r.totalInvested,
  }), { deals: 0, monthly: 0, quarterly: 0, halfYearly: 0, yearly: 0, activeDeals: 0, closedDeals: 0, totalInvested: 0 });

  function normalizePayoutType(type) {
    const t = String(type ?? '').trim().toUpperCase();
    if (t === 'MONTHLY') return 'MONTHLY';
    if (t === 'QUARTELY' || t === 'QUARTERLY') return 'QUARTELY';
    if (t === 'HALFLY' || t === 'HALFYEARLY' || t === 'HALF-YEARLY') return 'HALFLY';
    if (t === 'YEARLY') return 'YEARLY';
    if (t === 'ENDOFTHEDEAL' || t === 'END OF DEAL') return 'ENDOFTHEDEAL';
    return null;
  }
  const payoutAmountFromAnnualPct = (amount, payoutType, annualPct) => {
    if (!amount || !annualPct) return 0;
    const p = normalizePayoutType(payoutType);
    const annualAmount = amount * (annualPct / 100);
    if (p === 'MONTHLY') return annualAmount / 12;
    if (p === 'QUARTELY') return annualAmount / 4;
    if (p === 'HALFLY') return annualAmount / 2;
    if (p === 'YEARLY') return annualAmount;
    return 0;
  };
  const payoutRoiFromAnnualPct = (payoutType, annualPct) => {
    if (!annualPct) return 0;
    const p = normalizePayoutType(payoutType);
    if (p === 'MONTHLY') return Number((annualPct / 12).toFixed(2));
    if (p === 'QUARTELY') return Number((annualPct / 4).toFixed(2));
    if (p === 'HALFLY') return Number((annualPct / 2).toFixed(2));
    if (p === 'YEARLY') return Number(annualPct.toFixed(2));
    return 0;
  };
  const runningTableDeals = participations.map((p, idx) => {
    const updatesAmount = (p.updatedParticipation ?? []).reduce((s, u) => s + Number(u?.updationParticipation ?? 0), 0);
    const baseAmount = Number(p?.participatedAmount ?? 0);
    const totalAmount = baseAmount + updatesAmount;
    const payout = normalizePayoutType(p?.amountTye);
    const roi = Number(p?.rateOfInterest ?? 0);
    const isClosed = p?.dealStatus === 'CLOSED' || p?.dealStatus === 'ACHIEVED';
    return {
      key: p?.dealId ?? `running-${idx}`,
      source: 'running',
      dealName: p?.dealName ?? '—',
      payoutType: payout,
      baseAmount,
      updatesAmount,
      totalInvested: totalAmount,
      roi,
      roiDisplay: roi,
      payoutAmount: totalAmount * (roi / 100),
      monthlyInterest: monthlyEquivalent(totalAmount, payout, roi),
      participatedDate: p?.participatedDate ?? '—',
      status: isClosed ? 'Closed' : 'Active',
    };
  });
  const migratedTableDeals = mergedMigrated.map((d, idx) => ({
    key: `migrated-${d?.dealName ?? 'deal'}-${idx}`,
    source: 'migrated',
    dealName: d?.dealName ?? 'Migrated',
    payoutType: normalizePayoutType(d?.payOutType) ?? 'MONTHLY',
    baseAmount: Number(d?.participationAmount ?? 0),
    updatesAmount: 0,
    totalInvested: Number(d?.participationAmount ?? 0),
    roi: Number(d?.roi ?? 0),
    roiDisplay: Number(d?.roi ?? 0),
    payoutAmount: Number(d?.monthlyInterest ?? 0),
    monthlyInterest: Number(d?.monthlyInterest ?? 0),
    participatedDate: d?.earliestDate ?? '—',
    status: 'Active',
  }));
  const goldById = new Map();
  dedupedGoldDeals.forEach((d, idx) => {
    const id = String(d?.dealId ?? '');
    if (!id) return;
    const payoutType = normalizePayoutType(d?.participationType);
    const resolved = Number(goldInvestedByDealId[id] ?? 0);
    const amount = resolved > 0 ? resolved : getGoldInvestedAmount(d);
    const annualPct = Number(d?.interestEarnedPercentage ?? 0);
    const payoutAmount = payoutAmountFromAnnualPct(amount, payoutType, annualPct);
    const payoutRoi = payoutRoiFromAnnualPct(payoutType, annualPct);
    goldById.set(id, {
      key: `gold-running-${id}-${idx}`,
      source: 'gold',
      dealName: d?.dealName ?? 'Gold Deal',
      payoutType,
      baseAmount: amount,
      updatesAmount: 0,
      totalInvested: amount,
      roi: annualPct > 0 ? Number(annualPct.toFixed(2)) : null,
      roiDisplay: payoutRoi > 0 ? payoutRoi : null,
      payoutAmount,
      monthlyInterest: payoutAmountFromAnnualPct(amount, payoutType, annualPct),
      participatedDate: goldApprovedDateByDealId[id] ?? d?.adminApprovedDate ?? d?.participatedDate ?? d?.participationDate ?? '—',
      status: 'Active',
    });
  });
  const allTableDeals = [...runningTableDeals, ...migratedTableDeals, ...Array.from(goldById.values())];
  const dealSummaryBaseRows = [
    { key: 'sd', label: 'SD Lot' },
    { key: 'gold', label: 'Gold Deals' },
    { key: 'asset', label: 'Asset' },
  ].map((r) => ({
    ...r,
    monthly: 0,
    quarterly: 0,
    halfYearly: 0,
    yearly: 0,
    activeDeals: 0,
    closedDeals: 0,
    totalInvested: 0,
  }));
  const dealSummaryBaseMap = Object.fromEntries(dealSummaryBaseRows.map(r => [r.key, r]));
  const bucketFromRow = (d) => {
    if (d?.source === 'gold') return 'gold';
    const text = `${d?.dealName ?? ''}`.toLowerCase();
    if (text.includes('gold')) return 'gold';
    if (text.includes('asset') || text.includes('property')) return 'asset';
    return 'sd';
  };
  const addPayoutAmountToSummary = (row, payoutType, amount) => {
    const t = normalizePayoutType(payoutType);
    const val = Number(amount ?? 0);
    if (t === 'MONTHLY') row.monthly += val;
    else if (t === 'QUARTELY') row.quarterly += val;
    else if (t === 'HALFLY') row.halfYearly += val;
    else if (t === 'YEARLY') row.yearly += val;
  };
  allTableDeals.forEach((d) => {
    const row = dealSummaryBaseMap[bucketFromRow(d)];
    if (!row) return;
    row.totalInvested += Number(d?.totalInvested ?? 0);
    if (d?.status === 'Closed') row.closedDeals += 1;
    else row.activeDeals += 1;
    addPayoutAmountToSummary(row, d?.payoutType, d?.payoutAmount ?? 0);
  });
  const dealSummaryTotal = dealSummaryBaseRows.reduce((acc, r) => ({
    key: 'total',
    label: 'Total',
    monthly: acc.monthly + r.monthly,
    quarterly: acc.quarterly + r.quarterly,
    halfYearly: acc.halfYearly + r.halfYearly,
    yearly: acc.yearly + r.yearly,
    activeDeals: acc.activeDeals + r.activeDeals,
    closedDeals: acc.closedDeals + r.closedDeals,
    totalInvested: acc.totalInvested + r.totalInvested,
  }), { monthly: 0, quarterly: 0, halfYearly: 0, yearly: 0, activeDeals: 0, closedDeals: 0, totalInvested: 0 });
  const dealSummaryRowsForTable = [...dealSummaryBaseRows, dealSummaryTotal];
  const activeDeals = allTableDeals.filter(d => d.status === 'Active').length;
  const closedDeals = allTableDeals.filter(d => d.status === 'Closed').length;
  const totalParticipationCount = allTableDeals.length;

  //  Payout type donut 
  const payoutKeys = ['MONTHLY', 'QUARTELY', 'HALFLY', 'YEARLY'];
  const payoutCount = Object.fromEntries(payoutKeys.map(k => [k, 0]));
  allTableDeals.forEach((d) => {
    const key = normalizePayoutType(d?.payoutType);
    if (key && key !== 'ENDOFTHEDEAL') payoutCount[key] += 1;
  });
  const payoutSegments = payoutKeys.map((k) => ({
    label: PAYOUT_LABELS[k] ?? k,
    value: payoutCount[k] ?? 0,
    color: PAYOUT_COLORS[k] ?? '#888',
  }));

  const statusGroups = {
    Active: { count: activeDeals,  color: '#35a13e', glow: 'rgba(53,161,62,0.4)'  },
    Closed: { count: closedDeals,  color: '#2673bb', glow: 'rgba(38,115,187,0.4)' },
  };
  const maxStatusCount = Math.max(...Object.values(statusGroups).map(g => g.count), 1);

  const kpis = [
    { label: 'Monthly Interest', Icon: I.Percent,     value: fmtAmt(totalMonthlyInterest), sub: `${MONTHS[currentMonth]} earnings`,       trend: null, trendUp: true, color: '#f58311', badge: 'This month'                    },
    { label: 'Active Deals',     Icon: I.Activity,    value: String(activeDeals),         sub: `${fmtAmt(totalInvested)} total invested`, trend: null, trendUp: true, color: '#35a13e', badge: activeDeals > 0 ? 'Live' : null },
    { label: 'Closed Deals',     Icon: I.CheckCircle, value: String(closedDeals),         sub: 'Completed deals',                        trend: null, trendUp: true, color: '#2673bb', badge: null                            },
    { label: 'Total Invested',   Icon: I.Wallet,      value: fmtAmt(totalInvested),       sub: `${totalParticipationCount} participations`, trend: null, trendUp: true, color: '#6366f1', badge: null                            },
  ];

  const modes = ['All', 'MONTHLY', 'QUARTELY', 'HALFLY', 'YEARLY', 'ENDOFTHEDEAL'];
  const modeColors = { All: '#f58311', MONTHLY: '#35a13e', QUARTELY: '#2673bb', HALFLY: '#f58311', YEARLY: '#e95330', ENDOFTHEDEAL: '#6366f1' };
  const baseDeals = dealTab === 'Active'
    ? allTableDeals.filter(d => d.status === 'Active')
    : allTableDeals.filter(d => d.status === 'Closed');
  const filteredDeals = modeFilter === 'All'
    ? baseDeals
    : baseDeals.filter(d => normalizePayoutType(d?.payoutType) === modeFilter);

  return (
    <>
      {interestPayment && <InterestModal payment={interestPayment} onClose={() => setInterestPayment(null)} />}
      <div className="grid gap-5">
        <SectionHeader icon={I.Package} accent="#f58311" platform="Offline " title="My Investment Portfolio" live />

        <TableWrap accent="#f58311">
          <button
            type="button"
            onClick={() => setDealSummaryOpen(o => !o)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left"
            style={{ borderBottom: dealSummaryOpen ? '1px solid var(--border)' : 'none', background: 'rgba(245,131,17,0.04)' }}>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Deal Summary</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                SD Lot, Gold Deals, Asset, and Total
              </p>
            </div>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 transition-transform"
              style={{ color: 'var(--text-muted)', transform: dealSummaryOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {dealSummaryOpen && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--table-header-bg)' }}>
                    {['Deal', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly', 'Active', 'Closed', 'Total Invested'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dealSummaryRowsForTable.map((r) => (
                    <tr key={r.key}
                      style={{
                        borderBottom: '1px solid var(--table-row-border)',
                        background: r.key === 'total'
                          ? 'rgba(38,115,187,0.06)'
                          : 'transparent',
                      }}>
                      <td className="py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{r.label}</td>
                      <td className="py-3 px-4 font-semibold" style={{ color: '#35a13e' }}>{fmtAmt(r.monthly)}</td>
                      <td className="py-3 px-4 font-semibold" style={{ color: '#2673bb' }}>{fmtAmt(r.quarterly)}</td>
                      <td className="py-3 px-4 font-semibold" style={{ color: '#f58311' }}>{fmtAmt(r.halfYearly)}</td>
                      <td className="py-3 px-4 font-semibold" style={{ color: '#6366f1' }}>{fmtAmt(r.yearly)}</td>
                      <td className="py-3 px-4 font-semibold" style={{ color: '#35a13e' }}>{r.activeDeals}</td>
                      <td className="py-3 px-4 font-semibold" style={{ color: '#2673bb' }}>{r.closedDeals}</td>
                      <td className="py-3 px-4 font-semibold" style={{ color: '#f58311' }}>{fmtAmt(r.totalInvested)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TableWrap>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map(k => <KpiCard key={k.label} {...k} />)}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_160px_180px]">
          <GlassPanel accent="#f58311">
            <DualBarChart
              olData={investedChart}
              offData={interestChart}
              memberColor="#f58311"
              labels={{ ol: 'Invested', off: 'Interest Earned' }}
            />
          </GlassPanel>
          <GlassPanel accent="#f58311" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {payoutSegments.length > 0
              ? <><MultiDonut segments={payoutSegments} size={120} /><p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#f58311' }}>participated</p></>
              : <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>No participations yet</p>
            }
          </GlassPanel>
          <GlassPanel accent="#f58311">
            <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: '#f58311' }}>Deal Status</p>
            <div className="grid gap-3.5">
              {Object.entries(statusGroups).map(([lbl, g]) => (
                <div key={lbl}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: g.color, boxShadow: `0 0 5px ${g.glow}` }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{lbl}</span>
                    </div>
                    <span className="text-xs font-bold tabular-nums" style={{ color: g.color }}>{g.count}</span>
                  </div>
                  <OLRateBar pct={Math.round((g.count / maxStatusCount) * 100)} color={g.color} />
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Deals</span>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{activeDeals + closedDeals}</span>
            </div>
          </GlassPanel>
        </div>

        <TableWrap accent="#f58311">
          <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3"
            style={{ borderBottom: '1px solid var(--border)', background: 'rgba(245,131,17,0.04)' }}>
            <div className="flex items-center gap-1.5">
              <I.FileText />
              <div className="flex gap-1 ml-1 p-0.5 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                {[
                  { label: 'Active', count: activeDeals, color: '#35a13e' },
                  { label: 'Closed', count: closedDeals, color: '#2673bb' },
                ].map(t => (
                  <button key={t.label} onClick={() => { setDealTab(t.label); setModeFilter('All'); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{ background: dealTab === t.label ? `${t.color}18` : 'transparent', color: dealTab === t.label ? t.color : 'var(--text-muted)', border: `1px solid ${dealTab === t.label ? t.color + '30' : 'transparent'}` }}>
                    {t.label}  {t.count}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {modes.map(m => {
                const mc = modeColors[m];
                const isActive = modeFilter === m;
                const cnt = m === 'All' ? baseDeals.length : baseDeals.filter(d => normalizePayoutType(d?.payoutType) === m).length;
                return (
                  <button key={m} onClick={() => setModeFilter(m)}
                    className="text-xs px-2.5 py-1 rounded-full font-semibold transition-all"
                    style={{ background: isActive ? `${mc}18` : 'var(--input-bg)', color: isActive ? mc : 'var(--text-muted)', border: `1px solid ${isActive ? mc + '35' : 'var(--border)'}`, boxShadow: isActive ? `0 0 8px ${mc}20` : 'none' }}>
                    {PAYOUT_LABELS[m] ?? m}  {cnt}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--table-header-bg)' }}>
                    {['#', 'Deal Name', 'Payout Type', 'Total Invested', 'ROI %', 'Payout Interest', 'Participated Date', 'Status'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs uppercase tracking-widest font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDeals.length === 0 ? (
                  <tr><td colSpan={9} className="py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>No {dealTab.toLowerCase()} deals found</td></tr>
                ) : filteredDeals.map((p, idx) => {
                  const payoutType = normalizePayoutType(p?.payoutType);
                  const pc = PAYOUT_COLORS[payoutType] ?? '#888';
                  const roi = p?.roiDisplay ?? p?.roi;
                  const amount = Number(p?.baseAmount ?? 0);
                  const updatesTotal = Number(p?.updatesAmount ?? 0);
                  const totalInvested = Number(p?.totalInvested ?? 0);
                  const payoutInterest = Number(p?.payoutAmount ?? p?.monthlyInterest ?? 0);
                  const isClosed = p?.status === 'Closed';
                  return (
                    <tr key={p.key ?? idx} className="transition-colors" style={{ borderBottom: '1px solid var(--table-row-border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="py-3 px-3 font-bold" style={{ color: 'var(--text-primary)' }}>{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${pc}15`, border: `1px solid ${pc}30`, color: pc }}>
                            <I.Activity />
                          </div>
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.dealName ?? '—'}</span>
                          {p.source === 'migrated' && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(245,131,17,0.12)', color: '#f58311', border: '1px solid rgba(245,131,17,0.26)' }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                              </svg>
                              Migrated
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: `${pc}12`, color: pc, border: `1px solid ${pc}25` }}>
                          {PAYOUT_LABELS[payoutType] ?? PAYOUT_LABELS["MONTHLY"]}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmtAmt(totalInvested)}</p>
                        {updatesTotal > 0 && (
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {fmtAmt(amount)} + {fmtAmt(updatesTotal)}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold" style={{ color: '#f58311' }}>{Number.isFinite(roi) ? `${roi}%` : '—'}</td>
                      <td className="py-3 px-3 font-bold tabular-nums" style={{ color: '#35a13e' }}>
                        {payoutInterest > 0 ? fmtAmt(payoutInterest) + ' ' + (payoutType === 'MONTHLY' ? 'MLY' : payoutType === 'YEARLY' ? 'YLY' : payoutType === 'QUARTELY' ? 'QLY' : payoutType === 'HALFLY' ? 'HLF' : 'MLY') : '—'}
                      </td>
                      <td className="py-3 px-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{p.participatedDate ?? '—'}</td>
                      <td className="py-3 px-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: isClosed ? 'rgba(38,115,187,0.12)' : 'rgba(53,161,62,0.12)', color: isClosed ? '#2673bb' : '#35a13e', border: isClosed ? '1px solid rgba(38,115,187,0.25)' : '1px solid rgba(53,161,62,0.25)' }}>
                          {isClosed ? 'Closed' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TableWrap>
      </div>
    </>
  );
}



// ─── OxyBricks section ────────────────────────────────────────────────────────
function OxyBricksSection({ data, loading }) {
  if (loading || !data) return <div className="rounded-2xl shimmer-bg" style={{ height: 180 }} />;
  const cards = [
    { label: 'Plots',  ...data.plots,  color: '#2673bb', Icon: I.Building },
    { label: 'Flats',  ...data.flats,  color: '#35a13e', Icon: I.Building },
    { label: 'Acres',  ...data.acres,  color: '#f58311', Icon: I.Zap      },
    { label: 'Villas', ...data.villas, color: '#e95330', Icon: I.Building },
  ];
  return (
    <div className="grid gap-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--section-icon-bricks-bg)', border: '1px solid var(--section-icon-bricks-border)', color: '#35a13e', boxShadow: '0 0 18px rgba(53,161,62,0.15)' }}>
          <I.Building />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#35a13e' }}>OxyBricks</p>
          <h2 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>My Properties — {data.total} total</h2>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(c => (
          <div key={c.label} className="rounded-2xl p-5 relative overflow-hidden cursor-default"
            style={{ background: `linear-gradient(135deg,${c.color}0e 0%,var(--card-bg) 100%)`, border: `1px solid ${c.color}20`, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: `0 2px 16px rgba(0,0,0,0.08),inset 0 1px 0 ${c.color}10`, transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 24px rgba(0,0,0,0.12),0 0 14px ${c.color}15,inset 0 1px 0 ${c.color}18`; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 2px 16px rgba(0,0,0,0.08),inset 0 1px 0 ${c.color}10`; }}>
            <div className="absolute -top-5 -right-5 w-18 h-18 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle,${c.color}15 0%,transparent 70%)`, filter: 'blur(12px)' }} />
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg,transparent,${c.color}30,transparent)` }} />
            <div className="relative z-10">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${c.color}14`, border: `1px solid ${c.color}25`, color: c.color }}>
                <c.Icon />
              </div>
              <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: c.color }}>{c.label}</p>
              <p className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>{c.count}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>DOC: {c.docs}</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: c.color }}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Family Overview ──────────────────────────────────────────────────────────
function FamilyOverview() {
  const [agg, setAgg] = useState(null);
  const [loading, setLoading] = useState(true);
  const liveOffline = useOfflineStats();

  useEffect(() => {
    getFamilyAggregate()
      .then(d => { if (d) setAgg(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const data = agg ?? {
    totalRevenue: '₹0', oxyloansTotal: '₹0', offlineTotal: '₹0', oxybricksTotal: '₹0',
    totalMembers: 0, totalDeals: 0, totalProperties: 0, memberBreakdown: [],
    monthlyFamilyChart: [0,0,0,0,0,0,0,0,0,0,0,0],
  };

  // Live offline values from useOfflineStats — real numbers, no stub zeros
  const offTotalInvested  = liveOffline?.ready ? formatINR(liveOffline.totalInvested)  : data.offlineTotal;
  const offMonthlyInterest = liveOffline?.ready ? formatINR(liveOffline.monthlyInterest) : '₹0';
  const offRunning        = liveOffline?.ready ? liveOffline.running  : 0;
  const offClosed         = liveOffline?.ready ? liveOffline.closed   : 0;
  const offTotal          = offRunning + offClosed;
  const offMonthlyChart   = liveOffline?.ready ? liveOffline.monthlyChart   : Array(12).fill(0);
  const offInvestedChart  = liveOffline?.ready ? liveOffline.investedChart  : Array(12).fill(0);

  const topKpis = [
    { label: 'Family Revenue',    value: data.totalRevenue,   sub: 'All platforms combined',              trend: '+18%', trendUp: true, color: '#f58311', Icon: I.Wallet   },
    { label: 'OxyLoans Total',    value: data.oxyloansTotal,  sub: 'Lending across family',               trend: '+12%', trendUp: true, color: '#2673bb', Icon: I.Bank     },
    { label: 'Offline Invested',  value: offTotalInvested,    sub: `${offTotal} deals · live`,            trend: '+5%',  trendUp: true, color: '#f58311', Icon: I.Package  },
    { label: 'Monthly Interest',  value: offMonthlyInterest,  sub: 'Offline est. per month',              trend: null,   trendUp: true, color: '#35a13e', Icon: I.Percent  },
    { label: 'Active Members',    value: String(data.totalMembers), sub: 'Approved family',               trend: null,   trendUp: true, color: '#e95330', Icon: I.Users    },
    { label: 'Total Deals',       value: String(data.totalDeals),   sub: 'Across all members',            trend: null,   trendUp: true, color: '#2673bb', Icon: I.BarChart },
  ];

  // Donut segments for running vs closed offline deals
  const donutTotal    = offRunning + offClosed || 1;
  const runningPct    = Math.round((offRunning / donutTotal) * 100);
  const investedMax   = Math.max(...offInvestedChart, 1);

  return (
    <div className="grid gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,rgba(245,131,17,0.2),rgba(245,131,17,0.06))', border: '1px solid rgba(245,131,17,0.3)', color: '#f58311', boxShadow: '0 0 24px rgba(245,131,17,0.2)' }}>
            <I.Users />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#f58311' }}>Family Overview</p>
            <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Family Portfolio</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(53,161,62,0.08)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.2)' }}>
          <span className="live-dot" style={{ width: 6, height: 6 }} />
          <span className="font-semibold">{data.totalMembers} Members · {loading ? 'Loading…' : 'Live'}</span>
        </div>
      </div>

      {/* ── Combined Analysis — offline charts first, at the very top ── */}
      <div className="rounded-2xl p-5 grid gap-5"
        style={{ background: 'var(--surface-card)', border: '1px solid rgba(245,131,17,0.18)', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        {/* Section label */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(245,131,17,0.12)', border: '1px solid rgba(245,131,17,0.25)', color: '#f58311' }}>
            <I.PieChart />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Combined Analysis
          </h3>
          <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full font-semibold"
            style={{ background: 'rgba(245,131,17,0.1)', color: '#f58311', border: '1px solid rgba(245,131,17,0.22)' }}>
            All Platforms
          </span>
        </div>

        {/* Charts row: Monthly Interest (2/3) + Running/Closed Donut (1/3) */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <GlassPanel accent="#f58311">
              <p className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color: '#f58311' }}>
                Offline · Monthly Interest Trend
              </p>
              <AnimatedBarChart data={offMonthlyChart} accent="#f58311" label="Monthly Interest" />
            </GlassPanel>
          </div>
          <GlassPanel accent="#f58311" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <DonutRing
              pct={runningPct}
              color="#f58311"
              size={120}
              centerLabel="Running"
              sub={`${offRunning} of ${offTotal}`}
            />
            <div className="w-full grid grid-cols-2 gap-2">
              {[
                { label: 'Running', value: offRunning, color: '#f58311' },
                { label: 'Closed',  value: offClosed,  color: '#2673bb' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-2 text-center"
                  style={{ background: `${s.color}0a`, border: `1px solid ${s.color}22` }}>
                  <p className="text-lg font-extrabold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Capital Invested mini-bars */}
        <GlassPanel accent="#2673bb">
          <p className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color: '#2673bb' }}>
            Offline · Capital Invested by Month
          </p>
          <div className="flex items-end gap-1 h-14">
            {offInvestedChart.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-sm transition-all"
                  style={{
                    height: `${Math.round((v / investedMax) * 48)}px`,
                    minHeight: v > 0 ? 3 : 1,
                    background: v > 0
                      ? 'linear-gradient(180deg,#2673bb,#2673bb88)'
                      : 'var(--bar-track)',
                    opacity: v > 0 ? 1 : 0.3,
                  }} />
                <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>{MONTHS[i].slice(0, 1)}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topKpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* ── Member Revenue Breakdown ── */}
      <TableWrap accent="#f58311">
        <div className="px-5 py-4 flex items-center gap-2"
          style={{ borderBottom: '1px solid var(--table-off-header-border)', background: 'var(--table-off-header-accent)' }}>
          <I.Users /><h3 className="text-sm font-bold ml-1" style={{ color: 'var(--text-primary)' }}>Member Revenue Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--table-header-border)', background: 'var(--table-header-bg)' }}>
                {['Member','LR ID','Role','OxyLoans','Offline','Properties','Total Revenue','Share'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data.memberBreakdown ?? []).map((m) => {
                const totalNum = parseFloat((m.revenue ?? '0').replace('₹','').replace('L',''));
                const totalFamilyNum = parseFloat((data.totalRevenue ?? '1').replace('₹','').replace('L',''));
                const sharePct = totalFamilyNum > 0 ? Math.round((totalNum / totalFamilyNum) * 100) : 0;
                return (
                  <tr key={m.id} className="transition-colors" style={{ borderBottom: '1px solid var(--table-row-border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}28` }}>
                          {m.name.charAt(0)}
                        </div>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{m.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4"><span className="font-mono text-xs px-2 py-0.5 rounded-lg" style={{ background: `${m.color}12`, color: m.color, border: `1px solid ${m.color}20` }}>{m.lrId}</span></td>
                    <td className="py-3.5 px-4"><span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${m.color}10`, color: m.color, border: `1px solid ${m.color}18` }}>{m.role}</span></td>
                    <td className="py-3.5 px-4 font-semibold" style={{ color: '#2673bb' }}>{m.oxyloans}</td>
                    <td className="py-3.5 px-4 font-semibold" style={{ color: '#f58311' }}>{m.offline}</td>
                    <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{m.properties} units</td>
                    <td className="py-3.5 px-4 font-extrabold text-sm" style={{ color: m.color }}>{m.revenue}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bar-track)', minWidth: 60 }}>
                          <div className="h-full rounded-full" style={{ width: `${sharePct}%`, background: m.color, transition: 'width 1s ease' }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: m.color }}>{sharePct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(data.memberBreakdown ?? []).length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    No member data yet — add family members to see their breakdown.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </TableWrap>

    </div>
  );
}

// ─── useOfflineStats: compute live offline totals (same logic as OfflineSection)
function useOfflineStats() {
  const [stats, setStats] = useState({
    totalInvested: 0, monthlyInterest: 0, running: 0, closed: 0,
    monthlyChart: Array(12).fill(0), investedChart: Array(12).fill(0), ready: false,
  });

  useEffect(() => {
    let ignore = false;

    // --- helpers (duplicated from OfflineSection scope) ---
    const parseDdMmYyyy = (value) => {
      if (!value || typeof value !== 'string') return null;
      const parts = value.split('/');
      if (parts.length !== 3) return null;
      const d = Number(parts[0]), m = Number(parts[1]), y = Number(parts[2]);
      if (!d || !m || !y) return null;
      const dt = new Date(y, m - 1, d);
      return Number.isNaN(dt.getTime()) ? null : dt;
    };
    const mergeMigratedByRoi = (items) => {
      const groups = new Map();
      for (const item of items ?? []) {
        const cp = Number(item?.currentPrincipalAmount ?? 0);
        if (!(cp > 0)) continue;
        const key = `${item?.dealName ?? 'Unknown'}|${item?.roi ?? 0}`;
        if (!groups.has(key)) groups.set(key, { roi: Number(item?.roi ?? 0), entries: [] });
        groups.get(key).entries.push(item);
      }
      return Array.from(groups.values()).map(g => {
        const principal = g.entries.reduce((s, e) => s + Number(e?.currentPrincipalAmount ?? 0), 0);
        let mr = 0;
        if (principal) mr = principal * (g.roi / 100);   // monthly rate for MONTHLY payout
        return { participationAmount: principal, monthlyInterest: mr, entryCount: g.entries.length };
      });
    };
    const monthlyEquiv = (amount, payout, roi) => {
      if (!amount) return 0;
      if (payout === 'MONTHLY')  return amount * (roi / 100);
      if (payout === 'QUARTELY') return amount * (roi / 100) / 3;
      if (payout === 'HALFLY')   return amount * (roi / 100) / 6;
      if (payout === 'YEARLY')   return amount * (roi / 100) / 12;
      return 0;
    };

    const load = async () => {
      const [runRes, migRes, goldRes] = await Promise.allSettled([
        getRunningDeals(),
        getUserOfflineParticipationDealsInfo(),
        getGoldDealsEarnings(),
      ]);
      if (ignore) return;

      const participations = runRes.status === 'fulfilled' ? (runRes.value?.participationInfo ?? []) : [];
      const rawMigrated    = migRes.status === 'fulfilled' && Array.isArray(migRes.value) ? migRes.value : [];
      const mergedMigrated = mergeMigratedByRoi(rawMigrated);

      // Gold invested
      let goldDealsInvested = 0;
      if (goldRes.status === 'fulfilled' && goldRes.value) {
        const rows = Array.isArray(goldRes.value?.userEarenInfoResponse) ? goldRes.value.userEarenInfoResponse : [];
        const seen = new Map();
        rows.forEach(d => {
          const k = `${d?.dealId ?? ''}-${d?.participationType ?? ''}`;
          if (!k || k === '-') return;
          if (!seen.has(k)) seen.set(k, d);
        });
        const deduped = Array.from(seen.values());
        const ids = [...new Set(deduped.map(d => String(d?.dealId ?? '')).filter(Boolean))];
        const growthRes = await Promise.allSettled(ids.map(id => getGoldGrowthDetail(id)));
        if (ignore) return;
        const amtMap = {};
        growthRes.forEach((r, i) => {
          if (r.status !== 'fulfilled') return;
          const rrows = Array.isArray(r.value) ? r.value : (r.value ? [r.value] : []);
          amtMap[ids[i]] = rrows.reduce((s, row) => s + Number(row?.approvedAmount ?? row?.participatedAmount ?? row?.amount ?? 0), 0);
        });
        deduped.forEach(d => {
          const id = String(d?.dealId ?? '');
          const amt = amtMap[id] || Number(d?.participatedAmount ?? d?.amount ?? 0);
          goldDealsInvested += amt;
        });
      }

      // Running invested + monthly interest + per-month charts
      let runningInvested = 0, runningMonthly = 0, activeCnt = 0, closedCnt = 0;
      const monthlyInvestedArr = Array(12).fill(0);
      const monthlyInterestArr = Array(12).fill(0);

      const parseMonthFromDate = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return -1;
        const v = dateStr.trim();
        let parts;
        if (v.includes('/')) parts = v.split('/');
        else if (v.includes('-')) parts = v.split('-');
        else return -1;
        if (parts.length !== 3) return -1;
        // DD/MM/YYYY or DD-MM-YYYY
        if (parts[0].length <= 2) return parseInt(parts[1], 10) - 1;
        // YYYY-MM-DD
        return parseInt(parts[1], 10) - 1;
      };

      participations.forEach(p => {
        const updates = (p.updatedParticipation ?? []).reduce((s, u) => s + (u.updationParticipation ?? 0), 0);
        runningInvested += (p.participatedAmount ?? 0) + updates;
        const roi = p.rateOfInterest ?? 0;
        const entries = [
          { amount: p.participatedAmount ?? 0, payout: p.amountTye, date: p.participatedDate },
          ...(p.updatedParticipation ?? []).map(u => ({ amount: u.updationParticipation ?? 0, payout: u.amountTye ?? p.amountTye, date: u.updatedDate })),
        ];
        entries.forEach(e => {
          const mi = monthlyEquiv(e.amount, e.payout, roi);
          runningMonthly += mi;
          const m = parseMonthFromDate(e.date);
          if (m >= 0 && m < 12) {
            monthlyInvestedArr[m] += e.amount;
            for (let mm = m; mm < 12; mm++) monthlyInterestArr[mm] += mi;
          }
        });
        if (p.dealStatus === 'CLOSED' || p.dealStatus === 'ACHIEVED') closedCnt++;
        else activeCnt++;
      });

      const migratedInvested = mergedMigrated.reduce((s, d) => s + Number(d?.participationAmount ?? 0), 0);
      const migratedMonthly  = mergedMigrated.reduce((s, d) => s + Number(d?.monthlyInterest ?? 0), 0);
      // gold counts as active
      activeCnt += (goldRes.status === 'fulfilled'
        ? Array.from(new Set((goldRes.value?.userEarenInfoResponse ?? []).map(d => `${d?.dealId}-${d?.participationType}`))).length
        : 0);

      if (!ignore) {
        setStats({
          totalInvested:   runningInvested + migratedInvested + goldDealsInvested,
          monthlyInterest: runningMonthly  + migratedMonthly,
          running:  activeCnt,
          closed:   closedCnt,
          monthlyChart:  monthlyInterestArr,
          investedChart: monthlyInvestedArr,
          ready: true,
        });
      }
    };

    load().catch(() => {});
    return () => { ignore = true; };
  }, []);

  return stats;
}

// ─── Offline status bar (single row) ─────────────────────────────────────────
function OfflineStatusBar({ label, count, total, color, glow }) {
  const [barW, setBarW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setBarW(Math.round((count / (total || 1)) * 100)), 400);
    return () => clearTimeout(t);
  }, [count, total]);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 5px ${glow}` }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
        </div>
        <span className="text-xs font-bold" style={{ color }}>{count}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bar-track)' }}>
        <div className="h-full rounded-full"
          style={{ width: `${barW}%`, background: `linear-gradient(90deg,${color},${color}88)`, boxShadow: `0 0 6px ${glow}`, transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)' }} />
      </div>
    </div>
  );
}

// ─── Combined Analysis (mode C) ───────────────────────────────────────────────
function CombinedAnalysis({ fin, memberColor, liveOffline, olAmtOverride, olRunningOverride }) {
  const ol  = fin.oxyloans;
  // Prefer live offline stats when available
  const off = liveOffline?.ready ? {
    ...fin.offline,
    totalPaid:       formatINR(liveOffline.totalInvested),
    totalInvested:   formatINR(liveOffline.totalInvested),
    monthlyInterest: formatINR(liveOffline.monthlyInterest),
    running:         liveOffline.running,
    closed:          liveOffline.closed,
    payments:        fin.offline?.payments ?? [],
    monthlyChart:    fin.offline?.monthlyChart ?? Array(12).fill(0),
  } : fin.offline;

  const parseAmt = (str) => {
    if (!str) return 0;
    const n = parseFloat(str.replace(/[₹,]/g, ''));
    return str.includes('L') ? n * 100000 : str.includes('K') ? n * 1000 : n;
  };

  // Use real deal amounts when available (override the stale financials API value)
  const olTotal  = olAmtOverride != null ? olAmtOverride : parseAmt(ol.totalInvested);
  const offTotal = parseAmt(off.totalInvested);
  const combined = olTotal + offTotal;
  const fmtL = (n) => formatINR(n ?? 0);

  const olRunning = olRunningOverride != null ? olRunningOverride : ol.running;

  const olMonthly  = parseAmt(ol.monthlyInterest);
  const offMonthly = parseAmt(off.monthlyInterest ?? '₹0');
  const combinedMonthly = olMonthly + offMonthly;

  const olPct  = combined > 0 ? Math.round((olTotal  / combined) * 100) : 50;
  const offPct = 100 - olPct;

  const kpis = [
    { label: 'OxyLoans Invested',     value: fmtL(olTotal),                  color: '#2673bb',   Icon: I.Bank,     sub: `${olRunning} active deals`         },
    { label: 'Offline Invested',      value: off.totalInvested,              color: '#f58311',   Icon: I.Wallet,   sub: `${off.running ?? 0} active deals`  },
    { label: 'Total Invested',        value: fmtL(combined),                 color: memberColor, Icon: I.PieChart, sub: 'All platforms'                      },
    { label: 'OxyLoans Monthly Int.', value: ol.monthlyInterest,             color: '#35a13e',   Icon: I.Percent,  sub: 'OxyLoans this month'                },
    { label: 'Offline Monthly Int.',  value: off.monthlyInterest ?? '₹0',   color: '#6366f1',   Icon: I.Activity, sub: 'Offline this month'                 },
  ];

  const pieSegments = [
    { label: 'OxyLoans', value: olTotal,  color: '#2673bb' },
    { label: 'Offline',  value: offTotal, color: '#f58311' },
  ];

  return (
    <div className="rounded-2xl p-5 grid gap-6"
      style={{ background: 'var(--surface-card)', border: `1px solid ${memberColor}18`, boxShadow: `0 2px 16px rgba(0,0,0,0.06)` }}>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${memberColor}14`, border: `1px solid ${memberColor}25`, color: memberColor }}>
          <I.PieChart />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Combined Analysis</h3>
        <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full font-semibold"
          style={{ background: `${memberColor}12`, color: memberColor, border: `1px solid ${memberColor}22` }}> · All Platforms</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_160px_1fr]">
        <GlassPanel accent={memberColor}>
          <DualBarChart olData={ol.monthlyChart} offData={liveOffline?.ready ? liveOffline.monthlyChart : off.monthlyChart} memberColor={memberColor} />
        </GlassPanel>
        <GlassPanel accent={memberColor} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <MultiDonut segments={pieSegments} size={130} />
          <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: memberColor }}>Revenue Split</p>
        </GlassPanel>
        <GlassPanel accent={memberColor}>
          <DealStatusChart
            olDeals={ol.deals}
            offPayments={off.payments}
            liveOffline={liveOffline}
            memberColor={memberColor}
          />
        </GlassPanel>
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span style={{ color: '#2673bb' }}>OxyLoans · {olPct}%</span>
          <span style={{ color: '#f58311' }}>Offline · {offPct}%</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden flex" style={{ background: 'var(--bar-track)' }}>
          <div className="h-full transition-all duration-700"
            style={{ width: `${olPct}%`, background: 'linear-gradient(90deg,#2673bb,#5b9fd4)', boxShadow: '0 0 8px #2673bb55' }} />
          <div className="h-full transition-all duration-700"
            style={{ width: `${offPct}%`, background: 'linear-gradient(90deg,#f58311,#ffa040)', boxShadow: '0 0 8px #f5831155' }} />
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {[
            { label: 'OxyLoans', color: '#2673bb', value: fmtL(olTotal)     },
            { label: 'Offline',  color: '#f58311', value: off.totalInvested },
          ].map(p => (
            <div key={p.label} className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
              <span style={{ color: 'var(--text-muted)' }}>{p.label}</span>
              <span className="font-bold" style={{ color: p.color }}>{p.value}</span>
            </div>
          ))}
          <div className="ml-auto text-xs font-extrabold" style={{ color: memberColor }}>
            Total Invested: {fmtL(combined)}
          </div>
        </div>
      </div>

      {/* ── Offline Details removed — data now feeds into charts above ── */}
    </div>
  );
}

// ─── Deal status grouped bar chart ───────────────────────────────────────────
function DealStatusChart({ olDeals, offPayments, liveOffline, memberColor }) {
  const [anim, setAnim] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnim(true), 500); return () => clearTimeout(t); }, []);

  const olActive  = olDeals.filter(d => d.status === 'Active').length;
  const olPending = olDeals.filter(d => d.status === 'Pending').length;
  const olClosed  = olDeals.filter(d => d.status === 'Closed').length;

  // Use live offline stats when available, fall back to payments array
  const offActive   = liveOffline?.ready ? liveOffline.running : (offPayments ?? []).filter(p => p.status === 'Verified' || p.status === 'Active').length;
  const offPending  = liveOffline?.ready ? 0                   : (offPayments ?? []).filter(p => p.status === 'Pending').length;
  const offClosed   = liveOffline?.ready ? liveOffline.closed  : (offPayments ?? []).filter(p => p.status === 'Rejected' || p.status === 'Closed').length;

  const groups = [
    { label: 'Active / Verified', ol: olActive,  off: offActive,  color: '#35a13e' },
    { label: 'Pending',           ol: olPending, off: offPending, color: '#f58311' },
    { label: 'Closed / Rejected', ol: olClosed,  off: offClosed,  color: '#2673bb' },
  ];
  const maxVal = Math.max(...groups.flatMap(g => [g.ol, g.off])) || 1;

  return (
    <div>
      <p className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color: memberColor }}>Deal Status Breakdown</p>
      <div className="grid gap-4">
        {groups.map(g => (
          <div key={g.label}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: g.color, boxShadow: `0 0 5px ${g.color}88` }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{g.label}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span style={{ color: '#2673bb' }}>{g.ol}</span>
                <span style={{ color: 'var(--text-muted)' }}>/</span>
                <span style={{ color: '#f58311' }}>{g.off}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs w-14 text-right" style={{ color: '#2673bb', fontSize: 9 }}>OxyLoans</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bar-track)' }}>
                <div className="h-full rounded-full"
                  style={{ width: anim ? `${(g.ol / maxVal) * 100}%` : '0%', background: 'linear-gradient(90deg,#2673bb,#5b9fd4)', transition: 'width 1.1s cubic-bezier(0.34,1.56,0.64,1)' }} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-14 text-right" style={{ color: '#f58311', fontSize: 9 }}>Offline</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bar-track)' }}>
                <div className="h-full rounded-full"
                  style={{ width: anim ? `${(g.off / maxVal) * 100}%` : '0%', background: 'linear-gradient(90deg,#f58311,#ffa040)', transition: 'width 1.1s cubic-bezier(0.34,1.56,0.64,1) 0.1s' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Copy ID row ──────────────────────────────────────────────────────────────
function CopyId({ id }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-1.5 mt-0.5">
      <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>ID: {id}</span>
      <button
        onClick={handleCopy}
        title="Copy ID"
        className="flex items-center justify-center rounded transition-all hover:scale-110 active:scale-95"
        style={{ color: copied ? '#35a13e' : 'var(--text-muted)', padding: 2 }}
      >
        {copied ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
      {copied && <span className="text-xs" style={{ color: '#35a13e' }}>Copied!</span>}
    </div>
  );
}

// ─── Single member dashboard ──────────────────────────────────────────────────
function MigrateConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}>
      <div className="rounded-2xl overflow-hidden w-full max-w-sm"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}
        onClick={e => e.stopPropagation()}>

        {/* Icon + title */}
        <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(233,83,48,0.1)', border: '1px solid rgba(233,83,48,0.25)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#e95330" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <h3
              className="text-base font-extrabold"
              style={{ color: 'var(--text-primary)' }}
            >
              Confirm Migration
            </h3>

            <p
              className="text-sm mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Are you sure you want to migrate the data?
              <br />
              Once admin approved, you can see migrated data.
              <br />
              Only active deals will be migrated.
              <br />
              <span
                className="font-semibold"
                style={{ color: '#e95330' }}
              >
                This action cannot be undone.
              </span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            No, Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,#e95330,#c73d1f)', color: '#fff', boxShadow: '0 4px 14px rgba(233,83,48,0.35)' }}>
            Yes, Migrate
          </button>
        </div>
      </div>
    </div>
  );
}

function MigrateSuccessModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="rounded-2xl overflow-hidden w-full max-w-sm"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.35)' }}
        onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(53,161,62,0.1)', border: '1px solid rgba(53,161,62,0.25)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#35a13e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>Migration Request Submitted</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Your migration request was submitted successfully.
              <br />
              You can view migrated data once admin approval is completed.
            </p>
          </div>
        </div>
        <div className="px-6 pb-6">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#35a13e,#2c8a33)', color: '#fff', boxShadow: '0 4px 14px rgba(53,161,62,0.35)' }}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Animated OTP input boxes ─────────────────────────────────────────────────
// ─── OTP Boxes ────────────────────────────────────────────────────────────────
// React.memo = parent re-renders never touch this component.
// All digit state is in a ref. The only thing that causes a re-render inside
// is the `tick` dispatch, which we control precisely.
const OtpBoxes = React.memo(function OtpBoxes({ length = 6, onChange, disabled, resetKey }) {
  const digitsRef    = React.useRef(Array(length).fill(''));
  const onChangeRef  = React.useRef(onChange);          // always-fresh ref, never stale
  const inputRefs    = React.useRef(
    Array.from({ length }, () => React.createRef())
  );
  const [displayKey, setDisplayKey] = React.useState(0); // controls visual re-render
  const [focused, setFocused]       = React.useState(-1);

  // Keep onChangeRef current without triggering re-render
  React.useLayoutEffect(() => { onChangeRef.current = onChange; });

  // Focus box 0 on first mount
  React.useEffect(() => {
    const t = setTimeout(() => { inputRefs.current[0]?.current?.focus(); setFocused(0); }, 60);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line

  // Resend: resetKey increments → clear. Skip on initial mount via prev-value check.
  const prevResetKey = React.useRef(resetKey);
  React.useEffect(() => {
    if (prevResetKey.current === resetKey) return;   // first mount or same value
    prevResetKey.current = resetKey;
    digitsRef.current = Array(length).fill('');
    setDisplayKey(k => k + 1);
    setFocused(0);
    const t = setTimeout(() => inputRefs.current[0]?.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [resetKey, length]);

  const focusBox = React.useCallback((i) => {
    const idx = Math.max(0, Math.min(length - 1, i));
    inputRefs.current[idx]?.current?.focus();
    setFocused(idx);
  }, [length]);

  const handleKeyDown = React.useCallback((i, e) => {
    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      const d = digitsRef.current;
      if (d.every(v => v !== '')) return;           // all full → ignore
      const next = [...d];
      next[i] = e.key;
      digitsRef.current = next;
      setDisplayKey(k => k + 1);
      onChangeRef.current(next.join(''));
      if (i < length - 1) {
        focusBox(i + 1);
      } else {
        setFocused(-1);
        inputRefs.current[i]?.current?.blur();
      }
      return;
    }
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...digitsRef.current];
      if (next[i]) {
        next[i] = '';
        digitsRef.current = next;
        setDisplayKey(k => k + 1);
        onChangeRef.current(next.join(''));
      } else if (i > 0) {
        next[i - 1] = '';
        digitsRef.current = next;
        setDisplayKey(k => k + 1);
        onChangeRef.current(next.join(''));
        focusBox(i - 1);
      }
      return;
    }
    if (e.key === 'Delete') {
      e.preventDefault();
      const next = [...digitsRef.current];
      next[i] = '';
      digitsRef.current = next;
      setDisplayKey(k => k + 1);
      onChangeRef.current(next.join(''));
      return;
    }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); focusBox(i - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); focusBox(i + 1); }
  }, [length, focusBox]);

  const handlePaste = React.useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const next = Array(length).fill('');
    pasted.split('').forEach((ch, j) => { next[j] = ch; });
    digitsRef.current = next;
    setDisplayKey(k => k + 1);
    onChangeRef.current(next.join(''));
    if (pasted.length >= length) {
      setFocused(-1);
      inputRefs.current[length - 1]?.current?.blur();
    } else {
      focusBox(pasted.length);
    }
  }, [length, focusBox]);

  // Read snapshot for render — displayKey change triggers this
  const digits = digitsRef.current;

  return (
    <div className="flex items-center justify-center gap-3">
      {digits.map((digit, i) => {
        const filled = !!digit;
        const active = focused === i && !disabled;
        return (
          <div key={i} className="relative" style={{ width: 46, height: 54 }}>
            <div style={{
              position: 'absolute', inset: -2, borderRadius: 14, zIndex: 0,
              background: filled
                ? 'linear-gradient(135deg,#2673bb,#35a13e)'
                : active ? 'linear-gradient(135deg,#2673bb55,#2673bb22)' : 'transparent',
              transition: 'background 0.2s',
            }} />
            <input
              ref={inputRefs.current[i]}
              type="text"
              inputMode="numeric"
              readOnly
              value={digit}
              onKeyDown={e => handleKeyDown(i, e)}
              onPaste={handlePaste}
              onFocus={() => setFocused(i)}
              onBlur={() => setFocused(-1)}
              onClick={() => setFocused(i)}
              disabled={disabled}
              tabIndex={0}
              className="absolute inset-0 w-full h-full text-center text-xl font-black outline-none rounded-xl select-none"
              style={{
                zIndex: 1,
                background: filled ? 'rgba(38,115,187,0.1)' : 'var(--input-bg)',
                border: `2px solid ${filled ? '#2673bb' : active ? '#2673bb' : 'var(--border)'}`,
                color: 'var(--text-primary)',
                boxShadow: active ? '0 0 0 3px rgba(38,115,187,0.18),0 0 12px rgba(38,115,187,0.2)' : filled ? '0 0 6px rgba(38,115,187,0.12)' : 'none',
                transform: filled ? 'scale(1.05)' : 'scale(1)',
                transition: 'border-color 0.18s,box-shadow 0.18s,transform 0.18s,background 0.18s',
                cursor: disabled ? 'not-allowed' : 'text',
                caretColor: 'transparent',
              }}
            />
            {filled && (
              <div style={{
                position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)',
                width: 5, height: 5, borderRadius: '50%', zIndex: 2,
                background: 'linear-gradient(135deg,#2673bb,#35a13e)',
                animation: 'olOtpDot 0.22s cubic-bezier(0.34,1.56,0.64,1)',
              }} />
            )}
          </div>
        );
      })}
      <style>{`
        @keyframes olOtpDot {
          from { transform: translateX(-50%) scale(0); opacity: 0; }
          to   { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        @keyframes olStepIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes olTickPop {
          0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
          60%  { transform: scale(1.25) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes olShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .ol-step-in  { animation: olStepIn 0.38s cubic-bezier(0.34,1.2,0.64,1) both; }
        .ol-tick-pop { animation: olTickPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>
    </div>
  );
});

// ─── Resend timer ─────────────────────────────────────────────────────────────
// Isolated with React.memo so parent re-renders never reset the countdown.
const ResendTimer = React.memo(function ResendTimer({ seconds, onResend, disabled }) {
  const [left, setLeft] = React.useState(seconds);
  const onResendRef = React.useRef(onResend);
  React.useLayoutEffect(() => { onResendRef.current = onResend; });

  React.useEffect(() => {
    // Count down with setInterval — immune to re-renders
    setLeft(seconds);
    const id = setInterval(() => {
      setLeft(prev => {
        if (prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [seconds]); // only restarts when seconds prop actually changes (i.e. key change)

  if (left > 0) {
    return (
      <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
        Resend in <span style={{ color: '#2673bb', fontWeight: 700 }}>{left}s</span>
      </p>
    );
  }
  return (
    <button
      onClick={() => onResendRef.current?.()}
      disabled={disabled}
      className="text-xs font-bold mt-2 mx-auto block transition-all hover:opacity-80 disabled:opacity-40"
      style={{ color: '#2673bb' }}>
      Resend OTP
    </button>
  );
});

// ─── Step progress pill ───────────────────────────────────────────────────────
function StepPills({ step, steps }) {
  return (
    <div className="flex items-center gap-1 justify-center">
      {steps.map((s, i) => {
        const done    = i < step;
        const current = i === step;
        return (
          <React.Fragment key={i}>
            <div
              className="flex items-center justify-center rounded-full text-xs font-bold transition-all"
              style={{
                width: current ? 28 : 22, height: current ? 28 : 22,
                background: done ? '#35a13e' : current ? '#2673bb' : 'var(--input-bg)',
                color: done || current ? '#fff' : 'var(--text-muted)',
                border: `2px solid ${done ? '#35a13e' : current ? '#2673bb' : 'var(--border)'}`,
                boxShadow: current ? '0 0 10px rgba(38,115,187,0.4)' : 'none',
                transform: current ? 'scale(1.1)' : 'scale(1)',
                fontSize: 10,
              }}>
              {done
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}><polyline points="20 6 9 17 4 12"/></svg>
                : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, minWidth: 16, maxWidth: 32, borderRadius: 2, background: i < step ? '#35a13e' : 'var(--border)', transition: 'background 0.4s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Get OxyLoans Data Modal ──────────────────────────────────────────────────
const OL_STEPS = ['Lender ID', 'Mobile OTP', 'Email OTP', 'Preview', 'Consent'];

// Panel must be outside the modal — defining it inside causes full remount on every digit
function OlPanel({ children }) {
  return <div className="ol-step-in px-6 py-5 grid gap-5">{children}</div>;
}

function GetOxyloansDataModal({ onClose, onConfirm, mode: modalMode = 'view', migrationInfo = null }) {
  const isAddMember = modalMode === 'addMember';

  // Derive initial step from migrationInfo verification flags:
  // - both done          → step 3 (preview/load) — but we still need to fetch deals first, so start at 0 and auto-advance
  // - mobile done only   → start at step 2 (email OTP)
  // - email done only    → start at step 1 (mobile OTP)  — email-only scenario is unusual but handle it
  // - neither done       → start at step 0 for addMember, step 1 for self (lenderId pre-filled)
  const _mobileVerified = !isAddMember && !!migrationInfo?.mobileNumberVerified;
  const _emailVerified  = !isAddMember && !!migrationInfo?.emailVerified;
  const _haslenderId    = !isAddMember && !!(migrationInfo?.lenderId ?? migrationInfo?.lender_id);

  const deriveInitialStep = () => {
    if (isAddMember) return 0;
    if (!_haslenderId) return 0;
    if (_mobileVerified && _emailVerified) return 0; // both done — will auto-advance after fetch
    if (_mobileVerified && !_emailVerified) return 2; // skip mobile OTP, go to email
    if (!_mobileVerified && _emailVerified) return 1; // has email verified, still needs mobile
    return 1; // lenderId known, start at mobile OTP
  };

  const [step, setStep] = useState(deriveInitialStep);
  const [lenderId, setLenderId] = useState(() => {
    if (isAddMember) return '';
    const lid = migrationInfo?.lenderId ?? migrationInfo?.lender_id ?? '';
    return lid ? String(lid) : '';
  });
  const [lenderInfo, setLenderInfo] = useState(() => {
    // Pre-fill lenderInfo from migrationInfo so steps 1/2 can show name/mobile/email
    if (isAddMember || !migrationInfo) return null;
    return {
      lenderName:   migrationInfo.userName   ?? null,
      mobileNumber: migrationInfo.mobileNumber ?? null,
      email:        migrationInfo.email       ?? null,
      emailId:      migrationInfo.email       ?? null,
    };
  });
  const [personalInfo, setPersonalInfo] = useState(null);
  const [deals, setDeals]           = useState([]);
  const [mobileOtpDone, setMobileOtpDone] = useState(false);
  const [emailOtpDone, setEmailOtpDone]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [resendKey, setResendKey]   = useState(0);
  const [success, setSuccess]       = useState(false);
  const [toast, setToast]           = useState(null); // { title, msg1, msg2 }
  // Store OTP values via ref so reads at submit time don't need state
  const mobileOtpRef      = React.useRef('');
  const emailOtpRef       = React.useRef('');
  const encryptedDataRef  = React.useRef('');
  const mobileSessionRef  = React.useRef('');
  const emailSessionRef   = React.useRef('');
  const emailSaltRef      = React.useRef('');

  const onMobileOtpChange = React.useCallback((v) => {
    mobileOtpRef.current = v;
    setMobileOtpDone(v.length === 6);
    clearError();
  }, []); // eslint-disable-line

  const onEmailOtpChange = React.useCallback((v) => {
    emailOtpRef.current = v;
    setEmailOtpDone(v.length === 6);
    clearError();
  }, []); // eslint-disable-line

  const maskMobile = (m) => m ? `${m.slice(0, 2)}${'*'.repeat(m.length - 4)}${m.slice(-4)}` : '---';
  const maskEmail  = (e) => {
    if (!e) return '---';
    const [user, domain] = e.split('@');
    return `${user.slice(0, 2)}${'*'.repeat(Math.max(0, user.length - 2))}@${domain}`;
  };

  const clearError = () => setError('');

  // ── Step 0: get encrypt key → fetch contact info → send OTP ──────────────
  const rawLenderId = () => lenderId.trim().replace(/^LR/i, '');

  const handleCheckLender = async () => {
    if (!lenderId.trim()) { setError('Please enter your Lender ID'); return; }
    setLoading(true); clearError();
    try {
      const encKey = await getOxyloansEncryptKey();
      encryptedDataRef.current = encKey;
      const info = await getOxyloansLenderContactInfo(rawLenderId(), encKey);
      setLenderInfo(info);

      const mobile = info.mobileNumber ?? info.mobile ?? '';
      const email  = info.email ?? info.emailId ?? '';

      // Decide which OTP to send first based on what's already verified
      if (_mobileVerified && _emailVerified) {
        // Both already verified — fetch deals directly, skip OTPs
        setLoading(true);
        const [profile, dealsData] = await Promise.all([
          getOxyloansLenderContactInfo(rawLenderId(), encKey),
          getOxyloansLenderDeals(rawLenderId(), encKey),
        ]);
        setPersonalInfo(profile);
        setDeals(Array.isArray(dealsData?.lenderPaticipatedResponseDto)
          ? dealsData.lenderPaticipatedResponseDto
          : []);
        setStep(3);
      } else if (_mobileVerified && !_emailVerified) {
        // Mobile already verified — send email OTP
        const emailRes = await sendOxyloansUlpEmailOtp(email, rawLenderId());
        emailSessionRef.current = emailRes?.emailOtpSession ?? emailRes?.sessionId ?? '';
        emailSaltRef.current    = emailRes?.salt ?? '';
        setStep(2);
      } else {
        // Mobile not verified — send mobile OTP
        const otpRes = await sendOxyloansUlpMobileOtp({
          lenderId: rawLenderId(),
          lenderName: info.lenderName ?? info.name ?? '',
          mobileNumber: mobile,
        });
        mobileSessionRef.current = otpRes?.mobileOtpSession ?? otpRes?.sessionId ?? '';
        setStep(1);
      }
    } catch (e) {
      setError(e.message ?? 'Failed to fetch lender info');
    } finally {
      setLoading(false);
    }
  };

  // Auto-advance when modal opens with a known lenderId and prefilled lenderInfo
  // (i.e. migration info has lenderId but step starts at 1 or 2 — we need the encrypt key + send OTP)
  React.useEffect(() => {
    if (isAddMember || !_haslenderId || step === 0) return; // only for self-mode with known lenderId
    // lenderId is already set from migrationInfo; auto-send the correct OTP
    const autoSend = async () => {
      setLoading(true); clearError();
      try {
        const encKey = await getOxyloansEncryptKey();
        encryptedDataRef.current = encKey;
        // Always fetch from the contact info API — migrationInfo.email can be null
        // and the real email lives in the OxyLoans contact info endpoint
        const info = await getOxyloansLenderContactInfo(rawLenderId(), encKey);
        setLenderInfo(info);

        const email  = info.email ?? info.emailId ?? '';
        const mobile = info.mobileNumber ?? info.mobile ?? '';

        if (_mobileVerified && _emailVerified) {
          // Both verified — load deals and jump to preview
          const dealsData = await getOxyloansLenderDeals(rawLenderId(), encKey);
          setPersonalInfo(info);
          setDeals(Array.isArray(dealsData?.lenderPaticipatedResponseDto)
            ? dealsData.lenderPaticipatedResponseDto
            : []);
          setStep(3);
        } else if (step === 2) {
          // Mobile already verified — send email OTP
          if (!email) throw new Error('No email address found for this account. Please contact support.');
          const emailRes = await sendOxyloansUlpEmailOtp(email, rawLenderId());
          emailSessionRef.current = emailRes?.emailOtpSession ?? emailRes?.sessionId ?? '';
          emailSaltRef.current    = emailRes?.salt ?? '';
        } else if (step === 1) {
          // Send mobile OTP
          const otpRes = await sendOxyloansUlpMobileOtp({
            lenderId: rawLenderId(),
            lenderName: info.lenderName ?? info.name ?? '',
            mobileNumber: mobile,
          });
          mobileSessionRef.current = otpRes?.mobileOtpSession ?? otpRes?.sessionId ?? '';
        }
      } catch (e) {
        setError(e.message ?? 'Failed to initialise verification');
      } finally {
        setLoading(false);
      }
    };
    autoSend();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Step 1: verify mobile OTP → send email OTP (or skip if email already verified) ─
  const handleVerifyMobile = async () => {
    if (mobileOtpRef.current.replace(/\s/g, '').length < 6) { setError('Enter the 6-digit OTP sent to your mobile'); return; }
    setLoading(true); clearError();
    try {
      await verifyOxyloansUlpMobileOtp({
        mobileNumber: lenderInfo.mobileNumber ?? lenderInfo.mobile ?? '',
        mobileOtp: mobileOtpRef.current,
        otpSession: mobileSessionRef.current,
      });

      if (_emailVerified) {
        // Email already verified — skip email OTP, go straight to preview
        const dealsData = await getOxyloansLenderDeals(rawLenderId(), encryptedDataRef.current);
        setPersonalInfo(lenderInfo);
        setDeals(Array.isArray(dealsData?.lenderPaticipatedResponseDto)
          ? dealsData.lenderPaticipatedResponseDto
          : []);
        setStep(3);
      } else {
        // Get the real email from lenderInfo (populated by getOxyloansLenderContactInfo)
        const emailAddr = lenderInfo?.email ?? lenderInfo?.emailId ?? '';
        if (!emailAddr) {
          throw new Error('No email address found for this account. Please contact support to update your email.');
        }
        const emailRes = await sendOxyloansUlpEmailOtp(emailAddr, rawLenderId());
        emailSessionRef.current = emailRes?.emailOtpSession ?? emailRes?.sessionId ?? '';
        emailSaltRef.current    = emailRes?.salt ?? '';
        setStep(2);
      }
    } catch (e) {
      setError(e.message ?? 'Mobile OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify email OTP → load profile + deals ─────────────────────
  const handleVerifyEmail = async () => {
    if (emailOtpRef.current.replace(/\s/g, '').length < 6) { setError('Enter the 6-digit OTP sent to your email'); return; }
    setLoading(true); clearError();
    try {
      await verifyOxyloansUlpEmailOtp({
        emailOtp: emailOtpRef.current,
        emailOtpSession: emailSessionRef.current,
        salt: emailSaltRef.current,
        lenderId : rawLenderId()
      });
      const [profile, dealsData] = await Promise.all([
        getOxyloansLenderContactInfo(rawLenderId(), encryptedDataRef.current),
        getOxyloansLenderDeals(rawLenderId(), encryptedDataRef.current),
      ]);
      setPersonalInfo(profile);
      setDeals(Array.isArray(dealsData) ? dealsData : (dealsData?.deals ?? dealsData?.data ?? []));
      setStep(3);
    } catch (e) {
      setError(e.message ?? 'Email OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 4: consent confirmed — only save lenderId AFTER user consents ──
  const showToast = (title, msg1, msg2, onOk) => {
    setToast({ title, msg1, msg2, onOk });
  };

  const handleConsent = () => {
    localStorage.setItem('oxyloansLenderId', lenderId.trim());
    setSuccess(true);
    setStep(4);
    showToast(
      'Congratulations! 🎉',
      `${lenderId || 'LR1234'} data has been successfully added to ULP.`,
      'You can now review the Oxyloans portfolio in ULP',
      () => { onConfirm?.(deals); onClose();getMigrationOxyloansUserInfo() }
    );
  };

  const handleResendMobile = React.useCallback(async () => {
    setLoading(true); clearError();
    try {
      const otpRes = await sendOxyloansUlpMobileOtp({
        lenderId: rawLenderId(),
        lenderName: lenderInfo?.lenderName ?? '',
        mobileNumber: lenderInfo?.mobileNumber ?? '',
      });
      mobileSessionRef.current = otpRes?.mobileOtpSession ?? '';
      mobileOtpRef.current = ''; setMobileOtpDone(false); setResendKey(k => k + 1);
    } catch (e) { setError(e.message ?? 'Resend failed'); }
    finally { setLoading(false); }
  }, [lenderId, lenderInfo]); // eslint-disable-line

  const handleResendEmail = React.useCallback(async () => {
    setLoading(true); clearError();
    try {
      const emailAddr = lenderInfo?.email ?? lenderInfo?.emailId ?? '';
      if (!emailAddr) {
        throw new Error('No email address found for this account. Please contact support to update your email.');
      }
      const emailRes = await sendOxyloansUlpEmailOtp(emailAddr, rawLenderId());
      emailSessionRef.current = emailRes?.emailOtpSession ?? '';
      emailSaltRef.current    = emailRes?.salt ?? '';
      emailOtpRef.current = ''; setEmailOtpDone(false); setResendKey(k => k + 1);
    } catch (e) { setError(e.message ?? 'Resend failed'); }
    finally { setLoading(false); }
  }, [lenderInfo]); // eslint-disable-line

  const fmtINR = (n) => n != null ? formatINR(Number(n)) : '—';

  // ── header — vary text based on mode and verification state ─────────────
  const stepTitle = isAddMember
    ? ['Member Lender ID', 'Verify Mobile', 'Verify Email', 'Member Portfolio Preview', 'Member Added!']
    : ['Find Your Lender ID', 'Verify Mobile Number', 'Verify Email Address', 'Your OxyLoans Portfolio', 'All Set!'];
  const stepSub = [
    isAddMember ? "Enter the new member's OxyLoans Lender ID" : 'Enter your OxyLoans Lender ID to proceed',
    _emailVerified 
    ? `Verify mobile to continue — email is already verified · ${lenderInfo ? maskMobile(lenderInfo.mobileNumber ?? lenderInfo.mobile) : '—'}` : `OTP sent to the mobile number registered with your OxyLoans Aggregator account: ${lenderInfo ? maskMobile(lenderInfo.mobileNumber ?? lenderInfo.mobile) : '—'}`, 
    _mobileVerified 
    ? `✓ Mobile verified — now verify the email registered with your OxyLoans Aggregator account: ${lenderInfo ? maskEmail(lenderInfo.email ?? lenderInfo.emailId) : '—'}` : `OTP sent to the email registered with your OxyLoans Aggregator account: ${lenderInfo ? maskEmail(lenderInfo.email ?? lenderInfo.emailId) : '—'}`,
    isAddMember ? "Review the member's details before adding them" : 'Review your personal details and deals before sharing',
    isAddMember ? 'Family member has been verified and added' : 'Your OxyLoans data will be shown below',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div
        className="rounded-2xl overflow-hidden w-full flex flex-col"
        style={{
          maxWidth: step === 3 ? 680 : 460,
          maxHeight: '92vh',
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 32px 90px rgba(0,0,0,0.35)',
          transition: 'max-width 0.4s cubic-bezier(0.34,1.2,0.64,1)',
        }}
        onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)', background: isAddMember ? 'rgba(53,161,62,0.04)' : 'rgba(38,115,187,0.04)' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={isAddMember
                  ? { background: 'rgba(53,161,62,0.12)', border: '1px solid rgba(53,161,62,0.28)', color: '#35a13e', boxShadow: '0 0 16px rgba(53,161,62,0.2)' }
                  : { background: 'rgba(38,115,187,0.12)', border: '1px solid rgba(38,115,187,0.28)', color: '#2673bb', boxShadow: '0 0 16px rgba(38,115,187,0.2)' }}>
                {isAddMember ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <line x1="19" y1="8" x2="19" y2="14"/>
                    <line x1="16" y1="11" x2="22" y2="11"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M9 9h6M9 13h6M9 17h4"/>
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>{stepTitle[step]}</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{stepSub[step]}</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 flex-shrink-0"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <StepPills step={step} steps={OL_STEPS} />

          {/* ── Verification status strip (shown on steps 1–3) ── */}
          {step >= 1 && step <= 3 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              {/* Mobile pill */}
              <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={(_mobileVerified || step >= 2)
                  ? { background: 'rgba(53,161,62,0.1)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.28)' }
                  : { background: 'rgba(245,131,17,0.08)', color: '#f58311', border: '1px solid rgba(245,131,17,0.25)' }}>
                {(_mobileVerified || step >= 2)
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                Mobile {(_mobileVerified || step >= 2) ? 'Verified' : 'Pending'}
              </div>

              {/* Arrow */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>

              {/* Email pill */}
              <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={(_emailVerified || step >= 3)
                  ? { background: 'rgba(53,161,62,0.1)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.28)' }
                  : step === 2
                    ? { background: 'rgba(38,115,187,0.1)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.25)' }
                    : { background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {(_emailVerified || step >= 3)
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>
                  : step === 2
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/></svg>}
                Email {(_emailVerified || step >= 3) ? 'Verified' : step === 2 ? 'Pending' : 'Waiting'}
              </div>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1">

          {/* Error banner */}
          {error && (
            <div className="mx-6 mt-4 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
              style={{ background: 'rgba(233,83,48,0.08)', color: '#e95330', border: '1px solid rgba(233,83,48,0.22)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* ── STEP 0: Enter Lender ID ── */}
          {step === 0 && (
            <OlPanel>
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {isAddMember ? "Member's OxyLoans Lender ID" : 'OxyLoans Lender ID'}
                </label>
                <input
                  autoFocus
                  type="text"
                  value={lenderId}
                  onChange={e => { setLenderId(e.target.value); clearError(); }}
                  onKeyDown={e => e.key === 'Enter' && handleCheckLender()}
                  placeholder={isAddMember ? "e.g. LR-XXXXXX (member's ID)" : 'e.g. LR-XXXXXX'}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all font-mono"
                  style={{
                    background: 'var(--input-bg)',
                    border: `1px solid ${error ? '#e95330' : 'var(--border)'}`,
                    color: 'var(--text-primary)',
                    boxShadow: error ? '0 0 0 3px rgba(233,83,48,0.12)' : 'none',
                    letterSpacing: 1,
                  }}
                />
              </div>
              <div className="px-4 py-3 rounded-xl text-xs" style={{ background: isAddMember ? 'rgba(53,161,62,0.06)' : 'rgba(38,115,187,0.06)', border: `1px solid ${isAddMember ? 'rgba(53,161,62,0.15)' : 'rgba(38,115,187,0.15)'}`, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <strong style={{ color: isAddMember ? '#35a13e' : '#2673bb' }}>How it works:</strong>{' '}
                {isAddMember
                  ? "Enter the family member's Lender ID. We verify their identity via OTP before adding them to your family group."
                  : 'We verify your identity through mobile and email OTP before showing your OxyLoans portfolio data.'}
              </div>
              <button
                onClick={handleCheckLender}
                disabled={loading || !lenderId.trim()}
                className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                style={isAddMember
                  ? { background: 'linear-gradient(135deg,#35a13e,#22c55e)', color: '#fff', boxShadow: '0 4px 16px rgba(53,161,62,0.35)' }
                  : { background: 'linear-gradient(135deg,#2673bb,#1a5a9e)', color: '#fff', boxShadow: '0 4px 16px rgba(38,115,187,0.35)' }}>
                {loading ? <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} /> : null}
                {loading ? 'Checking…' : 'Continue'}
                {!loading && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>}
              </button>
            </OlPanel>
          )}

          {/* ── STEP 1: Mobile OTP ── */}
          {step === 1 && (
            <OlPanel>
              {/* Lender info card */}
              {lenderInfo && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(53,161,62,0.07)', border: '1px solid rgba(53,161,62,0.2)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                    style={{ background: 'rgba(53,161,62,0.15)', border: '1px solid rgba(53,161,62,0.25)', color: '#35a13e' }}>
                    {(lenderInfo.lenderName ?? lenderInfo.name ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{lenderInfo.lenderName ?? lenderInfo.name ?? 'Lender'}</p>
                    <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{maskMobile(lenderInfo.mobileNumber ?? lenderInfo.mobile)}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(53,161,62,0.1)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.2)', fontWeight: 700 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
                    Found · Step 1 of 2
                  </div>
                </div>
              )}

              {/* "What's next" hint */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                style={{ background: 'rgba(38,115,187,0.06)', border: '1px solid rgba(38,115,187,0.15)', color: 'var(--text-muted)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#2673bb' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                After mobile verification, you'll verify your <strong style={{ color: '#2673bb' }}>email address</strong> to complete identity confirmation.
              </div>

              <div>
                <p className="text-sm font-semibold text-center mb-4" style={{ color: 'var(--text-primary)' }}>Enter 6-digit Mobile OTP</p>
                <OtpBoxes length={6} resetKey={resendKey} onChange={onMobileOtpChange} disabled={loading} />
                <ResendTimer key={resendKey} seconds={30} onResend={handleResendMobile} disabled={loading} />
              </div>
              <button
                onClick={handleVerifyMobile}
                disabled={loading || !mobileOtpDone}
                className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                style={{ background: 'linear-gradient(135deg,#2673bb,#1a5a9e)', color: '#fff', boxShadow: '0 4px 16px rgba(38,115,187,0.35)' }}>
                {loading ? <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} /> : null}
                {loading ? 'Verifying…' : 'Verify Mobile OTP'}
                {!loading && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>}
              </button>
            </OlPanel>
          )}

          {/* ── STEP 2: Email OTP ── */}
          {step === 2 && (
            <OlPanel>
              {/* ── Mobile verified success banner ── */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(53,161,62,0.08)', border: '1px solid rgba(53,161,62,0.3)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(53,161,62,0.15)', border: '1px solid rgba(53,161,62,0.3)', color: '#35a13e' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: '#35a13e' }}>Mobile Number Verified</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {lenderInfo ? maskMobile(lenderInfo.mobileNumber ?? lenderInfo.mobile) : '—'} · Now verify your email to continue
                  </p>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0" style={{ color: '#2673bb' }}>
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>

              {/* ── Email OTP target ── */}
              {lenderInfo && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(38,115,187,0.07)', border: '1px solid rgba(38,115,187,0.2)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(38,115,187,0.15)', border: '1px solid rgba(38,115,187,0.25)', color: '#2673bb' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>OTP sent to</p>
                    {loading
                      ? <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Fetching email…</p>
                      : (lenderInfo?.email ?? lenderInfo?.emailId)
                        ? <p className="text-sm font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{maskEmail(lenderInfo.email ?? lenderInfo.emailId)}</p>
                        : <p className="text-sm font-bold" style={{ color: '#e95330' }}>No email on file — contact support</p>
                    }
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(38,115,187,0.1)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.2)', fontWeight: 700 }}>
                    Step 2 of 2
                  </div>
                </div>
              )}

              {/* Show OTP input only when a valid email is available */}
              {!loading && !(lenderInfo?.email ?? lenderInfo?.emailId) ? (
                <div className="px-4 py-4 rounded-xl text-center"
                  style={{ background: 'rgba(233,83,48,0.07)', border: '1px solid rgba(233,83,48,0.2)' }}>
                  <p className="text-sm font-semibold" style={{ color: '#e95330' }}>
                    No email address found for this account
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Please contact OxyLoans support to add or update your registered email address.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-center mb-4" style={{ color: 'var(--text-primary)' }}>Enter 6-digit Email OTP</p>
                  <OtpBoxes length={6} resetKey={resendKey} onChange={onEmailOtpChange} disabled={loading} />
                  <ResendTimer key={resendKey} seconds={30} onResend={handleResendEmail} disabled={loading} />
                </div>
              )}
              <button
                onClick={handleVerifyEmail}
                disabled={loading || !emailOtpDone || !(lenderInfo?.email ?? lenderInfo?.emailId)}
                className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                style={{ background: 'linear-gradient(135deg,#2673bb,#1a5a9e)', color: '#fff', boxShadow: '0 4px 16px rgba(38,115,187,0.35)' }}>
                {loading ? <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} /> : null}
                {loading ? 'Loading…' : 'Verify Email OTP'}
                {!loading && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>}
              </button>
            </OlPanel>
          )}

          {/* ── STEP 3: Preview personal details + deals ── */}
          {step === 3 && (
            <div className="ol-step-in px-6 py-5 grid gap-5">
              {/* Personal Details */}
              {personalInfo && (
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(38,115,187,0.2)' }}>
                  <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(38,115,187,0.08)', borderBottom: '1px solid rgba(38,115,187,0.15)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: '#2673bb' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2673bb' }}>Personal Details</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {[
                      { label: 'Full Name',    value: personalInfo.lenderName ?? personalInfo.name    },
                      { label: 'Date of Birth',value: personalInfo.dateOfBirth ?? personalInfo.dob    },
                      { label: 'Mobile',       value: maskMobile(personalInfo.mobileNumber ?? personalInfo.mobile) },
                      { label: 'Email',        value: maskEmail(personalInfo.email ?? personalInfo.emailId)        },
                      { label: 'Address',      value: personalInfo.address ?? personalInfo.permanentAddress, full: true },
                    ].filter(f => f.value).map(f => (
                      <div key={f.label} className={f.full ? 'col-span-2' : ''}>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>{f.value}</p>
                      </div>
                    ))}
                  </div>
                  {/* Bank Details */}
                  {(personalInfo.bankName || personalInfo.accountNumber || personalInfo.ifsc) && (
                    <>
                      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'rgba(53,161,62,0.06)', borderTop: '1px solid rgba(53,161,62,0.15)', borderBottom: '1px solid rgba(53,161,62,0.15)' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: '#35a13e' }}><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#35a13e' }}>Bank Details</span>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-3">
                        {[
                          { label: 'Bank Name',   value: personalInfo.bankName },
                          { label: 'Account No.', value: personalInfo.accountNumber ?? personalInfo.accNo },
                          { label: 'IFSC',        value: personalInfo.ifsc ?? personalInfo.ifscCode },
                          { label: 'Branch',      value: personalInfo.branch },
                        ].filter(f => f.value).map(f => (
                          <div key={f.label}>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                            <p className="text-sm font-semibold font-mono mt-0.5" style={{ color: 'var(--text-primary)' }}>{f.value}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Deals Table */}
              {deals.length > 0 && (
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(245,131,17,0.2)' }}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(245,131,17,0.08)', borderBottom: '1px solid rgba(245,131,17,0.15)' }}>
                    <div className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: '#f58311' }}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#f58311' }}>OxyLoans Deals</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: 'rgba(245,131,17,0.12)', color: '#f58311', border: '1px solid rgba(245,131,17,0.25)' }}>
                      {deals.length} deal{deals.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--table-header-bg)' }}>
                          {['Deal Name', 'Amount', 'ROI', 'Status', 'Date'].map(h => (
                            <th key={h} className="text-left py-2.5 px-3 uppercase tracking-wider font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {deals.map((d, i) => {
                          const status = d.dealStatus ?? d.status ?? 'Active';
                          const statusColor = status === 'ACTIVE' || status === 'Active' ? '#35a13e' : status === 'CLOSED' || status === 'Closed' ? '#2673bb' : '#f58311';
                          return (
                            <tr key={i} style={{ borderBottom: '1px solid var(--table-row-border)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              <td className="py-2.5 px-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{d.dealName ?? d.loanId ?? `Deal ${i + 1}`}</td>
                              <td className="py-2.5 px-3 font-bold tabular-nums" style={{ color: '#2673bb' }}>{fmtINR(d.participationAmount ?? d.loanAmount ?? d.amount)}</td>
                              <td className="py-2.5 px-3">
                                <span className="font-black" style={{ color: '#f58311' }}>{d.roi ?? d.rateOfInterest ?? d.interestRate ?? '—'}%</span>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded-full font-bold" style={{ background: `${statusColor}12`, color: statusColor, border: `1px solid ${statusColor}25` }}>
                                  {status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3" style={{ color: 'var(--text-muted)' }}>{d.participationDate ?? d.loanDate ?? d.createdDate ?? '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Consent */}
              <div className="rounded-2xl p-4" style={{ background: 'rgba(245,131,17,0.05)', border: '1px solid rgba(245,131,17,0.18)' }}>
                <div className="flex items-start gap-2.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#f58311' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    By clicking <strong style={{ color: 'var(--text-primary)' }}>Confirm &amp; Show Deals</strong>, you consent to display your OxyLoans lending data in this dashboard. Your data is fetched securely and is not stored by us.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  Cancel
                </button>
                <button onClick={handleConsent}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg,#35a13e,#22c55e)', color: '#fff', boxShadow: '0 4px 16px rgba(53,161,62,0.35)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
                  Confirm &amp; Show Deals
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Success ── */}
          {step === 4 && (() => {
            // Merge lenderInfo + personalInfo so we always surface the richest data
            const pi = personalInfo ?? lenderInfo ?? {};
            const name      = pi.lenderName    ?? pi.name        ?? lenderInfo?.lenderName ?? lenderInfo?.name;
            const dob       = pi.dateOfBirth   ?? pi.dob;
            const mobile    = pi.mobileNumber  ?? pi.mobile      ?? lenderInfo?.mobileNumber ?? lenderInfo?.mobile;
            const email     = pi.email         ?? pi.emailId     ?? lenderInfo?.email ?? lenderInfo?.emailId;
            const address   = pi.address       ?? pi.permanentAddress;
            const nominee   = pi.nomineeName   ?? pi.nominee     ?? pi.nomineeDetails;
            const nomRel    = pi.nomineeRelation ?? pi.nomineeRelationship;
            const nomMobile = pi.nomineeMobile ?? pi.nomineeContact;
            const bankName  = pi.bankName;
            const accNo     = pi.accountNumber ?? pi.accNo;
            const ifsc      = pi.ifsc          ?? pi.ifscCode;
            const branch    = pi.branch;
            const hasProfile = name || dob || address || mobile || email;
            const hasNominee = nominee;
            const hasBank    = bankName || accNo || ifsc || branch;

            return (
              <div className="ol-step-in px-6 py-6 flex flex-col gap-5">
                {/* ── Success badge + title ── */}
                <div className="flex flex-col items-center gap-3 text-center pt-2">
                  <div className="ol-tick-pop w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,rgba(53,161,62,0.2),rgba(53,161,62,0.08))', border: '2px solid rgba(53,161,62,0.4)', boxShadow: '0 0 30px rgba(53,161,62,0.25)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#35a13e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                      {isAddMember ? 'Member Verified!' : 'Identity Verified!'}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                      {isAddMember
                        ? 'The family member has been verified and added to your group.'
                        : 'Your OxyLoans portfolio data has been loaded successfully.'}
                    </p>
                  </div>
                </div>

                {/* ── Quick stats bar ── */}
                <div className="flex items-center justify-center gap-4 px-5 py-3 rounded-2xl" style={{ background: 'rgba(53,161,62,0.07)', border: '1px solid rgba(53,161,62,0.2)' }}>
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#35a13e' }}>
                      {isAddMember ? 'Member LR ID' : 'Deals Loaded'}
                    </p>
                    <p className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                      {isAddMember ? (lenderId || '—') : deals.length}
                    </p>
                  </div>
                  <div className="w-px h-8" style={{ background: 'rgba(53,161,62,0.2)' }} />
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#2673bb' }}>
                      {isAddMember ? 'Name' : 'Total Invested'}
                    </p>
                    <p className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                      {isAddMember
                        ? (lenderInfo?.lenderName ?? lenderInfo?.name ?? '—')
                        : fmtINR(deals.reduce((s, d) => s + Number(d.participationAmount ?? d.loanAmount ?? d.amount ?? 0), 0))}
                    </p>
                  </div>
                </div>

                {/* ── Personal details card ── */}
                {hasProfile && (
                  <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(38,115,187,0.2)' }}>
                    <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'rgba(38,115,187,0.08)', borderBottom: '1px solid rgba(38,115,187,0.15)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: '#2673bb' }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2673bb' }}>Personal Details</span>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3">
                      {[
                        { label: 'Full Name',    value: name },
                        { label: 'Date of Birth',value: dob  },
                        { label: 'Mobile',       value: mobile  ? maskMobile(mobile)  : null },
                        { label: 'Email',        value: email   ? maskEmail(email)    : null },
                        { label: 'Address',      value: address, full: true },
                      ].filter(f => f.value).map(f => (
                        <div key={f.label} className={f.full ? 'col-span-2' : ''}>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                          <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>{f.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Nominee details card ── */}
                {hasNominee && (
                  <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(147,51,234,0.2)' }}>
                    <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'rgba(147,51,234,0.07)', borderBottom: '1px solid rgba(147,51,234,0.15)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: '#9333ea' }}>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9333ea' }}>Nominee Details</span>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3">
                      {[
                        { label: 'Nominee Name',     value: nominee    },
                        { label: 'Relationship',     value: nomRel     },
                        { label: 'Nominee Mobile',   value: nomMobile  },
                      ].filter(f => f.value).map(f => (
                        <div key={f.label}>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                          <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{f.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Bank details card ── */}
                {hasBank && (
                  <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(53,161,62,0.2)' }}>
                    <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'rgba(53,161,62,0.07)', borderBottom: '1px solid rgba(53,161,62,0.15)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: '#35a13e' }}>
                        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/>
                      </svg>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#35a13e' }}>Bank Details</span>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3">
                      {[
                        { label: 'Bank Name',   value: bankName },
                        { label: 'Account No.', value: accNo    },
                        { label: 'IFSC',        value: ifsc     },
                        { label: 'Branch',      value: branch   },
                      ].filter(f => f.value).map(f => (
                        <div key={f.label}>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                          <p className="text-sm font-semibold font-mono mt-0.5" style={{ color: 'var(--text-primary)' }}>{f.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Close button ── */}
                <button onClick={onClose}
                  className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg,#2673bb,#1a5a9e)', color: '#fff', boxShadow: '0 4px 16px rgba(38,115,187,0.35)' }}>
                  {isAddMember ? 'Done' : 'Close'}
                </button>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Success modal ── */}
      {toast && (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}>
          <div
            className="flex flex-col items-center gap-4 rounded-3xl px-8 py-8 text-center"
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border)',
              boxShadow: '0 32px 90px rgba(0,0,0,0.35)',
              maxWidth: 380,
              width: '100%',
              animation: 'olStepIn 0.38s cubic-bezier(0.34,1.2,0.64,1) both',
            }}>
            {/* Green circle tick */}
            <div className="ol-tick-pop w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,rgba(53,161,62,0.18),rgba(53,161,62,0.08))', border: '2px solid rgba(53,161,62,0.45)', boxShadow: '0 0 28px rgba(53,161,62,0.25)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#35a13e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            {/* Title */}
            <h3 className="text-xl font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {toast.title}
            </h3>
            {/* Messages */}
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-secondary, var(--text-muted))' }}>
                {toast.msg1}
              </p>
              <p className="text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>
                {toast.msg2}
              </p>
            </div>
            {/* OK button */}
            <button
              onClick={() => { setToast(null); toast.onOk?.(); }}
              className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02] mt-1"
              style={{ background: 'linear-gradient(135deg,#35a13e,#22c55e)', color: '#fff', boxShadow: '0 4px 16px rgba(53,161,62,0.35)' }}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Family Member Modal (OxyLoans only) ─────────────────────────────────────
// Shown after "Get OxyLoans Data" completes when the user has 2+ family members.
// Lets the user select a Head of Family who becomes the primary support contact.
function FamilyMemberModal({ members, currentHeadId, onSetHead, onRemove, onClose }) {
  const [selectedId, setSelectedId]   = useState(currentHeadId ?? '');
  const [saving, setSaving]           = useState(false);
  const [removing, setRemoving]       = useState(null); // memberId being removed
  const [toast, setToast]             = useState(null); // { msg, type }
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSetHead = async () => {
    if (!selectedId) { showToast('Please select a member first', 'error'); return; }
    if (selectedId === currentHeadId) { onClose(); return; }
    setSaving(true);
    const result = await onSetHead(selectedId);
    setSaving(false);
    if (result?.success) {
      showToast('Head of Family updated successfully');
      setTimeout(onClose, 1200);
    } else {
      showToast(result?.error ?? 'Failed to update Head of Family', 'error');
    }
  };

  const handleRemoveConfirm = async () => {
    if (!confirmRemoveId) return;
    setRemoving(confirmRemoveId);
    setConfirmRemoveId(null);
    const result = await onRemove(confirmRemoveId);
    setRemoving(null);
    if (result?.success) {
      showToast('Member removed successfully');
    } else {
      showToast(result?.error ?? 'Failed to remove member', 'error');
    }
  };

  const visibleMembers = members.filter(m => m.id !== (removing));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div
        className="rounded-2xl overflow-hidden w-full flex flex-col"
        style={{
          maxWidth: 520,
          maxHeight: '92vh',
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 32px 90px rgba(0,0,0,0.35)',
        }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex-shrink-0 flex items-start justify-between"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(245,131,17,0.04)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,131,17,0.12)', border: '1px solid rgba(245,131,17,0.3)', color: '#f58311', boxShadow: '0 0 16px rgba(245,131,17,0.2)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <h2 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>Family Members</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Select the Head of Family for OxyLoans support contact
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 flex-shrink-0"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className="mx-5 mt-4 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 flex-shrink-0"
            style={{
              background: toast.type === 'error' ? 'rgba(233,83,48,0.08)' : 'rgba(53,161,62,0.08)',
              color: toast.type === 'error' ? '#e95330' : '#35a13e',
              border: `1px solid ${toast.type === 'error' ? 'rgba(233,83,48,0.22)' : 'rgba(53,161,62,0.22)'}`,
            }}>
            {toast.type === 'error'
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            }
            {toast.msg}
          </div>
        )}

        {/* Info banner */}
        <div className="mx-5 mt-4 px-4 py-3 rounded-xl text-xs flex-shrink-0"
          style={{ background: 'rgba(38,115,187,0.06)', border: '1px solid rgba(38,115,187,0.15)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <strong style={{ color: '#2673bb' }}>Head of Family</strong> is the primary contact for all OxyLoans support
          queries raised by any family member. They can also manage (remove) members from this group.
        </div>

        {/* Scrollable member list */}
        <div className="overflow-y-auto flex-1 px-5 py-4 grid gap-3">
          {visibleMembers.length === 0 && (
            <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
              <p className="text-sm font-medium">No family members linked via OxyLoans</p>
            </div>
          )}
          {visibleMembers.map(m => {
            const isHead     = m.id === currentHeadId || m.isHeadOfFamily;
            const isSelected = selectedId === m.id;
            const isRemoving = removing === m.id;
            return (
              <div
                key={m.id}
                className="relative rounded-2xl p-4 transition-all cursor-pointer"
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg,rgba(245,131,17,0.1),rgba(245,131,17,0.04))'
                    : 'var(--card-bg)',
                  border: isSelected
                    ? '1.5px solid rgba(245,131,17,0.5)'
                    : '1px solid var(--border)',
                  boxShadow: isSelected ? '0 0 0 3px rgba(245,131,17,0.12)' : 'none',
                  opacity: isRemoving ? 0.5 : 1,
                }}
                onClick={() => !isRemoving && setSelectedId(m.id)}>

                {/* Head of Family crown badge */}
                {isHead && (
                  <span className="absolute top-3 right-3 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1"
                    style={{ background: 'rgba(245,131,17,0.15)', color: '#f58311', border: '1px solid rgba(245,131,17,0.3)' }}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M2 20h20v2H2zM4 18l4-10 4 4 4-8 4 10H4z"/></svg>
                    Head of Family
                  </span>
                )}

                <div className="flex items-center gap-3">
                  {/* Radio indicator */}
                  <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{
                      border: `2px solid ${isSelected ? '#f58311' : 'var(--border)'}`,
                      background: isSelected ? '#f58311' : 'transparent',
                    }}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ background: 'rgba(245,131,17,0.12)', color: '#f58311', border: '1px solid rgba(245,131,17,0.25)' }}>
                    {(m.name ?? '?').charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{m.name ?? '—'}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {m.lrId && (
                        <span className="font-mono text-xs font-semibold" style={{ color: '#f58311' }}>{m.lrId}</span>
                      )}
                      {m.relation && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(38,115,187,0.08)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.18)' }}>
                          {m.relation}
                        </span>
                      )}
                      {m.phone && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.phone}</span>
                      )}
                    </div>
                  </div>

                  {/* Remove button */}
                  {!isHead && (
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmRemoveId(m.id); }}
                      disabled={!!removing}
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 disabled:opacity-40"
                      style={{ background: 'rgba(233,83,48,0.08)', color: '#e95330', border: '1px solid rgba(233,83,48,0.2)' }}
                      title="Remove member">
                      {isRemoving
                        ? <span className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#e95330', borderTopColor: 'transparent' }} />
                        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      }
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirm remove dialog */}
        {confirmRemoveId && (
          <div className="mx-5 mb-2 px-4 py-3 rounded-xl flex items-center justify-between gap-3 flex-shrink-0"
            style={{ background: 'rgba(233,83,48,0.06)', border: '1px solid rgba(233,83,48,0.2)' }}>
            <p className="text-xs font-semibold flex-1" style={{ color: '#e95330' }}>
              Remove <strong>{visibleMembers.find(m => m.id === confirmRemoveId)?.name ?? 'this member'}</strong> from the family group?
            </p>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setConfirmRemoveId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
              <button onClick={handleRemoveConfirm}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
                style={{ background: '#e95330' }}>
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="px-5 pb-5 pt-3 flex items-center gap-3 flex-shrink-0"
          style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80 flex-shrink-0"
            style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Cancel
          </button>
          <button
            onClick={handleSetHead}
            disabled={saving || !selectedId}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
            style={{ background: 'linear-gradient(135deg,#f58311,#d96b00)', color: '#fff', boxShadow: '0 4px 16px rgba(245,131,17,0.35)' }}>
            {saving && <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />}
            {saving ? 'Saving…' : 'Set as Head of Family'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── OxyLoans Deals Section (shown after confirmed OR after auto-load from migration info) ───
// ── Helper: extract the correct amount from a lenderPaticipatedResponseDto item ──
function olDealAmt(d) {
  // API spells it "paticipatedAmount" (typo). Fall back to other common fields.
  return Number(d?.paticipatedAmount ?? d?.participatedAmount ?? d?.participationAmount ?? d?.loanAmount ?? d?.amount ?? d?.currentValue ?? 0);
}
// ── Helper: extract status from API deal ──
function olDealStatus(d) {
  return (d?.currentStatus ?? d?.participationStatus ?? d?.dealStatus ?? d?.status ?? '').toString();
}
// ── Helper: ROI ──
function olDealRoi(d) {
  return d?.rateOfInterest ?? d?.roi ?? d?.interestRate ?? null;
}
// ── Helper: return type label ──
function olReturnTypeLabel(t) {
  if (!t) return null;
  const m = { MONTHLY: 'Monthly', YEARLY: 'Yearly', QUARTERLY: 'Quarterly', HALFYEARLY: 'Half-Yearly', ENDOFTHEDEAL: 'End of Deal' };
  return m[(t ?? '').toUpperCase()] ?? t;
}

// ── Mini SVG bar chart for ROI distribution ──────────────────────────────────
function OLRoiBarChart({ deals, accent }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t); }, []);

  // Group by ROI bucket
  const buckets = {};
  deals.forEach(d => {
    const roi = Number(olDealRoi(d) ?? 0);
    const bucket = roi.toFixed(2) + '%';
    if (!buckets[bucket]) buckets[bucket] = { roi, count: 0, amount: 0 };
    buckets[bucket].count++;
    buckets[bucket].amount += olDealAmt(d);
  });
  const entries = Object.entries(buckets).sort((a, b) => a[1].roi - b[1].roi);
  if (!entries.length) return null;
  const maxAmt = Math.max(...entries.map(([, v]) => v.amount));

  return (
    <div className="rounded-2xl p-4"
      style={{ background: 'var(--surface-card)', border: `1px solid ${accent}20` }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>ROI Distribution</p>
      <div className="flex items-end gap-2" style={{ height: 72 }}>
        {entries.map(([label, v]) => {
          const pct = maxAmt > 0 ? (v.amount / maxAmt) * 100 : 0;
          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full flex flex-col justify-end" style={{ height: 60 }}>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity
                  text-xs px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none z-10"
                  style={{ background: `${accent}ee`, color: '#fff', fontSize: 9 }}>
                  {v.count} deal{v.count !== 1 ? 's' : ''} · {formatINR(v.amount)}
                </div>
                <div className="w-full rounded-t transition-all duration-700"
                  style={{
                    height: animated ? `${pct}%` : '0%',
                    background: `linear-gradient(180deg,${accent}99,${accent})`,
                    boxShadow: `0 0 8px ${accent}44`,
                    minHeight: animated ? 4 : 0,
                  }} />
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 8 }}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Mini donut: status breakdown ─────────────────────────────────────────────
function OLStatusDonut({ deals, accent }) {
  const STATUS_COLORS = { RUNNING: '#35a13e', CLOSED: '#2673bb', PENDING: '#f58311', ACHIEVED: '#818cf8' };
  const counts = {};
  deals.forEach(d => {
    const s = olDealStatus(d).toUpperCase() || 'UNKNOWN';
    counts[s] = (counts[s] ?? 0) + 1;
  });
  const total = deals.length;
  const entries = Object.entries(counts);
  if (!entries.length) return null;

  // SVG donut — r=28 cx=36 cy=36
  const r = 28, cx = 36, cy = 36;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segments = entries.map(([status, count]) => {
    const frac = count / total;
    const len  = frac * circ;
    const seg  = { status, count, frac, len, offset };
    offset += len;
    return seg;
  });

  return (
    <div className="rounded-2xl p-4"
      style={{ background: 'var(--surface-card)', border: `1px solid ${accent}20` }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>Status Breakdown</p>
      <div className="flex items-center gap-4">
        <svg width={72} height={72} viewBox="0 0 72 72" style={{ flexShrink: 0 }}>
          {segments.map(seg => {
            const color = STATUS_COLORS[seg.status] ?? '#999';
            return (
              <circle key={seg.status}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={color}
                strokeWidth={10}
                strokeDasharray={`${seg.len} ${circ - seg.len}`}
                strokeDashoffset={-seg.offset}
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
              />
            );
          })}
          <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
            style={{ fontSize: 11, fontWeight: 800, fill: 'var(--text-primary)' }}>
            {total}
          </text>
          <text x={cx} y={cy + 13} textAnchor="middle" dominantBaseline="middle"
            style={{ fontSize: 7, fill: 'var(--text-muted)' }}>
            deals
          </text>
        </svg>
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          {segments.map(seg => {
            const color = STATUS_COLORS[seg.status] ?? '#999';
            return (
              <div key={seg.status} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-muted)' }}>{seg.status.charAt(0) + seg.status.slice(1).toLowerCase()}</span>
                <span className="text-xs font-bold" style={{ color }}>{seg.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Mini bar: return type mix ─────────────────────────────────────────────────
function OLReturnTypeChart({ deals, accent }) {
  const counts = {};
  deals.forEach(d => {
    const rt = olReturnTypeLabel(d.lederReturnType ?? d.ledgerReturnType ?? d.returnType) ?? 'Unknown';
    counts[rt] = (counts[rt] ?? 0) + 1;
  });
  const entries = Object.entries(counts);
  if (!entries.length) return null;
  const max = Math.max(...entries.map(([, v]) => v));
  const COLORS = ['#2673bb', '#f58311', '#35a13e', '#818cf8', '#06b6d4', '#e95330'];

  return (
    <div className="rounded-2xl p-4"
      style={{ background: 'var(--surface-card)', border: `1px solid ${accent}20` }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>Return Type Mix</p>
      <div className="flex flex-col gap-2">
        {entries.map(([label, count], i) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs w-20 flex-shrink-0 truncate" style={{ color: 'var(--text-muted)' }}>{label}</span>
            <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'var(--input-bg)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(count / max) * 100}%`, background: `linear-gradient(90deg,${COLORS[i % COLORS.length]}99,${COLORS[i % COLORS.length]})` }} />
            </div>
            <span className="text-xs font-bold w-5 text-right flex-shrink-0" style={{ color: COLORS[i % COLORS.length] }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OxyLoansDealsSection({ deals, memberColor, meta }) {
  const [tab, setTab] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const accent = '#f58311';
  const fmtINR = (n) => formatINR(Number(n ?? 0));

  // ── Correct field extraction using actual API field names ──────────────────
  const getDealAmt    = olDealAmt;
  const getDealStatus = olDealStatus;
  const getDealRoi    = olDealRoi;

  // ── Derive status group for filter tabs ───────────────────────────────────
  const getStatusGroup = (d) => {
    const s = getDealStatus(d).toUpperCase();
    if (s === 'RUNNING') return 'running';
    if (s === 'CLOSED' || s === 'CLOSING') return 'closed';
    return 'other';
  };

  const running = deals.filter(d => getStatusGroup(d) === 'running');
  const closed  = deals.filter(d => getStatusGroup(d) === 'closed');
  const visible = tab === 'running' ? running : tab === 'closed' ? closed : deals;

  // ── Aggregate KPIs ─────────────────────────────────────────────────────────
  const totalParticipated = deals.reduce((s, d) => s + getDealAmt(d), 0);
  const runningAmt        = running.reduce((s, d) => s + getDealAmt(d), 0);
  const avgRoi            = deals.length
    ? (deals.reduce((s, d) => s + Number(getDealRoi(d) ?? 0), 0) / deals.length).toFixed(2)
    : '0.00';
  const withdrawable      = deals.filter(d => (d.withdrawStatus ?? '').toUpperCase() === 'YES').length;

  const TABS = [
    { key: 'all',     label: 'All',     count: deals.length,   color: accent    },
    { key: 'running', label: 'Running', count: running.length, color: '#35a13e' },
    { key: 'closed',  label: 'Closed',  count: closed.length,  color: '#2673bb' },
  ];

  const statusChipStyle = (s) => {
    const u = s.toUpperCase();
    if (u === 'RUNNING')  return { bg: 'rgba(53,161,62,0.1)',  color: '#35a13e',  border: 'rgba(53,161,62,0.25)'  };
    if (u === 'CLOSED')   return { bg: 'rgba(38,115,187,0.1)', color: '#2673bb',  border: 'rgba(38,115,187,0.25)' };
    if (u === 'ACHIEVED') return { bg: 'rgba(129,140,248,0.1)',color: '#818cf8',  border: 'rgba(129,140,248,0.25)'};
    return                       { bg: `${accent}10`,          color: accent,     border: `${accent}25`           };
  };

  return (
    <div className="grid gap-5">
      {/* ── Section header ── */}
      <SectionHeader icon={I.BarChart} accent={accent} platform="OxyLoans" title="My OxyLoans Deals" live />

      {/* ── Lender identity strip ── */}
      {meta && (meta.lenderName || meta.mobile) && (
        <div className="flex items-center gap-4 px-4 py-3 rounded-2xl flex-wrap"
          style={{ background: 'rgba(245,131,17,0.05)', border: '1px solid rgba(245,131,17,0.15)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(245,131,17,0.12)', color: accent }}>
            <I.Users />
          </div>
          <div className="flex-1 min-w-0">
            {meta.lenderName && <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{meta.lenderName}</p>}
            {meta.mobile     && <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>{meta.mobile}</p>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {meta.totalAmt != null && (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: 'rgba(53,161,62,0.1)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.2)' }}>
                Running: {fmtINR(meta.totalAmt)}
              </span>
            )}
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: 'rgba(245,131,17,0.1)', color: accent, border: `1px solid rgba(245,131,17,0.25)` }}>
              {meta.totalCount ?? deals.length} total deals
            </span>
          </div>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Participated', value: fmtINR(totalParticipated), sub: `${deals.length} deal${deals.length !== 1 ? 's' : ''}`,   color: accent    },
          { label: 'Running Amount',     value: fmtINR(runningAmt),        sub: `${running.length} active`,                               color: '#35a13e' },
          { label: 'Avg ROI',            value: `${avgRoi}%`,              sub: 'across all deals',                                       color: '#818cf8' },
          { label: 'Withdrawable',       value: String(withdrawable),      sub: 'deals with withdraw: YES',                               color: '#2673bb' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 flex flex-col gap-1"
            style={{ background: `${k.color}08`, border: `1px solid ${k.color}20` }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{k.label}</p>
            <p className="text-xl font-extrabold" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Graphs row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <OLStatusDonut deals={deals} accent={accent} />
        <OLRoiBarChart deals={deals} accent={accent} />
        <OLReturnTypeChart deals={deals} accent={accent} />
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: active ? `${t.color}18` : 'var(--input-bg)',
                color:      active ? t.color : 'var(--text-muted)',
                border:     `1.5px solid ${active ? t.color : 'var(--border)'}`,
                boxShadow:  active ? `0 0 10px ${t.color}22` : 'none',
              }}>
              <span className="w-2 h-2 rounded-full" style={{ background: t.color }} />
              {t.label}
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: `${t.color}18`, color: t.color }}>
                {t.count}
              </span>
            </button>
          );
        })}
        <div className="ml-auto">
          <span className="text-xs px-3 py-1.5 rounded-full font-semibold"
            style={{ background: `${accent}0e`, color: accent, border: `1px solid ${accent}25` }}>
            {fmtINR(visible.reduce((s, d) => s + getDealAmt(d), 0))} shown
          </span>
        </div>
      </div>

      {/* ── Deal cards ── */}
      <div className="grid gap-3">
        {visible.length === 0 ? (
          <div className="py-12 text-center rounded-2xl"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <p className="text-2xl mb-2">📭</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No deals in this view</p>
          </div>
        ) : visible.map((d, i) => {
          const amt        = getDealAmt(d);
          const roi        = getDealRoi(d);
          const status     = getDealStatus(d);
          const sc         = statusChipStyle(status);
          const returnType = olReturnTypeLabel(d.lederReturnType ?? d.ledgerReturnType ?? d.returnType);
          const name       = d.dealName ?? `Deal #${d.dealId ?? i + 1}`;
          const borrower   = d.dealBorrowerName ?? '—';
          const firstInt   = d.firstInterestDate ?? null;
          const regDate    = d.registeredDate ?? null;
          const withdraw   = d.withdrawStatus ?? '—';
          const isExpanded = expandedId === (d.dealId ?? i);
          const accentCols = [accent, '#2673bb', '#35a13e', '#818cf8', '#06b6d4', '#e95330'];
          const cardAccent = accentCols[i % accentCols.length];

          return (
            <div key={d.dealId ?? i}
              className="rounded-2xl overflow-hidden transition-all"
              style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>

              {/* Main row */}
              <div className="flex items-stretch">
                <div className="w-1 flex-shrink-0" style={{ background: cardAccent }} />
                <div className="flex-1 p-4 min-w-0">
                  {/* Name + badges */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {borrower}{d.dealDuration ? ` · ${d.dealDuration} mo` : ''}
                        {regDate ? ` · ${regDate}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                          style={{ background: sc.color, boxShadow: `0 0 4px ${sc.color}` }} />
                        {status || 'Unknown'}
                      </span>
                      {(d.withdrawStatus ?? '').toUpperCase() === 'YES' && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: 'rgba(53,161,62,0.1)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.2)' }}>
                          Withdrawable
                        </span>
                      )}
                    </div>
                  </div>

                  {/* KPI chips */}
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Participated</p>
                      <p className="text-sm font-black" style={{ color: cardAccent }}>{fmtINR(amt)}</p>
                    </div>
                    <div className="w-px h-7 flex-shrink-0" style={{ background: 'var(--border)' }} />
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ROI</p>
                      <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{roi != null ? `${roi}%` : '—'}</p>
                    </div>
                    {returnType && (
                      <>
                        <div className="w-px h-7 flex-shrink-0" style={{ background: 'var(--border)' }} />
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Returns</p>
                          <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{returnType}</p>
                        </div>
                      </>
                    )}
                    {firstInt && (
                      <>
                        <div className="w-px h-7 flex-shrink-0" style={{ background: 'var(--border)' }} />
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>1st Interest</p>
                          <p className="text-xs font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{firstInt}</p>
                        </div>
                      </>
                    )}
                    {d.dealAmount != null && (
                      <>
                        <div className="w-px h-7 flex-shrink-0" style={{ background: 'var(--border)' }} />
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Deal Size</p>
                          <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{fmtINR(d.dealAmount)}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Expand toggle */}
                <button onClick={() => setExpandedId(prev => prev === (d.dealId ?? i) ? null : (d.dealId ?? i))}
                  className="flex-shrink-0 px-3 flex items-center justify-center"
                  style={{ color: 'var(--text-muted)' }}>
                  <span className="transition-transform duration-200"
                    style={{ display: 'inline-block', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </span>
                </button>
              </div>

              {/* Expanded detail panel */}
              {isExpanded && (
                <div className="px-5 pb-4 pt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 border-t"
                  style={{ borderColor: 'var(--border)', background: `${cardAccent}04` }}>
                  {[
                    ['Deal ID',           d.dealId],
                    ['Deal Duration',     d.dealDuration ? `${d.dealDuration} months` : null],
                    ['Processing Fee',    d.processingFee != null ? fmtINR(d.processingFee) : null],
                    ['Fee Status',        d.feeStatus],
                    ['Current Value',     d.currentValue != null ? fmtINR(d.currentValue) : null],
                    ['Remaining Limit',   d.remaningingLimitToLender != null ? fmtINR(d.remaningingLimitToLender) : null],
                    ['First Participated',d.firstParticipationDate],
                    ['Last Participated', d.lastParticipationDate],
                    ['Account Type',      d.accountType],
                    ['Deal Created Type', d.dealCreatedType],
                    ['Closing Status',    d.borrowerClosingStatus],
                    ['Withdraw ROI',      d.roiForWithdraw != null ? `${d.roiForWithdraw}%` : null],
                  ].filter(([, v]) => v != null && v !== '' && v !== '—').map(([lbl, val]) => (
                    <div key={lbl} className="flex flex-col gap-0.5 pt-2">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{lbl}</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{String(val)}</span>
                    </div>
                  ))}
                  {d.groupLink && d.groupLink.trim() !== '' && (
                    <div className="col-span-2 sm:col-span-4 flex flex-col gap-0.5 pt-2">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Group Link</span>
                      <a href={d.groupLink} target="_blank" rel="noreferrer"
                        className="text-xs font-semibold break-all hover:underline" style={{ color: '#2673bb' }}>
                        {d.groupLink}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MigrateDataModal({ displayName,onClose }) {
  const [form, setForm] = useState({ id: '', passcode: '', mobile: '', registerNumber: '' });
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const { user } = useAuth();

  const validate = () => {
    const e = {};
    if (!form.id.trim())       e.id       = 'ID is required';
    if (!form.passcode.trim()) e.passcode = 'Passcode is required';
    if (!form.mobile.trim())   e.mobile   = 'Mobile number is required';
    // else if (!/^\d{15}$/.test(form.mobile.trim())) e.mobile = 'Enter a valid mobile number';
    return e;
  };

  useEffect(() => {
     getUserProfile()
      .then(profile => {
        if (profile?.mobileNumber) setForm(f => ({ ...f, registerNumber: profile.mobileNumber }));
      })
      .catch(() => {});
    },[]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setApiError('');
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    setApiError('');
    try {
      await migrateUserData({
        lenderId:         form.id.trim(),
        mobileNumber:     form.mobile.trim(),
        password:         form.passcode.trim(),
        userName:         displayName || '',
        migrationConsent: 'yes',
        registeredMobile: form.registerNumber?.trim() || '',
      });
      setShowSuccess(true);
    } catch (err) {
      setApiError(err.message ?? 'Migration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div className="grid gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })); }}
        placeholder={placeholder}
        readOnly={key === 'registerNumber' && Boolean(form.registerNumber)}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{
          background: 'var(--input-bg)',
          border: `1px solid ${errors[key] ? '#e95330' : 'var(--border)'}`,
          color: 'var(--text-primary)',
          boxShadow: errors[key] ? '0 0 0 3px rgba(233,83,48,0.12)' : 'none',
        }}
      />
      {errors[key] && <p className="text-xs" style={{ color: '#e95330' }}>{errors[key]}</p>}
    </div>
  );

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="rounded-2xl overflow-hidden w-full max-w-md"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(38,115,187,0.05)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(38,115,187,0.12)', border: '1px solid rgba(38,115,187,0.25)', color: '#2673bb' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>Migrate My Offline Data</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Enter your credentials to proceed</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Only active deals will be migrated</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 grid gap-4">
          {field('id',       'Given Lender ID', 'text',     'Enter your Lender ID')}
          {field('passcode', 'Given Passcode',  'text', 'Enter your given passcode')}
          {field('mobile',   'Communication Mobile Number',   'tel',      'Enter communication mobile number')}
          {field('registerNumber', 'Registered Mobile Number', 'tel', 'Enter registered mobile number')}

          {/* API error */}
          {apiError && (
            <div className="px-4 py-2.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(233,83,48,0.08)', color: '#e95330', border: '1px solid rgba(233,83,48,0.2)' }}>
              {apiError}
            </div>
          )}

          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            <strong className='text-color-red' style={{color:"#e95330"}}>Note:</strong> If you do not remember your credentials or if they are not available, please contact our support team through the <a href="/contact" className="text-blue-500 hover:underline font-bold">Contact Us</a> page.
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-40"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#2673bb,#1a5a9e)', color: '#fff', boxShadow: '0 4px 14px rgba(38,115,187,0.35)' }}>
              {submitting && (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />
              )}
              {submitting ? 'Migrating…' : 'Migrate'}
            </button>
          </div>
        </form>
      </div>
    </div>
    {showConfirm && <MigrateConfirmModal onConfirm={()=>handleConfirm()} onCancel={() => setShowConfirm(false)} />}
    {showSuccess && <MigrateSuccessModal onClose={onClose} />}
    </>
  );
}

// ─── Family Offline Section ───────────────────────────────────────────────────
// Rendered instead of OfflineSection when viewing a family member.
// Reads directly from fin.offline (returned by getMemberFinancials) so we never
// re-fetch with the logged-in user's own sessionStorage userId.
function FamilyOfflineSection({ fin, memberColor }) {
  const off = fin?.offline ?? {};
  const fmtAmt = (v) => formatINR(Number(v ?? 0));

  const payments = Array.isArray(off.payments) ? off.payments : [];
  const running  = payments.filter(p => (p.status ?? p.dealStatus ?? '').toLowerCase() === 'active');
  const closed   = payments.filter(p => (p.status ?? p.dealStatus ?? '').toLowerCase() !== 'active');

  const kpis = [
    { label: 'Total Invested',    value: off.totalInvested   ?? '₹0', sub: `${payments.length} deals total`,          color: '#f58311', Icon: I.Wallet      },
    { label: 'Monthly Interest',  value: off.monthlyInterest ?? '₹0', sub: 'Estimated monthly payout',               color: '#35a13e', Icon: I.Percent     },
    { label: 'Running Deals',     value: String(off.running  ?? running.length),  sub: 'Currently active',           color: memberColor, Icon: I.Activity   },
    { label: 'Closed Deals',      value: String(off.closed   ?? closed.length),   sub: 'Completed deals',            color: '#2673bb', Icon: I.CheckCircle },
  ];

  const monthlyChart = Array.isArray(off.monthlyChart) && off.monthlyChart.length === 12
    ? off.monthlyChart
    : Array(12).fill(0);

  return (
    <div className="grid gap-5">
      <SectionHeader icon={I.Building} accent={memberColor} platform="Offline" title="Offline Portfolio" live />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Monthly interest chart */}
      <GlassPanel accent={memberColor}>
        <AnimatedBarChart data={monthlyChart} accent={memberColor} />
      </GlassPanel>

      {/* Deals table */}
      {payments.length > 0 ? (
        <TableWrap accent={memberColor}>
          <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-3"
            style={{ borderBottom: '1px solid var(--table-header-border)', background: 'var(--table-off-header-accent)' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <I.Building />
              <h3 className="text-sm font-bold ml-1" style={{ color: 'var(--text-primary)' }}>Offline Deals</h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[{ l: 'Active', c: running.length, col: '#35a13e' }, { l: 'Closed', c: closed.length, col: '#2673bb' }].map(b => (
                <span key={b.l} className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: `${b.col}12`, color: b.col, border: `1px solid ${b.col}25` }}>
                  {b.l} · {b.c}
                </span>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--table-header-border)', background: 'var(--table-header-bg)' }}>
                  {['Deal', 'Amount', 'ROI', 'Payout', 'Date', 'Status'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold"
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => {
                  const isActive = (p.status ?? p.dealStatus ?? '').toLowerCase() === 'active';
                  const sc = isActive ? '#35a13e' : '#2673bb';
                  return (
                    <tr key={p.dealId ?? p.id ?? i}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid var(--table-row-border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="py-3.5 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {p.dealName ?? p.name ?? `Deal ${i + 1}`}
                      </td>
                      <td className="py-3.5 px-4 font-bold tabular-nums" style={{ color: '#f58311' }}>
                        {fmtAmt(p.participatedAmount ?? p.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md"
                          style={{ background: 'var(--rate-bg)', color: 'var(--rate-color)', border: '1px solid var(--rate-border)' }}>
                          {p.rateOfInterest ?? p.roi ?? '—'}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {p.amountTye ?? p.payoutType ?? '—'}
                      </td>
                      <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {p.participatedDate ?? p.date ?? '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Chip status={isActive ? 'Active' : 'Closed'} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TableWrap>
      ) : (
        <div className="rounded-2xl p-10 text-center"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
          <p className="text-3xl mb-2">📂</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
            No offline deals on record for this member
          </p>
        </div>
      )}
    </div>
  );
}

function MemberDashboard({ memberId, mode, openFamilyModal = false, onFamilyModalOpened }) {
  const [fin, setFin]             = useState(null);
  const [loading, setLoading]     = useState(true);
  const [profile, setProfile]     = useState(null);
  const [hasMigratedData, setHasMigratedData] = useState(false);
  const [migrateOpen, setMigrateOpen] = useState(false);
  const [oxyloansDataOpen, setOxyloansDataOpen] = useState(false);
  const [confirmedOLDeals, setConfirmedOLDeals] = useState([]);
  // OxyLoans family member modal state
  const [familyMemberOpen, setFamilyMemberOpen] = useState(false);
  // null=still checking, false=no lenderId found, string=valid lenderId
  const [migrationLenderId, setMigrationLenderId] = useState(null);
  const [migrationChecked, setMigrationChecked] = useState(false);
  // Full migration info response — used to pre-fill and skip OTP steps
  const [migrationInfo, setMigrationInfo] = useState(null);
  // Real OxyLoans deals from API — null means never fetched, object means fetched (may have empty deals)
  const [oxyloansApiDeals, setOxyloansApiDeals] = useState(null);
  const [oxyloansApiLoading, setOxyloansApiLoading] = useState(false);
  const [oxyloansApiError, setOxyloansApiError] = useState('');

  // When the parent (UnifiedDashboard) signals us to open the family modal
  // (e.g. after an add-member flow completes), honour it and notify parent.
  useEffect(() => {
    if (openFamilyModal) {
      setFamilyMemberOpen(true);
      onFamilyModalOpened?.();
    }
  }, [openFamilyModal]); // eslint-disable-line
  const liveOffline = useOfflineStats();
  const { user } = useAuth();
  const {
    oxyloansMembers,
    headOfFamilyId,
    headOfFamily,
    refreshOxyloansMembers,
    setHeadOfFamily,
    removeOxyFamilyMember,
    selfMemberId,
  } = useFamily();
  const memberColor = MEMBER_COLORS[memberId] ?? '#2673bb';
  // isFamilyMember = we are viewing a family member's record, not the logged-in user's own.
  // Compare against selfMemberId (the first approved member = the account owner's slot)
  // and the sentinel 'self'. Both indicate the logged-in user's own view.
  const isFamilyMember = memberId !== 'self' && memberId !== selfMemberId;

  useEffect(() => {
    // Reset all state when memberId changes so stale data never shows
    setFin(null);
    setLoading(true);
    setHasMigratedData(false);
    setMigrationLenderId(null);
    setMigrationChecked(false);
    setMigrationInfo(null);
    setOxyloansApiDeals(null);
    setOxyloansApiLoading(false);
    setOxyloansApiError('');

    getMemberFinancials(memberId)
      .then(d => { if (d) setFin(d); })
      .catch(() => {})
      .finally(() => setLoading(false));

    getUserProfile()
      .then(p => { if (p) setProfile(p); })
      .catch(() => {});

    getUserOfflineParticipationDealsInfo()
      .then((rows) => {
        const hasRows = Array.isArray(rows) && rows.some((r) => Number(r?.currentPrincipalAmount ?? r?.participationAmount ?? 0) > 0);
        setHasMigratedData(hasRows);
      })
      .catch(() => {
        setHasMigratedData(false);
      });

    // Fetch migration info — lenderId is needed to auto-load OxyLoans deals
    getMigrationOxyloansUserInfo()
      .then(info => {
        const lid = info?.lenderId ?? info?.lender_id ?? null;
        setMigrationInfo(info ?? null);
        setMigrationLenderId(lid ? String(lid) : false);
        setMigrationChecked(true);
        // If both verifications are already done, auto-load deals immediately
        // without requiring the user to go through the OTP modal
        if (lid && info?.mobileNumberVerified && info?.emailVerified) {
          // auto-load triggered by the migrationLenderId useEffect below
        }
      })
      .catch(() => {
        // API error (network, 404, etc.) — treat same as no lenderId found
        setMigrationInfo(null);
        setMigrationLenderId(false);
        setMigrationChecked(true);
      });
  }, [memberId]);

  const loadOxyloansDeals = React.useCallback(async (lenderId) => {
    if (!lenderId) return;
    setOxyloansApiLoading(true);
    setOxyloansApiError('');
    setOxyloansApiDeals(null); // clear previous data while reloading
    try {
      // Always get a fresh encrypt key — required by the OxyLoans external API
      const encKey = await getOxyloansEncryptKey();
      const res = await getOxyloansLenderDeals(String(lenderId), encKey);
      const deals = Array.isArray(res?.lenderPaticipatedResponseDto)
        ? res.lenderPaticipatedResponseDto
        : [];
      setOxyloansApiDeals({ raw: res, deals });
      setOxyloansApiError(''); // clear any previous error on success
    } catch (e) {
      // Keep oxyloansApiDeals as null so the error state in the tab renders correctly
      setOxyloansApiError(e.message ?? 'Failed to load OxyLoans deals');
      setOxyloansApiDeals(null);
    } finally {
      setOxyloansApiLoading(false);
    }
  }, []);

  useEffect(() => {
    if (migrationLenderId) loadOxyloansDeals(migrationLenderId);
  }, [migrationLenderId, loadOxyloansDeals]);

  const emptyFin = {
    name: '—', role: '—', lrId: '—',
    oxyloans: { totalEarned: '₹0', totalInvested: '₹0', monthlyInterest: '₹0', running: 0, closed: 0, pending: 0, deals: [], monthlyChart: [0,0,0,0,0,0,0,0,0,0,0,0] },
    offline:  { totalPaid: '₹0', monthlyInterest: '₹0', totalInvested: '₹0', running: 0, closed: 0, pending: 0, payments: [], monthlyChart: [0,0,0,0,0,0,0,0,0,0,0,0] },
    properties: { total: 0, value: '₹0' },
    revenue: { oxyloans: 0, offline: 0, oxybricks: 0, total: 0 },
  };
  const data = fin ?? emptyFin;
  const firstName   = profile?.firstName ?? '';
  const lastName    = profile?.lastName  ?? '';
  const profileName = (firstName + ' ' + lastName).trim();
  const displayName = profileName || user?.name || data.name || '—';
  const id = sessionStorage.getItem('userId');

  const showOL   = mode === 'B' || mode === 'C';
  const showOff  = mode === 'A' || mode === 'C';
  const showBoth = mode === 'C';

  // Master tab — for family members default to 'oxyloans'; for self default to 'both'
  const [masterTab, setMasterTab] = useState(() => !isFamilyMember ? 'oxyloans' : 'offline');
  const isOwn = !isFamilyMember;
  // Button states for OxyLoans in the hero strip:
  // Derived OxyLoans button/status flags from migration info
  const mobileVerified  = !!migrationInfo?.mobileNumberVerified;
  const emailVerified   = !!migrationInfo?.emailVerified;
  const bothVerified    = mobileVerified && emailVerified;
  // Show "Load Oxyloans Data" button when:
  //   - check done AND no lenderId (user hasn't linked account yet), OR
  //   - lenderId found BUT at least one verification is still pending
  const showLoadOxyloansBtn = migrationChecked && (
    migrationLenderId === false ||
    (!!migrationLenderId && !bothVerified)
  );
  // Green "OxyLoans Connected" badge — lenderId found, both verified, deals loaded
  const oxyloansLinked = migrationChecked && !!migrationLenderId && bothVerified && !!oxyloansApiDeals;

  return (
    <div className="grid gap-7">
      {/* Slim hero strip */}
      <div className="flex items-center gap-3 flex-wrap px-1">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
          style={{ background: `linear-gradient(135deg,${memberColor},${memberColor}88)`, color: '#fff', boxShadow: `0 0 16px ${memberColor}35` }}>
          {(displayName || '?').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>{displayName}</span>
            {loading && <span className="text-xs px-2 py-0.5 rounded-full animate-pulse" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>Loading…</span>}
            {data.role && data.role !== '—' && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: `${memberColor}12`, color: memberColor, border: `1px solid ${memberColor}22` }}>{data.role}</span>
            )}
            {data.lrId && data.lrId !== '—' &&  (
              <span className="font-mono text-xs font-bold" style={{ color: memberColor }}>{data.lrId}</span>
            )}
            {isOwn && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(38,115,187,0.1)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.2)' }}>You</span>}
          </div>
          {id && (
            <CopyId id={id} />
          )}
        </div>
        {(profile?.migrationStatus !== 'APPROVED' && profile?.migrationStatus !== 'REJECTED' && profile?.migrationStatus !== 'CANCELLED')  && !hasMigratedData && (
          <div>
            <button
              onClick={() => setMigrateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#2673bb,#1a5a9e)', color: '#fff', boxShadow: '0 4px 14px rgba(38,115,187,0.3)', border: '1px solid rgba(38,115,187,0.3)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Migrate My Offline Data
            </button>
          </div>
        )}
        {/* ── OxyLoans connection status buttons ── */}

        {/* 1. Still checking migration info */}
        {/* {!migrationChecked && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(245,131,17,0.08)', color: '#f58311', border: '1px solid rgba(245,131,17,0.2)' }}>
            <span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#f58311', borderTopColor: 'transparent' }} />
            Checking OxyLoans…
          </div>
        )} */}

        {/* 2. Check done — no OxyLoans account linked → show connect button */}
        {/* {showLoadOxyloansBtn && (
          <button
            onClick={() => setOxyloansDataOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,#f58311,#d96b00)', color: '#fff', boxShadow: '0 4px 14px rgba(245,131,17,0.3)', border: '1px solid rgba(245,131,17,0.3)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 9h6M9 13h6M9 17h4"/>
            </svg>
            {migrationLenderId && !mobileVerified && emailVerified
              ? 'Verify Mobile Number'
              : migrationLenderId && mobileVerified && !emailVerified
                ? 'Verify Email Address'
                : migrationLenderId && !mobileVerified && !emailVerified
                  ? 'Complete Verification'
                  : 'Load Oxyloans Data'}
          </button>
        )} */}

        {/* 3. lenderId found — deals currently loading */}
        {/* {migrationChecked && migrationLenderId && oxyloansApiLoading && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(245,131,17,0.08)', color: '#f58311', border: '1px solid rgba(245,131,17,0.2)' }}>
            <span className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#f58311', borderTopColor: 'transparent' }} />
            Loading OxyLoans data…
          </div>
        )} */}

        {/* 4. lenderId found — deals loaded successfully → show linked badge */}
        {/* {oxyloansLinked && !oxyloansApiLoading && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(53,161,62,0.08)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.22)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            OxyLoans Connected
          </div>
        )} */}

        {/* 5. lenderId found — deals failed to load → retry */}
        {migrationChecked && migrationLenderId && oxyloansApiError && !oxyloansApiLoading && (
          <button
            onClick={() => loadOxyloansDeals(migrationLenderId)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-90"
            style={{ background: 'rgba(233,83,48,0.1)', color: '#e95330', border: '1px solid rgba(233,83,48,0.25)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3"/>
            </svg>
            Retry OxyLoans
          </button>
        )}

        {/* 6. OxyLoans family members available */}
        {oxyloansMembers.length > 0 && (
          <button
            onClick={() => setFamilyMemberOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: 'rgba(245,131,17,0.1)', color: '#f58311', border: '1px solid rgba(245,131,17,0.35)', boxShadow: '0 2px 8px rgba(245,131,17,0.1)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Family Members
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(245,131,17,0.18)', color: '#f58311' }}>
              {oxyloansMembers.length}
            </span>
          </button>
        )}
      </div>

      {/* Head of Family banner — shown once a Head of Family is set */}
      {headOfFamily && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: 'linear-gradient(135deg,rgba(245,131,17,0.08),rgba(245,131,17,0.03))', border: '1px solid rgba(245,131,17,0.25)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
            style={{ background: 'rgba(245,131,17,0.15)', color: '#f58311', border: '1px solid rgba(245,131,17,0.3)' }}>
            {(headOfFamily.name ?? '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#f58311' }}><path d="M2 20h20v2H2zM4 18l4-10 4 4 4-8 4 10H4z"/></svg>
              <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#f58311' }}>Head of Family</span>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{headOfFamily.name}</span>
              {headOfFamily.lrId && (
                <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{headOfFamily.lrId}</span>
              )}
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Primary OxyLoans support contact for this family
              {headOfFamily.phone && <> · <span className="font-semibold">{headOfFamily.phone}</span></>}
            </p>
          </div>
          <button
            onClick={() => setFamilyMemberOpen(true)}
            className="text-xs px-3 py-1.5 rounded-xl font-semibold flex-shrink-0 transition-all hover:opacity-80"
            style={{ background: 'rgba(245,131,17,0.12)', color: '#f58311', border: '1px solid rgba(245,131,17,0.25)' }}>
            Manage
          </button>
        </div>
      )}

      {migrateOpen && <MigrateDataModal displayName={displayName} onClose={() => setMigrateOpen(false)} />}
      {oxyloansDataOpen && (
        <GetOxyloansDataModal
          migrationInfo={migrationInfo}
          onClose={() => setOxyloansDataOpen(false)}
          onConfirm={async (deals) => {
            setConfirmedOLDeals(deals ?? []);
            // Also refresh API deals so OxyLoans tab shows fresh data
            // Re-fetch migration info to get lenderId if not yet known
            if (!migrationLenderId) {
              try {
                const info = await getMigrationOxyloansUserInfo();
                const lid = info?.lenderId ?? info?.lender_id ?? null;
                if (lid) {
                  setMigrationLenderId(String(lid));
                  setMigrationChecked(true);
                  loadOxyloansDeals(String(lid));
                }
              } catch { /* ignore — confirmedOLDeals already set above */ }
            } else {
              loadOxyloansDeals(migrationLenderId);
            }
            setOxyloansDataOpen(false);
            await refreshOxyloansMembers();
            // Self/view mode: toast is shown inside GetOxyloansDataModal.
            // FamilyMemberModal is intentionally NOT opened here.
          }}
        />
      )}
      {familyMemberOpen && (
        <FamilyMemberModal
          members={oxyloansMembers}
          currentHeadId={headOfFamilyId}
          onSetHead={setHeadOfFamily}
          onRemove={removeOxyFamilyMember}
          onClose={() => setFamilyMemberOpen(false)}
        />
      )}
      {/* Add Member flow lives in UnifiedDashboard root, triggered via Topbar dropdown */}

      {/* ── Master platform tab bar ─────────────────────────────────── */}
      {/* <div className="flex items-center gap-1 p-1 rounded-2xl w-fit"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
        {[
          { key: 'both',     label: 'All',      icon: <I.PieChart />, color: memberColor },
          { key: 'oxyloans', label: 'OxyLoans',  icon: <I.Bank />,     color: '#2673bb'   },
          { key: 'offline',  label: 'Offline',   icon: <I.Building />, color: '#f58311'   },
        ].map(t => {
          const active = masterTab === t.key;
          return (
            <button key={t.key} onClick={() => setMasterTab(t.key)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: active ? t.color : 'transparent',
                color: active ? '#fff' : 'var(--text-muted)',
                boxShadow: active ? `0 2px 10px ${t.color}40` : 'none',
              }}>
              <span className="w-4 h-4">{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div> */}

      {/* ── Both tab: combined KPI overview ─────────────────────────── */}
      {masterTab === 'both' && (
        <div className="grid gap-5">
          {(() => {
            const apiDeals = oxyloansApiDeals?.deals ?? [];
            const olDeals  = apiDeals.length > 0 ? apiDeals
              : confirmedOLDeals.length > 0 ? confirmedOLDeals
              : [];
            const olAmt       = olDeals.reduce((s, d) => s + olDealAmt(d), 0);
            const olRunning   = olDeals.filter(d => olDealStatus(d) === 'Active').length;
            const offAmt      = liveOffline?.ready ? liveOffline.totalInvested : 0;
            const totalDeals  = olDeals.length + (liveOffline?.ready ? (liveOffline.running + liveOffline.closed) : 0);
            const totalAUM    = olAmt + offAmt;
            return (
              <>
                <CombinedAnalysis
                  fin={data}
                  memberColor={memberColor}
                  liveOffline={liveOffline}
                  olAmtOverride={olAmt}
                  olRunningOverride={olRunning}
                />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: 'OxyLoans Deals', value: formatINR(olAmt),                                                             sub: `${olDeals.length} deals`,                color: '#2673bb',   Icon: I.Bank     },
                    { label: 'Offline Deals',  value: formatINR(offAmt),                                                            sub: `${liveOffline?.ready ? (liveOffline.running + liveOffline.closed) : 0} deals`, color: '#f58311',   Icon: I.Building },
                    { label: 'Total Deals',    value: String(totalDeals),                                                           sub: 'OxyLoans + Offline',                     color: memberColor, Icon: I.BarChart },
                    { label: 'Total AUM',      value: formatINR(totalAUM),                                                          sub: 'Combined invested amount',               color: '#35a13e',   Icon: I.Wallet   },
                  ].map(k => <KpiCard key={k.label} {...k} />)}
                </div>
              </>
            );
          })()}

          {/* OxyLoans deals are shown in the OxyLoans tab only */}
        </div>
      )}

      {/* ── OxyLoans tab ─────────────────────────────────────────────── */}
      {masterTab === 'oxyloans' && (
        <div className="grid gap-5">

          {/* State 1: Still checking migration info */}
          {!migrationChecked && (
            <div className="flex items-center justify-center gap-3 py-16 rounded-2xl"
              style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
              <span className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#f58311', borderTopColor: 'transparent' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                Checking OxyLoans account…
              </span>
            </div>
          )}

          {/* State 2: Check done — no OxyLoans account linked */}
          {migrationChecked && migrationLenderId === false && !oxyloansApiLoading && (
            <div className="rounded-2xl py-16 flex flex-col items-center gap-4 text-center"
              style={{ background: 'var(--surface-card)', border: '1px dashed var(--border)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(245,131,17,0.1)', border: '1px solid rgba(245,131,17,0.25)', color: '#f58311' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/>
                </svg>
              </div>
              <div>
                <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>OxyLoans account not connected</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Connect your OxyLoans account to view your lending portfolio
                </p>
              </div>
              <button onClick={() => setOxyloansDataOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg,#f58311,#d96b00)', color: '#fff', boxShadow: '0 4px 14px rgba(245,131,17,0.3)' }}>
                Load Oxyloans Data
              </button>
            </div>
          )}

          {/* State 3: lenderId found — deals loading */}
          {migrationChecked && migrationLenderId && oxyloansApiLoading && (
            <div className="flex items-center justify-center gap-3 py-16 rounded-2xl"
              style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
              <span className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#f58311', borderTopColor: 'transparent' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                Loading OxyLoans deals…
              </span>
            </div>
          )}

          {/* State 4: lenderId found — deals failed */}
          {migrationChecked && migrationLenderId && !oxyloansApiLoading && oxyloansApiError && !oxyloansApiDeals && (
            <div className="rounded-2xl p-8 text-center"
              style={{ background: 'var(--surface-card)', border: '1px solid rgba(233,83,48,0.2)' }}>
              <p className="text-2xl mb-3">⚠️</p>
              <p className="text-sm font-semibold" style={{ color: '#e95330' }}>{oxyloansApiError}</p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Lender ID: <span className="font-mono font-bold" style={{ color: '#f58311' }}>{migrationLenderId}</span>
              </p>
              <button onClick={() => loadOxyloansDeals(migrationLenderId)}
                className="mt-4 px-5 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#f58311,#d96b00)', color: '#fff', boxShadow: '0 4px 14px rgba(245,131,17,0.3)' }}>
                Retry
              </button>
            </div>
          )}

          {/* State 5: Deals loaded — show data */}
          {migrationChecked && migrationLenderId && !oxyloansApiLoading && !oxyloansApiError && oxyloansApiDeals && (() => {
            const deals      = oxyloansApiDeals.deals ?? [];
            const raw        = oxyloansApiDeals.raw;
            const totalCount = raw?.totalCount ?? deals.length;
            const totalAmt   = raw?.totalRunningDealsAmount ?? null;
            const lenderName = raw?.lenderName ?? null;
            const mobile     = raw?.mobileNumber ?? null;
            const email      = raw?.email ?? null;
            const userId     = raw?.userId ?? null;

            if (deals.length === 0) return (
              <div className="rounded-2xl py-16 flex flex-col items-center gap-4 text-center"
                style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
                <p className="text-3xl mb-1">📭</p>
                <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>No active OxyLoans deals</p>
                {lenderName && (
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Account: <strong style={{ color: '#f58311' }}>{lenderName}</strong>
                    </p>
                    {mobile && <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{mobile}</p>}
                    {email  && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{email}</p>}
                  </div>
                )}
                <p className="text-xs px-3 py-1 rounded-full"
                  style={{ background: 'rgba(245,131,17,0.08)', color: '#f58311', border: '1px solid rgba(245,131,17,0.2)' }}>
                  Server total count: {totalCount}
                </p>
              </div>
            );

            return (
              <OxyLoansDealsSection
                deals={deals}
                memberColor={memberColor}
                meta={{ totalCount, totalAmt, lenderName, mobile, email, userId }}
              />
            );
          })()}
        </div>
      )}

      {/* ── Offline tab — same live OfflineSection for everyone ──────── */}
      {masterTab === 'offline' && (
        <OfflineSection fin={data} memberColor={memberColor} />
      )}

      {/* My Participations — compact table (up to 5) */}
      <Divider />
      {/* <CompactParticipationsSection /> */}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function UnifiedDashboard({ addMemberOpen = false, onAddMemberClose }) {
  const { mode } = useMode();
  const { selectedMemberId, membersLoading, hasFamily, userId, selfMemberId, refreshOxyloansMembers } = useFamily();
  // Internal mirror so the add-member modal can be driven from Topbar dropdown
  const [localAddOpen, setLocalAddOpen] = useState(false);
  const showAddMember = addMemberOpen || localAddOpen;
  const closeAddMember = () => { setLocalAddOpen(false); onAddMemberClose?.(); };

  // Signals MemberDashboard to open FamilyMemberModal after add-member completes
  const [pendingFamilyModal, setPendingFamilyModal] = useState(false);

  // Resolve the memberId to pass to MemberDashboard:
  //  'self'       → use selfMemberId (the logged-in user's family slot) if available,
  //                 otherwise fall back to the raw userId UUID.
  //  anything else → use as-is (it's a family member's id).
  const resolveId = (id) => {
    if (!id || id === 'self') return selfMemberId ?? userId;
    return id;
  };

  if (membersLoading) return (
    <div className="flex items-center justify-center gap-3 py-20">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#2673bb', borderTopColor: 'transparent' }} />
      <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading dashboard…</span>
    </div>
  );

  // Add-member modal — driven from Topbar "Add Member" button in dropdown
  const addMemberModal = showAddMember ? (
    <GetOxyloansDataModal
      onClose={closeAddMember}
      onConfirm={async () => {
        closeAddMember();
        await refreshOxyloansMembers();
        // Signal MemberDashboard to open FamilyMemberModal for head-of-family management
        setPendingFamilyModal(true);
      }}
      mode="addMember"
    />
  ) : null;

  if (!hasFamily) {
    return (
      <div className="grid gap-6">
        {addMemberModal}
        <ProfileWarningBanner />
        <MemberDashboard memberId={resolveId(selectedMemberId)} mode={mode} isSelf
          openFamilyModal={pendingFamilyModal}
          onFamilyModalOpened={() => setPendingFamilyModal(false)}
        />
      </div>
    );
  }

  // null = user explicitly chose "Family Overview" in the switcher
  // 'self' or selfMemberId = show the logged-in user's own dashboard
  if (selectedMemberId === null) return (
    <div className="grid gap-6">
      {addMemberModal}
      <ProfileWarningBanner />
      <FamilyOverview />
    </div>
  );

  return (
    <div className="grid gap-6">
      {addMemberModal}
      <ProfileWarningBanner />
      <MemberDashboard memberId={resolveId(selectedMemberId)} mode={mode}
        openFamilyModal={pendingFamilyModal}
        onFamilyModalOpened={() => setPendingFamilyModal(false)}
      />
    </div>
  );
}
