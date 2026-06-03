import { Fragment, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRunningDeals, getUserOfflineParticipationDealsInfo, getUserViewInterestStatement } from "../api/afterlogin-user";
import { formatINR } from "../utils/currency";

const INDIGO = '#6366f1';
const PURPLE = '#818cf8';
const GREEN  = '#10b981';
const AMBER  = '#f59e0b';
const RED    = '#ef4444';
// const MIGRATED_LENDER_ID = "8f6e032f-2c1d-4b2b-b790-0a6d39919640";

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const TrendUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const PulseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="18" cy="12" r="2"/>
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const CalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const LayersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
  </svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

function fmtINR(n) {
  return formatINR(n ?? 0);
}

function fmtNullable(v, fallback = "-") {
  return v === null || v === undefined || v === "" ? fallback : String(v);
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
        earliestDate: item?.participationDate ?? null,
        entries: [],
      });
    }
    const g = groups.get(key);
    g.entries.push(item);
    g.payOutType = g.payOutType ?? item?.payOutType ?? null;
    const oldDate = parseDdMmYyyy(g.earliestDate);
    const nextDate = parseDdMmYyyy(item?.participationDate);
    if (!oldDate || (nextDate && nextDate < oldDate)) g.earliestDate = item?.participationDate ?? g.earliestDate;
  }

  return Array.from(groups.values()).map(g => {
    const currentPrincipalTotal = g.entries.reduce((s, e) => s + Number(e?.currentPrincipalAmount ?? 0), 0);
    const monthlyInterestTotal = g.entries.reduce(
      (s, e) => s + monthlyEquiv(Number(e?.currentPrincipalAmount ?? 0), Number(e?.roi ?? g.roi ?? 0), "MONTHLY"),
      0
    );
    const returnedTotal = g.entries.reduce((s, e) => s + Number(e?.principalReturnedAmount ?? 0), 0);
    const sortedEntries = [...g.entries].sort((a, b) => {
      const ad = parseDdMmYyyy(a?.participationDate);
      const bd = parseDdMmYyyy(b?.participationDate);
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

const PAYOUT = {
  MONTHLY:      { label: "Monthly",     months: 1  },
  QUARTELY:     { label: "Quarterly",   months: 3  },
  HALFLY:       { label: "Half-Yearly", months: 6  },
  YEARLY:       { label: "Yearly",      months: 12 },
  ENDOFTHEDEAL: { label: "End of Deal", months: 0  },
};

function monthlyEquiv(amount, roi, type) {
  if (!amount || !roi) return 0;
  const m = PAYOUT[type]?.months ?? 1;
  if (m === 0) return 0;
  return amount * (roi / 100) / m;
}

function payoutInterest(amount, roi, type) {
  if (!amount || !roi) return 0;
  const m = PAYOUT[type]?.months ?? 1;
  if (m === 0) return amount * roi / 100;
  return amount * (roi / 100);
}

function interestStatusChip(status) {
  const s = (status ?? "").toUpperCase();
  if (s === "PAID") {
    return <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ color: GREEN, background: `${GREEN}16`, border: `1px solid ${GREEN}30` }}>PAID</span>;
  }
  if (s === "NOTYETPAID" || s === "NOT YET PAID") {
    return <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ color: AMBER, background: `${AMBER}16`, border: `1px solid ${AMBER}30` }}>NOT YET PAID</span>;
  }
  return <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ color: RED, background: `${RED}16`, border: `1px solid ${RED}30` }}>{s || "NA"}</span>;
}

function InterestStatementModal({ deal, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedIdx, setExpandedIdx] = useState(null);

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

  const totalInterest = useMemo(
    () => rows.reduce((sum, r) => sum + Number(r?.interestAmount ?? 0), 0),
    [rows]
  );

  // First-row amount & date (filled only for month 1 in the API)
  const firstRow = rows[0] ?? {};
  const participationAmount = data?.totalParticipationAmount ?? firstRow?.participationAmount ?? null;
  const participationDate   = firstRow?.participationDate ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl overflow-hidden w-full flex flex-col"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--border)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
          maxHeight: "92vh",
          maxWidth: "min(960px, 96vw)",
          width: "100%",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-start justify-between gap-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: AMBER }}>Interest Statement</p>
            <h2 className="text-base sm:text-xl font-black truncate" style={{ color: "var(--text-primary)" }}>{deal?.dealName ?? "SD Deal"}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 flex-shrink-0 mt-0.5"
            style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
            aria-label="Close interest statement modal"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="overflow-y-auto p-5 grid gap-4">
          {loading && (
            <div className="py-14 text-center text-sm font-bold" style={{ color: "var(--text-muted)" }}>
              Loading interest statement...
            </div>
          )}

          {!loading && error && (
            <div className="py-12 grid place-items-center gap-3 text-center">
              <p className="text-sm font-bold" style={{ color: RED }}>{error}</p>
              <button
                type="button"
                onClick={load}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                style={{ background: `${INDIGO}12`, color: INDIGO, border: `1px solid ${INDIGO}25` }}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Top info bar — Amount Invested + Participation Date always visible */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 min-w-[140px]" style={{ background: `${INDIGO}0f`, border: `1px solid ${INDIGO}28` }}>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Amount Invested</p>
                    <p className="text-base font-black tabular-nums" style={{ color: INDIGO, fontFamily: "'JetBrains Mono',monospace" }}>
                      {participationAmount != null ? fmtINR(participationAmount) : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 min-w-[140px]" style={{ background: `${GREEN}0f`, border: `1px solid ${GREEN}28` }}>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Participation Date</p>
                    <p className="text-base font-black" style={{ color: GREEN }}>
                      {participationDate ?? "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Summary KPI cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  // { label: "Total Participation",     value: participationAmount != null ? fmtINR(participationAmount) : "-", color: INDIGO },
                  { label: "Total Interest",           value: fmtINR(totalInterest),                                          color: AMBER  },
                  { label: "ROI",                      value: data?.roi != null ? `${data.roi}%` : "-",                       color: GREEN  },
                  { label: "Return Type",              value: data?.returnType ?? "-",                                         color: PURPLE },
                ].map(s => (
                  <div key={s.label} className="rounded-xl px-3 py-3" style={{ border: `1px solid ${s.color}28`, background: `${s.color}0f` }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                    <p className="text-lg font-black mt-1 truncate" style={{ color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Statement — desktop table / mobile cards */}
              {rows.length > 0 ? (
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--surface-card)" }}>
                  <div className="px-4 py-3 flex items-center justify-between gap-2 flex-wrap" style={{ borderBottom: "1px solid var(--border)", background: "var(--input-bg)" }}>
                    <p className="text-xs font-black uppercase tracking-wider" style={{ color: AMBER }}>Monthly Interest Schedule</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${AMBER}14`, color: AMBER, border: `1px solid ${AMBER}30` }}>
                      {rows.length} months
                    </span>
                  </div>

                  {/* ── Desktop table (hidden on mobile) ── */}
                  <div className="hidden sm:block overflow-x-auto overflow-y-auto" style={{ maxHeight: "50vh" }}>
                    <table className="w-full text-sm" style={{ minWidth: 640 }}>
                      <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                        <tr style={{ background: "var(--table-header-bg)" }}>
                          {["#", "Actual Int. Date", "Days", "Interest", "Paid Date", "Status"].map(h => (
                            <th key={h} className="text-left py-3 px-3 text-[11px] font-black uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, idx) => {
                          const hasBreakup = Array.isArray(row?.updationParticiInterestStatement) && row.updationParticiInterestStatement.length > 0;
                          const isExpanded = expandedIdx === idx;
                          return (
                            <Fragment key={idx}>
                              <tr
                                style={{ borderTop: "1px solid var(--border)" }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--row-hover)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                              >
                                <td className="py-3 px-3 text-xs font-bold" style={{ color: "var(--text-muted)" }}>{idx + 1}</td>
                                <td className="py-3 px-3 text-xs whitespace-nowrap font-semibold" style={{ color: "var(--text-primary)" }}>{row?.actualInterestDate ?? "-"}</td>
                                {/* <td className="py-3 px-3 font-bold tabular-nums whitespace-nowrap" style={{ color: INDIGO, fontFamily: "'JetBrains Mono',monospace" }}>
                                  {row?.participationAmount != null ? fmtINR(row.participationAmount) : "-"}
                                </td> */}
                                {/* <td className="py-3 px-3 text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{row?.participationDate ?? "-"}</td> */}
                                <td className="py-3 px-3 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{row?.days ?? "-"}</td>
                                <td className="py-3 px-3 font-black tabular-nums whitespace-nowrap" style={{ color: AMBER, fontFamily: "'JetBrains Mono',monospace" }}>
                                  {fmtINR(row?.interestAmount ?? 0)}
                                  {hasBreakup && (
                                    <button
                                      type="button"
                                      onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                                      className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                      style={{ border: `1px solid ${PURPLE}40`, background: `${PURPLE}14`, color: PURPLE }}
                                    >
                                      {isExpanded ? "Close" : "BreakUp"}
                                    </button>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{row?.paidDate ?? "-"}</td>
                                <td className="py-3 px-3">{interestStatusChip(row?.status)}</td>
                              </tr>

                              {/* Breakup sub-table */}
                              {isExpanded && hasBreakup && (
                                <tr style={{ borderTop: "1px solid var(--border)", background: "var(--table-header-bg)" }}>
                                  <td colSpan={8} className="p-3">
                                    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${PURPLE}30` }}>
                                      <div className="px-3 py-2" style={{ background: `${PURPLE}10`, borderBottom: `1px solid ${PURPLE}20` }}>
                                        <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: PURPLE }}>
                                          First Month Participation Breakup — {row.updationParticiInterestStatement.length + 1} entries
                                        </p>
                                      </div>
                                      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "200px" }}>
                                      <table className="w-full text-sm">
                                        <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                          <tr style={{ background: "var(--table-header-bg)" }}>
                                            {["#", "Participation Date", "Days", "Amount Invested", "Interest", "Status"].map(h => (
                                              <th key={h} className="text-left py-2 px-3 text-[10px] font-black uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{h}</th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {/* Base (initial) entry for this month */}
                                          <tr style={{ borderTop: "1px solid var(--border)" }}>
                                            <td className="py-2 px-3 text-xs font-bold" style={{ color: "var(--text-muted)" }}>1</td>
                                            <td className="py-2 px-3 text-xs" style={{ color: "var(--text-primary)" }}>{row?.participationDate ?? "-"}</td>
                                            <td className="py-2 px-3 text-xs" style={{ color: "var(--text-muted)" }}>{row?.days ?? "-"}</td>
                                            <td className="py-2 px-3 font-bold tabular-nums whitespace-nowrap" style={{ color: INDIGO, fontFamily: "'JetBrains Mono',monospace" }}>
                                              {row?.participationAmount != null ? fmtINR(row.participationAmount) : "-"}
                                            </td>
                                            <td className="py-2 px-3 font-bold tabular-nums whitespace-nowrap" style={{ color: AMBER, fontFamily: "'JetBrains Mono',monospace" }}>
                                              {fmtINR(row?.interestAmount ?? 0)}
                                            </td>
                                            <td className="py-2 px-3">{interestStatusChip(row?.status)}</td>
                                          </tr>
                                          {/* Top-up entries within the first month */}
                                          {row.updationParticiInterestStatement.map((upd, uIdx) => (
                                            <tr key={`upd-${uIdx}`} style={{ borderTop: "1px solid var(--border)" }}>
                                              <td className="py-2 px-3 text-xs font-bold" style={{ color: "var(--text-muted)" }}>{uIdx + 2}</td>
                                              <td className="py-2 px-3 text-xs" style={{ color: "var(--text-primary)" }}>{upd?.participationDate ?? "-"}</td>
                                              <td className="py-2 px-3 text-xs" style={{ color: "var(--text-muted)" }}>{upd?.days ?? "-"}</td>
                                              <td className="py-2 px-3 font-bold tabular-nums whitespace-nowrap" style={{ color: INDIGO, fontFamily: "'JetBrains Mono',monospace" }}>
                                                {upd?.participationAmount != null ? fmtINR(upd.participationAmount) : "-"}
                                              </td>
                                              <td className="py-2 px-3 font-bold tabular-nums whitespace-nowrap" style={{ color: AMBER, fontFamily: "'JetBrains Mono',monospace" }}>
                                                {fmtINR(upd?.interestAmount ?? 0)}
                                              </td>
                                              <td className="py-2 px-3">{interestStatusChip(upd?.status)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                        <tfoot>
                                          <tr style={{ borderTop: `2px solid ${PURPLE}30`, background: `${PURPLE}08` }}>
                                            <td colSpan={3} className="py-2 px-3 text-xs font-black uppercase" style={{ color: PURPLE }}>Total</td>
                                            <td className="py-2 px-3 font-black tabular-nums whitespace-nowrap" style={{ color: INDIGO, fontFamily: "'JetBrains Mono',monospace" }}>
                                              {fmtINR((row?.participationAmount ?? 0) + row.updationParticiInterestStatement.reduce((s, u) => s + Number(u?.participationAmount ?? 0), 0))}
                                            </td>
                                            <td className="py-2 px-3 font-black tabular-nums whitespace-nowrap" style={{ color: AMBER, fontFamily: "'JetBrains Mono',monospace" }}>
                                              {fmtINR((row?.interestAmount ?? 0) + row.updationParticiInterestStatement.reduce((s, u) => s + Number(u?.interestAmount ?? 0), 0))}
                                            </td>
                                            <td />
                                          </tr>
                                        </tfoot>
                                      </table>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop: `2px solid var(--border)`, background: `${AMBER}18` }}>
                          <td colSpan={5} className="py-3 px-3 text-xs font-black uppercase tracking-wider" style={{ color: AMBER }}>Total Interest</td>
                          <td className="py-3 px-3 font-black tabular-nums" style={{ color: AMBER, fontFamily: "'JetBrains Mono',monospace" }}>{fmtINR(totalInterest)}</td>
                          <td colSpan={2} />
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* ── Mobile cards (shown only on mobile) ── */}
                  <div className="sm:hidden divide-y overflow-y-auto" style={{ borderColor: "var(--border)", maxHeight: "55vh" }}>
                    {rows.map((row, idx) => {
                      const hasBreakup = Array.isArray(row?.updationParticiInterestStatement) && row.updationParticiInterestStatement.length > 0;
                      const isExpanded = expandedIdx === idx;
                      return (
                        <div key={idx} className="p-3 grid gap-2">
                          {/* Row header */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Month {idx + 1}</span>
                            {interestStatusChip(row?.status)}
                          </div>

                          {/* Primary info grid */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-lg px-3 py-2" style={{ background: `${AMBER}0f`, border: `1px solid ${AMBER}20` }}>
                              <p className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>Interest</p>
                              <p className="text-base font-black tabular-nums" style={{ color: AMBER, fontFamily: "'JetBrains Mono',monospace" }}>{fmtINR(row?.interestAmount ?? 0)}</p>
                            </div>
                            <div className="rounded-lg px-3 py-2" style={{ background: `${INDIGO}0f`, border: `1px solid ${INDIGO}20` }}>
                              <p className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>Invested</p>
                              <p className="text-base font-black tabular-nums" style={{ color: INDIGO, fontFamily: "'JetBrains Mono',monospace" }}>
                                {row?.participationAmount != null ? fmtINR(row.participationAmount) : "-"}
                              </p>
                            </div>
                          </div>

                          {/* Secondary details */}
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                            <div className="flex justify-between">
                              <span style={{ color: "var(--text-muted)" }}>Interest Date</span>
                              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{row?.actualInterestDate ?? "-"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span style={{ color: "var(--text-muted)" }}>Part. Date</span>
                              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{row?.participationDate ?? "-"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span style={{ color: "var(--text-muted)" }}>Days</span>
                              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{row?.days ?? "-"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span style={{ color: "var(--text-muted)" }}>Paid Date</span>
                              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{row?.paidDate ?? "-"}</span>
                            </div>
                          </div>

                          {/* BreakUp toggle */}
                          {hasBreakup && (
                            <button
                              type="button"
                              onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                              className="w-full py-1.5 rounded-lg text-xs font-bold transition-all"
                              style={{ border: `1px solid ${PURPLE}40`, background: isExpanded ? `${PURPLE}18` : `${PURPLE}0a`, color: PURPLE }}
                            >
                              {isExpanded ? "Close Breakup" : `View First-Month Breakup (${row.updationParticiInterestStatement.length + 1} entries)`}
                            </button>
                          )}

                          {isExpanded && hasBreakup && (
                            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${PURPLE}30` }}>
                              <div className="px-3 py-2" style={{ background: `${PURPLE}10`, borderBottom: `1px solid ${PURPLE}20` }}>
                                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: PURPLE }}>Breakup</p>
                              </div>
                              <div className="divide-y" style={{ borderColor: `${PURPLE}20` }}>
                                {[
                                  { date: row?.participationDate, days: row?.days, amount: row?.participationAmount, interest: row?.interestAmount, status: row?.status },
                                  ...row.updationParticiInterestStatement.map(u => ({ date: u?.participationDate, days: u?.days, amount: u?.participationAmount, interest: u?.interestAmount, status: u?.status })),
                                ].map((entry, eIdx) => (
                                  <div key={eIdx} className="px-3 py-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
                                    <span className="col-span-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: PURPLE }}>Entry {eIdx + 1}</span>
                                    <div className="flex justify-between"><span style={{ color: "var(--text-muted)" }}>Date</span><span className="font-semibold" style={{ color: "var(--text-primary)" }}>{entry.date ?? "-"}</span></div>
                                    <div className="flex justify-between"><span style={{ color: "var(--text-muted)" }}>Days</span><span className="font-semibold" style={{ color: "var(--text-primary)" }}>{entry.days ?? "-"}</span></div>
                                    <div className="flex justify-between"><span style={{ color: "var(--text-muted)" }}>Invested</span><span className="font-bold tabular-nums" style={{ color: INDIGO }}>{entry.amount != null ? fmtINR(entry.amount) : "-"}</span></div>
                                    <div className="flex justify-between"><span style={{ color: "var(--text-muted)" }}>Interest</span><span className="font-bold tabular-nums" style={{ color: AMBER }}>{fmtINR(entry.interest ?? 0)}</span></div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Mobile total footer */}
                    <div className="px-3 py-3 flex justify-between items-center" style={{ background: `${AMBER}10` }}>
                      <span className="text-xs font-black uppercase tracking-wider" style={{ color: AMBER }}>Total Interest</span>
                      <span className="font-black tabular-nums" style={{ color: AMBER, fontFamily: "'JetBrains Mono',monospace" }}>{fmtINR(totalInterest)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl px-4 py-8 text-center text-sm font-semibold" style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                  No interest statement available.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DealRow({ p, index, navigate, onViewInterest }) {
  const [expanded, setExpanded] = useState(false);
  const updates = p.updatedParticipation ?? [];

  const allEntries = [
    {
      type:    "initial",
      label:   "Initial Participation",
      date:    p.participatedDate,
      amount:  p.participatedAmount ?? 0,
      roi:     p.rateOfInterest ?? 0,
      payout:  p.amountTye,
    },
    ...updates.map((u, i) => ({
      type:   "update",
      label:  `Top-up #${i + 1}`,
      date:   u.updatedDate ?? "",
      amount: u.updationParticipation ?? 0,
      roi:    u.rateOfInterest ?? p.rateOfInterest ?? 0,
      payout: u.amountTye ?? p.amountTye,
    })),
  ];

  const totalInvested = allEntries.reduce((s, e) => s + e.amount, 0);
  const totalMonthly  = allEntries.reduce((s, e) => s + monthlyEquiv(e.amount, e.roi, e.payout), 0);
  const maxParticipation = p.maxParticipation ?? 0;
  const canMore = maxParticipation > 0 && totalInvested < maxParticipation;
  const remaining = maxParticipation - totalInvested;

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: "var(--surface-card)", border: "1px solid var(--border)", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 8px 40px rgba(0,0,0,0.14)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = `${INDIGO}40`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <div className="flex">
        <div className="w-1 flex-shrink-0" style={{ background: `linear-gradient(180deg,${INDIGO},${GREEN})` }} />
        <div className="flex-1 px-4 py-3">
          <div className="flex items-center gap-2.5 flex-wrap">

            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black"
                style={{ background: `${INDIGO}15`, color: INDIGO, border: `2px solid ${INDIGO}30`, boxShadow: `0 0 20px ${INDIGO}20` }}
              >
                {index + 1}
              </div>
              <div className="min-w-0">
                <p
                  className="text-lg font-extrabold truncate"
                  style={{ color: "var(--text-primary)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "-0.02em" }}
                >
                  {p.dealName}
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    <CalIcon /> Since {p.participatedDate}
                  </span>
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-bold"
                    style={{ background: `${GREEN}15`, color: GREEN, border: `1px solid ${GREEN}30` }}
                  >
                     Active
                  </span>
                  {p.amountTye && (
                    <span
                      className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                      style={{ background: `${PURPLE}12`, color: PURPLE, border: `1px solid ${PURPLE}25` }}
                    >
                      {PAYOUT[p.amountTye]?.label ?? p.amountTye}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: "Total Invested",   value: fmtINR(totalInvested), color: INDIGO },
                { label: "Monthly Interest", value: fmtINR(totalMonthly),  color: GREEN  },
                { label: "ROI",              value: `${p.rateOfInterest ?? 0}%`, color: AMBER },
                { label: "Entries",          value: String(allEntries.length), color: PURPLE },
              ].map(s => (
                <div
                  key={s.label}
                  className="flex flex-col items-center px-3 py-2 rounded-xl min-w-[72px] transition-all duration-200"
                  style={{ background: `${s.color}08`, border: `1px solid ${s.color}15` }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${s.color}14`; e.currentTarget.style.transform = "scale(1.05)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${s.color}08`; e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <span
                    className="text-[20px] font-black leading-none"
                    style={{ color: s.color, fontFamily: "'JetBrains Mono',monospace" }}
                  >
                    {s.value}
                  </span>
                  <span className="text-[11px] mt-1 font-semibold whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{s.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => onViewInterest(p)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
                style={{ background: `${GREEN}12`, color: GREEN, border: `1px solid ${GREEN}30` }}
              >
                <EyeIcon /> View Interest
              </button>
              {canMore && (
                <button
                  onClick={() => navigate(`/sd-lot/participate/${p.dealId}`)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ background: `linear-gradient(135deg,${INDIGO},#4338ca)`, color: "#fff", boxShadow: `0 4px 16px ${INDIGO}50` }}
                >
                  <PlusIcon /> Add More
                </button>
              )}
              <button
                onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: expanded ? `${INDIGO}12` : "var(--input-bg)",
                  color: INDIGO,
                  border: `1px solid ${expanded ? `${INDIGO}30` : "var(--border)"}`,
                }}
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
        <div style={{ borderTop: "1px solid var(--border)", background: "var(--input-bg)" }}>

          {maxParticipation > 0 && (
            <div className="px-5 pt-4">
              <div className="rounded-xl px-4 py-3" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Capacity Used</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                      {fmtINR(totalInvested)} / {fmtINR(maxParticipation)}
                    </span>
                    {canMore
                      ? <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${INDIGO}12`, color: INDIGO, border: `1px solid ${INDIGO}25` }}>{fmtINR(remaining)} available</span>
                      : <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${GREEN}12`, color: GREEN, border: `1px solid ${GREEN}25` }}>Max reached</span>
                    }
                  </div>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min((totalInvested / maxParticipation) * 100, 100)}%`,
                      background: canMore ? `linear-gradient(90deg,${INDIGO},${PURPLE})` : `linear-gradient(90deg,${GREEN},#34d399)`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="p-5">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: INDIGO }}>
              Investment History  {allEntries.length} {allEntries.length === 1 ? "entry" : "entries"}
            </p>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--table-header-bg)", borderBottom: "1px solid var(--border)" }}>
                    {["#", "Type", "Date", "Amount", "ROI %", "Payout", "Per Payout", "Monthly Equiv."].map(h => (
                      <th key={h} className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allEntries.map((e, i) => {
                    const perPayout = payoutInterest(e.amount, e.roi, e.payout);
                    const monthly   = monthlyEquiv(e.amount, e.roi, e.payout);
                    const isInitial = e.type === "initial";
                    return (
                      <tr
                        key={i}
                        style={{ borderBottom: i < allEntries.length - 1 ? "1px solid var(--border)" : "none" }}
                        onMouseEnter={ev => ev.currentTarget.style.background = "var(--row-hover)"}
                        onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}
                      >
                        <td className="py-3 px-3 font-bold text-xs" style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                        <td className="py-3 px-3">
                          <span
                            className="text-xs px-2.5 py-1 rounded-full font-bold"
                            style={isInitial
                              ? { background: `${INDIGO}12`, color: INDIGO, border: `1px solid ${INDIGO}30` }
                              : { background: `${GREEN}12`, color: GREEN, border: `1px solid ${GREEN}30` }}
                          >
                            {e.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{e.date}</td>
                        <td className="py-3 px-3 font-extrabold tabular-nums" style={{ color: isInitial ? INDIGO : GREEN, fontFamily: "'JetBrains Mono',monospace" }}>
                          {fmtINR(e.amount)}
                        </td>
                        <td className="py-3 px-3 font-bold" style={{ color: AMBER }}>{e.roi}%</td>
                        <td className="py-3 px-3">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${PURPLE}10`, color: PURPLE, border: `1px solid ${PURPLE}20` }}>
                            {PAYOUT[e.payout]?.label ?? e.payout ?? ""}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold tabular-nums" style={{ color: AMBER, fontFamily: "'JetBrains Mono',monospace" }}>
                          {perPayout > 0 ? fmtINR(perPayout) : ""}
                        </td>
                        <td className="py-3 px-3 font-bold tabular-nums" style={{ color: GREEN, fontFamily: "'JetBrains Mono',monospace" }}>
                          {monthly > 0 ? fmtINR(monthly) : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: `2px solid var(--border)`, background: `${INDIGO}35` }}>
                    <td colSpan={3} className="py-3 px-3 text-xs font-black uppercase tracking-wider" style={{ color: INDIGO }}>Total</td>
                    <td className="py-3 px-3 font-black tabular-nums" style={{ color: INDIGO, fontFamily: "'JetBrains Mono',monospace" }}>{fmtINR(totalInvested)}</td>
                    <td className="py-3 px-3" />
                    <td className="py-3 px-3" />
                    <td className="py-3 px-3 font-black tabular-nums" style={{ color: AMBER, fontFamily: "'JetBrains Mono',monospace" }}>
                      {fmtINR(allEntries.reduce((s, e) => s + payoutInterest(e.amount, e.roi, e.payout), 0))}
                    </td>
                    <td className="py-3 px-3 font-black tabular-nums" style={{ color: GREEN, fontFamily: "'JetBrains Mono',monospace" }}>
                      {fmtINR(totalMonthly)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {canMore && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => navigate(`/sd-lot/participate/${p.dealId}`)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                  style={{ background: `linear-gradient(135deg,${INDIGO},#4338ca)`, color: "#fff", boxShadow: `0 4px 16px ${INDIGO}40` }}
                >
                  <PlusIcon /> Add {fmtINR(remaining)} more
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MigratedDealRow({ d, index }) {
  const [expanded, setExpanded] = useState(false);
  const roi = d.roi ?? 0;
  const participation = d.participationAmount ?? 0;
  const monthly = d.monthlyInterest ?? 0;
  const entryCount = d.entryCount ?? (d.entries?.length ?? 0);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: "var(--surface-card)", border: "1px solid var(--border)", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 8px 40px rgba(0,0,0,0.14)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = `${AMBER}40`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <div className="flex">
        <div className="w-1 flex-shrink-0" style={{ background: `linear-gradient(180deg,${AMBER},${GREEN})` }} />
        <div className="flex-1 px-4 py-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black"
                style={{ background: `${AMBER}15`, color: AMBER, border: `2px solid ${AMBER}30`, boxShadow: `0 0 20px ${AMBER}20` }}
              >
                {index + 1}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-extrabold truncate" style={{ color: "var(--text-primary)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "-0.02em" }}>
                  {fmtNullable(d.dealName)}
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    <CalIcon /> Since {fmtNullable(d.earliestDate)}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold" style={{ background: `${AMBER}15`, color: AMBER, border: `1px solid ${AMBER}30` }}>
                    Migrated
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold" style={{ background: `${PURPLE}12`, color: PURPLE, border: `1px solid ${PURPLE}25` }}>
                    {fmtNullable(d.payOutType)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: "Participation", value: fmtINR(participation), color: INDIGO },
                { label: "Monthly Interest", value: fmtINR(monthly), color: GREEN },
                { label: "ROI", value: `${roi}%`, color: AMBER },
                { label: "Entries", value: String(entryCount), color: PURPLE },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center px-3 py-2 rounded-xl min-w-[72px]" style={{ background: `${s.color}08`, border: `1px solid ${s.color}15` }}>
                  <span className="text-[20px] font-black leading-none" style={{ color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</span>
                  <span className="text-[11px] mt-1 font-semibold whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{s.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                disabled
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold cursor-not-allowed opacity-60"
                style={{ background: "var(--input-bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
              >
                <PlusIcon /> Add More
              </button>
              <button
                onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background: expanded ? `${AMBER}12` : "var(--input-bg)", color: AMBER, border: `1px solid ${expanded ? `${AMBER}30` : "var(--border)"}` }}
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
                      { short: "Deal", title: "Deal" },
                      { short: "ROI", title: "Return on Investment" },
                      { short: "Part.", title: "Participation" },
                      { short: "Curr. Prin.", title: "Current Principal" },
                      { short: "Ret.", title: "Returned" },
                      { short: "Payout", title: "Payout Type" },
                      { short: "Txn", title: "Transaction Type" },
                      { short: "Int. Dt", title: "Interest Date" },
                      { short: "Part. Dt", title: "Participation Date" },
                      { short: "Mth. Eqv.", title: "Monthly Equivalent" },
                    ].map(h => (
                      <th
                        key={h.short}
                        title={h.title}
                        className="text-left py-2 px-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
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
                      <td className="py-2 px-2 font-semibold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>{fmtNullable(entry?.dealName)}</td>
                      <td className="py-2 px-2 font-bold whitespace-nowrap" style={{ color: AMBER }}>{fmtNullable(entry?.roi)}%</td>
                      <td className="py-2 px-2 font-bold tabular-nums whitespace-nowrap" style={{ color: INDIGO, fontFamily: "'JetBrains Mono',monospace" }}>{fmtINR(entry?.participationAmount ?? 0)}</td>
                      <td className="py-2 px-2 font-semibold tabular-nums whitespace-nowrap" style={{ color: GREEN, fontFamily: "'JetBrains Mono',monospace" }}>{fmtINR(entry?.currentPrincipalAmount ?? 0)}</td>
                      <td className="py-2 px-2 font-semibold tabular-nums whitespace-nowrap" style={{ color: "var(--text-primary)", fontFamily: "'JetBrains Mono',monospace" }}>
                        {entry?.principalReturnedAmount === null ? "-" : fmtINR(entry?.principalReturnedAmount ?? 0)}
                      </td>
                      <td className="py-2 px-2 text-xs font-semibold whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{fmtNullable(entry?.payOutType)}</td>
                      <td className="py-2 px-2 text-xs font-semibold whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{fmtNullable(entry?.typeOfTransaction)}</td>
                      <td className="py-2 px-2 text-xs font-semibold whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{fmtNullable(entry?.interestDate)}</td>
                      <td className="py-2 px-2 text-xs font-semibold whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{fmtNullable(entry?.participationDate)}</td>
                      <td className="py-2 px-2 font-bold tabular-nums whitespace-nowrap" style={{ color: GREEN, fontFamily: "'JetBrains Mono',monospace" }}>
                        {fmtINR(monthlyEquiv(entry?.currentPrincipalAmount ?? 0, entry?.roi ?? 0, "MONTHLY"))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2px solid var(--border)", background: `${AMBER}35` }}>
                    <td colSpan={2} className="py-2 px-2 text-xs font-black uppercase tracking-wider" style={{ color: AMBER }}>Total</td>
                    <td className="py-2 px-2 font-black tabular-nums whitespace-nowrap" style={{ color: INDIGO, fontFamily: "'JetBrains Mono',monospace" }}>{fmtINR(d.entries.reduce((s, e) => s + (e?.participationAmount ?? 0), 0))}</td>
                    <td className="py-2 px-2 font-black tabular-nums whitespace-nowrap" style={{ color: GREEN, fontFamily: "'JetBrains Mono',monospace" }}>{fmtINR(participation)}</td>
                    <td className="py-2 px-2 font-black tabular-nums whitespace-nowrap" style={{ color: PURPLE, fontFamily: "'JetBrains Mono',monospace" }}>{fmtINR(d.returnedAmount ?? 0)}</td>
                    <td className="py-2 px-2" />
                    <td className="py-2 px-2" />
                    <td className="py-2 px-2" />
                    <td className="py-2 px-2" />
                    <td className="py-2 px-2 font-black tabular-nums whitespace-nowrap" style={{ color: GREEN, fontFamily: "'JetBrains Mono',monospace" }}>{fmtINR(monthly)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyParticipations() {
  const navigate  = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [migratedDeals, setMigratedDeals] = useState([]);
  const [migratedError, setMigratedError] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [interestDeal, setInterestDeal] = useState(null);

  const load = () => {
    setLoading(true);
    setError("");
    setMigratedError("");

    Promise.allSettled([
      getRunningDeals(),
      getUserOfflineParticipationDealsInfo(),
    ])
      .then(([runningRes, migratedRes]) => {
        if (runningRes.status === "fulfilled") {
          if (runningRes.value) setData(runningRes.value);
        } else {
          setError(runningRes.reason?.message ?? "Failed to load");
        }

        if (migratedRes.status === "fulfilled") {
          setMigratedDeals(Array.isArray(migratedRes.value) ? migratedRes.value : []);
        } else {
          setMigratedDeals([]);
          setMigratedError(migratedRes.reason?.message ?? "Failed to load migrated data");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const participations = data?.participationInfo ?? [];
  const runningItems = participations.map((p, i) => ({ source: "running", key: p.dealId ?? `running-${i}`, payload: p }));
  const mergedMigrated = mergeMigratedByRoi(migratedDeals);
  const migratedItems = mergedMigrated.map((d, i) => ({ source: "migrated", key: `${d.dealName ?? "deal"}-${d.roi ?? 0}-${i}`, payload: d }));
  const combinedItems = [...runningItems, ...migratedItems];
  const filteredItems = combinedItems.filter(item => sourceFilter === "all" || item.source === sourceFilter);

  const runningInvested = participations.reduce((s, p) => {
    const upds = (p.updatedParticipation ?? []).reduce((ss, u) => ss + (u.updationParticipation ?? 0), 0);
    return s + (p.participatedAmount ?? 0) + upds;
  }, 0);

  const runningMonthly = participations.reduce((s, p) => {
    const entries = [
      { amount: p.participatedAmount ?? 0, roi: p.rateOfInterest ?? 0, payout: p.amountTye },
      ...(p.updatedParticipation ?? []).map(u => ({ amount: u.updationParticipation ?? 0, roi: u.rateOfInterest ?? p.rateOfInterest ?? 0, payout: u.amountTye ?? p.amountTye })),
    ];
    return s + entries.reduce((ss, e) => ss + monthlyEquiv(e.amount, e.roi, e.payout), 0);
  }, 0);

  const runningEntries = participations.reduce((s, p) => s + 1 + (p.updatedParticipation?.length ?? 0), 0);
  const migratedInvested = mergedMigrated.reduce((s, d) => s + (d.participationAmount ?? 0), 0);
  const migratedMonthly = mergedMigrated.reduce((s, d) => s + (d.monthlyInterest ?? 0), 0);
  const migratedEntries = mergedMigrated.reduce((s, d) => s + (d.entryCount ?? 0), 0);

  const totalInvested = runningInvested + migratedInvested;
  const totalMonthly = runningMonthly + migratedMonthly;
  const totalEntries = runningEntries + migratedEntries;

  const runningRois = participations.map(p => Number(p.rateOfInterest ?? 0)).filter(v => Number.isFinite(v));
  const migratedRois = mergedMigrated.map(d => Number(d.roi ?? 0)).filter(v => Number.isFinite(v));
  const roiValues = [...runningRois, ...migratedRois];
  const avgRoi = roiValues.length
    ? (roiValues.reduce((s, v) => s + v, 0) / roiValues.length).toFixed(1)
    : 0;

  const STATS = [
    { label: "Active Deals",     value: String(combinedItems.length), color: INDIGO, Icon: PulseIcon,   badge: combinedItems.length > 0 ? "Live" : null },
    { label: "Total Invested",   value: fmtINR(totalInvested),         color: PURPLE, Icon: WalletIcon,  badge: `${totalEntries} entries` },
    { label: "Monthly Interest", value: fmtINR(totalMonthly),          color: GREEN,  Icon: TrendUpIcon, badge: "per month" },
    { label: "Avg ROI",          value: `${avgRoi}%`,                  color: AMBER,  Icon: TrendUpIcon, badge: null },
  ];

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes heroPulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
        @keyframes heroShimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes liveDot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
          50%       { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
        }
        .mp-shimmer-card {
          background: linear-gradient(90deg, var(--shimmer-from) 0%, var(--shimmer-mid) 40%, var(--shimmer-from) 80%);
          background-size: 200% 100%;
          animation: shimmer 1.8s linear infinite;
          border-radius: 1rem;
          border: 1px solid var(--border);
        }
        .mp-kpi-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .mp-kpi-card:hover {
          transform: translateY(-3px);
        }
        .mp-live-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: ${GREEN};
          animation: liveDot 2s infinite;
          display: inline-block;
          flex-shrink: 0;
        }
        .mp-hero-shimmer {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%);
          animation: heroShimmer 3s linear infinite;
          pointer-events: none;
        }
      `}</style>

      <div className="grid gap-5">

        {/*  Hero Banner  */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #6d28d9 50%, #7c3aed 100%)",
            boxShadow: "0 8px 40px rgba(79,70,229,0.35)",
            minHeight: "120px",
          }}
        >
          <div className="mp-hero-shimmer" />
          <div
            style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse at 80% 50%, rgba(124,58,237,0.4) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />
          <div className="relative flex items-center justify-between px-6 py-5 gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)", color: "#fff" }}
              >
                <LayersIcon />
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h1 className="text-2xl font-black text-white" style={{ letterSpacing: "-0.03em" }}>SD Deals</h1>
                  <span className="mp-live-dot" />
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}
                  >
                    LIVE
                  </span>
                </div>
                <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {/* {data?.userName ? `${data.userName}` : "Portfolio"}
                  {data?.mobileNumber ? `  ${data.mobileNumber}` : ""} */}
                  Track your SD Deals performance
                </p>
              </div>
            </div>

            <button
              onClick={load}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
              }}
            >
              <RefreshIcon /> Refresh
            </button>
          </div>
        </div>

        {/*  KPI Strip  */}
        {!loading && !error && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--surface-card)", border: "1px solid var(--border)", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4">
              {STATS.map((s, idx) => (
                <div
                  key={s.label}
                  className="mp-kpi-card relative flex flex-col gap-3 px-5 py-5"
                  style={{
                    borderRight: idx < 3 ? "1px solid var(--border)" : "none",
                    borderBottom: "3px solid transparent",
                    borderTop: `3px solid ${s.color}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${s.color}12`,
                        border: `1px solid ${s.color}25`,
                        color: s.color,
                        boxShadow: `0 0 20px ${s.color}20`,
                      }}
                    >
                      <s.Icon />
                    </div>
                    {s.badge && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${s.color}12`, color: s.color, border: `1px solid ${s.color}20` }}
                      >
                        {s.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <p
                      className="text-2xl font-black leading-none"
                      style={{ color: s.color, fontFamily: "'JetBrains Mono',monospace" }}
                    >
                      {s.value}
                    </p>
                    <p className="text-xs font-semibold mt-1.5" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {totalMonthly > 0 && (
              <div
                className="px-5 py-3 flex items-center gap-3"
                style={{ borderTop: "1px solid var(--border)", background: `${GREEN}05` }}
              >
                <span style={{ color: GREEN, display: "flex" }}><TrendUpIcon /></span>
                <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  Total monthly interest across all deals
                </span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: "100%", background: `linear-gradient(90deg,${INDIGO},${GREEN})`, transition: "width 1s ease" }}
                  />
                </div>
                <span className="text-sm font-black flex-shrink-0" style={{ color: GREEN }}>
                  {fmtINR(totalMonthly)}/mo
                </span>
              </div>
            )}
          </div>
        )}

        {/*  Loading Skeleton  */}
        {loading && (
          <div className="grid gap-4">
            <div className="mp-shimmer-card" style={{ height: "88px" }} />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="mp-shimmer-card" style={{ height: "72px" }} />
            ))}
          </div>
        )}

        {/*  Error State  */}
        {!loading && error && (
          <div
            className="flex flex-col items-center gap-4 py-16 rounded-2xl text-center"
            style={{ background: "var(--surface-card)", border: `1px solid ${RED}20` }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: `${RED}10`, border: `1px solid ${RED}25` }}
            >
              
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: RED }}>{error}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Something went wrong loading your deals</p>
            </div>
            <button
              onClick={load}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
              style={{ background: `${INDIGO}12`, color: INDIGO, border: `1px solid ${INDIGO}25` }}
            >
              <RefreshIcon /> Retry
            </button>
          </div>
        )}

        {/* Source Filter */}
        {!loading && (
          <div className="rounded-2xl p-3" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { key: "all", label: `All (${combinedItems.length})`, color: INDIGO },
                { key: "running", label: `Running (${runningItems.length})`, color: GREEN },
                { key: "migrated", label: `Migrated (${migratedItems.length})`, color: AMBER },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setSourceFilter(f.key)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={sourceFilter === f.key
                    ? { background: `${f.color}15`, color: f.color, border: `1px solid ${f.color}30` }
                    : { background: "var(--input-bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && migratedError && (
          <div className="rounded-2xl px-4 py-3 text-sm font-semibold" style={{ background: `${AMBER}08`, color: AMBER, border: `1px solid ${AMBER}25` }}>
            Migrated data could not be loaded: {migratedError}
          </div>
        )}

        {/* Combined Empty State */}
        {!loading && filteredItems.length === 0 && (
          <div
            className="flex flex-col items-center gap-5 py-20 rounded-2xl text-center"
            style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: `${INDIGO}08`, color: PURPLE, border: `1px solid ${INDIGO}20`, boxShadow: `0 0 40px ${INDIGO}15` }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                <polyline points="2 17 12 22 22 17"/>
                <polyline points="2 12 12 17 22 12"/>
              </svg>
            </div>
            <div>
              <p className="text-lg font-black" style={{ color: "var(--text-primary)" }}>
                {combinedItems.length === 0 ? "No participations found" : "No deals in selected filter"}
              </p>
              <p className="text-sm mt-1.5 max-w-xs mx-auto" style={{ color: "var(--text-muted)" }}>
                {combinedItems.length === 0 ? "Your running and migrated participations will appear here." : "Try switching filter to view the other data source."}
              </p>
            </div>
          </div>
        )}

        {/* Combined Deal Cards */}
        {!loading && filteredItems.length > 0 && (
          <div className="grid gap-4">
            {filteredItems.map((item, i) => (
              item.source === "running"
                ? <DealRow key={item.key} p={item.payload} index={i} navigate={navigate} onViewInterest={setInterestDeal} />
                : <MigratedDealRow key={item.key} d={item.payload} index={i} />
            ))}
          </div>
        )}
      </div>
      {interestDeal && <InterestStatementModal deal={interestDeal} onClose={() => setInterestDeal(null)} />}
    </>
  );
}
