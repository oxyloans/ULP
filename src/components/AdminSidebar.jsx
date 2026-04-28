import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomeIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const CheckIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const BuildingIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>;
const BankIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>;
const PackageIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const SupportIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const WalletIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="18" cy="12" r="2"/></svg>;
const LogoutIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const PlusIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const CloseIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const navItems = [
  { title: 'Dashboard',        path: '/admin/dashboard',        Icon: HomeIcon,     badge: null },
  { title: 'Family Approvals', path: '/admin/approvals',        Icon: CheckIcon,    badge: null },
  { title: 'Wallet Approvals', path: '/admin/wallet-approvals', Icon: WalletIcon,   badge: '3'  },
  { title: 'Create Deal',      path: '/admin/create-deal',      Icon: PlusIcon,     badge: null },
  { title: 'OxyLoans',         path: '/admin/oxyloans',         Icon: BankIcon,     badge: null },
  { title: 'Offline Deals',    path: '/admin/offline',          Icon: PackageIcon,  badge: null },
  { title: 'Properties',       path: '/admin/properties',       Icon: BuildingIcon, badge: null },
  { title: 'Bank Accounts',    path: '/admin/bank-accounts',    Icon: BankIcon,     badge: null },
  { title: 'Support',          path: '/admin/support',          Icon: SupportIcon,  badge: null },
];

function AdminSidebarContent({ onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login', { replace: true }); onClose?.(); };

  return (
    <>
      <div className="px-5 pt-5 pb-2">
        <span className="admin-sidebar-section-label">Admin Panel</span>
      </div>
      <nav className="flex-1 px-3 pb-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path} onClick={() => onClose?.()}
            className="admin-sidebar-item"
            style={({ isActive }) => isActive
              ? { background: 'linear-gradient(135deg,rgba(168,85,247,0.2),rgba(168,85,247,0.08))', border: '1px solid rgba(168,85,247,0.35)', color: '#c084fc', boxShadow: '0 2px 12px rgba(168,85,247,0.15)' }
              : { background: 'transparent', border: '1px solid transparent', color: 'var(--admin-sidebar-text)' }
            }>
            {({ isActive }) => (
              <>
                <span className="admin-sidebar-icon" style={{ color: isActive ? '#c084fc' : undefined }}><item.Icon /></span>
                <span className="admin-sidebar-label">{item.title}</span>
                {item.badge && (
                  <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', fontSize: 10 }}>
                    {item.badge}
                  </span>
                )}
                {isActive && !item.badge && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#c084fc', boxShadow: '0 0 6px #c084fc' }} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-3 flex-shrink-0 admin-sidebar-footer">
        <button onClick={handleLogout} className="admin-sidebar-item admin-sidebar-logout w-full text-left">
          <span className="admin-sidebar-icon"><LogoutIcon /></span>
          <span className="admin-sidebar-label">Log Out</span>
        </button>
      </div>
    </>
  );
}

export default function AdminSidebar({ mobileOpen, onClose }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col admin-sidebar-shell">
        <AdminSidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <aside className="relative flex flex-col w-[260px] h-full z-10"
            style={{ background: 'var(--admin-sidebar-bg)', borderRight: '1px solid var(--admin-sidebar-border)', boxShadow: '4px 0 32px rgba(0,0,0,0.5)' }}>
            <button onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc' }}>
              <CloseIcon />
            </button>
            <AdminSidebarContent onClose={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
