import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getAssignedParticipations,
  uploadRealGoldCollectedImage,
  updateRealGoldStatus,
} from '../../api/afterlogin-user';

// ─── Icons ────────────────────────────────────────────────────────────────────

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ width: 16, height: 16, animation: 'spin 0.8s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    ASSIGNED:  { bg: '#fef3c7', color: '#92400e', label: 'Assigned' },
    COLLECTED: { bg: '#d1fae5', color: '#065f46', label: 'Collected' },
    PENDING:   { bg: '#e0e7ff', color: '#3730a3', label: 'Pending' },
  };
  const s = map[status] ?? { bg: '#f3f4f6', color: '#374151', label: status ?? 'Unknown' };
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.03em',
    }}>
      {s.label}
    </span>
  );
}

// ─── Single participation card ────────────────────────────────────────────────

function ParticipationCard({ participation: p, collectedId, onDone }) {
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [goldType, setGoldType]   = useState(() => {
    const normalized = p.goldType?.toUpperCase();
    return normalized === '22K' || normalized === '24K' ? normalized : '';
  });
  const [comments, setComments]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const fileRef                   = useRef(null);

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setError('');
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  }

  async function handleCollect() {
    if (!file) return;
    if (!goldType) {
      setError('Please select a gold type.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await uploadRealGoldCollectedImage({
        dealId:          p.dealId,
        participationId: p.participationId,
        userId:          p.userId,
        collectedId,
        file,
      });
      await updateRealGoldStatus({
        collectedId,
        comments,
        dealId:            p.dealId,
        goldCollectedDate: new Date().toISOString(),
        goldStatus:        'COLLECTED',
        participationId:   p.participationId,
        userId:            p.userId,
        goldType,
      });
      onDone(p.participationId);
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const dealShort = p.dealId ? `${p.dealId.slice(0, 8)}…` : '—';

  return (
    <div style={{
      background:   'var(--surface-card)',
      border:       '1px solid var(--border)',
      borderRadius: 18,
      padding:      '20px 22px',
      display:      'flex',
      flexDirection:'column',
      gap:          14,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 2 }}>
            {p.userName ?? 'Unknown User'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {p.email && <div>{p.email}</div>}
            {p.mobileNumber && <div>{p.mobileNumber}</div>}
          </div>
        </div>
        <StatusBadge status={p.goldStatus} />
      </div>

      {/* Gold grams + Deal ID */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, padding: '6px 14px', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#d97706', fontWeight: 600 }}>Gold Grams</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b' }}>{p.participatedGoldGrams ?? '—'}</span>
        </div>
        <div style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '6px 14px', display: 'inline-flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Deal ID</span>
          <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{dealShort}</span>
        </div>
      </div>

      {/* Gold Type */}
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
          Gold Type
        </label>
        <select
          value={goldType}
          onChange={e => { setGoldType(e.target.value); setError(''); }}
          style={{
            width:        '100%',
            borderRadius: 10,
            padding:      '8px 12px',
            fontSize:     13,
            fontWeight:   600,
            background:   'var(--input-bg)',
            border:       '1px solid var(--border)',
            color:        'var(--text-primary)',
            outline:      'none',
            boxSizing:    'border-box',
            cursor:       'pointer',
          }}
        >
          <option value="">Select Gold Type</option>
          <option value="22K">22K</option>
          <option value="24K">24K</option>
        </select>
      </div>

      {/* Comments */}
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
          Comments <span style={{ fontWeight: 400 }}>(optional)</span>
        </label>
        <textarea
          value={comments}
          onChange={e => setComments(e.target.value)}
          rows={2}
          placeholder="Add collection notes…"
          style={{
            width:        '100%',
            borderRadius: 10,
            padding:      '8px 12px',
            fontSize:     13,
            background:   'var(--input-bg)',
            border:       '1px solid var(--border)',
            color:        'var(--text-primary)',
            outline:      'none',
            resize:       'vertical',
            boxSizing:    'border-box',
            fontFamily:   'inherit',
          }}
        />
      </div>

      {/* Image upload area */}
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {!preview ? (
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:          6,
              background:   '#f59e0b',
              color:        '#fff',
              border:       'none',
              borderRadius: 10,
              padding:      '8px 18px',
              fontWeight:   700,
              fontSize:     13,
              cursor:       'pointer',
            }}
          >
            <CameraIcon /> Upload Photo
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <img
              src={preview}
              alt="preview"
              style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }}
            />
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{file.name}</div>
            <button
              onClick={() => fileRef.current?.click()}
              style={{ background: 'none', border: 'none', color: '#f59e0b', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: 0, textAlign: 'left' }}
            >
              Change Photo
            </button>
          </div>
        )}
      </div>

      {/* Collect button — only shown after image selected */}
      {file && (
        <button
          onClick={handleCollect}
          disabled={submitting}
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            6,
            background:     submitting ? '#6ee7b7' : '#10b981',
            color:          '#fff',
            border:         'none',
            borderRadius:   10,
            padding:        '10px 20px',
            fontWeight:     700,
            fontSize:       14,
            cursor:         submitting ? 'not-allowed' : 'pointer',
            transition:     'background 0.2s',
          }}
        >
          {submitting ? <SpinnerIcon /> : <CheckIcon />}
          {submitting ? 'Submitting…' : 'Mark as Collected'}
        </button>
      )}

      {/* Inline error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#b91c1c' }}>
          {error}
        </div>
      )}
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function CollectedDashboard() {
  const { user, logout } = useAuth();
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [fetchError, setFetchError]         = useState('');
  const [toast, setToast]                   = useState('');

  async function load() {
    if (!user?.userId) return;
    setLoading(true);
    setFetchError('');
    try {
      const data = await getAssignedParticipations(user.userId);
      const list = Array.isArray(data) ? data : (data?.content ?? []);
      setParticipations(list.filter(p => p.goldStatus !== 'COLLECTED' && p.goldStatus !== 'APPROVED'));
    } catch (err) {
      setFetchError(err.message ?? 'Failed to load participations.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [user?.userId]);

  function handleCardDone(participationId) {
    setParticipations(prev => prev.filter(p => p.participationId !== participationId));
    setToast('Participation marked as collected!');
    setTimeout(() => setToast(''), 3500);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', fontFamily: 'inherit' }}>
      {/* Top bar */}
      <div style={{
        position:   'sticky',
        top:        0,
        zIndex:     100,
        background: 'var(--surface-card)',
        borderBottom: '1px solid var(--border)',
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding:    '0 24px',
        height:     60,
        gap:        16,
      }}>
        {/* Left accent + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 4, height: 32, borderRadius: 4,
            background: 'linear-gradient(180deg,#f59e0b,#d97706)',
          }} />
          <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Real Gold Collection
          </span>
        </div>

        {/* Agent name + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {user?.name && (
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
              {user.name}
            </span>
          )}
          <button
            onClick={logout}
            style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:          6,
              background:   'transparent',
              border:       '1px solid var(--border)',
              borderRadius: 8,
              padding:      '6px 14px',
              fontWeight:   600,
              fontSize:     13,
              color:        'var(--text-primary)',
              cursor:       'pointer',
            }}
          >
            <LogoutIcon /> Logout
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position:   'fixed',
          top:        72,
          left:       '50%',
          transform:  'translateX(-50%)',
          zIndex:     200,
          background: '#10b981',
          color:      '#fff',
          padding:    '10px 24px',
          borderRadius: 12,
          fontWeight: 700,
          fontSize:   14,
          boxShadow:  '0 4px 20px rgba(16,185,129,0.4)',
        }}>
          {toast}
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px' }}>
        {/* Section header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
            Assigned Participations
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
            Upload a photo and mark each participation as collected.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{
              width: 36, height: 36, border: '3px solid var(--border)',
              borderTopColor: '#f59e0b', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        )}

        {/* Error */}
        {!loading && fetchError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '20px 24px', textAlign: 'center' }}>
            <div style={{ color: '#b91c1c', fontWeight: 600, marginBottom: 12 }}>{fetchError}</div>
            <button
              onClick={load}
              style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !fetchError && participations.length === 0 && (
          <div style={{
            background: 'var(--surface-card)',
            border:     '1px solid var(--border)',
            borderRadius: 16,
            padding:    '48px 24px',
            textAlign:  'center',
            color:      'var(--text-muted)',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>
              All done!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No pending participations assigned to you.</div>
          </div>
        )}

        {/* Cards grid */}
        {!loading && !fetchError && participations.length > 0 && (
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap:                 20,
          }}>
            {participations.map(p => (
              <ParticipationCard
                key={p.participationId}
                participation={p}
                collectedId={user.userId}
                onDone={handleCardDone}
              />
            ))}
          </div>
        )}
      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
