# Paycebo

<!-- impeccable:product-schema 1 -->

## Platform
adaptive

## Stack
React Native with Expo, TypeScript, Expo Router, NativeWind 4, AsyncStorage, and manually integrated owned gluestack primitives (`@gluestack-ui/core` 3.0.25, `@gluestack-ui/utils` 3.0.21). Photos use Expo Image Picker/Image Manipulator and app-owned Documents on native, IndexedDB on web.

## Users
Individual INR users who want a tangible, low-friction ritual for saving toward personal goals and keeping everyday spending within allowances.

## Product Purpose
Make saving feel like paying a contact. Users reserve part of a manually entered bank balance for future goals and recurring everyday allowances, then record savings movements and spending with optional notes.

## Capabilities and Constraints
Local-only MVP: four-question setup with optional first saving and device draft recovery; separate demo data; goal creation/editing; contribution/withdrawal chats; progress rings; weekly pledges and in-app reminders; daily/weekly/monthly allowances; expense recording and overspending confirmation; allowance editing/archival; combined activity; balance updates; playful/supportive tone preference.

Savings reserve money without changing tracked bank balance. Remaining allowances reserve money for the current period. Safe to Spend is tracked bank balance minus net goal savings minus remaining allowance reservations. Recorded allowance expenses decrement tracked bank balance; Paycebo never moves real money. Expenses cannot exceed tracked balance. Spending beyond the remaining allowance requires confirmation.

Daily allowances reset at local midnight, weekly on Monday and monthly on the first. Unused allowance does not roll over. Edits apply to the current period and account for spending already recorded. Archiving releases the remaining reservation, prevents new spending/editing and retains expense history. New-period reservations can exceed a stale balance; the UI asks the user to update it.

Goals and allowances support optional local photos, gallery/camera selection and removal, with initials if missing or failed. New photos become JPEGs with maximum long edge 1024 and 0.8 compression. Optional `photoId` references app-owned native Documents files or browser IndexedDB blobs. Older HTTPS image URLs remain supported and can fetch remote images; new photos are not uploaded to the cloud. Native camera/picker behavior remains subject to device verification.

Snapshot schema 2 adds allowances/expenses; schema 1 migrates in memory. Existing storage key names remain. Unknown/corrupt snapshots are rejected rather than silently replaced. Local persistence must succeed before a change is confirmed; load failures offer retry without resetting personal data. Interrupted setup resumes from a separate device draft.

No bank integration, accounts, remote AI, cloud sync, cloud uploads or background notifications. Backup, scheduled/background reminders, forecasting and Pro purchases are future roadmap items, not implemented features. Existing in-app pledge reminders are generated during app use.

## Brand Commitments
Name: Paycebo. The user-approved green finance reference replaces the former Notio/amber/serif/dark-only UI: dark green balance headers above rounded light working panels, Manrope and rounded green controls. Goals and allowances feel like contacts. Playful voice is default; supportive copy is available. Use INR and Indian number formatting.

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
