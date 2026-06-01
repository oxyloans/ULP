/**
 * config/adminRoles.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for admin sub-roles.
 *
 * To add a new role:  add an entry to ADMIN_ROLES
 * To change access:   edit the `routes` array for that role
 * To rename a role:   change the `label` (the key is what's stored in session)
 *
 * Route keys must match the path segments used in AdminLayout (<Route path="...">)
 */

export const ADMIN_ROLE_KEY = 'adminRole'; // sessionStorage key

// ─── Route permission tokens ──────────────────────────────────────────────────
// Each token maps to one or more actual routes (see ROUTE_PERMISSIONS below).
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
export const ADMIN_ROLES = {
  SUPERADMIN: {
    label:       'Super Admin',
    color:       '#a855f7',
    permissions: '*',
  },
  CEO: {
    label:       'CEO',
    color:       '#6366f1',
    permissions: [PERM.DASHBOARD, PERM.STATS],
  },
  ACCOUNTS_MANAGER: {
    label:       'Accounts Manager',
    color:       '#10b981',
    permissions: [PERM.INTEREST, PERM.WALLET],
  },
  WALLET_OPS: {
    label:       'Wallet Ops Manager',
    color:       '#f59e0b',
    permissions: [PERM.WALLET],
  },
};

// Default role when none is stored (treat as superadmin for backward compat)
export const DEFAULT_ADMIN_ROLE = 'SUPERADMIN';

// ─── Helper: check if a role has a permission ─────────────────────────────────
export function hasPermission(adminRole, perm) {
  const def = ADMIN_ROLES[adminRole] ?? ADMIN_ROLES[DEFAULT_ADMIN_ROLE];
  if (def.permissions === '*') return true;
  return def.permissions.includes(perm);
}

// ─── Helper: get all permissions for a role ───────────────────────────────────
export function getPermissions(adminRole) {
  const def = ADMIN_ROLES[adminRole] ?? ADMIN_ROLES[DEFAULT_ADMIN_ROLE];
  if (def.permissions === '*') return Object.values(PERM);
  return def.permissions;
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
