import { useState, useEffect } from 'react';
import { getAdminDeals } from '../../api/afterlogin-admin';

// ─── Icons ────────────────────────────────────────────────────────────────────
const RefreshIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const ActivityIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;

function fmtINR(n) {
  if (!n && n !== 0) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

const PAYOUT_LABELS = {
  MONTHLY: 'Monthly', QUARTELY: 'Quarterly', HALFLY: 'Half-Yearly',
  YEARLY: 'Yearly', ENDOFTHEDEAL: 'End of Deal',
};

export default function AdminOffline() {
  const [deals, setDeals]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('NORMAL');

  const load = () => {
    setLoading(true); setError('');
    getAdminDeals(typeFilter)
      .then(data => setDeals(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message ?? 'Failed to load deals'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [typeFilter]);

  // KPI calculations
  const totalDeals      = deals.length;
  const activeDeals     = deals.filter(d => d.dealStatus !== 'ACHIEVED' && d.dealStatus !== 'CLOSED').length;
  const closedDeals     = deals.filter(d => d.dealStatus === 'ACHIEVED' || d.dealStatus === 'CLOSED').length;
  const totalInvested   = deals.reduce((s, d) => s + (d.dealParticipationValue ?? 0), 0);
  const totalDealAmount = deals.reduce((s, d) => s + (d.dealAmount ?? 0), 0);

  // Filter
  const filtered = deals.filter(d => {
    const matchSearch = !search || d.dealName?.toLowerCase().includes(search.toLowerCase());
    const status = d.dealStatus === 'ACHIEVED' || d.dealStatus === 'CLOSED' ? 'Closed' : 'Active';
    const matchStatus = statusFilter === 'All' || status === statusFilter;
    return matchSearch && matchStatus;
  });

  const kpis = [
    { label: 'Total Deals',    value: String(totalDeals),       color: '#f59e0b', sub: 'All deals'              },
    { label: 'Active Deals',   value: String(activeDeals),      color: '#10b981', sub: 'Currently running'      },
    { label: 'Closed Deals',   value: String(closedDeals),      color: '#6366f1', sub: 'Achieved / Closed'      },
    { label: 'Total Invested', value: fmtINR(totalInvested),    color: '#3b82f6', sub: 'Across all deals'       },
    { label: 'Total Deal Size',value: fmtINR(totalDealAmount),  color: '#8b5cf6', sub: 'Combined deal amounts'  },
  ];

  return (
    <div className="grid gap-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>SD Lot Deals</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>All active and closed participation deals</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          <RefreshIcon /> Refresh
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="rounded-xl px-4 py-3"
            style={{ background: `${k.color}0a`, border: `1px solid ${k.color}20` }}>
            <p className="text-xl font-extrabold" style={{ color: k.color, fontFamily: "'JetBrains Mono', monospace" }}>{k.value}</p>
            <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{k.label}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search deal name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded-xl text-sm outline-none"
          style={{ padding: '9px 14px', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', minWidth: 220 }}
        />
        <div className="flex gap-1 p-0.5 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
          {['All', 'Active', 'Closed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: statusFilter === s ? (s === 'Active' ? '#10b981' : s === 'Closed' ? '#6366f1' : '#f59e0b') : 'transparent',
                color: statusFilter === s ? '#fff' : 'var(--text-muted)',
              }}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-0.5 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
          {['Normal', 'Test'].map(s => (
            <button key={s} onClick={() => setTypeFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: typeFilter === s ? (s === 'Normal' ? '#10b981' : s === 'Test' ? '#6366f1' : '#f59e0b') : 'transparent',
                color: typeFilter === s ? '#fff' : 'var(--text-muted)',
              }}>
              {s}
            </button>
          ))}
        </div>
        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
          {filtered.length} deal{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-16 rounded-2xl"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#f59e0b', borderTopColor: 'transparent' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading deals…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="py-10 text-center rounded-2xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-bold" style={{ color: '#ef4444' }}>{error}</p>
          <button onClick={load} className="mt-3 px-4 py-2 rounded-xl text-xs font-bold"
            style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div className="px-5 py-4 flex items-center gap-2"
            style={{ borderBottom: '1px solid var(--border)', background: 'rgba(245,158,11,0.04)' }}>
            <ActivityIcon />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>All Deals</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--input-bg)' }}>
                  {['#', 'Deal Name', 'Type', 'Deal Amount', 'Invested', 'Remaining', 'Fill %', 'Duration', 'Payout Options', 'Status'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No deals found</td></tr>
                ) : filtered.map((d, idx) => {
                  const isActive   = d.dealStatus !== 'ACHIEVED' && d.dealStatus !== 'CLOSED';
                  const invested   = d.dealParticipationValue ?? 0;
                  const total      = d.dealAmount ?? 0;
                  const remaining  = d.remainingDealValue ?? Math.max(0, total - invested);
                  const fillPct    = total > 0 ? Math.min(Math.round((invested / total) * 100), 100) : 0;

                  // Collect available payout options
                  const payouts = [
                    d.monthlyInterest      > 0 && `${d.monthlyInterest}% M`,
                    d.quartelyInterest     > 0 && `${d.quartelyInterest}% Q`,
                    d.halfInterest         > 0 && `${d.halfInterest}% H`,
                    d.yearlyInterest       > 0 && `${d.yearlyInterest}% Y`,
                    d.endofthedealInterest > 0 && `${d.endofthedealInterest}% EOD`,
                  ].filter(Boolean);

                  return (
                    <tr key={d.id ?? idx} className="transition-colors"
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                      <td className="py-3.5 px-4 font-bold text-xs" style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{d.dealName}</p>
                        <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>{String(d.id ?? '').slice(0, 8)}…</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}>
                          {d.dealType ?? '—'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                        {fmtINR(total)}
                      </td>

                      <td className="py-3.5 px-4 font-bold tabular-nums" style={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>
                        {fmtINR(invested)}
                      </td>

                      <td className="py-3.5 px-4 font-bold tabular-nums" style={{ color: remaining <= 0 ? '#ef4444' : '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>
                        {remaining <= 0 ? 'Full' : fmtINR(remaining)}
                      </td>

                      <td className="py-3.5 px-4" style={{ minWidth: 100 }}>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                            <div className="h-full rounded-full transition-all"
                              style={{ width: `${fillPct}%`, background: fillPct >= 100 ? '#ef4444' : fillPct >= 80 ? '#f59e0b' : '#10b981' }} />
                          </div>
                          <span className="text-xs font-bold tabular-nums" style={{ color: fillPct >= 100 ? '#ef4444' : 'var(--text-primary)' }}>{fillPct}%</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {d.duration ? `${d.duration} mo` : '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {payouts.length > 0
                            ? payouts.map(p => (
                                <span key={p} className="text-xs px-1.5 py-0.5 rounded font-semibold"
                                  style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                                  {p}
                                </span>
                              ))
                            : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                          }
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                          style={isActive
                            ? { background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }
                            : { background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.25)' }}>
                          {isActive ? '● Active' : '✓ Closed'}
                        </span>
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
