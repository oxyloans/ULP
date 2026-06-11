import { useNavigate } from "react-router-dom";
import { formatINR } from "../../../utils/currency";
import { topLenders, Section, TableShell, TableHead, icons } from "../AdminStats";

export default function TopLenders() {
  const navigate = useNavigate();

  return (
    <Section
      title="Top 10 Lenders"
      subtitle="Highest value lenders by participation"
    //   action={
    //     <button
    //       onClick={() => navigate("/admin/total-users")}
    //       className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
    //       style={{
    //         background: "rgba(168,85,247,0.12)",
    //         color: "#c084fc",
    //         border: "1px solid rgba(168,85,247,0.28)",
    //       }}
    //     >
    //       <icons.Eye /> View
    //     </button>
    //   }
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
            {topLenders.map((lender, index) => (
              <tr
                key={lender.name}
                style={{ borderBottom: index === topLenders.length - 1 ? "none" : "1px solid var(--border)" }}
              >
                <td className="px-4 py-3">
                  <span className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-xs font-black" style={{ background: "rgba(168,85,247,0.12)", color: "#c084fc" }}>
                    {index + 1}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>{lender.name}</td>
                <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--text-muted)" }}>{lender.participations}</td>
                <td className="px-4 py-3 text-sm font-black text-right" style={{ color: "#10b981" }}>{formatINR(lender.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </Section>
  );
}
