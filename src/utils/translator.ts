import { LanguageMode, Translations } from '../types';

export const Translator = {
  translateDigits(numberStr: string, mode: LanguageMode, translations: Translations | null): string {
    if (mode === LanguageMode.ENGLISH || !translations) return numberStr;
    return numberStr
      .split('')
      .map((char) => {
        const trans = translations.digits[char];
        if (!trans) return char;
        return mode === LanguageMode.MEITEI_MAYEK ? trans.mayek : trans.bengali;
      })
      .join('');
  },

  translateMonth(monthName: string, mode: LanguageMode, translations: Translations | null): string {
    if (!translations) return monthName;
    
    let normalizedKey = monthName.toUpperCase()
      .replace(/\s*\(LEAP\)/g, '')
      .replace(/_LEAP/g, '')
      .trim();

    if (normalizedKey === 'ENGA') {
      normalizedKey = 'INGA';
    } else if (normalizedKey === 'ENGEN') {
      normalizedKey = 'INGEN';
    } else if (normalizedKey === 'PHAIREL') {
      normalizedKey = 'PHAIREN';
    }

    const trans = translations.months[normalizedKey];
    if (!trans) {
      return monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();
    }

    const hasLeap = monthName.toUpperCase().includes('LEAP');
    const baseEngName = normalizedKey.charAt(0).toUpperCase() + normalizedKey.slice(1).toLowerCase();

    if (mode === LanguageMode.MEITEI_MAYEK) {
      return trans.mayek + (hasLeap ? ' (ꯑꯍꯩꯕꯥ)' : '');
    } else if (mode === LanguageMode.BENGALI) {
      return trans.bengali + (hasLeap ? ' (আহৈবা)' : '');
    } else {
      return baseEngName + (hasLeap ? ' (Aheiba)' : '');
    }
  },

  translateWeekday(weekdayName: string, mode: LanguageMode, translations: Translations | null): string {
    if (!translations) return weekdayName;
    const key = weekdayName.toUpperCase();
    const trans = translations.weekdays[key];
    if (!trans) {
      return weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1).toLowerCase();
    }
    return mode === LanguageMode.MEITEI_MAYEK 
      ? trans.mayek 
      : mode === LanguageMode.BENGALI 
        ? trans.bengali 
        : weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1).toLowerCase();
  },

  translateWeekdayShort(weekdayName: string, mode: LanguageMode, translations: Translations | null): string {
    const upper = weekdayName.toUpperCase();
    const englishShort = (() => {
      switch (upper) {
        case 'SUNDAY': return 'Sun';
        case 'MONDAY': return 'Mon';
        case 'TUESDAY': return 'Tue';
        case 'WEDNESDAY': return 'Wed';
        case 'THURSDAY': return 'Thu';
        case 'FRIDAY': return 'Fri';
        case 'SATURDAY': return 'Sat';
        default: return weekdayName.slice(0, 3);
      }
    })();

    if (!translations || mode === LanguageMode.ENGLISH) return englishShort;

    const trans = translations.weekdaysShort?.[upper];
    if (trans) {
      return mode === LanguageMode.MEITEI_MAYEK ? trans.mayek : trans.bengali;
    }

    return englishShort;
  },

  translateDirection(directionName: string, mode: LanguageMode, translations: Translations | null): string {
    if (!translations) return directionName;
    const key = directionName.toUpperCase();
    const trans = translations.directions[key];
    if (!trans) {
      return directionName.charAt(0).toUpperCase() + directionName.slice(1).toLowerCase();
    }
    return mode === LanguageMode.MEITEI_MAYEK 
      ? trans.mayek 
      : mode === LanguageMode.BENGALI 
        ? trans.bengali 
        : directionName.charAt(0).toUpperCase() + directionName.slice(1).toLowerCase();
  },

  getMeiteiYear(gregorianDateStr: string, meiteiMonthName: string): number {
    let year = 2026;
    try {
      year = parseInt(gregorianDateStr.split('-')[0], 10) || 2026;
    } catch {
      year = 2026;
    }
    const normalizedKey = meiteiMonthName.toUpperCase().replace(/\s*\(LEAP\)/g, '').replace(/_LEAP/g, '').trim();
    const isWakchingPhairenLamta = normalizedKey === 'WAKCHING' || normalizedKey === 'PHAIREN' || normalizedKey === 'LAMTA';
    return isWakchingPhairenLamta ? year + 1397 : year + 1398;
  },

  getMeiteiYearLabel(mode: LanguageMode): string {
    switch (mode) {
      case LanguageMode.MEITEI_MAYEK:
        return 'ꯃꯥꯂꯤꯌꯥꯐꯝ ꯄꯥꯂꯆꯥ ꯀꯨꯝꯁꯤꯡ';
      case LanguageMode.BENGALI:
        return 'মালিয়াফম পালচা কুমশিং';
      default:
        return 'Maliyapham Palcha Kumshing';
    }
  }
};
