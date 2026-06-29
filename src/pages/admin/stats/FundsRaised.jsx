import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatINR } from "../../../utils/currency";
import { getAllDealAndWalletInfo, getAdminDeals, getAdminOxyLoansDealsStats } from "../../../api/afterlogin-admin";
import { StatCard, Section, TableShell, TableHead, icons } from "../AdminStats";

const fmtAmount = (val) => {
  return val ? formatINR(val) : "₹0";
};

const fmtCount = (val) => {
  return val?.toLocaleString("en-IN") ?? "0";
};

export default function FundsRaised() {
  const [data, setData] = useState(null);
  const [dealStats, setDealStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [
          response,
          oxyStats,
          runningOffline,
          closedOffline
        ] = await Promise.all([
          getAllDealAndWalletInfo(),
          getAdminOxyLoansDealsStats().catch(() => null),
          getAdminDeals('NORMAL').catch(() => ({})),
          getAdminDeals('closed').catch(() => ({}))
        ]);
        setData(response);

        // Parse OxyLoans Deals Stats from API
        const olRunning = oxyStats?.runningDeals ?? 0;
        const olRunningAmt = oxyStats?.runningDealsAmount ?? 0;
        const olClosed = oxyStats?.closedDeals ?? 0;
        const olClosedAmt = oxyStats?.closedDealsAmount ?? 0;
        const olTotal = oxyStats?.totalDeals ?? 0;
        const olTotalAmt = oxyStats?.totalDealsAmount ?? 0;
        
        const parseAmount = (val) => {
          if (typeof val === 'number') return val;
          if (!val) return 0;
          return Number(String(val).replace(/[^0-9.-]/g, '')) || 0;
        };

        // Parse Offline Deals
        const getDealsList = (res) => {
          return res?.listOfLendersInformation ?? (Array.isArray(res) ? res : []);
        };
        const offRunningList = getDealsList(runningOffline);
        const offClosedList = getDealsList(closedOffline);

        const offRunningAmt = offRunningList.reduce((sum, d) => sum + parseAmount(d.dealValue ?? d.dealAmount), 0);
        const offClosedAmt = offClosedList.reduce((sum, d) => sum + parseAmount(d.dealValue ?? d.dealAmount), 0);

        setDealStats({
          oxyloans: {
            runningDeals: olRunning,
            runningAmount: olRunningAmt,
            closedDeals: olClosed,
            closedAmount: olClosedAmt,
            totalDeals: olTotal,
            totalAmount: olTotalAmt
          },
          offline: {
            runningDeals: offRunningList.length,
            runningAmount: offRunningAmt,
            closedDeals: offClosedList.length,
            closedAmount: offClosedAmt,
            totalDeals: offRunningList.length + offClosedList.length,
            totalAmount: offRunningAmt + offClosedAmt
          }
        });
      } catch (err) {
        console.error("Failed to fetch deal and wallet info:", err);
        setError("Failed to load funds data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-7">
        <div className="rounded-2xl p-6" style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-sm" style={{ color: "var(--text-muted)" }}>Loading funds data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-7">
        <div className="rounded-2xl p-6" style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}>
          <p className="text-center text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate total fund raised: migratedAmount + systemAmount
  const totalFundRaised = (data?.migratedAmount || 0) + (data?.systemAmount || 0);

  // Fund stats cards
  const fundStats = [
    {
      label: "No. of Participations",
      value: data?.noOfParticipation?.toLocaleString("en-IN") ?? "—",
      sub: "Across active and closed deals",
      color: "#a855f7",
      Icon: icons.Chart,
    },
    {
      label: "No. of Active Deals",
      value: data?.noOfActiveDeals?.toLocaleString("en-IN") ?? "—",
      sub: "Currently open for funding",
      color: "#10b981",
      Icon: icons.Deal,
    },
    {
      label: "No. of Registered Users",
      value: data?.noOfRegisteredUsers?.toLocaleString("en-IN") ?? "—",
      sub: "Registered lenders and borrowers",
      color: "#6366f1",
      Icon: icons.Users,
    },
    {
      label: "Total Participated Amount",
      value: data?.totalParticipatedAmount ? formatINR(data.totalParticipatedAmount) : "—",
      sub: "Total amount participated in deals",
      color: "#f59e0b",
      Icon: icons.Rupee,
    },
  ];

  // Migrated vs System stats
  const migratedStats = [
    { label: "Migrated Amount", value: data?.migratedAmount || 0 },
    { label: "System Amount", value: data?.systemAmount || 0 },
    { label: "Total Amount", value: totalFundRaised },
  ];

  // Wallet stats
  const walletStats = [
    { label: "Total Wallet Loaded", value: data?.totalWalletAmount || 0 },
    { label: "Total Participations", value: data?.noOfParticipation || 0 },
    { label: "Unused Wallet Amount", value: data?.systemAmount - data?.totalWalletAmount || 0 },
  ];

  return (
    <div className="grid gap-7">
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,rgba(168,85,247,0.12),rgba(99,102,241,0.06),rgba(16,185,129,0.04))",
          border: "1px solid rgba(168,85,247,0.2)",
          boxShadow: "0 4px 32px rgba(168,85,247,0.1)",
        }}
      >
        <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: "#a855f7" }}>
              Funds Raised
            </p>
            <h1 className="text-2xl font-black mt-1" style={{ color: "var(--text-primary)" }}>
              Total Fund Raised
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {data?.noOfParticipation?.toLocaleString("en-IN") ?? "—"} participations across{" "}
              {data?.noOfActiveDeals?.toLocaleString("en-IN") ?? "—"} active deals
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black" style={{ color: "#10b981" }}>
              {formatINR(totalFundRaised)}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Total fund raised (Migrated + System)
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {fundStats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <Section title="Migrated vs System" subtitle="Migrated amount, system amount, and total amount summary">
        <div className="grid gap-4 md:grid-cols-3">
          {migratedStats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl p-5"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--text-muted)" }}>
                {item.label}
              </p>
              <p className="text-xl font-black mt-2" style={{ color: "var(--text-primary)" }}>
                {formatINR(item.value)}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Wallet" subtitle="Wallet loaded, participation count, and unused wallet amount">
        <div className="grid gap-4 md:grid-cols-3">
          {walletStats.map((item, index) => (
            <div
              key={item.label}
              className="rounded-2xl p-5"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.25)",
                    color: "#10b981",
                  }}
                >
                  <icons.Wallet />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--text-muted)" }}>
                    {item.label}
                  </p>
                  <p className="text-xl font-black mt-1" style={{ color: "var(--text-primary)" }}>
                    {index === 1
                      ? item.value.toLocaleString("en-IN")
                      : formatINR(item.value)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Platform Deal Summary" subtitle="Breakdown of running, closed, and total deals for OxyLoans and Offline platforms">
        {dealStats ? (
          <TableShell>
            <table className="w-full text-sm">
              <TableHead
                columns={[
                  "Platform",
                  "Running Deals",
                  "Running Amount",
                  "Closed Deals",
                  "Closed Amount",
                  "Total Deals",
                  "Total Amount"
                ]}
              />
              <tbody>
                {[
                  {
                    platform: "OxyLoans",
                    runningDeals: dealStats.oxyloans.runningDeals,
                    runningAmount: dealStats.oxyloans.runningAmount,
                    closedDeals: dealStats.oxyloans.closedDeals,
                    closedAmount: dealStats.oxyloans.closedAmount,
                    totalDeals: dealStats.oxyloans.totalDeals,
                    totalAmount: dealStats.oxyloans.totalAmount
                  },
                  {
                    platform: "Offline",
                    runningDeals: dealStats.offline.runningDeals,
                    runningAmount: dealStats.offline.runningAmount,
                    closedDeals: dealStats.offline.closedDeals,
                    closedAmount: dealStats.offline.closedAmount,
                    totalDeals: dealStats.offline.totalDeals,
                    totalAmount: dealStats.offline.totalAmount
                  }
                ].map((row) => (
                  <tr
                    key={row.platform}
                    style={{ borderBottom: "1px solid var(--border)" }}
                    className="transition-colors hover:bg-neutral-500/5"
                  >
                    <td className="py-3.5 px-4 font-bold" style={{ color: "var(--text-primary)" }}>
                      {row.platform}
                    </td>
                    <td className="py-3.5 px-4 font-semibold font-mono">
                      {row.platform === "OxyLoans" ? (
                        <Link
                          to="/admin/stats/oxyloans-running-deals"
                          className="hover:underline cursor-pointer text-purple-500 hover:text-purple-400 font-bold flex items-center gap-1.5"
                        >
                          {fmtCount(row.runningDeals)}
                          <svg className="w-3.5 h-3.5 inline-block opacity-70" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </Link>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>{fmtCount(row.runningDeals)}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-black font-mono text-emerald-500">
                      {row.platform === "OxyLoans" ? (
                        <Link
                          to="/admin/stats/oxyloans-running-deals"
                          className="hover:underline cursor-pointer text-emerald-500 hover:text-emerald-400 flex items-center gap-1.5 font-black"
                        >
                          {fmtAmount(row.runningAmount)}
                          <svg className="w-3.5 h-3.5 inline-block opacity-70" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </Link>
                      ) : (
                        fmtAmount(row.runningAmount)
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold font-mono" style={{ color: "var(--text-muted)" }}>
                      {fmtCount(row.closedDeals)}
                    </td>
                    <td className="py-3.5 px-4 font-black font-mono text-purple-500">
                      {fmtAmount(row.closedAmount)}
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono text-indigo-500">
                      {fmtCount(row.totalDeals)}
                    </td>
                    <td className="py-3.5 px-4 font-black font-mono text-amber-500">
                      {fmtAmount(row.totalAmount)}
                    </td>
                  </tr>
                ))}
                <tr
                  style={{
                    background: "rgba(168,85,247,0.08)",
                    borderTop: "2px solid rgba(168,85,247,0.2)"
                  }}
                >
                  <td className="py-3.5 px-4 font-black" style={{ color: "#a855f7" }}>
                    Total
                  </td>
                  <td className="py-3.5 px-4 font-black font-mono" style={{ color: "var(--text-primary)" }}>
                    {fmtCount(dealStats.oxyloans.runningDeals + dealStats.offline.runningDeals)}
                  </td>
                  <td className="py-3.5 px-4 font-black font-mono text-emerald-500">
                    {fmtAmount(dealStats.oxyloans.runningAmount + dealStats.offline.runningAmount)}
                  </td>
                  <td className="py-3.5 px-4 font-black font-mono" style={{ color: "var(--text-primary)" }}>
                    {fmtCount(dealStats.oxyloans.closedDeals + dealStats.offline.closedDeals)}
                  </td>
                  <td className="py-3.5 px-4 font-black font-mono text-purple-500">
                    {fmtAmount(dealStats.oxyloans.closedAmount + dealStats.offline.closedAmount)}
                  </td>
                  <td className="py-3.5 px-4 font-black font-mono text-indigo-500">
                    {fmtCount(dealStats.oxyloans.totalDeals + dealStats.offline.totalDeals)}
                  </td>
                  <td className="py-3.5 px-4 font-black font-mono text-amber-500">
                    {fmtAmount(dealStats.oxyloans.totalAmount + dealStats.offline.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </TableShell>
        ) : (
          <div className="rounded-2xl p-6 text-center text-xs font-semibold" style={{ background: "var(--card-bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
            No deal stats available
          </div>
        )}
      </Section>
    </div>
  );
}