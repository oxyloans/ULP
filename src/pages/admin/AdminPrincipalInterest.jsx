import { useState, useEffect, useMemo } from 'react';
import { formatINR } from '../../utils/currency';
import { getAdminDeals, getPrincipalInterestInitiatedUsers } from '../../api/afterlogin-admin';

// ─── Icons ────────────────────────────────────────────────────────────────────
const RefreshIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const SearchIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const DownloadIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const ArrowLeft = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const UserIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const DollarIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const CalendarIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const SpinnerIcon = () => <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }} />;

const TABS = [
  { key: 'NORMAL', label: 'Running Deals', color: '#10b981' },
  { key: 'closed', label: 'Closed Deals', color: '#6366f1' },
  { key: 'TEST', label: 'Test Deals', color: '#f59e0b' }
];

export default function AdminPrincipalInterest() {
  const [activeTab, setActiveTab] = useState('NORMAL');
  const [deals, setDeals] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const [dealsError, setDealsError] = useState('');
  
  // Drilldown selection states
  const [selectedDeal, setSelectedDeal] = useState(null); // Selected deal object
  const [fileType, setFileType] = useState('principal'); // principal, principalinterest
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');

  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [dealSearch, setDealSearch] = useState('');

  // Load Deals
  const loadDeals = (tab = activeTab) => {
    setLoadingDeals(true);
    setDealsError('');
    getAdminDeals(tab)
      .then(res => {
        const list = res?.listOfLendersInformation ?? (Array.isArray(res) ? res : []);
        setDeals(list);
      })
      .catch(err => {
        setDealsError(err.message || 'Failed to load deals.');
        setDeals([]);
      })
      .finally(() => setLoadingDeals(false));
  };

  useEffect(() => {
    setDealSearch('');
    loadDeals(activeTab);
  }, [activeTab]);

  // Load Initiated Users
  const loadInitiatedUsers = (dealId, type) => {
    setLoadingUsers(true);
    setUsersError('');
    getPrincipalInterestInitiatedUsers(dealId, type)
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.listOfUsers || res?.initiatedUsers || res?.users || res?.data || res?.listOfLenders || []);
        setUsers(list);
      })
      .catch(err => {
        setUsersError(err.message || 'Failed to fetch initiated users.');
        setUsers([]);
      })
      .finally(() => setLoadingUsers(false));
  };

  useEffect(() => {
    if (selectedDeal) {
      const dealId = selectedDeal.dealId || selectedDeal.id;
      loadInitiatedUsers(dealId, fileType);
    }
  }, [selectedDeal, fileType]);

  // Drilldown Stats Calculations
  const stats = useMemo(() => {
    return users.reduce((acc, row) => {
      const principalAmt = row.principalAmount ?? 0;
      const interestAmt = row.princInterestAmount ?? 0;
      
      acc.totalPrincipal += Number(principalAmt) || 0;
      acc.totalInterest += Number(interestAmt) || 0;
      acc.totalCount += 1;

      return acc;
    }, {
      totalPrincipal: 0,
      totalInterest: 0,
      totalCount: 0
    });
  }, [users]);

  // Filter initiated users
  const filteredUsers = useMemo(() => {
    return users.filter(row => {
      const name = (row.userName || '').toLowerCase();
      const uid = (row.userId || '').toLowerCase();
      
      return name.includes(searchTerm.toLowerCase()) || uid.includes(searchTerm.toLowerCase());
    });
  }, [users, searchTerm]);

  // Filter deals
  const filteredDeals = useMemo(() => {
    return deals.filter(d =>
      !dealSearch || d.dealName?.toLowerCase().includes(dealSearch.toLowerCase())
    );
  }, [deals, dealSearch]);

  // Export CSV
  const handleExportCSV = () => {
    if (!selectedDeal) return;
    const headers = fileType === 'principal'
      ? ['Record #', 'Lender Name', 'Lender ID', 'Bank Name', 'Acc No', 'IFSC', 'Principal Amount (INR)', 'Difference Days']
      : ['Record #', 'Lender Name', 'Lender ID', 'Bank Name', 'Acc No', 'IFSC', 'Principal Amount (INR)', 'Interest Amount (INR)', 'Difference Days'];

    const lines = [
      headers.join(','),
      ...filteredUsers.map((row, index) => {
        const name = row.userName || '—';
        const uid = row.userId || '—';
        const bank = row.bankName || '—';
        const acc = row.accNo || '—';
        const ifsc = row.ifsc || '—';
        const principalAmt = row.principalAmount ?? 0;
        const interestAmt = row.princInterestAmount ?? 0;
        const diffDays = row.diferenceDays ?? 0;

        const fields = fileType === 'principal'
          ? [index + 1, `"${name}"`, uid, `"${bank}"`, `"${acc}"`, ifsc, principalAmt, diffDays]
          : [index + 1, `"${name}"`, uid, `"${bank}"`, `"${acc}"`, ifsc, principalAmt, interestAmt, diffDays];
        
        return fields.join(',');
      })
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDeal.dealName}_Initiated_${fileType}_Report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectDeal = (deal, type) => {
    setFileType(type);
    setSelectedDeal(deal);
    setSearchTerm('');
  };

  const handleBack = () => {
    setSelectedDeal(null);
    setUsers([]);
    loadDeals(activeTab);
  };

  // ─── Render Drilldown (Details list) ───
  if (selectedDeal) {
    const dealId = selectedDeal.dealId || selectedDeal.id;
    return (
      <div className="grid gap-6 animate-fade-in">
        
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              <ArrowLeft />
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {selectedDeal.dealName}
              </h1>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                Initiated returns &bull; ID: {String(dealId).slice(0, 8)}…
              </p>
            </div>
          </div>

          {/* Toggle File Type */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
            {[
              { key: 'principal', label: 'Principal Returns' },
              { key: 'principalinterest', label: 'P&I Returns' }
            ].map(type => (
              <button
                key={type.key}
                onClick={() => setFileType(type.key)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={fileType === type.key
                  ? { background: 'var(--role-primary)', color: '#fff' }
                  : { background: 'transparent', color: 'var(--text-muted)' }
                }
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Users API Error Banner */}
        {usersError && (
          <div className="px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
            <span>Error: {usersError}</span>
            <button onClick={() => setUsersError('')} style={{ color: '#ef4444' }} className="font-bold text-xs">Dismiss</button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl flex items-center justify-between"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <div className="grid gap-1">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Total Principal
              </span>
              <span className="text-xl font-black font-mono text-purple-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {formatINR(stats.totalPrincipal)}
              </span>
              <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                Principal returns value
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-purple-500" style={{ background: 'var(--input-bg)' }}>
              <DollarIcon />
            </div>
          </div>

          {fileType === 'principalinterest' && (
            <div className="p-5 rounded-2xl flex items-center justify-between animate-fade-in"
              style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
              <div className="grid gap-1">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Total Interest
                </span>
                <span className="text-xl font-black font-mono text-emerald-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatINR(stats.totalInterest)}
                </span>
                <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Interest returns value
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-emerald-500" style={{ background: 'var(--input-bg)' }}>
                <DollarIcon />
              </div>
            </div>
          )}

          <div className="p-5 rounded-2xl flex items-center justify-between"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <div className="grid gap-1">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Lenders Count
              </span>
              <span className="text-xl font-black font-mono text-indigo-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {stats.totalCount}
              </span>
              <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                Number of return requests
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-indigo-500" style={{ background: 'var(--input-bg)' }}>
              <UserIcon />
            </div>
          </div>

          <div className="p-5 rounded-2xl flex items-center justify-between"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <div className="grid gap-1">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Remaining Deal value
              </span>
              <span className="text-xl font-black font-mono text-amber-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {formatINR(selectedDeal.remainingDealValue ?? selectedDeal.currentDealValue ?? 0)}
              </span>
              <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                Available deal value
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-amber-500" style={{ background: 'var(--input-bg)' }}>
              <CalendarIcon />
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex justify-between items-center gap-3 p-4 rounded-2xl"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search by lender name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-semibold rounded-xl outline-none"
              style={{
                padding: '10px 14px 10px 40px',
                background: 'var(--input-bg)',
                border: '1.5px solid var(--border)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* <button
            onClick={handleExportCSV}
            disabled={filteredUsers.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            style={{
              background: 'var(--role-gradient)',
              boxShadow: '0 4px 14px var(--role-primary)'
            }}
          >
            <DownloadIcon /> Export CSV
          </button> */}
        </div>

        {/* Details Table */}
        <div className="overflow-x-auto rounded-2xl border relative" style={{ borderColor: 'var(--border)', background: 'var(--surface-card)' }}>
          {loadingUsers && (
            <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}>
              <SpinnerIcon />
            </div>
          )}
          
          <table className="w-full text-sm text-left">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--input-bg)' }}>
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>#</th>
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Lender Details</th>
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Bank Details</th>
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Principal Amount</th>
                {fileType === 'principalinterest' && (
                  <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Interest Amount</th>
                )}
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Difference Days</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={fileType === 'principalinterest' ? 6 : 5} className="py-16 text-center text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                    {loadingUsers ? 'Loading initiated users...' : 'No initiated users found for this deal.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((row, index) => {
                  const name = row.userName || '—';
                  const uid = row.userId || '—';
                  const bank = row.bankName || '—';
                  const acc = row.accNo || '—';
                  const ifsc = row.ifsc || '—';
                  const principalAmt = row.principalAmount ?? 0;
                  const interestAmt = row.princInterestAmount ?? 0;
                  const diffDays = row.diferenceDays ?? 0;

                  return (
                    <tr key={uid + '-' + index} className="transition-colors hover:bg-neutral-500/5" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-4 px-4 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                      <td className="py-4 px-4">
                        <div className="grid gap-0.5">
                          <span className="font-bold text-[13px]" style={{ color: 'var(--text-primary)' }}>{name}</span>
                          <span className="font-mono text-[10px]  font-bold" style={{ color: 'var(--text-muted)' }}>{uid}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="grid gap-0.5 text-xs">
                          <p style={{ color: 'var(--text-primary)' }} className="font-semibold">{bank}</p>
                          <p style={{ color: 'var(--text-muted)' }} className="font-mono text-[10px]">A/C: {acc} | IFSC: {ifsc}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-black font-mono text-xs text-purple-500">{formatINR(principalAmt)}</td>
                      {fileType === 'principalinterest' && (
                        <td className="py-4 px-4 font-black font-mono text-xs text-emerald-500">{formatINR(interestAmt)}</td>
                      )}
                      <td className="py-4 px-4 font-black font-mono text-xs text-amber-500">{diffDays} days</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    );
  }

  // ─── Render Main Deals View ───
  return (
    <div className="grid gap-6 animate-fade-in">
      
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Principal &amp; Interest Return Lists
          </h1>
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)', mt: 1 }}>
            Select a deal type and deal to view the detailed list of initiated return requests.
          </p>
        </div>
        <button
          onClick={() => loadDeals(activeTab)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        >
          <RefreshIcon /> Refresh
        </button>
      </div>

      {/* Deals API Error Banner */}
      {dealsError && (
        <div className="px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
          <span>Error: {dealsError}</span>
          <button onClick={() => setDealsError('')} style={{ color: '#ef4444' }} className="font-bold text-xs">Dismiss</button>
        </div>
      )}

      {/* Tab controls & Search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 p-1 rounded-2xl flex-shrink-0"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className="px-5 py-2 rounded-xl text-sm font-bold transition-all"
              style={activeTab === t.key
                ? { background: t.color, color: '#fff', boxShadow: `0 4px 14px ${t.color}35` }
                : { background: 'transparent', color: 'var(--text-muted)' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search deal name..."
            value={dealSearch}
            onChange={(e) => setDealSearch(e.target.value)}
            className="w-full text-xs font-semibold rounded-xl outline-none"
            style={{
              padding: '10px 14px 10px 40px',
              background: 'var(--input-bg)',
              border: '1.5px solid var(--border)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
      </div>

      {/* Deals Table */}
      <div className="overflow-x-auto rounded-2xl border relative" style={{ borderColor: 'var(--border)', background: 'var(--surface-card)' }}>
        {loadingDeals && (
          <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}>
            <SpinnerIcon />
          </div>
        )}

        <table className="w-full text-sm text-left">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--input-bg)' }}>
              {['#', 'Deal Name', 'Deal Size', 'ROI', 'Remaining Amount', 'Action Options'].map((h, idx) => (
                <th key={idx} className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredDeals.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {loadingDeals ? 'Loading deals...' : `No deals found matching "${dealSearch}"`}
                </td>
              </tr>
            ) : (
              filteredDeals.map((deal, idx) => {
                const total = deal.dealValue ?? deal.dealAmount ?? 0;
                const remaining = deal.remainingDealValue ?? deal.currentDealValue ?? 0;
                const roi = deal.rateofinterest ?? deal.monthlyInterest ?? '—';
                const dealId = deal.dealId || deal.id;

                return (
                  <tr key={dealId || idx} className="transition-colors hover:bg-neutral-500/5" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-4 px-4 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-[13px]" style={{ color: 'var(--text-primary)' }}>{deal.dealName}</p>
                      <p className="font-mono text-[9px] mt-0.5 text-neutral-400">{String(dealId).slice(0, 8)}…</p>
                    </td>
                    <td className="py-4 px-4 font-black font-mono text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatINR(total)}</td>
                    <td className="py-4 px-4 font-bold font-mono text-xs text-amber-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{roi}%</td>
                    <td className="py-4 px-4 font-black font-mono text-xs text-indigo-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatINR(remaining)}</td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSelectDeal(deal, 'principal')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 text-white"
                          style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
                        >
                          Principal Returns
                        </button>
                        <button
                          onClick={() => handleSelectDeal(deal, 'principalinterest')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                          style={{
                            background: 'var(--input-bg)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          P&amp;I Returns
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
