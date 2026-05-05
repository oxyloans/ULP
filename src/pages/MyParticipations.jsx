import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRunningDeals } from "../api/afterlogin-user";

const INDIGO = '#6366f1';
const PURPLE = '#818cf8';
const GREEN  = '#10b981';
const AMBER  = '#f59e0b';
const RED    = '#ef4444';

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
  if (m === 0) return 0;
  return Math.round(amount * (roi / 100) / m);
}

function payoutInterest(amount, roi, type) {
  if (!amount || !roi) return 0;
  const m = PAYOUT[type]?.months ?? 1;
  if (m === 0) return Math.round(amount * roi / 100);
  return Math.round(amount * (roi / 100));
}

function DealRow({ p, index, navigate }) {
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
        <div className="flex-1 px-5 py-4">
          <div className="flex items-center gap-4 flex-wrap">

            <div className="flex items-center gap-3 flex-1 min-w-0">
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
                <div className="flex items-center gap-2 mt-1 flex-wrap">
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

            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: "Total Invested",   value: fmtINR(totalInvested), color: INDIGO },
                { label: "Monthly Interest", value: fmtINR(totalMonthly),  color: GREEN  },
                { label: "ROI",              value: `${p.rateOfInterest ?? 0}%`, color: AMBER },
                { label: "Entries",          value: String(allEntries.length), color: PURPLE },
              ].map(s => (
                <div
                  key={s.label}
                  className="flex flex-col items-center px-4 py-2.5 rounded-xl min-w-[80px] transition-all duration-200"
                  style={{ background: `${s.color}08`, border: `1px solid ${s.color}15` }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${s.color}14`; e.currentTarget.style.transform = "scale(1.05)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${s.color}08`; e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <span
                    className="text-base font-black leading-none"
                    style={{ color: s.color, fontFamily: "'JetBrains Mono',monospace" }}
                  >
                    {s.value}
                  </span>
                  <span className="text-xs mt-1.5 font-semibold" style={{ color: "var(--text-muted)" }}>{s.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {canMore && (
                <button
                  onClick={() => navigate(`/sd-lot/participate/${p.dealId}`)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ background: `linear-gradient(135deg,${INDIGO},#4338ca)`, color: "#fff", boxShadow: `0 4px 16px ${INDIGO}50` }}
                >
                  <PlusIcon /> Add More
                </button>
              )}
              <button
                onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
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
                  <tr style={{ borderTop: `2px solid var(--border)`, background: `${INDIGO}05` }}>
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
    { label: "Active Deals",     value: String(participations.length), color: INDIGO, Icon: PulseIcon,   badge: participations.length > 0 ? "Live" : null },
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

        {/*  Empty State  */}
        {!loading && !error && participations.length === 0 && (
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
              <p className="text-lg font-black" style={{ color: "var(--text-primary)" }}>No active SD deals</p>
              <p className="text-sm mt-1.5 max-w-xs mx-auto" style={{ color: "var(--text-muted)" }}>
                Participate in an SD Lot deal to see your portfolio here
              </p>
            </div>
          </div>
        )}

        {/*  Deal Cards  */}
        {!loading && !error && participations.length > 0 && (
          <div className="grid gap-4">
            {participations.map((p, i) => (
              <DealRow key={p.dealId ?? i} p={p} index={i} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
