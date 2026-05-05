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
 * GET /oxybrick-service/{userId}/{dealId}/goldGrowthPercentage
 * Returns gold growth breakdown for a specific deal.
 */
export async function getGoldGrowthDetail(dealId) {
  const userId = getUserId();
  return get(`/oxybrick-service/${userId}/${dealId}/goldGrowthPercentage`);
}
