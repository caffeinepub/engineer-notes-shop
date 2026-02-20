# Specification

## Summary
**Goal:** Fix product visibility issues so that uploaded products appear correctly in category listings and ensure products have valid prices before publication.

**Planned changes:**
- Fix backend getProductsByCategory function to return all published products
- Verify and fix product publish/unpublish logic for proper storefront visibility
- Add backend validation requiring products to have a price before publishing
- Update admin dashboard to display product prices and validation warnings
- Add admin UI functionality to edit product price and purchase options
- Investigate and resolve the specific case of the uploaded product not appearing in category section

**User-visible outcome:** Admin can upload products with prices, see them in the admin dashboard, and have them automatically appear in the correct category listings on both draft and live storefronts once published.
