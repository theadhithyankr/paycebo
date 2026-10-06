# Paycebo

Pay your future self. A phone-first Expo savings and allowance tracker with goals as contacts, dark green balance headers, light content panels, and Manrope typography.

## Run

Requires Node 22.13+ (Node 24 recommended), npm, and an Expo SDK 55-compatible Expo Go app or a development build.

```sh
npm install
npm start
```

On Windows PowerShell, use `npm.cmd` and `npx.cmd` if script execution is disabled. The app uses the Paycebo launcher mark and splash artwork in `assets/`.

Scan the QR code in compatible Expo Go, or run `npm run android` to build and install the native Android app on a connected device/emulator. The first native build needs the Gradle distribution and Android dependencies available to Gradle. Run `npm start` when you only want the Expo development server. iOS Simulator requires macOS and Xcode. `npm run web` opens a browser preview using React Native Web; browser QA does not replace native-device QA.

Dependencies follow Expo SDK 55 bundled module versions, with NativeWind 4.2.7 / Tailwind 3.4.19 and manually styled gluestack primitives. `package-lock.json` records the installed versions. Run `npm ci` for a reproducible installation. After changing native modules or permissions, regenerate an existing local Android project with `npx expo prebuild --platform android --no-install` before building. EAS generates the native project from app configuration because native directories are ignored.

## What works

- Four-step personal onboarding: choose a goal, set its target, enter a balance, and optionally record a first saving. Visible setup progress starts at 20%, and unfinished answers resume on this device.
- Separate, persistent demo and personal sessions, switchable in Settings.
- Home balance breakdown, horizontal goal contacts with animated progress rings, and recent activity.
- Goal and allowance gallery/camera photos, persistent local images with initials fallback, and compatible existing HTTPS images.
- Goal creation/editing, color selection, optional weekly pledge and due weekday.
- Daily, weekly, and monthly allowances; actual spending, over-budget confirmation, edits, and archival with retained history.
- Goal chat with contribution notes, signed withdrawals, dated reminders, and completed-goal feedback.
- Pay and Request Money forms with quick amounts, limits, and post-save confirmation.
- Playful withdrawal confirmation with a supportive-tone switch.
- Activity filters, balance reconciliation, and error states that retain entered information.

Demo starts with ₹48,500 bank balance, ₹23,000 reserved, and ₹25,500 Safe to Spend. It includes a Sony Headset, New Car, Emergency Fund, five contributions, and one withdrawal. This is clearly labeled sample data.

## Money model

All amounts are integer paise. Saved amounts are derived from immutable contributions minus withdrawals.

```text
Safe to Spend = tracked bank balance − savings allocations − remaining current-period allowances
```

Paying a goal reduces available funds and increases that goal's savings. Requesting money does the reverse. Neither action changes the entered bank balance or transfers real money.

Allowances reserve their remaining current-period amount. Recording an expense decreases the tracked bank balance and the remaining allowance together: a ₹1,000 balance with a ₹100 food allowance leaves ₹900 Safe to Spend; spending ₹30 produces a ₹970 balance, ₹70 allowance, and still ₹900 Safe to Spend. Overspending requires confirmation and is recorded accurately. No real money moves through Paycebo.

Daily allowances reset at local midnight, weekly allowances on Monday, and monthly allowances on the first day. Unused amounts do not carry forward. Resets are derived from timestamps and never create fictional transactions. Renewal deficits remain visible and block new savings contributions. Editing applies immediately to the current period; archiving releases the remaining reservation and preserves expenses.

Contributions must fit both available funds and the remaining target. Requests cannot exceed the goal's savings. Updating the bank balance below total allocations keeps the history and displays negative availability, blocking new contributions until funds are available.

Weekly pledges count net contributions from Monday midnight in the device's local timezone. On or after the due weekday, opening/foregrounding Paycebo or opening a goal chat generates at most one reminder per goal per week. Requests are capped at the remaining target. There are no background notifications or AI calls.

## Local persistence

`src/lib/repository.ts` serializes updates and validates every snapshot before writing. State is published only after storage succeeds. Personal/demo snapshots and the current-mode selector use separate AsyncStorage keys:

- `paycebo:personal:v1`
- `paycebo:demo:v1`
- `paycebo:mode:v1`
- `paycebo:onboarding:v1` — separate versioned setup draft, cleared after successful personal activation.

Unknown or invalid stored formats produce a recovery error and are never automatically overwritten. Historical reminders remain as originally written when the tone changes. Failed reminder writes do not prevent access to existing savings.

Snapshots use schema version 2. Version 1 snapshots migrate in memory without changing savings or transaction history; the next successful update persists version 2 under the existing keys. Native photos live in app-owned Documents storage; browser photos are JPEG blobs in IndexedDB (`paycebo-photos`). Snapshots hold validated photo IDs rather than temporary picker paths. Failed saves retain staged photos for retry; cleanup waits for in-flight saves and checks both sessions before deleting a file.

AsyncStorage is device-local; this MVP has no encrypted backup. Uninstalling the app or clearing storage removes the data. Accounts, syncing, bank integration, real transfers, and cloud backups are outside this MVP.

## Checks

```sh
npm test
npm run typecheck
npm run verify:source
npm run doctor
npm run export
```

`npm test` runs the domain and persistence tests with Node's native TypeScript stripping and does not require installed app dependencies. Source parsing is supplementary; it is not a substitute for the full app typecheck or bundling.

Verification in this environment:

- 50 domain/repository/onboarding/allowance tests passed, including migration, period boundaries, funding deficits, concurrent expenses, setup retries, and draft recovery.
- Full app TypeScript check and source parsing passed.
- Expo production export passed for Android, iOS, and web.
- Production-browser checks passed at 390×844, 320×640, and 1280×900 for onboarding/resume, first allocation, allowance spending/overspending, photos surviving restart and removal, Activity, allowance editing/archival, and compact zero-balance setup. Screenshots are under `.impeccable/review/`.
- Native UI verification remains open: no Android device was attached, the available emulator failed to create its lock file, and iOS Simulator is unavailable on this Windows machine. Browser checks supplement native QA.

For manual acceptance scenarios, see [QA.md](QA.md). Product intent and design tokens are in [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md). The feature and one-time Pro roadmap is in [ROADMAP.md](ROADMAP.md). Historical design attribution is retained in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
