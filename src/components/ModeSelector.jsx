import { useState } from 'react';
import { useMode } from '../context/ModeContext';

const modes = [
  { value: 'A', label: 'Offline Deals', icon: '📦', alwaysVisible: true  },
  { value: 'B', label: 'OxyLoans',      icon: '🏦', alwaysVisible: false },
  { value: 'C', label: 'Both',          icon: '⚡', alwaysVisible: false },
];

const ExpandIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"
    style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export default function ModeSelector() {
  const { mode, setMode } = useMode();
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? modes : modes.filter(m => m.alwaysVisible);

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
      {visible.map((m) => (
        <button
          key={m.value}
          onClick={() => setMode(m.value)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={mode === m.value
            ? { background: 'linear-gradient(135deg,var(--brand),#4338ca)', color: '#fff', boxShadow: '0 0 12px var(--brand-glow)' }
            : { color: 'var(--text-muted)' }}
        >
          <span>{m.icon}</span>
          <span className="hidden md:inline">{m.label}</span>
          <span className="md:hidden font-bold">{m.value}</span>
        </button>
      ))}
      {/* Toggle to show/hide OxyLoans + Both */}
      <button
        onClick={() => setExpanded(e => !e)}
        title={expanded ? 'Hide options' : 'More options'}
        className="flex items-center px-1.5 py-1.5 rounded-lg transition-all"
        style={{ color: expanded ? 'var(--brand)' : 'var(--text-muted)' }}>
        <ExpandIcon open={expanded} />
      </button>
    </div>
  );
}
