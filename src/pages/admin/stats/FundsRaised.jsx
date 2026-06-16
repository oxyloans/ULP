import { useEffect, useState } from "react";
import { formatINR } from "../../../utils/currency";
import { getAllDealAndWalletInfo } from "../../../api/afterlogin-admin";
import { StatCard, Section, icons } from "../AdminStats";

export default function FundsRaised() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await getAllDealAndWalletInfo();
        setData(response);
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
    { label: "Unused Wallet Amount", value: data?.unUsedWalletAmount || 0 },
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
    </div>
  );
}