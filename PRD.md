# Product Requirements Document (PRD) & Architecture Blueprint: Cloud Hotel PMS

---

## 1. Executive Overview

### Core Value Proposition

The software is a full-lifecycle, cloud-native **Property Management System (PMS) and Channel Manager** designed for independent hotels, boutique stays, bed-and-breakfasts (BnBs), and serviced apartments. It eliminates fragmented operational tooling by unifying front-desk management (reservations, calendar tape chart, check-in/out, room moves), housekeeping operations, automated night audits, guest CRM, folio billing with regional tax compliance (Indian GST/CGST/SGST), granular role-based access control (RBAC), and bi-directional OTA channel distribution (Booking.com, Agoda, MakeMyTrip, Airbnb, Google Hotel API).

### Target User Personas

* **Hotel General Manager / Owner:** Needs portfolio-wide visibility, ADR/RevPAR performance analytics, channel rate distribution control, and daily manager audit reports.
* **Front Desk Agent / Receptionist:** Requires sub-second operations for guest check-in/check-out, walk-in bookings, tape-chart drag-and-drop allocations, folio settlements (Cash/UPI/Cards), and instant generation of booking vouchers and GST-compliant tax invoices.
* **Housekeeping Supervisor:** Needs real-time room hygiene tracking (Dirty, Clean/Available, Maintenance, Occupied) linked directly to the front-desk checkout triggers.
* **Revenue / Channel Manager:** Focuses on dynamic rate derivation (percentage/fixed markups across OTAs), stop-sells, minimum/maximum length-of-stay rules, and inventory sync.
* **Hotel Accountant / Night Auditor:** Executes end-of-day revenue reconciliation, ledger balancing (City Ledger, Advance Ledger, Guest Ledger), tax calculations, and financial day close.

---

## 2. Exhaustive Feature Inventory

| Feature Name | Category | Trigger / Action | Expected Result |
| --- | --- | --- | --- |
| **Global Reservation Filtering** | Navigation / Filter | User clicks tabs: *Reservations*, *Arrivals*, *In-House*, *Departures*. | Filters the active reservation card/table list based on current operational guest status. |
| **Search & Attribute Filter** | Search / Filter | User types into search input (Name, Email, Phone) or toggles *VIP* / *Single Lady*. | Instantly filters matching reservations across the visible list without full page reload. |
| **Booking Source Filter** | Filter | User selects an option from *Booking Source* dropdown (e.g., Agoda, MMT, Walk-in). | Filters reservations attributed strictly to that channel or walk-in source. |
| **Contextual Reservation Actions** | Core Action | User clicks three-dot menu on any reservation card. | Opens popover menu with options: *Edit*, *Amend Stay*, *Room Move*, *Group Room Move*, *Cancel Reservation*, *No Show*, *Print*, *Check-in / Check-out*. |
| **Group Room Move Modal** | Core Action | User clicks *Group Room Move* in the action menu. | Opens modal showing all booked rooms; user maps current rooms to new proposed rooms via dropdowns and clicks *Move*. |
| **Add Reservation (Walk-In/Direct)** | Core Action | User clicks `+ Create Reservation` button in the top navigation. | Navigates to `/reservations/create` multi-section form with Stay Details, Room Config, Guest Details, and live Billing Summary. |
| **Stay Details Configuration** | Data Entry | User inputs Check-In/Check-Out dates/times, selects Market Segment, and toggles VIP/Single Lady/No Posting/Complimentary flags. | Auto-calculates duration badge (e.g., "5 Nights"); updates availability and booking parameters. |
| **Multi-Room Rate Configuration** | Data Entry | User selects Room Type, Rate Plan, sets adult/child count, adjusts room rate (Rs), and clicks `+ Add More Room`. | Adds multiple line items to the booking; recalculates taxes and totals in real time in the sticky billing panel. |
| **Advance Payment Collection** | Billing / Entry | User toggles *Collect Advance Payment*, enters Amount, selects Payment Method (Cash, UPI, Card), and enters Reference ID. | Deducts amount from Balance Due; prepares initial credit entry on folio ledger upon confirmation. |
| **Booking Voucher Generator** | Output / Print | User clicks *Print* > *Voucher* on reservation. | Displays branded modal with check-in/out policies, room rate, payment status, and actions: *Print Voucher* or *Send Voucher*. |
| **GST Tax Invoice Generator** | Billing / Output | User clicks *Print* > *Invoice* on a checked-out reservation. | Opens folio selector modal (`FOL_379`), then renders a preview of the legal invoice showing SAC/HSN codes, CGST (2.5%/6%), SGST (2.5%/6%), taxable amounts, and print trigger. |
| **Calendar / Tape Chart View** | Navigation / View | User clicks *Calendar View* in the sidebar (`/schedule/calendar`). | Renders a multi-row visual timeline of room types and physical room numbers against horizontal dates with occupancy percentages. |
| **Quick Booking / Maintenance Block** | Core Action | User clicks on an empty room cell or drags across dates in the Calendar View. | Modal opens giving options: *Maintenance Block* (out-of-order room lock) or *Quick Booking* (pre-fills room and dates). |
| **Density & Date Controls** | View / Controls | User toggles *Cozy / Wide* density buttons or changes the calendar date picker. | Re-renders cell widths for dense operational viewing or expands for detailed guest tags. |
| **Housekeeping Room View** | Operations | User navigates to *Room View* (`/room-view`). | Renders grid cards of all rooms grouped by room type, displaying status badges: *Available* (Green), *Occupied* (Blue), *Maintenance* (Orange), *Dirty* (Red). |
| **Rates & Inventory Grid** | Revenue Mgmt | User navigates to `/rates-and-inventory` and selects subtabs (*All Rates*, *Min Nights*, *Max Nights*, *Stopouts*, *CTA*, *CTD*). | Displays matrix of room types and dates; allows inline edits of base rates, extra adult, and extra child rates. |
| **Interactive Stopouts (Stop-Sell)** | Revenue Mgmt | User clicks on any room/date intersection in the *Stopouts* tab. | Toggles a red prohibition symbol (stop-sell), blocking OTA and direct availability for that specific date. |
| **Bulk Rate / Restriction Update** | Revenue Mgmt | User clicks *Bulk Update* button. | Modal opens: selects Room Types, Rate Plans, Date Range, Days of Week (Mon-Sun toggles), and targets (Rates, Min/Max Nights, Stop Sell, CTA, CTD). |
| **OTA Channel Connections** | Channel Mgmt | User navigates to *OTAs & Channels* tab under Rates & Inventory. | Displays table of connected OTAs (Google Hotel, MMT, Airbnb, Agoda, Booking.com) with Active status, *Full Sync*, and *Deactivate* controls. |
| **Channel Room & Rate Mapping** | Channel Mgmt | User clicks *Edit* on a channel row > selects *Mapping* tab. | Checkbox matrix allowing property manager to link local Room Types and Rate Plans to OTA channel inventory IDs. |
| **Derived Rates Rules Engine** | Channel Mgmt | User clicks *Channel Settings* in Channel Edit modal. | Allows setting rate derivation rules (e.g., Rate Model: "Decrease By Percent", Value: "70%", or markup rules). |
| **Night Audit Day-Close** | Audit / Finance | User navigates to `/night-audit`. | Checks pre-audit checklist (Pending checkouts, unsettled folios); displays history of completed daily audits with *View Details*. |
| **Night Audit Detail Drilldown** | Audit / Finance | User clicks *View Details* on an audit history record. | Modal displays *Summary*, *Room Charges* (folio-level net/tax tariff), *Checked Out* log, and *Overview* (occupied/vacant rooms and pax counts). |
| **Financial & Operations Reports** | Reporting | User navigates to `/reports` and selects a report (*Manager Report*, *Guest Details*, *Folio List*, *Night Audit*, *Reservations*). | Generates comprehensive financial breakdown (Room revenue, extra charges, taxes, payments, RevPAR/ADR); exports to Excel (`.xlsx`). |
| **Folio Operations & Ledger** | Billing / Finance | User clicks *Folio Operations* tab inside reservation details (`/reservations/edit/[id]`). | Displays full debit/credit ledger; provides buttons for `+ Add Charge`, `+ Add Payment`, and `Settle Folio`. |
| **Daily Room Charge Audit** | Billing / Finance | User clicks *Room Charges* tab in reservation details. | Displays itemized daily table showing stay date, room number, rate plan, pax, room charge, tax, and net amount with inline updates. |
| **Audit Trail Timeline** | Compliance / Log | User clicks *Audit Trail* tab in reservation details. | Displays chronological stream of system events (Reservation created, room moves, rate overrides, check-outs) with timestamps and actor attribution. |
| **Guest CRM Directory** | CRM | User navigates to `/guests`. | Tabular view of all historical guest profiles, phone numbers, booking counts, stay dates, and completion statuses. |
| **Staff Invitation & Team Mgmt** | Admin / Security | User navigates to `/my-team` and clicks *Invite Members*. | Modal opens to input email, assign target properties, and designate role per property. |
| **Granular RBAC Permission Matrix** | Admin / Security | User navigates to `/permissions` > *Manage Team*. | Interface with category-level toggles (Reservations, Night Audit, Rates & Inventory, Team, Dashboard, PII Access, Inventory CRUD, Ledger). |
| **Property Onboarding Wizard** | Admin / Settings | User navigates to *Properties* > *Create Property*. | Multi-step form capturing Address, Operations (Currency, Timezone, Check-In/Out times), and GST Details (GSTIN, Legal/Trade name). |
| **Meal Plan Configuration** | Configuration | User navigates to *Properties* > *Meal Plans* > *Add Meal Plan*. | Modal captures Code (EP, CP, MAP, APAI), inclusions (Breakfast, Lunch, Dinner, Snacks with operating hours), pricing model, and adult/child rates. |
| **Room Type & Physical Room CRUD** | Configuration | User navigates to *Properties* > *Rooms* (Tabs: *Room Types* and *Rooms*). | Configures room tiers (base/max occupancy) and batch-creates physical room numbers assigned to room types. |
| **Service Categories & Taxes** | Configuration | User navigates to *Properties* > *Tax & Services*. | Configures folio billing items (Room Charges, F&B) and links them to government tax slab rules (e.g., India Hotel Slab GST). |

---

## 3. Core User Journeys

### Flow 1: Direct Walk-In Reservation to Payment & Voucher Generation
- Create Walk-in -> Stay details -> Room config -> Guest Info -> Live GST Billing Summary -> Advance Payment -> Print Voucher.

### Flow 2: Calendar-Driven Room Allocation & Maintenance Block
- Calendar Tape Chart -> Date cell drag/click -> Quick Booking or Maintenance Block (AC repair, deep clean).

### Flow 3: Room Move & Multi-Room Group Reassignment
- Locate booking -> Group Room Move modal -> Remap rooms -> Real-time conflict check -> Update calendar & audit trail.

### Flow 4: Folio Settlement, Check-Out & GST Invoice Generation
- In-House guest -> Folio settlement (Cash/UPI/Card) -> Balance zeroed -> Status CHECKED_OUT -> Room auto-marked DIRTY -> Print legal GST Tax Invoice (SAC/HSN, CGST, SGST).

### Flow 5: Daily Night Audit Routine & Financial Close
- Pre-audit checklist (checkouts, folios) -> Post daily room tariffs & GST -> Roll forward business date -> Generate audit record -> Download Manager Report (.xlsx).

### Flow 6: Bulk Rate Distribution & OTA Channel Sync
- Rates & Inventory -> Bulk Update (Dates, days of week, base/extra adult/child rates, stop-sell, min/max stay) -> Channel Sync with Derived Rates (-70% / markup) pushed to Booking.com, Agoda, MMT, Google Hotel.

---

## 4. Database Schema Blueprint (PostgreSQL DDL)

See relational tables:
- `properties`
- `room_types`
- `rooms`
- `meal_plans`
- `rate_plans`
- `inventory_rates`
- `guests`
- `reservations`
- `reservation_rooms`
- `folios`
- `folio_transactions`
- `night_audits`
- `audit_trails`

---

## 5. Technology Stack
- **Frontend:** React 18 / 19, Vite / Next.js, Lucide Icons, Modern CSS Design System / Tailwind
- **State Management & Data Layer:** Reactive Local PMS Store with Firestore / PostgreSQL RLS integration
- **Reporting & Printing:** Custom print stylesheets & XLSX export
