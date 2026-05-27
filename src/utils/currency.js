export function formatINR(value, { minimumFractionDigits = 0, maximumFractionDigits = 2 } = {}) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(Number.isFinite(n) ? n : 0);
}

