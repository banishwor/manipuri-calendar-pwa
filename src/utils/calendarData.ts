import { CalendarDay, Event, MonthConfig, Observance, Translations } from '../types';

export class CalendarRepository {
  private static instance: CalendarRepository;

  private availableYears: number[] = [2026];
  private calendarCache: Record<number, CalendarDay[]> = {};
  private monthsCache: Record<number, Record<string, MonthConfig>> = {};

  private eventsList: Event[] = [];
  private observancesList: Observance[] = [];
  private translationsObj: Translations | null = null;
  private initialized = false;

  private constructor() {}

  public static getInstance(): CalendarRepository {
    if (!CalendarRepository.instance) {
      CalendarRepository.instance = new CalendarRepository();
    }
    return CalendarRepository.instance;
  }

  public async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // 1. Fetch available years
      const yearsRes = await fetch('assets/years.json');
      if (yearsRes.ok) {
        this.availableYears = await yearsRes.json();
      }
    } catch (e) {
      console.warn('Failed to load years.json, using default [2026]', e);
      this.availableYears = [2026];
    }

    try {
      // 2. Fetch master data: events, observances, translations
      const [eventsRes, observancesRes, translationsRes] = await Promise.all([
        fetch('assets/events.json'),
        fetch('assets/observances.json'),
        fetch('assets/translations.json')
      ]);

      if (eventsRes.ok) {
        this.eventsList = await eventsRes.json();
      }
      if (observancesRes.ok) {
        this.observancesList = await observancesRes.json();
      }
      if (translationsRes.ok) {
        this.translationsObj = await translationsRes.json();
      }
      
      this.initialized = true;
    } catch (e) {
      console.error('Failed to load master calendar config datasets', e);
    }
  }

  public getAvailableYears(): number[] {
    return this.availableYears;
  }

  public getEvents(): Event[] {
    return this.eventsList;
  }

  public getObservances(): Observance[] {
    return this.observancesList;
  }

  public getTranslations(): Translations | null {
    return this.translationsObj;
  }

  public async loadYearData(year: number): Promise<boolean> {
    if (this.calendarCache[year] && this.monthsCache[year]) {
      return true;
    }

    try {
      const [calendarRes, monthsRes] = await Promise.all([
        fetch(`assets/calendar/calendar_${year}.json`),
        fetch(`assets/months/months_${year}.json`)
      ]);

      if (!calendarRes.ok || !monthsRes.ok) {
        throw new Error(`Data files not found for year ${year}`);
      }

      const rawCalendar: any[] = await calendarRes.json();
      
      // Adapt the day adaptor: verify if day is an array. If not, convert to single-item array
      const parsedCalendar: CalendarDay[] = rawCalendar.map((item) => {
        let normalizedDays: number[] = [];
        if (Array.isArray(item.day)) {
          normalizedDays = item.day;
        } else if (typeof item.day === 'number') {
          normalizedDays = [item.day];
        } else if (item.day) {
          normalizedDays = [parseInt(item.day, 10)];
        }
        return {
          ...item,
          day: normalizedDays
        };
      });

      this.calendarCache[year] = parsedCalendar;
      this.monthsCache[year] = await monthsRes.json();
      return true;
    } catch (e) {
      console.error(`Failed to load year datasets for ${year}`, e);
      return false;
    }
  }

  public async getDaysForMonth(year: number, month: number): Promise<CalendarDay[]> {
    await this.loadYearData(year);
    const days = this.calendarCache[year] || [];
    const monthStr = month.toString().padStart(2, '0');
    const prefix = `${year}-${monthStr}-`;
    return days.filter((d) => d.gregorian.startsWith(prefix));
  }

  public async getDayDetails(gregorianDate: string): Promise<CalendarDay | null> {
    const parts = gregorianDate.split('-');
    if (parts.length < 3) return null;
    const year = parseInt(parts[0], 10);
    if (isNaN(year)) return null;

    await this.loadYearData(year);
    const days = this.calendarCache[year] || [];
    return days.find((d) => d.gregorian === gregorianDate) || null;
  }

  public async getMonthConfig(year: number, monthName: string): Promise<MonthConfig | null> {
    await this.loadYearData(year);
    const configs = this.monthsCache[year] || {};
    // Month names inside calendar_2026.json are in UPPERCASE
    const key = monthName.toUpperCase().replace(/\s*\(LEAP\)/g, '').replace(/_LEAP/g, '').trim();
    return configs[key] || null;
  }

  public async getMonthConfigsForYear(year: number): Promise<Record<string, MonthConfig>> {
    await this.loadYearData(year);
    return this.monthsCache[year] || {};
  }

  public async getDaysForYear(year: number): Promise<CalendarDay[]> {
    await this.loadYearData(year);
    return this.calendarCache[year] || [];
  }

  public async searchDays(query: string): Promise<CalendarDay[]> {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return [];

    const results: CalendarDay[] = [];

    for (const year of this.availableYears) {
      await this.loadYearData(year);
      const days = this.calendarCache[year] || [];

      const matches = days.filter((day) => {
        // 1. Matches Gregorian date string (e.g. "2026-03-19")
        if (day.gregorian.includes(cleanQuery)) return true;

        // 2. Matches Meitei month name (e.g. "Sajibu")
        if (day.month.toLowerCase().includes(cleanQuery)) return true;

        // 3. Matches festivals
        if (day.festivals && day.festivals.length > 0) {
          const festivalMatch = day.festivals.some((festId) => {
            const ev = this.eventsList.find((e) => e.id === festId);
            return ev && ev.name.toLowerCase().includes(cleanQuery);
          });
          if (festivalMatch) return true;
        }

        // 4. Matches general events
        if (day.events && day.events.length > 0) {
          const eventMatch = day.events.some((evId) => {
            const ev = this.eventsList.find((e) => e.id === evId);
            return ev && ev.name.toLowerCase().includes(cleanQuery);
          });
          if (eventMatch) return true;
        }

        // 5. Matches observance name
        if (day.observance && day.observance.toLowerCase().includes(cleanQuery)) {
          return true;
        }

        return false;
      });

      results.push(...matches);
    }

    // Sort chronologically
    return results.sort((a, b) => a.gregorian.localeCompare(b.gregorian));
  }
}
