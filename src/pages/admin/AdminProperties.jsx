import { useState } from 'react';
import { properties, propertySummary } from '../../data/mockData';

const typeColor  = { Plot: '#6366f1', Flat: '#10b981', Acre: '#f59e0b', Villa: '#ec4899' };
const statusChip = { Available: 'chip-green', Sold: 'chip-gray', Reserved: 'chip-orange' };

export default function AdminProperties() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const types    = ['All', 'Plot', 'Flat', 'Acre', 'Villa'];
  const filtered = properties
    .filter(p => filter === 'All' || p.type === filter)
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
    );

  const summaryCards = [
    { label: 'Plots',  ...propertySummary.plots,  color: '#6366f1', type: 'Plot'  },
    { label: 'Flats',  ...propertySummary.flats,  color: '#10b981', type: 'Flat'  },
    { label: 'Acres',  ...propertySummary.acres,  color: '#f59e0b', type: 'Acre'  },
    { label: 'Villas', ...propertySummary.villas, color: '#ec4899', type: 'Villa' },
  ];

  return (
    <div className="grid gap-5">
      {/* Total banner */}
      <div className="rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3"
        style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(16,185,129,0.06))', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--brand)' }}>OxyBricks</p>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>All Properties</h2>
        </div>
        <p className="text-3xl font-bold" style={{ color: 'var(--brand)' }}>{propertySummary.total}</p>
      </div>

      {/* Category cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map(s => (
          <div key={s.label} onClick={() => setFilter(s.type)}
            className="rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02]"
            style={{ background: 'var(--card-bg)', border: `1px solid ${s.color}${filter === s.type ? '60' : '25'}` }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: s.color }}>{s.label}</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.count}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>DOC: {s.docs}</p>
            <p className="text-sm font-semibold mt-0.5" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between gap-3 px-5 py-4 flex-wrap"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Property Listings {filter !== 'All' && `— ${filter}s`}
          </h2>
          <div className="flex gap-2 flex-wrap">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name or location…"
              className="px-3 py-2 rounded-xl text-sm outline-none theme-input w-44"
              style={{ color: 'var(--text-primary)' }} />
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
              {types.map(t => (
                <button key={t} onClick={() => setFilter(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={filter === t ? { background: 'var(--brand)', color: '#fff' } : { color: 'var(--text-muted)' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                {['Property', 'Type', 'Location', 'Area', 'Value', 'Owner', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="table-row-hover transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-3.5 px-4">
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                    <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{p.id}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: `${typeColor[p.type]}15`, color: typeColor[p.type], border: `1px solid ${typeColor[p.type]}30` }}>
                      {p.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{p.location}</td>
                  <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{p.area}</td>
                  <td className="py-3.5 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{p.value}</td>
                  <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{p.ownerName ?? '—'}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusChip[p.status]}`}>{p.status}</span>
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
