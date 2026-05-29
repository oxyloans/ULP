import { useState, useEffect, useCallback } from 'react';
import { getAllLoanActiveDeals } from '../../api/afterlogin-user';
import { getInterestBreakUpByDeal, submitInterestApprovals } from '../../api/afterlogin-admin';
import { formatINR } from '../../utils/currency';

// ─── Icons ────────────────────────────────────────────────────────────────────
const RefreshIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const CoinIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9 9h4a2 2 0 0 1 0 4H9v4h6"/></svg>;
const CheckIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>;
const CalendarIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const UsersIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const DownloadIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const CloseIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ArrowLeft    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const SearchIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const EyeIcon      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function fmtINR(n) {
  if (!n && n !== 0) return '—';
  return formatINR(n);
}

export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export const STATUS_CFG = {
  INITIATED:  { bg: '#fef3c7', text: '#d97706', border: '#fde68a', label: 'Initiated',  pulse: true  },
  PAID:       { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', label: 'Paid',       pulse: false },
  PROCESSING: { bg: '#eff6ff', text: '#3b82f6', border: '#bfdbfe', label: 'Processing', pulse: true  },
};

export function StatusChip({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.INITIATED;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
      {cfg.pulse
        ? <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.text, animation: 'livePulse 1.5s infinite' }} />
        : <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.text }} />}
      {cfg.label}
    </span>
  );
}

function mapPaymentStatus(status) {
  const s = String(status ?? '').trim().toUpperCase();
  if (!s) return 'INITIATED';
  if (s === 'INITIATED') return 'INITIATED';
  if (['PAID', 'COMPLETED', 'SUCCESS'].includes(s)) return 'PAID';
  if (['PROCESSING', 'IN_PROGRESS'].includes(s)) return 'PROCESSING';
  return 'INITIATED';
}

function numberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function getFirstNumber(...values) {
  for (const value of values) {
    const n = numberOrNull(value);
    if (n !== null) return n;
  }
  return null;
}

function mapApiDealToRow(item, index) {
  const id = item?.dealId ?? `deal-${index + 1}`;
  const fallbackName = typeof id === 'string' ? `Deal ${id.slice(0, 8)}` : `Deal ${index + 1}`;
  const breakupRows = Array.isArray(item?.usersDealsBasedInterestInfoDto) ? item.usersDealsBasedInterestInfoDto : [];
  return {
    id,
    dealName: item?.dealName ?? fallbackName,
    roi: Number(item?.roi ?? 0),
    lenders: getFirstNumber(
      item?.lenders,
      item?.lendersCount,
      item?.lenderCount,
      item?.totalLenders,
      item?.noOfLenders,
      item?.participatedUsersCount,
      breakupRows.length || null
    ),
    amount: Number(item?.totalPrincipalParticipationAmount ?? item?.currentPrincipalAmount ?? item?.dealAmount ?? 0),
    interestAmount: getFirstNumber(
      item?.interestAmount,
      item?.totalInterestAmount,
      item?.totalInterest,
      item?.payableInterest,
      item?.monthlyInterestAmount,
      breakupRows.reduce((sum, row) => sum + Number(row?.interestAmount ?? 0), 0) || null
    ),
    status: mapPaymentStatus(item?.paymentStatus),
    paymentDate: item?.actualInterestDate ?? null,
  };
}

function summarizeInterestRows(rows) {
  return {
    lenders: rows.length,
    interestAmount: rows.reduce((sum, row) => sum + Number(row?.interestAmount ?? 0), 0),
  };
}

export function downloadCSV(rows, filename) {
  const headers = ['#', 'Deal Name', 'ROI (%)', 'Lenders', 'Principal Amount (INR)', 'Interest Amount (INR)', 'Payment Date', 'Status'];
  const lines = [
    headers.join(','),
    ...rows.map((d, i) =>
      [i + 1, `"${d.dealName}"`, d.roi, d.lenders ?? '', d.amount, d.interestAmount ?? '', d.paymentDate ?? '', d.status].join(',')
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function downloadInterestExcelFile(dealName, rows) {
  const headers = ['S.No', 'User Name', 'User ID', 'Bank Name', 'Account Number', 'IFSC Code', 'Principal Amount', 'ROI (%)', 'Days', 'Interest Amount'];
  const body = rows.map((r, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${escapeHtml(r?.userName ?? '-')}</td>
      <td>${escapeHtml(r?.userId ?? '-')}</td>
      <td>${escapeHtml(r?.bankName ?? '-')}</td>
      <td>${escapeHtml(r?.accountNumber ?? '-')}</td>
      <td>${escapeHtml(r?.ifscCode ?? '-')}</td>
      <td>${Number(r?.principalAmount ?? 0)}</td>
      <td>${Number(r?.roi ?? 0)}</td>
      <td>${Number(r?.days ?? 0)}</td>
      <td>${Number(r?.interestAmount ?? 0)}</td>
    </tr>
  `).join('');

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
      </head>
      <body>
        <table border="1">
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>${body}</tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([`\ufeff${html}`], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(dealName ?? 'interest-breakup').replace(/\s+/g, '-')}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

function normalizeDownloadUrl(value) {
  if (!value) return '';
  const raw = String(value).trim();
  const cleaned = raw.replace(/^https:\s*\/\//i, 'https://').replace(/^http:\s*\/\//i, 'http://');
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return '';
}

function downloadFromRemoteUrl(url, fileName = 'interest-breakup.xlsx') {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.download = fileName;
  a.click();
}

function LenderBreakupModal({ open, dealName, loading, error, rows, onClose, onDownloadAndApprove, actionLoading }) {
  if (!open) return null;
  const totalInterest = rows.reduce((sum, row) => sum + Number(row?.interestAmount ?? 0), 0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full max-w-5xl rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}
        onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(99,102,241,0.06)' }}>
          <div>
            <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Lender Interest Breakup</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {dealName || '—'} · {rows.length} lender{rows.length !== 1 ? 's' : ''} · {fmtINR(totalInterest)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownloadAndApprove}
              disabled={loading || actionLoading || !rows.length}
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
              {actionLoading ? 'Generating...' : 'Generate Excel'}
            </button>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <CloseIcon />
            </button>
          </div>
        </div>

        {loading && (
          <div className="py-16 text-center text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
            Loading lenders...
          </div>
        )}

        {!loading && error && (
          <div className="m-4 rounded-xl px-4 py-3 text-sm font-semibold"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto max-h-[65vh]">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--input-bg)' }}>
                  {['#', 'User Name', 'Account No', 'IFSC', 'Principal', 'ROI', 'Days', 'Interest'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold whitespace-nowrap"
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={10} className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No lenders found</td></tr>
                ) : rows.map((r, idx) => (
                  <tr key={`${r?.userId ?? 'user'}-${idx}`} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-3 px-4 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{r?.userName ?? '-'}</td>
                    {/* <td className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>{r?.userId ?? '-'}</td> */}
                    {/* <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>{r?.bankName ?? '-'}</td> */}
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>{r?.accountNumber ?? '-'}</td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>{r?.ifscCode ?? '-'}</td>
                    <td className="py-3 px-4 font-bold" style={{ color: '#a855f7' }}>{fmtINR(r?.principalAmount ?? 0)}</td>
                    <td className="py-3 px-4 font-bold" style={{ color: '#f59e0b' }}>{Number(r?.roi ?? 0)}%</td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>{Number(r?.days ?? 0)}</td>
                    <td className="py-3 px-4 font-bold" style={{ color: '#059669' }}>{fmtINR(r?.interestAmount ?? 0)}</td>
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

// ─── Paid Date Modal ──────────────────────────────────────────────────────────
export function PaidDateModal({ selectedCount, selectedTotal, onSubmit, onCancel, loading }) {
  const today = new Date().toISOString().split('T')[0];
  const [paidDate, setPaidDate] = useState(today);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}
        onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(5,150,105,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.3)', color: '#059669' }}>
              <CheckIcon />
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Mark as Paid</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {selectedCount} deal{selectedCount !== 1 ? 's' : ''} · {fmtINR(selectedTotal)}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <CloseIcon />
          </button>
        </div>
        <div className="px-6 py-5 grid gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Payment Date
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}><CalendarIcon /></span>
              <input type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)}
                className="w-full rounded-xl text-sm outline-none"
                style={{ padding: '10px 14px 10px 36px', background: 'var(--input-bg)', border: '1.5px solid rgba(5,150,105,0.35)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div className="px-4 py-3 rounded-xl flex items-center justify-between"
            style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.2)' }}>
            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Total Payout</span>
            <span className="text-base font-black" style={{ color: '#059669', fontFamily: "'JetBrains Mono', monospace" }}>{fmtINR(selectedTotal)}</span>
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Cancel
          </button>
          <button onClick={() => onSubmit(paidDate)} disabled={loading || !paidDate}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', boxShadow: '0 4px 14px rgba(5,150,105,0.35)' }}>
            {loading
              ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
              : <><CheckIcon /> Confirm Paid</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Date Select Screen ───────────────────────────────────────────────────────
// helper — days in a given month/year
function daysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

export function DateSelectScreen({ title, subtitle, onProceed }) {
  const now  = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year,  setYear]  = useState(now.getFullYear());
  const [startDay, setStartDay] = useState(now.getDate());
  const [endDay, setEndDay] = useState(now.getDate());
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  // clamp day when month/year changes (e.g. Feb 31 → Feb 28)
  const maxDay = daysInMonth(month, year);
  const safeStartDay = Math.min(startDay, maxDay);
  const safeEndDay = Math.min(endDay, maxDay);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  const startDate = `${String(safeStartDay).padStart(2,'0')}-${String(month + 1).padStart(2,'0')}-${year}`;
  const endDate = `${String(safeEndDay).padStart(2,'0')}-${String(month + 1).padStart(2,'0')}-${year}`;
  const label = safeStartDay === safeEndDay ? startDate : `${startDate} to ${endDate}`;

  return (
    <div className="grid gap-6">
      <div>
        <h1
          className="text-2xl font-black"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          {subtitle}
        </p>
      </div>
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{
          background: "#f3f5f9",
          border: "1px solid #d7deea",
          boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
        }}
      >
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{ borderBottom: "1px solid #dde4ef" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#e7eefb", color: "#6b83b6" }}
          >
            <SearchIcon />
          </div>
          <p className="text-base font-extrabold" style={{ color: "#21324f" }}>
            Search Filters
          </p>
        </div>

        <div className="px-5 py-4 grid lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] md:grid-cols-3 sm:grid-cols-2 gap-3 items-end">
          <div>
            <label
              className="block text-[11px] font-bold uppercase tracking-widest mb-2"
              style={{ color: "#577096" }}
            >
              Month Name
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full rounded-lg text-sm outline-none"
              style={{
                padding: "10px 12px",
                background: "#ebeff5",
                border: "1px solid #c9d3e2",
                color: "#1f2a44",
              }}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-[11px] font-bold uppercase tracking-widest mb-2"
              style={{ color: "#577096" }}
            >
              Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-lg text-sm outline-none"
              style={{
                padding: "10px 12px",
                background: "#ebeff5",
                border: "1px solid #c9d3e2",
                color: "#1f2a44",
              }}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-[11px] font-bold uppercase tracking-widest mb-2"
              style={{ color: "#577096" }}
            >
              Start Date
            </label>
            <select
              value={safeStartDay}
              onChange={(e) => setStartDay(Number(e.target.value))}
              className="w-full rounded-lg text-sm outline-none"
              style={{
                padding: "10px 12px",
                background: "#ebeff5",
                border: "1px solid #c9d3e2",
                color: "#1f2a44",
              }}
            >
              {days.map((d) => (
                <option key={d} value={d}>
                  {String(d).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-[11px] font-bold uppercase tracking-widest mb-2"
              style={{ color: "#577096" }}
            >
              End Date
            </label>
            <select
              value={safeEndDay}
              onChange={(e) => setEndDay(Number(e.target.value))}
              className="w-full rounded-lg text-sm outline-none"
              style={{
                padding: "10px 12px",
                background: "#ebeff5",
                border: "1px solid #c9d3e2",
                color: "#1f2a44",
              }}
            >
              {days.map((d) => (
                <option key={d} value={d}>
                  {String(d).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() =>
              onProceed({
                month,
                year,
                startDay: safeStartDay,
                endDay: safeEndDay,
                startDate,
                endDate,
                label,
              })
            }
            className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2 whitespace-nowrap"
            style={{
              background: "linear-gradient(135deg, #6C63FF, #4F46E5)",
              color: "#fff",
              boxShadow: "0 4px 14px rgba(79, 70, 229, 0.45)",
            }}
          >
            <SearchIcon />
            Fetch Details
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Deals Table (shared) ─────────────────────────────────────────────────────
export function InterestDealsTable({ period, onBack, pageTitle, mockDeals, fetchDeals }) {
  const [deals, setDeals]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [selected, setSelected] = useState(new Set());
  const [paidMap, setPaidMap]   = useState({});   // id → { date }
  const [tab, setTab]           = useState('INITIATED');
  const [paidModal, setPaidModal]   = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [lenderModalOpen, setLenderModalOpen] = useState(false);
  const [lenderModalLoading, setLenderModalLoading] = useState(false);
  const [lenderModalError, setLenderModalError] = useState('');
  const [lenderRows, setLenderRows] = useState([]);
  const [selectedDealForLenders, setSelectedDealForLenders] = useState(null);
  const [lenderActionLoading, setLenderActionLoading] = useState(false);
  const [interestSummaryByDeal, setInterestSummaryByDeal] = useState({});

  const loadDeals = useCallback(async () => {
    setLoading(true);
    setError('');
    setInterestSummaryByDeal({});
    try {
      let rows = [];
      if (typeof fetchDeals === 'function') {
        const fetchedRows = await fetchDeals(period);
        rows = Array.isArray(fetchedRows) ? fetchedRows : [];
      } else {
        rows = Array.isArray(mockDeals) ? mockDeals : [];
      }
      setDeals(rows);

      if (typeof fetchDeals === 'function') {
        const summaries = await Promise.allSettled(rows.map(async (deal) => {
          const res = await getInterestBreakUpByDeal(deal.id);
          const breakupRows = Array.isArray(res?.usersDealsBasedInterestInfoDto)
            ? res.usersDealsBasedInterestInfoDto
            : Array.isArray(res) ? res : [];
          return [deal.id, summarizeInterestRows(breakupRows)];
        }));
        const summaryMap = {};
        summaries.forEach((result) => {
          if (result.status === 'fulfilled') {
            const [dealId, summary] = result.value;
            summaryMap[dealId] = summary;
          }
        });
        if (Object.keys(summaryMap).length) {
          setInterestSummaryByDeal(summaryMap);
          setDeals(prev => prev.map(deal => summaryMap[deal.id] ? { ...deal, ...summaryMap[deal.id] } : deal));
        }
      }
    } catch (e) {
      setDeals([]);
      setError(e?.message ?? 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  }, [fetchDeals, mockDeals, period]);

  useEffect(() => { loadDeals(); }, [loadDeals]);

  const getStatus = (d) => (paidMap[d.id] ? 'PAID' : (d.status ?? mapPaymentStatus(d.paymentStatus)));
  const getPaidDate = (d) => paidMap[d.id]?.date ?? null;
  const getLendersCount = (d) => interestSummaryByDeal[d.id]?.lenders ?? d.lenders ?? null;
  const getInterestAmount = (d) => interestSummaryByDeal[d.id]?.interestAmount ?? d.interestAmount ?? null;
  const formatOptionalINR = (value) => value === null || value === undefined ? '—' : fmtINR(value);

  const pendingDeals = deals.filter(d => getStatus(d) === 'INITIATED');
  const paidDeals    = deals.filter(d => getStatus(d) === 'PAID');

  const TABS = [
    { key: 'INITIATED', label: 'Initiated', color: '#d97706', count: pendingDeals.length },
    { key: 'PAID',    label: 'Paid',    color: '#059669', count: paidDeals.length    },
    { key: 'ALL',     label: 'All',     color: '#6366f1', count: deals.length        },
  ];

  const filtered = tab === 'ALL' ? deals : tab === 'INITIATED' ? pendingDeals : paidDeals;
  const pendingFiltered = filtered.filter(d => getStatus(d) === 'INITIATED');
  const allPendingSelected = pendingFiltered.length > 0 && pendingFiltered.every(d => selected.has(d.id));

  const toggleAll = () => {
    if (allPendingSelected) {
      setSelected(prev => { const n = new Set(prev); pendingFiltered.forEach(d => n.delete(d.id)); return n; });
    } else {
      setSelected(prev => { const n = new Set(prev); pendingFiltered.forEach(d => n.add(d.id)); return n; });
    }
  };
  const toggleOne = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const selectedDeals = deals.filter(d => selected.has(d.id));
  const selectedTotal = selectedDeals.reduce((s, d) => s + d.amount, 0);
  const totalPendingInterest = pendingDeals.reduce((s, d) => s + Number(getInterestAmount(d) ?? 0), 0);
  const totalPaidInterest = paidDeals.reduce((s, d) => s + Number(getInterestAmount(d) ?? 0), 0);
  const totalInterest = deals.reduce((s, d) => s + Number(getInterestAmount(d) ?? 0), 0);

  const handleMarkPaid = async (paidDate) => {
    setPayLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setPaidMap(prev => {
      const n = { ...prev };
      selected.forEach(id => { n[id] = { date: paidDate }; });
      return n;
    });
    setSelected(new Set());
    setPaidModal(false);
    setPayLoading(false);
  };

  const handleOpenLenders = async (deal) => {
    setSelectedDealForLenders(deal);
    setLenderModalOpen(true);
    setLenderModalLoading(true);
    setLenderModalError('');
    setLenderRows([]);
    try {
      const res = await getInterestBreakUpByDeal(deal.id);
      const rows = Array.isArray(res?.usersDealsBasedInterestInfoDto)
        ? res.usersDealsBasedInterestInfoDto
        : Array.isArray(res) ? res : [];
      const interestAmount = rows.reduce((sum, row) => sum + Number(row?.interestAmount ?? 0), 0);
      setLenderRows(rows);
      setInterestSummaryByDeal(prev => ({
        ...prev,
        [deal.id]: { lenders: rows.length, interestAmount },
      }));
      setDeals(prev => prev.map(row => row.id === deal.id ? { ...row, lenders: rows.length, interestAmount } : row));
    } catch (e) {
      setLenderModalError(e?.message ?? 'Failed to load lenders breakup');
    } finally {
      setLenderModalLoading(false);
    }
  };

  const handleDownloadAndApprove = async () => {
    if (!selectedDealForLenders?.id || lenderRows.length === 0) return;
    setLenderActionLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const approvalRes = await submitInterestApprovals({
        dealId: selectedDealForLenders.id,
        sheetGeneratedDate: today,
        usersDealsBasedInterestInfoDto: lenderRows.map((r) => ({
          userName: r?.userName ?? null,
          userId: r?.userId ?? null,
          bankName: r?.bankName ?? null,
          accountNumber: r?.accountNumber ?? null,
          roi: Number(r?.roi ?? 0),
          interestAmount: Number(r?.interestAmount ?? 0),
          principalAmount: Number(r?.principalAmount ?? 0),
          days: Number(r?.days ?? 0),
          ifscCode: r?.ifscCode ?? null,
        })),
      });

      const responseUrl = normalizeDownloadUrl(
        typeof approvalRes === 'string'
          ? approvalRes
          : approvalRes?.url ?? approvalRes?.fileUrl ?? approvalRes?.downloadUrl ?? ''
      );

      if (responseUrl) {
        downloadFromRemoteUrl(
          responseUrl,
          `${(selectedDealForLenders?.dealName ?? 'interest-breakup').replace(/\s+/g, '-')}.xlsx`
        );
      } else {
        downloadInterestExcelFile(selectedDealForLenders?.dealName, lenderRows);
      }
    } catch (e) {
      setLenderModalError(e?.message ?? 'Failed to submit interest approval');
    } finally {
      setLenderActionLoading(false);
    }
  };

  const kpis = [
    { label: 'Total Deals',    value: String(deals.length), color: '#a855f7' },
    { label: 'Pending Interest', value: fmtINR(totalPendingInterest), color: '#d97706' },
    { label: 'Paid Interest',  value: fmtINR(totalPaidInterest), color: '#059669' },
    { label: 'Total Interest', value: fmtINR(totalInterest), color: '#6366f1' },
    { label: 'Selected',       value: String(selected.size),color: '#6366f1' },
  ];

  return (
    <>
      <LenderBreakupModal
        open={lenderModalOpen}
        dealName={selectedDealForLenders?.dealName}
        loading={lenderModalLoading}
        error={lenderModalError}
        rows={lenderRows}
        actionLoading={lenderActionLoading}
        onClose={() => setLenderModalOpen(false)}
        onDownloadAndApprove={handleDownloadAndApprove}
      />
      {paidModal && (
        <PaidDateModal
          selectedCount={selectedDeals.length}
          selectedTotal={selectedTotal}
          loading={payLoading}
          onSubmit={handleMarkPaid}
          onCancel={() => setPaidModal(false)}
        />
      )}

      <div className="grid gap-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <ArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{pageTitle}</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Interest payouts — <span style={{ color: '#c084fc', fontWeight: 700 }}>{period.label}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {selected.size > 0 && (
              <>
                <button
                  onClick={() => downloadCSV(
                    selectedDeals.map(d => ({ ...d, paymentDate: getPaidDate(d) ?? d.paymentDate ?? '' })),
                    `interest-${period.label.replace(' ','-')}-selected.csv`
                  )}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                  style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <DownloadIcon /> Download Selected ({selected.size})
                </button>
                <button onClick={() => setPaidModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', boxShadow: '0 4px 14px rgba(5,150,105,0.35)' }}>
                  <CheckIcon /> Paid ({selected.size})
                </button>
              </>
            )}
            <button
              onClick={loadDeals}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              <RefreshIcon />
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
          {kpis.map(k => (
            <div key={k.label} className="rounded-xl px-4 py-3"
              style={{ background: `${k.color}0a`, border: `1px solid ${k.color}20` }}>
              <p className="text-xl font-extrabold" style={{ color: k.color, fontFamily: "'JetBrains Mono', monospace" }}>{k.value}</p>
              <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={tab === t.key
                  ? { background: `linear-gradient(135deg,${t.color},${t.color}cc)`, color: '#fff', boxShadow: `0 2px 8px ${t.color}40` }
                  : { background: 'transparent', color: 'var(--text-muted)' }}>
                {t.label} · {t.count}
              </button>
            ))}
          </div>
          {selected.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}>
              <span className="text-xs font-bold" style={{ color: '#c084fc' }}>
                {selected.size} selected · {fmtINR(selectedTotal)}
              </span>
              <button onClick={() => setSelected(new Set())}
                className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <CloseIcon />
              </button>
            </div>
          )}
        </div>

        {/* Table card */}
        {error && (
          <div className="rounded-xl px-4 py-3 text-sm font-semibold"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
            {error}
          </div>
        )}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <div className="px-5 py-3.5 flex items-center gap-3 flex-wrap"
            style={{ borderBottom: '1px solid var(--border)', background: 'rgba(168,85,247,0.04)' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: '#a855f7', boxShadow: '0 0 6px #a855f7' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {tab === 'ALL' ? 'All Deals' : tab === 'INITIATED' ? 'Pending Payouts' : 'Paid Deals'} — {period.label}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(168,85,247,0.12)', color: '#c084fc' }}>{filtered.length}</span>
            {tab === 'INITIATED' && !loading && (
              <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <CoinIcon />
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Total Interest</p>
                  <p className="text-sm font-black" style={{ color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>{fmtINR(totalPendingInterest)}</p>
                </div>
              </div>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-3 py-16">
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading deals…</span>
            </div>
          )}

          {!loading && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--input-bg)' }}>
                    {/* <th className="py-3 px-4 text-xs uppercase tracking-widest font-semibold text-left whitespace-nowrap"
                      style={{ color: 'var(--text-muted)' }}>
                      <div className="flex items-center gap-2">
                        <button onClick={toggleAll}
                          className="w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0"
                          style={{
                            background: allPendingSelected ? 'rgba(168,85,247,0.8)' : 'var(--input-bg)',
                            border: '1.5px solid rgba(168,85,247,0.4)', color: '#fff',
                          }}>
                          {allPendingSelected && <CheckIcon />}
                        </button>
                        <span>Payment</span>
                      </div>
                    </th> */}
                    {['#', 'Deal Name', 'ROI', 'Lenders', 'Principal Amount', 'Interest Amount', 'Payment Date', 'Status', 'Lenders Breakup', 'Download'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold whitespace-nowrap"
                        style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={10} className="py-14 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No deals in this category</td></tr>
                  ) : filtered.map((deal, idx) => {
                    const isPaid    = getStatus(deal) === 'PAID';
                    const isChecked = selected.has(deal.id);
                    const paidDate  = getPaidDate(deal);
                    return (
                      <tr key={deal.id}
                        style={{ borderBottom: '1px solid var(--border)', background: isChecked ? 'rgba(168,85,247,0.05)' : 'transparent' }}
                        onMouseEnter={e => { if (!isChecked) e.currentTarget.style.background = 'var(--row-hover)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = isChecked ? 'rgba(168,85,247,0.05)' : 'transparent'; }}>

                        {/* Payment checkbox */}
                        {/* <td className="py-3.5 px-4">
                          {!isPaid ? (
                            <button onClick={() => toggleOne(deal.id)}
                              className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                              style={{
                                background: isChecked ? 'rgba(168,85,247,0.8)' : 'var(--input-bg)',
                                border: `1.5px solid ${isChecked ? 'rgba(168,85,247,0.8)' : 'rgba(168,85,247,0.3)'}`,
                                color: '#fff',
                              }}>
                              {isChecked && <CheckIcon />}
                            </button>
                          ) : (
                            <span className="w-5 h-5 rounded-md flex items-center justify-center"
                              style={{ background: 'rgba(5,150,105,0.15)', border: '1.5px solid rgba(5,150,105,0.4)', color: '#059669' }}>
                              <CheckIcon />
                            </span>
                          )}
                        </td> */}

                        <td className="py-3.5 px-4">
                          <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--text-muted)' }}>{idx + 1}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{deal.dealName}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-sm font-extrabold tabular-nums"
                            style={{ color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>{deal.roi}%</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <UsersIcon />
                            <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{getLendersCount(deal) ?? '—'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-sm font-extrabold tabular-nums"
                            style={{ color: '#a855f7', fontFamily: "'JetBrains Mono', monospace" }}>{fmtINR(deal.amount)}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-sm font-extrabold tabular-nums"
                            style={{ color: '#059669', fontFamily: "'JetBrains Mono', monospace" }}>{formatOptionalINR(getInterestAmount(deal))}</span>
                        </td>

                        {/* Payment Date */}
                        <td className="py-3.5 px-4">
                          {paidDate || deal.paymentDate ? (
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon />
                              <span className="text-xs font-semibold whitespace-nowrap" style={{ color: paidDate ? '#059669' : 'var(--text-muted)' }}>
                                {paidDate ?? deal.paymentDate}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4"><StatusChip status={getStatus(deal)} /></td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleOpenLenders(deal)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                            <EyeIcon />
                            View
                          </button>
                        </td>

                        {/* Per-row download */}
                        <td className="py-3.5 px-4">
                          <button
                            disabled={!isPaid && !paidDate}
                            onClick={() => downloadCSV(
                              [{ ...deal, paymentDate: paidDate ?? deal.paymentDate ?? '' }],
                              `${deal.dealName.replace(/\s+/g,'-')}-${period.label.replace(' ','-')}.csv`
                            )}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                            style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
                            <DownloadIcon />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-2"
              style={{ borderTop: '1px solid var(--border)', background: 'var(--input-bg)' }}>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                {filtered.length} deal{filtered.length !== 1 ? 's' : ''} · {period.label}
              </span>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold" style={{ color: '#059669' }}>
                  Total interest amount · {fmtINR(filtered.reduce((sum, deal) => sum + Number(getInterestAmount(deal) ?? 0), 0))}
                </span>
                {selected.size > 0 && (
                  <span className="text-xs font-bold" style={{ color: '#c084fc' }}>
                    {selected.size} selected · {fmtINR(selectedTotal)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── SD Lot Interest Payout page ──────────────────────────────────────────────
export default function AdminInterestPayments() {
  const [period, setPeriod] = useState(null);

  const fetchSdLotDeals = useCallback(async (selectedPeriod) => {
    if (!selectedPeriod) return [];
    const startDay = String(selectedPeriod.startDay ?? selectedPeriod.day).padStart(2, '0');
    const endDay = String(selectedPeriod.endDay ?? selectedPeriod.day).padStart(2, '0');
    const monthNo = String(selectedPeriod.month + 1).padStart(2, '0');
    const year = String(selectedPeriod.year);
    const startDate = `${startDay}`;
    const endDate = `${endDay}`;
    const monthName = MONTHS[selectedPeriod.month];

    const response = await getAllLoanActiveDeals({
      monthName,
      year,
      startDate,
      endDate,
    });

    return (Array.isArray(response) ? response : []).map(mapApiDealToRow);
  }, []);

  if (!period) {
    return (
      <DateSelectScreen
        title="SD Lot Interest Payout"
        subtitle="Select a payment month to view and process SD Lot interest payouts"
        onProceed={setPeriod}
      />
    );
  }
  return (
    <InterestDealsTable
      period={period}
      onBack={() => setPeriod(null)}
      pageTitle="SD Lot Interest Payout"
      fetchDeals={fetchSdLotDeals}
    />
  );
}
