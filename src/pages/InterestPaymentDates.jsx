import { Fragment, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserInterestCalculations } from '../api/afterlogin-user';

const GREEN = '#10b981';
const BLUE = '#6366f1';
const GOLD = '#f59e0b';
const RED = '#ef4444';

function fmtINR(n) {
  const num = Number(n ?? 0);
  if (Number.isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(num);
}

function statusChip(status) {
  const s = (status ?? '').toUpperCase();
  if (s === 'PAID' || s === 'COMPLETED') {
    return <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, background: `${GREEN}16`, border: `1px solid ${GREEN}30`, borderRadius: 999, padding: '3px 10px' }}>PAID</span>;
  }
  if (s === 'FUTURE') {
    return <span style={{ fontSize: 11, fontWeight: 700, color: BLUE, background: `${BLUE}16`, border: `1px solid ${BLUE}30`, borderRadius: 999, padding: '3px 10px' }}>FUTURE</span>;
  }
  if (s === 'PENDING') {
    return <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, background: `${GOLD}16`, border: `1px solid ${GOLD}30`, borderRadius: 999, padding: '3px 10px' }}>PENDING</span>;
  }
  return <span style={{ fontSize: 11, fontWeight: 700, color: RED, background: `${RED}16`, border: `1px solid ${RED}30`, borderRadius: 999, padding: '3px 10px' }}>{s || 'NA'}</span>;
}

function groupByStatus(rows) {
  return (rows ?? []).reduce((acc, item) => {
    const status = item?.status ?? 'Unknown';
    if (!acc[status]) acc[status] = [];
    acc[status].push(item);
    return acc;
  }, {});
}

export default function InterestPaymentDates() {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRowKey, setExpandedRowKey] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    getUserInterestCalculations(propertyId)
      .then(res => setData(res))
      .catch(e => setError(e.message ?? 'Failed to load interest schedule'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (propertyId) load();
  }, [propertyId]);

  const rows = data?.montlyInterestDetails ?? [];
  const groupedData = useMemo(() => groupByStatus(rows), [rows]);
  const orderedStatuses = useMemo(
    () => Object.keys(groupedData).sort((a, b) => Number(a) - Number(b)),
    [groupedData]
  );
  const breakUpRows = data?.userParticipationUpdation ?? [];
  const breakUpTotal = useMemo(
    () => breakUpRows.reduce((sum, item) => sum + Number(item?.interestAmount ?? 0), 0),
    [breakUpRows]
  );
  const totalInterest = useMemo(
    () => rows.reduce((sum, r) => sum + Number(r.interestAmount ?? 0), 0),
    [rows]
  );

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', padding: '90px 0' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted, #888)' }}>Loading interest payment dates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', gap: 12, padding: '90px 0' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: RED }}>{error}</p>
        <button onClick={load} style={{ padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#fff', border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,${BLUE},#4f46e5)` }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: GOLD }}>INTEREST PAYOUT</p>
          <h2 style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 900, color: 'var(--text-primary, #fff)' }}>Interest Payment Dates</h2>
        </div>
        <button onClick={() => navigate(-1)} style={{ padding: '8px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: '1px solid var(--border, rgba(255,255,255,0.08))', background: 'var(--input-bg)', color: 'var(--text-primary, #fff)', cursor: 'pointer' }}>
          Back
        </button>
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
        <div style={{ borderRadius: 14, padding: '14px 16px', border: `1px solid ${BLUE}28`, background: `${BLUE}0f` }}>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted, #888)' }}>Total Principal Amount</p>
          <p style={{ margin: '6px 0 0', fontSize: 21, fontWeight: 900, color: BLUE }}>{fmtINR(data?.totalParticipatedAmount)}</p>
        </div>
        <div style={{ borderRadius: 14, padding: '14px 16px', border: `1px solid ${GOLD}28`, background: `${GOLD}0f` }}>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted, #888)' }}>Total Scheduled Interest</p>
          <p style={{ margin: '6px 0 0', fontSize: 21, fontWeight: 900, color: GOLD }}>{fmtINR(totalInterest)}</p>
        </div>
        <div style={{ borderRadius: 14, padding: '14px 16px', border: `1px solid ${GREEN}28`, background: `${GREEN}0f` }}>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted, #888)' }}>Duration</p>
          <p style={{ margin: '6px 0 0', fontSize: 21, fontWeight: 900, color: GREEN }}>{data?.duration ?? '-'}</p>
        </div>
      </div>

      {orderedStatuses.map(status => {
        const statusRows = groupedData[status] ?? [];
        if (!statusRows.length) return null;

        return (
          <div
            key={status}
            style={{
              borderRadius: 14,
              overflow: 'hidden',
              border: '1px solid var(--border, rgba(255,255,255,0.08))',
              background: 'var(--surface-card, #1a1a2e)',
            }}
          >
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: GOLD }}>Cycle Status: {status}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted, #888)' }}>Principal: <span style={{ color: 'var(--text-primary, #fff)', fontWeight: 700 }}>{fmtINR(statusRows[0]?.firstParticipatedAmount)}</span></p>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted, #888)' }}>Return Type: <span style={{ color: 'var(--text-primary, #fff)', fontWeight: 700, textTransform: 'capitalize' }}>{statusRows[0]?.returnsType ?? data?.lenderReturnType ?? '-'}</span></p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 860, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--table-header-bg, rgba(255,255,255,0.03))' }}>
                    {['S.No', 'Interest Amount', 'Payment Status', 'Interest Paid Date', 'Actual Interest Date', 'Days Difference'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', textAlign: 'left', color: 'var(--text-muted, #888)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {statusRows.map((detail, index) => {
                    const rowKey = `${status}-${index}`;
                    const showBreakUp = Number(status) === 1 && index === 0 && breakUpRows.length > 0;
                    const isExpanded = expandedRowKey === rowKey;
                    const displayAmount = showBreakUp
                      ? Number(detail?.interestAmount ?? 0) + breakUpTotal
                      : Number(detail?.interestAmount ?? 0);

                    return (
                      <Fragment key={rowKey}>
                        <tr key={rowKey} style={{ borderTop: '1px solid var(--border, rgba(255,255,255,0.08))' }}>
                          <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-muted, #888)' }}>{index + 1}</td>
                          <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 800, color: BLUE }}>
                            {fmtINR(displayAmount)}
                            {showBreakUp && (
                              <button
                                type="button"
                                onClick={() => setExpandedRowKey(isExpanded ? '' : rowKey)}
                                style={{
                                  marginLeft: 10,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  borderRadius: 999,
                                  border: `1px solid ${GOLD}40`,
                                  background: `${GOLD}14`,
                                  color: GOLD,
                                  cursor: 'pointer',
                                  padding: '3px 10px',
                                }}
                              >
                                {isExpanded ? 'Close' : 'BreakUp'}
                              </button>
                            )}
                          </td>
                          <td style={{ padding: '10px 12px' }}>{statusChip(detail?.paymentStatus)}</td>
                          <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-muted, #888)' }}>{detail?.interestPaidDate ?? '-'}</td>
                          <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-primary, #fff)' }}>{detail?.actualInterestDate ?? '-'}</td>
                          <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-primary, #fff)' }}>{detail?.daysDifference ?? '-'}</td>
                        </tr>

                        {isExpanded && (
                          <tr key={`${rowKey}-breakup`} style={{ borderTop: '1px solid var(--border, rgba(255,255,255,0.08))', background: 'var(--table-header-bg, rgba(255,255,255,0.02))' }}>
                            <td colSpan={6} style={{ padding: 12 }}>
                              <div style={{ borderRadius: 10, border: '1px solid var(--border, rgba(255,255,255,0.08))', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                  <thead>
                                    <tr style={{ background: 'var(--table-header-bg, rgba(255,255,255,0.04))' }}>
                                      {['S.No', 'Interest Amount', 'Participated Date', 'Days Difference'].map(h => (
                                        <th key={h} style={{ padding: '8px 10px', fontSize: 10, fontWeight: 800, textAlign: 'left', color: 'var(--text-muted, #888)' }}>{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr style={{ borderTop: '1px solid var(--border, rgba(255,255,255,0.08))' }}>
                                      <td style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text-muted, #888)' }}>1</td>
                                      <td style={{ padding: '8px 10px', fontSize: 11, fontWeight: 700, color: BLUE }}>{fmtINR(detail?.interestAmount)}</td>
                                      <td style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text-primary, #fff)' }}>{detail?.firstParticipatedDate ?? '-'}</td>
                                      <td style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text-primary, #fff)' }}>{detail?.daysDifference ?? '-'}</td>
                                    </tr>
                                    {breakUpRows.map((row, bIndex) => (
                                      <tr key={`${rowKey}-b-${bIndex}`} style={{ borderTop: '1px solid var(--border, rgba(255,255,255,0.08))' }}>
                                        <td style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text-muted, #888)' }}>{bIndex + 2}</td>
                                        <td style={{ padding: '8px 10px', fontSize: 11, fontWeight: 700, color: BLUE }}>{fmtINR(row?.interestAmount)}</td>
                                        <td style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text-primary, #fff)' }}>{row?.updationParticipatedDate ?? '-'}</td>
                                        <td style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text-primary, #fff)' }}>{row?.daysDifference ?? '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {rows.length === 0 && (
        <div style={{ borderRadius: 14, border: '1px solid var(--border, rgba(255,255,255,0.08))', background: 'var(--surface-card, #1a1a2e)', padding: '24px 12px', textAlign: 'center', fontSize: 13, color: 'var(--text-muted, #888)' }}>
          No interest schedule available.
        </div>
      )}
    </div>
  );
}
