---
name: Paycebo
description: Green finance planning with dark headers, light panels and personal contacts.
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
    backgroundColor: "{colors.background}"
    textColor: "{colors.muted}"
  goal-avatar:
    rounded: "{rounded.circle}"
    size: "76px"
---

# Design System: Paycebo

## Overview

**Creative North Star: "Personal money plans as contacts."**

Paycebo presents future goals and everyday allowances as personal contacts. The user-approved green finance reference supplies the visual world: dark green balance headers, rounded light panels, Manrope and green controls. Calm amounts, clear labels and one focused action per task support everyday money planning. This replaces the former Notio, amber, serif and dark-only direction.

The shipped source is authoritative: `app/_layout.tsx` records direction seed `f7815d43`; `src/components/ui.tsx`, `primitives.tsx`, `OnboardingFrame.tsx`, `GoalAvatar.tsx`, `PhotoControl.tsx`, `tailwind.config.js` and the Home, allowance, expense and goal routes establish these patterns. Owned gluestack primitives are manually integrated with NativeWind 4. Frontmatter pixels represent React Native logical units. Display/body font fallbacks handle loading failure; input typography still uses the platform default.

Verification boundary: reported browser walkthroughs and captures cover phone, compact and wide Home, welcome/setup, allowances, overspending, photo choice, activity, settings and goal chat. The reported 50 domain/storage tests, full typecheck and Android/iOS/web exports pass. Native UI captures and comparison with the native QUALITY BAR remain unverified: no attached adb device was available and emulator lock access failed. Camera, native keyboard, gestures and OS text scaling require device checks. No HTML/CSS detector ran because this is an adaptive native target. Browser evidence, exports and sidecar previews do not establish native UI signoff.

**Key Characteristics:**

- Dark green headers above rounded light working surfaces.
- Manrope headings and body copy with clear INR amounts.
- Green rounded actions and explicit selected controls.
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

Soft off-white is the page, white is the card/notice layer and pale green-gray is the field/control layer. Dark green-black carries main text, muted gray-green supporting copy and pale green-gray lines separate rows.

**The Meaning Before Color Rule.** Transaction meaning, errors and demo mode need words or icons as well as tint.

## Typography

**Display Font:** Manrope bold (`Manrope_700Bold`). **Body Font:** Manrope regular (`Manrope_400Regular`). Font-loading failure permits platform fallback. Inputs, avatar initials and native tab labels currently use platform fonts; do not infer an additional editorial typeface from these exceptions.

The hierarchy is operational: bold screen headings, quieter explanations and prominent amounts. Shared display is (30/38), form headings (26/34), Home section headings (23/32) and savings chat summary (34/44). Home balance is (44/54), shrinking to (36/54) when its formatted amount exceeds ten characters. Body is (16/24), supporting text (14/21), hints (13/19), fields (17/24). Metadata may use (11-12) with (16-18) line height. Text scaling stays enabled.

**The Amount Clarity Rule.** Preserve Indian currency grouping, tabular digits where implemented and the source's adaptive balance sizing.

## Layout

Phone-first vertical screens sit in a centered container capped at (640). There are no custom responsive breakpoints: larger web widths retain the narrow working column. Pages use (24) horizontal padding and (28) bottom padding; forms use (24) padding/gaps and (40) bottom padding. Safe areas and scrolling handle device chrome. FormPage uses iOS keyboard avoidance; onboarding uses padding on iOS and height elsewhere.

Home places balance and three quick actions in a dark green header. Its light working panel has broad top corners and a small overlap into the header. Future contacts form a horizontal rail with (86)-wide items, (72)-unit avatars and (18) gaps. Allowances stack as white rows; recent activity uses divided ledger rows. Header totals wrap. Chat bubbles occupy at most (90%) width; outgoing messages have (170) minimum width and bottom actions wrap.

Onboarding has a dark progress header, scrolling light question area and separate keyboard-safe footer. Each question has minimal copy and an explicit forward action. Dialog bodies scroll within maximum (85%) viewport height and (440) width; sheets respect the bottom safe area.

## Elevation & Depth

There are no custom shadows. Depth comes from dark/light contrast, white cards on the off-white panel, semantic tints and thin separators. Home uses a restrained forest gradient and translucent header controls. Overlay backdrops use dark green at (55%) opacity; sheets and dialogs use light surfaces.

**The Tonal Depth Rule.** Use tonal surfaces, restrained header gradients and dividers before adding elevation effects.

## Shapes

Controls, fields, allowance cards, notices and bubbles share rounded control corners. Light panel tops and sheets use broad panel radius; dialogs use dialog radius. Incoming bubbles tighten the upper-left corner and outgoing bubbles the upper-right to chat-tail radius. Demo banners use banner radius. Goal images and initials are circular/clipped, with a (3)-unit progress ring starting at the top and rounded stroke ends.

## Components

### Buttons

Owned gluestack actions expose primary, secondary, ghost and danger variants. Minimum height (52), padding (12 vertical, 20 horizontal), centered icon/label group and shrinking labels preserve readability. Pressed opacity is (0.75); disabled opacity (0.45). Saving disables the action and shows a spinner with saving copy. Icon buttons have (48) square hit areas and tonal pressed background. Dark-surface ghost labels use pale text. Native source has no custom hover/focus decoration; sidecar focus outlines are browser preview affordances only.

### Cards / Containers

White allowance cards use control radius and (16) padding. Allowance summaries use (24) padding and prominent remaining/over-budget amounts. Quiet notices explain allocation/storage behavior; errors use pale danger tint with alert/live announcement. The demo banner explicitly labels sample money. Avoid nesting decorative cards inside activity rows.

### Inputs / Fields

Fields have pale elevated backgrounds, control radius, (16) padding and minimum height (56). Labels/hints remain outside. Dark text, muted placeholders and green selection support editing. Persistence errors are separate notices and preserve input. Source adds no custom focus border.

### Chips

Daily, weekly and monthly allowance choices wrap in a row. Each has minimum height (48), control radius and (12 vertical, 20 horizontal) padding. Selected chips use green; others use elevated tone. Accessibility state exposes selection and disabled status.

### Navigation and overlays

Home, Activity and Settings tabs sit on the light background with a top divider and (12/18) labels. The active icon sits in a dark circular pill with a pale icon; active label tint is dark. Inactive icons/labels are muted. Height is (76) plus the greater of bottom safe-area inset and (12), with (10) top padding. Back/close controls have accessible labels; edit/payment/expense forms use modal presentation. Owned gluestack dialogs and action sheets supply overlay behavior.

### Goal contacts, allowances and photos

Default avatar (76), Home contacts (72), Home allowances (52), allowance preview (88), allowance detail (96), ledger (48), chat header (44) and goal summary (100). Missing/failed images show up to two uppercase initials over goal color at hexadecimal alpha `25`. Names, percentages or remaining-money labels make meaning explicit: goals track saved progress; allowance rings track current-period spending. Native progress animates over (350 ms), or immediately for reduced motion; web rings are static. Initial reduced-motion preference defaults to true.

Photo controls open a light sheet with gallery, camera and removal actions. Actionable permission/error copy offers native Settings after camera denial. New photos are resized to at most (1024) on the long edge and stored as JPEG at (0.8) compression. Persistence is local, not a cloud feature. Retain initials fallback and accessible names.

### Ledger and conversation

Divided ledger rows use (16) vertical padding. Incoming goal/reminder messages align left on white; contributions and withdrawals align right on green/red tints. Status words, arrows, checks, dates and tabular amounts explain meaning. Conversation scrolls to newest content when item count changes without an animated jump. Allowance history retains expenses after archival; overspending requires explicit confirmation.

### First-run onboarding

Four questions cover goal, target, manually entered balance and optional first allocation. Setup progress starts at (20%), then advances through (40%), (60%), (80%) and (100%) after successful persistence; it is distinct from savings progress. Back preserves inputs and a local draft restores interrupted setup. Content fades over (220 ms), progress transitions over (300 ms); reduced motion makes both immediate. Completion displays a green check, committed goal/amount and actual Safe to Spend. No automatic question advances or mandatory first allocations.

## Do's and Don'ts

### Do:

- **Do** preserve dark green headers, rounded light surfaces, Manrope and green actions.
- **Do** preserve safe areas, scalable text, minimum 48-unit controls and keyboard-safe forms.
- **Do** pair transaction color with words and label demo money explicitly.
- **Do** use tonal surfaces and flat divided activity rows.
- **Do** retain reduced-motion handling and image-to-initials fallbacks.

### Don't:

- **Don't** imply bank connectivity, real money transfers or cloud photo uploads through visuals or labels.
- **Don't** reintroduce the discarded Notio, amber-action, serif or dark-only identity.
- **Don't** add decorative shadow stacks or nested cards to ledger rows.
- **Don't** treat browser walkthroughs, exports or sidecar previews as native UI signoff.
