# CTSO Management System (CMS) - Design Direction

Dial: ENERGY 1 / RHYTHM 2 / MOTION 1

## 1. Identity & Audience
- **Product**: Operational Roster, Shift, and Jobdesk Management Portal for CTSO Bali (Badung - Kerobokan & Denpasar - Gatsu Timur).
- **Audience**: NOC Engineers, Field Technicians, Operational Supervisors (SPV), and Administrators working 24/7 shifts.
- **Character**: Utilitarian, high-legibility operational control room interface. Prioritizes scannability of shift codes (`Pagi 7`, `Pagi 8`, `Siang`, `Sore`, `Malam`, `OFF`) and jobdesk roles (`CT1`, `CT2`, `CT4`) over decorative chrome.
- **Identity Motif**: High-contrast Carbon Black (`#111111`) paired with Signal Yellow (`#F9C900`) for primary operational actions, combined with user-configurable monospace shift/jobdesk code badges (`JetBrains Mono`) on neutral white/dark surfaces.

## 2. Color Palette (R-29: 2 Core Neutrals + 1 Brand Accent)
- **Core Surface Light**: `#F5F6F8` (page canvas) and `#FFFFFF` (cards, tables, panels) with `#E2E8F0` structural borders.
- **Core Surface Dark**: `#0E0F12` (page canvas) and `#18181A` (cards, tables, panels) with `rgba(255,255,255,0.10)` structural borders.
- **Core Text**: `#0F172A` / `#111111` primary text on light (`18.1:1` contrast); `#F2F4F7` / `#FFFFFF` primary text on dark (`17.4:1` contrast); `#475569` (`7.5:1`) and `#94A3B8` (`7.1:1` on dark) for secondary metadata.
- **Deliberate Accent**: Signal Yellow `#F9C900` with `#111111` text (`13.6:1` contrast) reserved for primary action buttons and active navigation markers.
- **Semantic Roster Badges**: User-defined background (`color`) and text (`textColor`) in Shift Master and Jobdesk Master, applied strictly to the compact code badge (`kotak kode`), never to full card backgrounds.

## 3. Typography (R-06)
- **UI & Prose (`Inter`)**: Chosen for high x-height and clear legibility at compact table sizes (`12px`–`14px`) across dense roster matrices.
- **Technical Codes & Timestamps (`JetBrains Mono`)**: Used strictly for employee IDs (`CTSO-3018`), shift/jobdesk codes (`CT1`, `Pagi 7`), working hours (`07:00 - 15:00`), and WITA audit timestamps so tabular figures align vertically.

## 4. Layout, Spacing & Border Radius Hierarchy (R-05, R-11)
- **Rhythm (RHYTHM 2)**: Asymmetric operational dashboard (5 summary KPIs -> 8/4 split between 3-column Jobdesk kanban + roster directory and shift distribution bars), transitioning to full-width matrix tables on Schedule/Jobdesk views and single-column dense lists on Requests, History, and Activity Logs.
- **Radius Scale (R-11 - No Pill Everything)**:
  - Section panels & modals: `rounded-2xl` (`16px`)
  - Inner cards & list containers: `rounded-xl` (`12px`)
  - Buttons, inputs, & select dropdowns: `rounded-lg` (`8px`) or `rounded-xl` (`12px`)
  - Shift & Jobdesk code badges: `rounded-md` (`6px`)
  - Status indicators (`Published`, `Approved`, `Aktif`): `rounded-full`

## 5. One-Line Reasons for Visual Decisions (R-31)
- **Color**: Neutral card surfaces (`#FFFFFF` / `#18181A`) prevent visual fatigue during 8-hour NOC shifts while letting colored shift/jobdesk badges stand out immediately.
- **Layout**: An 8-column / 4-column split on the Dashboard places daily CT1/CT2/CT4 task allocation and the searchable roster table as the primary focal point, with shift headcount bars as secondary reference.
- **Typography**: Pairing `Inter` for names/labels with `JetBrains Mono` for shift codes, IDs, and `DD/MM/YYYY` dates makes dense 31-day monthly matrices scannable without column jitter.
- **Spacing**: Compact `py-1.5 px-3` / `py-3 px-4` list rows fit up to 100 audit logs and multi-employee shift requests on a single screen without excessive scrolling.
- **Cards vs. Lists**: Cards are used only where items group sub-lists by category (Daily Shift/Jobdesk columns and Master catalogs), while Requests, Leaves, Schedule History, and Activity Logs use single-column lists for fast chronological scanning.
- **Icons**: Functional stroke icons (`Calendar`, `Clock`, `MapPin`, `Search`, `Download`, `Trash2`, `Edit2`) serve as scannable affordances paired with visible text labels or `aria-label`s, never as standalone decoration.
