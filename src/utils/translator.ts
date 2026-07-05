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
    
    // Check if it is a leap month, e.g. "Wakching (Leap)" or containing "(Leap)"
    const isLeap = monthName.toUpperCase().includes('LEAP');
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
      // fallback to capitalized monthName
      return monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();
    }

    if (mode === LanguageMode.MEITEI_MAYEK) {
      return trans.mayek + (isLeap ? ' (ꯂꯤꯞ)' : '');
    } else if (mode === LanguageMode.BENGALI) {
      return trans.bengali + (isLeap ? ' (লীপ)' : '');
    } else {
      return normalizedKey.charAt(0).toUpperCase() + normalizedKey.slice(1).toLowerCase() + (isLeap ? ' (Leap)' : '');
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
    const key = weekdayName.toUpperCase();
    switch (key) {
      case 'SUNDAY':
        if (mode === LanguageMode.MEITEI_MAYEK) return 'ꯅꯣꯡꯃꯥ';
        if (mode === LanguageMode.BENGALI) return 'নোংমা';
        return 'Sun';
      case 'MONDAY':
        if (mode === LanguageMode.MEITEI_MAYEK) return 'ꯅꯤꯡꯊꯧ';
        if (mode === LanguageMode.BENGALI) return 'নিংথৌ';
        return 'Mon';
      case 'TUESDAY':
        if (mode === LanguageMode.MEITEI_MAYEK) return 'ꯂꯩꯄꯥꯛ';
        if (mode === LanguageMode.BENGALI) return 'লৈপাক';
        return 'Tue';
      case 'WEDNESDAY':
        if (mode === LanguageMode.MEITEI_MAYEK) return 'ꯌꯨꯝꯁꯥ';
        if (mode === LanguageMode.BENGALI) return 'যুমশা';
        return 'Wed';
      case 'THURSDAY':
        if (mode === LanguageMode.MEITEI_MAYEK) return 'ꯁꯥꯒꯣꯜ';
        if (mode === LanguageMode.BENGALI) return 'শগোল';
        return 'Thu';
      case 'FRIDAY':
        if (mode === LanguageMode.MEITEI_MAYEK) return 'ꯏꯔꯥꯏ';
        if (mode === LanguageMode.BENGALI) return 'ইরাই';
        return 'Fri';
      case 'SATURDAY':
        if (mode === LanguageMode.MEITEI_MAYEK) return 'ꯊꯥꯡꯖꯥ';
        if (mode === LanguageMode.BENGALI) return 'থাংজা';
        return 'Sat';
      default:
        return weekdayName.slice(0, 3);
    }
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
  }
};
