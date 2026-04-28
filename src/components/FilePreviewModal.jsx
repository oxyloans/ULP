/**
 * FilePreviewModal
 * Shows images inline and PDFs in an iframe — no new tab.
 * Usage:
 *   <FilePreviewModal url={url} name={name} onClose={() => setUrl(null)} />
 */
export default function FilePreviewModal({ url, name, onClose }) {
  if (!url) return null;

  const lower   = url.toLowerCase().split('?')[0];
  const isPdf   = lower.endsWith('.pdf');
  const isImage = /\.(png|jpe?g|gif|webp|svg|bmp)$/.test(lower);

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={handleBackdrop}>

      <div
        className="relative flex flex-col rounded-2xl overflow-hidden w-full"
        style={{
          maxWidth: isPdf ? 860 : 680,
          maxHeight: '92vh',
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
        }}
        onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--input-bg)' }}>
          <div className="flex items-center gap-2.5 min-w-0">
            {/* File type badge */}
            <span className="text-xs font-black px-2 py-0.5 rounded-lg flex-shrink-0 uppercase"
              style={isPdf
                ? { background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }
                : { background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }
              }>
              {isPdf ? 'PDF' : 'IMG'}
            </span>
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {name || url.split('/').pop() || 'Document'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Open in new tab */}
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Open
            </a>
            {/* Close */}
            <button onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-auto flex items-center justify-center"
          style={{ background: isPdf ? '#1a1a2e' : 'var(--input-bg)', minHeight: 300 }}>

          {isPdf && (
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
              title={name || 'Document'}
              className="w-full"
              style={{ height: 'min(75vh, 700px)', border: 'none' }}
            />
          )}

          {isImage && (
            <img
              src={url}
              alt={name || 'Attachment'}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: 'min(75vh, 700px)', padding: 16 }}
            />
          )}

          {!isPdf && !isImage && (
            <div className="flex flex-col items-center gap-4 py-16 px-8 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Preview not available</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>This file type can't be previewed in the browser.</p>
              </div>
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4338ca)', color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
