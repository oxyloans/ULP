import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMode } from '../context/ModeContext';
import { useFamily } from '../context/FamilyContext';
import { useAuth } from '../context/AuthContext';
import { getMemberFinancials, getFamilyAggregate, getUserProfile, getRunningDeals } from '../api/afterlogin-user';
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
function AnimatedBarChart({ data, accent = '#2673bb', label = 'Monthly Interest', unit = '₹K' }) {
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
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{unit} — {(() => { const n = new Date(); const s = n.getMonth() < 3 ? n.getFullYear()-1 : n.getFullYear(); return `FY ${s}-${String(s+1).slice(2)}`; })()}</p>
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
                  {unit === '₹K' ? `₹${v}K` : `₹${v}L`}
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
          { label: 'Latest',     value: `₹${data[data.length - 1]}K`, color: accent },
          { label: 'Total',      value: `₹${(data.reduce((a, b) => a + b, 0) / 10).toFixed(1)}L`, color: 'var(--text-primary)' },
          { label: 'Avg/Month',  value: `₹${Math.round(data.reduce((a, b) => a + b, 0) / data.length)}K`, color: '#35a13e' },
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
                {aggOl[i] >= 1000 ? `₹${(aggOl[i]/1000).toFixed(1)}K` : `₹${Math.round(aggOl[i])}`}
              </div>
              <div className="w-full rounded-t"
                style={{ height: `${heights[i]?.ol ?? 0}%`, transition: 'height 0.65s cubic-bezier(0.34,1.56,0.64,1)', background: 'linear-gradient(180deg,#5b9fd4,#2673bb)', boxShadow: (heights[i]?.ol ?? 0) > 60 ? '0 0 8px #2673bb55' : 'none' }} />
            </div>
            <div className="flex-1 flex flex-col justify-end relative" style={{ height: 80 }}>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 text-xs px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none"
                style={{ background: '#f58311ee', color: '#fff', fontSize: 9 }}>
                {aggOff[i] >= 1000 ? `₹${(aggOff[i]/1000).toFixed(1)}K` : `₹${Math.round(aggOff[i])}`}
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
          const trim = (val) => val.replace(/\.?0+$/, '');
          const display = total >= 10000000 ? `₹${trim((total/10000000).toFixed(2))}Cr`
                        : total >= 100000   ? `₹${trim((total/100000).toFixed(2))}L`
                        : `₹${Math.round(total).toLocaleString('en-IN')}`;
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
  const fmtAmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;

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

  const fmtINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);

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
  const [interestPayment, setInterestPayment] = useState(null);
  const [participationData, setParticipationData] = useState(null);
  const PAYOUT_LABELS = { MONTHLY: 'Monthly', QUARTELY: 'Quarterly', HALFLY: 'Half-Yearly', YEARLY: 'Yearly', ENDOFTHEDEAL: 'End of Deal' };
  const PAYOUT_COLORS = { MONTHLY: '#35a13e', QUARTELY: '#2673bb', HALFLY: '#f58311', YEARLY: '#e95330', ENDOFTHEDEAL: '#6366f1' };

  useEffect(() => {
    getRunningDeals()
      .then(d => { if (d) setParticipationData(d); })
      .catch(() => {});
  }, []);

  //  Helpers 
  const fmtAmt = (n) => {
    if (!n && n !== 0) return '₹0';
    const abs = Math.abs(n);
    const trim = (val) => val.replace(/\.?0+$/, '');
    if (abs >= 10000000) return `₹${trim((n / 10000000).toFixed(2))}Cr`;
    if (abs >= 100000)   return `₹${trim((n / 100000).toFixed(2))}L`;
    // Under 1L — show exact number
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
  };

  // Parse "DD/MM/YYYY"  0-based month index
  const parseMonth = (dateStr) => {
    if (!dateStr) return -1;
    const parts = dateStr.split('/');
    return parts.length === 3 ? parseInt(parts[1], 10) - 1 : -1;
  };

  //  Build 12-month arrays from real participation data 
  const participations = participationData?.participationInfo ?? [];
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

  // Keep raw ₹ — no division, no rounding
  const investedChart = monthlyInvested.map(v => Math.round(v));
  const interestChart = monthlyInterestArr.map(v => Math.round(v));

  //  KPI values 
  const activeDeals   = participations.filter(p => p.dealStatus !== 'CLOSED' && p.dealStatus !== 'ACHIEVED').length;
  const closedDeals   = participations.filter(p => p.dealStatus === 'CLOSED' || p.dealStatus === 'ACHIEVED').length;
  const totalInvested = participations.reduce((s, p) => {
    const updates = (p.updatedParticipation ?? []).reduce((ss, u) => ss + (u.updationParticipation ?? 0), 0);
    return s + (p.participatedAmount ?? 0) + updates;
  }, 0);
  const currentMonth  = new Date().getMonth();
  const thisMonthInterest = interestChart[currentMonth] * 1000;

  // Also compute total monthly interest the same way as MyParticipations (sum all entries)
  const totalMonthlyInterest = participations.reduce((sum, p) => {
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
      return s + Math.round(e.amount * mr);
    }, 0);
  }, 0);

  //  Payout type donut 
  const payoutCount = {};
  participations.forEach(p => { payoutCount[p.amountTye] = (payoutCount[p.amountTye] || 0) + 1; });
  const payoutSegments = Object.entries(payoutCount)
    .map(([k, v]) => ({ label: PAYOUT_LABELS[k] ?? k, value: v, color: PAYOUT_COLORS[k] ?? '#888' }))
    .filter(s => s.value > 0);

  const statusGroups = {
    Active: { count: activeDeals,  color: '#35a13e', glow: 'rgba(53,161,62,0.4)'  },
    Closed: { count: closedDeals,  color: '#2673bb', glow: 'rgba(38,115,187,0.4)' },
  };
  const maxStatusCount = Math.max(...Object.values(statusGroups).map(g => g.count), 1);

  const kpis = [
    { label: 'Monthly Interest', Icon: I.Percent,     value: fmtAmt(totalMonthlyInterest), sub: `${MONTHS[currentMonth]} earnings`,       trend: null, trendUp: true, color: '#f58311', badge: 'This month'                    },
    { label: 'Active Deals',     Icon: I.Activity,    value: String(activeDeals),         sub: `${fmtAmt(totalInvested)} total invested`, trend: null, trendUp: true, color: '#35a13e', badge: activeDeals > 0 ? 'Live' : null },
    { label: 'Closed Deals',     Icon: I.CheckCircle, value: String(closedDeals),         sub: 'Completed deals',                        trend: null, trendUp: true, color: '#2673bb', badge: null                            },
    { label: 'Total Invested',   Icon: I.Wallet,      value: fmtAmt(totalInvested),       sub: `${participations.length} participations`, trend: null, trendUp: true, color: '#6366f1', badge: null                            },
  ];

  const modes = ['All', 'MONTHLY', 'QUARTELY', 'HALFLY', 'YEARLY', 'ENDOFTHEDEAL'];
  const modeColors = { All: '#f58311', MONTHLY: '#35a13e', QUARTELY: '#2673bb', HALFLY: '#f58311', YEARLY: '#e95330', ENDOFTHEDEAL: '#6366f1' };
  const baseDeals = dealTab === 'Active'
    ? participations.filter(p => p.dealStatus !== 'CLOSED' && p.dealStatus !== 'ACHIEVED')
    : participations.filter(p => p.dealStatus === 'CLOSED' || p.dealStatus === 'ACHIEVED');
  const filteredDeals = modeFilter === 'All' ? baseDeals : baseDeals.filter(p => p.amountTye === modeFilter);

  return (
    <>
      {interestPayment && <InterestModal payment={interestPayment} onClose={() => setInterestPayment(null)} />}
      <div className="grid gap-5">
        <SectionHeader icon={I.Package} accent="#f58311" platform="Offline " title="My Investment Portfolio" live />

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
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{participations.length}</span>
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
                  { label: 'Active', count: participations.filter(p => p.dealStatus !== 'CLOSED' && p.dealStatus !== 'ACHIEVED').length, color: '#35a13e' },
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
                const cnt = m === 'All' ? baseDeals.length : baseDeals.filter(p => p.amountTye === m).length;
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
                  {['#', 'Deal Name', 'Payout Type', 'Total Invested', 'ROI %', 'Monthly Interest', 'Participated Date', 'Status'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs uppercase tracking-widest font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDeals.length === 0 ? (
                  <tr><td colSpan={9} className="py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>No {dealTab.toLowerCase()} deals found</td></tr>
                ) : filteredDeals.map((p, idx) => {
                  const roi    = p.rateOfInterest ?? 0;
                  const amount = p.participatedAmount ?? 0;
                  // Total invested = initial + all top-ups
                  const updatesTotal2 = (p.updatedParticipation ?? []).reduce((s, u) => s + (u.updationParticipation ?? 0), 0);
                  const totalAmt = amount + updatesTotal2;
                  // roi is per payout period — convert to monthly equivalent for display
                  let monthlyRate = 0;
                  if      (p.amountTye === 'MONTHLY')      monthlyRate = roi / 100;
                  else if (p.amountTye === 'QUARTELY')     monthlyRate = (roi / 100) / 3;
                  else if (p.amountTye === 'HALFLY')       monthlyRate = (roi / 100) / 6;
                  else if (p.amountTye === 'YEARLY')       monthlyRate = (roi / 100) / 12;
                  const monthlyEarning = Math.round(totalAmt * monthlyRate);
                  const pc = PAYOUT_COLORS[p.amountTye] ?? '#888';
                  const updatesTotal = (p.updatedParticipation ?? []).reduce((s, u) => s + (u.updationParticipation ?? 0), 0);
                  const totalInvested = amount + updatesTotal;
                  return (
                    <tr key={p.dealId ?? idx} className="transition-colors" style={{ borderBottom: '1px solid var(--table-row-border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="py-3 px-3 font-bold" style={{ color: 'var(--text-primary)' }}>{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${pc}15`, border: `1px solid ${pc}30`, color: pc }}>
                            <I.Activity />
                          </div>
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.dealName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: `${pc}12`, color: pc, border: `1px solid ${pc}25` }}>
                          {PAYOUT_LABELS[p.amountTye] ?? p.amountTye}
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
                      <td className="py-3 px-3 font-bold" style={{ color: '#f58311' }}>{roi}%</td>
                      <td className="py-3 px-3 font-bold tabular-nums" style={{ color: '#35a13e' }}>
                        {monthlyEarning > 0 ? fmtAmt(monthlyEarning) : ''}
                      </td>
                      <td className="py-3 px-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{p.participatedDate}</td>
                      <td className="py-3 px-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: 'rgba(53,161,62,0.12)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.25)' }}>
                          Active
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

  const topKpis = [
    { label: 'Family Revenue',   value: data.totalRevenue,   sub: 'All platforms combined', trend: '+18%', trendUp: true, color: '#f58311', Icon: I.Wallet   },
    { label: 'OxyLoans Total',   value: data.oxyloansTotal,  sub: 'Lending across family',  trend: '+12%', trendUp: true, color: '#2673bb', Icon: I.Bank     },
    { label: 'Offline Total',    value: data.offlineTotal,   sub: 'Offline payments',       trend: '+5%',  trendUp: true, color: '#f58311', Icon: I.Package  },
    { label: 'Properties Value', value: data.oxybricksTotal, sub: `${data.totalProperties} properties`, trend: null, trendUp: true, color: '#35a13e', Icon: I.Building },
    { label: 'Active Members',   value: String(data.totalMembers), sub: 'Approved family',  trend: null,   trendUp: true, color: '#e95330', Icon: I.Users    },
    { label: 'Total Deals',      value: String(data.totalDeals),   sub: 'Across all members', trend: null, trendUp: true, color: '#2673bb', Icon: I.BarChart },
  ];

  return (
    <div className="grid gap-6">
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topKpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>
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
            </tbody>
          </table>
        </div>
      </TableWrap>
    </div>
  );
}

// ─── Combined Analysis (mode C) ───────────────────────────────────────────────
function CombinedAnalysis({ fin, memberColor }) {
  const ol  = fin.oxyloans;
  const off = fin.offline;

  const parseAmt = (str) => {
    if (!str) return 0;
    const n = parseFloat(str.replace(/[₹,]/g, ''));
    return str.includes('L') ? n * 100000 : str.includes('K') ? n * 1000 : n;
  };
  const olTotal  = parseAmt(ol.totalEarned);
  const offTotal = parseAmt(off.totalPaid);
  const combined = olTotal + offTotal;
  const fmtL = (n) => `₹${(n / 100000).toFixed(1)}L`;

  const olPct  = combined > 0 ? Math.round((olTotal  / combined) * 100) : 50;
  const offPct = 100 - olPct;

  const kpis = [
    { label: 'OxyLoans Earned',   value: ol.totalEarned,     color: '#2673bb', Icon: I.Bank,     sub: `${ol.running} active deals`             },
    { label: 'Offline Collected', value: off.totalPaid,      color: '#f58311', Icon: I.Wallet,   sub: `${off.payments?.length ?? 0} payments`  },
    { label: 'Combined Total',    value: fmtL(combined),     color: memberColor, Icon: I.PieChart, sub: 'All platforms'                        },
    { label: 'Monthly Interest',  value: ol.monthlyInterest, color: '#35a13e', Icon: I.Percent,  sub: 'OxyLoans this month'                    },
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
          style={{ background: `${memberColor}12`, color: memberColor, border: `1px solid ${memberColor}22` }}>Mode C · All Platforms</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_160px_1fr]">
        <GlassPanel accent={memberColor}>
          <DualBarChart olData={ol.monthlyChart} offData={off.monthlyChart} memberColor={memberColor} />
        </GlassPanel>
        <GlassPanel accent={memberColor} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <MultiDonut segments={pieSegments} size={130} />
          <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: memberColor }}>Revenue Split</p>
        </GlassPanel>
        <GlassPanel accent={memberColor}>
          <DealStatusChart olDeals={ol.deals} offPayments={off.payments} memberColor={memberColor} />
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
            { label: 'OxyLoans', color: '#2673bb', value: ol.totalEarned },
            { label: 'Offline',  color: '#f58311', value: off.totalPaid  },
          ].map(p => (
            <div key={p.label} className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
              <span style={{ color: 'var(--text-muted)' }}>{p.label}</span>
              <span className="font-bold" style={{ color: p.color }}>{p.value}</span>
            </div>
          ))}
          <div className="ml-auto text-xs font-extrabold" style={{ color: memberColor }}>
            Total: {fmtL(combined)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Deal status grouped bar chart ───────────────────────────────────────────
function DealStatusChart({ olDeals, offPayments, memberColor }) {
  const [anim, setAnim] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnim(true), 500); return () => clearTimeout(t); }, []);

  const olActive  = olDeals.filter(d => d.status === 'Active').length;
  const olPending = olDeals.filter(d => d.status === 'Pending').length;
  const olClosed  = olDeals.filter(d => d.status === 'Closed').length;
  const offVerified = (offPayments ?? []).filter(p => p.status === 'Verified').length;
  const offPending  = (offPayments ?? []).filter(p => p.status === 'Pending').length;
  const offRejected = (offPayments ?? []).filter(p => p.status === 'Rejected').length;

  const groups = [
    { label: 'Active / Verified', ol: olActive,  off: offVerified, color: '#35a13e' },
    { label: 'Pending',           ol: olPending, off: offPending,  color: '#f58311' },
    { label: 'Closed / Rejected', ol: olClosed,  off: offRejected, color: '#2673bb' },
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
function MemberDashboard({ memberId, mode }) {
  const [fin, setFin]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const { user } = useAuth();
  const memberColor = MEMBER_COLORS[memberId] ?? '#2673bb';

  useEffect(() => {
    setFin(null);
    setLoading(true);
    getMemberFinancials(memberId)
      .then(d => { if (d) setFin(d); })
      .catch(() => {})
      .finally(() => setLoading(false));

    getUserProfile()
      .then(p => { if (p) setProfile(p); })
      .catch(() => {});
  }, [memberId]);

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
  const id =  memberId === 'self' ? user?.userId : memberId;

  const showOL   = mode === 'B' || mode === 'C';
  const showOff  = mode === 'A' || mode === 'C';
  const showBoth = mode === 'C';
  const isOwn = !fin || memberId === user?.userId || memberId === 'self';

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
      </div>

      {showBoth && <CombinedAnalysis fin={data} memberColor={memberColor} />}
      {showOL  && <><Divider /><OxyLoansSection  fin={data} memberColor={memberColor} /></>}
      {showOff && <><Divider /><OfflineSection   fin={data} memberColor={memberColor} /></>}

      {/* My Participations — compact table (up to 5) */}
      <Divider />
      {/* <CompactParticipationsSection /> */}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function UnifiedDashboard() {
  const { mode } = useMode();
  const { selectedMemberId, membersLoading, hasFamily, userId } = useFamily();

  if (membersLoading) return (
    <div className="flex items-center justify-center gap-3 py-20">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#2673bb', borderTopColor: 'transparent' }} />
      <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading dashboard…</span>
    </div>
  );

  if (!hasFamily) {
    return (
      <div className="grid gap-6">
        <ProfileWarningBanner />
        <MemberDashboard memberId={selectedMemberId === 'self' ? userId : selectedMemberId} mode={mode} isSelf />
      </div>
    );
  }

  if (!selectedMemberId || selectedMemberId === 'self') return (
    <div className="grid gap-6">
      <ProfileWarningBanner />
      <FamilyOverview />
    </div>
  );

  return (
    <div className="grid gap-6">
      <ProfileWarningBanner />
      <MemberDashboard memberId={selectedMemberId} mode={mode} />
    </div>
  );
}
