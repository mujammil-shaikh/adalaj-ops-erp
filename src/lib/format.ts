/**
 * Formats integer paise into Indian Rupee format (₹, lakhs, crores)
 */
export function formatINR(paise: number, showDecimals = false): string {
  const rupees = paise / 100;
  const isNegative = rupees < 0;
  const absRupees = Math.abs(rupees);

  const formatted = absRupees.toLocaleString('en-IN', {
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  });

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export const formatCurrency = formatINR;
export const formatPaiseToRupees = formatINR;

/**
 * Formats weight in grams into human readable (g or kg)
 */
export function formatGrams(grams: number): string {
  if (Math.abs(grams) >= 1000) {
    const kg = grams / 1000;
    return `${kg.toLocaleString('en-IN', { maximumFractionDigits: 2 })} kg`;
  }
  return `${grams.toLocaleString('en-IN')} g`;
}

/**
 * Format quantity with base unit
 */
export function formatQty(qty: number, unit = 'pcs'): string {
  return `${qty.toLocaleString('en-IN')} ${unit}`;
}

/**
 * Format percentage
 */
export function formatPct(pct: number): string {
  return `${pct.toFixed(1)}%`;
}

/**
 * Format date to standard Indian display DD-MM-YYYY
 */
export function formatDate(isoDate: string): string {
  if (!isoDate) return '-';
  try {
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}
