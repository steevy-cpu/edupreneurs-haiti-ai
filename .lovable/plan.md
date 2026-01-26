
# Fix: React useState Null Dispatcher Errors During Page Navigation

## Problem Statement

When navigating between pages, users encounter a critical React error:
```
TypeError: Cannot read properties of null (reading 'useState')
```

This error occurs in:
- `ReportDialog` (src/components/feed/ReportDialog.tsx)
- `CreatePostDialog` (src/components/feed/CreatePostDialog.tsx)

The error triggers the ErrorBoundary and shows users the "Oops! Yon bagay mal pase" error page.

## Root Cause Analysis

The "null dispatcher" error in React happens when `useState` is called while React's internal `ReactCurrentDispatcher.current` is null. This occurs during page transitions when components attempt to render while React is in an unstable state.

### Current Rendering Patterns in Feed.tsx

| Dialog | Current Pattern | Has Error? |
|--------|-----------------|------------|
| `EditPostDialog` | `{editingPost && <EditPostDialog ... />}` | No |
| `CreatePostDialog` | `{!isVisitor && <CreatePostDialog ... />}` | Yes |
| `ReportDialog` | Always rendered (unconditional) | Yes |

### Why EditPostDialog Works

`EditPostDialog` is **only mounted when its primary prop is available** (`editingPost`). This means:
1. The component never tries to render during unstable transitions
2. No hooks are called when the guard condition fails
3. The component only exists in the React tree when needed

### Why the Others Fail

- **CreatePostDialog**: Rendered when `!isVisitor` but `currentUser` can be null during transitions
- **ReportDialog**: Always rendered with empty string fallbacks (`postId=""`, `reportedUserId=""`), meaning it attempts hook calls during every render, including unstable navigation periods

## Solution

Apply the same stable rendering pattern used by `EditPostDialog` to both problematic dialogs.

---

## Implementation Details

### File: `src/pages/Feed.tsx`

### Change 1: Guard CreatePostDialog with `currentUser` check

**Location:** Line 1015

**Current:**
```typescript
{!isVisitor && <CreatePostDialog currentUser={currentUser} onPostCreated={refreshFeed} />}
```

**Fixed:**
```typescript
{!isVisitor && currentUser && (
  <CreatePostDialog currentUser={currentUser} onPostCreated={refreshFeed} />
)}
```

**Why:** Ensures `CreatePostDialog` only mounts when both:
1. User is not a visitor
2. `currentUser` is loaded (not null)

---

### Change 2: Guard ReportDialog with conditional rendering

**Location:** Lines 1369-1379

**Current:**
```typescript
{/* Report Post Dialog */}
<ReportDialog
  isOpen={reportDialogOpen}
  onClose={() => {
    setReportDialogOpen(false);
    setPostToReport(null);
  }}
  postId={postToReport?.id || ""}
  reportedUserId={postToReport?.user_id || ""}
  reportedUserName={postToReport?.profile?.full_name || postToReport?.profile?.nickname}
/>
```

**Fixed:**
```typescript
{/* Report Post Dialog */}
{reportDialogOpen && postToReport && (
  <ReportDialog
    isOpen={reportDialogOpen}
    onClose={() => {
      setReportDialogOpen(false);
      setPostToReport(null);
    }}
    postId={postToReport.id}
    reportedUserId={postToReport.user_id}
    reportedUserName={postToReport.profile?.full_name || postToReport.profile?.nickname}
  />
)}
```

**Why:** 
1. Component only mounts when the dialog should actually be shown
2. Eliminates empty string fallbacks - component receives valid data
3. Mirrors the successful `EditPostDialog` pattern exactly

---

## Pattern Comparison

```text
Before:
├── EditPostDialog: {editingPost && <Component />}        ✅ Works
├── CreatePostDialog: {!isVisitor && <Component />}       ❌ Crashes
└── ReportDialog: <Component isOpen={...} />              ❌ Crashes

After:
├── EditPostDialog: {editingPost && <Component />}        ✅ Works
├── CreatePostDialog: {!isVisitor && currentUser && ...}  ✅ Fixed
└── ReportDialog: {reportDialogOpen && postToReport && ...} ✅ Fixed
```

---

## Technical Explanation

### Why This Prevents the Error

When React navigates away from `/feed`:
1. State gets reset/cleaned up
2. React's dispatcher can momentarily become null
3. If a component tries to call `useState` at this moment → crash

With guard conditions:
1. Guard evaluates to `false` first (state is reset)
2. Component is never mounted
3. No hooks are called
4. No error occurs

### Why We Don't Need Internal Component Guards

The guard at the **parent level** prevents the component from ever attempting to render. This is more efficient than having the component render and then early-return, because:
- No hook calls are made
- No component function is executed
- React's reconciler skips the subtree entirely

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - same behavior, just guarded |
| Works with existing data? | Yes - uses existing state variables |
| 3G optimized? | Yes - no additional network calls |
| Backward compatible? | Yes - no API changes |
| Edge cases handled? | Yes - null/undefined guards prevent errors |

---

## Summary of Changes

| File | Location | Change |
|------|----------|--------|
| `src/pages/Feed.tsx` | Line 1015 | Add `currentUser &&` to CreatePostDialog guard |
| `src/pages/Feed.tsx` | Lines 1369-1379 | Wrap ReportDialog in `{reportDialogOpen && postToReport && ...}` |

---

## Expected Outcome

After these changes:
- No more "Cannot read properties of null" errors during page transitions
- Dialogs only render when their dependencies are stable
- ErrorBoundary won't be triggered by these components
- Users can navigate between pages without seeing the error page
