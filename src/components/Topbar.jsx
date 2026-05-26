import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useFamily } from '../context/FamilyContext';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../api/afterlogin-user';
import { getUserId } from '../api/client';
import logo from '../assets/WULP.png';

// ─── Icons ────────────────────────────────────────────────────────────────────
const MenuIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const BellIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const UsersIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const GridIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const CheckIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>;
const LogoutIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const UserIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IdCardIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const ChevronR   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="9 18 15 12 9 6"/></svg>;

const MEMBER_COLORS = { 'FM-001': '#6366f1', 'FM-002': '#ec4899', 'FM-003': '#10b981' };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

const PAGE_LABELS = {
  '/dashboard':   'Dashboard',
  '/sd-lots':     'SD Lots',
  '/sd-lot/create': 'Create Deal',
  '/wallet':      'Wallet',
  '/wallet/history': 'Wallet History',
  '/family':      'Family Members',
  '/revenue':     'Revenue Report',
  '/contact':     'Contact Us',
};

// ─── Family Switcher ──────────────────────────────────────────────────────────
function FamilySwitcher() {
  const { approvedMembers, selectedMemberId, setSelectedMemberId, hasFamily } = useFamily();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Don't render if no family
  if (!hasFamily) return null;

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const isFamily = !selectedMemberId;
  const color = isFamily ? '#f59e0b' : (MEMBER_COLORS[selectedMemberId] ?? '#6366f1');

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} title="Switch member"
        className="topbar-icon-btn"
        style={{ color, borderColor: open ? `${color}50` : undefined, background: open ? `${color}12` : undefined }}>
        <UsersIcon />
        {selectedMemberId && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2"
            style={{ background: color, borderColor: 'var(--topbar-bg)' }} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 z-50 rounded-2xl overflow-hidden"
          style={{
            width: 256,
            background: 'var(--surface-card)',
            border: '1px solid var(--border)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            backdropFilter: 'blur(24px)',
            '--text-primary': '#0f172a',
            '--text-muted': '#64748b',
          }}>
          <div className="px-4 py-2.5 flex items-center gap-2"
            style={{ borderBottom: '1px solid var(--border)', background: 'rgba(99,102,241,0.04)' }}>
            <UsersIcon />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6366f1' }}>View As</span>
          </div>
          {approvedMembers.filter(m => m.id === 'FM-001').map(m => {
            const mc = MEMBER_COLORS[m.id] ?? '#6366f1';
            const isSel = selectedMemberId === m.id;
            return (
              <button key={m.id} onClick={() => { setSelectedMemberId(m.id); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                  style={{ background: `${mc}20`, border: `1px solid ${mc}30`, color: mc }}>{m.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{m.name}</p>
                    <span className="text-xs px-1.5 rounded-full" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontSize: 9 }}>You</span>
                  </div>
                  <p className="text-xs font-mono font-bold mt-0.5" style={{ color: mc }}>{m.lrId}</p>
                </div>
                {isSel && <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: mc, color: '#fff' }}><CheckIcon /></span>}
              </button>
            );
          })}
          <div className="px-4 py-1.5" style={{ background: 'var(--surface-elevated)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Family</span>
          </div>
          {approvedMembers.filter(m => m.id !== 'FM-001').map(m => {
            const mc = MEMBER_COLORS[m.id] ?? '#10b981';
            const isSel = selectedMemberId === m.id;
            return (
              <button key={m.id} onClick={() => { setSelectedMemberId(m.id); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                  style={{ background: `${mc}20`, border: `1px solid ${mc}30`, color: mc }}>{m.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{m.name}</p>
                  <p className="text-xs font-mono font-bold mt-0.5" style={{ color: mc }}>{m.lrId}</p>
                </div>
                {isSel && <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: mc, color: '#fff' }}><CheckIcon /></span>}
              </button>
            );
          })}
          <button onClick={() => { setSelectedMemberId(null); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
            onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.22)', color: '#f59e0b' }}>
              <GridIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Family Overview</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>All members combined</p>
            </div>
            {isFamily && <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#f59e0b', color: '#fff' }}><CheckIcon /></span>}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────
function ProfileDropdown({ userName, userShort, userLr, userColor, fullName }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = () => { setOpen(false); logout(); navigate('/login', { replace: true }); };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} title="Profile"
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all hover:scale-105"
        style={{
          background: `linear-gradient(135deg,${userColor},${userColor}99)`,
          color: '#fff',
          boxShadow: open ? `0 0 0 3px ${userColor}35, 0 0 16px ${userColor}30` : `0 0 10px ${userColor}25`,
          border: `2px solid ${open ? userColor + '60' : 'transparent'}`,
        }}>
        {(userShort || userName).charAt(0).toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 z-50 rounded-2xl overflow-hidden"
          style={{
            width: 224,
            background: 'var(--surface-card)',
            border: '1px solid var(--border)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            backdropFilter: 'blur(24px)',
            '--text-primary': '#0f172a',
            '--text-muted': '#64748b',
          }}>
          <div className="px-4 py-4 flex items-center gap-3"
            style={{ borderBottom: '1px solid var(--border)', background: `linear-gradient(135deg,${userColor}0a,transparent)` }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
              style={{ background: `linear-gradient(135deg,${userColor},${userColor}88)`, color: '#fff', boxShadow: `0 0 16px ${userColor}30` }}>
              {userName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{fullName}</p>
              <p className="text-xs font-mono font-bold" style={{ color: userColor }}>{userLr}</p>
            </div>
          </div>
          <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
            {[
              { Icon: UserIcon,   label: 'Full Name', value: fullName },
              { Icon: IdCardIcon, label: 'User ID',   value: userLr, mono: true },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-2.5 py-2">
                <span style={{ color: 'var(--text-muted)' }}><r.Icon /></span>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.label}</p>
                  <p className={`text-xs font-semibold ${r.mono ? 'font-mono' : ''}`}
                    style={{ color: r.mono ? userColor : 'var(--text-primary)' }}>{r.value}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ color: '#ef4444' }}><LogoutIcon /></span>
            <span className="text-sm font-semibold" style={{ color: '#ef4444' }}>Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const { selectedMember, selectedMemberId, hasFamily } = useFamily();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getUserProfile()
      .then(p => { if (p) setProfile(p); })
      .catch(() => {});
  }, []);

  const userId     = getUserId();
  const uuidSuffix = userId ? `…${userId.slice(-4)}` : '';

  const isFamily = !selectedMemberId;

  // Name: merge firstName + lastName from profile API as the real name
  const firstName = profile?.firstName ?? '';
  const lastName  = profile?.lastName  ?? '';
  const fullName  = (firstName + ' ' + lastName).trim() || user?.name || '—';
  const userName  = fullName.split(' ')[0] || '—';

  const userLr    = uuidSuffix;
  const userColor = MEMBER_COLORS[selectedMemberId] ?? '#6366f1';

  const pageLabel = Object.entries(PAGE_LABELS).find(([k]) => location.pathname.startsWith(k))?.[1] ?? 'Dashboard';

  return (
    <header className="topbar-shell lg:pl-[55px]">

      {/* Hamburger — mobile only */}
      <button onClick={onMenuClick}
        className="lg:hidden topbar-icon-btn flex-shrink-0 mr-1">
        <MenuIcon />
      </button>

      {/* Brand — end of left section */}
        <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 flex-shrink-0">
          <img src={logo} alt="Unified Lending platform" className="w-32 h-13 object-cover flex-shrink-1"
            style={{ boxShadow: '0 0 10px rgba(99,102,241,0.4)' }} />
          {/* <span className="text-xs font-black tracking-widest uppercase"
            style={{ color: 'var(--text-primary)', letterSpacing: '0.1em' }}>
            Oxy Portfolio
          </span> */}
        </div>

      {/* Left: page label + greeting + live + Brand at end */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* <span className="topbar-sep">·</span>
        <span className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          Good {getGreeting()},{' '}
          <span style={{ color: userColor, fontWeight: 700 }}>
            {hasFamily && !selectedMemberId ? 'Family' : fullName}
          </span>
        </span>
        <div className="topbar-live-badge">
          <span className="live-dot" style={{ width: 5, height: 5 }} />
          <span style={{ color: '#10b981', fontSize: 10, fontWeight: 600 }}>Live</span>
        </div> */}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <FamilySwitcher />
        <ThemeToggle />
        <button className="topbar-icon-btn relative">
          <BellIcon />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.6)' }} />
        </button>
        <ProfileDropdown userName={fullName} userShort={userName} userLr={userLr} userColor={userColor} fullName={fullName} />
      </div>

    </header>
  );
}
