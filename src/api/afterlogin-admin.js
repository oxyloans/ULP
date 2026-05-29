/**
 * api/afterlogin-admin.js
 * All admin API calls — real endpoints, no dummy data.
 */

import { get, post, patch, del } from './client';

// ══════════════════════════════════════════════════════════════════════════════
// MEMBER APPROVALS
// ══════════════════════════════════════════════════════════════════════════════

export async function getPendingApprovals() {
  return get('/admin-service/approvals/pending');
}

export async function approveRequest(id) {
  return post(`/admin-service/approvals/${id}/approve`, {});
}

export async function rejectRequest(id, reason = '') {
  return post(`/admin-service/approvals/${id}/reject`, { reason });
}

export async function getAllUsers() {
  return get('/admin-service/users');
}

// ══════════════════════════════════════════════════════════════════════════════
// WALLET APPROVALS
// ══════════════════════════════════════════════════════════════════════════════

export async function getWalletSlips() {
  return get('/oxybrick-service/cashfree/getAllUtrDetails');
}

export async function approveWalletSlip({ utrNumber, transactionAmount, transactionDate, approvedBy, comments }) {
  return patch('/oxybrick-service/cashfree/utrApprovedAndRejectedByAdmin', {
    utrNumber, transactionAmount, transactionDate,
    approvedBy, comments, walletStatus: 'APPROVED',
  });
}

export async function rejectWalletSlip({ utrNumber, transactionAmount, transactionDate, approvedBy, comments }) {
  return patch('/oxybrick-service/cashfree/utrApprovedAndRejectedByAdmin', {
    utrNumber, transactionAmount, transactionDate,
    approvedBy, comments, walletStatus: 'REJECTED',
  });
}

export async function getAdminWalletWithdrawalRequests() {
  return get('/oxybrick-service/getAllShowingToAdminWalletWithdrawal');
}

export async function updateAdminWalletWithdrawalStatus({ id, userId, requestAmount, initiatedDate, approvedBy, comments, walletStatus }) {
  return patch('/oxybrick-service/walletWithdrawalApprovedAndRejectedByAdmin', {
    id,
    userId,
    requestAmount,
    initiatedDate,
    approvedBy,
    comments,
    walletStatus,
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// DEALS  (SD Lots / Global Deals)
// Enums:
//   dealSubType  : STUDENT
//   dealType     : NORMAL | TEST
//   globalDealType: SDLOT | GOLD | REALGOLD
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /oxybrick-service/getRunningAndClosedDeals/{type}
 * type: running | closed | test
 */
export async function getRunningClosedDeals(type = 'running') {
  return get(`/oxybrick-service/getRunningAndClosedDeals/${type}`);
}

/**
 * GET /oxybrick-service/getDealParticipantsData/{dealId}
 */
export async function getDealParticipants(dealId) {
  return get(`/oxybrick-service/getDealParticipantsData/${dealId}`);
}

/**
 * GET /oxybrick-service/getDealsBasedOnDealType/{dealType}
 */
export async function getAdminDeals(dealType = 'NORMAL') {
  return get(`/oxybrick-service/getDealsBasedOnDealType/${dealType}`);
}

/**
 * PATCH /oxybrick-service/createGlobalDeal
 * Used for BOTH create and update.
 * Body: {
 *   dealAmount, dealName, dealSubType, dealType, duration,
 *   emiEndDate, fundsAcceptanceEndDate, fundsAcceptanceStartDate,
 *   globalDealType, halfInterest, loanActiveDate,
 *   maxParticipation, minimumParticipation,
 *   monthlyInterest, quartelyInterest, yearlyInterest,
 *   id (optional — include for update)
 * }
 */
export async function createOrUpdateDeal(dealData) {
  return patch('/oxybrick-service/createGlobalDeal', dealData);
}

export async function deleteDeal(id) {
  return del(`/oxybrick-service/deleteDeal/${id}`);
}

// ══════════════════════════════════════════════════════════════════════════════
// OXYLOANS
// ══════════════════════════════════════════════════════════════════════════════

export async function getAdminOxyLoansDeals() {
  return get('/admin-service/oxyloans/deals');
}

// ══════════════════════════════════════════════════════════════════════════════
// OFFLINE PAYMENTS
// ══════════════════════════════════════════════════════════════════════════════

export async function getAdminOfflinePayments() {
  return get('/admin-service/offline/payments');
}

export async function updateOfflinePayment(id, updates) {
  return patch(`/admin-service/offline/payments/${id}`, updates);
}

// ══════════════════════════════════════════════════════════════════════════════
// PROPERTIES
// ══════════════════════════════════════════════════════════════════════════════

export async function getAdminProperties() {
  return get('/admin-service/properties');
}

// ══════════════════════════════════════════════════════════════════════════════
// BANK ACCOUNTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /oxybrick-service/cashfree/getAdminBankDetailsInfo
 */
export async function getAdminBankDetails() {
  return get('/oxybrick-service/cashfree/getAdminBankDetailsInfo');
}

/**
 * POST /oxybrick-service/cashfree/saveBankDetailsByAdmin
 * Body: { accountAddDate, accountNumber, accountType, addBy, bankName, branch, ifscCode, companyName }
 */
export async function saveBankDetails({ accountAddDate, accountNumber, accountType, addBy, bankName, branch, ifscCode, companyName }) {
  return post('/oxybrick-service/cashfree/saveBankDetailsByAdmin', {
    accountAddDate, accountNumber, accountType, addBy, bankName, branch, ifscCode,
    companyName: companyName ?? '',
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SUPPORT TICKETS
// ══════════════════════════════════════════════════════════════════════════════

export async function getSupportTickets() {
  return get('/admin-service/support/tickets');
}

export async function replyToTicket(id, message) {
  return post(`/admin-service/support/tickets/${id}/reply`, { message });
}

export async function updateTicketStatus(id, status) {
  return patch(`/admin-service/support/tickets/${id}`, { status });
}

// ══════════════════════════════════════════════════════════════════════════════
// USER NAME LOOKUP
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /student-service/user/profile?id={userId}
 * Fetch name for a single userId.
 */
export async function getUserNameById(userId) {
  const data = await get(`/student-service/user/profile?id=${userId}`);
  const first = data?.firstName ?? data?.name ?? '';
  const last  = data?.lastName  ?? '';
  return (first + ' ' + last).trim() || userId;
}

/**
 * Fetch names for multiple comma-separated or array of userIds.
 * Returns: [{ id, name }]
 */
export async function getUserNamesByIds(ids) {
  const list = (Array.isArray(ids) ? ids : String(ids).split(','))
    .map(s => s.trim()).filter(Boolean);
  const results = await Promise.allSettled(list.map(id => getUserNameById(id)));
  return list.map((id, i) => ({
    id,
    name: results[i].status === 'fulfilled' ? results[i].value : 'Not found',
    error: results[i].status === 'rejected',
  }));
}



export async function getPlatformStats() {
  return get('/admin-service/stats/platform');
}

// ══════════════════════════════════════════════════════════════════════════════
// TOTAL USERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /auth-service/user/registered-users1
 * Params: pageIndex, pageSize, sortBy, sortOrder, status
 */
export async function getRegisteredUsers({ pageIndex = 0, pageSize = 20, sortBy = 'id', sortOrder = 'DESC', status = 'live' } = {}) {
  return get(`/auth-service/user/registered-users1?pageIndex=${pageIndex}&pageSize=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}&status=${status}`);
}

/**
 * POST /oxybrick-service/getUserInfoBySource
 * Body: { email, mobileNumber, userName }
 */
export async function searchUserByInfo({ email = null, mobileNumber = null, userName = null } = {}) {
  return post('/oxybrick-service/getUserInfoBySource', { email, mobileNumber, userName });
}

// ══════════════════════════════════════════════════════════════════════════════
// MIGRATED USERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /oxybrick-service/getAllMigratedUsersData
 */
export async function getAllMigratedUsers() {
  return get('/oxybrick-service/getAllMigratedUsersData');
}

/**
 * POST /oxybrick-service/migrateApprovedAndRejection
 * Body: { approvedBy, migrationStatus, userId }
 */
export async function approveMigratedUser(userId, approvedBy = '', migrationStatus = 'APPROVED') {
  return post('/oxybrick-service/migrateApprovedAndRejection', {
    approvedBy:      approvedBy.toUpperCase(),
    migrationStatus,
    userId,
  });
}

/**
 * POST /oxybrick-service/adminGetMigratedUserInfo
 * Body: { lenderName, password }
 */
export async function adminGetMigratedUserInfo({ lenderName, password = null, lenderId = null, dealName = null } = {}) {
  return post('/oxybrick-service/adminGetMigratedUserInfo', {
    lenderName,
    password,
    lenderId,
    dealName
  });
}

/**
 * PATCH /oxybrick-service/updateMigratedUsersDataByAdmin
 * Body: { id, interestDate, lenderId, lenderName, participationDate, password, roi }
 */
export async function updateMigratedUsersDataByAdmin(payload) {
  return patch('/oxybrick-service/updateMigratedUsersDataByAdmin', payload);
}

// ══════════════════════════════════════════════════════════════════════════════
// SD LOT INTEREST PAYOUTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /oxybrick-service/interestBreakUpByDeal?dealId={dealId}
 */
export async function getInterestBreakUpByDeal(dealId) {
  return get(`/oxybrick-service/interestBreakUpByDeal?dealId=${encodeURIComponent(dealId)}`);
}

/**
 * PATCH /oxybrick-service/interestApprovals
 * Body: { dealId, sheetGeneratedDate, usersDealsBasedInterestInfoDto }
 */
export async function submitInterestApprovals(payload) {
  return patch('/oxybrick-service/interestApprovals', payload);
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSET BASED INFO
// ══════════════════════════════════════════════════════════════════════════════

/**
 * PATCH /oxybrick-service/saveAssetBasedInfo
 */
export async function saveAssetBasedInfo(payload) {
  return patch('/oxybrick-service/saveAssetBasedInfo', payload);
}

/**
 * GET /oxybrick-service/getAllLoadAssetDetails
 */
export async function getAllLoadAssetDetails() {
  return get('/oxybrick-service/getAllLoadAssetDetails');
}

/**
 * POST /upload-service/adminUplaodSaleDeedDocuments?fileType=saledeed&assetId={assetId}
 */
export async function uploadSaleDeedDocument({ assetId, file }) {
  const formData = new FormData();
  formData.append('file', file);

  return post(
    `/upload-service/adminUplaodSaleDeedDocuments?fileType=saledeed&assetId=${encodeURIComponent(assetId)}`,
    formData
  );
}
