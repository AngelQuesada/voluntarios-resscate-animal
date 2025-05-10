// Utilidades generales para la aplicación
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha a un formato legible
 * @param date Fecha a formatear (string o Date)
 * @returns Fecha formateada como string
 */
export function formatDate(date: string | Date): string {
  if (!date) return 'Fecha no disponible';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd MMM yyyy', { locale: es });
}

/**
 * Formatea una hora a un formato legible
 * @param time String de hora (formato 24h "HH:mm")
 * @returns Hora formateada
 */
export function formatTime(time: string): string {
  if (!time) return '';
  
  // Si ya tiene el formato correcto, lo devolvemos tal cual
  if (/^\d{1,2}:\d{2}$/.test(time)) {
    return time;
  }
  
  // Si es un timestamp completo, extraemos solo la hora
  try {
    const date = new Date(time);
    return format(date, 'HH:mm');
  } catch (e) {
    return time;
  }
}

/**
 * Comprueba si una fecha es hoy
 * @param date Fecha a comprobar
 * @returns true si la fecha es hoy
 */
export function isToday(date: Date | string): boolean {
  const today = new Date();
  const compareDate = typeof date === 'string' ? new Date(date) : date;
  
  return (
    compareDate.getDate() === today.getDate() &&
    compareDate.getMonth() === today.getMonth() &&
    compareDate.getFullYear() === today.getFullYear()
  );
}
