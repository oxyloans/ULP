import { useState, useEffect } from 'react';
import { getFamilyMembers, addFamilyMemberRequest } from '../api/afterlogin-user';
import { useFamily } from '../context/FamilyContext';

const platformColor = { OxyLoans: '#6366f1', OxyBricks: '#10b981', Offline: '#f59e0b' };
const statusChip    = { Approved: 'chip-green', Pending: 'chip-orange', Rejected: 'chip-red' };

// ─── Coming Soon Banner ───────────────────────────────────────────────────────
function ComingSoonBanner() {
  return (
    <div className="rounded-2xl px-5 py-4 flex items-center gap-4 mb-2"
      style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(99,102,241,0.06))', border: '1px solid rgba(99,102,241,0.3)' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold" style={{ color: '#818cf8' }}>Coming Soon</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Family portfolio features are under development. You can still add member requests below.</p>
      </div>
      <span className="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
        style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
        Coming Soon
      </span>
    </div>
  );
}

// ─── Access Log Modal ─────────────────────────────────────────────────────────
function AccessLogModal({ member, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--brand)' }}>Access Log</p>
            <h2 className="text-base font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              Who viewed <span style={{ color: 'var(--brand)' }}>{member.name}</span>'s data
            </h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
            style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            ✕
          </button>
        </div>
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {(!member.accessLog || member.accessLog.length === 0) ? (
            <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
              <p className="text-4xl mb-3">🔒</p>
              <p className="text-sm font-medium">No access recorded yet</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {member.accessLog.map((log, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: `${platformColor[log.platform] ?? '#6366f1'}18`, color: platformColor[log.platform] ?? '#6366f1' }}>
                    {log.byName?.charAt(0) ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{log.byName}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full chip-blue">{log.relation}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{log.action}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: `${platformColor[log.platform] ?? '#6366f1'}15`, color: platformColor[log.platform] ?? '#6366f1', border: `1px solid ${platformColor[log.platform] ?? '#6366f1'}30` }}>
                        {log.platform}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>🕐 {log.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 py-3 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            LR ID: <span className="font-mono" style={{ color: 'var(--brand)' }}>{member.lrId}</span>
            &nbsp;·&nbsp;Joined {member.joinedOn}
          </p>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusChip[member.status]}`}>
            {member.status}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Add Member Form ──────────────────────────────────────────────────────────
function AddMemberForm({ onSubmitted }) {
  const [form, setForm]       = useState({ name: '', email: '', phone: '', lrId: '', relation: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                        e.name  = 'Full name is required';
    if (!form.email.includes('@'))                e.email = 'Enter a valid email';
    if (form.phone.replace(/\D/g,'').length < 10) e.phone = 'Enter a valid 10-digit number';
    if (!form.lrId.trim())                        e.lrId  = 'LR ID / Member ID is required';
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await addFamilyMemberRequest({ lrId: form.lrId, relation: form.relation || 'Member' });
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', lrId: '', relation: '' });
      setErrors({});
      onSubmitted?.();
    } catch (err) {
      setErrors({ lrId: err.message ?? 'Submission failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--card-bg)', border: '1px solid rgba(16,185,129,0.3)' }}>
      <p className="text-4xl mb-3">✅</p>
      <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Request Submitted!</p>
      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Admin will review and approve within 24 hrs.</p>
      <button onClick={() => setSuccess(false)} className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white"
        style={{ background: 'linear-gradient(135deg,var(--brand),#4338ca)' }}>
        Add Another Member
      </button>
    </div>
  );

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--brand)' }}>Add Family Member</p>
      <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Request to Add a Member</h2>
      <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
        Enter the member's details. Admin will review and approve before they appear in your family list.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { key: 'name',     label: 'Full Name',        placeholder: 'e.g. Ravi Kumar',           type: 'text'  },
          { key: 'email',    label: 'Email Address',    placeholder: 'e.g. ravi@example.com',     type: 'email' },
          { key: 'phone',    label: 'Mobile Number',    placeholder: '10-digit mobile number',    type: 'tel'   },
          { key: 'lrId',     label: 'LR ID / Member ID',placeholder: 'e.g. LR-4001 or member ID', type: 'text'  },
          { key: 'relation', label: 'Relation',         placeholder: 'e.g. Spouse, Son, Daughter',type: 'text'  },
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
            <input type={f.type} value={form[f.key]}
              onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); setErrors(p => ({ ...p, [f.key]: '' })); }}
              placeholder={f.placeholder}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none theme-input transition-all"
              style={{ color: 'var(--text-primary)', borderColor: errors[f.key] ? '#ef4444' : undefined }} />
            {errors[f.key] && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors[f.key]}</p>}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-5">
        <button onClick={submit} disabled={loading}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,var(--brand),#4338ca)', boxShadow: '0 0 16px var(--brand-glow)' }}>
          {loading ? 'Submitting…' : 'Submit for Admin Approval'}
        </button>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Admin reviews within 24 hrs</p>
      </div>
    </div>
  );
}

// ─── Member Card (general — unchanged behaviour) ──────────────────────────────
function MemberCard({ member, onViewLog }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
            style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--brand)', border: '2px solid rgba(99,102,241,0.25)' }}>
            {member.name?.charAt(0) ?? '?'}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{member.name}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{member.role}</p>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${statusChip[member.status]}`}>
          {member.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>📧 {member.email}</span>
        <span>📱 {member.phone}</span>
        <span className="font-mono" style={{ color: 'var(--brand)' }}>🪪 {member.lrId}</span>
        <span>📅 {member.joinedOn}</span>
      </div>
      {member.linkedMembers?.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Linked Members</p>
          <div className="flex flex-wrap gap-1.5">
            {member.linkedMembers.map(lm => (
              <span key={lm.id} className="text-xs px-2 py-0.5 rounded-full chip-blue">
                {lm.name} · {lm.relation}
              </span>
            ))}
          </div>
        </div>
      )}
      <button onClick={() => onViewLog(member)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
        style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--brand)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <span>👁 Who viewed my data</span>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: 'rgba(99,102,241,0.2)' }}>
          {member.accessLog?.length ?? 0} {(member.accessLog?.length ?? 0) === 1 ? 'entry' : 'entries'}
        </span>
      </button>
    </div>
  );
}

// ─── OxyLoans Family Member Card ───────────────────────────────────────────────
// Separate card for members linked via OxyLoans — shows Head of Family badge,
// Set as Head button, and Remove button. Only rendered in the OxyLoans section.
function OxyMemberCard({ member, isHead, onSetHead, onRemove }) {
  const [settingHead, setSettingHead]   = useState(false);
  const [removing, setRemoving]         = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [toast, setToast]               = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSetHead = async () => {
    setSettingHead(true);
    const result = await onSetHead(member.id);
    setSettingHead(false);
    if (result?.success) {
      showToast('Set as Head of Family');
    } else {
      showToast(result?.error ?? 'Failed to update', 'error');
    }
  };

  const handleRemove = async () => {
    setConfirmRemove(false);
    setRemoving(true);
    const result = await onRemove(member.id);
    setRemoving(false);
    if (!result?.success) {
      showToast(result?.error ?? 'Failed to remove member', 'error');
    }
  };

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 transition-all"
      style={{
        background: isHead
          ? 'linear-gradient(135deg,rgba(245,131,17,0.09),rgba(245,131,17,0.03))'
          : 'var(--card-bg)',
        border: isHead ? '1.5px solid rgba(245,131,17,0.4)' : '1px solid var(--border)',
        boxShadow: isHead ? '0 0 0 3px rgba(245,131,17,0.08)' : 'none',
        opacity: removing ? 0.5 : 1,
      }}>

      {/* Toast */}
      {toast && (
        <div className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
          style={{
            background: toast.type === 'error' ? 'rgba(233,83,48,0.08)' : 'rgba(53,161,62,0.08)',
            color: toast.type === 'error' ? '#e95330' : '#35a13e',
            border: `1px solid ${toast.type === 'error' ? 'rgba(233,83,48,0.2)' : 'rgba(53,161,62,0.2)'}`,
          }}>
          {toast.msg}
        </div>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
            style={{
              background: isHead ? 'rgba(245,131,17,0.15)' : 'rgba(99,102,241,0.1)',
              color: isHead ? '#f58311' : 'var(--brand)',
              border: isHead ? '2px solid rgba(245,131,17,0.35)' : '2px solid rgba(99,102,241,0.2)',
            }}>
            {member.name?.charAt(0) ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{member.name ?? '—'}</p>
            {member.relation && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{member.relation}</p>
            )}
          </div>
        </div>

        {/* Head of Family crown badge */}
        {isHead && (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold flex-shrink-0"
            style={{ background: 'rgba(245,131,17,0.15)', color: '#f58311', border: '1px solid rgba(245,131,17,0.3)' }}>
            {/* Crown icon */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M2 20h20v2H2zM4 18l4-10 4 4 4-8 4 10H4z"/></svg>
            Head of Family
          </span>
        )}
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        {member.lrId  && <span className="font-mono col-span-2" style={{ color: '#f58311' }}>🪪 {member.lrId}</span>}
        {member.phone && <span>📱 {member.phone}</span>}
        {member.email && <span className="truncate">📧 {member.email}</span>}
      </div>

      {/* Support contact note (only on head card) */}
      {isHead && (
        <p className="text-xs px-3 py-2 rounded-xl"
          style={{ background: 'rgba(245,131,17,0.07)', color: 'var(--text-muted)', border: '1px solid rgba(245,131,17,0.15)' }}>
          All OxyLoans support queries from this family will be directed to this member.
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {/* Set as Head — hidden if already head */}
        {!isHead && (
          <button
            onClick={handleSetHead}
            disabled={settingHead || removing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'rgba(245,131,17,0.1)', color: '#f58311', border: '1px solid rgba(245,131,17,0.28)' }}>
            {settingHead
              ? <span className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#f58311', borderTopColor: 'transparent' }} />
              : <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M2 20h20v2H2zM4 18l4-10 4 4 4-8 4 10H4z"/></svg>
            }
            {settingHead ? 'Setting…' : 'Set as Head'}
          </button>
        )}

        {/* Remove member — only non-head members can be removed by the head */}
        {!isHead && (
          confirmRemove ? (
            <div className="flex gap-2 items-center">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Remove?</span>
              <button
                onClick={handleRemove}
                disabled={removing}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: '#e95330' }}>
                {removing ? 'Removing…' : 'Yes, remove'}
              </button>
              <button
                onClick={() => setConfirmRemove(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRemove(true)}
              disabled={removing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'rgba(233,83,48,0.08)', color: '#e95330', border: '1px solid rgba(233,83,48,0.2)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              Remove
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ─── OxyLoans Family Section ──────────────────────────────────────────────────
// Shown only when oxyloansMembers has data (populated after Get OxyLoans Data).
// Applies exclusively to OxyLoans — does not affect the general family list.
function OxyLoansFamilySection({ members, headOfFamilyId, onSetHead, onRemove }) {
  const head = members.find(m => m.id === headOfFamilyId || m.isHeadOfFamily);

  return (
    <div className="grid gap-4">
      {/* Section header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(245,131,17,0.12)', border: '1px solid rgba(245,131,17,0.3)', color: '#f58311' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#f58311' }}>OxyLoans Only</p>
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            Family Members on OxyLoans
            <span className="ml-2 text-sm font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(245,131,17,0.1)', color: '#f58311', border: '1px solid rgba(245,131,17,0.2)' }}>
              {members.length}
            </span>
          </h3>
        </div>
        {/* Head of family quick-ref chip */}
        {head && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
            style={{ background: 'rgba(245,131,17,0.08)', border: '1px solid rgba(245,131,17,0.25)', color: '#f58311' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0"><path d="M2 20h20v2H2zM4 18l4-10 4 4 4-8 4 10H4z"/></svg>
            <span className="font-bold">{head.name}</span>
            <span className="font-normal" style={{ color: 'var(--text-muted)' }}>is Head of Family</span>
          </div>
        )}
      </div>

      {/* Info note */}
      <div className="px-4 py-3 rounded-xl text-xs"
        style={{ background: 'rgba(38,115,187,0.06)', border: '1px solid rgba(38,115,187,0.15)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong style={{ color: '#2673bb' }}>How it works:</strong> When any member in this group raises an OxyLoans support query,
        the <strong style={{ color: '#f58311' }}>Head of Family</strong> is contacted first to coordinate resolution.
        Only the Head of Family can remove members from this group.
      </div>

      {/* Member cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map(m => (
          <OxyMemberCard
            key={m.id}
            member={m}
            isHead={m.id === headOfFamilyId || m.isHeadOfFamily}
            onSetHead={onSetHead}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FamilyManagement() {
  const [members, setMembers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [logTarget, setLogTarget] = useState(null);
  const [search, setSearch]       = useState('');

  // OxyLoans-specific family state from context
  const {
    oxyloansMembers,
    oxyMembersLoading,
    headOfFamilyId,
    setHeadOfFamily,
    removeOxyFamilyMember,
  } = useFamily();

  useEffect(() => {
    getFamilyMembers()
      .then(data => { if (Array.isArray(data)) setMembers(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const approved = members.filter(m => m.status === 'Approved');
  const pending  = members.filter(m => m.status === 'Pending');

  const filtered = approved.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search) ||
    m.lrId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid gap-6">
      {logTarget && <AccessLogModal member={logTarget} onClose={() => setLogTarget(null)} />}

      {/* Coming Soon Banner */}
      <ComingSoonBanner />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Approved Members',       value: approved.length,                                              color: '#10b981' },
          { label: 'Pending Approval',        value: pending.length,                                              color: '#f59e0b' },
          { label: 'OxyLoans Family Members', value: oxyMembersLoading ? '…' : oxyloansMembers.length,            color: '#f58311' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: 'var(--card-bg)', border: `1px solid ${s.color}30` }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: s.color }}>{s.label}</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── OxyLoans Family section — only rendered when data exists ── */}
      {oxyMembersLoading && (
        <div className="flex items-center gap-3 py-4 px-1">
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#f58311', borderTopColor: 'transparent' }} />
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading OxyLoans family members…</span>
        </div>
      )}
      {!oxyMembersLoading && oxyloansMembers.length > 0 && (
        <OxyLoansFamilySection
          members={oxyloansMembers}
          headOfFamilyId={headOfFamilyId}
          onSetHead={setHeadOfFamily}
          onRemove={removeOxyFamilyMember}
        />
      )}

      {/* Divider between OxyLoans section and general family */}
      {oxyloansMembers.length > 0 && (
        <div style={{ height: 1, background: 'var(--border)' }} />
      )}

      {/* Add member form */}
      <AddMemberForm onSubmitted={() => {
        getFamilyMembers().then(data => { if (Array.isArray(data)) setMembers(data); }).catch(() => {});
      }} />

      {/* Pending notice */}
      {pending.length > 0 && (
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <span className="text-xl">⏳</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#f59e0b' }}>
              {pending.length} request{pending.length > 1 ? 's' : ''} awaiting admin approval
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {pending.map(m => m.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Approved members grid (general — all platforms) */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--brand)' }}>Family Members</p>
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Approved Members ({approved.length})
            </h2>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, phone, LR ID…"
            className="px-3 py-2 rounded-xl text-sm outline-none theme-input w-60"
            style={{ color: 'var(--text-primary)' }} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-12">
            <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading members…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <p className="text-3xl mb-2">👨‍👩‍👧‍👦</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No approved members found</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(m => <MemberCard key={m.id} member={m} onViewLog={setLogTarget} />)}
          </div>
        )}
      </div>
    </div>
  );
}
