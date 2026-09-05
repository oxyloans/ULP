import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useFamily } from '../context/FamilyContext';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../api/afterlogin-user';
import { getUserId } from '../api/client';
import logo from '../assets/ulpnew1.png';

// ─── Icons ────────────────────────────────────────────────────────────────────
const MenuIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const BellIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const UsersIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const GridIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const CheckIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>;
const LogoutIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const UserIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IdCardIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const PlusIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

// Member accent colours — extend as needed
const MEMBER_COLORS = {
  'FM-001': '#6366f1',
  'FM-002': '#ec4899',
  'FM-003': '#10b981',
  'FM-004': '#f59e0b',
};
const getMemberColor = (id) => MEMBER_COLORS[id] ?? '#6366f1';

const PAGE_LABELS = {
  '/dashboard':   'Dashboard',
  '/sd-lots':     'SD Lots',
  '/sd-lot/create': 'Create Deal',
  '/wallet':      'Wallet',
  '/wallet/history': 'Wallet History',
  '/wallet/withdrawal-requests': 'Withdrawal Requests',
  '/family':      'Family Members',
  '/revenue':     'Revenue Report',
  '/contact':     'Contact Us',
};

// ─── Family Switcher ──────────────────────────────────────────────────────────
function FamilySwitcher({ onAddMember, loggedInName }) {
  const { approvedMembers, selectedMemberId, setSelectedMemberId, hasFamily, selfMemberId } = useFamily();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!hasFamily) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [hasFamily]);

  // Must come AFTER all hooks
  if (!hasFamily) return null;

  // null = Family Overview; 'self' or selfMemberId = logged-in user's own view
  const isOverview = selectedMemberId === null;
  const isSelfView = selectedMemberId === 'self' || selectedMemberId === selfMemberId;

  // Use selfMemberId from context — the first approved member is the account owner's slot
  const selfMember   = approvedMembers.find(m => m.id === selfMemberId) ?? approvedMembers[0] ?? null;
  const otherMembers = approvedMembers.filter(m => m.id !== selfMemberId);

  // Trigger pill colour: amber for overview, self color for own view, member color otherwise
  const activeColor = isOverview
    ? '#f59e0b'
    : isSelfView
      ? getMemberColor(selfMemberId ?? '')
      : getMemberColor(selectedMemberId);

  return (
    <div ref={ref} className="relative">
      {/* ── Trigger pill — gradient background, white content ── */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Switch view"
        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all hover:opacity-90 hover:scale-[1.03] active:scale-95"
        style={{
          background: `linear-gradient(135deg,${activeColor},${activeColor}bb)`,
          color: '#fff',
          boxShadow: open
            ? `0 4px 16px ${activeColor}55, 0 0 0 2px ${activeColor}35`
            : `0 2px 10px ${activeColor}45`,
          border: `1px solid ${activeColor}70`,
        }}>
        <UsersIcon />
        <span className="text-xs font-black tabular-nums leading-none">{approvedMembers.length}</span>
        {/* green pulse dot only when a family member (not self, not overview) is active */}
        {!isOverview && !isSelfView && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white"
            style={{ background: '#10b981' }} />
        )}
      </button>

      {open && (
        <div
          ref={null}
          className="absolute right-0 mt-2.5 z-50 rounded-2xl flex flex-col overflow-hidden"
          style={{
            width: 280,
            maxHeight: 480,
            /* Hard-code light surface so text is always visible regardless of theme */
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
          }}>

          {/* ── Header ── */}
          <div className="px-4 py-3 flex items-center justify-between flex-shrink-0"
            style={{ borderBottom: '1px solid #e2e8f0', background: `linear-gradient(135deg,${activeColor}14,${activeColor}06)` }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: `${activeColor}22`, color: activeColor }}>
                <UsersIcon />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: activeColor }}>
                View As
              </span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${activeColor}14`, color: activeColor, border: `1px solid ${activeColor}28` }}>
              {approvedMembers.length} Members
            </span>
          </div>

          {/* ── Scrollable member list ── */}
          <div className="overflow-y-auto flex-1">

            {/* Self — logged-in user's own dashboard */}
            {selfMember && (() => {
              const mc  = getMemberColor(selfMember.id);
              // Selected when: 'self' sentinel OR the actual selfMemberId is chosen
              const sel = isSelfView;
              return (
                <button
                  key={selfMember.id}
                  onClick={() => { setSelectedMemberId('self'); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: sel ? `${mc}10` : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = sel ? `${mc}10` : 'transparent'; }}>
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ background: `linear-gradient(135deg,${mc},${mc}99)`, color: '#fff', boxShadow: `0 2px 8px ${mc}45` }}>
                    {(loggedInName ?? selfMember.name ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold truncate" style={{ color: '#0f172a' }}>
                        {loggedInName || selfMember.name}
                      </p>
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold leading-none"
                        style={{ background: `${mc}18`, color: mc, fontSize: 10 }}>You</span>
                    </div>
                    <p className="text-xs font-mono font-bold mt-0.5" style={{ color: mc }}>
                      {selfMember.lrId}
                    </p>
                  </div>
                  {sel && (
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: mc, color: '#fff', boxShadow: `0 0 8px ${mc}60` }}>
                      <CheckIcon />
                    </span>
                  )}
                </button>
              );
            })()}

            {/* Family divider */}
            {otherMembers.length > 0 && (
              <div className="flex items-center gap-3 px-4 py-1.5"
                style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
                <span style={{ color: '#94a3b8', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Family
                </span>
                <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
              </div>
            )}

            {/* Other family members */}
            {otherMembers.map((m, idx) => {
              const mc  = getMemberColor(m.id);
              const sel = selectedMemberId === m.id;
              const isLast = idx === otherMembers.length - 1;
              return (
                <button
                  key={m.id}
                  onClick={() => { setSelectedMemberId(m.id); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  style={{
                    borderBottom: isLast ? 'none' : '1px solid #f1f5f9',
                    background: sel ? `${mc}10` : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = sel ? `${mc}10` : 'transparent'; }}>
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ background: `linear-gradient(135deg,${mc},${mc}99)`, color: '#fff', boxShadow: `0 2px 8px ${mc}45` }}>
                    {(m.name ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: '#0f172a' }}>
                      {m.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs font-mono font-bold" style={{ color: mc }}>{m.lrId}</p>
                      {m.relation && (
                        <span className="text-xs px-1.5 py-0 rounded-full font-semibold"
                          style={{ background: `${mc}14`, color: mc, fontSize: 10 }}>
                          {m.relation}
                        </span>
                      )}
                    </div>
                  </div>
                  {sel && (
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: mc, color: '#fff', boxShadow: `0 0 8px ${mc}60` }}>
                      <CheckIcon />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Footer: Family Overview + Add Member ── */}
          <div style={{ borderTop: '1px solid #e2e8f0' }}>
            {/* Family Overview row */}
            <button
              onClick={() => { setSelectedMemberId(null); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
              style={{
                borderBottom: '1px solid #f1f5f9',
                background: isOverview ? 'rgba(245,158,11,0.07)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!isOverview) e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isOverview ? 'rgba(245,158,11,0.07)' : 'transparent'; }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', boxShadow: '0 2px 8px rgba(245,158,11,0.4)' }}>
                <GridIcon />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: '#0f172a' }}>Family Overview</p>
                <p className="text-xs" style={{ color: '#64748b' }}>All {approvedMembers.length} members combined</p>
              </div>
              {isOverview && (
                <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: '#f59e0b', color: '#fff' }}>
                  <CheckIcon />
                </span>
              )}
            </button>

            {/* Add Member button */}
            <button
              onClick={() => { setOpen(false); onAddMember?.(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
              style={{ background: 'transparent', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', boxShadow: '0 2px 8px rgba(34,197,94,0.4)' }}>
                <PlusIcon />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: '#0f172a' }}>Add Member</p>
                <p className="text-xs" style={{ color: '#64748b' }}>Verify via OxyLoans ID</p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────
function ProfileDropdown({ displayName, displayInitial, displayColor, userLr }) {
  const { logout } = useAuth();
  const navigate   = useNavigate();
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
      <button
        onClick={() => setOpen(o => !o)}
        title={displayName}
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all hover:scale-105"
        style={{
          background: `linear-gradient(135deg,${displayColor},${displayColor}99)`,
          color: '#fff',
          boxShadow: open
            ? `0 0 0 3px ${displayColor}35, 0 0 16px ${displayColor}30`
            : `0 0 10px ${displayColor}25`,
          border: `2px solid ${open ? displayColor + '60' : 'transparent'}`,
        }}>
        {displayInitial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 z-50 rounded-2xl overflow-hidden"
          style={{
            width: 224,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          }}>
          {/* Profile header */}
          <div className="px-4 py-4 flex items-center gap-3"
            style={{ borderBottom: '1px solid #f1f5f9', background: `linear-gradient(135deg,${displayColor}0a,transparent)` }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
              style={{ background: `linear-gradient(135deg,${displayColor},${displayColor}88)`, color: '#fff', boxShadow: `0 0 16px ${displayColor}30` }}>
              {displayInitial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: '#0f172a' }}>{displayName}</p>
              <p className="text-xs font-mono font-bold" style={{ color: displayColor }}>{userLr}</p>
            </div>
          </div>

          {/* Details rows */}
          <div className="px-4 py-2" style={{ borderBottom: '1px solid #f1f5f9' }}>
            {[
              { Icon: UserIcon,   label: 'Name',    value: displayName },
              { Icon: IdCardIcon, label: 'User ID', value: userLr, mono: true },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-2.5 py-2">
                <span style={{ color: '#94a3b8' }}><r.Icon /></span>
                <div>
                  <p className="text-xs" style={{ color: '#64748b' }}>{r.label}</p>
                  <p className={`text-xs font-semibold ${r.mono ? 'font-mono' : ''}`}
                    style={{ color: r.mono ? displayColor : '#0f172a' }}>{r.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-left"
            style={{ transition: 'background 0.15s' }}
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
export default function Topbar({ onMenuClick, onAddMember }) {
  const { selectedMemberId, approvedMembers, hasFamily } = useFamily();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getUserProfile()
      .then(p => { if (p) setProfile(p); })
      .catch(() => {});
  }, []);

  const userId     = getUserId();
  const uuidSuffix = userId ? `…${userId.slice(-4)}` : '';

  // ── Profile avatar always shows the LOGGED-IN user, never a family member ──
  // The family switcher handles "view as"; the profile button is the auth identity.
  const loggedInFirst = profile?.firstName ?? '';
  const loggedInLast  = profile?.lastName  ?? '';
  const loggedInName  = (loggedInFirst + ' ' + loggedInLast).trim() || user?.name || '—';

  // Fixed indigo for the logged-in user's avatar — consistent regardless of which
  // family member is currently being viewed in the dashboard.
  const profileColor   = '#6366f1';
  const profileInitial = loggedInName.charAt(0).toUpperCase();

  return (
    <header className="topbar-shell lg:pl-[55px]">

      {/* Hamburger — mobile only */}
      <button onClick={onMenuClick} className="lg:hidden topbar-icon-btn flex-shrink-0 mr-1">
        <MenuIcon />
      </button>

      {/* Brand */}
      <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 flex-shrink-0">
        <img src={logo} alt="Unified Lending Platform" className="w-32 h-13 object-cover flex-shrink-1"
          style={{ boxShadow: '0 0 10px rgba(99,102,241,0.4)' }} />
      </div>

      {/* Spacer */}
      <div className="flex-1 min-w-0" />

      {/* Right actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <FamilySwitcher onAddMember={onAddMember} loggedInName={loggedInName} />
        <ThemeToggle />
        <button className="topbar-icon-btn relative">
          <BellIcon />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.6)' }} />
        </button>
        <ProfileDropdown
          displayName={loggedInName}
          displayInitial={profileInitial}
          displayColor={profileColor}
          userLr={uuidSuffix}
        />
      </div>

    </header>
  );
}
