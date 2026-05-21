import { useState, useEffect, useCallback } from 'react';
import { getRegisteredUsers, searchUserByInfo } from '../../api/afterlogin-admin';

// ─── Icons ────────────────────────────────────────────────────────────────────
const UsersIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const SearchIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const ChevLeft   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevRight  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>;
const CloseIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const PAGE_SIZE = 20;

// ─── Status chip ──────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const s = String(status ?? '').toLowerCase();
  const styles = {
    live:     { bg: 'rgba(16,185,129,0.1)',  color: '#10b981', border: 'rgba(16,185,129,0.25)'  },
    active:   { bg: 'rgba(16,185,129,0.1)',  color: '#10b981', border: 'rgba(16,185,129,0.25)'  },
    inactive: { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444', border: 'rgba(239,68,68,0.25)'   },
    pending:  { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b', border: 'rgba(245,158,11,0.25)'  },
  };
  const st = styles[s] ?? styles.pending;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />
      {String(status ?? '—')}
    </span>
  );
}

// ─── User detail drawer ───────────────────────────────────────────────────────
function UserDrawer({ user, onClose }) {
  if (!user) return null;
  const rows = [
    ['User ID',      user.userId      ?? user.id      ?? '—'],
    ['Name',         [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name || '—'],
    ['Email',        user.email       ?? '—'],
    ['Mobile',       user.mobileNumber ?? user.mobile ?? '—'],
    ['Status',       user.status      ?? 'Live'],
    // ['Role',         user.roles       ?? user.role    ?? '—'],
    // ['Registered On',user.createdDate ?? user.registeredOn ?? '—'],
    ['LR ID',        user.lrId        ?? '—'],
  ];
  return (
    <div className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm h-full flex flex-col overflow-y-auto"
        style={{ background: 'var(--surface-card)', borderLeft: '1px solid rgba(168,85,247,0.25)', boxShadow: '-8px 0 40px rgba(0,0,0,0.3)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(168,85,247,0.05)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
              style={{ background: 'linear-gradient(135deg,rgba(168,85,247,0.3),rgba(168,85,247,0.1))', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
              {(user.firstName ?? user.name ?? '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.name || '—'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>User Details</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <CloseIcon />
          </button>
        </div>

        {/* Fields */}
        <div className="p-5 grid gap-3">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-xl px-4 py-3"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
              <p className="text-xs uppercase tracking-wider font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
              {label === 'Status'
                ? <StatusChip status={value} />
                : <p className="text-sm font-semibold break-all" style={{ color: 'var(--text-primary)' }}>{value}</p>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminTotalUsers() {
  // List state
  const [users,       setUsers]       = useState([]);
  const [totalCount,  setTotalCount]  = useState(0);
  const [page,        setPage]        = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [listError,   setListError]   = useState('');

  // Search state
  const [searchMode,    setSearchMode]    = useState(false);
  const [searchInput,   setSearchInput]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError,   setSearchError]   = useState('');

  // Drawer
  const [selected, setSelected] = useState(null);

  // ── Fetch paginated list ──────────────────────────────────────────────────
  const fetchUsers = useCallback((pageIndex) => {
    setListLoading(true);
    setListError('');
    getRegisteredUsers({ pageIndex, pageSize: PAGE_SIZE })
      .then(res => {
        // API may return { data: [...], totalCount } or just an array
        if (Array.isArray(res)) {
          setUsers(res);
          setTotalCount(res.length + pageIndex * PAGE_SIZE);
        } else {
          setUsers(res?.data ?? res?.users ?? res?.content ?? []);
          setTotalCount(res?.count ?? res?.totalElements ?? res?.total ?? 0);
        }
      })
      .catch(e => setListError(e.message ?? 'Failed to load users'))
      .finally(() => setListLoading(false));
  }, []);

  useEffect(() => { fetchUsers(page); }, [page, fetchUsers]);

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = () => {
    const trimmed = searchInput.trim();
    if (!trimmed) { setSearchMode(false); setSearchResults([]); return; }

    setSearchMode(true);
    setSearchLoading(true);
    setSearchError('');

    // Detect if input is a 10-digit mobile number or email/username
    const isMobile = /^\d{10}$/.test(trimmed);
    const body = {
      email:        isMobile ? null : trimmed.includes('@') ? trimmed : null,
      mobileNumber: isMobile ? trimmed : null,
      userName:     (!isMobile && !trimmed.includes('@')) ? trimmed : null,
    };

    searchUserByInfo(body)
      .then(res => {
        const list = Array.isArray(res) ? res : res?.data ?? res?.users ?? (res ? [res] : []);
        setSearchResults(list);
      })
      .catch(e => setSearchError(e.message ?? 'Search failed'))
      .finally(() => setSearchLoading(false));
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchMode(false);
    setSearchResults([]);
    setSearchError('');
  };

  const rawList    = searchMode ? searchResults : users;
  const displayList  = rawList.filter(u => {
    const name   = ([u.firstName, u.lastName].filter(Boolean).join(' ') || u.name || '').trim();
    const email  = (u.email ?? '').trim();
    const mobile = (u.mobileNumber ?? u.mobile ?? '').trim();
    return name || email || mobile;
  });
  const totalPages   = Math.ceil(totalCount / PAGE_SIZE);

  // ── Table columns ─────────────────────────────────────────────────────────
  const cols = ['#', 'Name', 'Email', 'Mobile', 'LR ID', 'Status'];

  const getCell = (u, col, idx) => {
    switch (col) {
      case '#':              return <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>{searchMode ? idx + 1 : page * PAGE_SIZE + idx + 1}</span>;
      case 'Name':           return (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.25)' }}>
            {(u.firstName ?? u.name ?? '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {[u.firstName, u.lastName].filter(Boolean).join(' ') || u.name || '—'}
            </p>
          </div>
        </div>
      );
      case 'Email':          return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email ?? '—'}</span>;
      case 'Mobile':         return <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>{u.mobileNumber ?? u.mobile ?? '—'}</span>;
      case 'LR ID':          return <span className="font-mono text-xs px-2 py-0.5 rounded-md" style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>{u.lrId ?? '—'}</span>;
      case 'Role':           return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.roles ?? u.role ?? '—'}</span>;
      case 'Registered On':  return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.createdDate ?? u.registeredOn ?? '—'}</span>;
      case 'Status':         return <StatusChip status={u.status ?? 'live'} />;
      default:               return '—';
    }
  };

  return (
    <div className="grid gap-5">

      {/* ── Header strip ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }}>
            <UsersIcon />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#c084fc' }}>Admin</p>
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Total Users</h1>
          </div>
        </div>
        {!searchMode && totalCount > 0 && (
          <div className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.25)' }}>
            {totalCount.toLocaleString('en-IN')} registered
          </div>
        )}
      </div>

      {/* ── Search bar ── */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[220px] relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
            <SearchIcon />
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search by mobile, email or username…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
        <button onClick={handleSearch}
          className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', boxShadow: '0 4px 14px rgba(168,85,247,0.35)' }}>
          Search
        </button>
        {searchMode && (
          <button onClick={clearSearch}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            Clear
          </button>
        )}
      </div>

      {/* ── Search error ── */}
      {searchError && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          {searchError}
        </div>
      )}

      {/* ── Search results banner ── */}
      {searchMode && !searchLoading && (
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <SearchIcon />
          <span>
            {searchResults.length === 0
              ? 'No users found'
              : `${searchResults.length} result${searchResults.length > 1 ? 's' : ''} for "${searchInput}"`}
          </span>
        </div>
      )}

      {/* ── Table ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--card-bg)', border: '1px solid rgba(168,85,247,0.18)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

        {/* Table header */}
        <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-2"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(168,85,247,0.04)' }}>
          <div className="flex items-center gap-2" style={{ color: '#c084fc' }}>
            <UsersIcon />
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {searchMode ? 'Search Results' : 'Registered Users'}
            </span>
          </div>
          {!searchMode && (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>
              Page {page + 1} of {totalPages || 1}
            </span>
          )}
        </div>

        {/* Loading */}
        {(listLoading || searchLoading) && (
          <div className="flex items-center justify-center gap-3 py-16">
            <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
              {searchLoading ? 'Searching…' : 'Loading users…'}
            </span>
          </div>
        )}

        {/* List error */}
        {!listLoading && listError && (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: '#ef4444' }}>{listError}</p>
            <button onClick={() => fetchUsers(page)} className="mt-3 text-xs underline" style={{ color: '#c084fc' }}>Retry</button>
          </div>
        )}

        {/* Empty */}
        {!listLoading && !searchLoading && !listError && displayList.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-3xl mb-3">👥</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No users found</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {searchMode ? 'Try a different search term' : 'No registered users yet'}
            </p>
          </div>
        )}

        {/* Table */}
        {!listLoading && !searchLoading && displayList.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                  {cols.map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold whitespace-nowrap"
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayList.map((u, idx) => (
                  <tr key={u.userId ?? u.id ?? idx}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onClick={() => setSelected(u)}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(168,85,247,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {cols.map(col => (
                      <td key={col} className="py-3.5 px-4 whitespace-nowrap">{getCell(u, col, idx)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination (list mode only) */}
        {!searchMode && !listLoading && totalPages > 1 && (
          <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3"
            style={{ borderTop: '1px solid var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-30"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <ChevLeft />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: p === page ? 'linear-gradient(135deg,#a855f7,#7c3aed)' : 'var(--input-bg)',
                      color: p === page ? '#fff' : 'var(--text-muted)',
                      border: `1px solid ${p === page ? 'transparent' : 'var(--border)'}`,
                      boxShadow: p === page ? '0 2px 8px rgba(168,85,247,0.35)' : 'none',
                    }}>
                    {p + 1}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-30"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <ChevRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── User detail drawer ── */}
      {selected && <UserDrawer user={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
