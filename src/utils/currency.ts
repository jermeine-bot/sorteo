export const formatCurrency = (amount: number | string): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  return `C$ ${numericAmount.toLocaleString('es-NI', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const QUICK_AMOUNTS = [10, 20, 50, 100, 200, 500];
