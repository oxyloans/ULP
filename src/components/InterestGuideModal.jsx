import { useState } from 'react';
import { Modal } from 'antd';

// ─── Colors ───────────────────────────────────────────────────────────────────
const INDIGO = '#6366f1';
const AMBER  = '#f59e0b';
const GREEN  = '#10b981';
const CYAN   = '#06b6d4';
const MUTED  = 'var(--text-muted, #888)';
const CARD   = 'var(--surface-card, #1a1a2e)';
const BORDER = 'var(--border, rgba(255,255,255,0.08))';

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ icon, title, color = INDIGO, children }) {
  return (
    <div style={{
      borderRadius: 14,
      border: `1px solid ${color}22`,
      background: `${color}06`,
      padding: '18px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color, letterSpacing: '0.01em' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Inline code block ────────────────────────────────────────────────────────
function Formula({ children }) {
  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      fontSize: 12,
      color: CYAN,
      background: `${CYAN}0d`,
      border: `1px solid ${CYAN}22`,
      borderRadius: 8,
      padding: '8px 14px',
      margin: '6px 0',
    }}>{children}</div>
  );
}

// ─── Step bubble ─────────────────────────────────────────────────────────────
function Step({ n, children }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
        background: `linear-gradient(135deg,${INDIGO},#4338ca)`,
        color: '#fff', fontSize: 11, fontWeight: 900,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 2px 8px ${INDIGO}50`,
      }}>{n}</div>
      <div style={{ flex: 1, paddingTop: 3 }}>{children}</div>
    </div>
  );
}

// ─── Callout box ─────────────────────────────────────────────────────────────
function Callout({ color = AMBER, children }) {
  return (
    <div style={{
      borderRadius: 10,
      border: `1px solid ${color}30`,
      background: `${color}0d`,
      padding: '12px 14px',
      marginTop: 8,
    }}>{children}</div>
  );
}

// ─── Example card ────────────────────────────────────────────────────────────
function Example({ n, tag, rows, result, resultLabel, note }) {
  return (
    <div style={{
      borderRadius: 12,
      border: `1px solid ${BORDER}`,
      background: CARD,
      overflow: 'hidden',
      marginBottom: 10,
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 14px',
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        borderBottom: `1px solid ${BORDER}`,
        background: `${INDIGO}0d`,
      }}>
        <span style={{
          fontSize: 10, fontWeight: 900, padding: '2px 10px', borderRadius: 999,
          background: INDIGO, color: '#fff', letterSpacing: '0.04em',
        }}>Example {n}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary, #fff)' }}>{tag}</span>
      </div>
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, borderBottom: `1px solid ${BORDER}` }}>
        {rows.map((r, i) => (
          <div key={i} style={{ padding: '8px 12px', borderRight: i < rows.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
            <p style={{ margin: 0, fontSize: 10, color: MUTED }}>{r.label}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 800, color: 'var(--text-primary, #fff)', fontFamily: 'monospace' }}>{r.value}</p>
          </div>
        ))}
      </div>
      {/* Steps */}
      <div style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-primary, #ccc)', lineHeight: 1.7 }}>
        {note.map((line, i) => <p key={i} style={{ margin: '2px 0' }}>{line}</p>)}
      </div>
      {/* Result */}
      <div style={{
        padding: '10px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: `${INDIGO}12`, borderTop: `1px solid ${BORDER}`,
      }}>
        <span style={{ fontSize: 11, color: MUTED }}>{resultLabel}</span>
        <span style={{ fontSize: 20, fontWeight: 900, color: AMBER, fontFamily: 'monospace' }}>{result}</span>
      </div>
    </div>
  );
}

// ─── FAQ item ────────────────────────────────────────────────────────────────
function FAQ({ q, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}`, paddingBottom: 8, marginBottom: 8 }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', textAlign: 'left', background: 'none', border: 'none',
          cursor: 'pointer', padding: '6px 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: CYAN }}>{q}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ width: 14, height: 14, flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <p style={{ margin: '4px 0 8px 0', fontSize: 12, color: 'var(--text-primary, #ccc)', lineHeight: 1.65 }}>
          {children}
        </p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function InterestGuideModal({ open, onClose }) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div style={{ paddingRight: 24 }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: AMBER }}>
            OxyLoans · Lender Guide
          </p>
          <h2 style={{ margin: '3px 0 0', fontSize: 16, fontWeight: 900, color: 'var(--text-primary, #fff)' }}>
            How Your First Interest Payment is Calculated
          </h2>
        </div>
      }
      styles={{
        content: { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, boxShadow: '0 32px 80px rgba(0,0,0,0.4)' },
        header:  { background: 'transparent', borderBottom: `1px solid ${BORDER}`, paddingBottom: 12 },
        body:    { padding: 0 },
        close:   { color: MUTED },
      }}
      width="min(780px, 96vw)"
      centered
    >
      <div style={{ maxHeight: '72vh', overflowY: 'auto', padding: '20px 22px', display: 'grid', gap: 16 }}>

        {/* ── Section 1: The Two Dates ── */}
        <Section icon="📅" title="The Two Dates That Matter" color={INDIGO}>
          <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--text-primary, #ccc)', lineHeight: 1.65 }}>
            Every deal has a fixed <strong style={{ color: INDIGO }}>monthly interest payment date</strong> — the date interest is
            credited to all lenders every month. This date is set when the deal is created and does not change.
          </p>
          {/* Timeline row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, margin: '12px 0' }}>
            {[
              { icon: '₹', label: 'You Invest',     sub: 'Your participation date',    color: INDIGO },
              { icon: '⏳', label: 'Waiting Days',   sub: 'Interest counted for these days only', color: AMBER, flex: true },
              { icon: '💰', label: 'First Payment',  sub: 'Monthly interest payment date', color: GREEN },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: step.flex ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: `${step.color}18`, border: `2px solid ${step.color}50`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                  }}>{step.icon}</div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: step.color, textAlign: 'center' }}>{step.label}</span>
                  <span style={{ fontSize: 10, color: MUTED, textAlign: 'center', maxWidth: 80 }}>{step.sub}</span>
                </div>
                {step.flex && (
                  <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg,${INDIGO}40,${GREEN}40)`, margin: '0 8px', marginBottom: 32 }} />
                )}
                {i === 0 && (
                  <div style={{ flex: 0, width: 24, height: 2, background: `${INDIGO}40`, marginBottom: 32 }} />
                )}
              </div>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary, #ccc)', lineHeight: 1.65 }}>
            When you invest, your <strong style={{ color: AMBER }}>first payment</strong> covers only the days between your
            participation date and the next interest payment date.{' '}
            <strong style={{ color: GREEN }}>From the second month onwards</strong> you receive a full month's interest on that
            same fixed date every month.
          </p>
        </Section>

        {/* ── Section 2: Why 2 days excluded ── */}
        <Section icon="🔍" title="Why Are 2 Days Excluded?" color={AMBER}>
          <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--text-primary, #ccc)', lineHeight: 1.65 }}>
            When counting the days for your first payment, we exclude 2 days:
          </p>
          <Callout color={AMBER}>
            <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 900, color: AMBER }}>Two days are not counted because:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: AMBER, color: '#fff', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-primary, #ccc)', lineHeight: 1.6 }}>
                  <strong style={{ color: AMBER }}>Your participation date</strong> — OxyLoans cannot deploy your funds on the same day
                  you participate (bank hours, late-night processing, etc.). So it is not counted as an interest-earning day.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: AMBER, color: '#fff', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-primary, #ccc)', lineHeight: 1.6 }}>
                  <strong style={{ color: AMBER }}>The interest payment date</strong> — On payout day the payment processing is
                  already under way, so that day is also not counted.
                </p>
              </div>
            </div>
          </Callout>
          <p style={{ margin: '10px 0 0', fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
            This ensures interest is counted only for the days your money is actually deployed and working for you.
          </p>
        </Section>

        {/* ── Section 3: 30-day rule ── */}
        <Section icon="🗓" title="Every Month = 30 Days" color={GREEN}>
          <Callout color={GREEN}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary, #ccc)', lineHeight: 1.65 }}>
              OxyLoans counts every month as exactly <strong style={{ color: GREEN }}>30 days</strong> for interest
              calculation — whether it is January (31 days), February (28/29 days), or any other month.
            </p>
          </Callout>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-primary, #ccc)', lineHeight: 1.65 }}>
              • Your monthly interest is always <strong style={{ color: GREEN }}>consistent and predictable</strong>. A lender
              investing ₹20 lakhs at 1.75% always earns exactly <strong style={{ color: AMBER }}>₹35,000 per month</strong>.
            </p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-primary, #ccc)', lineHeight: 1.65 }}>
              • The 31st of any month is treated the same as the 30th for calculation purposes.
            </p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-primary, #ccc)', lineHeight: 1.65 }}>
              • February's shorter calendar does <strong style={{ color: GREEN }}>not</strong> reduce your interest — you always earn on 30 days.
            </p>
          </div>
        </Section>

        {/* ── Section 4: Formula ── */}
        <Section icon="🧮" title="The Simple Formula" color={CYAN}>
          <Step n={1}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary, #ccc)', lineHeight: 1.6 }}>
              Count the days between your participation date and the interest payment date (using 30-day months),
              then <strong style={{ color: CYAN }}>subtract 2</strong>.
            </p>
            <Formula>Days = (Payment Date − Participation Date) − 2</Formula>
          </Step>
          <Step n={2}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary, #ccc)', lineHeight: 1.6 }}>
              Calculate your monthly interest.
            </p>
            <Formula>Monthly Interest = Investment × Monthly Rate ÷ 100</Formula>
          </Step>
          <Step n={3}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary, #ccc)', lineHeight: 1.6 }}>
              Divide by 30 to get one day's interest.
            </p>
            <Formula>Daily Interest = Monthly Interest ÷ 30</Formula>
          </Step>
          <Step n={4}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary, #ccc)', lineHeight: 1.6 }}>
              Multiply by the number of days from Step 1.
            </p>
            <Formula>First Payment = Daily Interest × Days</Formula>
          </Step>
        </Section>

        {/* ── Section 5: Examples ── */}
        <Section icon="📊" title="Examples   —   ₹20 Lakhs at 1.75% per month" color={AMBER}>
          <Example
            n={1}
            tag="Invested 5 Aug · Payment date: 5 Sep (cross-month)"
            rows={[
              { label: 'Investment Date', value: '5 Aug 2026' },
              { label: 'Payment Date',    value: '5 Sep 2026' },
              { label: 'Investment',      value: '₹20,00,000' },
              { label: 'Monthly Rate',    value: '1.75%' },
            ]}
            note={[
              'Sep 5 − Aug 5 = 1 month = 30 days (30/360 rule)',
              'Subtract 2 (participation day + payment day) → 28 days counted',
              'Monthly interest = ₹35,000  ·  Daily interest = ₹1,166.67',
              'First payment = 28 × ₹1,166.67',
            ]}
            result="₹32,667"
            resultLabel="First payment on 5 Sep · From Oct onwards: ₹35,000/month"
          />
          <Example
            n={2}
            tag="Invested 15 Aug · Payment date: 31 Aug (same month)"
            rows={[
              { label: 'Investment Date', value: '15 Aug 2026' },
              { label: 'Payment Date',    value: '31 Aug 2026' },
              { label: 'Investment',      value: '₹20,00,000' },
              { label: 'Monthly Rate',    value: '1.75%' },
            ]}
            note={[
              '31st treated as 30th (30-day rule) → 30 − 15 = 15 days',
              'Subtract 2 → 13 days counted',
              'Monthly interest = ₹35,000  ·  Daily interest = ₹1,166.67',
              'First payment = 13 × ₹1,166.67',
            ]}
            result="₹15,167"
            resultLabel="First payment on 31 Aug · From Sep onwards: ₹35,000/month"
          />
          <Example
            n={3}
            tag="Invested 3 Sep · Payment date: 30 Sep (same month)"
            rows={[
              { label: 'Investment Date', value: '3 Sep 2026' },
              { label: 'Payment Date',    value: '30 Sep 2026' },
              { label: 'Investment',      value: '₹20,00,000' },
              { label: 'Monthly Rate',    value: '1.75%' },
            ]}
            note={[
              '30 − 3 = 27 days in the same month',
              'Subtract 2 → 25 days counted',
              'Monthly interest = ₹35,000  ·  Daily interest = ₹1,166.67',
              'First payment = 25 × ₹1,166.67',
            ]}
            result="₹29,167"
            resultLabel="First payment on 30 Sep · From Oct onwards: ₹35,000/month on the 30th"
          />
          <Example
            n={4}
            tag="Invested 1 Feb · Payment date: 28 Feb — February = 30 days, not 28"
            rows={[
              { label: 'Investment Date', value: '1 Feb 2027' },
              { label: 'Payment Date',    value: '28 Feb 2027' },
              { label: 'Investment',      value: '₹20,00,000' },
              { label: 'Monthly Rate',    value: '1.75%' },
            ]}
            note={[
              'OxyLoans 30/360 rule: every month = 30 days — so Feb is also 30 days',
              'Subtract 2 → 28 days counted',
              'Monthly interest = ₹35,000  ·  Daily interest = ₹1,166.67',
              "First payment = 28 × ₹1,166.67  ·  February's shorter calendar does NOT reduce your interest",
            ]}
            result="₹32,667"
            resultLabel="Same result as any full month — you always earn on 30 days"
          />
        </Section>

        {/* ── Section 6: FAQ ── */}
        <Section icon="❓" title="Common Questions" color={CYAN}>
          <FAQ q="Why is my first payment smaller than my usual monthly interest?">
            Because your first payment covers only the days between when you invested and the next fixed interest payment
            date — not a full month. From the second month onwards you receive the full amount every month.
          </FAQ>
          <FAQ q="What is the monthly interest payment date?">
            It is the fixed date on which OxyLoans credits interest to all lenders in that deal. This date is the same every
            month throughout the deal. For example, if the payment date is the 30th, you receive interest on the 30th of
            every month.
          </FAQ>
          <FAQ q="Why does February also use 30 days?">
            OxyLoans uses the 30/360 convention — every month is treated as 30 days so that interest is consistent and
            fair for every lender regardless of which month they invest in. February's shorter calendar does not reduce
            your interest.
          </FAQ>
          <FAQ q="Is my money earning interest from the day I invest?">
            In most cases OxyLoans is unable to deploy funds on the very same day you participate — due to bank working
            hours, late evening participation, or other processing reasons. Your funds are deployed as soon as possible
            thereafter, and the 2-day exclusion fairly accounts for both the participation day and the payment day.
          </FAQ>
          <FAQ q="If the payment date is the 31st, do I lose a day?">
            No. The 31st is treated as the 30th in our 30/360 calculation, so it has the same value as the 30th. You do
            not lose any interest.
          </FAQ>
        </Section>

        {/* ── Footer ── */}
        <p style={{ margin: 0, fontSize: 11, color: MUTED, textAlign: 'center' }}>
          OxyLoans · RBI Registered NBFC-P2P · For queries: support@oxyloans.com
        </p>

      </div>
    </Modal>
  );
}

// ─── Convenience trigger button ───────────────────────────────────────────────
export function InterestGuideButton({ accentColor = '#6366f1' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 10,
          fontSize: 12, fontWeight: 700,
          background: `${accentColor}12`,
          color: accentColor,
          border: `1px solid ${accentColor}30`,
          cursor: 'pointer',
          transition: 'all 0.18s',
          flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = `${accentColor}22`; e.currentTarget.style.transform = 'scale(1.04)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = `${accentColor}12`; e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        How interest works
      </button>
      <InterestGuideModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
