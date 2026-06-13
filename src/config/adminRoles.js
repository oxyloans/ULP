/**
 * config/adminRoles.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for admin sub-roles and permissions.
 *
 * Role keys must match the role names returned by the login API (e.g., "ADMIN", "CEO", "ACCOUNTS_MANAGER", "WALLET_OPS", "HELPDESK").
 * The API returns an array of roles: roles: [{ name: 'ADMIN' }] or roles: [{ name: 'CEO' }, { name: 'ACCOUNTS_MANAGER' }]
 *
 * To add a new role:  add an entry to ADMIN_ROLES
 * To change access:   edit the `permissions` array for that role
 * To rename a role:   change the `label` (the key is what's stored in session)
 *
 * Route keys must match the path segments used in AdminLayout (<Route path="...">)
 */

// ─── Route permission tokens ──────────────────────────────────────────────────
// Each token maps to one or more actual routes (see ROUTE_PERM_MAP below).
export const PERM = {
  DASHBOARD:          'dashboard',
  STATS:              'stats',
  CREATE_DEAL:        'create-deal',
  TOTAL_USERS:        'total-users',
  BORROWERS:          'borrowers',
  OFFLINE:            'offline',
  MIGRATED:           'migrated',          // migrated-users + migrated-total-data
  WALLET:             'wallet',            // wallet-approvals + wallet-withdrawals
  INTEREST:           'interest',          // interest/sd-lot + interest/asset
  ASSETS:             'assets',            // assets/load + assets/view + assets/allocated
  APPROVALS:          'approvals',
  PROPERTIES:         'properties',
  OXYLOANS:           'oxyloans',
  BANK_ACCOUNTS:      'bank-accounts',
  SUPPORT:            'support',
};

// ─── Role definitions ─────────────────────────────────────────────────────────
// `permissions` is the set of PERM tokens this role can access.
// '*' means all permissions (superadmin).
// Keys must match the role names returned by the API.
export const ADMIN_ROLES = {
  SUPERADMIN: {  // legacy fallback, not from API
    label:       'Super Admin',
    color:       '#a855f7',
    permissions: '*',
  },
  ADMIN: {       // base admin role from API
    label:       'Admin',
    color:       '#6366f1',
    permissions: '*',
  },
  CEO: {
    label:       'CEO',
    color:       '#6366f1',
    permissions: [ PERM.STATS ],
  },
  ACCOUNTS_MANAGER: {
    label:       'Accounts Manager',
    color:       '#10b981',
    permissions: [ PERM.INTEREST, PERM.WALLET ],
  },
  WALLET_OPS: {
    label:       'Wallet Ops Manager',
    color:       '#f59e0b',
    permissions: [ PERM.WALLET ],
  },
  HELPDESK: {
    label:       'Helpdesk',
    color:       '#0ea5e9',
    permissions: [ PERM.SUPPORT ],
  },
};

// ─── Helper: check if any of the user's roles has a permission ────────────────
// roles: array of role strings from API (e.g., ['ADMIN'], ['CEO', 'ACCOUNTS_MANAGER'])
// perm: permission token from PERM
export function hasPermission(roles, perm) {
  if (!roles || !roles.length) return false;
  for (const role of roles) {
    const def = ADMIN_ROLES[role] ?? ADMIN_ROLES.ADMIN;
    if (def.permissions === '*') return true;
    if (def.permissions.includes(perm)) return true;
  }
  return false;
}

// ─── Helper: get all permissions for a set of roles ───────────────────────────
export function getPermissions(roles) {
  if (!roles || !roles.length) return [];
  const allPerms = new Set();
  for (const role of roles) {
    const def = ADMIN_ROLES[role] ?? ADMIN_ROLES.ADMIN;
    if (def.permissions === '*') return Object.values(PERM);
    def.permissions.forEach(p => allPerms.add(p));
  }
  return Array.from(allPerms);
}

// ─── Helper: get default accessible route for roles ────────────────────────────
// Returns the first admin route path the user has permission for, or '/admin/dashboard' as fallback
export function getDefaultAdminRoute(roles) {
  if (!roles || !roles.length) return '/admin/dashboard';

  const perms = getPermissions(roles);
  if (perms.includes('*')) return '/admin/dashboard'; // superadmin gets dashboard

  // Route priority order (first match wins)
  const routePriority = [
    { perm: PERM.DASHBOARD,       path: '/admin/dashboard' },
    { perm: PERM.STATS,           path: '/admin/stats/funds-raised' },
    { perm: PERM.CREATE_DEAL,     path: '/admin/create-deal' },
    { perm: PERM.TOTAL_USERS,     path: '/admin/total-users' },
    { perm: PERM.BORROWERS,       path: '/admin/borrowers' },
    { perm: PERM.OFFLINE,         path: '/admin/offline' },
    { perm: PERM.MIGRATED,        path: '/admin/migrated-users' },
    { perm: PERM.WALLET,          path: '/admin/wallet-approvals' },
    { perm: PERM.INTEREST,        path: '/admin/interest/sd-lot' },
    { perm: PERM.ASSETS,          path: '/admin/assets/load' },
    { perm: PERM.APPROVALS,       path: '/admin/approvals' },
    { perm: PERM.PROPERTIES,      path: '/admin/properties' },
    { perm: PERM.OXYLOANS,        path: '/admin/oxyloans' },
    { perm: PERM.BANK_ACCOUNTS,   path: '/admin/bank-accounts' },
    { perm: PERM.SUPPORT,         path: '/admin/support' },
  ];

  for (const { perm, path } of routePriority) {
    if (perms.includes(perm)) return path;
  }

  return '/admin/dashboard'; // fallback
}

// ─── Map route path → permission token ───────────────────────────────────────
// Used by RequireAdminPerm in App.jsx to gate individual routes.
export const ROUTE_PERM_MAP = {
  'dashboard':           PERM.DASHBOARD,
  'stats':               PERM.STATS,
  'create-deal':         PERM.CREATE_DEAL,
  'total-users':         PERM.TOTAL_USERS,
  'borrowers':           PERM.BORROWERS,
  'offline':             PERM.OFFLINE,
  'migrated-users':      PERM.MIGRATED,
  'migrated-total-data': PERM.MIGRATED,
  'wallet-approvals':    PERM.WALLET,
  'wallet-withdrawals':  PERM.WALLET,
  'interest/sd-lot':     PERM.INTEREST,
  'interest/asset':      PERM.INTEREST,
  'assets/load':         PERM.ASSETS,
  'assets/view':         PERM.ASSETS,
  'assets/allocated':    PERM.ASSETS,
  'approvals':           PERM.APPROVALS,
  'properties':          PERM.PROPERTIES,
  'oxyloans':            PERM.OXYLOANS,
  'bank-accounts':       PERM.BANK_ACCOUNTS,
  'support':             PERM.SUPPORT,
};
