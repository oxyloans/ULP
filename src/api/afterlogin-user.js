/**
 * api/afterlogin-user.js
 * All user API calls that require an auth token.
 * All functions hit real endpoints — no dummy data.
 */

import { get, post, put, patch } from './client';
import { getUserId } from './client';

// ══════════════════════════════════════════════════════════════════════════════
// WALLET
// ══════════════════════════════════════════════════════════════════════════════

export async function getWalletBalance() {
  const userId = getUserId();
  return get(`/oxybrick-service/cashfree/getAllUtrDetails/${userId}`);
}

export async function getWalletHistory() {
  const userId = getUserId();
  return get(`/oxybrick-service/cashfree/getAllUtrDetails/${userId}`);
}

export async function uploadWalletSlipFile(file,companyName) {
  const userId = getUserId();
  const form   = new FormData();
  form.append('file', file);
  return post(
    `/upload-service/uploadWalletBalanceSlip?userId=${userId}&fileType=walletload&companyName=${companyName}`,
    form
  );
}

export async function submitWalletSlip({ documentId, transactionAmount, transactionDate, utrNumber }) {
  const userId = getUserId();
  return post('/oxybrick-service/cashfree/saveUtrDetails', {
    documentId,
    transactionAmount,
    transactionDate,
    userId,
    utrNumber,
  });
}

export async function uploadDepositSlip({ file, transactionAmount, transactionDate, utrNumber, companyName }) {
  const uploadResult = await uploadWalletSlipFile(file, companyName);
  const documentId   = uploadResult.id ?? uploadResult.documentId;
  if (!documentId) throw new Error('File upload failed — no document ID returned.');
  return submitWalletSlip({ documentId, transactionAmount, transactionDate, utrNumber });
}

export async function analyzeDepositSlip(file) {
  const form = new FormData();
  form.append('file', file);
  return post('/wallet-service/wallet/analyze-slip', form);
}

export async function getAdminBankDetailsInfo() {
  return get('/oxybrick-service/cashfree/getAdminBankDetailsInfo');
}

// ══════════════════════════════════════════════════════════════════════════════
// SD LOTS / DEALS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /oxybrick-service/getDealsBasedOnDealType/NORMAL
 * Returns array of deals with shape:
 * { id, dealAmount, dealName, fundsAcceptanceStartDate, fundsAcceptanceEndDate,
 *   duration, loanActiveDate, emiEndDate, dealType, dealSubType, dealStatus,
 *   globalDealType, minimumParticipation, maxParticipation,
 *   monthlyInterest, quartelyInterest, halfInterest, yearlyInterest }
 */
export async function getSdLots(dealType) {
  return get('/oxybrick-service/getDealsBasedOnDealType/'+ dealType);
}

/**
 * GET /oxybrick-service/getDealData/{dealId}
 * Returns single deal object (same shape as above).
 */
export async function getSdLotDetail(id) {
  return get(`/oxybrick-service/getDealData/${id}`);
  // return get(`/oxybrick-service/getDealData/a72493e3-dadf-43aa-8034-df67182273fb`);
}

export async function participateInSdLot({ sdLotId, amount }) {
  return post('/sd-lot-service/sd-lot/participate', { sdLotId, amount });
}

/**
 * PATCH /oxybrick-service/participationAndUpdate
 * Body: { dealId, lenderReturnsType, participatedAmount, rateofinterest, userId }
 */
export async function participateInDeal({ dealId, lenderReturnsType, participatedAmount, rateofinterest }) {
  const userId = getUserId();
  return patch('/oxybrick-service/participationAndUpdate', {
    dealId,
    lenderReturnsType,
    participatedAmount,
    rateofinterest,
    userId,
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// FAMILY
// ══════════════════════════════════════════════════════════════════════════════

export async function getFamilyMembers() {
  return get('/user-service/family/members');
}

export async function addFamilyMemberRequest({ lrId, relation }) {
  return post('/user-service/family/add-request', { lrId, relation });
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD / FINANCIALS
// ══════════════════════════════════════════════════════════════════════════════

export async function getMemberFinancials(memberId) {
  return get(`/user-service/financials/${memberId}`);
}

export async function getFamilyAggregate() {
  return get('/user-service/financials/family');
}

export async function getRevenueReport() {
  return get('/user-service/financials/revenue');
}

// ══════════════════════════════════════════════════════════════════════════════
// RUNNING DEALS (Participated)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /oxybrick-service/getRunningDeals/{userId}
 * Returns: { userId, userName, mobileNumber, participationInfo: [...] }
 */
export async function getRunningDeals() {
  const userId = getUserId();
  return get(`/oxybrick-service/getRunningDeals/${userId}`);
}

/**
 * GET /oxybrick-service/userOfflineParticipationDealsInfo/{lenderId}
 * Returns migrated/offline participation deal rows for a lender/user.
 */
export async function getUserOfflineParticipationDealsInfo() {
  const lenderId = getUserId();
  return get(`/oxybrick-service/userOfflineParticipationDealsInfo/${lenderId}`);
}

// ══════════════════════════════════════════════════════════════════════════════
// PROFILE  — GET /student-service/user/profile?id={userId}
// ══════════════════════════════════════════════════════════════════════════════

export async function getUserProfile() {
  const userId = getUserId();
  return get(`/student-service/user/profile?id=${userId}`);
}

export async function updateUserProfile({ name, email, phone }) {
  return put('/user-service/user/profile', { name, email, phone });
}

// ══════════════════════════════════════════════════════════════════════════════
// GOLD DEALS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /oxybrick-service/{userId}/getUserGainedPercentage
 * Returns overall + per-deal gold earnings for the logged-in user.
 */
export async function getGoldDealsEarnings() {
  const userId = getUserId();
  return get(`/oxybrick-service/${userId}/getUserGainedPercentage`);
}

/**
 * GET /oxybrick-service/getAllParticipation/{userId}
 * Returns all participations for the logged-in user.
 */
export async function getAllParticipationByUser() {
  const userId = getUserId();
  return get(`/oxybrick-service/getAllParticipation/${userId}`);
}

/**
 * GET /oxybrick-service/{userId}/{dealId}/goldGrowthPercentage
 * Returns gold growth breakdown for a specific deal.
 */
export async function getGoldGrowthDetail(dealId) {
  const userId = getUserId();
  return get(`/oxybrick-service/${userId}/${dealId}/goldGrowthPercentage`);
}

/**
 * GET /oxybrick-service/userInterestCalculations?propertyId={propertyId}&userId={userId}
 * Returns interest payout schedule for logged-in user and selected property.
 */
export async function getUserInterestCalculations(propertyId) {
  const userId = getUserId();
  return get(`/oxybrick-service/userInterestCalculations?propertyId=${propertyId}&userId=${userId}`);
}

/**
 * GET /oxybrick-service
 * Fetches all open property deals. Filter to propertyType === 'GOLDLOT' on the client.
 */
export async function getGoldLotDeals({ pageIndex = 0, pageSize = 100, search = 'OPEN', sortBy = 'id', sortOrder = 'DESC' } = {}) {
  return get(`/oxybrick-service?pageIndex=${pageIndex}&pageSize=${pageSize}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
}

/**
 * GET /oxybrick-service/{id}
 * Fetch a single property/deal by id.
 */
export async function getPropertyById(id) {
  return get(`/oxybrick-service/${id}`);
}

/**
 * GET /oxybrick-service/getAllparticipations?propertyId={propertyId}&userId={userId}
 */
export async function getGoldParticipationDetails(propertyId) {
  const userId = getUserId();
  return get(`/oxybrick-service/getAllparticipations?propertyId=${propertyId}&userId=${userId}`);
}

/**
 * GET /oxybrick-service/api/download/mou?propertyId={propertyId}&userId={userId}
 * Returns blob data.
 */
export async function downloadGoldMou(propertyId, userId) {
  return get(`/oxybrick-service/api/download/mou?propertyId=${propertyId}&userId=${userId}`, {
    responseType: 'blob',
  });
}

/**
 * Download MOU for the current logged-in user.
 */
export async function downloadGoldMouForCurrentUser(propertyId) {
  const userId = getUserId();
  return get(`/oxybrick-service/api/download/mou?propertyId=${propertyId}&userId=${userId}`, {
    responseType: 'blob',
  });
}

/**
 * POST /upload-service/participationPaymentFeeUpload
 * Query params:
 * propertyId, fileType=investment, userId, participationId, paymentAmount
 */
export async function uploadGoldParticipationSlip({ propertyId, participationId, amount, file }) {
  const userId = getUserId();
  const formData = new FormData();
  formData.append('file', file);
  return post(
    `/upload-service/participationPaymentFeeUpload?propertyId=${propertyId}&fileType=investment&userId=${userId}&participationId=${participationId}&paymentAmount=${amount}`,
    formData
  );
}

/**
 * POST /upload-service/downloadParticipationPaymentFeeUpload
 */
export async function getGoldParticipationSlips({ propertyId, participationId }) {
  const userId = getUserId();
  return post(
    `/upload-service/downloadParticipationPaymentFeeUpload?fileType=investment&userId=${userId}&propertyId=${propertyId}&participationId=${participationId}`,
    null
  );
}

/**
 * PATCH /upload-service/updateUserDescription/{documentId}?description={description}
 */
export async function updateSlipDescription({ documentId, description }) {
  return patch(`/upload-service/updateUserDescription/${documentId}?description=${encodeURIComponent(description ?? '')}`, null);
}

// ══════════════════════════════════════════════════════════════════════════════
// MIGRATE DATA
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /oxybrick-service/migratedUsersData
 * Body: { lenderId, migrationConsent, mobileNumber, password, userId, userName }
 */
export async function migrateUserData({ lenderId, migrationConsent = 'yes', mobileNumber, password, userName }) {
  const userId = getUserId();
  return post('/oxybrick-service/migratedUsersData', {
    lenderId,
    migrationConsent,
    mobileNumber,
    password,
    userId,
    userName,
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// GOLD RATE
// ═════════════════════════════════════════════════════════════════════════════

export async function GoldRate(){
  return get('/user-service/gold_daily-update');
}
