import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGoldLotDeals } from '../api/afterlogin-user';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtINR(n) {
  if (!n && n !== 0) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const GoldIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="9"/><path d="M9 9h1.5a1.5 1.5 0 0 1 0 3H9v3"/><path d="M9 12h3"/></svg>;
const ChevDown  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="6 9 12 15 18 9"/></svg>;
const ArrowRight= () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

// ─── Chips ────────────────────────────────────────────────────────────────────
function TdsChip({ value }) {
  const v = (value ?? '').trim().toUpperCase();
  if (v === 'MANDATORY') return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold"
      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
      TDS 10%
    </span>
  );
  if (v === 'OPTIONAL') return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold"
      style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
      TDS Opt
    </span>
  );
  return null;
}

function LockChip({ durationType }) {
  const v = (durationType ?? '').toLowerCase();
  if (v === 'optional') return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold"
      style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
      No Lock
    </span>
  );
  if (v === 'mandatory') return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold"
      style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>
      Lock-in
    </span>
  );
  return null;
}

function AuctionChip({ type }) {
  const isOpen = type === 'Open';
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold"
      style={{
        background: isOpen ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
        color:      isOpen ? '#10b981' : '#ef4444',
        border:     `1px solid ${isOpen ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
      }}>
      {isOpen && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10b981' }} />}
      {type ?? 'Open'}
    </span>
  );
}

// ─── Compact Gold Deal Card (vertical, 3-per-row) ────────────────────────────
function GoldDealCard({ deal }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const accent = '#f59e0b';

  const roiMatch    = deal.propertyName?.match(/ROI([\d.]+)/i);
  const roiValue    = roiMatch ? roiMatch[1] : null;
  const payoutMatch = deal.propertyName?.match(/-(MLY|YLY|QLY|HLY)-/i);
  const payoutMap   = { MLY: 'Monthly', YLY: 'Yearly', QLY: 'Quarterly', HLY: 'Half-Yearly' };
  const payoutLabel = payoutMatch ? (payoutMap[payoutMatch[1].toUpperCase()] ?? payoutMatch[1]) : null;
  const tenureMatch = deal.propertyName?.match(/([\d.]+)(YRS?|MNS?|MONTHS?)/i);
  const tenureLabel = tenureMatch
    ? `${tenureMatch[1]} ${tenureMatch[2].toUpperCase().startsWith('Y') ? 'Yr' : 'Mo'}${parseFloat(tenureMatch[1]) > 1 ? 's' : ''}`
    : null;

  const handleContribute = (e) => {
    e.stopPropagation();
    navigate(`/gold-deals/contribute/${deal.id}`, { state: { deal } });
  };

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col transition-all"
      style={{ background: 'var(--surface-card)', border: `1px solid ${accent}22`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 28px ${accent}20`; e.currentTarget.style.borderColor = `${accent}44`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = `${accent}22`; e.currentTarget.style.transform = ''; }}>

      {/* ── Hero banner with bar graph ── */}
      <div className="flex flex-col items-center justify-center py-6 px-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#1c1400,#2d1f00,#3d2a00)', minHeight: 140 }}>
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%,${accent}22,transparent 70%)` }} />

        {/* Animated bar graph background */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 px-3 pb-0 pointer-events-none overflow-hidden"
          style={{ height: 48, opacity: 0.25 }}>
          {[40, 65, 50, 80, 55, 90, 70, 85, 60, 75].map((h, i) => (
            <div key={i} className="flex-1 rounded-t"
              style={{
                height: `${h}%`,
                background: `linear-gradient(180deg, ${accent}, ${accent}44)`,
                animation: `barPulse ${1.2 + i * 0.15}s ease-in-out infinite alternate`,
              }} />
          ))}
        </div>

        {/* Gold icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 relative z-10"
          style={{ background: `${accent}20`, border: `1px solid ${accent}35`, color: accent }}>
          <GoldIcon />
        </div>

        {/* ROI */}
        {roiValue && (
          <div className="relative z-10 text-center">
            <p className="text-3xl font-black leading-none"
              style={{ color: accent, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 20px ${accent}60` }}>
              {roiValue}%
            </p>
            <p className="text-xs mt-1 font-semibold" style={{ color: `${accent}99` }}>
              {payoutLabel ?? 'Returns'}
            </p>
          </div>
        )}

        {/* Tenure */}
        {tenureLabel && (
          <div className="mt-2 px-3 py-0.5 rounded-full relative z-10"
            style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
            <p className="text-xs font-bold" style={{ color: accent }}>{tenureLabel}</p>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 px-4 py-3 gap-2">
        {/* Title */}
        <div>
          <h3 className="text-xs font-extrabold leading-snug line-clamp-2"
            style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
            {deal.propertyName}
          </h3>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
            {deal.ownerName?.trim()}
          </p>
        </div>

        {/* Max capital */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg"
          style={{ background: `${accent}0a`, border: `1px solid ${accent}20` }}>
          <span className="text-xs font-semibold" style={{ color: accent }}>Max Capital</span>
          <span className="text-sm font-extrabold" style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}>
            {fmtINR(deal.reservedPrice ?? 0)}
          </span>
        </div>

        {/* Chips row */}
        <div className="flex items-center gap-1 flex-wrap">
          <TdsChip value={deal.propertyTds} />
          <LockChip durationType={deal.durationType} />
          <AuctionChip type={deal.auctionType} />
        </div>
      </div>

      {/* ── Footer: Contribute + expand ── */}
      <div className="px-4 pb-4 flex items-center gap-2">
        <button onClick={handleContribute}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', boxShadow: '0 3px 10px rgba(245,158,11,0.35)' }}>
          Contribute
          <ArrowRight />
        </button>
        <button onClick={() => setExpanded(e => !e)}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80 flex-shrink-0"
          style={{ background: `${accent}0a`, border: `1px solid ${accent}20`, color: accent,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>
          <ChevDown />
        </button>
      </div>

      {/* ── Expanded description ── */}
      {expanded && deal.propertyDescription && (
        <div className="px-4 pb-4" style={{ borderTop: `1px solid ${accent}12` }}>
          <p className="text-xs uppercase tracking-widest font-semibold mt-3 mb-1.5" style={{ color: accent }}>Description</p>
          <div className="rounded-lg px-3 py-2.5 text-xs leading-relaxed whitespace-pre-line"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)', maxHeight: 180, overflowY: 'auto' }}>
            {deal.propertyDescription}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function GoldDeal() {
  const [deals,         setDeals]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [search,        setSearch]        = useState('');
  const [auctionFilter, setAuctionFilter] = useState('Open');

  useEffect(() => {
    setLoading(true);
    getGoldLotDeals()
      .then(res => {
        const all  = Array.isArray(res) ? res : (res?.data ?? []);
        setDeals(all.filter(d => d.propertyType === 'GOLDLOT'));
      })
      .catch(e => setError(e.message ?? 'Failed to load gold deals'))
      .finally(() => setLoading(false));
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = deals
    .filter(d => auctionFilter === 'All' || d.auctionType === auctionFilter)
    .filter(d => !q || (
      (d.propertyName ?? '').toLowerCase().includes(q) ||
      (d.ownerName    ?? '').toLowerCase().includes(q) ||
      (d.durationType ?? '').toLowerCase().includes(q)
    ));

  const openCount  = deals.filter(d => d.auctionType === 'Open').length;
  const closeCount = deals.filter(d => d.auctionType === 'Close').length;

  const FILTERS = [
    { key: 'Open',  label: 'Open',  count: openCount,    color: '#10b981' },
    { key: 'Close', label: 'Close', count: closeCount,   color: '#ef4444' },
    { key: 'All',   label: 'All',   count: deals.length, color: '#f59e0b' },
  ];

  return (
    <div className="grid gap-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
            <GoldIcon />
          </div>
          <div>
            {/* <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#f59e0b' }}>Offline Deals</p> */}
            <h1 className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>Gold Deals</h1>
          </div>
        </div>

        {/* Filter pills — right side of header */}
        {!loading && deals.length > 0 && (
          <div className="flex items-center gap-1.5">
            {FILTERS.map(f => {
              const isActive = auctionFilter === f.key;
              return (
                <button key={f.key} onClick={() => setAuctionFilter(f.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={{
                    background: isActive ? f.color : 'var(--input-bg)',
                    color:      isActive ? '#fff' : 'var(--text-muted)',
                    border:     `1px solid ${isActive ? f.color : 'var(--border)'}`,
                    boxShadow:  isActive ? `0 2px 8px ${f.color}40` : 'none',
                  }}>
                  {f.key === 'Open' && isActive && (
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#fff' }} />
                  )}
                  {f.label}
                  <span className="px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--surface-elevated)', color: isActive ? '#fff' : 'var(--text-muted)', fontSize: 9 }}>
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by deal name, owner…"
          className="w-full pl-9 pr-9 py-2 rounded-xl text-sm outline-none transition-all"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-14 rounded-2xl"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#f59e0b', borderTopColor: 'transparent' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading gold deals…</span>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="py-10 text-center rounded-2xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && filtered.length === 0 && (
        <div className="py-14 text-center rounded-2xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <p className="text-3xl mb-2">{search ? '🔍' : '🥇'}</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {search ? 'No matching deals' : 'No gold deals available'}
          </p>
        </div>
      )}

      {/* ── Deal cards ── */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(deal => (
            <GoldDealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
