import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createOrUpdateDeal, getAdminBankDetails, getAdminDeals, uploadFractionalAssetFile, getAllLoadAssetDetails } from "../../api/afterlogin-admin";
import { formatINR } from "../../utils/currency";

// ─── Enums ────────────────────────────────────────────────────────────────────
const DEAL_TYPES       = ["NORMAL", "TEST"];
const DEAL_SUB_TYPES   = ["STUDENT"];
const DEAL_TABS = [
  { key: "ASSET",    label: "Asset - Fractional Lending" },
  { key: "SDLOT",   label: "SD Lot" },
  { key: "GOLD",    label: "Gold Lot" },
  { key: "BORROWER",label: "Borrower Deal" },
];

// ─── Deal type cards shown on landing screen ──────────────────────────────────
const DEAL_TYPE_CARDS = [
  {
    key: "ASSET",
    label: "Asset — Fractional Lending",
    description: "Create a fractional lending deal backed by a physical asset. Includes legal/valuation reports, geo coordinates and media uploads.",
    color: "#818cf8",
    bg: "rgba(129,140,248,0.08)",
    border: "rgba(129,140,248,0.25)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18"/><path d="M9 21V9"/>
      </svg>
    ),
  },
  {
    key: "SDLOT",
    label: "SD Lot",
    description: "Standard SD Lot deal. Set financial details, interest rates, key dates and bank transfer info.",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.25)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
  },
  {
    key: "GOLD",
    label: "Gold Lot",
    description: "Gold-backed lot deal. Same structure as SD Lot with globalDealType set to GOLD.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>
      </svg>
    ),
  },
  {
    key: "BORROWER",
    label: "Borrower Deal",
    description: "Create a deal linked to an existing borrower. Select from the borrower list — project info auto-fills. Uses the same financial, date and bank fields as an asset deal.",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.25)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];
const ASSET_AREA_TYPES = ["PLOT", "FLAT", "ACRE"];
const ASSET_SUB_TYPES  = ["FRACTIONAL_LENDING", "STUDENT"];

// ─── Icons ────────────────────────────────────────────────────────────────────
const ArrowLeft   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const CheckCircle = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const PlusIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrendUp     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const UsersIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const CloseIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const SearchIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const ChevronDown = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="6 9 12 15 18 9"/></svg>;
const TagIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const SparkleIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>;
const ShieldIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const ZapIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

// ─── Deal name generator ──────────────────────────────────────────────────────
function generateDealName({ globalDealType, dealAmount, monthlyInterest, duration, borrowerName }) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const now = new Date();
  const mon = months[now.getMonth()];
  const yr  = String(now.getFullYear()).slice(-2);

  // Amount in Lakhs/Crores shorthand
  const amt = parseInt(String(dealAmount ?? "").replace(/,/g, ""), 10) || 0;
  let amtStr = "";
  if (amt >= 10000000)      amtStr = (amt / 10000000).toFixed(amt % 10000000 === 0 ? 0 : 1) + "Cr";
  else if (amt >= 100000)   amtStr = (amt / 100000).toFixed(amt % 100000 === 0 ? 0 : 1) + "L";
  else if (amt > 0)         amtStr = (amt / 1000).toFixed(0) + "K";

  const roi = parseFloat(monthlyInterest) || 0;
  const dur = parseInt(duration, 10) || 0;

  const prefix = {
    ASSET:    "ASSET",
    SDLOT:    "SD",
    GOLD:     "GOLD",
    BORROWER: borrowerName ? borrowerName.split(" ")[0].toUpperCase().slice(0,6) : "BRW",
  }[globalDealType] ?? "DEAL";

  const parts = [prefix];
  if (amtStr) parts.push(amtStr);
  if (roi)    parts.push(roi + "ROI");
  if (dur)    parts.push(dur + "M");
  parts.push(mon + yr);

  return parts.join("-");
}

// ─── Deal Health Score gauge ──────────────────────────────────────────────────
function calcHealthScore({ dealName, dealAmount, monthlyInterest, duration,
  minimumParticipation, maxParticipation, fundsAcceptanceStartDate, emiEndDate,
  borrowerId, globalDealType }) {
  let score = 0;
  const tips = [];

  if (dealName?.trim().length >= 6)         score += 15; else tips.push("Add a descriptive deal name");
  if (parseInt(String(dealAmount ?? "").replace(/,/g, ""), 10) >= 100000) score += 15;
  else tips.push("Deal amount should be ≥ ₹1L");

  const roi = parseFloat(monthlyInterest) || 0;
  if (roi >= 0.5 && roi <= 5) { score += 20; }
  else if (roi > 0)           { score += 10; tips.push("Typical ROI is 0.5%–5% monthly"); }
  else                        { tips.push("Set a monthly ROI"); }

  if (parseInt(duration, 10) >= 1)  score += 10; else tips.push("Set deal duration");

  const min = parseInt(String(minimumParticipation ?? "").replace(/,/g, ""), 10) || 0;
  const max = parseInt(String(maxParticipation ?? "").replace(/,/g, ""), 10) || 0;
  if (min > 0 && max > min) score += 15; else tips.push("Set valid min / max participation");

  if (fundsAcceptanceStartDate) score += 10; else tips.push("Add funds acceptance start date");
  if (emiEndDate)               score += 10; else tips.push("Add EMI end date");

  if (globalDealType === "BORROWER" && borrowerId) score += 5;

  return { score: Math.min(score, 100), tips };
}

function DealHealthGauge({ score, tips }) {
  // SVG arc gauge
  const r = 36, cx = 44, cy = 44;
  const circ = 2 * Math.PI * r;
  const arc  = circ * 0.75; // 270° sweep
  const fill = arc * (score / 100);
  const color = score >= 75 ? "#10b981" : score >= 45 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Healthy" : score >= 45 ? "Fair" : "Incomplete";

  return (
    <div className="rounded-2xl p-5 grid gap-4"
      style={{ background: "var(--surface-card)", border: `1px solid ${color}30` }}>
      <div className="flex items-center gap-2">
        <span style={{ color }}><ShieldIcon /></span>
        <p className="text-xs font-black uppercase tracking-widest" style={{ color }}>Deal Health Score</p>
      </div>

      <div className="flex items-center gap-5">
        {/* Gauge ring */}
        <div className="relative flex-shrink-0" style={{ width: 88, height: 88 }}>
          <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: "rotate(135deg)" }}>
            {/* Track */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="7"
              strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round" />
            {/* Fill — animated */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="7"
              strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.7s cubic-bezier(0.34,1.56,0.64,1), stroke 0.4s" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black leading-none" style={{ color }}>{score}</span>
            <span className="text-[9px] font-bold uppercase tracking-wide mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</span>
          </div>
        </div>

        {/* Tips */}
        <div className="flex-1 min-w-0">
          {tips.length === 0 ? (
            <div className="flex items-center gap-2">
              <span style={{ color: "#10b981" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
              <p className="text-xs font-semibold" style={{ color: "#10b981" }}>Deal looks great — ready to submit!</p>
            </div>
          ) : (
            <div className="grid gap-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>Suggestions</p>
              {tips.slice(0, 3).map((t, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0" style={{ color }}>
                    <ZapIcon />
                  </span>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: `linear-gradient(90deg,${color}88,${color})` }} />
      </div>
    </div>
  );
}

// ─── Pill selector (replaces <select> for small enum lists) ──────────────────
function PillSelect({ value, onChange, options, accent = "#818cf8" }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
            style={active ? {
              background: `linear-gradient(135deg,${accent},${accent}cc)`,
              color: "#fff",
              border: `1px solid ${accent}`,
              boxShadow: `0 2px 10px ${accent}40`,
            } : {
              background: "var(--input-bg)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Custom bank dropdown ─────────────────────────────────────────────────────
function BankSelect({ value, onChange, accounts, loading, error }) {
  const [open, setOpen] = useState(false);
  const selected = accounts.find(b => String(b.id ?? b.accountNumber) === value) ?? null;

  return (
    <div className="relative">
      {loading ? (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{ background: "var(--input-bg)", border: "1.5px solid var(--border)" }}>
          <svg className="w-4 h-4 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
          </svg>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>Loading bank accounts…</span>
        </div>
      ) : (
        <>
          {/* Trigger */}
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left transition-all"
            style={{
              background: "var(--input-bg)",
              border: `1.5px solid ${error ? "#ef4444" : open ? "#06b6d4" : "var(--border)"}`,
              boxShadow: open ? "0 0 0 3px rgba(6,182,212,0.12)" : "none",
            }}>
            {selected ? (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black"
                  style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.25)" }}>
                  {(selected.bankName ?? "B").charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                    {selected.companyName ?? selected.bankName}
                  </p>
                  <p className="text-xs font-mono truncate" style={{ color: "var(--text-muted)" }}>
                    {selected.bankName} · {selected.accountNumber}
                  </p>
                </div>
              </div>
            ) : (
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>— Select bank account —</span>
            )}
            <span className="flex-shrink-0 transition-transform duration-200"
              style={{ transform: open ? "rotate(180deg)" : "rotate(0)", color: "var(--text-muted)" }}>
              <ChevronDown />
            </span>
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute z-30 w-full mt-1.5 rounded-xl overflow-hidden"
              style={{ background: "var(--surface-card)", border: "1px solid var(--border)", boxShadow: "0 12px 40px rgba(0,0,0,0.2)" }}>
              {accounts.length === 0 ? (
                <p className="px-4 py-3 text-sm text-center" style={{ color: "var(--text-muted)" }}>No bank accounts found</p>
              ) : accounts.map(b => {
                const key    = String(b.id ?? b.accountNumber);
                const active = value === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { onChange(key, b); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                    style={{
                      background: active ? "rgba(6,182,212,0.08)" : "transparent",
                      borderBottom: "1px solid var(--border)",
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--row-hover)"; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black"
                      style={{
                        background: active ? "rgba(6,182,212,0.2)" : "var(--input-bg)",
                        color: active ? "#06b6d4" : "var(--text-muted)",
                        border: `1px solid ${active ? "rgba(6,182,212,0.3)" : "var(--border)"}`,
                      }}>
                      {(b.bankName ?? "B").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: active ? "#06b6d4" : "var(--text-primary)" }}>
                        {b.companyName ?? b.bankName}
                      </p>
                      <p className="text-xs font-mono truncate" style={{ color: "var(--text-muted)" }}>
                        {b.bankName} · {b.accountNumber} · {b.ifscCode}
                      </p>
                    </div>
                    {active && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}


function fmtINR(n) {
  if (!n) return "";
  const num = Number(String(n).replace(/,/g, ""));
  if (isNaN(num)) return "";
  return formatINR(num);
}
function numVal(s) { return parseInt(String(s || "").replace(/,/g, ""), 10) || 0; }
function toLocale(s) {
  const n = s.replace(/\D/g, "");
  return n ? parseInt(n, 10).toLocaleString("en-IN") : "";
}
// Convert YYYY-MM-DD → DD/MM/YYYY for display, keep YYYY-MM-DD for API
function toApiDate(d) { return d; } // already YYYY-MM-DD from <input type="date">

// Convert API date (DD/MM/YYYY or YYYY-MM-DD) → YYYY-MM-DD for <input type="date">
function fromApiDate(d) {
  if (!d) return "";
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  // DD/MM/YYYY → YYYY-MM-DD
  const parts = d.split("/");
  if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2,"0")}-${parts[0].padStart(2,"0")}`;
  return d;
}

const inp = (err) => ({
  background: "var(--input-bg)",
  border: "1.5px solid " + (err ? "#ef4444" : "var(--border)"),
  color: "var(--text-primary)",
  borderRadius: 10,
  padding: "11px 14px",
  fontSize: 13,
  width: "100%",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.15s, box-shadow 0.15s",
});

function Field({ label, required, error, hint, children }) {
  return (
    <div className="grid gap-1.5 min-w-0">
      <label className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
        {label}{required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs" style={{ color: "var(--text-muted)", opacity: 0.65 }}>{hint}</p>}
      {error && <p className="text-xs font-medium" style={{ color: "#ef4444" }}>{error}</p>}
    </div>
  );
}

function DealTabs({ active, onChange }) {
  return (
    <div className="grid gap-2 sm:grid-cols-4 rounded-2xl p-2"
      style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
      {DEAL_TABS.map((tab, index) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className="px-3 py-3 rounded-xl text-sm font-black text-left transition-all"
            style={isActive ? {
              background: "linear-gradient(135deg,#6366f1,#4338ca)",
              color: "#fff",
              boxShadow: "0 4px 18px rgba(99,102,241,0.35)",
            } : {
              background: "var(--input-bg)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}>
            <span className="text-xs opacity-75 mr-1">{index + 1}.</span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function FilePicker({ label, file, files = [], multiple, accept, required = true, error, onChange }) {
  const names = multiple
    ? files.map(f => f.name).join(", ")
    : file?.name;

  return (
    <Field label={label} required={required} error={error}>
      <label className="w-full rounded-xl px-4 py-3 flex items-center justify-between gap-3 cursor-pointer min-w-0"
        style={{
          background: "var(--input-bg)",
          border: `1.5px dashed ${error ? "#ef4444" : "var(--border)"}`,
        }}>
        <span className="text-sm font-semibold truncate min-w-0" style={{ color: names ? "var(--text-primary)" : "var(--text-muted)" }}>
          {names || "Choose file"}
        </span>
        <span className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: "rgba(99,102,241,0.14)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.25)" }}>
          Upload
        </span>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={e => onChange(multiple ? Array.from(e.target.files ?? []) : (e.target.files?.[0] ?? null))}
          className="hidden"
        />
      </label>
    </Field>
  );
}

const EMPTY_FORM = {
  dealName: "", dealType: "NORMAL", dealSubType: "STUDENT", globalDealType: "SDLOT",
  dealAmount: "", duration: "",
  minimumParticipation: "", maxParticipation: "",
  monthlyInterest: "", quartelyInterest: "", halfInterest: "", yearlyInterest: "",
  fundsAcceptanceStartDate: "", fundsAcceptanceEndDate: "",
  loanActiveDate: "", emiEndDate: "",
  transferFundsId: "",   // bank account id
  transferFunds:   "",   // bank name (auto from selection)
  transferTo:      "",   // company name (auto from selection)
};

const EMPTY_ASSET_FORM = {
  dealName: "", dealAmount: "", dealType: "NORMAL", dealSubType: "FRACTIONAL_LENDING",
  monthlyInterest: "", quartelyInterest: "", halfInterest: "", yearlyInterest: "",
  borrowerName: "", projectName: "",
  legalReport: null, valuationReport: null,
  assetValue: "", latitude: "", longitude: "",
  assetArea: "", assetAreaType: "PLOT",
  images: [], videos: [],
  duration: "",
  minimumParticipation: "",
  maxParticipation: "",
  fundsAcceptanceStartDate: "",
  fundsAcceptanceEndDate: "",
  loanActiveDate: "",
  emiEndDate: "",
  transferFundsId: "",
  transferFunds: "",
  transferTo: "",
};

// Borrower deal — same financial + asset fields as asset deal, but borrower is picked from getAllLoadAssetDetails
const EMPTY_BORROWER_FORM = {
  dealName: "", dealAmount: "", dealType: "NORMAL", dealSubType: "FRACTIONAL_LENDING",
  monthlyInterest: "", quartelyInterest: "", halfInterest: "", yearlyInterest: "",
  borrowerId: "",      // selected asset id from getAllLoadAssetDetails
  borrowerName: "",    // auto-filled
  projectName: "",     // auto-filled (editable)
  assetValue: "",
  latitude: "",
  longitude: "",
  assetArea: "",
  assetAreaType: "PLOT",
  legalReport: null,
  valuationReport: null,
  images: [],
  videos: [],
  duration: "",
  minimumParticipation: "",
  maxParticipation: "",
  fundsAcceptanceStartDate: "",
  fundsAcceptanceEndDate: "",
  loanActiveDate: "",
  emiEndDate: "",
  transferFundsId: "",
  transferFunds: "",
  transferTo: "",
};

export default function CreateDeal({ editDeal: editDealProp = null }) {
  const navigate   = useNavigate();
  const { id: editId } = useParams();

  const [editDeal,   setEditDeal]   = useState(editDealProp);
  const [dealLoading, setDealLoading] = useState(!!editId && !editDealProp);
  const isEdit     = !!(editDeal || editId);
  const [activeTab, setActiveTab] = useState("ASSET");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors]   = useState({});
  const [assetErrors, setAssetErrors] = useState({});
  const [IdsField,setIdsField] = useState();
  const [showIdsField, setShowIdsField] = useState(false)

  // ─── Deal-type landing selector ────────────────────────────────────────────
  // When not editing, show a type-selection screen first
  const [dealTypeSelected, setDealTypeSelected] = useState(!!editId || !!editDealProp);


  // Bank accounts from API
  const [bankAccounts, setBankAccounts] = useState([]);
  const [banksLoading, setBanksLoading] = useState(true);

  useEffect(() => {
    getAdminBankDetails()
      .then(data => {
        const list = Array.isArray(data) ? data : (data ? [data] : []);
        setBankAccounts(list);
      })
      .catch(() => {})
      .finally(() => setBanksLoading(false));
  }, []);

  // ─── Borrower list for Borrower Deal tab ───────────────────────────────────
  const [borrowerList, setBorrowerList] = useState([]);
  const [borrowersLoading, setBorrowersLoading] = useState(false);
  const [borrowerSearch, setBorrowerSearch] = useState("");
  const [borrowerDropOpen, setBorrowerDropOpen] = useState(false);
  const [borrowerForm, setBorrowerForm] = useState(EMPTY_BORROWER_FORM);
  const [borrowerErrors, setBorrowerErrors] = useState({});

  const setBorrower = (k, v) => {
    setBorrowerForm(f => ({ ...f, [k]: v }));
    setBorrowerErrors(e => ({ ...e, [k]: "" }));
  };

  const selectedBorrowerBank = bankAccounts.find(b => String(b.id ?? b.accountNumber) === borrowerForm.transferFundsId) ?? null;

  // Fetch assets when BORROWER tab is active
  useEffect(() => {
    if (activeTab !== "BORROWER") return;
    setBorrowersLoading(true);
    getAllLoadAssetDetails()
      .then(data => setBorrowerList(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setBorrowersLoading(false));
  }, [activeTab]);

  const filteredBorrowers = borrowerList.filter(b => {
    const q = borrowerSearch.toLowerCase();
    return (
      (b.borrowerName ?? "").toLowerCase().includes(q) ||
      (b.projectName  ?? "").toLowerCase().includes(q) ||
      (b.ownerName    ?? "").toLowerCase().includes(q) ||
      (b.flatNumber   ?? "").toLowerCase().includes(q)
    );
  });

  // When editing via URL param, fetch the deal data
  useEffect(() => {
    if (!editId || editDealProp) return;
    setDealLoading(true);
    getAdminDeals()
      .then(list => {
        if (Array.isArray(list)) {
          const found = list.find(d => String(d.id) === String(editId));
          if (found) setEditDeal(found);
        }
      })
      .catch(() => {})
      .finally(() => setDealLoading(false));
  }, [editId, editDealProp]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [assetForm, setAssetForm] = useState(EMPTY_ASSET_FORM);

  // ─── Validate + submit borrower deal ──────────────────────────────────────
  const validateBorrower = () => {
    const e = {};
    if (!borrowerForm.dealName.trim())        e.dealName            = "Deal name is required";
    if (!borrowerForm.borrowerId)             e.borrowerId          = "Please select an asset";
    if (!borrowerForm.dealAmount)             e.dealAmount          = "Deal amount is required";
    if (!borrowerForm.duration)               e.duration            = "Duration is required";
    if (!borrowerForm.minimumParticipation)   e.minimumParticipation = "Minimum participation is required";
    if (!borrowerForm.maxParticipation)       e.maxParticipation    = "Maximum participation is required";
    if (!borrowerForm.fundsAcceptanceStartDate) e.fundsAcceptanceStartDate = "Start date is required";
    if (!borrowerForm.fundsAcceptanceEndDate)   e.fundsAcceptanceEndDate   = "End date is required";
    if (!borrowerForm.loanActiveDate)         e.loanActiveDate      = "Loan active date is required";
    if (!borrowerForm.emiEndDate)             e.emiEndDate          = "EMI end date is required";
    if (!borrowerForm.assetValue)             e.assetValue          = "Asset value is required";
    if (!borrowerForm.latitude)               e.latitude            = "Latitude is required";
    if (!borrowerForm.longitude)              e.longitude           = "Longitude is required";
    if (!borrowerForm.assetArea.trim())       e.assetArea           = "Asset area is required";
    if (borrowerForm.images.length > 3)       e.images              = "Upload up to 3 images";
    if (borrowerForm.videos.length > 3)       e.videos              = "Upload up to 3 videos";
    const min = numVal(borrowerForm.minimumParticipation), max = numVal(borrowerForm.maxParticipation);
    if (min && max && min >= max) e.maxParticipation = "Max must be greater than min";
    return e;
  };

  const handleBorrowerSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validateBorrower();
    if (Object.keys(errs).length) { setBorrowerErrors(errs); return; }

    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        dealName:                 borrowerForm.dealName.trim(),
        dealAmount:               numVal(borrowerForm.dealAmount),
        dealType:                 borrowerForm.dealType,
        dealSubType:              borrowerForm.dealSubType,
        globalDealType:           "ASSET",
        monthlyInterest:          parseFloat(borrowerForm.monthlyInterest) || 0,
        quartelyInterest:         parseFloat(borrowerForm.quartelyInterest) || 0,
        halfInterest:             parseFloat(borrowerForm.halfInterest) || 0,
        yearlyInterest:           parseFloat(borrowerForm.yearlyInterest) || 0,
        duration:                 parseInt(borrowerForm.duration, 10),
        minimumParticipation:     numVal(borrowerForm.minimumParticipation),
        maxParticipation:         numVal(borrowerForm.maxParticipation),
        fundsAcceptanceStartDate: toApiDate(borrowerForm.fundsAcceptanceStartDate),
        fundsAcceptanceEndDate:   toApiDate(borrowerForm.fundsAcceptanceEndDate),
        loanActiveDate:           toApiDate(borrowerForm.loanActiveDate),
        emiEndDate:               toApiDate(borrowerForm.emiEndDate),
        transferFundsId:          borrowerForm.transferFundsId,
        transferFunds:            borrowerForm.transferFunds,
        transferTo:               borrowerForm.transferTo,
        fractionalInvestmentDto: {
          assetValue:          numVal(borrowerForm.assetValue),
          borrowerName:        borrowerForm.borrowerName.trim(),
          projectName:         borrowerForm.projectName.trim(),
          fractionalAssetType: borrowerForm.assetAreaType,
          latitude:            parseFloat(borrowerForm.latitude) || 0,
          longitude:           parseFloat(borrowerForm.longitude) || 0,
          area:                borrowerForm.assetArea,
          id:                  null,
        },
      };

      // 1. Create deal
      const createdDeal = await createOrUpdateDeal(payload);

      // 2. Get asset ID for file uploads
      const assetId = createdDeal?.fractionalInvestmentDto?.id || createdDeal?.id;
      if (assetId) {
        const uploadPromises = [];
        if (borrowerForm.legalReport) {
          uploadPromises.push(uploadFractionalAssetFile({ file: borrowerForm.legalReport, assetId, fileType: "legalreport" }));
        }
        if (borrowerForm.valuationReport) {
          uploadPromises.push(uploadFractionalAssetFile({ file: borrowerForm.valuationReport, assetId, fileType: "valuationreport" }));
        }
        if (Array.isArray(borrowerForm.images)) {
          borrowerForm.images.forEach(file => {
            uploadPromises.push(uploadFractionalAssetFile({ file, assetId, fileType: "fractionalimage" }));
          });
        }
        if (Array.isArray(borrowerForm.videos)) {
          borrowerForm.videos.forEach(file => {
            uploadPromises.push(uploadFractionalAssetFile({ file, assetId, fileType: "fractionalvideo" }));
          });
        }
        if (uploadPromises.length > 0) await Promise.all(uploadPromises);
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message ?? "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Populate form when editDeal is loaded (either from prop or async fetch)
  useEffect(() => {
    if (!editDeal) return;
    if (editDeal.globalDealType === "GOLD" || editDeal.globalDealType === "SDLOT" || editDeal.globalDealType === "ASSET") {
      setActiveTab(editDeal.globalDealType);
    }
    if (editDeal.globalDealType === "ASSET") {
      const fractional = editDeal.fractionalInvestmentDto ?? {};
      setAssetForm({
        dealName:                  editDeal.dealName                  ?? "",
        dealAmount:                editDeal.dealAmount                ? String(editDeal.dealAmount)                : "",
        dealType:                  editDeal.dealType                  ?? "NORMAL",
        dealSubType:               editDeal.dealSubType               ?? "FRACTIONAL_LENDING",
        monthlyInterest:           editDeal.monthlyInterest           ? String(editDeal.monthlyInterest)           : "",
        quartelyInterest:          editDeal.quartelyInterest          ? String(editDeal.quartelyInterest)          : "",
        halfInterest:              editDeal.halfInterest              ? String(editDeal.halfInterest)              : "",
        yearlyInterest:            editDeal.yearlyInterest            ? String(editDeal.yearlyInterest)            : "",
        borrowerName:              fractional.borrowerName            ?? "",
        projectName:               fractional.projectName             ?? "",
        assetValue:                fractional.assetValue              ? String(fractional.assetValue)              : "",
        latitude:                  fractional.latitude                ? String(fractional.latitude)                : "",
        longitude:                 fractional.longitude               ? String(fractional.longitude)               : "",
        assetArea:                 editDeal.assetArea                 ?? fractional.assetArea ?? "",
        assetAreaType:             fractional.fractionalAssetType     ?? "PLOT",
        legalReport:               null,
        valuationReport:           null,
        images:                    [],
        videos:                    [],
        duration:                  editDeal.duration                  ? String(editDeal.duration)                  : "",
        minimumParticipation:      editDeal.minimumParticipation      ? String(editDeal.minimumParticipation)      : "",
        maxParticipation:          editDeal.maxParticipation          ? String(editDeal.maxParticipation)          : "",
        fundsAcceptanceStartDate:  fromApiDate(editDeal.fundsAcceptanceStartDate  ?? ""),
        fundsAcceptanceEndDate:    fromApiDate(editDeal.fundsAcceptanceEndDate    ?? ""),
        loanActiveDate:            fromApiDate(editDeal.loanActiveDate            ?? ""),
        emiEndDate:                fromApiDate(editDeal.emiEndDate                ?? ""),
        transferFundsId:           editDeal.transferFundsId           ?? "",
        transferFunds:             editDeal.transferFunds             ?? "",
        transferTo:                editDeal.transferTo                ?? "",
      });
    } else {
      setForm({
        dealName:                  editDeal.dealName                  ?? "",
        dealType:                  editDeal.dealType                  ?? "NORMAL",
        dealSubType:               editDeal.dealSubType               ?? "STUDENT",
        globalDealType:            editDeal.globalDealType            ?? "SDLOT",
        dealAmount:                editDeal.dealAmount                ? String(editDeal.dealAmount)                : "",
        duration:                  editDeal.duration                  ? String(editDeal.duration)                  : "",
        minimumParticipation:      editDeal.minimumParticipation      ? String(editDeal.minimumParticipation)      : "",
        maxParticipation:          editDeal.maxParticipation          ? String(editDeal.maxParticipation)          : "",
        monthlyInterest:           editDeal.monthlyInterest           ? String(editDeal.monthlyInterest)           : "",
        quartelyInterest:          editDeal.quartelyInterest          ? String(editDeal.quartelyInterest)          : "",
        halfInterest:              editDeal.halfInterest              ? String(editDeal.halfInterest)              : "",
        yearlyInterest:            editDeal.yearlyInterest            ? String(editDeal.yearlyInterest)            : "",
        fundsAcceptanceStartDate:  fromApiDate(editDeal.fundsAcceptanceStartDate  ?? ""),
        fundsAcceptanceEndDate:    fromApiDate(editDeal.fundsAcceptanceEndDate    ?? ""),
        loanActiveDate:            fromApiDate(editDeal.loanActiveDate            ?? ""),
        emiEndDate:                fromApiDate(editDeal.emiEndDate                ?? ""),
        transferFundsId:           editDeal.transferFundsId           ?? "",
        transferFunds:             editDeal.transferFunds             ?? "",
        transferTo:                editDeal.transferTo                ?? "",
      });
    }
  }, [editDeal]);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); };
  const setAsset = (k, v) => { setAssetForm(f => ({ ...f, [k]: v })); setAssetErrors(e => ({ ...e, [k]: "" })); };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSubmitted(false);
    setSubmitError("");
    setErrors({});
    setAssetErrors({});
    setBorrowerErrors({});
    if (tab === "SDLOT" || tab === "GOLD") set("globalDealType", tab);
  };

  // Derive selected bank object from transferFundsId
  const selectedBank = bankAccounts.find(b => String(b.id ?? b.accountNumber) === form.transferFundsId) ?? null;
  const selectedAssetBank = bankAccounts.find(b => String(b.id ?? b.accountNumber) === assetForm.transferFundsId) ?? null;

  const validate = () => {
    const e = {};
    if (!form.dealName.trim())              e.dealName              = "Deal name is required";
    if (!form.dealAmount)                   e.dealAmount            = "Deal amount is required";
    if (!form.duration)                     e.duration              = "Duration is required";
    if (!form.minimumParticipation)         e.minimumParticipation  = "Minimum participation is required";
    if (!form.maxParticipation)             e.maxParticipation      = "Maximum participation is required";
    if (!form.monthlyInterest)              e.monthlyInterest       = "Monthly interest is required";
    if (!form.fundsAcceptanceStartDate)     e.fundsAcceptanceStartDate = "Start date is required";
    if (!form.fundsAcceptanceEndDate)       e.fundsAcceptanceEndDate   = "End date is required";
    if (!form.loanActiveDate)               e.loanActiveDate        = "Loan active date is required";
    if (!form.emiEndDate)                   e.emiEndDate            = "EMI end date is required";
    const min = numVal(form.minimumParticipation), max = numVal(form.maxParticipation);
    if (min && max && min >= max) e.maxParticipation = "Max must be greater than min";
    return e;
  };

  const validateAsset = () => {
    const e = {};
    if (!assetForm.dealName.trim())       e.dealName = "Deal name is required";
    if (!assetForm.dealAmount)            e.dealAmount = "Deal amount is required";
    // if (!assetForm.monthlyInterest)       e.monthlyInterest = "Monthly ROI is required";
    if (!assetForm.borrowerName.trim())   e.borrowerName = "Borrower name is required";
    if (!assetForm.projectName.trim())    e.projectName = "Project name is required";
    if (!isEdit) {
      if (!assetForm.legalReport)           e.legalReport = "Legal report is required";
      if (!assetForm.valuationReport)       e.valuationReport = "Valuation report is required";
    }
    if (!assetForm.assetValue)            e.assetValue = "Asset value is required";
    if (!assetForm.latitude)              e.latitude = "Latitude is required";
    if (!assetForm.longitude)             e.longitude = "Longitude is required";
    if (!assetForm.assetArea.trim())      e.assetArea = "Asset area is required";
    if (assetForm.images.length > 3)      e.images = "Upload up to 3 images";
    if (assetForm.videos.length > 3)      e.videos = "Upload up to 3 videos";
    if (!assetForm.duration)              e.duration = "Duration is required";
    if (!assetForm.minimumParticipation)  e.minimumParticipation = "Minimum participation is required";
    if (!assetForm.maxParticipation)      e.maxParticipation = "Maximum participation is required";
    if (!assetForm.fundsAcceptanceStartDate) e.fundsAcceptanceStartDate = "Start date is required";
    if (!assetForm.fundsAcceptanceEndDate)   e.fundsAcceptanceEndDate = "End date is required";
    if (!assetForm.loanActiveDate)        e.loanActiveDate = "Loan active date is required";
    if (!assetForm.emiEndDate)            e.emiEndDate = "EMI end date is required";

    const min = numVal(assetForm.minimumParticipation), max = numVal(assetForm.maxParticipation);
    if (min && max && min >= max) e.maxParticipation = "Max must be greater than min";

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        dealName:                  form.dealName.trim(),
        dealType:                  form.dealType,
        dealSubType:               form.dealSubType,
        globalDealType:            form.globalDealType,
        dealAmount:                numVal(form.dealAmount),
        duration:                  parseInt(form.duration, 10),
        minimumParticipation:      numVal(form.minimumParticipation),
        maxParticipation:          numVal(form.maxParticipation),
        monthlyInterest:           parseFloat(form.monthlyInterest) || 0,
        quartelyInterest:          parseFloat(form.quartelyInterest) || 0,
        halfInterest:              parseFloat(form.halfInterest) || 0,
        yearlyInterest:            parseFloat(form.yearlyInterest) || 0,
        fundsAcceptanceStartDate:  toApiDate(form.fundsAcceptanceStartDate),
        fundsAcceptanceEndDate:    toApiDate(form.fundsAcceptanceEndDate),
        loanActiveDate:            toApiDate(form.loanActiveDate),
        emiEndDate:                toApiDate(form.emiEndDate),
        transferFundsId:           form.transferFundsId,          // bank account id
        transferFunds:             form.transferFunds,             // bank name
        transferTo:                form.transferTo,                // company name
        userIds:                   IdsField
      };
      if (isEdit && editDeal?.id) payload.id = editDeal.id;

      await createOrUpdateDeal(payload);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message ?? "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssetSubmit = async (e) => {
    e.preventDefault();
    const errs = validateAsset();
    if (Object.keys(errs).length) { setAssetErrors(errs); return; }

    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        dealName:                  assetForm.dealName.trim(),
        dealAmount:                numVal(assetForm.dealAmount),
        dealType:                  assetForm.dealType,
        dealSubType:               assetForm.dealSubType,
        globalDealType:            "ASSET",
        monthlyInterest:           parseFloat(assetForm.monthlyInterest) || 0,
        quartelyInterest:          parseFloat(assetForm.quartelyInterest) || 0,
        halfInterest:              parseFloat(assetForm.halfInterest) || 0,
        yearlyInterest:            parseFloat(assetForm.yearlyInterest) || 0,
        duration:                  parseInt(assetForm.duration, 10),
        minimumParticipation:      numVal(assetForm.minimumParticipation),
        maxParticipation:          numVal(assetForm.maxParticipation),
        fundsAcceptanceStartDate:  toApiDate(assetForm.fundsAcceptanceStartDate),
        fundsAcceptanceEndDate:    toApiDate(assetForm.fundsAcceptanceEndDate),
        loanActiveDate:            toApiDate(assetForm.loanActiveDate),
        emiEndDate:                toApiDate(assetForm.emiEndDate),
        transferFundsId:           assetForm.transferFundsId,
        transferFunds:             assetForm.transferFunds,
        transferTo:                assetForm.transferTo,
        fractionalInvestmentDto: {
          assetValue: numVal(assetForm.assetValue),
          borrowerName: assetForm.borrowerName.trim(),
          fractionalAssetType: assetForm.assetAreaType,
          id: editDeal?.fractionalInvestmentDto?.id || null,
          latitude: parseFloat(assetForm.latitude) || 0,
          longitude: parseFloat(assetForm.longitude) || 0,
          projectName: assetForm.projectName.trim(),
          area: assetForm.assetArea,
        }
      };

      if (isEdit && editDeal?.id) {
        payload.id = editDeal.id;
      }

      // 1. Create/Update deal
      const createdDeal = await createOrUpdateDeal(payload);

      // 2. Fetch the asset ID
      const assetId = createdDeal?.fractionalInvestmentDto?.id || createdDeal?.id || editDeal?.fractionalInvestmentDto?.id || editDeal?.id;
      if (!assetId) {
        throw new Error("Deal created, but failed to retrieve the asset ID for file uploads.");
      }

      // 3. Upload reports and media
      const uploadPromises = [];
      if (assetForm.legalReport) {
        uploadPromises.push(
          uploadFractionalAssetFile({ file: assetForm.legalReport, assetId, fileType: "legalreport" })
        );
      }
      if (assetForm.valuationReport) {
        uploadPromises.push(
          uploadFractionalAssetFile({ file: assetForm.valuationReport, assetId, fileType: "valuationreport" })
        );
      }
      if (Array.isArray(assetForm.images)) {
        assetForm.images.forEach(file => {
          uploadPromises.push(
            uploadFractionalAssetFile({ file, assetId, fileType: "fractionalimage" })
          );
        });
      }
      if (Array.isArray(assetForm.videos)) {
        assetForm.videos.forEach(file => {
          uploadPromises.push(
            uploadFractionalAssetFile({ file, assetId, fileType: "fractionalvideo" })
          );
        });
      }

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message ?? "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ ...EMPTY_FORM, globalDealType: activeTab === "GOLD" ? "GOLD" : "SDLOT" });
    setAssetForm(EMPTY_ASSET_FORM);
    setBorrowerForm(EMPTY_BORROWER_FORM);
    setBorrowerErrors({});
    setErrors({});
    setAssetErrors({});
    setSubmitted(false);
    setSubmitError("");
    setDealTypeSelected(false);
  };

  const minAmt    = numVal(form.minimumParticipation);
  const roiNum    = parseFloat(form.monthlyInterest) || 0;
  const tenureNum = parseInt(form.duration, 10) || 0;
  const roiEarnings = minAmt ? Math.round(minAmt * (roiNum / 100) * tenureNum) : 0;
  const totalReturn = minAmt + roiEarnings;
  const showPreview = minAmt > 0 && roiNum > 0 && tenureNum > 0;

  // ─── Deal type landing screen (shown before form when creating new deal) ──
  if (!isEdit && !dealTypeSelected) return (
    <div className="max-w-2xl mx-auto grid gap-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-muted)" }}>
            <ArrowLeft /> Dashboard
          </button>
          <span style={{ color: "var(--border)" }}>/</span>
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Create Deal</span>
        </div>
        <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>Which deal do you want to launch?</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Select a deal type to continue.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {DEAL_TYPE_CARDS.map(card => (
          <button
            key={card.key}
            type="button"
            onClick={() => {
              setActiveTab(card.key === "BORROWER" ? "BORROWER" : card.key);
              if (card.key === "SDLOT" || card.key === "GOLD") set("globalDealType", card.key);
              setDealTypeSelected(true);
            }}
            className="text-left rounded-2xl p-5 flex flex-col gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: card.bg, border: `1.5px solid ${card.border}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: card.color + "22", color: card.color, border: `1px solid ${card.color}44` }}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: card.color }}>{card.label}</p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>{card.description}</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold mt-auto" style={{ color: card.color }}>
              Select <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  if (dealLoading) return (
    <div className="max-w-3xl mx-auto grid gap-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/dashboard")}
          className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity"
          style={{ color: "var(--text-muted)" }}>
          <ArrowLeft /> Dashboard
        </button>
      </div>
      <div className="h-8 w-48 rounded-xl shimmer-bg" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-40 rounded-2xl shimmer-bg" />
      ))}
    </div>
  );

  if (submitted) return (
    <div className="max-w-3xl mx-auto py-12 flex flex-col items-center gap-6 text-center">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05))", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}>
        <CheckCircle />
      </div>
      <div>
        <h2 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
          {activeTab === "ASSET" ? "Asset Deal Created!" : activeTab === "BORROWER" ? "Borrower Deal Created!" : isEdit ? "Deal Updated!" : "Deal Created!"}
        </h2>
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
          <span className="font-bold" style={{ color: "var(--text-primary)" }}>{activeTab === "ASSET" ? assetForm.dealName : activeTab === "BORROWER" ? borrowerForm.dealName : form.dealName}</span> has been saved.
        </p>
      </div>
      <div className="w-full rounded-2xl overflow-hidden"
        style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
        <div className="px-5 py-3 flex items-center gap-2"
          style={{ borderBottom: "1px solid var(--border)", background: "rgba(99,102,241,0.04)" }}>
          <TrendUp />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6366f1" }}>Deal Summary</span>
        </div>
        {/* Left — Deal stats single horizontal row */}
        <div className="flex items-stretch gap-0 divide-x" style={{ borderBottom: '1px solid var(--border)', '--tw-divide-opacity': 1 }}>
          {(activeTab === "ASSET" ? [
            { label: "Deal Value",  value: fmtINR(numVal(assetForm.dealAmount)), color: "#6366f1" },
            { label: assetForm.monthlyInterest ? "Monthly ROI" : assetForm.yearlyInterest ? "Yearly ROI" : "ROI", value: assetForm.monthlyInterest ? assetForm.monthlyInterest + "%" : assetForm.yearlyInterest ? assetForm.yearlyInterest + "%" : "—", color: "#10b981" },
            { label: "Asset Value", value: fmtINR(numVal(assetForm.assetValue)), color: "#818cf8" },
            { label: "Area Type",   value: assetForm.assetAreaType, color: "#f59e0b" },
          ] : activeTab === "BORROWER" ? [
            { label: "Deal Amount",  value: fmtINR(numVal(borrowerForm.dealAmount)),                                                                       color: "#6366f1" },
            { label: "Monthly ROI", value: borrowerForm.monthlyInterest ? borrowerForm.monthlyInterest + "%" : "—",                                       color: "#10b981" },
            { label: "Duration",    value: borrowerForm.duration ? borrowerForm.duration + " months" : "—",                                               color: "#818cf8" },
            { label: "Borrower",    value: borrowerForm.borrowerName || "—",                                                                              color: "#f59e0b" },
          ] : [
            { label: "Deal Amount",  value: fmtINR(numVal(form.dealAmount)),                                                          color: "#6366f1" },
            { label: "Monthly ROI", value: form.monthlyInterest ? form.monthlyInterest + "%" : "—",                                  color: "#10b981" },
            { label: "Duration",    value: form.duration ? form.duration + " months" : "—",                                          color: "#818cf8" },
            { label: "Min / Max",   value: fmtINR(numVal(form.minimumParticipation)) + " – " + fmtINR(numVal(form.maxParticipation)), color: "#f59e0b" },
          ]).map(s => (
            <div key={s.label} className="flex-1 px-4 py-4 text-center"
              style={{ borderRight: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-base font-extrabold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Right — Bank details table */}
        {((activeTab === "ASSET"
          ? (assetForm.transferTo || assetForm.transferFunds || selectedAssetBank)
          : activeTab === "BORROWER"
            ? (borrowerForm.transferTo || borrowerForm.transferFunds || selectedBorrowerBank)
            : (form.transferTo || form.transferFunds || selectedBank))) && (
          <div>
            <div className="px-5 py-2.5 flex items-center gap-2"
              style={{ borderBottom: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.04)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: '#f59e0b' }}>
                <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/>
              </svg>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#f59e0b' }}>Bank Details</span>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {(() => {
                  const b = activeTab === "ASSET" ? selectedAssetBank : activeTab === "BORROWER" ? selectedBorrowerBank : selectedBank;
                  const f = activeTab === "ASSET" ? assetForm : activeTab === "BORROWER" ? borrowerForm : form;
                  return [
                    { label: 'Company Name',   value: b?.companyName   || f.transferTo    || '—' },
                    { label: 'Bank Name',      value: b?.bankName      || f.transferFunds || '—' },
                    { label: 'Account Number', value: b?.accountNumber || '—', mono: true },
                    { label: 'IFSC Code',      value: b?.ifscCode      || '—', mono: true },
                    { label: 'Branch',         value: b?.branchName    || b?.branch || '—' },
                    { label: 'Account Type',   value: b?.accountType   || '—' },
                  ];
                })().map((r, i) => (
                  <tr key={r.label} style={{ borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
                    <td className="px-5 py-2.5 text-xs font-semibold w-40" style={{ color: 'var(--text-muted)', background: 'var(--input-bg)' }}>{r.label}</td>
                    <td className="px-5 py-2.5 text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: r.mono ? "'JetBrains Mono', monospace" : 'inherit' }}>{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Created date footer */}
        <div className="px-5 py-3 flex items-center justify-between"
          style={{ borderTop: "1px solid var(--border)", background: "rgba(99,102,241,0.02)" }}>
          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
            {isEdit ? "Updated on" : "Created on"}
          </span>
          <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
            {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
      <div className="flex gap-3 w-full">
        <button onClick={() => navigate("/admin/dashboard")}
          className="flex-1 py-3 rounded-xl font-bold text-sm"
          style={{ background: "var(--input-bg)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
          Dashboard
        </button>
        <button onClick={resetForm}
          className="flex-1 py-3 rounded-xl font-bold text-sm"
          style={{ background: "linear-gradient(135deg,#6366f1,#4338ca)", color: "#fff", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>
          + Create Another
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto grid gap-5">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-muted)" }}>
            <ArrowLeft /> Dashboard
          </button>
          <span style={{ color: "var(--border)" }}>/</span>
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {isEdit ? "Edit Deal" : "Create Deal"}
          </span>
        </div>
        <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
          {activeTab === "ASSET" ? "New Asset Fractional Lending Deal" : activeTab === "BORROWER" ? "New Borrower Deal" : isEdit ? `Edit ${activeTab === "GOLD" ? "Gold Lot" : "SD Lot"} Deal` : `New ${activeTab === "GOLD" ? "Gold Lot" : "SD Lot"} Deal`}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          {activeTab === "ASSET" ? "Create a fractional lending deal with asset validation reports and media" : activeTab === "BORROWER" ? "Link a new deal to an existing borrower — financial and bank details apply as usual" : isEdit ? "Update the deal details below" : "Create a new investment offering for participants"}
        </p>
      </div>

      <DealTabs active={activeTab} onChange={changeTab} />

      {activeTab === "ASSET" ? (
      <form onSubmit={handleAssetSubmit} className="grid gap-4">
        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#818cf8" }}>Deal Identity</p>
          <Field label="Deal Name" required error={assetErrors.dealName}>
            <input type="text" placeholder="Enter deal name"
              value={assetForm.dealName} onChange={e => setAsset("dealName", e.target.value)}
              style={inp(assetErrors.dealName)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Deal Type" required>
              <PillSelect value={assetForm.dealType} onChange={v => setAsset("dealType", v)} options={DEAL_TYPES} accent="#818cf8" />
            </Field>
            <Field label="Sub Type" required>
              <select value={assetForm.dealSubType} onChange={e => setAsset("dealSubType", e.target.value)}
                style={{ ...inp(""), appearance: "none", cursor: "pointer" }}>
                {ASSET_SUB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
        </div>

        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#10b981" }}>ROI (%)</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { key: "monthlyInterest", label: "Monthly", required: false },
              { key: "quartelyInterest", label: "Quarterly", required: false },
              { key: "yearlyInterest", label: "Yearly", required: false },
              { key: "halfInterest", label: "Half-Yearly", required: false },
            ].map(f => (
              <Field key={f.key} label={f.label} required={f.required} error={assetErrors[f.key]}>
                <div className="relative">
                  <input type="text" inputMode="decimal" placeholder="0.0"
                    value={assetForm[f.key]} onChange={e => setAsset(f.key, e.target.value.replace(/[^0-9.]/g, ""))}
                    style={{ ...inp(assetErrors[f.key]), paddingRight: 28 }} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: "var(--text-muted)" }}>%</span>
                </div>
              </Field>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#06b6d4" }}>Borrower & Asset</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Borrower Name" required error={assetErrors.borrowerName}>
              <input type="text" placeholder="Enter borrower name"
                value={assetForm.borrowerName} onChange={e => setAsset("borrowerName", e.target.value)}
                style={inp(assetErrors.borrowerName)} />
            </Field>
            <Field label="Project Name" required error={assetErrors.projectName}>
              <input type="text" placeholder="Enter project name"
                value={assetForm.projectName} onChange={e => setAsset("projectName", e.target.value)}
                style={inp(assetErrors.projectName)} />
            </Field>
            <Field label="Asset Value (₹)" required error={assetErrors.assetValue} hint={numVal(assetForm.assetValue) > 0 ? fmtINR(numVal(assetForm.assetValue)) : undefined}>
              <input type="text" inputMode="numeric" placeholder="e.g. 2500000"
                value={assetForm.assetValue} onChange={e => setAsset("assetValue", toLocale(e.target.value))}
                style={{ ...inp(assetErrors.assetValue), fontFamily: "'JetBrains Mono', monospace" }} />
            </Field>
            <Field label="Asset Area" required error={assetErrors.assetArea}>
              <input type="text" placeholder="Enter area"
                value={assetForm.assetArea} onChange={e => setAsset("assetArea", e.target.value)}
                style={inp(assetErrors.assetArea)} />
            </Field>
            <Field label="Latitude" required error={assetErrors.latitude}>
              <input type="text" inputMode="decimal" placeholder="e.g. 17.3850"
                value={assetForm.latitude} onChange={e => setAsset("latitude", e.target.value.replace(/[^0-9.-]/g, ""))}
                style={inp(assetErrors.latitude)} />
            </Field>
            <Field label="Longitude" required error={assetErrors.longitude}>
              <input type="text" inputMode="decimal" placeholder="e.g. 78.4867"
                value={assetForm.longitude} onChange={e => setAsset("longitude", e.target.value.replace(/[^0-9.-]/g, ""))}
                style={inp(assetErrors.longitude)} />
            </Field>
          </div>
          <Field label="Asset Type" required>
            <PillSelect value={assetForm.assetAreaType} onChange={v => setAsset("assetAreaType", v)} options={ASSET_AREA_TYPES} accent="#06b6d4" />
          </Field>
        </div>

        {/* Financial Details */}
        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#6366f1" }}>Financial Details</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Deal Amount (₹)" required error={assetErrors.dealAmount} hint={numVal(assetForm.dealAmount) > 0 ? fmtINR(numVal(assetForm.dealAmount)) : undefined}>
              <input type="text" inputMode="numeric" placeholder="e.g. 100000"
                value={assetForm.dealAmount} onChange={e => setAsset("dealAmount", toLocale(e.target.value))}
                style={{ ...inp(assetErrors.dealAmount), fontFamily: "'JetBrains Mono', monospace" }} />
            </Field>
            <Field label="Duration (months)" required error={assetErrors.duration}>
              <input type="number" min="1" placeholder="e.g. 5"
                value={assetForm.duration} onChange={e => setAsset("duration", e.target.value)}
                style={inp(assetErrors.duration)} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Min Participation (₹)" required error={assetErrors.minimumParticipation} hint={numVal(assetForm.minimumParticipation) > 0 ? fmtINR(numVal(assetForm.minimumParticipation)) : undefined}>
              <input type="text" inputMode="numeric" placeholder="e.g. 500"
                value={assetForm.minimumParticipation} onChange={e => setAsset("minimumParticipation", toLocale(e.target.value))}
                style={{ ...inp(assetErrors.minimumParticipation), fontFamily: "'JetBrains Mono', monospace" }} />
            </Field>
            <Field label="Max Participation (₹)" required error={assetErrors.maxParticipation} hint={numVal(assetForm.maxParticipation) > 0 ? fmtINR(numVal(assetForm.maxParticipation)) : undefined}>
              <input type="text" inputMode="numeric" placeholder="e.g. 5000"
                value={assetForm.maxParticipation} onChange={e => setAsset("maxParticipation", toLocale(e.target.value))}
                style={{ ...inp(assetErrors.maxParticipation), fontFamily: "'JetBrains Mono', monospace" }} />
            </Field>
          </div>
        </div>

        {/* Key Dates */}
        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#f59e0b" }}>Key Dates</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Funds Acceptance Start" required error={assetErrors.fundsAcceptanceStartDate}>
              <input type="date" value={assetForm.fundsAcceptanceStartDate} onChange={e => setAsset("fundsAcceptanceStartDate", e.target.value)}
                style={inp(assetErrors.fundsAcceptanceStartDate)} />
            </Field>
            <Field label="Funds Acceptance End" required error={assetErrors.fundsAcceptanceEndDate}>
              <input type="date" value={assetForm.fundsAcceptanceEndDate} onChange={e => setAsset("fundsAcceptanceEndDate", e.target.value)}
                style={inp(assetErrors.fundsAcceptanceEndDate)} />
            </Field>
            <Field label="Loan Active Date" required error={assetErrors.loanActiveDate}>
              <input type="date" value={assetForm.loanActiveDate} onChange={e => setAsset("loanActiveDate", e.target.value)}
                style={inp(assetErrors.loanActiveDate)} />
            </Field>
            <Field label="EMI End Date" required error={assetErrors.emiEndDate}>
              <input type="date" value={assetForm.emiEndDate} onChange={e => setAsset("emiEndDate", e.target.value)}
                style={inp(assetErrors.emiEndDate)} />
            </Field>
          </div>
        </div>

        {/* Transfer Funds */}
        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#06b6d4" }}>Transfer Funds</p>

          <Field label="Transfer Funds (Bank Account)" error={assetErrors.transferFundsId}>
            <BankSelect
              value={assetForm.transferFundsId}
              loading={banksLoading}
              accounts={bankAccounts}
              error={assetErrors.transferFundsId}
              onChange={(id, bank) => {
                setAssetForm(f => ({
                  ...f,
                  transferFundsId: id,
                  transferFunds:   bank?.bankName ?? "",
                  transferTo:      id,
                }));
                setAssetErrors(err => ({ ...err, transferFundsId: "" }));
              }}
            />
          </Field>

          {selectedAssetBank && (
            <div className="rounded-xl px-4 py-3 grid gap-2"
              style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)" }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#06b6d4" }}>Selected Bank</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { label: "Company Name",   value: selectedAssetBank.companyName   },
                  { label: "Bank Name",      value: selectedAssetBank.bankName      },
                  { label: "Account No.",    value: selectedAssetBank.accountNumber },
                  { label: "IFSC",           value: selectedAssetBank.ifscCode      },
                  { label: "Branch",         value: selectedAssetBank.branch        },
                  { label: "Account Type",   value: selectedAssetBank.accountType   },
                ].filter(r => r.value).map(r => (
                  <div key={r.label}>
                    <p style={{ color: "var(--text-muted)" }}>{r.label}</p>
                    <p className="font-bold mt-0.5" style={{ color: "var(--text-primary)", fontFamily: r.label === "IFSC" || r.label === "Account No." ? "monospace" : "inherit" }}>
                      {r.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#f59e0b" }}>Validation Check</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FilePicker label="Legal Report" file={assetForm.legalReport} accept=".pdf,.jpg,.jpeg,.png"
              error={assetErrors.legalReport} onChange={file => setAsset("legalReport", file)} />
            <FilePicker label="Valuation Report" file={assetForm.valuationReport} accept=".pdf,.jpg,.jpeg,.png"
              error={assetErrors.valuationReport} onChange={file => setAsset("valuationReport", file)} />
            <FilePicker label="Images (max 3)" files={assetForm.images} multiple accept="image/*" required={false}
              error={assetErrors.images} onChange={files => setAsset("images", files.slice(0, 3))} />
            <FilePicker label="Videos (max 3)" files={assetForm.videos} multiple accept="video/*" required={false}
              error={assetErrors.videos} onChange={files => setAsset("videos", files.slice(0, 3))} />
          </div>
        </div>

        {submitError && (
          <div className="px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
            {submitError}
          </div>
        )}

        <button type="submit" disabled={submitting}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-base transition-all disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#6366f1,#4338ca)", color: "#fff", boxShadow: "0 4px 24px rgba(99,102,241,0.4)" }}>
          {submitting
            ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
            : <PlusIcon />}
          {submitting ? "Saving…" : "Create Asset Deal"}
        </button>
      </form>
      ) : activeTab === "BORROWER" ? (
      /* ═══════════════════════ BORROWER DEAL FORM ══════════════════════════ */
      <form onSubmit={handleBorrowerSubmit} className="grid gap-4">

        {/* Deal Identity */}
        

        {/* Borrower Selector */}
        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#06b6d4" }}>Select Asset</p>

          {borrowersLoading ? (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{ background: "var(--input-bg)", border: "1.5px solid var(--border)" }}>
              <svg className="w-4 h-4 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
              </svg>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>Loading assets…</span>
            </div>
          ) : (
            <Field label="Asset" required error={borrowerErrors.borrowerId}>
              <div className="relative">
                {/* Trigger */}
                <button type="button" onClick={() => setBorrowerDropOpen(o => !o)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left transition-all"
                  style={{
                    background: "var(--input-bg)",
                    border: `1.5px solid ${borrowerErrors.borrowerId ? "#ef4444" : borrowerDropOpen ? "#10b981" : "var(--border)"}`,
                    boxShadow: borrowerDropOpen ? "0 0 0 3px rgba(16,185,129,0.12)" : "none",
                  }}>
                  {borrowerForm.borrowerId ? (
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black"
                        style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>
                        {(borrowerForm.borrowerName ?? "B").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{borrowerForm.borrowerName}</p>
                        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{borrowerForm.projectName}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>— Select asset from list —</span>
                  )}
                  <span className="flex-shrink-0 transition-transform duration-200"
                    style={{ transform: borrowerDropOpen ? "rotate(180deg)" : "rotate(0)", color: "var(--text-muted)" }}>
                    <ChevronDown />
                  </span>
                </button>

                {/* Dropdown */}
                {borrowerDropOpen && (
                  <div className="absolute z-30 w-full mt-1.5 rounded-xl overflow-hidden"
                    style={{ background: "var(--surface-card)", border: "1px solid var(--border)", boxShadow: "0 12px 40px rgba(0,0,0,0.2)" }}>
                    {/* Search */}
                    <div className="flex items-center gap-2 px-3 py-2.5"
                      style={{ borderBottom: "1px solid var(--border)", background: "var(--input-bg)" }}>
                      <SearchIcon />
                      <input autoFocus type="text" placeholder="Search by borrower name or project…"
                        value={borrowerSearch} onChange={e => setBorrowerSearch(e.target.value)}
                        className="flex-1 text-sm bg-transparent outline-none"
                        style={{ color: "var(--text-primary)" }} />
                      {borrowerSearch && (
                        <button type="button" onClick={() => setBorrowerSearch("")}
                          style={{ color: "var(--text-muted)" }}><CloseIcon /></button>
                      )}
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {filteredBorrowers.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-center" style={{ color: "var(--text-muted)" }}>No borrowers found</p>
                      ) : filteredBorrowers.map(b => {
                        const key    = String(b.id ?? b.borrowerName);
                        const active = borrowerForm.borrowerId === key;
                        // projectName may be array of objects or string
                        const proj   = Array.isArray(b.projectName)
                          ? b.projectName.map(p => p?.projectName ?? p).filter(Boolean).join(", ")
                          : (b.projectName ?? "");
                        return (
                          <button key={key} type="button"
                            onClick={() => {
                              setBorrowerForm(f => ({
                                ...f,
                                borrowerId:   key,
                                borrowerName: b.borrowerName ?? "",
                                projectName:  b.projectName ?? "",
                                assetValue:   b.takenAssetValue ? String(b.takenAssetValue) : (b.actualAssetValue ? String(b.actualAssetValue) : ""),
                                assetAreaType: b.assetType === "FLAT" ? "FLAT" : b.assetType === "PLOT" ? "PLOT" : "PLOT",
                                assetArea:    b.size ?? b.area ?? "",
                                latitude:     "",
                                longitude:    "",
                              }));
                              setBorrowerErrors(e => ({ ...e, borrowerId: "" }));
                              setBorrowerDropOpen(false);
                              setBorrowerSearch("");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                            style={{
                              background: active ? "rgba(16,185,129,0.08)" : "transparent",
                              borderBottom: "1px solid var(--border)",
                            }}
                            onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--row-hover)"; }}
                            onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? "rgba(16,185,129,0.08)" : "transparent"; }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black"
                              style={{
                                background: active ? "rgba(16,185,129,0.2)" : "var(--input-bg)",
                                color: active ? "#10b981" : "var(--text-muted)",
                                border: `1px solid ${active ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
                              }}>
                              {(b.borrowerName ?? "B").charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate" style={{ color: active ? "#10b981" : "var(--text-primary)" }}>{b.borrowerName}</p>
                              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                                {b.projectName || "—"}
                                {b.assetType && <span className="ml-2">· {b.assetType}</span>}
                                {b.flatNumber && <span className="ml-2">· {b.flatNumber}</span>}
                              </p>
                            </div>
                            {active && (
                              <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Field>
          )}

          {/* Borrower details card when selected */}
          {borrowerForm.borrowerId && (
            <div className="rounded-xl px-4 py-3 grid gap-3"
              style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#10b981" }}>Asset Details</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Borrower Name" required error={borrowerErrors.borrowerName}>
                  <input type="text" value={borrowerForm.borrowerName}
                    onChange={e => setBorrower("borrowerName", e.target.value)}
                    style={inp(borrowerErrors.borrowerName)} />
                </Field>
                <Field label="Project Name" required error={borrowerErrors.projectName}>
                  <input type="text" value={borrowerForm.projectName}
                    onChange={e => setBorrower("projectName", e.target.value)}
                    style={inp(borrowerErrors.projectName)} />
                </Field>
                <Field label="Asset Value (₹)" required error={borrowerErrors.assetValue} hint={numVal(borrowerForm.assetValue) > 0 ? fmtINR(numVal(borrowerForm.assetValue)) : undefined}>
                  <input type="text" inputMode="numeric" placeholder="e.g. 2500000"
                    value={borrowerForm.assetValue}
                    onChange={e => setBorrower("assetValue", toLocale(e.target.value))}
                    style={{ ...inp(borrowerErrors.assetValue), fontFamily: "'JetBrains Mono', monospace" }} />
                </Field>
                <Field label="Asset Area" required error={borrowerErrors.assetArea}>
                  <input type="text" placeholder="e.g. 832 sqft"
                    value={borrowerForm.assetArea}
                    onChange={e => setBorrower("assetArea", e.target.value)}
                    style={inp(borrowerErrors.assetArea)} />
                </Field>
                <Field label="Latitude" required error={borrowerErrors.latitude}>
                  <input type="text" inputMode="decimal" placeholder="e.g. 17.3850"
                    value={borrowerForm.latitude}
                    onChange={e => setBorrower("latitude", e.target.value.replace(/[^0-9.-]/g, ""))}
                    style={inp(borrowerErrors.latitude)} />
                </Field>
                <Field label="Longitude" required error={borrowerErrors.longitude}>
                  <input type="text" inputMode="decimal" placeholder="e.g. 78.4867"
                    value={borrowerForm.longitude}
                    onChange={e => setBorrower("longitude", e.target.value.replace(/[^0-9.-]/g, ""))}
                    style={inp(borrowerErrors.longitude)} />
                </Field>
              </div>
              <Field label="Asset Type" required>
                <PillSelect value={borrowerForm.assetAreaType} onChange={v => setBorrower("assetAreaType", v)} options={ASSET_AREA_TYPES} accent="#10b981" />
              </Field>
            </div>
          )}
        </div>

        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#10b981" }}>Deal Identity</p>
          <Field label="Deal Name" required error={borrowerErrors.dealName}>
            <input type="text" placeholder="e.g. BRW-ProjectAlpha-20L-2026"
              value={borrowerForm.dealName} onChange={e => setBorrower("dealName", e.target.value)}
              style={inp(borrowerErrors.dealName)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Deal Type" required>
              <PillSelect value={borrowerForm.dealType} onChange={v => setBorrower("dealType", v)} options={DEAL_TYPES} accent="#10b981" />
            </Field>
            <Field label="Sub Type" required>
              <select value={borrowerForm.dealSubType} onChange={e => setBorrower("dealSubType", e.target.value)}
                style={{ ...inp(""), appearance: "none", cursor: "pointer" }}>
                {ASSET_SUB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* ROI */}
        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#10b981" }}>ROI (%)</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { key: "monthlyInterest",  label: "Monthly" },
              { key: "quartelyInterest", label: "Quarterly" },
              { key: "yearlyInterest",   label: "Yearly" },
              { key: "halfInterest",     label: "Half-Yearly" },
            ].map(f => (
              <Field key={f.key} label={f.label} error={borrowerErrors[f.key]}>
                <div className="relative">
                  <input type="text" inputMode="decimal" placeholder="0.0"
                    value={borrowerForm[f.key]}
                    onChange={e => setBorrower(f.key, e.target.value.replace(/[^0-9.]/g, ""))}
                    style={{ ...inp(borrowerErrors[f.key]), paddingRight: 28 }} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: "var(--text-muted)" }}>%</span>
                </div>
              </Field>
            ))}
          </div>
        </div>

        {/* Financial Details */}
        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#6366f1" }}>Financial Details</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Deal Amount (₹)" required error={borrowerErrors.dealAmount}
              hint={numVal(borrowerForm.dealAmount) > 0 ? fmtINR(numVal(borrowerForm.dealAmount)) : undefined}>
              <input type="text" inputMode="numeric" placeholder="e.g. 100000"
                value={borrowerForm.dealAmount} onChange={e => setBorrower("dealAmount", toLocale(e.target.value))}
                style={{ ...inp(borrowerErrors.dealAmount), fontFamily: "'JetBrains Mono', monospace" }} />
            </Field>
            <Field label="Duration (months)" required error={borrowerErrors.duration}>
              <input type="number" min="1" placeholder="e.g. 5"
                value={borrowerForm.duration} onChange={e => setBorrower("duration", e.target.value)}
                style={inp(borrowerErrors.duration)} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Min Participation (₹)" required error={borrowerErrors.minimumParticipation}
              hint={numVal(borrowerForm.minimumParticipation) > 0 ? fmtINR(numVal(borrowerForm.minimumParticipation)) : undefined}>
              <input type="text" inputMode="numeric" placeholder="e.g. 500"
                value={borrowerForm.minimumParticipation} onChange={e => setBorrower("minimumParticipation", toLocale(e.target.value))}
                style={{ ...inp(borrowerErrors.minimumParticipation), fontFamily: "'JetBrains Mono', monospace" }} />
            </Field>
            <Field label="Max Participation (₹)" required error={borrowerErrors.maxParticipation}
              hint={numVal(borrowerForm.maxParticipation) > 0 ? fmtINR(numVal(borrowerForm.maxParticipation)) : undefined}>
              <input type="text" inputMode="numeric" placeholder="e.g. 5000"
                value={borrowerForm.maxParticipation} onChange={e => setBorrower("maxParticipation", toLocale(e.target.value))}
                style={{ ...inp(borrowerErrors.maxParticipation), fontFamily: "'JetBrains Mono', monospace" }} />
            </Field>
          </div>
        </div>

        {/* Key Dates */}
        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#f59e0b" }}>Key Dates</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Funds Acceptance Start" required error={borrowerErrors.fundsAcceptanceStartDate}>
              <input type="date" value={borrowerForm.fundsAcceptanceStartDate}
                onChange={e => setBorrower("fundsAcceptanceStartDate", e.target.value)}
                style={inp(borrowerErrors.fundsAcceptanceStartDate)} />
            </Field>
            <Field label="Funds Acceptance End" required error={borrowerErrors.fundsAcceptanceEndDate}>
              <input type="date" value={borrowerForm.fundsAcceptanceEndDate}
                onChange={e => setBorrower("fundsAcceptanceEndDate", e.target.value)}
                style={inp(borrowerErrors.fundsAcceptanceEndDate)} />
            </Field>
            <Field label="Loan Active Date" required error={borrowerErrors.loanActiveDate}>
              <input type="date" value={borrowerForm.loanActiveDate}
                onChange={e => setBorrower("loanActiveDate", e.target.value)}
                style={inp(borrowerErrors.loanActiveDate)} />
            </Field>
            <Field label="EMI End Date" required error={borrowerErrors.emiEndDate}>
              <input type="date" value={borrowerForm.emiEndDate}
                onChange={e => setBorrower("emiEndDate", e.target.value)}
                style={inp(borrowerErrors.emiEndDate)} />
            </Field>
          </div>
        </div>

        {/* Validation Check */}
        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#f59e0b" }}>Validation Check</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FilePicker label="Legal Report" file={borrowerForm.legalReport} accept=".pdf,.jpg,.jpeg,.png"
              error={borrowerErrors.legalReport} onChange={file => setBorrower("legalReport", file)} />
            <FilePicker label="Valuation Report" file={borrowerForm.valuationReport} accept=".pdf,.jpg,.jpeg,.png"
              error={borrowerErrors.valuationReport} onChange={file => setBorrower("valuationReport", file)} />
            <FilePicker label="Images (max 3)" files={borrowerForm.images} multiple accept="image/*" required={false}
              error={borrowerErrors.images} onChange={files => setBorrower("images", files.slice(0, 3))} />
            <FilePicker label="Videos (max 3)" files={borrowerForm.videos} multiple accept="video/*" required={false}
              error={borrowerErrors.videos} onChange={files => setBorrower("videos", files.slice(0, 3))} />
          </div>
        </div>

        {/* Transfer Funds (Borrower) */}
        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#06b6d4" }}>Transfer Funds</p>
          <Field label="Transfer Funds (Bank Account)" error={borrowerErrors.transferFundsId}>
            <BankSelect
              value={borrowerForm.transferFundsId}
              loading={banksLoading}
              accounts={bankAccounts}
              error={borrowerErrors.transferFundsId}
              onChange={(id, bank) => {
                setBorrowerForm(f => ({
                  ...f,
                  transferFundsId: id,
                  transferFunds:   bank?.bankName ?? "",
                  transferTo:      id,
                }));
                setBorrowerErrors(err => ({ ...err, transferFundsId: "" }));
              }}
            />
          </Field>
          {selectedBorrowerBank && (
            <div className="rounded-xl px-4 py-3 grid gap-2"
              style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)" }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#06b6d4" }}>Selected Bank</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { label: "Company Name", value: selectedBorrowerBank.companyName   },
                  { label: "Bank Name",    value: selectedBorrowerBank.bankName      },
                  { label: "Account No.", value: selectedBorrowerBank.accountNumber },
                  { label: "IFSC",        value: selectedBorrowerBank.ifscCode      },
                  { label: "Branch",      value: selectedBorrowerBank.branch        },
                  { label: "Account Type",value: selectedBorrowerBank.accountType   },
                ].filter(r => r.value).map(r => (
                  <div key={r.label}>
                    <p style={{ color: "var(--text-muted)" }}>{r.label}</p>
                    <p className="font-bold mt-0.5" style={{ color: "var(--text-primary)", fontFamily: r.label === "IFSC" || r.label === "Account No." ? "monospace" : "inherit" }}>
                      {r.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {submitError && (
          <div className="px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
            {submitError}
          </div>
        )}

        <button type="submit" disabled={submitting}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-base transition-all disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", boxShadow: "0 4px 24px rgba(16,185,129,0.4)" }}>
          {submitting
            ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
            : <PlusIcon />}
          {submitting ? "Saving…" : "Create Borrower Deal"}
        </button>
      </form>
      ) : (
      <form onSubmit={handleSubmit} className="grid gap-4">

        {/* Deal Identity */}
        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#818cf8" }}>Deal Identity</p>
          <Field label="Deal Name" required error={errors.dealName}>
            <div className="flex gap-2">
              <input type="text" placeholder="e.g. SD-20L-1.6ROI-3M-Jul26"
                value={form.dealName} onChange={e => set("dealName", e.target.value)}
                style={{ ...inp(errors.dealName), flex: 1 }} />
              <button type="button"
                title="Auto-generate deal name"
                onClick={() => {
                  const name = generateDealName({
                    globalDealType: form.globalDealType,
                    dealAmount: form.dealAmount,
                    monthlyInterest: form.monthlyInterest,
                    duration: form.duration,
                  });
                  set("dealName", name);
                }}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg,#818cf8,#6366f1)", color: "#fff", border: "1px solid rgba(129,140,248,0.4)", boxShadow: "0 2px 10px rgba(99,102,241,0.3)" }}>
                <SparkleIcon /> Generate
              </button>
            </div>
          </Field>
           <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Deal Type" required>
              <select value={form.dealType} onChange={e => set("dealType", e.target.value)}
                style={{ ...inp(""), appearance: "none", cursor: "pointer" }}>
                {DEAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Sub Type" required>
              <select value={form.dealSubType} onChange={e => set("dealSubType", e.target.value)}
                style={{ ...inp(""), appearance: "none", cursor: "pointer" }}>
                {DEAL_SUB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
            <button
              type="button"
              onClick={() => setShowIdsField(v => !v)}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl transition-all"
              style={{
                background: showIdsField ? "rgba(99,102,241,0.08)" : "var(--input-bg)",
                border: `1px solid ${showIdsField ? "rgba(99,102,241,0.3)" : "var(--border)"}`,
                color: showIdsField ? "#818cf8" : "var(--text-muted)",
              }}
            >
              <TagIcon />
              <span className="text-xs font-bold flex-1 text-left">Restrict to Particular IDs</span>
              {IdsField && IdsField.trim() && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.25)" }}>
                  {IdsField.split(",").filter(s => s.trim()).length} ID{IdsField.split(",").filter(s => s.trim()).length !== 1 ? "s" : ""}
                </span>
              )}
              <span className="transition-transform duration-200 flex-shrink-0"
                style={{ transform: showIdsField ? "rotate(180deg)" : "rotate(0deg)" }}>
                <ChevronDown />
              </span>
            </button>
            {showIdsField && (
              <div className="rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.04)" }}>
                <div className="px-4 py-2.5 flex items-center gap-2"
                  style={{ borderBottom: "1px solid rgba(99,102,241,0.15)" }}>
                  <TagIcon />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#818cf8" }}>Participant IDs</span>
                  <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>Separate with commas</span>
                </div>
                <div className="p-3">
                  <textarea
                    rows={3}
                    placeholder="e.g. USR001, USR002, USR003"
                    value={IdsField ?? ""}
                    onChange={e => setIdsField(e.target.value)}
                    className="w-full rounded-xl text-sm outline-none resize-none font-mono"
                    style={{
                      padding: "10px 14px",
                      background: "var(--input-bg)",
                      border: `1.5px solid ${errors.IdsField ? "#ef4444" : "var(--border)"}`,
                      color: "var(--text-primary)",
                    }}
                  />
                  {errors.IdsField && (
                    <p className="text-xs mt-1 font-medium" style={{ color: "#ef4444" }}>{errors.IdsField}</p>
                  )}
                  {IdsField && IdsField.trim() && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {IdsField.split(",").map(s => s.trim()).filter(Boolean).map(id => (
                        <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-semibold"
                          style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
                          {id}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>

        {/* Financial Details */}
        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#6366f1" }}>Financial Details</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Deal Amount (₹)" required error={errors.dealAmount} hint={numVal(form.dealAmount) > 0 ? fmtINR(numVal(form.dealAmount)) : undefined}>
              <input type="text" inputMode="numeric" placeholder="e.g. 100000"
                value={form.dealAmount} onChange={e => set("dealAmount", toLocale(e.target.value))}
                style={{ ...inp(errors.dealAmount), fontFamily: "'JetBrains Mono', monospace" }} />
            </Field>
            <Field label="Duration (months)" required error={errors.duration}>
              <input type="number" min="1" placeholder="e.g. 5"
                value={form.duration} onChange={e => set("duration", e.target.value)}
                style={inp(errors.duration)} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Min Participation (₹)" required error={errors.minimumParticipation} hint={numVal(form.minimumParticipation) > 0 ? fmtINR(numVal(form.minimumParticipation)) : undefined}>
              <input type="text" inputMode="numeric" placeholder="e.g. 500"
                value={form.minimumParticipation} onChange={e => set("minimumParticipation", toLocale(e.target.value))}
                style={{ ...inp(errors.minimumParticipation), fontFamily: "'JetBrains Mono', monospace" }} />
            </Field>
            <Field label="Max Participation (₹)" required error={errors.maxParticipation} hint={numVal(form.maxParticipation) > 0 ? fmtINR(numVal(form.maxParticipation)) : undefined}>
              <input type="text" inputMode="numeric" placeholder="e.g. 5000"
                value={form.maxParticipation} onChange={e => set("maxParticipation", toLocale(e.target.value))}
                style={{ ...inp(errors.maxParticipation), fontFamily: "'JetBrains Mono', monospace" }} />
            </Field>
          </div>
        </div>

        {/* Interest Rates */}
        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#10b981" }}>Interest Rates (%)</p>
            {form.monthlyInterest && (
              <button type="button"
                onClick={() => {
                  const m = parseFloat(form.monthlyInterest) || 0;
                  set("quartelyInterest", (m * 3).toFixed(2));
                  set("halfInterest",     (m * 6).toFixed(2));
                  set("yearlyInterest",   (m * 12).toFixed(2));
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
                style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>
                <ZapIcon /> Auto-fill from Monthly
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { key: "monthlyInterest",  label: "Monthly",    required: true  },
              { key: "quartelyInterest", label: "Quarterly",  required: false },
              { key: "halfInterest",     label: "Half-Yearly",required: false },
              { key: "yearlyInterest",   label: "Yearly",     required: false },
            ].map(f => (
              <Field key={f.key} label={f.label} required={f.required} error={errors[f.key]}>
                <div className="relative">
                  <input type="text" inputMode="decimal" placeholder="0.0"
                    value={form[f.key]} onChange={e => set(f.key, e.target.value.replace(/[^0-9.]/g, ""))}
                    style={{ ...inp(errors[f.key]), paddingRight: 28 }} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: "var(--text-muted)" }}>%</span>
                </div>
              </Field>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#f59e0b" }}>Key Dates</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Funds Acceptance Start" required error={errors.fundsAcceptanceStartDate}>
              <input type="date" value={form.fundsAcceptanceStartDate} onChange={e => set("fundsAcceptanceStartDate", e.target.value)}
                style={inp(errors.fundsAcceptanceStartDate)} />
            </Field>
            <Field label="Funds Acceptance End" required error={errors.fundsAcceptanceEndDate}>
              <input type="date" value={form.fundsAcceptanceEndDate} onChange={e => set("fundsAcceptanceEndDate", e.target.value)}
                style={inp(errors.fundsAcceptanceEndDate)} />
            </Field>
            <Field label="Loan Active Date" required error={errors.loanActiveDate}>
              <input type="date" value={form.loanActiveDate} onChange={e => set("loanActiveDate", e.target.value)}
                style={inp(errors.loanActiveDate)} />
            </Field>
            <Field label="EMI End Date" required error={errors.emiEndDate}>
              <input type="date" value={form.emiEndDate} onChange={e => set("emiEndDate", e.target.value)}
                style={inp(errors.emiEndDate)} />
            </Field>
          </div>
        </div>

        {/* Transfer Funds */}
        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#06b6d4" }}>Transfer Funds</p>

          {/* Transfer Funds — bank dropdown */}
          <Field label="Transfer Funds (Bank Account)" error={errors.transferFundsId}>
            <BankSelect
              value={form.transferFundsId}
              loading={banksLoading}
              accounts={bankAccounts}
              error={errors.transferFundsId}
              onChange={(id, bank) => {
                setForm(f => ({
                  ...f,
                  transferFundsId: id,
                  transferFunds:   bank?.bankName ?? "",
                  transferTo:      id,
                }));
                setErrors(err => ({ ...err, transferFundsId: "" }));
              }}
            />
          </Field>

          {/* Selected bank preview card */}
          {selectedBank && (
            <div className="rounded-xl px-4 py-3 grid gap-2"
              style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)" }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#06b6d4" }}>Selected Bank</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { label: "Company Name",   value: selectedBank.companyName   },
                  { label: "Bank Name",      value: selectedBank.bankName      },
                  { label: "Account No.",    value: selectedBank.accountNumber },
                  { label: "IFSC",           value: selectedBank.ifscCode      },
                  { label: "Branch",         value: selectedBank.branch        },
                  { label: "Account Type",   value: selectedBank.accountType   },
                ].filter(r => r.value).map(r => (
                  <div key={r.label}>
                    <p style={{ color: "var(--text-muted)" }}>{r.label}</p>
                    <p className="font-bold mt-0.5" style={{ color: "var(--text-primary)", fontFamily: r.label === "IFSC" || r.label === "Account No." ? "monospace" : "inherit" }}>
                      {r.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auto-filled read-only fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                Transfer To <span className="font-normal opacity-60">(bank account ID)</span>
              </label>
              <div className="px-3 py-2.5 rounded-xl text-sm font-mono"
                style={{ background: "var(--input-bg)", border: "1.5px solid var(--border)", minHeight: 42, color: form.transferTo ? "var(--text-primary)" : "var(--text-muted)", opacity: form.transferTo ? 1 : 0.5 }}>
                {form.transferTo || "Auto-filled on bank selection"}
              </div>
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                Transfer Funds <span className="font-normal opacity-60">(bank name)</span>
              </label>
              <div className="px-3 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "var(--input-bg)", border: "1.5px solid var(--border)", minHeight: 42, color: form.transferFunds ? "var(--text-primary)" : "var(--text-muted)", opacity: form.transferFunds ? 1 : 0.5 }}>
                {form.transferFunds || "Auto-filled on bank selection"}
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div className="rounded-2xl p-5 grid gap-4"
            style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.06),rgba(99,102,241,0.04))", border: "1px solid rgba(16,185,129,0.2)" }}>
            <div className="flex items-center gap-2">
              <span style={{ color: "#10b981" }}><TrendUp /></span>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#10b981" }}>Live Preview — per min. participation</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Min Invest",        value: fmtINR(minAmt),      color: "#6366f1" },
                { label: "ROI Earnings",      value: fmtINR(roiEarnings), color: "#10b981" },
                { label: "Total at Maturity", value: fmtINR(totalReturn), color: "#f59e0b" },
                { label: "Duration",          value: tenureNum + " months", color: "#818cf8" },
              ].map(s => (
                <div key={s.label} className="rounded-xl px-3 py-3 text-center"
                  style={{ background: s.color + "0c", border: "1px solid " + s.color + "20" }}>
                  <p className="text-base font-extrabold leading-none"
                    style={{ color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</p>
                  <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)", fontSize: 10 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Deal Health Score ── */}
        <DealHealthGauge {...calcHealthScore({
          dealName:               form.dealName,
          dealAmount:             form.dealAmount,
          monthlyInterest:        form.monthlyInterest,
          duration:               form.duration,
          minimumParticipation:   form.minimumParticipation,
          maxParticipation:       form.maxParticipation,
          fundsAcceptanceStartDate: form.fundsAcceptanceStartDate,
          emiEndDate:             form.emiEndDate,
          globalDealType:         form.globalDealType,
        })} />

        {submitError && (
          <div className="px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
            {submitError}
          </div>
        )}

        <button type="submit" disabled={submitting}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-base transition-all disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#6366f1,#4338ca)", color: "#fff", boxShadow: "0 4px 24px rgba(99,102,241,0.4)" }}>
          {submitting
            ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
            : <PlusIcon />}
          {submitting ? "Saving…" : isEdit ? "Update Deal" : "Create Deal"}
        </button>
      </form>
      )}
    </div>
  );
}
