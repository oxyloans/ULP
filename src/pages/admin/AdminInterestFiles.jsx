import { useState } from 'react';
import { getInterestFilesByDate } from '../../api/afterlogin-admin';

// ─── Icons ────────────────────────────────────────────────────────────────────
const CalendarIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const SearchIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const FileIcon      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const DownloadIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const EmptyIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Convert YYYY-MM-DD (HTML date input) → DD/MM/YYYY (API param). */
function ymdToDmy(ymd) {
  if (!ymd) return '';
  const [yyyy, mm, dd] = ymd.split('-');
  return `${dd}/${mm}/${yyyy}`;
}

/** Normalise a URL returned by the API — strips protocol-whitespace artefacts. */
function normaliseUrl(value) {
  if (!value) return '';
  const raw = String(value).trim();
  const cleaned = raw.replace(/^https:\s*\/\//i, 'https://').replace(/^http:\s*\/\//i, 'http://');
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return '';
}

/** Best-effort file name from a URL or key. */
function labelFromUrl(url, fallback) {
  if (!url) return fallback;
  try {
    const parts = new URL(url).pathname.split('/');
    const last = parts[parts.length - 1];
    if (last) return decodeURIComponent(last);
  } catch {
    // ignore malformed urls
  }
  return fallback;
}

async function triggerDownload(url, fileName) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  } catch {
    // fallback: open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

// ─── File row normalisation ───────────────────────────────────────────────────
/**
 * The API may return an array of objects, an array of strings (URLs), or a
 * single object whose values are file URLs. This function turns whatever comes
 * back into a uniform list of { key, url, name } objects.
 */
function normaliseFiles(raw) {
  if (!raw) return [];

  // array of objects
  if (Array.isArray(raw)) {
    return raw.flatMap((item, idx) => {
      if (typeof item === 'string') {
        const url = normaliseUrl(item);
        return url ? [{ key: `file-${idx}`, url, name: labelFromUrl(url, `File ${idx + 1}`) }] : [];
      }
      if (item && typeof item === 'object') {
        // try common property names first
        const knownKeys = ['fileUrl', 'url', 'downloadUrl', 'filePath', 'link', 'fileLink', 'path'];
        const urlVal = knownKeys.map(k => item[k]).find(v => v);
        if (urlVal) {
          const url = normaliseUrl(urlVal);
          const name = item.fileName ?? item.name ?? item.fileType ?? item.type ?? labelFromUrl(url, `File ${idx + 1}`);
          return url ? [{ key: `file-${idx}`, url, name }] : [];
        }
        // fall back: collect all string values that look like URLs
        return Object.entries(item).flatMap(([k, v]) => {
          if (typeof v !== 'string') return [];
          const url = normaliseUrl(v);
          return url ? [{ key: `${k}-${idx}`, url, name: labelFromUrl(url, k) }] : [];
        });
      }
      return [];
    });
  }

  // plain object: values are file URLs
  if (typeof raw === 'object') {
    return Object.entries(raw).flatMap(([k, v]) => {
      if (typeof v !== 'string') return [];
      const url = normaliseUrl(v);
      return url ? [{ key: k, url, name: labelFromUrl(url, k) }] : [];
    });
  }

  return [];
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminInterestFiles() {
  const [date, setDate]           = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [files, setFiles]         = useState(null); // null = not yet fetched
  const [downloading, setDownloading] = useState(null); // key of file being downloaded

  const handleFetch = async () => {
    if (!date) {
      setError('Please select a date before fetching.');
      return;
    }
    setLoading(true);
    setError('');
    setFiles(null);
    try {
      const dmy = ymdToDmy(date);
      const data = await getInterestFilesByDate(dmy);
      setFiles(normaliseFiles(data));
    } catch (err) {
      setError(err?.message ?? 'Failed to fetch files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file) => {
    setDownloading(file.key);
    await triggerDownload(file.url, file.name);
    setDownloading(null);
  };

  const displayDate = date
    ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="grid gap-5">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl px-6 py-5 flex items-center gap-4"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8' }}>
          <FileIcon />
        </div>
        <div>
          <h1 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>Generated Interest Files</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Select a date to view the interest files generated for that payout day.
          </p>
        </div>
      </div>

      {/* ── Date picker card ──────────────────────────────────────────────── */}
      <div className="rounded-2xl px-6 py-5"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
          Select Date
        </p>
        <div className="flex flex-wrap items-end gap-4">
          {/* Date input */}
          <div className="flex-1 min-w-[200px] max-w-xs">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Payout Date
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                <CalendarIcon />
              </span>
              <input
                type="date"
                value={date}
                onChange={e => { setDate(e.target.value); setError(''); setFiles(null); }}
                className="w-full rounded-xl text-sm outline-none"
                style={{
                  padding: '10px 14px 10px 36px',
                  background: 'var(--input-bg)',
                  border: `1.5px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(99,102,241,0.3)'}`,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* Fetch button */}
          <button
            onClick={handleFetch}
            disabled={loading || !date}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: loading || !date
                ? 'rgba(99,102,241,0.3)'
                : 'linear-gradient(135deg,#6366f1,#4338ca)',
              color: '#fff',
              cursor: loading || !date ? 'not-allowed' : 'pointer',
              boxShadow: loading || !date ? 'none' : '0 4px 14px rgba(99,102,241,0.4)',
            }}>
            {loading
              ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
              : <SearchIcon />}
            {loading ? 'Fetching…' : 'Fetch Files'}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-xs font-semibold" style={{ color: '#ef4444' }}>{error}</p>
        )}
      </div>

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {files !== null && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          {/* Table header */}
          <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-2"
            style={{ borderBottom: '1px solid var(--border)', background: 'rgba(99,102,241,0.04)' }}>
            <div>
              <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                Files for {displayDate}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {files.length} file{files.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>

          {files.length === 0 ? (
            /* Empty state */
            <div className="py-16 flex flex-col items-center gap-3">
              <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}><EmptyIcon /></span>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                No files found for {displayDate}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                Try a different date or verify that files were generated for this payout day.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--input-bg)' }}>
                    {['#', 'File Name', 'URL', 'Download'].map(h => (
                      <th key={h} className="text-left py-3 px-5 text-xs uppercase tracking-widest font-semibold whitespace-nowrap"
                        style={{ color: 'var(--text-muted)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, idx) => (
                    <tr key={file.key} style={{ borderBottom: '1px solid var(--border)' }}
                      className="hover:bg-[rgba(99,102,241,0.03)] transition-colors">
                      <td className="py-3 px-5 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                        {idx + 1}
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <span style={{ color: '#818cf8' }}><FileIcon /></span>
                          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {file.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-5 max-w-[280px]">
                        <span className="text-xs truncate block" style={{ color: 'var(--text-muted)', maxWidth: 280 }}
                          title={file.url}>
                          {file.url}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <button
                          onClick={() => handleDownload(file)}
                          disabled={downloading === file.key}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{
                            background: 'rgba(99,102,241,0.1)',
                            color: '#818cf8',
                            border: '1px solid rgba(99,102,241,0.25)',
                            cursor: downloading === file.key ? 'not-allowed' : 'pointer',
                            opacity: downloading === file.key ? 0.6 : 1,
                          }}>
                          {downloading === file.key
                            ? <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                            : <DownloadIcon />}
                          {downloading === file.key ? 'Downloading…' : 'Download'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
