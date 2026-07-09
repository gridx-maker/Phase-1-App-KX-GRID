# KXGRID - Product Requirements Document

## Original Problem Statement
Build **KXGRID**, a unified operating platform for the KotlerX ecosystem. Central hub connecting all KotlerX brands, programs, students, crew, and partners with role-based access.

**Production URL**: https://kotlerx.in

## User Roles
- Public, Student, Crew/Trainer, Brand Head, Admin, KX ROOT (Super Admin)

## Core Features (Implemented)
- Brand Management, Program & Unit Management, Media Gallery
- NFC Systems, Contact & Leads, Partner Logo Marquee
- Career Opportunities, Super Admin Panel, PWA capability
- Promotional Banner Carousel (admin-manageable)
- KXCraft e-commerce page (`/kxcraft`) — admin-manageable with Buy Now buttons
- Flex Assessment Builder
- Workshop Registration with CSV export
- Student Registration, Admin Panel with multiple tabs
- Mobile-responsive landing page with hamburger menu
- Bulk team-member import endpoint + JSON export (added May 8, 2026)

## Permanently Disabled / Removed
- `sync_production_data.py` and `sync_production.py` — DELETED on May 8, 2026.
  Their `delete_many({})` calls were the root cause of the team_members data loss.
  Startup no longer imports or invokes any sync routine. Do not re-introduce
  destructive sync without an explicit, audited migration plan and a fresh backup.

## What's Been Done (Latest Session - Mar 23, 2026)

### Footer & Contact Section Redesign
- Moved Contact Us icons (Call, Mail, Location) from footer to "Have Questions?" section
- Removed duplicate Contact Us section from footer
- Redesigned footer as compact 2-column layout (Logo+Social | Newsletter)
- Added bottom bar with Copyright + Login links
- All layouts responsive for mobile and desktop

### Previous Session Work
- Fixed critical production outage (deployment config issue)
- Created auto-sync system from kotlerx.in on startup
- Full admin CRUD for KXCraft products
- Programs page filter tiles
- Director message mobile "Read More" toggle
- Standardized header logo across all pages
- Buy Now buttons on KXCraft product cards

## Architecture
```
/app/
├── backend/
│   ├── server.py              # Main API (5600+ lines - NEEDS REFACTORING)
│   ├── sync_production_data.py # Auto-sync from production
│   └── routers/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PromoCarousel.js
│   │   │   └── KotlerXLogo.js
│   │   └── pages/
│   │       ├── LandingPage.js    # Updated footer + contact section
│   │       ├── ProgramsPage.js
│   │       ├── AdminPanel.js     # KXCraft tab
│   │       └── KXCraftPage.js    # Dynamic, Buy Now buttons
```

## Pending Tasks (Prioritized)

### P0 - High Priority
- Refactor `server.py` into router modules (5600+ lines)

### P1 - Medium Priority
- Test PWA installation & offline
- Fix conditional occupation detail in Student Registration

### P2 - Future
- Sponsor & Partner Engine with tiers
- AdminPanel.js refactoring (6500+ lines)
- Student notifications/announcements
- Push notifications
- Crew performance analytics
- Google Sheets export (mocked)

## Credentials
| Role | Email | Password |
|---|---|---|
| Super Admin | root@kotlerx.com | KXRoot@2024 |
| Admin | admin@kotlerx.com | admin123 |
| Brand Head | KXGRIDBH@kotlerx.com | brandmgr123 |
| Crew | crew@kotlerx.com | crew123 |
| Student | regularstudent@kotlerx.com | student123 |
