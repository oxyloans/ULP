import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';

// ─── Icons ────────────────────────────────────────────────────────────────────
const HomeIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const UsersIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ReportIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>;
const ContactIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const WalletIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="18" cy="12" r="2"/></svg>;
const SDLotIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>;
const LogoutIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const ChevronDown = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="6 9 12 15 18 9"/></svg>;
const BankIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px]"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>;
const PackageIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px]"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const ZapIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px]"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const TrendIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const CloseIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

// const DASH_MODES = [
//   { value: 'A', label: 'Offline Deals', Icon: PackageIcon, color: '#f59e0b' },
// ];

const ProfileIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

const NAV_ITEMS = [
  { title: 'Dashboard',         path: '/dashboard',          Icon: BankIcon,     comingSoon: false },
  { title: 'Deals',             path: '/sd-lots',            Icon: SDLotIcon,    comingSoon: false },
  { title: 'My Participations', path: '/my-participations',  Icon: TrendIcon,    comingSoon: false },
  { title: 'Wallet',            path: '/wallet',             Icon: WalletIcon,   comingSoon: false },
  { title: 'Profile',           path: '/profile',            Icon: ProfileIcon,  comingSoon: false },
  { title: 'Family Members',    path: '/family',             Icon: UsersIcon,    comingSoon: true  },
  { title: 'Revenue Report',    path: '/revenue',            Icon: ReportIcon,   comingSoon: true  },
  { title: 'Contact Us',        path: '/contact',            Icon: ContactIcon,  comingSoon: false },
];

const DASH_SUBPATHS = ['/dashboard', '/'];

const activeStyle = {
  background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.06) 100%)',
  border: '1px solid rgba(99,102,241,0.3)',
  color: '#818cf8',
  boxShadow: '0 2px 12px rgba(99,102,241,0.12)',
};
const idleStyle = { background: 'transparent', border: '1px solid transparent', color: 'var(--sidebar-text)' };

// ─── Shared nav content (used by both desktop sidebar and mobile drawer) ──────
function SidebarContent({ onClose }) {
  const { logout } = useAuth();
  const { mode, setMode } = useMode();
  const navigate = useNavigate();
  const location = useLocation();

  const isDashPath = DASH_SUBPATHS.includes(location.pathname);
  const [manualOpen, setManualOpen] = useState(isDashPath);
  const dashOpen   = isDashPath ? manualOpen : false;
  const isDashActive = isDashPath;

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); onClose?.(); };

  const handleDashClick = () => {
    navigate('/dashboard');
    if (isDashPath) setManualOpen(o => !o);
    else setManualOpen(true);
  };

  const go = (path) => { navigate(path); onClose?.(); };

  return (
    <>
      <div className="px-5 pt-5 pb-2">
        <span className="sidebar-section-label">Navigation</span>
      </div>

      <nav className="flex-1 px-3 pb-3 flex flex-col gap-0.5 overflow-y-auto">
        {/* Dashboard dropdown */}
        {/* <div>
          <button onClick={handleDashClick} className="sidebar-item w-full text-left"
            style={isDashActive ? activeStyle : idleStyle}>
            <span className="sidebar-icon" style={{ color: isDashActive ? '#818cf8' : undefined }}><HomeIcon /></span>
            <span className="sidebar-label">Dashboard</span>
            <span className="ml-auto transition-transform duration-200 opacity-50"
              style={{ transform: dashOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
              <ChevronDown />
            </span>
          </button>
          {dashOpen && (
            <div className="sidebar-submenu">
              {DASH_MODES.map(m => (
                <button key={m.value}
                  onClick={() => { setMode(m.value); go('/dashboard'); }}
                  className="sidebar-subitem w-full text-left"
                  style={mode === m.value
                    ? { background: `${m.color}14`, border: `1px solid ${m.color}30`, color: m.color }
                    : { background: 'transparent', border: '1px solid transparent', color: 'var(--sidebar-text-muted)' }
                  }>
                  <span style={{ color: mode === m.value ? m.color : 'inherit' }}><m.Icon /></span>
                  <span className="text-xs font-medium">{m.label}</span>
                  {mode === m.value && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: m.color, boxShadow: `0 0 6px ${m.color}` }} />}
                </button>
              ))}
            </div>
          )}
        </div> */}

        {/* Other items */}
        {NAV_ITEMS.map(item => item.comingSoon ? (
          <div key={item.path} className="sidebar-item cursor-default"
            style={{ background: 'transparent', border: '1px solid transparent', color: 'var(--sidebar-text-muted)', opacity: 0.5 }}>
            <span className="sidebar-icon"><item.Icon /></span>
            <span className="sidebar-label">{item.title}</span>
            <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', fontSize: 9 }}>
              Soon
            </span>
          </div>
        ) : (
          <NavLink key={item.path} to={item.path} onClick={() => onClose?.()}
            className="sidebar-item"
            style={({ isActive }) => isActive ? activeStyle : idleStyle}>
            {({ isActive }) => (
              <>
                <span className="sidebar-icon" style={{ color: isActive ? '#818cf8' : undefined }}><item.Icon /></span>
                <span className="sidebar-label">{item.title}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#818cf8', boxShadow: '0 0 6px #818cf8' }} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 flex-shrink-0 sidebar-footer">
        <button onClick={handleLogout} className="sidebar-item sidebar-logout w-full text-left">
          <span className="sidebar-icon"><LogoutIcon /></span>
          <span className="sidebar-label">Log Out</span>
        </button>
      </div>
    </>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col sidebar-shell">
        <SidebarContent />
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          {/* Drawer */}
          <aside className="relative flex flex-col w-[260px] h-full z-10"
            style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)', boxShadow: '4px 0 32px rgba(0,0,0,0.3)' }}>
            {/* Close button */}
            <button onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <CloseIcon />
            </button>
            <SidebarContent onClose={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
