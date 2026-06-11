import { useState } from "react";
import { formatINR } from "../../../utils/currency";
import { interestRowsByFy, TableShell, TableHead, Section } from "../AdminStats";

export default function InterestPrincipal() {
  const [selectedFy, setSelectedFy] = useState("FY 25-26");
  const interestRows = interestRowsByFy[selectedFy] ?? [];

  return (
    <Section title="Interest / Principal Data" subtitle="Financial year wise monthly lending and paid summary" action={
      <select value={selectedFy} onChange={(e) => setSelectedFy(e.target.value)} className="px-3 py-2 rounded-xl text-xs font-bold outline-none" style={{ background: "var(--input-bg)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
        {Object.keys(interestRowsByFy).map((fy) => (
          <option key={fy} value={fy}>{fy}</option>
        ))}
      </select>
    }>
      <TableShell>
        <table className="w-full text-sm">
          <TableHead columns={["S.No", "Month", "Year", "Lending Amount", "Paid"]} />
          <tbody>
            {interestRows.map((row, index) => (
              <tr key={`${row.month}-${row.year}`} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="py-3 px-4 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{index + 1}</td>
                <td className="py-3 px-4 font-bold" style={{ color: "var(--text-primary)" }}>{row.month}</td>
                <td className="py-3 px-4" style={{ color: "var(--text-muted)" }}>{row.year}</td>
                <td className="py-3 px-4 font-black" style={{ color: "var(--text-primary)" }}>{formatINR(row.lendingAmount)}</td>
                <td className="py-3 px-4 font-black" style={{ color: "#10b981" }}>{formatINR(row.paid)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </Section>
  );
}
