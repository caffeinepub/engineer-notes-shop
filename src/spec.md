# Specification

## Summary
**Goal:** Make the Admin Dashboard and header clearly explain admin access/loading/errors and ensure the “Upload PDF” button reliably appears for admins when products load.

**Planned changes:**
- Add explicit diagnostic states on the Admin Dashboard for admin-check and admin-products queries (not signed in / not admin / query error), including English explanations and retry actions for query failures.
- Ensure each admin product card renders a visible, clickable “Upload PDF” button whenever products are successfully loaded and the caller is an admin; prevent unrelated page-level loading states from hiding/disabled the button.
- Scope “Upload PDF” disabled state to only the product currently uploading, while other product cards remain enabled.
- Update global header navigation to always show an Admin entry when authenticated, with clear English status (checking permissions / not authorized) and enable navigation to `/admin` when allowed (or to show Access Denied messaging).

**User-visible outcome:** Admins can always find the Admin area, understand why access or data may be unavailable, and reliably upload PDFs per product with clear per-product progress/disabled behavior.
