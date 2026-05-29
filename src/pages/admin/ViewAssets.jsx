import { useState, useRef, useEffect } from 'react';
import { getAllLoadAssetDetails } from '../../api/afterlogin-admin';

const MOCK_USERS = [
  { id: 'U001', name: 'Arjun Mehta',    phone: '98765 43210' },
  { id: 'U002', name: 'Deepa Nair',     phone: '91234 56789' },
  { id: 'U003', name: 'Kiran Rao',      phone: '87654 32109' },
  { id: 'U004', name: 'Sunita Verma',   phone: '76543 21098' },
  { id: 'U005', name: 'Manoj Tiwari',   phone: '65432 10987' },
  { id: 'U006', name: 'Lakshmi Iyer',   phone: '54321 09876' },
  { id: 'U007', name: 'Rahul Gupta',    phone: '43210 98765' },
  { id: 'U008', name: 'Pooja Desai',    phone: '32109 87654' },
];

const fmt = n => Number.isFinite(Number(n)) ? '₹' + Number(n).toLocaleString('en-IN') : '—';
const formatDate = value => {
  if (!value) return '—';
  const date = typeof value === 'number' ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
};

/* ══════════════════════════════════════════════════════════════════════════════
   Main page
══════════════════════════════════════════════════════════════════════════════ */
export default function ViewAssets() {
  const [search,        setSearch]        = useState('');
  const [assets,        setAssets]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [detailAsset,   setDetailAsset]   = useState(null);
  const [allocAsset,    setAllocAsset]    = useState(null);
  // allocations: { [assetId]: [ { user, lendAmount } ] }
  const [allocations,   setAllocations]   = useState({});

  useEffect(() => {
    setLoading(true);
    setError('');
    getAllLoadAssetDetails()
      .then(data => setAssets(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message ?? 'Failed to load assets.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = assets.filter(a =>
    String(a.borrowerName ?? '').toLowerCase().includes(search.toLowerCase()) ||
    String(a.projectName ?? '').toLowerCase().includes(search.toLowerCase()) ||
    String(a.documentNumber ?? '').toLowerCase().includes(search.toLowerCase()) ||
    String(a.assetType ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const saveAllocation = (assetId, lenders) => {
    setAllocations(prev => ({ ...prev, [assetId]: lenders }));
  };

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3"
        style={{ background: 'linear-gradient(135deg,rgba(168,85,247,0.12),rgba(168,85,247,0.04))', border: '1px solid rgba(168,85,247,0.25)' }}>
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#c084fc' }}>Assets</p>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>View Assets</h2>
        </div>
        <p className="text-3xl font-bold" style={{ color: '#c084fc' }}>{assets.length}</p>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between gap-3 px-5 py-4 flex-wrap"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>All Assets</h3>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search borrower, project, doc no…"
            className="px-3 py-2 rounded-xl text-sm outline-none theme-input w-56"
            style={{ color: 'var(--text-primary)' }} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                {['Asset ID','Borrower','Project','Doc No.','Date','Reg. Type','Doc Value','Asset Value','Taken Value','Asset Type','Asset No.','Survey No.','Owner','Sale Deed','Lenders','Action'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-medium whitespace-nowrap"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={16} className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading assets...</td></tr>
              ) : error ? (
                <tr><td colSpan={16} className="py-10 text-center text-sm" style={{ color: '#f87171' }}>{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={16} className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No assets found.</td></tr>
              ) : filtered.map(a => {
                const lenders = allocations[a.id] ?? [];
                const saleDeed = a.saleDeedDocumentsDto?.[0];
                return (
                  <tr key={a.id} className="table-row-hover transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-3 px-4 font-mono text-xs cursor-pointer" style={{ color: '#c084fc' }}
                      onClick={() => setDetailAsset(a)}>{a.id}</td>
                    <td className="py-3 px-4 font-medium whitespace-nowrap cursor-pointer" style={{ color: 'var(--text-primary)' }}
                      onClick={() => setDetailAsset(a)}>{a.borrowerName}</td>
                    <td className="py-3 px-4 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{a.projectName}</td>
                    <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{a.documentNumber}</td>
                    <td className="py-3 px-4 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{formatDate(a.dateOfExecution)}</td>
                    <td className="py-3 px-4 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{a.typeOfRegistration}</td>
                    <td className="py-3 px-4 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{fmt(a.documentValue)}</td>
                    <td className="py-3 px-4 text-xs font-semibold whitespace-nowrap" style={{ color: '#10b981' }}>{fmt(a.actualAssetValue)}</td>
                    <td className="py-3 px-4 text-xs font-semibold whitespace-nowrap" style={{ color: '#f59e0b' }}>{fmt(a.takenAssetValue)}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: 'rgba(168,85,247,0.12)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
                        {a.assetType ?? '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{a.plotNumber}</td>
                    <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{a.surveyNumber}</td>
                    <td className="py-3 px-4 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{a.ownerName}</td>
                    <td className="py-3 px-4 text-xs whitespace-nowrap">
                      {saleDeed?.documentPath ? (
                        <a href={saleDeed.documentPath}
                          download={saleDeed.documentName}
                          className="font-semibold hover:underline"
                          style={{ color: '#c084fc' }}>
                          Download
                        </a>
                      ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {lenders.length > 0
                        ? <span className="px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: 'rgba(168,85,247,0.12)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
                            {lenders.length} lender{lenders.length > 1 ? 's' : ''}
                          </span>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>
                      }
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => setAllocAsset(a)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 whitespace-nowrap"
                        style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', boxShadow: '0 2px 8px rgba(168,85,247,0.3)' }}>
                        Allocate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {detailAsset && (
        <DetailModal
          asset={detailAsset}
          lenders={allocations[detailAsset.id] ?? []}
          onClose={() => setDetailAsset(null)}
        />
      )}

      {/* Allocation modal */}
      {allocAsset && (
        <AllocationModal
          asset={allocAsset}
          existingLenders={allocations[allocAsset.id] ?? []}
          onSave={lenders => { saveAllocation(allocAsset.id, lenders); setAllocAsset(null); }}
          onClose={() => setAllocAsset(null)}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Detail modal
══════════════════════════════════════════════════════════════════════════════ */
function DetailModal({ asset: a, lenders, onClose }) {
  const saleDeeds = Array.isArray(a.saleDeedDocumentsDto) ? a.saleDeedDocumentsDto : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: 'var(--card-bg)', border: '1px solid rgba(168,85,247,0.3)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: '#c084fc' }}>Asset Detail</p>
            <h3 className="text-base font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{a.id}</h3>
          </div>
          <CloseBtn onClick={onClose} />
        </div>
        <div className="p-6 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {[
            ['Borrower Name', a.borrowerName], ['Project Name', a.projectName],
            ['Document Number', a.documentNumber], ['Date of Execution', formatDate(a.dateOfExecution)],
            ['Type of Registration', a.typeOfRegistration], ['Document Value', fmt(a.documentValue)],
            ['Actual Asset Value', fmt(a.actualAssetValue)], ['Taken Asset Value', fmt(a.takenAssetValue)],
            ['Asset Type', a.assetType], ['Asset No.', a.plotNumber],
            ['Survey No.', a.surveyNumber], ['Owner Name', a.ownerName],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-muted)' }}>{k}</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{v || '—'}</p>
            </div>
          ))}
          {saleDeeds.length > 0 && (
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Sale Deed Documents</p>
              <div className="flex flex-col gap-2">
                {saleDeeds.map(doc => (
                  <a key={doc.id ?? doc.documentPath}
                    href={doc.documentPath}
                    download={doc.documentName}
                    className="px-3 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                    style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc' }}>
                    {doc.documentName ?? 'Download sale deed'}
                  </a>
                ))}
              </div>
            </div>
          )}
          {lenders.length > 0 && (
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Lenders</p>
              <div className="flex flex-col gap-2">
                {lenders.map((l, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.2)' }}>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{l.user.name}</span>
                    <span className="text-sm font-bold" style={{ color: '#c084fc' }}>{fmt(l.lendAmount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Allocation modal
══════════════════════════════════════════════════════════════════════════════ */
function AllocationModal({ asset, existingLenders, onSave, onClose }) {
  const [lenders,     setLenders]     = useState(existingLenders.length ? existingLenders : []);
  const [userSearch,  setUserSearch]  = useState('');
  const [dropOpen,    setDropOpen]    = useState(false);
  const [selUser,     setSelUser]     = useState(null);
  const [lendAmt,     setLendAmt]     = useState('');
  const [lendErr,     setLendErr]     = useState('');
  const dropRef = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    const handler = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const alreadyAdded = id => lenders.some(l => l.user.id === id);

  const filteredUsers = MOCK_USERS.filter(u =>
    (u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
     u.phone.includes(userSearch)) &&
    !alreadyAdded(u.id)
  );

  const totalLent = lenders.reduce((s, l) => s + Number(l.lendAmount), 0);
  const remaining = asset.actualAssetValue - totalLent;
  const pct       = Math.min(100, (totalLent / asset.actualAssetValue) * 100);

  const addLender = () => {
    if (!selUser)              { setLendErr('Select a user first'); return; }
    if (!lendAmt || Number(lendAmt) <= 0) { setLendErr('Enter a valid amount'); return; }
    if (Number(lendAmt) > remaining)      { setLendErr(`Exceeds remaining ${fmt(remaining)}`); return; }
    setLenders(prev => [...prev, { user: selUser, lendAmount: Number(lendAmt) }]);
    setSelUser(null); setUserSearch(''); setLendAmt(''); setLendErr('');
  };

  const removeLender = idx => setLenders(prev => prev.filter((_, i) => i !== idx));

  const updateAmount = (idx, val) => {
    setLenders(prev => prev.map((l, i) => i === idx ? { ...l, lendAmount: Number(val) } : l));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)' }}>
      <div className="w-full max-w-xl rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--card-bg)', border: '1px solid rgba(168,85,247,0.35)', boxShadow: '0 24px 64px rgba(0,0,0,0.55)', maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: '#c084fc' }}>Allocate Asset</p>
            <h3 className="text-base font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {asset.id} — {asset.borrowerName}
            </h3>
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-5">

          {/* Asset value summary */}
          <div className="rounded-xl p-4 grid grid-cols-3 gap-3"
            style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
            <ValueChip label="Asset Value"  value={fmt(asset.actualAssetValue)} color="#c084fc" />
            <ValueChip label="Total Lent"   value={fmt(totalLent)}              color="#10b981" />
            <ValueChip label="Remaining"    value={fmt(remaining)}              color={remaining < 0 ? '#f87171' : '#f59e0b'} />
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
              <span>Allocation progress</span>
              <span style={{ color: '#c084fc' }}>{pct.toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#a855f7,#7c3aed)' }} />
            </div>
          </div>

          {/* Add lender row */}
          <div className="rounded-xl p-4 flex flex-col gap-3"
            style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c084fc' }}>Add Lender</p>

            {/* User searchable dropdown */}
            <div className="relative" ref={dropRef}>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-text theme-input"
                style={{ color: 'var(--text-primary)' }}
                onClick={() => setDropOpen(true)}>
                {selUser
                  ? <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {selUser.name} <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({selUser.phone})</span>
                    </span>
                  : <input
                      autoFocus={dropOpen}
                      value={userSearch}
                      onChange={e => { setUserSearch(e.target.value); setDropOpen(true); }}
                      onFocus={() => setDropOpen(true)}
                      placeholder="Search user by name or phone…"
                      className="flex-1 bg-transparent outline-none text-sm"
                      style={{ color: 'var(--text-primary)' }} />
                }
                {selUser && (
                  <button type="button" onClick={e => { e.stopPropagation(); setSelUser(null); setUserSearch(''); setDropOpen(true); }}
                    className="text-xs px-1.5 py-0.5 rounded-lg"
                    style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>✕</button>
                )}
              </div>

              {dropOpen && !selUser && (
                <div className="absolute z-20 w-full mt-1 rounded-xl overflow-hidden shadow-2xl"
                  style={{ background: 'var(--card-bg)', border: '1px solid rgba(168,85,247,0.3)', maxHeight: 200, overflowY: 'auto' }}>
                  {filteredUsers.length === 0
                    ? <p className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>No users found</p>
                    : filteredUsers.map(u => (
                        <button key={u.id} type="button"
                          className="w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors hover:bg-purple-500/10"
                          onClick={() => { setSelUser(u); setDropOpen(false); setUserSearch(''); }}>
                          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.phone}</span>
                        </button>
                      ))
                  }
                </div>
              )}
            </div>

            {/* Lend amount */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>₹</span>
                <input type="number" min="0" placeholder="Lend amount"
                  value={lendAmt} onChange={e => { setLendAmt(e.target.value); setLendErr(''); }}
                  className="theme-input w-full pl-7 pr-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }} />
              </div>
              <button type="button" onClick={addLender}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff' }}>
                + Add
              </button>
            </div>
            {lendErr && <p className="text-xs" style={{ color: '#f87171' }}>{lendErr}</p>}
          </div>

          {/* Lenders list */}
          {lenders.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Lenders ({lenders.length})
              </p>
              {lenders.map((l, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
                    {l.user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{l.user.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{l.user.phone}</p>
                  </div>
                  {/* Editable amount */}
                  <div className="relative w-32">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>₹</span>
                    <input type="number" min="0"
                      value={l.lendAmount}
                      onChange={e => updateAmount(i, e.target.value)}
                      className="theme-input w-full pl-6 pr-2 py-1.5 rounded-lg text-sm outline-none text-right"
                      style={{ color: '#c084fc', fontWeight: 600 }} />
                  </div>
                  <button type="button" onClick={() => removeLender(i)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:opacity-80"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 justify-end flex-shrink-0"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Cancel
          </button>
          <button type="button" onClick={() => onSave(lenders)}
            disabled={lenders.length === 0}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', boxShadow: '0 4px 14px rgba(168,85,247,0.35)' }}>
            Save Allocation
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Shared helpers ─────────────────────────────────────────────────────────── */
function CloseBtn({ onClick }) {
  return (
    <button onClick={onClick}
      className="w-8 h-8 rounded-xl flex items-center justify-center"
      style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  );
}

function ValueChip({ label, value, color }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-base font-bold" style={{ color }}>{value}</p>
    </div>
  );
}
