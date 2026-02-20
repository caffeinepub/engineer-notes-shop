# Specification

## Summary
**Goal:** Fix admin authentication to allow authorized users to access the admin dashboard.

**Planned changes:**
- Fix backend admin principal registration to correctly recognize the authenticated user as admin
- Update backend isAdmin() query to return true for registered admin principals
- Fix frontend admin access verification in useQueries hooks to properly handle backend isAdmin response
- Ensure admin-protected routes and UI components correctly respond to admin status

**User-visible outcome:** Users with admin privileges can click the Admin menu option and successfully access the admin dashboard with full product management capabilities, without encountering authentication errors.
