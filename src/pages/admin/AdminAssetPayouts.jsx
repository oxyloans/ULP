import { useState } from 'react';
import { DateSelectScreen, InterestDealsTable } from './AdminInterestPayments';

const ASSET_DEALS = [
  { id: 101, dealName: 'Asset Deal Alpha',  roi: 2, lenders: 10, amount: 200000, status: 'PENDING' },
  { id: 102, dealName: 'Asset Deal Beta',   roi: 3, lenders: 15, amount: 375000, status: 'PENDING' },
  { id: 103, dealName: 'Asset Deal Gamma',  roi: 2, lenders: 6,  amount: 120000, status: 'PAID'    },
  { id: 104, dealName: 'Asset Deal Delta',  roi: 2, lenders: 22, amount: 440000, status: 'PENDING' },
  { id: 105, dealName: 'Asset Deal Eps',    roi: 3, lenders: 9,  amount: 180000, status: 'PENDING' },
  { id: 106, dealName: 'Asset Deal Zeta',   roi: 2, lenders: 12, amount: 240000, status: 'PAID'    },
];

export default function AdminAssetPayouts() {
  const [period, setPeriod] = useState(null);
  if (!period) {
    return (
      <DateSelectScreen
        title="Asset Interest Payout"
        subtitle="Select a payment month to view and process Asset interest payouts"
        onProceed={setPeriod}
      />
    );
  }
  return (
    <InterestDealsTable
      period={period}
      onBack={() => setPeriod(null)}
      pageTitle="Asset Interest Payout"
      mockDeals={ASSET_DEALS}
    />
  );
}
