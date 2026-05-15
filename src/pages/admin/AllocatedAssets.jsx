import { useState } from 'react';

const MOCK_ALLOCATED = [
  { id: 'AST-001', borrowerName: 'Ravi Kumar',   projectName: 'Green Valley',   plotNumber: 'P-12', allocatedTo: 'Investor A', allocatedDate: '2024-05-01', sft: '1200', status: 'Active'   },
  { id: 'AST-003', borrowerName: 'Suresh Reddy', projectName: 'Blue Lagoon',    plotNumber: 'P-33', allocatedTo: 'Investor B', allocatedDate: '2024-06-15', sft: '1800', status: 'Active'   },
  { id: 'AST-004', borrowerName: 'Anita Patel',  projectName: 'Sun City',       plotNumber: 'P-21', allocatedTo: 'Investor C', allocatedDate: '2024-07-20', sft: '1500', status: 'Released' },
];

const statusStyle = {
  Active:   { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', border: 'rgba(16,185,129,0.3)'  },
  Released: { bg: 'rgba(239,68,68,0.10)',   color: '#f87171', border: 'rgba(239,68,68,0.25)'  },
};

export default function AllocatedAssets() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_ALLOCATED.filter(a =>
    a.borrowerName.toLowerCase().includes(search.toLowerCase()) ||
    a.projectName.toLowerCase().includes(search.toLowerCase()) ||
    a.allocatedTo.toLowerCase().includes(search.toLowerCase())
  );

  const active   = MOCK_ALLOCATED.filter(a => a.status === 'Active').length;
  const released = MOCK_ALLOCATED.filter(a => a.status === 'Released').length;

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3"
        style={{ background: 'linear-gradient(135deg,rgba(168,85,247,0.12),rgba(168,85,247,0.04))', border: '1px solid rgba(168,85,247,0.25)' }}>
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#c084fc' }}>Assets</p>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Allocated Assets</h2>
        </div>
        <p className="text-3xl font-bold" style={{ color: '#c084fc' }}>{MOCK_ALLOCATED.length}</p>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Allocated', value: MOCK_ALLOCATED.length, color: '#c084fc' },
          { label: 'Active',          value: active,                 color: '#10b981' },
          { label: 'Released',        value: released,               color: '#f87171' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5"
            style={{ background: 'var(--card-bg)', border: `1px solid ${s.color}25` }}>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: s.color }}>{s.label}</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between gap-3 px-5 py-4 flex-wrap"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Allocation Records</h3>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search borrower, project, investor…"
            className="px-3 py-2 rounded-xl text-sm outline-none theme-input w-56"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                {['Asset ID', 'Borrower', 'Project', 'Plot', 'Allocated To', 'Allocated Date', 'Sft', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-medium whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No allocated assets found.</td></tr>
              ) : filtered.map(a => {
                const s = statusStyle[a.status];
                return (
                  <tr key={a.id} className="table-row-hover transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-3.5 px-4 font-mono text-xs" style={{ color: '#c084fc' }}>{a.id}</td>
                    <td className="py-3.5 px-4 font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{a.borrowerName}</td>
                    <td className="py-3.5 px-4 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{a.projectName}</td>
                    <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{a.plotNumber}</td>
                    <td className="py-3.5 px-4 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{a.allocatedTo}</td>
                    <td className="py-3.5 px-4 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{a.allocatedDate}</td>
                    <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{a.sft} sft</td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
