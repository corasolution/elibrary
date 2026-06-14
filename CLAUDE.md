# Alpha eLibrary — Integrated eLibrary & Catalog SaaS
## CLAUDE.md — Full Project Handoff for Claude Code + Windsurf Cascade

---

## 1. PROJECT OVERVIEW

**Product Name:** Alpha eLibrary  
**Tagline:** *The Modern Library OS for Southeast Asia*  
**Domain:** bannalai.com (suggested)  
**Type:** Multi-tenant SaaS — Integrated Library System (ILS) + eLibrary  
**Inspired by:** Koha ILS, DSpace, Evergreen ILS  
**Standards Compliance:** MARC21-inspired fields, Dublin Core metadata, DDC/LCC classification  
**Builder:** Corasoft — Cambodia's AI-native software agency
**Stack:** Laravel 13 · React/Inertia.js · PostgreSQL · Tailwind CSS · Cloudflare R2

---

## 2. SYSTEM ARCHITECTURE

### 2.1 High-Level Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    bannalai.com                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ Landing Pageâ”‚  â”‚ Library OPAC â”‚  â”‚  Staff Dashboard  â”‚  â”‚
â”‚  â”‚ (Marketing) â”‚  â”‚ (Public)     â”‚  â”‚  (React/Inertia)  â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                             â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚              Laravel 13 API Layer                    â”‚  â”‚
â”‚  â”‚  Auth · Tenancy · Cataloging · Circulation · Media  â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                             â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚ PostgreSQL  â”‚  â”‚  File Storage  â”‚  â”‚  Redis Cache   â”‚   â”‚
â”‚  â”‚  (Primary)  â”‚  â”‚ (S3/MinIO)    â”‚  â”‚  + Queues      â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                             â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚         Cloudflare R2 Storage (Default)              â”‚  â”‚
â”‚  â”‚   6 Provider Options · Migration · Signed URLs      â”‚  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Multi-Tenancy Model

- **Strategy:** Database-per-tenant via `stancl/tenancy` package  
- **Tenant Identification:** Subdomain (`{slug}.bannalai.com`) + custom domain support  
- **Central DB:** `bannalai_central` — tenants, subscriptions, plans, billing  
- **Tenant DB:** `bannalai_{tenant_id}` — all library data isolated per tenant  
- **Shared storage:** Cloudflare R2 (default) with tenant-prefixed paths `/{tenant_id}/files/`  
- **Storage providers:** 6 options (R2, S3, Spaces, Wasabi, GCS, Custom) - configurable per tenant

### 2.3 URL Structure

```
bannalai.com              â†’ Marketing landing page
app.bannalai.com          â†’ Tenant registration / login portal
{slug}.bannalai.com       â†’ Individual library (OPAC + staff)
{slug}.bannalai.com/admin â†’ React/Inertia staff admin panel
{slug}.bannalai.com/opac  â†’ Public catalog (OPAC)
{slug}.bannalai.com/reader â†’ eBook/eMaterial reader
```

---

## 3. TECHNOLOGY STACK

### 3.1 Backend

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Laravel 13 | PHP 8.3+, latest conventions |
| Multi-tenancy | `stancl/tenancy` v3 | Database-per-tenant |
| Admin Panel | React + Inertia.js | Staff portal, super-admin (100% React) |
| Auth | Laravel Sanctum + Spatie Permissions | Role-based, per-tenant |
| Queue | Laravel Horizon + Redis | File processing, email |
| Search | Laravel Scout + PostgreSQL Full-Text | Fallback if no Meilisearch |
| File Storage | Laravel Filesystem + Cloudflare R2 | 6 providers, migration, signed URLs |
| Cache | Redis | Sessions, catalog cache |
| Email | Brevo SMTP | Transactional (overdue, reservations) |
| PDF Processing | Spatie/pdf-to-image, pdfinfo | Thumbnail generation |
| Export | maatwebsite/excel, barryvdh/dompdf | Reports, catalog export |
| API | RESTful JSON API | For mobile app (future) |

### 3.2 Frontend

| Layer | Technology | Notes |
|-------|-----------|-------|
| SPA Framework | React 18 + Inertia.js v2 | SSR-ready |
| Styling | Tailwind CSS v3 | Custom library theme |
| Components | Shadcn/ui + custom | Consistent design system |
| Icons | Lucide React | |
| State | Zustand + React Query | |
| Rich Text | TipTap | For abstracts, descriptions |
| PDF Viewer | react-pdf + PDF.js | Embedded reader |
| Epub Reader | epub.js | eBook reader |
| Barcode | react-barcode | Item labels |
| Charts | Recharts | Dashboard analytics |
| Khmer Support | Noto Sans Khmer (Google Fonts) | |
| Language | i18next | English + Khmer (km) |

### 3.3 Database

- **Engine:** PostgreSQL 16+
- **Full-text search:** `tsvector` columns with GIN indexes on title, author, subject
- **JSON columns:** `metadata jsonb` for flexible MARC/Dublin Core fields
- **Soft deletes:** All core tables use `deleted_at`
- **Auditing:** `spatie/laravel-activitylog` on all catalog operations

---

## 4. DATABASE SCHEMA

### 4.1 Central Database (bannalai_central)

```sql
-- Tenants (Libraries)
CREATE TABLE tenants (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,  -- subdomain
    domain      VARCHAR(255),                  -- custom domain
    data        JSONB DEFAULT '{}',            -- stancl/tenancy config
    plan_id     UUID,
    trial_ends_at TIMESTAMPTZ,
    status      VARCHAR(20) DEFAULT 'active',  -- active, suspended, cancelled
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Subscription Plans
CREATE TABLE plans (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50) NOT NULL,     -- Free, Starter, Pro, Enterprise
    price_usd   DECIMAL(8,2) NOT NULL,
    billing_cycle VARCHAR(10) DEFAULT 'monthly',
    max_titles  INTEGER,                  -- NULL = unlimited
    max_patrons INTEGER,
    max_storage_gb INTEGER,
    features    JSONB DEFAULT '[]',
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID REFERENCES tenants(id),
    plan_id     UUID REFERENCES plans(id),
    status      VARCHAR(20) DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end   TIMESTAMPTZ,
    payment_method VARCHAR(50),          -- aba_payway, khqr, card
    created_at  TIMESTAMPTZ DEFAULT now()
);
```

### 4.2 Tenant Database Schema

```sql
-- ============================================================
-- CORE CATALOG TABLES
-- ============================================================

-- Material Types
CREATE TABLE material_types (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(30) UNIQUE NOT NULL,  -- book, ebook, journal, thesis, audio, video, dataset, map
    name        VARCHAR(100) NOT NULL,
    name_km     VARCHAR(200),                 -- Khmer name
    icon        VARCHAR(50),                  -- lucide icon name
    has_physical BOOLEAN DEFAULT false,
    has_digital  BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Bibliographic Records (Core catalog record)
-- Follows Dublin Core 15 elements + library extensions
CREATE TABLE bibliographic_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- === BASIC BIBLIOGRAPHIC (All Materials - Dublin Core aligned) ===
    title           VARCHAR(500) NOT NULL,
    title_alternative VARCHAR(500),           -- dc:title.alternative
    subtitle        VARCHAR(500),
    title_km        VARCHAR(1000),            -- Khmer title
    
    -- Creator/Contributor (dc:creator, dc:contributor)
    authors         JSONB DEFAULT '[]',       -- [{name, role, authority_id}]
    -- role: author, editor, translator, illustrator, compiler
    
    isbn            VARCHAR(20),              -- ISBN-10 or ISBN-13
    issn            VARCHAR(10),
    doi             VARCHAR(200),
    
    publisher       VARCHAR(300),             -- dc:publisher
    publisher_place VARCHAR(200),
    publication_year INTEGER,                 -- dc:date
    edition         VARCHAR(50),
    volume          VARCHAR(20),
    issue           VARCHAR(20),
    pages           VARCHAR(30),
    
    language        VARCHAR(10) DEFAULT 'en', -- ISO 639-1 (en, km, fr, zh)
    
    -- Subject/Classification (dc:subject)
    subjects        JSONB DEFAULT '[]',       -- [{term, scheme}] scheme: LCSH, MeSH, local
    keywords        TEXT[],
    ddc_class       VARCHAR(50),             -- Dewey Decimal: e.g. 005.133
    lcc_class       VARCHAR(50),             -- Library of Congress: e.g. QA76.73
    
    -- Description (dc:description)
    abstract        TEXT,
    abstract_km     TEXT,
    
    -- Type & Format (dc:type, dc:format)
    material_type_id INTEGER REFERENCES material_types(id),
    
    -- Rights (dc:rights)
    rights          VARCHAR(200),
    
    -- Relation (dc:relation)
    series_title    VARCHAR(300),
    series_number   VARCHAR(20),
    
    -- Coverage (dc:coverage)
    geographic_coverage VARCHAR(200),
    
    -- Source (dc:source)
    source          VARCHAR(500),
    
    -- === EXTENDED METADATA ===
    notes           TEXT,
    table_of_contents TEXT,
    cover_image_url VARCHAR(500),
    
    -- Full-text search vector (auto-maintained by trigger)
    search_vector   TSVECTOR,
    
    -- Record management
    record_status   VARCHAR(20) DEFAULT 'active',  -- active, withdrawn, deleted
    cataloger_id    UUID,                          -- staff who created
    cataloged_at    TIMESTAMPTZ DEFAULT now(),
    
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    deleted_at      TIMESTAMPTZ
);

-- GIN index for full-text search
CREATE INDEX idx_biblio_search ON bibliographic_records USING GIN(search_vector);
CREATE INDEX idx_biblio_material_type ON bibliographic_records(material_type_id);
CREATE INDEX idx_biblio_isbn ON bibliographic_records(isbn);
CREATE INDEX idx_biblio_year ON bibliographic_records(publication_year);

-- ============================================================
-- PHYSICAL ITEMS
-- ============================================================
CREATE TABLE physical_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    biblio_id       UUID NOT NULL REFERENCES bibliographic_records(id) ON DELETE CASCADE,
    
    barcode         VARCHAR(50) UNIQUE,
    accession_number VARCHAR(50) UNIQUE,
    call_number     VARCHAR(100),              -- Shelf location code
    
    -- Location
    collection_id   INTEGER REFERENCES collections(id),
    location_id     INTEGER REFERENCES locations(id),
    shelf           VARCHAR(50),
    
    -- Status
    item_status     VARCHAR(30) DEFAULT 'available',
    -- available, checked_out, on_hold, in_repair, lost, withdrawn, on_order
    
    -- Physical attributes
    condition       VARCHAR(20) DEFAULT 'good', -- excellent, good, fair, poor
    price           DECIMAL(10,2),
    currency        VARCHAR(3) DEFAULT 'USD',
    
    -- Purchase info
    acquired_date   DATE,
    supplier        VARCHAR(200),
    purchase_order  VARCHAR(100),
    
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    deleted_at      TIMESTAMPTZ
);

-- Collections (e.g. General, Reference, Periodicals, Special)
CREATE TABLE collections (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    name_km     VARCHAR(200),
    code        VARCHAR(20) UNIQUE,
    description TEXT,
    is_loanable BOOLEAN DEFAULT true,
    loan_period_days INTEGER DEFAULT 14,
    renewals_allowed INTEGER DEFAULT 2,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Locations (branches, rooms, shelving units)
CREATE TABLE locations (
    id          SERIAL PRIMARY KEY,
    parent_id   INTEGER REFERENCES locations(id),
    name        VARCHAR(100) NOT NULL,
    name_km     VARCHAR(200),
    code        VARCHAR(20) UNIQUE,
    address     TEXT,
    is_branch   BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- DIGITAL RESOURCES
-- ============================================================
CREATE TABLE digital_resources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    biblio_id       UUID NOT NULL REFERENCES bibliographic_records(id) ON DELETE CASCADE,
    
    -- File info
    file_path       VARCHAR(500),              -- S3 key
    original_filename VARCHAR(255),
    file_size_bytes BIGINT,
    mime_type       VARCHAR(100),
    format          VARCHAR(20),               -- pdf, epub, mp3, mp4, mp3, docx
    
    -- URL (for external resources)
    url             VARCHAR(1000),
    is_external     BOOLEAN DEFAULT false,
    
    -- Thumbnail/Cover
    thumbnail_path  VARCHAR(500),
    
    -- Access control
    access_type     VARCHAR(20) DEFAULT 'restricted',
    -- open_access, registered, restricted, embargo
    embargo_until   DATE,
    
    -- Digital object identifiers
    handle          VARCHAR(200),              -- e.g. DSpace handle
    
    -- OCR / Full text
    ocr_text        TEXT,
    ocr_processed_at TIMESTAMPTZ,
    
    -- Streaming info (for audio/video)
    duration_seconds INTEGER,
    bitrate         VARCHAR(20),
    
    -- Stats
    download_count  INTEGER DEFAULT 0,
    view_count      INTEGER DEFAULT 0,
    
    -- Version
    version         VARCHAR(20) DEFAULT '1.0',
    
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    deleted_at      TIMESTAMPTZ
);

-- ============================================================
-- PATRONS (Library Members)
-- ============================================================
CREATE TABLE patrons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Account
    patron_number   VARCHAR(30) UNIQUE NOT NULL,   -- Library card number
    email           VARCHAR(255) UNIQUE,
    password        VARCHAR(255),                   -- hashed (if self-registered)
    email_verified_at TIMESTAMPTZ,
    
    -- Personal info
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100),
    first_name_km   VARCHAR(200),
    last_name_km    VARCHAR(200),
    gender          VARCHAR(20),
    date_of_birth   DATE,
    phone           VARCHAR(30),
    
    -- Address
    address         TEXT,
    city            VARCHAR(100),
    country         VARCHAR(3) DEFAULT 'KHM',       -- ISO 3166-1 alpha-3
    
    -- Category
    patron_category_id INTEGER REFERENCES patron_categories(id),
    
    -- Status
    status          VARCHAR(20) DEFAULT 'active',   -- active, expired, suspended, blocked
    membership_expiry DATE,
    
    -- Preferences
    preferred_language VARCHAR(5) DEFAULT 'en',
    
    -- Stats (denormalized for performance)
    total_checkouts INTEGER DEFAULT 0,
    active_loans    INTEGER DEFAULT 0,
    
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    deleted_at      TIMESTAMPTZ
);

CREATE TABLE patron_categories (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,    -- Student, Staff, Faculty, Public, VIP
    name_km         VARCHAR(200),
    loan_limit      INTEGER DEFAULT 5,
    loan_period_days INTEGER DEFAULT 14,
    renewals_allowed INTEGER DEFAULT 2,
    reservation_limit INTEGER DEFAULT 3,
    fine_rate_per_day DECIMAL(6,2) DEFAULT 0.10,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CIRCULATION
-- ============================================================
CREATE TABLE loans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patron_id       UUID NOT NULL REFERENCES patrons(id),
    item_id         UUID NOT NULL REFERENCES physical_items(id),
    
    -- Dates
    checked_out_at  TIMESTAMPTZ DEFAULT now(),
    due_date        DATE NOT NULL,
    returned_at     TIMESTAMPTZ,
    renewed_at      TIMESTAMPTZ,
    renewals_count  INTEGER DEFAULT 0,
    
    -- Staff
    checked_out_by  UUID,                    -- staff user id
    returned_by     UUID,
    
    -- Fines
    fine_amount     DECIMAL(8,2) DEFAULT 0,
    fine_paid       BOOLEAN DEFAULT false,
    fine_paid_at    TIMESTAMPTZ,
    fine_waived     BOOLEAN DEFAULT false,
    
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reservations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patron_id       UUID NOT NULL REFERENCES patrons(id),
    biblio_id       UUID NOT NULL REFERENCES bibliographic_records(id),
    item_id         UUID,                    -- specific item or NULL (any copy)
    
    status          VARCHAR(20) DEFAULT 'pending',
    -- pending, waiting, ready, fulfilled, cancelled, expired
    
    reserved_at     TIMESTAMPTZ DEFAULT now(),
    expiry_date     DATE,
    notified_at     TIMESTAMPTZ,             -- when patron was notified item is ready
    
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- DIGITAL ACCESS LOGS (eLibrary)
-- ============================================================
CREATE TABLE digital_access_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id     UUID REFERENCES digital_resources(id),
    patron_id       UUID REFERENCES patrons(id),
    action          VARCHAR(20),             -- view, download, stream
    ip_address      INET,
    user_agent      TEXT,
    session_id      VARCHAR(100),
    duration_seconds INTEGER,               -- for streaming
    accessed_at     TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ACQUISITIONS
-- ============================================================
CREATE TABLE acquisition_orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number    VARCHAR(50) UNIQUE NOT NULL,
    supplier        VARCHAR(200),
    order_date      DATE,
    expected_date   DATE,
    received_date   DATE,
    status          VARCHAR(20) DEFAULT 'pending',  -- pending, ordered, partial, received, cancelled
    total_amount    DECIMAL(10,2),
    currency        VARCHAR(3) DEFAULT 'USD',
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE acquisition_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID REFERENCES acquisition_orders(id),
    biblio_id       UUID REFERENCES bibliographic_records(id),
    quantity        INTEGER DEFAULT 1,
    unit_price      DECIMAL(8,2),
    received_qty    INTEGER DEFAULT 0,
    notes           TEXT
);

-- ============================================================
-- SERIALS (Journals, Magazines, Newspapers)
-- ============================================================
CREATE TABLE serials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    biblio_id       UUID REFERENCES bibliographic_records(id),
    frequency       VARCHAR(30),             -- daily, weekly, monthly, quarterly, annual
    start_date      DATE,
    end_date        DATE,
    subscription_expiry DATE,
    supplier        VARCHAR(200),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE serial_issues (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_id       UUID REFERENCES serials(id),
    volume          VARCHAR(20),
    issue_number    VARCHAR(20),
    publication_date DATE,
    received_date   DATE,
    item_id         UUID REFERENCES physical_items(id),
    status          VARCHAR(20) DEFAULT 'expected',  -- expected, received, late, missing
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- REPORTS & STATS (cached/materialized)
-- ============================================================
CREATE TABLE daily_stats (
    id              SERIAL PRIMARY KEY,
    date            DATE NOT NULL,
    total_loans     INTEGER DEFAULT 0,
    total_returns   INTEGER DEFAULT 0,
    new_patrons     INTEGER DEFAULT 0,
    digital_views   INTEGER DEFAULT 0,
    digital_downloads INTEGER DEFAULT 0,
    overdue_items   INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(date)
);

-- ============================================================
-- SETTINGS
-- ============================================================
CREATE TABLE library_settings (
    id              SERIAL PRIMARY KEY,
    key             VARCHAR(100) UNIQUE NOT NULL,
    value           TEXT,
    group           VARCHAR(50),             -- general, circulation, catalog, email, branding
    label           VARCHAR(200),
    description     TEXT,
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- STAFF USERS (uses Laravel users table + Spatie Roles)
-- ============================================================
-- Roles: super_admin, library_admin, cataloger, circulation_staff, reader_services
```

---

## 5. FILE STRUCTURE

```
bannalai/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ Filament/
â”‚   â”‚   â”œâ”€â”€ Admin/                  # Super admin panel (central)
â”‚   â”‚   â”‚   â”œâ”€â”€ Pages/
â”‚   â”‚   â”‚   â””â”€â”€ Resources/
â”‚   â”‚   â”‚       â”œâ”€â”€ TenantResource.php
â”‚   â”‚   â”‚       â””â”€â”€ PlanResource.php
â”‚   â”‚   â””â”€â”€ Library/               # Per-library staff panel (tenant)
â”‚   â”‚       â”œâ”€â”€ Pages/
â”‚   â”‚       â”‚   â”œâ”€â”€ Dashboard.php
â”‚   â”‚       â”‚   â”œâ”€â”€ Circulation/
â”‚   â”‚       â”‚   â””â”€â”€ Reports/
â”‚   â”‚       â””â”€â”€ Resources/
â”‚   â”‚           â”œâ”€â”€ BibliographicRecordResource.php
â”‚   â”‚           â”œâ”€â”€ PhysicalItemResource.php
â”‚   â”‚           â”œâ”€â”€ DigitalResourceResource.php
â”‚   â”‚           â”œâ”€â”€ PatronResource.php
â”‚   â”‚           â”œâ”€â”€ LoanResource.php
â”‚   â”‚           â”œâ”€â”€ ReservationResource.php
â”‚   â”‚           â”œâ”€â”€ AcquisitionOrderResource.php
â”‚   â”‚           â””â”€â”€ SerialResource.php
â”‚   â”œâ”€â”€ Http/
â”‚   â”‚   â”œâ”€â”€ Controllers/
â”‚   â”‚   â”‚   â”œâ”€â”€ Opac/              # Public catalog controllers
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ CatalogController.php
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ RecordController.php
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ SearchController.php
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ ReaderController.php
â”‚   â”‚   â”‚   â”œâ”€â”€ Auth/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ PatronAuthController.php
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ StaffAuthController.php
â”‚   â”‚   â”‚   â””â”€â”€ Api/               # JSON API (mobile-ready)
â”‚   â”‚   â”‚       â”œâ”€â”€ CatalogApiController.php
â”‚   â”‚   â”‚       â””â”€â”€ PatronApiController.php
â”‚   â”‚   â””â”€â”€ Middleware/
â”‚   â”‚       â””â”€â”€ InitializeTenancy.php
â”‚   â”œâ”€â”€ Models/
â”‚   â”‚   â”œâ”€â”€ Central/
â”‚   â”‚   â”‚   â”œâ”€â”€ Tenant.php
â”‚   â”‚   â”‚   â””â”€â”€ Plan.php
â”‚   â”‚   â””â”€â”€ Tenant/
â”‚   â”‚       â”œâ”€â”€ BibliographicRecord.php
â”‚   â”‚       â”œâ”€â”€ PhysicalItem.php
â”‚   â”‚       â”œâ”€â”€ DigitalResource.php
â”‚   â”‚       â”œâ”€â”€ Patron.php
â”‚   â”‚       â”œâ”€â”€ Loan.php
â”‚   â”‚       â”œâ”€â”€ Reservation.php
â”‚   â”‚       â””â”€â”€ MaterialType.php
â”‚   â”œâ”€â”€ Services/
â”‚   â”‚   â”œâ”€â”€ CatalogService.php      # Core cataloging logic
â”‚   â”‚   â”œâ”€â”€ CirculationService.php  # Checkout/return logic
â”‚   â”‚   â”œâ”€â”€ SearchService.php       # Full-text search
â”‚   â”‚   â”œâ”€â”€ DigitalAssetService.php # File upload, OCR, thumbnails
â”‚   â”‚   â”œâ”€â”€ FineCalculator.php
â”‚   â”‚   â””â”€â”€ NotificationService.php
â”‚   â””â”€â”€ Jobs/
â”‚       â”œâ”€â”€ ProcessDigitalFile.php  # OCR, thumbnail gen
â”‚       â”œâ”€â”€ SendOverdueNotice.php
â”‚       â””â”€â”€ GenerateDailyStats.php
â”œâ”€â”€ database/
â”‚   â”œâ”€â”€ migrations/
â”‚   â”‚   â”œâ”€â”€ central/               # Central DB migrations
â”‚   â”‚   â””â”€â”€ tenant/                # Tenant DB migrations (stancl convention)
â”‚   â””â”€â”€ seeders/
â”‚       â”œâ”€â”€ MaterialTypeSeeder.php
â”‚       â”œâ”€â”€ PatronCategorySeeder.php
â”‚       â””â”€â”€ DefaultSettingsSeeder.php
â”œâ”€â”€ resources/
â”‚   â”œâ”€â”€ js/
â”‚   â”‚   â”œâ”€â”€ Pages/
â”‚   â”‚   â”‚   â”œâ”€â”€ Landing/           # Marketing pages
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ Home.jsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ Pricing.jsx
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ Features.jsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Opac/              # Public library pages
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ Home.jsx       # Library OPAC home
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ Search.jsx     # Search results
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ Record.jsx     # Bibliographic record detail
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ Reader.jsx     # PDF/ePub reader
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ MyAccount.jsx  # Patron account
â”‚   â”‚   â”‚   â””â”€â”€ Auth/
â”‚   â”‚   â”‚       â”œâ”€â”€ PatronLogin.jsx
â”‚   â”‚   â”‚       â””â”€â”€ PatronRegister.jsx
â”‚   â”‚   â”œâ”€â”€ Components/
â”‚   â”‚   â”‚   â”œâ”€â”€ Catalog/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ CatalogForm.jsx       # Unified catalog form (key component)
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ MaterialTypeSelector.jsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ BiblioSection.jsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ PhysicalSection.jsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ DigitalSection.jsx
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ RecordCard.jsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Opac/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ SearchBar.jsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ FacetedFilter.jsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ ResultGrid.jsx
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ CoverImage.jsx
â”‚   â”‚   â”‚   â””â”€â”€ Reader/
â”‚   â”‚   â”‚       â”œâ”€â”€ PdfReader.jsx
â”‚   â”‚   â”‚       â””â”€â”€ EpubReader.jsx
â”‚   â”‚   â””â”€â”€ Layouts/
â”‚   â”‚       â”œâ”€â”€ LandingLayout.jsx
â”‚   â”‚       â”œâ”€â”€ OpacLayout.jsx
â”‚   â”‚       â””â”€â”€ AuthLayout.jsx
â”‚   â””â”€â”€ views/
â”‚       â””â”€â”€ emails/
â”‚           â”œâ”€â”€ overdue-notice.blade.php
â”‚           â””â”€â”€ reservation-ready.blade.php
â””â”€â”€ routes/
    â”œâ”€â”€ web.php                    # Inertia page routes
    â”œâ”€â”€ api.php                    # JSON API routes
    â””â”€â”€ tenant.php                 # Tenant-specific routes
```

---

## 6. CORE FEATURE: UNIFIED CATALOGING FORM

### 6.1 Concept

The `CatalogForm.jsx` component is the centerpiece of the system. It uses a **Material Type selector** to show/hide relevant sections:

```
Material Type: [Book â–¼]
â”‚
â”œâ”€â”€ Section 1: Basic Bibliographic Information (ALWAYS VISIBLE)
â”‚   Title, Author(s), ISBN, Publisher, Year, Edition, Language,
â”‚   Subject, Keywords, Abstract, DDC/LCC Classification
â”‚
â”œâ”€â”€ Section 2: Physical Item Information (visible if has_physical = true)
â”‚   Barcode, Accession No., Call Number, Collection, Location,
â”‚   No. of Copies, Condition, Acquisition
â”‚
â””â”€â”€ Section 3: Digital Resource Information (visible if has_digital = true)
    File Upload OR URL, Format, File Size (auto), Thumbnail,
    Access Rights, Embargo Date, OCR text (optional toggle)
```

### 6.2 Material Type Matrix

| Type | has_physical | has_digital | Notes |
|------|-------------|-------------|-------|
| Book | âœ… | âŒ | Physical book only |
| eBook | âŒ | âœ… | Digital only |
| Book + eBook | âœ… | âœ… | Both formats |
| Journal/Serial | âœ… | âœ… | Links to serials module |
| Article | âŒ | âœ… | PDF/URL |
| Thesis/Dissertation | âœ… | âœ… | |
| Audio | âŒ | âœ… | MP3, WAV, FLAC |
| Video | âŒ | âœ… | MP4, MKV |
| Map | âœ… | âœ… | |
| Dataset | âŒ | âœ… | CSV, JSON, XML |
| DVD/CD | âœ… | âŒ | |
| Magazine | âœ… | âœ… | |

### 6.3 CatalogForm Component Behavior

```jsx
// resources/js/Components/Catalog/CatalogForm.jsx

const MATERIAL_TYPES = [
  { code: 'book', label: 'Book', hasPhysical: true, hasDigital: false },
  { code: 'ebook', label: 'eBook', hasPhysical: false, hasDigital: true },
  { code: 'book_ebook', label: 'Book + eBook', hasPhysical: true, hasDigital: true },
  { code: 'journal', label: 'Journal/Serial', hasPhysical: true, hasDigital: true },
  { code: 'article', label: 'Article', hasPhysical: false, hasDigital: true },
  { code: 'thesis', label: 'Thesis/Dissertation', hasPhysical: true, hasDigital: true },
  { code: 'audio', label: 'Audio', hasPhysical: false, hasDigital: true },
  { code: 'video', label: 'Video', hasPhysical: false, hasDigital: true },
  { code: 'dataset', label: 'Dataset', hasPhysical: false, hasDigital: true },
  { code: 'dvd', label: 'DVD/CD', hasPhysical: true, hasDigital: false },
  { code: 'map', label: 'Map', hasPhysical: true, hasDigital: true },
];

// Show/hide logic:
const showPhysical = selectedType?.hasPhysical ?? false;
const showDigital  = selectedType?.hasDigital  ?? false;
```

---

## 7. FILAMENTPHP ADMIN PANEL

### 7.1 Staff Panel Navigation

```
ðŸ“š Catalog
  â”œâ”€â”€ Bibliographic Records (BibliographicRecordResource)
  â”œâ”€â”€ Physical Items
  â”œâ”€â”€ Digital Resources
  â””â”€â”€ Import Records (Z39.50 / ISBN lookup)

ðŸ”„ Circulation
  â”œâ”€â”€ Check Out
  â”œâ”€â”€ Return Items
  â”œâ”€â”€ Active Loans
  â”œâ”€â”€ Overdue Items
  â””â”€â”€ Fines & Payments

ðŸ‘¥ Patrons
  â”œâ”€â”€ All Patrons
  â”œâ”€â”€ Patron Categories
  â””â”€â”€ Membership Renewals

ðŸ“¦ Acquisitions
  â”œâ”€â”€ Orders
  â””â”€â”€ Suggestions (from OPAC)

ðŸ“° Serials
  â”œâ”€â”€ Subscriptions
  â””â”€â”€ Issues

ðŸ“Š Reports
  â”œâ”€â”€ Circulation Statistics
  â”œâ”€â”€ Collection Analysis
  â”œâ”€â”€ Digital Usage
  â”œâ”€â”€ Overdue Report
  â””â”€â”€ Acquisitions Report

âš™ï¸ Settings
  â”œâ”€â”€ Library Profile
  â”œâ”€â”€ Collections & Locations
  â”œâ”€â”€ Loan Rules
  â”œâ”€â”€ Email Templates
  â””â”€â”€ Branding
```

### 7.2 BibliographicRecordResource Key Design

```php
// app/Filament/Library/Resources/BibliographicRecordResource.php

// Form uses dynamic sections based on material type selection
// Use Filament's ->hidden(fn(Get $get) => ...) for conditional fields

// Key: material_type_id drives visibility of physical/digital sections
// Use Filament Wizard for new record creation (3 steps)
// Use Tabs for edit form (Bibliographic | Physical | Digital)
```

### 7.3 Quick Checkout Widget (Circulation Dashboard)

- Barcode scanner input (auto-focus input field)
- Enter patron card â†’ shows name + current loans
- Scan item barcode â†’ checkout with one click
- Shows due date immediately
- Print receipt option

---

## 8. OPAC (Online Public Access Catalog)

### 8.1 OPAC Features

**Search**
- Simple search bar (keyword, title, author, subject, ISBN)
- Advanced search with field-specific filters
- Faceted filtering: Material Type, Year Range, Language, Collection, Availability
- Full-text search across title, author, subject, abstract
- Sort: Relevance, Title A-Z, Year (newest), Most Popular

**Record Detail Page**
- Full bibliographic information
- Cover image + thumbnail
- All available formats (physical copies + digital versions)
- Physical: copy availability table (location, call number, status)
- Digital: access button (Download / Read Online / Stream)
- Reserve button (if all copies checked out)
- "Similar items" based on subject/author
- Social share, export citation (APA, MLA, Chicago, BibTeX)

**Patron Account (My Account)**
- Current loans + due dates
- Loan history
- Active reservations
- Downloaded/accessed digital resources
- Fines
- Reading wishlist

### 8.2 OPAC Route Structure

```
/                      â†’ Library home (recent additions, announcements)
/catalog               â†’ Search / browse
/catalog/search        â†’ Search results (with facets)
/catalog/{id}          â†’ Record detail page
/reader/{resource_id}  â†’ Embedded PDF/ePub reader
/account               â†’ Patron account (auth required)
/account/loans         â†’ My loans
/account/reservations  â†’ My reservations
/account/history       â†’ Loan history
/login                 â†’ Patron login
/register              â†’ Patron self-registration
```

---

## 9. LANDING PAGE (Marketing Site)

### 9.1 Pages

- `/` — Hero, features overview, pricing, testimonials, CTA
- `/features` — Detailed features (catalog, circulation, eLibrary, reports)
- `/pricing` — Plan comparison table + FAQ
- `/demo` — Request a demo form
- `/about` — About Alpha eLibrary / Corasoft
- `/contact` — Contact form
- `/docs` — Documentation (optional, link to docs site)

### 9.2 Landing Page Sections

```
Hero: "The Modern Library OS for Southeast Asia"
      Subtitle: "Catalog. Circulate. Go Digital. All in One."
      CTA: [Start Free Trial] [Request Demo]

Features Grid (6 cards):
  ðŸ“š Unified Cataloging   ðŸ”„ Circulation Management
  ðŸ“– eLibrary & Reader    ðŸ‘¥ Patron Management
  ðŸ“Š Analytics & Reports  ðŸŒ Multi-Branch Support

How It Works (3 steps):
  1. Register your library
  2. Import or add your catalog
  3. Go live — staff & patrons access immediately

Pricing (3 tiers):
  Free / Starter $29/mo / Pro $79/mo / Enterprise (custom)

Social Proof:
  "Trusted by X libraries in Southeast Asia"

CTA Section: "Ready to modernize your library?"
```

### 9.3 Pricing Plans

| Feature | Free | Starter | Pro | Enterprise |
|---------|------|---------|-----|------------|
| Price | $0 | $29/mo | $79/mo | Custom |
| Titles | 500 | 5,000 | 50,000 | Unlimited |
| Patrons | 100 | 1,000 | 10,000 | Unlimited |
| Storage | 1 GB | 20 GB | 200 GB | Custom |
| Digital Library | âŒ | âœ… | âœ… | âœ… |
| Multiple Locations | âŒ | âŒ | âœ… | âœ… |
| Custom Domain | âŒ | âŒ | âœ… | âœ… |
| API Access | âŒ | âŒ | âœ… | âœ… |
| Khmer Language | âœ… | âœ… | âœ… | âœ… |
| Support | Community | Email | Priority | Dedicated |

---

## 10. LIBRARY INDIVIDUAL PAGE STRUCTURE

Each tenant library has its own public-facing library portal:

```
{slug}.bannalai.com/
â”‚
â”œâ”€â”€ / (OPAC Home)
â”‚   â”œâ”€â”€ Library name + logo (branding from settings)
â”‚   â”œâ”€â”€ Search bar (prominent)
â”‚   â”œâ”€â”€ Recently Added resources (grid)
â”‚   â”œâ”€â”€ Browse by Category / Subject
â”‚   â”œâ”€â”€ Quick Stats (X titles, X ebooks, X members)
â”‚   â””â”€â”€ Announcements
â”‚
â”œâ”€â”€ /catalog (Browse)
â”‚   â”œâ”€â”€ Faceted search sidebar
â”‚   â”œâ”€â”€ Result grid/list toggle
â”‚   â””â”€â”€ Pagination
â”‚
â”œâ”€â”€ /catalog/{id} (Record Detail)
â”‚   â”œâ”€â”€ Cover + metadata
â”‚   â”œâ”€â”€ Physical copies table
â”‚   â”œâ”€â”€ Digital access panel
â”‚   â”œâ”€â”€ Reserve / Checkout button
â”‚   â””â”€â”€ Related records
â”‚
â”œâ”€â”€ /reader/{id} (Embedded Reader)
â”‚   â”œâ”€â”€ PDF.js viewer (for PDFs)
â”‚   â”œâ”€â”€ epub.js viewer (for EPUBs)
â”‚   â””â”€â”€ Audio/video player (for media)
â”‚
â”œâ”€â”€ /account/* (Patron portal)
â”‚
â””â”€â”€ /admin/* (FilamentPHP staff panel)
```

---

## 11. KEY LARAVEL IMPLEMENTATIONS

### 11.1 Multi-Tenancy Setup

```bash
# Install stancl/tenancy
composer require stancl/tenancy

# Publish config
php artisan vendor:publish --provider="Stancl\Tenancy\TenancyServiceProvider"

# Config: config/tenancy.php
# - tenant_model: App\Models\Central\Tenant
# - database: prefix-based or separate DB (use separate)
```

### 11.2 CatalogService Core Methods

```php
// app/Services/CatalogService.php

class CatalogService
{
    public function createRecord(array $data): BibliographicRecord
    {
        // 1. Create bibliographic_records row (core metadata)
        // 2. If has_physical items in $data â†’ create physical_items rows
        // 3. If has_digital file in $data â†’ dispatch ProcessDigitalFile job
        // 4. Update search_vector via pg_trigger or Scout
        // 5. Log activity
    }

    public function searchCatalog(string $query, array $filters = []): LengthAwarePaginator
    {
        // Use PostgreSQL full-text search
        // SELECT *, ts_rank(search_vector, plainto_tsquery('english', ?)) AS rank
        // WHERE search_vector @@ plainto_tsquery('english', ?)
        // + apply facet filters (material_type, year range, language, availability)
        // ORDER BY rank DESC
    }

    public function lookupByISBN(string $isbn): ?array
    {
        // Query Open Library API: https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&format=json&jscmd=data
        // Return pre-filled form data
        // Cache result for 30 days
    }
}
```

### 11.3 CirculationService Core Methods

```php
// app/Services/CirculationService.php

class CirculationService
{
    public function checkout(string $patronId, string $itemId, ?string $staffId = null): Loan
    {
        // 1. Validate patron (active, within loan limit, no blocks)
        // 2. Validate item (available, loanable collection)
        // 3. Calculate due_date based on patron_category + collection rules
        // 4. Create loans record
        // 5. Update item status â†’ 'checked_out'
        // 6. Increment patron active_loans count
        // 7. Dispatch checkout confirmation email
    }

    public function returnItem(string $loanId, ?string $staffId = null): Loan
    {
        // 1. Mark loan as returned (returned_at = now)
        // 2. Calculate fine if overdue
        // 3. Update item status â†’ 'available'
        // 4. Check if reservations exist â†’ notify next in queue
        // 5. Decrement patron active_loans count
    }

    public function renewLoan(string $loanId): Loan
    {
        // Check renewal limit (patron_category.renewals_allowed)
        // Check no other reservations on this biblio
        // Extend due_date
    }

    public function calculateFine(Loan $loan): float
    {
        // Days overdue Ã— patron_category.fine_rate_per_day
        // Max fine cap from library settings
    }
}
```

### 11.4 ProcessDigitalFile Job

```php
// app/Jobs/ProcessDigitalFile.php

class ProcessDigitalFile implements ShouldQueue
{
    public function handle(): void
    {
        // 1. Validate file (virus scan if configured)
        // 2. Store to S3 at /{tenant_id}/resources/{uuid}/{filename}
        // 3. Generate thumbnail:
        //    - PDF: use spatie/pdf-to-image (page 1 â†’ JPEG)
        //    - Video: use ffmpeg (frame at 5s)
        //    - ePub: extract cover image
        // 4. Get file metadata (size, mime, duration for audio/video)
        // 5. Queue OCR if PDF and OCR enabled (using pdftotext or Tesseract)
        // 6. Update digital_resources record
    }
}
```

### 11.5 Open Library ISBN Lookup

```php
// Integrated into CatalogForm via Livewire/Inertia
// When ISBN entered â†’ call /catalog/lookup-isbn/{isbn}
// Pre-fills: title, authors, publisher, year, cover image, subjects
// Librarian reviews and confirms before saving
```

### 11.6 Full-Text Search Trigger (PostgreSQL)

```sql
-- Auto-update search_vector on insert/update
CREATE OR REPLACE FUNCTION update_biblio_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.title_alternative, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(array_to_string(array(
            SELECT value::text FROM jsonb_array_elements_text(NEW.authors->'name')
        ), ' '), '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.abstract, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(array_to_string(NEW.keywords, ' '), '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_biblio_search_vector
    BEFORE INSERT OR UPDATE ON bibliographic_records
    FOR EACH ROW EXECUTE FUNCTION update_biblio_search_vector();
```

---

## 12. REACT/INERTIA PAGES

### 12.1 Key Pages to Build First

**Priority 1 (MVP)**
1. `Landing/Home.jsx` — Marketing homepage
2. `Opac/Home.jsx` — Library home with search
3. `Opac/Search.jsx` — Search results with facets
4. `Opac/Record.jsx` — Record detail
5. `Catalog/CatalogForm.jsx` — Unified catalog form (staff)
6. `Auth/PatronLogin.jsx`

**Priority 2**
7. `Opac/Reader.jsx` — PDF/ePub embedded reader
8. `Opac/MyAccount.jsx` — Patron account
9. `Landing/Pricing.jsx`

### 12.2 CatalogForm State Structure

```javascript
// Form state shape:
const initialState = {
  // Material
  material_type_id: null,
  
  // Bibliographic (always)
  title: '',
  title_alternative: '',
  subtitle: '',
  title_km: '',
  authors: [{ name: '', role: 'author' }],
  isbn: '',
  issn: '',
  doi: '',
  publisher: '',
  publisher_place: '',
  publication_year: new Date().getFullYear(),
  edition: '',
  language: 'en',
  subjects: [{ term: '', scheme: 'LCSH' }],
  keywords: [],
  ddc_class: '',
  lcc_class: '',
  abstract: '',
  abstract_km: '',
  series_title: '',
  series_number: '',
  notes: '',
  cover_image_url: '',
  
  // Physical (conditional)
  physical: {
    barcode: '',
    accession_number: '',
    call_number: '',
    collection_id: null,
    location_id: null,
    condition: 'good',
    quantity: 1,
    price: '',
    acquired_date: '',
  },
  
  // Digital (conditional)
  digital: {
    file: null,        // File object
    url: '',
    format: '',
    access_type: 'restricted',
    embargo_until: '',
    version: '1.0',
    enable_ocr: false,
  }
};
```

---

## 13. LARAVEL PACKAGES

```json
// composer.json dependencies
{
    "require": {
        "laravel/framework": "^13.0",
        "stancl/tenancy": "^3.8",
        "filament/filament": "^5.0",
        "spatie/laravel-permission": "^6.0",
        "spatie/laravel-activitylog": "^4.7",
        "spatie/laravel-medialibrary": "^11.0",
        "spatie/pdf-to-image": "^3.0",
        "laravel/horizon": "^5.22",
        "laravel/scout": "^10.0",
        "maatwebsite/excel": "^3.1",
        "barryvdh/laravel-dompdf": "^3.0",
        "intervention/image": "^3.0",
        "league/flysystem-aws-s3-v3": "^3.0",
        "guzzlehttp/guzzle": "^7.0"
    }
}
```

```json
// package.json dependencies
{
    "dependencies": {
        "@inertiajs/react": "^2.0",
        "react": "^18.3",
        "react-dom": "^18.3",
        "@react-pdf-viewer/core": "^3.12",
        "epubjs": "^0.3.93",
        "react-barcode": "^1.4",
        "recharts": "^2.12",
        "zustand": "^5.0",
        "@tanstack/react-query": "^5.0",
        "@tiptap/react": "^2.4",
        "i18next": "^23.0",
        "react-i18next": "^15.0",
        "react-select": "^5.8",
        "react-dropzone": "^14.2"
    }
}
```

---

## 14. CIRCULATION RULES ENGINE

Library settings table stores loan rules. CirculationService reads them dynamically:

```
Default Loan Periods:
  Student:  14 days, 5 books max, 2 renewals
  Faculty:  30 days, 10 books max, 3 renewals
  Staff:    21 days, 7 books max, 2 renewals
  Public:   7 days, 3 books max, 1 renewal

Special Collections:
  Reference: No loan (in-library use only)
  Reserve:   3-hour loan, no renewal
  Periodicals: No loan (in-library use only)

Fine Rates (configurable per library):
  Default: $0.10/day
  DVDs:    $0.50/day
  Max fine: $10.00 (configurable)
```

---

## 15. PAYMENT INTEGRATION (SaaS Billing)

For Cambodia + international:

```php
// Payment methods for Alpha eLibrary SaaS subscriptions:
// 1. ABA PayWay (Cambodia primary)
// 2. Bakong KHQR (Cambodia QR)
// 3. Stripe (International, via US LLC)
// 4. Manual invoice (Enterprise)

// Use same payment gateway if available
// Fallback: Lemon Squeezy / Paddle as MoR for international
```

---

## 16. SEARCH STANDARDS COMPLIANCE

Based on Koha/library standards research:

- **Full-text search:** PostgreSQL tsvector (primary), Meilisearch (optional upgrade)
- **Metadata standard:** Dublin Core 15 elements as base, MARC21-inspired fields
- **Classification:** DDC (Dewey) + LCC (Library of Congress) fields
- **ISBN validation:** ISBN-10 and ISBN-13 with check digit validation
- **Language codes:** ISO 639-1 (en, km, fr, zh, etc.)
- **Country codes:** ISO 3166-1 alpha-3
- **Date format:** ISO 8601 (YYYY-MM-DD)
- **Citation export:** BibTeX, RIS, APA, MLA, Chicago formats
- **Z39.50 (future):** ISBN pre-fill via Open Library API (free, no Z39.50 server needed)
- **OAI-PMH (future):** Expose catalog metadata for aggregators

---

## 17. EMAIL NOTIFICATIONS (Brevo SMTP)

| Trigger | Template | Recipient |
|---------|----------|-----------|
| Loan created | checkout-confirmation | Patron |
| Due date -3 days | due-date-reminder | Patron |
| Item overdue | overdue-notice | Patron |
| Reservation ready | reservation-ready | Patron |
| New patron | welcome | Patron |
| Password reset | password-reset | Patron/Staff |
| Trial expiring | trial-expiry | Library Admin |

---

## 18. ENVIRONMENT VARIABLES

```env
# App
APP_NAME=BannaLai
APP_ENV=production
APP_KEY=
APP_URL=https://bannalai.com

# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=bannalai_central
DB_USERNAME=bannalai
DB_PASSWORD=

# Tenancy
TENANCY_DATABASE_PREFIX=bannalai_

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Storage
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=ap-southeast-1
AWS_BUCKET=bannalai-files
AWS_URL=

# Mail (Brevo)
MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=noreply@bannalai.com
MAIL_FROM_NAME=BannaLai

# Open Library API (free, no key needed)
OPEN_LIBRARY_API=https://openlibrary.org/api/books

# Optional: Meilisearch
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=
```

---

## 19. DEVELOPMENT PHASES

### Phase 1 — Foundation (Week 1-2)
- [ ] Laravel 13 project setup with stancl/tenancy
- [ ] Central DB migrations (tenants, plans, subscriptions)
- [ ] Tenant DB migrations (all schema above)
- [ ] FilamentPHP installation + central admin panel
- [ ] Tenant FilamentPHP library panel scaffold
- [ ] Auth (staff + patron, separate guards)
- [ ] Material types seeder + patron categories seeder

### Phase 2 — Core Catalog (Week 3-4)
- [ ] BibliographicRecordResource (FilamentPHP) with unified form
- [ ] CatalogForm.jsx (React) with conditional sections
- [ ] CatalogService + SearchService
- [ ] PostgreSQL full-text search trigger + index
- [ ] ISBN Open Library auto-fill
- [ ] Cover image upload

### Phase 3 — Circulation (Week 5-6)
- [ ] PhysicalItem management
- [ ] CirculationService (checkout, return, renew)
- [ ] FineCalculator
- [ ] Loan + reservation FilamentPHP resources
- [ ] Quick checkout barcode widget

### Phase 4 — eLibrary (Week 7-8)
- [ ] DigitalResource model + file upload
- [ ] ProcessDigitalFile job (thumbnail, OCR, metadata)
- [ ] Digital access control (open/restricted)
- [ ] PDF reader (PDF.js via react-pdf)
- [ ] ePub reader (epub.js)
- [ ] Digital access logs

### Phase 5 — OPAC (Week 9-10)
- [ ] Public OPAC React pages (Home, Search, Record, Reader)
- [ ] Faceted search sidebar
- [ ] Patron auth + My Account
- [ ] Reservations via OPAC
- [ ] Citation export (BibTeX, APA, MLA)

### Phase 6 — SaaS Platform (Week 11-12)
- [ ] Landing page (full marketing site)
- [ ] Tenant registration flow
- [ ] Subscription/billing integration
- [ ] Super admin panel (tenant management)
- [ ] Reports & analytics dashboard
- [ ] Email notification system

### Phase 7 — Polish & Launch (Week 13-14)
- [ ] Khmer language (i18next translations)
- [ ] Library branding settings (logo, colors)
- [ ] Mobile responsiveness audit
- [ ] Performance optimization (query caching, eager loading)
- [ ] API documentation
- [ ] Demo library seeder

---

## 20. SECURITY REQUIREMENTS

- **Tenant isolation:** Row-level security between tenants (separate DBs)
- **File access control:** Signed S3 URLs with expiry for restricted digital resources
- **Auth:** Laravel Sanctum for API, session for web
- **RBAC:** Spatie roles — super_admin, library_admin, cataloger, circulation_staff
- **Rate limiting:** API routes rate-limited (60/min default)
- **File validation:** Mime type + file size validation on upload
- **XSS:** Inertia/React handles escaping; TipTap sanitizes HTML
- **CORS:** Configured for API routes only

---

## 21. TESTING

```php
// Key test coverage required:
// - CatalogService: create, search, ISBN lookup
// - CirculationService: checkout, return, fine calculation, renewal limit
// - Tenancy: data isolation between tenants
// - File upload: ProcessDigitalFile job
// - OPAC search: full-text, faceted filters

// php artisan test --coverage
// Feature tests > Unit tests for library logic
```

---

## 22. CLAUDE CODE WORKING INSTRUCTIONS

When using Claude Code on this project:

1. **Always check tenant context** — most models are tenant-aware via stancl/tenancy. Use `tenant()` helper.

2. **FilamentPHP Resources** — Use `php artisan make:filament-resource ModelName --generate` as starting point, then customize.

3. **Migrations** — Tenant migrations go in `database/migrations/tenant/`. Run with `php artisan tenants:migrate`.

4. **Search vector** — After schema changes to bibliographic_records, re-run trigger: `php artisan db:seed --class=UpdateSearchVectors`

5. **File uploads in FilamentPHP** — Use `FileUpload` field with `disk('s3')`, dispatch `ProcessDigitalFile` job in `afterCreate()`.

6. **React components** — All catalog form logic in `CatalogForm.jsx`. Use Zustand for form state if form grows complex.

7. **ISBN lookup** — Debounce ISBN input (500ms), call `/api/catalog/lookup-isbn/{isbn}`, pre-fill form on success.

8. **i18n** — All UI strings must use `t('key')`. Add to `resources/js/locales/en.json` and `km.json`.

9. **Conventional commits** — feat: catalog: add unified form ISBN autofill

---

## 23. KEY COMMANDS REFERENCE

```bash
# Install
composer install
npm install
php artisan key:generate
php artisan migrate (central)
php artisan tenants:migrate
php artisan db:seed

# Dev
php artisan serve
php artisan horizon
npm run dev

# New tenant (for testing)
php artisan tinker
>>> \App\Models\Central\Tenant::create(['id' => 'demo', 'slug' => 'demo', 'name' => 'Demo Library']);

# Run specific seeder
php artisan db:seed --class=MaterialTypeSeeder

# Cache clear
php artisan optimize:clear

# Queue work (including storage migration)
php artisan queue:work redis --queue=storage-migration,digital-processing,default
```

---

## 24. ADMIN PANEL ARCHITECTURE (React + Inertia)

**⚠️ IMPORTANT:** FilamentPHP was completely removed in June 2026. The admin panel is now 100% React + Inertia.js.

### 24.1 Technology Stack

- **Frontend:** React 18 + Inertia.js v2
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Layout:** `resources/js/Layouts/AdminLayout.jsx`
- **Routes:** `routes/admin.php`
- **Controllers:** `app/Http/Controllers/Admin/*`

### 24.2 New Features Added (June 2026)

#### Theme Management (`/admin/settings/theme`)

**Features:**
- 10 pre-built templates
- 6 custom colors (color picker)
- 15 Google Fonts
- Live preview
- One-click reset

**Files:**
- `app/Http/Controllers/Admin/ThemeController.php`
- `resources/js/Pages/Admin/Settings/Theme.jsx`
- `app/Services/TemplateService.php`

#### Cloud Storage Management (`/admin/settings/storage`)

**Supported Providers:**
1. Cloudflare R2 (Default) - FREE egress
2. Cloudflare R2 (Custom)
3. Amazon S3
4. DigitalOcean Spaces
5. Wasabi
6. Google Cloud Storage

**Features:**
- Connection testing
- Usage statistics
- File migration between providers
- Progress tracking
- Signed URLs

**Files:**
- `app/Http/Controllers/Admin/StorageController.php`
- `resources/js/Pages/Admin/Settings/Storage.jsx`
- `app/Services/StorageProviderService.php`
- `app/Jobs/StorageMigrationJob.php`
- `app/Services/MigrationProgressService.php`
- `config/storage-providers.php`

**Documentation:**
- `docs/cloudflare-r2-setup.md`
- `docs/storage-migration-guide.md`

#### Tenant Management (`/admin/tenants`) - Super Admin Only

**Features:**
- List/search/filter tenants
- Create tenant (auto-generates database)
- Edit details
- Assign plans
- Suspend/activate/delete

**Files:**
- `app/Http/Controllers/Admin/TenantController.php`
- `resources/js/Pages/Admin/Tenants/Index.jsx`
- `resources/js/Pages/Admin/Tenants/Form.jsx`

#### Plan Management (`/admin/plans`) - Super Admin Only

**Features:**
- Visual plan cards
- Resource limits
- Feature lists
- Monthly/annual billing
- Cannot delete if tenants exist

**Files:**
- `app/Http/Controllers/Admin/PlanController.php`
- `resources/js/Pages/Admin/Plans/Index.jsx`
- `resources/js/Pages/Admin/Plans/Form.jsx`

### 24.3 File Structure

```
resources/js/
├── Layouts/
│   └── AdminLayout.jsx          # Main admin layout
├── Pages/Admin/
│   ├── Dashboard.jsx
│   ├── Catalog/
│   │   ├── Index.jsx
│   │   ├── Form.jsx
│   │   └── Show.jsx
│   ├── Digital/
│   │   ├── Index.jsx
│   │   └── Form.jsx
│   ├── Patrons/
│   │   ├── Index.jsx
│   │   └── Form.jsx
│   ├── Settings/
│   │   ├── Index.jsx
│   │   ├── Theme.jsx           ✨ NEW
│   │   └── Storage.jsx         ✨ NEW
│   ├── Tenants/
│   │   ├── Index.jsx           ✨ NEW
│   │   └── Form.jsx            ✨ NEW
│   └── Plans/
│       ├── Index.jsx           ✨ NEW
│       └── Form.jsx            ✨ NEW
└── Components/Admin/
    ├── DataTable.jsx
    ├── FormSection.jsx
    └── StatCard.jsx

app/Http/Controllers/Admin/
├── ThemeController.php         ✨ NEW
├── StorageController.php       ✨ NEW
├── TenantController.php        ✨ NEW
├── PlanController.php          ✨ NEW
├── CatalogController.php
├── PatronController.php
└── ... (existing controllers)
```

### 24.4 Navigation Structure

The admin sidebar shows different menus based on user role:

**All Staff:**
- Dashboard
- Catalog (Books, Items, Digital)
- Circulation (Quick Checkout, Loans, Reservations)
- Patrons
- Acquisitions
- Serials
- Reports
- Settings (General, Theme, Storage, Collections)

**Super Admin Only:**
- Tenants (Manage libraries)
- Plans (Subscription tiers)

### 24.5 Cloud Storage Integration

All digital file uploads now use the configured cloud storage provider:

**Default Provider:** Cloudflare R2 (from `.env`)

**Upload Flow:**
1. User uploads file in Digital Resource form
2. `DigitalResourceController` receives file
3. Gets active disk from `StorageProviderService`
4. Uploads to configured provider (R2/S3/etc)
5. Dispatches `ProcessDigitalFile` job
6. Job generates thumbnail on same storage
7. Optionally runs OCR

**Migration Flow:**
1. Admin configures new provider
2. Tests connection
3. Clicks "Migrate Files"
4. `StorageMigrationJob` processes files in chunks (50/chunk)
5. For each file: download → verify checksum → upload → verify
6. Real-time progress updates
7. Completion notification

### 24.6 Environment Variables

```env
# Cloudflare R2 (Default Storage)
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ACCOUNT_ID=
R2_BUCKET=alpha-elibrary-files
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_PUBLIC_URL=

# Storage Migration
STORAGE_MIGRATION_CHUNK_SIZE=50
STORAGE_MIGRATION_DELAY=5
STORAGE_MIGRATION_VERIFY=true
```

---

## 25. CURRENT OPERATIONAL STATE (updated June 2026)

> This section records what is **actually true in the running project** and supersedes
> earlier aspirational notes where they conflict.

### 25.1 Database — PostgreSQL (local dev via Laragon)

The project now runs on **PostgreSQL 18** (Laragon), not SQLite.

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=alpha_elibrary_central   # central DB
DB_USERNAME=postgres
DB_PASSWORD=                         # Laragon default: empty
```

- Central DB: `alpha_elibrary_central`. Tenant DBs: prefix `alpha_elibrary_tenant_<uuid>`
  (`config/tenancy.php` → `database.prefix`). Tenant id is a **UUID** (so DB names contain
  hyphens — quote them in raw `psql`).
- `psql` lives at `C:\laragon\bin\postgresql\postgresql\bin\psql.exe` (not on PATH).
- **pgvector is NOT installed** on this PG18/Windows box → semantic/vector search stays
  disabled and `HybridSearchService` falls back to tsvector. Full-text search uses the
  `search_vector` tsvector + trigger (`...add_fulltext_search_trigger`).

**Running migrations** (central migrations are split across two folders):
```bash
# Central (root + central/ subfolder must both be loaded, in date order)
php artisan migrate --path=database/migrations --path=database/migrations/central --force
# Tenant DBs are created/migrated/seeded automatically on tenant creation (see 25.2)
```

### 25.2 Tenancy is now fully wired

`app/Providers/TenancyServiceProvider.php` (registered in `bootstrap/providers.php`) maps the
stancl lifecycle events to jobs: **CreateDatabase → MigrateDatabase → SeedDatabase**
(`TenantDatabaseSeeder`). Creating a `Tenant` now auto-provisions its PostgreSQL database.
(SQLite previously masked the missing provider because it auto-creates DB files on connect.)

- Permission tables exist **per tenant** (`database/migrations/tenant/2026_01_02_000000_create_permission_tables.php`,
  with UUID morph keys + a `description` column on `roles`).
- Demo tenant: slug **`elibrary`**. Staff login: `http://127.0.0.1:8000/elibrary/admin/login`
  (`bora@gmail.com` / `12345678`, or seeded `library.admin@bannalai.com` / `password`).
  Central super admin: `/central/login` → `admin@bannalai.com` / `password`.

### 25.3 Auth / middleware ordering (important)

Staff use the default `web` guard (provider model `App\Models\Tenant\User`). Tenancy **must
initialize before `auth`** or the guard queries the central DB and login loops. This is enforced
in `bootstrap/app.php`:
```php
$middleware->prependToPriorityList(
    before: \Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests::class,
    prepend: \App\Http\Middleware\InitializeTenancyBySlug::class,
);
```
`InitializeTenancyBySlug` also calls `URL::defaults(['slug' => $slug])` so `route('admin.*')`
redirects don't fail. Guests are redirected per-area via `$middleware->redirectGuestsTo(...)`.

### 25.4 Catalog interoperability (added this cycle)

- **OAI-PMH 2.0 provider**: `app/Http/Controllers/OaiPmhController.php`, public at `/{slug}/oai`
  (verbs: Identify, ListMetadataFormats, ListSets, ListRecords, ListIdentifiers, GetRecord;
  formats `oai_dc` + `marc21`). XML via the `Response::xml()` macro in `AppServiceProvider`
  (uses DOMDocument — handles namespaced tags like `dc:title`).
- **MARC helpers** on `BibliographicRecord`: `getMarcField()`, `getMarcFieldsArray()`,
  `marcToDublinCore()`.
- **Tenant-scoped JSON API** under `/{slug}/api/v1/catalog/...` (defined in `routes/web.php`
  inside the `{slug}` group, NOT `routes/api.php` — catalog data is per-tenant). Endpoints:
  search, show, `bibframe`, `marc`, `dublincore`, `similar`. Controller methods take
  `(string $slug, string $id)` because of the two route params.
- **Semantic search infra** (disabled until pgvector): `HybridSearchService`,
  `GenerateBibliographicEmbedding` job, `BibliographicRecordObserver`,
  `add_vector_search_support` migration (safely skips when pgvector is absent).
- **Z39.50**: `app/Services/Z3950/Z3950Client.php` + `php artisan z3950:check` (needs the YAZ
  PHP extension; optional).

### 25.5 Frontend / dev-run gotchas

- Admin panel is React + Inertia, built assets in `public/build`. After editing JSX run
  **`npm run build`** (or `npm run dev` for HMR).
- ⚠️ If `npm run dev` is killed, a stale **`public/hot`** file can remain pointing at a dead
  Vite server → the UI loads no JS ("buttons do nothing"). Delete `public/hot` to fall back to
  built assets, or restart Vite.
- `CACHE_STORE=array` (file cache can't satisfy the tenant cache **tagging** that full tenancy
  bootstrapping requires; no Redis locally). Spatie permission cache is therefore per-request.
- Recently redesigned: `resources/js/Pages/Admin/Dashboard.jsx` and the sidebar in
  `resources/js/Layouts/AdminLayout.jsx`.

### 25.6 Multi-branch (Koha-style) — PLANNED, not yet built

Branches = `locations` rows with `is_branch = true` (hierarchy via `parent_id`). The schema
exists but is **operationally disconnected**: staff have no branch, data isn't branch-scoped,
and circulation doesn't record a branch. A core multi-branch implementation is planned
(Koha model: titles shared institution-wide, copies/loans/patrons/staff per branch;
"default to home branch, admins can switch"). Note `locations.id` is a **bigint** — branch FKs
must be `foreignId`, not `foreignUuid`.

### 25.7 Sample Data & Media Player Updates (June 2026)

#### Sample Data — `ThumailSeeder.php`

New seeder at `database/seeders/ThumailSeeder.php` seeds the **`elibrary`** tenant with a full
demo catalog. Run with:

```bash
php artisan db:seed --class=ThumailSeeder
```

Seeded content (all idempotent — safe to re-run):

| Type | Count | Notes |
|------|-------|-------|
| eBooks | 12 | format `pdf`, access `registered` |
| ePublications (epub) | 12 | format `audio` / epub |
| Audio | 6 | external MP3 URLs (SoundHelix CDN) |
| Video | 4 | external MP4 URLs (Google sample CDN) |
| Theses | 4 | physical copies + digital |
| Physical Books | 12 | barcoded items in GEN collection |

**Audio digital_resources** — `is_external=true`, `format='audio'`, URLs:
```
https://www.soundhelix.com/examples/mp3/SoundHelix-Song-{1-6}.mp3
```

**Video digital_resources** — `is_external=true`, `format='mp4'`, URLs:
```
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4
```

> **PostgreSQL sequence note:** `DemoSeeder` inserts `collections` with explicit IDs 1–6,
> leaving the PG sequence at 1. `ThumailSeeder` therefore skips collection seeding (rows
> already exist) to avoid `duplicate key` errors. When adding new collections to a fresh
> tenant use `DB::table('collections')->insert(...)` *without* an explicit `id`, not
> `updateOrInsert`.

---

#### OPAC Homepage — `resources/js/Pages/Opac/Home.jsx`

- **Theses section** redesigned to use the same `aspect-[2/3]` book-cover grid as eBooks
  (was a 2-column horizontal card list with a graduation cap icon).
- All 6 homepage sections: eBooks · ePublications · Audio · Video · Theses · Physical Books.

---

#### Record Detail — `resources/js/Pages/Opac/Record.jsx`

Two new media-aware states added:

**Audio (`material_type.code === 'audio'`)**
- Cover panel replaced with blue gradient Music disc + waveform decoration.
- Inline `AudioPlayer` component rendered below the Abstract:
  - Custom HTML5 `<audio>` wrapper (hidden native element).
  - Track info (title + author), waveform visualizer bar.
  - Scrubable progress bar (range input), current / total time.
  - Play/Pause button, ±10 s skip (SkipBack / SkipForward).
  - Volume slider + mute toggle.
- "Read Online" button hidden for audio (player is inline).
- `audioUrl` resolved from `resource.url` (external) → `file_path` → `resource.url` fallback.

**Video (`material_type.code === 'video'`)**
- Cover panel replaced with dark cinematic gradient + Film icon + overlay.
- **Watch Now** button inside cover panel (links to Reader page).
- **Watch Video** button in the Availability card.
- "Read Online" button hidden for video.

---

#### Reader — `resources/js/Pages/Opac/Reader.jsx`

Format routing extended:

| Format string | Viewer |
|---------------|--------|
| `mp3`, `wav`, `flac`, **`audio`** | `AudioViewer` |
| `mp4`, `mkv`, `webm`, **`video`** | `VideoViewer` |

Previously `'audio'` and `'video'` fell through to `UnsupportedViewer`.

---

#### Landing Page UI

- **`LandingLayout.jsx`** — nav link font size `text-sm → text-base`; button font size
  `text-xs → text-sm`.
- **`LanguageSwitcher.jsx`** — trigger button font size updated to `text-base` to match nav.
- **`km.json`** — landing section nav labels corrected to short Khmer equivalents consistent
  with English nav labels.

---

### 25.8 Patron Auth, Cataloging AI & UI fixes (June 2026)

This cycle added patron QR login, librarian-controlled registration/credentials, an AI
book-cover scanner for cataloging, backend↔frontend pricing sync, and Khmer/UI fixes.

#### Patron QR-code login

- Patrons have a stable `qr_token` (`patrons.qr_token`, 64-char) auto-generated on create:
  `hash('sha256', $patron->id . config('app.key'))`. Migration
  `database/migrations/tenant/2026_06_13_000001_add_qr_token_to_patrons_table.php` backfills
  existing rows. Auto-set in `Patron::booted()` (`app/Models/Tenant/Patron.php`).
- Login flow: `POST /{slug}/login/qr` → `PatronAuthController@loginByQr` (verifies token, active
  patron, `Auth::guard('patron')->login()`). Browser camera scanner via **`html5-qrcode`** in
  `resources/js/Pages/Auth/PatronLogin.jsx` (QR tab).
- Patron's own QR: `GET /{slug}/account/qr-token` → `getQrToken()`. Displayed (download/print)
  in `resources/js/Pages/Opac/MyAccount.jsx` and admin `Pages/Admin/Patrons/Form.jsx` using
  **`qrcode.react`** (`QRCodeCanvas`). Admin regenerate: `POST /admin/patrons/{id}/regenerate-qr`
  → `PatronController@regenerateQr`.
- npm added: `html5-qrcode`, `qrcode.react`.

#### Patron registration control + librarian-set credentials

- The existing `enable_self_registration` library setting is now **enforced**:
  `PatronAuthController` blocks `showRegister`/`register` when off; the flag is shared to the
  frontend as `tenant.self_registration` (in `HandleInertiaRequests`) to hide all register
  links (`PatronLogin.jsx` + 5 OPAC `Navbar*` variants).
- Patrons now log in by **card number OR email** + password: `PatronAuthController@login` looks
  up by `email` (if it looks like an email) else `patron_number`. Login form field is `login`
  (not `email`).
- Admin-created patrons **always** get credentials: default password = the patron's
  `patron_number`, overridable via an editable password field in `Admin/Patrons/Form.jsx`
  (`PatronController@store`/`update`).

#### AI book-cover scanner (cataloging)

- **AI vision** added to the provider-agnostic layer: `AiTextService::generateFromImage()` now
  implemented by both `ClaudeService` (image content block) and `GeminiService` (`inline_data`
  part). Same retry/cache/usage-logging as text; usage logged under feature `cover_scan`.
- `CatalogAIService::extractFromCover($base64, $mime)` prompts the vision model for JSON
  (title, authors, publisher, year, edition, language, isbn, subjects), normalized to the
  catalog form's import shape. Provider chosen by `AiManager::for('cataloging')`.
- Endpoint: `POST /admin/catalog/scan-cover` → `CatalogController@scanCover`, gated by
  `ai_features_enabled` && `ai_cataloging_enabled` (same as `aiClassify`).
- UI: `resources/js/Components/Catalog/CoverScanModal.jsx` — live camera (`getUserMedia`, rear
  camera) + upload fallback → review detected fields → **Apply** reuses the form's existing
  `handleImport()`. Triggered by a "Scan Cover (AI)" button in `CatalogForm.jsx` (shown only
  when `props.ai.features_enabled`). Note: live camera needs HTTPS/localhost.

#### Pricing: backend ↔ frontend sync

- Landing pages now mirror the live `plans` table instead of hardcoded values. `LandingController`
  passes `is_popular`, `billing_cycle`, and `max_*` limits. `Landing/Pricing.jsx` + `Home.jsx`
  render correct billing period (`/year` vs `/month`), data-driven "Most Popular" badge, real
  limits, and feature labels (`digital_library` → "Digital Library & Reader", custom strings
  pass through). Clear cache after plan edits: `php artisan cache:forget landing.plans`.

#### Khmer font + language switcher fixes

- Khmer looked cramped because `<html lang>` (from Blade/server locale) disagreed with the
  i18next language; `:lang(km)` CSS never applied. Fix: `resources/js/i18n.js` now sets
  `document.documentElement.lang` on init (not just on change). `resources/css/app.css` Khmer
  rules tuned (Noto Sans Khmer first, `letter-spacing:0`, sane line-heights).
- Language dropdown showed an empty white box because the themed OPAC navbar
  (`ThemeProvider` injects `.opac-navbar-themed button { color:white !important }`) made menu
  items white-on-white. Fix: `LanguageSwitcher.jsx` panel marked `.lang-dropdown` and
  `app.css` adds more-specific overrides restoring readable colors inside the panel.

---

*Alpha eLibrary — Built by Corasoft, Phnom Penh, Cambodia*  
*Cambodia's AI-native software agency — Laravel · React · Claude Code*

