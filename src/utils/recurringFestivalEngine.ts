import { CalendarDay } from '../types';

/**
 * Automatically enriches CalendarDay items with fixed Gregorian, fixed Meitei lunar,
 * and weekday-calculated recurring festivals and solemn memorial/cultural events.
 * Solemn observances (e.g. Black Day May 3, Great June Uprising Day, Puya Meithaba)
 * are classified as EVENTS (Memorials/Observances), NOT Festivals.
 */

const FIXED_GREGORIAN_FESTIVALS: Record<string, string[]> = {
  '01-01': ['new_year'],
  '01-26': ['republic_day'],
  '02-15': ['lui_ngai_ni'],
  '04-14': ['goura_cheiraoba'], // Charak Puja / Goura Cheiraoba
  '04-23': ['khongjom_day'],
  '05-01': ['may_day'],
  '08-13': ['patriot_day'],
  '08-15': ['independence_day'],
  '09-17': ['vishwakarma_puja'],
  '09-30': ['irabot_day'],
  '10-02': ['gandhi_jayanti'],
  '11-01': ['kut'], // Chavang Kut (State Holiday)
  '12-12': ['nupi_lan'],
  '12-25': ['christmas']
};

const FIXED_GREGORIAN_EVENTS: Record<string, string[]> = {
  '01-09': ['ningthou_gambhir_leikhidaba'],
  '01-14': ['driver_day'],
  '01-21': ['state_hood_day'],
  '01-29': ['shiri_krishna_leikhidaba_numit'],
  '01-30': ['gandhi_leilhidaba_numit'],
  '02-14': ['valentine_day'],
  '02-17': ['rani_gaiding_lui_leikhidaba'],
  '02-25': ['sanaroi_singi_numit'],
  '04-01': ['april_fool'],
  '04-11': ['nara_singh_leikhidaba'],
  '04-15': ['silhenba_sakapda_1948_houba'],
  '05-03': ['black_day'], // May 3, 2023 Memorial Commemoration (NOT a festival)
  '05-12': ['nurses_day'],
  '06-05': ['world_environment_day'],
  '06-18': ['jun_18'], // Great June Uprising Day / Manipur Integrity Memorial (NOT a festival)
  '06-20': ['laininghel_fullo_leikhidaba'],
  '07-01': ['doctors_day'],
  '08-06': ['hirosima_numit'],
  '08-09': ['nagashakhi_numit'],
  '08-14': ['manipur_independence_day'],
  '08-20': ['meitei_longi_numit'],
  '08-27': ['chaklam_khongchat'],
  '08-29': ['hai_pou_jadonang_leikhidaba_numit'],
  '09-03': ['laininghal_fullo_pokpa'],
  '09-05': ['teachers_day'],
  '10-19': ['manipur_police_day'],
  '10-24': ['u_n_day'],
  '11-14': ['childrens_day'],
  '12-31': ['bye_bye']
};

const FIXED_MEITEI_FESTIVALS: Record<string, string[]> = {
  'WAKCHING_13': ['gaan_ngai'],
  'PHAIREN_5': ['swrasati_puja'],
  'PHAIREN_29': ['sivarati'],
  'LAMTA_15': ['yaoshang_meithaba'],
  'LAMTA_16': ['pechakari'],
  'LAMTA_20': ['hallangkar'],
  'LAMTA_28': ['baruni_chingoi_lruppa'],
  'SAJIBU_1': ['cheiraoba'],
  'SAJIBU_9': ['ram_navami'],
  'SAJIBU_15': ['hanuman_pokpa'],
  'INGEN_2': ['kang_chingba'],
  'INGEN_10': ['kanglen'],
  'INGEN_15': ['guru_prunima'],
  'THAWAN_15': ['raksha_bandhan'],
  'THAWAN_23': ['krishna_jarma'],
  'LANGBAN_11': ['heikru_hidongba'],
  'MERA_1': ['mera_chouren_houba'],
  'MERA_7': ['durga_puja'],
  'MERA_8': ['bor_numit'],
  'MERA_15': ['mera_hou_chongba'],
  'MERA_30': ['diwali'],
  'HIYANGEI_1': ['gorbardhan_puja'],
  'HIYANGEI_2': ['ningol_chakouba_numit'],
  'POINU_12': ['imoinu_iratpa']
};

const FIXED_MEITEI_EVENTS: Record<string, string[]> = {
  'WAKCHING_15': ['ayang_leima_kabok_chaiba'],
  'PHAIREN_4': ['ganesh_puja'],
  'LAMTA_7': ['shree_govhindagi_holi_houba_numit'],
  'SAJIBU_7': ['kongba_laithong_fatpa'],
  'KALEN_9': ['sita_navami'],
  'KALEN_15': ['jatra_kali'],
  'INGA_10': ['ganga_puja'],
  'INGA_14': ['mahadev_lalhou_katpa'],
  'INGA_15': ['sanamahi_cheng_haiba'],
  'INGEN_8': ['luxmi_keithel_kaba'],
  'INGEN_12': ['ningol_palli'],
  'INGEN_20': ['nag_pamchami'],
  'LANGBAN_4': ['ganesh_chaturdhashi'],
  'LANGBAN_8': ['radha_jarma'],
  'LANGBAN_12': ['braman_janama'],
  'LANGBAN_16': ['tarpan_houba'],
  'LANGBAN_30': ['tarpan_loiba'],
  'MERA_10': ['kwak_tanba'],
  'MERA_17': ['meitei_puya_meithaba'], // Puya Meithaba Memorial Day (NOT a festival)
  'HIYANGEI_8': ['san_senba'],
  'HIYANGEI_12': ['tulsi_bhiva_hari_uthan'],
  'HIYANGEI_15': ['mera_wa_fukpa']
};

function normalizeMonth(month: string): string {
  const upper = month.trim().toUpperCase();
  if (upper === 'FAYREN') return 'PHAIREN';
  if (upper === 'LAMDA') return 'LAMTA';
  return upper;
}

export function enrichDaysWithFestivals(days: CalendarDay[]): CalendarDay[] {
  if (!days || days.length === 0) return [];

  // Pre-calculate Lamta Saturdays for Saroi Khangba (first and last Saturday in Lamta)
  const lamtaSaturdays: string[] = [];
  for (const day of days) {
    if (normalizeMonth(day.month) === 'LAMTA') {
      const parts = day.gregorian.split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      if (d.getDay() === 6) {
        lamtaSaturdays.push(day.gregorian);
      }
    }
  }
  const firstLamtaSat = lamtaSaturdays.length > 0 ? lamtaSaturdays[0] : null;
  const lastLamtaSat = lamtaSaturdays.length > 1 ? lamtaSaturdays[lamtaSaturdays.length - 1] : null;

  return days.map((day) => {
    const addedFestivals: string[] = [];
    const addedEvents: string[] = [];

    // 1. Fixed Gregorian rule
    const mmDd = day.gregorian.length >= 10 ? day.gregorian.substring(5, 10) : '';
    if (FIXED_GREGORIAN_FESTIVALS[mmDd]) {
      addedFestivals.push(...FIXED_GREGORIAN_FESTIVALS[mmDd]);
    }
    if (FIXED_GREGORIAN_EVENTS[mmDd]) {
      addedEvents.push(...FIXED_GREGORIAN_EVENTS[mmDd]);
    }

    // 2. Fixed Meitei Lunar rule
    const normMonth = normalizeMonth(day.month);
    for (const d of day.day) {
      const key = `${normMonth}_${d}`;
      if (FIXED_MEITEI_FESTIVALS[key]) {
        addedFestivals.push(...FIXED_MEITEI_FESTIVALS[key]);
      }
      if (FIXED_MEITEI_EVENTS[key]) {
        addedEvents.push(...FIXED_MEITEI_EVENTS[key]);
      }
    }

    // 3. Calendar Weekday Rules
    try {
      const parts = day.gregorian.split('-').map(Number);
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      const dayOfMonth = date.getDate();
      const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat
      const monthValue = parts[1]; // 1..12

      if (dayOfWeek === 6) {
        // 2nd Saturday Bank Holiday (days 8..14)
        if (dayOfMonth >= 8 && dayOfMonth <= 14) {
          addedFestivals.push('2nd_saturday');
        }
        // Saroi Khangba (First and Last Saturday of Lamta)
        if (day.gregorian === firstLamtaSat || day.gregorian === lastLamtaSat) {
          addedFestivals.push('saroi_khangba');
        }
      } else if (dayOfWeek === 0) {
        // Mother's Day: 2nd Sunday of May (May 8..14)
        if (monthValue === 5 && dayOfMonth >= 8 && dayOfMonth <= 14) {
          addedEvents.push('mothers_day');
        }
        // Father's Day: 3rd Sunday of June (June 15..21)
        if (monthValue === 6 && dayOfMonth >= 15 && dayOfMonth <= 21) {
          addedEvents.push('world_yoga_day_fathers_day');
        }
      }
    } catch (_) {}

    const curFestivals = day.festivals || [];
    const curEvents = day.events || [];

    // Distinct merged festivals
    const mergedFestivals = Array.from(new Set([...curFestivals, ...addedFestivals]));
    
    // Distinct merged events, filtering out anything already classified as a festival
    const mergedEvents = Array.from(new Set([...curEvents, ...addedEvents]))
      .filter((id) => !mergedFestivals.includes(id));

    return {
      ...day,
      festivals: mergedFestivals,
      events: mergedEvents
    };
  });
}
