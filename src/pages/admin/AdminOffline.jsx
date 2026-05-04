import { useState, useEffect } from 'react';
import { getRunningClosedDeals, getDealParticipants, getAdminDeals } from '../../api/afterlogin-admin';

// ─── Icons ────────────────────────────────────────────────────────────────────
const RefreshIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const ChevronDown  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="6 9 12 15 18 9"/></svg>;
const UsersIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const BankIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>;
const SpinnerIcon  = () => <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }} />;
const CloseIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const SearchIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;


function fmtINR(n) {
  if (!n && n !== 0) return '—';
  const abs = Math.abs(n);
  if (abs >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.?0+$/, '')}Cr`;
  if (abs >= 100000)   return `₹${(n / 100000).toFixed(2).replace(/\.?0+$/, '')}L`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

const TABS = [
  { key: 'NORMAL', label: 'Running', color: '#10b981' },
  { key: 'closed',  label: 'Closed',  color: '#6366f1' },
  { key: 'TEST',    label: 'Test',    color: '#f59e0b' },
];

// ─── Participants panel (lazy-loaded per deal) ────────────────────────────────
function ParticipantsPanel({ dealId }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    setLoading(true); setError('');
    getDealParticipants(dealId)
      .then(res => setData(res))
      .catch(e => setError(e.message ?? 'Failed to load participants'))
      .finally(() => setLoading(false));
  }, [dealId]);

  if (loading) return (
    <div className="flex items-center gap-2 py-6 px-6">
      <SpinnerIcon />
      <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Loading participants…</span>
    </div>
  );

  if (error) return (
    <div className="py-4 px-6 text-xs font-semibold" style={{ color: '#ef4444' }}>{error}</div>
  );

  const participants = data?.investoresParticipationDetails ?? [];
  const totalAmt     = data?.totalParticipationByInvestores ?? 0;

  return (
    <div className="px-5 py-4" style={{ background: 'rgba(168,85,247,0.03)', borderTop: '1px solid var(--border)' }}>
      {/* Summary row */}
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <UsersIcon />
          <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
            {participants.length} Participant{participants.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Total Participation:</span>
          <span className="text-xs font-black" style={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>{fmtINR(totalAmt)}</span>
        </div>
      </div>

      {participants.length === 0 ? (
        <p className="text-xs py-3 text-center" style={{ color: 'var(--text-muted)' }}>No participants yet</p>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'var(--input-bg)', borderBottom: '1px solid var(--border)' }}>
                {['#', 'Investor Name', 'Amount', 'ROI', 'Payout', 'Duration', 'Bank A/C', 'IFSC'].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: 'var(--text-muted)', fontSize: 10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {participants.map((p, i) => (
                <tr key={p.userId ?? i}
                  style={{ borderBottom: i < participants.length - 1 ? '1px solid var(--border)' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="py-2.5 px-3 font-bold" style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td className="py-2.5 px-3">
                    <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{p.userName ?? '—'}</p>
                    <p className="font-mono mt-0.5" style={{ color: 'var(--text-muted)', fontSize: 9 }}>{String(p.userId ?? '').slice(0, 8)}…</p>
                  </td>
                  <td className="py-2.5 px-3 font-black tabular-nums" style={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmtINR(p.participationAmount)}
                  </td>
                  <td className="py-2.5 px-3 font-bold tabular-nums" style={{ color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>
                    {p.rateofinterest}%
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', fontSize: 10 }}>
                      {p.lenderReturnsType ?? '—'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 tabular-nums" style={{ color: 'var(--text-muted)' }}>
                    {p.dealDuration ? `${p.dealDuration} mo` : '—'}
                  </td>
                  <td className="py-2.5 px-3 font-mono" style={{ color: 'var(--text-primary)' }}>
                    {p.bankAccountNo ?? '—'}
                  </td>
                  <td className="py-2.5 px-3 font-mono" style={{ color: 'var(--text-muted)' }}>
                    {p.ifscCode ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Deal row ─────────────────────────────────────────────────────────────────
function DealRow({ deal, idx, tabColor, expandedId, onToggle }) {
  const dealKey = deal.dealId ?? deal.id;
  const expanded = expandedId === dealKey;

  const total      = deal.dealValue ?? deal.dealAmount ?? 0;
  const invested   = deal.totalParticipationAmount ?? deal.dealParticipationValue ?? 0;
  const remaining  = deal.currentDealValue ?? Math.max(0, total - invested);
  const fillPct    = total > 0 ? Math.min(Math.round((invested / total) * 100), 100) : 0;
  const isAchieved = deal.dealStatus === 'ACHIEVED';

  return (
    <>
      <tr
        className="transition-colors cursor-pointer"
        style={{ borderBottom: '1px solid var(--border)' }}
        onClick={() => onToggle(dealKey)}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = expanded ? 'rgba(168,85,247,0.04)' : 'transparent'}>

        {/* # */}
        <td className="py-3.5 px-4 font-bold text-xs" style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>

        {/* Deal Name */}
        <td className="py-3.5 px-4">
          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{deal.dealName}</p>
          <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>{String(deal.dealId ?? deal.id ?? '').slice(0, 8)}…</p>
        </td>

        {/* Deal Value */}
        <td className="py-3.5 px-4 font-bold tabular-nums text-sm" style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
          {fmtINR(total)}
        </td>

        {/* Participated */}
        <td className="py-3.5 px-4 font-bold tabular-nums text-sm" style={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>
          {fmtINR(invested)}
        </td>

        {/* Remaining */}
        <td className="py-3.5 px-4 font-bold tabular-nums text-sm"
          style={{ color: remaining <= 0 ? '#ef4444' : '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>
          {remaining <= 0 ? 'Full' : fmtINR(remaining)}
        </td>

        {/* Fill % */}
        <td className="py-3.5 px-4" style={{ minWidth: 110 }}>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${fillPct}%`, background: fillPct >= 100 ? '#ef4444' : fillPct >= 80 ? '#f59e0b' : '#10b981' }} />
            </div>
            <span className="text-xs font-bold tabular-nums" style={{ color: fillPct >= 100 ? '#ef4444' : 'var(--text-primary)' }}>{fillPct}%</span>
          </div>
        </td>

        {/* ROI */}
        <td className="py-3.5 px-4 font-bold tabular-nums text-sm" style={{ color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>
          {deal.rateofinterest ?? deal.monthlyInterest ?? '—'}%
        </td>

        {/* Status */}
        <td className="py-3.5 px-4">
          <span className="text-xs px-2.5 py-1 rounded-full font-bold"
            style={isAchieved
              ? { background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }
              : { background: `${tabColor}15`, color: tabColor, border: `1px solid ${tabColor}30` }}>
            {isAchieved ? '✓ Achieved' : '● Active'}
          </span>
        </td>

        {/* Expand toggle */}
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: 'var(--text-muted)' }}>
            <UsersIcon />
            <span className="transition-transform duration-200" style={{ display: 'inline-block', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>
              <ChevronDown />
            </span>
          </div>
        </td>
      </tr>

      {/* Expanded participants */}
      {expanded && (
        <tr>
          <td colSpan={9} style={{ padding: 0 }}>
            <ParticipantsPanel dealId={dealKey} />
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminOffline() {
  const [activeTab, setActiveTab]   = useState('NORMAL');
  const [deals, setDeals]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [expandedDealId, setExpandedDealId] = useState(null);

  const handleToggle = (dealId) => {
    setExpandedDealId(prev => prev === dealId ? null : dealId);
  };

  const load = (tab = activeTab) => {
    setLoading(true); setError(''); setDeals([]);
    // getRunningClosedDeals(tab)
    getAdminDeals(tab)
      .then(res => {
        const list = res?.listOfLendersInformation ?? (Array.isArray(res) ? res : []);
        setDeals(list);
      })
      .catch(e => setError(e.message ?? 'Failed to load deals'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setExpandedDealId(null); load(activeTab); }, [activeTab]);

  const tabColor = TABS.find(t => t.key === activeTab)?.color ?? '#10b981';

  const filtered = deals.filter(d =>
    !search || d.dealName?.toLowerCase().includes(search.toLowerCase())
  );

  // KPIs
  const totalDealValue   = deals.reduce((s, d) => s + (d.dealValue ?? d.dealAmount ?? 0), 0);
  const totalParticipated = deals.reduce((s, d) => s + (d.totalParticipationAmount ?? d.dealParticipationValue ?? 0), 0);
  const totalRemaining   = deals.reduce((s, d) => s + (d.currentDealValue ?? d.remainingDealValue ?? 0), 0);
  const avgRoi           = deals.length
    ? (deals.reduce((s, d) => s + (d.rateofinterest ?? d.monthlyInterest ?? 0), 0) / deals.length).toFixed(2)
    : '—';

  const kpis = [
    { label: 'Total Deals',    value: String(deals.length),      color: tabColor  },
    { label: 'Total Deal Size',value: fmtINR(totalDealValue),    color: '#818cf8' },
    { label: 'Total Invested', value: fmtINR(totalParticipated), color: '#10b981' },
    { label: 'Remaining',      value: fmtINR(totalRemaining),    color: '#f59e0b' },
    { label: 'Avg ROI',        value: deals.length ? `${avgRoi}%` : '—', color: '#f59e0b' },
  ];

  return (
    <div className="grid gap-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Offline Deals</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Browse running, closed, and test deals — click a row to see participants
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            <RefreshIcon /> Refresh
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="rounded-xl px-4 py-3"
            style={{ background: `${k.color}0a`, border: `1px solid ${k.color}20` }}>
            <p className="text-xl font-extrabold" style={{ color: k.color, fontFamily: "'JetBrains Mono', monospace" }}>{k.value}</p>
            <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Search — same row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 p-1 rounded-2xl flex-shrink-0"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="px-5 py-2 rounded-xl text-sm font-bold transition-all"
              style={activeTab === t.key
                ? { background: t.color, color: '#fff', boxShadow: `0 4px 14px ${t.color}40` }
                : { background: 'transparent', color: 'var(--text-muted)' }}>
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search deal name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded-xl text-sm outline-none flex-1"
          style={{ padding: '9px 14px', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', minWidth: 200 }}
        />
        {!loading && (
          <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} deal{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-16 rounded-2xl"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: tabColor, borderTopColor: 'transparent' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading {activeTab} deals…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="py-10 text-center rounded-2xl"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-bold" style={{ color: '#ef4444' }}>{error}</p>
          <button onClick={() => load()}
            className="mt-3 px-4 py-2 rounded-xl text-xs font-bold"
            style={{ background: `${tabColor}15`, color: tabColor, border: `1px solid ${tabColor}30` }}>
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

          {/* Table header bar */}
          <div className="px-5 py-3.5 flex items-center gap-2"
            style={{ borderBottom: '1px solid var(--border)', background: `${tabColor}08` }}>
            <div className="w-2 h-2 rounded-full" style={{ background: tabColor, boxShadow: `0 0 6px ${tabColor}` }} />
            <h2 className="text-sm font-bold capitalize" style={{ color: 'var(--text-primary)' }}>
              {activeTab} Deals
            </h2>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${tabColor}15`, color: tabColor }}>
              {filtered.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--input-bg)' }}>
                  {['#', 'Deal Name', 'Deal Value', 'Invested', 'Remaining', 'Fill %', 'ROI', 'Status', 'Participants'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold whitespace-nowrap"
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-14 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      No {activeTab} deals found
                    </td>
                  </tr>
                ) : filtered.map((deal, idx) => (
                  <DealRow key={deal.dealId ?? deal.id ?? idx} deal={deal} idx={idx} tabColor={tabColor} expandedId={expandedDealId} onToggle={handleToggle} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
