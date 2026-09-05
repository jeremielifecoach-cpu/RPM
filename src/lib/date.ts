const DAY_NAMES_SHORT = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const MONTH_NAMES_LOWER = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0);
}

/** Lundi de la semaine de la date donnée (début de semaine en France) */
export function mondayOf(input: Date | string): Date {
  const d = typeof input === "string" ? parseISODate(input) : new Date(input);
  const day = (d.getDay() + 6) % 7; // 0 = lundi
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day, 12);
  return monday;
}

export function weekKeyOf(input: Date | string): string {
  return toISODate(mondayOf(input));
}

export function addWeeks(weekKey: string, delta: number): string {
  const d = mondayOf(weekKey);
  d.setDate(d.getDate() + delta * 7);
  return toISODate(d);
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** "Semaine du lundi 12 au dimanche 18 mai 2026" */
export function weekRangeLabel(weekKey: string): string {
  const monday = mondayOf(weekKey);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const sameMonth = monday.getMonth() === sunday.getMonth();
  const sameYear = monday.getFullYear() === sunday.getFullYear();
  const s = `Semaine du ${monday.getDate()}${sameMonth ? "" : ` ${MONTH_NAMES_LOWER[monday.getMonth()]}`} au ${sunday.getDate()} ${MONTH_NAMES_LOWER[sunday.getMonth()]}${sameYear ? ` ${sunday.getFullYear()}` : ` ${monday.getFullYear()} — ${sunday.getFullYear()}`}`;
  return s;
}

export function isCurrentWeek(weekKey: string): boolean {
  return weekKeyOf(new Date()) === weekKey;
}

export function isWeekInPast(weekKey: string): boolean {
  return weekKey < weekKeyOf(new Date());
}

/** "Samedi 7 mars 2026" */
export function fullDateFr(iso: string): string {
  const d = parseISODate(iso);
  const dayName = DAY_NAMES_SHORT[d.getDay()].replace(".", "");
  return `${capFirst(dayName)} ${d.getDate()} ${MONTH_NAMES[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
}

export function longDateFr(d: Date): string {
  const dayName = DAY_NAMES_SHORT[d.getDay()].replace(".", "");
  return `${capFirst(dayName)} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

export function capFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function shortMonthDay(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getDate()} ${MONTH_NAMES_LOWER[d.getMonth()]}`;
}
