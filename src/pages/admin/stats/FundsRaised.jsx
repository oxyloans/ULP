import { formatINR } from "../../../utils/currency";
import { fundStats, StatCard, Section, migratedStats, walletStats, icons } from "../AdminStats";

export default function FundsRaised() {
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
              Demo Stats
            </p>
            <h1 className="text-2xl font-black mt-1" style={{ color: "var(--text-primary)" }}>
              Total Fund Raised
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              4.82 Cr raised across participations, active deals, assets, interest, and wallet activity.
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black" style={{ color: "#10b981" }}>
              {formatINR(48200000)}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Demo total fund raised
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {fundStats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <Section title="Migrated V/s System" subtitle="Migrated amount, system amount, and total amount summary">
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
                    {index === 1 ? item.value.toLocaleString("en-IN") : formatINR(item.value)}
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
