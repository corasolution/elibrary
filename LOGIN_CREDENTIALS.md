# 🔐 Alpha eLibrary - Login Credentials

## 📌 Quick Access URLs

- **Landing Page**: http://127.0.0.1:8000
- **Staff Admin Panel**: http://127.0.0.1:8000/admin
- **OPAC (Public Catalog)**: http://127.0.0.1:8000/library/{slug}/
- **Patron Login**: http://127.0.0.1:8000/library/{slug}/login

---

## 👨‍💼 STAFF / ADMIN USERS

All staff passwords: `password`

| Role | Name | Email | Access Level |
|------|------|-------|--------------|
| **Super Admin** | Super Admin | admin@bannalai.com | Full system access |
| **Library Admin** | Library Admin | library.admin@bannalai.com | Library management |
| **Cataloger** | Cataloger User | cataloger@bannalai.com | Catalog & digital resources |
| **Circulation** | Circulation Staff | circulation@bannalai.com | Checkout/return operations |
| **Reader Services** | Reader Services | reader.services@bannalai.com | Patron assistance |
| **Library Admin** | Sopheak Chea | sopheak@bannalai.com | Library management |
| **Cataloger** | Sreymom Kong | sreymom@bannalai.com | Catalog management |
| **Circulation** | Dara Meas | dara@bannalai.com | Circulation operations |

### Staff Role Permissions

#### 🔴 Super Admin
- ✅ All permissions
- Full system configuration
- User management
- All modules

#### 🟠 Library Admin
- ✅ Catalog (view, create, edit, delete, import, export)
- ✅ Circulation (all operations)
- ✅ Patrons (view, create, edit, delete)
- ✅ Digital resources (all)
- ✅ Reports (view, export)
- ✅ Settings (view, edit)
- ✅ Acquisitions (all)
- ✅ Serials (all)

#### 🟡 Cataloger
- ✅ Catalog (full access + import/export)
- ✅ Digital resources (full access)
- ✅ Reports (view only)
- ✅ Acquisitions (view only)
- ✅ Serials (view only)

#### 🟢 Circulation Staff
- ✅ Catalog (view only)
- ✅ Circulation (checkout, checkin, renew, view loans, manage fines)
- ✅ Patrons (view, create, edit)
- ✅ Reports (view only)

#### 🔵 Reader Services
- ✅ Catalog (view only)
- ✅ Circulation (view loans only)
- ✅ Patrons (view, create, edit)
- ✅ Digital resources (view only)
- ✅ Reports (view only)

---

## 👥 PATRON USERS

All patron passwords: `password`

| # | Email | Patron Number | Name | Category | Expiry | Status |
|---|-------|---------------|------|----------|--------|--------|
| 1 | sophea.kim@university.edu.kh | P-2024-001 | Sophea Kim | Student | 2026-12-31 | Active |
| 2 | dara.prak@university.edu.kh | P-2024-002 | Dara Prak | Faculty | 2027-06-30 | Active |
| 3 | ratana.chan@university.edu.kh | P-2024-003 | Ratana Chan | Student | 2025-12-31 | Active |
| 4 | virak.sok@library.org | P-2024-004 | Virak Sok | Staff | 2026-08-31 | Active |
| 5 | channary.lim@gmail.com | P-2024-005 | Channary Lim | Public | 2025-06-30 | Active |
| 6 | bunna.heng@student.edu.kh | P-2024-006 | Bunna Heng | Student | 2026-12-31 | Active |
| 7 | sreymom.oun@university.edu | P-2024-007 | Sreymom Oun | Student | 2026-12-31 | Active |
| 8 | makara.tep@faculty.edu.kh | P-2024-008 | Makara Tep | Faculty | 2027-12-31 | Active |
| 9 | pisey.mao@gmail.com | P-2024-009 | Pisey Mao | Public | 2025-12-31 | Active |
| 10 | rith.noun@student.edu.kh | P-2024-010 | Rith Noun | Student | 2026-12-31 | Active |

### Patron Categories & Loan Rules

| Category | Loan Limit | Loan Period | Renewals | Fine Rate |
|----------|-----------|-------------|----------|-----------|
| **Student** | 5 books | 14 days | 2 times | $0.10/day |
| **Faculty** | 10 books | 30 days | 3 times | $0.10/day |
| **Staff** | 7 books | 21 days | 2 times | $0.10/day |
| **Public** | 3 books | 7 days | 1 time | $0.10/day |

---

## 📚 DEMO DATA

The system includes:
- ✅ **12 bibliographic records** (programming books, classics, fiction)
- ✅ **17 physical items** (with barcodes BK0001-BK0012)
- ✅ **10 patron accounts** (students, faculty, staff, public)
- ✅ **5 locations** (Main Library, Ground Floor, First Floor, Reference Room, Toul Kork Branch)
- ✅ **6 collections** (General, Reference, Khmer, Periodicals, Thesis, Reserve)
- ✅ **Active loans** (5 items currently checked out)
- ✅ **Overdue loans** (2 items with fines)
- ✅ **Returned loans** (7 completed transactions)
- ✅ **Reservations** (3 pending reservations)

---

## 🔍 QUICK TEST SCENARIOS

### Test 1: Staff Login & Catalog Management
1. Go to: http://127.0.0.1:8000/admin
2. Login: `cataloger@bannalai.com` / `password`
3. Navigate to: Catalog → Bibliographic Records
4. Try: Create new record, Import/Export

### Test 2: Circulation Operations
1. Login as: `circulation@bannalai.com` / `password`
2. Navigate to: Circulation → Quick Checkout
3. Scan patron: `P-2024-001`
4. Scan item: `BK0001`

### Test 3: Patron OPAC Access
1. Go to: http://127.0.0.1:8000/library/demo (replace 'demo' with your tenant slug)
2. Login: `sophea.kim@university.edu.kh` / `password`
3. Browse catalog, view account, check loans

### Test 4: Overdue Items & Fines
1. Login as: `circulation@bannalai.com` / `password`
2. Navigate to: Loans → Overdue Items
3. View fines for patrons with overdue books

---

## 🛡️ SECURITY NOTES

⚠️ **IMPORTANT**: These are **DEMO CREDENTIALS** for development only!

**Before production deployment:**
1. ✅ Change all default passwords
2. ✅ Remove or disable demo accounts
3. ✅ Update `.env` file: `APP_ENV=production`
4. ✅ Enable 2FA for admin accounts
5. ✅ Review and update role permissions
6. ✅ Set up proper password policies
7. ✅ Configure email verification

---

## 📞 SUPPORT

For issues or questions:
- **Email**: maobora@gmail.com
- **Project**: Alpha eLibrary
- **Builder**: Corasoft — Cambodia's AI-native software agency

---

**Last Updated**: June 1, 2026  
**Version**: 1.0.0  
**Environment**: Development

---

*Generated by Claude Code* 🤖
