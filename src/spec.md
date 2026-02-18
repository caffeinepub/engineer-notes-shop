# Specification

## Summary
**Goal:** Allow the first signed-in user to claim store owner/admin access when the admin system is initialized but has no admins configured, and ensure admin state persists across upgrades.

**Planned changes:**
- Backend: Add a tokenless “claim initial admin/store owner” action that is available only when the admin system is initialized and the admin list is empty; ensure once claimed, it cannot be claimed again if an admin exists.
- Backend: Persist admin-system state across upgrades (initialized status and configured admin principal(s)) while preserving existing stored app data (products, categories, files, purchases, profiles).
- Backend: Expose admin-gating diagnostics that let the frontend distinguish signed-out, signed-in non-admin, admin system not initialized, and initialized-but-claimable states; ensure surfaced user-facing errors remain in English.
- Frontend (/admin): When signed in + initialized + not admin + claimable, show a prominent “Claim Store Owner Access” button that calls the backend claim action and transitions into the fully functional Admin Dashboard without a hard refresh.
- Frontend: Update React Query to add a mutation for the claim flow and invalidate/refetch relevant queries after success (admin check, admin products list, and diagnostics/initialization queries), with clear English error handling on failure.

**User-visible outcome:** If the admin system is initialized but has no admins, the first signed-in user can claim store owner access from /admin and immediately use the Admin Dashboard; after an owner exists, other users continue to see Access Denied. Admin status remains intact after upgrades.
