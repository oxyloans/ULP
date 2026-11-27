import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getRunningClosedDeals,
  getRealGoldParticipations,
  getAdminDeals,
  getDealsByStatusType,
  closeDealManually,
  getCollectedUsers,
  assignRealGoldPilot,
  updateRealGoldStatus,
} from '../../api/afterlogin-admin';
import { formatINR } from '../../utils/currency';

// ─── Icons ────────────────────────────────────────────────────────────────────
const RefreshIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const ChevronDown  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="6 9 12 15 18 9"/></svg>;
const UsersIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const SpinnerIcon  = () => <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#d97706', borderTopColor: 'transparent' }} />;
const CloseIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const SearchIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const EditIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

// ─── Image lightbox ───────────────────────────────────────────────────────────
function ImageLightbox({ url, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: -14, right: -14, zIndex: 1,
            width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.15)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}>
          <CloseIcon />
        </button>
        <img
          src={url}
          alt="Collected document"
          style={{
            maxWidth: '90vw', maxHeight: '85vh',
            borderRadius: 12, objectFit: 'contain',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          }}
        />
      </div>
    </div>
  );
}

function fmtINR(n) {
  if (!n && n !== 0) return '—';
  return formatINR(n);
}

// Tab groups: only Real Gold
const TAB_GROUPS = [
  {
    key:   'REALGOLD',
    label: 'Real Gold',
    color: '#d97706',
    globalDealType: 'REALGOLD',
    subTabs: [
      { key: 'REALGOLD_NOTACHIEVED', label: 'Not Achieved', statusType: 'NOTACHIEVED', color: '#d97706' },
      { key: 'REALGOLD_ACHIEVED',    label: 'Achieved',     statusType: 'ACHIEVED',    color: '#6366f1' },
      { key: 'REALGOLD_CLOSED',      label: 'Closed',       statusType: 'CLOSED',      color: '#ef4444' },
    ],
  },
];

// Flat lookup: subTab key → { group, subTab }
const SUB_TAB_MAP = {};
TAB_GROUPS.forEach(g => g.subTabs.forEach(s => { SUB_TAB_MAP[s.key] = { group: g, subTab: s }; }));

// ─── Feedback modal for success / error messages ──────────────────────────────
function FeedbackModal({ message, onClose }) {
  if (!message || !message.text) return null;

  const isSuccess = message.type === 'success';
  const accentColor   = isSuccess ? '#10b981' : '#ef4444';
  const bgAccent      = isSuccess ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)';
  const borderAccent  = isSuccess ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden text-center p-6 transition-all"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
        onClick={e => e.stopPropagation()}>

        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: bgAccent, border: `2px solid ${borderAccent}`, color: accentColor }}>
          {isSuccess ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>

        <h3 className="text-base font-black mb-2" style={{ color: 'var(--text-primary)' }}>
          {isSuccess ? 'Success' : 'Message'}
        </h3>

        <p className="text-xs font-semibold mb-6 leading-relaxed whitespace-pre-wrap break-words" style={{ color: 'var(--text-muted)' }}>
          {message.text}
        </p>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-xs font-black transition-all hover:scale-[1.02] active:scale-95"
          style={{
            background: isSuccess ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)',
            color: '#fff',
            boxShadow: `0 4px 14px ${isSuccess ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}

// ─── Assign modal ─────────────────────────────────────────────────────────────
function AssignModal({ participation, dealId, adminUser, onClose, onSuccess }) {
  const [collectedUsers, setCollectedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers]     = useState(true);
  const [fetchError, setFetchError]         = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [submitting, setSubmitting]         = useState(false);
  const [feedback, setFeedback]             = useState(null);

  useEffect(() => {
    setLoadingUsers(true);
    setFetchError('');
    getCollectedUsers()
      .then(res => setCollectedUsers(Array.isArray(res) ? res : []))
      .catch(e => setFetchError(e.message ?? 'Failed to load collected users'))
      .finally(() => setLoadingUsers(false));
  }, []);

  const handleAssign = () => {
    if (!selectedUserId) return;
    const selectedUser = collectedUsers.find(u => u.userId === selectedUserId);
    if (!selectedUser) return;

    setSubmitting(true);
    assignRealGoldPilot({
      assignedBy:      adminUser?.userName ?? adminUser?.userId ?? '',
      collectedId:     selectedUser.userId,
      dealId:          dealId,
      participationId: participation.participationId,
      userId:          participation.userId,
    })
      .then(() => {
        onSuccess({ text: 'Participation assigned successfully.', type: 'success' });
      })
      .catch(e => {
        setFeedback({ text: e.message ?? 'Assignment failed. Please try again.', type: 'error' });
      })
      .finally(() => setSubmitting(false));
  };

  if (feedback) {
    return <FeedbackModal message={feedback} onClose={() => { setFeedback(null); onClose(); }} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(245,158,11,0.06)' }}>
          <div>
            <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Assign Pilot</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Select a collected user to assign to this participation
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-all hover:bg-black/10"
            style={{ color: 'var(--text-muted)' }}>
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4" style={{ maxHeight: 360, overflowY: 'auto' }}>
          {loadingUsers && (
            <div className="flex items-center gap-2 py-8 justify-center">
              <SpinnerIcon />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Loading collected users…</span>
            </div>
          )}

          {!loadingUsers && fetchError && (
            <p className="text-xs font-semibold py-6 text-center" style={{ color: '#ef4444' }}>{fetchError}</p>
          )}

          {!loadingUsers && !fetchError && collectedUsers.length === 0 && (
            <p className="text-xs py-6 text-center" style={{ color: 'var(--text-muted)' }}>No collected users found</p>
          )}

          {!loadingUsers && !fetchError && collectedUsers.map(u => {
            const selected = selectedUserId === u.userId;
            return (
              <div key={u.userId}
                onClick={() => setSelectedUserId(u.userId)}
                className="flex items-start gap-3 p-3 rounded-xl mb-2 cursor-pointer transition-all"
                style={{
                  background: selected ? 'rgba(245,158,11,0.12)' : 'var(--input-bg)',
                  border: `1px solid ${selected ? '#f59e0b' : 'var(--border)'}`,
                  boxShadow: selected ? '0 0 0 2px rgba(245,158,11,0.2)' : 'none',
                }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-xs"
                  style={{ background: selected ? '#f59e0b' : 'var(--border)', color: selected ? '#fff' : 'var(--text-muted)' }}>
                  {(u.firstName ?? u.userName ?? '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate" style={{ color: selected ? '#f59e0b' : 'var(--text-primary)' }}>
                    {u.userName ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.mobileNumber}</p>
                </div>
                {selected && (
                  <div className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: '#f59e0b', color: '#fff' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4"
          style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose} disabled={submitting}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedUserId || submitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
            style={{
              background: 'linear-gradient(135deg,#f59e0b,#d97706)',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(245,158,11,0.3)',
            }}>
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Assigning…
              </>
            ) : 'Confirm Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Status action modal (Approve) ───────────────────────────────────────────
function StatusActionModal({ type, participation, dealId, adminUser, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [comments, setComments]     = useState('');
  const [imgError, setImgError]     = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const accentColor = '#10b981';
  const newStatus   = 'APPROVED';

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      await updateRealGoldStatus({
        collectedId:       participation.collectedId ?? '',
        comments,
        dealId:            dealId,
        adminApprovedDate: new Date().toISOString(),
        goldStatus:        newStatus,
        participationId:   participation.participationId,
        userId:            participation.userId,
      });
      onSuccess({ text: 'Participation approved successfully.', type: 'success' });
    } catch (e) {
      setError(e.message ?? 'Failed to update status. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(16,185,129,0.06)' }}>
          <div>
            <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Admin Approve</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Review the collected image and approve this participation
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-all hover:bg-black/10"
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <CloseIcon />
          </button>
        </div>

        <div className="px-5 py-4" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* User info */}
          <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-bold" style={{ color: 'var(--text-primary)', marginBottom: 2 }}>{participation.userName ?? '—'}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{participation.email ?? ''}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{participation.mobileNumber ?? ''}</p>
            <p className="text-xs font-black mt-1" style={{ color: '#f59e0b' }}>
              {participation.participatedGoldGrams ?? '—'} g
            </p>
          </div>

          {/* Document image */}
          {participation.documentUrl && !imgError ? (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Collected Photo</p>
              <img
                src={participation.documentUrl}
                alt="Collected document"
                onError={() => setImgError(true)}
                onClick={() => setLightboxUrl(participation.documentUrl)}
                style={{
                  width: '100%', maxHeight: 240, objectFit: 'cover',
                  borderRadius: 10, border: '1px solid var(--border)',
                  cursor: 'zoom-in',
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Click image to enlarge</p>
            </div>
          ) : participation.documentUrl && imgError ? (
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>Image could not be loaded.</p>
            </div>
          ) : (
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No document image uploaded.</p>
            </div>
          )}

          {/* Comments */}
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>
              Comments <span style={{ fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              rows={2}
              placeholder="Add approval notes…"
              style={{
                width: '100%', borderRadius: 10, padding: '8px 12px',
                fontSize: 12, background: 'var(--input-bg)',
                border: '1px solid var(--border)', color: 'var(--text-primary)',
                outline: 'none', resize: 'vertical', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs font-semibold px-3 py-2 rounded-lg"
              style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4"
          style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose} disabled={submitting}
            className="px-4 py-2 rounded-xl text-xs font-bold"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 14px rgba(16,185,129,0.35)', cursor: 'pointer' }}>
            {submitting
              ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />Saving…</>
              : '✓ Approve'}
          </button>
        </div>
      </div>
    </div>
    {lightboxUrl && <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
    </>
  );
}

// ─── Participants panel (lazy-loaded per deal) ────────────────────────────────
function ParticipantsPanel({ dealId }) {
  const { user } = useAuth();

  const [participants, setParticipants] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  const [assignTarget, setAssignTarget] = useState(null); // participation object

  // Stub action modal state: { type: 'collected'|'approve', participation }
  const [stubTarget, setStubTarget] = useState(null);

  // Lightbox
  const [lightboxUrl, setLightboxUrl] = useState(null);

  // Feedback modal
  const [feedback, setFeedback] = useState(null);

  const loadParticipants = () => {
    setLoading(true); setError('');
    getRealGoldParticipations(dealId)
      .then(res => setParticipants(Array.isArray(res) ? res : []))
      .catch(e => setError(e.message ?? 'Failed to load participants'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadParticipants(); }, [dealId]);

  const handleAssignSuccess = (msg) => {
    setAssignTarget(null);
    setFeedback(msg);
    loadParticipants();
  };

  const handleStatusSuccess = (msg) => {
    setStubTarget(null);
    setFeedback(msg);
    loadParticipants();
  };

  if (loading) return (
    <div className="flex items-center gap-2 py-6 px-6">
      <SpinnerIcon />
      <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Loading participants…</span>
    </div>
  );

  if (error) return (
    <div className="py-4 px-6 text-xs font-semibold" style={{ color: '#ef4444' }}>{error}</div>
  );

  const totalGrams    = participants.reduce((s, p) => s + (p.participatedGoldGrams ?? 0), 0);
  const totalApproved = participants.reduce((s, p) => s + (p.adminApprovedGrams ?? 0), 0);

  return (
    <>
      <div className="px-5 py-4" style={{ background: 'rgba(217,119,6,0.03)', borderTop: '1px solid var(--border)' }}>
        {/* Summary row */}
        <div className="flex items-center gap-4 flex-wrap mb-3">
          <div className="flex items-center gap-1.5">
            <UsersIcon />
            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              {participants.length} Participant{participants.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Total Gold:</span>
            <span className="text-xs font-black tabular-nums" style={{ color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>{totalGrams}g</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Approved:</span>
            <span className="text-xs font-black tabular-nums" style={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>{totalApproved}g</span>
          </div>
        </div>

        {participants.length === 0 ? (
          <p className="text-xs py-3 text-center" style={{ color: 'var(--text-muted)' }}>No participants yet</p>
        ) : (
          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--surface-card)' }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'var(--input-bg)', borderBottom: '1px solid var(--border)' }}>
                  {['#', 'Details', 'Gold Grams', 'Approved Grams', 'Gold Rate', 'Amount', 'Status', 'Collected Date', 'Comments', 'Actions'].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: 'var(--text-muted)', fontSize: 10 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {participants.map((p, i) => (
                  <tr key={p.participationId ?? i}
                    style={{ borderBottom: i < participants.length - 1 ? '1px solid var(--border)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                    {/* # */}
                    <td className="py-2.5 px-3 font-bold" style={{ color: 'var(--text-muted)' }}>{i + 1}</td>

                    {/* Details */}
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>
                        {p.userName ?? '—'}
                      </p>
                      <p className="text-xs tabular-nums mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                        {p.mobileNumber ?? '—'}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {p.email ?? '—'}
                      </p>
                    </td>

                    {/* Gold Grams */}
                    <td className="py-2.5 px-3 font-black tabular-nums" style={{ color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>
                      {p.participatedGoldGrams ?? '—'}g
                    </td>

                    {/* Approved Grams */}
                    <td className="py-2.5 px-3 tabular-nums" style={{ color: p.adminApprovedGrams != null ? '#10b981' : 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {p.adminApprovedGrams != null ? `${p.adminApprovedGrams}g` : '—'}
                    </td>

                    {/* Gold Rate */}
                    <td className="py-2.5 px-3 tabular-nums" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {p.goldRate != null ? fmtINR(p.goldRate) : '—'}
                    </td>

                    {/* Amount */}
                    <td className="py-2.5 px-3 font-bold tabular-nums" style={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>
                      {fmtINR(p.participatedAmount)}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full font-semibold whitespace-nowrap"
                        style={{
                          background: p.goldStatus === 'APPROVED'
                            ? 'rgba(16,185,129,0.1)'
                            : p.goldStatus
                              ? 'rgba(99,102,241,0.1)'
                              : 'rgba(107,114,128,0.1)',
                          color: p.goldStatus === 'APPROVED'
                            ? '#10b981'
                            : p.goldStatus
                              ? '#818cf8'
                              : '#9ca3af',
                          border: `1px solid ${
                            p.goldStatus === 'APPROVED'
                              ? 'rgba(16,185,129,0.2)'
                              : p.goldStatus
                                ? 'rgba(99,102,241,0.2)'
                                : 'rgba(107,114,128,0.2)'
                          }`,
                          fontSize: 10
                        }}>
                        {p.goldStatus ?? 'Pending'}
                      </span>
                    </td>

                    {/* Collected Date */}
                    <td className="py-2.5 px-3 tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {p.goldCollectedDate ?? '—'}
                    </td>

                    {/* Comments */}
                    <td className="py-2.5 px-3" style={{ color: 'var(--text-muted)', maxWidth: 160 }}>
                      <span className="block truncate" title={p.comments ?? ''}>
                        {p.comments ?? '—'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {/* Assign: null or PENDING → admin assigns a collector */}
                      {(p.goldStatus == null || p.goldStatus === 'PENDING') && (
                        <button
                          onClick={() => setAssignTarget(p)}
                          className="px-2.5 py-1 rounded-lg text-xs font-black transition-all hover:scale-105 active:scale-95"
                          style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                          Assign
                        </button>
                      )}

                      {/* ASSIGNED → collector's job, show read-only badge */}
                      {p.goldStatus === 'ASSIGNED' && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black"
                          style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
                          Assigned
                        </span>
                      )}

                      {/* COLLECTED → admin can view image and approve */}
                      {p.goldStatus === 'COLLECTED' && (
                        <div className="flex items-center gap-1.5">
                          {p.documentUrl && (
                            <button
                              onClick={() => setLightboxUrl(p.documentUrl)}
                              className="px-2.5 py-1 rounded-lg text-xs font-black transition-all hover:scale-105 active:scale-95"
                              style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              View
                            </button>
                          )}
                          <button
                            onClick={() => setStubTarget({ type: 'approve', participation: p })}
                            className="px-2.5 py-1 rounded-lg text-xs font-black transition-all hover:scale-105 active:scale-95"
                            style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                            Approve
                          </button>
                        </div>
                      )}

                      {/* APPROVED → completed */}
                      {p.goldStatus === 'APPROVED' && (
                        <div className="flex flex-col items-start gap-1">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-black"
                            style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                            COMPLETED
                          </span>
                          {p.adminApprovedDate && (
                            <span className="text-[11px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
                              {p.adminApprovedDate}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign modal */}
      {assignTarget && (
        <AssignModal
          participation={assignTarget}
          dealId={dealId}
          adminUser={user}
          onClose={() => setAssignTarget(null)}
          onSuccess={handleAssignSuccess}
        />
      )}

      {/* Status action modal */}
      {stubTarget && (
        <StatusActionModal
          type={stubTarget.type}
          participation={stubTarget.participation}
          dealId={dealId}
          adminUser={user}
          onClose={() => setStubTarget(null)}
          onSuccess={handleStatusSuccess}
        />
      )}

      {/* Feedback modal */}
      {feedback && (
        <FeedbackModal message={feedback} onClose={() => setFeedback(null)} />
      )}

      {/* Image lightbox */}
      {lightboxUrl && (
        <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
    </>
  );
}

// ─── Deal row ─────────────────────────────────────────────────────────────────
function DealRow({ deal, idx, tabColor, expandedId, onToggle, showDeactivate, onDeactivate, onEdit }) {
  const dealKey = deal.dealId ?? deal.id;
  const expanded = expandedId === dealKey;

  const total      = deal.dealValue ?? deal.dealAmount ?? 0;
  const invested   = deal.totalParticipationAmount ?? deal.dealParticipationValue ?? 0;
  const remaining  = deal.remainingDealValue ?? deal.currentDealValue ?? Math.max(0, total - invested);
  const fillPct    = total > 0 ? Math.min(Math.round((invested / total) * 100), 100) : 0;
  const isAchieved = deal.dealStatus === 'ACHIEVED';

  const fillColor  = fillPct >= 100 ? '#ef4444' : fillPct >= 80 ? '#f59e0b' : '#10b981';

  const [copied, setCopied] = useState(false);

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <tr
        className="cursor-pointer"
        style={{
          borderBottom: expanded ? 'none' : '1px solid var(--border)',
          background: expanded
            ? `linear-gradient(90deg, ${tabColor}18 0%, ${tabColor}08 100%)`
            : 'transparent',
          boxShadow: expanded ? `inset 4px 0 0 ${tabColor}` : 'none',
          transition: 'background 0.2s ease, box-shadow 0.2s ease',
        }}
        onClick={() => onToggle(dealKey)}
        onMouseEnter={e => {
          if (!expanded) {
            e.currentTarget.style.background = 'var(--row-hover)';
            e.currentTarget.style.boxShadow  = `inset 4px 0 0 ${tabColor}55`;
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = expanded
            ? `linear-gradient(90deg, ${tabColor}18 0%, ${tabColor}08 100%)`
            : 'transparent';
          e.currentTarget.style.boxShadow = expanded ? `inset 4px 0 0 ${tabColor}` : 'none';
        }}>

        {/* # */}
        <td className="py-3.5 px-4">
          <span className="text-xs font-bold tabular-nums w-5 h-5 rounded-md flex items-center justify-center"
            style={{
              background: expanded ? `${tabColor}20` : 'transparent',
              color: expanded ? tabColor : 'var(--text-muted)',
              border: expanded ? `1px solid ${tabColor}30` : '1px solid transparent',
              transition: 'all 0.2s',
            }}>
            {idx + 1}
          </span>
        </td>

        {/* Deal Name */}
        <td className="py-3.5 px-4">
          <p className="font-bold text-sm" style={{ color: expanded ? tabColor : 'var(--text-primary)', transition: 'color 0.2s' }}>
            {deal.dealName}
          </p>
          <div className="flex flex-wrap row mt-0.5">
            <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {String(deal.dealId ?? deal.id ?? '').slice(0, 8)}…
            </p>
            <button
              className="text-xs font-mono mt-0.5 flex items-center"
              style={{ color: copied ? '#10b981' : 'var(--text-muted)', marginLeft: "10px", background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              onClick={(e) => { e.stopPropagation(); handleCopy(deal.dealId ?? deal.id ?? ''); }}
              title={copied ? 'Copied!' : 'Copy Deal ID'}
            >
              {copied ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>
        </td>

        {/* Deal Value */}
        <td className="py-3.5 px-4 font-bold tabular-nums text-sm"
          style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
          {fmtINR(total)}
        </td>

        {/* Participated */}
        <td className="py-3.5 px-4 font-bold tabular-nums text-sm"
          style={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>
          {fmtINR(invested)}
        </td>

        {/* Remaining */}
        <td className="py-3.5 px-4 font-bold tabular-nums text-sm"
          style={{ color: remaining <= 0 ? '#ef4444' : '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>
          {remaining <= 0 ? 'Full' : fmtINR(remaining)}
        </td>

        {/* Fill % */}
        <td className="py-3.5 px-4" style={{ minWidth: 110 }}>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${fillPct}%`, background: fillColor, boxShadow: expanded ? `0 0 6px ${fillColor}88` : 'none' }} />
            </div>
            <span className="text-xs font-bold tabular-nums" style={{ color: fillColor }}>{fillPct}%</span>
          </div>
        </td>

        {/* ROI */}
        <td className="py-3.5 px-4 font-bold tabular-nums text-sm"
          style={{ color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>
          {deal.rateOfInterest ?? deal.monthlyInterest ?? '—'}%
        </td>

        {/* Status + Actions */}
        <td className="py-3.5 px-4">
          {isAchieved ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
                ✓ Achieved
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(deal); }}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-bold transition-all hover:scale-105 text-white whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)', boxShadow: '0 2px 8px rgba(99,102,241,0.25)' }}
              >
                <EditIcon /> Edit
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(deal); }}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-bold transition-all hover:scale-105 text-white whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)', boxShadow: '0 2px 8px rgba(99,102,241,0.25)' }}
              >
                <EditIcon /> Edit
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeactivate(deal); }}
                className="text-xs px-2.5 py-1.5 rounded-full font-bold transition-all hover:scale-105 text-white whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 2px 8px rgba(239,68,68,0.2)' }}
              >
                Close
              </button>
            </div>
          )}
        </td>

        {/* Expand toggle */}
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all"
            style={{
              background: expanded ? `${tabColor}18` : 'transparent',
              border: `1px solid ${expanded ? tabColor + '35' : 'transparent'}`,
              color: expanded ? tabColor : 'var(--text-muted)',
            }}>
            <UsersIcon />
            <span className="text-xs font-semibold hidden sm:inline">
              {expanded ? 'Hide' : 'View'}
            </span>
            <span className="transition-transform duration-200"
              style={{ display: 'inline-block', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>
              <ChevronDown />
            </span>
          </div>
        </td>
      </tr>

      {/* Expanded participants */}
      {expanded && (
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
          <td colSpan={9} style={{ padding: 0, boxShadow: `inset 4px 0 0 ${tabColor}` }}>
            <div style={{ height: 2, background: `linear-gradient(90deg, ${tabColor}, ${tabColor}00)` }} />
            <ParticipantsPanel dealId={dealKey} />
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminRealGold() {
  const [activeGroup, setActiveGroup]   = useState('REALGOLD');
  const [activeSubTab, setActiveSubTab] = useState('REALGOLD_NOTACHIEVED');
  const [deals, setDeals]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [dealFilter, setDealFilter] = useState('ALL');
  const [expandedDealId, setExpandedDealId] = useState(null);
  const [dealToClose, setDealToClose] = useState(null);
  const [closingDealLoader, setClosingDealLoader] = useState(false);

  const navigate = useNavigate();

  const handleToggle = (dealId) => {
    setExpandedDealId(prev => prev === dealId ? null : dealId);
  };

  const load = (subTabKey = activeSubTab) => {
    setLoading(true); setError(''); setDeals([]);

    const { group, subTab } = SUB_TAB_MAP[subTabKey] ?? {};
    const statusType = subTab?.statusType ?? 'NOTACHIEVED';
    getDealsByStatusType(statusType)
      .then(res => {
        const list = res?.deals ?? (Array.isArray(res) ? res : []);
        setDeals(list);
      })
      .catch(e => setError(e.message ?? 'Failed to load deals'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setExpandedDealId(null); setDealFilter('ALL'); load(activeSubTab); }, [activeSubTab]);

  const confirmManualCloseDeal = () => {
    if (!dealToClose) return;
    const dealId   = dealToClose.dealId || dealToClose.id;
    const dealName = dealToClose.dealName || 'this deal';

    setClosingDealLoader(true);
    setError('');

    closeDealManually(dealId)
      .then(() => {
        setDealToClose(null);
        alert(`Deal "${dealName}" has been deactivated successfully.`);
        load(activeSubTab);
      })
      .catch(err => {
        setError(err.message || `Failed to close "${dealName}" manually.`);
        setDealToClose(null);
      })
      .finally(() => setClosingDealLoader(false));
  };

  const currentGroup  = TAB_GROUPS.find(g => g.key === activeGroup) ?? TAB_GROUPS[0];
  const currentSubTab = SUB_TAB_MAP[activeSubTab]?.subTab ?? currentGroup.subTabs[0];
  const tabColor      = currentSubTab.color;

  const filtered = deals.filter(d => {
    const matchesSearch = !search || d.dealName?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (dealFilter === 'ACTIVE')   { if (d.dealStatus === 'ACHIEVED') return false; }
    if (dealFilter === 'ACHIEVED') { if (d.dealStatus !== 'ACHIEVED') return false; }
    if (dealFilter === 'FULL')     { const invested = d.totalParticipationAmount ?? d.dealParticipationValue ?? 0; const total = d.dealValue ?? d.dealAmount ?? 0; if (total <= 0 || invested < total) return false; }
    if (dealFilter === 'OPEN')     { const invested = d.totalParticipationAmount ?? d.dealParticipationValue ?? 0; const total = d.dealValue ?? d.dealAmount ?? 0; if (total > 0 && invested >= total) return false; }

    return d.dealType !== 'TEST' && d.globalDealType === 'REALGOLD';
  });

  // KPIs
  const totalDealValue    = filtered.reduce((s, d) => s + (d.dealValue ?? d.dealAmount ?? 0), 0);
  const totalParticipated = filtered.reduce((s, d) => s + (d.totalParticipationAmount ?? d.dealParticipationValue ?? 0), 0);
  const totalRemaining    = filtered.reduce((s, d) => s + (d.remainingDealValue ?? d.currentDealValue ?? 0), 0);
  const avgRoi            = filtered.length
    ? (filtered.reduce((s, d) => s + (d.rateofinterest ?? d.monthlyInterest ?? 0), 0) / filtered.length).toFixed(2)
    : '—';

  const kpis = [
    { label: 'Total Deals',     value: String(filtered.length),   color: tabColor  },
    { label: 'Total Deal Size', value: fmtINR(totalDealValue),    color: '#818cf8' },
    { label: 'Total Invested',  value: fmtINR(totalParticipated), color: '#10b981' },
    { label: 'Remaining',       value: fmtINR(totalRemaining),    color: '#f59e0b' },
    { label: 'Avg ROI',         value: filtered.length ? `${avgRoi}%` : '—', color: '#f59e0b' },
  ];

  return (
    <div className="grid gap-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Real Gold Deals</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Manage real gold deal participants and principal returns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            <RefreshIcon /> Refresh
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="rounded-xl px-4 py-3"
            style={{ background: `${k.color}0a`, border: `1px solid ${k.color}20` }}>
            <p className="text-xl font-extrabold" style={{ color: k.color, fontFamily: "'JetBrains Mono', monospace" }}>{k.value}</p>
            <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="grid gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 p-1 rounded-xl flex-shrink-0"
            style={{ background: 'var(--input-bg)', border: `1px solid ${currentGroup.color}25` }}>
            {currentGroup.subTabs.map(s => (
              <button key={s.key}
                onClick={() => setActiveSubTab(s.key)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={activeSubTab === s.key
                  ? { background: s.color, color: '#fff', boxShadow: `0 3px 10px ${s.color}40` }
                  : { background: 'transparent', color: 'var(--text-muted)' }}>
                {s.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search deal name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rounded-xl text-sm outline-none flex-1"
            style={{ padding: '9px 14px', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', minWidth: 200 }}
          />
          <div className="relative flex-shrink-0">
            <select
              value={dealFilter}
              onChange={e => setDealFilter(e.target.value)}
              className="rounded-xl text-sm font-semibold outline-none appearance-none pr-8 cursor-pointer"
              style={{
                padding: '9px 32px 9px 14px',
                background: dealFilter !== 'ALL' ? `${tabColor}15` : 'var(--input-bg)',
                border: `1px solid ${dealFilter !== 'ALL' ? tabColor + '50' : 'var(--border)'}`,
                color: dealFilter !== 'ALL' ? tabColor : 'var(--text-muted)',
              }}
            >
              <option value="ALL">All Deals</option>
              <option value="ACTIVE">Active</option>
              <option value="ACHIEVED">Achieved</option>
              <option value="OPEN">Has Capacity</option>
              <option value="FULL">Fully Filled</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: dealFilter !== 'ALL' ? tabColor : 'var(--text-muted)' }}>
              <ChevronDown />
            </span>
          </div>
          {!loading && (
            <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
              {filtered.length} deal{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-16 rounded-2xl"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: tabColor, borderTopColor: 'transparent' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading {currentGroup.label} · {currentSubTab.label}…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="py-10 text-center rounded-2xl"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-bold" style={{ color: '#ef4444' }}>{error}</p>
          <button onClick={() => load()}
            className="mt-3 px-4 py-2 rounded-xl text-xs font-bold"
            style={{ background: `${tabColor}15`, color: tabColor, border: `1px solid ${tabColor}30` }}>
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

          <div className="px-5 py-3.5 flex items-center gap-2"
            style={{ borderBottom: '1px solid var(--border)', background: `${tabColor}08` }}>
            <div className="w-2 h-2 rounded-full" style={{ background: tabColor, boxShadow: `0 0 6px ${tabColor}` }} />
            <h2 className="text-sm font-bold capitalize" style={{ color: 'var(--text-primary)' }}>
              {currentGroup.label} · {currentSubTab.label}
            </h2>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${tabColor}15`, color: tabColor }}>
              {filtered.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--input-bg)' }}>
                  {['#', 'Deal Name', 'Deal Value', 'Invested', 'Remaining', 'Fill %', 'ROI', 'Actions', 'Participants'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold whitespace-nowrap"
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-14 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      No {currentGroup.label} · {currentSubTab.label} deals found
                    </td>
                  </tr>
                ) : filtered.map((deal, idx) => (
                  <DealRow
                    key={deal.dealId ?? deal.id ?? idx}
                    deal={deal}
                    idx={idx}
                    tabColor={tabColor}
                    expandedId={expandedDealId}
                    onToggle={handleToggle}
                    showDeactivate={currentSubTab.statusType !== 'CLOSED'}
                    onDeactivate={setDealToClose}
                    onEdit={(d) => navigate(`/admin/create-deal/${d.dealId ?? d.id}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Manual Deal Closure Modal */}
      {dealToClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl border shadow-2xl"
            style={{ background: 'var(--surface-card)', borderColor: 'var(--border)' }}>
            <h3 className="text-lg font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Confirm Deal Closure
            </h3>
            <p className="text-xs mt-2 font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Are you sure you want to close the deal <strong className="text-red-500">"{dealToClose.dealName}"</strong> manually? This will make the deal inactive.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDealToClose(null)}
                disabled={closingDealLoader}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:bg-neutral-500/10"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmManualCloseDeal}
                disabled={closingDealLoader}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black transition-all hover:scale-105 text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 14px rgba(239,68,68,0.25)' }}
              >
                {closingDealLoader ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Closing...</span>
                  </>
                ) : (
                  <span>Close</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
