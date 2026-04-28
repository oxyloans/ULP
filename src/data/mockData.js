// ─── OxyLoans ─────────────────────────────────────────────────────────────────
export const oxyloansMetrics = [
  { label: 'Total Lenders', value: '1,001', highlight: '+22 this month' },
  { label: 'Active Loans', value: '₹4.2Cr', highlight: '2.2x growth YoY' },
  { label: 'Repayment Rate', value: '96.8%', highlight: 'On track' },
];

export const oxyloansDeals = [
  { id: 'OL-2024-001', borrower: 'Ravi Kumar', lender: 'Suresh Reddy', amount: '₹5,00,000', rate: '14%', status: 'Active', due: 'Jun 2025' },
  { id: 'OL-2024-002', borrower: 'Priya Sharma', lender: 'Anand Krishnan', amount: '₹2,50,000', rate: '13%', status: 'Pending', due: 'Aug 2025' },
  { id: 'OL-2024-003', borrower: 'Kiran Rao', lender: 'Meena Devi', amount: '₹8,00,000', rate: '15%', status: 'Closed', due: 'Jan 2024' },
  { id: 'OL-2024-004', borrower: 'Deepak Nair', lender: 'Vijay Menon', amount: '₹3,75,000', rate: '14.5%', status: 'Active', due: 'Sep 2025' },
];

// ─── Offline Deals ────────────────────────────────────────────────────────────
export const offlineDealsMetrics = [
  { label: 'Total Deals', value: '348', highlight: '+18 this week' },
  { label: 'Deal Value', value: '₹28.4Cr', highlight: 'Offline verified' },
  { label: 'Pending Approval', value: '12', highlight: 'Needs action' },
];

export const offlinePayments = [
  { ref: 'OP-001', name: 'Srinivas Goud', type: 'Cash', amount: '₹1,20,000', date: 'May 10, 2025', status: 'Verified' },
  { ref: 'OP-002', name: 'Lakshmi Bai', type: 'Cheque', amount: '₹75,000', date: 'May 11, 2025', status: 'Pending' },
  { ref: 'OP-003', name: 'Ramesh Yadav', type: 'DD', amount: '₹2,00,000', date: 'May 12, 2025', status: 'Verified' },
  { ref: 'OP-004', name: 'Anitha Reddy', type: 'Cash', amount: '₹50,000', date: 'May 13, 2025', status: 'Rejected' },
];

// ─── OxyBricks Properties ─────────────────────────────────────────────────────
export const propertySummary = {
  total: 412,
  plots:  { count: 180, docs: '300–400', value: '₹42Cr' },
  flats:  { count: 120, docs: '80–200',  value: '₹38Cr' },
  acres:  { count: 72,  docs: '010–25',  value: '₹18Cr' },
  villas: { count: 40,  docs: '15–60',   value: '₹24Cr' },
};

export const properties = [
  { id: 'PRP-001', name: 'Green Valley Plot 12', type: 'Plot',  location: 'Hyderabad', area: '200 sq yd', value: '₹24L',   status: 'Available', ownerName: 'Rajesh Varma' },
  { id: 'PRP-002', name: 'Sunrise Flat 3B',       type: 'Flat',  location: 'Bangalore', area: '1200 sqft', value: '₹65L',   status: 'Sold',      ownerName: 'Arjun Varma' },
  { id: 'PRP-003', name: 'Farmland Acre Block 7', type: 'Acre',  location: 'Warangal',  area: '2 acres',   value: '₹18L',   status: 'Available', ownerName: null },
  { id: 'PRP-004', name: 'Lakeview Villa 5',      type: 'Villa', location: 'Hyderabad', area: '3200 sqft', value: '₹1.8Cr', status: 'Reserved',  ownerName: 'Vikram Nair' },
  { id: 'PRP-005', name: 'Tech Park Plot 44',     type: 'Plot',  location: 'Pune',      area: '150 sq yd', value: '₹18L',   status: 'Available', ownerName: null },
];

// ─── Family Members (returned by API after admin approval) ────────────────────
// accessLog = who from the family viewed this member's data, on which platform
export const familyMembers = [
  {
    id: 'FM-001',
    name: 'Rajesh Varma',
    role: 'Primary',
    email: 'rajesh@example.com',
    phone: '98XXXXXXX1',
    lrId: 'LR-1001',
    status: 'Approved',
    joinedOn: 'Jan 2024',
    linkedMembers: [
      { id: 'FM-002', name: 'Sunita Varma',  relation: 'Spouse' },
      { id: 'FM-003', name: 'Arjun Varma',   relation: 'Son' },
      { id: 'FM-004', name: 'Meena Varma',   relation: 'Daughter' },
    ],
    accessLog: [
      { byName: 'Sunita Varma',  relation: 'Spouse',   platform: 'OxyLoans',  action: 'Viewed Loan Details',    time: '2 hrs ago' },
      { byName: 'Arjun Varma',   relation: 'Son',      platform: 'OxyBricks', action: 'Viewed Property List',   time: 'Yesterday' },
      { byName: 'Meena Varma',   relation: 'Daughter', platform: 'Offline',   action: 'Viewed Payment History', time: '3 days ago' },
    ],
  },
  {
    id: 'FM-002',
    name: 'Sunita Varma',
    role: 'Spouse',
    email: 'sunita@example.com',
    phone: '98XXXXXXX2',
    lrId: 'LR-1002',
    status: 'Approved',
    joinedOn: 'Jan 2024',
    linkedMembers: [
      { id: 'FM-001', name: 'Rajesh Varma', relation: 'Spouse' },
    ],
    accessLog: [
      { byName: 'Rajesh Varma', relation: 'Spouse', platform: 'OxyLoans', action: 'Viewed Family Summary', time: '1 hr ago' },
    ],
  },
  {
    id: 'FM-003',
    name: 'Arjun Varma',
    role: 'Son',
    email: 'arjun@example.com',
    phone: '98XXXXXXX3',
    lrId: 'LR-1003',
    status: 'Approved',
    joinedOn: 'Feb 2024',
    linkedMembers: [
      { id: 'FM-001', name: 'Rajesh Varma', relation: 'Father' },
    ],
    accessLog: [],
  },
  {
    id: 'FM-004',
    name: 'Meena Varma',
    role: 'Daughter',
    email: 'meena@example.com',
    phone: '98XXXXXXX4',
    lrId: 'LR-1004',
    status: 'Pending',
    joinedOn: 'Mar 2024',
    linkedMembers: [],
    accessLog: [],
  },
  {
    id: 'FM-005',
    name: 'Vikram Nair',
    role: 'Primary',
    email: 'vikram@example.com',
    phone: '97XXXXXXX5',
    lrId: 'LR-2001',
    status: 'Approved',
    joinedOn: 'Dec 2023',
    linkedMembers: [
      { id: 'FM-006', name: 'Kavya Nair', relation: 'Spouse' },
    ],
    accessLog: [
      { byName: 'Kavya Nair', relation: 'Spouse', platform: 'Offline', action: 'Viewed Offline Deals', time: '30 min ago' },
    ],
  },
  {
    id: 'FM-006',
    name: 'Kavya Nair',
    role: 'Spouse',
    email: 'kavya@example.com',
    phone: '97XXXXXXX6',
    lrId: 'LR-2002',
    status: 'Pending',
    joinedOn: 'Apr 2024',
    linkedMembers: [],
    accessLog: [],
  },
];

// ─── Pending family add requests (admin review queue) ─────────────────────────
export const pendingRequests = [
  { id: 'REQ-001', name: 'Suresh Babu',  email: 'suresh@example.com', phone: '96XXXXXXX1', lrId: 'LR-3001', submittedOn: 'May 14, 2025' },
  { id: 'REQ-002', name: 'Padma Latha',  email: 'padma@example.com',  phone: '96XXXXXXX2', lrId: 'LR-3002', submittedOn: 'May 15, 2025' },
  { id: 'REQ-003', name: 'Gopal Rao',    email: 'gopal@example.com',  phone: '95XXXXXXX3', lrId: 'LR-3003', submittedOn: 'May 15, 2025' },
];

// ─── Per-member financial data (keyed by member id) ───────────────────────────
export const memberFinancials = {
  'FM-001': {
    name: 'Rajesh Varma', lrId: 'LR-1001', role: 'Primary', color: '#6366f1',
    oxyloans: {
      monthlyInterest: '₹52K', totalInvested: '₹18.5L', totalEarned: '₹4.2L',
      running: 2, closed: 1, pending: 1,
      deals: [
        { id: 'OL-001', borrower: 'Ravi Kumar',   lender: 'Rajesh Varma', amount: '₹5,00,000', rate: '14%',   status: 'Active',  due: 'Jun 2025' },
        { id: 'OL-002', borrower: 'Priya Sharma', lender: 'Rajesh Varma', amount: '₹2,50,000', rate: '13%',   status: 'Pending', due: 'Aug 2025' },
        { id: 'OL-003', borrower: 'Kiran Rao',    lender: 'Rajesh Varma', amount: '₹8,00,000', rate: '15%',   status: 'Closed',  due: 'Jan 2024' },
        { id: 'OL-004', borrower: 'Deepak Nair',  lender: 'Rajesh Varma', amount: '₹3,75,000', rate: '14.5%', status: 'Active',  due: 'Sep 2025' },
      ],
      monthlyChart: [18, 24, 20, 32, 28, 38, 34, 42, 36, 48, 44, 52],
    },
    offline: {
      totalPaid: '₹4.45L',
      monthlyInterest: '₹18K',
      totalInvested: '₹4.45L',
      running: 2,
      closed: 1,
      pending: 1,
      monthlyChart: [8, 12, 10, 15, 14, 18, 16, 20, 17, 22, 20, 18],
      payments: [
        { ref: 'OP-001', name: 'Srinivas Goud', mode: 'Offline', type: 'Cash',   amount: '₹1,20,000', date: 'May 10, 2025', status: 'Verified' },
        { ref: 'OP-002', name: 'Lakshmi Bai',   mode: 'Online',  type: 'NEFT',   amount: '₹75,000',   date: 'May 11, 2025', status: 'Pending'  },
        { ref: 'OP-003', name: 'Ramesh Yadav',  mode: 'Offline', type: 'DD',     amount: '₹2,00,000', date: 'May 12, 2025', status: 'Verified' },
        { ref: 'OP-004', name: 'Anitha Reddy',  mode: 'CX',      type: 'CX Pay', amount: '₹50,000',   date: 'May 13, 2025', status: 'Rejected' },
        { ref: 'OP-005', name: 'Vijay Menon',   mode: 'Online',  type: 'UPI',    amount: '₹90,000',   date: 'May 14, 2025', status: 'Verified' },
        { ref: 'OP-006', name: 'Meena Devi',    mode: 'CX',      type: 'CX Pay', amount: '₹1,10,000', date: 'May 15, 2025', status: 'Pending'  },
      ],
    },
    properties: { total: 2, plots: 1, flats: 1, value: '₹89L' },
    revenue: { oxyloans: 420000, offline: 445000, oxybricks: 890000, total: 1755000 },
  },
  'FM-002': {
    name: 'Sunita Varma', lrId: 'LR-1002', role: 'Spouse', color: '#ec4899',
    oxyloans: {
      monthlyInterest: '₹28K', totalInvested: '₹9.2L', totalEarned: '₹1.8L',
      running: 1, closed: 2, pending: 0,
      deals: [
        { id: 'OL-S01', borrower: 'Meena Devi',  lender: 'Sunita Varma', amount: '₹3,00,000', rate: '13.5%', status: 'Active', due: 'Oct 2025' },
        { id: 'OL-S02', borrower: 'Gopal Rao',   lender: 'Sunita Varma', amount: '₹4,00,000', rate: '14%',   status: 'Closed', due: 'Mar 2024' },
        { id: 'OL-S03', borrower: 'Vijay Menon', lender: 'Sunita Varma', amount: '₹2,20,000', rate: '13%',   status: 'Closed', due: 'Dec 2023' },
      ],
      monthlyChart: [10, 14, 12, 18, 16, 22, 20, 25, 22, 28, 26, 28],
    },
    offline: {
      totalPaid: '₹1.8L',
      monthlyInterest: '₹8K',
      totalInvested: '₹1.8L',
      running: 1,
      closed: 1,
      pending: 1,
      monthlyChart: [4, 6, 5, 8, 7, 9, 8, 10, 9, 11, 10, 8],
      payments: [
        { ref: 'OP-S01', name: 'Sunita Varma', mode: 'Offline', type: 'Cheque', amount: '₹1,00,000', date: 'Apr 20, 2025', status: 'Verified' },
        { ref: 'OP-S02', name: 'Sunita Varma', mode: 'Online',  type: 'IMPS',   amount: '₹80,000',   date: 'May 5, 2025',  status: 'Pending'  },
      ],
    },
    properties: { total: 1, plots: 0, flats: 1, value: '₹65L' },
    revenue: { oxyloans: 180000, offline: 180000, oxybricks: 650000, total: 1010000 },
  },
  'FM-003': {
    name: 'Arjun Varma', lrId: 'LR-1003', role: 'Son', color: '#10b981',
    oxyloans: {
      monthlyInterest: '₹18K', totalInvested: '₹6.5L', totalEarned: '₹0.9L',
      running: 1, closed: 0, pending: 1,
      deals: [
        { id: 'OL-A01', borrower: 'Ravi Kumar',   lender: 'Arjun Varma', amount: '₹3,50,000', rate: '14%',   status: 'Active',  due: 'Nov 2025' },
        { id: 'OL-A02', borrower: 'Priya Sharma', lender: 'Arjun Varma', amount: '₹3,00,000', rate: '13.5%', status: 'Pending', due: 'Jan 2026' },
      ],
      monthlyChart: [6, 8, 7, 10, 9, 12, 11, 14, 13, 16, 15, 18],
    },
    offline: {
      totalPaid: '₹0.9L',
      monthlyInterest: '₹5K',
      totalInvested: '₹0.9L',
      running: 1,
      closed: 0,
      pending: 0,
      monthlyChart: [2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 5],
      payments: [
        { ref: 'OP-A01', name: 'Arjun Varma', mode: 'CX',     type: 'CX Pay', amount: '₹50,000', date: 'May 8, 2025',  status: 'Verified' },
        { ref: 'OP-A02', name: 'Arjun Varma', mode: 'Online', type: 'UPI',    amount: '₹40,000', date: 'May 15, 2025', status: 'Verified' },
      ],
    },
    properties: { total: 1, plots: 0, flats: 1, value: '₹65L' },
    revenue: { oxyloans: 90000, offline: 90000, oxybricks: 650000, total: 830000 },
  },
};

// Family aggregate (sum across all approved members)
export const familyAggregate = {
  totalRevenue: '₹35.95L',
  oxyloansTotal: '₹34.2L',
  offlineTotal: '₹7.15L',
  oxybricksTotal: '₹22.04L',
  totalMembers: 3,
  totalDeals: 9,
  totalProperties: 4,
  memberBreakdown: [
    { id: 'FM-001', name: 'Rajesh Varma',  lrId: 'LR-1001', role: 'Primary',  color: '#6366f1', revenue: '₹17.55L', oxyloans: '₹4.2L',  offline: '₹4.45L', properties: 2 },
    { id: 'FM-002', name: 'Sunita Varma',  lrId: 'LR-1002', role: 'Spouse',   color: '#ec4899', revenue: '₹10.1L',  oxyloans: '₹1.8L',  offline: '₹1.8L',  properties: 1 },
    { id: 'FM-003', name: 'Arjun Varma',   lrId: 'LR-1003', role: 'Son',      color: '#10b981', revenue: '₹8.3L',   oxyloans: '₹0.9L',  offline: '₹0.9L',  properties: 1 },
  ],
  monthlyFamilyChart: [34, 46, 39, 60, 53, 72, 65, 81, 71, 92, 85, 98],
};

// ─── SD Lots ──────────────────────────────────────────────────────────────────
// Data shape mirrors API response fields:
//   title (deal name), tenureMonths (duration), totalSize (reservedPrice),
//   auctionType (Open/Closed), roiMonthly (monthlyRoi %), minInvestment, maxInvestment, feePercentage
export const sdLots = [
  {
    id: 'SDL-001',
    title: 'SD-2S-20L-1.6ROI-20April2026',
    auctionType: 'Open',
    status: 'Open',
    tag: 'Live',
    tagColor: '#10b981',
    // Financial
    totalSize: 2000000,          // reservedPrice
    raised: 800000,
    minInvestment: 500,          // minAmount
    maxInvestment: 100000,       // maxAmount
    roiMonthly: 1.6,             // monthlyRoi %
    roiNum: 1.6 * 12,            // annualised for display (19.2%)
    roi: '1.6% / mo',
    tenureMonths: 5,             // duration
    tenure: '5 months',
    payoutType: 'Monthly',
    feePercentage: 0,            // feePercentage1
    // Fund transfer
    bankDetails: {
      bankName: 'HDFC Bank',
      accountName: 'Oxy Realty Pvt Ltd',
      accountNumber: '50200012345678',
      ifsc: 'HDFC0001234',
      branch: 'Banjara Hills, Hyderabad',
    },
  },
  {
    id: 'SDL-002',
    title: 'SD-3S-50L-1.8ROI-15June2026',
    auctionType: 'Open',
    status: 'Open',
    tag: 'Hot',
    tagColor: '#ef4444',
    totalSize: 5000000,
    raised: 3200000,
    minInvestment: 1000,
    maxInvestment: 200000,
    roiMonthly: 1.8,
    roiNum: 1.8 * 12,
    roi: '1.8% / mo',
    tenureMonths: 3,
    tenure: '3 months',
    payoutType: 'Monthly',
    feePercentage: 0,
    bankDetails: {
      bankName: 'ICICI Bank',
      accountName: 'Oxy Realty Pvt Ltd',
      accountNumber: '123456789012',
      ifsc: 'ICIC0001234',
      branch: 'Whitefield, Bangalore',
    },
  },
  {
    id: 'SDL-003',
    title: 'SD-6S-10L-1.5ROI-01Sep2026',
    auctionType: 'Open',
    status: 'Open',
    tag: 'New',
    tagColor: '#6366f1',
    totalSize: 1000000,
    raised: 250000,
    minInvestment: 500,
    maxInvestment: 50000,
    roiMonthly: 1.5,
    roiNum: 1.5 * 12,
    roi: '1.5% / mo',
    tenureMonths: 6,
    tenure: '6 months',
    payoutType: 'Monthly',
    feePercentage: 0,
    bankDetails: {
      bankName: 'SBI',
      accountName: 'Oxy Realty Pvt Ltd',
      accountNumber: '32109876543210',
      ifsc: 'SBIN0001234',
      branch: 'Hinjewadi, Pune',
    },
  },
  {
    id: 'SDL-004',
    title: 'SD-12S-100L-2.0ROI-01Jan2026',
    auctionType: 'Closed',
    status: 'Closed',
    tag: 'Sold Out',
    tagColor: '#64748b',
    totalSize: 10000000,
    raised: 10000000,
    minInvestment: 5000,
    maxInvestment: 500000,
    roiMonthly: 2.0,
    roiNum: 2.0 * 12,
    roi: '2.0% / mo',
    tenureMonths: 12,
    tenure: '12 months',
    payoutType: 'Monthly',
    feePercentage: 0,
    bankDetails: {
      bankName: 'Axis Bank',
      accountName: 'Oxy Realty Pvt Ltd',
      accountNumber: '918010012345678',
      ifsc: 'UTIB0001234',
      branch: 'Gachibowli, Hyderabad',
    },
  },
];

// ─── Wallet ───────────────────────────────────────────────────────────────────
export const walletData = {
  availableBalance: 285000,
  totalDeposited: 450000,
  totalEarnings: 38500,
  pendingCredits: 50000,
  bankAccounts: [
    { id: 'BA-001', bankName: 'HDFC Bank',  accountNumber: '****5678', ifsc: 'HDFC0001234' },
    { id: 'BA-002', bankName: 'ICICI Bank', accountNumber: '****9012', ifsc: 'ICIC0001234' },
    { id: 'BA-003', bankName: 'SBI',        accountNumber: '****3210', ifsc: 'SBIN0001234' },
  ],
};

export const walletHistory = [
  { id: 'TXN-001', description: 'Deposit via NEFT',          type: 'CREDIT',  amount: 100000, status: 'APPROVE',    date: 'May 10, 2025 · 10:32 AM', refId: 'NEFT2025051001', hasSlip: true,  slipUrl: 'https://placehold.co/600x400?text=Slip+1' },
  { id: 'TXN-002', description: 'SD Lot Participation',      type: 'DEBIT',   amount: 75000,  status: 'COMPLETED',  date: 'May 12, 2025 · 02:15 PM', refId: 'SDL-001-PART',   hasSlip: false, slipUrl: null },
  { id: 'TXN-003', description: 'Deposit via IMPS',          type: 'CREDIT',  amount: 50000,  status: 'REVIEW',     date: 'May 14, 2025 · 09:45 AM', refId: 'IMPS2025051401', hasSlip: true,  slipUrl: 'https://placehold.co/600x400?text=Slip+2' },
  { id: 'TXN-004', description: 'Deposit via Cheque',        type: 'CREDIT',  amount: 200000, status: 'REJECT',     date: 'May 08, 2025 · 11:00 AM', refId: 'CHQ2025050801', hasSlip: true,  slipUrl: 'https://placehold.co/600x400?text=Slip+3' },
  { id: 'TXN-005', description: 'Interest Earnings Credit',  type: 'CREDIT',  amount: 12500,  status: 'APPROVE',    date: 'May 01, 2025 · 08:00 AM', refId: 'INT-APR-2025',   hasSlip: false, slipUrl: null },
  { id: 'TXN-006', description: 'SD Lot Participation',      type: 'DEBIT',   amount: 50000,  status: 'COMPLETED',  date: 'Apr 28, 2025 · 03:30 PM', refId: 'SDL-002-PART',   hasSlip: false, slipUrl: null },
  { id: 'TXN-007', description: 'Wallet Transfer Out',       type: 'DEBIT',   amount: 25000,  status: 'TRANSFER',   date: 'Apr 20, 2025 · 01:00 PM', refId: 'TRF-OUT-0420',   hasSlip: false, slipUrl: null },
  { id: 'TXN-008', description: 'Deposit via UPI',           type: 'CREDIT',  amount: 100000, status: 'APPROVE',    date: 'Apr 15, 2025 · 04:20 PM', refId: 'UPI2025041501',  hasSlip: true,  slipUrl: 'https://placehold.co/600x400?text=Slip+4' },
];
