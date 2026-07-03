import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSdLots } from '../api/afterlogin-user';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Building   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="4" width="18" height="17" rx="1"/><path d="M3 8h18M6 11h3v3H6v-3zm4.5 0h3v3h-3v-3zm4.5 0h3v3h-3v-3zM6 16h3v2H6v-2zm4.5 0h4v5h-4v-5zM15 16h3v2h-3v-2zM1 21h22"/></svg>;
const Ruler      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21.3 8.7L8.7 21.3c-.4.4-1 .4-1.4 0l-4.6-4.6c-.4-.4-.4-1 0-1.4L15.3 2.7c.4-.4 1-.4 1.4 0l4.6 4.6c.4.4.4 1 0 1.4zM9 13.5l1.5 1.5M11.5 11l1.5 1.5M14 8.5l1.5 1.5M16.5 6l1.5 1.5"/></svg>;
const MapPin     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const Shield     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const FileText   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const ArrowRight = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const Download   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>;

function fmtINR(n) {
  return formatINR(n ?? 0);
}

function getFileName(path, defaultName) {
  if (!path) return defaultName;
  try {
    const parts = path.split('/');
    const last = parts[parts.length - 1];
    const clean = last.split('?')[0];
    const prefixRemoved = clean.replace(/^(legalreport|valuationreport|images|videos)_/, '');
    return decodeURIComponent(prefixRemoved);
  } catch (e) {
    return defaultName;
  }
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),1500); }}
      className="flex-shrink-0 p-1 rounded transition-all hover:scale-110"
      style={{ color: copied ? '#16a34a' : 'var(--text-muted)' }} title="Copy">
      {copied
        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      }
    </button>
  );
}

function AssetDealCard({ deal, index }) {
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const raisedPct = deal.totalSize > 0 ? Math.min(Math.round((deal.raised / deal.totalSize) * 100), 100) : 0;
  const isClosed  = deal.status === 'Closed' || deal.remaining === 0;

  // Aesthetic colors based on index & status
  const isAltColor   = index % 2 === 1;
  const accentColor  = isClosed ? '#64748b' : isAltColor ? '#06b6d4' : '#6366f1';
  const progressBg   = isClosed ? '#64748b' : isAltColor ? 'linear-gradient(90deg,#06b6d4,#22d3ee)' : 'linear-gradient(90deg,#6366f1,#818cf8)';
  const progressGlow = isClosed ? 'none' : isAltColor ? '0 0 8px rgba(6,182,212,0.6)' : '0 0 8px rgba(99,102,241,0.6)';
  const cardBorder   = isClosed ? 'var(--border)' : isAltColor ? 'rgba(6,182,212,0.18)' : 'rgba(99,102,241,0.18)';

  // Property cover image fallback
  const coverImage = (deal.images && deal.images.length > 0)
    ? deal.images[0]
    : isAltColor
      ? 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80'
      : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';

  // Static maps fallback link
  const mapUrl = (deal.latitude && deal.longitude)
    ? `https://www.google.com/maps/search/?api=1&query=${deal.latitude},${deal.longitude}`
    : null;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col animate-fadeIn"
      style={{
        background: 'var(--surface-card)',
        border: `1px solid ${cardBorder}`,
        boxShadow: '0 2px 20px rgba(0,0,0,0.07)',
        opacity: isClosed ? 0.75 : 1,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        if (!isClosed) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = isAltColor ? '0 10px 36px rgba(6,182,212,0.14)' : '0 10px 36px rgba(99,102,241,0.14)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.07)';
      }}
    >
      <div className="flex flex-col md:flex-row">
        {/* Left side / Top side Visual Hero Cover */}
        <div
          className="w-full md:w-80 flex flex-col justify-between p-6 text-white relative overflow-hidden flex-shrink-0"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.85) 100%), url("${coverImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: isClosed ? 0.8 : 1,
          }}
        >
          {/* Top badges */}
          <div className="flex items-center justify-between z-10">
            <span
              className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{
                background: isClosed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              {deal.assetAreaType}
            </span>
            <span
              className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{
                background: isClosed ? 'rgba(100,116,139,0.2)' : isAltColor ? 'rgba(6,182,212,0.2)' : 'rgba(99,102,241,0.2)',
                border: `1px solid ${accentColor}`,
                color: isClosed ? '#94a3b8' : '#fff',
              }}
            >
              {deal.tag}
            </span>
          </div>

          {/* Info middle */}
          <div className="my-8 md:my-12 z-10 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Project Name</p>
            <h3 className="text-xl font-black mt-1 leading-snug truncate" title={deal.projectName}>
              {deal.projectName}
            </h3>
            <p className="text-xs mt-1 opacity-75 font-medium flex items-center gap-1">
              Borrower: <span className="font-bold">{deal.borrowerName}</span>
            </p>
          </div>

          {/* Bottom Coordinates & Area */}
          <div className="grid grid-cols-2 gap-2 pt-4 z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="text-left">
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-0.5"><Ruler /> Area</p>
              <p className="text-xs font-extrabold mt-0.5">{deal.area}</p>
            </div>
            <div className="text-left">
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-0.5"><MapPin /> Location</p>
              {deal.latitude && deal.longitude ? (
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="text-xs font-extrabold mt-0.5 hover:underline flex items-center gap-0.5 transition-colors text-left font-mono"
                  style={{ color: isAltColor ? '#22d3ee' : '#a5b4fc' }}
                >
                  {showMap ? 'Hide Map' : 'Show Map'}
                </button>
              ) : (
                <p className="text-xs font-extrabold mt-0.5">—</p>
              )}
            </div>
          </div>
        </div>

        {/* Middle Column: Details & Verified Documents */}
        <div className="flex-1 p-6 flex flex-col justify-between gap-5 border-b md:border-b-0 md:border-r text-left" style={{ borderColor: 'var(--border)' }}>
          <div className="grid gap-3.5">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{deal.title}</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Sub-Type: <span className="font-semibold text-indigo-500">{'FRACTIONAL LENDING'}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold block" style={{ color: 'var(--text-muted)' }}>Asset Valuation</span>
                <span className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>{fmtINR(deal.assetValue)}</span>
              </div>
            </div>

            {/* Collateral & Borrower Details Grid */}
            <div className="grid grid-cols-2 gap-3.5 p-3.5 rounded-xl transition-all" style={{ background: 'rgba(6,182,212,0.02)', border: '1px dashed rgba(6,182,212,0.18)' }}>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Project Collateral</span>
                <span className="text-xs font-extrabold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                  <span style={{ color: '#06b6d4' }} className="shrink-0"><Building /></span> {deal.projectName}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Borrower / Developer</span>
                <span className="text-xs font-extrabold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /> {deal.borrowerName}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Dimensions &amp; Type</span>
                <span className="text-xs font-extrabold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                  <span style={{ color: 'var(--text-muted)' }} className="shrink-0"><Ruler /></span> {deal.area} ({deal.assetAreaType})
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Collateral Verification</span>
                <span className="text-xs font-extrabold flex items-center gap-1" style={{ color: '#10b981' }}>
                  <span className="flex-shrink-0 text-emerald-500"><Shield /></span> Secured &amp; Verified
                </span>
              </div>
            </div>

            {/* Media Gallery / More Indicator if present */}
            {((deal.images && deal.images.length > 0) || (deal.videos && deal.videos.length > 0)) && (
              <div className="flex gap-2">
                {deal.images && deal.images.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    📸 {deal.images.length} Collateral Photo{deal.images.length > 1 ? 's' : ''}
                  </span>
                )}
                {deal.videos && deal.videos.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    🎥 {deal.videos.length} Video tour{deal.videos.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Tenure</p>
                <p className="text-sm font-extrabold mt-0.5" style={{ color: 'var(--text-primary)' }}>{deal.tenure}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Monthly ROI</p>
                <p className="text-sm font-extrabold mt-0.5" style={{ color: '#10b981' }}>{deal.roiMonthly}%</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Min Participate</p>
                <p className="text-sm font-extrabold mt-0.5" style={{ color: 'var(--text-primary)' }}>{fmtINR(deal.minInvestment)}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar & Valuation Details */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span style={{ color: 'var(--text-muted)' }}>
                Funding Progress: <span style={{ color: 'var(--text-primary)' }}>{raisedPct}%</span>
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                Target: <span style={{ color: 'var(--text-primary)' }}>{fmtINR(deal.totalSize)}</span>
              </span>
            </div>

            {/* Real progress line */}
            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${raisedPct}%`,
                  background: progressBg,
                  boxShadow: progressGlow,
                }}
              />
            </div>

            <div className="flex justify-between text-xs mt-0.5">
              <span style={{ color: 'var(--text-muted)' }}>Raised: <strong style={{ color: 'var(--text-primary)' }}>{fmtINR(deal.raised)}</strong></span>
              <span style={{ color: 'var(--text-muted)' }}>Remaining: <strong style={{ color: accentColor }}>{fmtINR(deal.remaining)}</strong></span>
            </div>
          </div>

          </div>

        {/* Right side Bank Details & CTA action */}
        <div className="w-full md:w-80 p-6 flex flex-col justify-between gap-5 text-left border-t md:border-t-0 md:border-l" style={{ background: 'rgba(6,182,212,0.01)', borderColor: 'var(--border)' }}>
          {/* Direct Bank Transfer Details */}
          {deal.bankDetails ? (
            <div className="p-4 rounded-2xl border text-xs grid gap-3 animate-fadeIn" style={{ background: 'var(--surface-card)', borderColor: 'var(--border)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div className="flex items-center gap-1.5 font-bold text-cyan-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>
                <span>Direct Bank Details</span>
              </div>
              <div className="grid gap-2 text-[11px]">
                <div>
                  <span className="text-[9px] text-muted block uppercase tracking-wider font-semibold">Account Holder</span>
                  <span className="font-extrabold truncate block" style={{ color: 'var(--text-primary)' }} title={deal.bankDetails.accountName}>{deal.bankDetails.accountName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-muted block uppercase tracking-wider font-semibold">Bank Name</span>
                  <span className="font-extrabold truncate block" style={{ color: 'var(--text-primary)' }} title={deal.bankDetails.bankName}>{deal.bankDetails.bankName}</span>
                </div>
                <div className="flex items-center justify-between gap-1.5 p-1.5 rounded border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border)' }}>
                  <div>
                    <span className="text-[8px] text-muted block uppercase tracking-wider font-semibold">Account Number</span>
                    <span className="font-mono font-extrabold" style={{ color: 'var(--text-primary)' }}>{deal.bankDetails.accountNumber}</span>
                  </div>
                  <CopyBtn text={deal.bankDetails.accountNumber} />
                </div>
                <div className="flex items-center justify-between gap-1.5 p-1.5 rounded border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border)' }}>
                  <div>
                    <span className="text-[8px] text-muted block uppercase tracking-wider font-semibold">IFSC Code</span>
                    <span className="font-mono font-extrabold" style={{ color: 'var(--text-primary)' }}>{deal.bankDetails.ifsc}</span>
                  </div>
                  <CopyBtn text={deal.bankDetails.ifsc} />
                </div>
                <div>
                  <span className="text-[9px] text-muted block uppercase tracking-wider font-semibold">Branch</span>
                  <span className="font-extrabold truncate block" style={{ color: 'var(--text-primary)' }}>{deal.bankDetails.branch}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4 rounded-2xl border border-dashed opacity-50" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs text-muted text-center">No bank details attached</p>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={() => !isClosed && navigate(`/asset/participate/${deal.id}`)}
            disabled={isClosed}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm transition-all"
            style={{
              background: isClosed ? 'var(--input-bg)' : isAltColor ? 'linear-gradient(135deg,#06b6d4,#0891b2)' : 'linear-gradient(135deg,#6366f1,#4338ca)',
              color: isClosed ? 'var(--text-muted)' : '#fff',
              border: isClosed ? '1px solid var(--border)' : 'none',
              boxShadow: isClosed ? 'none' : isAltColor ? '0 4px 14px rgba(6,182,212,0.4)' : '0 4px 14px rgba(99,102,241,0.4)',
              cursor: isClosed ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!isClosed) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
          >
            {isClosed ? 'Fully Subscribed' : 'Participate Now'}
            {!isClosed && <ArrowRight />}
          </button>
        </div>
      </div>

      {/* Collapsible map view frame */}
      {showMap && deal.latitude && deal.longitude && (
        <div className="w-full border-t relative overflow-hidden animate-fadeIn" style={{ height: 260, borderColor: 'var(--border)' }}>
          <iframe
            title={`Map for ${deal.projectName}`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            src={`https://maps.google.com/maps?q=${deal.latitude},${deal.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          />
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-lg backdrop-blur-sm"
            >
              <MapPin /> Open in Google Maps
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// Map deal response → card parameters
function mapAssetDeal(raw) {
  const status = raw.dealStatus === 'ACHIEVED' ? 'Closed' : 'Open';

  const interestOptions = [
    raw.monthlyInterest      > 0 && { type: 'MONTHLY',      label: 'Monthly',        rate: raw.monthlyInterest      },
    raw.quartelyInterest     > 0 && { type: 'QUARTELY',     label: 'Quarterly',      rate: raw.quartelyInterest     },
    raw.halfInterest         > 0 && { type: 'HALFLY',       label: 'Half-Yearly',    rate: raw.halfInterest         },
    raw.yearlyInterest       > 0 && { type: 'YEARLY',       label: 'Yearly',         rate: raw.yearlyInterest       },
    raw.endofthedealInterest > 0 && { type: 'ENDOFTHEDEAL', label: 'End of Deal',    rate: raw.endofthedealInterest },
  ].filter(Boolean);

  const totalSize    = raw.dealAmount ?? 0;
  const participated = raw.dealParticipationValue ?? 0;
  const remaining    = raw.remainingDealValue ?? (totalSize - participated);

  const fractional = raw.fractionalAssetResponse ?? raw.fractionalInvestmentDto ?? {};

  // Extract documents from fractionalList
  const documents = fractional.fractionalList ?? [];
  const legalReportDoc = documents.find(d => d.documentType === 'legalreport');
  const valuationReportDoc = documents.find(d => d.documentType === 'valuationreport');
  const imagesDocs = documents.filter(d => d.documentType === 'images' || d.documentType === 'fractionalimage');
  const videosDocs = documents.filter(d => d.documentType === 'videos' || d.documentType === 'fractionalvideo');

  return {
    id:                 raw.id ?? raw.dealName,
    title:              raw.dealName,
    status,
    tag:                status === 'Closed' ? 'Fully Subscribed' : 'Live Opportunity',
    totalSize,
    raised:             participated,
    remaining,
    minInvestment:      raw.minimumParticipation ?? 0,
    maxInvestment:      raw.maxParticipation ?? 0,
    roiMonthly:         raw.monthlyInterest ?? 0,
    tenureMonths:       raw.duration ?? 0,
    tenure:             raw.duration ? `${raw.duration} months` : '—',
    dealSubType:        raw.dealSubType ?? '',
    projectName:        fractional.projectName ?? '—',
    borrowerName:       fractional.borrowerName ?? '—',
    assetValue:         fractional.assetValue ?? 0,
    assetArea:          raw.assetArea ?? fractional.assetArea ?? '—',
    assetAreaType:      fractional.fractionalAssetType ?? 'PLOT',
    latitude:           fractional.latitude ?? 0,
    longitude:          fractional.longitude ?? 0,
    legalReport:        legalReportDoc?.documentPath    ?? raw.legalReport    ?? null,
    legalReportName:    legalReportDoc?.documentName    ?? null,
    valuationReport:    valuationReportDoc?.documentPath ?? raw.valuationReport ?? null,
    valuationReportName:valuationReportDoc?.documentName ?? null,
    images:             imagesDocs.map(d => d.documentPath),
    videos:             videosDocs.map(d => d.documentPath),
    interestOptions,
    bankDetails: {
      bankName: raw.bankName ?? raw.transferFunds ?? '—',
      accountName: raw.companyName ?? '—',
      accountNumber: raw.accountNumber ?? '—',
      ifsc: raw.ifscCode ?? '—',
      branch: raw.branchName ?? '—',
    },
  };
}

export default function AssetDealsTest() {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roiFilter, setRoiFilter] = useState('All');
  const [areaFilter, setAreaFilter] = useState('All');

  useEffect(() => {
    Promise.all([
      getSdLots("TEST").catch(() => []),
    ])
    .then(([testDeals, normalDeals]) => {
      const allDeals = [...(testDeals || []), ...(normalDeals || [])];
      const uniqueDeals = [];
      const seenIds = new Set();
      for (const deal of allDeals) {
        if (deal && deal.id && !seenIds.has(deal.id)) {
          seenIds.add(deal.id);
          if (deal.globalDealType === 'ASSET') {
            uniqueDeals.push(deal);
          }
        }
      }
      setDeals(uniqueDeals.map(mapAssetDeal));
    })
    .catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  const roiOptions  = ['All', '< 1.5%', '1.5–2%', '> 2%'];
  const areaOptions = ['All', 'PLOT', 'FLAT', 'ACERE'];

  const filtered = deals.filter(deal => {
    // Only show running (Open) deals
    if (deal.status !== 'Open') return false;

    // Check user restriction if present
    if (deal.userIds && deal.userIds.trim()) {
      const allowed = deal.userIds.split(',').map(id => id.trim()).filter(Boolean);
      if (allowed.length > 0 && !allowed.includes(user?.userId ?? '')) return false;
    }

    if (roiFilter === '< 1.5%' && deal.roiMonthly >= 1.5) return false;
    if (roiFilter === '1.5–2%' && (deal.roiMonthly < 1.5 || deal.roiMonthly > 2)) return false;
    if (roiFilter === '> 2%' && deal.roiMonthly <= 2) return false;

    if (areaFilter !== 'All' && deal.assetAreaType !== areaFilter) return false;

    return true;
  });

  const FilterGroup = ({ label, options, value, onChange }) => (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-bold uppercase tracking-widest flex-shrink-0" style={{ color: 'var(--text-muted)', fontSize: 10 }}>{label}</span>
      <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)}
            className="px-3 py-1 rounded-md text-xs font-bold transition-all whitespace-nowrap"
            style={{
              background: value === o ? 'linear-gradient(135deg,#6366f1,#4338ca)' : 'transparent',
              color: value === o ? '#fff' : 'var(--text-muted)',
              boxShadow: value === o ? '0 2px 6px rgba(99,102,241,0.35)' : 'none',
            }}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );

  const hasActiveFilters = roiFilter !== 'All' || areaFilter !== 'All';

  return (
    <div className="grid gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
            <span style={{ color: '#6366f1' }}><Building /></span> Premium Asset Deals
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Browse and invest in fractional property offerings with fully verified reports
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-4 flex flex-col gap-3"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Filters</span>
          {hasActiveFilters && (
            <button onClick={() => { setRoiFilter('All'); setAreaFilter('All'); }}
              className="text-xs font-bold px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              Clear All
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
          <FilterGroup label="Monthly ROI" options={roiOptions} value={roiFilter} onChange={setRoiFilter} />
          <FilterGroup label="Asset Type"  options={areaOptions} value={areaFilter} onChange={setAreaFilter} />
        </div>
      </div>

      {/* Summary Stats strip */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fadeIn">
          {[
            { label: 'Verified Deals',      value: filtered.length,                                                                                                   color: '#6366f1' },
            { label: 'Active Targets',      value: fmtINR(filtered.reduce((s, d) => s + (d.totalSize ?? 0), 0)),                                                      color: '#06b6d4' },
            { label: 'Avg Monthly ROI',     value: filtered.length ? `${(filtered.reduce((s, d) => s + (d.roiMonthly ?? 0), 0) / filtered.length).toFixed(2)}%` : '—',        color: '#10b981' },
            { label: 'Total Valuation',     value: fmtINR(filtered.reduce((s, d) => s + (d.assetValue ?? 0), 0)),                                                     color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl px-4 py-3.5"
              style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <p className="text-xl font-black" style={{ color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Grid of Deals */}
      <div className="grid gap-6">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 rounded-2xl animate-pulse" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Fetching premium asset deals…</span>
          </div>
        ) : filtered.length === 0
          ? <div className="py-20 text-center rounded-2xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No running asset deals match your selection.</p>
              <button onClick={() => { setRoiFilter('All'); setAreaFilter('All'); }}
                className="mt-3 text-xs font-bold px-4 py-2 rounded-xl"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
                Reset Filters
              </button>
            </div>
          : [...filtered].reverse().map((deal, index) => <AssetDealCard key={deal.id} deal={deal} index={index} />)
        }
      </div>
    </div>
  );
}
