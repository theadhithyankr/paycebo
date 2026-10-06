# Paycebo acceptance checks

Run on an Android phone/emulator and an iPhone with dependencies installed. Capture native screenshots of Home, setup, goal chat, payments, allowance details, expense confirmation, and photo selection. Include a large-text pass; browser screenshots are supplementary.

## First run and isolation

1. Fresh storage opens the welcome screen. Start setup: progress shows 20% for starting. Choose a goal, set a target of 500, enter a balance of 1000, and reserve 100. Progress advances to 40%, 60%, 80%, then 100% only after saving. Home shows ₹1,000 bank balance, ₹100 reserved, ₹900 Safe to Spend, and a 20% goal ring.
2. In Settings, enter demo mode. Home displays the sample-data banner and sample balance breakdown.
3. Modify demo data, then open personal savings. The original personal balance/goals are unchanged. Restart and confirm the last selected session returns.
4. Demo → Make it yours resumes existing personal savings rather than recreating or resetting it.
5. Repeat setup with “I’ll save later”: create one goal and no transactions. A zero balance also permits finishing with “Create my goal”.
6. Close/restart during setup. Resume at the unfinished question with previous answers. Back navigation preserves inputs; changing the balance or target revalidates the first allocation.
7. Double-tap the final action and retry failed snapshot/selector writes. Create one goal and at most one contribution; display no success until personal activation completes.
8. Corrupt the separate setup draft. Retry reading or explicitly restart unfinished setup; preserve all personal/demo savings. An existing personal session takes precedence over any stale draft.

## Goal lifecycle

1. Create a goal with an optional gallery/camera photo, target, color, weekly pledge, and due weekday. Existing HTTPS images remain compatible. It appears as a contact.
2. An invalid or unavailable image falls back to readable initials. Edit the image and confirm the fallback resets.
3. Pay ₹200 to the 500 target goal with a note. Its chat shows the amount/note, the ring shows 40%, available funds become ₹800, and bank balance stays ₹1,000.
4. Cancel a ₹50 withdrawal confirmation. Nothing changes. Confirm it, and verify a −₹50 chat transaction, ₹150 saved, 30% progress, and ₹850 available.
5. Request all saved funds. Savings reach zero; further requests are disabled.
6. Fund a goal completely. Progress reaches 100%, the completion message appears, and further payments are disabled.
7. After a withdrawal, lower the target to the current savings. Historical payments remain readable and the goal is complete.

## Validation and storage

1. Reject empty/non-numeric/negative/zero transaction amounts, exponent notation, and more than two decimal places. Accept ₹0.01.
2. Reject payments over available funds or the target remainder, requests over saved funds, and targets below current savings.
3. Rapidly double-tap Pay/Request. Exactly one transaction is created.
4. Update bank balance below total allocations. Display negative availability, preserve goal history, and offer balance review before new contributions.
5. Restart after transactions, goal edits, tone changes, and balance updates. Values and history remain.
6. Simulate storage write rejection: retain the form's amount/note, display a useful error, and publish no success or balance change. Retrying succeeds without duplicating a transaction.
7. Provide corrupt/unsupported stored data: show the preserved-data error, and ensure demo or setup does not silently overwrite it.

## Photos and allowances

1. Choose a gallery image and take a camera photo for both a goal and an allowance. Confirm the circular preview, save, restart, and verify persistence. JPEG output has a longest edge no greater than 1,024 pixels.
2. Cancel selection, deny camera permission, or remove/replace an image. Cancel/denial preserves the previous image; removal uses initials. Existing HTTPS images remain valid. Missing local images also use initials.
3. Fail photo/snapshot writes and retry. Keep the selected image and form values. Dismiss during a save: cleanup waits for the write and never deletes the newly referenced file or a file referenced by the other session.
4. Set bank balance to ₹1,000, reserve ₹100 for food, and record ₹30 spending. Verify bank ₹970, allowance ₹70, and Safe to Spend ₹900. Savings allocations remain unchanged.
5. Record ₹120 more. Confirm the over-budget dialog before committing; bank becomes ₹850 and the allowance shows ₹50 overspent. Spending beyond the tracked bank balance is rejected.
6. Check local midnight, Monday, month/year boundaries, foregrounding after a missed reset, and keeping the app open at midnight. No rollover or synthetic deposits/transactions appear.
7. Edit frequency/amount and verify the current-period reservation preview. Reservations cannot worsen a deficit. Archive an allowance: release its remaining reservation and retain all expenses in Activity.
8. Restore a version 1 snapshot: verify unchanged money/history and empty allowances/expenses. Only a subsequent successful write changes the stored snapshot to version 2. Corrupt snapshots remain protected.

## Reminders and tone

1. With a pledge due today and no weekly contributions, open the app/chat. One dated reminder appears with the correct remaining amount.
2. Reopen repeatedly the same week. No duplicate is created. In the next week, an unmet pledge produces one new reminder.
3. Contributions before Monday do not count this week; requests within the week decrease its net contributions.
4. Met pledges, fully funded goals, and zero/empty pledges generate no new reminder.
5. Disable playful tone. New reminders and withdrawal confirmations become supportive; old chat messages remain unchanged.
6. Simulate a reminder write failure. Existing savings remain accessible and a visible reminder error appears on Home.

## Native UI

- Check a compact phone and long goal names/notes, large INR amounts, large system text, and safe areas.
- Ensure amount/note fields and submit actions remain reachable with the keyboard open.
- Verify hardware/system Back, iPhone edge-swipe, modal Close, and Android confirmation Back cancellation.
- Confirm screen readers announce goal progress, button labels, disabled states, and form errors.
- Enable Reduce Motion/Remove animations. Progress updates without the ring animation.
- Check green/dark headers and light forms, goal chat, both payment types, allowance details, expense confirmation, completion, filters, Settings, and empty/error screens.

## Appearance and Android widgets

1. Fresh preferences follow the device. Set Dark, restart, and confirm dark surfaces, fields, dialogs and dock. Set Light; select System and change the OS appearance. Failed preference writes preserve the active choice and offer retry.
2. Custom goal name stays fully visible above the keyboard and Continue. Check the lowest field on goal, allowance, balance, expense and payment forms; sticky actions stay reachable with the IME open.
3. At Android font scale 1.3, balance tiles reflow to bank above saved/allowance. Scroll Home and Settings to the final row; the floating dock must not block it.
4. Pin Balance, Goal and Allowance. Some launchers skip initial configuration: the app-preview personal item appears by default. Add through the system widget picker to choose an item before placement, or long-press an installed widget to reconfigure.
5. Reconfigure each instance independently. Hide amounts and verify both pixels and accessibility labels omit money. Cancelling leaves the previous settings intact. Corrupt widget preferences can reset widget metadata without altering savings.
6. Widget taps activate existing personal savings even from demo mode; goal and allowance taps open the selected item. Repeat from a cold app start. Missing/archived items show a recovery prompt.
7. Confirm updates after personal saves, foregrounding, and widget resizing. Check launcher-specific minimum sizes and long values/names. Periodic refresh is best effort: Android battery/launcher restrictions may delay it; show the update time.
8. Confirm Expo Go, iOS and web show the supported-platform explanation without loading the native widget module.

## Current verification boundary

65 automated tests, full TypeScript checks, 48-source-file parsing and production exports for Android/iOS/web passed. Browser walkthroughs passed for setup/resume, allowances and overspending, photos/restart/removal, editing/archival, activity, compact zero-balance setup, theme persistence/OS changes/write failure, floating dock geometry and cold widget links.

An EAS preview APK compiled successfully (build `28232066-5173-47cb-955c-bf72dfe3adcc`). It contains the initial implementation. Native inspection found a keyboard inset overlap and pinning behavior differences; these were corrected afterward. Current source was exported into a locally debug-signed QA APK using the same compiled native shell. This local QA artifact is not a fresh EAS distribution build.

On a workspace-only API 35 emulator (1080?2400, density 420), checked funded custom-goal setup, the full name field and action above the IME, allowance creation with its keyboard, aligned success badge, light/dark Home, theme controls, floating dock and final-row scrolling, all three widget families pinned/rendered, per-instance amount hiding including accessibility labels, a goal widget opening personal data from demo, and cold navigation after background process termination. Home and Settings were inspected at font scale 1.3; the emulator was restored to 1.0. Native captures are under `.impeccable/review/native-*.png`; README includes selected captures with sample data.

The local Gradle build failed before application compilation because Windows denied renaming Gradle cache transform directories. EAS compilation succeeded. A fresh EAS build is required to distribute the final keyboard/pinning fixes. iOS runtime, physical-device gestures/camera/performance, full screen-reader navigation, minimum-size widget resizing and battery-restricted/background period refresh remain device acceptance checks. No user retention measurement has been performed.

Final Impeccable finish-review disposition: **ship** for the reviewed Android phone surfaces, including font scale 1.3. Broader acceptance boundaries above still apply.

## Goal funding recovery

- At ₹20 balance, request ₹14,000 toward an unfinished goal. Verify the shortfall window and example. Cancel preserves amount/note and changes no money.
- Test both set-balance and top-up actions: bank ₹14,000, goal savings ₹14,000, Safe to Spend ₹0, one contribution, unchanged target. Existing reservations increase the required balance; do not release them.
- Failed writes apply neither balance nor contribution. Retry once; double-tapping creates one contribution. Changed balance/reservations require fresh confirmation. Invalid inputs and target overflow produce validation errors before the funding window.
- Disable the explanation in the window; restart and re-enable in Settings. Failed preference writes retain the previous choice and do not affect money saves. Demo and personal mode share this device preference.
- Check aligned balance rows in both themes, compact widths, font scale 1.3 and long amounts. Confirm unfinished goals keep Pay accessible with zero/negative availability; funded goals remain disabled.

Funding extension verification: all 65 tests, TypeScript, 48-source parsing and exports passed. Isolated browser checks cover both actions, cancel, atomic write failure/retry, duplicate submission, explanation persistence and failed preference writes, Settings restoration, dark/light/compact popup and aligned amount edges. Existing theme and full-flow walkthroughs also passed. Current locally signed API 35 QA APK confirms the actual ₹20-to-₹14,000 top-up, Cancel retaining input, hint hiding, truthful success totals, Pay access at zero availability and Home balance rows at font scale 1.3 (restored to 1.0). Captures use sample data. A fresh EAS build is still required for distributing this source.
