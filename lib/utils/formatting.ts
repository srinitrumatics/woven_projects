export function formatCurrency(amount: number | null | undefined, currency: string = 'USD', decimals: number = 2): string {
  if (amount == null || isNaN(amount as number)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatNumber(value: number | null | undefined, decimals: number = 0): string {
  if (value == null || isNaN(value as number)) return '-';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDate(
  dateString: string | Date | null | undefined,
  format: 'short' | 'medium' | 'long' | 'numeric-dash' = 'medium'
): string {
  if (!dateString) return '-';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

  if (isNaN(date.getTime())) return '-';

  let options: Intl.DateTimeFormatOptions;
  switch (format) {
    case 'short':
      options = { month: 'numeric', day: 'numeric', year: '2-digit' };
      break;
    case 'medium':
      options = { month: 'short', day: 'numeric', year: 'numeric' };
      break;
    case 'long':
      options = { month: 'long', day: 'numeric', year: 'numeric' };
      break;
    case 'numeric-dash':
      return new Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }).format(date).replace(/\//g, '-');
    default:
      options = { month: 'short', day: 'numeric', year: 'numeric' };
  }

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function formatFileSize(bytes: number | string | undefined | null): string {
  const b = typeof bytes === 'string' ? parseInt(bytes) : bytes;
  if (!b || isNaN(b)) return '0 KB';

  if (b < 1024 * 1024) {
    return (b / 1024).toFixed(2) + ' KB';
  }
  return (b / (1024 * 1024)).toFixed(2) + ' MB';
}

export function formatTime(timeString: string | null | undefined): string {
  if (!timeString) return '-';

  const match = timeString.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return timeString;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${hours}:${minutes} ${ampm}`;
}

export function displayCell(value: string | null | undefined): string {
  if (value == null || value.trim() === '') return '-';
  return value;
}
