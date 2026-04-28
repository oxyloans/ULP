import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRunningDeals } from "../api/afterlogin-user";

const RefreshIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const TrendUpIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const PulseIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const WalletIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="18" cy="12" r="2"/></svg>;
const PlusIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const ChevronIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="6 9 12 15 18 9"/></svg>;
const CalIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

function fmtINR(n) {
  const v = n ?? 0;
  if (v >= 10000000) return `${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000)   return `${(v / 100000).toFixed(2)}L`;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
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
  if (m === 0) return 0; // end of deal  no monthly
  return Math.round(amount * (roi / 100) / (12 / m) / (12 / m));
}

function payoutInterest(amount, roi, type) {
  if (!amount || !roi) return 0;
  const m = PAYOUT[type]?.months ?? 1;
  if (m === 0) return Math.round(amount * roi / 100); // full deal interest
  return Math.round(amount * (roi / 100) * (m / 12));
}

//  Deal Row 
function DealRow({ p, index, navigate }) {
  const [expanded, setExpanded] = useState(false);
  const updates = p.updatedParticipation ?? [];

  // Build flat list: initial + all updates
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
    <div className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{ background: "var(--surface-card)", border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor = "var(--border)"; }}>

      {/*  Header row  */}
      <div className="flex">
        <div className="w-1 flex-shrink-0" style={{ background: "linear-gradient(180deg,#6366f1,#10b981)" }} />
        <div className="flex-1 px-5 py-4">
          <div className="flex items-center gap-4 flex-wrap">

            {/* Index + name */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black"
                style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)" }}>
                {index + 1}
              </div>
              <div className="min-w-0">
                <p className="text-base font-extrabold truncate" style={{ color: "var(--text-primary)", fontFamily: "'JetBrains Mono',monospace" }}>
                  {p.dealName}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    <CalIcon /> Since {p.participatedDate}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>
                     Active
                  </span>
                  {p.amountTye && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: "rgba(129,140,248,0.1)", color: "#818cf8", border: "1px solid rgba(129,140,248,0.2)" }}>
                      {PAYOUT[p.amountTye]?.label ?? p.amountTye}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Summary pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: "Total Invested",  value: fmtINR(totalInvested), color: "#6366f1" },
                { label: "Monthly Interest",value: fmtINR(totalMonthly),  color: "#10b981" },
                { label: "ROI",             value: `${p.rateOfInterest ?? 0}%`, color: "#f59e0b" },
                { label: "Entries",         value: String(allEntries.length), color: "#818cf8" },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center px-3 py-2 rounded-xl min-w-[72px]"
                  style={{ background: `${s.color}0a`, border: `1px solid ${s.color}18` }}>
                  <span className="text-sm font-extrabold leading-none" style={{ color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</span>
                  <span className="text-xs mt-1 font-semibold" style={{ color: "var(--text-muted)" }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {canMore && (
                <button onClick={() => navigate(`/sd-lot/participate/${p.dealId}`)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#6366f1,#4338ca)", color: "#fff", boxShadow: "0 3px 12px rgba(99,102,241,0.4)" }}>
                  <PlusIcon /> Add More
                </button>
              )}
              <button onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background: expanded ? "rgba(99,102,241,0.1)" : "var(--input-bg)", color: "#6366f1", border: `1px solid ${expanded ? "rgba(99,102,241,0.3)" : "var(--border)"}` }}>
                Details
                <span style={{ transform: expanded ? "rotate(180deg)" : "", transition: "transform 0.2s", display: "inline-flex" }}>
                  <ChevronIcon />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*  Expanded: full investment table  */}
      {expanded && (
        <div style={{ borderTop: "1px solid var(--border)", background: "var(--input-bg)" }}>

          {/* Capacity bar */}
          {maxParticipation > 0 && (
            <div className="px-5 pt-4">
              <div className="rounded-xl px-4 py-3" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Capacity Used</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{fmtINR(totalInvested)} / {fmtINR(maxParticipation)}</span>
                    {canMore
                      ? <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)" }}>{fmtINR(remaining)} available</span>
                      : <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>Max reached</span>
                    }
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((totalInvested / maxParticipation) * 100, 100)}%`, background: canMore ? "linear-gradient(90deg,#6366f1,#818cf8)" : "linear-gradient(90deg,#10b981,#34d399)" }} />
                </div>
              </div>
            </div>
          )}

          {/* Investment table */}
          <div className="p-5">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#6366f1" }}>
              Investment History  {allEntries.length} {allEntries.length === 1 ? "entry" : "entries"}
            </p>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--table-header-bg)", borderBottom: "1px solid var(--border)" }}>
                    {["#", "Type", "Date", "Amount", "ROI %", "Payout", "Per Payout", "Monthly Equiv."].map(h => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allEntries.map((e, i) => {
                    const perPayout = payoutInterest(e.amount, e.roi, e.payout);
                    const monthly   = monthlyEquiv(e.amount, e.roi, e.payout);
                    const isInitial = e.type === "initial";
                    return (
                      <tr key={i} style={{ borderBottom: i < allEntries.length - 1 ? "1px solid var(--border)" : "none" }}
                        onMouseEnter={ev => ev.currentTarget.style.background = "var(--row-hover)"}
                        onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}>
                        <td className="py-3 px-3 font-bold text-xs" style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                        <td className="py-3 px-3">
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={isInitial
                              ? { background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.25)" }
                              : { background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>
                            {e.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{e.date}</td>
                        <td className="py-3 px-3 font-extrabold tabular-nums" style={{ color: isInitial ? "#6366f1" : "#10b981", fontFamily: "'JetBrains Mono',monospace" }}>
                          {fmtINR(e.amount)}
                        </td>
                        <td className="py-3 px-3 font-bold" style={{ color: "#f59e0b" }}>{e.roi}%</td>
                        <td className="py-3 px-3">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: "rgba(129,140,248,0.1)", color: "#818cf8", border: "1px solid rgba(129,140,248,0.2)" }}>
                            {PAYOUT[e.payout]?.label ?? e.payout ?? ""}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold tabular-nums" style={{ color: "#f59e0b", fontFamily: "'JetBrains Mono',monospace" }}>
                          {perPayout > 0 ? fmtINR(perPayout) : ""}
                        </td>
                        <td className="py-3 px-3 font-bold tabular-nums" style={{ color: "#10b981", fontFamily: "'JetBrains Mono',monospace" }}>
                          {monthly > 0 ? fmtINR(monthly) : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Totals footer */}
                <tfoot>
                  <tr style={{ borderTop: "2px solid var(--border)", background: "rgba(99,102,241,0.04)" }}>
                    <td colSpan={3} className="py-3 px-3 text-xs font-black uppercase tracking-wider" style={{ color: "#6366f1" }}>Total</td>
                    <td className="py-3 px-3 font-black tabular-nums" style={{ color: "#6366f1", fontFamily: "'JetBrains Mono',monospace" }}>{fmtINR(totalInvested)}</td>
                    <td className="py-3 px-3" />
                    <td className="py-3 px-3" />
                    <td className="py-3 px-3 font-black tabular-nums" style={{ color: "#f59e0b", fontFamily: "'JetBrains Mono',monospace" }}>
                      {fmtINR(allEntries.reduce((s, e) => s + payoutInterest(e.amount, e.roi, e.payout), 0))}
                    </td>
                    <td className="py-3 px-3 font-black tabular-nums" style={{ color: "#10b981", fontFamily: "'JetBrains Mono',monospace" }}>
                      {fmtINR(totalMonthly)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Add more button */}
            {canMore && (
              <div className="flex justify-end mt-3">
                <button onClick={() => navigate(`/sd-lot/participate/${p.dealId}`)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#6366f1,#4338ca)", color: "#fff", boxShadow: "0 3px 12px rgba(99,102,241,0.35)" }}>
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

//  Main 
export default function MyParticipations() {
  const navigate  = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const load = () => {
    setLoading(true); setError("");
    getRunningDeals()
      .then(d => { if (d) setData(d); })
      .catch(e => setError(e.message ?? "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const participations = data?.participationInfo ?? [];

  // Aggregate across all entries (initial + updates)
  const totalInvested = participations.reduce((s, p) => {
    const upds = (p.updatedParticipation ?? []).reduce((ss, u) => ss + (u.updationParticipation ?? 0), 0);
    return s + (p.participatedAmount ?? 0) + upds;
  }, 0);

  const totalMonthly = participations.reduce((s, p) => {
    const entries = [
      { amount: p.participatedAmount ?? 0, roi: p.rateOfInterest ?? 0, payout: p.amountTye },
      ...(p.updatedParticipation ?? []).map(u => ({ amount: u.updationParticipation ?? 0, roi: u.rateOfInterest ?? p.rateOfInterest ?? 0, payout: u.amountTye ?? p.amountTye })),
    ];
    return s + entries.reduce((ss, e) => ss + monthlyEquiv(e.amount, e.roi, e.payout), 0);
  }, 0);

  const totalEntries = participations.reduce((s, p) => s + 1 + (p.updatedParticipation?.length ?? 0), 0);
  const avgRoi = participations.length
    ? (participations.reduce((s, p) => s + (p.rateOfInterest ?? 0), 0) / participations.length).toFixed(1)
    : 0;

  const STATS = [
    { label: "Active Deals",     value: String(participations.length), color: "#6366f1", Icon: PulseIcon,   badge: participations.length > 0 ? "Live" : null },
    { label: "Total Invested",   value: fmtINR(totalInvested),         color: "#818cf8", Icon: WalletIcon,  badge: `${totalEntries} entries` },
    { label: "Monthly Interest", value: fmtINR(totalMonthly),          color: "#10b981", Icon: TrendUpIcon, badge: "per month" },
    { label: "Avg ROI",          value: `${avgRoi}%`,                  color: "#f59e0b", Icon: TrendUpIcon, badge: null },
  ];

  return (
    <div className="grid gap-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>My Participations</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {data?.userName ? `${data.userName}  ` : ""}{data?.mobileNumber ?? ""}
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{ background: "var(--input-bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
          <RefreshIcon /> Refresh
        </button>
      </div>

      {/* Stat strip */}
      {!loading && !error && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div className="grid grid-cols-2 sm:grid-cols-4" style={{ borderBottom: "1px solid var(--border)" }}>
            {STATS.map(s => (
              <div key={s.label} className="flex items-center gap-3 px-5 py-4" style={{ borderRight: "1px solid var(--border)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${s.color}12`, border: `1px solid ${s.color}20`, color: s.color }}>
                  <s.Icon />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-lg font-black leading-none" style={{ color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</p>
                    {s.badge && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: `${s.color}12`, color: s.color, border: `1px solid ${s.color}20` }}>
                        {s.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Monthly interest highlight bar */}
          {totalMonthly > 0 && (
            <div className="px-5 py-3 flex items-center gap-3" style={{ background: "rgba(16,185,129,0.03)" }}>
              <TrendUpIcon />
              <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Total monthly interest across all deals</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div className="h-full rounded-full" style={{ width: "100%", background: "linear-gradient(90deg,#6366f1,#10b981)", transition: "width 1s ease" }} />
              </div>
              <span className="text-sm font-black flex-shrink-0" style={{ color: "#10b981" }}>{fmtINR(totalMonthly)}/mo</span>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid gap-3">
          <div className="h-20 rounded-2xl shimmer-bg" />
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-2xl shimmer-bg" />)}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-4 py-16 rounded-2xl text-center"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-bold" style={{ color: "#ef4444" }}>{error}</p>
          <button onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
            style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.25)" }}>
            <RefreshIcon /> Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && participations.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 rounded-2xl text-center"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.08)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
            <PulseIcon />
          </div>
          <div>
            <p className="text-base font-black" style={{ color: "var(--text-primary)" }}>No active participations</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Participate in an SD Lot deal to see your portfolio here</p>
          </div>
        </div>
      )}

      {/* Deal rows */}
      {!loading && !error && participations.length > 0 && (
        <div className="grid gap-3">
          {participations.map((p, i) => (
            <DealRow key={p.dealId ?? i} p={p} index={i} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
}
