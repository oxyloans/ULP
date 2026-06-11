import { formatINR } from "../../../utils/currency";
import { assetValueDistribution, assetRows, TableShell, TableHead, Section } from "../AdminStats";

export default function TotalAssets() {
  const totalAssets = assetRows.reduce((sum, r) => sum + r.assets, 0);

  return (
    <Section title="Total Assets" subtitle={`${totalAssets} assets in lender and company list view`}>
      <div className="grid gap-2 md:grid-cols-2">
        {assetValueDistribution.map((item) => (
          <div key={item.label} className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--text-muted)" }}>{item.label}</p>
            <p className="text-xl font-black mt-2" style={{ color: "var(--text-primary)" }}>{formatINR(item.value)}</p>
          </div>
        ))}
      </div>
      <TableShell>
        <table className="w-full text-sm">
          <TableHead columns={["Name", "lender/company", "Type", "Total Assets", "Market Value", "Govt Value"]} />
          <tbody>
            {assetRows.map((row) => (
              <tr key={`${row.lender}-${row.assetType}`} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="py-3 px-4 font-semibold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>{row.lender}</td>
                <td className="py-3 px-4 whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{row.On}</td>
                <td className="py-3 px-4"><span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: row.assetType === "Govt" ? "rgba(16,185,129,0.12)" : "rgba(99,102,241,0.12)", color: row.assetType === "Govt" ? "#10b981" : "#818cf8", border: row.assetType === "Govt" ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(99,102,241,0.25)" }}>{row.assetType}</span></td>
                <td className="py-3 px-4 font-bold" style={{ color: "var(--text-primary)" }}>{row.assets}</td>
                <td className="py-3 px-4 font-black whitespace-nowrap" style={{ color: "#10b981" }}>{formatINR(row.MarketValue)}</td>
                <td className="py-3 px-4 font-black whitespace-nowrap" style={{ color: "#818cf8" }}>{formatINR(row.GovtValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </Section>
  );
}
