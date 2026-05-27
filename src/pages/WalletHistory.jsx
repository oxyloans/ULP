import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWalletHistory } from '../api/afterlogin-user';
import { formatINR } from '../utils/currency';

// ─── Icons ────────────────────────────────────────────────────────────────────
const ArrowLeft   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const RefreshIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const WalletIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="18" cy="12" r="2"/></svg>;
const ArrowUpIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>;
const ArrowDnIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>;
const CopyIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;

function fmtINR(n) {
  return formatINR(n ?? 0);
}

function clean(s) {
  if (!s || !s.trim()) return null;
  return s.trim();
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="transition-all hover:scale-110 flex-shrink-0"
      style={{ color: copied ? '#10b981' : 'var(--text-muted)' }}>
      <CopyIcon />
    </button>
  );
}

// ─── Parse API response ───────────────────────────────────────────────────────
function parseResponse(raw) {
  if (raw && raw.walletResponses && Array.isArray(raw.walletResponses)) {
    return {
      balance: raw.currentWalletAmount ?? null,
      txns: raw.walletResponses.map((r, i) => {
        const type    = (r.transactionType ?? 'credit').toLowerCase();
        const isDebit = type === 'debit';
        const utr     = clean(r.utrNumber);
        const date    = clean(r.transactionDate);
        const by      = clean(r.approvedBy);

        // For debits: description = "Deal Participation" + short deal id
        // For credits: description = adminComments or "Wallet Deposit"
        let description = clean(r.adminComments) ?? (isDebit ? 'Deal Participation' : 'Wallet Deposit');

        return {
          id:          `TXN-${i}`,
          type,
          isDebit,
          description,
          date:        date ?? '—',
          amount:      r.amount ?? 0,
          utr:         utr,
          dealId:      clean(r.dealId),
          approvedBy:  by,
          comments:    clean(r.adminComments),
        };
      }),
    };
  }
  if (Array.isArray(raw)) {
    return {
      balance: null,
      txns: raw.map((r, i) => ({
        id:          r.documentId ?? `TXN-${i}`,
        type:        'credit',
        isDebit:     false,
        description: r.utrNumber ? `Deposit · UTR ${r.utrNumber}` : 'Deposit Slip',
        date:        clean(r.transactionDate) ?? '—',
        amount:      r.transactionAmount ?? 0,
        utr:         clean(r.utrNumber),
        dealId:      null,
        approvedBy:  null,
        comments:    null,
      })),
    };
  }
  return { balance: null, txns: [] };
}

export default function WalletHistory() {
  const navigate = useNavigate();
  const [txns,       setTxns]       = useState([]);
  const [balance,    setBalance]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [filter,     setFilter]     = useState('all');  // all | credit | debit

  const fetchHistory = async () => {
    setLoading(true); setError('');
    try {
      const raw = await getWalletHistory();
      const { balance: bal, txns: parsed } = parseResponse(raw);
      if (bal !== null) setBalance(bal);
      setTxns(parsed);
    } catch (err) {
      setError(err.message ?? 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const filtered     = filter === 'all' ? txns : txns.filter(t => t.type === filter);
  const totalCredits = txns.filter(t => !t.isDebit).reduce((s, t) => s + t.amount, 0);
  const totalDebits  = txns.filter(t =>  t.isDebit).reduce((s, t) => s + t.amount, 0);
  const bal          = balance ?? 0;

  const FILTERS = [
    { key: 'all',    label: 'All',        count: txns.length },
    { key: 'credit', label: 'Credits',    count: txns.filter(t => !t.isDebit).length },
    { key: 'debit',  label: 'Debits',     count: txns.filter(t =>  t.isDebit).length },
  ];

  return (
    <div className="grid gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/wallet')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            <ArrowLeft /> Wallet
          </button>
          <span style={{ color: 'var(--border)' }}>/</span>
          <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>Transaction History</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            <RefreshIcon /> Refresh
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)' }}>
            <span style={{ color: '#818cf8' }}><WalletIcon /></span>
            <span className="text-sm font-black" style={{ color: '#818cf8', fontFamily: "'JetBrains Mono',monospace" }}>
              {fmtINR(bal)}
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>balance</span>
          </div>
        </div>
      </div>

      {/* ── Summary strip ── */}
      {!loading && !error && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0"
            style={{ borderColor: 'var(--border)' }}>
            {[
              { label: 'Wallet Balance', value: fmtINR(bal),          color: '#6366f1', Icon: WalletIcon   },
              { label: 'Total Credits',  value: fmtINR(totalCredits), color: '#10b981', Icon: ArrowDnIcon  },
              { label: 'Total Debits',   value: fmtINR(totalDebits),  color: '#ef4444', Icon: ArrowUpIcon  },
              { label: 'Transactions',   value: String(txns.length),  color: '#f59e0b', Icon: RefreshIcon  },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3 px-5 py-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${s.color}12`, border: `1px solid ${s.color}20`, color: s.color }}>
                  <s.Icon />
                </div>
                <div>
                  <p className="text-lg font-black leading-none"
                    style={{ color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Table card ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

        {/* Table header + filter */}
        <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(99,102,241,0.03)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            Transactions
            {!loading && <span className="ml-2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>({filtered.length})</span>}
          </p>
          <div className="flex items-center gap-1 p-0.5 rounded-xl"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: filter === f.key ? 'linear-gradient(135deg,#6366f1,#4338ca)' : 'transparent',
                  color:      filter === f.key ? '#fff' : 'var(--text-muted)',
                  boxShadow:  filter === f.key ? '0 2px 8px rgba(99,102,241,0.35)' : 'none',
                }}>
                {f.label}
                {f.count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-black"
                    style={{
                      background: filter === f.key ? 'rgba(255,255,255,0.25)' : 'var(--border)',
                      color:      filter === f.key ? '#fff' : 'var(--text-muted)',
                      fontSize: 9,
                    }}>
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-16">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Loading transactions…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm font-semibold" style={{ color: '#ef4444' }}>{error}</p>
            <button onClick={fetchHistory}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
              <RefreshIcon /> Retry
            </button>
          </div>
        )}

        {/* Rows */}
        {!loading && !error && (
          filtered.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No transactions found</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {filtered.map((txn, i) => (
                <div key={txn.id}
                  className="flex items-center gap-4 px-5 py-4 flex-wrap sm:flex-nowrap transition-colors"
                  style={{ borderColor: 'var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                  {/* Type icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: txn.isDebit ? 'rgba(239,68,68,0.1)'  : 'rgba(16,185,129,0.1)',
                      border:     txn.isDebit ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(16,185,129,0.25)',
                      color:      txn.isDebit ? '#ef4444' : '#10b981',
                    }}>
                    {txn.isDebit ? <ArrowUpIcon /> : <ArrowDnIcon />}
                  </div>

                  {/* Description + date */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {txn.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{txn.date}</span>
                      {txn.dealId && (
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(99,102,241,0.08)', color: '#818cf8', fontSize: 10 }}>
                          Deal: {txn.dealId.slice(0, 8)}…
                        </span>
                      )}
                    </div>
                  </div>

                  {/* UTR */}
                  <div className="flex-shrink-0 hidden sm:flex items-center gap-1.5">
                    {txn.utr ? (
                      <>
                        <span className="text-xs font-mono px-2 py-1 rounded-lg"
                          style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                          {txn.utr}
                        </span>
                        <CopyBtn text={txn.utr} />
                      </>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </div>

                  {/* Approved by */}
                  <div className="flex-shrink-0 hidden sm:block text-right" style={{ minWidth: 80 }}>
                    {txn.approvedBy ? (
                      <span className="text-xs font-semibold" style={{ color: '#10b981' }}>{txn.approvedBy}</span>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontSize: 10 }}>Approved by</p>
                  </div>

                  {/* Amount */}
                  <div className="flex-shrink-0 text-right" style={{ minWidth: 90 }}>
                    <p className="text-base font-extrabold"
                      style={{ color: txn.isDebit ? '#ef4444' : '#10b981', fontFamily: "'JetBrains Mono',monospace" }}>
                      {txn.isDebit ? '−' : '+'}{fmtINR(txn.amount)}
                    </p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={txn.isDebit
                        ? { background: 'rgba(239,68,68,0.1)',  color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)'  }
                        : { background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }
                      }>
                      {txn.isDebit ? 'Debit' : 'Credit'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
