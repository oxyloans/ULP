import { useState, useEffect, useCallback } from "react";
import { formatINR } from "../../../utils/currency";
import { TableShell, TableHead, Section } from "../AdminStats";
import { getAdminFyData } from "../../../api/afterlogin-admin";

const FY_DATE_RANGES = {
  "FY 26-27": { startDate: "2026-04-01", endDate: "2027-03-31" },
  "FY 25-26": { startDate: "2025-04-01", endDate: "2026-03-31" },
  "FY 24-25": { startDate: "2024-04-01", endDate: "2025-03-31" },
};

const MONTH_NAME_TO_SHORT = {
  january: "Jan",
  february: "Feb",
  march: "Mar",
  april: "Apr",
  may: "May",
  june: "Jun",
  july: "Jul",
  august: "Aug",
  september: "Sep",
  october: "Oct",
  november: "Nov",
  december: "Dec",
};

const MONTH_ORDER = [
  "april", "may", "june", "july", "august", "september",
  "october", "november", "december", "january", "february", "march"
];

function transformApiData(apiData) {
  if (!Array.isArray(apiData)) return [];

  const sorted = [...apiData].sort((a, b) => {
    const aIdx = MONTH_ORDER.indexOf((a.monthName || '').toLowerCase());
    const bIdx = MONTH_ORDER.indexOf((b.monthName || '').toLowerCase());
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return String(a.year).localeCompare(String(b.year));
  });

  return sorted.map((item) => ({
    month: MONTH_NAME_TO_SHORT[(item.monthName || '').toLowerCase()] || (item.monthName || '').slice(0, 3),
    year: parseInt(item.year, 10) || new Date().getFullYear(),
    lendingAmount: Number(item.totalLendingAmount) || 0,
    paid: Number(item.totalPaidInterestAmount) || 0,
  }));
}

export default function InterestPrincipal() {
  const [selectedFy, setSelectedFy] = useState("FY 26-27");
  const [interestRows, setInterestRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    const range = FY_DATE_RANGES[selectedFy];
    if (!range) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getAdminFyData(range.startDate, range.endDate);
      const transformed = transformApiData(data);
      setInterestRows(transformed);
    } catch (err) {
      setError(err.message || "Failed to fetch interest/principal data");
      setInterestRows([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Section
      title="Interest / Principal Data"
      subtitle="Financial year wise monthly lending and paid summary"
      action={
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select
            value={selectedFy}
            onChange={(e) => setSelectedFy(e.target.value)}
            disabled={loading}
            className="px-3 py-2 rounded-xl text-xs font-bold outline-none"
            style={{
              background: "var(--input-bg)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            {Object.keys(FY_DATE_RANGES).map((fy) => (
              <option key={fy} value={fy}>
                {fy}
              </option>
            ))}
          </select>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3 py-2 rounded-xl text-xs font-bold outline-none"
            style={{
              background: "var(--primary)",
              color: "white",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      }
    >
      {error && (
        <div
          className="px-4 py-3 mb-3 rounded-xl text-sm"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#ef4444",
          }}
        >
          {error}
        </div>
      )}
      <TableShell>
        <table className="w-full text-sm">
          <TableHead columns={["S.No", "Month", "Year", "Lending Amount", "Paid"]} />
          <tbody>
            {interestRows.length === 0 && !loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  No data available for this financial year
                </td>
              </tr>
            ) : (
              interestRows.map((row, index) => (
                <tr key={`${row.month}-${row.year}`} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="py-3 px-4 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 font-bold" style={{ color: "var(--text-primary)" }}>
                    {row.month}
                  </td>
                  <td className="py-3 px-4" style={{ color: "var(--text-muted)" }}>
                    {row.year}
                  </td>
                  <td className="py-3 px-4 font-black" style={{ color: "var(--text-primary)" }}>
                    {formatINR(row.lendingAmount)}
                  </td>
                  <td className="py-3 px-4 font-black" style={{ color: "#10b981" }}>
                    {formatINR(row.paid)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }}>
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        )}
      </TableShell>
      <style jsx>{`
        .TableShell {
          position: relative;
        }
      `}</style>
    </Section>
  );
}