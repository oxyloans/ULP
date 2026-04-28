/**
 * ProfileWarningBanner
 * Shows a dismissible banner when the user has incomplete profile / KYC items.
 * Used on the Dashboard. Disappears once all items are complete.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';

const WarnIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const CloseIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const CheckIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>;
const ArrowIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

const STEPS = [
  { key: 'name',    label: 'Personal Info',  path: '/profile',          desc: 'Add your name & address'    },
  { key: 'pan',     label: 'PAN Card',       path: '/profile?tab=pan',  desc: 'Verify your PAN'            },
  { key: 'bank',    label: 'Bank Account',   path: '/profile?tab=bank', desc: 'Link a bank account'        },
];

export default function ProfileWarningBanner() {
  const { incomplete, isKycComplete, loading, fetched, hasName, panVerified, bankVerified } = useProfile();
  const navigate  = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if: loading, not fetched yet, all complete, or dismissed
  if (loading || !fetched || isKycComplete || dismissed) return null;
  if (incomplete.length === 0) return null;

  const done  = STEPS.filter(s => {
    if (s.key === 'name')  return hasName;
    if (s.key === 'pan')   return panVerified;
    if (s.key === 'bank')  return bankVerified;
    return false;
  });
  const total    = STEPS.length;
  const doneCount = done.length;
  const pct      = Math.round((doneCount / total) * 100);

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--surface-card)',
        border: '1px solid rgba(245,158,11,0.35)',
        boxShadow: '0 4px 20px rgba(245,158,11,0.1)',
      }}>

      {/* Top accent */}
      <div className="h-1" style={{ background: 'linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b)' }} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
              <WarnIcon />
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                Complete your profile to unlock all features
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {doneCount} of {total} steps done · You need PAN & bank verification to participate in deals
              </p>
            </div>
          </div>
          <button onClick={() => setDismissed(true)}
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
            style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            <CloseIcon />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Profile completion</span>
            <span className="text-xs font-black" style={{ color: '#f59e0b' }}>{pct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#f59e0b,#fbbf24)', boxShadow: '0 0 8px rgba(245,158,11,0.4)' }} />
          </div>
        </div>

        {/* Step pills */}
        <div className="flex flex-wrap gap-2">
          {STEPS.map(step => {
            const isDone = done.some(d => d.key === step.key);
            return (
              <button
                key={step.key}
                onClick={() => !isDone && navigate(step.path)}
                disabled={isDone}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={isDone ? {
                  background: 'rgba(16,185,129,0.08)',
                  color: '#10b981',
                  border: '1px solid rgba(16,185,129,0.25)',
                  cursor: 'default',
                } : {
                  background: 'rgba(245,158,11,0.08)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245,158,11,0.3)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { if (!isDone) e.currentTarget.style.background = 'rgba(245,158,11,0.15)'; }}
                onMouseLeave={e => { if (!isDone) e.currentTarget.style.background = 'rgba(245,158,11,0.08)'; }}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: isDone ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)' }}>
                  {isDone ? <CheckIcon /> : <span style={{ fontSize: 8, fontWeight: 900 }}>!</span>}
                </span>
                {step.label}
                {!isDone && <ArrowIcon />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
