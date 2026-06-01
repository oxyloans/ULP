import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatINR } from "../../utils/currency";

const icons = {
  Rupee: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <path d="M6 3h12M6 8h12M6 13l8 8M6 8a4 4 0 0 0 0 8h2" />
    </svg>
  ),
  Users: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Deal: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M12 12v4M10 14h4" />
    </svg>
  ),
  Chart: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  Wallet: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
      <circle cx="18" cy="12" r="2" />
    </svg>
  ),
  Eye: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

const fundStats = [
  {
    label: "No. of Participations",
    value: "1,284",
    sub: "Across active and closed deals",
    color: "#a855f7",
    Icon: icons.Chart,
  },
  {
    label: "No. of Active Deals",
    value: "42",
    sub: "Currently open for funding",
    color: "#10b981",
    Icon: icons.Deal,
  },
  {
    label: "No. of Users",
    value: "8,940",
    sub: "Registered lenders and borrowers",
    color: "#6366f1",
    Icon: icons.Users,
  },
  {
    label: "Avg Participations",
    value: "14.8",
    sub: "Per active lender",
    color: "#f59e0b",
    Icon: icons.Chart,
  },
];

const migratedStats = [
  { label: "Migrated Amount", value: 18600000 },
  { label: "System Amount", value: 12400000 },
  { label: "Total Amount", value: 31000000 },
];

const topLenders = [
  { name: "Ravi Kumar", participations: 86, amount: 4200000 },
  { name: "Priya Sharma", participations: 74, amount: 3860000 },
  { name: "Suresh Reddy", participations: 69, amount: 3425000 },
  { name: "Anita Menon", participations: 63, amount: 3100000 },
  { name: "Vikram Singh", participations: 58, amount: 2840000 },
  { name: "Neha Gupta", participations: 55, amount: 2615000 },
  { name: "Rahul Jain", participations: 51, amount: 2460000 },
  { name: "Kiran Rao", participations: 47, amount: 2180000 },
  { name: "Meera Nair", participations: 43, amount: 1965000 },
  { name: "Arjun Patel", participations: 39, amount: 1825000 },
];

const assetValueDistribution = [
  { label: "On Lenders", value: 42 },
  { label: "On Companies", value: 58 },
];

const assetRows = [
  {
    lender: "Ravi Kumar",
    On: "On Lenders",
    assetType: "Plot",
    assets: 7,
    MarketValue: 7200000,
    GovtValue: 7200000,
  },
  {
    lender: "Priya Sharma",
    On: "On Companies",
    assetType: "Flat",
    assets: 5,
    MarketValue: 6100000,
    GovtValue: 6100000,
  },
  {
    lender: "Suresh Reddy",
    On: "On Companies",
    assetType: "Acer",
    assets: 6,
    MarketValue: 5480000,
    GovtValue: 5480000,
  },
  {
    lender: "Anita Menon",
    On: "On Companies",
    assetType: "Plot",
    assets: 4,
    MarketValue: 4200000,
    GovtValue: 4200000,
  },
  {
    lender: "Vikram Singh",
    On: "On Lenders",
    assetType: "Acer",
    assets: 3,
    MarketValue: 3150000,
    GovtValue: 3150000,
  },
];

const interestRowsByFy = {
  "FY 25-26": [
    { month: "Apr", year: 2025, lendingAmount: 4600000, paid: 318000 },
    { month: "May", year: 2025, lendingAmount: 5200000, paid: 352000 },
    { month: "Jun", year: 2025, lendingAmount: 5750000, paid: 386000 },
    { month: "Jul", year: 2025, lendingAmount: 6120000, paid: 421000 },
    { month: "Aug", year: 2025, lendingAmount: 6400000, paid: 448000 },
    { month: "Sep", year: 2025, lendingAmount: 6950000, paid: 476000 },
  ],
  "FY 24-25": [
    { month: "Oct", year: 2024, lendingAmount: 3700000, paid: 244000 },
    { month: "Nov", year: 2024, lendingAmount: 3950000, paid: 259000 },
    { month: "Dec", year: 2024, lendingAmount: 4250000, paid: 281000 },
    { month: "Jan", year: 2025, lendingAmount: 4380000, paid: 296000 },
    { month: "Feb", year: 2025, lendingAmount: 4520000, paid: 304000 },
    { month: "Mar", year: 2025, lendingAmount: 4710000, paid: 326000 },
  ],
};

const walletStats = [
  { label: "Total Wallet Loaded", value: 18450000 },
  { label: "Total Participations", value: 1284 },
  { label: "Unused Wallet Amount", value: 2360000 },
];

function StatCard({ label, value, sub, color, Icon }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: `linear-gradient(135deg,${color}10,rgba(255,255,255,0.01))`,
        border: `1px solid ${color}22`,
        boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="text-2xl font-black"
            style={{ color: "var(--text-primary)" }}
          >
            {value}
          </p>
          <p
            className="text-xs uppercase tracking-widest font-bold mt-1"
            style={{ color }}
          >
            {label}
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `${color}14`,
            border: `1px solid ${color}28`,
            color,
          }}
        >
          <Icon />
        </div>
      </div>
      {sub && (
        <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function Section({ title, subtitle, action, children }) {
  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2
            className="text-base font-black"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function TableShell({ children }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--table-bg)",
        border: "1px solid rgba(168,85,247,0.18)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function TableHead({ columns }) {
  return (
    <thead>
      <tr
        style={{
          background: "rgba(168,85,247,0.05)",
          borderBottom: "1px solid rgba(168,85,247,0.15)",
        }}
      >
        {columns.map((column) => (
          <th
            key={column}
            className="text-left py-3 px-4 text-xs uppercase tracking-widest font-semibold whitespace-nowrap"
            style={{ color: "var(--text-muted)" }}
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export default function AdminStats() {
  const navigate = useNavigate();
  const [selectedFy, setSelectedFy] = useState("FY 25-26");
  const interestRows = interestRowsByFy[selectedFy] ?? [];
  const totalAssets = useMemo(
    () => assetRows.reduce((sum, row) => sum + row.assets, 0),
    [],
  );

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
            <p
              className="text-xs uppercase tracking-widest font-bold"
              style={{ color: "#a855f7" }}
            >
              Demo Stats
            </p>
            <h1
              className="text-2xl font-black mt-1"
              style={{ color: "var(--text-primary)" }}
            >
              Total Fund Raised
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              4.82 Cr raised across participations, active deals, assets,
              interest, and wallet activity.
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

      <Section
        title="Migrated Data"
        subtitle="Migrated amount, system amount, and total amount summary"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {migratedStats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl p-5"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                className="text-xs uppercase tracking-widest font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                {item.label}
              </p>
              <p
                className="text-xl font-black mt-2"
                style={{ color: "var(--text-primary)" }}
              >
                {formatINR(item.value)}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <div className="gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        {/* <Section
          title="Top 10 Lenders"
          subtitle="Highest value lenders by participation"
          action={
            <button onClick={() => navigate('/admin/total-users')} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold" style={{ background: 'rgba(168,85,247,0.12)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.28)' }}>
              <icons.Eye /> View
            </button>
          }>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid rgba(168,85,247,0.18)' }}>
            {topLenders.map((lender, index) => (
              <div key={lender.name} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: index === topLenders.length - 1 ? '0' : '1px solid var(--border)' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: 'rgba(168,85,247,0.12)', color: '#c084fc' }}>{index + 1}</span>
                <div className="flex min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{lender.name}</p>
                </div>
                <div className="flex min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>{lender.participations} participations</p>
                </div>
                <p className="text-sm font-black whitespace-nowrap" style={{ color: '#10b981' }}>{formatINR(lender.amount)}</p>
              </div>
            ))}
          </div>
        </Section> */}
        <Section
          title="Top 10 Lenders"
          subtitle="Highest value lenders by participation"
          action={
            <button
              onClick={() => navigate("/admin/total-users")}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
              style={{
                background: "rgba(168,85,247,0.12)",
                color: "#c084fc",
                border: "1px solid rgba(168,85,247,0.28)",
              }}
            >
              <icons.Eye /> View
            </button>
          }
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--card-bg)",
              border: "1px solid rgba(168,85,247,0.18)",
            }}
          >
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    background: "rgba(168,85,247,0.08)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <th className="px-4 py-3 text-left text-xs font-bold">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold">
                    Lender Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold">
                    Participations
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {topLenders.map((lender, index) => (
                  <tr
                    key={lender.name}
                    style={{
                      borderBottom:
                        index === topLenders.length - 1
                          ? "none"
                          : "1px solid var(--border)",
                    }}
                  >
                    <td className="px-4 py-3">
                      <span
                        className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-xs font-black"
                        style={{
                          background: "rgba(168,85,247,0.12)",
                          color: "#c084fc",
                        }}
                      >
                        {index + 1}
                      </span>
                    </td>

                    <td
                      className="px-4 py-3 text-sm font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {lender.name}
                    </td>

                    <td
                      className="px-4 py-3 text-sm font-semibold"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {lender.participations}
                    </td>

                    <td
                      className="px-4 py-3 text-sm font-black text-right"
                      style={{ color: "#10b981" }}
                    >
                      {formatINR(lender.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      <Section
        title="Total Assets"
        subtitle={`${totalAssets} assets in lender and company list view`}
      >
        <div className="grid gap-2 md:grid-cols-2">
          {assetValueDistribution.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl p-5"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                className="text-xs uppercase tracking-widest font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                {item.label}
              </p>
              <p
                className="text-xl font-black mt-2"
                style={{ color: "var(--text-primary)" }}
              >
                {formatINR(item.value)}
              </p>
            </div>
          ))}
        </div>
        <TableShell>
          <table className="w-full text-sm">
            <TableHead
              columns={[
                "Name",
                "lender/company",
                "Type",
                "Total Assets",
                "Market Value",
                "Govt Value",
              ]}
            />
            <tbody>
              {assetRows.map((row) => (
                <tr
                  key={`${row.lender}-${row.company}`}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td
                    className="py-3 px-4 font-semibold whitespace-nowrap"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {row.lender}
                  </td>
                  <td
                    className="py-3 px-4 whitespace-nowrap"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {row.On}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{
                        background:
                          row.assetType === "Govt"
                            ? "rgba(16,185,129,0.12)"
                            : "rgba(99,102,241,0.12)",
                        color: row.assetType === "Govt" ? "#10b981" : "#818cf8",
                        border:
                          row.assetType === "Govt"
                            ? "1px solid rgba(16,185,129,0.25)"
                            : "1px solid rgba(99,102,241,0.25)",
                      }}
                    >
                      {row.assetType}
                    </span>
                  </td>
                  <td
                    className="py-3 px-4 font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {row.assets}
                  </td>
                  <td
                    className="py-3 px-4 font-black whitespace-nowrap"
                    style={{ color: "#10b981" }}
                  >
                    {formatINR(row.MarketValue)}
                  </td>
                  <td
                    className="py-3 px-4 font-black whitespace-nowrap"
                    style={{ color: "#818cf8" }}
                  >
                    {formatINR(row.GovtValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      </Section>

      <Section
        title="Interest / Principal Data"
        subtitle="Financial year wise monthly lending and paid summary"
        action={
          <select
            value={selectedFy}
            onChange={(event) => setSelectedFy(event.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-bold outline-none"
            style={{
              background: "var(--input-bg)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            {Object.keys(interestRowsByFy).map((fy) => (
              <option key={fy} value={fy}>
                {fy}
              </option>
            ))}
          </select>
        }
      >
        <TableShell>
          <table className="w-full text-sm">
            <TableHead
              columns={["S.No", "Month", "Year", "Lending Amount", "Paid"]}
            />
            <tbody>
              {interestRows.map((row, index) => (
                <tr
                  key={`${row.month}-${row.year}`}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td
                    className="py-3 px-4 font-mono text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {index + 1}
                  </td>
                  <td
                    className="py-3 px-4 font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {row.month}
                  </td>
                  <td
                    className="py-3 px-4"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {row.year}
                  </td>
                  <td
                    className="py-3 px-4 font-black"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {formatINR(row.lendingAmount)}
                  </td>
                  <td
                    className="py-3 px-4 font-black"
                    style={{ color: "#10b981" }}
                  >
                    {formatINR(row.paid)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      </Section>

      <Section
        title="Wallet"
        subtitle="Wallet loaded, participation count, and unused wallet amount"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {walletStats.map((item, index) => (
            <div
              key={item.label}
              className="rounded-2xl p-5"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
              }}
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
                  <p
                    className="text-xs uppercase tracking-widest font-semibold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="text-xl font-black mt-1"
                    style={{ color: "var(--text-primary)" }}
                  >
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
