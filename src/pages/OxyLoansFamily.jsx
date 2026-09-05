/**
 * OxyLoansFamily.jsx
 * "Load OxyLoans Data" screen — a single hub for:
 *   • Loading your own OxyLoans data (Add Self)
 *   • Adding a family member via OTP verification
 *   • Viewing all OxyLoans-linked family members
 *   • Setting / changing the Head of Family
 *   • Removing members
 *   • Switching the "active member" for portfolio viewing
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';
import {
  getFamilyMembersForOxyloans,
  addFamilyMemberRequest,
  getOxyloansEncryptKey,
  getOxyloansLenderContactInfo,
  sendOxyloansUlpMobileOtp,
  verifyOxyloansUlpMobileOtp,
  sendOxyloansUlpEmailOtp,
  verifyOxyloansUlpEmailOtp,
  getOxyloansLenderDeals,
  getMigrationOxyloansUserInfo,
} from '../api/afterlogin-user';

// ─────────────────────────────────────────────────────────────────────────────
// Tiny helpers
// ─────────────────────────────────────────────────────────────────────────────
const maskMobile = (m) =>
  m ? `${String(m).slice(0, 2)}${'*'.repeat(Math.max(0, String(m).length - 4))}${String(m).slice(-4)}` : '---';

const maskEmail = (e) => {
  if (!e) return '---';
  const [user, domain] = e.split('@');
  if (!domain) return e;
  return `${user.slice(0, 2)}${'*'.repeat(Math.max(0, user.length - 2))}@${domain}`;
};

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);

// ─────────────────────────────────────────────────────────────────────────────
// OTP Boxes (isolated with memo — digit reset via resetKey)
// ─────────────────────────────────────────────────────────────────────────────
const OtpBoxes = React.memo(function OtpBoxes({ length = 6, resetKey, onChange, disabled }) {
  const inputRefs  = React.useRef(Array.from({ length }, () => React.createRef()));
  const digitsRef  = React.useRef(Array(length).fill(''));
  const onChangeRef = React.useRef(onChange);
  const [focused, setFocused] = useState(-1);
  const [displayKey, setDisplayKey] = useState(0);

  React.useLayoutEffect(() => { onChangeRef.current = onChange; });

  React.useEffect(() => {
    digitsRef.current = Array(length).fill('');
    setDisplayKey(k => k + 1);
    setTimeout(() => inputRefs.current[0]?.current?.focus(), 30);
  }, [resetKey, length]);

  const focusBox = useCallback((i) => {
    const clamped = Math.max(0, Math.min(length - 1, i));
    inputRefs.current[clamped]?.current?.focus();
  }, [length]);

  const handleKeyDown = useCallback((i, e) => {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      const next = [...digitsRef.current];
      next[i] = e.key;
      digitsRef.current = next;
      setDisplayKey(k => k + 1);
      onChangeRef.current(next.join(''));
      if (i < length - 1) focusBox(i + 1);
      else { setFocused(-1); inputRefs.current[i]?.current?.blur(); }
      return;
    }
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...digitsRef.current];
      if (next[i]) { next[i] = ''; digitsRef.current = next; setDisplayKey(k => k + 1); onChangeRef.current(next.join('')); }
      else if (i > 0) { next[i - 1] = ''; digitsRef.current = next; setDisplayKey(k => k + 1); onChangeRef.current(next.join('')); focusBox(i - 1); }
      return;
    }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); focusBox(i - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); focusBox(i + 1); }
  }, [length, focusBox]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const next = Array(length).fill('');
    pasted.split('').forEach((ch, j) => { next[j] = ch; });
    digitsRef.current = next;
    setDisplayKey(k => k + 1);
    onChangeRef.current(next.join(''));
    if (pasted.length >= length) { setFocused(-1); inputRefs.current[length - 1]?.current?.blur(); }
    else focusBox(pasted.length);
  }, [length, focusBox]);

  const digits = digitsRef.current;

  return (
    <div className="flex items-center justify-center gap-2.5">
      {digits.map((digit, i) => {
        const filled = !!digit;
        const active = focused === i && !disabled;
        return (
          <div key={i} className="relative" style={{ width: 44, height: 52 }}>
            <div style={{
              position: 'absolute', inset: -2, borderRadius: 12, zIndex: 0,
              background: filled ? 'linear-gradient(135deg,#2673bb,#35a13e)' : active ? 'linear-gradient(135deg,#2673bb55,#2673bb22)' : 'transparent',
              transition: 'background 0.2s',
            }} />
            <input
              ref={inputRefs.current[i]}
              type="text" inputMode="numeric" readOnly value={digit}
              onKeyDown={e => handleKeyDown(i, e)} onPaste={handlePaste}
              onFocus={() => setFocused(i)} onBlur={() => setFocused(-1)}
              onClick={() => setFocused(i)} disabled={disabled} tabIndex={0}
              className="absolute inset-0 w-full h-full text-center text-xl font-black outline-none rounded-xl select-none"
              style={{
                zIndex: 1,
                background: filled ? 'rgba(38,115,187,0.1)' : 'var(--input-bg)',
                border: `2px solid ${filled ? '#2673bb' : active ? '#2673bb' : 'var(--border)'}`,
                color: 'var(--text-primary)',
                boxShadow: active ? '0 0 0 3px rgba(38,115,187,0.18)' : filled ? '0 0 6px rgba(38,115,187,0.12)' : 'none',
                transform: filled ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.18s',
                cursor: disabled ? 'not-allowed' : 'text',
                caretColor: 'transparent',
              }}
            />
            {filled && (
              <div style={{
                position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)',
                width: 5, height: 5, borderRadius: '50%', zIndex: 2,
                background: 'linear-gradient(135deg,#2673bb,#35a13e)',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Resend countdown timer
// ─────────────────────────────────────────────────────────────────────────────
const ResendTimer = React.memo(function ResendTimer({ seconds, onResend, disabled }) {
  const [left, setLeft] = React.useState(seconds);
  const cb = React.useRef(onResend);
  React.useLayoutEffect(() => { cb.current = onResend; });

  React.useEffect(() => {
    setLeft(seconds);
    const id = setInterval(() => setLeft(p => { if (p <= 1) { clearInterval(id); return 0; } return p - 1; }), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  if (left > 0) return (
    <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
      Resend in <span style={{ color: '#2673bb', fontWeight: 700 }}>{left}s</span>
    </p>
  );
  return (
    <button onClick={() => cb.current?.()} disabled={disabled}
      className="text-xs font-bold mt-2 mx-auto block hover:opacity-80 disabled:opacity-40"
      style={{ color: '#2673bb' }}>
      Resend OTP
    </button>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Step pills
// ─────────────────────────────────────────────────────────────────────────────
function StepPills({ step, steps }) {
  return (
    <div className="flex items-center gap-1 justify-center">
      {steps.map((s, i) => {
        const done = i < step, current = i === step;
        return (
          <React.Fragment key={i}>
            <div className="flex items-center justify-center rounded-full text-xs font-bold transition-all"
              style={{
                width: current ? 26 : 20, height: current ? 26 : 20,
                background: done ? '#35a13e' : current ? '#2673bb' : 'var(--input-bg)',
                color: done || current ? '#fff' : 'var(--text-muted)',
                border: `2px solid ${done ? '#35a13e' : current ? '#2673bb' : 'var(--border)'}`,
                boxShadow: current ? '0 0 8px rgba(38,115,187,0.4)' : 'none',
                transform: current ? 'scale(1.1)' : 'scale(1)', fontSize: 10,
              }}>
              {done
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}><polyline points="20 6 9 17 4 12" /></svg>
                : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, minWidth: 14, maxWidth: 28, borderRadius: 2, background: i < step ? '#35a13e' : 'var(--border)', transition: 'background 0.4s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OTP Verification Modal  (shared for both "Add Self" and "Add Member")
// mode: 'self' | 'addMember'
// ─────────────────────────────────────────────────────────────────────────────
const OL_STEPS = ['Lender ID', 'Mobile OTP', 'Email OTP', 'Preview', 'Done'];

function OtpModal({ mode = 'self', onClose, onConfirm }) {
  const isAddMember = mode === 'addMember';
  const accentColor = isAddMember ? '#35a13e' : '#2673bb';
  const accentRgb   = isAddMember ? '53,161,62' : '38,115,187';

  const [step, setStep]         = useState(0);
  const [lenderId, setLenderId] = useState('');
  const [lenderInfo, setLenderInfo] = useState(null);
  const [autoLoading, setAutoLoading] = useState(!isAddMember);

  // Auto-fetch lenderId for logged-in user in 'self' mode
  useEffect(() => {
    if (isAddMember) return;
    getMigrationOxyloansUserInfo()
      .then(data => {
        const id = data?.lenderId ?? data?.lender_id ?? '';
        if (id) setLenderId(String(id));
      })
      .catch(() => {})
      .finally(() => setAutoLoading(false));
  }, [isAddMember]);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [deals, setDeals]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [resendKey, setResendKey] = useState(0);
  const [mobileOtpDone, setMobileOtpDone] = useState(false);
  const [emailOtpDone,  setEmailOtpDone]  = useState(false);

  // Session state for OTP verification
  const encryptedDataRef  = React.useRef('');
  const mobileOtpRef      = React.useRef('');
  const emailOtpRef       = React.useRef('');
  const mobileSessionRef  = React.useRef('');
  const emailSessionRef   = React.useRef('');
  const emailSaltRef      = React.useRef('');
  // userId for OTP calls — use a stable UUID per session
  const sessionUserIdRef  = React.useRef(crypto.randomUUID?.() ?? '3fa85f64-5717-4562-b3fc-2c963f66afa6');

  const clearError = () => setError('');
  const fmtINR = (n) => n != null ? formatINR(Number(n)) : '—';
  const rawLenderId = () => lenderId.trim().replace(/^LR/i, '');

  const onMobileOtpChange = useCallback((v) => { mobileOtpRef.current = v; setMobileOtpDone(v.length === 6); clearError(); }, []);
  const onEmailOtpChange  = useCallback((v) => { emailOtpRef.current  = v; setEmailOtpDone(v.length === 6);  clearError(); }, []);

  // ── Step 0: get encrypt key → fetch contact info → send mobile OTP ────────
  const handleCheckLender = async () => {
    if (!lenderId.trim()) { setError('Please enter the Lender ID'); return; }
    setLoading(true); clearError();
    try {
      const encKey = await getOxyloansEncryptKey();
      encryptedDataRef.current = encKey;
      const info = await getOxyloansLenderContactInfo(rawLenderId(), encKey);
      setLenderInfo(info);
      // Send mobile OTP
      const otpRes = await sendOxyloansUlpMobileOtp({
        lenderId: rawLenderId(),
        lenderName: info.lenderName ?? info.name ?? '',
        mobileNumber: info.mobileNumber ?? info.mobile ?? '',
        userId: sessionUserIdRef.current,
      });
      mobileSessionRef.current = otpRes?.otpSession ?? otpRes?.sessionId ?? '';
      setStep(1);
    } catch (e) {
      setError(e.message ?? 'Failed to fetch lender info');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 1: verify mobile OTP → send email OTP ────────────────────────────
  const handleVerifyMobile = async () => {
    if (mobileOtpRef.current.replace(/\s/g, '').length < 6) { setError('Enter the 6-digit OTP sent to your mobile'); return; }
    setLoading(true); clearError();
    try {
      await verifyOxyloansUlpMobileOtp({
        mobileNumber: lenderInfo.mobileNumber ?? lenderInfo.mobile ?? '',
        mobileOtp: mobileOtpRef.current,
        otpSession: mobileSessionRef.current,
        userId: sessionUserIdRef.current,
      });
      // Send email OTP
      const emailRes = await sendOxyloansUlpEmailOtp(lenderInfo.email ?? lenderInfo.emailId ?? '',rawLenderId());
      emailSessionRef.current = emailRes?.emailOtpSession ?? emailRes?.sessionId ?? '';
      emailSaltRef.current    = emailRes?.salt ?? '';
      setStep(2);
    } catch (e) {
      setError(e.message ?? 'Mobile OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify email OTP → load profile + deals ──────────────────────
  const handleVerifyEmail = async () => {
    if (emailOtpRef.current.replace(/\s/g, '').length < 6) { setError('Enter the 6-digit OTP sent to your email'); return; }
    setLoading(true); clearError();
    try {
      await verifyOxyloansUlpEmailOtp({
        emailOtp: emailOtpRef.current,
        emailOtpSession: emailSessionRef.current,
        salt: emailSaltRef.current,
        userId: sessionUserIdRef.current,
        lenderId: rawLenderId(),
      });
      // Fetch full profile (contactInfo again) and deals
      const [profile, dealsData] = await Promise.all([
        getOxyloansLenderContactInfo(rawLenderId(), encryptedDataRef.current),
        getOxyloansLenderDeals(rawLenderId(), encryptedDataRef.current),
      ]);
      setPersonalInfo(profile);
      setDeals(Array.isArray(dealsData) ? dealsData : (dealsData?.deals ?? dealsData?.data ?? []));
      setStep(3);
    } catch (e) {
      setError(e.message ?? 'Email OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendMobile = async () => {
    setLoading(true);
    try {
      const otpRes = await sendOxyloansUlpMobileOtp({
        lenderId: rawLenderId(),
        lenderName: lenderInfo?.lenderName ?? '',
        mobileNumber: lenderInfo?.mobileNumber ?? '',
        userId: sessionUserIdRef.current,
      });
      mobileSessionRef.current = otpRes?.otpSession ?? '';
      mobileOtpRef.current = ''; setMobileOtpDone(false); setResendKey(k => k + 1);
    } catch (e) { setError(e.message ?? 'Resend failed'); }
    finally { setLoading(false); }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      const emailRes = await sendOxyloansUlpEmailOtp(lenderInfo?.email ?? '',rawLenderId());
      emailSessionRef.current = emailRes?.emailOtpSession ?? '';
      emailSaltRef.current    = emailRes?.salt ?? '';
      emailOtpRef.current = ''; setEmailOtpDone(false); setResendKey(k => k + 1);
    } catch (e) { setError(e.message ?? 'Resend failed'); }
    finally { setLoading(false); }
  };

  // ── Step 3 → 4: confirm — only save lenderId AFTER user consents ─────────
  const handleConsent = () => {
    localStorage.setItem('oxyloansLenderId', lenderId.trim());
    setStep(4);
    onConfirm?.({ lenderId, lenderInfo, personalInfo, deals, mode });
  };

  const stepTitle = isAddMember
    ? ['Member Lender ID', 'Verify Mobile', 'Verify Email', 'Member Preview', 'Member Added!']
    : ['Your Lender ID', 'Verify Mobile', 'Verify Email', 'Your Portfolio Preview', 'All Set!'];

  const stepSub = [
    isAddMember ? "Enter the family member's OxyLoans Lender ID" : 'Enter your OxyLoans Lender ID to proceed',
`OTP sent to your registered OxyLoans Aggregator mobile number: ${lenderInfo ? maskMobile(lenderInfo.mobileNumber) : '—'}`,
`✓ Mobile verified — now verify your registered OxyLoans Aggregator email: ${lenderInfo ? maskEmail(lenderInfo.email) : '—'}`,
    isAddMember ? "Review member details before adding" : 'Review your details before confirming',
    isAddMember ? 'Member verified and added to your family' : 'Your OxyLoans data is now loaded',
  ];

  // Merged profile fields for step 3 & 4
  const pi = personalInfo ?? lenderInfo ?? {};
  const name    = pi.lenderName ?? pi.name;
  const dob     = pi.dateOfBirth ?? pi.dob;
  const address = pi.address ?? pi.permanentAddress;
  const mobile  = pi.mobileNumber ?? pi.mobile;
  const email   = pi.email ?? pi.emailId;
  const nominee = pi.nomineeName ?? pi.nominee;
  const nomRel  = pi.nomineeRelation ?? pi.nomineeRelationship;
  const nomMob  = pi.nomineeMobile ?? pi.nomineeContact;
  const bankName= pi.bankName;
  const accNo   = pi.accountNumber ?? pi.accNo;
  const ifsc    = pi.ifsc ?? pi.ifscCode;
  const branch  = pi.branch;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="rounded-2xl overflow-hidden w-full flex flex-col"
        style={{
          maxWidth: step === 3 ? 680 : 460,
          maxHeight: '92vh',
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 32px 90px rgba(0,0,0,0.35)',
          transition: 'max-width 0.4s cubic-bezier(0.34,1.2,0.64,1)',
        }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: `rgba(${accentRgb},0.04)` }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `rgba(${accentRgb},0.12)`, border: `1px solid rgba(${accentRgb},0.28)`, color: accentColor, boxShadow: `0 0 16px rgba(${accentRgb},0.2)` }}>
                {isAddMember
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              </div>
              <div>
                <h2 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>{stepTitle[step]}</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{stepSub[step]}</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:scale-110 transition-all flex-shrink-0"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <StepPills step={step} steps={OL_STEPS} />

          {/* ── Verification status strip (shown on steps 1–3) ── */}
          {step >= 1 && step <= 3 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={step >= 2
                  ? { background: 'rgba(53,161,62,0.1)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.28)' }
                  : { background: 'rgba(245,131,17,0.08)', color: '#f58311', border: '1px solid rgba(245,131,17,0.25)' }}>
                {step >= 2
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                Mobile {step >= 2 ? 'Verified' : 'Pending'}
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
              <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={step >= 3
                  ? { background: 'rgba(53,161,62,0.1)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.28)' }
                  : step === 2
                    ? { background: 'rgba(38,115,187,0.1)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.25)' }
                    : { background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {step >= 3
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>
                  : step === 2
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/></svg>}
                Email {step >= 3 ? 'Verified' : step === 2 ? 'Pending' : 'Waiting'}
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {/* Error banner */}
          {error && (
            <div className="mx-6 mt-4 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
              style={{ background: 'rgba(233,83,48,0.08)', color: '#e95330', border: '1px solid rgba(233,83,48,0.22)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* ── STEP 0: Lender ID ── */}
          {step === 0 && (
            <div className="px-6 py-5 grid gap-5">
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {isAddMember ? "Member's OxyLoans Lender ID" : 'Your OxyLoans Lender ID'}
                </label>
                <div className="relative">
                <input autoFocus type="text" value={lenderId}
                  onChange={e => { setLenderId(e.target.value); clearError(); }}
                  onKeyDown={e => e.key === 'Enter' && handleCheckLender()}
                  placeholder={autoLoading ? 'Fetching your Lender ID…' : 'e.g. LR-XXXXXX'}
                  disabled={autoLoading}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all font-mono"
                  style={{ background: 'var(--input-bg)', border: `1px solid ${error ? '#e95330' : 'var(--border)'}`, color: 'var(--text-primary)', letterSpacing: 1 }} />
                {autoLoading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: '#2673bb', borderTopColor: 'transparent' }} />
                )}
              </div>
              </div>
              <div className="px-4 py-3 rounded-xl text-xs"
                style={{ background: `rgba(${accentRgb},0.06)`, border: `1px solid rgba(${accentRgb},0.15)`, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <strong style={{ color: accentColor }}>How it works:</strong>{' '}
                {isAddMember
                  ? "Enter the family member's Lender ID. We verify via mobile & email OTP before linking them."
                  : 'We verify your identity through mobile and email OTP before loading your OxyLoans data.'}
              </div>
              <button onClick={handleCheckLender} disabled={loading || !lenderId.trim()}
                className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                style={{ background: `linear-gradient(135deg,${accentColor},${isAddMember ? '#22c55e' : '#1a5a9e'})`, color: '#fff', boxShadow: `0 4px 16px rgba(${accentRgb},0.35)` }}>
                {loading && <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />}
                {loading ? 'Checking…' : 'Continue'}
                {!loading && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>}
              </button>
            </div>
          )}

          {/* ── STEP 1: Mobile OTP ── */}
          {step === 1 && (
            <div className="px-6 py-5 grid gap-5">
              {lenderInfo && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(53,161,62,0.07)', border: '1px solid rgba(53,161,62,0.2)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                    style={{ background: 'rgba(53,161,62,0.15)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.25)' }}>
                    {(lenderInfo.lenderName ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{lenderInfo.lenderName}</p>
                    <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{maskMobile(lenderInfo.mobileNumber)}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(53,161,62,0.1)', color: '#35a13e', border: '1px solid rgba(53,161,62,0.2)', fontWeight: 700 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
                    Found · Step 1 of 2
                  </div>
                </div>
              )}
              {/* "What's next" hint */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                style={{ background: 'rgba(38,115,187,0.06)', border: '1px solid rgba(38,115,187,0.15)', color: 'var(--text-muted)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#2673bb' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                After mobile verification, you'll verify your <strong style={{ color: '#2673bb' }}>email address</strong> to complete identity confirmation.
              </div>
              <div>
                <p className="text-sm font-semibold text-center mb-4" style={{ color: 'var(--text-primary)' }}>Enter 6-digit Mobile OTP</p>
                <OtpBoxes length={6} resetKey={resendKey} onChange={onMobileOtpChange} disabled={loading} />
                <ResendTimer key={resendKey} seconds={30} onResend={handleResendMobile} disabled={loading} />
              </div>
              <button onClick={handleVerifyMobile} disabled={loading || !mobileOtpDone}
                className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                style={{ background: 'linear-gradient(135deg,#2673bb,#1a5a9e)', color: '#fff', boxShadow: '0 4px 16px rgba(38,115,187,0.35)' }}>
                {loading && <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />}
                {loading ? 'Verifying…' : 'Verify Mobile OTP'}
                {!loading && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>}
              </button>
            </div>
          )}

          {/* ── STEP 2: Email OTP ── */}
          {step === 2 && (
            <div className="px-6 py-5 grid gap-5">
              {/* ── Mobile verified success banner ── */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(53,161,62,0.08)', border: '1px solid rgba(53,161,62,0.3)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(53,161,62,0.15)', border: '1px solid rgba(53,161,62,0.3)', color: '#35a13e' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: '#35a13e' }}>Mobile Number Verified</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {lenderInfo ? maskMobile(lenderInfo.mobileNumber) : '—'} · Now verify your email to continue
                  </p>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0" style={{ color: '#2673bb' }}>
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>

              {/* Email OTP target */}
              {lenderInfo && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(38,115,187,0.07)', border: '1px solid rgba(38,115,187,0.2)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(38,115,187,0.15)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.25)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>OTP sent to</p>
                    <p className="text-sm font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{maskEmail(lenderInfo.email)}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(38,115,187,0.1)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.2)', fontWeight: 700 }}>
                    Step 2 of 2
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-center mb-4" style={{ color: 'var(--text-primary)' }}>Enter 6-digit Email OTP</p>
                <OtpBoxes length={6} resetKey={resendKey} onChange={onEmailOtpChange} disabled={loading} />
                <ResendTimer key={resendKey} seconds={30} onResend={handleResendEmail} disabled={loading} />
              </div>
              <button onClick={handleVerifyEmail} disabled={loading || !emailOtpDone}
                className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                style={{ background: 'linear-gradient(135deg,#2673bb,#1a5a9e)', color: '#fff', boxShadow: '0 4px 16px rgba(38,115,187,0.35)' }}>
                {loading && <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />}
                {loading ? 'Verifying…' : 'Verify Email OTP'}
                {!loading && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>}
              </button>
            </div>
          )}

          {/* ── STEP 3: Preview ── */}
          {step === 3 && (
            <div className="px-6 py-5 grid gap-5">
              {/* Personal details */}
              {personalInfo && (
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(38,115,187,0.2)' }}>
                  <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'rgba(38,115,187,0.08)', borderBottom: '1px solid rgba(38,115,187,0.15)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: '#2673bb' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2673bb' }}>Personal Details</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {[
                      { label: 'Full Name',    value: name    },
                      { label: 'Date of Birth',value: dob     },
                      { label: 'Mobile',       value: mobile  ? maskMobile(mobile)  : null },
                      { label: 'Email',        value: email   ? maskEmail(email)    : null },
                      { label: 'Address',      value: address, full: true },
                    ].filter(f => f.value).map(f => (
                      <div key={f.label} className={f.full ? 'col-span-2' : ''}>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>{f.value}</p>
                      </div>
                    ))}
                  </div>
                  {/* Nominee */}
                  {nominee && (
                    <>
                      <div className="px-4 py-2 flex items-center gap-2" style={{ background: 'rgba(147,51,234,0.06)', borderTop: '1px solid rgba(147,51,234,0.12)', borderBottom: '1px solid rgba(147,51,234,0.12)' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: '#9333ea' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9333ea' }}>Nominee</span>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-3">
                        {[{ label: 'Nominee Name', value: nominee }, { label: 'Relationship', value: nomRel }, { label: 'Mobile', value: nomMob }].filter(f => f.value).map(f => (
                          <div key={f.label}>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                            <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{f.value}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {/* Bank */}
                  {(bankName || accNo || ifsc) && (
                    <>
                      <div className="px-4 py-2 flex items-center gap-2" style={{ background: 'rgba(53,161,62,0.06)', borderTop: '1px solid rgba(53,161,62,0.12)', borderBottom: '1px solid rgba(53,161,62,0.12)' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: '#35a13e' }}><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#35a13e' }}>Bank Details</span>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-3">
                        {[{ label: 'Bank Name', value: bankName }, { label: 'Account No.', value: accNo }, { label: 'IFSC', value: ifsc }, { label: 'Branch', value: branch }].filter(f => f.value).map(f => (
                          <div key={f.label}>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                            <p className="text-sm font-semibold font-mono mt-0.5" style={{ color: 'var(--text-primary)' }}>{f.value}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Deals table */}
              {deals.length > 0 && (
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(245,131,17,0.2)' }}>
                  <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: 'rgba(245,131,17,0.08)', borderBottom: '1px solid rgba(245,131,17,0.15)' }}>
                    <div className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: '#f58311' }}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#f58311' }}>OxyLoans Deals</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: 'rgba(245,131,17,0.12)', color: '#f58311', border: '1px solid rgba(245,131,17,0.25)' }}>{deals.length} deal{deals.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--table-header-bg,var(--input-bg))' }}>
                          {['Deal Name', 'Amount', 'ROI', 'Status', 'Date'].map(h => (
                            <th key={h} className="text-left py-2.5 px-3 uppercase tracking-wider font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {deals.map((d, i) => {
                          const status = d.dealStatus ?? d.status ?? 'Active';
                          const sc = status === 'Active' ? '#35a13e' : status === 'Closed' ? '#2673bb' : '#f58311';
                          return (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td className="py-2.5 px-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{d.dealName ?? `Deal ${i + 1}`}</td>
                              <td className="py-2.5 px-3 font-bold tabular-nums" style={{ color: '#2673bb' }}>{fmtINR(d.participationAmount ?? d.loanAmount ?? d.amount)}</td>
                              <td className="py-2.5 px-3"><span className="font-black" style={{ color: '#f58311' }}>{d.roi ?? d.rateOfInterest ?? '—'}%</span></td>
                              <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full font-bold text-xs" style={{ background: `${sc}12`, color: sc, border: `1px solid ${sc}25` }}>{status}</span></td>
                              <td className="py-2.5 px-3" style={{ color: 'var(--text-muted)' }}>{d.participationDate ?? '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Consent + actions */}
              <div className="rounded-2xl p-4" style={{ background: 'rgba(245,131,17,0.05)', border: '1px solid rgba(245,131,17,0.18)' }}>
                <div className="flex items-start gap-2.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#f58311' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    By clicking <strong style={{ color: 'var(--text-primary)' }}>Confirm &amp; {isAddMember ? 'Add Member' : 'Load Data'}</strong>, you consent to {isAddMember ? 'link this member to your OxyLoans family group.' : 'display your OxyLoans lending data in this dashboard.'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>Cancel</button>
                <button onClick={handleConsent}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.02]"
                  style={{ background: `linear-gradient(135deg,${accentColor},${isAddMember ? '#22c55e' : '#1a5a9e'})`, color: '#fff', boxShadow: `0 4px 16px rgba(${accentRgb},0.35)` }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
                  Confirm &amp; {isAddMember ? 'Add Member' : 'Load Data'}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Done ── */}
          {step === 4 && (() => {
            const hasProfile = name || dob || address;
            const hasNominee = nominee;
            const hasBank    = bankName || accNo || ifsc;
            return (
              <div className="px-6 py-6 flex flex-col gap-5">
                <div className="flex flex-col items-center gap-3 text-center pt-2">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg,rgba(${accentRgb},0.2),rgba(${accentRgb},0.06))`, border: `2px solid rgba(${accentRgb},0.4)`, boxShadow: `0 0 28px rgba(${accentRgb},0.25)` }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                      {isAddMember ? 'Member Added!' : 'Identity Verified!'}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                      {isAddMember ? 'The member has been verified and linked to your OxyLoans family.' : 'Your OxyLoans data has been loaded successfully.'}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center gap-6 px-5 py-3 rounded-2xl"
                  style={{ background: `rgba(${accentRgb},0.07)`, border: `1px solid rgba(${accentRgb},0.2)` }}>
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: accentColor }}>Lender ID</p>
                    <p className="text-lg font-extrabold font-mono" style={{ color: 'var(--text-primary)' }}>{lenderId || '—'}</p>
                  </div>
                  <div className="w-px h-8" style={{ background: `rgba(${accentRgb},0.2)` }} />
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#2673bb' }}>Deals</p>
                    <p className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{deals.length}</p>
                  </div>
                  <div className="w-px h-8" style={{ background: `rgba(${accentRgb},0.2)` }} />
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#f58311' }}>Invested</p>
                    <p className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>
                      {fmtINR(deals.reduce((s, d) => s + Number(d.participationAmount ?? 0), 0))}
                    </p>
                  </div>
                </div>

                {/* Personal details */}
                {hasProfile && (
                  <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(38,115,187,0.2)' }}>
                    <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'rgba(38,115,187,0.08)', borderBottom: '1px solid rgba(38,115,187,0.15)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: '#2673bb' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2673bb' }}>Personal Details</span>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3">
                      {[
                        { label: 'Full Name',    value: name    },
                        { label: 'Date of Birth',value: dob     },
                        { label: 'Mobile',       value: mobile  ? maskMobile(mobile)  : null },
                        { label: 'Email',        value: email   ? maskEmail(email)    : null },
                        { label: 'Address',      value: address, full: true },
                      ].filter(f => f.value).map(f => (
                        <div key={f.label} className={f.full ? 'col-span-2' : ''}>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                          <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>{f.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Nominee */}
                {hasNominee && (
                  <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(147,51,234,0.2)' }}>
                    <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'rgba(147,51,234,0.07)', borderBottom: '1px solid rgba(147,51,234,0.15)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: '#9333ea' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9333ea' }}>Nominee Details</span>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3">
                      {[{ label: 'Nominee Name', value: nominee }, { label: 'Relationship', value: nomRel }, { label: 'Mobile', value: nomMob }].filter(f => f.value).map(f => (
                        <div key={f.label}>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                          <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{f.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Bank */}
                {hasBank && (
                  <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(53,161,62,0.2)' }}>
                    <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'rgba(53,161,62,0.07)', borderBottom: '1px solid rgba(53,161,62,0.15)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: '#35a13e' }}><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#35a13e' }}>Bank Details</span>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3">
                      {[{ label: 'Bank Name', value: bankName }, { label: 'Account No.', value: accNo }, { label: 'IFSC', value: ifsc }, { label: 'Branch', value: branch }].filter(f => f.value).map(f => (
                        <div key={f.label}>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                          <p className="text-sm font-semibold font-mono mt-0.5" style={{ color: 'var(--text-primary)' }}>{f.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={onClose}
                  className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
                  style={{ background: `linear-gradient(135deg,${accentColor},${isAddMember ? '#22c55e' : '#1a5a9e'})`, color: '#fff', boxShadow: `0 4px 16px rgba(${accentRgb},0.35)` }}>
                  {isAddMember ? 'Done' : 'Close'}
                </button>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Member card — used in the family grid
// ─────────────────────────────────────────────────────────────────────────────
function MemberCard({ member, isHead, isSelf, isSelected, onSelect, onSetHead, onRemove }) {
  const [settingHead,   setSettingHead]   = useState(false);
  const [confirming,    setConfirming]    = useState(false);
  const [removing,      setRemoving]      = useState(false);
  const [toast,         setToast]         = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSetHead = async () => {
    setSettingHead(true);
    const res = await onSetHead(member.id);
    setSettingHead(false);
    if (res?.success) showToast('Set as Head of Family'); else showToast(res?.error ?? 'Failed', 'error');
  };

  const handleRemove = async () => {
    setConfirming(false); setRemoving(true);
    const res = await onRemove(member.id);
    setRemoving(false);
    if (!res?.success) showToast(res?.error ?? 'Failed to remove', 'error');
  };

  const borderColor = isHead ? 'rgba(245,131,17,0.45)' : isSelected ? 'rgba(99,102,241,0.5)' : 'var(--border)';
  const bgGrad = isHead
    ? 'linear-gradient(135deg,rgba(245,131,17,0.1),rgba(245,131,17,0.03))'
    : isSelected
      ? 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(99,102,241,0.03))'
      : 'var(--surface-card)';

  const avatarBg    = isHead ? 'rgba(245,131,17,0.18)' : 'rgba(99,102,241,0.12)';
  const avatarColor = isHead ? '#f58311' : '#818cf8';
  const avatarBorder= isHead ? 'rgba(245,131,17,0.35)' : 'rgba(99,102,241,0.25)';

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 transition-all"
      style={{ background: bgGrad, border: `1.5px solid ${borderColor}`, boxShadow: isHead ? '0 0 0 3px rgba(245,131,17,0.08)' : isSelected ? '0 0 0 3px rgba(99,102,241,0.08)' : 'none', opacity: removing ? 0.5 : 1 }}>

      {toast && (
        <div className="px-3 py-2 rounded-xl text-xs font-semibold"
          style={{ background: toast.type === 'error' ? 'rgba(233,83,48,0.08)' : 'rgba(53,161,62,0.08)', color: toast.type === 'error' ? '#e95330' : '#35a13e', border: `1px solid ${toast.type === 'error' ? 'rgba(233,83,48,0.2)' : 'rgba(53,161,62,0.2)'}` }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-extrabold flex-shrink-0"
            style={{ background: avatarBg, color: avatarColor, border: `2px solid ${avatarBorder}` }}>
            {(member.name ?? '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{member.name ?? '—'}</p>
              {isSelf && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>You</span>}
            </div>
            {member.relation && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{member.relation}</p>}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {isHead && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold"
              style={{ background: 'rgba(245,131,17,0.15)', color: '#f58311', border: '1px solid rgba(245,131,17,0.3)' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M2 20h20v2H2zM4 18l4-10 4 4 4-8 4 10H4z"/></svg>
              Head
            </span>
          )}
          {/* Active viewer selector */}
          <button onClick={() => onSelect(member.id)}
            className="text-xs px-2.5 py-1 rounded-full font-semibold transition-all hover:opacity-80"
            style={isSelected
              ? { background: 'rgba(99,102,241,0.2)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.4)' }
              : { background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            {isSelected ? '● Viewing' : 'View'}
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
        {member.lrId    && <span className="font-mono" style={{ color: '#f58311' }}>🪪 {member.lrId}</span>}
        {member.phone   && <span>📱 {maskMobile(member.phone)}</span>}
        {member.email   && <span className="truncate">📧 {maskEmail(member.email)}</span>}
      </div>

      {/* Head note */}
      {isHead && (
        <p className="text-xs px-3 py-2 rounded-xl"
          style={{ background: 'rgba(245,131,17,0.07)', color: 'var(--text-muted)', border: '1px solid rgba(245,131,17,0.15)' }}>
          All OxyLoans support queries from this family are directed to this member.
        </p>
      )}

      {/* Actions */}
      {!isSelf && (
        <div className="flex gap-2 flex-wrap">
          {!isHead && (
            <button onClick={handleSetHead} disabled={settingHead || removing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'rgba(245,131,17,0.1)', color: '#f58311', border: '1px solid rgba(245,131,17,0.28)' }}>
              {settingHead
                ? <span className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#f58311', borderTopColor: 'transparent' }} />
                : <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M2 20h20v2H2zM4 18l4-10 4 4 4-8 4 10H4z"/></svg>}
              {settingHead ? 'Setting…' : 'Set as Head'}
            </button>
          )}
          {!isHead && (confirming
            ? (
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Remove?</span>
                <button onClick={handleRemove} disabled={removing}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-50"
                  style={{ background: '#e95330' }}>
                  {removing ? 'Removing…' : 'Yes'}
                </button>
                <button onClick={() => setConfirming(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold hover:opacity-80"
                  style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirming(true)} disabled={removing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'rgba(233,83,48,0.08)', color: '#e95330', border: '1px solid rgba(233,83,48,0.2)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                Remove
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function OxyLoansFamily() {
  const {
    oxyloansMembers, oxyMembersLoading,
    headOfFamilyId,
    refreshOxyloansMembers, setHeadOfFamily, removeOxyFamilyMember,
    selectedMemberId, setSelectedMemberId,
    selfMemberId,
  } = useFamily();

  const [modal,       setModal]       = useState(null); // null | 'self' | 'addMember'
  const [toast,       setToast]       = useState(null);
  const [search,      setSearch]      = useState('');

  // Migration / OxyLoans connection state (mirrors dashboard logic)
  const [migrationInfo,    setMigrationInfo]    = useState(null);
  const [migrationChecked, setMigrationChecked] = useState(false);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  // On mount: fetch oxyloans-members AND check migration info in parallel.
  // Migration info is the source of truth for whether the user is "connected"
  // — it is set by the dashboard's OTP flow even when addFamilyMemberRequest
  // was never called, so we always need it as a fallback.
  useEffect(() => {
    refreshOxyloansMembers();
    getMigrationOxyloansUserInfo()
      .then(info => setMigrationInfo(info ?? null))
      .catch(() => setMigrationInfo(null))
      .finally(() => setMigrationChecked(true));
  }, [refreshOxyloansMembers]);

  // Derived OxyLoans connection flags (same logic as UnifiedDashboard)
  const migrationLenderId = migrationInfo?.lenderId ?? migrationInfo?.lender_id ?? null;
  const mobileVerified    = !!migrationInfo?.mobileNumberVerified;
  const emailVerified     = !!migrationInfo?.emailVerified;
  const bothVerified      = mobileVerified && emailVerified;
  const oxyloansConnected = migrationChecked && !!migrationLenderId && bothVerified;

  // When the user is connected via the dashboard OTP flow but
  // /user-service/family/oxyloans-members returns no records yet (because
  // addFamilyMemberRequest was never called from the dashboard), synthesize a
  // self-member entry from migration info so something always shows on screen.
  const syntheticSelf = React.useMemo(() => {
    if (!oxyloansConnected) return null;
    if (oxyloansMembers.length > 0) return null; // real data available — no need
    return {
      id:           '__self__',
      name:         migrationInfo?.userName  ?? 'You',
      lrId:         migrationLenderId ? `LR${migrationLenderId}` : '—',
      phone:        migrationInfo?.mobileNumber ?? null,
      email:        migrationInfo?.email  ?? null,
      relation:     'Self',
      isSelf:       true,
      isHeadOfFamily: false,
      activeDeals:  0,
      totalInvested: 0,
    };
  }, [oxyloansConnected, oxyloansMembers.length, migrationInfo, migrationLenderId]);

  // Merged list: real members first, synthetic self appended only when needed
  const displayMembers = React.useMemo(
    () => syntheticSelf ? [syntheticSelf] : oxyloansMembers,
    [syntheticSelf, oxyloansMembers]
  );

  const handleConfirm = async ({ lenderId, lenderInfo, mode }) => {
    if (mode === 'addMember') {
      try {
        await addFamilyMemberRequest({ lrId: lenderId, relation: 'Family Member' });
      } catch { /* silently fall through */ }
    } else {
      // Register self as an OxyLoans member on the backend so the family
      // members API returns this user's entry after the modal completes.
      try {
        await addFamilyMemberRequest({ lrId: lenderId, relation: 'Self' });
      } catch { /* silently fall through */ }
      if (lenderId) localStorage.setItem('oxyloansLenderId', lenderId);
    }
    // Refresh both oxyloans members and migration info after any confirmation
    await refreshOxyloansMembers();
    getMigrationOxyloansUserInfo()
      .then(info => setMigrationInfo(info ?? null))
      .catch(() => {});
    showToast(mode === 'addMember' ? 'Family member verified and linked!' : 'Your OxyLoans data loaded!');
    setModal(null);
  };

  const filtered = displayMembers.filter(m =>
    !search ||
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.lrId?.toLowerCase().includes(search.toLowerCase()) ||
    m.relation?.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search)
  );

  const head = displayMembers.find(m => m.id === headOfFamilyId || m.isHeadOfFamily);
  const totalInvested = displayMembers.reduce((s, m) => s + Number(m.totalInvested ?? 0), 0);

  return (
    <div className="grid gap-6">
      {/* OTP Modal */}
      {modal && (
        <OtpModal
          mode={modal}
          onClose={() => setModal(null)}
          onConfirm={handleConfirm}
        />
      )}

      {/* Page toast */}
      {toast && (
        <div className="fixed top-20 right-5 z-40 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2.5 shadow-xl"
          style={{ background: toast.type === 'error' ? 'rgba(233,83,48,0.96)' : 'rgba(53,161,62,0.96)', color: '#fff', border: `1px solid ${toast.type === 'error' ? '#e95330' : '#35a13e'}` }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            {toast.type === 'error'
              ? <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
              : <polyline points="20 6 9 17 4 12"/>}
          </svg>
          {toast.msg}
        </div>
      )}

      {/* ── Page header ── */}
      <div className="rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ background: 'linear-gradient(135deg,rgba(38,115,187,0.12),rgba(38,115,187,0.04))', border: '1px solid rgba(38,115,187,0.25)' }}>
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(38,115,187,0.15)', border: '1px solid rgba(38,115,187,0.3)', color: '#2673bb', boxShadow: '0 0 20px rgba(38,115,187,0.2)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#2673bb' }}>OxyLoans</p>
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Load OxyLoans Data</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage your OxyLoans family, set portfolio viewer, and control head-of-family designation</p>
          </div>
        </div>

        {/* CTA buttons + connection status */}
        <div className="flex gap-3 flex-shrink-0 flex-wrap items-center">
          {/* Still checking */}
          {!migrationChecked && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(245,131,17,0.08)', color: '#f58311', border: '1px solid rgba(245,131,17,0.2)' }}>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#f58311', borderTopColor: 'transparent' }} />
              Checking…
            </div>
          )}
         {!migrationChecked && !oxyloansConnected && (
          <button onClick={() => setModal('self')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,#2673bb,#1a5a9e)', color: '#fff', boxShadow: '0 4px 14px rgba(38,115,187,0.35)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {oxyloansConnected ? 'Re-connect Self' : 'Add Self'}
          </button>
         )}
          <button onClick={() => setModal('addMember')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,#35a13e,#22c55e)', color: '#fff', boxShadow: '0 4px 14px rgba(53,161,62,0.35)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
            Add Family Member
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Family Members', value: oxyMembersLoading ? '…' : displayMembers.length, color: '#2673bb', icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>,    },
          { label: 'Head of Family',  value: head?.name ?? '—',                               color: '#f58311', icon: <path d="M2 20h20v2H2zM4 18l4-10 4 4 4-8 4 10H4z"/>, fill: true },
          { label: 'Active Deals',    value: oxyMembersLoading ? '…' : displayMembers.reduce((s, m) => s + (m.activeDeals ?? 0), 0), color: '#35a13e', icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/> },
          { label: 'Total Invested',  value: oxyMembersLoading ? '…' : (totalInvested > 0 ? formatINR(totalInvested) : '—'), color: '#9333ea', icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></> },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: 'var(--surface-card)', border: `1px solid ${s.color}28` }}>
            <div className="flex items-center gap-2 mb-2">
              <svg viewBox="0 0 24 24" fill={s.fill ? 'currentColor' : 'none'} stroke={s.fill ? 'none' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0" style={{ color: s.color }}>
                {s.icon}
              </svg>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: s.color }}>{s.label}</p>
            </div>
            <p className="text-xl font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── How it works info banner ── */}
      <div className="rounded-2xl px-5 py-4 flex items-start gap-4"
        style={{ background: 'rgba(245,131,17,0.05)', border: '1px solid rgba(245,131,17,0.18)' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#f58311' }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          <strong style={{ color: '#f58311' }}>How it works:</strong>{' '}
          Use <strong style={{ color: 'var(--text-primary)' }}>Add Self</strong> to link your own OxyLoans account — this loads your personal portfolio, nominee, and bank details.
          Use <strong style={{ color: 'var(--text-primary)' }}>Add Family Member</strong> to link a family member via their Lender ID and OTP verification.
          The <strong style={{ color: '#f58311' }}>Head of Family</strong> is the primary contact for all OxyLoans support queries raised by this group.
          Use the <strong style={{ color: '#818cf8' }}>View</strong> button on a member card to switch which member's portfolio you are seeing on the dashboard.
        </div>
      </div>

      {/* ── Member grid ── */}
      <div className="grid gap-4">
        {/* Section header + search */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#2673bb' }}>OxyLoans Family</p>
            <h2 className="text-base font-extrabold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              Linked Members
              {!oxyMembersLoading && (
                <span className="ml-2 text-sm font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(38,115,187,0.1)', color: '#2673bb', border: '1px solid rgba(38,115,187,0.2)' }}>
                  {displayMembers.length}
                </span>
              )}
            </h2>
          </div>
          {displayMembers.length > 0 && (
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, LR ID, relation…"
              className="px-3 py-2 rounded-xl text-sm outline-none w-56"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          )}
        </div>

        {/* Loading — show spinner while either check is in flight */}
        {(oxyMembersLoading || !migrationChecked) && displayMembers.length === 0 && (
          <div className="flex items-center justify-center gap-3 py-16 rounded-2xl"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <span className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#2673bb', borderTopColor: 'transparent' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading OxyLoans family members…</span>
          </div>
        )}

        {/* Empty state — only show when check done, not connected, and no members */}
        {!oxyMembersLoading && displayMembers.length === 0 && migrationChecked && (
          <div className="rounded-2xl py-16 flex flex-col items-center gap-4 text-center"
            style={{ background: 'var(--surface-card)', border: '1px dashed var(--border)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(38,115,187,0.1)', border: '1px solid rgba(38,115,187,0.2)', color: '#2673bb' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>No OxyLoans members yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Add yourself or a family member to get started</p>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setModal('self')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#2673bb,#1a5a9e)', color: '#fff', boxShadow: '0 4px 14px rgba(38,115,187,0.3)' }}>
                Add Self
              </button>
              <button onClick={() => setModal('addMember')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#35a13e,#22c55e)', color: '#fff', boxShadow: '0 4px 14px rgba(53,161,62,0.3)' }}>
                Add Family Member
              </button>
            </div>
          </div>
        )}

        {/* Member cards grid */}
        {!oxyMembersLoading && filtered.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(m => (
              <MemberCard
                key={m.id}
                member={m}
                isHead={m.id === headOfFamilyId || m.isHeadOfFamily}
                isSelf={m.id === selfMemberId || m.relation === 'Self' || m.isSelf === true}
                isSelected={selectedMemberId === m.id || (selectedMemberId === 'self' && (m.id === selfMemberId || m.relation === 'Self' || m.isSelf === true))}
                onSelect={(id) => setSelectedMemberId(id)}
                onSetHead={setHeadOfFamily}
                onRemove={removeOxyFamilyMember}
              />
            ))}
          </div>
        )}

        {/* No search results */}
        {!oxyMembersLoading && displayMembers.length > 0 && filtered.length === 0 && (
          <div className="rounded-2xl py-10 text-center" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No members match "{search}"</p>
          </div>
        )}
      </div>

      {/* ── Animations ── */}
      <style>{`
        @keyframes olFadeUp {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
