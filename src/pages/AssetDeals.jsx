export default function AssetDeals() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      {/* Building icon */}
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.06) 100%)',
          border: '1px solid rgba(99,102,241,0.25)',
          boxShadow: '0 8px 32px rgba(99,102,241,0.12)',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#818cf8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-10 h-10"
        >
          <rect x="3" y="4" width="18" height="17" rx="1" />
          <path d="M3 8h18" />
          <rect x="6" y="11" width="3" height="3" rx="0.5" />
          <rect x="10.5" y="11" width="3" height="3" rx="0.5" />
          <rect x="15" y="11" width="3" height="3" rx="0.5" />
          <rect x="6" y="16" width="3" height="2" rx="0.5" />
          <rect x="15" y="16" width="3" height="2" rx="0.5" />
          <rect x="10" y="16" width="4" height="5" rx="0.5" />
          <path d="M1 21h22" />
        </svg>
      </div>

      {/* Title */}
      <div className="text-center flex flex-col gap-2">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Asset Deals
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Real estate &amp; property investment opportunities
        </p>
      </div>

      {/* Coming Soon badge */}
      <div
        className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl"
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}
      >
        <span
          className="text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase"
          style={{
            background: 'rgba(99,102,241,0.12)',
            color: '#818cf8',
            border: '1px solid rgba(99,102,241,0.25)',
          }}
        >
          Coming Soon
        </span>
        <p
          className="text-sm text-center max-w-xs"
          style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}
        >
          We're working on bringing you curated asset deals. Stay tuned for
          exciting property investment opportunities.
        </p>
      </div>
    </div>
  );
}
