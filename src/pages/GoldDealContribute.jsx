import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getPropertyById, GoldRate } from '../api/afterlogin-user';
import { get, post } from '../api/client';
import { getUserId } from '../api/client';
import { formatINR } from '../utils/currency';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtINR(n) {
  if (!n && n !== 0) return '—';
  const num = Number(n);
  if (isNaN(num)) return '—';
  return formatINR(num);
}

function capitalizeFirst(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const BackIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>;
const GoldIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="9"/><path d="M9 9h1.5a1.5 1.5 0 0 1 0 3H9v3"/><path d="M9 12h3"/></svg>;
const CloseIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const CheckIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="20 6 9 17 4 12"/></svg>;

// ─── Payout type label map (mirrors reference) ────────────────────────────────
const PAYOUT_LABELS = {
  monthly:        'Monthly',
  quarterly:      'Quarterly',
  halfyearly:     'Half-Yearly',
  yearly:         'Yearly',
  unlimited:      'Best Monthly RoI',
  unlimitedyearly:'Best Yearly RoI',
  partnerinvest:  'Invest',
  silverpartner:  'Silver Partner',
  goldpartner:    'Gold Partner',
  platinumpartner:'Platinum Partner',
};

function payoutLabel(type) {
  return PAYOUT_LABELS[type] ?? capitalizeFirst(type ?? '');
}

// ─── Profit sharing logic (from reference) ────────────────────────────────────
function getProfitSharing(amountType) {
  switch (amountType) {
    case 'silverpartner':   return { pct: 50,  multiplier: '2.35x', years: 6 };
    case 'goldpartner':     return { pct: 60,  multiplier: '2.73x', years: 6 };
    case 'platinumpartner': return { pct: 100, multiplier: '2.99x', years: 6 };
    default:                return null;
  }
}

// ─── Confirmation modal ───────────────────────────────────────────────────────
function ConfirmModal({ deal, selectedType, amount, feeAmount, feePercentage, onConfirm, onCancel, loading }) {
  const label = payoutLabel(selectedType);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}>
      <div className="rounded-2xl overflow-hidden w-full max-w-md"
        style={{ background: 'var(--surface-card)', border: '1px solid rgba(245,158,11,0.25)', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}
        onClick={e => e.stopPropagation()}>

        <div className="px-6 py-5 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(245,158,11,0.05)' }}>
          <h3 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>Confirm Participation</h3>
          <button onClick={onCancel} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <CloseIcon />
          </button>
        </div>

        <div className="px-6 py-5 grid gap-3">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Are you sure you want to participate in the{' '}
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{label}</span>{' '}
            deal with <span className="font-bold" style={{ color: '#f59e0b' }}>{fmtINR(amount)}</span>?
          </p>

          {feeAmount > 0 && (
            <div className="rounded-xl px-4 py-3 text-xs grid gap-1"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p><strong>Fee:</strong> {fmtINR(feeAmount)} ({feePercentage}% + 18% GST)</p>
              <p>Fee collected by <strong>Bridgital TPS LTD</strong></p>
              <p>Partner contribution collected by <strong>OXYIDEAS PARTNER LLP</strong></p>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 disabled:opacity-40"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}>
            {loading && <span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />}
            {loading ? 'Submitting…' : feeAmount > 0 ? `Pay ${fmtINR(feeAmount)}` : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Success modal ────────────────────────────────────────────────────────────
function SuccessModal({ deal, selectedType, amount, totalAmounts, durationType, onContinue, onExit }) {
  const [selectedTenure, setSelectedTenure] = useState('');
  const [tenureError,    setTenureError]    = useState('');
  const isGrams = (deal?.propertyName ?? '').toLowerCase().includes('grams') || deal?.propertyType === 'GOLDGRAMS';
  // Tenure options: optional → 1-36 months, mandatory → fixed duration
  const duration = deal?.duration ?? null;
  const years = Array.from({ length: 36 }, (_, i) => i + 1);

  const handleContinue = () => {
    if (!isGrams && !selectedTenure) { setTenureError('Please select a tenure'); return; }
    onContinue(selectedTenure);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onExit}>
      <div className="rounded-2xl overflow-hidden w-full max-w-md"
        style={{ background: 'var(--surface-card)', border: '1px solid rgba(16,185,129,0.25)', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}
        onClick={e => e.stopPropagation()}>

        <div className="px-6 py-5 flex items-center gap-3"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(16,185,129,0.05)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
            <CheckIcon />
          </div>
          <h3 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Intend to Partner
          </h3>
        </div>

        <div className="px-6 py-5 grid gap-3">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>🎉 Congratulations!</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            You have submitted your intent to partner{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{payoutLabel(selectedType)}</strong>{' '}
            with an amount of{' '}
            <strong style={{ color: '#f59e0b' }}>{fmtINR(amount)}</strong>.
          </p>

          {/* Total breakdown */}
          <div className="rounded-xl px-4 py-3 grid gap-1 text-xs"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
            <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Total Intend To Partner:</p>
            {Object.entries(totalAmounts).filter(([, v]) => Number(v) > 0).map(([k, v]) => (
              <p key={k}><strong>{k.toUpperCase()}:</strong> {fmtINR(v)}</p>
            ))}
            <p className="mt-1 font-bold" style={{ color: '#f59e0b' }}>
              Total: {fmtINR(Object.values(totalAmounts).reduce((s, v) => s + Number(v || 0), 0))}
            </p>
          </div>

          {/* Tenure selector (not for SDLOT/GRAMS) */}
          {!isGrams && (
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Choose Tenure</label>
              <select value={selectedTenure} onChange={e => { setSelectedTenure(e.target.value); setTenureError(''); }}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'var(--input-bg)', border: `1px solid ${tenureError ? '#ef4444' : 'var(--border)'}`, color: 'var(--text-primary)' }}>
                <option value="">Select an option</option>
                {durationType === 'optional'
                  ? years.map(m => <option key={m} value={m}>{m} {m > 1 ? 'Months' : 'Month'}</option>)
                  : duration ? <option value={duration}>{duration} {duration > 1 ? 'Months' : 'Month'}</option> : null
                }
              </select>
              {tenureError && <p className="text-xs" style={{ color: '#ef4444' }}>{tenureError}</p>}
            </div>
          )}

          {!isGrams && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Would you like to participate in additional Monthly Realization Payout opportunities for this deal?
            </p>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={handleContinue}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}>
            {isGrams ? 'OK' : 'Yes'}
          </button>
          {!isGrams && (
            <button onClick={onExit}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              No
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Final confirmation modal ─────────────────────────────────────────────────
function FinalModal({ userData, totalAmounts, onOk }) {
  const total = Object.values(totalAmounts).reduce((s, v) => s + Number(v || 0), 0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}>
      <div className="rounded-2xl overflow-hidden w-full max-w-md"
        style={{ background: 'var(--surface-card)', border: '1px solid rgba(16,185,129,0.25)', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>

        <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>Intend to Partner</h3>
        </div>

        <div className="px-6 py-5 grid gap-3 text-sm">
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>🎉 Congratulations!</p>
          <p style={{ color: 'var(--text-muted)' }}>
            Dear <strong>{[userData?.firstName, userData?.lastName].filter(Boolean).map(capitalizeFirst).join(' ')}</strong>,
            with mobile number <strong>{userData?.mobileNumber}</strong>, your intended participation amount of{' '}
            <strong style={{ color: '#f59e0b' }}>{fmtINR(total)}</strong> has been successfully processed.
          </p>
          <div className="rounded-xl px-4 py-3 text-xs grid gap-1"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
            {Object.entries(totalAmounts).filter(([, v]) => Number(v) > 0).map(([k, v]) => (
              <p key={k}><strong>{k.toUpperCase()}:</strong> {fmtINR(v)}</p>
            ))}
            <p className="mt-1 font-bold" style={{ color: '#f59e0b' }}>Total: {fmtINR(total)}</p>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Your MoU will be updated and sent to you via email at <strong>{userData?.email}</strong>.
          </p>
        </div>

        <div className="px-6 pb-6">
          <button onClick={onOk}
            className="w-full py-2.5 rounded-xl text-sm font-bold hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ROI offer card — redesigned ─────────────────────────────────────────────
function RoiOfferCard({ item, selected, onSelect, propertyType }) {
  const profit = getProfitSharing(item.amountType);
  const accent = '#f59e0b';
  const fmt = (n) => n != null ? formatINR(n) : null;

  // Bar heights for mini chart decoration (static per card type)
  const bars = [30, 55, 40, 70, 50, 85, 60, 75, 45, 90];

  return (
    <div className="rounded-2xl overflow-hidden cursor-pointer transition-all"
      style={{
        background: selected
          ? 'linear-gradient(145deg,#1c1400,#2d1f00)'
          : 'var(--surface-card)',
        border: `2px solid ${selected ? accent : 'var(--border)'}`,
        boxShadow: selected ? `0 12px 32px rgba(245,158,11,0.25)` : '0 2px 12px rgba(0,0,0,0.06)',
        transform: selected ? 'translateY(-3px)' : 'none',
      }}
      onClick={() => onSelect(item.amountType)}>

      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: selected ? `linear-gradient(90deg,${accent},${accent}44)` : 'var(--border)' }} />

      {/* Mini bar chart background */}
      <div className="relative px-5 pt-5 pb-3">
        {/* Decorative bars */}
        <div className="absolute bottom-0 right-0 flex items-end gap-0.5 px-3 pb-0 pointer-events-none overflow-hidden"
          style={{ height: 40, opacity: selected ? 0.2 : 0.08 }}>
          {bars.map((h, i) => (
            <div key={i} className="w-2 rounded-t"
              style={{ height: `${h}%`, background: accent }} />
          ))}
        </div>

        {/* Header row */}
        <div className="flex items-start justify-between mb-3 relative z-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: selected ? `${accent}99` : 'var(--text-muted)' }}>
              {payoutLabel(item.amountType)}
            </p>
            {item.roi != null && (
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black leading-none"
                  style={{ color: accent, fontFamily: "'JetBrains Mono', monospace",
                    textShadow: selected ? `0 0 20px ${accent}60` : 'none' }}>
                  {item.roi}%
                </span>
                <span className="text-xs font-semibold" style={{ color: selected ? `${accent}88` : 'var(--text-muted)' }}>
                  ROI
                </span>
              </div>
            )}
          </div>
          {selected ? (
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: accent, color: '#fff' }}>
              <CheckIcon />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full border-2 flex-shrink-0"
              style={{ borderColor: 'var(--border)' }} />
          )}
        </div>

        {/* Min / Max */}
        {(item.minAmount || item.maxAmount) && (
          <div className="flex items-center gap-4 mb-3 relative z-10">
            {item.minAmount && (
              <div>
                <p className="text-xs" style={{ color: selected ? `${accent}77` : 'var(--text-muted)' }}>Min</p>
                <p className="text-sm font-extrabold" style={{ color: selected ? '#fff' : 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                  {fmt(item.minAmount)}
                </p>
              </div>
            )}
            {item.maxAmount && (
              <div>
                <p className="text-xs" style={{ color: selected ? `${accent}77` : 'var(--text-muted)' }}>Max</p>
                <p className="text-sm font-extrabold" style={{ color: selected ? '#fff' : 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                  {fmt(item.maxAmount)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Gold appreciation bonus */}
        {propertyType === 'GOLDLOT' && item.goldGrowth != null && item.goldGrowth !== 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-2 relative z-10"
            style={{ background: selected ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.08)', border: `1px solid ${accent}25` }}>
            <span className="text-xs font-semibold" style={{ color: accent }}>
              💎 Gold Bonus: <strong>{item.goldGrowth}%</strong> annually
            </span>
          </div>
        )}

        {/* Profit sharing */}
        {profit && (
          <div className="px-3 py-2 rounded-xl mb-2 relative z-10"
            style={{ background: selected ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <p className="text-xs font-semibold" style={{ color: '#818cf8' }}>
              📈 Profit sharing: <strong>{profit.pct}%</strong> upon sale
            </p>
            <p className="text-xs mt-0.5" style={{ color: selected ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)' }}>
              Goal: {profit.multiplier} in {profit.years} yrs (goal ≠ guarantee)
            </p>
          </div>
        )}

        {/* Fee */}
        {item.feePercentage1 > 0 && (
          <p className="text-xs relative z-10" style={{ color: selected ? `${accent}88` : 'var(--text-muted)' }}>
            Fee: <strong>{item.feePercentage1}% + 18% GST</strong>
          </p>
        )}
      </div>

      {/* Select button */}
      <div className="px-5 pb-4 relative z-10">
        <div className="w-full py-2 rounded-xl text-xs font-bold text-center transition-all"
          style={{
            background: selected ? accent : `${accent}15`,
            color:      selected ? '#fff' : accent,
            border:     `1px solid ${accent}30`,
          }}>
          {selected ? '✓ Selected' : 'Select'}
        </div>
      </div>
    </div>
  );
}

// ─── Main contribution page ───────────────────────────────────────────────────
export default function GoldDealContribute() {
  const { id }       = useParams();
  const location     = useLocation();
  const navigate     = useNavigate();
  const userId       = getUserId();

  // Deal — from navigation state or fetched
  const [deal,       setDeal]       = useState(location.state?.deal ?? null);
  const [roiOffers,  setRoiOffers]  = useState([]);
  const [loading,    setLoading]    = useState(!location.state?.deal);
  const [roiLoading, setRoiLoading] = useState(true);

  // Form state
  const [selectedType,  setSelectedType]  = useState(null);
  const [amount,        setAmount]        = useState('');
  const [documentType,  setDocumentType]  = useState('MOU');
  const [amountError,   setAmountError]   = useState('');
  const [docError,      setDocError]      = useState('');

  // Modals
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [showSuccess,  setShowSuccess]  = useState(false);
  const [showFinal,    setShowFinal]    = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError,   setSubmitError]   = useState('');

  // Totals (accumulated across multiple participations)
  const [totalAmounts, setTotalAmounts] = useState({});
  const [userData,     setUserData]     = useState(null);

  // Gold rates
  const [gold24K, setGold24K] = useState(null);
  const [gold22K, setGold22K] = useState(null);

  // Fetch deal by id (source of truth: /oxybrick-service/{id})
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getPropertyById(id)
      .then(res => {
        if (mounted) setDeal(res);
      })
      .catch(() => {
        if (mounted) setDeal(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [id]);

  // Fetch gold rates
  useEffect(() => {
    GoldRate()
      .then(res => {
        const ibja = res.ibjaRates;
        const ibja24K = ibja.gold999 !== "N/A" ? ibja.gold999 : 0.00;
        const ibja22K = ibja.gold916 !== "N/A" ? ibja.gold916 : 0.00;
        setGold24K(ibja24K);
        setGold22K(ibja22K);
      })
      .catch(() => {
        console.warn('Failed to fetch gold rates');
        setGold24K(null);
        setGold22K(null);
      });
  }, []);

  // Fetch ROI offers — correct endpoint: /{id}/roi-fee-details
  useEffect(() => {
    if (!id) return;
    setRoiLoading(true);
    get(`/oxybrick-service/${id}/roi-fee-details`)
      .then(res => {
        const raw = Array.isArray(res) ? res : res?.data ?? [];
        // Normalise: extract the relevant ROI value based on amountType
        const normalised = raw.map(item => {
          const roiByType = {
            monthly:         item.monthlyRoi,
            quarterly:       item.quarterlyRoi,
            halfyearly:      item.halfYearlyRoi,
            yearly:          item.yearlyRoi,
            unlimited:       item.unlimitedRoi,
            unlimitedyearly: item.unlimitedYearlyRoi,
            silverpartner:   item.silverRoi,
            goldpartner:     item.goldRoi,
            platinumpartner: item.platinumRoi,
            partnerinvest:   item.eodRoi,
          };
          return {
            ...item,
            roi: roiByType[item.amountType] ?? item.roi ?? null,
          };
        });
        setRoiOffers(normalised);
        // Auto-select when there's only one offer
        if (normalised.length === 1) setSelectedType(normalised[0].amountType);
      })
      .catch(() => setRoiOffers([]))
      .finally(() => setRoiLoading(false));
  }, [id]);

  // Fetch user profile
  useEffect(() => {
    if (!userId) return;
    get(`/student-service/user/profile?id=${userId}`)
      .then(res => setUserData(res))
      .catch(() => {});
    
   
  }, [userId]);

  const isGrams = (deal?.propertyName ?? '').toLowerCase().includes('grams') || deal?.propertyType === 'GOLDGRAMS';

  // Selected offer details
  const selectedOffer = roiOffers.find(o => o.amountType === selectedType);
  const feePercentage = selectedOffer?.feePercentage1 ?? 0;
  const feeAmount     = feePercentage > 0 ? Number((Number(amount || 0) * (feePercentage / 100) * 1.18).toFixed(2)) : 0;

  // Validation
  const validate = () => {
    let valid = true;
    if (!documentType) { setDocError('Please select a document type'); valid = false; }
    if (!isGrams && (!amount || isNaN(Number(amount)) || Number(amount) <= 0)) {
      setAmountError('Please enter a valid amount'); valid = false;
    }
    return valid;
  };

  const handleSubmitClick = () => {
    if (!selectedType) return;
    if (!validate()) return;
    setSubmitError('');
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setSubmitLoading(true);
    setSubmitError('');
    try {
      await post('/oxybrick-service/userParticipartion', {
        propertyId:    id,
        userId,
        amount:     (amount || 0),
        assetTYpe : documentType,
        participationType: selectedType,
        feeAmount: feeAmount,
        dealType:null,
        goldParticipationId:null,
        goldRateOnParticipation: gold24K || 0,
        goldRateOnParticipationOne: gold22K || 0,
      });

      // Accumulate totals
      setTotalAmounts(prev => ({
        ...prev,
        [selectedType]: (Number(prev[selectedType] || 0) + Number(amount || 0)),
      }));

      setShowConfirm(false);
      setShowSuccess(true);
    } catch (e) {
      setSubmitError(e.message ?? 'Submission failed. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSuccessContinue = (tenure) => {
    // Reset for another participation on same deal
    setAmount('');
    setSelectedType(null);
    setDocumentType('MOU');
    setShowSuccess(false);
  };

  const handleSuccessExit = () => {
    setShowSuccess(false);
    setShowFinal(true);
  };

  const handleFinalOk = () => {
    navigate(`/gold-deals/participation/${id}`, {
      state: {
        propertyId: id,
        propertyType: deal?.propertyType,
        auctionType: deal?.auctionType,
        userParticipationStatus: 'MOU',
      },
    });
  };

  const accent = '#f59e0b';

  if (loading) return (
    <div className="flex items-center justify-center gap-3 py-20">
      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: accent, borderTopColor: 'transparent' }} />
      <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading deal…</span>
    </div>
  );

  if (!deal) return (
    <div className="py-20 text-center">
      <p className="text-sm" style={{ color: '#ef4444' }}>Deal not found.</p>
      <button onClick={() => navigate('/gold-deals')} className="mt-3 text-xs underline" style={{ color: accent }}>
        Back to Gold Deals
      </button>
    </div>
  );

  // Parse display info from deal
  const roiMatch    = deal.propertyName?.match(/ROI([\d.]+)/i);
  const roiValue    = roiMatch ? roiMatch[1] : null;
  const payoutMatch = deal.propertyName?.match(/-(MLY|YLY|QLY|HLY)-/i);
  const payoutMap   = { MLY: 'Monthly', YLY: 'Yearly', QLY: 'Quarterly', HLY: 'Half-Yearly' };
  const payoutLbl   = payoutMatch ? (payoutMap[payoutMatch[1].toUpperCase()] ?? payoutMatch[1]) : null;
  const tenureMatch = deal.propertyName?.match(/([\d.]+)(YRS?|MNS?|MONTHS?)/i);
  const tenureLbl   = tenureMatch
    ? `${tenureMatch[1]} ${tenureMatch[2].toUpperCase().startsWith('Y') ? 'Yr' : 'Mo'}${parseFloat(tenureMatch[1]) > 1 ? 's' : ''}`
    : null;

  return (
    <div className="flex justify-center">
    <div className="grid gap-5 w-full" style={{ maxWidth: 720 }}>

      {/* ── Back + header ── */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/gold-deals')}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <BackIcon />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: accent }}>
            <GoldIcon />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: accent }}>Contribute</p>
            <h1 className="text-lg font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {deal.propertyName}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Deal summary strip — redesigned ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#1c1400 0%,#2d1f00 50%,#1c1400 100%)', border: `1px solid ${accent}30`, boxShadow: `0 8px 32px rgba(245,158,11,0.15)` }}>
        <div className="flex items-stretch">
          {/* Left: ROI hero */}
          <div className="flex flex-col items-center justify-center px-8 py-6 relative overflow-hidden"
            style={{ minWidth: 160, borderRight: `1px solid ${accent}20` }}>
            {/* Glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at 50% 50%,${accent}18,transparent 70%)` }} />
            {/* Bars */}
            <div className="absolute bottom-0 left-0 right-0 flex items-end gap-0.5 px-2 pointer-events-none"
              style={{ height: 36, opacity: 0.15 }}>
              {[30,55,40,70,50,85,60,75,45,90,65,80].map((h,i) => (
                <div key={i} className="flex-1 rounded-t" style={{ height:`${h}%`, background: accent }} />
              ))}
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 relative z-10"
              style={{ background: `${accent}20`, border: `1px solid ${accent}40`, color: accent }}>
              <GoldIcon />
            </div>
            {roiValue && (
              <div className="relative z-10 text-center">
                <p className="text-4xl font-black leading-none"
                  style={{ color: accent, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 24px ${accent}70` }}>
                  {roiValue}%
                </p>
                <p className="text-xs mt-1 font-semibold" style={{ color: `${accent}88` }}>{payoutLbl ?? 'Returns'}</p>
              </div>
            )}
            {tenureLbl && (
              <div className="mt-3 px-3 py-1 rounded-full relative z-10"
                style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
                <p className="text-xs font-bold" style={{ color: accent }}>{tenureLbl}</p>
              </div>
            )}
          </div>

          {/* Right: deal info */}
          <div className="flex-1 px-6 py-5 flex flex-col justify-center gap-3">
            <div>
              <p className="text-base font-extrabold leading-snug"
                style={{ color: '#fff', fontFamily: "'JetBrains Mono', monospace" }}>
                {deal.propertyName}
              </p>
              <p className="text-xs mt-0.5 font-semibold" style={{ color: `${accent}88` }}>
                {deal.ownerName?.trim()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {deal.propertyTds?.trim().toUpperCase() === 'MANDATORY' && (
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>TDS 10%</span>
              )}
              {deal.propertyTds?.trim().toUpperCase() === 'OPTIONAL' && (
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: 'rgba(245,158,11,0.15)', color: accent, border: `1px solid ${accent}30` }}>TDS Optional</span>
              )}
              {deal.durationType?.toLowerCase() === 'optional' && (
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }}>No Lock-in</span>
              )}
              {deal.durationType?.toLowerCase() === 'mandatory' && (
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: 'rgba(168,85,247,0.15)', color: '#d8b4fe', border: '1px solid rgba(168,85,247,0.3)' }}>Lock-in</span>
              )}
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1"
                style={{
                  background: deal.auctionType === 'Open' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  color:      deal.auctionType === 'Open' ? '#6ee7b7' : '#fca5a5',
                  border:     `1px solid ${deal.auctionType === 'Open' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                }}>
                {deal.auctionType === 'Open' && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10b981' }} />}
                {deal.auctionType}
              </span>
            </div>
            {deal.reservedPrice > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: `${accent}77` }}>Max Capital</span>
                <span className="text-sm font-extrabold" style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatINR(deal.reservedPrice)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ROI offer cards + form (side-by-side when single card) ── */}
      <div>
        <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: accent }}>
          Select Participation Type
        </p>

        {roiLoading ? (
          <div className="flex items-center gap-2 py-8 justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: accent, borderTopColor: 'transparent' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading offers…</span>
          </div>
        ) : roiOffers.length === 0 ? (
          <div className="py-8 text-center rounded-2xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No participation offers available for this deal.</p>
          </div>
        ) : roiOffers.length === 1 ? (
          /* ── Single card: side-by-side with form ── */
          <div className="flex gap-4 items-start">
            {/* Card — fixed width */}
            <div className="flex-shrink-0 w-[260px]">
              <RoiOfferCard
                item={roiOffers[0]}
                selected={selectedType === roiOffers[0].amountType}
                onSelect={setSelectedType}
                propertyType={deal.propertyType}
              />
            </div>

            {/* Form — fills remaining space */}
            <div className="flex-1 rounded-2xl p-5 grid gap-4"
              style={{ background: 'var(--surface-card)', border: `1px solid ${accent}22` }}>
              <p className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
                Intend to Partner — {payoutLabel(roiOffers[0].amountType)}
              </p>

              {/* Document type */}
              <div className="grid gap-2">
                <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Select document type:</p>
                <div className="flex gap-4">
                  {['MOU', ...(deal.propertyType !== 'GOLDLOT' && deal.propertyType !== 'SDLOT' && deal.propertyType !== 'GOLDGRAMS' ? ['PLOT_REGISTRATION'] : [])].map(dt => (
                    <label key={dt} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value={dt} checked={documentType === dt}
                        onChange={() => { setDocumentType(dt); setDocError(''); }}
                        className="accent-amber-500" />
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {dt === 'MOU' ? 'MoU' : 'Registration'}
                      </span>
                    </label>
                  ))}
                </div>
                {docError && <p className="text-xs" style={{ color: '#ef4444' }}>{docError}</p>}
              </div>

              {/* Amount */}
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Amount (₹)</label>
                <input type="tel" value={amount} disabled={isGrams}
                  onChange={e => { const v = e.target.value; if (/^\d*$/.test(v)) { setAmount(v); setAmountError(''); } else setAmountError('Please enter a positive integer.'); }}
                  placeholder={`Enter amount for ${payoutLabel(roiOffers[0].amountType)} participation`}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{ background: 'var(--input-bg)', border: `1px solid ${amountError ? '#ef4444' : 'var(--border)'}`, color: 'var(--text-primary)', opacity: isGrams ? 0.5 : 1 }} />
                {amountError && <p className="text-xs" style={{ color: '#ef4444' }}>{amountError}</p>}
                {feeAmount > 0 && (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Fee: <strong style={{ color: accent }}>{fmtINR(feeAmount)}</strong> ({feePercentage}% + 18% GST)
                  </p>
                )}
              </div>

              {submitError && (
                <div className="px-4 py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {submitError}
                </div>
              )}

              <button
                onClick={() => { setSelectedType(roiOffers[0].amountType); handleSubmitClick(); }}
                className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.01]"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}>
                Submit Participation
              </button>
            </div>
          </div>
        ) : (
          /* ── Multiple cards: stacked grid ── */
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roiOffers.map(item => (
              <RoiOfferCard
                key={item.amountType}
                item={item}
                selected={selectedType === item.amountType}
                onSelect={setSelectedType}
                propertyType={deal.propertyType}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Contribution form (multiple cards only) ── */}
      {roiOffers.length > 1 && selectedType && (
        <div className="rounded-2xl p-5 grid gap-4"
          style={{ background: 'var(--surface-card)', border: `1px solid ${accent}22` }}>
          <p className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Intend to Partner — {payoutLabel(selectedType)}
          </p>

          {/* Document type */}
          <div className="grid gap-2">
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Select document type:</p>
            <div className="flex gap-4">
              {['MOU', ...(deal.propertyType !== 'GOLDLOT' && deal.propertyType !== 'SDLOT' && deal.propertyType !== 'GOLDGRAMS' ? ['PLOT_REGISTRATION'] : [])].map(dt => (
                <label key={dt} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value={dt} checked={documentType === dt}
                    onChange={() => { setDocumentType(dt); setDocError(''); }}
                    className="accent-amber-500" />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {dt === 'MOU' ? 'MoU' : 'Registration'}
                  </span>
                </label>
              ))}
            </div>
            {docError && <p className="text-xs" style={{ color: '#ef4444' }}>{docError}</p>}
          </div>

          {/* Amount input */}
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Amount (₹)</label>
            <input type="tel" value={amount} disabled={isGrams}
              onChange={e => { const v = e.target.value; if (/^\d*$/.test(v)) { setAmount(v); setAmountError(''); } else setAmountError('Please enter a positive integer.'); }}
              placeholder={`Enter amount for ${payoutLabel(selectedType)} participation`}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{ background: 'var(--input-bg)', border: `1px solid ${amountError ? '#ef4444' : 'var(--border)'}`, color: 'var(--text-primary)', opacity: isGrams ? 0.5 : 1 }} />
            {amountError && <p className="text-xs" style={{ color: '#ef4444' }}>{amountError}</p>}
            {feeAmount > 0 && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Fee: <strong style={{ color: accent }}>{fmtINR(feeAmount)}</strong> ({feePercentage}% + 18% GST)
              </p>
            )}
          </div>

          {submitError && (
            <div className="px-4 py-2.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {submitError}
            </div>
          )}

          <button onClick={handleSubmitClick}
            className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.01]"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}>
            Submit Participation
          </button>
        </div>
      )}

      {/* ── Modals ── */}
      {showConfirm && (
        <ConfirmModal
          deal={deal}
          selectedType={selectedType}
          amount={Number(amount || 0)}
          feeAmount={feeAmount}
          feePercentage={feePercentage}
          onConfirm={handleConfirm}
          onCancel={() => { setShowConfirm(false); setSubmitError(''); }}
          loading={submitLoading}
        />
      )}

      {showSuccess && (
        <SuccessModal
          deal={deal}
          selectedType={selectedType}
          amount={Number(amount || 0)}
          totalAmounts={totalAmounts}
          durationType={deal.durationType}
          durations={deal.durations}
          onContinue={handleSuccessContinue}
          onExit={handleSuccessExit}
        />
      )}

      {showFinal && (
        <FinalModal
          userData={userData}
          totalAmounts={totalAmounts}
          onOk={handleFinalOk}
        />
      )}
    </div>
    </div>
  );
}
