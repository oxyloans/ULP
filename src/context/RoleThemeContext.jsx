import { createContext, useContext, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { ADMIN_ROLES } from '../config/adminRoles';

// Role-based theme configurations with custom color palettes
const ROLE_THEMES = {
  CEO: {
    // Custom purple/magenta palette: #9333ea, #B92adf, #991d95 + white
    primary: '#9333ea',
    primaryLight: '#B92adf',
    primaryDark: '#991d95',
    gradient: 'linear-gradient(135deg, #9333ea, #B92adf)',
    sidebarBg: '#1a0a2e',           // Very dark purple base
    sidebarBorder: 'rgba(185, 42, 223, 0.3)',
    sidebarText: 'rgba(255,255,255,0.7)',
    sidebarHoverBg: 'rgba(185, 42, 223, 0.2)',
    sidebarHoverColor: '#ffffff',
    sidebarSectionColor: '#B92adf',
    sidebarFooterBorder: 'rgba(185, 42, 223, 0.25)',
    topbarShellBg: '#1a0a2e',
    topbarShellBorder: 'rgba(185, 42, 223, 0.4)',
    topbarSepColor: 'rgba(185, 42, 223, 0.5)',
    topbarIconBg: 'rgba(185, 42, 223, 0.15)',
    topbarIconBorder: 'rgba(185, 42, 223, 0.25)',
    topbarIconColor: '#B92adf',
    topbarTextPrimary: '#ffffff',
    topbarTextMuted: '#e9d5ff',
    activeBg: 'rgba(147, 51, 234, 0.25)',
    activeBorder: 'rgba(185, 42, 223, 0.5)',
    activeColor: '#ffffff',
    activeIndicator: '#B92adf',
  },
  ADMIN: {
    // Same custom purple/magenta palette for ADMIN
    primary: '#9333ea',
    primaryLight: '#B92adf',
    primaryDark: '#991d95',
    gradient: 'linear-gradient(135deg, #9333ea, #B92adf)',
    sidebarBg: '#1a0a2e',
    sidebarBorder: 'rgba(185, 42, 223, 0.3)',
    sidebarText: 'rgba(255,255,255,0.7)',
    sidebarHoverBg: 'rgba(185, 42, 223, 0.2)',
    sidebarHoverColor: '#ffffff',
    sidebarSectionColor: '#B92adf',
    sidebarFooterBorder: 'rgba(185, 42, 223, 0.25)',
    topbarShellBg: '#1a0a2e',
    topbarShellBorder: 'rgba(185, 42, 223, 0.4)',
    topbarSepColor: 'rgba(185, 42, 223, 0.5)',
    topbarIconBg: 'rgba(185, 42, 223, 0.15)',
    topbarIconBorder: 'rgba(185, 42, 223, 0.25)',
    topbarIconColor: '#B92adf',
    topbarTextPrimary: '#ffffff',
    topbarTextMuted: '#e9d5ff',
    activeBg: 'rgba(147, 51, 234, 0.25)',
    activeBorder: 'rgba(185, 42, 223, 0.5)',
    activeColor: '#ffffff',
    activeIndicator: '#B92adf',
  },
  SUPERADMIN: {
    // Same as ADMIN
    primary: '#9333ea',
    primaryLight: '#B92adf',
    primaryDark: '#991d95',
    gradient: 'linear-gradient(135deg, #9333ea, #B92adf)',
    sidebarBg: '#1a0a2e',
    sidebarBorder: 'rgba(185, 42, 223, 0.3)',
    sidebarText: 'rgba(255,255,255,0.7)',
    sidebarHoverBg: 'rgba(185, 42, 223, 0.2)',
    sidebarHoverColor: '#ffffff',
    sidebarSectionColor: '#B92adf',
    sidebarFooterBorder: 'rgba(185, 42, 223, 0.25)',
    topbarShellBg: '#1a0a2e',
    topbarShellBorder: 'rgba(185, 42, 223, 0.4)',
    topbarSepColor: 'rgba(185, 42, 223, 0.5)',
    topbarIconBg: 'rgba(185, 42, 223, 0.15)',
    topbarIconBorder: 'rgba(185, 42, 223, 0.25)',
    topbarIconColor: '#B92adf',
    topbarTextPrimary: '#ffffff',
    topbarTextMuted: '#e9d5ff',
    activeBg: 'rgba(147, 51, 234, 0.25)',
    activeBorder: 'rgba(185, 42, 223, 0.5)',
    activeColor: '#ffffff',
    activeIndicator: '#B92adf',
  },
  ACCOUNTS_MANAGER: {
    // Custom green/sage palette: #9cb080, #618764, #2b5748, #273338
    primary: '#618764',
    primaryLight: '#9cb080',
    primaryDark: '#2b5748',
    gradient: 'linear-gradient(135deg, #618764, #9cb080)',
    sidebarBg: '#273338',           // Dark teal/green base
    sidebarBorder: 'rgba(156, 176, 128, 0.3)',
    sidebarText: 'rgba(255,255,255,0.7)',
    sidebarHoverBg: 'rgba(156, 176, 128, 0.2)',
    sidebarHoverColor: '#ffffff',
    sidebarSectionColor: '#9cb080',
    sidebarFooterBorder: 'rgba(156, 176, 128, 0.25)',
    topbarShellBg: '#273338',
    topbarShellBorder: 'rgba(156, 176, 128, 0.4)',
    topbarSepColor: 'rgba(156, 176, 128, 0.5)',
    topbarIconBg: 'rgba(156, 176, 128, 0.15)',
    topbarIconBorder: 'rgba(156, 176, 128, 0.25)',
    topbarIconColor: '#9cb080',
    topbarTextPrimary: '#ffffff',
    topbarTextMuted: '#d4e4c6',
    activeBg: 'rgba(97, 135, 100, 0.25)',
    activeBorder: 'rgba(156, 176, 128, 0.5)',
    activeColor: '#ffffff',
    activeIndicator: '#9cb080',
  },
  WALLET_OPS: {
    // Custom blue palette: #2c5ead, #1591dc, #4bb8fa, #c4e2f5
    primary: '#1591dc',
    primaryLight: '#4bb8fa',
    primaryDark: '#2c5ead',
    gradient: 'linear-gradient(135deg, #1591dc, #4bb8fa)',
    sidebarBg: '#1e3a5f',           // Dark blue base
    sidebarBorder: 'rgba(75, 184, 250, 0.3)',
    sidebarText: 'rgba(255,255,255,0.7)',
    sidebarHoverBg: 'rgba(75, 184, 250, 0.2)',
    sidebarHoverColor: '#ffffff',
    sidebarSectionColor: '#4bb8fa',
    sidebarFooterBorder: 'rgba(75, 184, 250, 0.25)',
    topbarShellBg: '#1e3a5f',
    topbarShellBorder: 'rgba(75, 184, 250, 0.4)',
    topbarSepColor: 'rgba(75, 184, 250, 0.5)',
    topbarIconBg: 'rgba(75, 184, 250, 0.15)',
    topbarIconBorder: 'rgba(75, 184, 250, 0.25)',
    topbarIconColor: '#4bb8fa',
    topbarTextPrimary: '#ffffff',
    topbarTextMuted: '#c4e2f5',
    activeBg: 'rgba(21, 145, 220, 0.25)',
    activeBorder: 'rgba(75, 184, 250, 0.5)',
    activeColor: '#ffffff',
    activeIndicator: '#4bb8fa',
  },
  ASSET_MANAGER: {
    // Custom dark/brown/beige palette: #000000, #1f150c, #412d15, #e1dcc9
    primary: '#412d15',
    primaryLight: '#e1dcc9',
    primaryDark: '#1f150c',
    gradient: 'linear-gradient(135deg, #412d15, #e1dcc9)',
    sidebarBg: '#0a0a0a',           // Near black base
    sidebarBorder: 'rgba(225, 220, 201, 0.3)',
    sidebarText: 'rgba(225, 220, 201, 0.7)',
    sidebarHoverBg: 'rgba(65, 45, 21, 0.3)',
    sidebarHoverColor: '#ffffff',
    sidebarSectionColor: '#e1dcc9',
    sidebarFooterBorder: 'rgba(225, 220, 201, 0.25)',
    topbarShellBg: '#0a0a0a',
    topbarShellBorder: 'rgba(225, 220, 201, 0.4)',
    topbarSepColor: 'rgba(225, 220, 201, 0.5)',
    topbarIconBg: 'rgba(65, 45, 21, 0.3)',
    topbarIconBorder: 'rgba(225, 220, 201, 0.25)',
    topbarIconColor: '#e1dcc9',
    topbarTextPrimary: '#e1dcc9',
    topbarTextMuted: '#a8a398',
    activeBg: 'rgba(65, 45, 21, 0.4)',
    activeBorder: 'rgba(225, 220, 201, 0.5)',
    activeColor: '#ffffff',
    activeIndicator: '#e1dcc9',
  },
  HELPDESK: {
    // Default blue theme (unchanged)
    primary: '#38bdf8',
    primaryLight: '#7dd3fc',
    primaryDark: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #38bdf8, #7dd3fc)',
    sidebarBg: '#0c2d48',
    sidebarBorder: 'rgba(56, 189, 248, 0.3)',
    sidebarText: 'rgba(255,255,255,0.6)',
    sidebarHoverBg: 'rgba(56, 189, 248, 0.2)',
    sidebarHoverColor: '#ffffff',
    sidebarSectionColor: '#0ea5e9',
    sidebarFooterBorder: 'rgba(56, 189, 248, 0.25)',
    topbarShellBg: '#0c2d48',
    topbarShellBorder: 'rgba(56, 189, 248, 0.4)',
    topbarSepColor: 'rgba(125, 211, 252, 0.5)',
    topbarIconBg: 'rgba(56, 189, 248, 0.15)',
    topbarIconBorder: 'rgba(56, 189, 248, 0.25)',
    topbarIconColor: '#0ea5e9',
    topbarTextPrimary: '#ffffff',
    topbarTextMuted: '#bae6fd',
    activeBg: 'rgba(56, 189, 248, 0.2)',
    activeBorder: 'rgba(56, 189, 248, 0.5)',
    activeColor: '#ffffff',
    activeIndicator: '#38bdf8',
  },
};

// Default theme (fallback)
const DEFAULT_THEME = ROLE_THEMES.ADMIN;

// Determine primary role from user's roles
function getPrimaryRole(roles) {
  if (!roles || !roles.length) return 'ADMIN';
  if (roles.includes('ADMIN') || roles.includes('SUPERADMIN')) return 'ADMIN';
  for (const role of roles) {
    if (ADMIN_ROLES[role]) return role;
  }
  return 'ADMIN';
}

const RoleThemeContext = createContext(null);

export function RoleThemeProvider({ children }) {
  const { user } = useAuth();
  const roles = user?.roles ?? [];
  const primaryRole = useMemo(() => getPrimaryRole(roles), [roles]);
  const theme = useMemo(() => ROLE_THEMES[primaryRole] || DEFAULT_THEME, [primaryRole]);

  // Apply theme CSS variables to :root (or a wrapper element)
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--role-${key}`, value);
    });

    // Also update the main admin CSS variables to match role theme
    root.style.setProperty('--admin-sidebar-bg', theme.sidebarBg);
    root.style.setProperty('--admin-sidebar-border', theme.sidebarBorder);
    root.style.setProperty('--admin-sidebar-text', theme.sidebarText);
    root.style.setProperty('--admin-sidebar-hover-bg', theme.sidebarHoverBg);
    root.style.setProperty('--admin-sidebar-hover-color', theme.sidebarHoverColor);
    root.style.setProperty('--admin-sidebar-section-color', theme.sidebarSectionColor);
    root.style.setProperty('--admin-sidebar-footer-border', theme.sidebarFooterBorder);

    root.style.setProperty('--topbar-shell-bg', theme.topbarShellBg);
    root.style.setProperty('--topbar-shell-border', theme.topbarShellBorder);
    root.style.setProperty('--topbar-sep-color', theme.topbarSepColor);
    root.style.setProperty('--topbar-icon-bg', theme.topbarIconBg);
    root.style.setProperty('--topbar-icon-border', theme.topbarIconBorder);
    root.style.setProperty('--topbar-icon-color', theme.topbarIconColor);
    root.style.setProperty('--topbar-text-primary', theme.topbarTextPrimary);
    root.style.setProperty('--topbar-text-muted', theme.topbarTextMuted);

    // Cleanup on unmount
    return () => {
      Object.keys(theme).forEach(key => {
        root.style.removeProperty(`--role-${key}`);
      });
    };
  }, [theme]);

  return (
    <RoleThemeContext.Provider value={{ theme, primaryRole }}>
      {children}
    </RoleThemeContext.Provider>
  );
}

export function useRoleTheme() {
  const context = useContext(RoleThemeContext);
  if (!context) {
    throw new Error('useRoleTheme must be used within a RoleThemeProvider');
  }
  return context;
}

export function getThemeForRole(role) {
  return ROLE_THEMES[role] || DEFAULT_THEME;
}