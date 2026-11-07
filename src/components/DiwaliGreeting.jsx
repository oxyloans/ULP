import { useEffect, useState, useRef, useCallback } from 'react';
import diwaliVideo from '../assets/diwali_greeting.mp4';

/* ─── Celebratory Cracker & Fireworks Canvas Engine ────────────────────────── */
function CrackerCanvas({ triggerBurstRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const colors = [
      '#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6',
      '#EC4899', '#F97316', '#EAB308', '#14B8A6', '#6366F1',
      '#FEF08A', '#FDE047'
    ];

    const createBurst = (x, y, count = 44, speedMul = 6.4) => {
      const colA = colors[Math.floor(Math.random() * colors.length)];
      const colB = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.28 - 0.14);
        const speed = Math.random() * speedMul + 2.0;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.4 ? colA : colB,
          size: Math.random() * 3.4 + 1.6,
          alpha: 1,
          decay: Math.random() * 0.018 + 0.012,
          gravity: 0.09,
          trail: [],
        });
      }
    };

    if (triggerBurstRef) {
      triggerBurstRef.current = (x, y) => {
        createBurst(x, y, 52, 7.2);
      };
    }

    // ── Opening celebratory fireworks barrage around the video ──
    const startTimer = setTimeout(() => {
      // Left burst
      createBurst(window.innerWidth * 0.2, window.innerHeight * 0.28, 46, 6.6);
      // Right burst
      setTimeout(() => {
        createBurst(window.innerWidth * 0.8, window.innerHeight * 0.32, 46, 6.6);
      }, 150);
      // Top-center burst
      setTimeout(() => {
        createBurst(window.innerWidth * 0.5, window.innerHeight * 0.16, 54, 7.4);
      }, 350);
      // Bottom burst
      setTimeout(() => {
        createBurst(window.innerWidth * 0.5, window.innerHeight * 0.82, 42, 6.0);
      }, 600);
    }, 80);

    // Continuous auto-bursts every 1.3s around the screen
    const interval = setInterval(() => {
      const rx = window.innerWidth * (0.12 + Math.random() * 0.76);
      const ry = window.innerHeight * (0.12 + Math.random() * 0.76);
      createBurst(rx, ry, 30, 5.2);
    }, 1300);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 5) p.trail.shift();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Draw sparkler trail
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let t = 1; t < p.trail.length; t++) {
            ctx.lineTo(p.trail[t].x, p.trail[t].y);
          }
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.5;
          ctx.globalAlpha = p.alpha * 0.5;
          ctx.stroke();
        }

        // Spark head
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 9;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      clearTimeout(startTimer);
      clearInterval(interval);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [triggerBurstRef]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />;
}

/* ─── Floating Sky Lanterns ─────────────────────────────────────────────────── */
function SkyLanterns() {
  const lanterns = [
    { x: '6%',  scale: 0.75, delay: 0,   hue: '#EF4444' },
    { x: '18%', scale: 0.95, delay: 2.2, hue: '#F59E0B' },
    { x: '78%', scale: 0.9,  delay: 1.1, hue: '#10B981' },
    { x: '92%', scale: 0.8,  delay: 3.0, hue: '#8B5CF6' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {lanterns.map((l, i) => (
        <div
          key={i}
          className="absolute select-none pointer-events-none"
          style={{
            left: l.x,
            bottom: -80,
            transform: `scale(${l.scale})`,
            animation: `lanternRise 9s ${l.delay}s ease-in-out infinite`,
            filter: `drop-shadow(0 0 10px ${l.hue})`,
          }}
        >
          <svg viewBox="0 0 36 56" width="28" height="46">
            <line x1="18" y1="-20" x2="18" y2="8" stroke="#FDE68A" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
            <polygon points="18,4 30,12 6,12" fill="#FCD34D" />
            <polygon points="18,10 32,26 18,42 4,26" fill={l.hue} opacity="0.9" stroke="#FDE68A" strokeWidth="1" />
            <circle cx="18" cy="26" r="4" fill="#FFFFFF" />
            <rect x="11" y="42" width="14" height="3" rx="1" fill="#F59E0B" />
            {[12, 15, 18, 21, 24].map((tx, idx) => (
              <path
                key={idx}
                d={`M ${tx} 45 Q ${tx + (idx % 2 === 0 ? 2 : -2)} 52 ${tx} 60`}
                stroke={idx % 2 === 0 ? '#FCD34D' : l.hue}
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
            ))}
          </svg>
        </div>
      ))}
    </div>
  );
}

/* ─── Video-Only Diwali Greeting Modal ─────────────────────────────────────── */
export default function DiwaliGreeting({ onClose }) {
  const [visible, setVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(8);
  const triggerBurstRef = useRef(null);
  const videoRef = useRef(null);

  // Smooth entrance
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  // 8-second auto-close countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Escape key handler
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') handleDismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 280);
  }, [onClose]);

  // Click outside the video: launches crackers AND closes modal!
  const handleBackdropClick = (e) => {
    if (triggerBurstRef.current) {
      triggerBurstRef.current(e.clientX, e.clientY);
    }
    handleDismiss();
  };

  // Click inside the video: launches crackers at cursor
  const handleVideoClick = (e) => {
    e.stopPropagation();
    if (triggerBurstRef.current) {
      triggerBurstRef.current(e.clientX, e.clientY);
    }
  };

  // Toggle Mute / Unmute
  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 select-none cursor-pointer"
      style={{
        background: 'rgba(0, 0, 0, 0.68)',
        backdropFilter: 'blur(8px)',
        transition: 'opacity 0.3s ease',
        opacity: visible ? 1 : 0,
      }}
      onClick={handleBackdropClick}
      title="Click outside to close"
    >
      {/* ── Background Sky Lanterns ── */}
      <SkyLanterns />

      {/* ── Fullscreen Firecracker Canvas (Auto-Bursting + Click-Bursting) ── */}
      <CrackerCanvas triggerBurstRef={triggerBurstRef} />

      {/* ── VIDEO ONLY CARD ── */}
      <div
        className="relative overflow-hidden rounded-3xl w-full max-w-[720px] aspect-video bg-black cursor-default shadow-2xl transition-all"
        style={{
          border: '2px solid rgba(245, 158, 11, 0.55)',
          boxShadow: '0 25px 80px -10px rgba(0, 0, 0, 0.75), 0 0 50px rgba(245, 158, 11, 0.35)',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
          transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onClick={handleVideoClick}
      >
        {/* The Animated Video */}
        <video
          ref={videoRef}
          src={diwaliVideo}
          autoPlay
          playsInline
          muted={isMuted}
          loop
          className="w-full h-full object-cover rounded-3xl pointer-events-none select-none"
        />

        {/* ── Floating Controls on Video ── */}

        {/* Top-Right: Auto-Close Countdown Badge & Close Button */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
          {/* Countdown Pill */}
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-amber-300 backdrop-blur-md bg-black/60 border border-amber-400/40 shadow-md"
            title="Auto-closing after 8 seconds"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
            <span>Closing in {secondsLeft}s</span>
          </div>

          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="flex items-center justify-center w-8 h-8 rounded-full backdrop-blur-md bg-black/60 hover:bg-black/90 text-white hover:text-amber-300 border border-white/30 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shadow-md"
            title="Close (or click anywhere outside)"
          >
            <span className="text-sm font-bold leading-none">✕</span>
          </button>
        </div>

        {/* Bottom-Right: Sound Mute / Unmute Button */}
        <button
          onClick={toggleMute}
          className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md bg-black/65 hover:bg-black/90 text-white border border-white/30 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-md"
          title={isMuted ? 'Click to Unmute' : 'Click to Mute'}
        >
          <span>{isMuted ? '🔇' : '🔊'}</span>
          <span className="text-[11px]">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        {/* Bottom-Left: Interactive Hint */}
        <div className="absolute bottom-3 left-3 z-30 px-3 py-1 rounded-full text-[10px] font-semibold text-white/80 backdrop-blur-md bg-black/45 border border-white/15 pointer-events-none hidden sm:block">
          ✨ Click outer to close • Click to burst crackers!
        </div>

        {/* 8-Second Visual Countdown Progress Line along bottom edge */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-black/40 overflow-hidden pointer-events-none z-30">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-amber-300 transition-all duration-1000 ease-linear"
            style={{ width: `${(secondsLeft / 8) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Keyframe Animations ── */}
      <style>{`
        @keyframes lanternRise {
          0% {
            transform: translateY(0) rotate(-3deg);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          90% {
            opacity: 0.85;
          }
          100% {
            transform: translateY(-120vh) rotate(3deg);
            opacity: 0;
          }
        }

        @keyframes diyaWiggle {
          0%   { transform: rotate(-8deg) scale(1.15); }
          100% { transform: rotate(8deg) scale(1.25); }
        }
      `}</style>
    </div>
  );
}

/* ─── Happy Diwali Header Hover Button (Topbar & AdminTopbar) ────────────────── */
export function DiwaliHeaderButton({ className = '' }) {
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('openDiwaliGreeting'));
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title="✨ Celebrate Diwali! Click to open greeting 🪔"
        className={`group relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all duration-300 hover:scale-[1.04] active:scale-95 cursor-pointer ${className}`}
        style={{
          background: hovered
            ? 'linear-gradient(135deg, #FEF3C7 0%, #FFEDD5 100%)'
            : 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          border: '1.5px solid #F59E0B',
          boxShadow: hovered
            ? '0 4px 14px rgba(245, 158, 11, 0.4), 0 0 8px rgba(251, 191, 36, 0.4)'
            : '0 2px 8px rgba(245, 158, 11, 0.2)',
        }}
      >
        <span
          className="text-base select-none inline-block transition-transform duration-300"
          style={{
            transform: hovered ? 'rotate(-10deg) scale(1.2)' : 'rotate(0deg) scale(1)',
            animation: hovered ? 'diyaWiggle 0.6s ease-in-out infinite alternate' : 'none',
          }}
        >
          🪔
        </span>

        <span className="text-xs font-black tracking-wide uppercase select-none hidden sm:inline text-[#7F1D1D]">
          Happy Diwali
        </span>

        <span className="text-xs text-amber-500 animate-pulse select-none">
          ✨
        </span>
      </button>
    </div>
  );
}
