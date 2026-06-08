# Locations & Collections Management

## Overview
Two new Filament resources for managing library branches, locations, and collections with different loan rules.

## LocationResource
**Purpose:** Manage physical branches and hierarchical locations (branches → rooms → shelves)

### Features
- **Hierarchical structure:** Parent-child relationships (e.g., Main Library → Reading Room → Shelf A1)
- **Branch identification:** `is_branch` flag to mark main branches
- **Khmer support:** Dual-language names
- **Active/inactive status:** Control location availability
- **Item count:** Shows number of items assigned to each location

### URL
`/admin/locations`

### Default Locations (via Seeder)
- Main Library (MAIN)
  - General Collection (MAIN-GEN)
  - Reference Section (MAIN-REF)
  - Periodicals Section (MAIN-PER)
  - Reading Room (MAIN-RR)

### Usage
```bash
# Run seeder to create default locations
php artisan db:seed --class=Database\\Seeders\\Tenant\\LocationSeeder
```

---

## CollectionResource
**Purpose:** Manage collections with different circulation rules

### Features
- **Loan rules per collection:**
  - Loanable vs. non-loanable
  - Custom loan period (days)
  - Renewal limits
  - Fine rates per day
- **Khmer support:** Dual-language names
- **Item count:** Shows number of items in each collection

### URL
`/admin/collections`

### Default Collections (via Seeder)
| Collection | Code | Loanable | Loan Period | Renewals | Fine Rate |
|-----------|------|----------|-------------|----------|-----------|
| General Collection | GEN | ✅ | 14 days | 2 | $0.10/day |
| Reference Collection | REF | ❌ | — | — | — |
| Reserve Collection | RES | ✅ | 3 days | 0 | $0.25/day |
| Periodicals | PER | ❌ | — | — | — |
| Special Collection | SPEC | ❌ | — | — | — |
| Audiovisual Collection | AV | ✅ | 7 days | 1 | $0.50/day |

### Usage
```bash
# Run seeder to create default collections
php artisan db:seed --class=Database\\Seeders\\Tenant\\CollectionSeeder
```

---

## Navigation
Both resources appear in the **Settings** navigation group in the Filament admin panel:

```
Settings
  ├── Locations & Branches (badge shows active count)
  └── Collections (badge shows active count)
```

---

## Database Schema
See migration: `2026_01_02_000003_create_locations_collections_table.php`

### Locations Table
- Hierarchical (parent_id)
- is_branch flag
- Khmer name support
- Active/inactive status

### Collections Table
- Loan rules (period, renewals, fines)
- is_loanable flag
- Active/inactive status

---

## Integration with Physical Items
When cataloging physical items, staff can now:
1. Assign items to a **Location** (where it's shelved)
2. Assign items to a **Collection** (which determines loan rules)

Example:
- Title: "Introduction to Programming"
- Location: Main Library → General Collection (MAIN-GEN)
- Collection: General Collection (14-day loan, 2 renewals, $0.10/day fine)

---

## Multi-Branch Support
For libraries with multiple branches:

1. Create additional branch locations:
   ```
   Branch A (BRANCH-A)
     └── General Collection (BRANCH-A-GEN)
     └── Reading Room (BRANCH-A-RR)
   
   Branch B (BRANCH-B)
     └── General Collection (BRANCH-B-GEN)
   ```

2. Collections are shared across all branches
3. Location determines physical placement
4. Collection determines circulation rules

---

## Files Created

### Resources
- `app/Filament/Library/Resources/LocationResource.php`
- `app/Filament/Library/Resources/LocationResource/Pages/ListLocations.php`
- `app/Filament/Library/Resources/LocationResource/Pages/CreateLocation.php`
- `app/Filament/Library/Resources/LocationResource/Pages/EditLocation.php`

- `app/Filament/Library/Resources/CollectionResource.php`
- `app/Filament/Library/Resources/CollectionResource/Pages/ListCollections.php`
- `app/Filament/Library/Resources/CollectionResource/Pages/CreateCollection.php`
- `app/Filament/Library/Resources/CollectionResource/Pages/EditCollection.php`

### Seeders
- `database/seeders/tenant/LocationSeeder.php`
- `database/seeders/tenant/CollectionSeeder.php`

### Models (Already existed)
- `app/Models/Tenant/Location.php`
- `app/Models/Tenant/Collection.php`

---

## Next Steps
1. ✅ Database schema exists
2. ✅ Models created
3. ✅ Filament resources built
4. ✅ Seeders ready
5. ⏳ Update PhysicalItemResource to show location/collection dropdowns
6. ⏳ Add location/collection filters to OPAC search
7. ⏳ Display location info on Record detail pages

---

## Testing
```bash
# Check routes are registered
php artisan route:list --name=filament.library.resources.locations
php artisan route:list --name=filament.library.resources.collections

# Seed default data for all tenants
php artisan tenants:seed --class=LocationSeeder
php artisan tenants:seed --class=CollectionSeeder

# OR seed for specific tenant
php artisan tenants:run db:seed --class=LocationSeeder --tenants={tenant-id}
```

## Status
✅ **Database:** Locations and Collections already populated in Demo Library
- 5 Locations exist (MAIN, GF, FF, REF, TK)
- 6 Collections exist (GEN, REF, KHM, PER, THES, RES)

✅ **Routes:** All Filament resource routes registered
- `/admin/locations` - Location management
- `/admin/collections` - Collection management

✅ **Ready to use:** Access the admin panel to manage locations and collections
