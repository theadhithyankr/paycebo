# Paycebo acceptance checks

Run on an Android phone/emulator and an iPhone with dependencies installed. Capture native screenshots of Home, chat, payment, withdrawal confirmation, and setup. Include a large-text pass; browser screenshots are supplementary.

## First run and isolation

1. Fresh storage opens the welcome screen. Start saving, enter a balance of 1000 and a goal target of 500, and complete setup. Home shows ₹1,000 available and no allocations.
2. In Settings, enter demo mode. Home displays the sample-data banner and sample balance breakdown.
3. Modify demo data, then open personal savings. The original personal balance/goals are unchanged. Restart and confirm the last selected session returns.
4. Demo → Make it yours resumes existing personal savings rather than recreating or resetting it.

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
- Check Home, goal chat, both payment types, completion, filters, Settings, and empty/error screens in dark mode.

## Current verification boundary

Automated domain/storage checks passed. App rendering, native accessibility, production bundling, and full app typecheck have not been run because package downloads were blocked. These scenarios are acceptance instructions, not claims of executed UI checks.

Source review disposition: **fix** — runtime verification remains open.

| Review item | Status |
| --- | --- |
| Setup storage-read recovery | Resolved in source |
| Long button label wrapping | Resolved in source |
| Activity summary wrapping | Resolved in source |
| Withdrawal dialog containment | Resolved in source |
| Native execution and visual verification | Unresolved: dependencies/device unavailable |
| Full app typecheck and export | Unresolved: dependencies unavailable |
