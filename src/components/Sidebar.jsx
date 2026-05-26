import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/ulp.png';

// ─── Icons ────────────────────────────────────────────────────────────────────
const ContactIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const WalletIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="18" cy="12" r="2"/></svg>;
const SDLotIcon      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>;
const LogoutIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const ChevronDown    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="6 9 12 15 18 9"/></svg>;
const BankIcon       = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>;
const TrendIcon      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const DealsIcon      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>;
const CloseIcon      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ProfileIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const Building       = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><rect x="3" y="4" width="18" height="17" rx="1"/><path d="M3 8h18"/><rect x="6" y="11" width="3" height="3" rx="0.5"/><rect x="10.5" y="11" width="3" height="3" rx="0.5"/><rect x="15" y="11" width="3" height="3" rx="0.5"/><rect x="6" y="16" width="3" height="2" rx="0.5"/><rect x="15" y="16" width="3" height="2" rx="0.5"/><rect x="10" y="16" width="4" height="5" rx="0.5"/><path d="M1 21h22"/></svg>
const GoldIcon       = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><circle cx="12" cy="12" r="9"/><path d="M9 9h1.5a1.5 1.5 0 0 1 0 3H9v3"/><path d="M9 12h3"/></svg>
const ParticipateIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>

// ─── Nav structure ────────────────────────────────────────────────────────────
// To add more sub-items under Deals, just push to the `children` array.
const NAV_ITEMS = [
  { title: 'Dashboard', path: '/dashboard', Icon: BankIcon, comingSoon: false },
  {
    title: 'Offline Deals',
    Icon: DealsIcon,
    children: [
      { title: 'SD Lots',    path: '/sd-lots',    Icon: SDLotIcon, comingSoon: false },
      { title: 'Gold Deals', path: '/gold-deals', Icon: GoldIcon,  comingSoon: false },
      { title: 'Asset',      path: '/asset',      Icon: Building,  comingSoon: false },
    ],
  },
  {
    title: 'My Participations',
    Icon: ParticipateIcon,
    children: [
      { title: 'SD Deals',   path: '/my-participations',        Icon: SDLotIcon, comingSoon: false },
      { title: 'Gold Deals', path: '/gold-deals-participation', Icon: GoldIcon,  comingSoon: false },
      { title: 'Asset',      path: '/asset',                    Icon: Building,  comingSoon: true  },
    ],
  },
  { title: 'Wallet',     path: '/wallet',   Icon: WalletIcon,  comingSoon: false },
  { title: 'Profile',    path: '/profile',  Icon: ProfileIcon, comingSoon: false },
  { title: 'Contact Us', path: '/contact',  Icon: ContactIcon, comingSoon: false },
];

const DEALS_PATHS        = ['/sd-lots', '/sd-lot', '/asset', '/gold-deals',];
const PARTICIPATE_PATHS  = ['/my-participations','/gold-deals-participation','/gold-deals/participation/'];

function pathMatches(pathname, basePath) {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

const activeStyle = {
  background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.06) 100%)',
  border: '1px solid rgba(99,102,241,0.3)',
  color: '#818cf8',
  boxShadow: '0 2px 12px rgba(99,102,241,0.12)',
};
const idleStyle = { background: 'transparent', border: '1px solid transparent', color: 'var(--sidebar-text)' };

// ─── Collapsible nav group ────────────────────────────────────────────────────
function DealsGroup({ item, activePaths, open, onToggle, onClose }) {
  const location = useLocation();
  const isAnyChildActive = activePaths.some(p => pathMatches(location.pathname, p));

  return (
    <div>
      <button
        onClick={onToggle}
        className="sidebar-item w-full text-left"
        style={isAnyChildActive ? activeStyle : idleStyle}>
        <span className="sidebar-icon" style={{ color: isAnyChildActive ? '#818cf8' : undefined }}>
          <item.Icon />
        </span>
        <span className="sidebar-label">{item.title}</span>
        <span className="ml-auto transition-transform duration-200 opacity-60"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <ChevronDown />
        </span>
      </button>

      {open && (
        <div className="ml-3 mt-0.5 flex flex-col gap-0.5 pl-3"
          style={{ borderLeft: '1.5px solid rgba(99,102,241,0.2)' }}>
          {item.children.map(child => child.comingSoon ? (
            <div key={child.path}
              className="sidebar-item cursor-default"
              style={{ background: 'transparent', border: '1px solid transparent', color: 'var(--sidebar-text-muted)', opacity: 0.5, paddingLeft: 10 }}>
              <span className="sidebar-icon"><child.Icon /></span>
              <span className="sidebar-label text-xs">{child.title}</span>
              <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', fontSize: 9 }}>
                Soon
              </span>
            </div>
          ) : (
            <NavLink key={child.path} to={child.path} onClick={() => onClose?.()}
              className="sidebar-item"
              style={({ isActive }) => isActive ? activeStyle : idleStyle}>
              {({ isActive }) => (
                <>
                  <span className="sidebar-icon" style={{ color: isActive ? '#818cf8' : undefined, paddingLeft: 2 }}>
                    <child.Icon />
                  </span>
                  <span className="sidebar-label text-xs">{child.title}</span>
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#818cf8', boxShadow: '0 0 6px #818cf8' }} />}
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Shared nav content ───────────────────────────────────────────────────────
function SidebarContent({ onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => { logout(); navigate('/login', { replace: true }); onClose?.(); };

  // Accordion: only one group open at a time.
  // Seed with whichever group has an active child on first render.
  const initialOpen = () => {
    if (DEALS_PATHS.some(p => pathMatches(location.pathname, p)))       return 'Offline Deals';
    if (PARTICIPATE_PATHS.some(p => pathMatches(location.pathname, p))) return 'My Participations';
    return null;
  };
  const [openGroup, setOpenGroup] = useState(initialOpen);

  const toggleGroup = (title) =>
    setOpenGroup(prev => prev === title ? null : title);

  return (
    <>
      <div className="px-5 pt-5 pb-2">
        {/* <div className="flex items-center gap-2.5 mb-3">
          <img src={logo} alt="Oxy Portfolio" className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            style={{ background: '#fff', boxShadow: '0 0 10px rgba(99,102,241,0.35)' }} />
          <span className="text-sm font-black tracking-widest uppercase"
            style={{ color: 'var(--text-primary)', letterSpacing: '0.08em' }}>
            Oxy Portfolio
          </span>
        </div> */}
        <span className="sidebar-section-label">MENU</span>
      </div>

      <nav className="flex-1 px-3 pb-3 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          // Collapsible group (has children)
          if (item.children) {
            const activePaths = item.title === 'My Participations' ? PARTICIPATE_PATHS : DEALS_PATHS;
            return (
              <DealsGroup
                key={item.title}
                item={item}
                activePaths={activePaths}
                open={openGroup === item.title}
                onToggle={() => toggleGroup(item.title)}
                onClose={onClose}
              />
            );
          }
          // Coming soon
          if (item.comingSoon) {
            return (
              <div key={item.path} className="sidebar-item cursor-default"
                style={{ background: 'transparent', border: '1px solid transparent', color: 'var(--sidebar-text-muted)', opacity: 0.5 }}>
                <span className="sidebar-icon"><item.Icon /></span>
                <span className="sidebar-label">{item.title}</span>
                <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', fontSize: 9 }}>
                  Soon
                </span>
              </div>
            );
          }
          // Regular nav link
          return (
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
          );
        })}
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <aside className="relative flex flex-col w-[260px] h-full z-10"
            style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)', boxShadow: '4px 0 32px rgba(0,0,0,0.3)' }}>
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

