import { CalendarDay } from '../types';

/**
 * Calculates traditional Manipuri lunar observances dynamically based on Meitei day rules:
 * - Purnima: Full Moon on the 15th lunar day (or the second date if day 15 spans 2 Gregorian dates).
 * - Thasi: Dark Moon / New Moon on the 30th lunar day (or the second date if day 30 spans 2 Gregorian dates, or collision dates like [30, 1]).
 * - Ekadasi: 11th lunar day (Waxing / Shajik) and 26th lunar day (Waning / Khei).
 */
export function enrichDaysWithObservances(days: CalendarDay[]): CalendarDay[] {
  if (!days || days.length === 0) return [];

  const n = days.length;
  return days.map((day, i) => {
    const curDays = day.day;
    const nextDays = i + 1 < n ? days[i + 1].day : [];

    let calculatedObs: string | undefined;
    let calculatedMoonPhase: string | undefined;

    // Ekadasi (Waxing on 11, Waning on 26; if multi-day span, tag the second day)
    if (curDays.includes(11)) {
      if (!nextDays.includes(11)) {
        calculatedObs = 'ekadasi';
        calculatedMoonPhase = 'waxing';
      }
    } else if (curDays.includes(26)) {
      if (!nextDays.includes(26)) {
        calculatedObs = 'ekadasi';
        calculatedMoonPhase = 'waning';
      }
    } else if (curDays.includes(15)) {
      // Purnima (Day 15; if multi-day span, tag the second day)
      if (!nextDays.includes(15)) {
        calculatedObs = 'purnima';
      }
    } else if (curDays.includes(30)) {
      // Thasi (Day 30; if multi-day span, tag the second day)
      if (!nextDays.includes(30)) {
        calculatedObs = 'thasi';
      }
    }

    // Allow explicit JSON values to serve as overrides if present
    const finalObservance = day.observance || calculatedObs;
    const finalMoonPhase = day.moonPhase || calculatedMoonPhase;

    return {
      ...day,
      observance: finalObservance,
      moonPhase: finalMoonPhase
    };
  });
}
