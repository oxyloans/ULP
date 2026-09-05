import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSdLots } from '../api/afterlogin-user';
import { SDLotCard, mapDeal } from './SDLots';

const GoldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="9"/>
    <path d="M9 9h1.5a1.5 1.5 0 0 1 0 3H9v3"/>
    <path d="M9 12h3"/>
  </svg>
);

export default function GoldDealTest() {
  const { user } = useAuth();
  const [allDeals, setAllDeals] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [roiFilter,    setRoiFilter]    = useState('All');
  const [payoutFilter, setPayoutFilter] = useState('All');

  useEffect(() => {
    setLoading(true);
    getSdLots("TEST")
      .then(data => {
        if (Array.isArray(data)) {
          setAllDeals(data.map(mapDeal).filter(l => l.globalDealType === 'GOLD'));
        }
      })
      .catch(e => setError(e.message ?? 'Failed to load gold deals'))
      .finally(() => setLoading(false));
  }, []);

  const roiOptions    = ['All', '< 1.5%', '1.5–2%', '> 2%'];
  const payoutOptions = ['All', ...new Set(allDeals.map(l => l.payoutType))];

  const q = search.trim().toLowerCase();
  const filtered = allDeals.filter(l => {
    if (l.status !== 'Open') return false;
    if (l.userIds && l.userIds.trim()) {
      const allowed = l.userIds.split(',').map(id => id.trim()).filter(Boolean);
      if (allowed.length > 0 && !allowed.includes(user?.userId ?? '')) return false;
    }
    if (q && !(
      (l.title ?? '').toLowerCase().includes(q) ||
      (l.bankDetails?.accountName ?? '').toLowerCase().includes(q)
    )) return false;
    if (roiFilter === '< 1.5%'  && l.roiMonthly >= 1.5) return false;
    if (roiFilter === '1.5–2%'  && (l.roiMonthly < 1.5 || l.roiMonthly > 2)) return false;
    if (roiFilter === '> 2%'    && l.roiMonthly <= 2) return false;
    if (payoutFilter !== 'All'  && l.payoutType !== payoutFilter) return false;
    return true;
  });

  const FilterGroup = ({ label, options, value, onChange }) => (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-bold uppercase tracking-widest flex-shrink-0"
        style={{ color: 'var(--text-muted)', fontSize: 10 }}>{label}</span>
      <div className="flex items-center gap-1 p-0.5 rounded-lg"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)}
            className="px-3 py-1 rounded-md text-xs font-bold transition-all whitespace-nowrap"
            style={{
              background: value === o ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'transparent',
              color: value === o ? '#fff' : 'var(--text-muted)',
              boxShadow: value === o ? '0 2px 6px rgba(245,158,11,0.35)' : 'none',
            }}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );

  const hasActiveFilters = roiFilter !== 'All' || payoutFilter !== 'All';

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
            <GoldIcon />
          </div>
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Gold Deals</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Browse and participate in active Gold Deals</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by deal name…"
          className="w-full pl-9 pr-9 py-2 rounded-xl text-sm outline-none transition-all"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Filters */}
      {/* <div className="rounded-2xl p-4 flex flex-col gap-3"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Filters</span>
          {hasActiveFilters && (
            <button onClick={() => { setRoiFilter('All'); setPayoutFilter('All'); }}
              className="text-xs font-bold px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              Clear All
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <FilterGroup label="ROI"    options={roiOptions}    value={roiFilter}    onChange={setRoiFilter}    />
          <FilterGroup label="Payout" options={payoutOptions} value={payoutFilter} onChange={setPayoutFilter} />
        </div>
      </div> */}

      {/* Cards */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 rounded-2xl"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#f59e0b', borderTopColor: 'transparent' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading gold deals…</span>
          </div>
        ) : error ? (
          <div className="py-10 text-center rounded-2xl"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center rounded-2xl"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <p className="text-3xl mb-2">{search ? '🔍' : '🥇'}</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {search ? 'No matching deals' : 'No gold deals available'}
            </p>
            {hasActiveFilters && (
              <button onClick={() => { setRoiFilter('All'); setPayoutFilter('All'); }}
                className="mt-3 text-xs font-bold px-4 py-2 rounded-xl"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          [...filtered].reverse().map((lot, index) => (
            <SDLotCard key={lot.id} lot={lot} index={index} participatePath={`/gold-lot/participate/${lot.id}`} />
          ))
        )}
      </div>
    </div>
  );
}
