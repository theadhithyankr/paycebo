# Paycebo

<!-- impeccable:product-schema 1 -->

## Platform
adaptive

## Stack
React Native with Expo, TypeScript, Expo Router, NativeWind 4, AsyncStorage, react-native-keyboard-controller, Android widgets via react-native-android-widget, and manually integrated owned gluestack primitives (`@gluestack-ui/core` 3.0.25, `@gluestack-ui/utils` 3.0.21). Photos use Expo Image Picker/Image Manipulator and app-owned Documents on native, IndexedDB on web.

## Users
Individual INR users who want a tangible, low-friction ritual for saving toward personal goals and keeping everyday spending within allowances.

## Product Purpose
Make saving feel like paying a contact. Users reserve part of a manually entered bank balance for future goals and recurring everyday allowances, then record savings movements and spending with optional notes.

## Capabilities and Constraints
Local-only MVP: four-question setup with optional first saving and device draft recovery; separate demo data; goal creation/editing; contribution/withdrawal chats; progress rings; weekly pledges and in-app reminders; daily/weekly/monthly allowances; expense recording and overspending confirmation; allowance editing/archival; combined activity; balance updates; playful/supportive tone preference.

Savings reserve money without changing tracked bank balance. Remaining allowances reserve money for the current period. Safe to Spend is tracked bank balance minus net goal savings minus remaining allowance reservations. Recorded allowance expenses decrement tracked bank balance; Paycebo never moves real money. Expenses cannot exceed tracked balance. Spending beyond the remaining allowance requires confirmation.

For an unfinished goal, Pay remains enabled at zero availability. A valid contribution above available funds opens “Review your balance” with available funds, shortfall and, where different, tracked bank balance and existing reservations. Users can Cancel without losing their entered amount/note, set tracked balance to the required amount and save, or add the shortfall to tracked balance and save. `previewGoalFunding` computes required balance as existing savings and current allowance reservations plus the requested contribution. `fundGoal` revalidates the preview against the latest snapshot, rejects changed previews for review and commits the balance update plus contribution through one existing repository write. It preserves previous reservations and the goal target. Both funding choices reach the same required balance; neither transfers real money. Persistence must succeed before success appears; failures retain the dialog and inputs for retry, and pending submissions are locked against duplicate taps.

Funding explanations default on. A worked example uses the actual preview amounts and shows the resulting available funds after saving. The dialog's “Show explanations” switch and Settings' “Show funding explanations” control share `FundingHintsProvider` and persist separately under `paycebo:funding-hints:v1`; snapshot schema remains 2. Turning explanations off preserves factual funds, action choices and the reminder to confirm actual funds. Failed preference saves retain the previous choice with an error; failed reads leave explanations on and report the failure without changing savings.

Daily allowances reset at local midnight, weekly on Monday and monthly on the first. Unused allowance does not roll over. Edits apply to the current period and account for spending already recorded. Archiving releases the remaining reservation, prevents new spending/editing and retains expense history. New-period reservations can exceed a stale balance; the UI asks the user to update it.

Goals and allowances support optional local photos, gallery/camera selection and removal, with initials if missing or failed. New photos become JPEGs with maximum long edge 1024 and 0.8 compression. Optional `photoId` references app-owned native Documents files or browser IndexedDB blobs. Older HTTPS image URLs remain supported and can fetch remote images; new photos are not uploaded to the cloud. Native camera/picker behavior remains subject to device verification.

Snapshot schema 2 adds allowances/expenses; schema 1 migrates in memory. Existing storage key names remain. Unknown/corrupt snapshots are rejected rather than silently replaced. Local persistence must succeed before a change is confirmed; load failures offer retry without resetting personal data. Interrupted setup resumes from a separate device draft.

Appearance offers System (default), Dark and Light, persisted separately under `paycebo:appearance:v1`. Working surfaces, text, fields, overlays, status bars and navigation adapt to the resolved palette. Failed preference saves retain the prior choice. Forms and onboarding use keyboard-aware scrolling with a measured sticky footer; native keyboard behavior remains under device QA.

Android home-screen widgets provide balance/Safe to Spend, savings-goal progress and active allowance remaining/over-budget views. Each installed instance stores its selected entity and Show amounts choice separately under `paycebo:widgets:v1`; money snapshot schema stays 2. Widgets always read personal data, even during demo use, and use setup/missing/error placeholders when it cannot be displayed. Amount hiding covers visible values and accessibility descriptions; goal percentage remains visible. Tapping opens the relevant personal app view. Widgets follow System or the explicit app appearance. Refresh follows persisted changes and Android's requested 30-minute update interval; OS background delivery is best effort. Android widget installation, reconfiguration, deep links and background refresh remain under device QA. Widgets require a native Android build; they are unavailable on iOS, web and Expo Go.

No bank integration, accounts, remote AI, cloud sync, cloud uploads or background notifications. Backup, scheduled/background reminders, forecasting and Pro purchases are future roadmap items, not implemented features. Existing in-app pledge reminders are generated during app use.

## Brand Commitments
Name: Paycebo. The user-approved green finance reference replaces the former Notio/amber/serif/dark-only UI: dark green balance headers above rounded adaptive light/dark working panels, Manrope and rounded green controls. The existing green Paycebo logo is the actual app icon and supplies adaptive, monochrome, splash and favicon assets. A floating rounded dock carries Home, Activity and Settings. Goals and allowances feel like contacts. Playful voice is default; supportive copy is available. Use INR and Indian number formatting.

## Product Principles
- Bank balance is a manually tracked input, not a verified account connection.
- Savings are allocations; never subtract contributions from bank balance a second time.
- Recorded expenses adjust tracked balance without transferring money.
- Distinguish current-period reservations from retained transaction history.
- Never shame someone into keeping funds they need.
- Confirm changes only after local persistence succeeds and preserve inputs on failure.
- Clearly distinguish sample data from personal data.
- Keep onboarding focused, optional where possible and recoverable on the device.

## Accessibility & Inclusion
Preserve scalable text, screen-reader labels and selected/progress states, 48-unit controls, reduced-motion support, sufficient contrast, native back navigation and keyboard-safe forms. Errors and transaction meanings use words/icons alongside color. Photos have initials fallback. These are implementation principles; native camera, keyboard, gestures and OS text scaling still need device checks.

## Verification Boundary

Verification boundary: Domain verification passed 65 tests, TypeScript checked 48 source files, and web/Android/iOS exports passed. Browser checks covered both funding actions, Cancel, storage failure/retry, duplicate taps, shared explanation persistence and preference write failure, compact layouts and both themes. API 35 Android emulator checks used a locally signed QA APK with the current exported Hermes bundle in the existing EAS-built native shell: INR 20 to INR 14,000 top-up, Cancel preserving 14000, explanation toggle off, committed bank/saved/Safe to Spend totals and Pay enabled for the unfinished goal at zero availability. Balance rows passed normal text and font scale 1.3 inspection with complete labels and amounts. Review evidence: `.impeccable/review/funding-native-home-dark-phone.png`, `funding-native-popup-dark-phone.png`, `funding-native-success-dark-phone.png`, `funding-native-home-large-phone.png` and `funding-popup-light-compact.png`. The EAS cloud distribution build was not regenerated; a fresh EAS build is needed for distribution. Earlier API 35 captures also cover light/dark Home, theme controls, keyboard-visible setup/allowance forms, success alignment, dock/last-row scrolling and pinned widget families. iOS runtime, physical-device camera/gestures/performance, full screen-reader navigation and battery-restricted/background widget refresh remain acceptance checks. See QA.md.
