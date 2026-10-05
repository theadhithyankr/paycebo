# Paycebo

Pay your future self. A phone-first Expo savings tracker with goals as contacts, payments as conversations, and a dark native adaptation of StyleUI's Notio design.

## Run

Requires Node 22.13+ (Node 24 recommended), npm, and an Expo SDK 55-compatible Expo Go app or a development build.

```sh
npm install
npm start
```

On Windows PowerShell, use `npm.cmd` and `npx.cmd` if script execution is disabled.

Scan the QR code in compatible Expo Go, or run `npm run android` with a connected device/emulator. iOS Simulator requires macOS and Xcode. `npm run web` opens a browser preview using React Native Web; browser QA does not replace native-device QA.

Dependencies follow Expo's official SDK 55 template and bundled native module versions, with stable NativeWind 4.2.7 / Tailwind 3.4.19. Registry access was blocked here, so `package-lock.json` will be generated on the first successful installation. Commit that generated file once installation succeeds.

## What works

- Personal setup with a manually entered bank balance and first goal.
- Separate, persistent demo and personal sessions, switchable in Settings.
- Home balance breakdown, horizontal goal contacts with animated progress rings, and recent activity.
- Goal creation/editing, image URLs with initials fallback, color selection, optional weekly pledge and due weekday.
- Goal chat with contribution notes, signed withdrawals, dated reminders, and completed-goal feedback.
- Pay and Request Money forms with quick amounts, limits, and post-save confirmation.
- Playful withdrawal confirmation with a supportive-tone switch.
- Activity filters, balance reconciliation, and error states that retain entered information.

Demo starts with ₹48,500 bank balance, ₹23,000 reserved, and ₹25,500 Safe to Spend. It includes a Sony Headset, New Car, Emergency Fund, five contributions, and one withdrawal. This is clearly labeled sample data.

## Money model

All amounts are integer paise. Saved amounts are derived from immutable contributions minus withdrawals.

```text
Safe to Spend = entered bank balance − net allocations across goals
```

Paying a goal reduces available funds and increases that goal's savings. Requesting money does the reverse. Neither action changes the entered bank balance or transfers real money.

Contributions must fit both available funds and the remaining target. Requests cannot exceed the goal's savings. Updating the bank balance below total allocations keeps the history and displays negative availability, blocking new contributions until funds are available.

Weekly pledges count net contributions from Monday midnight in the device's local timezone. On or after the due weekday, opening/foregrounding Paycebo or opening a goal chat generates at most one reminder per goal per week. Requests are capped at the remaining target. There are no background notifications or AI calls.

## Local persistence

`src/lib/repository.ts` serializes updates and validates every snapshot before writing. State is published only after storage succeeds. Personal/demo snapshots and the current-mode selector use separate AsyncStorage keys:

- `paycebo:personal:v1`
- `paycebo:demo:v1`
- `paycebo:mode:v1`

Unknown or invalid stored formats produce a recovery error and are never automatically overwritten. Historical reminders remain as originally written when the tone changes. Failed reminder writes do not prevent access to existing savings.

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

- 26 domain/repository tests passed.
- Strict typecheck of model, demo, and repository modules passed with an existing local TypeScript compiler.
- All 19 app/library TS/TSX files parsed with no syntax errors.
- Dependency installation was blocked by network EACCES. Full app typecheck, Expo diagnostics, production exports, and native/browser visual checks remain unverified.
- No Android device was attached; iOS Simulator is unavailable on this Windows machine.

For the manual acceptance scenarios, see [QA.md](QA.md). Product intent and design tokens are recorded in [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md). Notio attribution is in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
