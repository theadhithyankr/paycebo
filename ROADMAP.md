# Paycebo roadmap

The current release includes the green light/dark design, lean onboarding, local goal photos, recurring allowances, and Android home-screen widgets. The items below are future work, not implemented features.

| Priority | Addition | Suggested access |
| --- | --- | --- |
| 1 | Manual backup/restore with photos | Free |
| 2 | Optional scheduled saving/allowance reminders | Free |
| 3 | Savings forecasts and detailed monthly trends | Pro |
| 4 | Additional color themes and widget customization | Pro |
| Later | Cloud backup and device sync | Evaluate recurring costs separately |

## India-first revenue experiment

Keep everyday saving, allowances, photos, and history free. After valuable Pro features exist, test a ₹299 one-time Pro unlock. Downloads of a free app do not themselves produce revenue. Show an optional Pro offer after users experience the app; keep it out of onboarding.

Use a non-consumable Google Play product with purchase acknowledgment, entitlement verification, and restoration. Digital feature purchases generally require Play Billing unless an applicable regional program exception is used. No billing code or paywall is included in this release. See [Google's payments policy](https://support.google.com/googleplay/android-developer/answer/9858738) and [purchase processing](https://developer.android.com/google/play/billing/integrate).

At 100 purchases, ₹299 produces ₹29,900 gross. An illustrative 15% fee leaves ₹25,415 before taxes, refunds, and other costs. India currently falls under the enrolled 15% tier for the first US$1 million of annual revenue; confirm the applicable tier in Play Console before launch. This is an example calculation, not a sales forecast. [Google Play service fees](https://support.google.com/googleplay/android-developer/answer/112622)

## Play release preparation

Build the existing production AAB profile with `npx eas-cli@latest build --platform android --profile production`. Complete native device QA, provide a public and in-app privacy policy, and submit accurate Data safety declarations reflecting local photos and money records. No cloud upload is performed by the current photo feature. [Privacy requirements](https://support.google.com/googleplay/android-developer/answer/10144311)

For new personal developer accounts created after November 13, 2023, Google requires at least 12 continuously opted-in closed testers for 14 days before applying for production access. [Testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)
