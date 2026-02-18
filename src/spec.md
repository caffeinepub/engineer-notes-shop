# Specification

## Summary
**Goal:** Fix backend admin authentication so the initialized owner principal is correctly recognized as admin.

**Planned changes:**
- Fix backend admin check logic to properly recognize the authenticated principal 'hmeax-fs32k-burgh-dx5q3-cud51-d77j7-y6kwa-fl2po-zzjpj-c74c2-rae' as admin
- Verify auto-initialization correctly assigns and persists the first authenticated user as admin across canister upgrades
- Remove or fix the 'Initialize as Owner' button to eliminate conflicting UI states

**User-visible outcome:** After refresh, the Admin Diagnostics panel shows 'Admin Check: Admin ✓' and the authenticated owner can access the admin dashboard without seeing 'Access Denied'.
