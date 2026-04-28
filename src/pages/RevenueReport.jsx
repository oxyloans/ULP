import { useState, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';
import { getMemberFinancials, getFamilyAggregate } from '../api/afterlogin-user';

const MEMBER_COLORS = { 'FM-001': '#6366f1', 'FM-002': '#ec4899', 'FM-003': '#10b981' };
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const I = {
  Bank:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>,
  Package:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Building: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  PieChart: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  Users:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  TrendUp:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
};

const fmt = (n) => {
  if (!n && n !== 0) return '₹0';
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${(n / 1000).toFixed(0)}K`;
};

function AnimBar({ pct, color, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 300 + delay); return () => clearTimeout(t); }, [pct]);
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bar-track)' }}>
      <div className="h-full rounded-full"
        style={{ width: `${w}%`, background: `linear-gradient(90deg,${color},${color}88)`, transition: `width 1.1s cubic-bezier(0.34,1.56,0.64,1)` }} />
    </div>
  );
}

function MonthlyChart({ data, color }) {
  const [heights, setHeights] = useState(data.map(() => 0));
  const max = Math.max(...data) || 1;
  useEffect(() => {
    setHeights(data.map(() => 0));
    const timers = data.map((v, i) =>
      setTimeout(() => setHeights(prev => { const n = [...prev]; n[i] = (v / max) * 100; return n; }), i * 55)
    );
    return () => timers.forEach(clearTimeout);
  }, [data.join(',')]);
  return (
    <div className="flex items-end gap-1.5" style={{ height: 80 }}>
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
          <div className="relative w-full flex flex-col justify-end" style={{ height: 68 }}>
            <div className="w-full rounded-t-md"
              style={{ height: `${heights[i]}%`, transition: 'height 0.65s cubic-bezier(0.34,1.56,0.64,1)', background: i === data.length - 1 ? `linear-gradient(180deg,${color}cc,${color})` : `${color}30` }} />
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: 8 }}>{MONTHS[i].slice(0,3)}</span>
        </div>
      ))}
    </div>
  );
}

function MemberRevenue({ fin, color, loading = false }) {
  if (!fin) return null;
  const platforms = [
    { label: 'OxyLoans',  Icon: I.Bank,     color: '#6366f1', value: fin.revenue?.oxyloans  ?? 0, pct: 0 },
    { label: 'Offline',   Icon: I.Package,  color: '#f59e0b', value: fin.revenue?.offline   ?? 0, pct: 0 },
    { label: 'OxyBricks', Icon: I.Building, color: '#10b981', value: fin.revenue?.oxybricks ?? 0, pct: 0 },
  ];
  const total = fin.revenue?.total ?? 0;
  platforms.forEach(p => { p.pct = total > 0 ? Math.round((p.value / total) * 100) : 0; });

  return (
    <div className="grid gap-5">
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg,${color}10 0%,var(--card-bg) 100%)`, border: `1px solid ${color}22` }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black"
                style={{ background: `linear-gradient(135deg,${color},${color}88)`, color: '#fff' }}>
                {(fin.name || '?').charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {fin.name}{loading && <span className="ml-2 text-xs font-normal animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading…</span>}
                </p>
                <p className="text-xs font-mono font-bold" style={{ color }}>{fin.lrId}</p>
              </div>
            </div>
            <p className="text-xs uppercase tracking-widest font-semibold mt-2" style={{ color }}>Total Revenue</p>
            <p className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{fmt(total)}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {platforms.map(p => (
              <div key={p.label} className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl"
                style={{ background: `${p.color}0e`, border: `1px solid ${p.color}20` }}>
                <span style={{ color: p.color }}><p.Icon /></span>
                <p className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>{fmt(p.value)}</p>
                <p className="text-xs font-semibold" style={{ color: p.color }}>{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: `linear-gradient(135deg,${color}08 0%,var(--card-bg) 100%)`, border: `1px solid ${color}18` }}>
          <p className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color }}>Platform Contribution</p>
          <div className="grid gap-4">
            {platforms.map((p, i) => (
              <div key={p.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${p.color}14`, color: p.color, border: `1px solid ${p.color}25` }}><p.Icon /></div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: p.color }}>{fmt(p.value)}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${p.color}12`, color: p.color, border: `1px solid ${p.color}20` }}>{p.pct}%</span>
                  </div>
                </div>
                <AnimBar pct={p.pct} color={p.color} delay={i * 120} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: `linear-gradient(135deg,${color}08 0%,var(--card-bg) 100%)`, border: `1px solid ${color}18` }}>
          <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color }}>Monthly Trend</p>
          <MonthlyChart data={fin.oxyloans?.monthlyChart ?? [0,0,0,0,0,0,0,0,0,0,0,0]} color={color} />
        </div>
      </div>
    </div>
  );
}

function FamilyRevenue({ agg }) {
  const data = agg ?? { totalRevenue: '₹0', oxyloansTotal: '₹0', offlineTotal: '₹0', oxybricksTotal: '₹0', totalMembers: 0, totalDeals: 0, memberBreakdown: [] };
  return (
    <div className="grid gap-5">
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.1) 0%,var(--card-bg) 100%)', border: '1px solid rgba(245,158,11,0.22)' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}><I.Users /></div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Family Portfolio</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{data.totalMembers} approved members</p>
              </div>
            </div>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#f59e0b' }}>Combined Revenue</p>
            <p className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{data.totalRevenue}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'OxyLoans',  value: data.oxyloansTotal,  color: '#6366f1', Icon: I.Bank     },
              { label: 'Offline',   value: data.offlineTotal,   color: '#f59e0b', Icon: I.Package  },
              { label: 'OxyBricks', value: data.oxybricksTotal, color: '#10b981', Icon: I.Building },
            ].map(p => (
              <div key={p.label} className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl" style={{ background: `${p.color}0e`, border: `1px solid ${p.color}20` }}>
                <span style={{ color: p.color }}><p.Icon /></span>
                <p className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>{p.value}</p>
                <p className="text-xs font-semibold" style={{ color: p.color }}>{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(data.memberBreakdown?.length ?? 0) > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface-card)', border: '1px solid rgba(245,158,11,0.18)' }}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(245,158,11,0.04)' }}>
            <I.Users /><h3 className="text-sm font-bold ml-1" style={{ color: 'var(--text-primary)' }}>Member Revenue Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--input-bg)' }}>
                  {['Member','LR ID','Role','OxyLoans','Offline','OxyBricks','Total','Share'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.memberBreakdown.map((m, i) => {
                  const mc = MEMBER_COLORS[m.id] ?? '#6366f1';
                  const totalNum = parseFloat((m.revenue ?? '0').replace('₹','').replace('L',''));
                  const familyTotal = parseFloat((data.totalRevenue ?? '1').replace('₹','').replace('L',''));
                  const pct = familyTotal > 0 ? Math.round((totalNum / familyTotal) * 100) : 0;
                  return (
                    <tr key={m.id ?? i} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: `${mc}18`, color: mc, border: `1px solid ${mc}28` }}>{(m.name || '?').charAt(0)}</div>
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{m.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4"><span className="font-mono text-xs px-2 py-0.5 rounded-lg" style={{ background: `${mc}12`, color: mc, border: `1px solid ${mc}20` }}>{m.lrId}</span></td>
                      <td className="py-3.5 px-4"><span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${mc}10`, color: mc, border: `1px solid ${mc}18` }}>{m.role}</span></td>
                      <td className="py-3.5 px-4 font-semibold" style={{ color: '#818cf8' }}>{m.oxyloans ?? '₹0'}</td>
                      <td className="py-3.5 px-4 font-semibold" style={{ color: '#f59e0b' }}>{m.offline ?? '₹0'}</td>
                      <td className="py-3.5 px-4 font-semibold" style={{ color: '#10b981' }}>{m.properties?.value ?? '₹0'}</td>
                      <td className="py-3.5 px-4 font-extrabold text-sm" style={{ color: mc }}>{m.revenue ?? '₹0'}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bar-track)', minWidth: 60 }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: mc, transition: 'width 1s ease' }} />
                          </div>
                          <span className="text-xs font-bold" style={{ color: mc }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RevenueReport() {
  const { selectedMemberId, approvedMembers } = useFamily();
  const [tab, setTab]           = useState(selectedMemberId ?? 'family');
  const [memberData, setMemberData] = useState({});
  const [familyData, setFamilyData] = useState(null);
  const [loadingTab, setLoadingTab] = useState(false);

  useEffect(() => { setTab(selectedMemberId ?? 'family'); }, [selectedMemberId]);

  useEffect(() => {
    getFamilyAggregate().then(d => { if (d) setFamilyData(d); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === 'family' || memberData[tab]) return;
    setLoadingTab(true);
    getMemberFinancials(tab)
      .then(d => { if (d) setMemberData(prev => ({ ...prev, [tab]: d })); })
      .catch(() => {})
      .finally(() => setLoadingTab(false));
  }, [tab]);

  const emptyFin = (id) => ({ name: '—', lrId: id, role: '—', revenue: { oxyloans: 0, offline: 0, oxybricks: 0, total: 0 }, oxyloans: { monthlyChart: [0,0,0,0,0,0,0,0,0,0,0,0] } });

  const tabs = [
    { id: 'family', label: 'Family', color: '#f59e0b' },
    ...approvedMembers.map(m => ({ id: m.id, label: m.name?.split(' ')[0] ?? m.id, color: MEMBER_COLORS[m.id] ?? '#6366f1' })),
  ];
  const activeFin   = tab !== 'family' ? (memberData[tab] ?? emptyFin(tab)) : null;
  const activeColor = tab !== 'family' ? (MEMBER_COLORS[tab] ?? '#6366f1') : '#f59e0b';

  return (
    <div className="grid gap-6">
      {/* Coming Soon Banner */}
      <div className="rounded-2xl px-5 py-4 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(99,102,241,0.06))', border: '1px solid rgba(99,102,241,0.3)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold" style={{ color: '#818cf8' }}>Coming Soon</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Revenue analytics are under development. Data shown below may be incomplete.</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
          style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
          Coming Soon
        </span>
      </div>

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8' }}>
            <I.PieChart />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#6366f1' }}>Analytics</p>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Revenue Report</h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span className="live-dot" style={{ width: 6, height: 6 }} />
          <span className="font-semibold">FY 2025</span>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: tab === t.id ? `${t.color}18` : 'var(--input-bg)',
              border: `1px solid ${tab === t.id ? t.color + '35' : 'var(--border)'}`,
              color: tab === t.id ? t.color : 'var(--text-muted)',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'family'
        ? <FamilyRevenue agg={familyData} />
        : loadingTab && !memberData[tab]
          ? <MemberRevenue fin={emptyFin(tab)} color={activeColor} loading />
          : <MemberRevenue fin={activeFin} color={activeColor} />
      }
    </div>
  );
}
