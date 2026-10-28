---
name: Clinical Motion
colors:
  surface: '#f0fcfa'
  surface-dim: '#d0dddb'
  surface-bright: '#f0fcfa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eaf6f4'
  surface-container: '#e4f0ee'
  surface-container-high: '#deebe9'
  surface-container-highest: '#d9e5e3'
  on-surface: '#131e1d'
  on-surface-variant: '#3e4946'
  inverse-surface: '#273331'
  inverse-on-surface: '#e7f3f1'
  outline: '#6e7a75'
  outline-variant: '#bdc9c4'
  surface-tint: '#006b5b'
  primary: '#005f50'
  on-primary: '#ffffff'
  primary-container: '#0d7a68'
  on-primary-container: '#aaffe9'
  inverse-primary: '#7cd7c1'
  secondary: '#37675c'
  on-secondary: '#ffffff'
  secondary-container: '#b7eadc'
  on-secondary-container: '#3b6b60'
  tertiary: '#8d3b24'
  on-tertiary: '#ffffff'
  tertiary-container: '#ac523a'
  on-tertiary-container: '#ffebe6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#99f3dd'
  primary-fixed-dim: '#7cd7c1'
  on-primary-fixed: '#00201a'
  on-primary-fixed-variant: '#005144'
  secondary-fixed: '#baeddf'
  secondary-fixed-dim: '#9ed1c3'
  on-secondary-fixed: '#00201a'
  on-secondary-fixed-variant: '#1d4f45'
  tertiary-fixed: '#ffdbd2'
  tertiary-fixed-dim: '#ffb4a1'
  on-tertiary-fixed: '#3c0800'
  on-tertiary-fixed-variant: '#7c2e19'
  background: '#f0fcfa'
  on-background: '#131e1d'
  surface-variant: '#d9e5e3'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: '0'
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.06em
  metric-num:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.02em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system establishes a clinical, reassuring, and precise visual language engineered specifically for mobile-first physical therapy documentation. The brand centers on trust, restorative care, and friction-free clinical velocity. The user persona—busy physiotherapists moving between treatment tables and active rehabilitation zones—requires one-handed ergonomics, rapid glanceability, and zero cognitive friction.

The visual direction leverages a **Clean Clinical Modern** aesthetic. It moves away from sterile, cold institutional hospital software toward an empowering wellness environment. Clean surfaces, high micro-contrast for accessibility under clinic fluorescent lighting, and tactical color accents balance warmth with precision. Patient anonymity is treated with utmost technical rigor: identifiers take the form of crisp alphanumeric tokens, demanding a disciplined layout that reinforces data security while maintaining immediate visual recognition.

## Colors

The core color palette utilizes restorative deep teal and emerald hues as the primary anchor, conveying health, calm, and clinical competence. 

- **Primary (`#0D7A68`)**: Deep therapeutic teal used for core interactive elements, primary action triggers, progress indicators, and active session states.
- **Secondary (`#1B4D43`)**: Forest slate used for structural headers, high-emphasis text, and active segment tabs.
- **Neutral Base (`#1E2928`)**: Deep pine charcoal for ultra-crisp body copy. Canvas surfaces rely on off-white clinical hues (`#F7FAF9` for the root background and `#FFFFFF` for elevated diagnostic cards) to eliminate eye strain caused by pure `#000000` on `#FFFFFF` contrast.
- **Pain VAS Scale Accents**: Visual pain scale tokens are decoupled from standard feedback semantics:
  - `VAS 0–3 (Mild)`: `#10B981` (Restorative Mint)
  - `VAS 4–6 (Moderate)`: `#F59E0B` (Clinical Amber)
  - `VAS 7–10 (Severe)`: `#EF4444` (Vigilant Crimson)
  - `Tertiary Accent (`#E07A5F`)`: Terracotta, reserved for non-VAS clinical warnings and exercise fatigue markers.

## Typography

The type system is built on **Manrope** for primary anatomical and clinical content, paired with **JetBrains Mono** for patient tracking codes, dosage numbers, and mechanical exercise variables.

- **Manrope** delivers high legibility at glance velocity through balanced proportions and distinct letterforms, preventing misread values during manual physical sessions.
- **JetBrains Mono** provides fixed-pitch clarity for anonymous patient codes (e.g., `PT-8942-X`), sets, reps, load values (kg/lbs), and VAS numerical badges. Monospaced rendering prevents layout shifts when counters or timers increment dynamically during session execution.

## Layout & Spacing

The layout model is anchored to a mobile-first 4-column grid (stretching to 8 columns on tablet viewports) with strict ergonomic baseline rhythm:

- **Touch targets**: Minimum interactive footprint is 48px × 48px to accommodate one-handed operation while interacting with patients.
- **Vertical spacing rhythm**: 8px base grid increments. Form fields, prescription inputs, and session timelines use `space-md` (`1rem`) internally and `space-lg` (`1.5rem`) for distinct block separation.
- **Thumb Zone Priority**: Critical primary actions (such as logging pain ratings or confirming completed exercise sets) are anchored within the bottom 35% of the mobile viewport, pinned above safe areas.

## Elevation & Depth

Visual hierarchy employs a **Tonal Layering** system combined with soft, low-intensity ambient shadows to preserve clean clinical boundaries:

- **Level 0 (Canvas)**: Background surface tint (`#F7FAF9`).
- **Level 1 (Card/Container)**: Pure white (`#FFFFFF`) with a 1px boundary stroke (`#E2EBE8`). No harsh dropped shadows; depth is implied through boundary lines.
- **Level 2 (Active/Floating Sheets & Bottom Trays)**: Surface `#FFFFFF` supported by an ambient drop shadow: `0 8px 24px -4px rgba(13, 122, 104, 0.08)`, gently tinted with the primary teal to avoid dirty gray halos.
- **Level 3 (Modal Alerts/VAS Selection Drawers)**: Heavy focus overlay with 40% opacity tinted background (`rgba(30, 41, 40, 0.4)`) paired with `0 16px 32px -8px rgba(13, 122, 104, 0.16)`.

## Shapes

The design system adopts **Rounded (Level 2)** geometry:
- Default surfaces, prescription cards, and metric summary blocks carry an 8px (`0.5rem`) radius.
- Large containers, bottom sheets, and patient summary headers utilize `rounded-lg` (16px / `1rem`).
- Pills, chips, anonymous identity tags, and VAS touch buttons use full rounded caps (`9999px`) to invite touch and denote interactive state boundaries.

## Components

### Buttons
- **Primary Buttons**: Solid fill with `#0D7A68`, bold text in `#FFFFFF`, 48px minimum height, radius 8px, subtle active state scale reduction (`active:scale-[0.98]`).
- **Secondary Buttons**: Transparent fill, 1.5px solid border in `#0D7A68`, text in `#0D7A68`.
- **Destructive/Pain Trigger Buttons**: Bordered or filled with tertiary accent or VAS alert red, strictly segregated from standard workflow flows.

### Anonymous Code Badge
- Visual encapsulation of patient IDs (e.g., `PT-4402`). Rendered using `label-code` typography, background `#E8F3F1`, text `#0D7A68`, with a subtle border in `#C5E2DC` and pill-shaped corners.

### VAS Pain Scale Selector (0–10)
- Segmented touch rail consisting of 11 discrete round target pills (minimum 44px touch area each).
- Dynamic tinting based on value:
  - 0–3: Border and active fill Mint (`#10B981`)
  - 4–6: Border and active fill Amber (`#F59E0B`)
  - 7–10: Border and active fill Red (`#EF4444`)
- Includes immediate textual anchors below the rail: "Sem Dor" (0), "Moderada" (5), "Insuportável" (10).

### Prescription Stepper Card (Sets & Reps)
- Modular white cards (`#FFFFFF`) with distinct quantitative increment/decrement controls.
- Value readouts use `metric-num` (`JetBrains Mono`). Tap targets for `+` and `-` adjustments use a 44px circular footprint with high tactile feedback.

### Input Fields & Search
- Neutral clinical inputs with background `#FFFFFF`, border 1px solid `#D0DED9`, label placement above input with `label-sm`. Focused state activates a 2px outline in `#0D7A68` with no offset.

### Session History List
- Dense, highly scannable items separated by 8px gaps. Left-aligned date stamp, center-aligned exercise badge, and right-aligned VAS indicator dot with associated severity score.