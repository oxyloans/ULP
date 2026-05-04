import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ModeProvider } from './context/ModeContext';
import { FamilyProvider } from './context/FamilyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';

// User layout
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';

// Admin layout
import AdminSidebar from './components/AdminSidebar.jsx';
import AdminTopbar from './components/AdminTopbar.jsx';

// Auth pages
import Login          from './pages/Login.jsx';
import HiddenLogin    from './pages/HiddenLogin.jsx';
import OAuthCallback  from './pages/OAuthCallback.jsx';
import PreLoginContact from './pages/PreLoginContact.jsx';
import Register from './pages/Register.jsx';

// User pages
import UnifiedDashboard from './pages/UnifiedDashboard.jsx';
import FamilyManagement from './pages/FamilyManagement.jsx';
import RevenueReport from './pages/RevenueReport.jsx';
import ContactUs from './pages/ContactUs.jsx';
import NotFound from './pages/NotFound.jsx';
import SDLots from './pages/SDLots.jsx';
import WalletDashboard from './pages/WalletDashboard.jsx';
import WalletHistory from './pages/WalletHistory.jsx';
import SDLotParticipate from './pages/SDLotParticipate.jsx';
import MyParticipations from './pages/MyParticipations.jsx';
import Profile from './pages/Profile.jsx';
import SDLotsTest from './UserAPI/SDLotsTest.jsx';
import AssetDeals from './pages/AssetDeals.jsx';

import AdminWalletApprovals from './pages/admin/AdminWalletApprovals.jsx';
import CreateDeal from './pages/admin/CreateDeal.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminApprovals from './pages/admin/AdminApprovals.jsx';
import AdminProperties from './pages/admin/AdminProperties.jsx';
import AdminOxyLoans from './pages/admin/AdminOxyLoans.jsx';
import AdminOffline from './pages/admin/AdminOffline.jsx';
import AdminSupport from './pages/admin/AdminSupport.jsx';
import AdminBankAccounts from './pages/admin/AdminBankAccounts.jsx';

// ─── Floating Support Button ──────────────────────────────────────────────────
function FloatingSupportBtn() {
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {tooltip && (
        <div className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap"
          style={{ background: 'var(--surface-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          Contact Support
        </div>
      )}
      <button
        onClick={() => navigate('/contact')}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-110"
        style={{
          background: 'linear-gradient(135deg,#6366f1,#4338ca)',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(99,102,241,0.45)',
        }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        {/* Pulse ring */}
        <span className="absolute w-12 h-12 rounded-2xl pointer-events-none"
          style={{ border: '2px solid rgba(99,102,241,0.4)', animation: 'livePulse 2s infinite' }} />
      </button>
    </div>
  );
}

function AdminFloatingSupportBtn() {
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {tooltip && (
        <div className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap"
          style={{ background: 'rgba(20,10,35,0.95)', color: '#e9d5ff', border: '1px solid rgba(168,85,247,0.25)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          Support Tickets
        </div>
      )}
      <button
        onClick={() => navigate('/admin/support')}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-110"
        style={{
          background: 'linear-gradient(135deg,#a855f7,#7c3aed)',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(168,85,247,0.45)',
        }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span className="absolute w-12 h-12 rounded-2xl pointer-events-none"
          style={{ border: '2px solid rgba(168,85,247,0.4)', animation: 'livePulse 2s infinite' }} />
      </button>
    </div>
  );
}

// ─── Protected route ──────────────────────────────────────────────────────────
function RequireAuth({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate replace to="/login" />;
  if (role && user.role !== role) return <Navigate replace to="/dashboard" />;
  return children;
}

// ─── User Layout ──────────────────────────────────────────────────────────────
function UserLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <RequireAuth role="user">
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface)' }}>
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-5 lg:p-7 lg:pl-[248px] grid gap-5 content-start">
          <Routes>
            <Route path="/" element={<Navigate replace to="/dashboard" />} />
            <Route path="/dashboard" element={<UnifiedDashboard />} />
            <Route path="/sd-lots" element={<SDLots />} />
            <Route path="/asset" element={<AssetDeals />} />
            <Route path="/sd-lots-test" element={<SDLotsTest />} />
            <Route path="/sd-lot/participate/:id" element={<SDLotParticipate />} />
            <Route path="/my-participations" element={<MyParticipations />} />
            <Route path="/wallet" element={<WalletDashboard />} />
            <Route path="/wallet/history" element={<WalletHistory />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/family" element={<FamilyManagement />} />
            <Route path="/revenue" element={<RevenueReport />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <FloatingSupportBtn />
      </div>
    </RequireAuth>
  );
}

// ─── Admin Layout ─────────────────────────────────────────────────────────────
function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <RequireAuth role="admin">
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface)' }}>
        <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <AdminTopbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-5 lg:p-7 lg:pl-[248px] grid gap-5 content-start">
          <Routes>
            <Route index                        element={<Navigate replace to="dashboard" />} />
            <Route path="dashboard"             element={<AdminDashboard />} />
            <Route path="approvals"             element={<AdminApprovals />} />
            <Route path="wallet-approvals"      element={<AdminWalletApprovals />} />
            <Route path="create-deal"           element={<CreateDeal />} />
            <Route path="create-deal/:id"       element={<CreateDeal />} />
            <Route path="properties"            element={<AdminProperties />} />
            <Route path="oxyloans"              element={<AdminOxyLoans />} />
            <Route path="offline"               element={<AdminOffline />} />
            <Route path="support"               element={<AdminSupport />} />
            <Route path="bank-accounts"         element={<AdminBankAccounts />} />
            <Route path="*"                     element={<NotFound />} />
          </Routes>
        </main>
        <AdminFloatingSupportBtn />
      </div>
    </RequireAuth>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"         element={user ? <Navigate replace to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />} />
      <Route path="/hidden-login"  element={user ? <Navigate replace to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <HiddenLogin />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/register" element={user ? <Navigate replace to="/dashboard" /> : <Register />} />
      <Route path="/support"  element={<PreLoginContact />} />

      {/* Protected routes */}
      <Route path="/admin/*" element={<AdminLayout />} />
      <Route path="/*"       element={<UserLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
          <ModeProvider>
            <FamilyProvider>
              <AppRoutes />
            </FamilyProvider>
          </ModeProvider>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
