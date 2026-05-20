import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { sendLoginOtp } from '../api/beforelogin';
import logo from '../assets/ulp.png';

// ─── Icons ────────────────────────────────────────────────────────────────────
const MoonIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const SunIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const ChatIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const ArrowLeft   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const RefreshIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const LockIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const ShieldCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>;
const ZapIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const KeyIcon      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
const PhoneIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const TrendUp      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const BarChartIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
const ShieldIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

const COUNTRY_CODES = [
  { code: '91',  flag: '🇮🇳', name: 'India'     },
  { code: '1',   flag: '🇺🇸', name: 'USA'       },
  { code: '44',  flag: '🇬🇧', name: 'UK'        },
  { code: '971', flag: '🇦🇪', name: 'UAE'       },
  { code: '65',  flag: '🇸🇬', name: 'Singapore' },
  { code: '61',  flag: '🇦🇺', name: 'Australia' },
  { code: '60',  flag: '🇲🇾', name: 'Malaysia'  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
function injectStyles() {
  if (typeof document !== 'undefined' && !document.getElementById('otp-login-styles')) {
    const s = document.createElement('style');
    s.id = 'otp-login-styles';
    s.innerHTML = `
      @keyframes otpFadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes otpShake     { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-7px)} 40%,80%{transform:translateX(7px)} }
      @keyframes otpBoxPop    { 0%{transform:scale(0.7);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
      @keyframes timerBlink   { 0%,100%{opacity:1} 50%{opacity:0.35} }
      @keyframes successScale { 0%{transform:scale(0) rotate(-15deg)} 60%{transform:scale(1.15) rotate(3deg)} 100%{transform:scale(1) rotate(0)} }
      @keyframes ringPulse    { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(2);opacity:0} }
      @keyframes floatY       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
      @keyframes floatY2      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      @keyframes gradShift    { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
      @keyframes dotOrbit     { from{transform:rotate(0deg) translateX(38px) rotate(0deg)} to{transform:rotate(360deg) translateX(38px) rotate(-360deg)} }
      @keyframes dotOrbit2    { from{transform:rotate(120deg) translateX(38px) rotate(-120deg)} to{transform:rotate(480deg) translateX(38px) rotate(-480deg)} }
      @keyframes dotOrbit3    { from{transform:rotate(240deg) translateX(38px) rotate(-240deg)} to{transform:rotate(600deg) translateX(38px) rotate(-600deg)} }
      @keyframes glowPulse    { 0%,100%{box-shadow:0 0 20px rgba(99,102,241,0.4),inset 0 0 10px rgba(99,102,241,0.1)} 50%{box-shadow:0 0 32px rgba(99,102,241,0.7),inset 0 0 16px rgba(99,102,241,0.2)} }
      @keyframes shimmer      { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
      @keyframes slideIn      { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes fadeIn       { from{opacity:0} to{opacity:1} }
      @keyframes pulseGlow    { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.4)} 50%{box-shadow:0 0 0 8px rgba(99,102,241,0)} }
      @keyframes blink        { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes overlayIn    { from{opacity:0} to{opacity:1} }
      @keyframes textPop      { from{opacity:0;transform:translateY(12px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes shieldPulse  { 0%,100%{transform:scale(1);filter:drop-shadow(0 0 4px rgba(99,102,241,0.4))} 50%{transform:scale(1.08);filter:drop-shadow(0 0 12px rgba(99,102,241,0.8))} }
      @keyframes shieldGlow   { 0%,100%{opacity:0.15} 50%{opacity:0.45} }
      @keyframes checkDraw    { from{stroke-dashoffset:20;opacity:0} to{stroke-dashoffset:0;opacity:1} }
      .otp-shield-animate { animation: shieldPulse 4s ease-in-out infinite; }
      .otp-shield-glow    { animation: shieldGlow  6s ease-in-out infinite; }
      .otp-check-draw     { stroke-dasharray:20; animation: checkDraw 1.4s 0.6s ease forwards; opacity:0; }
      .otp-fade-up   { animation: otpFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
      .otp-fade-up-1 { animation: otpFadeUp 0.5s 0.07s cubic-bezier(0.22,1,0.36,1) both; }
      .otp-fade-up-2 { animation: otpFadeUp 0.5s 0.14s cubic-bezier(0.22,1,0.36,1) both; }
      .otp-fade-up-3 { animation: otpFadeUp 0.5s 0.21s cubic-bezier(0.22,1,0.36,1) both; }
      .otp-shake     { animation: otpShake 0.45s ease; }
      .otp-box-pop   { animation: otpBoxPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
      .timer-blink   { animation: timerBlink 0.9s ease infinite; }
      .success-scale { animation: successScale 0.55s cubic-bezier(0.34,1.56,0.64,1) both; }
      .ring-pulse    { animation: ringPulse 1.4s ease-out infinite; }
      .float-y       { animation: floatY  5s ease-in-out infinite; }
      .float-y2      { animation: floatY2 4s ease-in-out infinite; }
      @keyframes floatUp   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
      @keyframes floatDown { 0%,100%{transform:translateY(0)} 50%{transform:translateY(12px)}  }
      .bar-float  { animation: floatUp   5s ease-in-out infinite; }
      .coin-float { animation: floatDown 4s ease-in-out infinite; }
      .fade-in    { animation: otpFadeUp 0.6s ease forwards; }
      .fade-in-1  { animation: otpFadeUp 0.6s 0.1s ease both; }
      .fade-in-2  { animation: otpFadeUp 0.6s 0.2s ease both; }
      .fade-in-3  { animation: otpFadeUp 0.6s 0.3s ease both; }
      @keyframes drawLine { from { stroke-dashoffset: 600; } to { stroke-dashoffset: 0; } }
      @keyframes fillFade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes dotPop   { 0%{transform:scale(0);opacity:0} 70%{transform:scale(1.3)} 100%{transform:scale(1);opacity:1} }
      @keyframes dotPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.5} }
      @keyframes cardFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      @keyframes countUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      .chart-line  { stroke-dasharray: 600; animation: drawLine 1.8s 0.3s cubic-bezier(0.4,0,0.2,1) forwards; stroke-dashoffset: 600; }
      .chart-fill  { animation: fillFade 1.2s 1.2s ease forwards; opacity: 0; }
      .dot-pop     { animation: dotPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
      .dot-pulse   { animation: dotPulse 2s ease-in-out infinite; }
      .stat-card   { animation: cardFloat 4s ease-in-out infinite; }
      .stat-card-2 { animation: cardFloat 4s 1.5s ease-in-out infinite; }
      .count-up    { animation: countUp 0.6s 1.5s ease both; }
      .grad-shift    { background-size:200% 200%; animation: gradShift 4s ease infinite; }
      .dot-orbit     { animation: dotOrbit  3s linear infinite; }
      .dot-orbit2    { animation: dotOrbit2 3s linear infinite; }
      .dot-orbit3    { animation: dotOrbit3 3s linear infinite; }
      .otp-box-filled { animation: glowPulse 2s ease-in-out infinite; }
      .slide-in      { animation: slideIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }
      .fade-in-anim  { animation: fadeIn 0.4s ease both; }
      .pulse-glow    { animation: pulseGlow 2s ease-in-out infinite; }
      .tw-cursor     { animation: blink 0.75s step-end infinite; }
      .overlay-in    { animation: overlayIn 0.35s ease forwards; }
      .text-pop      { animation: textPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      .btn-shimmer { position: relative; overflow: hidden; }
      .btn-shimmer::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
        transform: translateX(-100%);
      }
      .btn-shimmer:hover::after { animation: shimmer 0.7s ease; }
      .otp-input-light {
        background: #f1f5f9 !important;
        border: 2px solid #e2e8f0 !important;
        color: #1e293b !important;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
      }
      .otp-input-light:focus {
        border-color: #6366f1 !important;
        box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
        outline: none !important;
      }
      .otp-input-light.filled {
        background: rgba(99,102,241,0.08) !important;
        border-color: #6366f1 !important;
      }
      .dark-input {
        background: #0f172a !important;
        border: 1.5px solid rgba(99,102,241,0.3) !important;
        color: #f1f5f9 !important;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .dark-input:focus {
        border-color: rgba(99,102,241,0.7) !important;
        box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
        outline: none !important;
      }
      .dark-select {
        background: #0f172a !important;
        border: 1.5px solid rgba(99,102,241,0.3) !important;
        color: #f1f5f9 !important;
      }
      .dark-select option { background: #0f172a; color: #f1f5f9; }
      .light-select {
        background: #f1f5f9 !important;
        border: 2px solid #e2e8f0 !important;
        color: #1e293b !important;
      }
      .light-select option { background: #fff; color: #1e293b; }
      .light-input {
        background: #f1f5f9 !important;
        border: 2px solid #e2e8f0 !important;
        color: #1e293b !important;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .light-input:focus {
        border-color: #6366f1 !important;
        box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
        outline: none !important;
      }
      .pw-btn-light {
        background: linear-gradient(135deg, #f8faff 0%, #eef2ff 100%);
        border: 1.5px solid rgba(99,102,241,0.25);
        color: #4f46e5;
        transition: all 0.2s;
      }
      .pw-btn-light:hover {
        background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
        border-color: rgba(99,102,241,0.5);
        box-shadow: 0 4px 16px rgba(99,102,241,0.15);
        transform: translateY(-1px);
      }
      .pw-btn-dark {
        background: rgba(99,102,241,0.1);
        border: 1.5px solid rgba(99,102,241,0.3);
        color: #a5b4fc;
        transition: all 0.2s;
      }
      .pw-btn-dark:hover {
        background: rgba(99,102,241,0.18);
        border-color: rgba(99,102,241,0.55);
        box-shadow: 0 4px 16px rgba(99,102,241,0.2);
        transform: translateY(-1px);
      }
    `;
    document.head.appendChild(s);
  }
}

// ─── Tagline with shield ─────────────────────────────────────────────────────
function OtpTagline({ dark }) {
  const line1 = 'Committed to You.';
  const line2 = 'Accountable Always.';
  return (
    <div className="mb-5">
      <div className="flex items-center gap-4">
        {/* Shield */}
        <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden">
          <div className="otp-shield-glow absolute inset-0 rounded-2xl pointer-events-none"
            style={{ background: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.55), transparent 70%)' }} />
          <svg viewBox="0 0 24 24" fill="none" className="otp-shield-animate w-11 h-11 relative z-10">
            <defs>
              <linearGradient id="otp-sg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
            <path d="M12 2L4 5v6c0 5.25 3.5 10.15 8 11.35C16.5 21.15 20 16.25 20 11V5L12 2z"
              fill="url(#otp-sg)" />
            <polyline points="8.5 12 11 14.5 15.5 9.5"
              className="otp-check-draw"
              stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {/* Text */}
        <div>
          <p className="font-extrabold leading-tight"
            style={{ fontSize: '1.45rem', color: dark ? '#ffffff' : '#1e3a8a' }}>
            {line1}
          </p>
          <p className="font-bold mt-0.5"
            style={{ fontSize: '1.1rem', color: dark ? '#a5b4fc' : '#6366f1' }}>
            {line2}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Phone illustration ───────────────────────────────────────────────────────
function PhoneIllustration() {
  return (
    <div className="relative flex items-center justify-center" style={{ height: 200 }}>
      <div className="absolute w-4 h-4 rounded-full dot-orbit"  style={{ background: 'rgba(147,197,253,0.7)', top:'50%', left:'50%', marginTop:-8, marginLeft:-8 }} />
      <div className="absolute w-3 h-3 rounded-full dot-orbit2" style={{ background: 'rgba(110,231,183,0.7)', top:'50%', left:'50%', marginTop:-6, marginLeft:-6 }} />
      <div className="absolute w-2.5 h-2.5 rounded-full dot-orbit3" style={{ background: 'rgba(196,181,253,0.8)', top:'50%', left:'50%', marginTop:-5, marginLeft:-5 }} />
      <div className="relative float-y z-10"
        style={{ width:88, height:155, background:'linear-gradient(160deg,rgba(255,255,255,0.18) 0%,rgba(255,255,255,0.06) 100%)', borderRadius:22, border:'1.5px solid rgba(255,255,255,0.25)', backdropFilter:'blur(12px)', boxShadow:'0 24px 60px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.3)' }}>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full" style={{ background:'rgba(255,255,255,0.3)' }} />
        <div className="absolute inset-x-3 top-8 bottom-4 rounded-xl overflow-hidden" style={{ background:'rgba(15,18,40,0.7)' }}>
          <div className="flex gap-1 justify-center mt-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-5 h-6 rounded-md flex items-center justify-center text-xs font-black"
                style={{ background: i<=2 ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'#fff' }}>
                {i<=2 ? '•' : ''}
              </div>
            ))}
          </div>
          <div className="mx-2 mt-3 py-1.5 rounded-lg text-center text-xs font-bold"
            style={{ background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff' }}>Verify</div>
          <div className="flex items-end gap-0.5 justify-center mt-3">
            {[3,5,7,9,11].map((h,i) => (
              <div key={i} className="w-1.5 rounded-sm" style={{ height:h, background: i<3 ? '#6366f1' : 'rgba(255,255,255,0.15)' }} />
            ))}
          </div>
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full" style={{ background:'rgba(255,255,255,0.3)' }} />
      </div>
      <div className="absolute float-y2 z-20" style={{ top:16, right:18, background:'linear-gradient(135deg,rgba(99,102,241,0.9),rgba(79,70,229,0.9))', borderRadius:12, padding:'5px 11px', boxShadow:'0 8px 24px rgba(99,102,241,0.5)', border:'1px solid rgba(255,255,255,0.2)' }}>
        <p className="text-white text-xs font-black tracking-widest">OTP</p>
      </div>
      <div className="absolute float-y z-20" style={{ bottom:20, left:14, background:'linear-gradient(135deg,rgba(16,185,129,0.9),rgba(5,150,105,0.9))', borderRadius:12, padding:'5px 9px', boxShadow:'0 8px 24px rgba(5,150,105,0.5)', border:'1px solid rgba(255,255,255,0.2)' }}>
        <p className="text-white text-xs font-black">🔒 Secure</p>
      </div>
    </div>
  );
}

// ─── OTP boxes ────────────────────────────────────────────────────────────────
function OtpBoxes({ otp, setOtp, shake, dark }) {
  const refs = useRef([]);
  const handleChange = (i, val) => {
    const digit = val.replace(/\D/g,'').slice(-1);
    const next = [...otp]; next[i] = digit; setOtp(next);
    if (digit && i < otp.length-1) refs.current[i+1]?.focus();
  };
  const handleKeyDown = (i, e) => {
    if (e.key==='Backspace' && !otp[i] && i>0) refs.current[i-1]?.focus();
    if (e.key==='ArrowLeft'  && i>0)              refs.current[i-1]?.focus();
    if (e.key==='ArrowRight' && i<otp.length-1)   refs.current[i+1]?.focus();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,otp.length);
    const next = [...otp]; pasted.split('').forEach((d,idx) => { next[idx]=d; }); setOtp(next);
    refs.current[Math.min(pasted.length, otp.length-1)]?.focus();
  };
  return (
    <div className={`flex gap-2.5 justify-center ${shake ? 'otp-shake' : ''}`}>
      {otp.map((digit, i) => (
        <input key={i} ref={el => refs.current[i]=el}
          type="text" inputMode="numeric" maxLength={1} value={digit}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`otp-box-pop text-center font-black rounded-2xl outline-none transition-all ${
            dark
              ? (digit ? 'otp-box-filled' : '')
              : ('otp-input-light' + (digit ? ' filled' : ''))
          }`}
          style={{
            width:42, height:44, fontSize:26,
            background: dark
              ? (digit ? 'rgba(99,102,241,0.18)' : '#0f172a')
              : undefined,
            border: dark
              ? (digit ? '2px solid rgba(99,102,241,0.8)' : '1.5px solid rgba(99,102,241,0.3)')
              : undefined,
            color: dark ? (digit ? '#e0e7ff' : '#94a3b8') : undefined,
            animationDelay: `${i*0.06}s`,
            transform: digit ? 'scale(1.06)' : 'scale(1)',
            caretColor: '#6366f1',
          }}
        />
      ))}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function LoginOTP() {
  useEffect(() => injectStyles(), []);
  const { otpLogin }        = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate            = useNavigate();
  const dark = theme === 'dark';

  const [step, setStep]               = useState('phone'); // 'phone' | 'otp' | 'success'
  const [countryCode, setCountryCode] = useState('91');
  const [mobile, setMobile]           = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [otp, setOtp]                 = useState(['','','','','','']);
  const [otpSession, setOtpSession]   = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [timer, setTimer]             = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const [otpShake, setOtpShake]       = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [loginText, setLoginText]     = useState('');

  useEffect(() => {
    if (!timerActive) return;
    if (timer <= 0) { setTimerActive(false); return; }
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer, timerActive]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const handleSendOtp = async () => {
    setError(''); setSuccess('');
    if (!mobile.trim() || mobile.trim().length < 7) { setError('Please enter a valid mobile number.'); return; }
    setSendLoading(true);
    try {
      const res = await sendLoginOtp({ countryCode, mobileNumber: mobile.trim() });
      setOtpSession(res.mobileOtpSession ?? '');
      setOtp(['','','','','','']); setTimer(120); setTimerActive(true);
      setStep('otp'); setSuccess('OTP sent to +' + countryCode + ' ' + mobile.trim());
    } catch(err) { setError(err.message ?? 'Failed to send OTP.'); }
    finally { setSendLoading(false); }
  };

  const handleResend = async () => {
    setError(''); setSuccess(''); setSendLoading(true);
    try {
      const res = await sendLoginOtp({ countryCode, mobileNumber: mobile.trim() });
      setOtpSession(res.mobileOtpSession ?? '');
      setOtp(['','','','','','']); setTimer(120); setTimerActive(true);
      setSuccess('OTP resent successfully!');
    } catch(err) { setError(err.message ?? 'Failed to resend.'); }
    finally { setSendLoading(false); }
  };

  const handleVerify = async () => {
    setError(''); setSuccess('');
    const otpStr = otp.join('');
    if (otpStr.length !== 6) {
      setOtpShake(true); setTimeout(() => setOtpShake(false), 500);
      setError('Please enter the complete 6-digit OTP.'); return;
    }
    setVerifyLoading(true);
    // Typewriter + audio — same as Login screen
    let audioCtx = null;
    const playClick = () => {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const buf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.035), audioCtx.sampleRate);
        const data = buf.getChannelData(0);
        for (let k = 0; k < data.length; k++) {
          data[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / data.length, 10) * 0.15;
        }
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.035);
        src.connect(gain); gain.connect(audioCtx.destination); src.start(audioCtx.currentTime);
      } catch {}
    };
    const msg = 'Your Trust, Our Priority.';
    let ti = 0;
    const tick = setInterval(() => {
      ti++;
      setLoginText(msg.slice(0, ti));
      if (msg[ti - 1] !== ' ') playClick();
      if (ti >= msg.length) { clearInterval(tick); if (audioCtx) audioCtx.close().catch(() => {}); }
    }, 60);
    try {
      const result = await otpLogin({ countryCode, mobileNumber: mobile.trim(), otpSession, otpValue: otpStr });
      if (result.success) {
        setStep('success');
        setTimeout(() => navigate(result.role === 'admin' ? '/admin' : '/dashboard', { replace: true }), 2400);
      } else {
        setOtpShake(true); setTimeout(() => setOtpShake(false), 500);
        setError(result.error ?? 'Invalid OTP.');
        setLoginText('');
      }
    } catch(err) {
      setOtpShake(true); setTimeout(() => setOtpShake(false), 500);
      setError(err.message ?? 'Verification failed.');
      setLoginText('');
    } finally { setVerifyLoading(false); }
  };

  const timerRadius = 14;
  const timerCirc   = 2 * Math.PI * timerRadius;
  const timerProg   = (timer / 120) * timerCirc;
  const timerColor  = timer <= 15 ? '#ef4444' : '#6366f1';

  const features = [
    { Icon: BarChartIcon, label: 'Portfolio Analytics', accent: '#60a5fa', bg: 'rgba(96,165,250,0.15)'  },
    { Icon: ShieldIcon,   label: 'Secure & Encrypted',  accent: '#34d399', bg: 'rgba(52,211,153,0.15)'  },
  ];

  // ── Design tokens ──────────────────────────────────────────────────────────
  const pageBg   = dark ? '#080d1a' : '#eef0f5';
  const cardBg   = dark ? '#111827' : '#ffffff';
  const inputBg  = dark ? '#0f172a' : '#f1f5f9';
  const subC     = dark ? '#94a3b8' : '#64748b';
  const textC    = dark ? '#e2e8f0' : '#1e293b';
  const headingC = dark ? '#e0e7ff' : '#1e3a8a';
  const borderC  = dark ? 'rgba(99,102,241,0.2)' : 'rgba(30,58,138,0.1)';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: pageBg, transition: 'background 0.4s' }}>

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full"
          style={{ background: dark ? 'radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)' : 'radial-gradient(circle,rgba(219,234,254,0.9) 0%,transparent 65%)', filter:'blur(80px)' }} />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full"
          style={{ background: dark ? 'radial-gradient(circle,rgba(79,70,229,0.12) 0%,transparent 70%)' : 'radial-gradient(circle,rgba(196,181,253,0.4) 0%,transparent 70%)', filter:'blur(60px)' }} />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-end gap-3 px-8 py-5">
        <Link to="/support"
          className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-105"
          style={{ background: dark ? 'rgba(99,102,241,0.12)' : cardBg, border: `1px solid ${borderC}`, color: subC }}
          title="Support">
          <ChatIcon />
        </Link>
        <button onClick={() => setTheme(dark ? 'light' : 'dark')}
          className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-105"
          style={{ background: dark ? 'rgba(99,102,241,0.12)' : cardBg, border: `1px solid ${borderC}`, color: subC }}>
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-5 items-stretch justify-center">

            {/* ══ LEFT PANEL ══ */}
            <div className="relative overflow-hidden rounded-[2.5rem] flex flex-col w-full lg:w-[420px] flex-shrink-0 fade-in"
              style={{
                background: 'linear-gradient(145deg,#1e3a8a 0%,#1e40af 40%,#312e81 100%)',
                minHeight: 460,
                padding: '2rem',
              }}>

              {/* Decorative circles */}
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.06)', filter: 'blur(1px)' }} />
              <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
                style={{ background: 'rgba(99,102,241,0.25)', filter: 'blur(2px)' }} />
              <div className="absolute top-1/2 right-8 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.04)' }} />

              {/* Brand */}
              <div className="relative z-10 flex items-center gap-3 mb-5 fade-in">
                <img src={logo} alt="Oxy Portfolio" className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  style={{ background: '#fff', boxShadow: '0 0 12px rgba(255,255,255,0.25)' }} />
                <div>
                  <p className="text-white font-black text-base tracking-wide leading-none">Oxy Portfolio</p>
                  <p className="text-blue-300 text-xs font-medium mt-0.5 opacity-80">Financial Intelligence Platform</p>
                </div>
              </div>

              {/* Heading */}
              <div className="relative z-10 fade-in-1">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-2">
                  Welcome to Your<br />
                  <span style={{ color: '#93c5fd' }}>Financial View</span>
                </h1>
                <p className="text-blue-200 text-xs font-medium leading-relaxed opacity-85 mb-5">
                  Your comprehensive platform for portfolio<br />analytics, lending, and family finance.
                </p>
              </div>


              {/* ── Portfolio Growth Chart ── */}
              <div className="relative z-10 flex-1 flex flex-col justify-center fade-in-2 px-2 gap-3">

                {/* Stat cards row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="stat-card flex items-center gap-2 px-3 py-2 rounded-2xl flex-1"
                    style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#34d399,#059669)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-black text-sm count-up leading-none">+24.8%</p>
                      <p className="text-blue-200 text-[10px] font-medium opacity-80">Portfolio</p>
                    </div>
                  </div>
                  <div className="stat-card-2 flex items-center gap-2 px-3 py-2 rounded-2xl flex-1"
                    style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#fbbf24,#d97706)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-black text-sm count-up leading-none">₹2.4L</p>
                      <p className="text-blue-200 text-[10px] font-medium opacity-80">Returns</p>
                    </div>
                  </div>
                </div>
                {/* <PhoneIllustration /> */}
                {/* SVG area chart */}
                <div className="relative w-full" style={{ height: 110 }}>
                  <svg viewBox="0 0 320 100" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="otp-chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.45"/>
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity="0"/>
                      </linearGradient>
                      <linearGradient id="otp-lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#93c5fd"/>
                        <stop offset="50%" stopColor="#34d399"/>
                        <stop offset="100%" stopColor="#a78bfa"/>
                      </linearGradient>
                      <filter id="otp-glow">
                        <feGaussianBlur stdDeviation="2.5" result="blur"/>
                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>
                    </defs>
                    <path className="chart-fill"
                      d="M0,80 C30,75 50,65 80,55 C110,45 130,60 160,40 C190,20 210,35 240,25 C270,15 295,20 320,10 L320,100 L0,100 Z"
                      fill="url(#otp-chartGrad)" />
                    <path className="chart-line"
                      d="M0,80 C30,75 50,65 80,55 C110,45 130,60 160,40 C190,20 210,35 240,25 C270,15 295,20 320,10"
                      fill="none" stroke="url(#otp-lineGrad)" strokeWidth="2.5" strokeLinecap="round" filter="url(#otp-glow)" />
                    {[[80,55],[160,40],[240,25],[320,10]].map(([x,y],i) => (
                      <g key={i}>
                        <circle cx={x} cy={y} r="6" fill="white" opacity="0.15" className="dot-pulse"
                          style={{ animationDelay: `${i*0.4+1.8}s` }} />
                        <circle cx={x} cy={y} r="3.5" fill="white" className="dot-pop"
                          style={{ animationDelay: `${i*0.25+1.5}s` }} />
                        <circle cx={x} cy={y} r="1.8"
                          fill={['#93c5fd','#34d399','#a78bfa','#fbbf24'][i]} className="dot-pop"
                          style={{ animationDelay: `${i*0.25+1.5}s` }} />
                      </g>
                    ))}
                    {['Jan','Apr','Jul','Oct'].map((m,i) => (
                      <text key={m} x={[20,107,213,300][i]} y="98" fontSize="7" fill="rgba(255,255,255,0.45)" textAnchor="middle" fontWeight="600">{m}</text>
                    ))}
                  </svg>
                </div>

              </div>

              {/* Feature pills */}
              <div className="relative z-10 flex flex-col gap-2 mt-auto pt-5 fade-in-3">
                {features.map(f => (
                  <div key={f.label}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: f.bg }}>
                      <span style={{ color: f.accent }}><f.Icon /></span>
                    </div>
                    <span className="text-xs font-semibold text-white">{f.label}</span>
                    <div className="ml-auto flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: f.accent, boxShadow: `0 0 6px ${f.accent}` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ══ RIGHT PANEL ══ */}
            <div className="w-full lg:w-[420px] flex-shrink-0 otp-fade-up-1">

              {/* ── PHONE STEP ── */}
              {step === 'phone' && (
                <div className="rounded-[2.5rem] flex flex-col p-8 slide-in"
                  style={{
                    background: cardBg,
                    border: `1px solid ${borderC}`,
                    boxShadow: dark
                      ? '0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
                      : '0 24px 60px rgba(30,58,138,0.1), 0 4px 16px rgba(30,58,138,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
                  }}>

                  {/* Tagline */}
                  <OtpTagline dark={dark} />

                  {/* Bordered inner card — same as Login's "Secure Login" card */}
                  <div className="rounded-2xl p-5 mb-1"
                    style={{
                      border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(99,102,241,0.12)',
                      background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
                      boxShadow: dark
                        ? '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)'
                        : '0 4px 20px rgba(99,102,241,0.07), 0 1px 4px rgba(99,102,241,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
                    }}>

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold leading-none" style={{ color: dark ? '#ffffff' : '#1e3a8a' }}>OTP Login</h2>
                      <p className="text-xs font-medium mt-1" style={{ color: subC }}>Enter your mobile number to continue</p>
                    </div>
                  </div>

                  {/* Country + Mobile */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: subC }}>
                      Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={e => setCountryCode(e.target.value)}
                        className={`rounded-2xl text-sm font-semibold px-3 py-3.5 flex-shrink-0 ${dark ? 'dark-select' : 'light-select'}`}
                        style={{ width: 85, border: 'none', outline: 'none' }}>
                        {COUNTRY_CODES.map(c => (
                          <option key={c.code} value={c.code}>{c.flag} +{c.code}</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        placeholder="Enter mobile number"
                        value={mobile}
                        onChange={e => { setMobile(e.target.value.replace(/\D/g,'')); setError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                        maxLength={15}
                        className={`flex-1 rounded-2xl text-sm font-medium px-4 py-3.5 ${dark ? 'dark-input' : 'light-input'}`}
                        style={{ border: 'none', outline: 'none' }}
                      />
                    </div>
                    {mobile.length > 0 && mobile.length < 7 && (
                      <p className="text-xs mt-1.5 font-medium" style={{ color: '#f59e0b' }}>Enter at least 7 digits</p>
                    )}
                    {mobile.length >= 10 && (
                      <p className="text-xs mt-1.5 font-medium" style={{ color: '#10b981' }}>✓ Looks good</p>
                    )}
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold mb-4"
                      style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 flex-shrink-0">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {error}
                    </div>
                  )}

                  {/* Send OTP button */}
                  <button
                    onClick={handleSendOtp}
                    disabled={sendLoading}
                    className="w-full py-4 rounded-2xl font-extrabold text-sm text-white btn-shimmer transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mb-4"
                    style={{
                      background: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 50%,#4338ca 100%)',
                      boxShadow: '0 8px 28px rgba(99,102,241,0.45), 0 2px 8px rgba(99,102,241,0.3)',
                      letterSpacing: '0.1em',
                    }}>
                    {sendLoading ? (
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <ZapIcon />
                    )}
                    {sendLoading ? 'Sending OTP...' : 'Send OTP'}
                  </button>

                  </div>{/* end inner card */}

                  {/* Divider */}
                  <div className="flex items-center gap-3 mb-4 mt-4">
                    <div className="flex-1 h-px" style={{ background: borderC }} />
                    <span className="text-xs font-semibold" style={{ color: subC }}>or</span>
                    <div className="flex-1 h-px" style={{ background: borderC }} />
                  </div>

                  {/* Login with password */}
                  <Link to="/login"
                    className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(30,58,138,0.04)',
                      border: `1.5px solid ${borderC}`,
                      color: dark ? '#93c5fd' : '#2563eb',
                    }}>
                    <LockIcon />
                    Login with Password
                  </Link>

                  <p className="text-center mt-5 text-sm" style={{ color: subC }}>
                    Don't have an account?{' '}
                    <Link to="/register" className="font-bold" style={{ color: '#6366f1' }}>Sign Up</Link>
                  </p>
                </div>
              )}

              {/* ── OTP STEP ── */}
              {step === 'otp' && (
                <div className="rounded-[2.5rem] flex flex-col p-8 slide-in"
                  style={{
                    background: cardBg,
                    border: `1px solid ${borderC}`,
                    boxShadow: dark
                      ? '0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
                      : '0 24px 60px rgba(30,58,138,0.1), 0 4px 16px rgba(30,58,138,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
                  }}>

                  {/* Tagline */}
                  <OtpTagline dark={dark} />

                  {/* Bordered inner card */}
                  <div className="rounded-2xl p-5"
                    style={{
                      border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(99,102,241,0.12)',
                      background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
                      boxShadow: dark
                        ? '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)'
                        : '0 4px 20px rgba(99,102,241,0.07), 0 1px 4px rgba(99,102,241,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
                    }}>

                  {/* Back + title */}
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={() => { setStep('phone'); setError(''); setSuccess(''); setOtp(['','','','','','']); setTimerActive(false); }}
                      className="w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:scale-105 flex-shrink-0"
                      style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', color: subC, border: `1px solid ${borderC}` }}>
                      <ArrowLeft />
                    </button>
                    <div>
                      <h2 className="text-base font-extrabold leading-none" style={{ color: dark ? '#ffffff' : '#1e3a8a' }}>Enter OTP</h2>
                      <p className="text-xs font-medium mt-1" style={{ color: subC }}>
                        Sent to <span className="font-bold" style={{ color: '#6366f1' }}>+{countryCode} {mobile}</span>
                      </p>
                    </div>
                  </div>

                  {/* Success banner */}
                  {success && (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold mb-5 fade-in-anim"
                      style={{ color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 flex-shrink-0">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {success}
                    </div>
                  )}

                  {/* OTP boxes */}
                  <div className="mb-6">
                    <OtpBoxes otp={otp} setOtp={setOtp} shake={otpShake} dark={dark} />
                  </div>

                  {/* Timer + Resend */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      {/* SVG circular timer */}
                      <svg width="36" height="36" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r={timerRadius} fill="none"
                          stroke={dark ? 'rgba(99,102,241,0.15)' : '#e2e8f0'} strokeWidth="2.5" />
                        <circle cx="18" cy="18" r={timerRadius} fill="none"
                          stroke={timerColor} strokeWidth="2.5"
                          strokeDasharray={timerCirc}
                          strokeDashoffset={timerCirc - timerProg}
                          strokeLinecap="round"
                          transform="rotate(-90 18 18)"
                          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }} />
                        <text x="18" y="22" textAnchor="middle" fontSize="8" fontWeight="700"
                          fill={timerColor}>{timer}</text>
                      </svg>
                      <span className={`text-base font-black tabular-nums ${timer <= 15 ? 'timer-blink' : ''}`}
                        style={{ color: timerColor }}>
                        {fmt(timer)}
                      </span>
                    </div>
                    <button
                      onClick={handleResend}
                      disabled={timerActive || sendLoading}
                      className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
                      style={{
                        color: timerActive ? subC : '#6366f1',
                        background: timerActive ? 'transparent' : (dark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)'),
                        border: `1px solid ${timerActive ? 'transparent' : 'rgba(99,102,241,0.25)'}`,
                      }}>
                      <RefreshIcon />
                      Resend
                    </button>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold mb-4 fade-in-anim"
                      style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 flex-shrink-0">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {error}
                    </div>
                  )}

                  {/* Verify button */}
                  <button
                    onClick={handleVerify}
                    disabled={verifyLoading || otp.join('').length !== 6}
                    className="w-full py-4 rounded-2xl font-extrabold text-sm text-white btn-shimmer transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
                    style={{
                      background: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 50%,#4338ca 100%)',
                      boxShadow: '0 8px 28px rgba(99,102,241,0.45), 0 2px 8px rgba(99,102,241,0.3)',
                      letterSpacing: '0.1em',
                    }}>
                    {verifyLoading ? (
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <ShieldCheck />
                    )}
                    {verifyLoading ? 'Verifying...' : 'Verify & Login'}
                  </button>

                  {/* Security note */}
                  <div className="flex items-center justify-center gap-2 mb-5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0" style={{ color: subC }}>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <p className="text-xs font-medium" style={{ color: subC }}>OTP valid for 2 min · Never share it</p>
                  </div>

                  </div>{/* end inner card */}

                  {/* Divider */}
                  <div className="flex items-center gap-3 mb-4 mt-4">
                    <div className="flex-1 h-px" style={{ background: borderC }} />
                    <span className="text-xs font-semibold" style={{ color: subC }}>prefer password?</span>
                    <div className="flex-1 h-px" style={{ background: borderC }} />
                  </div>

                  {/* Login with Password — shown after OTP is sent */}
                  <Link to="/login"
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 ${dark ? 'pw-btn-dark' : 'pw-btn-light'}`}>
                    <KeyIcon />
                    Login with Password Instead
                  </Link>
                </div>
              )}

              {/* ── SUCCESS STEP ── */}
              {step === 'success' && (
                <div className="rounded-[2.5rem] flex flex-col items-center justify-center p-10 slide-in"
                  style={{
                    background: cardBg,
                    border: `1px solid ${borderC}`,
                    minHeight: 320,
                    boxShadow: dark
                      ? '0 24px 60px rgba(0,0,0,0.4)'
                      : '0 24px 60px rgba(30,58,138,0.1)',
                  }}>
                  <div className="relative mb-6">
                    <div className="ring-pulse absolute inset-0 rounded-full"
                      style={{ background: 'rgba(99,102,241,0.2)' }} />
                    <div className="ring-pulse absolute inset-0 rounded-full"
                      style={{ background: 'rgba(99,102,241,0.1)', animationDelay: '0.5s' }} />
                    <div className="success-scale w-20 h-20 rounded-full flex items-center justify-center relative z-10"
                      style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 12px 40px rgba(99,102,241,0.5)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-2xl font-extrabold mb-2" style={{ color: headingC }}>Verified!</h2>
                  <p className="text-sm font-medium text-center" style={{ color: subC }}>
                    Login successful. Redirecting you now...
                  </p>
                  <div className="mt-6 flex gap-1.5">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full"
                        style={{ background: '#6366f1', opacity: 0.4 + i*0.3, animation: `timerBlink ${0.9 + i*0.2}s ease infinite` }} />
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      {/* ── Verify Loading Overlay ── */}
      {verifyLoading && (
        <div className="overlay-in fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{
            background: dark
              ? 'rgba(8,13,26,0.78)'
              : 'rgba(238,240,245,0.72)',
            backdropFilter: 'blur(28px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
          }}>

          {/* Soft radial glow */}
          <div className="absolute pointer-events-none"
            style={{
              width: 480, height: 480, borderRadius: '50%',
              background: dark
                ? 'radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)'
                : 'radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)',
              filter: 'blur(50px)',
            }} />

          {/* Glass card */}
          <div className="text-pop relative z-10 flex flex-col items-center gap-6 px-12 py-10 rounded-3xl"
            style={{
              background: dark
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(255,255,255,0.65)',
              border: dark
                ? '1px solid rgba(255,255,255,0.1)'
                : '1px solid rgba(99,102,241,0.12)',
              boxShadow: dark
                ? '0 8px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'
                : '0 8px 48px rgba(99,102,241,0.12), 0 2px 0 rgba(255,255,255,0.9), inset 0 1px 0 rgba(255,255,255,0.8)',
            }}>

            {/* Spinner */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full"
                style={{ border: `2px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.1)'}` }} />
              <div className="absolute inset-0 rounded-full animate-spin"
                style={{ border: '2.5px solid transparent', borderTopColor: '#6366f1', borderRightColor: '#10b981', animationDuration: '0.85s' }} />
              <div className="absolute -inset-1.5 rounded-full pointer-events-none"
                style={{ boxShadow: '0 0 20px rgba(99,102,241,0.25)' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#10b981)', boxShadow: '0 0 10px rgba(99,102,241,0.6)' }} />
              </div>
            </div>

            {/* Typewriter text */}
            <div className="flex flex-col items-center gap-2 text-center">
              <p style={{
                fontSize: '1.6rem',
                fontWeight: 900,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.02em',
                lineHeight: 1.2,
                minHeight: '2.2rem',
                color: dark ? '#e2e8f0' : '#1e3a8a',
              }}>
                {loginText}
                <span className="tw-cursor" style={{ color: '#6366f1', fontWeight: 200 }}>|</span>
              </p>

              {/* Animated underline */}
              <div style={{
                height: 2,
                width: `${(loginText.length / 25) * 100}%`,
                minWidth: 4,
                maxWidth: '100%',
                borderRadius: 99,
                background: 'linear-gradient(90deg,#6366f1,#10b981)',
                boxShadow: '0 0 8px rgba(99,102,241,0.5)',
                transition: 'width 0.06s linear',
              }} />

              <p className="text-xs font-semibold tracking-[0.18em] uppercase mt-1"
                style={{ color: dark ? 'rgba(148,163,184,0.6)' : 'rgba(99,102,241,0.5)' }}>
                Signing you in
              </p>
            </div>

            {/* Staggered dots */}
            <div className="flex items-center gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="rounded-full"
                  style={{
                    width: i === 1 ? 7 : 5,
                    height: i === 1 ? 7 : 5,
                    background: i === 1 ? '#6366f1' : (dark ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.3)'),
                    boxShadow: i === 1 ? '0 0 10px rgba(99,102,241,0.7)' : 'none',
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
