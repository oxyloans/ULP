import { useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/ulp.png';

const ShieldIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const MenuIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const BellIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const ChevronR   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="9 18 15 12 9 6"/></svg>;
const LogoutIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const pageMeta = {
  '/admin/dashboard':        { crumb: ['Dashboard']         },
  '/admin/approvals':        { crumb: ['Approvals']          },
  '/admin/wallet-approvals': { crumb: ['Wallet Approvals']   },
  '/admin/create-deal':      { crumb: ['Create Deal']        },
  '/admin/oxyloans':         { crumb: ['OxyLoans']           },
  '/admin/offline':          { crumb: ['Offline Deals']      },
  '/admin/properties':       { crumb: ['Properties']         },
  '/admin/support':          { crumb: ['Support']            },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

export default function AdminTopbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const page = pageMeta[location.pathname] ?? { crumb: ['Admin'] };  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <header className="admin-topbar-shell lg:pl-[35px]">

      {/* Hamburger — mobile only */}
      <button onClick={onMenuClick}
        className="lg:hidden w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mr-1"
        style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.18)', color: '#a855f7' }}>
        <MenuIcon />
      </button>

      {/* Brand — far left */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <img src={logo} alt="Oxy Portfolio" className="w-7 h-7 rounded-full object-cover flex-shrink-0"
          style={{ background: '#fff', boxShadow: '0 0 14px rgba(168,85,247,0.45)' }} />
        <span className="text-sm font-black tracking-widest uppercase hidden sm:block"
          style={{ color: '#e9d5ff', letterSpacing: '0.1em' }}>
          Oxy Portfolio
        </span>
      </div>

      <div className="w-px h-5 flex-shrink-0" style={{ background: 'rgba(168,85,247,0.2)' }} />

      {/* Centre: breadcrumb + greeting */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium" style={{ color: 'rgba(168,85,247,0.5)' }}>Admin</span>
          <span style={{ color: 'rgba(168,85,247,0.3)' }}><ChevronR /></span>
          {page.crumb.map((c, i) => (
            <span key={c} className="flex items-center gap-1.5">
              {i > 0 && <span style={{ color: 'rgba(168,85,247,0.3)' }}><ChevronR /></span>}
              <span className="text-xs font-semibold" style={{ color: '#c084fc' }}>{c}</span>
            </span>
          ))}
        </div>
        <span style={{ color: 'rgba(168,85,247,0.2)', margin: '0 2px' }}>·</span>
        <span className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Good {getGreeting()},{' '}
          <span style={{ color: '#c084fc', fontWeight: 700 }}>Admin</span>
        </span>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <span className="rounded-full" style={{ width: 5, height: 5, background: '#a855f7', display: 'inline-block', animation: 'livePulse 2s infinite' }} />
          <span className="text-xs font-semibold" style={{ color: '#c084fc', fontSize: 10 }}>Live</span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <ThemeToggle />
        <button className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.18)', color: '#a855f7' }}>
          <BellIcon />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.6)' }} />
        </button>
        <button onClick={handleLogout} title="Logout"
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all hover:scale-105"
          style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.22)' }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
            style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', boxShadow: '0 0 10px rgba(168,85,247,0.4)' }}>
            A
          </div>
          <div className="hidden sm:block leading-none">
            <p className="text-xs font-bold" style={{ color: '#e9d5ff' }}>Admin</p>
            <p style={{ color: '#a855f7', fontSize: 9, fontWeight: 600 }}>Logout</p>
          </div>
        </button>
      </div>

    </header>
  );
}
