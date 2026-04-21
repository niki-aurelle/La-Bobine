export const formatCurrency = (amount: number, currency = 'XAF'): string => {
  if (currency === 'XAF' || currency === 'XOF') {
    return `${Math.round(amount).toLocaleString('fr-FR')} FCFA`;
  }
  try {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
};
