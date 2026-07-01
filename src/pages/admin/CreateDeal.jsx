import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createOrUpdateDeal, getAdminBankDetails, getAdminDeals } from "../../api/afterlogin-admin";
import { formatINR } from "../../utils/currency";

// ─── Enums ────────────────────────────────────────────────────────────────────
const DEAL_TYPES       = ["NORMAL", "TEST"];
const DEAL_SUB_TYPES   = ["STUDENT"];
const DEAL_TABS = [
  { key: "ASSET", label: "Asset - Fractional Lending" },
  { key: "SDLOT", label: "SD Lot" },
  { key: "GOLD", label: "Gold Lot" },
];
const ASSET_AREA_TYPES = ["PLOT", "FLAT", "ACERE"];

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

function DealTabs({ active, onChange }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3 rounded-2xl p-2"
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
      <label className="w-full rounded-xl px-4 py-3 flex items-center justify-between gap-3 cursor-pointer"
        style={{
          background: "var(--input-bg)",
          border: `1.5px dashed ${error ? "#ef4444" : "var(--border)"}`,
        }}>
        <span className="text-sm font-semibold truncate" style={{ color: names ? "var(--text-primary)" : "var(--text-muted)" }}>
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
  dealName: "", dealValue: "", dealType: "NORMAL",
  monthlyInterest: "", quartelyInterest: "", halfInterest: "", yearlyInterest: "",
  borrowerName: "", projectName: "",
  legalReport: null, valuationReport: null,
  assetValue: "", latitude: "", longitude: "",
  assetArea: "", assetAreaType: "PLOT",
  images: [], videos: [],
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
  const [assetForm, setAssetForm] = useState(EMPTY_ASSET_FORM);

  // Populate form when editDeal is loaded (either from prop or async fetch)
  useEffect(() => {
    if (!editDeal) return;
    if (editDeal.globalDealType === "GOLD" || editDeal.globalDealType === "SDLOT") {
      setActiveTab(editDeal.globalDealType);
    }
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
  }, [editDeal]);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); };
  const setAsset = (k, v) => { setAssetForm(f => ({ ...f, [k]: v })); setAssetErrors(e => ({ ...e, [k]: "" })); };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSubmitted(false);
    setSubmitError("");
    setErrors({});
    setAssetErrors({});
    if (tab === "SDLOT" || tab === "GOLD") set("globalDealType", tab);
  };

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

  const validateAsset = () => {
    const e = {};
    if (!assetForm.dealName.trim())       e.dealName = "Deal name is required";
    if (!assetForm.dealValue)             e.dealValue = "Deal value is required";
    if (!assetForm.monthlyInterest)       e.monthlyInterest = "Monthly ROI is required";
    if (!assetForm.borrowerName.trim())   e.borrowerName = "Borrower name is required";
    if (!assetForm.projectName.trim())    e.projectName = "Project name is required";
    if (!assetForm.legalReport)           e.legalReport = "Legal report is required";
    if (!assetForm.valuationReport)       e.valuationReport = "Valuation report is required";
    if (!assetForm.assetValue)            e.assetValue = "Asset value is required";
    if (!assetForm.latitude)              e.latitude = "Latitude is required";
    if (!assetForm.longitude)             e.longitude = "Longitude is required";
    if (!assetForm.assetArea.trim())      e.assetArea = "Asset area is required";
    if (assetForm.images.length > 3)      e.images = "Upload up to 3 images";
    if (assetForm.videos.length > 3)      e.videos = "Upload up to 3 videos";
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
      const payload = new FormData();
      payload.append("dealName", assetForm.dealName.trim());
      payload.append("dealAmount", numVal(assetForm.dealValue));
      payload.append("dealType", assetForm.dealType);
      payload.append("dealSubType", "FRACTIONAL_LENDING");
      payload.append("globalDealType", "ASSET");
      payload.append("monthlyInterest", parseFloat(assetForm.monthlyInterest) || 0);
      payload.append("quartelyInterest", parseFloat(assetForm.quartelyInterest) || 0);
      payload.append("halfInterest", parseFloat(assetForm.halfInterest) || 0);
      payload.append("yearlyInterest", parseFloat(assetForm.yearlyInterest) || 0);
      payload.append("borrowerName", assetForm.borrowerName.trim());
      payload.append("projectName", assetForm.projectName.trim());
      payload.append("assetValue", numVal(assetForm.assetValue));
      payload.append("latitude", assetForm.latitude);
      payload.append("longitude", assetForm.longitude);
      payload.append("assetArea", assetForm.assetArea.trim());
      payload.append("assetAreaType", assetForm.assetAreaType);
      payload.append("legalReport", assetForm.legalReport);
      payload.append("valuationReport", assetForm.valuationReport);
      assetForm.images.forEach(file => payload.append("images", file));
      assetForm.videos.forEach(file => payload.append("videos", file));

      await createOrUpdateDeal(payload);
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
    setErrors({});
    setAssetErrors({});
    setSubmitted(false);
    setSubmitError("");
  };

  const minAmt    = numVal(form.minimumParticipation);
  const roiNum    = parseFloat(form.monthlyInterest) || 0;
  const tenureNum = parseInt(form.duration, 10) || 0;
  const roiEarnings = minAmt ? Math.round(minAmt * (roiNum / 100) * tenureNum) : 0;
  const totalReturn = minAmt + roiEarnings;
  const showPreview = minAmt > 0 && roiNum > 0 && tenureNum > 0;

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
          {activeTab === "ASSET" ? "Asset Deal Created!" : isEdit ? "Deal Updated!" : "Deal Created!"}
        </h2>
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
          <span className="font-bold" style={{ color: "var(--text-primary)" }}>{activeTab === "ASSET" ? assetForm.dealName : form.dealName}</span> has been saved.
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
            { label: "Deal Value", value: fmtINR(numVal(assetForm.dealValue)), color: "#6366f1" },
            { label: "Monthly ROI", value: assetForm.monthlyInterest ? assetForm.monthlyInterest + "%" : "—", color: "#10b981" },
            { label: "Asset Value", value: fmtINR(numVal(assetForm.assetValue)), color: "#818cf8" },
            { label: "Area Type", value: assetForm.assetAreaType, color: "#f59e0b" },
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
        {activeTab !== "ASSET" && (form.transferTo || form.transferFunds || selectedBank) && (
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
                {[
                  { label: 'Company Name',   value: selectedBank?.companyName   || form.transferTo    || '—' },
                  { label: 'Bank Name',      value: selectedBank?.bankName      || form.transferFunds || '—' },
                  { label: 'Account Number', value: selectedBank?.accountNumber || '—', mono: true },
                  { label: 'IFSC Code',      value: selectedBank?.ifscCode      || '—', mono: true },
                  { label: 'Branch',         value: selectedBank?.branchName    || selectedBank?.branch || '—' },
                  { label: 'Account Type',   value: selectedBank?.accountType   || '—' },
                ].map((r, i) => (
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
          {activeTab === "ASSET" ? "New Asset Fractional Lending Deal" : isEdit ? `Edit ${activeTab === "GOLD" ? "Gold Lot" : "SD Lot"} Deal` : `New ${activeTab === "GOLD" ? "Gold Lot" : "SD Lot"} Deal`}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          {activeTab === "ASSET" ? "Create a fractional lending deal with asset validation reports and media" : isEdit ? "Update the deal details below" : "Create a new investment offering for participants"}
        </p>
      </div>

      <DealTabs active={activeTab} onChange={changeTab} />

      {activeTab === "ASSET" ? (
      <form onSubmit={handleAssetSubmit} className="grid gap-4">
        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#818cf8" }}>Deal Identity</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Deal Name" required error={assetErrors.dealName}>
              <input type="text" placeholder="Enter deal name"
                value={assetForm.dealName} onChange={e => setAsset("dealName", e.target.value)}
                style={inp(assetErrors.dealName)} />
            </Field>
            <Field label="Deal Value (₹)" required error={assetErrors.dealValue} hint={numVal(assetForm.dealValue) > 0 ? fmtINR(numVal(assetForm.dealValue)) : undefined}>
              <input type="text" inputMode="numeric" placeholder="e.g. 1000000"
                value={assetForm.dealValue} onChange={e => setAsset("dealValue", toLocale(e.target.value))}
                style={{ ...inp(assetErrors.dealValue), fontFamily: "'JetBrains Mono', monospace" }} />
            </Field>
          </div>
          <Field label="Deal Type" required>
            <PillSelect value={assetForm.dealType} onChange={v => setAsset("dealType", v)} options={DEAL_TYPES} accent="#818cf8" />
          </Field>
        </div>

        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#10b981" }}>ROI (%)</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { key: "monthlyInterest", label: "Monthly", required: true },
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
      ) : (
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
