import { useState, useEffect, useMemo, Fragment } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL, getToken } from '../../api/client';
import { getUserViewInterestStatement } from '../../api/afterlogin-user';

// ─── Icons ────────────────────────────────────────────────────────────────────
const LockIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const ArrowLeft   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const RefreshIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const SendIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const ChevDown    = ({ open }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }}><polyline points="6 9 12 15 18 9"/></svg>;
const InfoIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const CheckIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>;
const CoinIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9 9h4a2 2 0 0 1 0 4H9v4h6"/></svg>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const AMBER  = '#f59e0b';
const GREEN  = '#10b981';
const INDIGO = '#6366f1';
const PURPLE = '#a855f7';
const RED    = '#ef4444';

function fmtINR(n) {
  if (n == null || n === '') return '—';
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function fmtDate(raw) {
  if (!raw) return '—';
  try {
    const d = new Date(raw);
    return isNaN(d) ? raw : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return raw; }
}

function InterestStatusChip({ status }) {
  const s = String(status ?? '').toUpperCase();
  const cfg =
    s === 'EXECUTED' || s === 'PAID'       ? { bg: `${GREEN}18`,  color: GREEN,  label: 'Paid'       } :
    s === 'GENERATED' || s === 'PROCESSING' ? { bg: `${INDIGO}18`, color: INDIGO, label: 'Generated'  } :
    s === 'INITIATED'                       ? { bg: `${AMBER}18`,  color: AMBER,  label: 'Initiated'  } :
                                              { bg: `${AMBER}18`,  color: AMBER,  label: s || 'Pending' };
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

function InterestTable({ rows = [] }) {
  const total = rows.reduce(
    (sum, row) => sum + (Number(row?.interestAmount ?? row?.amount) || 0),
    0
  );

  if (rows.length === 0) {
    return (
      <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>
        No interest records found
      </p>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface-card)' }}>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-xs" style={{ minWidth: 520 }}>
          <thead>
            <tr style={{ background: 'var(--input-bg)' }}>
              {['#', 'Interest Date', 'Days', 'Interest', 'Paid Date', 'Status'].map(header => (
                <th key={header} className="text-left py-2.5 px-3 font-black uppercase tracking-wider whitespace-nowrap"
                  style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row?.id ?? row?.interestId ?? index} style={{ borderTop: '1px solid var(--border)' }}>
                <td className="py-2.5 px-3 font-bold" style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                  {row?.actualInterestDate ?? row?.interestDate ?? row?.date ?? '—'}
                </td>
                <td className="py-2.5 px-3 font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {row?.days ?? row?.numberOfDays ?? '—'}
                </td>
                <td className="py-2.5 px-3 font-black tabular-nums whitespace-nowrap"
                  style={{ color: AMBER, fontFamily: "'JetBrains Mono',monospace" }}>
                  {fmtINR(row?.interestAmount ?? row?.amount ?? 0)}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                  {row?.paidDate ?? row?.paymentDate ?? '—'}
                </td>
                <td className="py-2.5 px-3"><InterestStatusChip status={row?.status ?? row?.interestStatus} /></td>
              </tr>
            ))}
            <tr style={{ borderTop: `2px solid ${AMBER}30`, background: `${AMBER}07` }}>
              <td colSpan={3} className="py-2.5 px-3 font-black uppercase text-[10px] tracking-wider" style={{ color: AMBER }}>
                Total Interest
              </td>
              <td className="py-2.5 px-3 font-black tabular-nums whitespace-nowrap"
                style={{ color: AMBER, fontFamily: "'JetBrains Mono',monospace" }}>
                {fmtINR(total)}
              </td>
              <td colSpan={2} />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Amount type options for the mapping modal
const AMOUNT_TYPES = [
  'LENDERINTEREST',
  'LENDERPRINCIPAL',
  'PRINCIPALINTEREST',
];

// ─── Map Hold Amount Modal ────────────────────────────────────────────────────
function MapHoldModal({ deal, userId, holdAmount, onClose, onSuccess }) {
  const token = getToken();
  const [amountType, setAmountType] = useState('LENDERINTEREST');
  const [mapAmount,  setMapAmount]  = useState(String(holdAmount ?? ''));
  const [amountErr,  setAmountErr]  = useState('');
  const [loading,    setLoading]    = useState(false);

  const handleSubmit = async () => {
    if (!mapAmount || isNaN(Number(mapAmount)) || Number(mapAmount) <= 0) {
      setAmountErr('Enter a valid positive amount'); return;
    }
    setAmountErr('');
    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/oxybrick-service/mapHoldAmountToDeal/${userId}`,
        {
          userHoldAmountMappedToDealRequestDto: [{
            amountType,
            dealId:     deal.dealId,
            holdAmount: Number(mapAmount),
            userId,
          }],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Hold amount mapped to deal successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Mapping failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="rounded-2xl w-full max-w-md overflow-hidden"
        style={{ background: 'var(--surface-card)', border: '1px solid rgba(245,131,17,0.3)', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 flex items-center gap-3"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(245,131,17,0.05)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(245,131,17,0.12)', border: '1px solid rgba(245,131,17,0.25)', color: '#f58311' }}>
            <LockIcon />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Map Hold Amount to Deal</h3>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
              {deal.dealName ?? deal.dealId}
            </p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 grid gap-4">
          {/* Deal info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { label: 'Deal ID',    value: deal.dealId ? deal.dealId.slice(0, 18) + '…' : '—' },
              { label: 'Deal Name',  value: deal.dealName  ?? '—' },
              { label: 'Investment', value: fmtINR(deal.investmentAmount ?? deal.participationAmount) },
              { label: 'Hold Amt',   value: fmtINR(holdAmount) },
            ].map(m => (
              <div key={m.label} className="px-3 py-2 rounded-xl"
                style={{ background: 'rgba(245,131,17,0.06)', border: '1px solid rgba(245,131,17,0.15)' }}>
                <p style={{ color: 'var(--text-muted)' }}>{m.label}</p>
                <p className="font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Amount type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Amount Type <span style={{ color: '#e95330' }}>*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {AMOUNT_TYPES.map(t => (
                <button key={t} type="button" onClick={() => setAmountType(t)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: amountType === t ? 'rgba(245,131,17,0.15)' : 'var(--input-bg)',
                    color:      amountType === t ? '#f58311' : 'var(--text-muted)',
                    border:     `1px solid ${amountType === t ? 'rgba(245,131,17,0.4)' : 'var(--border)'}`,
                  }}>
                  {t === amountType && <CheckIcon />} {t}
                </button>
              ))}
            </div>
          </div>

          {/* Map amount */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Amount to Map (₹) <span style={{ color: '#e95330' }}>*</span>
            </label>
            <input
              type="number"
              min="1"
              className="w-full rounded-xl px-3 py-2.5 text-sm"
              style={{ background: 'var(--input-bg)', border: `1px solid ${amountErr ? '#e95330' : 'var(--input-border)'}`, color: 'var(--text-primary)', outline: 'none' }}
              value={mapAmount}
              onChange={e => { setMapAmount(e.target.value); setAmountErr(''); }}
              placeholder="Enter amount"
            />
            {amountErr && <p className="text-xs mt-1" style={{ color: '#e95330' }}>{amountErr}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#f58311,#d4690a)', color: '#fff', boxShadow: '0 4px 14px rgba(245,131,17,0.35)' }}>
            {loading
              ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
              : <SendIcon />}
            {loading ? 'Mapping…' : 'Map Hold Amount'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Interest Statement (fetched via getUserViewInterestStatement) ─────────────
function InterestStatement({ dealId, dealName, userId }) {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [expandedIdx, setExpandedIdx] = useState(null);

  const load = () => {
    if (!dealId) return;
    setLoading(true);
    setError('');
    getUserViewInterestStatement(dealId, userId)
      .then(res => setData(res))
      .catch(e => setError(e?.message ?? 'Failed to load interest statement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [dealId, userId]);

  const rows = data?.participationInterestStatement ?? [];
  const totalInterest = useMemo(
    () => rows.reduce((s, r) => s + Number(r?.interestAmount ?? 0), 0), [rows]
  );
  const firstRow            = rows[0] ?? {};
  const participationAmount = data?.totalParticipationAmount ?? firstRow?.participationAmount ?? null;
  const participationDate   = firstRow?.participationDate ?? null;

  if (loading) return (
    <div className="flex items-center justify-center gap-2 py-6">
      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2">
        <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
      </svg>
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading interest statement…</span>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
      style={{ background: `${RED}0d`, border: `1px solid ${RED}30` }}>
      <span className="text-xs font-semibold" style={{ color: RED }}>{error}</span>
      <button onClick={load}
        className="text-xs font-bold px-3 py-1 rounded-lg transition-all hover:scale-105"
        style={{ background: `${INDIGO}12`, color: INDIGO, border: `1px solid ${INDIGO}25` }}>
        Retry
      </button>
    </div>
  );

  if (rows.length === 0) return (
    <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>No interest records found</p>
  );

  return (
    <div className="grid gap-3">
      {/* KPI summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Amount Invested',     value: participationAmount != null ? fmtINR(participationAmount) : '—', color: INDIGO },
          { label: 'Participation Date',  value: participationDate ?? '—',                                         color: GREEN  },
          { label: 'Total Interest',      value: fmtINR(totalInterest),                                            color: AMBER  },
          { label: 'ROI',                 value: data?.roi != null ? `${data.roi}%` : '—',                        color: GREEN  },
        ].map(k => (
          <div key={k.label} className="rounded-xl px-3 py-2"
            style={{ background: `${k.color}0f`, border: `1px solid ${k.color}28` }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{k.label}</p>
            <p className="text-sm font-black mt-0.5 tabular-nums" style={{ color: k.color, fontFamily: "'JetBrains Mono',monospace" }}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid var(--border)`, background: 'var(--surface-card)' }}>
        <div className="px-4 py-2.5 flex items-center justify-between gap-2"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--input-bg)' }}>
          <p className="text-xs font-black uppercase tracking-wider" style={{ color: AMBER }}>Monthly Interest Schedule</p>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: `${AMBER}14`, color: AMBER, border: `1px solid ${AMBER}30` }}>
            {rows.length} month{rows.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs" style={{ minWidth: 560 }}>
            <thead>
              <tr style={{ background: 'var(--input-bg)' }}>
                {['#', 'Actual Int. Date', 'Days', 'Interest', 'Paid Date', 'Status'].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 font-black uppercase tracking-wider whitespace-nowrap"
                    style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const hasBreakup = Array.isArray(row?.updationParticiInterestStatement) && row.updationParticiInterestStatement.length > 0;
                const isExpanded = expandedIdx === idx;
                return (
                  <Fragment key={idx}>
                    <tr style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="py-2.5 px-3 font-bold" style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                        {row?.actualInterestDate ?? '—'}
                      </td>
                      <td className="py-2.5 px-3 font-semibold" style={{ color: 'var(--text-muted)' }}>{row?.days ?? '—'}</td>
                      <td className="py-2.5 px-3 font-black tabular-nums whitespace-nowrap" style={{ color: AMBER, fontFamily: "'JetBrains Mono',monospace" }}>
                        {fmtINR(row?.interestAmount ?? 0)}
                        {hasBreakup && (
                          <button
                            type="button"
                            onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                            className="ml-2 px-1.5 py-0.5 rounded-full font-bold"
                            style={{ fontSize: 10, border: `1px solid ${PURPLE}40`, background: `${PURPLE}14`, color: PURPLE }}>
                            {isExpanded ? 'Close' : 'BreakUp'}
                          </button>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{row?.paidDate ?? '—'}</td>
                      <td className="py-2.5 px-3"><InterestStatusChip status={row?.status} /></td>
                    </tr>

                    {/* First-month breakup */}
                    {isExpanded && hasBreakup && (
                      <tr style={{ borderTop: '1px solid var(--border)', background: `${PURPLE}06` }}>
                        <td colSpan={6} className="px-3 py-3">
                          <div style={{ borderLeft: `3px solid ${PURPLE}`, paddingLeft: 10 }}>
                            <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: PURPLE }}>
                              First Month Participation Breakup — {row.updationParticiInterestStatement.length + 1} entries
                            </p>
                            <table className="w-full text-xs" style={{ minWidth: 420 }}>
                              <thead>
                                <tr>
                                  {['#', 'Participation Amount', 'Interest Amount', 'Date'].map(h => (
                                    <th key={h} className="text-left py-1.5 px-2 font-bold uppercase tracking-wider"
                                      style={{ color: 'var(--text-muted)', borderBottom: `1px solid ${PURPLE}20` }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {/* Original row */}
                                <tr>
                                  <td className="py-1.5 px-2 font-bold" style={{ color: PURPLE }}>1</td>
                                  <td className="py-1.5 px-2 tabular-nums font-semibold" style={{ color: INDIGO, fontFamily: "'JetBrains Mono',monospace" }}>
                                    {row?.participationAmount != null ? fmtINR(row.participationAmount) : '—'}
                                  </td>
                                  <td className="py-1.5 px-2 tabular-nums font-black" style={{ color: AMBER, fontFamily: "'JetBrains Mono',monospace" }}>
                                    {fmtINR(row?.interestAmount ?? 0)}
                                  </td>
                                  <td className="py-1.5 px-2" style={{ color: 'var(--text-muted)' }}>
                                    {row?.actualInterestDate ?? '—'}
                                  </td>
                                </tr>
                                {/* Top-up entries */}
                                {row.updationParticiInterestStatement.map((upd, uIdx) => (
                                  <tr key={uIdx} style={{ borderTop: `1px solid ${PURPLE}18` }}>
                                    <td className="py-1.5 px-2 font-bold" style={{ color: PURPLE }}>{uIdx + 2}</td>
                                    <td className="py-1.5 px-2 tabular-nums font-semibold" style={{ color: INDIGO, fontFamily: "'JetBrains Mono',monospace" }}>
                                      {upd?.participationAmount != null ? fmtINR(upd.participationAmount) : '—'}
                                    </td>
                                    <td className="py-1.5 px-2 tabular-nums font-black" style={{ color: AMBER, fontFamily: "'JetBrains Mono',monospace" }}>
                                      {fmtINR(upd?.interestAmount ?? 0)}
                                    </td>
                                    <td className="py-1.5 px-2" style={{ color: 'var(--text-muted)' }}>
                                      {upd?.actualInterestDate ?? '—'}
                                    </td>
                                  </tr>
                                ))}
                                {/* Totals */}
                                <tr style={{ borderTop: `2px solid ${PURPLE}30`, background: `${PURPLE}08` }}>
                                  <td colSpan={2} className="py-2 px-2 font-black uppercase text-[10px] tracking-wider" style={{ color: PURPLE }}>Total</td>
                                  <td className="py-2 px-2 font-black tabular-nums" style={{ color: AMBER, fontFamily: "'JetBrains Mono',monospace" }}>
                                    {fmtINR(
                                      (row?.interestAmount ?? 0) +
                                      row.updationParticiInterestStatement.reduce((s, u) => s + Number(u?.interestAmount ?? 0), 0)
                                    )}
                                  </td>
                                  <td />
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}

              {/* Footer total row */}
              <tr style={{ borderTop: `2px solid ${AMBER}30`, background: `${AMBER}07` }}>
                <td colSpan={3} className="py-2.5 px-3 font-black uppercase text-[10px] tracking-wider" style={{ color: AMBER }}>
                  Total Interest
                </td>
                <td className="py-2.5 px-3 font-black tabular-nums" style={{ color: AMBER, fontFamily: "'JetBrains Mono',monospace" }}>
                  {fmtINR(totalInterest)}
                </td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Deal Card ────────────────────────────────────────────────────────────────
function DealCard({ deal, userId, holdAmount, onMapSuccess, selectedIds, onToggle }) {
  const [expanded,  setExpanded]  = useState(false);
  const [showModal, setShowModal] = useState(false);
  const isSelected = selectedIds.has(deal.dealId);

  return (
    <>
      {showModal && (
        <MapHoldModal
          deal={deal}
          userId={userId}
          holdAmount={holdAmount}
          onClose={() => setShowModal(false)}
          onSuccess={onMapSuccess}
        />
      )}

      <div className="rounded-2xl overflow-hidden transition-all"
        style={{
          background: 'var(--table-bg)',
          border: `1px solid ${isSelected ? 'rgba(245,131,17,0.45)' : 'var(--border)'}`,
          boxShadow: isSelected ? '0 0 0 2px rgba(245,131,17,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
        }}>

        {/* Card header row */}
        <div className="flex items-center gap-3 px-5 py-4 flex-wrap">

          {/* Checkbox */}
          <button
            onClick={() => onToggle(deal.dealId)}
            className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: isSelected ? '#f58311' : 'var(--input-bg)',
              border: `2px solid ${isSelected ? '#f58311' : 'var(--input-border)'}`,
            }}
            title="Select to equate with hold amount">
            {isSelected && <CheckIcon />}
          </button>

          {/* Deal info — clickable to expand/collapse interest statement */}
          <button className="flex-1 min-w-0 text-left" onClick={() => setExpanded(x => !x)}>
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {deal.dealName ?? deal.propertyName ?? deal.dealId}
            </p>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>
                Investment: <strong style={{ color: 'var(--text-primary)' }}>
                  {fmtINR(deal.participatedAmount ?? deal.investmentAmount ?? deal.participationAmount ?? deal.amount)}
                </strong>
              </span>
              {deal.roi && <><span>·</span><span>ROI: <strong style={{ color: INDIGO }}>{deal.roi}%</strong></span></>}
              <span style={{ color: AMBER, fontWeight: 600 }}>
                {expanded ? '▲ Hide Statement' : '▼ View Interest Statement'}
              </span>
            </div>
          </button>

          {/* Status chip */}
          {deal.status && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ background: `${GREEN}15`, color: GREEN, border: `1px solid ${GREEN}30` }}>
              {deal.status}
            </span>
          )}

          {/* Map Hold button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#f58311,#d4690a)', color: '#fff', boxShadow: '0 2px 8px rgba(245,131,17,0.3)' }}>
            <LockIcon /> Hold
          </button>

          {/* Expand chevron */}
          <button onClick={() => setExpanded(x => !x)} style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <ChevDown open={expanded} />
          </button>
        </div>

        {/* Expanded: interest statement from getUserViewInterestStatement API */}
        {expanded && (
          <div className="px-5 pb-5 pt-3"
            style={{ borderTop: '1px solid var(--border)', background: `${AMBER}03` }}>
            <div className="flex items-center gap-2 mb-3">
              <CoinIcon />
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: AMBER }}>
                Interest Statement
              </p>
            </div>
            <InterestStatement dealId={deal.dealId} />
          </div>
        )}
      </div>
    </>
  );
}

// ─── Bulk Hold Modal ──────────────────────────────────────────────────────────
// Maps selected deals to hold amount in one API call
function BulkMapModal({ deals, userId, holdAmount, onClose, onSuccess }) {
  const token = getToken();
  const [amountType, setAmountType] = useState('LENDERINTEREST');
  const [perDeal,    setPerDeal]    = useState(String(holdAmount ?? ''));
  const [perDealErr, setPerDealErr] = useState('');
  const [loading,    setLoading]    = useState(false);

  const handleSubmit = async () => {
    if (!perDeal || isNaN(Number(perDeal)) || Number(perDeal) <= 0) {
      setPerDealErr('Enter a valid positive amount'); return;
    }
    setPerDealErr('');
    setLoading(true);
    try {
      // One API call per selected deal (or batch if only one deal — same endpoint)
      const dto = deals.map(d => ({
        amountType,
        dealId:     d.dealId,
        holdAmount: Number(perDeal),
        userId,
      }));
      // Pick any dealId as path param — backend ignores it when multiple entries sent
      await axios.post(
        `${BASE_URL}/oxybrick-service/mapHoldAmountToDeal/${deals[0].dealId}`,
        { userHoldAmountMappedToDealRequestDto: dto },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Hold amount mapped to ${deals.length} deal${deals.length > 1 ? 's' : ''}!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Bulk mapping failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="rounded-2xl w-full max-w-md overflow-hidden"
        style={{ background: 'var(--surface-card)', border: '1px solid rgba(245,131,17,0.3)', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 flex items-center gap-3"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(245,131,17,0.05)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(245,131,17,0.12)', border: '1px solid rgba(245,131,17,0.25)', color: '#f58311' }}>
            <LockIcon />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Bulk Map Hold Amount
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {deals.length} deal{deals.length > 1 ? 's' : ''} selected · Hold: {fmtINR(holdAmount)}
            </p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 grid gap-4">
          {/* Selected deals list */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {deals.map((d, i) => (
              <div key={d.dealId} className="flex items-center gap-3 px-3 py-2 text-xs"
                style={{ borderBottom: i < deals.length - 1 ? '1px solid var(--border)' : 'none', background: i % 2 === 0 ? 'transparent' : 'var(--input-bg)' }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#f58311' }} />
                <span className="flex-1 truncate font-medium" style={{ color: 'var(--text-primary)' }}>
                  {d.dealName ?? d.dealId}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>{fmtINR(d.investmentAmount ?? d.participationAmount)}</span>
              </div>
            ))}
          </div>

          {/* Amount type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Amount Type <span style={{ color: '#e95330' }}>*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {AMOUNT_TYPES.map(t => (
                <button key={t} type="button" onClick={() => setAmountType(t)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold"
                  style={{
                    background: amountType === t ? 'rgba(245,131,17,0.15)' : 'var(--input-bg)',
                    color:      amountType === t ? '#f58311' : 'var(--text-muted)',
                    border:     `1px solid ${amountType === t ? 'rgba(245,131,17,0.4)' : 'var(--border)'}`,
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Amount per deal */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Hold Amount per Deal (₹) <span style={{ color: '#e95330' }}>*</span>
            </label>
            <input
              type="number" min="1"
              className="w-full rounded-xl px-3 py-2.5 text-sm"
              style={{ background: 'var(--input-bg)', border: `1px solid ${perDealErr ? '#e95330' : 'var(--input-border)'}`, color: 'var(--text-primary)', outline: 'none' }}
              value={perDeal}
              onChange={e => { setPerDeal(e.target.value); setPerDealErr(''); }}
            />
            {perDealErr && <p className="text-xs mt-1" style={{ color: '#e95330' }}>{perDealErr}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#f58311,#d4690a)', color: '#fff', boxShadow: '0 4px 14px rgba(245,131,17,0.35)' }}>
            {loading
              ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
              : <SendIcon />}
            {loading ? 'Mapping…' : `Map to ${deals.length} Deal${deals.length > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminHoldAmountDeals() {
  const navigate  = useNavigate();
  const { userId } = useParams();          // from /admin/hold-amount/deals/:userId
  const location  = useLocation();
  const { holdAmount, holdId, userName } = location.state ?? {};
  const token = getToken();

  const [deals,       setDeals]       = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulk,    setShowBulk]    = useState(false);

  const fetchDeals = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/oxybrick-service/getRunningDeals/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.data;
      // API returns { participationInfo: [...] } or an array directly
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.participationInfo)
          ? data.participationInfo
          : [];
      setDeals(list);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to load deals');
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeals(); }, [userId]);

  const toggleDeal = (dealId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(dealId) ? next.delete(dealId) : next.add(dealId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === deals.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(deals.map(d => d.dealId)));
    }
  };

  const selectedDeals = useMemo(
    () => deals.filter(d => selectedIds.has(d.dealId)),
    [deals, selectedIds]
  );

  // Total investment across selected deals
  const selectedTotal = selectedDeals.reduce(
    (s, d) => s + (Number(d.investmentAmount ?? d.participationAmount ?? d.amount) || 0), 0
  );

  return (
    <>
      {showBulk && selectedDeals.length > 0 && (
        <BulkMapModal
          deals={selectedDeals}
          userId={userId}
          holdAmount={holdAmount}
          onClose={() => setShowBulk(false)}
          onSuccess={() => { setSelectedIds(new Set()); fetchDeals(); }}
        />
      )}

      <div className="grid gap-6">

        {/* Page header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/hold-amount/list')}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <ArrowLeft />
            </button>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(245,131,17,0.12)', border: '1px solid rgba(245,131,17,0.25)', color: '#f58311' }}>
              <LockIcon />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#f58311' }}>Hold Amount</p>
              <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {userName ? `${userName}'s Deals` : 'User Deals'}
              </h1>
            </div>
          </div>
          <button onClick={fetchDeals}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            <RefreshIcon /> Refresh
          </button>
        </div>

        {/* Context cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'User ID',        value: userId ? userId.slice(0, 20) + '…' : '—', color: '#2673bb', bg: 'rgba(38,115,187,0.08)',  border: 'rgba(38,115,187,0.2)'  },
            { label: 'Hold Amount',    value: fmtINR(holdAmount),                        color: '#f58311', bg: 'rgba(245,131,17,0.08)',  border: 'rgba(245,131,17,0.2)'  },
            { label: 'Running Deals',  value: loading ? '…' : deals.length,              color: '#35a13e', bg: 'rgba(53,161,62,0.08)',   border: 'rgba(53,161,62,0.2)'   },
          ].map(c => (
            <div key={c.label} className="rounded-2xl p-4"
              style={{ background: c.bg, border: `1px solid ${c.border}` }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: c.color }}>{c.label}</p>
              <p className="text-lg font-extrabold mt-0.5 truncate" style={{ color: 'var(--text-primary)' }}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Info — checkbox hint */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(245,131,17,0.07)', border: '1px solid rgba(245,131,17,0.18)' }}>
          <span style={{ color: '#f58311', marginTop: 1 }}><InfoIcon /></span>
          <p className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Tick the checkbox on any deal to select it. Once selected, use the
            <strong style={{ color: '#f58311' }}> "Map Selected"</strong> button to map the hold amount
            to those deals in one shot. Or click <strong style={{ color: '#f58311' }}>Hold</strong> on
            a single deal to map individually.
          </p>
        </div>

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between gap-4 px-5 py-3 rounded-2xl flex-wrap"
            style={{ background: 'rgba(245,131,17,0.1)', border: '1px solid rgba(245,131,17,0.3)' }}>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                style={{ background: '#f58311', color: '#fff' }}>{selectedIds.size}</span>
              <span className="text-sm font-semibold" style={{ color: '#f58311' }}>
                deal{selectedIds.size > 1 ? 's' : ''} selected
                {selectedTotal > 0 && ` · Total: ${fmtINR(selectedTotal)}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedIds(new Set())}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                Clear
              </button>
              <button onClick={() => setShowBulk(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#f58311,#d4690a)', color: '#fff', boxShadow: '0 2px 10px rgba(245,131,17,0.35)' }}>
                <LockIcon /> Map Selected ({selectedIds.size})
              </button>
            </div>
          </div>
        )}

        {/* Select all / count */}
        {!loading && deals.length > 0 && (
          <div className="flex items-center justify-between">
            <button onClick={toggleAll}
              className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all hover:scale-105"
              style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              <span className="w-4 h-4 rounded flex items-center justify-center"
                style={{ background: selectedIds.size === deals.length ? '#f58311' : 'transparent', border: `2px solid ${selectedIds.size === deals.length ? '#f58311' : 'var(--input-border)'}` }}>
                {selectedIds.size === deals.length && <CheckIcon />}
              </span>
              {selectedIds.size === deals.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {deals.length} deal{deals.length !== 1 ? 's' : ''} found
            </span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-16 rounded-2xl"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="#f58311" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
            </svg>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading running deals…</span>
          </div>
        )}

        {/* Empty */}
        {!loading && deals.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-2xl"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <LockIcon />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No running deals for this user</p>
            <p className="text-xs">This user has no active deal participations.</p>
          </div>
        )}

        {/* Deal cards */}
        {!loading && deals.map(deal => (
          <DealCard
            key={deal.dealId ?? deal.id}
            deal={deal}
            userId={userId}
            holdAmount={holdAmount}
            onMapSuccess={fetchDeals}
            selectedIds={selectedIds}
            onToggle={toggleDeal}
          />
        ))}
      </div>
    </>
  );
}
