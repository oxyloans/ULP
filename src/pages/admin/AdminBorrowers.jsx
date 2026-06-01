import { useState, useEffect } from 'react';
import { getAllBorrowers, saveBorrower } from '../../api/afterlogin-admin';

// ─── Icons ────────────────────────────────────────────────────────────────────
const BorrowerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const SmallPlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const FolderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inp = (err) => ({
  background: 'var(--input-bg)',
  border: `1.5px solid ${err ? '#ef4444' : 'var(--border)'}`,
  color: 'var(--text-primary)',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 13,
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
});

function Field({ label, required, error, children }) {
  return (
    <div className="grid gap-1.5">
      <label className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
        {label}{required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
      {error && <p className="text-xs font-medium" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  );
}

// ─── Parse projectName field into a string[] ──────────────────────────────────
// API returns: [{ projectName: "string" }]  OR  a comma-separated string (legacy)
const parseProjects = (projectName) => {
  if (Array.isArray(projectName)) {
    return projectName.map(p => (typeof p === 'object' ? p.projectName : p)).filter(Boolean);
  }
  return (projectName ?? '').split(',').map(s => s.trim()).filter(Boolean);
};

// ─── Add / Edit Borrower Modal ────────────────────────────────────────────────
// Projects are managed as a local string[] list.
// On save, they are sent as [{ projectName: "string" }] per the API contract.
function BorrowerModal({ initial, onClose, onSaved }) {
  const isEdit = Boolean(initial?.borrowerName);

  const [borrowerName, setBorrowerName] = useState(initial?.borrowerName ?? '');
  const [panNumber,    setPanNumber]    = useState(initial?.panNumber    ?? '');
  const [phoneNumber,  setPhoneNumber]  = useState(initial?.phoneNumber  ?? '');
  const [address,      setAddress]      = useState(initial?.address      ?? '');

  // projects: string[]  (parsed from the comma-separated API field)
  const [projects,     setProjects]     = useState(() => parseProjects(initial?.projectName));
  const [projectInput, setProjectInput] = useState('');
  const [projectErr,   setProjectErr]   = useState('');

  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const [saveErr, setSaveErr] = useState('');

  const setField = (setter, key) => (v) => {
    setter(v);
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const addProject = () => {
    const name = projectInput.trim();
    if (!name) { setProjectErr('Enter a project name'); return; }
    if (projects.some(p => p.toLowerCase() === name.toLowerCase())) {
      setProjectErr('Project already added'); return;
    }
    setProjects(prev => [...prev, name]);
    setProjectInput('');
    setProjectErr('');
  };

  const removeProject = (idx) => setProjects(prev => prev.filter((_, i) => i !== idx));

  const validate = () => {
    const e = {};
    if (!borrowerName.trim()) e.borrowerName = 'Borrower name is required';
    if (!panNumber.trim())    e.panNumber    = 'PAN number is required';
    if (!phoneNumber.trim())  e.phoneNumber  = 'Phone number is required';
    if (!address.trim())      e.address      = 'Address is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true); setSaveErr('');
    try {
      const payload = {
        borrowerName: borrowerName.trim(),
        panNumber:    panNumber.trim().toUpperCase(),
        phoneNumber:  phoneNumber.trim(),
        address:      address.trim(),
        projectName:  projects.map(name => ({ projectName: name })),  // [{ projectName: "string" }]
      };
      if (isEdit && initial?.id) payload.id = initial.id;
      await saveBorrower(payload);
      onSaved();
      onClose();
    } catch (err) {
      setSaveErr(err.message ?? 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.35)', maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(168,85,247,0.04)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}>
              <BorrowerIcon />
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                {isEdit ? 'Edit Borrower' : 'Add Borrower'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {isEdit ? 'Update details and projects' : 'Register borrower with projects'}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 grid gap-5">

          {/* ── Core details ── */}
          <div className="grid gap-4">
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#a855f7' }}>Borrower Details</p>

            <Field label="Borrower Name" required error={errors.borrowerName}>
              <input type="text" placeholder="e.g. Rajesh Kumar"
                value={borrowerName} onChange={e => setField(setBorrowerName, 'borrowerName')(e.target.value)}
                style={inp(errors.borrowerName)} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="PAN Number" required error={errors.panNumber}>
                <input type="text" placeholder="e.g. ABCDE1234F" maxLength={10}
                  value={panNumber} onChange={e => setField(setPanNumber, 'panNumber')(e.target.value.toUpperCase())}
                  style={{ ...inp(errors.panNumber), fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }} />
              </Field>
              <Field label="Phone Number" required error={errors.phoneNumber}>
                <input type="tel" placeholder="e.g. 9876543210" maxLength={15}
                  value={phoneNumber} onChange={e => setField(setPhoneNumber, 'phoneNumber')(e.target.value.replace(/\D/g, ''))}
                  style={{ ...inp(errors.phoneNumber), fontFamily: "'JetBrains Mono', monospace" }} />
              </Field>
            </div>

            <Field label="Address" required error={errors.address}>
              <textarea rows={2} placeholder="Full address…"
                value={address} onChange={e => setField(setAddress, 'address')(e.target.value)}
                style={{ ...inp(errors.address), resize: 'vertical', minHeight: 64 }} />
            </Field>
          </div>

          {/* ── Projects ── */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#10b981' }}>
                Projects
                {projects.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                    {projects.length}
                  </span>
                )}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Optional — add one or more</p>
            </div>

            {/* Add project input */}
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="e.g. Green Valley Phase 2"
                  value={projectInput}
                  onChange={e => { setProjectInput(e.target.value); setProjectErr(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addProject(); } }}
                  style={inp(projectErr)}
                />
                {projectErr && <p className="text-xs font-medium mt-1" style={{ color: '#ef4444' }}>{projectErr}</p>}
              </div>
              <button type="button" onClick={addProject}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all hover:scale-105"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                <SmallPlusIcon /> Add
              </button>
            </div>

            {/* Project list */}
            {projects.length > 0 ? (
              <div className="flex flex-col gap-2">
                {projects.map((name, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                    <span style={{ color: '#10b981', flexShrink: 0 }}><FolderIcon /></span>
                    <span className="flex-1 text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {name}
                    </span>
                    <button type="button" onClick={() => removeProject(i)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-3 rounded-xl"
                style={{ background: 'var(--input-bg)', border: '1px dashed var(--border)' }}>
                <FolderIcon />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  No projects added yet — borrower will be saved without a project
                </p>
              </div>
            )}
          </div>

          {saveErr && (
            <p className="text-sm font-semibold px-3 py-2 rounded-xl"
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              {saveErr}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 flex-shrink-0"
          style={{ borderTop: '1px solid var(--border)', background: 'rgba(168,85,247,0.02)' }}>
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', boxShadow: '0 4px 14px rgba(168,85,247,0.4)' }}>
            {saving
              ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
              : (isEdit ? <EditIcon /> : <PlusIcon />)}
            {saving ? 'Saving…' : isEdit ? 'Update Borrower' : 'Add Borrower'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Borrower Card ────────────────────────────────────────────────────────────
function BorrowerCard({ borrower, onEdit }) {
  const projects = parseProjects(borrower.projectName);
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <div className="h-1" style={{ background: 'linear-gradient(90deg,#a855f7,#7c3aed)' }} />

      <div className="p-4 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc' }}>
              <BorrowerIcon />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black truncate" style={{ color: 'var(--text-primary)' }}>{borrower.borrowerName}</p>
              <p className="text-xs font-mono mt-0.5" style={{ color: '#818cf8' }}>{borrower.panNumber}</p>
            </div>
          </div>
          <button onClick={() => onEdit(borrower)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 transition-all hover:scale-105"
            style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.25)' }}>
            <EditIcon /> Edit
          </button>
        </div>

        {/* Details */}
        <div className="grid gap-1.5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
            <span className="text-xs flex-shrink-0 w-14" style={{ color: 'var(--text-muted)' }}>Phone</span>
            <span className="text-xs font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{borrower.phoneNumber}</span>
          </div>
          {borrower.address && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
              <span className="text-xs flex-shrink-0 w-14 pt-0.5" style={{ color: 'var(--text-muted)' }}>Address</span>
              <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{borrower.address}</span>
            </div>
          )}
        </div>

        {/* Projects */}
        <div>
          <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <FolderIcon />
            Projects
            <span className="px-1.5 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
              {projects.length}
            </span>
          </p>
          {projects.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {projects.map((name, i) => (
                <span key={i}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <FolderIcon />
                  {name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>No projects assigned</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminBorrowers() {
  const [borrowers, setBorrowers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [modal,     setModal]     = useState(null); // null = closed | false = new | borrower obj = edit

  const openNew    = () => setModal(false);
  const openEdit   = (b) => setModal(b);
  const closeModal = () => setModal(null);
  const [search,   setSearch]   = useState('');

  const fetchBorrowers = async () => {
    setLoading(true); setError('');
    try {
      const data = await getAllBorrowers();
      setBorrowers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message ?? 'Failed to load borrowers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBorrowers(); }, []);

  const filtered = borrowers.filter(b => {
    const q = search.toLowerCase();
    const projectNames = parseProjects(b.projectName).join(' ').toLowerCase();
    return (
      b.borrowerName?.toLowerCase().includes(q) ||
      b.panNumber?.toLowerCase().includes(q) ||
      b.phoneNumber?.includes(q) ||
      projectNames.includes(q)
    );
  });

  const totalProjects = borrowers.reduce((s, b) => s + parseProjects(b.projectName).length, 0);

  return (
    <>
      {modal !== null && (
        <BorrowerModal
          initial={modal || null}
          onClose={closeModal}
          onSaved={fetchBorrowers}
        />
      )}

      <div className="grid gap-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Borrowers</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Manage borrowers and their projects
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchBorrowers}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              <RefreshIcon /> Refresh
            </button>
            <button onClick={openNew}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', boxShadow: '0 4px 14px rgba(168,85,247,0.4)' }}>
              <PlusIcon /> Add Borrower
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Borrowers', value: borrowers.length,                                  color: '#a855f7' },
            { label: 'Total Projects',  value: totalProjects,                                     color: '#10b981' },
            { label: 'Search Results',  value: search ? filtered.length : borrowers.length,       color: '#6366f1' },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-4 py-3"
              style={{ background: 'var(--surface-card)', border: `1px solid ${s.color}18`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
            <SearchIcon />
          </span>
          <input type="text" placeholder="Search by name, PAN, phone or project…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inp(false), paddingLeft: 36 }} />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-16 rounded-2xl"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <div className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading borrowers…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-12 rounded-2xl text-center"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold" style={{ color: '#ef4444' }}>{error}</p>
            <button onClick={fetchBorrowers}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.25)' }}>
              <RefreshIcon /> Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && borrowers.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 rounded-2xl text-center"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc' }}>
              <BorrowerIcon />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>No borrowers yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Add your first borrower to get started</p>
            </div>
            <button onClick={openNew}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', boxShadow: '0 4px 14px rgba(168,85,247,0.35)' }}>
              <PlusIcon /> Add Borrower
            </button>
          </div>
        )}

        {/* No search results */}
        {!loading && !error && borrowers.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 rounded-2xl text-center"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
              No borrowers match "<span style={{ color: 'var(--text-primary)' }}>{search}</span>"
            </p>
            <button onClick={() => setSearch('')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.25)' }}>
              Clear search
            </button>
          </div>
        )}

        {/* Cards grid */}
        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(b => (
                <BorrowerCard key={b.id} borrower={b} onEdit={openEdit} />
              ))}
            </div>
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Showing <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{filtered.length}</span> of{' '}
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{borrowers.length}</span> borrowers
            </p>
          </>
        )}
      </div>
    </>
  );
}
