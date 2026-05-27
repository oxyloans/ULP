import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { sendMobileOtp, signUp } from '../api/beforelogin';
import logo from '../assets/ULP12.png';

// ─── Icons ────────────────────────────────────────────────────────────────────
const UserIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const PhoneIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const LockIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const EyeIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const GiftIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;
const MoonIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const SunIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const TrendUp    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const CheckIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="20 6 9 17 4 12"/></svg>;

const Logo = ({ size = 32 }) => (
  <svg viewBox="0 0 40 40" fill="none" style={{ width: size, height: size }}>
    <circle cx="20" cy="20" r="20" fill="rgba(255,255,255,0.15)" />
    <path d="M20 6L34 32H6L20 6Z" fill="white" opacity="0.95" />
    <path d="M20 14L28 30H12L20 14Z" fill="#1e3a8a" opacity="0.5" />
  </svg>
);

const injectStyles = () => {
  if (typeof document !== 'undefined' && !document.getElementById('login-styles')) {
    const s = document.createElement('style');
    s.id = 'login-styles';
    s.innerHTML = `
      @keyframes floatUp   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
      @keyframes floatDown { 0%,100%{transform:translateY(0)} 50%{transform:translateY(12px)} }
      @keyframes fadeSlideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes overlayIn { from{opacity:0} to{opacity:1} }
      @keyframes textPop { from{opacity:0;transform:translateY(12px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
      .bar-float  { animation: floatUp   5s ease-in-out infinite; }
      .coin-float { animation: floatDown 4s ease-in-out infinite; }
      .fade-in    { animation: fadeSlideIn 0.6s ease forwards; }
      .fade-in-1  { animation: fadeSlideIn 0.6s 0.1s ease both; }
      .fade-in-2  { animation: fadeSlideIn 0.6s 0.2s ease both; }
      .fade-in-3  { animation: fadeSlideIn 0.6s 0.3s ease both; }
      .tw-cursor  { animation: blink 0.75s step-end infinite; }
      .overlay-in { animation: overlayIn 0.35s ease forwards; }
      .text-pop   { animation: textPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      .neu-outer { box-shadow: 20px 20px 40px #c8cdd6, -20px -20px 40px #ffffff; }
      .neu-inner { box-shadow: inset 5px 5px 10px #d1d5db, inset -5px -5px 10px #ffffff; }
      .neu-pill  { box-shadow: 5px 5px 12px #d1d5db, -5px -5px 12px #ffffff; }
      .d-neu-outer { box-shadow: 18px 18px 36px #0b0d12, -18px -18px 36px #1e2330; }
      .d-neu-inner { box-shadow: inset 5px 5px 10px #0b0d12, inset -5px -5px 10px #1e2330; }
      .d-neu-pill  { box-shadow: 5px 5px 12px #0b0d12, -5px -5px 12px #1e2330; }
      .neu-input-focus:focus { outline:none; box-shadow:inset 4px 4px 8px #d1d5db,inset -4px -4px 8px #ffffff,0 0 0 2.5px #3b82f6; }
      .d-neu-input-focus:focus { outline:none; box-shadow:inset 4px 4px 8px #0b0d12,inset -4px -4px 8px #1e2330,0 0 0 2.5px #3b82f6; }
      .pw-strength-bar { transition: width 0.35s ease, background 0.35s ease; }
    `;
    document.head.appendChild(s);
  }
};

// ─── Password strength ────────────────────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return { label: '', color: '#e5e7eb', pct: 0 };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)) score++;
  if (score <= 1) return { label: 'Weak',        color: '#ef4444', pct: 20  };
  if (score <= 2) return { label: 'Fair',        color: '#f59e0b', pct: 45  };
  if (score <= 3) return { label: 'Good',        color: '#3b82f6', pct: 65  };
  if (score <= 4) return { label: 'Strong',      color: '#10b981', pct: 85  };
  return               { label: 'Very Strong',  color: '#10b981', pct: 100 };
}

// ─── OTP boxes ────────────────────────────────────────────────────────────────
function OtpBoxes({ value, onChange, inputBg, textC, innerShadow }) {
  const inputRefs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const focus = (i) => inputRefs.current[i]?.focus();

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const arr = [...digits];
      if (arr[i]) { arr[i] = ''; onChange(arr.join('')); }
      else if (i > 0) { arr[i - 1] = ''; onChange(arr.join('')); focus(i - 1); }
      return;
    }
    if (e.key === 'ArrowLeft'  && i > 0) { focus(i - 1); return; }
    if (e.key === 'ArrowRight' && i < 5) { focus(i + 1); return; }
    if (!/^\d$/.test(e.key)) return;
    e.preventDefault();
    const arr = [...digits];
    arr[i] = e.key;
    onChange(arr.join(''));
    if (i < 5) focus(i + 1);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6).trimEnd());
    focus(Math.min(pasted.length, 5));
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={() => {}}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`rounded-xl text-center text-lg font-black ${innerShadow}`}
          style={{
            width: 44, height: 52,
            background: inputBg,
            color: textC,
            border: d ? '2px solid #3b82f6' : 'none',
            outline: 'none',
          }}
        />
      ))}
    </div>
  );
}

// ─── Left decorative panel (same as Login) ────────────────────────────────────
function LeftPanel() {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] flex flex-col w-full lg:w-[380px] flex-shrink-0 fade-in"
      style={{
        background: 'linear-gradient(145deg,#1e3a8a 0%,#1e40af 40%,#312e81 100%)',
        minHeight: 460, padding: '2rem',
        boxShadow: '20px 20px 40px rgba(0,0,0,0.3)',
      }}>
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.06)', filter: 'blur(1px)' }} />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'rgba(99,102,241,0.25)', filter: 'blur(2px)' }} />

      <div className="relative z-10 flex items-center gap-3 mb-6">
        <img src={logo} alt="Oxy Portfolio" className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          style={{ background: '#fff', boxShadow: '0 0 12px rgba(255,255,255,0.25)' }} />
        <div>
          <p className="text-white font-black text-base tracking-wide leading-none letter-spacing-[0.3em]">ULP</p>
          <p className="text-blue-300 text-xs font-medium mt-0.5 opacity-80">Financial Intelligence Platform</p>
        </div>
      </div>

      <div className="relative z-10 mb-6">
        <h1 className="text-2xl font-extrabold text-white leading-tight mb-2">
          Start Your<br />
          <span style={{ color: '#93c5fd' }}>Financial Journey</span>
        </h1>
        <p className="text-blue-200 text-xs font-medium leading-relaxed opacity-85">
          Join thousands of investors managing<br />their portfolio with confidence.
        </p>
      </div>

      {/* 3D bars */}
      <div className="relative z-10 flex items-end justify-center gap-4 fade-in-2" style={{ height: 140 }}>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[240px] h-7 rounded-[100%]"
          style={{ background: 'rgba(0,0,0,0.3)', filter: 'blur(14px)' }} />
        <div className="relative rounded-[14px]"
          style={{ width: 52, height: 80, background: 'linear-gradient(160deg,#93c5fd 0%,#3b82f6 50%,#1d4ed8 100%)', boxShadow: 'inset 4px 4px 8px rgba(255,255,255,0.3),8px 16px 28px rgba(29,78,216,0.5)' }}>
          <div className="absolute top-2 left-2 w-2.5 h-7 rounded-full opacity-40" style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.8),transparent)' }} />
        </div>
        <div className="relative rounded-[14px] bar-float flex flex-col items-center pt-3"
          style={{ width: 52, height: 125, background: 'linear-gradient(160deg,#6ee7b7 0%,#10b981 50%,#047857 100%)', boxShadow: 'inset 4px 4px 8px rgba(255,255,255,0.3),8px 16px 28px rgba(4,120,87,0.5)' }}>
          <div className="absolute top-2 left-2 w-2.5 h-7 rounded-full opacity-40" style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.8),transparent)' }} />
          <div className="text-white drop-shadow-lg"><TrendUp /></div>
        </div>
        <div className="relative rounded-[14px]"
          style={{ width: 52, height: 100, background: 'linear-gradient(160deg,#c4b5fd 0%,#8b5cf6 50%,#5b21b6 100%)', boxShadow: 'inset 4px 4px 8px rgba(255,255,255,0.3),8px 16px 28px rgba(91,33,182,0.5)' }}>
          <div className="absolute top-2 left-2 w-2.5 h-7 rounded-full opacity-40" style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.8),transparent)' }} />
        </div>
        <div className="absolute coin-float flex items-center justify-center rounded-full"
          style={{ width: 42, height: 42, top: -4, right: 'calc(50% - 108px)', background: 'linear-gradient(145deg,#fef08a,#fbbf24,#d97706,#92400e)', boxShadow: 'inset 3px 3px 6px rgba(255,255,255,0.5),5px 10px 18px rgba(217,119,6,0.55)' }}>
          <span className="text-white font-black text-xl" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>$</span>
        </div>
      </div>

      {/* Benefits */}
      <div className="relative z-10 flex flex-col gap-2 mt-auto pt-5">
        {[
          { emoji: '📈', text: 'Track portfolio performance in real-time' },
          { emoji: '🔒', text: 'Bank-grade security & encryption' },
          { emoji: '👨‍👩‍👧', text: 'Manage family investments together' },
          { emoji: '💰', text: 'Earn returns on SD Lot deals' },
        ].map(b => (
          <div key={b.text} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-base">{b.emoji}</span>
            <span className="text-xs font-semibold text-white opacity-90">{b.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Register component ──────────────────────────────────────────────────
export default function Register() {
  useEffect(() => injectStyles(), []);

  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const dark = theme === 'dark';

  // ── Design tokens (mirrors Login) ──────────────────────────────────────────
  const pageBg      = dark ? '#13172a' : '#eef0f5';
  const cardBg      = dark ? '#1a1f30' : '#ffffff';
  const inputBg     = dark ? '#0f1220' : '#eef0f5';
  const headingC    = dark ? '#93c5fd' : '#1e3a8a';
  const subC        = dark ? '#94a3b8' : '#64748b';
  const textC       = dark ? '#e2e8f0' : '#1e293b';
  const iconC       = dark ? '#64748b' : '#94a3b8';
  const outerShadow = dark ? 'd-neu-outer' : 'neu-outer';
  const innerShadow = dark ? 'd-neu-inner d-neu-input-focus' : 'neu-inner neu-input-focus';
  const pillShadow  = dark ? 'd-neu-pill'  : 'neu-pill';

  // ── Form state ─────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1); // 1 = details+OTP, 2 = success
  const [otpSent,    setOtpSent]    = useState(false);
  const [otpSession, setOtpSession] = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [apiError,   setApiError]   = useState('');
  const [regText,    setRegText]    = useState('');

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', mobile: '',
    gender: '', password: '', otp: '', referId: '',
  });
  const [errors, setErrors] = useState({});

  const strength = getStrength(form.password);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
    setApiError('');
  };

  // ── Input style helper ─────────────────────────────────────────────────────
  const inp = (key) => ({
    padding: '13px 18px 13px 46px',
    background: inputBg,
    color: textC,
    border: errors[key] ? '2px solid #ef4444' : 'none',
  });

  // ── Validations ────────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    if (!form.firstName.trim())  e.firstName = 'First name is required';
    else if (form.firstName.trim().length < 2) e.firstName = 'At least 2 characters';

    if (!form.lastName.trim())   e.lastName  = 'Last name is required';
    else if (form.lastName.trim().length < 2)  e.lastName  = 'At least 2 characters';

    if (!form.mobile)            e.mobile    = 'Mobile number is required';
    else if (form.mobile.length !== 10) e.mobile = 'Must be exactly 10 digits';
    else if (!/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = 'Enter a valid Indian mobile number';

    return e;
  };

  const validateFull = () => {
    const e = { ...validateStep1() };

    if (!form.otp)               e.otp      = 'OTP is required';
    else if (form.otp.length < 6) e.otp     = 'OTP must be 6 digits';

    if (!form.gender)            e.gender   = 'Please select your gender';

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!form.email)             e.email    = 'Email is required';
    else if (!emailRe.test(form.email)) e.email = 'Enter a valid email address';

    const pw = form.password.trim();
    if (!pw)                     e.password = 'Password is required';
    else if (pw.length < 8)      e.password = 'At least 8 characters required';
    else if (!/[0-9!@#$%^&*]/.test(pw)) e.password = 'Must include a number or special character';

    return e;
  };

  // ── Send OTP ───────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    const e = validateStep1();
    if (Object.keys(e).length) { setErrors(e); return; }

    setOtpLoading(true); setApiError('');
    try {
      const res = await sendMobileOtp({ mobileNumber: form.mobile });
      setOtpSession(res.mobileOtpSession ?? '');
      setOtpSent(true);
    } catch (err) {
      const msg = err.data?.message ?? err.message ?? 'Failed to send OTP';
      if (err.status === 302) setErrors(e => ({ ...e, mobile: msg }));
      else setApiError(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Submit registration ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateFull();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setRegLoading(true); setApiError(''); setRegText('');

    // Typewriter starts immediately
    const msg = 'Your Trust, Our Priority.';
    let i = 0;
    const tick = setInterval(() => {
      i++;
      setRegText(msg.slice(0, i));
      if (i >= msg.length) clearInterval(tick);
    }, 60);

    try {
      await signUp({
        firstName:   form.firstName.trim(),
        lastName:    form.lastName.trim(),
        email:       form.email.trim(),
        gender:      form.gender,
        mobileNumber: form.mobile,
        password:    form.password.trim(),
        otp:         form.otp,
        otpSession,
        referId:     form.referId.trim(),
      });
      setStep(2);
    } catch (err) {
      setApiError(err.data?.message ?? err.message ?? 'Registration failed. Please try again.');
      setRegText('');
    } finally {
      setRegLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (step === 2) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: pageBg }}>
      <div className={`rounded-[2.5rem] p-10 w-full max-w-md text-center ${outerShadow} fade-in`}
        style={{ background: cardBg }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 8px 28px rgba(16,185,129,0.4)' }}>
          <span className="text-white"><CheckIcon /></span>
        </div>
        <h2 className="text-2xl font-extrabold mb-2" style={{ color: headingC }}>Account Created!</h2>
        <p className="text-sm mb-6" style={{ color: subC }}>
          Welcome to ULP. Your account is ready — log in to get started.
        </p>
        <button onClick={() => navigate('/login')}
          className="w-full py-3.5 rounded-2xl font-extrabold text-sm text-white"
          style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', boxShadow: '0 8px 28px rgba(29,78,216,0.4)', letterSpacing: '0.1em' }}>
          GO TO LOGIN
        </button>
      </div>
    </div>
  );

  // ── Registration form ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: pageBg, transition: 'background 0.4s' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full"
          style={{ background: dark ? 'radial-gradient(circle,rgba(30,58,138,0.35) 0%,transparent 70%)' : 'radial-gradient(circle,rgba(219,234,254,0.9) 0%,transparent 65%)', filter: 'blur(60px)' }} />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full"
          style={{ background: dark ? 'radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)' : 'radial-gradient(circle,rgba(196,181,253,0.4) 0%,transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-end gap-3 px-8 py-5">
        <button onClick={() => setTheme(dark ? 'light' : 'dark')}
          className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full transition-all ${pillShadow}`}
          style={{ background: cardBg, color: subC }}>
          {dark ? <SunIcon /> : <MoonIcon />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="flex flex-col lg:flex-row gap-5 items-stretch w-full max-w-[900px]">

          {/* Left panel */}
          <LeftPanel />

          {/* Right: form card */}
          <div className={`flex-1 rounded-[2.5rem] flex flex-col justify-center p-7 ${outerShadow} fade-in-1`}
            style={{ background: cardBg }}>

            {/* Card header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', boxShadow: '0 6px 20px rgba(29,78,216,0.45)' }}>
                <UserIcon />
              </div>
              <div>
                <h2 className="text-xl font-extrabold leading-none" style={{ color: headingC }}>Create Account</h2>
                <p className="text-xs font-medium mt-1" style={{ color: subC }}>Fill in your details to get started</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                {/* First name */}
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: subC }}>First Name</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: iconC }}><UserIcon /></span>
                    <input type="text" placeholder="John" value={form.firstName}
                      onChange={e => set('firstName', e.target.value)}
                      className={`w-full rounded-2xl text-sm font-medium ${innerShadow}`}
                      style={{ ...inp('firstName'), paddingLeft: 46 }} />
                  </div>
                  {errors.firstName && <p className="text-xs mt-1 font-medium" style={{ color: '#ef4444' }}>{errors.firstName}</p>}
                </div>
                {/* Last name */}
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: subC }}>Last Name</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: iconC }}><UserIcon /></span>
                    <input type="text" placeholder="Doe" value={form.lastName}
                      onChange={e => set('lastName', e.target.value)}
                      className={`w-full rounded-2xl text-sm font-medium ${innerShadow}`}
                      style={{ ...inp('lastName'), paddingLeft: 46 }} />
                  </div>
                  {errors.lastName && <p className="text-xs mt-1 font-medium" style={{ color: '#ef4444' }}>{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: subC }}>Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: iconC }}><MailIcon /></span>
                  <input type="email" placeholder="john@example.com" value={form.email}
                    onChange={e => set('email', e.target.value)}
                    className={`w-full rounded-2xl text-sm font-medium ${innerShadow}`}
                    style={inp('email')} />
                </div>
                {errors.email && <p className="text-xs mt-1 font-medium" style={{ color: '#ef4444' }}>{errors.email}</p>}
              </div>

              {/* Mobile + Send OTP */}
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: subC }}>Mobile Number</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: iconC }}><PhoneIcon /></span>
                    <input type="tel" placeholder="9876543210" value={form.mobile}
                      onChange={e => { set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10)); setOtpSent(false); }}
                      className={`w-full rounded-2xl text-sm font-medium ${innerShadow}`}
                      style={{ ...inp('mobile'), fontFamily: 'monospace' }}
                      maxLength={10} />
                  </div>
                  <button type="button" onClick={handleSendOtp} disabled={otpLoading || otpSent}
                    className="px-4 py-3 rounded-2xl font-bold text-xs whitespace-nowrap transition-all disabled:opacity-60 flex items-center gap-1.5"
                    style={otpSent
                      ? { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1.5px solid rgba(16,185,129,0.3)' }
                      : { background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', color: '#fff', boxShadow: '0 4px 14px rgba(29,78,216,0.4)' }
                    }>
                    {otpLoading
                      ? <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                      : otpSent ? <><CheckIcon /> Sent</> : 'Send OTP'
                    }
                  </button>
                </div>
                {errors.mobile && <p className="text-xs mt-1 font-medium" style={{ color: '#ef4444' }}>{errors.mobile}</p>}
                {otpSent && !errors.mobile && (
                  <p className="text-xs mt-1 font-medium" style={{ color: '#10b981' }}>
                    OTP sent to +91 {form.mobile} ·{' '}
                    <button type="button" onClick={() => { setOtpSent(false); set('otp', ''); }}
                      className="underline font-bold" style={{ color: '#3b82f6' }}>Resend</button>
                  </p>
                )}
              </div>

              {/* OTP boxes — shown after OTP sent */}
              {otpSent && (
                <div className="fade-in">
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: subC }}>Enter 6-digit OTP</label>
                  <OtpBoxes value={form.otp} onChange={v => set('otp', v)} inputBg={inputBg} textC={textC} innerShadow={innerShadow} />
                  {errors.otp && <p className="text-xs mt-2 text-center font-medium" style={{ color: '#ef4444' }}>{errors.otp}</p>}
                </div>
              )}

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: subC }}>Gender</label>
                <div className="flex gap-2">
                  {['Male', 'Female', 'Other'].map(g => (
                    <button key={g} type="button" onClick={() => set('gender', g)}
                      className="flex-1 py-3 rounded-2xl font-bold text-xs transition-all"
                      style={form.gender === g
                        ? { background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', color: '#fff', boxShadow: '0 4px 14px rgba(29,78,216,0.35)' }
                        : { background: inputBg, color: subC, boxShadow: dark ? 'inset 3px 3px 6px #0b0d12,inset -3px -3px 6px #1e2330' : 'inset 3px 3px 6px #d1d5db,inset -3px -3px 6px #ffffff' }
                      }>
                      {g === 'Male' ? '♂ Male' : g === 'Female' ? '♀ Female' : '⚧ Other'}
                    </button>
                  ))}
                </div>
                {errors.gender && <p className="text-xs mt-1 font-medium" style={{ color: '#ef4444' }}>{errors.gender}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: subC }}>Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: iconC }}><LockIcon /></span>
                  <input type={showPw ? 'text' : 'password'} placeholder="Min 8 chars + number/symbol"
                    value={form.password} onChange={e => set('password', e.target.value)}
                    className={`w-full rounded-2xl text-sm font-medium ${innerShadow}`}
                    style={{ ...inp('password'), paddingRight: 50 }} />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                    style={{ color: iconC }}>
                    {showPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {/* Strength bar */}
                {form.password && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb' }}>
                      <div className="h-full rounded-full pw-strength-bar" style={{ width: `${strength.pct}%`, background: strength.color }} />
                    </div>
                    <p className="text-xs mt-1 font-semibold" style={{ color: strength.color }}>{strength.label}</p>
                  </div>
                )}
                {errors.password && <p className="text-xs mt-1 font-medium" style={{ color: '#ef4444' }}>{errors.password}</p>}
              </div>

              {/* Referral (optional) */}
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: subC }}>
                  Referral Code <span style={{ color: iconC, fontWeight: 400, textTransform: 'none' }}>(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: iconC }}><GiftIcon /></span>
                  <input type="text" placeholder="Enter referral code" value={form.referId}
                    onChange={e => set('referId', e.target.value.toUpperCase())}
                    className={`w-full rounded-2xl text-sm font-medium ${innerShadow}`}
                    style={{ ...inp('referId'), fontFamily: 'monospace' }} />
                </div>
              </div>

              {/* API error */}
              {apiError && (
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold"
                  style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {apiError}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={regLoading || !otpSent}
                className="w-full py-3.5 mt-1 rounded-2xl font-extrabold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#3b82f6 0%,#2563eb 50%,#1d4ed8 100%)', boxShadow: '0 8px 28px rgba(29,78,216,0.45)', letterSpacing: '0.12em' }}>
                {regLoading && (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                  </svg>
                )}
                {regLoading ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT'}
              </button>

              {!otpSent && (
                <p className="text-center text-xs" style={{ color: iconC }}>Send OTP first to enable registration</p>
              )}
            </form>

            <p className="text-center mt-4 text-sm" style={{ color: subC }}>
              Already have an account?{' '}
              <Link to="/login" className="font-bold" style={{ color: '#3b82f6' }}>Sign In</Link>
            </p>
          </div>
        </div>
      </main>

      {/* ── Register Loading Overlay ── */}
      {regLoading && (
        <div className="overlay-in fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{
            background: dark ? 'rgba(10,14,30,0.75)' : 'rgba(238,240,245,0.72)',
            backdropFilter: 'blur(28px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
          }}>

          {/* Soft radial glow */}
          <div className="absolute pointer-events-none"
            style={{ width: 480, height: 480, borderRadius: '50%',
              background: dark ? 'radial-gradient(circle,rgba(59,130,246,0.18) 0%,transparent 70%)' : 'radial-gradient(circle,rgba(30,58,138,0.1) 0%,transparent 70%)',
              filter: 'blur(50px)' }} />

          {/* Glass card */}
          <div className="text-pop relative z-10 flex flex-col items-center gap-6 px-12 py-10 rounded-3xl"
            style={{
              background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.65)',
              border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(30,58,138,0.12)',
              boxShadow: dark
                ? '0 8px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'
                : '0 8px 48px rgba(30,58,138,0.12), 0 2px 0 rgba(255,255,255,0.9), inset 0 1px 0 rgba(255,255,255,0.8)',
            }}>

            {/* Spinner */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full"
                style={{ border: `2px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(30,58,138,0.1)'}` }} />
              <div className="absolute inset-0 rounded-full animate-spin"
                style={{ border: '2.5px solid transparent', borderTopColor: '#3b82f6', borderRightColor: '#10b981', animationDuration: '0.85s' }} />
              <div className="absolute -inset-1.5 rounded-full pointer-events-none"
                style={{ boxShadow: '0 0 20px rgba(59,130,246,0.25)' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#10b981)', boxShadow: '0 0 10px rgba(59,130,246,0.6)' }} />
              </div>
            </div>

            {/* Typewriter text */}
            <div className="flex flex-col items-center gap-2 text-center">
              <p style={{
                fontSize: '1.6rem', fontWeight: 900,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.02em', lineHeight: 1.2,
                minHeight: '2.2rem',
                color: dark ? '#e2e8f0' : '#1e3a8a',
              }}>
                {regText}
                <span className="tw-cursor" style={{ color: '#3b82f6', fontWeight: 200 }}>|</span>
              </p>

              {/* Animated underline grows with text */}
              <div style={{
                height: 2,
                width: `${(regText.length / 25) * 100}%`,
                minWidth: 4, maxWidth: '100%',
                borderRadius: 99,
                background: 'linear-gradient(90deg,#3b82f6,#10b981)',
                boxShadow: '0 0 8px rgba(59,130,246,0.5)',
                transition: 'width 0.06s linear',
              }} />

              <p className="text-xs font-semibold tracking-[0.18em] uppercase mt-1"
                style={{ color: dark ? 'rgba(148,163,184,0.6)' : 'rgba(30,58,138,0.45)' }}>
                Creating your account
              </p>
            </div>

            {/* Staggered dots */}
            <div className="flex items-center gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="rounded-full"
                  style={{
                    width: i === 1 ? 7 : 5, height: i === 1 ? 7 : 5,
                    background: i === 1 ? '#3b82f6' : (dark ? 'rgba(59,130,246,0.4)' : 'rgba(30,58,138,0.3)'),
                    boxShadow: i === 1 ? '0 0 10px rgba(59,130,246,0.7)' : 'none',
                    animation: `blink 1.1s ${i * 0.22}s ease-in-out infinite`,
                  }} />
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
