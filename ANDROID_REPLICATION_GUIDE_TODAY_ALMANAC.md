# Android Implementation Guide: Today Screen & Almanac Redesign

> **Target Audience:** AI Assistant or Mobile Developer working on the native Android edition of the **Manipuri Calendar App** (Kotlin / Jetpack Compose or XML).
> **Scope:** Detailed specifications, visual aesthetics, layout structures, astrological rules, and state logic fixes implemented in the PWA for the **Today Screen** and **Almanac Screen (Tatnaba & Maikei)**. *(Info/About Screen is intentionally excluded).*

---

## Table of Contents
1. [Core Design Philosophy & Universal Standards](#1-core-design-philosophy--universal-standards)
2. [Today Screen Specifications](#2-today-screen-specifications)
   - [2.1 Visual Hierarchy & Hero Section](#21-visual-hierarchy--hero-section)
   - [2.2 Time-Period Dynamic Greeting (Meitei Salai Triad)](#22-time-period-dynamic-greeting-meitei-salai-triad)
   - [2.3 Moon Graphic Safety & Rendering](#23-moon-graphic-safety--rendering)
   - [2.4 Today Occasions & Upcoming Events Countdown](#24-today-occasions--upcoming-events-countdown)
   - [2.5 2-Column Month Guidelines Tile](#25-2-column-month-guidelines-tile)
3. [Almanac Screen: Tatnaba Sub-Tab](#3-almanac-screen-tatnaba-sub-tab)
   - [3.1 2-Column Zero-Scroll Directory](#31-2-column-zero-scroll-directory)
   - [3.2 Current Month Badge Rules](#32-current-month-badge-rules)
   - [3.3 Astrological Guidance Proverb (Exact Translations)](#33-astrological-guidance-proverb-exact-translations)
4. [Almanac Screen: Maikei Sub-Tab (Celestial Compass)](#4-almanac-screen-maikei-sub-tab-celestial-compass)
   - [4.1 Astrolabe Compass Specifications](#41-astrolabe-compass-specifications)
   - [4.2 Authentic Manipuri Direction Names as Hero](#42-authentic-manipuri-direction-names-as-hero)
   - [4.3 Polar Coordinate Geometry & Needle Physics](#43-polar-coordinate-geometry--needle-physics)
   - [4.4 Horizontal Scrolling Month Carousel](#44-horizontal-scrolling-month-carousel)
   - [4.5 Directional Astrological Insight Card](#45-directional-astrological-insight-card)
5. [Critical Logic Fix: Year Change & Month Selection](#5-critical-logic-fix-year-change--month-selection)
   - [5.1 The Defect (What was wrong)](#51-the-defect-what-was-wrong)
   - [5.2 Correct State Machine Logic](#52-correct-state-machine-logic)
6. [Data Dictionaries & Exact Multilingual Mappings](#6-data-dictionaries--exact-multilingual-mappings)
   - [6.1 Traditional Meitei Months Sequence](#61-traditional-meitei-months-sequence)
   - [6.2 Traditional 4 Seasons (*Kum*)](#62-traditional-4-seasons-kum)
   - [6.3 Meitei Year Calculation](#63-meitei-year-maliyapham-palcha-kumshing-calculation)
   - [6.4 Critical Festival & Commemoration Rules (Do Not Merge)](#64-critical-festival--commemoration-rules-do-not-merge)

---

## 1. Core Design Philosophy & Universal Standards

1. **Manipuri Heritage First:** The Manipuri Lunar Date, Meitei Mayek script, and traditional astronomical terms are the heroes of the UI. Gregorian dates and Western cardinal directions serve as secondary navigational anchors.
2. **Zero-Scroll Viewport Fit:** On standard phone screens (400–430dp wide, 800–900dp tall), both the **Today** screen and the **Tatnaba** directory must fit entirely within the viewport without requiring vertical scrolling on ordinary days.
3. **Touch Target Standard:** All interactive month selectors and directory rows have a minimum touch target height of **46dp** (Apple & Material Design accessibility standard).
4. **Color Tokens:**
   - **Primary Brand / Meitei Red:** Deep Crimson Rose (`#881B24` to `#BE123C`).
   - **Inauspicious Warning / Alert:** Vivid Rose/Red (`#E11D48` / `#991B1B`).
   - **Auspicious / Active Highlights:** Warm Amber Gold (`#F59E0B` / `#D97706`).
   - **Backgrounds:** Clean neutral canvas with soft gradient tinting (`bg-rose-50/40` in light mode, `bg-gray-900/95` in dark mode).

---

## 2. Today Screen Specifications

### 2.1 Visual Hierarchy & Hero Section
The Today screen structure prioritizes lunar data over the Gregorian calendar:

```
+-------------------------------------------------------------+
| Dynamic Greeting (e.g., Ayukki Salan)  · Current Time       |
+-------------------------------------------------------------+
| HERO CARD:                                                  |
| [LUNAR NUMERAL (Hero 52sp)]       [MOON GRAPHIC (48dp)]     |
| Month Name (e.g., Mera / ꯃꯦꯔꯥ)      Phase (e.g., Hinggatha)   |
| 3424 Maliyapham Palcha Kumshing   Observance (Purnima/Thasi)|
|                                                             |
| Secondary Docked Bar:                                       |
| Gregorian: Thursday, 15 Oct 2026                            |
+-------------------------------------------------------------+
| OCCASIONS & COUNTDOWN (Compact Strip):                      |
| [⭐ Today: Festival Badge]  [⏳ In 3 Days: Ningol Chakkouba]   |
+-------------------------------------------------------------+
| THIS MONTH'S ASTROLOGICAL GUIDELINES (2 Columns, 50/50):     |
| [⚡ Tatnaba Days: Wed, Fri]  [🧭 Thasi Maikei: North-East]   |
+-------------------------------------------------------------+
```

### 2.2 Time-Period Dynamic Greeting (Meitei Salai Triad)
Calculate the greeting based on local 24-hour time using the three divine solar periods (**Mangang**, **Luwang**, **Khuman**), with a **5:00 PM (17:00)** evening cutoff:

| Period | Time Window | Meitei Mayek | Bengali Script | English Transliteration | Context / Meaning |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Morning** | **04:00 – 11:59** | `ꯃꯪꯉꯥꯡ ꯄꯨꯟꯁꯤꯕ` | `মঙাং পুনশিবা` | **Mangang Punsiba** | Morning blessing (Rising sun) |
| **Afternoon** | **12:00 – 16:59** *(until 5:00 PM)* | `ꯂꯨꯋꯥꯡ ꯄꯨꯟꯁꯤꯕ` | `লুৱাং পুনশিবা` | **Luwang Punsiba** | Afternoon blessing (Zenith sun) |
| **Evening & Night** | **17:00 – 03:59** *(after 5:00 PM)* | `ꯈꯨꯃꯥꯟ ꯄꯨꯟꯁꯤꯕ` | `খুমান পুনশিবা` | **Khuman Punsiba** | Evening & Night blessing (Setting sun & night) |

- **Header Title:** `Khurumjari` (`ꯈꯨꯔꯨꯝꯖꯔꯤ` / `খুরুমজরি`)
- **Subtitle Blessing:** `Greeting of peace and longevity` (`ꯏꯪ-ꯆꯤꯛꯄ ꯑꯃꯁꯨꯡ ꯄꯨꯟꯁꯤ ꯁꯥꯡꯕꯒꯤ ꯈꯨꯔꯨꯝꯖꯔꯤ` / `শান্তি ও দীর্ঘায়ুর শুভেচ্ছা`)

```kotlin
// Android / Kotlin Implementation:
val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
val (periodMayek, periodEng) = when {
    hour < 12 -> "ꯃꯪꯉꯥꯡ ꯄꯨꯟꯁꯤꯕ" to "Mangang Punsiba"  // Morning (until 12:00 PM)
    hour < 17 -> "ꯂꯨꯋꯥꯡ ꯄꯨꯟꯁꯤꯕ" to "Luwang Punsiba"   // Afternoon (12:00 PM - 5:00 PM)
    else -> "ꯈꯨꯃꯥꯟ ꯄꯨꯟꯁꯤꯕ" to "Khuman Punsiba"         // Evening & Night (5:00 PM onwards)
}
```

### 2.3 Moon Graphic Safety & Rendering
- **Null-Safety Guard:** Never assume `phase` or `observance` strings are non-null. Normalize safely with `(phase ?: "").lowercase().trim()`.
- **Phases:**
  - `waxing` / `shukla paksha`: Crescent illuminated on right.
  - `waning` / `krishna paksha`: Crescent illuminated on left.
  - `full_moon` / `purnima`: Full golden illuminated orb.
  - `new_moon` / `thasi`: Dark slate celestial disc with delicate ring.

### 2.4 Today Occasions & Upcoming Events Countdown
- **Today Occasion Card:** If today has festivals/observances, show an occasion card (`bg-rose-500/10 text-rose-800`).
- **Upcoming Events Countdown:**
  - **Header Language Rule:** Keep strictly in English across all language modes: **`UPCOMING EVENTS COUNTDOWN`** (Mobile) / **`UPCOMING EVENTS`** (Desktop). Do **not** translate this header.
  - **Data Calculation Rule:**
    - Search forward from today across available loaded calendar days.
    - Merge **both `day.festivals` and `day.events`** for each day.
    - **CRITICAL EXCLUSION:** Filter out and exclude **`2nd_saturday`** (`id != "2nd_saturday"`). Recurring bank holidays must not clutter the cultural events countdown.
    - Deduplicate events by ID and sort chronologically by `daysRemaining`.
  - **Card Display:**
    - Countdown Badge: `TODAY` (if 0 days), `TOMORROW` (if 1 day), `IN {N} DAYS` (if $\ge 2$ days). Red badge if $\le 3$ days, rose badge if $> 3$ days.
    - Category Tag: `Holiday` or `event.category` (e.g. `ritual`, `commemoration`).
    - Event Name (truncated to 1 line).
    - Footer: Gregorian date (e.g., `Oct 19`) & Meitei lunar date (e.g., `Mera 8`).
    - Tap Action: Navigates directly to that day's detail screen.

### 2.5 2-Column Month Guidelines Tile
Instead of stacking Tatnaba and Thasi Maikei in tall vertical rows that force the screen to scroll, render them in a **side-by-side 2-column card**:
- **Left Column (Tatnaba):**
  - Icon: ⚡ Lightning bolt.
  - Label: `Tatnaba / ꯇꯥꯠꯅꯥꯕꯥ`.
  - Content: Comma-separated list of weekdays for the active month (e.g. `Wed, Fri` or `None` if empty).
- **Right Column (Thasi Maikei):**
  - Icon: 🧭 Compass.
  - Label: `Thasi Maikei / ꯊꯥꯁꯤ ꯃꯥꯏꯀꯩ`.
  - Content: Direction name + cardinal abbreviation (e.g. `Chingkhei · NE`).

---

## 3. Almanac Screen: Tatnaba Sub-Tab

### 3.1 2-Column Zero-Scroll Directory
Replace any single-column 12-row scrollable list with a **2-column grid (6 rows each)**:

```
[ Year Navigator:  <  3424 (2026-27)  >  ]

COLUMN 1 (Months 01 - 06)       COLUMN 2 (Months 07 - 12)
+---------------------------+   +---------------------------+
| 01 Sajibu         ⚡ Tue  |   | 07 Mera [CURRENT]  ⚡ Fri  |
| 02 Kalen          ⚡ None |   | 08 Hiyangei        ⚡ Mon |
| 03 Inga           ⚡ Thu  |   | 09 Poinu           ⚡ None|
| 04 Ingen          ⚡ Sun  |   | 10 Wakching        ⚡ Wed |
| 05 Thawan         ⚡ Wed  |   | 11 Phairen         ⚡ Sat |
| 06 Langban        ⚡ None |   | 12 Lamta           ⚡ Sun |
+---------------------------+   +---------------------------+

[ TRADITIONAL WARNING PROVERB BANNER ]
```

- Each tile height: `min-height = 46dp`.
- Left side: 2-digit index (e.g. `01`, `07`) + Month name + optional `CURRENT` badge.
- Right side: Tatnaba weekday name(s) in bold red (`text-red-600`), or muted gray if `None`.

### 3.2 Current Month Badge Rules
**CRITICAL:** The `CURRENT` (`চলতি` / `ꯉꯁꯤ`) badge must **ONLY** be displayed when:
```kotlin
val isCurrentCalendarMonth = (selectedMeiteiYear == currentActiveMeiteiYear) 
    && (monthName.equals(todayDay.month, ignoreCase = true))
```
When the user browses to any other year (e.g., 3423 or 3425), **no month row must show the CURRENT badge**.

### 3.3 Astrological Guidance Proverb (Exact Translations)
At the bottom of the Tatnaba directory, render this warning card with exact traditional wording:

- **Meitei Mayek:**
  `ꯇꯥꯠꯅꯥꯕꯥ ꯅꯨꯃꯤꯠ ꯇꯥ ꯑꯐꯕ ꯊꯕꯛ ꯇꯧꯕ ꯐꯠꯇꯦ`
- **Bengali Script:**
  `তৎনবা নুমিত্তা অফবা থবক তৌবা ফত্তে`
- **English Subtitle:**
  `Traditional Astrological Guidance: Avoid embarking on auspicious ventures on Tatnaba days.`

---

## 4. Almanac Screen: Maikei Sub-Tab (Celestial Compass)

### 4.1 Astrolabe Compass Specifications
The compass is modeled after a celestial astrolabe. Do not use generic solid circles. Implement these concentric vector layers:

1. **Outer Bezel Ring:** Radius = 114 (Stroke width = 1.5dp, border color).
2. **Outer Accent Ring:** Radius = 110 (Stroke width = 0.5dp, hairline opacity).
3. **Text Track Area:** Radius = 92 (Where the dual-tier direction labels sit).
4. **Astrolabe Dashed Hairline Ring:** Radius = 74 (Stroke width = 1dp, dashed: `strokeDasharray = [2.5, 3.5]`).
5. **Inner Boundary Ring:** Radius = 64 (Stroke width = 0.5dp, dashed: `strokeDasharray = [1, 3]`).
6. **Needle Safety Area:** Length = 58–60 (Completely contained inside the inner boundary, never overlaps text).

### 4.2 Authentic Manipuri Direction Names as Hero
At all 8 compass dial points, display **authentic Manipuri direction names as the primary label**, with the cardinal abbreviation as secondary:

| Key | Polar Angle (deg) | Needle Angle (deg) | Manipuri Name (Romanized) | Meitei Mayek | Bengali Script | Cardinal |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `AWANG` | `270°` (Top) | `0°` (North) | **Awang** | `ꯑꯋꯥꯡ` | `অৱাং` | `N` |
| `CHINGKHEI` | `315°` (Top-Right) | `45°` (North-East) | **Chingkhei** | `ꯆꯤꯡꯈꯩ` | `চিংখৈ` | `NE` |
| `NONGPOK` | `0°` (Right) | `90°` (East) | **Nongpok** | `ꯅꯣꯡꯄꯣꯛ` | `নোংপোক` | `E` |
| `MEIRAM` | `45°` (Bottom-Right) | `135°` (South-East) | **Meiram** | `ꯃꯩꯔꯝ` | `মৈরম` | `SE` |
| `KHA` / `MAKHA` | `90°` (Bottom) | `180°` (South) | **Kha** | `ꯈꯥ` | `খা` | `S` |
| `SANTHONG` | `135°` (Bottom-Left) | `225°` (South-West) | **Santhong** | `ꯁꯥꯟꯊꯣꯡ` | `সান্থোং` | `SW` |
| `NONGCHUP` | `180°` (Left) | `270°` (West) | **Nongchup** | `ꯅꯣꯡꯆꯨꯞ` | `নোংচুপ` | `W` |
| `KOUBRU` | `225°` (Top-Left) | `315°` (North-West) | **Koubru** | `ꯀꯧꯕ꯭ꯔꯨ` | `কৌব্রু` | `NW` |

#### Dual-Tier Text Formatting (Jetpack Compose / SVG):
- **Line 1 (Manipuri Hero):** Font size `9.5sp`, weight `Bold` (or `ExtraBold` for target), color: Ruby Rose (`#9F1239`) when target, Muted Slate (`#64748B`) when inactive.
- **Line 2 (Cardinal Subscript):** Font size `7sp`, weight `Bold`, color: Rose (`#E11D48`) when target, Gray (`#94A3B8`) when inactive.

### 4.3 Polar Coordinate Geometry & Needle Physics
- **Center:** `cx = 120, cy = 120` (in a 240×240 viewport).
- **Dot Position:**
  $$\text{dotX} = cx + 74 \cdot \cos\left(\frac{\text{polarAngle} \cdot \pi}{180}\right)$$
  $$\text{dotY} = cy + 74 \cdot \sin\left(\frac{\text{polarAngle} \cdot \pi}{180}\right)$$
- **Target Dot Highlight:**
  - Outer glowing halo: Circle with radius `7.5dp`, stroke `1.5dp` in `#F43F5E`, fill with 20% opacity.
  - Inner core dot: Circle with radius `3.5dp` in `#E11D48`.
- **Inactive Dot:** Single solid circle with radius `2dp` in `#CBD5E1`.
- **Needle Styling:**
  - Two-tone specular faceted polygon pointing North (`0,-58` to `-3.6,0` to `0,-2` in dark ruby `#9F1239`; and `0,-58` to `3.6,0` to `0,-2` in light rose `#F43F5E`).
  - Counterweight pointing South (`0,28` to `±3.6,0` in slate `#475569` and `#94A3B8`).
  - Center brass jewel: Radius `6dp` in amber `#FBBF24` with stroke `#D97706`, plus center white pearl bead radius `2.5dp`.
- **Spring Physics Animation:**
  - Rotate needle by `needleAngle`.
  - Use spring specs: `stiffness = 90f`, `damping = 13f`.

### 4.4 Horizontal Scrolling Month Carousel
Directly beneath the compass, render a horizontal snapping carousel:
- Filter out leap months (`!monthName.contains("LEAP")`).
- Each item: `[Index (01)] [Month Name] [Optional 'Now' Badge]`.
- Clicking a month selects it and rotates the compass needle to that month's `thasiMaikei`.
- **Auto-scroll:** On tab switch or selection, scroll smoothly to center the selected month in the visible track.

### 4.5 Directional Astrological Insight Card
Directly beneath the carousel, show the warning insight card:
- Left: 🧭 Compass icon in rose rounded box.
- Title: `{Direction Native} · {Direction English}` + `[Inauspicious]` badge.
- Explanation Text:
  - English: `Where the new moon resides. Journeys directed towards {Direction English} are ill-omened in {Month Name}.`
  - Meitei Mayek: `{Month Name} ꯊꯥꯁꯤꯗ ꯃꯥꯏꯀꯩ ꯑꯁꯤꯗ ꯈꯣꯡꯆꯠ ꯆꯠꯂꯣꯏꯗꯕꯅꯤ꯫`
  - Bengali: `{Month Name} মাসে এই দিকে যাত্রা ও শুভ কাজ বর্জনীয়।`

---

## 5. Critical Logic Fix: Year Change & Month Selection

### 5.1 The Defect (What was wrong)
In the previous implementation, the month sync listener was triggered on every year change and unconditionally searched for today's month (`todayDay.month`, which is `Mera` in the current year 3424). Because every year has a month named `Mera`, changing the year to 3423 or 3425 was **forcefully resetting the selected month to Mera (Month 07)**. This made it impossible to browse other years from the beginning and caused confusing UI jumps.

### 5.2 Correct State Machine Logic
Implement this exact decision logic when `selectedMeiteiYear` changes:

```kotlin
// When month configs are loaded for the selected year:
fun onYearConfigsLoaded(sortedMonths: List<String>, selectedMeiteiYear: Int, currentActiveMeiteiYear: Int, todayMonth: String) {
    if (sortedMonths.isEmpty()) return

    val isCurrentYear = (selectedMeiteiYear == currentActiveMeiteiYear)

    if (isCurrentYear) {
        // CASE 1: In the CURRENT calendar year -> Focus on today's active month (e.g., Mera)
        val matchingTodayMonth = sortedMonths.find { it.equals(todayMonth, ignoreCase = true) }
        val activeMonth = matchingTodayMonth ?: sortedMonths.first()
        setSelectedMonth(activeMonth)
        setSelectedDirection(monthConfigs[activeMonth]?.thasiMaikei ?: "CHINGKHEI")
    } else {
        // CASE 2: In a DIFFERENT year -> ALWAYS start at Month 01 (Sajibu)
        // DO NOT jump to today's month of a different year!
        val firstMonth = sortedMonths.first()
        setSelectedMonth(firstMonth)
        setSelectedDirection(monthConfigs[firstMonth]?.thasiMaikei ?: "CHINGKHEI")
    }
}
```

#### User Navigation Rules:
1. When user **switches tabs** (e.g. from Tatnaba to Maikei, or Today to Almanac):
   - Reset `selectedMeiteiYear = currentActiveMeiteiYear`.
   - Reset `selectedMonth = todayDay.month`.
2. When user **manually taps a different month** within the same year (e.g. tapping `Langban` in 3425):
   - Keep `Langban` selected. Update compass direction to `monthConfigs["Langban"].thasiMaikei`.
3. When user **changes year** using `<` or `>`:
   - If moving to a non-current year $\to$ Set month to **Month 01 (`Sajibu`)**.
   - If returning to `currentActiveMeiteiYear` $\to$ Refocus on **today's month (`todayDay.month`)**.

---

## 6. Data Dictionaries & Exact Multilingual Mappings

### 6.1 Traditional Meitei Months Sequence

| Index | Base Name | Meitei Mayek | Bengali Script |
| :---: | :--- | :--- | :--- |
| `01` | **Sajibu** | `ꯁꯥꯖꯤꯕꯨ` | `সাজিবু` |
| `02` | **Kalen** | `ꯀꯥꯂꯦꯟ` | `কালেন` |
| `03` | **Inga** | `ꯏꯉꯥ` | `ইঙা` |
| `04` | **Ingen** | `ꯏꯉꯦꯟ` | `ইঙেন` |
| `05` | **Thawan** | `ꯊꯥꯋꯥꯟ` | `থাৱান` |
| `06` | **Langban** | `ꯂꯥꯡꯕꯥꯟ` | `লাংবান` |
| `07` | **Mera** | `ꯃꯦꯔꯥ` | `মেরা` |
| `08` | **Hiyangei** | `ꯍꯤꯌꯥꯡꯒꯩ` | `হিয়াঙ্গৈ` |
| `09` | **Poinu** | `ꯄꯣꯏꯅꯨ` | `পোইনু` |
| `10` | **Wakching** | `ꯋꯥꯛꯆꯤꯡ` | `ৱাকচিং` |
| `11` | **Phairen** | `ꯐꯥꯏꯔꯦꯟ` | `ফাইরেন` |
| `12` | **Lamta** | `ꯂꯝꯇꯥ` | `লমতা` |

### 6.2 Traditional 4 Seasons (*Kum*)

| Season Key | Normalized Months | Meitei Mayek | Bengali Script | English |
| :--- | :--- | :--- | :--- | :--- |
| `Yenningtha` | `Phairen`, `Lamta`, `Sajibu` | `🌸 ꯌꯦꯟꯅꯤꯡꯊꯥ` | `🌸 য়েন্নিংথা` | Spring |
| `Kalentha` | `Kalen`, `Inga`, `Ingen` | `☀️ ꯀꯥꯂꯦꯟꯊꯥ` | `☀️ কালেনথা` | Summer |
| `Nakentha` | `Thawan`, `Langban`, `Mera` | `🍁 ꯅꯥꯀꯦꯟꯊꯥ` | `🍁 নাকেনথা` | Autumn |
| `Ningthamtha` | `Hiyangei`, `Poinu`, `Wakching` | `❄️ ꯅꯤꯡꯊꯝꯊꯥ` | `❄️ নিংথমথা` | Winter |

### 6.3 Meitei Year (Maliyapham Palcha Kumshing) Calculation
Given a Gregorian year $Y$ and Meitei month:
```kotlin
fun getMeiteiYear(gregorianYear: Int, meiteiMonth: String): Int {
    val norm = meiteiMonth.uppercase().replace("(LEAP)", "").trim()
    // Wakching, Phairen, and Lamta cross into the Gregorian new year
    val isLaterPart = (norm == "WAKCHING" || norm == "PHAIREN" || norm == "LAMTA")
    return if (isLaterPart) gregorianYear + 1397 else gregorianYear + 1398
}
```
*(Example: For Gregorian October 2026, Month Mera: $2026 + 1398 = 3424\text{ MPK}$)*.

### 6.4 Critical Festival & Commemoration Rules (Do Not Merge)

1. **Bor Numit (ID: `bor_numit`):**
   - **Name:** `"Bor Numit"` *(NEVER prefix with "Mera" — "Mera Bor Numit" is incorrect)*.
   - **Date:** Fixed Meitei Lunar Date: **Mera 8**.
   - **Category:** `ritual`, **`isHoliday: false`**.
   - **Description:** Day of receiving blessings (Bor) during Durga Puja festivities.

2. **Kwak Tanba (ID: `kwak_tanba`):**
   - **Name:** `"Kwak Tanba"` *(Do NOT merge with Police Day)*.
   - **Date:** Fixed Meitei Lunar Date: **Mera 10** (*Meragi Tarani-ni*).
   - **Category:** `ritual`, **`isHoliday: false`** *(Cultural ritual, not a holiday)*.
   - **Description:** Ancient Meitei ritual of releasing crows (Kwak) at the Kangla sanctuary on Dussehra.

3. **Manipur Police Day (ID: `manipur_police_day`):**
   - **Name:** `"Manipur Police Day"`.
   - **Date:** **Fixed Gregorian Date: October 19 (`10-19`)** *(Never calculate from Meitei lunar date)*.
   - **Category:** `commemoration`, **`isHoliday: false`**.
   - **Description:** Raising Day of Manipur Police, constituted on 19th October 1891.

