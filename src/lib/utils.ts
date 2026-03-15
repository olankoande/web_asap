import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(d: string | null | undefined) {
  if (!d) return '—';
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return '—';
    return format(date, 'dd MMM yyyy, HH:mm', { locale: fr });
  } catch {
    return '—';
  }
}

export function formatRelative(d: string | null | undefined) {
  if (!d) return '—';
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return '—';
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  } catch {
    return '—';
  }
}

export function formatCurrency(amount: number | string | null | undefined, currency = 'CAD') {
  const num = Number(amount ?? 0);
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency }).format(num);
}

export function initials(first?: string, last?: string) {
  return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
}
