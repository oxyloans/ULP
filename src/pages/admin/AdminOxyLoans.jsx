import { oxyloansMetrics, oxyloansDeals } from '../../data/mockData';

const statusChip = { Active: 'chip-green', Pending: 'chip-orange', Closed: 'chip-gray' };

export default function AdminOxyLoans() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {oxyloansMetrics.map(m => (
          <div key={m.label} className="rounded-2xl p-5" style={{ background: 'var(--card-bg)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#6366f1' }}>{m.label}</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{m.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{m.highlight}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: '#6366f1' }}>OxyLoans</p>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>All Loan Deals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                {['Deal ID', 'Borrower', 'Lender', 'Amount', 'Rate', 'Due Date', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {oxyloansDeals.map(d => (
                <tr key={d.id} className="table-row-hover transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-3.5 px-4 font-mono text-xs" style={{ color: 'var(--brand)' }}>{d.id}</td>
                  <td className="py-3.5 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>{d.borrower}</td>
                  <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{d.lender}</td>
                  <td className="py-3.5 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{d.amount}</td>
                  <td className="py-3.5 px-4 text-xs" style={{ color: '#10b981' }}>{d.rate}</td>
                  <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{d.due}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusChip[d.status] ?? 'chip-gray'}`}>{d.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
