# Specification

## Summary
**Goal:** Ensure the Admin Dashboard always shows a per-product “Upload PDF” control (or a clear inline error in its place), and add diagnostics to explain any admin/auth/query issues, while fixing admin recognition for the store owner in production.

**Planned changes:**
- Update the Admin Dashboard product card action area so every product reliably renders an “Upload PDF” button; if it cannot render, show a user-visible inline error message in the same location explaining why.
- Ensure the “Upload PDF” control is not hidden by responsive CSS and remains visible across mobile and desktop layouts; only disable it during an active upload for that specific product.
- Add an always-visible “Admin Diagnostics” section at the top of the Admin Dashboard showing authentication status, caller principal text, admin check status/result, admin products query status/result count, and any captured error messages.
- Fix backend admin determination so the store owner/canister controller (installer) is recognized as admin in production; admin-restricted methods succeed for that principal while still rejecting non-admin callers.
- Add stable, deterministic test selectors (data-testid) for each product’s upload action area and upload button (and for the inline error state), including the product id.

**User-visible outcome:** On `/admin`, admins always see an “Upload PDF” button on every product card (or a clear inline error explaining why it can’t display), diagnostics explain auth/admin/product-loading status, and the store owner can successfully upload PDFs in production while non-admins remain blocked.
