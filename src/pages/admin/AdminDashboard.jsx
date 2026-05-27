import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPlatformStats, getAdminDeals, getPendingApprovals, getAllUsers, getAdminOfflinePayments, getAdminOxyLoansDeals, getAdminProperties } from "../../api/afterlogin-admin";
import { formatINR } from "../../utils/currency";


const I = {
  Users:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Bank:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>,
  Package:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Building: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  TrendUp:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Clock:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Check:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>,
  Activity: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Rupee:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M6 3h12M6 8h12M6 13l8 8M6 8a4 4 0 0 0 0 8h2"/></svg>,
  Shield:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Eye:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  BarChart: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  SDLot:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
  Plus:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Percent:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
  Edit:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function MiniBar({ data, color }) {
  const [heights, setHeights] = useState(data.map(() => 0));
  const max = Math.max(...data);
  useEffect(() => {
    const timers = data.map((v, i) =>
      setTimeout(() => setHeights(prev => { const n = [...prev]; n[i] = (v / max) * 100; return n; }), i * 40)
    );
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <div className="flex items-end gap-0.5" style={{ height: 36 }}>
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-t"
          style={{
            height: `${heights[i]}%`,
            background: i === data.length - 1 ? color : `${color}35`,
            transition: `height 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 40}ms`,
            boxShadow: i === data.length - 1 ? `0 0 6px ${color}55` : 'none',
          }} />
      ))}
    </div>
  );
}

function KpiCard({ label, value, sub, trend, color, Icon, chart }) {
  return (
    <div className="relative rounded-2xl p-5 overflow-hidden cursor-default"
      style={{
        background: `linear-gradient(135deg,${color}0e 0%,rgba(255,255,255,0.01) 100%)`,
        border: `1px solid ${color}22`,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        boxShadow: `0 2px 16px rgba(0,0,0,0.12),inset 0 1px 0 ${color}12`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 24px rgba(0,0,0,0.15),0 0 16px ${color}18,inset 0 1px 0 ${color}18`; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 2px 16px rgba(0,0,0,0.12),inset 0 1px 0 ${color}12`; }}
    >
      <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle,${color}18 0%,transparent 70%)`, filter: 'blur(14px)' }} />
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg,transparent,${color}30,transparent)` }} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${color}14`, border: `1px solid ${color}25`, color }}>
            <Icon />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
              <I.TrendUp /><span>{trend}</span>
            </div>
          )}
        </div>
        <p className="text-2xl font-extrabold tracking-tight mb-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{label}</p>
        {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
        {chart && <div className="mt-3"><MiniBar data={chart} color={color} /></div>}
      </div>
    </div>
  );
}

function Chip({ status }) {
  const map = {
    Active:    { bg: 'rgba(16,185,129,0.1)',  color: '#34d399', border: 'rgba(16,185,129,0.2)'  },
    Approved:  { bg: 'rgba(16,185,129,0.1)',  color: '#34d399', border: 'rgba(16,185,129,0.2)'  },
    Verified:  { bg: 'rgba(16,185,129,0.1)',  color: '#34d399', border: 'rgba(16,185,129,0.2)'  },
    Pending:   { bg: 'rgba(251,146,60,0.1)',  color: '#fb923c', border: 'rgba(251,146,60,0.2)'  },
    Closed:    { bg: 'rgba(99,102,241,0.1)',  color: '#818cf8', border: 'rgba(99,102,241,0.2)'  },
    Rejected:  { bg: 'rgba(239,68,68,0.1)',   color: '#f87171', border: 'rgba(239,68,68,0.2)'   },
    Available: { bg: 'rgba(16,185,129,0.1)',  color: '#34d399', border: 'rgba(16,185,129,0.2)'  },
    Sold:      { bg: 'rgba(100,116,139,0.1)', color: '#94a3b8', border: 'rgba(100,116,139,0.2)' },
    Reserved:  { bg: 'rgba(251,146,60,0.1)',  color: '#fb923c', border: 'rgba(251,146,60,0.2)'  },
  };
  const s = map[status] ?? map.Pending;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {status}
    </span>
  );
}

function TableCard({ children, accent = '#a855f7' }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--table-bg)', border: `1px solid ${accent}18`, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      {children}
    </div>
  );
}

function TableHead({ cols, accent = '#a855f7' }) {
  return (
    <thead>
      <tr style={{ borderBottom: `1px solid ${accent}15`, background: `${accent}05` }}>
        {cols.map(h => (
          <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
        ))}
      </tr>
    </thead>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [users,       setUsers]       = useState([]);
  const [deals,       setDeals]       = useState([]);
  const [testDeal,    setTestDeal]    = useState([]);
  const [pending,     setPending]     = useState([]);
  const [offPay,      setOffPay]      = useState([]);
  const [olDeals,     setOlDeals]     = useState([]);
  const [props,       setProps]       = useState([]);
  const [propSummary, setPropSummary] = useState({ total: 0, plots: { count: 0 }, flats: { count: 0 }, acres: { count: 0 }, villas: { count: 0 } });

  useEffect(() => {
    getAllUsers().then(d => { if (Array.isArray(d)) setUsers(d); }).catch(() => {});
    getAdminDeals().then(d => { if (Array.isArray(d)) setDeals(d); }).catch(() => {});
    getAdminDeals("TEST").then(d=> { if (Array.isArray(d)) setTestDeal(d); }).catch(()=>{});
    getPendingApprovals().then(d => { if (Array.isArray(d)) setPending(d); }).catch(() => {});
    getAdminOfflinePayments().then(d => { if (Array.isArray(d)) setOffPay(d); }).catch(() => {});
    getAdminOxyLoansDeals().then(d => { if (Array.isArray(d)) setOlDeals(d); }).catch(() => {});
    getAdminProperties().then(d => {
      if (d?.properties) setProps(d.properties);
      if (d?.summary)    setPropSummary(d.summary);
    }).catch(() => {});
  }, []);

  

  const approvedMembers = users.filter(m => m.status === 'Approved');
  const pendingMembers  = users.filter(m => m.status === 'Pending');
  const activeDeals     = olDeals.filter(d => d.status === 'Active');
  const closedDeals     = olDeals.filter(d => d.status === 'Closed');
  const verifiedPay     = offPay.filter(p => p.status === 'Verified');
  const pendingPay      = offPay.filter(p => p.status === 'Pending');

  const openLots    = deals.filter(l => l.dealStatus !== 'ACHIEVED');
  const closedLots  = deals.filter(l => l.dealStatus === 'ACHIEVED');
  const totalRaised = 0; // not in API response
  const fmtINR = (n) => formatINR(n ?? 0);

  const olChart   = [0,0,0,0,0,0,0,0,0,0,0, olDeals.length];
  const offChart  = [0,0,0,0,0,0,0,0,0,0,0, offPay.length];
  const userChart = [0,0,0,0,0,0,0,0,0,0,0, approvedMembers.length];
  const sdChart   = deals.map(() => 0);

  return (
    <div className="grid gap-7">

      {/* ── Hero header ── */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,rgba(168,85,247,0.12) 0%,rgba(99,102,241,0.06) 50%,rgba(16,185,129,0.04) 100%)',
          border: '1px solid rgba(168,85,247,0.2)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 4px 32px rgba(168,85,247,0.1)',
        }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(168,85,247,0.15) 0%,transparent 70%)', filter: 'blur(24px)' }} />
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(168,85,247,0.4),transparent)' }} />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7' }}>
                <I.Shield />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a855f7' }}>Admin Control Panel</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Platform Overview</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              OxyLoans · OxyBricks · Offline Payments · Family Management
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: 'Pending Approvals', value: pending.length,         color: '#f59e0b' },
              { label: 'Active Deals',      value: activeDeals.length,     color: '#10b981' },
              { label: 'Total Members',     value: approvedMembers.length, color: '#a855f7' },
            ].map(s => (
              <div key={s.label} className="text-center px-4 py-2.5 rounded-xl"
                style={{ background: `${s.color}0e`, border: `1px solid ${s.color}22` }}>
                <p className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-full"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <span className="live-dot" style={{ width: 6, height: 6 }} />
              <span className="text-xs font-semibold" style={{ color: '#10b981' }}>Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Platform KPI cards ── */}
      <div>
        <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>Platform Metrics</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Total Members"    value={String(approvedMembers.length)} sub={`${pendingMembers.length} pending approval`}  trend="+3 this month" color="#a855f7" Icon={I.Users}    chart={userChart} />
          <KpiCard label="OxyLoans Active"  value={String(activeDeals.length)}     sub={`${closedDeals.length} closed deals`}          trend="+12%"          color="#6366f1" Icon={I.Bank}     chart={olChart}   />
          <KpiCard label="Offline Payments" value={String(verifiedPay.length)}     sub={`${pendingPay.length} pending review`}         trend="+5%"           color="#f59e0b" Icon={I.Package}  chart={offChart}  />
          <KpiCard label="SD Lots Open"     value={String(openLots.length)}        sub={`${fmtINR(totalRaised)} raised total`}         trend="+2 this month" color="#10b981" Icon={I.SDLot}    chart={sdChart}   />
        </div>
      </div>

      {/* ── SD Lot Running Deals ── */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>SD Lot Deals</p>
          </div>
          <button
            onClick={() => navigate('/admin/create-deal')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4338ca)', color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
            <I.Plus /> Create New Deal
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {deals.map(lot => {
            const isOpen = lot.dealStatus !== 'ACHIEVED';
            return (
              <div key={lot.id ?? lot.dealName} className="rounded-2xl p-4 flex flex-col gap-3"
                style={{
                  background: 'var(--surface-card)',
                  border: `1px solid ${isOpen ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.15)'}`,
                  boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                  opacity: isOpen ? 1 : 0.75,
                }}>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                        {lot.dealSubType ?? lot.dealType}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ background: isOpen ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)', color: isOpen ? '#10b981' : '#94a3b8', border: `1px solid ${isOpen ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.2)'}` }}>
                        {isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <p className="text-sm font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>{lot.dealName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-black" style={{ color: '#10b981' }}>{lot.monthlyInterest}%</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Monthly</p>
                  </div>
                </div>

                {/* Deal fields grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Deal Amount', value: fmtINR(lot.dealAmount),          color: '#6366f1' },
                    { label: 'Duration',    value: `${lot.duration ?? '—'} months`,  color: '#818cf8' },
                    { label: 'Min',         value: fmtINR(lot.minimumParticipation), color: '#f59e0b' },
                    { label: 'Max',         value: fmtINR(lot.maxParticipation),     color: '#f59e0b' },
                  ].map(f => (
                    <div key={f.label} className="rounded-lg px-2.5 py-2"
                      style={{ background: `${f.color}08`, border: `1px solid ${f.color}15` }}>
                      <p className="text-xs" style={{ color: 'var(--text-muted)', fontSize: 9 }}>{f.label}</p>
                      <p className="text-xs font-extrabold mt-0.5" style={{ color: f.color, fontFamily: "'JetBrains Mono', monospace" }}>{f.value}</p>
                    </div>
                  ))}
                </div>

                {/* Dates + Edit */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>
                      {lot.globalDealType}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Active: {lot.loanActiveDate ?? '—'}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/create-deal/${lot.id}`)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                    style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
                    <I.Edit /> Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2-col: Pending approvals + Recent activity ── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Pending approvals */}
        <TableCard accent="#f59e0b">
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(245,158,11,0.12)', background: 'rgba(245,158,11,0.04)' }}>
            <div className="flex items-center gap-2">
              <I.Clock />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Pending Approvals</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
              {pending.length} pending
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(245,158,11,0.08)' }}>
            {pending.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors"
                onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                  {r.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{r.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-bold" style={{ color: '#f59e0b' }}>{r.lrId}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {r.submittedOn}</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <I.Check />
                  </button>
                  <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <div className="py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>All caught up!</div>
            )}
          </div>
        </TableCard>

        {/* Approved members */}
        <TableCard accent="#a855f7">
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(168,85,247,0.12)', background: 'rgba(168,85,247,0.04)' }}>
            <div className="flex items-center gap-2">
              <I.Users />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Approved Members</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold"
              style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.25)' }}>
              {approvedMembers.length} active
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <TableHead cols={['Member', 'LR ID', 'Role', 'Status']} accent="#a855f7" />
              <tbody>
                {approvedMembers.map(m => (
                  <tr key={m.id} className="transition-colors" style={{ borderBottom: '1px solid rgba(168,85,247,0.06)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)' }}>
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{m.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><span className="font-mono text-xs font-bold" style={{ color: '#a855f7' }}>{m.lrId}</span></td>
                    <td className="py-3 px-4"><span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.18)' }}>{m.role}</span></td>
                    <td className="py-3 px-4"><Chip status={m.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TableCard>
      </div>

      {/* ── OxyLoans deals ── */}
      <TableCard accent="#6366f1">
        <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3"
          style={{ borderBottom: '1px solid rgba(99,102,241,0.12)', background: 'rgba(99,102,241,0.04)' }}>
          <div className="flex items-center gap-2">
            <I.Bank />
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>OxyLoans — All Deals</h3>
          </div>
          <div className="flex gap-2">
            {[{ l: 'Active', c: activeDeals.length, col: '#10b981' }, { l: 'Pending', c: olDeals.filter(d=>d.status==='Pending').length, col: '#f59e0b' }, { l: 'Closed', c: closedDeals.length, col: '#818cf8' }].map(b => (
              <span key={b.l} className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: `${b.col}12`, color: b.col, border: `1px solid ${b.col}25` }}>{b.l} · {b.c}</span>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <TableHead cols={['Deal ID','Borrower','Lender','Amount','Rate','Due Date','Status']} accent="#6366f1" />
            <tbody>
              {olDeals.map(d => (
                <tr key={d.id} className="transition-colors" style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="py-3.5 px-4"><span className="font-mono text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>{d.id}</span></td>
                  <td className="py-3.5 px-4 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{d.borrower}</td>
                  <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{d.lender}</td>
                  <td className="py-3.5 px-4 font-bold" style={{ color: 'var(--text-primary)' }}>{d.amount}</td>
                  <td className="py-3.5 px-4"><span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>{d.rate}</span></td>
                  <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{d.due}</td>
                  <td className="py-3.5 px-4"><Chip status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableCard>

      {/* ── 2-col: Offline payments + Properties ── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Offline */}
        <TableCard accent="#f59e0b">
          <div className="px-5 py-4 flex items-center gap-2"
            style={{ borderBottom: '1px solid rgba(245,158,11,0.12)', background: 'rgba(245,158,11,0.04)' }}>
            <I.Package />
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Offline Payments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <TableHead cols={['Ref','Name','Mode','Amount','Status']} accent="#f59e0b" />
              <tbody>
                {offPay.map(p => (
                  <tr key={p.ref} className="transition-colors" style={{ borderBottom: '1px solid rgba(245,158,11,0.06)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="py-3 px-4 font-mono text-xs font-bold" style={{ color: '#f59e0b' }}>{p.ref}</td>
                    <td className="py-3 px-4 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{p.name}</td>
                    <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{p.type}</td>
                    <td className="py-3 px-4 font-bold" style={{ color: 'var(--text-primary)' }}>{p.amount}</td>
                    <td className="py-3 px-4"><Chip status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TableCard>

        {/* Properties */}
        <TableCard accent="#10b981">
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(16,185,129,0.12)', background: 'rgba(16,185,129,0.04)' }}>
            <div className="flex items-center gap-2">
              <I.Building />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>OxyBricks Properties</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
              {propSummary.total} total
            </span>
          </div>
          {/* Summary row */}
          <div className="grid grid-cols-4 px-5 py-3" style={{ borderBottom: '1px solid rgba(16,185,129,0.08)' }}>
            {[
              { label: 'Plots',  count: propSummary.plots?.count  ?? 0, color: '#6366f1' },
              { label: 'Flats',  count: propSummary.flats?.count  ?? 0, color: '#10b981' },
              { label: 'Acres',  count: propSummary.acres?.count  ?? 0, color: '#f59e0b' },
              { label: 'Villas', count: propSummary.villas?.count ?? 0, color: '#ec4899' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-extrabold" style={{ color: s.color }}>{s.count}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <TableHead cols={['Property','Type','Location','Value','Status']} accent="#10b981" />
              <tbody>
                {props.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>No properties found</td></tr>
                ) : props.map(p => {
                  const tc = { Plot: '#6366f1', Flat: '#10b981', Acre: '#f59e0b', Villa: '#ec4899' };
                  return (
                    <tr key={p.id} className="transition-colors" style={{ borderBottom: '1px solid rgba(16,185,129,0.06)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="py-3 px-4">
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                        <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{p.id}</p>
                      </td>
                      <td className="py-3 px-4"><span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${tc[p.type] ?? '#6366f1'}12`, color: tc[p.type] ?? '#6366f1', border: `1px solid ${tc[p.type] ?? '#6366f1'}20` }}>{p.type}</span></td>
                      <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{p.location}</td>
                      <td className="py-3 px-4 font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{p.value}</td>
                      <td className="py-3 px-4"><Chip status={p.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TableCard>
      </div>

    </div>
  );
}
