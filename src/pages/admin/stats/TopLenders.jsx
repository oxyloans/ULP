import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatINR } from "../../../utils/currency";
import { getTopParticipationLenders } from "../../../api/afterlogin-admin";
import { Section, TableShell, icons } from "../AdminStats";

export default function TopLenders() {
  const navigate = useNavigate();
  const [lenders, setLenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await getTopParticipationLenders();
        setLenders(response || []);
      } catch (err) {
        console.error("Failed to fetch top participation lenders:", err);
        setError("Failed to load top lenders data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <Section title="Top Lenders" subtitle="Highest value lenders by participation">
        <TableShell>
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(168,85,247,0.08)", borderBottom: "1px solid var(--border)" }}>
                <th className="px-4 py-3 text-left text-xs font-bold">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-bold">Lender Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold">Participations</th>
                <th className="px-4 py-3 text-right text-xs font-bold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center" style={{ color: "var(--text-muted)" }}>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-6 h-6 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading top lenders...</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </TableShell>
      </Section>
    );
  }

  if (error) {
    return (
      <Section title="Top Lenders" subtitle="Highest value lenders by participation">
        <TableShell>
          <table className="w-full">
            <tbody>
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-red-500">
                  {error}
                </td>
              </tr>
            </tbody>
          </table>
        </TableShell>
      </Section>
    );
  }

  return (
    <Section
      title="Top Participation Lenders"
      subtitle="Highest value lenders by total participation amount"
      // action={
      //   <button
      //     onClick={() => navigate("/admin/total-users")}
      //     className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
      //     style={{
      //       background: "rgba(168,85,247,0.12)",
      //       color: "#c084fc",
      //       border: "1px solid rgba(168,85,247,0.28)",
      //     }}
      //   >
      //     <icons.Eye /> View
      //   </button>
      // }
    >
      <TableShell>
        <table className="w-full">
          <thead>
            <tr style={{ background: "rgba(168,85,247,0.08)", borderBottom: "1px solid var(--border)" }}>
              <th className="px-4 py-3 text-left text-xs font-bold">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-bold">Lender Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold">Participations</th>
              <th className="px-4 py-3 text-right text-xs font-bold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lenders.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center" style={{ color: "var(--text-muted)" }}>
                  No lenders found
                </td>
              </tr>
            ) : (
              lenders.map((lender, index) => (
                <tr
                  key={lender.userId || lender.name}
                  style={{ borderBottom: index === lenders.length - 1 ? "none" : "1px solid var(--border)" }}
                >
                  <td className="px-4 py-3">
                    <span className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-xs font-black" style={{ background: "rgba(168,85,247,0.12)", color: "#c084fc" }}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {lender.name}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
                    {lender.totalParticipationCount}
                  </td>
                  <td className="px-4 py-3 text-sm font-black text-right" style={{ color: "#10b981" }}>
                    {formatINR(lender.participationAmount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableShell>
    </Section>
  );
}