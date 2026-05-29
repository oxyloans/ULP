import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/ulp.png';

const HomeIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const CheckIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const BuildingIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>;
const BankIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>;
const PackageIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const CoinIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9 9h4a2 2 0 0 1 0 4H9v4h6"/></svg>;
const SupportIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const WalletIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="18" cy="12" r="2"/></svg>;
const LogoutIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const PlusIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const CloseIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const AssetIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const ChevronDown  = ({ open }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}><polyline points="6 9 12 15 18 9"/></svg>;

const assetSubItems = [
  { title: 'Load Asset',        path: '/admin/assets/load'      },
  { title: 'View Assets',       path: '/admin/assets/view'      },
  { title: 'Allocated Assets',  path: '/admin/assets/allocated' },
];

const interestSubItems = [
  { title: 'SD Lot',       path: '/admin/interest/sd-lot'  },
  { title: 'Asset Payout', path: '/admin/interest/asset'   },
];
const migratedSubItems = [
  { title: 'Migrated Users', path: '/admin/migrated-users' },
  { title: 'Migrated Total Data', path: '/admin/migrated-total-data' },
];
const walletSubItems = [
  { title: 'Wallet Approvals', path: '/admin/wallet-approvals' },
  { title: 'Wallet Withdrawals', path: '/admin/wallet-withdrawals' },
];

const UsersIcon2   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const MigrateIcon2 = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;

const navItemsBefore = [
  { title: 'Dashboard',        path: '/admin/dashboard',        Icon: HomeIcon,     badge: null },
  { title: 'Create Deal',      path: '/admin/create-deal',      Icon: PlusIcon,     badge: null },
  { title: 'Total Users',      path: '/admin/total-users',      Icon: UsersIcon2,   badge: null },
  { title: 'Offline Deals',    path: '/admin/offline',          Icon: PackageIcon,  badge: null },
];

const navItemsAfter = [
  { title: 'OxyLoans',         path: '/admin/oxyloans',         Icon: BankIcon,     badge: null },
  { title: 'Family Approvals', path: '/admin/approvals',        Icon: CheckIcon,    badge: null },
  { title: 'Properties',       path: '/admin/properties',       Icon: BuildingIcon, badge: null },
  { title: 'Bank Accounts',    path: '/admin/bank-accounts',    Icon: BankIcon,     badge: null },
  { title: 'Support',          path: '/admin/support',          Icon: SupportIcon,  badge: null },
];

function AdminSidebarContent({ onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAssetActive    = location.pathname.startsWith('/admin/assets');
  const isInterestActive = location.pathname.startsWith('/admin/interest');
  const isMigratedActive = location.pathname.startsWith('/admin/migrated-');
  const isWalletActive   = location.pathname.startsWith('/admin/wallet-');
  const [openSection, setOpenSection] = useState(
    isAssetActive ? 'assets'
      : isInterestActive ? 'interest'
      : isMigratedActive ? 'migrated'
      : isWalletActive ? 'wallet'
      : null
  );
  const assetOpen = openSection === 'assets';
  const interestOpen = openSection === 'interest';
  const migratedOpen = openSection === 'migrated';
  const walletOpen = openSection === 'wallet';

  const toggleSection = (section) => {
    setOpenSection(current => current === section ? null : section);
  };

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); onClose?.(); };

  return (
    <>
      <div className="px-5 pt-5 pb-2">
        <span className="admin-sidebar-section-label">Admin Panel</span>
      </div>
      <nav className="flex-1 px-3 pb-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItemsBefore.map(item => (
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

        {/* ── Migrated accordion ── */}
        <button
          onClick={() => toggleSection('migrated')}
          className="admin-sidebar-item w-full text-left"
          style={isMigratedActive
            ? { background: 'linear-gradient(135deg,rgba(168,85,247,0.2),rgba(168,85,247,0.08))', border: '1px solid rgba(168,85,247,0.35)', color: '#c084fc', boxShadow: '0 2px 12px rgba(168,85,247,0.15)' }
            : { background: 'transparent', border: '1px solid transparent', color: 'var(--admin-sidebar-text)' }
          }>
          <span className="admin-sidebar-icon" style={{ color: isMigratedActive ? '#c084fc' : undefined }}><MigrateIcon2 /></span>
          <span className="admin-sidebar-label">Migrated</span>
          <span className="ml-auto"><ChevronDown open={migratedOpen} /></span>
        </button>

        {migratedOpen && (
          <div className="flex flex-col gap-0.5 pl-3 mt-0.5">
            {migratedSubItems.map(sub => (
              <NavLink key={sub.path} to={sub.path} onClick={() => onClose?.()}
                className="admin-sidebar-item text-xs"
                style={({ isActive }) => isActive
                  ? { background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }
                  : { background: 'transparent', border: '1px solid transparent', color: 'var(--admin-sidebar-text)' }
                }>
                {({ isActive }) => (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 ml-1 mr-1"
                      style={{ background: isActive ? '#c084fc' : 'rgba(168,85,247,0.35)' }} />
                    <span className="admin-sidebar-label">{sub.title}</span>
                    {isActive && <span className="ml-auto w-1 h-1 rounded-full" style={{ background: '#c084fc' }} />}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        )}

        {/* ── Wallet accordion ── */}
        <button
          onClick={() => toggleSection('wallet')}
          className="admin-sidebar-item w-full text-left"
          style={isWalletActive
            ? { background: 'linear-gradient(135deg,rgba(168,85,247,0.2),rgba(168,85,247,0.08))', border: '1px solid rgba(168,85,247,0.35)', color: '#c084fc', boxShadow: '0 2px 12px rgba(168,85,247,0.15)' }
            : { background: 'transparent', border: '1px solid transparent', color: 'var(--admin-sidebar-text)' }
          }>
          <span className="admin-sidebar-icon" style={{ color: isWalletActive ? '#c084fc' : undefined }}><WalletIcon /></span>
          <span className="admin-sidebar-label">Wallet</span>
          <span className="ml-auto"><ChevronDown open={walletOpen} /></span>
        </button>

        {walletOpen && (
          <div className="flex flex-col gap-0.5 pl-3 mt-0.5">
            {walletSubItems.map(sub => (
              <NavLink key={sub.path} to={sub.path} onClick={() => onClose?.()}
                className="admin-sidebar-item text-xs"
                style={({ isActive }) => isActive
                  ? { background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }
                  : { background: 'transparent', border: '1px solid transparent', color: 'var(--admin-sidebar-text)' }
                }>
                {({ isActive }) => (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 ml-1 mr-1"
                      style={{ background: isActive ? '#c084fc' : 'rgba(168,85,247,0.35)' }} />
                    <span className="admin-sidebar-label">{sub.title}</span>
                    {isActive && <span className="ml-auto w-1 h-1 rounded-full" style={{ background: '#c084fc' }} />}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        )}

        {/* ── Interest Payout accordion ── */}
        <button
          onClick={() => toggleSection('interest')}
          className="admin-sidebar-item w-full text-left"
          style={isInterestActive
            ? { background: 'linear-gradient(135deg,rgba(168,85,247,0.2),rgba(168,85,247,0.08))', border: '1px solid rgba(168,85,247,0.35)', color: '#c084fc', boxShadow: '0 2px 12px rgba(168,85,247,0.15)' }
            : { background: 'transparent', border: '1px solid transparent', color: 'var(--admin-sidebar-text)' }
          }>
          <span className="admin-sidebar-icon" style={{ color: isInterestActive ? '#c084fc' : undefined }}><CoinIcon /></span>
          <span className="admin-sidebar-label">Interest Payout</span>
          <span className="ml-auto"><ChevronDown open={interestOpen} /></span>
        </button>

        {interestOpen && (
          <div className="flex flex-col gap-0.5 pl-3 mt-0.5">
            {interestSubItems.map(sub => (
              <NavLink key={sub.path} to={sub.path} onClick={() => onClose?.()}
                className="admin-sidebar-item text-xs"
                style={({ isActive }) => isActive
                  ? { background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }
                  : { background: 'transparent', border: '1px solid transparent', color: 'var(--admin-sidebar-text)' }
                }>
                {({ isActive }) => (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 ml-1 mr-1"
                      style={{ background: isActive ? '#c084fc' : 'rgba(168,85,247,0.35)' }} />
                    <span className="admin-sidebar-label">{sub.title}</span>
                    {isActive && <span className="ml-auto w-1 h-1 rounded-full" style={{ background: '#c084fc' }} />}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        )}

        {/* ── Assets accordion ── */}
        <button
          onClick={() => toggleSection('assets')}
          className="admin-sidebar-item w-full text-left"
          style={isAssetActive
            ? { background: 'linear-gradient(135deg,rgba(168,85,247,0.2),rgba(168,85,247,0.08))', border: '1px solid rgba(168,85,247,0.35)', color: '#c084fc', boxShadow: '0 2px 12px rgba(168,85,247,0.15)' }
            : { background: 'transparent', border: '1px solid transparent', color: 'var(--admin-sidebar-text)' }
          }>
          <span className="admin-sidebar-icon" style={{ color: isAssetActive ? '#c084fc' : undefined }}><AssetIcon /></span>
          <span className="admin-sidebar-label">Assets</span>
          <span className="ml-auto"><ChevronDown open={assetOpen} /></span>
        </button>

        {assetOpen && (
          <div className="flex flex-col gap-0.5 pl-3 mt-0.5">
            {assetSubItems.map(sub => (
              <NavLink key={sub.path} to={sub.path} onClick={() => onClose?.()}
                className="admin-sidebar-item text-xs"
                style={({ isActive }) => isActive
                  ? { background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }
                  : { background: 'transparent', border: '1px solid transparent', color: 'var(--admin-sidebar-text)' }
                }>
                {({ isActive }) => (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 ml-1 mr-1"
                      style={{ background: isActive ? '#c084fc' : 'rgba(168,85,247,0.35)' }} />
                    <span className="admin-sidebar-label">{sub.title}</span>
                    {isActive && <span className="ml-auto w-1 h-1 rounded-full" style={{ background: '#c084fc' }} />}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        )}

        {navItemsAfter.map(item => (
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
