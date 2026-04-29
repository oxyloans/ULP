import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSdLots } from '../api/afterlogin-user';

const USE_DUMMY = false;

// ─── Icons ────────────────────────────────────────────────────────────────────
const Bank      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>;
const Copy      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const ArrowRight= () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

function fmtINR(n) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handle} title="Copy"
      className="flex-shrink-0 transition-all hover:scale-110"
      style={{ color: copied ? '#10b981' : 'var(--text-muted)' }}>
      <Copy />
    </button>
  );
}

function BankCard({ bank }) {
  const rows = [
    { label: 'Bank',    value: bank.bankName },
    { label: 'A/C Name',value: bank.accountName },
    { label: 'A/C No.', value: bank.accountNumber, mono: true },
    { label: 'IFSC',    value: bank.ifsc, mono: true },
    { label: 'Branch',  value: bank.branch },
  ];
  return (
    <div className="rounded-xl p-4 grid gap-2"
      style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color: '#818cf8' }}><Bank /></span>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#818cf8' }}>Bank Details</span>
      </div>
      {rows.map(r => (
        <div key={r.label} className="flex items-center justify-between gap-3">
          <span className="text-xs" style={{ color: 'var(--text-muted)', minWidth: 64 }}>{r.label}</span>
          <div className="flex items-center gap-1.5 flex-1 justify-end">
            <span className={`text-xs font-semibold text-right ${r.mono ? 'font-mono' : ''}`}
              style={{ color: 'var(--text-primary)' }}>{r.value}</span>
            {r.mono && <CopyBtn text={r.value} />}
          </div>
        </div>
      ))}
    </div>
  );
}

function SDLotCard({ lot }) {
  const navigate = useNavigate();
  const raisedPct = lot.totalSize > 0 ? Math.min(Math.round((lot.raised / lot.totalSize) * 100), 100) : 0;
  const isClosed  = lot.status === 'Closed' || lot.remaining === 0;
  const accentColor = isClosed ? '#64748b' : '#6366f1';

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--surface-card)',
        border: `1px solid ${isClosed ? 'var(--border)' : 'rgba(99,102,241,0.18)'}`,
        boxShadow: '0 2px 20px rgba(0,0,0,0.07)',
        opacity: isClosed ? 0.75 : 1,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => { if (!isClosed) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(99,102,241,0.14)'; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.07)'; }}
    >
      <div className="flex items-stretch">

        {/* ── Left: Total Fund hero panel ── */}
        <div className="w-[180px] flex-shrink-0 flex flex-col items-center justify-center p-5 relative overflow-hidden"
          style={{
            background: isClosed
              ? 'linear-gradient(145deg,#1e293b,#0f172a)'
              : 'linear-gradient(145deg,#1e1b4b 0%,#312e81 60%,#1e3a8a 100%)',
            borderRight: `1px solid ${isClosed ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.25)'}`,
          }}>
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
            style={{ background: 'rgba(129,140,248,0.15)', filter: 'blur(20px)' }} />

          <p className="text-xs font-bold uppercase tracking-widest mb-1 relative z-10"
            style={{ color: 'rgba(165,180,252,0.7)' }}>Total Fund</p>
          <p className="text-2xl font-black leading-none relative z-10 text-center"
            style={{ color: '#fff', fontFamily: "'JetBrains Mono', monospace", textShadow: '0 0 20px rgba(129,140,248,0.5)' }}>
            {fmtINR(lot.totalSize)}
          </p>

          {/* Raised / Remaining */}
          <div className="w-full mt-4 relative z-10 grid gap-1">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${raisedPct}%`, background: isClosed ? '#64748b' : 'linear-gradient(90deg,#818cf8,#10b981)', boxShadow: isClosed ? 'none' : '0 0 8px rgba(129,140,248,0.6)' }} />
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'rgba(165,180,252,0.6)', fontSize: 9 }}>Raised {raisedPct}%</span>
              <span style={{ color: 'rgba(165,180,252,0.6)', fontSize: 9 }}>{fmtINR(lot.remaining)} left</span>
            </div>
          </div>
        </div>

        {/* ── Right: rest of content ── */}
        <div className="flex-1 flex flex-col lg:flex-row lg:items-center gap-0 divide-y lg:divide-y-0 lg:divide-x"
          style={{ borderColor: 'var(--border)' }}>

          {/* ── Section A: Title + meta ── */}
          <div className="px-5 py-4 lg:w-[260px] flex-shrink-0 flex flex-col justify-center">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: `${lot.tagColor}18`, color: lot.tagColor, border: `1px solid ${lot.tagColor}30` }}>
                {lot.tag}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: isClosed ? 'rgba(100,116,139,0.1)' : 'rgba(16,185,129,0.1)', color: isClosed ? '#94a3b8' : '#10b981', border: `1px solid ${isClosed ? 'rgba(100,116,139,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
                {lot.auctionType}
              </span>
            </div>
            <h3 className="text-sm font-extrabold leading-snug mb-2"
              style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
              {lot.title}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>
                {lot.payoutType}
              </span>
              {lot.feePercentage === 0
                ? <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                    Zero Fee
                  </span>
                : <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                    {lot.feePercentage}% Fee
                  </span>
              }
            </div>
          </div>

          {/* ── Section B: ROI + metrics ── */}
          <div className="px-5 py-4 lg:flex-1">
            {/* Interest options grid */}
            <div className="mb-3">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)', fontSize: 10 }}>Interest Options</p>
              <div className="flex flex-wrap gap-2">
                {(lot.interestOptions ?? []).length > 0 ? lot.interestOptions.map(opt => (
                  <div key={opt.type} className="flex flex-col items-center px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <span className="text-base font-black leading-none" style={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>{opt.rate}%</span>
                    <span className="text-xs mt-1 font-semibold" style={{ color: 'var(--text-muted)' }}>{opt.label}</span>
                  </div>
                )) : (
                  <div className="flex flex-col items-center px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <span className="text-base font-black leading-none" style={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>{lot.roiMonthly}%</span>
                    <span className="text-xs mt-1 font-semibold" style={{ color: 'var(--text-muted)' }}>Monthly</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tenure / Min / Max — equal 3-column row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Tenure',          value: lot.tenure,                color: '#818cf8' },
                { label: 'Min Investment',  value: fmtINR(lot.minInvestment), color: '#f59e0b' },
                { label: 'Max Investment',  value: fmtINR(lot.maxInvestment), color: '#f59e0b' },
              ].map(f => (
                <div key={f.label} className="rounded-xl px-3 py-2.5"
                  style={{ background: `${f.color}08`, border: `1px solid ${f.color}18` }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', fontSize: 10 }}>{f.label}</p>
                  <p className="text-sm font-extrabold" style={{ color: f.color, fontFamily: "'JetBrains Mono', monospace" }}>{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section C: Bank + CTA ── */}
          <div className="px-5 py-4 lg:w-[260px] flex-shrink-0 flex flex-col justify-center gap-3">
            {/* Bank full details */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
                style={{ color: '#f59e0b', fontSize: 10, letterSpacing: '0.1em' }}>
                ⚡ Transfer Funds To
              </p>
              <div className="rounded-xl overflow-hidden"
                style={{ background: 'rgba(245,158,11,0.06)', border: '1.5px solid rgba(245,158,11,0.35)', boxShadow: '0 0 12px rgba(245,158,11,0.12)' }}>
                {/* Header */}
                <div className="flex items-center gap-2 px-3 py-2.5"
                  style={{ borderBottom: '1px solid rgba(99,102,241,0.1)', background: 'rgba(99,102,241,0.08)' }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                    <Bank />
                  </div>
                  <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                    {lot.bankDetails.accountName}
                  </p>
                </div>
                {/* Details */}
                <div className="px-3 py-2.5 grid gap-1.5">
                  {[
                    { label: 'Bank',    value: lot.bankDetails.bankName,      copy: false },
                    { label: 'A/C No.', value: lot.bankDetails.accountNumber, copy: true  },
                    { label: 'IFSC',    value: lot.bankDetails.ifsc,          copy: true  },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between gap-2">
                      <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)', minWidth: 40 }}>{r.label}</span>
                      <div className="flex items-center gap-1 flex-1 justify-end min-w-0">
                        <span className="text-xs font-semibold font-mono truncate" style={{ color: 'var(--text-primary)' }}>{r.value}</span>
                        {r.copy && <CopyBtn text={r.value} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => !isClosed && navigate(`/sd-lot/participate/${lot.id}`)}
              disabled={isClosed}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{
                background: isClosed ? 'var(--input-bg)' : 'linear-gradient(135deg,#6366f1,#4338ca)',
                color: isClosed ? 'var(--text-muted)' : '#fff',
                border: isClosed ? '1px solid var(--border)' : 'none',
                boxShadow: isClosed ? 'none' : '0 4px 14px rgba(99,102,241,0.4)',
                cursor: isClosed ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!isClosed) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              {isClosed ? 'Achevied' : 'Participate Now'}
              {!isClosed && <ArrowRight />}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// Map new API deal shape → internal lot shape used by SDLotCard
function mapDeal(raw) {
  const status = raw.dealStatus === 'ACHIEVED' ? 'Closed' : 'Open';

  const interestOptions = [
    raw.monthlyInterest      > 0 && { type: 'MONTHLY',      label: 'Monthly',        rate: raw.monthlyInterest      },
    raw.quartelyInterest     > 0 && { type: 'QUARTELY',     label: 'Quarterly',      rate: raw.quartelyInterest     },
    raw.halfInterest         > 0 && { type: 'HALFLY',       label: 'Half-Yearly',    rate: raw.halfInterest         },
    raw.yearlyInterest       > 0 && { type: 'YEARLY',       label: 'Yearly',         rate: raw.yearlyInterest       },
    raw.endofthedealInterest > 0 && { type: 'ENDOFTHEDEAL', label: 'End of Deal',    rate: raw.endofthedealInterest },
  ].filter(Boolean);

  const totalSize      = raw.dealAmount ?? 0;
  const participated   = raw.dealParticipationValue ?? 0;
  const remaining      = raw.remainingDealValue ?? (totalSize - participated);

  return {
    id:             raw.id ?? raw.dealName,
    title:          raw.dealName,
    auctionType:    'Open',
    status,
    tag:            status === 'Closed' ? 'Sold Out' : 'Live',
    tagColor:       status === 'Closed' ? '#64748b' : '#10b981',
    totalSize,
    raised:         participated,
    remaining,
    minInvestment:  raw.minimumParticipation ?? 0,
    maxInvestment:  raw.maxParticipation ?? 0,
    roiMonthly:     raw.monthlyInterest ?? 0,
    tenureMonths:   raw.duration ?? 0,
    tenure:         raw.duration ? `${raw.duration} months` : '—',
    payoutType:     'Monthly',
    feePercentage:  0,
    dealSubType:    raw.dealSubType ?? '',
    loanActiveDate: raw.loanActiveDate ?? '',
    emiEndDate:     raw.emiEndDate ?? '',
    interestOptions,
    bankDetails: {
      bankName:      raw.bankName    ?? raw.transferFunds ?? '—',
      accountName:   raw.companyName ?? '—',
      accountNumber: raw.accountNumber ?? '—',
      ifsc:          raw.ifscCode    ?? '—',
      branch:        raw.branchName  ?? '—',
    },
  };
}

// ─── My Participations ────────────────────────────────────────────────────────
function MyParticipations() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getRunningDeals()
      .then(d => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmtFull = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);
  const participations = data?.participationInfo ?? [];
  const totalInvested  = participations.reduce((s, p) => s + (p.participatedAmount ?? 0), 0);
  const totalCurrent   = participations.reduce((s, p) => {
    const last = p.updatedParticipation?.[p.updatedParticipation.length - 1];
    return s + (last?.updationParticipation ?? p.participatedAmount ?? 0);
  }, 0);

  if (loading) return (
    <div className="flex items-center justify-center gap-3 py-10 rounded-2xl"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#10b981', borderTopColor: 'transparent' }} />
      <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading participations…</span>
    </div>
  );

  return (
    <div className="grid gap-4">
      {/* Section header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>My Participations</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Your active SD Lot investments</p>
        </div>
        {participations.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl text-center"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Total Invested</p>
              <p className="text-base font-black" style={{ color: '#6366f1', fontFamily: "'JetBrains Mono', monospace" }}>{fmtFull(totalInvested)}</p>
            </div>
            <div className="px-4 py-2 rounded-xl text-center"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Current Value</p>
              <p className="text-base font-black" style={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>{fmtFull(totalCurrent)}</p>
            </div>
          </div>
        )}
      </div>

      {participations.length === 0 ? (
        <div className="py-12 text-center rounded-2xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <p className="text-3xl mb-3">📊</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No active participations yet</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Participate in a deal above to see it here</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {participations.map((p, i) => {
            const isOpen = expanded === i;
            const latestUpdate = p.updatedParticipation?.[p.updatedParticipation.length - 1];
            const currentAmt = latestUpdate?.updationParticipation ?? p.participatedAmount;
            const growth = currentAmt - p.participatedAmount;
            const growthPct = p.participatedAmount > 0 ? ((growth / p.participatedAmount) * 100).toFixed(1) : 0;

            return (
              <div key={p.dealId ?? i} className="rounded-2xl overflow-hidden transition-all"
                style={{ background: 'var(--surface-card)', border: '1px solid rgba(16,185,129,0.2)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

                {/* Main row */}
                <div className="flex items-center gap-4 p-4 cursor-pointer flex-wrap"
                  onClick={() => setExpanded(isOpen ? null : i)}>

                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(16,185,129,0.06))', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  </div>

                  {/* Deal info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-extrabold" style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>{p.dealName}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                        {p.amountTye}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Since {p.participatedDate} · {p.updatedParticipation?.length ?? 0} update{(p.updatedParticipation?.length ?? 0) !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Numbers */}
                  <div className="flex items-center gap-5 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Invested</p>
                      <p className="text-sm font-extrabold" style={{ color: '#6366f1', fontFamily: "'JetBrains Mono', monospace" }}>{fmtFull(p.participatedAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Current</p>
                      <p className="text-sm font-extrabold" style={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>{fmtFull(currentAmt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ROI/mo</p>
                      <p className="text-sm font-extrabold" style={{ color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>{p.rateOfInterest}%</p>
                    </div>
                    {growth !== 0 && (
                      <span className="text-xs font-black px-2.5 py-1 rounded-lg"
                        style={{ background: growth > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: growth > 0 ? '#10b981' : '#ef4444', border: `1px solid ${growth > 0 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                        {growth > 0 ? '+' : ''}{growthPct}%
                      </span>
                    )}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      className="w-4 h-4 flex-shrink-0 transition-transform"
                      style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                {/* Update history */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="px-4 py-2.5 flex items-center gap-2"
                      style={{ background: 'var(--input-bg)', borderBottom: '1px solid var(--border)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" style={{ color: '#818cf8' }}>
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#818cf8' }}>Investment Timeline</span>
                    </div>
                    <div className="p-4 grid gap-2">
                      {/* Initial */}
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#6366f1', boxShadow: '0 0 6px rgba(99,102,241,0.5)' }} />
                        <div className="flex-1">
                          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Initial Participation</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{p.participatedDate}</p>
                        </div>
                        <p className="text-sm font-extrabold" style={{ color: '#6366f1', fontFamily: "'JetBrains Mono', monospace" }}>{fmtFull(p.participatedAmount)}</p>
                      </div>
                      {/* Updates */}
                      {(p.updatedParticipation ?? []).map((u, j) => (
                        <div key={j} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                          style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.5)' }} />
                          <div className="flex-1">
                            <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                              Update #{j + 1}
                              {u.amountTye && <span className="ml-1.5 font-normal text-xs" style={{ color: 'var(--text-muted)' }}>· {u.amountTye}</span>}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{u.updatedDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-extrabold" style={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>{fmtFull(u.updationParticipation)}</p>
                            {u.rateOfInterest && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.rateOfInterest}% ROI</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SDLotsTest() {
  const [lots, setLots]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [roiFilter,    setRoiFilter]    = useState('All');
  const [payoutFilter, setPayoutFilter] = useState('All');
  const [feeFilter,    setFeeFilter]    = useState('All');

  useEffect(() => {
    getSdLots("TEST")
      .then(data => { if (Array.isArray(data)) setLots(data.map(mapDeal)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const roiOptions    = ['All', '< 1.5%', '1.5–2%', '> 2%'];
  const payoutOptions = ['All', ...new Set(lots.map(l => l.payoutType))];
  const feeOptions    = ['All', 'Zero Fee', 'Has Fee'];

  const filtered = lots.filter(l => {
    if (statusFilter !== 'All' && l.status !== statusFilter) return false;
    if (roiFilter === '< 1.5%'  && l.roiMonthly >= 1.5) return false;
    if (roiFilter === '1.5–2%'  && (l.roiMonthly < 1.5 || l.roiMonthly > 2)) return false;
    if (roiFilter === '> 2%'    && l.roiMonthly <= 2) return false;
    if (payoutFilter !== 'All'  && l.payoutType !== payoutFilter) return false;
    if (feeFilter === 'Zero Fee' && l.feePercentage !== 0) return false;
    if (feeFilter === 'Has Fee'  && l.feePercentage === 0) return false;
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

  const hasActiveFilters = statusFilter !== 'All' || roiFilter !== 'All' || payoutFilter !== 'All' || feeFilter !== 'All';

  return (
    <div className="grid gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>SD Lots</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Browse and participate in active Deals</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-4 flex flex-col gap-3"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Filters</span>
          {hasActiveFilters && (
            <button onClick={() => { setStatusFilter('All'); setRoiFilter('All'); setPayoutFilter('All'); setFeeFilter('All'); }}
              className="text-xs font-bold px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              Clear All
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <FilterGroup label="Status"  options={['All','Open','Closed']}  value={statusFilter} onChange={setStatusFilter} />
          <FilterGroup label="ROI"     options={roiOptions}               value={roiFilter}    onChange={setRoiFilter}    />
          <FilterGroup label="Payout"  options={payoutOptions}            value={payoutFilter} onChange={setPayoutFilter} />
          <FilterGroup label="Fee"     options={feeOptions}               value={feeFilter}    onChange={setFeeFilter}    />
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Lots',      value: lots.length,                                                                                                    color: '#6366f1' },
          { label: 'Open',            value: lots.filter(l => l.auctionType === 'Open').length,                                                              color: '#10b981' },
          { label: 'Avg Monthly ROI', value: lots.length ? `${(lots.reduce((s,l) => s + (l.roiMonthly ?? 0), 0) / lots.length).toFixed(1)}%` : '—',         color: '#f59e0b' },
          { label: 'Total Raised',    value: fmtINR(lots.reduce((s,l) => s + (l.raised ?? 0), 0)),                                                          color: '#818cf8' },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-4 py-3"
            style={{ background: 'var(--surface-card)', border: `1px solid ${s.color}18`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Cards list — one per row */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 rounded-2xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading lots…</span>
          </div>
        ) : filtered.length === 0
          ? <div className="py-16 text-center rounded-2xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No lots match your filters.</p>
              <button onClick={() => { setStatusFilter('All'); setRoiFilter('All'); setPayoutFilter('All'); setFeeFilter('All'); }}
                className="mt-3 text-xs font-bold px-4 py-2 rounded-xl"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
                Clear Filters
              </button>
            </div>
          : filtered.map(lot => <SDLotCard key={lot.id} lot={lot} />)
        }
      </div>
    </div>
  );
}
