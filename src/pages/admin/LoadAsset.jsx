import { useState } from 'react';
import { saveAssetBasedInfo, uploadSaleDeedDocument } from '../../api/afterlogin-admin';

// ─── Constants ────────────────────────────────────────────────────────────────
const REGISTRATION_TYPES = ['SALEDEED', 'AGPA'];
const ASSET_TYPES        = ['PLOT', 'FLAT', 'AREA'];
const ACCESS_TYPES       = ['En Access', 'Separate', 'Shared'];
const ASSET_UNITS        = [
  { value: 'sqft',   label: 'Sq. Feet'  },
  { value: 'sqyard', label: 'Sq. Yards' },
  { value: 'acres',  label: 'Acres'     },
  { value: 'guntas', label: "Gunta's"   },
];

const EMPTY = {
  borrowerName: '', projectName: '', documentNumber: '',
  dateOfExecution: '', typeOfRegistration: '',
  documentValue: '', actualAssetValue: '', takenAssetValue: '',
  assetType: 'PLOT', plotNumber: '', 
  // accessType: 'En Access',
  assetUnit: '', assetArea: '', surveyNo: '', flatNumber: '',
  saleDeedDoc: null, ownerName: '', onLenderName: false,
};

const toNumber = (value) => Number(String(value ?? '').replace(/,/g, '')) || 0;

// ─── Shared style helpers ─────────────────────────────────────────────────────
const inputStyle = (err) => ({
  background: 'var(--input-bg)',
  border: `1.5px solid ${err ? '#ef4444' : 'var(--border)'}`,
  color: 'var(--text-primary)',
  borderRadius: 10,
  padding: '10px 13px',
  fontSize: 13,
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
});

// ─── Icons ────────────────────────────────────────────────────────────────────
const CheckCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

// ─── Pill selector ────────────────────────────────────────────────────────────
function PillSelect({ value, onChange, options, accent = '#a855f7' }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const v      = typeof opt === 'string' ? opt : opt.value;
        const label  = typeof opt === 'string' ? opt : opt.label;
        const active = value === v;
        return (
          <button key={v} type="button" onClick={() => onChange(v)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
            style={active ? {
              background: `linear-gradient(135deg,${accent},${accent}cc)`,
              color: '#fff', border: `1px solid ${accent}`,
              boxShadow: `0 2px 10px ${accent}40`,
            } : {
              background: 'var(--input-bg)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div className="grid gap-1.5">
      <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      {children}
      {error && <p className="text-xs font-medium" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({ accent = '#a855f7', icon, title, children }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2.5 px-5 py-3.5"
        style={{ borderBottom: '1px solid var(--border)', background: `${accent}08` }}>
        <div className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>{title}</span>
      </div>
      <div className="p-5 grid gap-4 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LoadAsset() {
  const [form,      setForm]      = useState(EMPTY);
  const [errors,    setErrors]    = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => {
      if (k !== 'assetType') return { ...e, [k]: '' };
      return { ...e, assetType: '', plotNumber: '', flatNumber: '', assetArea: '' };
    });
  };

  const validate = () => {
    const e = {};
    const isPlot = form.assetType === 'PLOT';
    const isFlat = form.assetType === 'FLAT';
    const isArea = form.assetType === 'AREA';

    if (!form.borrowerName.trim())     e.borrowerName     = 'Required';
    if (!form.projectName.trim())      e.projectName      = 'Required';
    if (!form.documentNumber.trim())   e.documentNumber   = 'Required';
    if (!form.dateOfExecution)         e.dateOfExecution  = 'Required';
    if (!form.typeOfRegistration)      e.typeOfRegistration = 'Required';
    if (!form.documentValue)           e.documentValue    = 'Required';
    if (!form.actualAssetValue)        e.actualAssetValue = 'Required';
    if (!form.takenAssetValue)         e.takenAssetValue  = 'Required';
    if (!form.assetType)               e.assetType        = 'Required';
    if (isPlot && !form.plotNumber.trim()) e.plotNumber = 'Required';
    if (isFlat && !form.flatNumber.trim()) e.flatNumber = 'Required';
    if (isArea && !form.assetArea.trim())  e.assetArea  = 'Required';
    if (!form.surveyNo.trim())         e.surveyNo         = 'Required';
    if (!form.saleDeedDoc)             e.saleDeedDoc      = 'Required';
    if (!form.ownerName.trim())        e.ownerName        = 'Required';
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError('');
    try {
      const assetNumber = form.assetType === 'FLAT'
        ? form.flatNumber.trim()
        : form.assetType === 'AREA'
          ? form.assetArea.trim()
          : form.plotNumber.trim();

      const saveResponse = await saveAssetBasedInfo({
        actualAssetValue: toNumber(form.actualAssetValue),
        assetType: form.assetType,
        borrowerName: form.borrowerName.trim(),
        dateOfExecution: form.dateOfExecution,
        documentNumber: toNumber(form.documentNumber),
        documentValue: toNumber(form.documentValue),
        id: form.id,
        ownerName: form.ownerName.trim(),
        plotNumber: assetNumber,
        projectName: form.projectName.trim(),
        surveyNumber: form.surveyNo.trim(),
        takenAssetValue: toNumber(form.takenAssetValue),
        typeOfRegistration: form.typeOfRegistration,
      });

      const assetId = saveResponse?.id ?? saveResponse?.assetId ?? saveResponse?.data?.id;
      if (!assetId) throw new Error('Asset saved, but no asset id was returned.');

      await uploadSaleDeedDocument({ assetId, file: form.saleDeedDoc });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message ?? 'Failed to load asset. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => { setForm(EMPTY); setErrors({}); setSubmitted(false); setSubmitError(''); };

  const unitLabel = ASSET_UNITS.find(u => u.value === form.assetUnit)?.label ?? 'Area';

  // ── Success ──
  if (submitted) return (
    <div className="max-w-2xl mx-auto grid gap-5">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Load Asset</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Register a new asset</p>
      </div>

      <div className="rounded-2xl p-8 flex flex-col items-center gap-5 text-center"
        style={{ background: 'var(--surface-card)', border: '1px solid rgba(16,185,129,0.3)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
          <CheckCircle />
        </div>
        <div>
          <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>Asset Loaded Successfully</h2>
          <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{form.borrowerName}</span>
            {' '}— {form.projectName}
          </p>
        </div>

        {/* Summary strip */}
        <div className="w-full rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}>
          <div className="grid grid-cols-3 divide-x" style={{ borderBottom: '1px solid var(--border)' }}>
            {[
              { label: 'Doc Value',    value: '₹' + Number(form.documentValue).toLocaleString('en-IN'),    color: '#818cf8' },
              { label: 'Asset Value',  value: '₹' + Number(form.actualAssetValue).toLocaleString('en-IN'), color: '#10b981' },
              { label: 'Taken Value',  value: '₹' + Number(form.takenAssetValue).toLocaleString('en-IN'),  color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} className="px-4 py-3 text-center" style={{ background: 'var(--input-bg)' }}>
                <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                <p className="text-sm font-extrabold" style={{ color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 divide-x">
            {[
              { label: 'Plot',    value: form.plotNumber },
              { label: 'Area',    value: `${form.assetArea} ${unitLabel}` },
              { label: 'Survey',  value: form.surveyNo },
            ].map(s => (
              <div key={s.label} className="px-4 py-3 text-center">
                <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 w-full">
          <button onClick={reset}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', boxShadow: '0 4px 16px rgba(168,85,247,0.4)' }}>
            Load Another Asset
          </button>
        </div>
      </div>
    </div>
  );

  // ── Form ──
  return (
    <div className="max-w-2xl mx-auto grid gap-5">

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Load Asset</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Register a new asset with borrower and document details</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid gap-4">

        {/* ── Borrower & Document ── */}
        <Section accent="#818cf8" title="Borrower & Document Details">
          <Field label="Borrower Name" required error={errors.borrowerName}>
            <input type="text" placeholder="Enter borrower name"
              value={form.borrowerName} onChange={e => set('borrowerName', e.target.value)}
              style={inputStyle(errors.borrowerName)} />
          </Field>

          <Field label="Project Name" required error={errors.projectName}>
            <input type="text" placeholder="Enter project name"
              value={form.projectName} onChange={e => set('projectName', e.target.value)}
              style={inputStyle(errors.projectName)} />
          </Field>

          <Field label="Document Number" required error={errors.documentNumber}>
            <input type="number" min="0" placeholder="0"
              value={form.documentNumber} onChange={e => set('documentNumber', e.target.value)}
              style={inputStyle(errors.documentNumber)} />
          </Field>

          <Field label="Date of Execution" required error={errors.dateOfExecution}>
            <input type="date"
              value={form.dateOfExecution} onChange={e => set('dateOfExecution', e.target.value)}
              style={inputStyle(errors.dateOfExecution)} />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Type of Registration" required error={errors.typeOfRegistration}>
              <PillSelect
                value={form.typeOfRegistration}
                onChange={v => set('typeOfRegistration', v)}
                options={REGISTRATION_TYPES}
                accent="#818cf8"
              />
            </Field>
          </div>
        </Section>

        {/* ── Valuation ── */}
        <Section accent="#10b981" title="Valuation">
          <Field label="Document Value (Govt) (₹)" required error={errors.documentValue}>
            <input type="number" min="0" placeholder="0"
              value={form.documentValue} onChange={e => set('documentValue', e.target.value)}
              style={inputStyle(errors.documentValue)} />
          </Field>

          <Field label="Actual Asset Value (Market) (₹)" required error={errors.actualAssetValue}>
            <input type="number" min="0" placeholder="0"
              value={form.actualAssetValue} onChange={e => set('actualAssetValue', e.target.value)}
              style={inputStyle(errors.actualAssetValue)} />
          </Field>

          <div className="sm:col-span-2">
            <Field label="what Value We Given (₹)" required error={errors.takenAssetValue}>
              <input type="number" min="0" placeholder="0"
                value={form.takenAssetValue} onChange={e => set('takenAssetValue', e.target.value)}
                style={inputStyle(errors.takenAssetValue)} />
            </Field>
          </div>
        </Section>

        {/* ── Document Details ── */}
        <Section accent="#06b6d4" title="Document Details">
          <Field label="Sale Deed Doc" required error={errors.saleDeedDoc}>
            <label
              className="w-full rounded-xl px-4 py-3 flex items-center justify-between gap-3 cursor-pointer"
              style={{
                background: 'var(--input-bg)',
                border: `1.5px dashed ${errors.saleDeedDoc ? '#ef4444' : 'var(--border)'}`,
              }}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {form.saleDeedDoc ? form.saleDeedDoc.name : 'Upload sale deed document'}
                </p>
                {/* <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  PDF, JPG, JPEG, PNG
                </p> */}
              </div>
              <span
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{
                  background: 'rgba(6,182,212,0.15)',
                  color: '#0891b2',
                  border: '1px solid rgba(6,182,212,0.35)',
                }}
              >
                Choose File
              </span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => set('saleDeedDoc', e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
          </Field>

          <Field label="Owner Name" required error={errors.ownerName}>
            <input
              type="text"
              placeholder="Enter owner name"
              value={form.ownerName}
              onChange={e => set('ownerName', e.target.value)}
              style={inputStyle(errors.ownerName)}
            />
          </Field>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              <input
                type="checkbox"
                checked={form.onLenderName}
                onChange={e => set('onLenderName', e.target.checked)}
              />
              <span>it is on lender name</span>
            </label>
          </div>
        </Section>

        {/* ── Plot & Area ── */}
        <Section accent="#f59e0b" title="Plot & Area Details">
          <div className="sm:col-span-2">
            <Field label="Asset Type" required error={errors.assetType}>
              <PillSelect
                value={form.assetType}
                onChange={v => set('assetType', v)}
                options={ASSET_TYPES}
                accent="#f59e0b"
              />
            </Field>
          </div>

          {/* <Field label="Plot Number" required error={errors.plotNumber}>
            <input type="text" placeholder="e.g. P-42"
              value={form.plotNumber} onChange={e => set('plotNumber', e.target.value)}
              style={inputStyle(errors.plotNumber)} />
          </Field> */}

          <Field label="Survey No." required error={errors.surveyNo}>
            <input type="text" placeholder="Enter survey number"
              value={form.surveyNo} onChange={e => set('surveyNo', e.target.value)}
              style={inputStyle(errors.surveyNo)} />
          </Field>

          <Field label="Area" required={form.assetType === 'AREA'} error={errors.assetArea}>
            <input type="text" placeholder="Enter area"
              value={form.assetArea} onChange={e => set('assetArea', e.target.value)}
              style={inputStyle(errors.assetArea)} />
          </Field>

          <Field label="Plots" required={form.assetType === 'PLOT'} error={errors.plotNumber}>
            <input type="text" placeholder="Enter Plot"
              value={form.plotNumber} onChange={e => set('plotNumber', e.target.value)}
              style={inputStyle(errors.plotNumber)} />
          </Field>

          <Field label="Flat" required={form.assetType === 'FLAT'} error={errors.flatNumber}>
            <input type="text" placeholder="Enter Flat"
              value={form.flatNumber} onChange={e => set('flatNumber', e.target.value)}
              style={inputStyle(errors.flatNumber)} />
          </Field>

          {/* <div className="sm:col-span-2">
            <Field label="Access Type">
              <PillSelect
                value={form.accessType}
                onChange={v => set('accessType', v)}
                options={ACCESS_TYPES}
                accent="#f59e0b"
              />
            </Field>
          </div> */}

          {/* <div className="sm:col-span-2">
            <Field label="Asset Type (Unit)" required error={errors.assetUnit}>
              <PillSelect
                value={form.assetUnit}
                onChange={v => set('assetUnit', v)}
                options={ASSET_UNITS}
                accent="#f59e0b"
              />
            </Field>
          </div> */}

          {/* <div className="sm:col-span-2">
            <Field label={`Area${form.assetUnit ? ` (${unitLabel})` : ''}`} required error={errors.assetArea}>
              <input type="number" min="0" placeholder="Enter area"
                value={form.assetArea} onChange={e => set('assetArea', e.target.value)}
                style={inputStyle(errors.assetArea)} />
            </Field>
          </div> */}
        </Section>

        {/* ── Actions ── */}
        {submitError && (
          <div className="rounded-xl px-4 py-3 text-sm font-semibold"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}>
            {submitError}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={reset} disabled={submitting}
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80"
            style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Reset
          </button>
          <button type="submit" disabled={submitting}
            className="px-7 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', boxShadow: '0 4px 14px rgba(168,85,247,0.4)', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Loading Asset...' : 'Load Asset'}
          </button>
        </div>

      </form>
    </div>
  );
}
