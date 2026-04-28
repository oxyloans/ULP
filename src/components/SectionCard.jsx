function SectionCard({ title, description, children, accent }) {
  const accentColors = {
    indigo: 'rgba(99,102,241,0.5)',
    emerald: 'rgba(16,185,129,0.5)',
    amber: 'rgba(245,158,11,0.5)',
    rose: 'rgba(244,63,94,0.5)',
  };
  const glow = accentColors[accent] ?? accentColors.indigo;

  return (
    <section
      className="rounded-2xl p-6 animate-fade-up"
      style={{
        background: 'rgba(22,27,39,0.7)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        boxShadow: `0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: glow.replace('0.5', '0.9') }}>
            {title}
          </p>
          <h2 className="text-lg font-semibold text-white">{description}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

export default SectionCard;
