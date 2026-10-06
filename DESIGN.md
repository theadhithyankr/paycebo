---
name: Paycebo
description: Green finance planning with adaptive light and dark surfaces and personal contacts.
colors:
  background: "#F4F5F1"
  surface: "#FFFFFF"
  elevated: "#E9EDE5"
  foreground: "#17221A"
  muted: "#5D675F"
  accent: "#86DB6E"
  accent-ink: "#102015"
  accent-text: "#257338"
  dark: "#0B1711"
  on-dark: "#F6F8F3"
  dark-muted: "#C4D6C4"
  line: "#D8DFD3"
  positive: "#257338"
  danger: "#A42E38"
  danger-surface: "#FCE9E9"
  contribution-surface: "#E2EEDD"
  dark-background: "#0B1711"
  dark-surface: "#14271C"
  dark-elevated: "#1E3326"
  dark-foreground: "#F6F8F3"
  dark-supporting: "#BBCDBB"
  dark-line: "#2D4934"
  dark-positive: "#B0E69F"
  dark-danger: "#FFB0B3"
  dark-danger-surface: "#3A1F26"
  dark-contribution: "#223B27"
typography:
  display:
    fontFamily: "Manrope_700Bold, Manrope, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.266667
    letterSpacing: "-0.5px"
  body:
    fontFamily: "Manrope_400Regular, Manrope, sans-serif"
    fontSize: "16px"
    lineHeight: 1.5
  supporting:
    fontFamily: "Manrope_400Regular, Manrope, sans-serif"
    fontSize: "14px"
    lineHeight: 1.5
  label:
    fontFamily: "Manrope_400Regular, Manrope, sans-serif"
    fontSize: "13px"
    lineHeight: 1.461538
  button:
    fontFamily: "Manrope_400Regular, Manrope, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.5
  field:
    fontFamily: "system-ui, sans-serif"
    fontSize: "17px"
    lineHeight: 1.411765
rounded:
  chat-tail: "4px"
  banner: "12px"
  control: "16px"
  dialog: "24px"
  panel: "28px"
  dock: "30px"
  circle: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  medium: "12px"
  md: "16px"
  control: "20px"
  lg: "24px"
  page-bottom: "28px"
  xl: "32px"
  form-bottom: "40px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-secondary:
    backgroundColor: "{colors.elevated}"
    textColor: "{colors.foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-danger:
    backgroundColor: "{colors.danger-surface}"
    textColor: "{colors.danger}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  field:
    backgroundColor: "{colors.elevated}"
    textColor: "{colors.foreground}"
    typography: "{typography.field}"
    rounded: "{rounded.control}"
    padding: "16px"
  notice:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    typography: "{typography.supporting}"
    rounded: "{rounded.control}"
    padding: "16px"
  allowance-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "16px"
  frequency-chip:
    backgroundColor: "{colors.elevated}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  frequency-chip-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  navigation:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.dock}"
    padding: "8px"
    height: "72px"
  goal-avatar:
    rounded: "{rounded.circle}"
    size: "76px"
---

# Design System: Paycebo

## Overview

**Creative North Star: "Personal money plans as contacts."**

Paycebo presents future goals and everyday allowances as personal contacts. The user-approved green finance reference supplies the visual world: dark green balance headers, rounded adaptive panels, Manrope and green controls. Calm amounts, clear labels and one focused action per task support everyday money planning. The current work extends this established world with System, Dark and Light appearance, a floating navigation dock and Android home-screen widgets. The existing green logo supplies the app icon and adaptive, monochrome, splash and favicon assets.

The shipped source is authoritative: `app/_layout.tsx` records direction seed `f7815d43`; `src/lib/appearance.ts`, `src/state/AppearanceProvider.tsx`, `src/state/FundingHintsProvider.tsx`, `src/components/ui.tsx`, `primitives.tsx`, `OnboardingFrame.tsx`, `FloatingTabBar.tsx`, `BalanceMetrics.tsx`, `GoalAvatar.tsx`, `PhotoControl.tsx`, `src/widgets/render.android.tsx`, `tailwind.config.js` and the Home, allowance, expense and goal routes establish these patterns. Owned gluestack primitives are manually integrated with NativeWind 4. Frontmatter pixels represent React Native logical units. Display/body font fallbacks handle loading failure; input typography still uses the platform default. The funding dialog and aligned metric rows extend the existing green world without a new visual concept or font system.

Verification boundary: Domain verification passed 65 tests, TypeScript checked 48 source files, and web/Android/iOS exports passed. Browser checks covered both funding actions, Cancel, storage failure/retry, duplicate taps, shared explanation persistence and preference write failure, compact layouts and both themes. API 35 Android emulator checks used a locally signed QA APK with the current exported Hermes bundle in the existing EAS-built native shell: INR 20 to INR 14,000 top-up, Cancel preserving 14000, explanation toggle off, committed bank/saved/Safe to Spend totals and Pay enabled for the unfinished goal at zero availability. Balance rows passed normal text and font scale 1.3 inspection with complete labels and amounts. Review evidence: `.impeccable/review/funding-native-home-dark-phone.png`, `funding-native-popup-dark-phone.png`, `funding-native-success-dark-phone.png`, `funding-native-home-large-phone.png` and `funding-popup-light-compact.png`. The EAS cloud distribution build was not regenerated; a fresh EAS build is needed for distribution. Earlier API 35 captures also cover light/dark Home, theme controls, keyboard-visible setup/allowance forms, success alignment, dock/last-row scrolling and pinned widget families. iOS runtime, physical-device camera/gestures/performance, full screen-reader navigation and battery-restricted/background widget refresh remain acceptance checks. See QA.md.

**Key Characteristics:**

- Dark green headers above rounded light or forest-dark working surfaces.
- Manrope headings and body copy with clear INR amounts.
- Green rounded actions, explicit selected controls and a floating rounded navigation dock.
- Circular goal and allowance contacts with photo or initials fallback.
- Flat activity rows, conversational savings and restrained semantic tints.
- Safe areas, scalable text, reduced motion and keyboard-safe forms.

## Colors

Forest-dark emphasis, softly green light surfaces and a bright green action accent form the palette; frontmatter owns exact shared values.

### Primary

Bright leaf green marks primary actions, setup progress and selected options. Deep green accent text supports small actions on light surfaces; dark ink keeps filled green controls legible. Forest dark supports balance/onboarding headers with pale foreground and muted green copy.

### Secondary

Positive green and pale contribution tint mark saved allocations. Deep red and pale danger tint mark withdrawals, errors and overspending. Contact identity colors are defined separately in `COLORS` in `src/lib/model.ts`: current choices are green, blue, forest, lavender and rose; older colors remain valid for saved data. Identity colors are not alternate global action palettes.

### Neutral

Light mode uses soft off-white pages, white cards/notices and pale green-gray fields/controls. Dark mode uses forest pages, green-black surfaces and lighter forest fields/controls, with pale main text, muted green supporting text and stronger green dividers. Positive and danger text/tints adapt with the theme; the leaf-green filled action and its dark ink remain consistent.

**The Appearance Continuity Rule.** Default to System and resolve all working surfaces, fields, overlays, navigation, status bars and semantic text through the shared appearance palette. Explicit Dark and Light choices persist separately from money data; a failed save keeps the previous preference active.

**The Meaning Before Color Rule.** Transaction meaning, errors and demo mode need words or icons as well as tint.

## Typography

**Display Font:** Manrope bold (`Manrope_700Bold`). **Body Font:** Manrope regular (`Manrope_400Regular`). Font-loading failure permits platform fallback. Inputs and avatar initials currently use platform fonts; do not infer an additional editorial typeface from these exceptions.

The hierarchy is operational: bold screen headings, quieter explanations and prominent amounts. Shared display is (30/38), form headings (26/34), Home section headings (23/32) and savings chat summary (34/44). Home balance is (44/54), shrinking to (36/54) when its formatted amount exceeds ten characters. Body is (16/24), supporting text (14/21), hints (13/19), fields (17/24). Metadata may use (11-12) with (16-18) line height. Text scaling stays enabled.

**The Amount Clarity Rule.** Preserve Indian currency grouping, tabular digits where implemented and the source's adaptive balance sizing.

## Layout

Phone-first vertical screens sit in a centered container capped at (640). There are no custom responsive breakpoints: larger web widths retain the narrow working column. Pages use (24) horizontal padding and (28) bottom padding; forms use (24) padding/gaps and (40) bottom padding. Safe areas and scrolling handle device chrome. FormPage and onboarding use keyboard-aware scrolling with measured footer clearance and a separate sticky action footer. Android requests keyboard resize; verify the native interaction on device.

Home places balance and three quick actions in a dark green header. Its theme working panel has broad top corners and a small overlap into the header. Future contacts form a horizontal rail with (86)-wide items, (72)-unit avatars and (18) gaps. Allowances stack as theme surface rows; recent activity uses divided ledger rows. Supporting balance totals use three aligned rows in one translucent panel; each row stacks its label above the right-aligned amount below (360) width, above (1.2) font scale or when any formatted total exceeds twelve characters. Chat bubbles occupy at most (90%) width; outgoing messages have (170) minimum width and bottom actions wrap.

Onboarding has a dark progress header, scrolling theme question area and separate keyboard-sticky footer whose measured height reserves scroll clearance. Each question has minimal copy and an explicit forward action. Dialog bodies scroll within maximum (85%) viewport height and (440) width; sheets respect the bottom safe area.

## Elevation & Depth

Depth chiefly comes from dark/light contrast, theme surface layers, semantic tints and thin separators. The floating dock is the deliberate exception: black shadow at (16%) opacity, (6) vertical offset and (18) radius, plus Android elevation (8). Home uses a restrained forest gradient and translucent header controls. Overlay backdrops use dark green at (55%) opacity; sheets and dialogs use the resolved theme surface.

**The Tonal Depth Rule.** Use tonal surfaces, restrained header gradients and dividers; reserve the implemented lift for the floating dock.

## Shapes

Controls, fields, allowance cards, notices and bubbles share rounded control corners. Light panel tops and sheets use broad panel radius; dialogs use dialog radius. Incoming bubbles tighten the upper-left corner and outgoing bubbles the upper-right to chat-tail radius. Demo banners use banner radius. Goal images and initials are circular/clipped, with a (3)-unit progress ring starting at the top and rounded stroke ends.

## Components

### Buttons

Owned gluestack actions expose primary, secondary, ghost and danger variants. Minimum height (52), padding (12 vertical, 20 horizontal), centered icon/label group and shrinking labels preserve readability. Pressed opacity is (0.75); disabled opacity (0.45). Saving disables the action and shows a spinner with saving copy. Icon buttons have (48) square hit areas and tonal pressed background. Dark-surface ghost labels use pale text. Native source has no custom hover/focus decoration; sidecar focus outlines are browser preview affordances only.

### Cards / Containers

Theme surface allowance cards use control radius and (16) padding. Allowance summaries use (24) padding and prominent remaining/over-budget amounts. Quiet notices explain allocation/storage behavior; errors use pale danger tint with alert/live announcement. The demo banner explicitly labels sample money. Avoid nesting decorative cards inside activity rows.

### Inputs / Fields

Fields have theme elevated backgrounds, control radius, (16) padding and minimum height (56). Labels/hints remain outside. Theme foreground text, muted placeholders and green selection support editing. Persistence errors are separate notices and preserve input. Source adds no custom focus border.

### Chips

Daily, weekly and monthly allowance choices wrap in a row. Each has minimum height (48), control radius and (12 vertical, 20 horizontal) padding. Selected chips use green; others use elevated tone. Accessibility state exposes selection and disabled status.

### Navigation and overlays

Home, Activity and Settings sit in a floating surface dock inset (20) from each side and (12) above the bottom safe area. Dock height is (72), radius (30), padding (8) and item gap (8). Active tabs use a leaf-green rounded fill and dark icon/label; inactive tabs use muted theme text. Labels use Manrope (12/17), icons (21), and each tab has at least (48) height. The dock hides while the keyboard is open. Scrollable tab screens reserve (100) plus bottom safe-area inset so content stays reachable. Back/close controls have accessible labels; edit/payment/expense forms use modal presentation. Owned gluestack dialogs and action sheets supply overlay behavior.

### Goal contacts, allowances and photos

Default avatar (76), Home contacts (72), Home allowances (52), allowance preview (88), allowance detail (96), ledger (48), chat header (44) and goal summary (100). Missing/failed images show up to two uppercase initials over goal color at hexadecimal alpha `25`. Names, percentages or remaining-money labels make meaning explicit: goals track saved progress; allowance rings track current-period spending. Native progress animates over (350 ms), or immediately for reduced motion; web rings are static. Initial reduced-motion preference defaults to true.

Photo controls open a theme surface sheet with gallery, camera and removal actions. Actionable permission/error copy offers native Settings after camera denial. New photos are resized to at most (1024) on the long edge and stored as JPEG at (0.8) compression. Persistence is local, not a cloud feature. Retain initials fallback and accessible names.

### Ledger and conversation

Divided ledger rows use (16) vertical padding. Incoming goal/reminder messages align left on the theme surface; contributions and withdrawals align right on green/red tints. Status words, arrows, checks, dates and tabular amounts explain meaning. Conversation scrolls to newest content when item count changes without an animated jump. Allowance history retains expenses after archival; overspending requires explicit confirmation.

### Balance metrics and Android widgets

Home groups Bank balance, Saved and Allowance left in one translucent header panel with control radius, (16) horizontal padding and `#FFFFFF10` fill. Each row pairs an (18)-unit green icon and (14/21) muted label on the left with a right-aligned, bold tabular (22/30) amount. Rows have minimum height (56), (12) vertical padding and `#FFFFFF18` separators. Below (360) width, above (1.2) font scale or when any formatted metric exceeds twelve characters, every row stacks its icon/label above its amount; values retain their type size and right alignment. Safe to Spend remains the dominant (44/54) amount, shrinking to (36/54) beyond ten characters.

Android widgets use the same resolved light/dark palette, Manrope headings, (24) corners and compact (14) or wide (18) padding. Balance shows Safe to Spend and three supporting totals; goals show saved percentage and progress; allowances show current-period remaining or over-budget amount and spending progress. Amounts fit available width. Each widget instance chooses its goal/active allowance and whether amounts are shown; hidden amounts are also hidden in accessibility labels, while goal percentage remains visible. Widgets always read personal data, including while the app shows demo money. Setup, missing selections and read errors use actionable placeholders. Android supplies System light/dark representations; explicit appearance selects one. OS refresh is requested every (30 minutes), best effort, alongside app-triggered refresh after persisted changes. Widget native behavior remains under device QA.

### Insufficient-funds dialog

For an unfinished goal, Pay stays enabled even when no money is available. Submitting an otherwise valid contribution above available funds opens the theme-aware, scrolling “Review your balance” dialog. Factual available funds and shortfall stay visible; tracked bank balance and existing reservations appear when they differ from availability. Secondary “Set balance to [required amount] & save”, primary “Add [shortfall] & save” and ghost “Cancel” actions use the existing button system. Cancel preserves the amount and note.

The “Show explanations” switch defaults on and shares `FundingHintsProvider` with Settings. Its separate `paycebo:funding-hints:v1` preference controls a worked example using the actual preview: bank plus shortfall equals required balance, followed by the contribution and resulting available money. Turning it off keeps the factual summary, confirmation reminder and actions visible. Preference write failure retains the prior choice and shows an error. Funding persistence failure preserves inputs and the dialog for retry; pending actions prevent duplicate submissions. A changed funding preview requires a fresh review. Success reports the committed tracked balance and Safe to Spend, and explicitly says no real money was transferred.

### First-run onboarding

Four questions cover goal, target, manually entered balance and optional first allocation. Setup progress starts at (20%), then advances through (40%), (60%), (80%) and (100%) after successful persistence; it is distinct from savings progress. Back preserves inputs and a local draft restores interrupted setup. Content fades over (220 ms), progress transitions over (300 ms); reduced motion makes both immediate. Completion displays a goal avatar with a green check anchored at its bottom-right in the same positioned wrapper, committed goal/amount and actual Safe to Spend. No automatic question advances or mandatory first allocations.

## Do's and Don'ts

### Do:

- **Do** preserve dark green headers, adaptive rounded surfaces, Manrope and green actions.
- **Do** preserve safe areas, scalable text, minimum 48-unit controls and keyboard-safe forms.
- **Do** pair transaction color with words and label demo money explicitly.
- **Do** use tonal surfaces and flat divided activity rows.
- **Do** retain reduced-motion handling and image-to-initials fallbacks.

### Don't:

- **Don't** imply bank connectivity, real money transfers or cloud photo uploads through visuals or labels.
- **Don't** reintroduce the discarded Notio, amber-action, serif or dark-only identity.
- **Don't** add decorative shadow stacks or nested cards to ledger rows.
- **Don't** treat browser walkthroughs, exports or sidecar previews as native UI signoff.
