# Asha Granite PWA - Build Checklist

## PHASE 1: Foundation (Build First)
- [x] 1. Supabase project setup — all tables, RLS policies, seed data (SQL Created)
- [x] 2. React + Vite + Tailwind project scaffold
- [x] 3. PWA manifest + service worker config
- [x] 4. Auth system — login page, session persistence, role routing
- [x] 5. Owner Settings page — business info, store details, payment info
- [ ] 6. Employee management (CRUD within settings)
- [x] 7. Basic navigation shell (bottom nav for manager, sidebar for owner)

## PHASE 2: Inventory
- [x] 8. Product list page with search and filters
- [ ] 9. Product detail page
- [ ] 10. Add stock stepper (4 steps)
- [ ] 11. Photo upload to Supabase Storage
- [ ] 12. Stock batch tracking and display

## PHASE 3: Sales & Billing
- [ ] 13. New sale flow — customer info step
- [ ] 14. Product search and add to cart
- [ ] 15. Cart review with transport/other charges
- [ ] 16. Payment screen (all 3 payment states)
- [ ] 17. Delivery details step
- [ ] 18. Bill preview screen (exact format from Part 13)
- [ ] 19. Sale confirmation — DB writes, stock deduction
- [ ] 20. PDF generation (jsPDF + html2canvas)
- [ ] 21. WhatsApp share (Web Share API with PDF + pre-written message)

## PHASE 4: Operations
- [ ] 22. Delivery update flow (dispatch, delivered, collect balance)
- [ ] 23. Wastage logging
- [ ] 24. Customer request form
- [ ] 25. My Sales page (manager)
- [ ] 26. Pending deliveries view (manager)

## PHASE 5: Owner Dashboard
- [ ] 27. KPI cards (today's numbers)
- [ ] 28. Store comparison panel
- [ ] 29. Revenue + profit chart (Recharts)
- [ ] 30. Inventory health panel
- [ ] 31. Outstanding payments list + WhatsApp remind
- [ ] 32. Employee performance table
- [ ] 33. Top products list
- [ ] 34. P&L summary
- [ ] 35. Sales history page (full filterable list)
- [ ] 36. Employee detail drill-down
- [ ] 37. Wastage report page
- [ ] 38. Customer database page
- [ ] 39. Pending customer requests page

## PHASE 6: Polish
- [ ] 40. Offline support (Vite PWA plugin, IndexedDB queue)
- [ ] 41. Loading skeleton screens for all data-heavy pages
- [ ] 42. Error states and empty states
- [ ] 43. Toast notifications for all actions
- [ ] 44. "Add to Home Screen" prompt for first-time users
- [ ] 45. Performance audit — lazy load images, paginate long lists
