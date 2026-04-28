import { offlineDealsMetrics, offlinePayments } from '../../data/mockData';

const statusChip = { Verified: 'chip-green', Pending: 'chip-orange', Rejected: 'chip-red' };

export default function AdminOffline() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {offlineDealsMetrics.map(m => (
          <div key={m.label} className="rounded-2xl p-5" style={{ background: 'var(--card-bg)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#f59e0b' }}>{m.label}</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{m.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{m.highlight}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: '#f59e0b' }}>Offline Deals</p>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>All Offline Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                {['Ref', 'Name', 'Type', 'Amount', 'Date', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {offlinePayments.map(p => (
                <tr key={p.ref} className="table-row-hover transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-3.5 px-4 font-mono text-xs" style={{ color: '#f59e0b' }}>{p.ref}</td>
                  <td className="py-3.5 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</td>
                  <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{p.type}</td>
                  <td className="py-3.5 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{p.amount}</td>
                  <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{p.date}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusChip[p.status] ?? 'chip-gray'}`}>{p.status}</span>
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
