# Recurring Festivals & Events Reference Guide

This document serves as the master verification scrapbook for recurring festivals, holidays, and observances across both Gregorian and Meitei lunar calendars.

When `calendar_2027.json` (or any future year) is uploaded, use this reference to verify that the dates match the established rules before enabling the automated recurrence engine.

---

## 1. Fixed Gregorian Events (38 Events)
These events occur on the **exact same Gregorian date (`MM-DD`)** every single year.

| Gregorian Date | Event ID | Name | Category / Notes |
| :--- | :--- | :--- | :--- |
| **01-01** | `new_year` | New Year's Day | Festival |
| **01-14** | `driver_day` | Drivers' Day | Memorial / Observance |
| **01-21** | `state_hood_day` | Statehood Day (Manipur) | State Memorial |
| **01-26** | `republic_day` | Republic Day | **National Holiday** |
| **01-29** | `shiri_krishna_leikhidaba_numit` | Shree Krishna Leikhidaba Numit | Observance |
| **01-30** | `gandhi_leilhidaba_numit` | Martyrs' Day (Gandhi Death Anniversary) | Observance |
| **02-14** | `valentine_day` | Valentine's Day | Observance |
| **02-15** | `lui_ngai_ni` | Lui-Ngai-Ni (Seed Sowing Festival) | **State Holiday** |
| **02-17** | `rani_gaiding_lui_leikhidaba` | Rani Gaidinliu Death Anniversary | Memorial |
| **02-25** | `sanaroi_singi_numit` | Players' Day (Sanaroisingee Numit) | State Observance |
| **04-01** | `april_fool` | April Fools' Day | Observance |
| **04-11** | `nara_singh_leikhidaba` | Maharaja Nara Singh Memorial Day | Memorial |
| **04-15** | `silhenba_sakapda_1948_houba` | Silhenba Sakapda Preservation Day | Cultural Observance |
| **04-23** | `khongjom_day` | Khongjom Day | **State Holiday** |
| **05-01** | `may_day` | May Day (International Workers' Day) | **State Holiday** |
| **05-12** | `nurses_day` | International Nurses Day | Global Observance |
| **06-05** | `world_environment_day` | World Environment Day | Global Observance |
| **06-18** | `jun_18` | Great June Uprising (Manipur Integrity Day) | **State Holiday** |
| **06-20** | `laininghel_fullo_leikhidaba` | Laininghal Naoriya Phullo Death Anniversary | Memorial |
| **06-21** | `world_yoga_day_fathers_day` | International Yoga Day & Father's Day | Global Observance |
| **07-01** | `doctors_day` | National Doctors' Day | Observance |
| **08-06** | `hirosima_numit` | Hiroshima Day | Peace Observance |
| **08-09** | `nagashakhi_numit` | Nagasaki Day | Peace Observance |
| **08-13** | `patriot_day` | Patriots' Day | **State Holiday** |
| **08-14** | `manipur_independence_day` | Manipur Independence Day (1947) | Historical Observance |
| **08-15** | `independence_day` | Independence Day | **National Holiday** |
| **08-20** | `meitei_longi_numit` | Meetei Longi Numit (Manipuri Language Day) | Cultural Observance |
| **08-27** | `chaklam_khongchat` | Chaklam Khongchat (Hunger Marchers' Day) | Memorial |
| **08-29** | `hai_pou_jadonang_leikhidaba_numit` | Haipou Jadonang Martyrdom Day | Memorial |
| **09-03** | `laininghal_fullo_pokpa` | Laininghal Naoriya Phullo Birth Anniversary | Memorial |
| **09-05** | `teachers_day` | Teachers' Day | Observance |
| **09-17** | `vishwakarma_puja` | Vishwakarma Puja | Festival |
| **09-30** | `irabot_day` | Irabot Day (Jan Neta Hijam Irabot Day) | **State Holiday** |
| **10-02** | `gandhi_jayanti` | Gandhi Jayanti | **National Holiday** |
| **10-24** | `u_n_day` | United Nations Day | Global Observance |
| **11-14** | `childrens_day` | Children's Day | Observance |
| **12-12** | `nupi_lan` | Nupi Lan Memorial Day | **State Holiday** |
| **12-25** | `christmas` | Christmas | **State Holiday** |
| **12-31** | `bye_bye` | New Year's Eve | Observance |

---

## 2. Fixed Meitei Lunar Month & Day Events (48 Events)
These events occur on the **exact same Meitei Month and lunar Day number** every year.

| Meitei Date | Event ID | Name | Category / Notes |
| :--- | :--- | :--- | :--- |
| **WAKCHING 13** | `gaan_ngai` | Gaan-Ngai (Chakan Gaan-Ngai) | **State Holiday** |
| **WAKCHING 15** | `ayang_leima_kabok_chaiba` | Ayang Leima Kabok Chaiba | Ritual / Full Moon |
| **WAKCHING 21** | `ningthou_gambhir_leikhidaba` | Maharaja Gambhir Singh Death Anniversary | Memorial |
| **PHAIREN 4** | `ganesh_puja` | Ganesh Puja (Magha) | Festival |
| **PHAIREN 5** | `swrasati_puja` | Saraswati Puja (Vasant Panchami) | **State Holiday** |
| **PHAIREN 29** | `sivarati` | Maha Shivaratri | **State Holiday** |
| **LAMTA 7** | `shree_govhindagi_holi_houba_numit` | Shree Govindaji Holi Houba Numit | Temple Ritual |
| **LAMTA 15** | `yaoshang_meithaba` | Yaoshang (Holi) Meithaba | **State Holiday** |
| **LAMTA 16** | `pechakari` | Pechakari Day (Yaoshang 2nd Day) | **State Holiday** |
| **LAMTA 20** | `hallangkar` | Halangkar (Holi Finale) | Festival |
| **LAMTA 28** | `baruni_chingoi_lruppa` | Baruni Ching Kaba (Holy Pilgrimage) | **State Holiday** |
| **SAJIBU 1** | `cheiraoba` | Sajibu Nongma Panba (Cheiraoba) | **State Holiday** |
| **SAJIBU 7** | `kongba_laithong_fatpa` | Kongba Laithong Phatpa | Traditional Oracle |
| **SAJIBU 9** | `ram_navami` | Ram Navami | Festival |
| **SAJIBU 15** | `hanuman_pokpa` | Hanuman Jayanti | Festival |
| **SAJIBU 27** | `goura_cheiraoba` | Goura Cheiraoba | Traditional Festival |
| **KALEN 9** | `sita_navami` | Sita Navami | Festival |
| **KALEN 15** | `jatra_kali` | Jatra Kali Puja | Temple Festival |
| **INGA 10** | `ganga_puja` | Ganga Puja (Ganga Dussehra) | Ritual |
| **INGA 14** | `mahadev_lalhou_katpa` | Mahadev Lalhou Katpa | Temple Ritual |
| **INGA 15** | `sanamahi_cheng_haiba` | Sanamahi Cheng Haiba | Sanamahi Ritual |
| **INGEN 2** | `kang_chingba` | Kang Chingba (Rath Yatra) | **State Holiday** |
| **INGEN 8 & 9** | `luxmi_keithel_kaba` | Ema Keithel Luxmi Puja | Traditional Market Ritual |
| **INGEN 10** | `kanglen` | Kanglen (Punaryatra) | **State Holiday** |
| **INGEN 12** | `ningol_palli` | Ningol Palli | Cultural Celebration |
| **INGEN 15** | `guru_prunima` | Guru Purnima | Festival |
| **INGEN 20** | `nag_pamchami` | Naag Panchami | Ritual |
| **THAWAN 15** | `raksha_bandhan` | Raksha Bandhan / Jhulon Loiba | Festival |
| **THAWAN 23** | `krishna_jarma` | Janmashtami (Krishna Janma) | **State Holiday** |
| **LANGBAN 4** | `ganesh_chaturdhashi` | Ganesh Chaturthi | Festival |
| **LANGBAN 8** | `radha_jarma` | Radhashtami | Temple Festival |
| **LANGBAN 11** | `heikru_hidongba` | Heikru Hidongba (Boat Race Festival) | **State Holiday** |
| **LANGBAN 12** | `braman_janama` | Brahman Janama | Ritual |
| **LANGBAN 16** | `tarpan_houba` | Langban Tarpan Houba | Ancestral Offerings Start |
| **LANGBAN 30** | `tarpan_loiba` | Langban Tarpan Loiba | Ancestral Offerings End |
| **MERA 1** | `mera_chouren_houba` | Mera Chaoren Houba | **State Holiday** |
| **MERA 7 & 8** | `durga_puja`, `bor_numit` | Durga Puja & Mera Bor Numit | **State Holiday** |
| **MERA 10** | `police_day_kwak_tanba` | Manipur Police Day & Kwak Tanba (Dussehra)| **State Holiday** |
| **MERA 15** | `mera_hou_chongba` | Mera Houchongba (Hills & Valley Unity) | **State Holiday** |
| **MERA 17** | `meitei_puya_meithaba` | Puya Meithaba Day | Memorial Observance |
| **MERA 30** | `diwali` | Diwali (Deepavali) | **State Holiday** |
| **HIYANGEI 1** | `gorbardhan_puja` | Govardhan Puja | Ritual |
| **HIYANGEI 2** | `ningol_chakouba_numit` | Ningol Chakkouba | **State Holiday** |
| **HIYANGEI 8** | `san_senba` | Sanshenba (Gopashtami) | Ritual |
| **HIYANGEI 11/12**| `tulsi_bhiva_hari_uthan` | Tulsi Vivah & Hari Uthana | Ritual |
| **HIYANGEI 15** | `mera_wa_fukpa` | Mera Wa-Fukpa | Ritual Concluding Mera |

---

## 3. Weekday-Calculated Rules (3 Events)
These events are calculated based on calendar weekdays:

| Rule | Event ID | Name | Category / Notes |
| :--- | :--- | :--- | :--- |
| **2nd Saturday of every month** | `2nd_saturday` | Second Saturday Bank Holiday | Financial / Bank Holiday |
| **2nd Sunday of May** | `mothers_day` | Mother's Day | International Observance |
| **Every Saturday of Lamta month**| `saroi_khangba` | Saroi Khangba | Traditional Meitei Ritual |

---

## 4. Floating / Variable Holidays (7 Events)
These depend on external Islamic lunar sighting, Christian Paschal calculation, or Jain calendar. They **must be verified and kept in the year's JSON file**:

| Basis | Event ID | Name | 2026 Reference Date |
| :--- | :--- | :--- | :--- |
| **Islamic (Shawwal 1)** | `eid_ul_fitr` | Eid-ul-Fitr | 2026-03-21 |
| **Islamic (Dhu al-Hijjah 10)** | `eid_ul_adha` | Eid-ul-Adha | 2026-05-27 |
| **Islamic (Muharram 10)** | `muharram` | Muharram | 2026-06-26 |
| **Islamic (Rabi' al-Awwal 12)** | `milad_un_nabi` | Milad-un-Nabi | 2026-08-26 |
| **Christian (Friday before Easter)** | `good_friday` | Good Friday | 2026-04-03 |
| **Christian (Paschal Sunday)** | `easther_sunday`| Easter Sunday | 2026-04-05 |
| **Jain (Chaitra Shukla 13)** | `mahavir_jayanti`| Mahavir Jayanti | 2026-03-31 |
| **Hindu (Vaishakha Shukla 3)** | `akshar_tritiya` | Akshaya Tritiya | 2026-04-20 |

---

## 5. Verification Checklist for 2027 Data Upload
When you upload `calendar_2027.json`:
1. [ ] Check that fixed Gregorian events match their `MM-DD` (e.g. Jan 26 = Republic Day, Dec 25 = Christmas).
2. [ ] Check that fixed Meitei events match their lunar month + day (e.g. Sajibu 1 = Cheiraoba, Hiyangei 2 = Ningol Chakkouba).
3. [ ] Verify that 2nd Saturdays match the actual 2nd Saturdays of 2027.
4. [ ] Check the official Manipur Government holiday gazette for the floating holidays (Eid, Good Friday).
