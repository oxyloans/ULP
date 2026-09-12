import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSdLotDetail, getWalletBalance, participateInDeal, getRunningDeals } from '../api/afterlogin-user';
import { useProfile } from '../context/ProfileContext';
import { formatINR } from '../utils/currency';
import { InterestGuideButton } from '../components/InterestGuideModal';

// ─── Colors ───────────────────────────────────────────────────────────────────
const GOLD   = '#f59e0b';
const GOLD2  = '#d97706';
const GREEN  = '#10b981';
const INDIGO = '#6366f1';
const RED    = '#ef4444';
const AMBER  = '#f59e0b';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtINR(n) {
  if (!n && n !== 0) return '—';
  return formatINR(n);
}

function fmt(n, d = 2) {
  if (n == null || isNaN(n)) return '—';
  return Number(n).toFixed(d);
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const ArrowLeft   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const WalletIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="18" cy="12" r="2"/></svg>;
const AlertIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const CheckCircle = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const TrendUp     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const BankIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>;
const GoldIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="9"/><path d="M9 9h1.5a1.5 1.5 0 0 1 0 3H9v3"/><path d="M9 12h3"/></svg>;
const LockIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const ShieldIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const InfoIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

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

// ─── TDS Chip ──────────────────────────────────────────────────────────────────
function TdsChip({ value, pct }) {
  const v = (value ?? '').toUpperCase();
  if (v === 'MANDATORY') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
      style={{ background: 'rgba(239,68,68,0.1)', color: RED, border: '1px solid rgba(239,68,68,0.25)' }}>
      <ShieldIcon /> TDS {pct ? `${pct}%` : 'Applicable'}
    </span>
  );
  if (v === 'OPTIONAL') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
      style={{ background: 'rgba(245,158,11,0.1)', color: AMBER, border: '1px solid rgba(245,158,11,0.25)' }}>
      <ShieldIcon /> TDS Optional
    </span>
  );
  return null;
}

export default function GoldLotParticipate() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { panVerified, bankVerified, fetched: profileFetched } = useProfile();

  const [raw,              setRaw]              = useState(null);
  const [lot,              setLot]              = useState(null);
  const [lotLoading,       setLotLoading]       = useState(true);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [amount,           setAmount]           = useState('');
  const [lenderReturnsType, setLenderReturnsType] = useState('YEARLY');
  const [submitted,        setSubmitted]        = useState(false);
  const [submitting,       setSubmitting]       = useState(false);
  const [submitError,      setSubmitError]      = useState('');
  const [error,            setError]            = useState('');
  const [showConfirm,      setShowConfirm]      = useState(false);
  const [existingParticipation, setExistingParticipation] = useState(null);

  useEffect(() => {
    getSdLotDetail(id)
      .then(data => {
        if (!data) return;
        setRaw(data);
        const status = data.dealStatus === 'ACHIEVED' ? 'Closed' : 'Open';
        const interestOptions = [
          data.monthlyInterest  > 0 && { type: 'MONTHLY',  label: 'Monthly',     rate: data.monthlyInterest  },
          data.quartelyInterest > 0 && { type: 'QUARTELY', label: 'Quarterly',   rate: data.quartelyInterest },
          data.halfInterest     > 0 && { type: 'HALFLY',   label: 'Half-Yearly', rate: data.halfInterest     },
          data.yearlyInterest   > 0 && { type: 'YEARLY',   label: 'Yearly',      rate: data.yearlyInterest   },
          data.endofthedealInterest > 0 && { type: 'ENDOFTHEDEAL', label: 'End of Deal', rate: data.endofthedealInterest },
        ].filter(Boolean);

        setLot({
          id:             data.id ?? id,
          title:          data.dealName,
          status,
          dealSubType:    data.dealSubType ?? '',
          globalDealType: data.globalDealType ?? 'GOLD',
          totalSize:      data.dealAmount ?? 0,
          raised:         data.dealParticipationValue ?? 0,
          remaining:      data.remainingDealValue ?? (data.dealAmount - (data.dealParticipationValue ?? 0)),
          minInvestment:  data.minimumParticipation ?? 0,
          maxInvestment:  data.maxParticipation ?? 0,
          tenureMonths:   data.duration ?? 0,
          interestOptions,
          // Gold-specific
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
            accountName:   data.companyName    ?? '—',
            bankName:      data.bankName       ?? data.transferFunds ?? '—',
            accountNumber: data.accountNumber  ?? '—',
            ifsc:          data.ifscCode       ?? '—',
            branch:        data.branchName     ?? '—',
          },
        });
        if (interestOptions.length > 0) setLenderReturnsType(interestOptions[0].type);
      })
      .catch(() => {})
      .finally(() => setLotLoading(false));

    getWalletBalance()
      .then(data => {
        const bal = data?.currentWalletAmount ?? null;
        if (bal !== null && typeof bal === 'number') setAvailableBalance(bal);
      })
      .catch(() => {});

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

  // ── Computed values ──────────────────────────────────────────────────────────
  const numAmount      = parseInt((amount ?? '').replace(/,/g, ''), 10) || 0;
  const selectedOption = lot?.interestOptions?.find(o => o.type === lenderReturnsType) ?? null;
  const selectedRate   = selectedOption?.rate ?? 0;
  const months         = lot?.tenureMonths ?? 0;

  const periodsMap = { MONTHLY: months, QUARTELY: months / 3, HALFLY: months / 6, YEARLY: months / 12, ENDOFTHEDEAL: 1 };
  const periods        = periodsMap[lenderReturnsType] ?? months;
  const projectedReturn = Math.round(numAmount * (selectedRate / 100) * periods);
  const totalReturn     = numAmount + projectedReturn;
  const monthlyReturn   = months > 0 ? Math.round(projectedReturn / months) : 0;

  // Gold growth projection
  const goldGrowthRate  = lot?.yearlyGoldGrowth ?? 0;
  const goldGrowthYears = months / 12;
  const goldGrowthEarning = Math.round(numAmount * (goldGrowthRate / 100) * goldGrowthYears);

  const alreadyInvested  = existingParticipation?.participatedAmount ?? 0;
  const userMaxRemaining = Math.max(0, (lot?.maxInvestment ?? 0) - alreadyInvested);
  const dealRemaining    = lot?.remaining ?? Infinity;
  const dealFull         = lot ? (lot.remaining ?? 0) <= 0 : false;
  const effectiveMax     = Math.min(availableBalance, userMaxRemaining, dealRemaining);
  const remainingBalance = availableBalance - numAmount;

  const walletInsufficient = numAmount > 0 && numAmount > availableBalance;
  const exceedsUserMax     = numAmount > 0 && alreadyInvested > 0 && (alreadyInvested + numAmount) > (lot?.maxInvestment ?? Infinity);
  const exceedsDealCap     = numAmount > 0 && numAmount > dealRemaining;
  const belowMin           = numAmount > 0 && numAmount < (lot?.minInvestment ?? 0);
  const hasAmountError     = walletInsufficient || exceedsUserMax || exceedsDealCap || belowMin;
  const canSubmit          = numAmount >= (lot?.minInvestment ?? 0) && !hasAmountError && !dealFull;
  const raisedPct          = (lot?.totalSize ?? 0) > 0 ? Math.min(Math.round((lot.raised / lot.totalSize) * 100), 100) : 0;

  const handleChange = (e) => {
    const clean = e.target.value.replace(/\D/g, '');
    setAmount(clean ? parseInt(clean, 10).toLocaleString('en-IN') : '');
    setError('');
  };

  const validate = () => {
    if (!numAmount)                              return 'Please enter an amount.';
    if (numAmount < (lot?.minInvestment ?? 0))  return `Minimum investment is ${fmtINR(lot.minInvestment)}.`;
    if (numAmount > availableBalance)            return `Exceeds your wallet balance of ${fmtINR(availableBalance)}.`;
    if (numAmount > (lot?.maxInvestment ?? Infinity)) return `Per-user maximum is ${fmtINR(lot.maxInvestment)}.`;
    if (alreadyInvested > 0 && (alreadyInvested + numAmount) > (lot?.maxInvestment ?? Infinity))
      return `You've already invested ${fmtINR(alreadyInvested)}. You can add at most ${fmtINR(userMaxRemaining)} more.`;
    if (numAmount > dealRemaining) return `Only ${fmtINR(dealRemaining)} capacity remaining in this deal.`;
    return '';
  };

  const handleConfirmClick = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setShowConfirm(true);
  };

  const handleSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    setSubmitError('');
    try {
      await participateInDeal({ dealId: lot.id, lenderReturnsType, participatedAmount: numAmount, rateofinterest: selectedRate });
      setSubmitted(true);
    } catch (e) {
      setSubmitError(e.message ?? 'Participation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (lotLoading) return (
    <div className="flex items-center justify-center gap-3 py-20">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: GOLD, borderTopColor: 'transparent' }} />
      <span className="text-base font-semibold" style={{ color: 'var(--text-muted)' }}>Loading gold deal…</span>
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
        <button onClick={() => navigate('/gold-deals')}
          className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity w-fit"
          style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft /> Back to Gold Deals
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
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Gold deal not found.</p>
    </div>
  );

  // ── Success ──────────────────────────────────────────────────────────────────
  if (submitted) return (
    <div className="max-w-2xl mx-auto py-10 flex flex-col items-center gap-6 text-center">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background: `${GREEN}18`, border: `1px solid ${GREEN}35`, color: GREEN, boxShadow: `0 0 40px ${GREEN}20` }}>
        <CheckCircle />
      </div>
      <div>
        <h2 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Participation Confirmed!</h2>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
          Your investment of <span className="font-bold" style={{ color: GREEN }}>{fmtINR(numAmount)}</span> in{' '}
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
            { label: 'You Invested',      value: fmtINR(numAmount),       color: INDIGO },
            { label: 'Interest Earnings', value: fmtINR(projectedReturn),  color: GREEN  },
            { label: 'Total at Maturity', value: fmtINR(totalReturn),      color: GOLD   },
            { label: 'Gold Growth Est.',  value: fmtINR(goldGrowthEarning), color: AMBER  },
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
        <button onClick={() => navigate('/gold-deals')}
          className="flex-1 py-3 rounded-xl font-bold text-sm"
          style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          Back to Gold Deals
        </button>
        <button onClick={() => navigate('/gold-deals-participation')}
          className="flex-1 py-3 rounded-xl font-bold text-sm"
          style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: '#fff', boxShadow: `0 4px 16px ${GOLD}40` }}>
          My Gold Participations
        </button>
      </div>
    </div>
  );

  // ── Main Layout ───────────────────────────────────────────────────────────────
  return (
    <div className="grid gap-5 max-w-6xl mx-auto">

      {/* Confirmation Modal */}
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
                <GoldIcon />
              </div>
              <div>
                <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Confirm Gold Investment</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>This action cannot be undone</p>
              </div>
            </div>
            <div className="px-6 py-5 grid gap-3">
              {[
                { label: 'Deal',     value: lot.title,                                                    color: 'var(--text-primary)' },
                { label: 'Amount',   value: fmtINR(numAmount),                                            color: INDIGO },
                { label: 'Payout',   value: `${selectedOption?.label ?? 'Yearly'} · ${selectedRate}%`,   color: GREEN  },
                { label: 'Tenure',   value: `${months} months`,                                           color: GOLD   },
                { label: 'Wallet after', value: fmtINR(availableBalance - numAmount),                    color: remainingBalance >= 0 ? GREEN : RED },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                  <span className="text-xs font-extrabold font-mono" style={{ color: r.color }}>{r.value}</span>
                </div>
              ))}
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
                Yes, Invest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => navigate('/gold-deals')}
          className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft /> Gold Deals
        </button>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span className="text-sm font-semibold truncate max-w-xs" style={{ color: 'var(--text-primary)' }}>{lot.title}</span>
        <span style={{ flex: 1 }} />
        <InterestGuideButton accentColor="#f59e0b" defaultRate={lot?.interestOptions?.[0]?.rate ?? lot?.roiMonthly} />
      </div>

      {/* ── Gold Hero Banner ── */}
      <div className="rounded-2xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg,#1c1400,#2d1f00,#3d2a00)', boxShadow: `0 8px 32px ${GOLD}25` }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 20% 50%,${GOLD}18,transparent 60%)` }} />
        {/* Animated bar bg */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end gap-0.5 px-4 pb-0 pointer-events-none overflow-hidden"
          style={{ height: 52, opacity: 0.15 }}>
          {[35,55,45,70,50,80,60,75,55,65,40,70].map((h, i) => (
            <div key={i} className="flex-1 rounded-t"
              style={{ height: `${h}%`, background: `linear-gradient(180deg,${GOLD},${GOLD}44)` }} />
          ))}
        </div>
        <div className="relative z-10 px-6 py-5 flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${GOLD}20`, border: `1px solid ${GOLD}35`, color: GOLD }}>
              <GoldIcon />
            </div>
            <div>
              <h1 className="text-xl font-black" style={{ color: '#fff', fontFamily: "'JetBrains Mono', monospace" }}>
                {lot.title}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {lot.dealSubType && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: `${GOLD}25`, color: GOLD, border: `1px solid ${GOLD}40` }}>
                    {lot.dealSubType}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: lot.status === 'Open' ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.2)', color: lot.status === 'Open' ? GREEN : '#94a3b8', border: `1px solid ${lot.status === 'Open' ? GREEN : '#94a3b8'}40` }}>
                  {lot.status === 'Open' ? '● Live' : 'Closed'}
                </span>
                <TdsChip value={lot.propertyTds} pct={lot.tdsPercentage} />
              </div>
            </div>
          </div>
          {/* Key metrics right side */}
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
            {lot.yearlyGoldGrowth > 0 && (
              <div className="text-center px-3 py-2 rounded-xl"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p className="text-2xl font-black leading-none" style={{ color: AMBER, fontFamily: "'JetBrains Mono', monospace" }}>
                  {fmt(lot.yearlyGoldGrowth)}%
                </p>
                <p className="text-xs mt-1 font-semibold" style={{ color: `${AMBER}99` }}>Gold Growth/yr</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* ── LEFT COLUMN ── */}
        <div className="flex-1 min-w-0 grid gap-4">

          {/* Gold-specific details card */}
          <div className="rounded-2xl p-5 grid gap-4"
            style={{ background: 'var(--surface-card)', border: `1px solid ${GOLD}20`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: GOLD }}>Deal Details</p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Lock-in Period',  value: `${months} months`, color: GOLD   },
                { label: 'Min Investment',  value: fmtINR(lot.minInvestment),  color: INDIGO },
                { label: 'Max Investment',  value: fmtINR(lot.maxInvestment),  color: INDIGO },
                { label: 'Total Fund Size', value: fmtINR(lot.totalSize),      color: AMBER  },
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

            {/* TDS info */}
            {lot.propertyTds && (
              <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{
                  background: lot.propertyTds.toUpperCase() === 'MANDATORY' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)',
                  border: `1px solid ${lot.propertyTds.toUpperCase() === 'MANDATORY' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
                }}>
                <ShieldIcon />
                <div>
                  <p className="text-xs font-bold" style={{ color: lot.propertyTds.toUpperCase() === 'MANDATORY' ? RED : AMBER }}>
                    TDS — {lot.propertyTds}
                  </p>
                  {lot.tdsPercentage > 0 && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {lot.tdsPercentage}% TDS will be deducted from interest earned as per applicable tax rules.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Lock-in info */}
            <div className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <LockIcon />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="font-bold" style={{ color: GOLD }}>Lock-in: {months} months.</span>
                {' '}Early withdrawal returns are calculated at the applicable FD rate.
              </p>
            </div>

            {/* Description */}
            {lot.description && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: GOLD }}>
                  <InfoIcon /> Description
                </p>
                <div className="rounded-xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)', maxHeight: 200, overflowY: 'auto' }}>
                  {lot.description}
                </div>
              </div>
            )}

            {/* Funding progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Funding Progress</p>
                <p className="text-xs font-bold" style={{ color: GOLD }}>{raisedPct}% filled</p>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${raisedPct}%`, background: `linear-gradient(90deg,${GOLD},${GOLD2})` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Raised {fmtINR(lot.raised)}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmtINR(lot.remaining)} left</span>
              </div>
            </div>
          </div>

          {/* Payout frequency + Amount form */}
          <div className="rounded-2xl p-5 grid gap-4"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: GOLD }}>Participate</p>

            {/* Payout selector */}
            {lot.interestOptions.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Payout Frequency</p>
                  {existingParticipation && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                      style={{ background: `${INDIGO}10`, color: '#818cf8', border: `1px solid ${INDIGO}25` }}>
                      Locked to previous choice
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {lot.interestOptions.map(opt => {
                    const active  = lenderReturnsType === opt.type;
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
                        <span className="text-base font-black" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{opt.rate}%</span>
                        <span>{opt.label}</span>
                        {active && <span style={{ color: GOLD }}>✓</span>}
                      </button>
                    );
                  })}
                  <InterestGuideButton />
                </div>
              </div>
            )}

            {/* Deal fully subscribed */}
            {dealFull && (
              <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: 'rgba(100,116,139,0.1)', border: '2px solid rgba(100,116,139,0.3)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Deal Fully Subscribed</p>
              </div>
            )}

            {/* Existing participation notice */}
            {existingParticipation && (
              <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: `${INDIGO}08`, border: `1px solid ${INDIGO}25` }}>
                <TrendUp />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold" style={{ color: '#818cf8' }}>Already Invested</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {fmtINR(existingParticipation.participatedAmount)} invested · {fmtINR(userMaxRemaining)} headroom left
                  </p>
                </div>
                <span className="text-sm font-extrabold font-mono flex-shrink-0" style={{ color: '#818cf8' }}>
                  {fmtINR(existingParticipation.participatedAmount)}
                </span>
              </div>
            )}

            {/* Amount input */}
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                Min {fmtINR(lot.minInvestment)} · Max {fmtINR(lot.maxInvestment)}
              </p>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black" style={{ color: 'var(--text-muted)' }}>₹</span>
                  <input type="text" inputMode="numeric" value={amount} onChange={handleChange}
                    placeholder="Enter amount"
                    className="w-full rounded-xl text-xl font-bold outline-none transition-all"
                    style={{
                      padding: '16px 16px 16px 44px',
                      background: 'var(--input-bg)',
                      border: `2px solid ${hasAmountError ? RED : amount ? GOLD : 'var(--border)'}`,
                      color: 'var(--text-primary)',
                      boxShadow: amount && !hasAmountError ? `0 0 0 4px ${GOLD}12` : 'none',
                    }} />
                </div>
                <button onClick={handleConfirmClick}
                  disabled={hasAmountError || !numAmount || submitting || dealFull}
                  className="px-6 py-4 rounded-xl font-black text-sm transition-all disabled:opacity-60 whitespace-nowrap"
                  style={{
                    background: canSubmit ? `linear-gradient(135deg,${GOLD},${GOLD2})` : 'var(--input-bg)',
                    color: canSubmit ? '#fff' : 'var(--text-muted)',
                    border: canSubmit ? 'none' : '1px solid var(--border)',
                    boxShadow: canSubmit ? `0 6px 20px ${GOLD}40` : 'none',
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                  }}>
                  {submitting
                    ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                    : dealFull ? 'Fully Subscribed' : 'Invest Now'}
                </button>
              </div>

              {/* Use max */}
              {!dealFull && effectiveMax > 0 && (
                <button onClick={() => setAmount(effectiveMax.toLocaleString('en-IN'))}
                  className="mt-2 text-xs font-bold px-2.5 py-1 rounded-lg hover:opacity-80 transition-opacity"
                  style={{ background: `${GOLD}10`, color: GOLD, border: `1px solid ${GOLD}25` }}>
                  Use Max ({fmtINR(effectiveMax)})
                </button>
              )}

              {/* Validation errors */}
              {walletInsufficient && (
                <div className="rounded-lg px-4 py-3 flex items-start gap-2.5 mt-3"
                  style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)' }}>
                  <AlertIcon />
                  <div>
                    <p className="text-xs font-bold" style={{ color: RED }}>Insufficient Balance</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>You need {fmtINR(numAmount - availableBalance)} more.</p>
                    <button onClick={() => navigate('/wallet')}
                      className="mt-1.5 text-xs font-bold px-2.5 py-1 rounded-lg"
                      style={{ background: 'rgba(239,68,68,0.1)', color: RED, border: '1px solid rgba(239,68,68,0.22)' }}>
                      Go to Wallet →
                    </button>
                  </div>
                </div>
              )}
              {exceedsUserMax && !walletInsufficient && (
                <p className="text-xs font-bold mt-2" style={{ color: AMBER }}>Per-user limit: max {fmtINR(userMaxRemaining)} more.</p>
              )}
              {exceedsDealCap && !walletInsufficient && !exceedsUserMax && (
                <p className="text-xs font-bold mt-2" style={{ color: AMBER }}>Only {fmtINR(dealRemaining)} capacity left.</p>
              )}
              {belowMin && !walletInsufficient && !exceedsUserMax && !exceedsDealCap && (
                <p className="text-xs font-bold mt-2" style={{ color: RED }}>Minimum investment is {fmtINR(lot.minInvestment)}.</p>
              )}
              {error && !hasAmountError && (
                <p className="text-xs font-semibold mt-2" style={{ color: RED }}>{error}</p>
              )}
              {submitError && (
                <p className="text-xs font-semibold mt-2 px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}>
                  {submitError}
                </p>
              )}
            </div>

            {/* Live projected returns */}
            {canSubmit && (
              <div className="rounded-xl p-4 grid gap-2"
                style={{ background: `${GOLD}06`, border: `1px solid ${GOLD}20` }}>
                <p className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: GOLD }}>
                  <TrendUp /> Projected Returns
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'You Invest',          value: fmtINR(numAmount),        color: INDIGO },
                    { label: 'Interest Earnings',   value: fmtINR(projectedReturn),   color: GREEN  },
                    { label: 'Total at Maturity',   value: fmtINR(totalReturn),       color: GOLD   },
                    { label: 'Gold Growth Est.',    value: fmtINR(goldGrowthEarning), color: AMBER  },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{ background: `${s.color}0a`, border: `1px solid ${s.color}18` }}>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                      <p className="text-sm font-extrabold font-mono" style={{ color: s.color }}>{s.value}</p>
                    </div>
                  ))}
                </div>
                {lot.tdsPercentage > 0 && (
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    * TDS of {lot.tdsPercentage}% will be deducted from interest earnings.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="w-full lg:w-80 flex-shrink-0 grid gap-4">

          {/* Wallet */}
          <div className="rounded-2xl p-5"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${INDIGO}12`, border: `1px solid ${INDIGO}25`, color: '#818cf8' }}>
                <WalletIcon />
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Your Wallet</p>
            </div>
            <div className="grid gap-2">
              <div className="rounded-xl px-4 py-3" style={{ background: 'var(--input-bg)', border: `1px solid ${INDIGO}20` }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Available Balance</p>
                <p className="text-xl font-black" style={{ color: '#818cf8', fontFamily: "'JetBrains Mono', monospace" }}>{fmtINR(availableBalance)}</p>
              </div>
              {numAmount > 0 && (
                <div className="rounded-xl px-4 py-3"
                  style={{ background: 'var(--input-bg)', border: `1px solid ${remainingBalance >= 0 ? GREEN : RED}30` }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>After Investment</p>
                  <p className="text-xl font-black"
                    style={{ color: remainingBalance >= 0 ? GREEN : RED, fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmtINR(remainingBalance)}
                  </p>
                </div>
              )}
            </div>
            <button onClick={() => navigate('/wallet')}
              className="mt-3 w-full py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
              style={{ background: `${INDIGO}10`, color: '#818cf8', border: `1px solid ${INDIGO}20` }}>
              + Top Up Wallet
            </button>
          </div>

          {/* Bank Details */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--surface-card)', border: `1px solid ${GOLD}20`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="px-5 py-4 flex items-center gap-3"
              style={{ borderBottom: `1px solid ${GOLD}20`, background: `${GOLD}06` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}30`, color: GOLD }}>
                <BankIcon />
              </div>
              <div>
                <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Payment Details</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Transfer funds to this account</p>
              </div>
            </div>
            <div className="px-5 py-3" style={{ borderBottom: `1px solid ${GOLD}15`, background: `${GOLD}04` }}>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Account Name</p>
              <p className="text-sm font-black mt-0.5" style={{ color: 'var(--text-primary)' }}>{lot.bankDetails.accountName}</p>
            </div>
            <div className="px-5 py-4 grid gap-3">
              {[
                { label: 'Bank Name',      value: lot.bankDetails.bankName,      copy: false },
                { label: 'Account Number', value: lot.bankDetails.accountNumber, copy: true  },
                { label: 'IFSC Code',      value: lot.bankDetails.ifsc,          copy: true  },
                { label: 'Branch',         value: lot.bankDetails.branch,        copy: false },
              ].map(r => (
                <div key={r.label}>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>{r.label}</p>
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                    <span className="text-xs font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{r.value}</span>
                    {r.copy && <CopyBtn text={r.value} />}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 pb-4">
              <div className="rounded-xl px-4 py-3 flex items-start gap-2.5"
                style={{ background: `${GOLD}06`, border: `1px solid ${GOLD}20` }}>
                <InfoIcon />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  After transferring, your participation will be confirmed within 24 hours.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
