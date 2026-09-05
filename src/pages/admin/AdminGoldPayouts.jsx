import { useState, useCallback } from 'react';
import { DateSelectScreen, InterestDealsTable, MONTHS } from './AdminInterestPayments';
import { getGoldAdminInterestDeals } from '../../api/afterlogin-admin';

// Gold deals use globalDealType = 'GOLD'
const GOLD_DEAL_TYPE = 'GOLD';

function mapGoldDealRow(item, index) {
  const id = item?.dealId ?? `gold-deal-${index + 1}`;
  const fallbackName = typeof id === 'string' ? `Gold Deal ${id.slice(0, 8)}` : `Gold Deal ${index + 1}`;
  const breakupRows = Array.isArray(item?.usersDealsBasedInterestInfoDto)
    ? item.usersDealsBasedInterestInfoDto
    : [];

  function numberOrNull(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  function getFirstNumber(...vals) {
    for (const v of vals) { const n = numberOrNull(v); if (n !== null) return n; }
    return null;
  }
  function mapStatus(status) {
    const s = String(status ?? '').trim().toUpperCase();
    if (!s) return 'INITIATED';
    if (s === 'INITIATED') return 'INITIATED';
    if (s === 'GENERATED') return 'GENERATED';
    if (s === 'EXECUTED') return 'EXECUTED';
    if (['PAID', 'COMPLETED', 'SUCCESS'].includes(s)) return 'EXECUTED';
    if (['PROCESSING', 'IN_PROGRESS'].includes(s)) return 'GENERATED';
    return 'INITIATED';
  }

  return {
    id,
    dealName: item?.dealName ?? fallbackName,
    roi: Number(item?.roi ?? 0),
    lenders: getFirstNumber(
      item?.lenders,
      item?.lendersCount,
      item?.lenderCount,
      item?.totalLenders,
      item?.noOfLenders,
      item?.participatedUsersCount,
      breakupRows.length || null
    ),
    amount: Number(
      item?.totalPrincipalParticipationAmount ??
      item?.currentPrincipalAmount ??
      item?.dealAmount ?? 0
    ),
    interestAmount: getFirstNumber(
      item?.interestAmount,
      item?.totalInterestAmount,
      item?.totalInterest,
      item?.payableInterest,
      item?.monthlyInterestAmount,
      breakupRows.reduce((s, r) => s + Number(r?.interestAmount ?? 0), 0) || null
    ),
    status: mapStatus(item?.paymentStatus),
    paymentDate: item?.actualInterestDate ?? null,
  };
}

export default function AdminGoldPayouts() {
  const [period, setPeriod] = useState(null);

  const fetchGoldDeals = useCallback(async (selectedPeriod) => {
    if (!selectedPeriod) return [];
    const startDay  = String(selectedPeriod.startDay ?? selectedPeriod.day).padStart(2, '0');
    const endDay    = String(selectedPeriod.endDay   ?? selectedPeriod.day).padStart(2, '0');
    const monthName = MONTHS[selectedPeriod.month].toLocaleLowerCase();
    const year      = String(selectedPeriod.year);

    const response = await getGoldAdminInterestDeals({
      monthName,
      year,
      startDate: startDay,
      endDate:   endDay,
    });

    const all = Array.isArray(response) ? response : [];
    // Filter to Gold deals only; if the API already scopes by deal type, this is a safety net.
    const goldDeals = all.filter(
      (d) => !d?.globalDealType || d.globalDealType === GOLD_DEAL_TYPE
    );
    return goldDeals.map(mapGoldDealRow);
  }, []);

  if (!period) {
    return (
      <DateSelectScreen
        title="Gold Deal Interest Payout"
        subtitle="Select a payment month to view and process Gold deal interest payouts"
        onProceed={setPeriod}
      />
    );
  }

  return (
    <InterestDealsTable
      period={period}
      onBack={() => setPeriod(null)}
      pageTitle="Gold Deal Interest Payout"
      fetchDeals={fetchGoldDeals}
    />
  );
}
