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

1. Create a goal with an optional HTTPS image URL, target, color, weekly pledge, and due weekday. It appears as a contact.
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
4. Update bank balance below total allocations. Display negative availability, preserve goal history, and disable new contributions.
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

## Current verification boundary

50 automated domain/storage/onboarding/allowance tests, full app typecheck, source parsing, and Expo exports for Android/iOS/web passed. Production-browser walkthroughs at 390×844, 320×640, and 1280×900 passed for onboarding/resume, funded setup, expense arithmetic and overspending, photo import/restart/removal, Activity, editing/archival, and compact custom-goal/zero-balance completion. Screenshots under `.impeccable/review/` supplement native QA. Expo configuration introspection confirms camera usage descriptions and removal directives for broad photo-library and microphone permissions.

Native accessibility, keyboard behavior, OS Back/predictive gestures, system font scaling, and iOS swipe behavior still need device testing. The local Android emulator could not create its lock file; no device was attached. iOS Simulator is unavailable on Windows. No user retention or usability measurement has been performed.

Source review disposition: **fix** — runtime verification remains open.

| Review item | Status |
| --- | --- |
| Setup storage-read recovery | Resolved in source |
| Long button label wrapping | Resolved in source |
| Activity summary wrapping | Resolved in source |
| Withdrawal dialog containment | Resolved in source |
| Native execution and visual verification | Unresolved: emulator lock-file access failure; no attached device |
| Full app typecheck and export | Passed for Android, iOS, and web |
| Onboarding browser walkthrough and compact-screen inspection | Passed; supplementary to native QA |
