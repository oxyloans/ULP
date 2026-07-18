import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Modal } from 'antd';
import { listOfMigratedDealsInfo, getDealBasedParticipationDetails, offlineDealsPrincipalReturned } from '../../api/afterlogin-admin';

// ─── Icons ────────────────────────────────────────────────────────────────────
const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

const DealsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
    : '—';

// ─── Give Principal Modal ─────────────────────────────────────────────────────
/**
 * Props:
 *   open        – boolean
 *   onClose     – () => void
 *   dealName    – string  (used as dealId)
 *   lenders     – [{ lenderId, userName, currentAmount }]
 *   onSuccess   – () => void  (refresh parent after payout)
 */
function GivePrincipalModal({ open, onClose, dealName, lenders, onSuccess }) {
  const [mode, setMode]           = useState('full');   // 'full' | 'half' | 'custom'
  const [customAmts, setCustomAmts] = useState({});     // { lenderId: string }
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]         = useState(null);   // { success, message }

  // Reset state whenever the modal opens with new lenders
  const prevOpen = useRef(false);
  useEffect(() => {
    if (open && !prevOpen.current) {
      setMode('full');
      setCustomAmts({});
      setSubmitting(false);
      setResult(null);
    }
    prevOpen.current = open;
  }, [open]);

  const resolvedAmount = (lender) => {
    const cur = lender.currentAmount ?? 0;
    if (mode === 'full')   return cur;
    if (mode === 'half')   return Math.floor(cur / 2);
    const raw = parseFloat(customAmts[lender.lenderId] ?? '');
    return isNaN(raw) ? 0 : Math.min(raw, cur);
  };

  const isValid = lenders.every(l => resolvedAmount(l) > 0);

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setResult(null);
    try {
      const offlineReturnedDto = lenders.map(l => ({
        lenderId: l.lenderId,
        returnedPrincipalAmount: resolvedAmount(l),
      }));
      await offlineDealsPrincipalReturned({ dealName, offlineReturnedDto });
      setResult({ success: true, message: `Principal dispatched to ${lenders.length} lender${lenders.length !== 1 ? 's' : ''} successfully.` });
      onSuccess?.();
    } catch (e) {
      setResult({ success: false, message: e.message ?? 'Failed to give principal. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const totalPayout = lenders.reduce((sum, l) => sum + resolvedAmount(l), 0);

  const modeBtn = (val, label) => (
    <button
      key={val}
      onClick={() => setMode(val)}
      className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
      style={{
        background: mode === val ? 'rgba(168,85,247,0.18)' : 'var(--input-bg)',
        color:      mode === val ? '#c084fc' : 'var(--text-muted)',
        border:     `1.5px solid ${mode === val ? 'rgba(168,85,247,0.5)' : 'var(--border)'}`,
      }}>
      {label}
    </button>
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="min(95vw, 680px)"
      centered
      styles={{
        content: {
          background: 'var(--card-bg)',
          border: '2px solid rgba(168,85,247,0.4)',
          borderRadius: '1.25rem',
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
        },
        header: {
          background: 'rgba(168,85,247,0.08)',
          borderBottom: '1.5px solid rgba(168,85,247,0.25)',
          borderRadius: '1.25rem 1.25rem 0 0',
          padding: '18px 28px',
          marginBottom: 0,
        },
        body: { padding: '24px 28px 28px', maxHeight: 'calc(90vh - 80px)', overflowY: 'auto' },
      }}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }}>
            <SendIcon />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold m-0" style={{ color: '#c084fc' }}>Give Principal</p>
            <p className="text-sm font-extrabold m-0 truncate max-w-xs sm:max-w-md" style={{ color: 'var(--text-primary)' }}>
              {dealName} · {lenders.length} lender{lenders.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5">

        {/* Result banner */}
        {result && (
          <div className="rounded-xl px-4 py-3 text-sm font-semibold"
            style={{
              background: result.success ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
              color:      result.success ? '#10b981' : '#ef4444',
              border:     `1px solid ${result.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
            {result.message}
          </div>
        )}

        {/* Mode selector */}
        <div>
          <p className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Payout Amount
          </p>
          <div className="flex gap-2">
            {modeBtn('full',   'Full Amount')}
            {modeBtn('half',   'Half Amount')}
            {modeBtn('custom', 'Custom Amount')}
          </div>
        </div>

        {/* Lenders list */}
        <div className="flex flex-col gap-2" style={{ maxHeight: 340, overflowY: 'auto' }}>
          {lenders.map(l => {
            const current = l.currentAmount ?? 0;
            const resolved = resolvedAmount(l);
            return (
              <div key={l.lenderId}
                className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {l.userName ?? l.lenderId}
                  </p>
                  <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>
                    Available: {fmt(current)}
                  </p>
                </div>
                {mode === 'custom' ? (
                  <div className="flex flex-col items-end gap-1">
                    <input
                      type="number"
                      min={1}
                      max={current}
                      placeholder="Amount"
                      value={customAmts[l.lenderId] ?? ''}
                      onChange={e => setCustomAmts(prev => ({ ...prev, [l.lenderId]: e.target.value }))}
                      className="w-36 px-3 py-1.5 rounded-lg text-sm text-right outline-none"
                      style={{
                        background: 'var(--input-bg)',
                        border: `1px solid ${(!customAmts[l.lenderId] || parseFloat(customAmts[l.lenderId]) <= 0) ? '#ef4444' : 'rgba(168,85,247,0.4)'}`,
                        color: 'var(--text-primary)',
                      }}
                    />
                    {customAmts[l.lenderId] && parseFloat(customAmts[l.lenderId]) > current && (
                      <p className="text-xs" style={{ color: '#ef4444' }}>Exceeds available</p>
                    )}
                  </div>
                ) : (
                  <span className="text-sm font-bold tabular-nums" style={{ color: '#c084fc' }}>
                    {fmt(resolved)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Total + Submit */}
        <div className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
          style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Total Payout</p>
            <p className="text-xl font-extrabold tabular-nums" style={{ color: '#c084fc' }}>{fmt(totalPayout)}</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting || !!result?.success}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc', border: '1.5px solid rgba(168,85,247,0.4)' }}>
            {submitting ? (
              <div className="w-4 h-4 rounded-full border-2 animate-spin"
                style={{ borderColor: '#c084fc', borderTopColor: 'transparent' }} />
            ) : (
              <SendIcon />
            )}
            {submitting ? 'Processing…' : 'Confirm Payout'}
          </button>
        </div>

      </div>
    </Modal>
  );
}

// ─── Custom Checkbox ──────────────────────────────────────────────────────────
function Checkbox({ checked, indeterminate, onChange, disabled }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);
  return (
    <label className="relative inline-flex items-center justify-center cursor-pointer"
      style={{ width: 18, height: 18 }}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <span
        className="flex items-center justify-center rounded"
        style={{
          width: 16,
          height: 16,
          background: checked || indeterminate ? 'rgba(168,85,247,0.2)' : 'var(--input-bg)',
          border: `2px solid ${checked || indeterminate ? 'rgba(168,85,247,0.7)' : 'var(--border)'}`,
          transition: 'all 0.15s',
          opacity: disabled ? 0.4 : 1,
        }}>
        {checked && !indeterminate && <CheckIcon />}
        {indeterminate && (
          <svg viewBox="0 0 10 2" className="w-2.5 h-0.5" fill="none">
            <line x1="1" y1="1" x2="9" y2="1" stroke="#c084fc" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </span>
    </label>
  );
}

// ─── Participation Modal Content ──────────────────────────────────────────────
function ParticipationModalContent({ dealName }) {
  const [details,   setDetails]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [search,    setSearch]    = useState('');
  const [selected,  setSelected]  = useState(new Set()); // Set of lenderId strings
  const [gpModal,   setGpModal]   = useState(null);      // { lenders: [...] } | null

  const loadDetails = useCallback(() => {
    if (!dealName) return;
    setLoading(true);
    setError('');
    setDetails(null);
    setSearch('');
    setSelected(new Set());
    getDealBasedParticipationDetails(dealName)
      .then(res => setDetails(res))
      .catch(e => setError(e.message ?? 'Failed to load participation details'))
      .finally(() => setLoading(false));
  }, [dealName]);

  useEffect(() => { loadDetails(); }, [loadDetails]);

  const lenders = useMemo(() => {
    if (!details?.lendersList) return [];
    const q = search.trim().toLowerCase();
    if (!q) return details.lendersList;
    return details.lendersList.filter(l =>
      (l.userName     ?? '').toLowerCase().includes(q) ||
      (l.lenderId     ?? '').toLowerCase().includes(q) ||
      (l.mobileNumber ?? '').toLowerCase().includes(q) ||
      (l.email        ?? '').toLowerCase().includes(q)
    );
  }, [details, search]);

  // Only lenders with currentAmount > 0 can receive principal
  const eligibleIds  = useMemo(() => new Set(lenders.filter(l => (l.currentAmount ?? 0) > 0).map(l => l.lenderId)), [lenders]);
  const selectedEligible = [...selected].filter(id => eligibleIds.has(id));
  const allEligibleSelected = eligibleIds.size > 0 && selectedEligible.length === eligibleIds.size;
  const someSelected = selectedEligible.length > 0 && !allEligibleSelected;

  const toggleAll = () => {
    if (allEligibleSelected) {
      setSelected(prev => { const n = new Set(prev); eligibleIds.forEach(id => n.delete(id)); return n; });
    } else {
      setSelected(prev => new Set([...prev, ...eligibleIds]));
    }
  };

  const toggleOne = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const openBulkGivePrincipal = () => {
    const picked = lenders.filter(l => selectedEligible.includes(l.lenderId));
    if (picked.length) setGpModal({ lenders: picked });
  };

  const openSingleGivePrincipal = (lender) => {
    setGpModal({ lenders: [lender] });
  };

  if (loading) return (
    <div className="flex items-center justify-center gap-3 py-16">
      <div className="w-5 h-5 rounded-full border-2 animate-spin"
        style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }} />
      <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading participation data…</span>
    </div>
  );

  if (error) return (
    <div className="py-12 text-center">
      <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
    </div>
  );

  if (!details) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Give Principal modal (nested) */}
      {gpModal && (
        <GivePrincipalModal
          open
          onClose={() => setGpModal(null)}
          dealName={dealName}
          lenders={gpModal.lenders}
          onSuccess={() => { setGpModal(null); setSelected(new Set()); loadDetails(); }}
        />
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'ROI',                value: details.roi != null ? `${details.roi}%` : '—', color: '#10b981' },
          { label: 'Interest Date',      value: details.interestDate ?? '—',                   color: '#c084fc' },
          { label: 'Total Participated', value: fmt(details.totalParticipationAmount),          color: '#3b82f6' },
          { label: 'Active Amount',      value: fmt(details.activeParticipationAmount),         color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-4 text-center"
            style={{
              background: 'var(--surface-elevated)',
              border: `1.5px solid ${color}40`,
              boxShadow: `0 2px 12px ${color}15`,
            }}>
            <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="text-base font-extrabold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(168,85,247,0.15)', margin: '4px 0' }} />

      {/* Toolbar: search + bulk give principal */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Search */}
        <div className="flex-1">
          <div className="relative w-full sm:max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-muted)' }}>
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search by name, lender ID, mobile…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: 'var(--text-muted)' }}>✕</button>
            )}
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
            {lenders.length} lender{lenders.length !== 1 ? 's' : ''}
            {search.trim() ? ` matching "${search.trim()}"` : ' total'}
          </p>
        </div>

        {/* Bulk Give Principal button — visible when ≥1 eligible lender is checked */}
        {selectedEligible.length > 0 && (
          <button
            onClick={openBulkGivePrincipal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(168,85,247,0.18)', color: '#c084fc', border: '1.5px solid rgba(168,85,247,0.45)', whiteSpace: 'nowrap' }}>
            <SendIcon />
            Give Principal
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-extrabold"
              style={{ background: 'rgba(168,85,247,0.3)', color: '#e9d5ff' }}>
              {selectedEligible.length}
            </span>
          </button>
        )}
      </div>

      {/* Lenders table */}
      {lenders.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No lenders found</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Try adjusting your search</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                {/* Select-all checkbox */}
                <th className="py-3 px-4 w-10">
                  <Checkbox
                    checked={allEligibleSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                    disabled={eligibleIds.size === 0}
                  />
                </th>
                {['#', 'Lender ID', 'Name', 'Total Participated', 'Returned', 'Current', 'Action'].map(h => (
                  <th key={h}
                    className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold whitespace-nowrap"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lenders.map((l, i) => {
                const total      = l.totalParticipationAmount ?? 0;
                const returned   = l.returnedAmount ?? 0;
                const current    = l.currentAmount  ?? 0;
                const isFullyReturned = total > 0 && returned >= total && current === 0;
                const isEligible = current > 0;
                const isChecked  = selected.has(l.lenderId);

                // Row bg: fully-returned > checked > default
                const rowBg = isFullyReturned
                  ? 'rgba(16,185,129,0.07)'
                  : isChecked
                    ? 'rgba(168,85,247,0.06)'
                    : 'transparent';

                const rowHoverBg = isFullyReturned
                  ? 'rgba(16,185,129,0.12)'
                  : isChecked
                    ? 'rgba(168,85,247,0.06)'
                    : 'rgba(168,85,247,0.04)';

                return (
                  <tr key={l.lenderId ?? i}
                    style={{
                      borderBottom: isFullyReturned
                        ? '1px solid rgba(16,185,129,0.2)'
                        : '1px solid var(--border)',
                      background: rowBg,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = rowHoverBg; }}
                    onMouseLeave={e => { e.currentTarget.style.background = rowBg; }}>

                    {/* Row checkbox */}
                    <td className="py-3 px-4">
                      <Checkbox
                        checked={isChecked}
                        onChange={() => toggleOne(l.lenderId)}
                        disabled={!isEligible}
                      />
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs px-2 py-0.5 rounded-md"
                        style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>
                        {l.lenderId ?? '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold" style={{ color: isFullyReturned ? '#10b981' : 'var(--text-primary)' }}>
                          {l.userName ?? '—'}
                        </span>
                        {isFullyReturned && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-bold"
                            style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                            <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
                              <polyline points="2 6 5 9 10 3" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Settled
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-xs font-semibold tabular-nums"
                        style={{ color: isFullyReturned ? '#10b981' : '#3b82f6' }}>
                        {fmt(total)}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-xs font-semibold tabular-nums"
                        style={{ color: isFullyReturned ? '#10b981' : '#10b981' }}>
                        {fmt(returned)}
                        {isFullyReturned && (
                          <span className="ml-1 text-xs" style={{ color: '#6ee7b7' }}>✓ Full</span>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tabular-nums"
                        style={
                          isFullyReturned
                            ? { background: 'rgba(16,185,129,0.12)', color: '#10b981',      border: '1px solid rgba(16,185,129,0.35)' }
                            : isEligible
                              ? { background: 'rgba(245,158,11,0.1)',  color: '#f59e0b',      border: '1px solid rgba(245,158,11,0.25)' }
                              : { background: 'rgba(100,116,139,0.1)', color: 'var(--text-muted)', border: '1px solid rgba(100,116,139,0.2)' }
                        }>
                        {isFullyReturned ? '₹0 — Settled' : fmt(current)}
                      </span>
                    </td>

                    {/* Per-row Give Principal */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isFullyReturned ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                          <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                            <polyline points="2 6 5 9 10 3" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Done
                        </span>
                      ) : (
                        <button
                          disabled={!isEligible}
                          onClick={() => openSingleGivePrincipal(l)}
                          title={isEligible ? 'Give Principal' : 'No current amount'}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                          style={{ background: 'rgba(168,85,247,0.12)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
                          <SendIcon />
                          Give
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminMigratedDeals() {
  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');
  const [modalDeal,  setModalDeal]  = useState(null); // deal name string | null

  const load = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    listOfMigratedDealsInfo()
      .then(res => setData(Array.isArray(res) ? res : res?.data ?? []))
      .catch(e => setError(e.message ?? 'Failed to load migrated deals'))
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(d =>
      (d.dealName ?? '').toLowerCase().includes(q) ||
      String(d.roi ?? '').includes(q) ||
      String(d.interestDate ?? '').toLowerCase().includes(q)
    );
  }, [data, search]);

  const cols = ['#', 'Deal Name', 'ROI (%)', 'Interest Date', 'Participants'];

  return (
    <>
      <div className="grid gap-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }}>
              <DealsIcon />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#c084fc' }}>Admin</p>
              <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Migrated Deals</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data.length > 0 && (
              <div className="px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.25)' }}>
                {filtered.length}{filtered.length !== data.length ? `/${data.length}` : ''} deal{data.length !== 1 ? 's' : ''}
              </div>
            )}
            <button onClick={() => load(true)} disabled={refreshing}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <span className={refreshing ? 'animate-spin' : ''}><RefreshIcon /></span>
            </button>
          </div>
        </div>

        {/* Table card */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--card-bg)', border: '1px solid rgba(168,85,247,0.18)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

          {/* Card header + search */}
          <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
            style={{ borderBottom: '1px solid var(--border)', background: 'rgba(168,85,247,0.04)' }}>
            <div className="flex items-center gap-2 flex-1">
              <span style={{ color: '#c084fc' }}><DealsIcon /></span>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Deal Records</span>
            </div>
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}>
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search deals…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: 'var(--text-muted)' }}>✕</button>
              )}
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-3 py-16">
              <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading migrated deals…</span>
            </div>
          )}

          {!loading && error && (
            <div className="py-12 text-center">
              <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
              <button onClick={() => load()} className="mt-3 text-xs underline" style={{ color: '#c084fc' }}>Retry</button>
            </div>
          )}

          {!loading && !error && data.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-3xl mb-3">📦</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No migrated deals yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Deal records will appear here</p>
            </div>
          )}

          {!loading && !error && data.length > 0 && filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-3xl mb-3">🔍</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No deals match "{search}"</p>
              <button onClick={() => setSearch('')} className="mt-3 text-xs underline" style={{ color: '#c084fc' }}>Clear search</button>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                    {cols.map(h => (
                      <th key={h}
                        className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold whitespace-nowrap"
                        style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((deal, idx) => (
                    <tr key={idx}
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(168,85,247,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>{idx + 1}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{deal.dealName ?? '—'}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                          {deal.roi != null ? `${deal.roi}%` : '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs px-2 py-0.5 rounded-md"
                          style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>
                          {deal.interestDate ?? '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => setModalDeal(deal.dealName)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                          style={{ background: 'rgba(168,85,247,0.12)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
                          <UsersIcon />
                          View
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

      {/* Antd Modal */}
      <Modal
        open={!!modalDeal}
        onCancel={() => setModalDeal(null)}
        footer={null}
        width="min(95vw, 1100px)"
        centered
        styles={{
          content: {
            background: 'var(--card-bg)',
            border: '2px solid rgba(168,85,247,0.4)',
            borderRadius: '1.25rem',
            padding: 0,
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          },
          header: {
            background: 'rgba(168,85,247,0.08)',
            borderBottom: '1.5px solid rgba(168,85,247,0.25)',
            borderRadius: '1.25rem 1.25rem 0 0',
            padding: '18px 28px',
            marginBottom: 0,
          },
          body: {
            padding: '24px 28px 28px',
            maxHeight: 'calc(90vh - 80px)',
            overflowY: 'auto',
          },
        }}
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }}>
              <UsersIcon />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold m-0" style={{ color: '#c084fc' }}>
                Participation Details
              </p>
              <p className="text-sm font-extrabold m-0 truncate max-w-xs sm:max-w-lg"
                style={{ color: 'var(--text-primary)' }}>
                {modalDeal}
              </p>
            </div>
          </div>
        }
      >
        <ParticipationModalContent dealName={modalDeal} />
      </Modal>
    </>
  );
}
