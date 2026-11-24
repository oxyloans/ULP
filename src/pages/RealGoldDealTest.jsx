import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSdLots } from '../api/afterlogin-user';
import { SDLotCard, mapDeal } from './SDLots';

const RealGoldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M4 9l1.5-3h13L20 9" />
    <path d="M3 9h18l-1.6 8.2A2 2 0 0 1 17.44 19H6.56a2 2 0 0 1-1.96-1.8z" />
    <path d="M3 9h18" />
  </svg>
);

export default function RealGoldDealTest() {
  const { user } = useAuth();
  const [allDeals, setAllDeals] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    setLoading(true);
    getSdLots("TEST")
      .then(data => {
        if (Array.isArray(data)) {
          setAllDeals(data.map(mapDeal).filter(l => l.globalDealType === 'REALGOLD'));
        }
      })
      .catch(e => setError(e.message ?? 'Failed to load real gold deals'))
      .finally(() => setLoading(false));
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = allDeals.filter(l => {
    if (l.userIds && l.userIds.trim()) {
      const allowed = l.userIds.split(',').map(id => id.trim()).filter(Boolean);
      if (allowed.length > 0 && !allowed.includes(user?.userId ?? '')) return false;
    }
    if (q && !(
      (l.title ?? '').toLowerCase().includes(q) ||
      (l.bankDetails?.accountName ?? '').toLowerCase().includes(q)
    )) return false;
    return true;
  });

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
            <RealGoldIcon />
          </div>
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
              Real Gold Deals{' '}
              <span className="text-sm font-bold px-2 py-0.5 rounded-lg align-middle"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                TEST
              </span>
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Test environment — Real Gold deals from the TEST deal type
            </p>
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

      {/* Cards */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 rounded-2xl"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#f59e0b', borderTopColor: 'transparent' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading real gold deals…</span>
          </div>
        ) : error ? (
          <div className="py-10 text-center rounded-2xl"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center rounded-2xl"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <p className="text-3xl mb-2">{search ? '🔍' : '🪙'}</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {search ? 'No matching deals' : 'No real gold test deals available'}
            </p>
          </div>
        ) : (
          [...filtered].reverse().map((lot, index) => (
            <SDLotCard key={lot.id} lot={lot} index={index} participatePath={`/real-gold-lot/participate/${lot.id}`} />
          ))
        )}
      </div>
    </div>
  );
}
