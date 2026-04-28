import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL, getToken, getUserId } from '../../api/client';
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
};

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_TABS = [
  { value: 'PENDING',   label: 'Pending',   color: '#f58311', bg: 'rgba(245,131,17,0.1)',  border: 'rgba(245,131,17,0.25)'  },
  { value: 'COMPLETED', label: 'Completed', color: '#35a13e', bg: 'rgba(53,161,62,0.1)',   border: 'rgba(53,161,62,0.25)'   },
  { value: 'CANCELLED', label: 'Cancelled', color: '#e95330', bg: 'rgba(233,83,48,0.1)',   border: 'rgba(233,83,48,0.25)'   },
];

const statusStyle = {
  PENDING:   { bg: 'rgba(245,131,17,0.1)',  color: '#f58311', border: 'rgba(245,131,17,0.22)', Icon: I.Clock       },
  COMPLETED: { bg: 'rgba(53,161,62,0.1)',   color: '#35a13e', border: 'rgba(53,161,62,0.22)',  Icon: I.CheckCircle },
  CANCELLED: { bg: 'rgba(233,83,48,0.1)',   color: '#e95330', border: 'rgba(233,83,48,0.22)',  Icon: I.XCircle     },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const s = statusStyle[status] ?? statusStyle.PENDING;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <s.Icon />{status}
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

function fmtDate(str) {
  if (!str) return '—';
  return str.slice(0, 10);
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
              { label: 'Date',    value: fmtDate(ticket.createdAt) },
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
  const [totalCount,  setTotalCount]  = useState(0);
  const { previewUrl, previewName, open: openPreview, close: closePreview } = useFilePreview();

  const token = getToken();

  const fetchQueries = (status = statusValue) => {
    setLoader(true);
    setExpanded(null);
    axios.post(
      `https://meta.oxyloans.com/api/write-to-us/student/getQueries`,
      { queryStatus: status, projectType: 'OXYBRICKS' },
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

  useEffect(() => { fetchQueries(statusValue); }, [statusValue]);

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

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
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

        return (
          <div key={t.id ?? idx} className="rounded-2xl overflow-hidden transition-all"
            style={{
              background: 'var(--table-bg)',
              border: `1px solid ${isOpen ? 'rgba(168,85,247,0.3)' : 'var(--border)'}`,
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              boxShadow: isOpen ? '0 4px 24px rgba(168,85,247,0.1)' : '0 2px 8px rgba(0,0,0,0.05)',
            }}>

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
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmtDate(t.createdAt)}</span>
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

              {/* Respond — PENDING only */}
              {status === 'PENDING' && (
                <button onClick={() => setModalTicket(t)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', boxShadow: '0 2px 10px rgba(168,85,247,0.3)' }}>
                  <I.Send />Respond
                </button>
              )}

              <button onClick={() => setExpanded(isOpen ? null : idx)}
                style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>
                <I.ChevronDown />
              </button>
            </div>

            {/* ── Expanded detail ── */}
            {isOpen && (
              <div className="px-5 pb-5 pt-2 grid gap-3"
                style={{ borderTop: '1px solid var(--border)', background: 'rgba(168,85,247,0.02)' }}>

                {/* Full query */}
                <div className="rounded-xl p-4" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                    Full Query
                  </p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{t.query}</p>
                </div>

                {/* Meta grid */}
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  {[
                    { label: 'Name',        value: t.name           },
                    { label: 'Email',       value: t.email          },
                    { label: 'Mobile',      value: t.mobileNumber   },
                    { label: 'User ID',     value: t.userId         },
                    { label: 'Submitted',   value: fmtDate(t.createdAt) },
                    { label: 'Resolved On', value: fmtDate(t.resolvedOn) },
                  ].map(m => (
                    <div key={m.label}>
                      <p style={{ color: 'var(--text-muted)' }}>{m.label}</p>
                      <p className="font-semibold mt-0.5 break-all" style={{ color: 'var(--text-primary)' }}>
                        {m.value || '—'}
                      </p>
                    </div>
                  ))}
                </div>

                {/* User document — use filePath directly from userQueryDocumentStatus */}
                {userFile && (
                  <div className="rounded-xl p-3 flex items-center justify-between gap-3"
                    style={{ background: 'rgba(38,115,187,0.06)', border: '1px solid rgba(38,115,187,0.18)' }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <I.Paperclip />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold" style={{ color: '#2673bb' }}>User Attached Document</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                          {userDoc.fileName ?? userFile}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => openPreview(userFile, userDoc.fileName ?? userFile)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 flex-shrink-0"
                      style={{ background: 'rgba(38,115,187,0.12)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.25)' }}>
                      <I.Eye />View
                    </button>
                  </div>
                )}

                {/* Admin document — adminUploadedFilePath */}
                {adminFile && (
                  <div className="rounded-xl p-3 flex items-center justify-between gap-3"
                    style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.18)' }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <I.Paperclip />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold" style={{ color: '#a855f7' }}>Admin Attached Document</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                          {userDoc.adminUploadedFileName ?? adminFile}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => openPreview(adminFile, userDoc.adminUploadedFileName ?? adminFile)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 flex-shrink-0"
                      style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.25)' }}>
                      <I.Eye />View
                    </button>
                  </div>
                )}

                {/* Admin response */}
                {t.comments ? (
                  <div className="rounded-xl p-3"
                    style={{ background: 'rgba(53,161,62,0.06)', border: '1px solid rgba(53,161,62,0.15)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#35a13e' }}>Admin Response</p>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{t.comments}</p>
                    {t.resolvedBy && (
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        by {t.resolvedBy} · {fmtDate(t.resolvedOn)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl p-3"
                    style={{ background: 'rgba(245,131,17,0.06)', border: '1px solid rgba(245,131,17,0.15)' }}>
                    <p className="text-xs font-semibold" style={{ color: '#f58311' }}>No response yet</p>
                  </div>
                )}

                {/* User follow-up replies (userPendingQueries) */}
                {hasPendingReplies && (
                  <div className="grid gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#f58311' }}>
                      User Follow-ups ({t.userPendingQueries.length})
                    </p>
                    {t.userPendingQueries.map((pq, pi) => (
                      <div key={pi} className="rounded-xl p-3"
                        style={{ background: 'rgba(245,131,17,0.05)', border: '1px solid rgba(245,131,17,0.15)' }}>
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{pq.pendingComments}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                          {pq.resolvedBy} · {fmtDate(pq.resolvedOn)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Respond button in expanded view for PENDING */}
                {status === 'PENDING' && (
                  <button onClick={() => setModalTicket(t)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', boxShadow: '0 4px 14px rgba(168,85,247,0.3)' }}>
                    <I.Send />Respond to this Query
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Respond modal */}
      {modalTicket && (
        <RespondModal
          ticket={modalTicket}
          onClose={() => setModalTicket(null)}
          onDone={() => fetchQueries(statusValue)}
        />
      )}
    </div>
  );
}
