import { useEffect, useMemo, useState } from 'react';
import { adminGetMigratedUserInfo, updateMigratedUsersDataByAdmin } from '../../api/afterlogin-admin';

const fmtMoney = (n) => Number(n || 0).toLocaleString('en-IN');

export default function AdminMigratedTotalData() {
  const [lenderName, setLenderName] = useState(null);
  const [password, setPassword] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [editById, setEditById] = useState({});
  const [lenderId, setLenderId] = useState(null);
  const [dealName, setDealName] = useState(null);

  const totals = useMemo(() => {
    return rows.reduce((acc, row) => {
      acc.principalAmount += Number(row?.principalAmount || 0);
      acc.balancePrincipal += Number(row?.balancePrincipal || 0);
      acc.returnedPrincipal += Number(row?.returnedPrincipal || 0);
      return acc;
    }, { principalAmount: 0, balancePrincipal: 0, returnedPrincipal: 0 });
  }, [rows]);

  useEffect(() => {
     onSearch(); // Auto-fetch data on component mount
  }, [lenderName, lenderId, dealName, password]);

  const onSearch = async (e) => {
    // e.preventDefault();
    // if (!lenderName.trim()) {
    //   setError('Lender name is required.');
    //   return;
    // }
    setLoading(true);
    setError('');
    try {
      const res = await adminGetMigratedUserInfo({
        lenderName: lenderName || null,
        lenderId: lenderId || null,
        dealName: dealName || null,
        password: password || null,
      });
      const list = Array.isArray(res) ? res : res?.data ?? [];
      setRows(list);
      const initial = {};
      list.forEach((r) => {
        initial[r.id] = {
          id: r.id,
          lenderId: r.lenderId ?? '',
          lenderName: r.lenderName ?? '',
          participationDate: r.participationDate ? String(r.participationDate).slice(0, 10) : '',
          password: r.password ?? '',
          roi: r.roi ?? 0,
          interestDate: r.interestDate ?? 0,
        };
      });
      setEditById(initial);
    } catch (err) {
      setRows([]);
      setEditById({});
      setError(err.message || 'Failed to fetch migrated user data.');
    } finally {
      setLoading(false);
    }
  };

  const onFieldChange = (id, key, value) => {
    setEditById((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [key]: value },
    }));
  };

  const onUpdate = async (id) => {
    const payload = editById[id];
    if (!payload) return;
    setSavingId(id);
    setError('');
    try {
      await updateMigratedUsersDataByAdmin({
        ...payload,
        interestDate: Number(payload.interestDate || 0),
        roi: Number(payload.roi || 0),
      });
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...payload, interestDate: Number(payload.interestDate || 0), roi: Number(payload.roi || 0) } : r))
      );
    } catch (err) {
      setError(err.message || 'Update failed.');
    } finally {
      setSavingId('');
    }
  };

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#c084fc' }}>Admin</p>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Migrated Total Data</h1>
        </div>
      </div>

      <form onSubmit={onSearch} className="rounded-2xl p-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]"
        style={{ background: 'var(--card-bg)', border: '1px solid rgba(168,85,247,0.18)' }}>
        <input
          value={lenderName}
          onChange={(e) => setLenderName(e.target.value)}
          placeholder="Lender name"
          className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        />
        <input
          value={lenderId}
          onChange={(e) => setLenderId(e.target.value)}
          placeholder="Lender ID"
          className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        />
        <input
          value={dealName}
          onChange={(e) => setDealName(e.target.value)}
          placeholder="Deal name"
          className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff' }}>
          {loading ? 'Loading...' : 'Get Data'}
        </button>
      </form>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {rows.length > 0 && (
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl p-4" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Principal</p>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{fmtMoney(totals.principalAmount)}</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Returned</p>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{fmtMoney(totals.returnedPrincipal)}</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Balance</p>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{fmtMoney(totals.balancePrincipal)}</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid rgba(168,85,247,0.18)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                {['Lender ID', 'Deal', 'Principal', 'Balance', 'ROI', 'Interest Date', 'Participation Date', 'Password', 'Update'].map((h) => (
                  <th key={h} className="text-left py-3 px-3 text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading && (
                <tr><td colSpan={9} className="py-8 px-3 text-center" style={{ color: 'var(--text-muted)' }}>No data</td></tr>
              )}
              {rows.map((row) => {
                const edit = editById[row.id] || {};
                return (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-2.5 px-3">{row.lenderId || '-'}</td>
                    <td className="py-2.5 px-3">{row.dealName || '-'}</td>
                    <td className="py-2.5 px-3">{fmtMoney(row.principalAmount)}</td>
                    <td className="py-2.5 px-3">{fmtMoney(row.balancePrincipal)}</td>
                    <td className="py-2.5 px-3 min-w-[110px]">
                      <input value={edit.roi ?? ''} onChange={(e) => onFieldChange(row.id, 'roi', e.target.value)} className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
                        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                    </td>
                    <td className="py-2.5 px-3 min-w-[120px]">
                      <input value={edit.interestDate ?? ''} onChange={(e) => onFieldChange(row.id, 'interestDate', e.target.value)} className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
                        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                    </td>
                    <td className="py-2.5 px-3 min-w-[160px]">
                      <input type="date" value={edit.participationDate ?? ''} onChange={(e) => onFieldChange(row.id, 'participationDate', e.target.value)} className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
                        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                    </td>
                    <td className="py-2.5 px-3 min-w-[160px]">
                      <input value={edit.password ?? ''} onChange={(e) => onFieldChange(row.id, 'password', e.target.value)} className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
                        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => onUpdate(row.id)}
                        disabled={savingId === row.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-60"
                        style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }}>
                        {savingId === row.id ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
