import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'antd';
import { getRunningDeals, getUserViewInterestStatement, getSdLots, getUserOfflineParticipationDealsInfo } from '../api/afterlogin-user';
import { formatINR } from '../utils/currency';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Building   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="4" width="18" height="17" rx="1"/><path d="M3 8h18M6 11h3v3H6v-3zm4.5 0h3v3h-3v-3zm4.5 0h3v3h-3v-3zM6 16h3v2H6v-2zm4.5 0h4v5h-4v-5zM15 16h3v2h-3v-2zM1 21h22"/></svg>;
const Ruler      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21.3 8.7L8.7 21.3c-.4.4-1 .4-1.4 0l-4.6-4.6c-.4-.4-.4-1 0-1.4L15.3 2.7c.4-.4 1-.4 1.4 0l4.6 4.6c.4.4.4 1 0 1.4zM9 13.5l1.5 1.5M11.5 11l1.5 1.5M14 8.5l1.5 1.5M16.5 6l1.5 1.5"/></svg>;
const MapPin     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const Shield     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const TrendUp    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const Wallet     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="18" cy="12" r="2"/></svg>;
const EyeIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const ChevronIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="6 9 12 15 18 9"/></svg>;
const CalIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const LayersIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;

const PAYOUT = {
  MONTHLY:      { label: "Monthly",     months: 1  },
  QUARTELY:     { label: "Quarterly",   months: 3  },
  HALFLY:       { label: "Half-Yearly", months: 6  },
  YEARLY:       { label: "Yearly",      months: 12 },
  ENDOFTHEDEAL: { label: "End of Deal", months: 0  },
};

function fmtINR(n) {
  return formatINR(n ?? 0);
}

function fmtNullable(v, fallback = "-") {
  return v === null || v === undefined || v === "" ? fallback : String(v);
}

function monthlyEquiv(amount, roi, type) {
  if (!amount || !roi) return 0;
  const m = PAYOUT[type]?.months ?? 1;
  if (m === 0) return 0;
  return amount * (roi / 100) / m;
}

function parseDdMmYyyy(value) {
  if (!value || typeof value !== "string") return null;
  const [dd, mm, yyyy] = value.split("/");
  const d = Number(dd);
  const m = Number(mm);
  const y = Number(yyyy);
  if (!d || !m || !y) return null;
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function mergeMigratedByRoi(items) {
  const groups = new Map();
  for (const item of items ?? []) {
    const currentPrincipal = Number(item?.currentPrincipalAmount ?? 0);
    if (!(currentPrincipal > 0)) continue;
    const key = `${item?.dealName ?? "Unknown"}|${item?.roi ?? 0}`;
    if (!groups.has(key)) {
      groups.set(key, {
        dealName: item?.dealName ?? "Unknown",
        roi: Number(item?.roi ?? 0),
        payOutType: item?.payOutType ?? null,
        earliestDate: (item?.participationDate || item?.participatedDate) ?? null,
        entries: [],
      });
    }
    const g = groups.get(key);
    g.entries.push(item);
    g.payOutType = g.payOutType ?? item?.payOutType ?? null;
    const oldDate = parseDdMmYyyy(g.earliestDate);
    const nextDate = parseDdMmYyyy(item?.participationDate || item?.participatedDate);
    if (!oldDate || (nextDate && nextDate < oldDate)) g.earliestDate = (item?.participationDate || item?.participatedDate) ?? g.earliestDate;
  }

  return Array.from(groups.values()).map(g => {
    const currentPrincipalTotal = g.entries.reduce((s, e) => s + Number(e?.currentPrincipalAmount ?? 0), 0);
    const monthlyInterestTotal = g.entries.reduce(
      (s, e) => s + monthlyEquiv(Number(e?.currentPrincipalAmount ?? 0), Number(e?.roi ?? g.roi ?? 0), "MONTHLY"),
      0
    );
    const returnedTotal = g.entries.reduce((s, e) => s + Number(e?.principalReturnedAmount ?? 0), 0);
    const sortedEntries = [...g.entries].sort((a, b) => {
      const ad = parseDdMmYyyy(a?.participationDate || a?.participatedDate);
      const bd = parseDdMmYyyy(b?.participationDate || b?.participatedDate);
      if (!ad && !bd) return 0;
      if (!ad) return 1;
      if (!bd) return -1;
      return ad - bd;
    });
    return {
      ...g,
      participationAmount: currentPrincipalTotal,
      monthlyInterest: monthlyInterestTotal,
      returnedAmount: returnedTotal,
      entryCount: sortedEntries.length,
      entries: sortedEntries,
    };
  });
}

function MigratedDealRow({ d, index }) {
  const [expanded, setExpanded] = useState(false);
  const roi = d.roi ?? 0;
  const participation = d.participationAmount ?? 0;
  const monthly = d.monthlyInterest ?? 0;
  const entryCount = d.entryCount ?? (d.entries?.length ?? 0);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300 text-left"
      style={{ background: "var(--surface-card)", border: "1px solid var(--border)", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 8px 40px rgba(0,0,0,0.14)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = `rgba(6,182,212,0.4)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <div className="flex">
        <div className="w-1 flex-shrink-0" style={{ background: `linear-gradient(180deg,#06b6d4,#10b981)` }} />
        <div className="flex-1 px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black"
                style={{ background: `rgba(6,182,212,0.12)`, color: '#06b6d4', border: `2px solid rgba(6,182,212,0.25)`, boxShadow: `0 0 20px rgba(6,182,212,0.15)` }}
              >
                {index + 1}
              </div>
              <div className="min-w-0">
                <p className="text-base font-extrabold truncate" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  {fmtNullable(d.dealName)}
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    <CalIcon /> Since {fmtNullable(d.earliestDate)}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `rgba(245,158,11,0.1)`, color: '#f59e0b', border: `1px solid rgba(245,158,11,0.2)` }}>
                    Offline/Migrated
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `rgba(99,102,241,0.1)`, color: '#6366f1', border: `1px solid rgba(99,102,241,0.2)` }}>
                    {fmtNullable(d.payOutType)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: "Holding Invested", value: fmtINR(participation), color: '#6366f1' },
                { label: "Monthly Yield", value: fmtINR(monthly), color: '#10b981' },
                { label: "ROI Rate", value: `${roi}%`, color: '#f59e0b' },
                { label: "Entries", value: String(entryCount), color: '#818cf8' },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center px-3 py-1.5 rounded-xl min-w-[72px]" style={{ background: `${s.color}08`, border: `1px solid ${s.color}15` }}>
                  <span className="text-base font-black leading-none font-mono" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-[10px] mt-1 font-semibold whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{s.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all border"
                style={{ background: expanded ? `rgba(6,182,212,0.1)` : "var(--input-bg)", color: '#06b6d4', borderColor: expanded ? `rgba(6,182,212,0.25)` : "var(--border)", cursor: 'pointer' }}
              >
                Details
                <span style={{ transform: expanded ? "rotate(180deg)" : "", transition: "transform 0.3s", display: "inline-flex" }}>
                  <ChevronIcon />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-3" style={{ borderTop: "1px solid var(--border)", background: "var(--input-bg)" }}>
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] text-sm">
                <thead>
                  <tr style={{ background: "var(--table-header-bg)", borderBottom: "1px solid var(--border)" }}>
                    {[
                      { short: "Property", title: "Property" },
                      { short: "ROI", title: "Return on Investment" },
                      { short: "Part.", title: "Participation" },
                      { short: "Curr. Prin.", title: "Current Principal" },
                      { short: "Ret.", title: "Returned" },
                      { short: "Payout", title: "Payout Type" },
                      { short: "Txn", title: "Transaction Type" },
                      { short: "Int. Dt", title: "Interest Date" },
                      { short: "Part. Dt", title: "Participation Date" },
                      { short: "Mth. Yield", title: "Monthly Yield equivalent" },
                    ].map(h => (
                      <th
                        key={h.short}
                        title={h.title}
                        className="text-left py-2.5 px-3 text-xs font-black uppercase tracking-wider whitespace-nowrap"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {h.short}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {d.entries.map((entry, rowIdx) => (
                    <tr key={`${d.dealName}-${entry?.participationDate ?? rowIdx}-${rowIdx}`} style={{ borderBottom: rowIdx < d.entries.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>{fmtNullable(entry?.dealName)}</td>
                      <td className="py-2.5 px-3 font-bold text-amber-500 whitespace-nowrap">{fmtNullable(entry?.roi)}%</td>
                      <td className="py-2.5 px-3 font-bold font-mono whitespace-nowrap" style={{ color: '#6366f1' }}>{fmtINR(entry?.participationAmount ?? 0)}</td>
                      <td className="py-2.5 px-3 font-semibold font-mono whitespace-nowrap" style={{ color: '#10b981' }}>{fmtINR(entry?.currentPrincipalAmount ?? 0)}</td>
                      <td className="py-2.5 px-3 font-semibold font-mono whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
                        {entry?.principalReturnedAmount === null ? "-" : fmtINR(entry?.principalReturnedAmount ?? 0)}
                      </td>
                      <td className="py-2.5 px-3 text-xs font-semibold whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{fmtNullable(entry?.payOutType)}</td>
                      <td className="py-2.5 px-3 text-xs font-semibold whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{fmtNullable(entry?.typeOfTransaction)}</td>
                      <td className="py-2.5 px-3 text-xs font-semibold whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{fmtNullable(entry?.interestDate)}</td>
                      <td className="py-2.5 px-3 text-xs font-semibold whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{fmtNullable(entry?.participationDate || entry?.participatedDate)}</td>
                      <td className="py-2.5 px-3 font-bold font-mono whitespace-nowrap text-emerald-500">
                        {fmtINR(monthlyEquiv(entry?.currentPrincipalAmount ?? 0, entry?.roi ?? 0, "MONTHLY"))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InterestStatementModal({ deal, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    if (!deal?.dealId) return;
    setLoading(true);
    setError("");
    getUserViewInterestStatement(deal.dealId)
      .then(res => setData(res))
      .catch(e => setError(e?.message ?? "Failed to load interest statement"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [deal?.dealId]);

  const rows = data?.participationInterestStatement ?? [];
  const totalInterest = useMemo(() => rows.reduce((sum, r) => sum + Number(r?.interestAmount ?? 0), 0), [rows]);

  const firstRow = rows[0] ?? {};
  const participationAmount = data?.totalParticipationAmount ?? firstRow?.participationAmount ?? null;
  const participationDate   = firstRow?.participationDate ?? null;

  return (
    <Modal
      open={true}
      onCancel={onClose}
      footer={null}
      title={
        <div className="pr-6 text-left">
          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-600">Interest Yield Statement</p>
          <h2 className="text-lg font-black truncate mt-0.5" style={{ color: "var(--text-primary)" }}>{deal?.dealName ?? "Asset Opportunity"}</h2>
        </div>
      }
      styles={{
        content: {
          background: "var(--surface-card)",
          border: "1px solid var(--border)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
          borderRadius: "16px",
        },
        header: {
          background: 'transparent',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '12px',
        },
        body: {
          padding: '16px 0 0 0',
        },
        close: {
          color: 'var(--text-muted)',
        }
      }}
      width="min(960px, 96vw)"
      centered
    >
      <div className="overflow-y-auto p-3 sm:p-5 grid gap-4 pr-1" style={{ maxHeight: "68vh" }}>
        {loading && (
          <div className="py-14 text-center text-sm font-bold flex items-center justify-center gap-2" style={{ color: "var(--text-muted)" }}>
            <span className="w-4 h-4 border-2 border-t-transparent animate-spin rounded-full" style={{ borderColor: '#06b6d4' }} />
            Loading interest statement...
          </div>
        )}

        {!loading && error && (
          <div className="py-12 grid place-items-center gap-3 text-center">
            <p className="text-sm font-bold text-red-500">{error}</p>
            <button
              type="button"
              onClick={load}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.25)' }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* KPI metrics strip inside modal */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="rounded-xl px-3 py-2 text-left" style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Invested</p>
                <p className="text-sm font-black mt-0.5" style={{ color: '#06b6d4', fontFamily: "'JetBrains Mono',monospace" }}>
                  {participationAmount != null ? fmtINR(participationAmount) : "-"}
                </p>
              </div>

              <div className="rounded-xl px-3 py-2 text-left" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Yield Starts</p>
                <p className="text-sm font-black mt-0.5 text-emerald-500">
                  {participationDate ?? "-"}
                </p>
              </div>

              <div className="rounded-xl px-3 py-2 text-left" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Total Yield</p>
                <p className="text-sm font-black mt-0.5 text-amber-500" style={{ fontFamily: "'JetBrains Mono',monospace" }}>
                  {fmtINR(totalInterest)}
                </p>
              </div>

              <div className="rounded-xl px-3 py-2 text-left" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Monthly ROI</p>
                <p className="text-sm font-black mt-0.5 text-indigo-500" style={{ fontFamily: "'JetBrains Mono',monospace" }}>
                  {data?.roi != null ? `${data.roi}%` : "-"}
                </p>
              </div>
            </div>

            {/* Interest schedule table */}
            {rows.length > 0 ? (
              <div className="rounded-xl overflow-hidden text-left" style={{ border: "1px solid var(--border)", background: "var(--surface-card)" }}>
                <div className="px-4 py-3 flex items-center justify-between gap-2 flex-wrap" style={{ borderBottom: "1px solid var(--border)", background: "var(--input-bg)" }}>
                  <p className="text-xs font-black uppercase tracking-wider text-cyan-600">Interest Yield Schedule</p>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)' }}>
                    {rows.length} months tenure
                  </span>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full text-sm" style={{ minWidth: 640 }}>
                    <thead>
                      <tr style={{ background: "var(--table-header-bg)" }}>
                        {["#", "Yield Due Date", "Days Count", "Yield Interest", "Paid Date", "Payment Status"].map(h => (
                          <th key={h} className="text-left py-3 px-3 text-[11px] font-black uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => {
                        const status = (r?.status ?? "").toUpperCase();
                        const isPaid = status === "PAID";
                        return (
                          <tr key={r?.id ?? i} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td className="py-2.5 px-3 font-semibold">{i + 1}</td>
                            <td className="py-2.5 px-3 font-bold">{r?.interestDate ?? "—"}</td>
                            <td className="py-2.5 px-3 font-semibold font-mono">{r?.noOfDays ?? "—"}</td>
                            <td className="py-2.5 px-3 font-extrabold text-emerald-500 font-mono">{fmtINR(r?.interestAmount)}</td>
                            <td className="py-2.5 px-3 font-semibold">{r?.disbursedDate ?? "—"}</td>
                            <td className="py-2.5 px-3">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={isPaid ? {
                                  background: 'rgba(16,185,129,0.1)',
                                  color: '#10b981',
                                  border: '1px solid rgba(16,185,129,0.2)',
                                } : {
                                  background: 'rgba(245,158,11,0.1)',
                                  color: '#f59e0b',
                                  border: '1px solid rgba(245,158,11,0.2)',
                                }}>
                                {r?.status || "Pending"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                No yield schedules recorded for this investment.
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

export default function AssetParticipations() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [migratedDeals, setMigratedDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [migratedError, setMigratedError] = useState("");
  const [interestDeal, setInterestDeal] = useState(null);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [dealTypeMap, setDealTypeMap] = useState({});

  const loadData = () => {
    setLoading(true);
    setError("");
    setMigratedError("");

    Promise.allSettled([
      getRunningDeals(),
      getUserOfflineParticipationDealsInfo(),
      getSdLots("NORMAL").catch(() => []),
    ])
    .then(([runningRes, migratedRes, testDeals, normalDeals, premiumDeals]) => {
      // Build lookup map for globalDealType
      const typeMap = {};
      const testList = testDeals.status === "fulfilled" ? (testDeals.value || []) : [];
      const normalList = normalDeals.status === "fulfilled" ? (normalDeals.value || []) : [];
      const premiumList = premiumDeals.status === "fulfilled" ? (premiumDeals.value || []) : [];
      const allDeals = [...testList, ...normalList, ...premiumList];
      
      for (const deal of allDeals) {
        if (deal && deal.id) {
          typeMap[deal.id] = deal.globalDealType ?? '';
        }
      }
      setDealTypeMap(typeMap);

      if (runningRes.status === "fulfilled" && runningRes.value) {
        setData(runningRes.value);
      } else {
        setError(runningRes.reason?.message ?? "Failed to load running investments.");
      }

      if (migratedRes.status === "fulfilled" && migratedRes.value) {
        setMigratedDeals(migratedRes.value);
      } else {
        setMigratedDeals([]);
        setMigratedError(migratedRes.reason?.message ?? "Failed to load offline data.");
      }
    })
    .catch(e => {
      setError(e.message ?? "Failed to fetch asset holdings details.");
    })
    .finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter running online deals to keep only ASSET globalDealType
  const runningAssetParticipations = useMemo(() => {
    const all = data?.participationInfo ?? [];
    return all.filter(p => dealTypeMap[p.dealId] === 'ASSET');
  }, [data?.participationInfo, dealTypeMap]);

  // Filter offline migrated deals to keep only ASSET globalDealType
  const migratedAssetDeals = useMemo(() => {
    return migratedDeals.filter(m => dealTypeMap[m.dealId] === 'ASSET');
  }, [migratedDeals, dealTypeMap]);

  const runningItems = useMemo(() => {
    return runningAssetParticipations.map((p, i) => ({
      source: "running",
      key: p.dealId ?? `running-${i}`,
      payload: p
    }));
  }, [runningAssetParticipations]);

  const mergedMigrated = useMemo(() => {
    return mergeMigratedByRoi(migratedAssetDeals);
  }, [migratedAssetDeals]);

  const migratedItems = useMemo(() => {
    return mergedMigrated.map((d, i) => ({
      source: "migrated",
      key: `${d.dealName ?? "deal"}-${d.roi ?? 0}-${i}`,
      payload: d
    }));
  }, [mergedMigrated]);

  const combinedItems = useMemo(() => {
    return [...runningItems, ...migratedItems];
  }, [runningItems, migratedItems]);

  const filteredItems = useMemo(() => {
    return combinedItems.filter(item => sourceFilter === "all" || item.source === sourceFilter);
  }, [combinedItems, sourceFilter]);

  // Calculations mirroring MyParticipations condition
  const runningInvested = useMemo(() => {
    return runningAssetParticipations.reduce((sum, p) => {
      const upds = (p.updatedParticipation ?? []).reduce((s, u) => s + (u.updationParticipation ?? 0), 0);
      return sum + (p.participatedAmount ?? 0) + upds;
    }, 0);
  }, [runningAssetParticipations]);

  const runningMonthlyYield = useMemo(() => {
    return runningAssetParticipations.reduce((sum, p) => {
      const entries = [
        { amount: p.participatedAmount ?? 0, roi: p.rateOfInterest ?? 0, payout: p.amountTye },
        ...(p.updatedParticipation ?? []).map(u => ({
          amount: u.updationParticipation ?? 0,
          roi: u.rateOfInterest ?? p.rateOfInterest ?? 0,
          payout: u.amountTye ?? p.amountTye
        })),
      ];
      return sum + entries.reduce((s, e) => s + monthlyEquiv(e.amount, e.roi, e.payout), 0);
    }, 0);
  }, [runningAssetParticipations]);

  const runningEntries = useMemo(() => {
    return runningAssetParticipations.reduce((s, p) => s + 1 + (p.updatedParticipation?.length ?? 0), 0);
  }, [runningAssetParticipations]);

  const migratedInvested = useMemo(() => {
    return mergedMigrated.reduce((s, d) => s + (d.participationAmount ?? 0), 0);
  }, [mergedMigrated]);

  const migratedMonthly = useMemo(() => {
    return mergedMigrated.reduce((s, d) => s + (d.monthlyInterest ?? 0), 0);
  }, [mergedMigrated]);

  const migratedEntries = useMemo(() => {
    return mergedMigrated.reduce((s, d) => s + (d.entryCount ?? 0), 0);
  }, [mergedMigrated]);

  const totalInvested = runningInvested + migratedInvested;
  const totalMonthlyYield = runningMonthlyYield + migratedMonthly;
  const totalEntries = runningEntries + migratedEntries;

  const avgRoi = useMemo(() => {
    const runningRois = runningAssetParticipations.map(p => Number(p.rateOfInterest ?? p.roi ?? 0)).filter(v => Number.isFinite(v));
    const migratedRois = mergedMigrated.map(d => Number(d.roi ?? 0)).filter(v => Number.isFinite(v));
    const rois = [...runningRois, ...migratedRois];
    if (rois.length === 0) return 0;
    return rois.reduce((s, v) => s + v, 0) / rois.length;
  }, [runningAssetParticipations, mergedMigrated]);

  return (
    <div className="grid gap-6">
      {/* Interest Statement Modal */}
      {interestDeal && (
        <InterestStatementModal
          deal={interestDeal}
          onClose={() => setInterestDeal(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 text-left">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
            <span style={{ color: '#06b6d4' }}><Building /></span> My Asset Investments
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Monitor your fractional real estate holdings, yields, and interest schedules.
          </p>
        </div>
        <button onClick={() => navigate('/asset')}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg,#06b6d4,#0891b2)', boxShadow: '0 4px 14px rgba(6,182,212,0.3)', cursor: 'pointer' }}>
          + Browse Properties
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-20 rounded-2xl animate-pulse" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#06b6d4', borderTopColor: 'transparent' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Fetching asset portfolio holdings…</span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="py-20 text-center rounded-2xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-bold text-red-500">{error}</p>
          <button onClick={loadData}
            className="mt-3 text-xs font-bold px-4 py-2 rounded-xl"
            style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.25)' }}>
            Retry Loading
          </button>
        </div>
      )}

      {/* Success Content */}
      {!loading && !error && (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fadeIn">
            {[
              { label: 'Active Holdings',     value: String(combinedItems.length),                                                    color: '#6366f1' },
              { label: 'Total Invested',      value: fmtINR(totalInvested),                                                           color: '#06b6d4' },
              { label: 'Avg ROI yield',       value: `${avgRoi.toFixed(2)}% p.a.`,                                                    color: '#10b981' },
              { label: 'Monthly Yield Payout',value: fmtINR(totalMonthlyYield),                                                      color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl px-4 py-3.5 text-left animate-fadeIn"
                style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <p className="text-xl font-black font-mono" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Source Filter Tabs */}
          <div className="rounded-2xl p-3 text-left" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { key: "all", label: `All (${combinedItems.length})`, color: '#6366f1' },
                { key: "running", label: `Running (${runningItems.length})`, color: '#10b981' },
                { key: "migrated", label: `Offline/Migrated (${migratedItems.length})`, color: '#f59e0b' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setSourceFilter(f.key)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={sourceFilter === f.key
                    ? { background: `${f.color}15`, color: f.color, border: `1px solid ${f.color}30`, cursor: 'pointer' }
                    : { background: "var(--input-bg)", color: "var(--text-muted)", border: "1px solid var(--border)", cursor: 'pointer' }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Offline/Migrated Warning Block if present */}
          {migratedError && (
            <div className="rounded-2xl px-4 py-3 text-sm font-semibold text-left" style={{ background: 'rgba(245,158,11,0.05)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
              Offline migrated data could not be fully loaded: {migratedError}
            </div>
          )}

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="py-20 text-center rounded-2xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No asset holdings found in selected filter.</p>
              {combinedItems.length === 0 && (
                <button onClick={() => navigate('/asset')}
                  className="mt-4 text-xs font-bold px-5 py-2.5 rounded-xl text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg,#06b6d4,#0891b2)', boxShadow: '0 4px 14px rgba(6,182,212,0.3)', cursor: 'pointer' }}>
                  Start Investing
                </button>
              )}
            </div>
          )}

          {/* Holdings Grid */}
          {filteredItems.length > 0 && (
            <div className="grid gap-4">
              {filteredItems.map((item, idx) => {
                if (item.source === 'running') {
                  const p = item.payload;
                  const amount = p.participatedAmount ?? 0;
                  const roi = p.rateOfInterest ?? 0;
                  const payoutTypeLabel = PAYOUT[p.amountTye]?.label ?? p.amountTye ?? "Monthly";
                  
                  const updatesCount = p.updatedParticipation?.length ?? 0;
                  const totalAmount = amount + (p.updatedParticipation ?? []).reduce((s, u) => s + (u.updationParticipation ?? 0), 0);
                  const maxParticipation = p.maxParticipation ?? 0;
                  const canMore = maxParticipation > 0 && totalAmount < maxParticipation;

                  return (
                    <div key={item.key} className="rounded-2xl overflow-hidden border p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:translate-y-[-1px]"
                      style={{ background: 'var(--surface-card)', borderColor: 'var(--border)', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
                      
                      <div className="text-left flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', color: '#06b6d4' }}>
                          <Building />
                        </div>
                        <div>
                          <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>{p.dealName}</h3>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            Invested Date: <span className="font-semibold">{p.participationDate || p.participatedDate || '—'}</span> &nbsp;·&nbsp; Interest Date: <span className="font-semibold">{p.interestDate || '—'}</span>
                          </p>
                          {updatesCount > 0 && (
                            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                              +{updatesCount} Top-up updates
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted" style={{ color: 'var(--text-muted)' }}>Invested Amount</p>
                          <p className="text-lg font-black text-indigo-500 font-mono mt-0.5">{fmtINR(totalAmount)}</p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted" style={{ color: 'var(--text-muted)' }}>ROI Payout</p>
                          <p className="text-lg font-black text-emerald-500 font-mono mt-0.5">{roi}% <span className="text-[10px] font-medium text-muted">({payoutTypeLabel.toLowerCase()})</span></p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button onClick={() => setInterestDeal({ dealId: p.dealId, dealName: p.dealName })}
                            className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 flex items-center gap-1.5 border"
                            style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border)', cursor: 'pointer' }}>
                            <EyeIcon /> Statement
                          </button>

                          {canMore && (
                            <button onClick={() => navigate(`/asset/participate/${p.dealId}`)}
                              className="px-3 py-2 rounded-xl text-xs font-black transition-all hover:scale-105 flex items-center gap-1 text-white border-none"
                              style={{ background: 'linear-gradient(135deg,#06b6d4,#0891b2)', boxShadow: '0 4px 12px rgba(6,182,212,0.25)', cursor: 'pointer' }}>
                              + Add Funds
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <MigratedDealRow
                      key={item.key}
                      d={item.payload}
                      index={idx}
                    />
                  );
                }
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
