import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (date: string | Date, pattern = 'dd/MM/yyyy') =>
  format(new Date(date), pattern, { locale: fr });

export const formatDateTime = (date: string | Date) =>
  format(new Date(date), 'dd/MM/yyyy à HH:mm', { locale: fr });

export const formatRelative = (date: string | Date) => {
  const d = new Date(date);
  if (isToday(d)) return "Aujourd'hui";
  if (isTomorrow(d)) return 'Demain';
  if (isYesterday(d)) return 'Hier';
  return formatDistanceToNow(d, { addSuffix: true, locale: fr });
};

export const formatShortDate = (date: string | Date) =>
  format(new Date(date), 'dd MMM', { locale: fr });
