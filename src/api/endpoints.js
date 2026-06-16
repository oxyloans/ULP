/**
 * api/endpoints.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All API endpoint paths relative to BASE_URL.
 * Service prefixes follow the real backend structure:
 *   /auth-service/auth/...
 *   /user-service/...
 *   /wallet-service/...
 *   /sd-lot-service/...
 *   /admin-service/...
 */

export const EP = {

  // ── Auth service ───────────────────────────────────────────────────────────
  LOGIN:              '/auth-service/auth/sign-in',
  REGISTER:           '/auth-service/auth/sign-up',
  FORGOT_PASSWORD:    '/auth-service/auth/forgot-password',
  RESET_PASSWORD:     '/auth-service/auth/reset-password',
  REFRESH_TOKEN:      '/auth-service/auth/refresh-token',

  // ── User service ───────────────────────────────────────────────────────────
  PROFILE_GET:        '/user-service/user/profile',
  PROFILE_UPDATE:     '/user-service/user/profile',
  CHANGE_PASSWORD:    '/user-service/user/change-password',

  // ── Family service ─────────────────────────────────────────────────────────
  FAMILY_MEMBERS:     '/user-service/family/members',
  FAMILY_ADD_REQUEST: '/user-service/family/add-request',
  FAMILY_REMOVE:      (id) => `/user-service/family/members/${id}`,

  // ── Financials / Dashboard ─────────────────────────────────────────────────
  MEMBER_FINANCIALS:  (memberId) => `/user-service/financials/${memberId}`,
  FAMILY_AGGREGATE:   '/user-service/financials/family',
  REVENUE_REPORT:     '/user-service/financials/revenue',

  // ── Wallet service ─────────────────────────────────────────────────────────
  WALLET_BALANCE:      '/wallet-service/wallet/balance',
  WALLET_HISTORY:      '/wallet-service/wallet/history',
  WALLET_UPLOAD_SLIP:  '/wallet-service/wallet/upload-slip',
  WALLET_ANALYZE_SLIP: '/wallet-service/wallet/analyze-slip',

  // ── SD Lot service ─────────────────────────────────────────────────────────
  SD_LOTS_LIST:       '/sd-lot-service/sd-lot/list',
  SD_LOT_DETAIL:      (id) => `/sd-lot-service/sd-lot/${id}`,
  SD_LOT_PARTICIPATE: '/sd-lot-service/sd-lot/participate',
  SD_LOT_MY_DEALS:    '/sd-lot-service/sd-lot/my-deals',

  // ── Support ────────────────────────────────────────────────────────────────
  SUPPORT_CONTACT:    '/user-service/support/contact',

  // ── Admin — Approvals ──────────────────────────────────────────────────────
  ADMIN_PENDING_REQUESTS: '/admin-service/approvals/pending',
  ADMIN_APPROVE_REQUEST:  (id) => `/admin-service/approvals/${id}/approve`,
  ADMIN_REJECT_REQUEST:   (id) => `/admin-service/approvals/${id}/reject`,
  ADMIN_USERS_LIST:       '/admin-service/users',
  ADMIN_USER_DETAIL:      (id) => `/admin-service/users/${id}`,

  // ── Admin — Wallet ─────────────────────────────────────────────────────────
  ADMIN_WALLET_SLIPS:   '/admin-service/wallet/slips',
  ADMIN_WALLET_APPROVE: (id) => `/admin-service/wallet/slips/${id}/approve`,
  ADMIN_WALLET_REJECT:  (id) => `/admin-service/wallet/slips/${id}/reject`,

  // ── Admin — SD Lot Deals ───────────────────────────────────────────────────
  ADMIN_DEALS_LIST:   '/admin-service/sd-lot/list',
  ADMIN_DEAL_CREATE:  '/admin-service/sd-lot/create',
  ADMIN_DEAL_UPDATE:  (id) => `/admin-service/sd-lot/${id}`,
  ADMIN_DEAL_DELETE:  (id) => `/admin-service/sd-lot/${id}`,

  // ── Admin — OxyLoans ──────────────────────────────────────────────────────
  ADMIN_OXYLOANS_DEALS: '/admin-service/oxyloans/deals',
  ADMIN_OXYLOANS_DEAL:  (id) => `/admin-service/oxyloans/deals/${id}`,

  // ── Admin — Offline Payments ───────────────────────────────────────────────
  ADMIN_OFFLINE_PAYMENTS: '/admin-service/offline/payments',
  ADMIN_OFFLINE_PAYMENT:  (id) => `/admin-service/offline/payments/${id}`,

  // ── Admin — Properties ────────────────────────────────────────────────────
  ADMIN_PROPERTIES: '/admin-service/properties',
  ADMIN_PROPERTY:   (id) => `/admin-service/properties/${id}`,

  // ── Admin — Support ────────────────────────────────────────────────────────
  ADMIN_SUPPORT_TICKETS: '/admin-service/support/tickets',
  ADMIN_SUPPORT_TICKET:  (id) => `/admin-service/support/tickets/${id}`,
  ADMIN_SUPPORT_REPLY:   (id) => `/admin-service/support/tickets/${id}/reply`,

  // ── Admin — Reports ────────────────────────────────────────────────────────
    ADMIN_REVENUE_REPORT: '/admin-service/reports/revenue',
    ADMIN_PLATFORM_STATS: '/admin-service/reports/platform-stats',

    // ── Admin — Funds Raised (OxyBrick) ──────────────────────────────────────
    ADMIN_DEAL_WALLET_INFO: '/oxybrick-service/getAllDealAndWalletInfo',

    // ── Admin — Top Lenders (OxyBrick) ───────────────────────────────────────
    ADMIN_TOP_PARTICIPATION_LENDERS: '/oxybrick-service/topParticipationLenders',
    };
