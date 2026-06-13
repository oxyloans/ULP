import { NavLink, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { hasPermission, ADMIN_ROLES, PERM } from '../config/adminRoles';
import logo from '../assets/WULP.png';

const MenuIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const BellIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const ShieldIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

// Determine the primary role for display
function getPrimaryRole(roles) {
  if (!roles || !roles.length) return null;
  if (roles.includes('ADMIN')) return 'ADMIN';
  for (const role of roles) {
    if (ADMIN_ROLES[role]) return role;
  }
  return null;
}

export default function AdminTopbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const roles = user?.roles ?? [];
  const primaryRole = getPrimaryRole(roles);
  const roleDef   = primaryRole ? ADMIN_ROLES[primaryRole] : null;
  const isSuperAdmin = primaryRole === 'SUPERADMIN';
  const canManageAssets = hasPermission(roles, PERM.ASSETS);
  const canManageInterest = hasPermission(roles, PERM.INTEREST);
  const displayName  = user?.name || (primaryRole ? roleDef?.label : 'Admin');
  const initial = displayName.charAt(0).toUpperCase();
  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <header className="admin-topbar-shell lg:pl-[35px]">

      {/* Hamburger — mobile only */}
      <button onClick={onMenuClick}
        className="lg:hidden w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mr-1"
        style={{ background: 'var(--topbar-icon-bg)', border: '1px solid var(--topbar-icon-border)', color: 'var(--topbar-icon-color)' }}>
        <MenuIcon />
      </button>

      {/* Brand — far left */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <img src={logo} alt="Oxy Portfolio" className="w-32 h-19 rounded-full object-cover flex-shrink-0" />
      </div>

      <div className="w-px h-5 flex-shrink-0" style={{ background: 'var(--topbar-sep-color)' }} />

      {/* Centre: greeting + role badge */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs font-medium truncate" style={{ color: 'var(--text-muted)' }}>
          Good {getGreeting()},{' '}
          {/* <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{displayName}</span> */}
        </span>

        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.34)' }}>
          <span className="rounded-full" style={{ width: 5, height: 5, background: '#22c55e', display: 'inline-block', animation: 'livePulse 2s infinite' }} />
          <span className="text-xs font-semibold" style={{ color: '#ffffff', fontSize: 10 }}>Live</span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Quick-links only for roles that have access */}
        {(isSuperAdmin || canManageAssets || canManageInterest) && (
          <>
            {(isSuperAdmin || canManageAssets) && (
              <NavLink to="/admin/assets/load"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                style={({ isActive }) => ({
                  background: isActive ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'rgba(255,255,255,0.16)',
                  border: isActive ? '1px solid transparent' : '1px solid rgba(255,255,255,0.32)',
                  color: '#fff',
                  boxShadow: isActive ? '0 4px 12px rgba(37,99,235,0.35)' : 'none',
                })}>
                Load Asset
              </NavLink>
            )}
            {(isSuperAdmin || canManageInterest) && (
              <NavLink to="/admin/interest/sd-lot"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                style={({ isActive }) => ({
                  background: isActive ? 'linear-gradient(135deg,#a855f7,#7c3aed)' : 'rgba(255,255,255,0.16)',
                  border: isActive ? '1px solid transparent' : '1px solid rgba(255,255,255,0.32)',
                  color: '#fff',
                })}>
                <ShieldIcon />
                Interest Payout
              </NavLink>
            )}
          </>
        )}
        <ThemeToggle />
        <button className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{ background: 'var(--topbar-icon-bg)', border: '1px solid var(--topbar-icon-border)', color: 'var(--topbar-icon-color)' }}>
          <BellIcon />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.6)' }} />
        </button>
        <button onClick={handleLogout} title="Logout"
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.32)' }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
            style={{ background: `linear-gradient(135deg,${roleDef?.color ?? '#a855f7'},${roleDef?.color ?? '#7c3aed'})`, color: '#fff', boxShadow: `0 0 10px ${roleDef?.color ?? '#a855f7'}40` }}>
            {initial}
          </div>
          <div className="hidden sm:block leading-none">
            <p className="text-xs font-bold truncate max-w-[80px]" style={{ color: 'var(--text-primary)' }}>{roleDef?.label ?? 'Admin'}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 9, fontWeight: 600 }}>Logout</p>
          </div>
        </button>
      </div>

    </header>
  );
}
