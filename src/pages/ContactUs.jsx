import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'antd';
import { BASE_URL, ACCESS_TOKEN, USERID, getToken, getUserId } from '../api/client';
import FilePreviewModal from '../components/FilePreviewModal';

// ─── Icons ────────────────────────────────────────────────────────────────────
const I = {
  Mail:        () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Phone:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  MapPin:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Send:        () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Clock:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  CheckCircle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  AlertCircle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  MessageSq:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  History:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>,
  Upload:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  ChevronDown: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="6 9 12 15 18 9"/></svg>,
  Paperclip:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
  RefreshCw:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  User:        () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Shield:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ['OFFLINE', 'OXYBRICKS','ULP','OXYLOANS'];
const PRIORITIES  = ['Low', 'Medium', 'High'];

const statusStyle = {
  'Open':        { bg: 'rgba(245,131,17,0.1)',  color: '#f58311', border: 'rgba(245,131,17,0.22)', Icon: I.Clock,        label: 'Open'        },
  'In Progress': { bg: 'rgba(38,115,187,0.1)',  color: '#2673bb', border: 'rgba(38,115,187,0.22)', Icon: I.AlertCircle,  label: 'In Progress' },
  'Resolved':    { bg: 'rgba(53,161,62,0.1)',   color: '#35a13e', border: 'rgba(53,161,62,0.22)',  Icon: I.CheckCircle,  label: 'Resolved'    },
  'PENDING':     { bg: 'rgba(245,131,17,0.1)',  color: '#f58311', border: 'rgba(245,131,17,0.22)', Icon: I.Clock,        label: 'Pending'     },
  'COMPLETED':   { bg: 'rgba(53,161,62,0.1)',   color: '#35a13e', border: 'rgba(53,161,62,0.22)',  Icon: I.CheckCircle,  label: 'Completed'   },
  'CANCELLED':   { bg: 'rgba(233,83,48,0.1)',   color: '#e95330', border: 'rgba(233,83,48,0.22)',  Icon: I.AlertCircle,  label: 'Cancelled'   },
  'REOPEN':      { bg: 'rgba(139,92,246,0.1)',  color: '#8b5cf6', border: 'rgba(139,92,246,0.22)', Icon: I.RefreshCw,    label: 'Reopened'    },
};
const priorityStyle = {
  'Low':    { color: '#35a13e', bg: 'rgba(53,161,62,0.08)'   },
  'Medium': { color: '#f58311', bg: 'rgba(245,131,17,0.08)'  },
  'High':   { color: '#e95330', bg: 'rgba(233,83,48,0.08)'   },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const s = statusStyle[status] ?? statusStyle['Open'];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <s.Icon />{s.label ?? status}
    </span>
  );
}

/** Format "2026-09-11 12:14:14.082" → "11 Sep 2026, 12:14 PM" */
function formatDate(raw) {
  if (!raw) return '—';
  try {
    const d = new Date(raw.replace(' ', 'T'));
    if (isNaN(d)) return raw;
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch { return raw; }
}

function InfoCard({ Icon, label, value, color }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl"
      style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}14`, border: `1px solid ${color}25`, color }}>
        <Icon />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color }}>{label}</p>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}

// ─── Contact Form (with real APIs) ───────────────────────────────────────────
function ContactForm({ onSubmitted }) {
  const navigate = useNavigate();

  // user fields (auto-filled from profile API)
  const [name,         setName]         = useState('');
  const [email,        setEmail]        = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  // form fields
  const [query,    setQuery]    = useState('');
  const [category, setCategory] = useState('ULP');
  const [priority, setPriority] = useState('Medium');

  // file upload
  const [fileName,    setFileName]    = useState('');
  const [documentId,  setDocumentId]  = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | loading | uploaded | Failed
  const [pastedPreview, setPastedPreview] = useState(''); // base64 preview of pasted image
  const [isDragging,  setIsDragging]  = useState(false);
  const fileInputRef = useRef(null);

  // submission
  const [loading,  setLoading]  = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // validation errors
  const [nameError,         setNameError]         = useState('');
  const [mobileNumberError, setMobileNumberError] = useState('');
  const [emailError,        setEmailError]        = useState('');
  const [queryError,        setQueryError]        = useState('');

  const token  = getToken();
  const userId = getUserId();

  // ── Fetch profile on mount ──────────────────────────────────────────────────
  const fetchProfile = () => {
    axios.get(
      `https://meta.oxyloans.com/api/student-service/user/profile?id=${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(res => {
        const d = res.data;
        setEmail(d.email ?? '');
        setName(`${d.firstName ?? ''} ${d.lastName ?? ''}`.trim());
        setMobileNumber(d.mobileNumber ?? '');
      })
      .catch(err => console.error('Error fetching user data:', err));
  };

  useEffect(() => { fetchProfile(); }, []);

  // ── File upload ─────────────────────────────────────────────────────────────
  const uploadFile = (file) => {
    if (!file) return;
    setUploadStatus('loading');
    setFileName(file.name || 'pasted-image.png');
    const formData = new FormData();
    formData.append('multiPart', file);
    formData.append('fileType', 'kyc');
    axios.post(
      `https://meta.oxyloans.com/api/common-upload-service/uploadQueryScreenShot?userId=${userId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data', accessToken: `Bearer ${token}` } }
    )
      .then(res => {
        setDocumentId(res.data.id);
        toast.success('Document uploaded successfully');
        setUploadStatus('uploaded');
      })
      .catch(err => {
        console.error('Error uploading file:', err);
        toast.error(err.response?.data?.error ?? 'Upload failed');
        setUploadStatus('Failed');
        setPastedPreview('');
      });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPastedPreview('');
    uploadFile(file);
  };

  // ── Paste handler ───────────────────────────────────────────────────────────
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (!file) continue;
        // generate preview
        const reader = new FileReader();
        reader.onload = (ev) => setPastedPreview(ev.target.result);
        reader.readAsDataURL(file);
        uploadFile(file);
        e.preventDefault();
        break;
      }
    }
  };

  // ── Drag-and-drop handlers ──────────────────────────────────────────────────
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = ()  => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setPastedPreview('');
    uploadFile(file);
  };

  const clearUpload = () => {
    setFileName(''); setDocumentId(''); setUploadStatus('idle'); setPastedPreview('');
  };

  // ── Submit query ────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    setNameError(''); setMobileNumberError(''); setEmailError(''); setQueryError(''); setErrorMsg('');

    if (!name) { setNameError('Please enter name'); return; }
    if (!mobileNumber) { setMobileNumberError('Please enter mobile number'); return; }
    if (mobileNumber.length < 10) { setMobileNumberError('Mobile number should be 10 digits'); return; }
    if (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(mobileNumber)) {
      setMobileNumberError('Please enter a valid mobile number'); return;
    }
    if (!email) { setEmailError('Please enter email'); return; }
    if (!query) { setQueryError('Please enter your query'); return; }

    setLoading(true);

    const data = {
      comments: '',
      email,
      id: '',
      mobileNumber,
      projectType: category,
      query,
      queryStatus: 'PENDING',
      resolvedBy: '',
      resolvedOn: '',
      status: '',
      userDocumentId: documentId || '',
      userId,
    };

    axios.post(
      `${BASE_URL}/write-to-us/student/saveData`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => {
        toast.success('Your query has been submitted successfully!');
        setLoading(false);
        setQuery('');
        setDocumentId('');
        setFileName('');
        setUploadStatus('idle');
        setPastedPreview('');
        fetchProfile();
        onSubmitted();
      })
      .catch(err => {
        const msg = err.response?.data?.error ?? 'Error submitting query';
        setErrorMsg(msg);
        toast.error(msg);
        setLoading(false);
      });
  };

  // ── Styles ──────────────────────────────────────────────────────────────────
  const inputStyle = {
    background: 'var(--input-bg)', border: '1px solid var(--input-border)',
    color: 'var(--text-primary)', borderRadius: 10, padding: '8px 12px',
    fontSize: 13, width: '100%', outline: 'none', transition: 'border-color 0.15s',
  };
  const labelStyle = {
    color: 'var(--text-muted)', fontSize: 11, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, display: 'block',
  };
  const errStyle = { color: '#e95330', fontSize: 11, marginTop: 3 };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">

      {/* Auto-filled: Name + Mobile */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label style={labelStyle}>Full Name <span style={{ color: '#e95330' }}>*</span></label>
          <input style={inputStyle} value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your full name" />
          {nameError && <p style={errStyle}>{nameError}</p>}
        </div>
        <div>
          <label style={labelStyle}>Mobile Number <span style={{ color: '#e95330' }}>*</span></label>
          <input style={inputStyle} value={mobileNumber}
            onChange={e => setMobileNumber(e.target.value)}
            placeholder="10-digit mobile number" maxLength={13} />
          {mobileNumberError && <p style={errStyle}>{mobileNumberError}</p>}
        </div>
      </div>

      {/* Category + Priority */}
      <div className="grid sm:grid-cols-2 gap-3">
         {/* Email */}
      <div>
        <label style={labelStyle}>Email <span style={{ color: '#e95330' }}>*</span></label>
        <input style={inputStyle} value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com" type="email" />
        {emailError && <p style={errStyle}>{emailError}</p>}
      </div>
      {/* Category */}
        <div>
          <label style={labelStyle}>Category</label>
          <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {/* <div>
          <label style={labelStyle}>Priority</label>
          <div className="flex gap-2">
            {PRIORITIES.map(p => {
              const ps = priorityStyle[p];
              const isActive = priority === p;
              return (
                <button key={p} type="button" onClick={() => setPriority(p)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: isActive ? ps.bg : 'var(--input-bg)',
                    color: isActive ? ps.color : 'var(--text-muted)',
                    border: `1px solid ${isActive ? ps.color + '35' : 'var(--border)'}`,
                    boxShadow: isActive ? `0 0 8px ${ps.color}20` : 'none',
                  }}>
                  {p}
                </button>
              );
            })}
          </div>
        </div> */}
      </div>

      {/* Query / Message */}
      <div>
        <label style={labelStyle}>Your Query <span style={{ color: '#e95330' }}>*</span></label>
        <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
          placeholder="Describe your issue in detail..."
          value={query} onChange={e => setQuery(e.target.value)} />
        {queryError && <p style={errStyle}>{queryError}</p>}
      </div>

      {/* File upload */}
      <div>
        <label style={labelStyle}>Attach Document / Screenshot (optional)</label>

        {/* Outer zone: handles paste + drag-drop. NOT a <label> so it never opens the browser. */}
        <div
          onPaste={handlePaste}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          tabIndex={0}
          className="rounded-xl outline-none focus:ring-2"
          style={{
            border: `1.5px dashed ${isDragging ? '#2673bb' : uploadStatus === 'uploaded' ? '#35a13e' : uploadStatus === 'Failed' ? '#e95330' : 'var(--input-border)'}`,
            background: isDragging ? 'rgba(38,115,187,0.06)' : 'var(--input-bg)',
            transition: 'border-color 0.2s, background 0.2s',
          }}>

          {/* Hidden file input — triggered only by Browse button */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx"
          />

          {/* Pasted / dropped image preview */}
          {pastedPreview && (
            <div className="relative p-3 pb-0">
              <img src={pastedPreview} alt="pasted preview"
                className="w-full max-h-40 object-contain rounded-lg"
                style={{ border: '1px solid var(--border)' }} />
              {uploadStatus === 'loading' && (
                <div className="absolute inset-0 m-3 flex items-center justify-center rounded-lg"
                  style={{ background: 'rgba(0,0,0,0.4)' }}>
                  <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* Status / info row */}
          <div className="flex items-center gap-3 px-4 py-3">
            {uploadStatus === 'loading' && !pastedPreview ? (
              <svg className="w-4 h-4 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
              </svg>
            ) : uploadStatus === 'uploaded' ? (
              <span style={{ color: '#35a13e' }}><I.CheckCircle /></span>
            ) : uploadStatus === 'Failed' ? (
              <span style={{ color: '#e95330' }}><I.AlertCircle /></span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}><I.Paperclip /></span>
            )}

            <span className="text-sm flex-1 truncate" style={{ color: 'var(--text-muted)' }}>
              {uploadStatus === 'loading' ? 'Uploading…'
                : uploadStatus === 'uploaded' ? fileName
                : uploadStatus === 'Failed' ? 'Upload failed — try again'
                : 'Drag & drop or paste a screenshot here (Ctrl+V)'}
            </span>

            {/* Status badge */}
            {uploadStatus === 'uploaded' && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: 'rgba(53,161,62,0.1)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.2)' }}>
                Uploaded
              </span>
            )}
            {uploadStatus === 'Failed' && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: 'rgba(233,83,48,0.1)', color: '#e95330', border: '1px solid rgba(233,83,48,0.2)' }}>
                Failed
              </span>
            )}

            {/* Browse button — only button that opens file picker */}
            {(uploadStatus === 'idle' || uploadStatus === 'Failed') && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                style={{ background: 'rgba(38,115,187,0.1)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.25)' }}>
                <I.Upload /> Browse
              </button>
            )}

            {/* Clear button */}
            {(uploadStatus === 'uploaded' || uploadStatus === 'Failed') && (
              <button
                type="button"
                onClick={clearUpload}
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          {/* Paste hint */}
          {uploadStatus === 'idle' && (
            <div className="flex items-center justify-center gap-1.5 pb-2.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
              Click this box then press&nbsp;
              <kbd className="px-1.5 py-0.5 rounded font-mono"
                style={{ background: 'var(--border)', color: 'var(--text-primary)', fontSize: 11 }}>Ctrl+V</kbd>
              &nbsp;to paste a screenshot
            </div>
          )}
        </div>
      </div>

      {/* Global error */}
      {errorMsg && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(233,83,48,0.08)', border: '1px solid rgba(233,83,48,0.2)', color: '#e95330' }}>
          <I.AlertCircle />{errorMsg}
        </div>
      )}

      {/* Submit */}
      <button type="submit" disabled={loading || !query.trim()}
        className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg,#2673bb,#1a5a9a)', color: '#fff', boxShadow: '0 4px 16px rgba(38,115,187,0.35)' }}>
        {loading
          ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
          : <I.Send />}
        {loading ? 'Submitting…' : 'Submit Query'}
      </button>
    </form>
  );
}

// ─── Status tabs config ───────────────────────────────────────────────────────
const STATUS_TABS = [
  { value: 'PENDING',   label: 'Pending',   color: '#f58311', bg: 'rgba(245,131,17,0.1)',  border: 'rgba(245,131,17,0.25)'  },
  { value: 'COMPLETED', label: 'Completed', color: '#35a13e', bg: 'rgba(53,161,62,0.1)',   border: 'rgba(53,161,62,0.25)'   },
  { value: 'CANCELLED', label: 'Cancelled', color: '#e95330', bg: 'rgba(233,83,48,0.1)',   border: 'rgba(233,83,48,0.25)'   },
];

// ─── Cancel Modal ─────────────────────────────────────────────────────────────
function CancelModal({ ticket, onConfirm, onClose, loading }) {
  const [reason, setReason]           = useState('');
  const [reasonError, setReasonError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) { setReasonError('Please enter a reason to cancel.'); return; }
    setReasonError('');
    onConfirm(ticket.id, ticket.query, reason);
  };

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      styles={{ content: { background: 'var(--surface-card)', borderRadius: 16, padding: 0, border: '1px solid rgba(233,83,48,0.25)' }, mask: { backdropFilter: 'blur(6px)' } }}
      title={null}
      closeIcon={null}
    >
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid var(--border)', background: 'rgba(233,83,48,0.04)', borderRadius: '16px 16px 0 0' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(233,83,48,0.12)', border: '1px solid rgba(233,83,48,0.25)', color: '#e95330' }}>
          <I.AlertCircle />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Cancel Query</h3>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{ticket?.query}</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 grid gap-4">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Please provide a reason for cancelling this query. This action cannot be undone.
        </p>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Reason <span style={{ color: '#e95330' }}>*</span>
          </label>
          <textarea
            className="w-full rounded-xl px-3 py-2.5 text-sm resize-none"
            style={{ background: 'var(--input-bg)', border: `1px solid ${reasonError ? '#e95330' : 'var(--input-border)'}`, color: 'var(--text-primary)', outline: 'none', minHeight: 80 }}
            placeholder="Enter reason for cancellation…"
            value={reason} onChange={e => { setReason(e.target.value); setReasonError(''); }}
          />
          {reasonError && <p className="text-xs mt-1" style={{ color: '#e95330' }}>{reasonError}</p>}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-5 flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          Keep Query
        </button>
        <button onClick={handleConfirm} disabled={loading}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,#e95330,#c0392b)', color: '#fff', boxShadow: '0 4px 14px rgba(233,83,48,0.35)' }}>
          {loading
            ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
            : null}
          {loading ? 'Cancelling…' : 'Yes, Cancel'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Reopen Modal ─────────────────────────────────────────────────────────────
// Uses the dedicated /reopenQuery API.
// Supports optional image attachment (paste / drag-drop / browse — same UX as ContactForm).
function ReopenModal({ ticket, onClose, onDone }) {
  const [reason,       setReason]       = useState('');
  const [reasonError,  setReasonError]  = useState('');
  const [loading,      setLoading]      = useState(false);

  // file upload (same pattern as ContactForm)
  const [fileName,      setFileName]      = useState('');
  const [documentId,    setDocumentId]    = useState('');
  const [uploadStatus,  setUploadStatus]  = useState('idle'); // idle|loading|uploaded|Failed
  const [pastedPreview, setPastedPreview] = useState('');
  const [isDragging,    setIsDragging]    = useState(false);
  const fileInputRef = useRef(null);

  const token  = getToken();
  const userId = getUserId();

  const uploadFile = (file) => {
    if (!file) return;
    setUploadStatus('loading');
    setFileName(file.name || 'pasted-image.png');
    const formData = new FormData();
    formData.append('multiPart', file);
    formData.append('fileType', 'kyc');
    axios.post(
      `https://meta.oxyloans.com/api/common-upload-service/uploadQueryScreenShot?userId=${userId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data', accessToken: `Bearer ${token}` } }
    )
      .then(res => { setDocumentId(res.data.id); toast.success('Document uploaded'); setUploadStatus('uploaded'); })
      .catch(err => { toast.error(err?.response?.data?.error ?? 'Upload failed'); setUploadStatus('Failed'); setPastedPreview(''); });
  };

  const handleFileChange = (e) => { const f = e.target.files[0]; if (!f) return; setPastedPreview(''); uploadFile(f); };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = (ev) => setPastedPreview(ev.target.result);
        reader.readAsDataURL(file);
        uploadFile(file);
        e.preventDefault();
        break;
      }
    }
  };

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = ()  => setIsDragging(false);
  const handleDrop      = (e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (!f) return; setPastedPreview(''); uploadFile(f); };
  const clearUpload     = ()  => { setFileName(''); setDocumentId(''); setUploadStatus('idle'); setPastedPreview(''); };

  const handleSubmit = () => {
    if (!reason.trim()) { setReasonError('Please describe why you are reopening.'); return; }
    setReasonError('');
    setLoading(true);
    // documentId comes from the upload API response (res.data.id).
    // Passed as adminDocumentId to /reopenQuery so backend can store the attachment.
    const payload = {
      comments:        reason,
      id:              ticket.id,
      userId,
      adminDocumentId: documentId || '',
    };
    axios.post(
      `${BASE_URL}/write-to-us/student/reopenQuery`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => { toast.success('Query reopened — support team has been notified.'); onDone(); onClose(); })
      .catch(err => { toast.error(err?.response?.data?.error ?? 'Something went wrong.'); })
      .finally(() => setLoading(false));
  };

  const borderColor = isDragging ? '#8b5cf6' : uploadStatus === 'uploaded' ? '#35a13e' : uploadStatus === 'Failed' ? '#e95330' : 'var(--input-border)';

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      styles={{ content: { background: 'var(--surface-card)', borderRadius: 16, padding: 0, border: '1px solid rgba(139,92,246,0.3)' }, mask: { backdropFilter: 'blur(6px)' } }}
      title={null}
      closeIcon={null}
    >
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'rgba(139,92,246,0.04)', borderRadius: '16px 16px 0 0' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6' }}>
          <I.RefreshCw />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Reopen Query</h3>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{ticket?.query}</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 grid gap-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Tell us why this issue is still unresolved. The support team will be notified immediately.
        </p>

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Reason <span style={{ color: '#e95330' }}>*</span>
          </label>
          <textarea
            className="w-full rounded-xl px-3 py-2.5 text-sm resize-none"
            style={{ background: 'var(--input-bg)', border: `1px solid ${reasonError ? '#e95330' : 'var(--input-border)'}`, color: 'var(--text-primary)', outline: 'none', minHeight: 80 }}
            placeholder="Describe why the issue is still not resolved…"
            value={reason} onChange={e => { setReason(e.target.value); setReasonError(''); }} />
          {reasonError && <p className="text-xs mt-1" style={{ color: '#e95330' }}>{reasonError}</p>}
        </div>

        {/* File upload zone */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Attach Screenshot (optional)
          </label>
          <div onPaste={handlePaste} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            tabIndex={0} className="rounded-xl outline-none"
            style={{ border: `1.5px dashed ${borderColor}`, background: isDragging ? 'rgba(139,92,246,0.06)' : 'var(--input-bg)', transition: 'border-color 0.2s' }}>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" />
            {pastedPreview && (
              <div className="relative p-3 pb-0">
                <img src={pastedPreview} alt="preview" className="w-full max-h-32 object-contain rounded-lg" style={{ border: '1px solid var(--border)' }} />
                {uploadStatus === 'loading' && (
                  <div className="absolute inset-0 m-3 flex items-center justify-center rounded-lg" style={{ background: 'rgba(0,0,0,0.4)' }}>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-3 px-4 py-2.5">
              {uploadStatus === 'loading' && !pastedPreview
                ? <svg className="w-4 h-4 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                : uploadStatus === 'uploaded' ? <span style={{ color: '#35a13e' }}><I.CheckCircle /></span>
                : uploadStatus === 'Failed'   ? <span style={{ color: '#e95330' }}><I.AlertCircle /></span>
                : <span style={{ color: 'var(--text-muted)' }}><I.Paperclip /></span>}
              <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-muted)' }}>
                {uploadStatus === 'loading' ? 'Uploading…' : uploadStatus === 'uploaded' ? fileName : uploadStatus === 'Failed' ? 'Upload failed — try again' : 'Drag, drop or paste (Ctrl+V)'}
              </span>
              {uploadStatus === 'uploaded' && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(53,161,62,0.1)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.2)' }}>Uploaded</span>
              )}
              {(uploadStatus === 'idle' || uploadStatus === 'Failed') && (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.25)' }}>
                  <I.Upload /> Browse
                </button>
              )}
              {(uploadStatus === 'uploaded' || uploadStatus === 'Failed') && (
                <button type="button" onClick={clearUpload}
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-5 pt-3 flex gap-3" style={{ borderTop: '1px solid var(--border)' }}>
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={loading || uploadStatus === 'loading'}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff', boxShadow: '0 4px 14px rgba(139,92,246,0.35)' }}>
          {loading
            ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
            : <I.RefreshCw />}
          {loading ? 'Reopening…' : 'Reopen Query'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Reply Modal ──────────────────────────────────────────────────────────────
// For PENDING or REOPEN tickets — user adds a follow-up message + optional image.
// Uses /write-to-us/student/saveData with queryStatus:'PENDING', resolvedBy:'user'.
function ReplyModal({ ticket, categoryValue, onClose, onDone }) {
  const [message,      setMessage]      = useState('');
  const [messageError, setMessageError] = useState('');
  const [loading,      setLoading]      = useState(false);

  // file upload
  const [fileName,      setFileName]      = useState('');
  const [documentId,    setDocumentId]    = useState('');
  const [uploadStatus,  setUploadStatus]  = useState('idle');
  const [pastedPreview, setPastedPreview] = useState('');
  const [isDragging,    setIsDragging]    = useState(false);
  const fileInputRef = useRef(null);

  const token  = getToken();
  const userId = getUserId();

  const uploadFile = (file) => {
    if (!file) return;
    setUploadStatus('loading');
    setFileName(file.name || 'pasted-image.png');
    const formData = new FormData();
    formData.append('multiPart', file);
    formData.append('fileType', 'kyc');
    axios.post(
      `https://meta.oxyloans.com/api/common-upload-service/uploadQueryScreenShot?userId=${userId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data', accessToken: `Bearer ${token}` } }
    )
      .then(res => { setDocumentId(res.data.id); toast.success('Document uploaded'); setUploadStatus('uploaded'); })
      .catch(err => { toast.error(err?.response?.data?.error ?? 'Upload failed'); setUploadStatus('Failed'); setPastedPreview(''); });
  };

  const handleFileChange = (e) => { const f = e.target.files[0]; if (!f) return; setPastedPreview(''); uploadFile(f); };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = (ev) => setPastedPreview(ev.target.result);
        reader.readAsDataURL(file);
        uploadFile(file);
        e.preventDefault();
        break;
      }
    }
  };

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = ()  => setIsDragging(false);
  const handleDrop      = (e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (!f) return; setPastedPreview(''); uploadFile(f); };
  const clearUpload     = ()  => { setFileName(''); setDocumentId(''); setUploadStatus('idle'); setPastedPreview(''); };

  const handleSubmit = () => {
    if (!message.trim()) { setMessageError('Please enter your message.'); return; }
    setMessageError('');
    setLoading(true);
    const payload = {
      comments:        '',
      email:           ticket.email,
      id:              ticket.id,       // parent ticket id
      ticketId:        ticket.id,       // explicitly pass ticketId for backend linkage
      mobileNumber:    ticket.mobileNumber,
      projectType:     ticket.projectType ?? (categoryValue === 'ALL' ? 'OXYBRICKS' : categoryValue),
      query:           ticket.query,
      queryStatus:     'PENDING',
      resolvedBy:      'user',
      resolvedOn:      '',
      status:          '',
      userDocumentId:  documentId || '',
      userId,
      pendingComments: message,
    };
    axios.post(
      `${BASE_URL}/write-to-us/student/saveData`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => { toast.success('Reply sent successfully!'); onDone(); onClose(); })
      .catch(err => { toast.error(err?.response?.data?.error ?? 'Something went wrong.'); })
      .finally(() => setLoading(false));
  };

  const borderColor = isDragging ? '#2673bb' : uploadStatus === 'uploaded' ? '#35a13e' : uploadStatus === 'Failed' ? '#e95330' : 'var(--input-border)';
  const isReopen = ticket.queryStatus === 'REOPEN';

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      styles={{ content: { background: 'var(--surface-card)', borderRadius: 16, padding: 0, border: '1px solid rgba(38,115,187,0.3)' }, mask: { backdropFilter: 'blur(6px)' } }}
      title={null}
      closeIcon={null}
    >
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'rgba(38,115,187,0.04)', borderRadius: '16px 16px 0 0' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(38,115,187,0.12)', border: '1px solid rgba(38,115,187,0.3)', color: '#2673bb' }}>
          <I.MessageSq />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {isReopen ? 'Add Follow-up (Reopened)' : 'Reply to Support'}
          </h3>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{ticket?.query}</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 grid gap-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {/* Status context pill */}
        <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl"
          style={{ background: isReopen ? 'rgba(139,92,246,0.06)' : 'rgba(245,131,17,0.06)', border: `1px solid ${isReopen ? 'rgba(139,92,246,0.2)' : 'rgba(245,131,17,0.2)'}` }}>
          <span style={{ color: isReopen ? '#8b5cf6' : '#f58311' }}>
            {isReopen ? <I.RefreshCw /> : <I.Clock />}
          </span>
          <span style={{ color: isReopen ? '#8b5cf6' : '#f58311', fontWeight: 600 }}>
            {isReopen ? 'Ticket is Reopened — add more context for the support team' : 'Ticket is Pending — add a follow-up message'}
          </span>
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Your Message <span style={{ color: '#e95330' }}>*</span>
          </label>
          <textarea
            className="w-full rounded-xl px-3 py-2.5 text-sm resize-none"
            style={{ background: 'var(--input-bg)', border: `1px solid ${messageError ? '#e95330' : 'var(--input-border)'}`, color: 'var(--text-primary)', outline: 'none', minHeight: 90 }}
            placeholder="Type your follow-up message…"
            value={message} onChange={e => { setMessage(e.target.value); setMessageError(''); }} />
          {messageError && <p className="text-xs mt-1" style={{ color: '#e95330' }}>{messageError}</p>}
        </div>

        {/* File upload zone */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Attach Screenshot (optional)
          </label>
          <div onPaste={handlePaste} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            tabIndex={0} className="rounded-xl outline-none"
            style={{ border: `1.5px dashed ${borderColor}`, background: isDragging ? 'rgba(38,115,187,0.06)' : 'var(--input-bg)', transition: 'border-color 0.2s' }}>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" />
            {pastedPreview && (
              <div className="relative p-3 pb-0">
                <img src={pastedPreview} alt="preview" className="w-full max-h-32 object-contain rounded-lg"
                  style={{ border: '1px solid var(--border)' }} />
                {uploadStatus === 'loading' && (
                  <div className="absolute inset-0 m-3 flex items-center justify-center rounded-lg" style={{ background: 'rgba(0,0,0,0.4)' }}>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-3 px-4 py-2.5">
              {uploadStatus === 'loading' && !pastedPreview
                ? <svg className="w-4 h-4 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                : uploadStatus === 'uploaded' ? <span style={{ color: '#35a13e' }}><I.CheckCircle /></span>
                : uploadStatus === 'Failed'   ? <span style={{ color: '#e95330' }}><I.AlertCircle /></span>
                : <span style={{ color: 'var(--text-muted)' }}><I.Paperclip /></span>}
              <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-muted)' }}>
                {uploadStatus === 'loading' ? 'Uploading…' : uploadStatus === 'uploaded' ? fileName : uploadStatus === 'Failed' ? 'Upload failed — try again' : 'Drag, drop or paste (Ctrl+V)'}
              </span>
              {uploadStatus === 'uploaded' && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(53,161,62,0.1)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.2)' }}>Uploaded</span>
              )}
              {(uploadStatus === 'idle' || uploadStatus === 'Failed') && (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(38,115,187,0.1)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.25)' }}>
                  <I.Upload /> Browse
                </button>
              )}
              {(uploadStatus === 'uploaded' || uploadStatus === 'Failed') && (
                <button type="button" onClick={clearUpload}
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-5 pt-3 flex gap-3" style={{ borderTop: '1px solid var(--border)' }}>
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={loading || uploadStatus === 'loading'}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,#2673bb,#1a5a9a)', color: '#fff', boxShadow: '0 4px 14px rgba(38,115,187,0.35)' }}>
          {loading
            ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
            : <I.Send />}
          {loading ? 'Sending…' : 'Send Reply'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Conversation Timeline ─────────────────────────────────────────────────────
/**
 * HOW THE API DATA MAPS TO A TIMELINE
 * ─────────────────────────────────────────────────────────────────────────────
 * The backend stores a ticket across two "layers":
 *
 *  Layer A  — top-level ticket fields
 *    ticket.query       → the original message the user raised
 *    ticket.createdAt   → when the user first submitted the ticket
 *    ticket.comments    → the admin's FIRST closure comment
 *    ticket.resolvedOn  → timestamp of that first closure
 *    ticket.resolvedBy  → always "admin" when comments is set
 *
 *  Layer B  — ticket.userPendingQueries[]  (every action AFTER first close)
 *    Each entry has: pendingComments, resolvedBy ("user"|"admin"),
 *                    queryStatus (PENDING|REOPEN|COMPLETED|CANCELLED),
 *                    resolvedOn, createdAt
 *
 * A ticket with a full back-and-forth looks like this in raw data:
 *
 *   ticket.createdAt    12:18:49   user original query            ← Layer A
 *   ticket.resolvedOn   12:14:14   admin first close              ← Layer A
 *   pendingQueries[0]   12:10:11   user  PENDING  "take priority" ← Layer B
 *   pendingQueries[1]   12:11:11   admin PENDING  "we are checking"
 *   pendingQueries[2]   12:18:49   user  REOPEN   "reopen query"
 *   pendingQueries[3]   12:32:53   admin COMPLETED "ticket closed second time"
 *
 * Strategy: build ONE unified array of "events" from both layers,
 * tag each with a numeric `ts` (parsed from the date string), then
 * sort ascending by `ts` so the timeline always appears in true
 * chronological order regardless of what the API returns.
 *
 * Special rule for REOPEN entries: the backend updates the top-level
 * ticket.createdAt to the reopen time (same timestamp as the REOPEN
 * entry in userPendingQueries), so we deliberately keep ticket.createdAt
 * only as the FIRST event and never as a duplicate.
 */
function ConversationTimeline({ ticket }) {
  // ── style maps ───────────────────────────────────────────────────────────
  const ES = {
    PENDING:   { color: '#f58311', bg: 'rgba(245,131,17,0.08)',  border: 'rgba(245,131,17,0.2)',  label: 'Pending'   },
    COMPLETED: { color: '#35a13e', bg: 'rgba(53,161,62,0.08)',   border: 'rgba(53,161,62,0.2)',   label: 'Resolved'  },
    CANCELLED: { color: '#e95330', bg: 'rgba(233,83,48,0.08)',   border: 'rgba(233,83,48,0.2)',   label: 'Cancelled' },
    REOPEN:    { color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.2)',  label: 'Reopened'  },
    QUERY:     { color: '#2673bb', bg: 'rgba(38,115,187,0.08)',  border: 'rgba(38,115,187,0.2)',  label: 'Query'     },
  };

  // ── parse a date string to a numeric timestamp (for sorting) ─────────────
  const toTs = (raw) => {
    if (!raw) return 0;
    try { return new Date(raw.replace(' ', 'T')).getTime() || 0; }
    catch { return 0; }
  };

  // ── build unified event list ──────────────────────────────────────────────
  // Each event: { ts, by, status, text, dateRaw, _type }
  const events = [];

  // 1️⃣  Original query
  //
  //  The backend UPDATES ticket.createdAt when the user reopens, so it ends
  //  up holding the reopen timestamp — NOT the original submit time.
  //  ticket.updatedAt holds the true first-submission time.
  //
  //  Fallback chain:
  //    • updatedAt  — set at creation, never overwritten on reopen
  //    • if updatedAt is null/missing, fall back to the earliest timestamp
  //      found anywhere in the data (min of createdAt + all pendingQueries times)
  //
  const allTs = [
    toTs(ticket.createdAt),
    toTs(ticket.resolvedOn),
    ...(ticket.userPendingQueries ?? []).map(e => toTs(e.resolvedOn || e.createdAt)),
  ].filter(t => t > 0);
  const earliestTs  = allTs.length ? Math.min(...allTs) : toTs(ticket.createdAt);

  // prefer updatedAt; if absent use the earliest timestamp found
  const originalTs  = toTs(ticket.updatedAt) > 0 ? toTs(ticket.updatedAt) : earliestTs;
  // pick a display date: updatedAt if valid, else ticket.createdAt
  const originalDate = (toTs(ticket.updatedAt) > 0 ? ticket.updatedAt : ticket.createdAt);

  events.push({
    _type:   'query',
    by:      'user',
    status:  'QUERY',
    text:    ticket.query,
    dateRaw: originalDate,
    ts:      originalTs,
  });

  // 2️⃣  Top-level admin resolution (ticket.comments)
  //     Only add this when it actually has content — it's the FIRST closure
  //     and may sit anywhere in the timeline relative to the pending entries.
  if (ticket.comments && ticket.resolvedOn) {
    events.push({
      _type:   'toplevel',
      by:      'admin',
      status:  'COMPLETED',
      text:    ticket.comments,
      dateRaw: ticket.resolvedOn,
      ts:      toTs(ticket.resolvedOn),
    });
  }

  // 3️⃣  All userPendingQueries entries
  (ticket.userPendingQueries ?? []).forEach((entry) => {
    // Use resolvedOn if present, fall back to createdAt
    const dateRaw = entry.resolvedOn || entry.createdAt;
    events.push({
      _type:   'pending',
      by:      entry.resolvedBy ?? 'user',       // "user" | "admin"
      status:  entry.queryStatus ?? 'PENDING',
      text:    entry.pendingComments ?? '',
      dateRaw,
      ts:      toTs(dateRaw),
    });
  });

  // 4️⃣  Sort chronologically — equal timestamps keep insertion order
  events.sort((a, b) => a.ts - b.ts);

  // ── render ────────────────────────────────────────────────────────────────
  const renderBubble = (ev, idx) => {
    const byAdmin = ev.by === 'admin';
    const es      = ES[ev.status] ?? ES['PENDING'];

    // avatar colours: blue = user, green = admin
    const avatarColor  = byAdmin ? '#35a13e'              : '#2673bb';
    const avatarBg     = byAdmin ? 'rgba(53,161,62,0.12)' : 'rgba(38,115,187,0.12)';
    const avatarBorder = byAdmin ? 'rgba(53,161,62,0.3)'  : 'rgba(38,115,187,0.3)';
    const bubbleBg     = byAdmin ? 'rgba(53,161,62,0.06)' : 'rgba(38,115,187,0.06)';
    const bubbleBorder = byAdmin ? 'rgba(53,161,62,0.15)' : 'rgba(38,115,187,0.15)';

    // For the original query bubble the status badge is replaced by a
    // "New Ticket" label; for REOPEN we show a purple divider above the bubble
    const isOriginal = ev._type === 'query';
    const isReopen   = ev.status === 'REOPEN';

    return (
      <div key={idx}>
        {/* ── REOPEN divider — visually separates the re-opened round ─── */}
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

          {/* Message bubble */}
          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="text-xs font-bold" style={{ color: avatarColor }}>
                {byAdmin ? 'Support Team' : (ticket.name ?? 'You')}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: avatarBg, color: avatarColor, border: `1px solid ${avatarBorder}` }}>
                {byAdmin ? 'Admin' : 'User'}
              </span>
              {/* Status badge — skip for raw "query" events to avoid redundancy */}
              {!isOriginal && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                  style={{ background: es.bg, color: es.color, border: `1px solid ${es.border}` }}>
                  {es.label}
                </span>
              )}
              {isOriginal && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                  style={{ background: 'rgba(38,115,187,0.08)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.2)' }}>
                  New Ticket
                </span>
              )}
              {/* Timestamp */}
              <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                {formatDate(ev.dateRaw)}
              </span>
            </div>

            {/* Bubble body */}
            <div className="rounded-xl px-4 py-3 text-sm"
              style={{ background: bubbleBg, border: `1px solid ${bubbleBorder}`, color: 'var(--text-primary)' }}>
              {ev.text || <em style={{ color: 'var(--text-muted)' }}>No message</em>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // When no events at all (shouldn't happen but just in case)
  if (events.length === 0) return null;

  // Pending-only ticket (no admin reply yet)
  const onlyOriginalQuery = events.length === 1;

  return (
    <div className="grid gap-1">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          Conversation History · {events.length} event{events.length !== 1 ? 's' : ''}
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      <div className="relative grid gap-3 pl-2">
        {/* Vertical connector line */}
        <div className="absolute left-5 top-4 bottom-4 w-px" style={{ background: 'var(--border)' }} />

        {/* All events sorted by time */}
        {events.map((ev, i) => renderBubble(ev, i))}

        {/* "Awaiting" footer when ticket has no admin reply at all */}
        {onlyOriginalQuery && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl ml-11"
            style={{ background: 'rgba(245,131,17,0.06)', border: '1px solid rgba(245,131,17,0.15)' }}>
            <I.Clock />
            <p className="text-xs font-semibold" style={{ color: '#f58311' }}>Awaiting response from support team</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Category tab config ──────────────────────────────────────────────────────
const CATEGORY_TABS = [
  { value: 'ALL',       label: 'All',       color: '#4e88d8', bg: 'rgba(100, 116, 139, 0.1)',  border: 'rgba(1, 30, 70, 0.25)'  },
  { value: 'ULP',       label: 'ULP',       color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.25)'  },
  { value: 'OXYLOANS',  label: 'OxyLoans',  color: '#2673bb', bg: 'rgba(38,115,187,0.1)',  border: 'rgba(38,115,187,0.25)'  },
  { value: 'OXYBRICKS', label: 'OxyBricks', color: '#f58311', bg: 'rgba(245,131,17,0.1)',  border: 'rgba(245,131,17,0.25)'  },
  { value: 'OFFLINE',   label: 'Offline',   color: '#35a13e', bg: 'rgba(53,161,62,0.1)',   border: 'rgba(53,161,62,0.25)'   },
  // { value: 'FAMILY',    label: 'Family',    color: '#e95330', bg: 'rgba(233,83,48,0.1)',   border: 'rgba(233,83,48,0.25)'   },
];

// ─── Ticket History ───────────────────────────────────────────────────────────
function TicketHistory({ onRefresh }) {
  const [categoryValue, setCategoryValue] = useState('ALL');
  const [statusValue, setStatusValue] = useState('PENDING');
  const [data,        setData]        = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [expanded,    setExpanded]    = useState(null);

  // cancel modal state
  const [showModal,  setShowModal]  = useState(false);
  const [cancelTicket, setCancelTicket] = useState(null);
  const [yesLoader,  setYesLoader]  = useState(false);

  // reopen modal state (COMPLETED tickets → /reopenQuery API)
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenTicket,    setReopenTicket]    = useState(null);

  // reply modal state (PENDING / REOPEN tickets → /saveData with resolvedBy:'user')
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyTicket,    setReplyTicket]    = useState(null);

  // file preview modal
  const [previewUrl,  setPreviewUrl]  = useState(null);
  const [previewName, setPreviewName] = useState('');
  const openPreview  = (url, name) => { setPreviewUrl(url); setPreviewName(name ?? ''); };
  const closePreview = () => setPreviewUrl(null);

  // user info for cancel payload
  const [email,        setEmail]        = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const token  = getToken();
  const userId = getUserId();

  // fetch profile for cancel payload
  useEffect(() => {
    axios.get(
      `https://meta.oxyloans.com/api/student-service/user/profile?id=${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(res => {
      setEmail(res.data.email ?? '');
      setMobileNumber(res.data.mobileNumber ?? '');
    }).catch(() => {});
  }, []);

  // fetch queries by status + category
  const fetchQueries = (status = statusValue, category = categoryValue) => {
    setLoading(true);
    setExpanded(null);
    axios.post(
      `https://meta.oxyloans.com/api/write-to-us/student/getQueries`,
      { queryStatus: status, userId, projectType: category },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(res => { setData(Array.isArray(res.data) ? res.data : []); })
      .catch(err => { console.error('Error fetching queries:', err); setData([]); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchQueries(statusValue, categoryValue); }, [statusValue, categoryValue]);

  // cancel a query
  const handleCancel = (id, query, reason) => {
    const payload = {
      comments: reason,
      email,
      id,
      mobileNumber,
      projectType: categoryValue,
      query,
      queryStatus: 'CANCELLED',
      resolvedBy: 'user',
      resolvedOn: '',
      status: '',
      userDocumentId: '',
      userId,
    };
    setYesLoader(true);
    axios.post(
      `${BASE_URL}/write-to-us/student/saveData`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => {
        toast.success('Query cancelled successfully!');
        setShowModal(false);
        setCancelTicket(null);
        fetchQueries(statusValue, categoryValue);
        if (onRefresh) onRefresh();
      })
      .catch(err => {
        toast.error(err?.response?.data?.error ?? 'Something went wrong.');
        setShowModal(false);
      })
      .finally(() => setYesLoader(false));
  };

  // called after any modal action (reopen / reply) succeeds — refresh list + badge
  const handleModalDone = () => {
    fetchQueries(statusValue, categoryValue);
    if (onRefresh) onRefresh();
  };

  const activeTab = STATUS_TABS.find(t => t.value === statusValue);
  const activeCatTab = CATEGORY_TABS.find(c => c.value === categoryValue);

  return (
    <div className="grid gap-4">
      {/* File preview modal */}
      <FilePreviewModal url={previewUrl} name={previewName} onClose={closePreview} />

      {showModal && cancelTicket && (
        <CancelModal
          ticket={cancelTicket}
          onConfirm={handleCancel}
          onClose={() => { setShowModal(false); setCancelTicket(null); }}
          loading={yesLoader}
        />
      )}

      {showReopenModal && reopenTicket && (
        <ReopenModal
          ticket={reopenTicket}
          onClose={() => { setShowReopenModal(false); setReopenTicket(null); }}
          onDone={handleModalDone}
        />
      )}

      {showReplyModal && replyTicket && (
        <ReplyModal
          ticket={replyTicket}
          categoryValue={categoryValue}
          onClose={() => { setShowReplyModal(false); setReplyTicket(null); }}
          onDone={handleModalDone}
        />
      )}

      <div className="flex items-center justify-between gap-4" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        {/* Title — left side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <I.History />
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Your Support Tickets</h2>
        </div>
        {/* Category tabs — right side */}
        <div className="flex gap-2 flex-wrap justify-end">
          {CATEGORY_TABS.map(cat => {
            const isActive = categoryValue === cat.value;
            return (
              <button key={cat.value} onClick={() => { setCategoryValue(cat.value); setExpanded(null); }}
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
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(tab => {
          const isActive = statusValue === tab.value;
          return (
            <button key={tab.value} onClick={() => setStatusValue(tab.value)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: isActive ? tab.bg : 'var(--input-bg)',
                color:      isActive ? tab.color : 'var(--text-muted)',
                border:     `1px solid ${isActive ? tab.border : 'var(--border)'}`,
                boxShadow:  isActive ? `0 0 10px ${tab.color}20` : 'none',
              }}>
              {tab.label}
              {isActive && data.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-black"
                  style={{ background: tab.color, color: '#fff', fontSize: 9 }}>
                  {data.length}
                </span>
              )}
            </button>
          );
        })}
        <button onClick={() => fetchQueries(statusValue, categoryValue)}
          className="ml-auto px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
          style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          ↻ Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-10 rounded-2xl"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke={activeTab?.color ?? '#2673bb'} strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
          </svg>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading {activeTab?.label.toLowerCase()} queries for {activeCatTab?.label}…</span>
        </div>
      )}

      {/* Empty */}
      {!loading && data.length === 0 && (
        <div className="py-12 text-center rounded-2xl"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <p className="text-3xl mb-3">🎫</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No {activeTab?.label.toLowerCase()} queries</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {statusValue === 'PENDING' ? 'Submit a query to see it here' : `No ${activeTab?.label.toLowerCase()} queries found`}
          </p>
        </div>
      )}

      {/* Ticket list */}
      {!loading && data.map((t, idx) => {
        const status   = t.queryStatus ?? 'PENDING';
        const ss       = statusStyle[status] ?? statusStyle['Open'];
        const isOpen   = expanded === idx;
        const isPending    = status === 'PENDING';
        const isReopen     = status === 'REOPEN';
        const isCompleted  = status === 'COMPLETED';
        const canReply     = isPending || isReopen;  // active ticket — user can add follow-up
        const hasConvo     = (t.userPendingQueries ?? []).length > 0;

        return (
          <div key={t.id ?? idx} className="rounded-2xl overflow-hidden transition-all"
            style={{
              background: 'var(--table-bg)',
              border: `1px solid ${isOpen ? (activeTab?.color ?? '#2673bb') + '30' : 'var(--border)'}`,
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              boxShadow: isOpen ? '0 4px 20px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)',
            }}>

            {/* Row header */}
            <div className="flex items-center gap-3 px-5 py-4">
              {/* Number badge */}
              <span className="font-mono text-xs font-bold flex-shrink-0 px-2 py-0.5 rounded-lg"
                style={{ background: `${activeTab?.color ?? '#2673bb'}12`, color: activeTab?.color ?? '#2673bb', border: `1px solid ${activeTab?.color ?? '#2673bb'}22`, minWidth: 36, textAlign: 'center' }}>
                #{idx + 1}
              </span>

              {/* Query text — clickable to expand */}
              <button className="flex-1 min-w-0 text-left"
                onClick={() => setExpanded(isOpen ? null : idx)}>
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  <p className="text-sm font-semibold truncate min-w-0" style={{ color: 'var(--text-primary)' }}>
                    {t.query ?? '—'}
                  </p>
                  {/* Ticket ID */}
                  {t.randomTicketId && (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap"
                      style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                      {t.randomTicketId}
                    </span>
                  )}
                  {t.projectType && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap"
                      style={{
                        background: activeCatTab?.bg ?? 'rgba(38,115,187,0.1)',
                        color: activeCatTab?.color ?? '#2673bb',
                        border: `1px solid ${activeCatTab?.border ?? 'rgba(38,115,187,0.25)'}`,
                      }}>
                      {t.projectType}
                    </span>
                  )}
                  {/* Conversation badge */}
                  {hasConvo && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap hidden sm:inline-flex items-center gap-1"
                      style={{ background: 'rgba(38,115,187,0.08)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.2)' }}>
                      💬 {t.userPendingQueries.length} message{t.userPendingQueries.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {/* Created date */}
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(t.createdAt)}
                </p>
              </button>

              {/* Status chip */}
              <StatusChip status={status} />

              {/* Cancel button — only for PENDING */}
              {isPending && (
                <button
                  onClick={() => { setCancelTicket(t); setShowModal(true); }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 flex-shrink-0"
                  style={{ background: 'rgba(233,83,48,0.08)', color: '#e95330', border: '1px solid rgba(233,83,48,0.2)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Cancel
                </button>
              )}

              {/* Reply button — PENDING or REOPEN tickets */}
              {canReply && (
                <button
                  onClick={() => { setReplyTicket(t); setShowReplyModal(true); }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 flex-shrink-0"
                  style={{ background: 'rgba(38,115,187,0.08)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.25)' }}>
                  <I.Send />
                  Reply
                </button>
              )}

              {/* Reopen button — only for COMPLETED */}
              {isCompleted && (
                <button
                  onClick={() => { setReopenTicket(t); setShowReopenModal(true); }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 flex-shrink-0"
                  style={{ background: 'rgba(139,92,246,0.08)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.25)' }}>
                  <I.RefreshCw />
                  Reopen
                </button>
              )}

              {/* Expand chevron */}
              <button onClick={() => setExpanded(isOpen ? null : idx)}
                style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>
                <I.ChevronDown />
              </button>
            </div>

            {/* Expanded detail */}
            {isOpen && (
              <div className="px-5 pb-5 pt-3 grid gap-4"
                style={{ borderTop: '1px solid var(--border)', background: `${activeTab?.color ?? '#2673bb'}04` }}>

                {/* Meta info row */}
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl p-3" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--text-muted)' }} className="mb-0.5">Ticket ID</p>
                    <p className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{t.randomTicketId ?? '—'}</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--text-muted)' }} className="mb-0.5">Created</p>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatDate(t.createdAt)}</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--text-muted)' }} className="mb-0.5">Resolved On</p>
                    <p className="font-semibold" style={{ color: t.resolvedOn ? '#35a13e' : 'var(--text-muted)' }}>
                      {formatDate(t.resolvedOn)}
                    </p>
                  </div>
                </div>

                {/* Conversation timeline */}
                <ConversationTimeline ticket={t} />

                {/* Attached documents */}
                {(t.userDocumentId || t.adminDocumentId) && (
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                        Attachments
                      </span>
                      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    </div>

                    {/* User's uploaded document */}
                    {t.userDocumentId && (
                      <div className="rounded-xl p-3 flex items-center justify-between gap-3"
                        style={{ background: 'rgba(38,115,187,0.06)', border: '1px solid rgba(38,115,187,0.18)' }}>
                        <div className="flex items-center gap-2">
                          <I.Paperclip />
                          <div>
                            <p className="text-xs font-semibold" style={{ color: '#2673bb' }}>Your Attached Document</p>
                            <p className="text-xs font-mono mt-0.5 truncate max-w-[160px]" style={{ color: 'var(--text-muted)' }}>
                              {t.userQueryDocumentStatus?.fileName ?? t.userDocumentId}
                            </p>
                          </div>
                        </div>
                        {t.userQueryDocumentStatus?.filePath && (
                          <button
                            onClick={() => openPreview(t.userQueryDocumentStatus.filePath, t.userQueryDocumentStatus.fileName ?? 'Your Attached Document')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                            style={{ background: 'rgba(38,115,187,0.12)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.25)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            View
                          </button>
                        )}
                      </div>
                    )}

                    {/* Admin's response document */}
                    {t.adminDocumentId && (
                      <div className="rounded-xl p-3 flex items-center justify-between gap-3"
                        style={{ background: 'rgba(53,161,62,0.06)', border: '1px solid rgba(53,161,62,0.18)' }}>
                        <div className="flex items-center gap-2">
                          <I.Paperclip />
                          <div>
                            <p className="text-xs font-semibold" style={{ color: '#35a13e' }}>Admin Attached Document</p>
                            <p className="text-xs font-mono mt-0.5 truncate max-w-[160px]" style={{ color: 'var(--text-muted)' }}>
                              {t.userQueryDocumentStatus?.adminUploadedFileName ?? t.adminDocumentId}
                            </p>
                          </div>
                        </div>
                        {t.userQueryDocumentStatus?.adminUploadedFilePath && (
                          <button
                            onClick={() => openPreview(t.userQueryDocumentStatus.adminUploadedFilePath, t.userQueryDocumentStatus.adminUploadedFileName ?? 'Admin Attached Document')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                            style={{ background: 'rgba(53,161,62,0.12)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.25)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            View
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function ContactUs() {
  const [tab, setTab] = useState('contact');
  const [pendingCount, setPendingCount] = useState(0);

  const token  = getToken();
  const userId = getUserId();

  // fetch pending count for badge (across all visible categories)
  const fetchPendingCount = () => {
    if (!userId || !token) return;
    // Sum pending across all categories
    let total = 0;
    let done = 0;
    CATEGORY_TABS.forEach(cat => {
      axios.post(
        `https://meta.oxyloans.com/api/write-to-us/student/getQueries`,
        { queryStatus: 'PENDING', userId, projectType: cat.value },
        { headers: { Authorization: `Bearer ${token}` } }
      )
        .then(res => { total += Array.isArray(res.data) ? res.data.length : 0; })
        .catch(() => {})
        .finally(() => { done++; if (done === CATEGORY_TABS.length) setPendingCount(total); });
    });
  };

  useEffect(() => { fetchPendingCount(); }, []);

  const handleSubmitted = () => {
    fetchPendingCount();
    setTimeout(() => setTab('history'), 600);
  };

  const tabs = [
    { id: 'contact', label: 'Contact Us',     Icon: I.MessageSq },
    { id: 'history', label: 'Ticket History', Icon: I.History, badge: pendingCount },
  ];

  return (
    <div className="grid gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(38,115,187,0.12)', border: '1px solid rgba(38,115,187,0.25)', color: '#2673bb', boxShadow: '0 0 18px rgba(38,115,187,0.15)' }}>
            <I.MessageSq />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#2673bb' }}>Support</p>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Contact Us</h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(53,161,62,0.08)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.2)' }}>
          <span className="live-dot" style={{ width: 6, height: 6 }} />
          <span className="font-semibold">Support Available</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: tab === t.id ? 'rgba(38,115,187,0.12)' : 'var(--input-bg)',
              color:      tab === t.id ? '#2673bb' : 'var(--text-muted)',
              border:     `1px solid ${tab === t.id ? 'rgba(38,115,187,0.3)' : 'var(--border)'}`,
              boxShadow:  tab === t.id ? '0 0 12px rgba(38,115,187,0.15)' : 'none',
            }}>
            <t.Icon />
            {t.label}
            {t.badge > 0 && (
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black"
                style={{ background: '#e95330', color: '#fff', fontSize: 10 }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'contact' ? (
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Form panel */}
          <div className="rounded-2xl p-6"
            style={{ background: 'var(--table-bg)', border: '1px solid var(--border)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            <div className="flex items-center gap-2 mb-5" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
              <I.MessageSq />
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Raise a Support Query</h2>
            </div>
            <ContactForm onSubmitted={handleSubmitted} />
          </div>

          {/* Contact info sidebar */}
          <div className="grid gap-4 content-start">
            <div className="rounded-2xl p-5"
              style={{ background: 'var(--table-bg)', border: '1px solid var(--border)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Get in Touch</h3>
              <div className="grid gap-3">
                <InfoCard Icon={I.Mail}   label="Email"   value="support@oxyloans.com" color="#2673bb" />
                <InfoCard Icon={I.Phone}  label="Phone"   value="+91 91825 80511"       color="#35a13e" />
                <p className="text-xs px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(233,83,48,0.08)', color: '#e95330', border: '1px solid rgba(233,83,48,0.2)', marginTop: -6 }}>
                  ⚡ For anything urgent or an emergency, feel free to call us directly on this number.
                </p>
                <InfoCard Icon={I.MapPin} label="Address" value="Hyderabad, Telangana"  color="#f58311" />
              </div>
            </div>
            {/* <div className="rounded-2xl p-5"
              style={{ background: 'linear-gradient(135deg,rgba(38,115,187,0.08) 0%,var(--card-bg) 100%)', border: '1px solid rgba(38,115,187,0.18)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
              <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Response Times</h3>
              <div className="grid gap-2">
                {[
                  { label: 'High Priority',   time: '24 hours',   color: '#e95330' },
                  { label: 'Medium Priority', time: '24-48 hours', color: '#f58311' },
                  { label: 'Low Priority',    time: '2–3 days',    color: '#35a13e' },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${r.color}10`, color: r.color, border: `1px solid ${r.color}20` }}>
                      {r.time}
                    </span>
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-6"
          style={{ background: 'var(--table-bg)', border: '1px solid var(--border)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          
          <TicketHistory onRefresh={fetchPendingCount} />
        </div>
      )}
    </div>
  );
}
