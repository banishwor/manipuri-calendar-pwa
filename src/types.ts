export enum LanguageMode {
  ENGLISH = 'ENGLISH',
  MEITEI_MAYEK = 'MEITEI_MAYEK',
  BENGALI = 'BENGALI'
}

export enum DisplayTheme {
  SYSTEM = 'SYSTEM',
  LIGHT = 'LIGHT',
  DARK = 'DARK'
}

export enum CalendarTab {
  TODAY = 'TODAY',
  CALENDAR = 'CALENDAR',
  TATNABA = 'TATNABA',
  INFO = 'INFO'
}

export interface CalendarDay {
  gregorian: string; // "YYYY-MM-DD"
  month: string; // Traditional Meitei month name (e.g., "WAKCHING")
  day: number[]; // Normalised Meitei month days (e.g., [13])
  festivals?: string[]; // Festival IDs
  events?: string[]; // Event IDs
  observance?: 'purnima' | 'thasi' | 'ekadasi' | string;
  moonPhase?: 'waxing' | 'waning' | string;
}

export interface Event {
  id: string;
  name: string;
  category: 'ritual' | 'memorial' | 'commemoration' | 'national_holiday' | 'holiday' | 'celebration' | 'festival' | string;
  isHoliday: boolean;
  description?: string;
  blogUrl?: string;
}

export interface MonthConfig {
  thasiMaikei: 'AWANG' | 'MAKHA' | 'NONGPOK' | 'NONGCHUP' | string;
  tatnaba: string[]; // Weekdays: "SUNDAY", "MONDAY", etc.
}

export interface Observance {
  id: string;
  name: string;
  description: string;
}

export interface TranslationItem {
  mayek: string;
  bengali: string;
}

export interface Translations {
  months: Record<string, TranslationItem>;
  weekdays: Record<string, TranslationItem>;
  directions: Record<string, TranslationItem>;
  digits: Record<string, TranslationItem>;
}

export interface UpcomingFestival {
  date: Date;
  dayData: CalendarDay;
  events: Event[];
  daysRemaining: number;
}
