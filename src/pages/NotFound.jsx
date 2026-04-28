import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center rounded-2xl p-12 max-w-md w-full"
        style={{ background: 'rgba(22,27,39,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-7xl font-bold mb-4" style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          404
        </p>
        <h2 className="text-xl font-semibold text-white mb-2">Page not found</h2>
        <p className="text-slate-400 mb-6">This section of the ledger doesn't exist.</p>
        <Link to="/dashboard"
          className="inline-flex px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
