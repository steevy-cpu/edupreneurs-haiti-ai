// Platform-wide free access kill-switch.
// TRUE  = every authenticated user gets full access: no paywalls, no locked features,
//         no trial-expired prompts. Used during the relaunch period.
// FALSE = normal subscription system (trial, promo, MonCash, Stripe, gifts) resumes
//         using the untouched statuses and dates in the database.
export const FREE_ACCESS_MODE = true;
