import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { GOOGLE_AUTH_URL } from "../api/beforelogin";
import logo from "../assets/ulp.png";

// ─── Icons ────────────────────────────────────────────────────────────────────
const ChatIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const MailIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const LockIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const EyeIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const MoonIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const SunIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const TrendUp    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const ShieldIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const BarChartIcon=() => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
const UsersIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

const Logo = ({ size = 32 }) => (
  <svg viewBox="0 0 40 40" fill="none" style={{ width: size, height: size }}>
    <circle cx="20" cy="20" r="20" fill="rgba(255,255,255,0.15)" />
    <path d="M20 6L34 32H6L20 6Z" fill="white" opacity="0.95" />
    <path d="M20 14L28 30H12L20 14Z" fill="#1e3a8a" opacity="0.5" />
  </svg>
);

// ─── Typewriter ───────────────────────────────────────────────────────────────
function TypewriterText({ dark }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone]           = useState(false);

  const line1 = "Committed to You.";
  const line2 = "Accountable Always.";
  const full  = line1 + " " + line2;

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const start = setTimeout(() => {
      const tick = setInterval(() => {
        i++;
        setDisplayed(full.slice(0, i));
        if (i >= full.length) { clearInterval(tick); setDone(true); }
      }, 48);
      return () => clearInterval(tick);
    }, 300);
    return () => clearTimeout(start);
  }, []);

  const shownLine1 = displayed.slice(0, Math.min(displayed.length, line1.length));
  const shownLine2 = displayed.length > line1.length + 1 ? displayed.slice(line1.length + 1) : "";
  const cursorOnLine1 = !done && shownLine2 === "";
  const cursorOnLine2 = !done && shownLine2 !== "";

  return (
    <div className="mb-1">
      {/* Shield icon + text row */}
      <div className="flex items-center gap-4 mb-4">

        {/* Shield — light blue rounded square, gradient icon, white checkmark */}
        <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden"
          style={{
            // background: dark ? "rgba(96,165,250,0.15)" : "#dbeafe",
            // boxShadow: dark ? "none" : "0 2px 8px rgba(59,130,246,0.1)",
          }}>
          {/* Pulsing background glow */}
          <div className="shield-bg-glow absolute inset-0 rounded-2xl pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.5), transparent 70%)" }} />
          <svg viewBox="0 0 24 24" fill="none" className="shield-animate w-11 h-11 relative z-10">
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
            <path d="M12 2L4 5v6c0 5.25 3.5 10.15 8 11.35C16.5 21.15 20 16.25 20 11V5L12 2z"
              fill="url(#sg)" />
            <polyline points="8.5 12 11 14.5 15.5 9.5"
              className="check-draw"
              stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Text */}
        <div>
          <p className="font-extrabold leading-tight"
            style={{ fontSize: "1.45rem", color: dark ? "#ffffff" : "#1e3a8a" }}>
            {line1}
            {/* {cursorOnLine1 && <span className="tw-cursor" style={{ color: "#3b82f6", fontWeight: 200 }}>|</span>} */}
          </p>
          <p className="font-bold mt-0.5"
            style={{ fontSize: "1.1rem", color: dark ? "#93c5fd" : "#489cfbff" }}>
            {line2}
            {/* {cursorOnLine2 && <span className="tw-cursor" style={{ color: dark ? "#93c5fd" : "#047857", fontWeight: 400 }}>|</span>} */}
          </p>
        </div>
      </div>

      {/* Divider — gradient underline (old style) */}
      {/* {done && ( */}
        {/* <div className="mb-1 h-0.5 rounded-full"
          style={{
            width: "100%",
            background: dark
              ? "linear-gradient(90deg,#e2e8f0,#93c5fd,transparent)"
              : "linear-gradient(90deg,#1e3a8a,#489cfbff,transparent)",
            opacity: 0.9,
            // animation: "fadeSlideIn 0.5s ease forwards",
          }} /> */}
      {/* )} */}
    </div>
  );
}

const injectStyles = () => {
  if (typeof document !== "undefined" && !document.getElementById("login-styles")) {
    const s = document.createElement("style");
    s.id = "login-styles";
    s.innerHTML = `
      @keyframes shieldPulse { 
        0%,100% { transform: scale(1);    filter: drop-shadow(0 0 4px rgba(59,130,246,0.4)); } 
        50%      { transform: scale(1.08); filter: drop-shadow(0 0 12px rgba(59,130,246,0.8)); } 
      }
      @keyframes shieldGlow {
        0%,100% { opacity: 0.15; }
        50%      { opacity: 0.45; }
      }
      @keyframes checkDraw {
        from { stroke-dashoffset: 20; opacity: 0; }
        to   { stroke-dashoffset: 0;  opacity: 1; }
      }
      .shield-animate { animation: shieldPulse 4s ease-in-out infinite; }
      .shield-bg-glow { animation: shieldGlow  6s ease-in-out infinite; }
      .check-draw     { stroke-dasharray: 20; animation: checkDraw 1.4s 0.6s ease forwards; opacity: 0; }
      @keyframes floatDown { 0%,100%{transform:translateY(0)}   50%{transform:translateY(12px)}  }
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
      .shimmer-text {
        background: linear-gradient(90deg, #93c5fd 0%, #ffffff 40%, #6ee7b7 60%, #93c5fd 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: shimmer 2.5s linear infinite;
      }
      /* Light neumorphic */
      .neu-outer { box-shadow: 20px 20px 40px #c8cdd6, -20px -20px 40px #ffffff; }
      .neu-inner { box-shadow: inset 5px 5px 10px #d1d5db, inset -5px -5px 10px #ffffff; }
      .neu-pill  { box-shadow: 5px 5px 12px #d1d5db, -5px -5px 12px #ffffff; }
      .neu-pill:hover { box-shadow: 3px 3px 8px #d1d5db, -3px -3px 8px #ffffff; }
      /* Dark neumorphic */
      .d-neu-outer { box-shadow: 18px 18px 36px #0b0d12, -18px -18px 36px #1e2330; }
      .d-neu-inner { box-shadow: inset 5px 5px 10px #0b0d12, inset -5px -5px 10px #1e2330; }
      .d-neu-pill  { box-shadow: 5px 5px 12px #0b0d12, -5px -5px 12px #1e2330; }
      /* Focus ring on inputs */
      .neu-input-focus:focus { outline: none; box-shadow: inset 4px 4px 8px #d1d5db, inset -4px -4px 8px #ffffff, 0 0 0 2.5px #3b82f6; }
      .d-neu-input-focus:focus { outline: none; box-shadow: inset 4px 4px 8px #0b0d12, inset -4px -4px 8px #1e2330, 0 0 0 2.5px #3b82f6; }
    `;
    document.head.appendChild(s);
  }
};

export default function Login() {
  useEffect(() => injectStyles(), []);

  const { login }           = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate            = useNavigate();

  const [credential, setCredential] = useState("");
  const [password, setPassword]     = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [loginText, setLoginText]   = useState("");

  const dark = theme === "dark";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setLoginText("");

    // Web Audio typing sound — single shared context, zero latency
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
        src.connect(gain);
        gain.connect(audioCtx.destination);
        src.start(audioCtx.currentTime);
      } catch {}
    };

    // Start typewriter immediately on click
    const msg = "Your Trust, Our Priority.";
    let i = 0;
    const tick = setInterval(() => {
      i++;
      setLoginText(msg.slice(0, i));
      if (msg[i - 1] !== ' ') playClick(); // skip spaces
      if (i >= msg.length) {
        clearInterval(tick);
        if (audioCtx) audioCtx.close().catch(() => {});
      }
    }, 60);

    const result = await login(credential.trim(), password);
    setLoading(false);
    if (!result.success) { setError(result.error); setLoginText(""); return; }
    navigate(result.role === "admin" ? "/admin" : "/dashboard", { replace: true });
  };

  // ── Design tokens ──────────────────────────────────────────────────────────
  const pageBg    = dark ? "#13172a"  : "#eef0f5";
  const cardBg    = dark ? "#1a1f30"  : "#ffffff";
  const inputBg   = dark ? "#0f1220"  : "#eef0f5";
  const headingC  = dark ? "#93c5fd"  : "#1e3a8a";
  const subC      = dark ? "#94a3b8"  : "#64748b";
  const textC     = dark ? "#e2e8f0"  : "#1e293b";
  const iconC     = dark ? "#64748b"  : "#94a3b8";
  const outerShadow = dark ? "d-neu-outer" : "neu-outer";
  const innerShadow = dark ? "d-neu-inner d-neu-input-focus" : "neu-inner neu-input-focus";
  const pillShadow  = dark ? "d-neu-pill"  : "neu-pill";

  const features = [
    { Icon: BarChartIcon, label: "Portfolio Analytics",  accent: "#60a5fa", bg: "rgba(96,165,250,0.15)"  },
    { Icon: ShieldIcon,   label: "Secure & Encrypted",   accent: "#34d399", bg: "rgba(52,211,153,0.15)"  },
    // { Icon: UsersIcon,    label: "Family Management",    accent: "#c084fc", bg: "rgba(192,132,252,0.15)" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: pageBg, transition: "background 0.4s" }}>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full"
          style={{ background: dark ? "radial-gradient(circle,rgba(30,58,138,0.35) 0%,transparent 70%)" : "radial-gradient(circle,rgba(219,234,254,0.9) 0%,transparent 65%)", filter: "blur(60px)" }} />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full"
          style={{ background: dark ? "radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)" : "radial-gradient(circle,rgba(196,181,253,0.4) 0%,transparent 70%)", filter: "blur(50px)" }} />
      </div>

      {/* ── Header ── */}
      <header className="relative z-20 flex items-center justify-end gap-3 px-8 py-5">
        <Link to="/support"
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${pillShadow}`}
          style={{ background: cardBg, color: subC }}
          title="Support">
          <ChatIcon />
        </Link>
        <button
          onClick={() => setTheme(dark ? "light" : "dark")}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${pillShadow}`}
          style={{ background: cardBg, color: subC }}
          title={dark ? "Switch to Light" : "Switch to Dark"}>
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex items-center justify-center px-4 pb-6">
        <div className="w-full max-w-6xl mx-auto">
          
          <div className="flex flex-col lg:flex-row gap-5 items-stretch justify-center">

          {/* ══ LEFT PANEL ══ */}
          <div className={`relative overflow-hidden rounded-[2.5rem] flex flex-col w-full lg:w-[420px] flex-shrink-0 ${outerShadow} fade-in`}
            style={{
              background: "linear-gradient(145deg,#1e3a8a 0%,#1e40af 40%,#312e81 100%)",
              minHeight: 460,
              padding: "2rem",
            }}>

            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: "rgba(255,255,255,0.06)", filter: "blur(1px)" }} />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: "rgba(99,102,241,0.25)", filter: "blur(2px)" }} />
            <div className="absolute top-1/2 right-8 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: "rgba(255,255,255,0.04)" }} />

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
                <span style={{ color: "#93c5fd" }}>Financial View</span>
              </h1>
              <p className="text-blue-200 text-xs font-medium leading-relaxed opacity-85 mb-5">
                Your comprehensive platform for portfolio<br />analytics, lending, and family finance.
              </p>
            </div>

            {/* ── 3D Bar Chart ── */}
            <div className="relative z-10 flex items-end justify-center gap-4 fade-in-2" style={{ height: 155 }}>
              {/* Ground reflection */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[260px] h-8 rounded-[100%]"
                style={{ background: "rgba(0,0,0,0.3)", filter: "blur(14px)" }} />

              {/* Bar 1 — Blue */}
              <div className="relative rounded-[14px] flex-shrink-0"
                style={{
                  width: 58, height: 90,
                  background: "linear-gradient(160deg,#93c5fd 0%,#3b82f6 50%,#1d4ed8 100%)",
                  boxShadow: "inset 4px 4px 8px rgba(255,255,255,0.3), inset -4px -4px 10px rgba(0,0,0,0.3), 8px 16px 28px rgba(29,78,216,0.5)",
                }}>
                <div className="absolute top-2 left-2 w-3 h-8 rounded-full opacity-40"
                  style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.8),transparent)" }} />
              </div>

              {/* Bar 2 — Green (tallest + floating) */}
              <div className="relative rounded-[14px] flex-shrink-0 bar-float flex flex-col items-center pt-3"
                style={{
                  width: 58, height: 135,
                  background: "linear-gradient(160deg,#6ee7b7 0%,#10b981 50%,#047857 100%)",
                  boxShadow: "inset 4px 4px 8px rgba(255,255,255,0.3), inset -4px -4px 10px rgba(0,0,0,0.3), 8px 16px 28px rgba(4,120,87,0.5)",
                }}>
                <div className="absolute top-2 left-2 w-3 h-8 rounded-full opacity-40"
                  style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.8),transparent)" }} />
                <div className="text-white drop-shadow-lg"><TrendUp /></div>
              </div>

              {/* Bar 3 — Purple */}
              <div className="relative rounded-[14px] flex-shrink-0"
                style={{
                  width: 58, height: 112,
                  background: "linear-gradient(160deg,#c4b5fd 0%,#8b5cf6 50%,#5b21b6 100%)",
                  boxShadow: "inset 4px 4px 8px rgba(255,255,255,0.3), inset -4px -4px 10px rgba(0,0,0,0.3), 8px 16px 28px rgba(91,33,182,0.5)",
                }}>
                <div className="absolute top-2 left-2 w-3 h-8 rounded-full opacity-40"
                  style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.8),transparent)" }} />
              </div>

              {/* Gold coin */}
              <div className="absolute coin-float flex items-center justify-center rounded-full"
                style={{
                  width: 46, height: 46,
                  top: -6, right: "calc(50% - 118px)",
                  background: "linear-gradient(145deg,#fef08a,#fbbf24,#d97706,#92400e)",
                  boxShadow: "inset 3px 3px 6px rgba(255,255,255,0.5), inset -3px -3px 8px rgba(0,0,0,0.35), 5px 10px 18px rgba(217,119,6,0.55)",
                }}>
                <span className="text-white font-black text-xl" style={{ textShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>$</span>
              </div>
            </div>

            {/* Feature pills */}
            <div className="relative z-10 flex flex-col gap-2 mt-auto pt-5 fade-in-3">
              {features.map(f => (
                <div key={f.label}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
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

          {/* ══ RIGHT: Login Card ══ */}
          <div className={`w-full lg:w-[400px] flex-shrink-0 rounded-[2.5rem] flex flex-col justify-start pt-8 px-8 pb-8 ${outerShadow} fade-in-1`}
            style={{
              background: cardBg,
              border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(30,58,138,0.08)',
            }}>

            {/* Typewriter tagline */}
            <TypewriterText dark={dark} />

            {/* Secure Login bordered card */}
            <div className="rounded-2xl p-5"
              style={{
                border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(30,58,138,0.1)',
                background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
                boxShadow: dark
                  ? '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)'
                  : '0 4px 20px rgba(30,58,138,0.07), 0 1px 4px rgba(30,58,138,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}>

            {/* Card header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div>
                <h2 className="text-base font-extrabold leading-none" style={{ color: dark ? "#ffffff" : "#1e3a8a" }}>Secure Login</h2>
                <p className="text-xs font-medium mt-1" style={{ color: subC }}>Sign in to your account</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Email / Mobile */}
              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: subC }}>
                  Email or Mobile
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: iconC }}>
                    <MailIcon />
                  </span>
                  <input
                    type="text"
                    placeholder="email@example.com or 9876543210"
                    value={credential}
                    onChange={e => { setCredential(e.target.value); setError(""); }}
                    required
                    className={`w-full rounded-2xl text-sm font-medium ${innerShadow}`}
                    style={{ padding: "13px 18px 13px 46px", background: inputBg, color: textC, border: "none" }}
                  />
                </div>
                {/* Inline validation hint */}
                {credential.length > 0 && (() => {
                  const v = credential.trim();
                  const isEmail  = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v);
                  const isMobile = /^[6-9]\d{9}$/.test(v);
                  if (isEmail)  return <p className="text-xs mt-1 font-medium" style={{ color: '#10b981' }}>✓ Valid email</p>;
                  if (isMobile) return <p className="text-xs mt-1 font-medium" style={{ color: '#10b981' }}>✓ Valid mobile number</p>;
                  if (v.length >= 5) return <p className="text-xs mt-1 font-medium" style={{ color: '#f59e0b' }}>Enter a valid email or 10-digit mobile number</p>;
                  return null;
                })()}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider" style={{ color: subC }}>Password</label>
                  <Link to="#" className="text-xs font-semibold" style={{ color: "#3b82f6" }}>Forgot Password?</Link>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: iconC }}>
                    <LockIcon />
                  </span>
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    required
                    className={`w-full rounded-2xl text-sm font-medium ${innerShadow}`}
                    style={{ padding: "13px 50px 13px 46px", background: inputBg, color: textC, border: "none" }}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                    style={{ color: iconC }}>
                    {showPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold"
                  style={{ color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-1 rounded-2xl font-extrabold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg,#3b82f6 0%,#2563eb 50%,#1d4ed8 100%)",
                  boxShadow: "0 8px 28px rgba(29,78,216,0.45), 0 2px 8px rgba(29,78,216,0.3)",
                  letterSpacing: "0.14em",
                }}>
                {loading && (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                  </svg>
                )}
                LOG IN
              </button>
            </form>

            {/* Sign up */}
            <p className="text-center mt-5 text-sm" style={{ color: subC }}>
              Don't have an account?{" "}
              <Link to="/register" className="font-bold" style={{ color: "#3b82f6" }}>Sign Up</Link>
            </p>

            {/* Google Sign-In */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
              <span className="text-xs font-semibold" style={{ color: iconC }}>or</span>
              <div className="flex-1 h-px" style={{ background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
            </div>
            <a href={GOOGLE_AUTH_URL}
              className={`flex items-center justify-center gap-3 w-full py-3 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.02] ${pillShadow}`}
              style={{ background: cardBg, color: textC, border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}>
              {/* Google G logo */}
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </a>

            </div>{/* end secure login card */}

            {/* Divider */}
            {/* <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }} />
              <span className="text-xs font-semibold" style={{ color: iconC }}>or try a demo</span>
              <div className="flex-1 h-px" style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }} />
            </div> */}

            {/* Demo buttons */}
            {/* <div className="flex gap-3">
              {[
                { id: "LR-1001", pw: "pass123",  label: "Demo User"  },
                { id: "ADMIN",   pw: "admin123",  label: "Demo Admin" },
              ].map(d => (
                <button
                  key={d.id}
                  onClick={() => { setCredential(d.id); setPassword(d.pw); setError(""); }}
                  className={`flex-1 text-xs font-semibold py-3 rounded-xl transition-all ${pillShadow}`}
                  style={{ background: dark ? "#1d222b" : "#eef0f5", color: subC }}>
                  {d.label}
                </button>
              ))}
            </div> */}

          </div>
          </div>
        </div>
      </main>

      {/* ── Login Loading Overlay ── */}
      {loading && (
        <div className="overlay-in fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{
            background: dark
              ? 'rgba(10,14,30,0.75)'
              : 'rgba(238,240,245,0.72)',
            backdropFilter: 'blur(28px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
          }}>

          {/* Soft radial glow behind the card */}
          <div className="absolute pointer-events-none"
            style={{
              width: 480, height: 480,
              borderRadius: '50%',
              background: dark
                ? 'radial-gradient(circle,rgba(59,130,246,0.18) 0%,transparent 70%)'
                : 'radial-gradient(circle,rgba(30,58,138,0.1) 0%,transparent 70%)',
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
                : '1px solid rgba(30,58,138,0.12)',
              boxShadow: dark
                ? '0 8px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'
                : '0 8px 48px rgba(30,58,138,0.12), 0 2px 0 rgba(255,255,255,0.9), inset 0 1px 0 rgba(255,255,255,0.8)',
            }}>

            {/* Spinner */}
            <div className="relative w-16 h-16">
              {/* Track */}
              <div className="absolute inset-0 rounded-full"
                style={{ border: `2px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(30,58,138,0.1)'}` }} />
              {/* Spin arc */}
              <div className="absolute inset-0 rounded-full animate-spin"
                style={{ border: '2.5px solid transparent', borderTopColor: '#3b82f6', borderRightColor: '#10b981', animationDuration: '0.85s' }} />
              {/* Outer glow */}
              <div className="absolute -inset-1.5 rounded-full pointer-events-none"
                style={{ boxShadow: '0 0 20px rgba(59,130,246,0.25)' }} />
              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#10b981)', boxShadow: '0 0 10px rgba(59,130,246,0.6)' }} />
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
                <span className="tw-cursor" style={{ color: '#3b82f6', fontWeight: 200 }}>|</span>
              </p>

              {/* Animated underline */}
              <div style={{
                height: 2,
                width: `${(loginText.length / 25) * 100}%`,
                minWidth: 4,
                maxWidth: '100%',
                borderRadius: 99,
                background: 'linear-gradient(90deg,#3b82f6,#10b981)',
                boxShadow: '0 0 8px rgba(59,130,246,0.5)',
                transition: 'width 0.06s linear',
              }} />

              <p className="text-xs font-semibold tracking-[0.18em] uppercase mt-1"
                style={{ color: dark ? 'rgba(148,163,184,0.6)' : 'rgba(30,58,138,0.45)' }}>
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
