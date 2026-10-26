import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL, getToken, getUserId, get } from '../../api/client';
import FilePreviewModal from '../../components/FilePreviewModal';

// ─── Icons ────────────────────────────────────────────────────────────────────
const I = {
  MessageSq:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Clock:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  CheckCircle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  XCircle:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  AlertCircle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  ChevronDown: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="6 9 12 15 18 9"/></svg>,
  Send:        () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  User:        () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Paperclip:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
  Eye:         () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Refresh:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>,
  Calendar:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Shield:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  RefreshCw:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  UserCircle:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M6.168 18.849A4 4 0 0 1 10 17h4a4 4 0 0 1 3.832 1.849"/></svg>,
  TrendingUp:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  ArrowLeft:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Phone:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l1-1a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Mail:        () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Hash:        () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  DollarSign:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Layers:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
};

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_TABS = [
  { value: 'PENDING',   label: 'Pending',   color: '#f58311', bg: 'rgba(245,131,17,0.1)',  border: 'rgba(245,131,17,0.25)'  },
  { value: 'COMPLETED', label: 'Completed', color: '#35a13e', bg: 'rgba(53,161,62,0.1)',   border: 'rgba(53,161,62,0.25)'   },
  { value: 'CANCELLED', label: 'Cancelled', color: '#e95330', bg: 'rgba(233,83,48,0.1)',   border: 'rgba(233,83,48,0.25)'   },
];

const CATEGORY_TABS = [
  { value: 'ULP',       label: 'ULP',       color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.25)'  },
  { value: 'OXYLOANS',  label: 'OxyLoans',  color: '#2673bb', bg: 'rgba(38,115,187,0.1)',  border: 'rgba(38,115,187,0.25)'  },
  { value: 'OXYBRICKS', label: 'OxyBricks', color: '#f58311', bg: 'rgba(245,131,17,0.1)',  border: 'rgba(245,131,17,0.25)'  },
  { value: 'OFFLINE',   label: 'Offline',   color: '#35a13e', bg: 'rgba(53,161,62,0.1)',   border: 'rgba(53,161,62,0.25)'   },
];

const statusStyle = {
  PENDING:   { bg: 'rgba(245,131,17,0.1)',  color: '#f58311', border: 'rgba(245,131,17,0.22)', Icon: I.Clock,       label: 'Pending'   },
  COMPLETED: { bg: 'rgba(53,161,62,0.1)',   color: '#35a13e', border: 'rgba(53,161,62,0.22)',  Icon: I.CheckCircle, label: 'Completed' },
  CANCELLED: { bg: 'rgba(233,83,48,0.1)',   color: '#e95330', border: 'rgba(233,83,48,0.22)',  Icon: I.XCircle,     label: 'Cancelled' },
  REOPEN:    { bg: 'rgba(139,92,246,0.1)',  color: '#8b5cf6', border: 'rgba(139,92,246,0.22)', Icon: I.RefreshCw,   label: 'Reopened'  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const s = statusStyle[status] ?? statusStyle.PENDING;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <s.Icon />{s.label ?? status}
    </span>
  );
}

// Open document in modal — used by RespondModal and ticket rows
function useFilePreview() {
  const [previewUrl,  setPreviewUrl]  = useState(null);
  const [previewName, setPreviewName] = useState('');
  const open  = (url, name) => { setPreviewUrl(url); setPreviewName(name ?? ''); };
  const close = () => setPreviewUrl(null);
  return { previewUrl, previewName, open, close };
}

/** "2026-09-11 12:14:14.082" → "11 Sep 2026, 12:14 PM" */
function fmtDate(str) {
  if (!str) return '—';
  try {
    const d = new Date(str.replace(' ', 'T'));
    if (isNaN(d)) return str.slice(0, 10);
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch { return str.slice(0, 10); }
}

/** parse date string → numeric timestamp for sorting */
function toTs(raw) {
  if (!raw) return 0;
  try { return new Date(raw.replace(' ', 'T')).getTime() || 0; }
  catch { return 0; }
}

// ─── Conversation Timeline ────────────────────────────────────────────────────
/**
 * Same logic as ContactUs.jsx — builds one unified sorted event array.
 *
 * ticket.updatedAt  = true first-submission time (backend never overwrites it)
 * ticket.createdAt  = gets overwritten on reopen → unreliable for original query
 * ticket.comments   = admin's FIRST close comment
 * ticket.resolvedOn = timestamp of first close
 * userPendingQueries = every action after first close, sorted by resolvedOn asc
 */
function ConversationTimeline({ ticket }) {
  const ES = {
    PENDING:   { color: '#f58311', bg: 'rgba(245,131,17,0.08)',  border: 'rgba(245,131,17,0.2)',  label: 'Pending'   },
    COMPLETED: { color: '#35a13e', bg: 'rgba(53,161,62,0.08)',   border: 'rgba(53,161,62,0.2)',   label: 'Resolved'  },
    CANCELLED: { color: '#e95330', bg: 'rgba(233,83,48,0.08)',   border: 'rgba(233,83,48,0.2)',   label: 'Cancelled' },
    REOPEN:    { color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.2)',  label: 'Reopened'  },
    QUERY:     { color: '#a855f7', bg: 'rgba(168,85,247,0.08)',  border: 'rgba(168,85,247,0.2)',  label: 'Query'     },
  };

  // ── build unified sorted event list ────────────────────────────────────────
  const events = [];

  // 1️⃣  Original query
  //  updatedAt = actual creation time (never overwritten)
  //  createdAt = gets set to reopen timestamp — don't use for original
  const allTs = [
    toTs(ticket.createdAt),
    toTs(ticket.resolvedOn),
    ...(ticket.userPendingQueries ?? []).map(e => toTs(e.resolvedOn || e.createdAt)),
  ].filter(t => t > 0);
  const earliestTs   = allTs.length ? Math.min(...allTs) : toTs(ticket.createdAt);
  const originalTs   = toTs(ticket.updatedAt) > 0 ? toTs(ticket.updatedAt) : earliestTs;
  const originalDate = toTs(ticket.updatedAt) > 0 ? ticket.updatedAt : ticket.createdAt;

  events.push({
    _type: 'query', by: 'user', status: 'QUERY',
    text: ticket.query, dateRaw: originalDate, ts: originalTs,
  });

  // 2️⃣  Top-level admin first close (ticket.comments)
  if (ticket.comments && ticket.resolvedOn) {
    events.push({
      _type: 'toplevel', by: 'admin', status: 'COMPLETED',
      text: ticket.comments, dateRaw: ticket.resolvedOn, ts: toTs(ticket.resolvedOn),
    });
  }

  // 3️⃣  All userPendingQueries entries
  (ticket.userPendingQueries ?? []).forEach(entry => {
    const dateRaw = entry.resolvedOn || entry.createdAt;
    events.push({
      _type: 'pending', by: entry.resolvedBy ?? 'user',
      status: entry.queryStatus ?? 'PENDING',
      text: entry.pendingComments ?? '', dateRaw, ts: toTs(dateRaw),
    });
  });

  // 4️⃣  Sort by timestamp ascending
  events.sort((a, b) => a.ts - b.ts);

  if (events.length === 0) return null;

  const renderBubble = (ev, idx) => {
    const byAdmin     = ev.by === 'admin';
    const es          = ES[ev.status] ?? ES['PENDING'];
    const isOriginal  = ev._type === 'query';
    const isReopen    = ev.status === 'REOPEN';

    // admin → purple (to match admin theme); user → blue
    const avatarColor  = byAdmin ? '#a855f7'               : '#2673bb';
    const avatarBg     = byAdmin ? 'rgba(168,85,247,0.12)' : 'rgba(38,115,187,0.12)';
    const avatarBorder = byAdmin ? 'rgba(168,85,247,0.3)'  : 'rgba(38,115,187,0.3)';
    const bubbleBg     = byAdmin ? 'rgba(168,85,247,0.06)' : 'rgba(38,115,187,0.06)';
    const bubbleBorder = byAdmin ? 'rgba(168,85,247,0.15)' : 'rgba(38,115,187,0.15)';

    return (
      <div key={idx}>
        {/* REOPEN divider */}
        {isReopen && (
          <div className="flex items-center gap-2 my-1">
            <div className="flex-1 h-px" style={{ background: 'rgba(139,92,246,0.25)' }} />
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.3)' }}>
              ↩ Ticket Reopened
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(139,92,246,0.25)' }} />
          </div>
        )}

        <div className="flex gap-3 items-start relative">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 mt-0.5"
            style={{ background: avatarBg, border: `1px solid ${avatarBorder}`, color: avatarColor }}>
            {byAdmin ? <I.Shield /> : <I.User />}
          </div>

          {/* Bubble */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="text-xs font-bold" style={{ color: avatarColor }}>
                {byAdmin ? 'Support Team (Admin)' : (ticket.name ?? 'User')}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: avatarBg, color: avatarColor, border: `1px solid ${avatarBorder}` }}>
                {byAdmin ? 'Admin' : 'User'}
              </span>
              {!isOriginal && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                  style={{ background: es.bg, color: es.color, border: `1px solid ${es.border}` }}>
                  {es.label}
                </span>
              )}
              {isOriginal && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                  style={{ background: 'rgba(168,85,247,0.08)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)' }}>
                  New Ticket
                </span>
              )}
              <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                {fmtDate(ev.dateRaw)}
              </span>
            </div>
            <div className="rounded-xl px-4 py-3 text-sm"
              style={{ background: bubbleBg, border: `1px solid ${bubbleBorder}`, color: 'var(--text-primary)' }}>
              {ev.text || <em style={{ color: 'var(--text-muted)' }}>No message</em>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const onlyOriginalQuery = events.length === 1;

  return (
    <div className="grid gap-1">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          Conversation · {events.length} event{events.length !== 1 ? 's' : ''}
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      <div className="relative grid gap-3 pl-2">
        {/* Vertical connector */}
        <div className="absolute left-5 top-4 bottom-4 w-px" style={{ background: 'var(--border)' }} />

        {events.map((ev, i) => renderBubble(ev, i))}

        {/* Awaiting — only when just the original query exists */}
        {onlyOriginalQuery && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl ml-11"
            style={{ background: 'rgba(245,131,17,0.06)', border: '1px solid rgba(245,131,17,0.15)' }}>
            <I.Clock />
            <p className="text-xs font-semibold" style={{ color: '#f58311' }}>No response yet — awaiting admin action</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin User Profile Modal ─────────────────────────────────────────────────
function AdminUserProfileModal({ userId, userName, onClose }) {
  const [profile,      setProfile]      = useState(null);
  const [profileLoad,  setProfileLoad]  = useState(true);
  const [profileErr,   setProfileErr]   = useState('');

  const [showDeals,    setShowDeals]    = useState(false);
  const [deals,        setDeals]        = useState([]);
  const [dealsLoad,    setDealsLoad]    = useState(false);
  const [dealsErr,     setDealsErr]     = useState('');
  const [dealsFetched, setDealsFetched] = useState(false);

  const [showMigrated,    setShowMigrated]    = useState(false);
  const [migrated,        setMigrated]        = useState([]);
  const [migratedLoad,    setMigratedLoad]    = useState(false);
  const [migratedErr,     setMigratedErr]     = useState('');
  const [migratedFetched, setMigratedFetched] = useState(false);

  // ── Fetch profile ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) { setProfileErr('No user ID'); setProfileLoad(false); return; }
    setProfileLoad(true);
    get(`/student-service/user/profile?id=${userId}`)
      .then(data => { setProfile(data); setProfileLoad(false); })
      .catch(err  => { setProfileErr(err?.message ?? 'Failed to load profile'); setProfileLoad(false); });
  }, [userId]);

  // ── Fetch running deals ──────────────────────────────────────────────────
  const fetchDeals = () => {
    if (dealsFetched) { setShowDeals(true); return; }
    setDealsLoad(true);
    setDealsErr('');
    get(`/oxybrick-service/getRunningDeals/${userId}`)
      .then(data => {
        const list = data?.participationInfo ?? (Array.isArray(data) ? data : []);
        setDeals(list);
        setDealsFetched(true);
        setDealsLoad(false);
        setShowDeals(true);
      })
      .catch(err => {
        setDealsErr(err?.message ?? 'Failed to load deals');
        setDealsLoad(false);
        setShowDeals(true);
      });
  };

  // ── Fetch migrated / offline deals ───────────────────────────────────────
  const fetchMigrated = () => {
    if (migratedFetched) { setShowMigrated(true); return; }
    setMigratedLoad(true);
    setMigratedErr('');
    get(`/oxybrick-service/userOfflineParticipationDealsInfo/${userId}`)
      .then(data => {
        const raw = Array.isArray(data) ? data : [];
        // Group by dealName|roi — same logic as MyParticipations mergeMigratedByRoi
        const groups = new Map();
        raw.forEach(item => {
          const cur = Number(item?.currentPrincipalAmount ?? 0);
          if (!(cur > 0)) return;
          const key = `${item?.dealName ?? 'Unknown'}|${item?.roi ?? 0}`;
          if (!groups.has(key)) {
            groups.set(key, {
              dealName: item?.dealName ?? 'Unknown',
              roi: Number(item?.roi ?? 0),
              payOutType: item?.payOutType ?? null,
              earliestDate: item?.participationDate || item?.participatedDate || null,
              entries: [],
            });
          }
          const g = groups.get(key);
          g.entries.push(item);
          g.payOutType = g.payOutType ?? item?.payOutType ?? null;
        });
        const grouped = Array.from(groups.values()).map(g => ({
          ...g,
          participationAmount: g.entries.reduce((s, e) => s + Number(e?.currentPrincipalAmount ?? 0), 0),
          returnedAmount:      g.entries.reduce((s, e) => s + Number(e?.principalReturnedAmount ?? 0), 0),
          entryCount: g.entries.length,
        }));
        setMigrated(grouped);
        setMigratedFetched(true);
        setMigratedLoad(false);
        setShowMigrated(true);
      })
      .catch(err => {
        setMigratedErr(err?.message ?? 'Failed to load migrated deals');
        setMigratedLoad(false);
        setShowMigrated(true);
      });
  };

  const fmt = (v) => v || '—';
  const fmtAmt = (v) => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '—';

  // helper: profile field rows
  const profileFields = profile ? [
    { label: 'Full Name',    value: fmt([profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ')) },
    { label: 'Email',        value: fmt(profile.email)          },
    { label: 'Mobile',       value: fmt(profile.mobileNumber)   },
    { label: 'Alt. Mobile',  value: fmt(profile.alternativeMobile) },
    { label: 'Gender',       value: fmt(profile.gender)         },
    { label: 'Lender ID',    value: fmt(profile.lrId ?? profile.userId) },
    { label: 'KYC Status',   value: fmt(profile.kycStatus)      },
    { label: 'Pan Number',   value: fmt(profile.panNumber)      },
    { label: 'Aadhaar',      value: fmt(profile.aadhaarNumber)  },
    { label: 'City',         value: fmt(profile.city)           },
    { label: 'State',        value: fmt(profile.state)          },
    { label: 'Pincode',      value: fmt(profile.pincode)        },
  ] : [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col"
        style={{
          background: 'var(--surface-card)',
          border: '1px solid rgba(38,115,187,0.3)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          maxHeight: '90vh',
        }}
        onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(38,115,187,0.05)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(38,115,187,0.12)', border: '1px solid rgba(38,115,187,0.25)', color: '#2673bb' }}>
              <I.UserCircle />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#2673bb' }}>User Profile</p>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{userName || 'User'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 p-6 grid gap-5">

          {/* Profile loading */}
          {profileLoad && (
            <div className="flex items-center justify-center gap-3 py-10">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="#2673bb" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
              </svg>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading profile…</span>
            </div>
          )}

          {/* Profile error */}
          {!profileLoad && profileErr && (
            <div className="py-8 text-center rounded-xl"
              style={{ background: 'rgba(233,83,48,0.06)', border: '1px solid rgba(233,83,48,0.2)' }}>
              <p className="text-sm font-semibold" style={{ color: '#e95330' }}>{profileErr}</p>
            </div>
          )}

          {/* Profile fields */}
          {!profileLoad && profile && (
            <div className="grid gap-3">
              {/* Avatar strip */}
              <div className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: 'rgba(38,115,187,0.05)', border: '1px solid rgba(38,115,187,0.15)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(38,115,187,0.12)', border: '2px solid rgba(38,115,187,0.25)', color: '#2673bb', fontSize: 24, fontWeight: 800 }}>
                  {(profile.firstName?.[0] ?? profile.name?.[0] ?? 'U').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>
                    {[profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ') || profile.name || 'User'}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{profile.email || '—'}</p>
                  {profile.kycStatus && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: profile.kycStatus === 'APPROVED' ? 'rgba(53,161,62,0.1)' : 'rgba(245,131,17,0.1)',
                        color:      profile.kycStatus === 'APPROVED' ? '#35a13e' : '#f58311',
                        border:     `1px solid ${profile.kycStatus === 'APPROVED' ? 'rgba(53,161,62,0.25)' : 'rgba(245,131,17,0.25)'}`,
                      }}>
                      {profile.kycStatus === 'APPROVED' ? <I.CheckCircle /> : <I.AlertCircle />}
                      KYC {profile.kycStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Fields grid */}
              <div className="grid sm:grid-cols-2 gap-2">
                {profileFields.map(f => f.value !== '—' && (
                  <div key={f.label} className="px-3 py-2.5 rounded-xl"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                    <p className="text-xs font-semibold break-all" style={{ color: 'var(--text-primary)' }}>{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── View Running Deals button / section ── */}
          {!profileLoad && !profileErr && (
            <div className="grid gap-3">
              {/* Both buttons side-by-side */}
              <div className="flex gap-2">
                <button onClick={fetchDeals} disabled={dealsLoad}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#35a13e,#1a7a26)', color: '#fff', boxShadow: '0 4px 14px rgba(53,161,62,0.3)' }}>
                  {dealsLoad
                    ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                    : <I.TrendingUp />}
                  {dealsLoad ? 'Loading…' : showDeals ? 'Refresh Running' : 'View Running Deals'}
                </button>
                <button onClick={fetchMigrated} disabled={migratedLoad}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', boxShadow: '0 4px 14px rgba(245,158,11,0.3)' }}>
                  {migratedLoad
                    ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                    : <I.Layers />}
                  {migratedLoad ? 'Loading…' : showMigrated ? 'Refresh Migrated' : 'View Migrated Deals'}
                </button>
              </div>

              {/* Deals error */}
              {showDeals && dealsErr && (
                <div className="py-6 text-center rounded-xl"
                  style={{ background: 'rgba(233,83,48,0.06)', border: '1px solid rgba(233,83,48,0.2)' }}>
                  <p className="text-sm font-semibold" style={{ color: '#e95330' }}>{dealsErr}</p>
                </div>
              )}

              {/* Deals list */}
              {showDeals && !dealsErr && deals.length === 0 && (
                <div className="py-8 text-center rounded-xl"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                  <p className="text-2xl mb-2">📭</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No running deals</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>This user has no active participations</p>
                </div>
              )}

              {showDeals && !dealsErr && deals.length > 0 && (
                <div className="grid gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(53,161,62,0.1)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.25)' }}>
                      Running Deals · {deals.length}
                    </span>
                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  </div>

                  {deals.map((deal, i) => {
                    const topups = deal.updatedParticipation ?? [];
                    const initialAmt = Number(deal.participatedAmount ?? 0);
                    const totalInvested = initialAmt + topups.reduce((s, u) => s + Number(u.updationParticipation ?? 0), 0);

                    const PAYOUT_LABEL = {
                      MONTHLY: 'Monthly', QUARTELY: 'Quarterly',
                      HALFLY: 'Half-Yearly', YEARLY: 'Yearly', ENDOFTHEDEAL: 'End of Deal',
                    };
                    const payoutLabel = PAYOUT_LABEL[deal.amountTye] ?? deal.amountTye ?? '—';

                    // Build all rows for the investment breakdown table:
                    // row 0 = Initial, then each top-up, with running cumulative total
                    const allRows = [
                      {
                        label: 'Initial',
                        date:   deal.participatedDate,
                        added:  initialAmt,
                        roi:    deal.rateOfInterest,
                        payout: payoutLabel,
                        cumulative: initialAmt,
                        isInitial: true,
                      },
                      ...topups.map((u, ui) => {
                        const running = initialAmt + topups.slice(0, ui + 1).reduce((s, x) => s + Number(x.updationParticipation ?? 0), 0);
                        return {
                          label: `Top-up #${ui + 1}`,
                          date:   u.updatedDate,
                          added:  Number(u.updationParticipation ?? 0),
                          roi:    u.rateOfInterest ?? deal.rateOfInterest,
                          payout: PAYOUT_LABEL[u.amountTye] ?? u.amountTye ?? payoutLabel,
                          cumulative: running,
                          isInitial: false,
                        };
                      }),
                    ];

                    return (
                      <div key={deal.dealId ?? i} className="rounded-xl overflow-hidden"
                        style={{ background: 'rgba(53,161,62,0.04)', border: '1px solid rgba(53,161,62,0.2)' }}>

                        {/* ── Deal header ── */}
                        <div className="flex items-center justify-between gap-2 px-4 py-3 flex-wrap"
                          style={{ borderBottom: '1px solid rgba(53,161,62,0.12)', background: 'rgba(53,161,62,0.06)' }}>
                          <div className="flex items-center gap-2 min-w-0">
                            <I.Layers />
                            <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                              {deal.dealName || `Deal #${i + 1}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(53,161,62,0.12)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.25)' }}>
                              Active
                            </span>
                            {deal.amountTye && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.25)' }}>
                                {payoutLabel}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* ── Total Investment banner + chip cards ── */}
                        <div className="mx-3 mt-3 grid gap-2">
                          {/* Total Investment */}
                          <div className="px-4 py-3 rounded-xl flex items-center justify-between gap-3"
                            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.22)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total Investment</p>
                            <p className="text-xl font-extrabold" style={{ color: '#6366f1', fontFamily: "'JetBrains Mono',monospace" }}>
                              {fmtAmt(totalInvested)}
                            </p>
                          </div>
                          {/* ROI · Since · Entries — one chip each */}
                          <div className="flex gap-2 flex-wrap">
                            {[
                              { label: 'ROI',     value: deal.rateOfInterest != null ? `${deal.rateOfInterest}%` : '—', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.22)'  },
                              { label: 'Since',   value: fmt(deal.participatedDate),                                     color: '#35a13e', bg: 'rgba(53,161,62,0.08)',   border: 'rgba(53,161,62,0.22)'   },
                              { label: 'Entries', value: String(allRows.length),                                         color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.22)' },
                            ].map(c => (
                              <div key={c.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                                style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.label}</span>
                                <span className="text-xs font-bold" style={{ color: c.color }}>{c.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ── Investment breakdown table (Initial + Top-ups) ── */}
                        <div className="mx-3 my-3 rounded-xl overflow-hidden"
                          style={{ border: '1px solid rgba(99,102,241,0.18)' }}>
                          <div className="px-3 py-2 flex items-center justify-between"
                            style={{ background: 'rgba(99,102,241,0.06)', borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
                            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6366f1' }}>
                              Investment Breakdown
                            </p>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}>
                              {allRows.length} {allRows.length === 1 ? 'entry' : 'entries'}
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs" style={{ minWidth: 360 }}>
                              <thead>
                                <tr style={{ background: 'var(--table-header-bg)', borderBottom: '1px solid var(--border)' }}>
                                  {['Type', 'Date', 'Amount Added', 'ROI'].map(h => (
                                    <th key={h} className="text-left py-2 px-3 font-bold uppercase tracking-wider whitespace-nowrap"
                                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {allRows.map((row, ri) => (
                                  <tr key={ri} style={{ borderTop: ri > 0 ? '1px solid var(--border)' : 'none' }}>
                                    {/* Type badge */}
                                    <td className="py-2.5 px-3">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full font-bold"
                                        style={{
                                          background: row.isInitial ? 'rgba(53,161,62,0.1)'  : 'rgba(99,102,241,0.1)',
                                          color:      row.isInitial ? '#35a13e'               : '#6366f1',
                                          border:     `1px solid ${row.isInitial ? 'rgba(53,161,62,0.25)' : 'rgba(99,102,241,0.25)'}`,
                                        }}>
                                        {row.label}
                                      </span>
                                    </td>
                                    {/* Date */}
                                    <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                                      {fmt(row.date)}
                                    </td>
                                    {/* Amount added */}
                                    <td className="py-2.5 px-3 font-bold whitespace-nowrap"
                                      style={{ color: row.isInitial ? '#35a13e' : '#6366f1', fontFamily: "'JetBrains Mono',monospace" }}>
                                      {fmtAmt(row.added)}
                                    </td>
                                    {/* ROI */}
                                    <td className="py-2.5 px-3 font-semibold" style={{ color: '#f59e0b' }}>
                                      {row.roi != null ? `${row.roi}%` : '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              {/* Total footer row */}
                              <tfoot>
                                <tr style={{ borderTop: '2px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.05)' }}>
                                  <td colSpan={2} className="py-2.5 px-3 text-xs font-black uppercase tracking-wider"
                                    style={{ color: '#6366f1' }}>Total Investment</td>
                                  <td className="py-2.5 px-3 font-black whitespace-nowrap"
                                    style={{ color: '#6366f1', fontFamily: "'JetBrains Mono',monospace" }}>
                                    {fmtAmt(totalInvested)}
                                  </td>
                                  <td />
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

              {/* Migrated error */}
              {showMigrated && migratedErr && (
                <div className="py-6 text-center rounded-xl"
                  style={{ background: 'rgba(233,83,48,0.06)', border: '1px solid rgba(233,83,48,0.2)' }}>
                  <p className="text-sm font-semibold" style={{ color: '#e95330' }}>{migratedErr}</p>
                </div>
              )}

              {/* Migrated empty */}
              {showMigrated && !migratedErr && migrated.length === 0 && (
                <div className="py-8 text-center rounded-xl"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                  <p className="text-2xl mb-2">📂</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No migrated deals</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>No offline/migrated participation found</p>
                </div>
              )}

              {/* Migrated list */}
              {showMigrated && !migratedErr && migrated.length > 0 && (
                <div className="grid gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                      Migrated Deals · {migrated.length}
                    </span>
                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  </div>

                  {migrated.map((d, i) => (
                    <div key={`${d.dealName}-${i}`} className="rounded-xl overflow-hidden"
                      style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.2)' }}>

                      {/* ── Deal header ── */}
                      <div className="flex items-center justify-between gap-2 px-4 py-3 flex-wrap"
                        style={{ borderBottom: '1px solid rgba(245,158,11,0.12)', background: 'rgba(245,158,11,0.06)' }}>
                        <div className="flex items-center gap-2 min-w-0">
                          <I.Layers />
                          <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                            {d.dealName}
                          </p>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                          Migrated
                        </span>
                      </div>

                      {/* ── Total banner ── */}
                      <div className="mx-3 mt-3 grid gap-2">
                        <div className="px-4 py-3 rounded-xl flex items-center justify-between gap-3"
                          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.22)' }}>
                          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Current Principal</p>
                          <p className="text-xl font-extrabold" style={{ color: '#f59e0b', fontFamily: "'JetBrains Mono',monospace" }}>
                            {fmtAmt(d.participationAmount)}
                          </p>
                        </div>
                        {/* ROI · Since · Entries chips */}
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { label: 'ROI',      value: `${d.roi}%`,           color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.22)'  },
                            { label: 'Since',    value: fmt(d.earliestDate),   color: '#35a13e', bg: 'rgba(53,161,62,0.08)',   border: 'rgba(53,161,62,0.22)'   },
                            { label: 'Entries',  value: String(d.entryCount),  color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.22)' },
                            { label: 'Payout',   value: fmt(d.payOutType),     color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.22)' },
                            { label: 'Returned', value: fmtAmt(d.returnedAmount), color: '#2673bb', bg: 'rgba(38,115,187,0.08)', border: 'rgba(38,115,187,0.22)' },
                          ].map(c => (
                            <div key={c.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                              style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.label}</span>
                              <span className="text-xs font-bold" style={{ color: c.color }}>{c.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ── Entry breakdown table ── */}
                      <div className="mx-3 my-3 rounded-xl overflow-hidden"
                        style={{ border: '1px solid rgba(245,158,11,0.18)' }}>
                        <div className="px-3 py-2 flex items-center justify-between"
                          style={{ background: 'rgba(245,158,11,0.06)', borderBottom: '1px solid rgba(245,158,11,0.12)' }}>
                          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#f59e0b' }}>
                            Entry Breakdown
                          </p>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                            {d.entries.length} {d.entries.length === 1 ? 'entry' : 'entries'}
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs" style={{ minWidth: 480 }}>
                            <thead>
                              <tr style={{ background: 'var(--table-header-bg)', borderBottom: '1px solid var(--border)' }}>
                                {['Date', 'Participation', 'Current Principal', 'Returned', 'ROI', 'Payout'].map(h => (
                                  <th key={h} className="text-left py-2 px-3 font-bold uppercase tracking-wider whitespace-nowrap"
                                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {d.entries.map((entry, ei) => (
                                <tr key={ei} style={{ borderTop: ei > 0 ? '1px solid var(--border)' : 'none' }}>
                                  <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                                    {fmt(entry?.participationDate || entry?.participatedDate)}
                                  </td>
                                  <td className="py-2.5 px-3 font-bold whitespace-nowrap"
                                    style={{ color: '#6366f1', fontFamily: "'JetBrains Mono',monospace" }}>
                                    {fmtAmt(entry?.participationAmount)}
                                  </td>
                                  <td className="py-2.5 px-3 font-bold whitespace-nowrap"
                                    style={{ color: '#35a13e', fontFamily: "'JetBrains Mono',monospace" }}>
                                    {fmtAmt(entry?.currentPrincipalAmount)}
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold whitespace-nowrap"
                                    style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono',monospace" }}>
                                    {entry?.principalReturnedAmount == null ? '—' : fmtAmt(entry.principalReturnedAmount)}
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold" style={{ color: '#f59e0b' }}>
                                    {entry?.roi != null ? `${entry.roi}%` : '—'}
                                  </td>
                                  <td className="py-2.5 px-3" style={{ color: 'var(--text-muted)' }}>
                                    {fmt(entry?.payOutType)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr style={{ borderTop: '2px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.05)' }}>
                                <td className="py-2.5 px-3 text-xs font-black uppercase tracking-wider"
                                  style={{ color: '#f59e0b' }}>Total</td>
                                <td className="py-2.5 px-3 font-black whitespace-nowrap"
                                  style={{ color: '#6366f1', fontFamily: "'JetBrains Mono',monospace" }}>
                                  {fmtAmt(d.entries.reduce((s, e) => s + Number(e?.participationAmount ?? 0), 0))}
                                </td>
                                <td className="py-2.5 px-3 font-black whitespace-nowrap"
                                  style={{ color: '#35a13e', fontFamily: "'JetBrains Mono',monospace" }}>
                                  {fmtAmt(d.participationAmount)}
                                </td>
                                <td className="py-2.5 px-3 font-black whitespace-nowrap"
                                  style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono',monospace" }}>
                                  {fmtAmt(d.returnedAmount)}
                                </td>
                                <td colSpan={2} />
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Respond Modal ────────────────────────────────────────────────────────────
function RespondModal({ ticket, onClose, onDone, onPreview }) {
  const [comments,      setComments]      = useState('');
  const [commentsError, setCommentsError] = useState('');
  const [documentId,    setDocumentId]    = useState('');
  const [fileName,      setFileName]      = useState('');
  const [uploadStatus,  setUploadStatus]  = useState('idle');
  const [approveLoader, setApproveLoader] = useState(false);

  const token = getToken();

  // user doc from nested object
  const userDoc = ticket.userQueryDocumentStatus;
  const userFilePath = userDoc?.filePath;
  const userFileName = userDoc?.fileName;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadStatus('loading');
    setFileName(file.name);
    const formData = new FormData();
    formData.append('multiPart', file);
    formData.append('fileType', 'kyc');
    axios.post(
      `https://meta.oxyloans.com/api/common-upload-service/uploadQueryScreenShot?userId=${ticket.userId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data', accessToken: `Bearer ${token}` } }
    )
      .then(res => { setDocumentId(res.data.id); toast.success('Document uploaded'); setUploadStatus('uploaded'); })
      .catch(err => { toast.error(err?.response?.data?.error ?? 'Upload failed'); setUploadStatus('Failed'); });
  };

  const submit = (queryStatus) => {
    if (!comments.trim()) { setCommentsError('Please enter your response'); return; }
    setCommentsError('');
    const payload = {
      adminDocumentId: documentId || '',
      comments,
      email:        ticket.email,
      id:           ticket.id,
      mobileNumber: ticket.mobileNumber,
      projectType:  'OXYBRICKS',
      query:        ticket.query,
      queryStatus,
      resolvedBy:   'admin',
      resolvedOn:   '',
      status:       '',
      userDocumentId: ticket.userDocumentId || '',
      userId:       ticket.userId,
    };
    setApproveLoader(true);
    axios.post(`${BASE_URL}/write-to-us/student/saveData`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        toast.success(queryStatus === 'COMPLETED' ? 'Query resolved successfully!' : 'Status updated to Pending');
        setApproveLoader(false);
        onDone();
        onClose();
      })
      .catch(err => {
        toast.error(err?.response?.data?.error ?? 'Something went wrong');
        setApproveLoader(false);
      });
  };

  const inp = {
    background: 'var(--input-bg)', border: '1px solid rgba(168,85,247,0.25)',
    color: 'var(--text-primary)', borderRadius: 10, padding: '8px 12px',
    fontSize: 13, width: '100%', outline: 'none',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="rounded-2xl w-full max-w-lg overflow-hidden flex flex-col"
        style={{ background: 'var(--surface-card)', border: '1px solid rgba(168,85,247,0.25)', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(168,85,247,0.05)' }}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
              style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.25)' }}>
              {ticket.randomTicketId}
            </span>
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{ticket.name}</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ml-2"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 grid gap-4">

          {/* User info strip */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: 'Name',    value: ticket.name          },
              { label: 'Email',   value: ticket.email         },
              { label: 'Mobile',  value: ticket.mobileNumber  },
              { label: 'Date',    value: fmtDate(toTs(ticket.updatedAt) > 0 ? ticket.updatedAt : ticket.createdAt) },
            ].map(m => (
              <div key={m.label} className="px-3 py-2 rounded-xl"
                style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.12)' }}>
                <p style={{ color: 'var(--text-muted)' }}>{m.label}</p>
                <p className="font-semibold mt-0.5 truncate" style={{ color: 'var(--text-primary)' }}>{m.value ?? '—'}</p>
              </div>
            ))}
          </div>

          {/* User query */}
          <div className="rounded-xl p-4" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <I.User />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>User Query</span>
            </div>
            <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{ticket.query}</p>
          </div>

          {/* User attached document — use filePath directly */}
          {userFilePath && (
            <div className="rounded-xl p-3 flex items-center justify-between gap-3"
              style={{ background: 'rgba(38,115,187,0.06)', border: '1px solid rgba(38,115,187,0.18)' }}>
              <div className="flex items-center gap-2 min-w-0">
                <I.Paperclip />
                <div className="min-w-0">
                  <p className="text-xs font-semibold" style={{ color: '#2673bb' }}>User Attached Document</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{userFileName ?? userFilePath}</p>
                </div>
              </div>
              <button onClick={() => onPreview(userFilePath, userFileName ?? userFilePath)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 flex-shrink-0"
                style={{ background: 'rgba(38,115,187,0.12)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.25)' }}>
                <I.Eye />View
              </button>
            </div>
          )}

          {/* Admin response */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#a855f7' }}>
              Admin Response <span style={{ color: '#e95330' }}>*</span>
            </label>
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 90 }}
              placeholder="Type your response to the user…"
              value={comments} onChange={e => { setComments(e.target.value); setCommentsError(''); }} />
            {commentsError && <p className="text-xs mt-1" style={{ color: '#e95330' }}>{commentsError}</p>}
          </div>

          {/* Admin document upload */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#a855f7' }}>
              Attach Document (optional)
            </label>
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
              style={{ background: 'var(--input-bg)', border: '1px dashed rgba(168,85,247,0.3)', color: 'var(--text-muted)' }}>
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" />
              {uploadStatus === 'loading'
                ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                : uploadStatus === 'uploaded' ? <I.CheckCircle />
                : <I.Paperclip />}
              <span className="text-sm flex-1 truncate">
                {uploadStatus === 'loading' ? 'Uploading…'
                  : uploadStatus === 'uploaded' ? fileName
                  : uploadStatus === 'Failed' ? 'Upload failed — try again'
                  : 'Click to attach a file'}
              </span>
              {uploadStatus === 'uploaded' && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(53,161,62,0.1)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.2)' }}>
                  Uploaded
                </span>
              )}
            </label>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => submit('PENDING')} disabled={approveLoader}
              className="py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: 'rgba(245,131,17,0.1)', color: '#f58311', border: '1px solid rgba(245,131,17,0.3)' }}>
              Mark Pending
            </button>
            <button onClick={() => submit('COMPLETED')} disabled={approveLoader}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', boxShadow: '0 4px 14px rgba(168,85,247,0.35)' }}>
              {approveLoader
                ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                : <I.Send />}
              Resolve Query
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function AdminSupport() {
  const [statusValue, setStatusValue] = useState('PENDING');
  const [data,        setData]        = useState([]);
  const [loader,      setLoader]      = useState(false);
  const [expanded,    setExpanded]    = useState(null);
  const [modalTicket, setModalTicket] = useState(null);
  const [profileTicket, setProfileTicket] = useState(null);
  const [totalCount,  setTotalCount]  = useState(0);
  const { previewUrl, previewName, open: openPreview, close: closePreview } = useFilePreview();
  const [categoryType, setCategoryType] = useState('OXYBRICKS');

  const token = getToken();

  const fetchQueries = (status = statusValue) => {
    setLoader(true);
    setExpanded(null);
    axios.post(
      `https://meta.oxyloans.com/api/write-to-us/student/getQueries`,
      { queryStatus: status, projectType: categoryType },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        setData(list);
        // queryCount comes from first item — total across all statuses
        if (list.length > 0 && list[0].queryCount) setTotalCount(list[0].queryCount);
      })
      .catch(() => { toast.error('Failed to load queries'); setData([]); })
      .finally(() => setLoader(false));
  };

  useEffect(() => { fetchQueries(statusValue); }, [statusValue, categoryType]);

  const activeTab = STATUS_TABS.find(t => t.value === statusValue);

  return (
    <div className="grid gap-6">

      {/* File preview modal */}
      <FilePreviewModal url={previewUrl} name={previewName} onClose={closePreview} />

      {/* Respond modal */}
      {modalTicket && (
        <RespondModal
          ticket={modalTicket}
          onClose={() => setModalTicket(null)}
          onDone={() => fetchQueries(statusValue)}
          onPreview={openPreview}
        />
      )}

      {/* User profile modal */}
      {profileTicket && (
        <AdminUserProfileModal
          userId={profileTicket.userId}
          userName={profileTicket.name}
          onClose={() => setProfileTicket(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#a855f7', boxShadow: '0 0 18px rgba(168,85,247,0.15)' }}>
            <I.MessageSq />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#a855f7' }}>Admin</p>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Support Queries
              {totalCount > 0 && (
                <span className="ml-2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                  ({totalCount} total)
                </span>
              )}
            </h1>
          </div>
        </div>
        <button onClick={() => fetchQueries(statusValue)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{ background: 'rgba(168,85,247,0.08)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)' }}>
          <I.Refresh />Refresh
        </button>
      </div>
    <div className='flex items-center justify-between gap-4'>
      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap items-center gap-2 flex-shrink-0">
        {CATEGORY_TABS.map(cat => {
          const isActive = categoryType === cat.value;
          return (
            <button key={cat.value} onClick={() => { setCategoryType(cat.value); setExpanded(null); }}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: isActive ? cat.bg : 'var(--input-bg)',
                color:      isActive ? cat.color : 'var(--text-muted)',
                border:     `1px solid ${isActive ? cat.border : 'var(--border)'}`,
                boxShadow:  isActive ? `0 0 10px ${cat.color}20` : 'none',
              }}>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap justify-end">
        {STATUS_TABS.map(tab => {
          const isActive = statusValue === tab.value;
          return (
            <button key={tab.value} onClick={() => setStatusValue(tab.value)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: isActive ? tab.bg : 'var(--input-bg)',
                color:      isActive ? tab.color : 'var(--text-muted)',
                border:     `1px solid ${isActive ? tab.border : 'var(--border)'}`,
                boxShadow:  isActive ? `0 0 12px ${tab.color}20` : 'none',
              }}>
              {tab.label}
              {isActive && !loader && data.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs font-black"
                  style={{ background: tab.color, color: '#fff', fontSize: 9 }}>
                  {data.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>

      {/* Loading */}
      {loader && (
        <div className="flex items-center justify-center gap-3 py-14 rounded-2xl"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"
            stroke={activeTab?.color ?? '#a855f7'} strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
          </svg>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading {activeTab?.label.toLowerCase()} queries…
          </span>
        </div>
      )}

      {/* Empty */}
      {!loader && data.length === 0 && (
        <div className="py-14 text-center rounded-2xl"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <p className="text-4xl mb-3">🎫</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            No {activeTab?.label.toLowerCase()} queries
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>All caught up!</p>
        </div>
      )}

      {/* Ticket list */}
      {!loader && data.map((t, idx) => {
        const status    = t.queryStatus ?? 'PENDING';
        const isOpen    = expanded === idx;
        const userDoc   = t.userQueryDocumentStatus;
        const userFile  = userDoc?.filePath;
        const adminFile = userDoc?.adminUploadedFilePath;
        const hasPendingReplies = t.userPendingQueries?.length > 0;

        // A ticket is "reopened" when userPendingQueries contains at least one REOPEN entry.
        // The top-level queryStatus stays PENDING after a reopen — never becomes 'REOPEN'.
        const reopenEntry = [...(t.userPendingQueries ?? [])]
          .filter(e => e.queryStatus === 'REOPEN')
          .sort((a, b) => toTs(b.resolvedOn || b.createdAt) - toTs(a.resolvedOn || a.createdAt))[0] ?? null;
        const wasReopened = !!reopenEntry;

        // True original submission date
        const raisedDate = toTs(t.updatedAt) > 0 ? t.updatedAt : t.createdAt;
        // Reopen timestamp — backend writes it into ticket.createdAt on reopen
        const reopenDate = wasReopened ? (reopenEntry.resolvedOn || reopenEntry.createdAt) : null;

        return (
          <div key={t.id ?? idx} className="rounded-2xl overflow-hidden transition-all"
            style={{
              background: 'var(--table-bg)',
              border: `1px solid ${
                isOpen
                  ? wasReopened ? 'rgba(139,92,246,0.4)' : 'rgba(168,85,247,0.3)'
                  : wasReopened ? 'rgba(139,92,246,0.3)' : 'var(--border)'
              }`,
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              boxShadow: isOpen ? '0 4px 24px rgba(168,85,247,0.1)' : '0 2px 8px rgba(0,0,0,0.05)',
            }}>

            {/* ── Reopened banner strip — always visible at top of card ── */}
            {wasReopened && (
              <div className="flex items-center gap-2 px-5 py-2 flex-wrap"
                style={{ background: 'rgba(139,92,246,0.1)', borderBottom: '1px solid rgba(139,92,246,0.2)' }}>
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.35)' }}>
                  <I.RefreshCw /> Reopened
                </span>
                <span className="text-xs font-semibold flex-1 truncate" style={{ color: '#8b5cf6' }}>
                  {reopenEntry.pendingComments || '—'}
                </span>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {fmtDate(reopenDate)}
                </span>
              </div>
            )}

            {/* ── Row ── */}
            <div className="flex items-center gap-3 px-5 py-4 flex-wrap">

              {/* Ticket ID */}
              <span className="font-mono text-xs font-bold flex-shrink-0 px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)' }}>
                {t.randomTicketId}
              </span>

              {/* Query + user info */}
              <button className="flex-1 min-w-0 text-left" onClick={() => setExpanded(isOpen ? null : idx)}>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {t.query}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs font-semibold" style={{ color: '#c084fc' }}>{t.name}</span>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.mobileNumber}</span>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <I.Calendar />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmtDate(raisedDate)}</span>
                </div>
              </button>

              {/* Badges */}
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                {userFile && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(38,115,187,0.1)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.2)' }}>
                    <I.Paperclip />Doc
                  </span>
                )}
                {hasPendingReplies && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(245,131,17,0.1)', color: '#f58311', border: '1px solid rgba(245,131,17,0.2)' }}>
                    💬 {t.userPendingQueries.length}
                  </span>
                )}
                <StatusChip status={status} />
              </div>

              {/* View Profile */}
              <button onClick={() => setProfileTicket(t)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 flex-shrink-0"
                style={{ background: 'rgba(38,115,187,0.1)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.25)' }}>
                <I.UserCircle />Profile
              </button>

              {/* Respond — PENDING (includes reopened tickets) */}
              {status === 'PENDING' && (
                <button onClick={() => setModalTicket(t)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 flex-shrink-0"
                  style={{
                    background: wasReopened
                      ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)'
                      : 'linear-gradient(135deg,#a855f7,#7c3aed)',
                    color: '#fff',
                    boxShadow: wasReopened
                      ? '0 2px 10px rgba(139,92,246,0.35)'
                      : '0 2px 10px rgba(168,85,247,0.3)',
                  }}>
                  <I.Send />{wasReopened ? 'Respond to Reopen' : 'Respond'}
                </button>
              )}

              <button onClick={() => setExpanded(isOpen ? null : idx)}
                style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>
                <I.ChevronDown />
              </button>
            </div>

            {/* ── Expanded detail ── */}
            {isOpen && (
              <div className="px-5 pb-5 pt-3 grid gap-4"
                style={{ borderTop: `1px solid ${wasReopened ? 'rgba(139,92,246,0.2)' : 'var(--border)'}`, background: wasReopened ? 'rgba(139,92,246,0.02)' : 'rgba(168,85,247,0.02)' }}>

                {/* Reopen reason banner — detailed block in expanded section */}
                {wasReopened && reopenEntry && (
                  <div className="rounded-xl p-4 flex items-start gap-3"
                    style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6' }}>
                      <I.RefreshCw />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8b5cf6' }}>
                          Query Reopened by User
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.25)' }}>
                          {fmtDate(reopenDate)}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {reopenEntry.pendingComments || '—'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Meta grid */}
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  {[
                    { label: 'Ticket ID', value: t.randomTicketId },
                    { label: 'Raised On', value: fmtDate(raisedDate) },
                    {
                      label: wasReopened ? 'Reopened On' : 'Resolved On',
                      value: wasReopened ? fmtDate(reopenDate) : fmtDate(t.resolvedOn),
                      highlight: wasReopened,
                    },
                    { label: 'Name',   value: t.name         },
                    { label: 'Email',  value: t.email        },
                    { label: 'Mobile', value: t.mobileNumber },
                  ].map(m => (
                    <div key={m.label} className="rounded-xl p-3"
                      style={{
                        background: m.highlight ? 'rgba(139,92,246,0.06)' : 'var(--input-bg)',
                        border: `1px solid ${m.highlight ? 'rgba(139,92,246,0.2)' : 'var(--border)'}`,
                      }}>
                      <p className="text-xs mb-0.5" style={{ color: m.highlight ? '#8b5cf6' : 'var(--text-muted)' }}>
                        {m.label}
                      </p>
                      <p className="font-semibold break-all text-xs" style={{ color: m.highlight ? '#8b5cf6' : 'var(--text-primary)' }}>
                        {m.value || '—'}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ── Conversation timeline ── */}
                <ConversationTimeline ticket={t} />

                {/* ── Attachments ── */}
                {(userFile || adminFile) && (
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                        Attachments
                      </span>
                      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    </div>
                    {userFile && (
                      <div className="rounded-xl p-3 flex items-center justify-between gap-3"
                        style={{ background: 'rgba(38,115,187,0.06)', border: '1px solid rgba(38,115,187,0.18)' }}>
                        <div className="flex items-center gap-2 min-w-0">
                          <I.Paperclip />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold" style={{ color: '#2673bb' }}>User Attached Document</p>
                            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{userDoc.fileName ?? userFile}</p>
                          </div>
                        </div>
                        <button onClick={() => openPreview(userFile, userDoc.fileName ?? userFile)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 flex-shrink-0"
                          style={{ background: 'rgba(38,115,187,0.12)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.25)' }}>
                          <I.Eye />View
                        </button>
                      </div>
                    )}
                    {adminFile && (
                      <div className="rounded-xl p-3 flex items-center justify-between gap-3"
                        style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.18)' }}>
                        <div className="flex items-center gap-2 min-w-0">
                          <I.Paperclip />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold" style={{ color: '#a855f7' }}>Admin Attached Document</p>
                            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{userDoc.adminUploadedFileName ?? adminFile}</p>
                          </div>
                        </div>
                        <button onClick={() => openPreview(adminFile, userDoc.adminUploadedFileName ?? adminFile)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 flex-shrink-0"
                          style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.25)' }}>
                          <I.Eye />View
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Respond button */}
                {status === 'PENDING' && (
                  <button onClick={() => setModalTicket(t)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                    style={{
                      background: wasReopened
                        ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)'
                        : 'linear-gradient(135deg,#a855f7,#7c3aed)',
                      color: '#fff',
                      boxShadow: wasReopened
                        ? '0 4px 14px rgba(139,92,246,0.35)'
                        : '0 4px 14px rgba(168,85,247,0.3)',
                    }}>
                    <I.Send />{wasReopened ? 'Respond to Reopened Query' : 'Respond to this Query'}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

    </div>
  );
}
