---
name: Paycebo
description: Warm dark native savings, with goals that feel like contacts.
colors:
  background: "#0B0B0C"
  surface: "#181819"
  elevated: "#222223"
  foreground: "#F5F2EC"
  muted: "#B2AFA9"
  accent: "#EDB780"
  accent-ink: "#17120D"
  line: "#343332"
  positive: "#A9D6B2"
  danger: "#FFB1A5"
  danger-surface: "#35201D"
  contribution-surface: "#252C25"
  withdrawal-surface: "#35241F"
  hero-start: "#211A15"
  hero-middle: "#2A211A"
  hero-end: "#443024"
  hero-muted: "#DEC8B6"
  hero-line: "#6B5140"
  demo-surface: "#292119"
  goal-blue: "#B5C5E8"
  goal-lilac: "#D5B8E8"
  goal-rose: "#E9B7B0"
typography:
  display:
    fontFamily: "Aleo_400Regular, Georgia, serif"
    fontSize: "30px"
    fontWeight: 400
    lineHeight: 1.266667
    letterSpacing: "-0.5px"
  section:
    fontFamily: "Aleo_400Regular, Georgia, serif"
    fontSize: "25px"
    fontWeight: 400
    lineHeight: 1.28
  balance:
    fontFamily: "system-ui, sans-serif"
    fontSize: "52px"
    fontWeight: 600
    lineHeight: 1.230769
    letterSpacing: "-1.2px"
  body:
    fontFamily: "system-ui, sans-serif"
    fontSize: "16px"
    lineHeight: 1.5
  supporting:
    fontFamily: "system-ui, sans-serif"
    fontSize: "14px"
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, sans-serif"
    fontSize: "13px"
    lineHeight: 1.461538
  button:
    fontFamily: "system-ui, sans-serif"
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
  hero: "28px"
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
  balance-hero:
    textColor: "{colors.foreground}"
    rounded: "{rounded.hero}"
    padding: "24px"
  navigation:
    backgroundColor: "{colors.background}"
    textColor: "{colors.muted}"
  goal-avatar:
    rounded: "{rounded.circle}"
    size: "76px"
---

# Design System: Paycebo

## Overview

**Creative North Star: "Warm dark savings, paid to your future."**

Paycebo adapts the chosen Notio world to native payment-app interactions. Warm amber, curved surfaces, a quiet serif and contact avatars make saving tangible. The balance is prominent; goals and ledgers feel personal and conversational. This describes the approved direction, rather than a new concept.

Visual authority: StyleUI Notio registry in `heyfabrika/styleui`, inspected at commit `3da5706548882038f448a8ff4e570680a06b25c4`; dark sunny palette, Aleo serif, large rounded hero and restrained tonal gradients. Attribution lives in `THIRD_PARTY_NOTICES.md`. Actual source controls this adaptation: `src/components/ui.tsx`, `src/components/GoalAvatar.tsx`, `tailwind.config.js`, `app/(tabs)/index.tsx`, `app/(tabs)/_layout.tsx`, `app/goal/[id].tsx`, `src/components/TransactionRow.tsx`, `src/lib/model.ts` and `app/_layout.tsx`. Frontmatter pixels represent React Native logical units; system font names describe platform defaults.

Verification boundary: dependency installation was blocked by npm registry network `EACCES`. Native rendering, screenshots, full application typecheck and Expo export are unverified; no UI signoff is claimed. Source defects in setup read retry, button label shrinking, Activity wrapping and confirmation scrolling are resolved. Review disposition remains **fix**, solely pending native rendering/full application typecheck/export verification.

**Key Characteristics:**
- Warm amber actions on near-black tonal surfaces.
- Aleo headings with native sans controls and currency.
- Circular goal contacts with explicit progress.
- Flat ledger rows and conversational transaction bubbles.
- Scalable text, safe areas and keyboard-safe forms.

## Colors

The palette is dark and sunny. Exact values live in frontmatter.

### Primary
Warm amber identifies actions, active tabs and marks. Amber ink is used on filled actions.

### Secondary
Contribution green marks saved allocations. Request salmon marks withdrawals, negative availability and errors. Goal blue, lilac and rose join amber and green in the selectable identity palette.

### Neutral
Near-black is the page; charcoal is the notice surface; elevated charcoal is the input/control layer. Warm chalk carries main text, warm gray supporting text and charcoal line separators. Hero start/middle/end form the diagonal balance gradient; hero muted and hero line serve its labels and divider. Danger, contribution, withdrawal and demo surfaces provide contextual tints.

**The Meaning Before Color Rule.** Transaction meaning, errors and demo mode need words or icons as well as tint.

## Typography

**Display Font:** Aleo regular (`Aleo_400Regular`), with implemented Georgia fallback on iOS/web and native serif on Android. Aleo bold is loaded and registered; shared Display uses regular.

**Body Font:** Native platform sans. Currency uses tabular numerals. Text scaling stays enabled.

Shared display is (30/38), home section headings (25/32), form headings (26/34) and chat savings heading (34/44). Main sans balance is (52/64); beyond nine characters it becomes (42/64), beyond twelve (34/44). Body is (16/24), supporting text (14/21), hints (13/19), fields (17/24). Dates use (11–12) text with (16–18) line height.

**The Amount Clarity Rule.** Preserve Indian currency grouping, tabular digits and the source's adaptive balance sizing.

## Layout

Phone-first vertical screens sit in a centered container capped at (640). Pages use (24) horizontal padding and (28) bottom padding. Forms use (24) padding/gaps and (40) bottom padding. Safe areas and scrolling handle native chrome and keyboards; iOS forms use keyboard avoidance. No custom responsive breakpoints are defined.

Most rhythm uses the frontmatter scale, with observed local exceptions: balance gaps (14), contact gaps (18). Home contacts occupy (88)-wide horizontal rail items. Ledger rows span the width. Chat bubbles occupy at most (90%); outgoing messages have (170) minimum width. Bottom chat actions wrap when needed.

## Elevation & Depth

Tonal surfaces and the balance gradient supply depth. The source defines no shadows. Fields use elevated tone, transaction bubbles use semantic tints, and thin dividers clarify list structure.

**The Tonal Depth Rule.** Extend tonal layering and reserve the warm gradient for balance emphasis; do not add shadow stacks.

## Shapes

The hero uses the broad hero radius. Controls, notices and bubbles use control radius; incoming bubbles tighten the upper-left corner and outgoing bubbles the upper-right to chat-tail radius. Demo labels use banner radius. Circular clipped goal images/initials have a (3)-unit progress ring; new-goal circles use a dashed outline.

## Components

### Buttons
Four native variants: primary, secondary, ghost and danger. Minimum height (52), padding (12 vertical, 20 horizontal), centered icon/label group, shrinking labels. Pressed opacity (0.75); disabled opacity (0.45). Saving disables action and shows a spinner plus Saving text. Icon buttons have (48) square hit areas and tonal pressed background. Native source has no custom hover/focus decoration; sidecar focus outlines are browser preview affordances only.

### Cards / Containers
Balance hero uses the three-stop diagonal gradient, hero radius and (24) padding. Notices/nudges use surface tone, control radius and (16) padding. Errors use danger-surface and salmon with live announcements. Demo banner explicitly labels sample money.

### Inputs / Fields
Elevated fields have minimum height (56), control radius and (16) padding. Warm chalk text, muted placeholder, amber selection; labels/hints remain outside. Separate error notices retain user input on persistence failures. Source adds no custom focus border.

### Navigation
Native stacks open goal chats; editing/payment tasks use modal presentation. Home, Activity and Settings tabs use (12)-unit labels, amber active state, muted inactive state and top divider. Height is (64) plus the greater of bottom safe-area inset and (12), with (10) top padding. Back/close controls have accessible labels.

### Goal contacts and progress
Default avatar (76); ledger (48), chat header (44), summary (100). Missing/failed images show up to two uppercase initials over goal color at hexadecimal alpha `25`. The (3)-unit ring starts at top with rounded ends. Progress animates over (350 ms), or (0 ms) for reduced motion; initial preference defaults to reduced motion. Names and percentages make progress explicit.

### Ledger and conversation
Ledger rows have bottom dividers and (16) vertical padding. Incoming goal/reminder messages align left on surface. Contributions and withdrawals align right on their tints. Status words, arrows, checks, dates and tabular amounts support meaning. Conversation scrolls to newest content when item count changes without an animated jump.

## Do's and Don'ts

### Do:
- **Do** keep amber actions, Aleo headings and native sans operational text consistent.
- **Do** preserve safe areas, scalable text, minimum 48-unit controls and keyboard-safe forms.
- **Do** pair transaction color with words and label demo money explicitly.
- **Do** use tonal surfaces, the warm balance gradient and flat divided ledger rows.
- **Do** retain reduced-motion handling and image-to-initials fallbacks.

### Don't:
- **Don't** imply bank connectivity or money transfer through visuals or labels.
- **Don't** replace the chosen dark Notio world with a new identity.
- **Don't** add decorative shadow stacks or nested cards to ledger rows.
- **Don't** treat source inspection or sidecar previews as native UI signoff.
