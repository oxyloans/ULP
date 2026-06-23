import { useState, useRef, useEffect } from 'react';
import { getAllLoadAssetDetails, saveAssetBasedInfo, getAllBorrowers } from '../../api/afterlogin-admin';

const MOCK_USERS = [
  { id: 'U001', name: 'Arjun Mehta',    phone: '98765 43210' },
  { id: 'U002', name: 'Deepa Nair',     phone: '91234 56789' },
  { id: 'U003', name: 'Kiran Rao',      phone: '87654 32109' },
  { id: 'U004', name: 'Sunita Verma',   phone: '76543 21098' },
  { id: 'U005', name: 'Manoj Tiwari',   phone: '65432 10987' },
  { id: 'U006', name: 'Lakshmi Iyer',   phone: '54321 09876' },
  { id: 'U007', name: 'Rahul Gupta',    phone: '43210 98765' },
  { id: 'U008', name: 'Pooja Desai',    phone: '32109 87654' },
];

const REGISTRATION_TYPES = ['SALEDEED', 'AGPA'];
const ASSET_TYPES        = ['PLOT', 'FLAT', 'AREA'];

const fmt = n => Number.isFinite(Number(n)) ? '₹' + Number(n).toLocaleString('en-IN') : '—';
const formatDate = value => {
  if (!value) return '—';
  const date = typeof value === 'number' ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
};

const toNumber = v => Number(String(v ?? '').replace(/,/g, '')) || 0;

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

// ─── Shared sub-components ────────────────────────────────────────────────────
function CloseBtn({ onClick }) {
  return (
    <button onClick={onClick}
      className="w-8 h-8 rounded-xl flex items-center justify-center"
      style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  );
}

function ValueChip({ label, value, color }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-base font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

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

function PillSelect({ value, onChange, options, accent = '#a855f7' }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const v     = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
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

function SectionBox({ accent = '#a855f7', title, children }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2.5 px-5 py-3"
        style={{ borderBottom: '1px solid var(--border)', background: `${accent}08` }}>
        <div className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>{title}</span>
      </div>
      <div className="p-4 grid gap-3 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Edit Asset Modal
══════════════════════════════════════════════════════════════════════════════ */
function EditAssetModal({ asset, borrowers, borrowersLoading, onClose, onSaved }) {
  // Map API response fields → form fields
  const initForm = (a) => ({
    id:               a.id ?? '',
    borrowerId:       a.borrowerId ?? '',
    borrowerName:     a.borrowerName ?? '',
    projectName:      a.projectName ?? '',
    documentNumber:   String(a.documentNumber ?? ''),
    dateOfExecution:  a.dateOfExecution
      ? (typeof a.dateOfExecution === 'number'
          ? new Date(a.dateOfExecution).toISOString().split('T')[0]
          : String(a.dateOfExecution).split('T')[0])
      : '',
    typeOfRegistration: a.typeOfRegistration ?? '',
    documentValue:    String(a.documentValue ?? ''),
    actualAssetValue: String(a.actualAssetValue ?? ''),
    takenAssetValue:  String(a.takenAssetValue ?? ''),
    assetType:        a.assetType ?? 'PLOT',
    plotNumber:       a.plotNumber ?? '',
    flatNumber:       a.flatNumber ?? '',
    assetArea:        a.area ?? '',
    surveyNo:         a.surveyNumber ?? '',
    size:             a.size ?? '',
    othersComments:   a.othersComments ?? '',
    ownerName:        a.ownerName ?? '',
    onLenderName:     a.onLenderName ?? false,
  });

  const [form,        setForm]        = useState(() => initForm(asset));
  const [errors,      setErrors]      = useState({});
  const [saving,      setSaving]      = useState(false);
  const [saveErr,     setSaveErr]     = useState('');

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const handleBorrowerSelect = (borrowerId) => {
    const b = borrowers.find(x => x.id === borrowerId);
    setForm(f => ({
      ...f,
      borrowerId,
      borrowerName: b?.borrowerName ?? f.borrowerName,
      projectName:  b?.projectName  ?? f.projectName,
    }));
    setErrors(e => ({ ...e, borrowerId: '', borrowerName: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.projectName.trim())    e.projectName    = 'Required';
    if (!form.documentNumber.trim()) e.documentNumber = 'Required';
    if (!form.dateOfExecution)       e.dateOfExecution = 'Required';
    if (!form.typeOfRegistration)    e.typeOfRegistration = 'Required';
    if (!form.documentValue)         e.documentValue  = 'Required';
    if (!form.actualAssetValue)      e.actualAssetValue = 'Required';
    if (!form.takenAssetValue)       e.takenAssetValue = 'Required';
    if (!form.surveyNo.trim())       e.surveyNo       = 'Required';
    if (!form.ownerName.trim())      e.ownerName      = 'Required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true); setSaveErr('');
    try {
      await saveAssetBasedInfo({
        id:               form.id,
        borrowerName:     form.borrowerName.trim(),
        projectName:      form.projectName.trim(),
        documentNumber:   toNumber(form.documentNumber),
        dateOfExecution:  form.dateOfExecution,
        typeOfRegistration: form.typeOfRegistration,
        documentValue:    toNumber(form.documentValue),
        actualAssetValue: toNumber(form.actualAssetValue),
        takenAssetValue:  toNumber(form.takenAssetValue),
        assetType:        form.assetType,
        plotNumber:       form.plotNumber.trim(),
        flatNumber:       form.flatNumber.trim(),
        area:             form.assetArea.trim(),
        surveyNumber:     form.surveyNo.trim(),
        size:             form.size.trim(),
        othersComments:   form.othersComments.trim(),
        ownerName:        form.ownerName.trim(),
        onLenderName:     form.onLenderName,
      });
      onSaved();
      onClose();
    } catch (err) {
      setSaveErr(err.message ?? 'Failed to update asset.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--surface-card)', border: '1px solid rgba(168,85,247,0.3)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(168,85,247,0.04)' }}>
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: '#c084fc' }}>Edit Asset</p>
            <h3 className="text-sm font-black mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {asset.id}
            </h3>
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} noValidate className="overflow-y-auto flex-1 p-5 grid gap-4">

          {/* Borrower & Document */}
          <SectionBox accent="#818cf8" title="Borrower & Document Details">
            <div className="sm:col-span-2">
              <Field label="Borrower" error={errors.borrowerId}>
                <div className="relative">
                  <select
                    value={form.borrowerId}
                    onChange={e => handleBorrowerSelect(e.target.value)}
                    disabled={borrowersLoading}
                    style={{ ...inputStyle(errors.borrowerId), appearance: 'none', cursor: 'pointer', paddingRight: 36 }}>
                    <option value="">{borrowersLoading ? 'Loading…' : '— Select borrower —'}</option>
                    {borrowers.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.borrowerName}{b.projectName ? ` — ${b.projectName}` : ''}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </div>
                {form.borrowerName && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit"
                    style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.25)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 flex-shrink-0">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span className="text-xs font-bold" style={{ color: '#818cf8' }}>{form.borrowerName}</span>
                  </div>
                )}
              </Field>
            </div>

            <Field label="Project Name" required error={errors.projectName}>
              <input type="text" value={form.projectName} onChange={e => set('projectName', e.target.value)}
                style={inputStyle(errors.projectName)} />
            </Field>

            <Field label="Document Number" required error={errors.documentNumber}>
              <input type="number" min="0" value={form.documentNumber} onChange={e => set('documentNumber', e.target.value)}
                style={inputStyle(errors.documentNumber)} />
            </Field>

            <Field label="Date of Execution" required error={errors.dateOfExecution}>
              <input type="date" value={form.dateOfExecution} onChange={e => set('dateOfExecution', e.target.value)}
                style={inputStyle(errors.dateOfExecution)} />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Type of Registration" required error={errors.typeOfRegistration}>
                <PillSelect value={form.typeOfRegistration} onChange={v => set('typeOfRegistration', v)}
                  options={REGISTRATION_TYPES} accent="#818cf8" />
              </Field>
            </div>
          </SectionBox>

          {/* Valuation */}
          <SectionBox accent="#10b981" title="Valuation">
            <Field label="Document Value (₹)" required error={errors.documentValue}>
              <input type="number" min="0" value={form.documentValue} onChange={e => set('documentValue', e.target.value)}
                style={inputStyle(errors.documentValue)} />
            </Field>
            <Field label="Actual Asset Value (₹)" required error={errors.actualAssetValue}>
              <input type="number" min="0" value={form.actualAssetValue} onChange={e => set('actualAssetValue', e.target.value)}
                style={inputStyle(errors.actualAssetValue)} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Value We Given (₹)" required error={errors.takenAssetValue}>
                <input type="number" min="0" value={form.takenAssetValue} onChange={e => set('takenAssetValue', e.target.value)}
                  style={inputStyle(errors.takenAssetValue)} />
              </Field>
            </div>
          </SectionBox>

          {/* Document Details */}
          <SectionBox accent="#06b6d4" title="Document Details">
            <Field label="Owner Name" required error={errors.ownerName}>
              <input type="text" value={form.ownerName} onChange={e => set('ownerName', e.target.value)}
                style={inputStyle(errors.ownerName)} />
            </Field>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="edit-lender-name" checked={form.onLenderName}
                onChange={e => set('onLenderName', e.target.checked)} />
              <label htmlFor="edit-lender-name" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                It is on lender name
              </label>
            </div>
          </SectionBox>

          {/* Plot & Area */}
          <SectionBox accent="#f59e0b" title="Plot & Area Details">
            <div className="sm:col-span-2">
              <Field label="Asset Type" error={errors.assetType}>
                <PillSelect value={form.assetType} onChange={v => set('assetType', v)}
                  options={ASSET_TYPES} accent="#f59e0b" />
              </Field>
            </div>

            <Field label="Survey No." required error={errors.surveyNo}>
              <input type="text" value={form.surveyNo} onChange={e => set('surveyNo', e.target.value)}
                style={inputStyle(errors.surveyNo)} />
            </Field>

            <Field label="Plot Number" error={errors.plotNumber}>
              <input type="text" placeholder="Enter plot number" value={form.plotNumber}
                onChange={e => set('plotNumber', e.target.value)} style={inputStyle(errors.plotNumber)} />
            </Field>

            <Field label="Flat Number" error={errors.flatNumber}>
              <input type="text" placeholder="Enter flat number" value={form.flatNumber}
                onChange={e => set('flatNumber', e.target.value)} style={inputStyle(errors.flatNumber)} />
            </Field>

            <Field label="Area" error={errors.assetArea}>
              <input type="text" placeholder="Enter area" value={form.assetArea}
                onChange={e => set('assetArea', e.target.value)} style={inputStyle(errors.assetArea)} />
            </Field>

            <Field label="Size" error={errors.size}>
              <input type="text" placeholder="e.g. 1200 sqft" value={form.size}
                onChange={e => set('size', e.target.value)} style={inputStyle(errors.size)} />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Others / Comments" error={errors.othersComments}>
                <textarea rows={3} placeholder="Any additional notes…" value={form.othersComments}
                  onChange={e => set('othersComments', e.target.value)}
                  style={{ ...inputStyle(errors.othersComments), resize: 'vertical', minHeight: 72 }} />
              </Field>
            </div>
          </SectionBox>

          {saveErr && (
            <div className="rounded-xl px-4 py-3 text-sm font-semibold"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}>
              {saveErr}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 justify-end flex-shrink-0"
          style={{ borderTop: '1px solid var(--border)', background: 'rgba(168,85,247,0.02)' }}>
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Cancel
          </button>
          <button type="button" disabled={saving} onClick={handleSubmit}
            className="px-7 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', boxShadow: '0 4px 14px rgba(168,85,247,0.4)' }}>
            {saving && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
              </svg>
            )}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Detail modal
══════════════════════════════════════════════════════════════════════════════ */
function DetailModal({ asset: a, lenders, onClose }) {
  const saleDeeds = Array.isArray(a.saleDeedDocumentsDto) ? a.saleDeedDocumentsDto : [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: 'var(--card-bg)', border: '1px solid rgba(168,85,247,0.3)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: '#c084fc' }}>Asset Detail</p>
            <h3 className="text-base font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{a.id}</h3>
          </div>
          <CloseBtn onClick={onClose} />
        </div>
        <div className="p-6 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {[
            ['Borrower Name',       a.borrowerName],
            ['Project Name',        a.projectName],
            ['Document Number',     a.documentNumber],
            ['Date of Execution',   formatDate(a.dateOfExecution)],
            ['Type of Registration',a.typeOfRegistration],
            ['Document Value',      fmt(a.documentValue)],
            ['Actual Asset Value',  fmt(a.actualAssetValue)],
            ['Taken Asset Value',   fmt(a.takenAssetValue)],
            ['Asset Type',          a.assetType],
            ['Plot Number',         a.plotNumber],
            ['Flat Number',         a.flatNumber],
            ['Area',                a.area],
            ['Size',                a.size],
            ['Survey No.',          a.surveyNumber],
            ['Owner Name',          a.ownerName],
            ['Others / Comments',   a.othersComments],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-muted)' }}>{k}</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{v || '—'}</p>
            </div>
          ))}
          {saleDeeds.length > 0 && (
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Sale Deed Documents</p>
              <div className="flex flex-col gap-2">
                {saleDeeds.map(doc => (
                  <a key={doc.id ?? doc.documentPath} href={doc.documentPath} download={doc.documentName}
                    className="px-3 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                    style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc' }}>
                    {doc.documentName ?? 'Download sale deed'}
                  </a>
                ))}
              </div>
            </div>
          )}
          {lenders.length > 0 && (
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Lenders</p>
              <div className="flex flex-col gap-2">
                {lenders.map((l, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.2)' }}>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{l.user.name}</span>
                    <span className="text-sm font-bold" style={{ color: '#c084fc' }}>{fmt(l.lendAmount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Allocation modal
══════════════════════════════════════════════════════════════════════════════ */
function AllocationModal({ asset, existingLenders, onSave, onClose }) {
  const [lenders,    setLenders]    = useState(existingLenders.length ? existingLenders : []);
  const [userSearch, setUserSearch] = useState('');
  const [dropOpen,   setDropOpen]   = useState(false);
  const [selUser,    setSelUser]    = useState(null);
  const [lendAmt,    setLendAmt]    = useState('');
  const [lendErr,    setLendErr]    = useState('');
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const alreadyAdded = id => lenders.some(l => l.user.id === id);
  const filteredUsers = MOCK_USERS.filter(u =>
    (u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.phone.includes(userSearch)) &&
    !alreadyAdded(u.id)
  );

  const totalLent = lenders.reduce((s, l) => s + Number(l.lendAmount), 0);
  const remaining = asset.actualAssetValue - totalLent;
  const pct       = Math.min(100, (totalLent / asset.actualAssetValue) * 100);

  const addLender = () => {
    if (!selUser)                             { setLendErr('Select a user first'); return; }
    if (!lendAmt || Number(lendAmt) <= 0)    { setLendErr('Enter a valid amount'); return; }
    if (Number(lendAmt) > remaining)          { setLendErr(`Exceeds remaining ${fmt(remaining)}`); return; }
    setLenders(prev => [...prev, { user: selUser, lendAmount: Number(lendAmt) }]);
    setSelUser(null); setUserSearch(''); setLendAmt(''); setLendErr('');
  };

  const removeLender  = idx => setLenders(prev => prev.filter((_, i) => i !== idx));
  const updateAmount  = (idx, val) => setLenders(prev => prev.map((l, i) => i === idx ? { ...l, lendAmount: Number(val) } : l));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)' }}>
      <div className="w-full max-w-xl rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--card-bg)', border: '1px solid rgba(168,85,247,0.35)', boxShadow: '0 24px 64px rgba(0,0,0,0.55)', maxHeight: '90vh' }}>

        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: '#c084fc' }}>Allocate Asset</p>
            <h3 className="text-base font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {asset.id} — {asset.borrowerName}
            </h3>
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-5">
          <div className="rounded-xl p-4 grid grid-cols-3 gap-3"
            style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
            <ValueChip label="Asset Value" value={fmt(asset.actualAssetValue)} color="#c084fc" />
            <ValueChip label="Total Lent"  value={fmt(totalLent)}              color="#10b981" />
            <ValueChip label="Remaining"   value={fmt(remaining)}              color={remaining < 0 ? '#f87171' : '#f59e0b'} />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
              <span>Allocation progress</span>
              <span style={{ color: '#c084fc' }}>{pct.toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#a855f7,#7c3aed)' }} />
            </div>
          </div>

          <div className="rounded-xl p-4 flex flex-col gap-3"
            style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c084fc' }}>Add Lender</p>
            <div className="relative" ref={dropRef}>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-text theme-input"
                style={{ color: 'var(--text-primary)' }} onClick={() => setDropOpen(true)}>
                {selUser
                  ? <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {selUser.name} <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({selUser.phone})</span>
                    </span>
                  : <input autoFocus={dropOpen} value={userSearch}
                      onChange={e => { setUserSearch(e.target.value); setDropOpen(true); }}
                      onFocus={() => setDropOpen(true)}
                      placeholder="Search user by name or phone…"
                      className="flex-1 bg-transparent outline-none text-sm"
                      style={{ color: 'var(--text-primary)' }} />
                }
                {selUser && (
                  <button type="button" onClick={e => { e.stopPropagation(); setSelUser(null); setUserSearch(''); setDropOpen(true); }}
                    className="text-xs px-1.5 py-0.5 rounded-lg"
                    style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>✕</button>
                )}
              </div>
              {dropOpen && !selUser && (
                <div className="absolute z-20 w-full mt-1 rounded-xl overflow-hidden shadow-2xl"
                  style={{ background: 'var(--card-bg)', border: '1px solid rgba(168,85,247,0.3)', maxHeight: 200, overflowY: 'auto' }}>
                  {filteredUsers.length === 0
                    ? <p className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>No users found</p>
                    : filteredUsers.map(u => (
                        <button key={u.id} type="button"
                          className="w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors hover:bg-purple-500/10"
                          onClick={() => { setSelUser(u); setDropOpen(false); setUserSearch(''); }}>
                          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.phone}</span>
                        </button>
                      ))
                  }
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>₹</span>
                <input type="number" min="0" placeholder="Lend amount" value={lendAmt}
                  onChange={e => { setLendAmt(e.target.value); setLendErr(''); }}
                  className="theme-input w-full pl-7 pr-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }} />
              </div>
              <button type="button" onClick={addLender}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff' }}>
                + Add
              </button>
            </div>
            {lendErr && <p className="text-xs" style={{ color: '#f87171' }}>{lendErr}</p>}
          </div>

          {lenders.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Lenders ({lenders.length})
              </p>
              {lenders.map((l, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
                    {l.user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{l.user.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{l.user.phone}</p>
                  </div>
                  <div className="relative w-32">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>₹</span>
                    <input type="number" min="0" value={l.lendAmount} onChange={e => updateAmount(i, e.target.value)}
                      className="theme-input w-full pl-6 pr-2 py-1.5 rounded-lg text-sm outline-none text-right"
                      style={{ color: '#c084fc', fontWeight: 600 }} />
                  </div>
                  <button type="button" onClick={() => removeLender(i)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:opacity-80"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 flex gap-3 justify-end flex-shrink-0"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Cancel
          </button>
          <button type="button" onClick={() => onSave(lenders)} disabled={lenders.length === 0}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', boxShadow: '0 4px 14px rgba(168,85,247,0.35)' }}>
            Save Allocation
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Main page
══════════════════════════════════════════════════════════════════════════════ */
export default function ViewAssets() {
  const [search,            setSearch]            = useState('');
  const [selectedBorrower,  setSelectedBorrower]  = useState('');
  const [selectedProject,   setSelectedProject]   = useState('');
  const [currentPage,       setCurrentPage]       = useState(1);
  const [itemsPerPage,      setItemsPerPage]      = useState(10);

  const [assets,      setAssets]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [detailAsset, setDetailAsset] = useState(null);
  const [allocAsset,  setAllocAsset]  = useState(null);
  const [editAsset,   setEditAsset]   = useState(null);
  const [allocations, setAllocations] = useState({});

  // Borrowers for the edit modal
  const [borrowers,        setBorrowers]        = useState([]);
  const [borrowersLoading, setBorrowersLoading] = useState(true);

  const fetchAssets = () => {
    setLoading(true); setError('');
    getAllLoadAssetDetails()
      .then(data => setAssets(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message ?? 'Failed to load assets.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssets();
    getAllBorrowers()
      .then(data => setBorrowers(Array.isArray(data) ? data : []))
      .catch(() => setBorrowers([]))
      .finally(() => setBorrowersLoading(false));
  }, []);

  // Filter options derived from assets data
  const uniqueBorrowerNames = Array.from(
    new Set(assets.map(a => a.borrowerName).filter(Boolean))
  ).sort();

  const projectOptions = selectedBorrower
    ? Array.from(
        new Set(
          assets
            .filter(a => a.borrowerName === selectedBorrower)
            .map(a => a.projectName)
            .filter(Boolean)
        )
      ).sort()
    : [];

  // Filtered Assets
  const filtered = assets.filter(a => {
    const matchesSearch = !search ||
      String(a.borrowerName  ?? '').toLowerCase().includes(search.toLowerCase()) ||
      String(a.projectName   ?? '').toLowerCase().includes(search.toLowerCase()) ||
      String(a.documentNumber ?? '').toLowerCase().includes(search.toLowerCase()) ||
      String(a.assetType     ?? '').toLowerCase().includes(search.toLowerCase());

    const matchesBorrower = !selectedBorrower || a.borrowerName === selectedBorrower;
    const matchesProject = !selectedProject || a.projectName === selectedProject;

    return matchesSearch && matchesBorrower && matchesProject;
  });

  // Reset to page 1 when filter conditions change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedBorrower, selectedProject, itemsPerPage]);

  // Statistics
  const totalDocValue = filtered.reduce((sum, a) => sum + toNumber(a.documentValue), 0);
  const totalActualAssetValue = filtered.reduce((sum, a) => sum + toNumber(a.actualAssetValue), 0);
  const totalTakenAssetValue = filtered.reduce((sum, a) => sum + toNumber(a.takenAssetValue), 0);

  const overallDocValue = assets.reduce((sum, a) => sum + toNumber(a.documentValue), 0);
  const overallActualAssetValue = assets.reduce((sum, a) => sum + toNumber(a.actualAssetValue), 0);
  const overallTakenAssetValue = assets.reduce((sum, a) => sum + toNumber(a.takenAssetValue), 0);

  // Pagination Slice
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssets = filtered.slice(startIndex, startIndex + itemsPerPage);

  const saveAllocation = (assetId, lenders) => setAllocations(prev => ({ ...prev, [assetId]: lenders }));

  const TABLE_HEADERS = [
    'S.No', 'Asset ID','Borrower','Project','Owner','Doc No.','Date','Reg. Type',
    'Doc Value','Asset Value','Taken Value','Asset Type',
    'Asset No.','Size','Survey No.',
    'Documents','Lenders','Actions',
  ];

  // Returns the relevant number value based on asset type
  const assetNumber = (a) => {
    const t = (a.assetType ?? '').toUpperCase();
    if (t === 'PLOT') return { label: 'Plot No.',  value: a.plotNumber };
    if (t === 'FLAT') return { label: 'Flat No.',  value: a.flatNumber };
    if (t === 'AREA') return { label: 'Area',      value: a.area       };
    // fallback: show whichever is populated
    return { label: 'Asset No.', value: a.plotNumber || a.flatNumber || a.area };
  };

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3"
        style={{ background: 'linear-gradient(135deg,rgba(168,85,247,0.12),rgba(168,85,247,0.04))', border: '1px solid rgba(168,85,247,0.25)' }}>
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#c084fc' }}>Assets</p>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>View Assets</h2>
        </div>
        <p className="text-3xl font-bold" style={{ color: '#c084fc' }}>{assets.length}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Doc Value */}
        <div className="rounded-2xl p-5 flex flex-col justify-between"
          style={{ background: 'linear-gradient(135deg,rgba(129,140,248,0.12),rgba(129,140,248,0.04))', border: '1px solid rgba(129,140,248,0.25)' }}>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#818cf8' }}>Total Doc Value</p>
            <h3 className="text-2xl font-black mt-2" style={{ color: 'var(--text-primary)' }}>{fmt(totalDocValue)}</h3>
          </div>
          <p className="text-xs mt-3 flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
            <span>Filtered ({filtered.length})</span>
            <span>Overall: {fmt(overallDocValue)} ({assets.length})</span>
          </p>
        </div>

        {/* Total Asset Value */}
        <div className="rounded-2xl p-5 flex flex-col justify-between"
          style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(16,185,129,0.04))', border: '1px solid rgba(16,185,129,0.25)' }}>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#10b981' }}>Total Asset Value</p>
            <h3 className="text-2xl font-black mt-2" style={{ color: 'var(--text-primary)' }}>{fmt(totalActualAssetValue)}</h3>
          </div>
          <p className="text-xs mt-3 flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
            <span>Filtered ({filtered.length})</span>
            <span>Overall: {fmt(overallActualAssetValue)} ({assets.length})</span>
          </p>
        </div>

        {/* Total Taken Value */}
        <div className="rounded-2xl p-5 flex flex-col justify-between"
          style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(245,158,11,0.04))', border: '1px solid rgba(245,158,11,0.25)' }}>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#f59e0b' }}>Total Taken Value</p>
            <h3 className="text-2xl font-black mt-2" style={{ color: 'var(--text-primary)' }}>{fmt(totalTakenAssetValue)}</h3>
          </div>
          <p className="text-xs mt-3 flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
            <span>Filtered ({filtered.length})</span>
            <span>Overall: {fmt(overallTakenAssetValue)} ({assets.length})</span>
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl p-5 flex flex-wrap items-end gap-4"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
        
        {/* Borrower Filter */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Filter by Borrower
          </label>
          <div className="relative">
            <select
              value={selectedBorrower}
              onChange={e => {
                setSelectedBorrower(e.target.value);
                setSelectedProject('');
              }}
              className="px-3 py-2.5 rounded-xl text-sm outline-none theme-input w-full cursor-pointer appearance-none pr-8"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              <option value="">All Borrowers</option>
              {uniqueBorrowerNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
          </div>
        </div>

        {/* Project Filter */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Filter by Project
          </label>
          <div className="relative">
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              disabled={!selectedBorrower}
              className="px-3 py-2.5 rounded-xl text-sm outline-none theme-input w-full cursor-pointer appearance-none pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              <option value="">{selectedBorrower ? 'All Projects' : 'Select borrower first'}</option>
              {projectOptions.map(proj => (
                <option key={proj} value={proj}>{proj}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Search Keyword
          </label>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search borrower, project, doc no…"
            className="px-3 py-2.5 rounded-xl text-sm outline-none theme-input w-full"
            style={{ color: 'var(--text-primary)', background: 'var(--input-bg)', border: '1px solid var(--border)' }}
          />
        </div>

        {/* Clear Filters */}
        {(selectedBorrower || selectedProject || search) && (
          <button
            onClick={() => {
              setSelectedBorrower('');
              setSelectedProject('');
              setSearch('');
            }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 whitespace-nowrap"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between gap-3 px-5 py-4 flex-wrap"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Asset Records</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                {TABLE_HEADERS.map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-medium whitespace-nowrap"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={TABLE_HEADERS.length} className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading assets...</td></tr>
              ) : error ? (
                <tr><td colSpan={TABLE_HEADERS.length} className="py-10 text-center text-sm" style={{ color: '#f87171' }}>{error}</td></tr>
              ) : paginatedAssets.length === 0 ? (
                <tr><td colSpan={TABLE_HEADERS.length} className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No assets found.</td></tr>
              ) : paginatedAssets.map((a, index) => {
                const lenders  = allocations[a.id] ?? [];
                const saleDeed = a.saleDeedDocumentsDto?.[0];
                const sNo      = startIndex + index + 1;
                const shortId  = String(a.id ?? '').slice(-6);
                return (
                  <tr key={a.id} className="table-row-hover transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-3 px-4 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{sNo}</td>
                    <td className="py-3 px-4 font-mono text-xs cursor-pointer" style={{ color: '#c084fc' }}
                      onClick={() => setDetailAsset(a)}>{shortId}</td>
                    <td className="py-3 px-4 font-medium whitespace-nowrap cursor-pointer" style={{ color: 'var(--text-primary)' }}
                      onClick={() => setDetailAsset(a)}>{a.borrowerName}</td>
                    <td className="py-3 px-4 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{a.projectName}</td>
                    <td className="py-3 px-4 text-xs whitespace-nowrap font-medium" style={{ color: 'var(--text-primary)' }}>{a.ownerName || '—'}</td>
                    <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{a.documentNumber}</td>
                    <td className="py-3 px-4 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{formatDate(a.dateOfExecution)}</td>
                    <td className="py-3 px-4 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{a.typeOfRegistration}</td>
                    <td className="py-3 px-4 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{fmt(a.documentValue)}</td>
                    <td className="py-3 px-4 text-xs font-semibold whitespace-nowrap" style={{ color: '#10b981' }}>{fmt(a.actualAssetValue)}</td>
                    <td className="py-3 px-4 text-xs font-semibold whitespace-nowrap" style={{ color: '#f59e0b' }}>{fmt(a.takenAssetValue)}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: 'rgba(168,85,247,0.12)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
                        {a.assetType ?? '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {(() => { const { label, value } = assetNumber(a); return (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)', fontSize: 10 }}>{label}</span>
                          <span style={{ color: 'var(--text-primary)' }}>{value || '—'}</span>
                        </div>
                      ); })()}
                    </td>
                    <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{a.size || '—'}</td>
                    <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{a.surveyNumber}</td>
                    <td className="py-3 px-4 text-xs whitespace-nowrap">
                      {saleDeed?.documentPath
                        ? <a href={saleDeed.documentPath} download={saleDeed.documentName}
                            className="font-semibold hover:underline" style={{ color: '#c084fc' }}>Download</a>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {lenders.length > 0
                        ? <span className="px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: 'rgba(168,85,247,0.12)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
                            {lenders.length} lender{lenders.length > 1 ? 's' : ''}
                          </span>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {/* Edit */}
                        <button onClick={() => setEditAsset(a)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 whitespace-nowrap flex items-center gap-1"
                          style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                        {/* Allocate */}
                        <button onClick={() => setAllocAsset(a)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 whitespace-nowrap"
                          style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', boxShadow: '0 2px 8px rgba(168,85,247,0.3)' }}>
                          Allocate
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-4"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Show</span>
              <select
                value={itemsPerPage}
                onChange={e => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg text-xs outline-none theme-input cursor-pointer"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                {[5, 10, 20, 50, 100].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span>entries</span>
              <span className="mx-2">|</span>
              <span>
                Showing {Math.min(filtered.length, startIndex + 1)} to{' '}
                {Math.min(filtered.length, startIndex + itemsPerPage)} of {filtered.length} entries
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* First */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="p-1.5 rounded-lg border text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-500/10"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                &laquo;
              </button>

              {/* Prev */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-500/10"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                Prev
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Only show current page, plus one page before/after, and first/last page
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, idx, arr) => {
                  const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                  return (
                    <div key={page} className="flex items-center gap-1.5">
                      {showEllipsis && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>...</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 rounded-lg text-xs font-bold transition-all hover:scale-105"
                        style={
                          currentPage === page
                            ? {
                                background: 'linear-gradient(135deg,#a855f7,#7c3aed)',
                                color: '#fff',
                                border: '1px solid #a855f7',
                                boxShadow: '0 2px 8px rgba(168,85,247,0.3)',
                              }
                            : {
                                background: 'var(--input-bg)',
                                color: 'var(--text-muted)',
                                border: '1px solid var(--border)',
                              }
                        }>
                        {page}
                      </button>
                    </div>
                  );
                })}

              {/* Next */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-500/10"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                Next
              </button>

              {/* Last */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="p-1.5 rounded-lg border text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-500/10"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                &raquo;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detailAsset && (
        <DetailModal asset={detailAsset} lenders={allocations[detailAsset.id] ?? []} onClose={() => setDetailAsset(null)} />
      )}

      {/* Edit modal */}
      {editAsset && (
        <EditAssetModal
          asset={editAsset}
          borrowers={borrowers}
          borrowersLoading={borrowersLoading}
          onClose={() => setEditAsset(null)}
          onSaved={() => { setEditAsset(null); fetchAssets(); }}
        />
      )}

      {/* Allocation modal */}
      {allocAsset && (
        <AllocationModal
          asset={allocAsset}
          existingLenders={allocations[allocAsset.id] ?? []}
          onSave={lenders => { saveAllocation(allocAsset.id, lenders); setAllocAsset(null); }}
          onClose={() => setAllocAsset(null)}
        />
      )}
    </div>
  );
}
