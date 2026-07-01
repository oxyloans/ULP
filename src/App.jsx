import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ModeProvider } from './context/ModeContext';
import { FamilyProvider } from './context/FamilyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { RoleThemeProvider } from './context/RoleThemeContext';

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
import LoginOTP from './pages/LoginOTP.jsx';

// User pages
import UnifiedDashboard from './pages/UnifiedDashboard.jsx';
import FamilyManagement from './pages/FamilyManagement.jsx';
import RevenueReport from './pages/RevenueReport.jsx';
import ContactUs from './pages/ContactUs.jsx';
import NotFound from './pages/NotFound.jsx';
import SDLots from './pages/SDLots.jsx';
import WalletDashboard from './pages/WalletDashboard.jsx';
import WalletHistory from './pages/WalletHistory.jsx';
import WalletWithdrawalRequests from './pages/WalletWithdrawalRequests.jsx';
import SDLotParticipate from './pages/SDLotParticipate.jsx';
import MyParticipations from './pages/MyParticipations.jsx';
import Profile from './pages/Profile.jsx';
import SDLotsTest from './UserAPI/SDLotsTest.jsx';
import AssetDeals from './pages/AssetDeals.jsx';
import GoldDealsParticipated from './pages/GoldDealsParticipated.jsx';
import GoldDeal from './pages/GoldDeal.jsx';
import GoldDealContribute from './pages/GoldDealContribute.jsx';
import GoldParticipationDetails from './pages/GoldParticipationDetails.jsx';
import InterestPaymentDates from './pages/InterestPaymentDates.jsx';

import AdminWalletApprovals from './pages/admin/AdminWalletApprovals.jsx';
import CreateDeal from './pages/admin/CreateDeal.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminApprovals from './pages/admin/AdminApprovals.jsx';
import AdminProperties from './pages/admin/AdminProperties.jsx';
import AdminOxyLoans from './pages/admin/AdminOxyLoans.jsx';
import AdminOffline from './pages/admin/AdminOffline.jsx';
import AdminSupport from './pages/admin/AdminSupport.jsx';
import AdminBankAccounts from './pages/admin/AdminBankAccounts.jsx';
import LoadAsset from './pages/admin/LoadAsset.jsx';
import ViewAssets from './pages/admin/ViewAssets.jsx';
import AllocatedAssets from './pages/admin/AllocatedAssets.jsx';
import AdminInterestPayments from './pages/admin/AdminInterestPayments.jsx';
import AdminAssetPayouts from './pages/admin/AdminAssetPayouts.jsx';
import AdminPrincipalInterest from './pages/admin/AdminPrincipalInterest.jsx';
import AdminTotalUsers from './pages/admin/AdminTotalUsers.jsx';
import AdminMigratedUsers from './pages/admin/AdminMigratedUsers.jsx';
import AdminWalletWithdrawals from './pages/admin/AdminWalletWithdrawals.jsx';
import AdminMigratedTotalData from './pages/admin/AdminMigratedTotalData.jsx';
import AdminStats from './pages/admin/AdminStats.jsx';
import AdminBorrowers from './pages/admin/AdminBorrowers.jsx';
import FundsRaised from './pages/admin/stats/FundsRaised.jsx';
import TopLenders from './pages/admin/stats/TopLenders.jsx';
import TotalAssets from './pages/admin/stats/TotalAssets.jsx';
import InterestPrincipal from './pages/admin/stats/InterestPrincipal.jsx';
import OxyLoansRunningDeals from './pages/admin/stats/OxyLoansRunningDeals.jsx';
import OfflineRunningDeals from './pages/admin/stats/OfflineRunningDeals.jsx';

import { hasPermission, ROUTE_PERM_MAP, getDefaultAdminRoute } from './config/adminRoles.js';

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

// ─── Admin permission guard ───────────────────────────────────────────────────
// Wraps a single admin route. If the current user's roles lack the required
// permission, redirects to the first accessible route for their roles.
function RequireAdminPerm({ routeKey, children }) {
  const { user } = useAuth();
  const roles = user?.roles ?? [];
  const perm = ROUTE_PERM_MAP[routeKey];
  const hasAccess = Array.isArray(perm)
    ? perm.some(p => hasPermission(roles, p))
    : !perm || hasPermission(roles, perm);
  if (!hasAccess) {
    return <Navigate replace to={getDefaultAdminRoute(roles)} />;
  }
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
        <main className="main-with-fixed-topbar flex-1 p-4 sm:p-5 lg:p-7 lg:pl-[248px] grid gap-5 content-start">
          <Routes>
            <Route path="/" element={<Navigate replace to="/dashboard" />} />
            <Route path="/dashboard" element={<UnifiedDashboard />} />
            <Route path="/sd-lots" element={<SDLots />} />
            <Route path="/gold-deals" element={<GoldDeal />} />
            <Route path="/gold-deals/contribute/:id" element={<GoldDealContribute />} />
            <Route path="/gold-deals/participation/:propertyId" element={<GoldParticipationDetails />} />
            <Route path="/gold-deals-participation" element={<GoldDealsParticipated />} />
            <Route path="/interestPaymentDates/:propertyId" element={<InterestPaymentDates />} />
            <Route path="/asset" element={<AssetDeals />} />
            <Route path="/sd-lots-test" element={<SDLotsTest />} />
            <Route path="/sd-lot/participate/:id" element={<SDLotParticipate />} />
            <Route path="/my-participations" element={<MyParticipations />} />
            <Route path="/wallet" element={<WalletDashboard />} />
            <Route path="/wallet/history" element={<WalletHistory />} />
            <Route path="/wallet/withdrawal-requests" element={<WalletWithdrawalRequests />} />
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
      <RoleThemeProvider>
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface)' }}>
          <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
          <AdminTopbar onMenuClick={() => setMobileOpen(true)} />
          <main className="main-with-fixed-topbar flex-1 p-4 sm:p-5 lg:p-7 lg:pl-[248px] grid gap-5 content-start">
            <Routes>
              <Route index                        element={<Navigate replace to="dashboard" />} />
              <Route path="dashboard"             element={<RequireAdminPerm routeKey="dashboard"><AdminDashboard /></RequireAdminPerm>} />
              <Route path="approvals"             element={<RequireAdminPerm routeKey="approvals"><AdminApprovals /></RequireAdminPerm>} />
              <Route path="wallet-approvals"      element={<RequireAdminPerm routeKey="wallet-approvals"><AdminWalletApprovals /></RequireAdminPerm>} />
              <Route path="wallet-withdrawals"    element={<RequireAdminPerm routeKey="wallet-withdrawals"><AdminWalletWithdrawals /></RequireAdminPerm>} />
              <Route path="create-deal"           element={<RequireAdminPerm routeKey="create-deal"><CreateDeal /></RequireAdminPerm>} />
              <Route path="create-deal/:id"       element={<RequireAdminPerm routeKey="create-deal"><CreateDeal /></RequireAdminPerm>} />
              <Route path="properties"            element={<RequireAdminPerm routeKey="properties"><AdminProperties /></RequireAdminPerm>} />
              <Route path="oxyloans"              element={<RequireAdminPerm routeKey="oxyloans"><AdminOxyLoans /></RequireAdminPerm>} />
              <Route path="offline"               element={<RequireAdminPerm routeKey="offline"><AdminOffline /></RequireAdminPerm>} />
              <Route path="support"               element={<RequireAdminPerm routeKey="support"><AdminSupport /></RequireAdminPerm>} />
              <Route path="bank-accounts"         element={<RequireAdminPerm routeKey="bank-accounts"><AdminBankAccounts /></RequireAdminPerm>} />
              <Route path="assets/load"           element={<RequireAdminPerm routeKey="assets/load"><LoadAsset /></RequireAdminPerm>} />
              <Route path="assets/view"           element={<RequireAdminPerm routeKey="assets/view"><ViewAssets /></RequireAdminPerm>} />
              <Route path="assets/allocated"      element={<RequireAdminPerm routeKey="assets/allocated"><AllocatedAssets /></RequireAdminPerm>} />
              <Route path="interest/sd-lot"       element={<RequireAdminPerm routeKey="interest/sd-lot"><AdminInterestPayments /></RequireAdminPerm>} />
              <Route path="interest/asset"        element={<RequireAdminPerm routeKey="interest/asset"><AdminAssetPayouts /></RequireAdminPerm>} />
              <Route path="interest/principal-interest" element={<RequireAdminPerm routeKey="interest/principal-interest"><AdminPrincipalInterest /></RequireAdminPerm>} />
              <Route path="total-users"           element={<RequireAdminPerm routeKey="total-users"><AdminTotalUsers /></RequireAdminPerm>} />
              <Route path="migrated-users"        element={<RequireAdminPerm routeKey="migrated-users"><AdminMigratedUsers /></RequireAdminPerm>} />
              <Route path="migrated-total-data"   element={<RequireAdminPerm routeKey="migrated-total-data"><AdminMigratedTotalData /></RequireAdminPerm>} />
              <Route path="stats"                 element={<Navigate replace to="stats/funds-raised" />} />
              <Route path="stats/funds-raised"    element={<RequireAdminPerm routeKey="stats"><FundsRaised /></RequireAdminPerm>} />
              <Route path="stats/oxyloans-running-deals" element={<RequireAdminPerm routeKey="stats"><OxyLoansRunningDeals /></RequireAdminPerm>} />
              <Route path="stats/offline-running-deals" element={<RequireAdminPerm routeKey="stats"><OfflineRunningDeals /></RequireAdminPerm>} />
              <Route path="stats/top-lenders"    element={<RequireAdminPerm routeKey="stats"><TopLenders /></RequireAdminPerm>} />
              <Route path="stats/total-assets"   element={<RequireAdminPerm routeKey="stats"><TotalAssets /></RequireAdminPerm>} />
              <Route path="stats/interest-principal" element={<RequireAdminPerm routeKey="stats"><InterestPrincipal /></RequireAdminPerm>} />
              <Route path="borrowers"             element={<RequireAdminPerm routeKey="borrowers"><AdminBorrowers /></RequireAdminPerm>} />
              <Route path="*"                     element={<NotFound />} />
            </Routes>
          </main>
          <AdminFloatingSupportBtn />
        </div>
      </RoleThemeProvider>
    </RequireAuth>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"         element={user ? <Navigate replace to={user.role === 'admin' ? getDefaultAdminRoute(user.roles) : '/dashboard'} /> : <Login />} />
      <Route path="/login-otp"     element={user ? <Navigate replace to={user.role === 'admin' ? getDefaultAdminRoute(user.roles) : '/dashboard'} /> : <LoginOTP />} />
      <Route path="/hidden-login"  element={user ? <Navigate replace to={user.role === 'admin' ? getDefaultAdminRoute(user.roles) : '/dashboard'} /> : <HiddenLogin />} />
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
