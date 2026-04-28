import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createOrUpdateDeal, getAdminBankDetails, getAdminDeals } from "../api/afterlogin-admin";

// ─── Enums ────────────────────────────────────────────────────────────────────
const DEAL_TYPES       = ["NORMAL", "TEST"];
const DEAL_SUB_TYPES   = ["STUDENT"];
const GLOBAL_DEAL_TYPES= ["SDLOT", "GOLD", "REALGOLD"];

// ─── Icons ────────────────────────────────────────────────────────────────────
const ArrowLeft   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const CheckCircle = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const PlusIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrendUp     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

function fmtINR(n) {
  if (!n) return "";
  const num = parseInt(String(n).replace(/,/g, ""), 10);
  if (isNaN(num)) return "";
  if (num >= 10000000) return "₹" + (num / 10000000).toFixed(2) + "Cr";
  if (num >= 100000)   return "₹" + (num / 100000).toFixed(2) + "L";
  if (num >= 1000)     return "₹" + (num / 1000).toFixed(0) + "K";
  return "₹" + num;
}
function numVal(s) { return parseInt(String(s || "").replace(/,/g, ""), 10) || 0; }
function toLocale(s) {
  const n = s.replace(/\D/g, "");
  return n ? parseInt(n, 10).toLocaleString("en-IN") : "";
}
// Convert YYYY-MM-DD → DD/MM/YYYY for display, keep YYYY-MM-DD for API
function toApiDate(d) { return d; } // already YYYY-MM-DD from <input type="date">

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
    <div className="grid gap-1.5">
      <label className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
        {label}{required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs" style={{ color: "var(--text-muted)", opacity: 0.65 }}>{hint}</p>}
      {error && <p className="text-xs font-medium" style={{ color: "#ef4444" }}>{error}</p>}
    </div>
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

export default function CreateDeal({ editDeal: editDealProp = null }) {
  const navigate   = useNavigate();
  const { id: editId } = useParams();          // present when route is /admin/create-deal/:id

  const [editDeal,   setEditDeal]   = useState(editDealProp);
  const [dealLoading, setDealLoading] = useState(!!editId && !editDealProp);
  const isEdit     = !!(editDeal || editId);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors]   = useState({});

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

  // Populate form when editDeal is loaded (either from prop or async fetch)
  useEffect(() => {
    if (!editDeal) return;
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
      fundsAcceptanceStartDate:  editDeal.fundsAcceptanceStartDate  ?? "",
      fundsAcceptanceEndDate:    editDeal.fundsAcceptanceEndDate    ?? "",
      loanActiveDate:            editDeal.loanActiveDate            ?? "",
      emiEndDate:                editDeal.emiEndDate                ?? "",
      transferFundsId:           editDeal.transferFundsId           ?? "",
      transferFunds:             editDeal.transferFunds             ?? "",
      transferTo:                editDeal.transferTo                ?? "",
    });
  }, [editDeal]);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); };

  // Derive selected bank object from transferFundsId
  const selectedBank = bankAccounts.find(b => String(b.id ?? b.accountNumber) === form.transferFundsId) ?? null;

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

  const resetForm = () => { setForm(EMPTY_FORM); setErrors({}); setSubmitted(false); setSubmitError(""); };

  const minAmt    = numVal(form.minimumParticipation);
  const roiNum    = parseFloat(form.monthlyInterest) || 0;
  const tenureNum = parseInt(form.duration, 10) || 0;
  const roiEarnings = minAmt ? Math.round(minAmt * (roiNum / 100) * tenureNum) : 0;
  const totalReturn = minAmt + roiEarnings;
  const showPreview = minAmt > 0 && roiNum > 0 && tenureNum > 0;

  if (dealLoading) return (
    <div className="max-w-2xl mx-auto grid gap-5">
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
    <div className="max-w-xl mx-auto py-12 flex flex-col items-center gap-6 text-center">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05))", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}>
        <CheckCircle />
      </div>
      <div>
        <h2 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
          {isEdit ? "Deal Updated!" : "Deal Created!"}
        </h2>
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
          <span className="font-bold" style={{ color: "var(--text-primary)" }}>{form.dealName}</span> has been saved.
        </p>
      </div>
      <div className="w-full rounded-2xl overflow-hidden"
        style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
        <div className="px-5 py-3 flex items-center gap-2"
          style={{ borderBottom: "1px solid var(--border)", background: "rgba(99,102,241,0.04)" }}>
          <TrendUp />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6366f1" }}>Deal Summary</span>
        </div>
        <div className="p-5 grid grid-cols-2 gap-3">
          {[
            { label: "Deal Amount",    value: fmtINR(numVal(form.dealAmount)),          color: "#6366f1" },
            { label: "Monthly ROI",    value: form.monthlyInterest + "%",               color: "#10b981" },
            { label: "Duration",       value: form.duration + " months",                color: "#818cf8" },
            { label: "Type",           value: form.dealType + " / " + form.globalDealType, color: "#ec4899" },
            { label: "Min / Max",      value: fmtINR(numVal(form.minimumParticipation)) + " – " + fmtINR(numVal(form.maxParticipation)), color: "#f59e0b" },
            { label: "Loan Active",    value: form.loanActiveDate,                      color: "#06b6d4" },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-4 py-3"
              style={{ background: s.color + "0a", border: "1px solid " + s.color + "18" }}>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</p>
              <p className="text-sm font-extrabold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
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
          {isEdit ? "Edit SD Lot Deal" : "New SD Lot Deal"}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          {isEdit ? "Update the deal details below" : "Create a new investment offering for participants"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">

        {/* Deal Identity */}
        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#818cf8" }}>Deal Identity</p>
          <Field label="Deal Name" required error={errors.dealName}>
            <input type="text" placeholder="e.g. SD-2S-20L-1.6ROI-20April2026"
              value={form.dealName} onChange={e => set("dealName", e.target.value)}
              style={inp(errors.dealName)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
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
            <Field label="Global Deal Type" required>
              <select value={form.globalDealType} onChange={e => set("globalDealType", e.target.value)}
                style={{ ...inp(""), appearance: "none", cursor: "pointer" }}>
                {GLOBAL_DEAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
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
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#10b981" }}>Interest Rates (%)</p>
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
            {banksLoading ? (
              <div className="flex items-center gap-2 px-3 py-3 rounded-xl"
                style={{ background: "var(--input-bg)", border: "1.5px solid var(--border)" }}>
                <svg className="w-4 h-4 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                </svg>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>Loading bank accounts…</span>
              </div>
            ) : (
              <select
                value={form.transferFundsId}
                onChange={e => {
                  const id   = e.target.value;
                  const bank = bankAccounts.find(b => String(b.id ?? b.accountNumber) === id);
                  setForm(f => ({
                    ...f,
                    transferFundsId: id,
                    transferFunds:   bank?.bankName ?? "",
                    transferTo:      id,
                  }));
                  setErrors(err => ({ ...err, transferFundsId: "" }));
                }}
                style={{ ...inp(errors.transferFundsId), appearance: "none", cursor: "pointer" }}>
                <option value="">— Select bank account —</option>
                {bankAccounts.map(b => {
                  const key   = String(b.id ?? b.accountNumber);
                  const label = [b.companyName, b.bankName, b.accountNumber, b.ifscCode].filter(Boolean).join(' · ');
                  return <option key={key} value={key}>{label}</option>;
                })}
              </select>
            )}
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
    </div>
  );
}
