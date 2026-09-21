import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL, getToken } from '../../api/client';

// ─── Icons ────────────────────────────────────────────────────────────────────
const LockIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const PlusIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const RefreshIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const UserIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const ArrowRight  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const SearchIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const EmptyIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>;

function fmtINR(n) {
  if (n == null || n === '') return '—';
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function fmtDate(raw) {
  if (!raw) return '—';
  try {
    const d = new Date(raw);
    if (isNaN(d)) return raw;
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return raw; }
}

export default function AdminListHoldAmounts() {
  const navigate = useNavigate();
  const token = getToken();

  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [search,  setSearch]  = useState('');

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/oxybrick-service/listOfHoldAmounts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to load hold amounts');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  // Filter by userId, dealId, or comments
  const filtered = data.filter(row => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(row.userId   ?? '').toLowerCase().includes(q) ||
      String(row.dealId   ?? '').toLowerCase().includes(q) ||
      String(row.comments ?? '').toLowerCase().includes(q) ||
      String(row.userName ?? '').toLowerCase().includes(q)
    );
  });

  // Summary stats
  const totalHeld    = data.reduce((s, r) => s + (Number(r.holdAmount) || 0), 0);
  const uniqueUsers  = new Set(data.map(r => r.userId).filter(Boolean)).size;
  const uniqueDeals  = new Set(data.map(r => r.dealId).filter(Boolean)).size;

  return (
    <div className="grid gap-6">

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(245,131,17,0.12)', border: '1px solid rgba(245,131,17,0.25)', color: '#f58311', boxShadow: '0 0 18px rgba(245,131,17,0.15)' }}>
            <LockIcon />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#f58311' }}>Hold Amount</p>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              List of Hold Amounts
              {data.length > 0 && (
                <span className="ml-2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                  ({data.length})
                </span>
              )}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchList}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            <RefreshIcon /> Refresh
          </button>
          <button onClick={() => navigate('/admin/hold-amount/create')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#f58311,#d4690a)', color: '#fff', boxShadow: '0 4px 14px rgba(245,131,17,0.35)' }}>
            <PlusIcon /> New Hold
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Held',    value: fmtINR(totalHeld),        color: '#f58311', bg: 'rgba(245,131,17,0.08)',  border: 'rgba(245,131,17,0.2)'  },
          { label: 'Unique Users',  value: uniqueUsers,               color: '#2673bb', bg: 'rgba(38,115,187,0.08)', border: 'rgba(38,115,187,0.2)'  },
          { label: 'Unique Deals',  value: uniqueDeals,               color: '#35a13e', bg: 'rgba(53,161,62,0.08)',  border: 'rgba(53,161,62,0.2)'   },
        ].map(c => (
          <div key={c.label} className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: c.bg, border: `1px solid ${c.border}` }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: c.color }}>{c.label}</p>
              <p className="text-2xl font-extrabold mt-0.5" style={{ color: 'var(--text-primary)' }}>{loading ? '—' : c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* List card */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--table-bg)', border: '1px solid var(--border)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

        {/* Toolbar */}
        <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Hold Amount Records</h2>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', minWidth: 220 }}>
            <SearchIcon />
            <input
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--text-primary)' }}
              placeholder="Search by user, deal, comments…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-16">
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="#f58311" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
            </svg>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading hold amounts…</span>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16" style={{ color: 'var(--text-muted)' }}>
            <EmptyIcon />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {search ? 'No matching records' : 'No hold amounts yet'}
            </p>
            {!search && (
              <button onClick={() => navigate('/admin/hold-amount/create')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 mt-1"
                style={{ background: 'rgba(245,131,17,0.1)', color: '#f58311', border: '1px solid rgba(245,131,17,0.25)' }}>
                <PlusIcon /> Create first hold amount
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--input-bg)' }}>
                  {['#', 'User', 'Deal ID', 'Hold Amount', 'Comments', 'Date', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr key={row.id ?? idx}
                    className="transition-colors hover:bg-opacity-50"
                    style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'var(--input-bg)' }}>

                    {/* # */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg"
                        style={{ background: 'rgba(245,131,17,0.1)', color: '#f58311', border: '1px solid rgba(245,131,17,0.2)' }}>
                        {idx + 1}
                      </span>
                    </td>

                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(38,115,187,0.1)', color: '#2673bb' }}>
                          <UserIcon />
                        </div>
                        <div className="min-w-0">
                          {row.userName && (
                            <p className="font-semibold text-xs truncate max-w-[120px]" style={{ color: 'var(--text-primary)' }}>
                              {row.userName}
                            </p>
                          )}
                          <p className="font-mono text-xs truncate max-w-[120px]" style={{ color: 'var(--text-muted)' }}>
                            {row.userId ?? '—'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Deal ID */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs px-2 py-0.5 rounded-lg truncate max-w-[140px] inline-block"
                        style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)', maxWidth: 140 }}>
                        {row.dealId ? row.dealId.slice(0, 18) + '…' : '—'}
                      </span>
                    </td>

                    {/* Hold Amount */}
                    <td className="px-4 py-3">
                      <span className="font-bold text-sm" style={{ color: '#f58311' }}>
                        {fmtINR(row.holdAmount)}
                      </span>
                    </td>

                    {/* Comments */}
                    <td className="px-4 py-3 max-w-[160px]">
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)', maxWidth: 160 }} title={row.comments}>
                        {row.comments || '—'}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {fmtDate(row.createdAt ?? row.createdDate ?? row.date)}
                      </p>
                    </td>

                    {/* Action — navigate to user's deals */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/admin/hold-amount/deals/${row.userId}`, {
                          state: { holdAmount: row.holdAmount, holdId: row.id, dealId: row.dealId, userName: row.userName }
                        })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 whitespace-nowrap"
                        style={{ background: 'rgba(38,115,187,0.1)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.25)' }}>
                        View Deals <ArrowRight />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
