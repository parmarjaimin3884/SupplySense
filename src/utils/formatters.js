export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercent = (decimal) => {
  if (decimal === undefined || decimal === null || isNaN(decimal)) return '0%';
  return `${(decimal * 100).toFixed(1)}%`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const getRiskSeverityColor = (score) => {
  if (!score || isNaN(score)) return 'var(--color-success)';
  if (score >= 75) return 'var(--color-danger)';
  if (score >= 45) return 'var(--color-warning)';
  return 'var(--color-success)';
};

export const getRiskLabel = (score) => {
  if (!score || isNaN(score)) return 'OPTIMAL';
  if (score >= 75) return 'CRITICAL';
  if (score >= 45) return 'MODERATE';
  return 'OPTIMAL';
};
