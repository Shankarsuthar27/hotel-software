# Phased Engineering Milestone Plan & Technical Architecture Specification: Hotel PMS

---

## 1. Executive Technical Architecture Specification

### 1.1 Architectural Topology Overview

```mermaid
graph TB
    subgraph ClientLayer ["Client Presentation Layer (Next.js 15 / React 19)"]
        UI["Modern Responsive UI (Tailwind CSS + shadcn/ui)"]
        State["State Manager (TanStack Query + Zustand Store)"]
        TapeVirtual["Virtualized Tape Chart Canvas (TanStack Virtual)"]
        PrintEngine["Print / Document Engine (Native CSS Paged Media + PDF)"]
    end

    subgraph ApiLayer ["Application & Domain Services Layer (Modular Node.js / NestJS)"]
        ResSvc["Reservations & Booking Engine"]
        FolioSvc["Folio Ledger & GST Engine"]
        RatesSvc["ARI & Dynamic Rate Derivation Engine"]
        HKOps["Housekeeping State Machine"]
        NightAudit["Night Audit Day-Close Orchestrator"]
        ChannelSync["OTA Bi-directional Channel Manager"]
        RBACSvc["Auth & Granular RBAC Guard"]
    end

    subgraph DataLayer ["Data & Messaging Layer"]
        DB[(PostgreSQL 16 / Supabase Multi-Tenant RLS)]
        RedisCache[(Redis Cluster: Distributed Locks & ARI Cache)]
        JobQueue[(BullMQ: OTA ARI Queue & Audit Jobs)]
        PubSub[WebSocket / Socket.IO Live Tape-Chart Bus]
    end

    subgraph ExternalHub ["External Integration Hub"]
        OTAs["OTAs: Booking.com, Agoda, MMT, Google Hotel"]
        Comms["Guest Comms: WhatsApp API & SMS"]
        Hardware["Hardware: ESC/POS Thermal & Keycard Encoders"]
    end

    UI --> State
    State --> TapeVirtual
    UI --> PrintEngine
    State <-->|REST / WebSocket| ApiLayer
    ApiLayer <--> DB
    ApiLayer <--> RedisCache
    ApiLayer <--> JobQueue
    ApiLayer <--> PubSub
    ChannelSync <--> OTAs
    ResSvc --> Comms
    FolioSvc --> Hardware
```

---

### 1.2 Core Domain Subsystems & Boundaries

| Subsystem | Responsibilities | Key Dependencies & Concurrency Strategy |
| :--- | :--- | :--- |
| **Reservations & Allocation** | Walk-in wizard, stay duration, multi-room rate allocation, group room moves, status transitions. | Distributed Redis lock on `(room_id, date)` during allocation; Pessimistic row locking on checkout. |
| **Tape Chart Engine** | High-density visual Gantt matrix of rooms vs dates, drag-to-select, Cozy/Wide density, maintenance locks. | Virtualized DOM rows; O(1) cell allocation indexing via compound hash `date_roomId`. |
| **Folio & Financial Ledger** | Double-entry debit/credit transactions, multi-payment reconciliation, Indian GST/SAC tax engine, legal invoice formatting. | Immutable ledger pattern; transactions are appended with audit metadata. Balances computed via materialized aggregations. |
| **Rates & Inventory (ARI)** | Daily base rates, extra adult/child rates, Stop-sell toggles, Min/Max length of stay, Closed-to-Arrival/Departure. | Bulk transactional updates with date-range batching; change-data-capture triggers for OTA sync. |
| **Channel Manager & Derivation** | Rate formula transformation ($\text{OTA} = \text{Base} \times (1 - \text{Discount}) + \text{Markup}$), room/plan mapping, outbound ARI push. | BullMQ background workers with exponential backoff retry; deduplication of rapid successive rate updates. |
| **Night Audit Orchestrator** | Pre-audit checklist verification, midnight room charge posting + GST slab computation, operational date rollover. | Serialized single-execution lock per property; transactional batch posting with rollback safety. |
| **Housekeeping & Rooms** | Clean, Dirty, Maintenance, Inspected state tracking, auto-dirty trigger upon checkout, room move conflict checks. | Event-driven status mutations emitted on reservation lifecycle events. |
| **Granular RBAC & Multi-Tenancy** | Property scoping, role assignments (Owner, GM, Front Desk, Housekeeper, Auditor), feature-level permission toggles. | PostgreSQL Row-Level Security (RLS) enforcement with `property_id` claims injected into execution contexts. |

---

### 1.3 Concurrency Control & Double-Booking Prevention

```mermaid
sequenceDiagram
    autonumber
    actor Receptionist as Front Desk Agent
    participant WebApp as Web Client
    participant ResEngine as Reservation Engine
    participant RedisLock as Redis Distributed Lock
    participant Postgres as PostgreSQL DB

    Receptionist->>WebApp: Select Room 101 for Oct 24-28 & Click "Confirm"
    WebApp->>ResEngine: POST /api/reservations/create
    ResEngine->>RedisLock: SET lock:room:101:2026-10-24_2026-10-28 PX 5000 NX
    alt Lock Acquired
        RedisLock-->>ResEngine: OK
        ResEngine->>Postgres: BEGIN TRANSACTION (ISOLATION LEVEL SERIALIZABLE)
        ResEngine->>Postgres: SELECT * FROM reservation_rooms WHERE room_id = 101 AND date OVERLAPS (Oct 24, Oct 28)
        alt No Conflict Found
            ResEngine->>Postgres: INSERT INTO reservations, reservation_rooms, folios
            ResEngine->>Postgres: COMMIT TRANSACTION
            ResEngine->>RedisLock: RELEASE lock
            ResEngine-->>WebApp: 201 Created (Booking Reference #RES_363)
            WebApp-->>Receptionist: Show Success & Open Voucher Modal
        else Overlapping Booking Exists
            ResEngine->>Postgres: ROLLBACK TRANSACTION
            ResEngine->>RedisLock: RELEASE lock
            ResEngine-->>WebApp: 409 Conflict (Room already booked by OTA or Front Desk)
            WebApp-->>Receptionist: Alert: Room unavailable, suggest alternative rooms
        end
    else Lock Held by Another Node/Session
        RedisLock-->>ResEngine: Lock Busy (Active Booking in Progress)
        ResEngine-->>WebApp: 423 Locked (Room allocation in progress by another terminal)
        WebApp-->>Receptionist: Warning: Room temporarily locked, retrying...
    end
```

---

### 1.4 Regional Tax Compliance Engine (Indian GST & HSN/SAC)

The billing and night audit modules adhere strictly to Indian Hotel GST rules:

$$\text{GST Rate} = \begin{cases} 
12\% \ (\text{CGST } 6\% + \text{SGST } 6\%), & \text{if Effective Daily Room Tariff} < \text{₹}7,500 \\
18\% \ (\text{CGST } 9\% + \text{SGST } 9\%), & \text{if Effective Daily Room Tariff} \ge \text{₹}7,500 
\end{cases}$$

- **HSN/SAC Code Mapping:**
  - `996311`: Room accommodation services provided by hotels, inns, guest houses.
  - `996331`: Food and beverage services (5% without ITC or 18% with ITC).
- **Tax Breakdown in Invoices:** Explicit splitting of Taxable Base Amount, CGST, SGST, and Total Invoice Amount with hotel GSTIN and Guest GSTIN (for B2B corporate credit pass-through).

---

## 2. Phased Engineering Milestone Roadmap

```mermaid
gantt
    title Hotel PMS Implementation Roadmap (7 Phases)
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d

    section Phase 1: Core Domain & Data Layer
    Database Schema & Multi-Tenant Store           :p1_1, 2026-10-25, 3d
    Property, Room Types & Rate Plan CRUD          :p1_2, after p1_1, 2d

    section Phase 2: Tape Chart & Operations
    Virtualized Calendar Tape Chart Gantt          :p2_1, after p1_2, 4d
    Maintenance Blocks & Cozy/Wide Density         :p2_2, after p2_1, 2d

    section Phase 3: Walk-In Wizard & Bookings
    Multi-Section Create Reservation Form          :p3_1, after p2_2, 3d
    Live GST Billing Calculator & Voucher Generator :p3_2, after p3_1, 2d

    section Phase 4: Folio Ledger & Room Moves
    Debit/Credit Double-Entry Ledger Engine        :p4_1, after p3_2, 3d
    Group Room Move Modal & Conflict Engine        :p4_2, after p4_1, 2d
    Printable Legal GST Tax Invoice Preview        :p4_3, after p4_2, 2d

    section Phase 5: Rates & OTA Channel Manager
    Rates & Inventory Matrix with Inline Edits     :p5_1, after p4_3, 3d
    Stopouts, Restrictions & Bulk Update Modal    :p5_2, after p5_1, 2d
    Derived Rates Rules Engine & Channel Sync Sim  :p5_3, after p5_2, 3d

    section Phase 6: Night Audit & Reporting
    Pre-Audit Validation Checklist & Tariff Poster :p6_1, after p5_3, 3d
    Financial Day-Close & Historical Drilldown     :p6_2, after p6_1, 2d
    Manager & Financial Reports with XLSX Export   :p6_3, after p6_2, 2d

    section Phase 7: Housekeeping, CRM & RBAC
    Housekeeping Grid & Auto-Dirty Mutation        :p7_1, after p6_3, 2d
    Guest CRM Directory & Staff Permissions Matrix :p7_2, after p7_1, 3d
    End-to-End User Journey Testing & Polish       :p7_3, after p7_2, 3d
```

---

### Detailed Milestone Breakdown

#### Milestone 1: Foundation, Multi-Tenant Domain & Configuration
- **Objective:** Establish the foundational architecture, relational data models, and property setup wizards.
- **Deliverables:**
  1. Multi-tenant database migrations for `properties`, `room_types`, `rooms`, `meal_plans`, `rate_plans`, `guests`, `reservations`, `folios`, `night_audits`, and `audit_trails`.
  2. Property Onboarding Wizard (`/properties/create`) capturing GSTIN, legal names, timezones, and operational check-in/out times.
  3. Meal Plan CRUD (`/properties/meal-plans`) with EP/CP/MAP/APAI meal schedules and inclusions.
  4. Room Type & Physical Room CRUD (`/properties/rooms`) with batch room number generation.
- **Verification Criteria:**
  - Ability to create a property with 3 room types and 15 physical rooms.
  - Meal plans correctly associate with rate plans.

#### Milestone 2: Calendar Tape Chart (Gantt Matrix) Engine
- **Objective:** High-performance, interactive timeline for front-desk dispatch.
- **Deliverables:**
  1. Horizontal Gantt view rendering rooms on Y-axis and rolling dates on X-axis.
  2. Cozy vs Wide density toggle for room rows.
  3. Real-time occupancy percentage calculations for each day header.
  4. Cell click-to-book and drag-to-select range selection.
  5. Maintenance Block modal with reason capture (AC Repair, Painting, Water Leak) rendering orange locked blocks.
- **Verification Criteria:**
  - Sub-100ms render performance across 30 days and 25+ rooms.
  - Booking blocks span correctly across start and end dates with status color codes.

#### Milestone 3: Walk-In Wizard, Real-Time Billing & Voucher Generation
- **Objective:** Rapid front-desk reservation capture under 60 seconds.
- **Deliverables:**
  1. Multi-step/accordion reservation creator (`/reservations/create`).
  2. Dynamic stay calculation (Nights count badge) and market segment attribution.
  3. Multi-room builder: add multiple rooms of different types in a single master booking.
  4. Live sticky billing summary with automatic Indian GST slab calculation (12% vs 18%).
  5. Advance payment collection (Cash, UPI, Card) with reference ID.
  6. Branded printable Booking Voucher modal with print styling and email dispatch trigger.
- **Verification Criteria:**
  - Adding multiple rooms recalculates tax and totals instantly.
  - Balance due reflects advance payment deduction upon save.

#### Milestone 4: Folio Ledger, Room Move & Legal GST Invoice Engine
- **Objective:** Complete financial tracking, guest ledger balancing, and room reallocations.
- **Deliverables:**
  1. Folio Operations Drawer (`/reservations/edit/[id]`) with double-entry debit/credit ledger.
  2. Inline Room Charges table auditing daily tariffs.
  3. Group Room Move Modal with dirty-room detection and automatic tape-chart re-rendering.
  4. Folio Settlement Modal (zero-balance validation before checkout).
  5. Legal GST Tax Invoice Preview Modal with SAC codes, CGST/SGST split, and print trigger.
- **Verification Criteria:**
  - Checking out a reservation automatically sets the assigned room to `DIRTY` in the housekeeping subsystem.
  - Invoices display accurate GST breakdown matching government formats.

#### Milestone 5: Rates, Stop-Sells, Bulk Restrictions & OTA Channel Manager
- **Objective:** Comprehensive revenue management and channel rate distribution.
- **Deliverables:**
  1. Rates & Inventory Grid (`/rates-and-inventory`) supporting subtabs: *All Rates*, *Min Nights*, *Max Nights*, *Stopouts*, *CTA*, *CTD*.
  2. Inline cell editing for base rates, extra adult, and extra child rates.
  3. Interactive Stopouts: click-to-toggle stop-sell prohibition badge.
  4. Bulk Update Modal: multi-select room types, rate plans, date range, day-of-week pills (Mon-Sun), and rate/restriction values.
  5. OTA Channel Manager (`/rates-and-inventory/channels`): connected OTAs (Agoda, Booking.com, MMT, Google Hotel) with inventory mapping and derived rate formulas ($\text{Rate} = \text{Base} \times (1 - \text{Discount}) + \text{Markup}$).
- **Verification Criteria:**
  - Bulk updates correctly update all matching dates in the inventory matrix.
  - Channel sync queue demonstrates simulated ARI payload push with derived prices.

#### Milestone 6: Night Audit Day-Close & Financial Reporting
- **Objective:** Automated end-of-day revenue reconciliation and operational auditing.
- **Deliverables:**
  1. Night Audit View (`/night-audit`) with automated pre-audit checklist validation (Pending arrivals, departures, unsettled folios).
  2. Single-click Day Close routine: automatically posts daily room tariffs and GST debits to active in-house folios and rolls forward the business date.
  3. Night Audit Detail Drilldown modal displaying Room Charges breakdown, Checked-out log, and Pax overview.
  4. Financial & Operations Reports (`/reports`): Manager Report, Guest Details, Folio List, Night Audit summary with `.xlsx` export.
- **Verification Criteria:**
  - Day close successfully advances system business date and posts room charges.
  - Exported Excel spreadsheet contains accurate revenue and ledger reconciliations.

#### Milestone 7: Housekeeping Room Grid, Guest CRM, Granular RBAC & Hardening
- **Objective:** Complete operational hygiene tracking, customer relationships, and security controls.
- **Deliverables:**
  1. Housekeeping Room View (`/room-view`): color-coded status cards (Available, Occupied, Maintenance, Dirty) with quick status changer (e.g., Dirty -> Clean).
  2. Guest CRM Directory (`/guests`) showing historical stay counts, total spent, and contact attributes.
  3. Granular RBAC Permission Matrix (`/permissions`) with category-level toggles (Reservations, Night Audit, Rates & Inventory, Team, Dashboard, PII Access, Ledger).
  4. Audit Trail Timeline tab showing chronological system mutations with actor attribution.
- **Verification Criteria:**
  - Front desk is blocked from assigning a `DIRTY` room to a new reservation.
  - Staff permissions restrict unauthorized users from accessing Night Audit and Ledger operations.

---

## 3. Technology Stack & Directory Architecture

```
d:/new full hotel/
├── docs/
│   ├── PRD.md
│   └── ARCHITECTURE.md
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/             # Button, Modal, Input, Badge, Toast, Dropdown
│   │   ├── layout/             # Sidebar, TopNav, PropertySwitcher, Shell
│   │   ├── calendar/           # TapeChartView, MaintenanceModal, QuickBookModal
│   │   ├── reservations/       # ReservationsView, CreateReservationWizard, VoucherModal
│   │   ├── folios/             # FolioModal, InvoiceModal, AddTransactionModal
│   │   ├── housekeeping/       # RoomStatusGrid, RoomCard, HygieneFilter
│   │   ├── rates/              # RatesMatrixView, BulkUpdateModal, ChannelManager
│   │   ├── nightaudit/         # NightAuditView, AuditChecklist, AuditDetailModal
│   │   ├── reports/            # ReportsView, ExcelExportButton, SummaryCards
│   │   ├── guests/             # GuestDirectoryView, GuestDetailDrawer
│   │   ├── settings/           # PropertyWizard, MealPlansView, RoomConfigView
│   │   └── permissions/        # TeamView, RBACMatrixView, InviteMemberModal
│   ├── services/
│   │   ├── pmsStore.js         # Reactive Local & Cloud Sync Store (ACID emulation)
│   │   ├── taxEngine.js        # Indian GST & SAC code calculator
│   │   ├── auditEngine.js      # Night audit tariff poster & date incrementer
│   │   ├── channelSync.js      # Derived rate calculator & ARI push queue
│   │   └── exportService.js    # XLSX & PDF generator utilities
│   ├── hooks/
│   │   ├── useTapeChart.js     # Virtualized calendar timeline coordinator
│   │   └── usePermissions.js  # RBAC access controller
│   ├── data/
│   │   └── initialPmsData.js   # Production-fidelity seed data (Royale Avenue BnB)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css               # Premium design system tokens & styles
├── package.json
└── vite.config.js
```
