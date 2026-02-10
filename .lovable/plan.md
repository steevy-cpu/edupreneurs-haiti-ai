

# Switch MonCash Back to Live Mode

## What Will Change
Update the `MONCASH_MODE` secret from `sandbox` to `live` so both payment functions use your real MonCash credentials.

## Technical Detail
No code changes needed. The edge functions already read `MONCASH_MODE` and select credentials accordingly. We just need to update the secret value.

## Step
Set the **MONCASH_MODE** secret to `live`. You can do this yourself in **Settings > Secrets** by updating the value, or I can do it for you once you approve this plan.

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- just toggling a secret value |
| Backward compatible? | Yes -- sandbox secrets remain saved for future use |
| Code changes required? | None |

