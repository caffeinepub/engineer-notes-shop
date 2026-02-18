# Specification

## Summary
**Goal:** Fix owner access auto-assignment for authenticated Google user (shrirangatre@gmail.com) so they can access the admin dashboard without permission errors.

**Planned changes:**
- Fix backend auto-owner assignment logic to correctly grant owner/admin access to principal 'hmeax-fs32k-burgh-dx5q3-cud51-d77j7-y6kwa-fl2po-zzjpj-c74c2-rae' when they are the first authenticated user
- Ensure isCallerAdmin() backend method returns true for the owner principal so admin checks pass
- Either fix the 'Initialize as Owner' button to correctly assign owner access when clicked, or remove it if auto-assignment on first authentication is working correctly

**User-visible outcome:** The authenticated user (shrirangatre@gmail.com) can access the admin dashboard without seeing the "Access Denied" screen. The Admin Diagnostics panel shows "Admin Check: ✓ Admin" with a green checkmark, and product data appears instead of "N/A (not admin)".
