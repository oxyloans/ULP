import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSdLotDetail, participateInDeal, getRunningDeals } from '../api/afterlogin-user';
import { useProfile } from '../context/ProfileContext';
import { InterestGuideButton } from '../components/InterestGuideModal';
import InterestGuideModal from '../components/InterestGuideModal';

// ─── Colors ───────────────────────────────────────────────────────────────────
const GOLD   = '#f59e0b';
const GOLD2  = '#d97706';
const GREEN  = '#10b981';
const INDIGO = '#6366f1';
const RED    = '#ef4444';
const AMBER  = '#f59e0b';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n, d = 2) {
  if (n == null || isNaN(n)) return '—';
  return Number(n).toFixed(d);
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const ArrowLeft   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const CheckCircle = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const TrendUp     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const LockIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const InfoIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const GoldBarIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M4 9l1.5-3h13L20 9"/><path d="M3 9h18l-1.6 8.2A2 2 0 0 1 17.44 19H6.56a2 2 0 0 1-1.96-1.8z"/><path d="M3 9h18"/></svg>;
const BankIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>;
const ScaleIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 3v18M3 9l9-6 9 6M5 21h14"/><path d="M5 9l-2 6h4L5 9z"/><path d="M19 9l-2 6h4L19 9z"/></svg>;

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="flex-shrink-0 p-1 rounded transition-all hover:scale-110"
      style={{ color: copied ? GREEN : 'var(--text-muted)' }} title="Copy">
      {copied
        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      }
    </button>
  );
}

export default function RealGoldLotParticipate() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { panVerified, bankVerified, fetched: profileFetched } = useProfile();

  const [lot,              setLot]              = useState(null);
  const [lotLoading,       setLotLoading]       = useState(true);
  const [grams,            setGrams]            = useState('');   // user input — gold grams to invest
  const [lenderReturnsType, setLenderReturnsType] = useState('YEARLY');
  const [submitted,        setSubmitted]        = useState(false);
  const [submitting,       setSubmitting]       = useState(false);
  const [submitError,      setSubmitError]      = useState('');
  const [error,            setError]            = useState('');
  const [showConfirm,      setShowConfirm]      = useState(false);
  const [existingParticipation, setExistingParticipation] = useState(null);
  const [interestGuideChecked, setInterestGuideChecked]   = useState(false);
  const [showInterestGuide,    setShowInterestGuide]      = useState(false);
  const [checkboxError,        setCheckboxError]          = useState(false);

  useEffect(() => {
    getSdLotDetail(id)
      .then(data => {
        if (!data) return;
        const status = data.dealStatus === 'ACHIEVED' ? 'Closed' : 'Open';
        const interestOptions = [
          data.monthlyInterest      > 0 && { type: 'MONTHLY',      label: 'Monthly',     rate: data.monthlyInterest      },
          data.quartelyInterest     > 0 && { type: 'QUARTELY',     label: 'Quarterly',   rate: data.quartelyInterest     },
          data.halfInterest         > 0 && { type: 'HALFLY',       label: 'Half-Yearly', rate: data.halfInterest         },
          data.yearlyInterest       > 0 && { type: 'YEARLY',       label: 'Yearly',      rate: data.yearlyInterest       },
          data.endofthedealInterest > 0 && { type: 'ENDOFTHEDEAL', label: 'End of Deal', rate: data.endofthedealInterest },
        ].filter(Boolean);

        setLot({
          id:               data.id ?? id,
          title:            data.dealName,
          status,
          globalDealType:   'REALGOLD',
          goldGrams:        data.goldGrams ?? 0,
          tenureMonths:     data.duration ?? 0,
          dealSubType:      data.dealSubType ?? '',
          interestOptions,
          monthlyGoldGrowth:    data.monthlyGoldGrowth    ?? 0,
          quarterlyGoldGrowth:  data.quarterlyGoldGrowth  ?? 0,
          halfGoldGrowth:       data.halfGoldGrowth       ?? 0,
          yearlyGoldGrowth:     data.yearlyGoldGrowth     ?? 0,
          propertyTds:          data.propertyTds          ?? '',
          tdsPercentage:        data.tdsPercentage        ?? 0,
          description:          data.description          ?? '',
          loanActiveDate:       data.loanActiveDate       ?? '',
          emiEndDate:           data.emiEndDate           ?? '',
          fundsAcceptanceStartDate: data.fundsAcceptanceStartDate ?? '',
          fundsAcceptanceEndDate:   data.fundsAcceptanceEndDate   ?? '',
          bankDetails: {
            accountName:   data.companyName   ?? '—',
            bankName:      data.bankName      ?? data.transferFunds ?? '—',
            accountNumber: data.accountNumber ?? '—',
            ifsc:          data.ifscCode      ?? '—',
            branch:        data.branchName    ?? '—',
          },
        });
        if (interestOptions.length > 0) setLenderReturnsType(interestOptions[0].type);
      })
      .catch(() => {})
      .finally(() => setLotLoading(false));

    getRunningDeals()
      .then(data => {
        const info = Array.isArray(data?.participationInfo) ? data.participationInfo : [];
        const match = info.find(p => p.dealId === id);
        if (match) {
          setExistingParticipation(match);
          if (match.amountTye) setLenderReturnsType(match.amountTye);
        }
      })
      .catch(() => {});
  }, [id]);

  // ── Computed ─────────────────────────────────────────────────────────────────
  const numGrams       = parseFloat(grams) || 0;
  const selectedOption = lot?.interestOptions?.find(o => o.type === lenderReturnsType) ?? null;
  const selectedRate   = selectedOption?.rate ?? 0;
  const months         = lot?.tenureMonths ?? 0;
  const totalGrams     = lot?.goldGrams ?? 0;
  const gramsError     = numGrams > 0 && numGrams > totalGrams
    ? `Cannot exceed the deal's total gold of ${Number(totalGrams).toLocaleString()} g`
    : '';
  const canSubmit = numGrams > 0 && !gramsError && interestGuideChecked && lot?.status === 'Open';

  const handleGramsChange = (e) => {
    // Allow digits and one decimal point only
    const val = e.target.value.replace(/[^\d.]/g, '').replace(/^(\d*\.?\d*).*$/, '$1');
    setGrams(val);
    setError('');
  };

  const validate = () => {
    if (!numGrams || numGrams <= 0) return 'Please enter the gold grams you want to invest.';
    if (numGrams > totalGrams) return `Cannot exceed the deal's total gold of ${Number(totalGrams).toLocaleString()} g.`;
    return '';
  };

  const handleConfirmClick = () => {
    if (!interestGuideChecked) { setCheckboxError(true); return; }
    const err = validate();
    if (err) { setError(err); return; }
    setShowConfirm(true);
  };

  const handleSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    setSubmitError('');
    try {
      // REALGOLD: participatedAmount = 0, gold grams sent as participatedGoldGrams
      await participateInDeal({ dealId: lot.id, lenderReturnsType, participatedAmount: 0, rateofinterest: selectedRate, participatedGoldGrams: numGrams });
      setSubmitted(true);
    } catch (e) {
      setSubmitError(e.message ?? 'Participation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (lotLoading) return (
    <div className="flex items-center justify-center gap-3 py-20">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: GOLD, borderTopColor: 'transparent' }} />
      <span className="text-base font-semibold" style={{ color: 'var(--text-muted)' }}>Loading real gold deal…</span>
    </div>
  );

  // ── KYC Gate ─────────────────────────────────────────────────────────────────
  if (profileFetched && (!panVerified || !bankVerified)) {
    const missing = [
      !panVerified  && { key: 'pan',  label: 'PAN Card Verification', desc: 'Verify your PAN to confirm identity',    path: '/profile?tab=pan',  color: AMBER  },
      !bankVerified && { key: 'bank', label: 'Bank Account',          desc: 'Link a bank account to receive payouts', path: '/profile?tab=bank', color: INDIGO },
    ].filter(Boolean);
    return (
      <div className="max-w-lg mx-auto py-10 grid gap-6">
        <button onClick={() => navigate('/real-gold-deals')}
          className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity w-fit"
          style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft /> Back to Real Gold Deals
        </button>
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface-card)', border: `1px solid ${GOLD}40`, boxShadow: `0 8px 32px ${GOLD}15` }}>
          <div className="h-1.5" style={{ background: `linear-gradient(90deg,${GOLD},${INDIGO})` }} />
          <div className="p-6 grid gap-5">
            <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>Complete KYC to Participate</h2>
            <div className="grid gap-3">
              {missing.map(item => (
                <div key={item.key} className="rounded-xl p-4 flex items-center gap-4"
                  style={{ background: `${item.color}08`, border: `1px solid ${item.color}25` }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                  </div>
                  <button onClick={() => navigate(item.path)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all hover:scale-105"
                    style={{ background: `${item.color}12`, color: item.color, border: `1px solid ${item.color}25` }}>
                    Complete →
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/profile')}
              className="w-full py-3 rounded-xl font-black text-sm transition-all hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: '#fff', boxShadow: `0 4px 16px ${GOLD}40` }}>
              Go to Profile &amp; Complete KYC
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!lot) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Real gold deal not found.</p>
    </div>
  );

  // ── Success ───────────────────────────────────────────────────────────────────
  if (submitted) return (
    <div className="max-w-2xl mx-auto py-10 flex flex-col items-center gap-6 text-center">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background: `${GREEN}18`, border: `1px solid ${GREEN}35`, color: GREEN, boxShadow: `0 0 40px ${GREEN}20` }}>
        <CheckCircle />
      </div>
      <div>
        <h2 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Investment Confirmed!</h2>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
          Your investment of <span className="font-bold" style={{ color: GOLD }}>{fmt(numGrams)} g</span> gold in{' '}
          <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{lot.title}</span> has been recorded.
        </p>
      </div>
      <div className="w-full rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid var(--border)', background: `${GOLD}08` }}>
          <TrendUp />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>Investment Summary</span>
        </div>
        <div className="p-5 grid grid-cols-2 gap-3">
          {[
            { label: 'Gold Invested',    value: `${fmt(numGrams)} g`,        color: GOLD   },
            { label: 'Payout Type',     value: selectedOption?.label ?? '—', color: INDIGO },
            { label: 'Interest Rate',   value: `${selectedRate}%`,          color: GREEN  },
            { label: 'Tenure',          value: `${months} months`,          color: AMBER  },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-4 py-3"
              style={{ background: `${s.color}0a`, border: `1px solid ${s.color}18` }}>
              <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-lg font-extrabold" style={{ color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3 w-full">
        <button onClick={() => navigate('/real-gold-deals')}
          className="flex-1 py-3 rounded-xl font-bold text-sm"
          style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          Back to Real Gold Deals
        </button>
        <button onClick={() => navigate('/real-gold-deals-participation')}
          className="flex-1 py-3 rounded-xl font-bold text-sm"
          style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: '#fff', boxShadow: `0 4px 16px ${GOLD}40` }}>
          My Real Gold Participations
        </button>
      </div>
    </div>
  );

  // ── Main layout ───────────────────────────────────────────────────────────────
  return (
    <div className="grid gap-5 max-w-6xl mx-auto">

      <InterestGuideModal
        open={showInterestGuide}
        onClose={() => setShowInterestGuide(false)}
        onConfirm={() => { setInterestGuideChecked(true); setCheckboxError(false); }}
      />

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowConfirm(false)}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 flex items-center gap-3"
              style={{ borderBottom: '1px solid var(--border)', background: `${GOLD}06` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}30`, color: GOLD }}>
                <GoldBarIcon />
              </div>
              <div>
                <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Confirm Gold Investment</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>This action cannot be undone</p>
              </div>
            </div>
            <div className="px-6 py-5 grid gap-3">
              {[
                { label: 'Deal',          value: lot.title,                                                  color: 'var(--text-primary)' },
                { label: 'Gold to Invest',value: `${fmt(numGrams)} g`,                                       color: GOLD   },
                { label: 'Payout',        value: `${selectedOption?.label ?? 'Yearly'} · ${selectedRate}%`, color: GREEN  },
                { label: 'Tenure',        value: `${months} months`,                                        color: INDIGO },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                  <span className="text-xs font-extrabold font-mono" style={{ color: r.color }}>{r.value}</span>
                </div>
              ))}
              {/* IBJA reminder in confirm */}
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg"
                style={{ background: `${AMBER}08`, border: `1px solid ${AMBER}20` }}>
                <ScaleIcon style={{ color: AMBER, flexShrink: 0, marginTop: 1 }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Gold value will be calculated at the prevailing <span className="font-bold" style={{ color: AMBER }}>IBJA price</span> at the time of processing.
                </p>
              </div>
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
              <button onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: '#fff', boxShadow: `0 4px 14px ${GOLD}40` }}>
                Yes, Invest Gold
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => navigate('/real-gold-deals')}
          className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft /> Real Gold Deals
        </button>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span className="text-sm font-semibold truncate max-w-xs" style={{ color: 'var(--text-primary)' }}>{lot.title}</span>
        <span style={{ flex: 1 }} />
        <InterestGuideButton accentColor={GOLD} defaultRate={lot?.interestOptions?.[0]?.rate} />
      </div>

      {/* Hero banner */}
      <div className="rounded-2xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg,#1c1400,#2d1f00,#3d2a00)', boxShadow: `0 8px 32px ${GOLD}25` }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 20% 50%,${GOLD}18,transparent 60%)` }} />
        <div className="relative z-10 px-6 py-5 flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${GOLD}20`, border: `1px solid ${GOLD}35`, color: GOLD }}>
              <GoldBarIcon />
            </div>
            <div>
              <h1 className="text-xl font-black" style={{ color: '#fff', fontFamily: "'JetBrains Mono', monospace" }}>
                {lot.title}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(245,158,11,0.15)', color: GOLD, border: `1px solid ${GOLD}40` }}>
                  🪙 {Number(lot.goldGrams).toLocaleString()} g Physical Gold
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: lot.status === 'Open' ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.2)', color: lot.status === 'Open' ? GREEN : '#94a3b8', border: `1px solid ${lot.status === 'Open' ? GREEN : '#94a3b8'}40` }}>
                  {lot.status === 'Open' ? '● Live' : 'Closed'}
                </span>
              </div>
            </div>
          </div>
          {/* Interest pills */}
          <div className="flex items-center gap-3 flex-wrap">
            {lot.interestOptions.map(opt => (
              <div key={opt.type} className="text-center px-3 py-2 rounded-xl"
                style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}30` }}>
                <p className="text-2xl font-black leading-none" style={{ color: GOLD, fontFamily: "'JetBrains Mono', monospace" }}>
                  {opt.rate}%
                </p>
                <p className="text-xs mt-1 font-semibold" style={{ color: `${GOLD}99` }}>{opt.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* ── LEFT: Deal details ── */}
        <div className="flex-1 min-w-0 grid gap-4">
          <div className="rounded-2xl p-5 grid gap-4"
            style={{ background: 'var(--surface-card)', border: `1px solid ${GOLD}20`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: GOLD }}>Deal Details</p>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
              {[
                { label: 'Total Gold Available', value: `${Number(lot.goldGrams).toLocaleString()} g`, color: GOLD   },
                { label: 'Tenure',               value: `${months} months`,                            color: INDIGO },
              ].map(s => (
                <div key={s.label} className="rounded-xl px-3 py-3"
                  style={{ background: `${s.color}08`, border: `1px solid ${s.color}18` }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                  <p className="text-base font-extrabold" style={{ color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Date pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Fund Start', value: lot.fundsAcceptanceStartDate },
                { label: 'Fund End',   value: lot.fundsAcceptanceEndDate   },
                { label: 'Active',     value: lot.loanActiveDate           },
                { label: 'Maturity',   value: lot.emiEndDate               },
              ].filter(d => d.value).map(d => (
                <div key={d.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{ background: `${GOLD}08`, border: `1px solid ${GOLD}18` }}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{d.label}</span>
                  <span className="text-xs font-bold" style={{ color: GOLD }}>{d.value}</span>
                </div>
              ))}
            </div>

            {/* Gold Growth rates */}
            {(lot.monthlyGoldGrowth > 0 || lot.quarterlyGoldGrowth > 0 || lot.halfGoldGrowth > 0 || lot.yearlyGoldGrowth > 0) && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: GOLD }}>Gold Growth Rates</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Monthly',     value: lot.monthlyGoldGrowth     },
                    { label: 'Quarterly',   value: lot.quarterlyGoldGrowth   },
                    { label: 'Half-Yearly', value: lot.halfGoldGrowth        },
                    { label: 'Yearly',      value: lot.yearlyGoldGrowth      },
                  ].filter(g => g.value > 0).map(g => (
                    <div key={g.label} className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                      style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}25` }}>
                      <span className="text-base font-black" style={{ color: GOLD, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(g.value)}%</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{g.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lock-in */}
            <div className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <LockIcon />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="font-bold" style={{ color: GOLD }}>Lock-in: {months} months.</span>
                {' '}Early withdrawal returns are calculated at the applicable FD rate.
              </p>
            </div>

            {/* Description */}
            {lot.description && lot.description.trim() && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: GOLD }}>
                  <InfoIcon /> Description
                </p>
                <div className="rounded-xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)', maxHeight: 160, overflowY: 'auto' }}>
                  {lot.description}
                </div>
              </div>
            )}

            {/* Bank details */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: GOLD }}>
                <BankIcon /> Transfer Funds To
              </p>
              <div className="rounded-xl overflow-hidden"
                style={{ background: `${GOLD}06`, border: `1.5px solid ${GOLD}35`, boxShadow: `0 0 12px ${GOLD}12` }}>
                <div className="flex items-center gap-2 px-3 py-2.5"
                  style={{ borderBottom: `1px solid ${GOLD}18`, background: `${GOLD}0d` }}>
                  <BankIcon />
                  <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                    {lot.bankDetails.accountName}
                  </p>
                </div>
                <div className="px-3 py-2.5 grid gap-1.5">
                  {[
                    { label: 'Bank',    value: lot.bankDetails.bankName,      copy: false },
                    { label: 'A/C No.', value: lot.bankDetails.accountNumber, copy: true  },
                    { label: 'IFSC',    value: lot.bankDetails.ifsc,          copy: true  },
                    { label: 'Branch',  value: lot.bankDetails.branch,        copy: false },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between gap-2">
                      <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)', minWidth: 44 }}>{r.label}</span>
                      <div className="flex items-center gap-1 flex-1 justify-end min-w-0">
                        <span className="text-xs font-semibold font-mono truncate" style={{ color: 'var(--text-primary)' }}>{r.value}</span>
                        {r.copy && <CopyBtn text={r.value} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Participation form ── */}
        <div className="w-full lg:w-[380px] flex-shrink-0 grid gap-4">

          {/* IBJA pricing note — prominent */}
          <div className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: `linear-gradient(135deg,${AMBER}10,${AMBER}06)`, border: `1.5px solid ${AMBER}35`, boxShadow: `0 4px 16px ${AMBER}12` }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: `${AMBER}18`, border: `1px solid ${AMBER}30`, color: AMBER }}>
              <ScaleIcon />
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: AMBER }}>IBJA Gold Pricing</p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Gold value is calculated using the{' '}
                <span className="font-bold" style={{ color: AMBER }}>India Bullion &amp; Jewellers Association (IBJA)</span>
                {' '}daily rate. The final rupee equivalent is determined at the time of processing.
              </p>
            </div>
          </div>

          {lot.status === 'Closed' ? (
            <div className="rounded-2xl p-6 text-center"
              style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
              <p className="text-2xl mb-2">🔒</p>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>This deal is closed</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Participation is no longer available.</p>
            </div>
          ) : (
            <div className="rounded-2xl p-5 grid gap-4"
              style={{ background: 'var(--surface-card)', border: `1px solid ${GOLD}20`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: GOLD }}>Invest Gold</p>

              {/* Existing participation note */}
              {existingParticipation && (
                <div className="rounded-xl px-4 py-3 flex items-center gap-2"
                  style={{ background: `${GREEN}08`, border: `1px solid ${GREEN}25` }}>
                  <span className="text-xs font-bold" style={{ color: GREEN }}>
                    You have an existing participation in this deal.
                  </span>
                </div>
              )}

              {/* Payout frequency */}
              {lot.interestOptions.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Payout Frequency</p>
                  <div className="flex flex-wrap gap-2">
                    {lot.interestOptions.map(opt => {
                      const active   = lenderReturnsType === opt.type;
                      const isLocked = existingParticipation && opt.type !== existingParticipation.amountTye;
                      return (
                        <button key={opt.type} type="button"
                          onClick={() => !isLocked && setLenderReturnsType(opt.type)}
                          disabled={isLocked}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
                          style={active ? {
                            background: `${GOLD}18`, border: `2px solid ${GOLD}60`, color: GOLD, cursor: 'pointer',
                          } : isLocked ? {
                            background: 'var(--input-bg)', border: '1.5px solid var(--border)', color: 'var(--text-muted)', opacity: 0.4, cursor: 'not-allowed',
                          } : {
                            background: 'var(--input-bg)', border: '1.5px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer',
                          }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{opt.rate}%</span>
                          <span className="text-xs font-semibold">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Gold grams input */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
                  Gold Grams to Invest
                </p>
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                  Deal available: <span className="font-bold" style={{ color: GOLD }}>{Number(lot.goldGrams).toLocaleString()} g</span>
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{ color: GOLD, background: `${GOLD}15`, border: `1px solid ${GOLD}25` }}>g</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={grams}
                    onChange={handleGramsChange}
                    placeholder="e.g. 10.5"
                    className="w-full pl-12 pr-4 py-3 rounded-xl text-sm font-bold outline-none transition-all"
                    style={{
                      background: 'var(--input-bg)',
                      border: `1.5px solid ${gramsError || error ? RED : numGrams > 0 ? GOLD : 'var(--border)'}`,
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                {(gramsError || error) && (
                  <p className="text-xs mt-1.5 font-semibold" style={{ color: RED }}>{gramsError || error}</p>
                )}
                {numGrams > 0 && !gramsError && (
                  <p className="text-xs mt-1.5 font-semibold" style={{ color: GREEN }}>
                    ✓ Investing <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt(numGrams)} g</span> of gold
                  </p>
                )}
              </div>

              {/* Interest guide checkbox */}
              <div className="flex items-start gap-2.5">
                <input type="checkbox" id="rgInterestCheck"
                  checked={interestGuideChecked}
                  onChange={e => { setInterestGuideChecked(e.target.checked); if (e.target.checked) setCheckboxError(false); }}
                  className="mt-0.5 w-4 h-4 cursor-pointer accent-amber-500 flex-shrink-0" />
                <label htmlFor="rgInterestCheck" className="text-xs leading-relaxed cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                  I have read and understood the{' '}
                  <button type="button" onClick={() => setShowInterestGuide(true)}
                    className="font-bold underline" style={{ color: GOLD, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Interest Guide
                  </button>
                  {' '}and agree to the terms of this real gold investment.
                </label>
              </div>
              {checkboxError && (
                <p className="text-xs font-semibold -mt-2" style={{ color: RED }}>
                  Please read and accept the Interest Guide before proceeding.
                </p>
              )}

              {submitError && (
                <div className="rounded-xl px-4 py-3 text-xs font-semibold"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: RED }}>
                  {submitError}
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleConfirmClick}
                disabled={submitting || !canSubmit}
                className="w-full py-3.5 rounded-xl font-black text-sm transition-all"
                style={{
                  background: (!canSubmit || submitting) ? 'var(--input-bg)' : `linear-gradient(135deg,${GOLD},${GOLD2})`,
                  color: (!canSubmit || submitting) ? 'var(--text-muted)' : '#fff',
                  border: (!canSubmit || submitting) ? '1px solid var(--border)' : 'none',
                  boxShadow: (!canSubmit || submitting) ? 'none' : `0 4px 16px ${GOLD}40`,
                  cursor: (!canSubmit || submitting) ? 'not-allowed' : 'pointer',
                }}>
                {submitting ? 'Processing…' : '🪙 Invest Gold'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
