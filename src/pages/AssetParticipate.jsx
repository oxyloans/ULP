import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSdLotDetail, getWalletBalance, participateInDeal, getRunningDeals } from '../api/afterlogin-user';
import { useProfile } from '../context/ProfileContext';
import { formatINR } from '../utils/currency';

// ─── Icons ────────────────────────────────────────────────────────────────────
const ArrowLeft   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const WalletIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="18" cy="12" r="2"/></svg>;
const AlertIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const CheckCircle = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const TrendUp     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const BankIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>;
const ClockIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const Shield      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const FileText    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const Download    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const MapPin      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const Building    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="4" width="18" height="17" rx="1"/><path d="M3 8h18M6 11h3v3H6v-3zm4.5 0h3v3h-3v-3zm4.5 0h3v3h-3v-3zM6 16h3v2H6v-2zm4.5 0h4v5h-4v-5zM15 16h3v2h-3v-2zM1 21h22"/></svg>;

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),1500); }}
      className="flex-shrink-0 p-1 rounded transition-all hover:scale-110"
      style={{ color: copied ? '#16a34a' : 'var(--text-muted)' }} title="Copy">
      {copied
        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      }
    </button>
  );
}

function fmtINR(n) {
  if (!n && n !== 0) return '—';
  return formatINR(n);
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

export default function AssetParticipate() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { panVerified, bankVerified, fetched: profileFetched } = useProfile();

  const [lot, setLot]                           = useState(null);
  const [lotLoading, setLotLoading]             = useState(true);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [amount, setAmount]                     = useState('');
  const [lenderReturnsType, setLenderReturnsType] = useState('MONTHLY');
  const [submitted, setSubmitted]               = useState(false);
  const [error, setError]                       = useState('');
  const [submitting, setSubmitting]             = useState(false);
  const [submitError, setSubmitError]           = useState('');
  const [showConfirm, setShowConfirm]           = useState(false);
  const [existingParticipation, setExistingParticipation] = useState(null);

  useEffect(() => {
    getSdLotDetail(id)
      .then(raw => {
        if (raw) {
          const status = raw.dealStatus === 'ACHIEVED' ? 'Closed' : 'Open';
          const interestOptions = [
            raw.monthlyInterest      > 0 && { type: 'MONTHLY',      label: 'Monthly',     rate: raw.monthlyInterest      },
            raw.quartelyInterest     > 0 && { type: 'QUARTELY',     label: 'Quarterly',   rate: raw.quartelyInterest     },
            raw.halfInterest         > 0 && { type: 'HALFLY',       label: 'Half-Yearly', rate: raw.halfInterest         },
            raw.yearlyInterest       > 0 && { type: 'YEARLY',       label: 'Yearly',      rate: raw.yearlyInterest       },
            raw.endofthedealInterest > 0 && { type: 'ENDOFTHEDEAL', label: 'End of Deal', rate: raw.endofthedealInterest },
          ].filter(Boolean);
          const totalSize  = raw.dealAmount ?? 0;
          const participated = raw.dealParticipationValue ?? 0;
          const remaining  = raw.remainingDealValue ?? (totalSize - participated);

          const fractional = raw.fractionalAssetResponse ?? raw.fractionalInvestmentDto ?? {};
          const documents = fractional.fractionalList ?? [];
          const legalReportDoc = documents.find(d => d.documentType === 'legalreport');
          const valuationReportDoc = documents.find(d => d.documentType === 'valuationreport');
          const imagesDocs = documents.filter(d => d.documentType === 'images' || d.documentType === 'fractionalimage');
          const videosDocs = documents.filter(d => d.documentType === 'videos' || d.documentType === 'fractionalvideo');

          setLot({
            id: raw.id ?? id, title: raw.dealName, auctionType: 'Open', status,
            globalDealType: raw.globalDealType ?? 'ASSET',
            tag: status === 'Closed' ? 'Sold Out' : 'Live Opportunity',
            tagColor: status === 'Closed' ? '#64748b' : '#06b6d4',
            totalSize, raised: participated, remaining,
            minInvestment: raw.minimumParticipation ?? 0,
            maxInvestment: raw.maxParticipation ?? 0,
            roiMonthly: raw.monthlyInterest ?? 0,
            tenureMonths: raw.duration ?? 0,
            tenure: raw.duration ? `${raw.duration} months` : '—',
            feePercentage: 0, interestOptions,
            projectName:    fractional.projectName ?? '',
            borrowerName:   fractional.borrowerName ?? '',
            assetValue:     fractional.assetValue ?? 0,
            assetArea:      raw.assetArea ?? fractional.assetArea ?? '',
            assetAreaType:  fractional.fractionalAssetType ?? 'PLOT',
            latitude:       fractional.latitude ?? 0,
            longitude:      fractional.longitude ?? 0,
            legalReport:    legalReportDoc?.documentPath    ?? raw.legalReport    ?? null,
            valuationReport:valuationReportDoc?.documentPath ?? raw.valuationReport ?? null,
            images:         imagesDocs.map(d => d.documentPath),
            videos:         videosDocs.map(d => d.documentPath),
            bankDetails: {
              bankName: raw.bankName ?? raw.transferFunds ?? '—',
              accountName: raw.companyName ?? '—',
              accountNumber: raw.accountNumber ?? '—',
              ifsc: raw.ifscCode ?? '—',
              branch: raw.branchName ?? '—',
            },
          });
          if (interestOptions.length > 0) setLenderReturnsType(interestOptions[0].type);
        }
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
          if (match.amountTye) {
            setLenderReturnsType(match.amountTye);
          }
        }
      })
      .catch(() => {});
  }, [id]);

  const numAmount         = parseInt(amount.replace(/,/g, ''), 10) || 0;
  const selectedOption    = lot?.interestOptions?.find(o => o.type === lenderReturnsType) ?? null;
  const selectedRate      = selectedOption?.rate ?? lot?.roiMonthly ?? 0;

  const months            = lot?.tenureMonths ?? 0;
  const paMultiplier = lenderReturnsType === 'MONTHLY'      ? 12
                     : lenderReturnsType === 'QUARTELY'     ? 4
                     : lenderReturnsType === 'HALFLY'       ? 2
                     : lenderReturnsType === 'YEARLY'       ? 1
                     : lenderReturnsType === 'ENDOFTHEDEAL' ? (months > 0 ? 12 / months : 1)
                     : 12;
  const annualRate        = selectedRate * paMultiplier;

  const periodsMap = {
    MONTHLY:      months,
    QUARTELY:     months / 3,
    HALFLY:       months / 6,
    YEARLY:       months / 12,
    ENDOFTHEDEAL: 1,
  };
  const periods           = periodsMap[lenderReturnsType] ?? months;
  const projectedReturn   = Math.round(numAmount * (selectedRate / 100) * periods);
  const totalReturn       = numAmount + projectedReturn;
  const monthlyReturn     = months > 0 ? Math.round(projectedReturn / months) : 0;

  const alreadyInvested   = existingParticipation?.participatedAmount ?? 0;
  const userMaxRemaining  = Math.max(0, (lot?.maxInvestment ?? 0) - alreadyInvested);
  const dealRemaining     = lot?.remaining ?? Infinity;
  const dealFull          = lot ? dealRemaining <= 0 : false;
  const effectiveMax      = Math.min(availableBalance, userMaxRemaining, dealRemaining);

  const handleChange = (e) => {
    const clean = e.target.value.replace(/\D/g, '');
    setAmount(clean ? parseInt(clean, 10).toLocaleString('en-IN') : '');
    setError('');
  };

  const validate = () => {
    if (!numAmount)                             return 'Please enter an amount.';
    if (numAmount < (lot?.minInvestment ?? 0)) return `Minimum investment is ${fmtINR(lot.minInvestment)}.`;
    if (numAmount > availableBalance)           return `Exceeds your wallet balance of ${fmtINR(availableBalance)}.`;
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

  if (lotLoading) return (
    <div className="flex items-center justify-center gap-3 py-20">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#06b6d4', borderTopColor: 'transparent' }} />
      <span className="text-base font-semibold" style={{ color: 'var(--text-muted)' }}>Loading collateral files…</span>
    </div>
  );

  if (profileFetched && (!panVerified || !bankVerified)) {
    const missing = [
      !panVerified  && { key: 'pan',  label: 'PAN Card Verification', desc: 'Verify your PAN to confirm your identity', path: '/profile?tab=pan',  color: '#f59e0b' },
      !bankVerified && { key: 'bank', label: 'Bank Account',          desc: 'Link a bank account to receive payouts',   path: '/profile?tab=bank', color: '#6366f1' },
    ].filter(Boolean);
    return (
      <div className="max-w-lg mx-auto py-10 grid gap-6">
        <button onClick={() => navigate('/asset')}
          className="flex items-center gap-1.5 text-base font-semibold hover:opacity-70 transition-opacity w-fit"
          style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft /> Back to Asset Deals
        </button>
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface-card)', border: '1px solid rgba(245,158,11,0.35)', boxShadow: '0 8px 32px rgba(245,158,11,0.1)' }}>
          <div className="h-1.5" style={{ background: 'linear-gradient(90deg,#f59e0b,#06b6d4)' }} />
          <div className="p-6 grid gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>Complete KYC to Invest</h2>
                <p className="text-base mt-1" style={{ color: 'var(--text-muted)' }}>
                  You need to complete the following steps before you can participate in premium asset deals.
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              {missing.map(item => (
                <div key={item.key} className="rounded-xl p-4 flex items-center gap-4"
                  style={{ background: `${item.color}08`, border: `1px solid ${item.color}25` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}12`, border: `1px solid ${item.color}25`, color: item.color }}>
                    {item.key === 'pan'
                      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                      : <BankIcon />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                  </div>
                  <button onClick={() => navigate(item.path)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold flex-shrink-0 transition-all hover:scale-105"
                    style={{ background: `${item.color}12`, color: item.color, border: `1px solid ${item.color}25` }}>
                    Complete <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/profile')}
              className="w-full py-3 rounded-xl font-black text-base transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#0891b2)', color: '#fff', boxShadow: '0 4px 16px rgba(6,182,212,0.35)' }}>
              Go to Profile &amp; Complete KYC
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!lot) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-base" style={{ color: 'var(--text-muted)' }}>Asset Deal not found.</p>
    </div>
  );

  const walletInsufficient = numAmount > 0 && numAmount > availableBalance;
  const exceedsUserMax     = numAmount > 0 && (alreadyInvested + numAmount) > (lot?.maxInvestment ?? Infinity);
  const exceedsDealCap     = numAmount > 0 && numAmount > dealRemaining;
  const belowMin           = numAmount > 0 && numAmount < (lot?.minInvestment ?? 0);
  const hasAmountError     = walletInsufficient || exceedsUserMax || exceedsDealCap || belowMin;
  const canSubmit          = numAmount >= (lot?.minInvestment ?? 0) && !hasAmountError && !dealFull;
  const raisedPct          = lot?.totalSize > 0 ? Math.min(Math.round((lot.raised / lot.totalSize) * 100), 100) : 0;
  const remainingBalance   = availableBalance - numAmount;

  if (submitted) return (
    <div className="max-w-2xl mx-auto py-10 flex flex-col items-center gap-6 text-center animate-fadeIn">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', boxShadow: '0 0 40px rgba(16,185,129,0.15)' }}>
        <CheckCircle />
      </div>
      <div>
        <h2 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Participation Confirmed!</h2>
        <p className="text-base mt-2" style={{ color: 'var(--text-muted)' }}>
          Your investment of <span className="font-bold" style={{ color: '#10b981' }}>{fmtINR(numAmount)}</span> in{' '}
          <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{lot.title}</span> has been recorded.
        </p>
      </div>
      <div className="w-full rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div className="px-5 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(16,185,129,0.04)' }}>
          <TrendUp />
          <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#10b981' }}>Investment Summary</span>
        </div>
        <div className="p-5 grid grid-cols-2 gap-3">
          {[
            { label: 'You Invested',      value: fmtINR(numAmount),      color: '#06b6d4' },
            { label: 'ROI Earnings',      value: fmtINR(projectedReturn), color: '#10b981' },
            { label: 'Total at Maturity', value: fmtINR(totalReturn),     color: '#f59e0b' },
            { label: 'Monthly Earnings',  value: fmtINR(monthlyReturn),   color: '#818cf8' },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-4 py-3"
              style={{ background: `${s.color}0a`, border: `1px solid ${s.color}18` }}>
              <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-xl font-extrabold" style={{ color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3 w-full">
        <button onClick={() => navigate('/asset')}
          className="flex-1 py-3 rounded-xl font-bold text-base"
          style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          Back to Asset Deals
        </button>
        <button onClick={() => navigate('/wallet/history')}
          className="flex-1 py-3 rounded-xl font-bold text-base text-white"
          style={{ background: 'linear-gradient(135deg,#06b6d4,#0891b2)', boxShadow: '0 4px 16px rgba(6,182,212,0.4)' }}>
          View Wallet
        </button>
      </div>
    </div>
  );

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
              style={{ borderBottom: '1px solid var(--border)', background: 'rgba(6,182,212,0.04)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', color: '#06b6d4' }}>
                <AlertIcon />
              </div>
              <div>
                <p className="text-base font-black" style={{ color: 'var(--text-primary)' }}>Confirm Investment</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>This action cannot be undone</p>
              </div>
            </div>
            <div className="px-6 py-5 grid gap-3">
              <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>You are investing</p>
              {[
                { label: 'Asset Property', value: lot.projectName || lot.title,                             color: 'var(--text-primary)' },
                { label: 'Amount',         value: fmtINR(numAmount),                                         color: '#06b6d4'             },
                { label: 'Payout Frequency',value: `${selectedOption?.label ?? 'Monthly'} · ${selectedRate}%`, color: '#10b981'             },
                { label: 'Duration',       value: lot.tenure,                                                color: '#818cf8'             },
                { label: 'Maturity Value', value: fmtINR(totalReturn),                                       color: '#f59e0b'             },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                  <span className="text-sm font-extrabold font-mono" style={{ color: r.color }}>{r.value}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-base font-bold"
                style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
              <button onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl text-base font-bold text-white transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg,#06b6d4,#0891b2)', boxShadow: '0 4px 14px rgba(6,182,212,0.4)' }}>
                Yes, Invest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/asset')}
          className="flex items-center gap-1.5 text-base font-semibold hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft /> Asset Deals
        </button>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{lot.title}</span>
      </div>

      {/* Main content grid */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Column */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

           {/* Collateral Asset & Borrower Details */}
          <div className="rounded-2xl p-5 grid gap-4"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <Building />
              <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>Asset &amp; Borrower Details</h3>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted" style={{ color: 'var(--text-muted)' }}>Project Name</p>
                <p className="text-base font-extrabold mt-0.5" style={{ color: 'var(--text-primary)' }}>{lot.projectName || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted" style={{ color: 'var(--text-muted)' }}>Borrower Name</p>
                <p className="text-base font-extrabold mt-0.5" style={{ color: 'var(--text-primary)' }}>{lot.borrowerName || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted" style={{ color: 'var(--text-muted)' }}>Collateral Value</p>
                <p className="text-base font-extrabold mt-0.5" style={{ color: 'var(--text-primary)' }}>{fmtINR(lot.assetValue)}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted" style={{ color: 'var(--text-muted)' }}>Asset Dimensions</p>
                <p className="text-base font-extrabold mt-0.5" style={{ color: 'var(--text-primary)' }}>{lot.assetArea} ({lot.assetAreaType})</p>
              </div>
            </div>

            {/* GPS coordinates & Verification Reports */}
            {lot.latitude && lot.longitude && (
              <div className="grid gap-2 pt-2">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Location Map</p>
                <div className="rounded-xl overflow-hidden relative border" style={{ borderColor: 'var(--border)', height: 220 }}>
                  <iframe
                    title="Asset GPS Map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://maps.google.com/maps?q=${lot.latitude},${lot.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  />
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${lot.latitude},${lot.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-black/70 text-[10px] font-bold text-white hover:bg-black/90 transition-colors flex items-center gap-1 backdrop-blur-sm shadow-md"
                  >
                    <MapPin /> Get Directions
                  </a>
                </div>
              </div>
            )}

            {/* Documents Verification Section */}
            <div className="grid gap-2.5 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-500">
                <Shield />
                <span>Documents Verified &amp; Secured</span>
              </div>

              <div className="grid gap-2 text-xs">
                {lot.legalReport ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-dashed transition-all hover:bg-emerald-500/5" style={{ borderColor: 'rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.02)' }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-emerald-500 shrink-0"><FileText /></span>
                      <div className="truncate flex-1">
                        <p className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>Legal Verification Report</p>
                        <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{getFileName(lot.legalReport, 'legal_report.pdf')}</p>
                      </div>
                    </div>
                    <a
                      href={lot.legalReport}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-colors"
                      style={{
                        background: 'rgba(16,185,129,0.12)',
                        color: '#10b981',
                        border: '1px solid rgba(16,185,129,0.25)',
                      }}
                    >
                      Download <Download />
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-dashed opacity-50" style={{ borderColor: 'var(--border)', background: 'var(--input-bg)' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-muted"><FileText /></span>
                      <div>
                        <p className="font-semibold text-xs text-muted">Legal Verification Report</p>
                        <p className="text-[10px] text-muted">No report uploaded</p>
                      </div>
                    </div>
                  </div>
                )}

                {lot.valuationReport ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-dashed transition-all hover:bg-emerald-500/5" style={{ borderColor: 'rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.02)' }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-emerald-500 shrink-0"><FileText /></span>
                      <div className="truncate flex-1">
                        <p className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>Valuation Assessment Report</p>
                        <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{getFileName(lot.valuationReport, 'valuation_report.pdf')}</p>
                      </div>
                    </div>
                    <a
                      href={lot.valuationReport}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-colors"
                      style={{
                        background: 'rgba(16,185,129,0.12)',
                        color: '#10b981',
                        border: '1px solid rgba(16,185,129,0.25)',
                      }}
                    >
                      Download <Download />
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-dashed opacity-50" style={{ borderColor: 'var(--border)', background: 'var(--input-bg)' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-muted"><FileText /></span>
                      <div>
                        <p className="font-semibold text-xs text-muted">Valuation Assessment Report</p>
                        <p className="text-[10px] text-muted">No report uploaded</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Property Images & Video Tours */}
          {((lot.images && lot.images.length > 0) || (lot.videos && lot.videos.length > 0)) && (
            <div className="rounded-2xl p-5 grid gap-4 animate-fadeIn"
              style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ color: '#06b6d4' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>Property Gallery &amp; Virtual Tours</h3>
              </div>

              {/* Images grid */}
              {lot.images && lot.images.length > 0 && (
                <div className="grid gap-3">
                  <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Verified Site Images ({lot.images.length})</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {lot.images.map((imgUrl, idx) => (
                      <a key={idx} href={imgUrl} target="_blank" rel="noopener noreferrer" className="relative group overflow-hidden rounded-xl border aspect-video block" style={{ borderColor: 'var(--border)' }}>
                        <img src={imgUrl} alt={`Property view ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-black px-2.5 py-1 rounded bg-black/60 backdrop-blur-sm">View Image</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos list */}
              {lot.videos && lot.videos.length > 0 && (
                <div className="grid gap-3 pt-2">
                  <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Video Walkthroughs ({lot.videos.length})</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {lot.videos.map((vidUrl, idx) => (
                      <div key={idx} className="rounded-xl overflow-hidden border bg-black aspect-video relative" style={{ borderColor: 'var(--border)' }}>
                        <video src={vidUrl} controls className="w-full h-full object-contain" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main Form and Info Card */}
          <div className="rounded-2xl p-5"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{lot.title}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
                  style={{ background: `${lot.tagColor}18`, color: lot.tagColor, border: `1px solid ${lot.tagColor}35` }}>
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: lot.tagColor }} />
                  {lot.tag}
                </span>
                <span className="px-3 py-1.5 rounded-full text-sm font-semibold"
                  style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                  Fractional Real Estate
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)', background: 'var(--input-bg)' }}>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Target ROI</p>
                <p className="text-3xl font-black leading-none" style={{ color: '#10b981' }}>
                  {annualRate.toFixed(1)}% <span className="text-lg font-bold">p.a.</span>
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>({selectedRate}% {selectedOption?.label?.toLowerCase() ?? 'monthly'})</p>
              </div>

              <div className="rounded-xl p-4 flex flex-col justify-between" style={{ border: '1px solid var(--border)', background: 'var(--input-bg)' }}>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Holding Period</p>
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ color: 'var(--text-muted)' }}>
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{lot.tenureMonths}</p>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>months</p>
              </div>

              <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)', background: 'var(--input-bg)' }}>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Min Investment</p>
                <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{fmtINR(lot.minInvestment)}</p>
              </div>

              <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)', background: 'var(--input-bg)' }}>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Max Limit</p>
                <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{fmtINR(lot.maxInvestment)}</p>
              </div>
            </div>

            {/* Interest Options */}
            {lot.interestOptions && lot.interestOptions.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Payout Interval</p>
                  {existingParticipation && (
                    <p className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)' }}>
                      Locked to your previous selection
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {lot.interestOptions.map(opt => {
                    const active = lenderReturnsType === opt.type;
                    const isLocked = existingParticipation && opt.type !== existingParticipation.amountTye;
                    return (
                      <button key={opt.type} type="button"
                        onClick={() => !isLocked && setLenderReturnsType(opt.type)}
                        disabled={isLocked}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
                        style={active ? {
                          background: 'rgba(6,182,212,0.1)',
                          border: '2px solid rgba(6,182,212,0.5)',
                          color: '#06b6d4',
                          cursor: 'pointer',
                        } : isLocked ? {
                          background: 'var(--input-bg)',
                          border: '1.5px solid var(--border)',
                          color: 'var(--text-muted)',
                          opacity: 0.4,
                          cursor: 'not-allowed',
                        } : {
                          background: 'var(--input-bg)',
                          border: '1.5px solid var(--border)',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                        }}>
                        <span className="text-base font-black font-mono">{opt.rate}%</span>
                        <span>{opt.label}</span>
                        {active && <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input and submit */}
            <div className="mb-5">
              <p className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Enter Investment Amount</p>

              {dealFull && (
                <div className="rounded-xl px-5 py-4 flex items-center gap-3 mb-3"
                  style={{ background: 'rgba(100,116,139,0.1)', border: '2px solid rgba(100,116,139,0.3)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 flex-shrink-0" style={{ color: '#64748b' }}>
                    <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                  </svg>
                  <div>
                    <p className="text-base font-black" style={{ color: 'var(--text-primary)' }}>Deal Fully Subscribed</p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>This property deal has met its required targets.</p>
                  </div>
                </div>
              )}

              {existingParticipation && (
                <div className="rounded-lg px-4 py-3 flex items-center gap-3 mb-3"
                  style={{ background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.25)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
                    <TrendUp />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: '#06b6d4' }}>Existing Portfolio Investment</p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {fmtINR(existingParticipation.participatedAmount)} invested · {fmtINR(userMaxRemaining)} additional capacity
                    </p>
                  </div>
                  <span className="text-base font-extrabold font-mono flex-shrink-0" style={{ color: '#06b6d4' }}>
                    {fmtINR(existingParticipation.participatedAmount)}
                  </span>
                </div>
              )}

              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black" style={{ color: 'var(--text-muted)' }}>₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    className="w-full rounded-xl text-xl font-bold outline-none transition-all"
                    style={{
                      padding: '16px 16px 16px 44px',
                      background: 'var(--input-bg)',
                      border: `2px solid ${hasAmountError ? '#ef4444' : amount ? '#06b6d4' : 'var(--border)'}`,
                      color: 'var(--text-primary)',
                      boxShadow: amount && !hasAmountError ? '0 0 0 4px rgba(6,182,212,0.08)' : 'none',
                    }}
                  />
                </div>
                <button
                  onClick={handleConfirmClick}
                  disabled={hasAmountError || !numAmount || submitting || dealFull}
                  className="px-8 py-4 rounded-xl font-black text-base transition-all flex items-center gap-2 disabled:opacity-60 whitespace-nowrap text-black"
                  style={{
                    background: (hasAmountError || !numAmount || dealFull) ? 'var(--input-bg)' : 'linear-gradient(135deg,#06b6d4,#0891b2)',
                    border: (hasAmountError || !numAmount || dealFull) ? '1px solid var(--border)' : 'none',
                    boxShadow: (hasAmountError || !numAmount || dealFull) ? 'none' : '0 6px 20px rgba(6,182,212,0.3)',
                    cursor: (hasAmountError || !numAmount || submitting || dealFull) ? 'not-allowed' : 'pointer',
                  }}>
                  {submitting
                    ? <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg> Processing...</>
                    : dealFull ? 'Sold Out' : 'Invest Now'}
                </button>
              </div>

              <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Min {fmtINR(lot.minInvestment)} &nbsp;•&nbsp; Max {fmtINR(effectiveMax)}
                </p>
                {amount && effectiveMax > 0 && (
                  <button onClick={() => setAmount(effectiveMax.toLocaleString('en-IN'))}
                    className="text-sm font-black px-2.5 py-1 rounded-lg hover:opacity-80 transition-opacity"
                    style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.25)' }}>
                    Use Max Limit
                  </button>
                )}
              </div>

              {/* Errors */}
              {exceedsDealCap && (
                <div className="rounded-lg px-4 py-3 flex items-start gap-2.5 mt-3"
                  style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)' }}>
                  <span style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }}><AlertIcon /></span>
                  <div>
                    <p className="text-base font-bold" style={{ color: '#ef4444' }}>Deal Capacity Exceeded</p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Only {fmtINR(dealRemaining)} remaining capacity left in this deal.</p>
                  </div>
                </div>
              )}

              {exceedsUserMax && !exceedsDealCap && (
                <div className="rounded-lg px-4 py-3 flex items-start gap-2.5 mt-3"
                  style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <span style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }}><AlertIcon /></span>
                  <div>
                    <p className="text-base font-bold" style={{ color: '#f59e0b' }}>User Investment Ceiling Exceeded</p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      You can invest at most {fmtINR(userMaxRemaining)} more in this deal (Max limit: {fmtINR(lot?.maxInvestment)}).
                    </p>
                  </div>
                </div>
              )}

              {walletInsufficient && !exceedsDealCap && !exceedsUserMax && (
                <div className="rounded-lg px-4 py-3 flex items-start gap-2.5 mt-3"
                  style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)' }}>
                  <span style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }}><AlertIcon /></span>
                  <div>
                    <p className="text-base font-bold" style={{ color: '#ef4444' }}>Wallet Funds Insufficient</p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>You need {fmtINR(numAmount - availableBalance)} more in your wallet.</p>
                    <button onClick={() => navigate('/wallet')}
                      className="mt-2 text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:scale-[1.02] text-white flex items-center gap-1"
                      style={{ background: 'linear-gradient(135deg,#06b6d4,#0891b2)', border: 'none', boxShadow: '0 2px 10px rgba(6,182,212,0.25)', cursor: 'pointer' }}>
                      Add Funds to Wallet →
                    </button>
                  </div>
                </div>
              )}

              {belowMin && !walletInsufficient && !exceedsUserMax && !exceedsDealCap && (
                <div className="rounded-lg px-4 py-3 flex items-start gap-2.5 mt-3"
                  style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)' }}>
                  <span style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }}><AlertIcon /></span>
                  <div>
                    <p className="text-base font-bold" style={{ color: '#ef4444' }}>Below Minimum Investment</p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Minimum investment required is {fmtINR(lot?.minInvestment)}.</p>
                  </div>
                </div>
              )}

              {error && !hasAmountError && (
                <p className="text-base font-semibold mt-2" style={{ color: '#ef4444' }}>{error}</p>
              )}
            </div>
          </div>

          {/* Funding Progress Section */}
          <div className="rounded-xl p-5" style={{ border: '1px solid var(--border)', background: 'var(--surface-card)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Target Subscription</p>
                <p className="text-xl font-black" style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                  {fmtINR(lot.raised)} / {fmtINR(lot.totalSize)}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>funded</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black" style={{ color: '#06b6d4' }}>{raisedPct}% filled</p>
              </div>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${raisedPct}%`, background: 'linear-gradient(90deg,#06b6d4,#22d3ee)' }} />
            </div>
          </div>

          {submitError && (
            <p className="text-base font-semibold px-4 py-3 rounded-xl mt-4"
              style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}>
              {submitError}
            </p>
          )}
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
          {/* Wallet balance */}
          <div className="rounded-2xl p-5"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', color: '#06b6d4' }}>
                <WalletIcon />
              </div>
              <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Your Wallet</p>
            </div>
            <div className="grid gap-2">
              <div className="rounded-xl px-4 py-3" style={{ background: 'var(--input-bg)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Available Balance</p>
                <p className="text-2xl font-black" style={{ color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace" }}>{fmtINR(availableBalance)}</p>
              </div>
              {!existingParticipation && numAmount > 0 && (
                <div className="rounded-xl px-4 py-3"
                  style={{ background: 'var(--input-bg)', border: `1px solid ${remainingBalance >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>After Investment</p>
                  <p className="text-2xl font-black" style={{ color: remainingBalance >= 0 ? '#10b981' : '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmtINR(remainingBalance)}
                  </p>
                  {remainingBalance < 0 && <p className="text-sm font-semibold mt-1" style={{ color: '#ef4444' }}>Insufficient funds!</p>}
                </div>
              )}
            </div>
            <button onClick={() => navigate('/wallet')}
              className="mt-4 w-full py-2.5 rounded-xl text-sm font-black transition-all hover:scale-[1.02] text-white flex items-center justify-center gap-1.5"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#0891b2)', boxShadow: '0 4px 14px rgba(6,182,212,0.25)', border: 'none', cursor: 'pointer' }}>
              <WalletIcon /> + Add Funds
            </button>
          </div>

          {/* Payment transfer details */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="px-5 py-4 flex items-center gap-3"
              style={{ borderBottom: '1px solid var(--border)', background: 'rgba(6,182,212,0.04)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', color: '#06b6d4' }}>
                <BankIcon />
              </div>
              <div>
                <p className="text-base font-black" style={{ color: 'var(--text-primary)' }}>Bank Transfer Details</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Direct funding for this asset</p>
              </div>
            </div>

            <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(6,182,212,0.06)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Account Holder Name</p>
              <p className="text-base font-black mt-0.5" style={{ color: 'var(--text-primary)' }}>{lot.bankDetails.accountName}</p>
            </div>

            <div className="px-5 py-4 grid gap-3">
              {[
                { label: 'Bank Name',       value: lot.bankDetails.bankName,      copy: false },
                { label: 'Account Number',  value: lot.bankDetails.accountNumber, copy: true  },
                { label: 'IFSC Code',       value: lot.bankDetails.ifsc,          copy: true  },
                { label: 'Branch Name',     value: lot.bankDetails.branch,        copy: false },
              ].map(r => (
                <div key={r.label}>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>{r.label}</p>
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                    <span className="text-sm font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{r.value}</span>
                    {r.copy && <CopyBtn text={r.value} />}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 pb-4">
              <div className="rounded-xl px-4 py-3 flex items-start gap-2.5"
                style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#06b6d4' }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Once the bank transfer is completed, validation and portfolio sync will happen within 24 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Return summary when value is entered */}
          {canSubmit && (
            <div className="rounded-2xl p-5"
              style={{ background: 'var(--surface-card)', border: '1px solid rgba(16,185,129,0.25)', boxShadow: '0 2px 12px rgba(16,185,129,0.08)' }}>
              <div className="flex items-center gap-2 mb-4">
                <TrendUp />
                <p className="text-base font-black" style={{ color: '#10b981' }}>Projected Yield</p>
              </div>
              <div className="grid gap-2">
                {[
                  { label: 'Principal Investment', value: fmtINR(numAmount),       color: '#06b6d4' },
                  { label: 'Estimated ROI',       value: fmtINR(projectedReturn), color: '#10b981' },
                  { label: 'Maturity Returns',    value: fmtINR(totalReturn),     color: '#f59e0b' },
                  { label: 'Monthly Interest',    value: fmtINR(monthlyReturn),   color: '#818cf8' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                    style={{ background: `${s.color}0a`, border: `1px solid ${s.color}20` }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                    <p className="text-base font-extrabold font-mono" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
