# 📚 Demo Library - OPAC Sample Data Guide

## Overview

The **Demo Library** is a fully functional sample library instance with realistic data to showcase the Alpha eLibrary system. It includes books, eBooks, patrons, active loans, and all the features of a working library.

---

## 🌐 Access URLs

### **Current URL (Before Update):**
```
http://127.0.0.1:8000/library/demo
```

### **New URL (After URL Structure Change):**
```
http://127.0.0.1:8000/demo-library
```
*(Note: You need to rename the tenant slug from "demo" to "demo-library" in database)*

**To rename the demo tenant:**
```bash
php artisan tinker
>>> $tenant = App\Models\Central\Tenant::where('slug', 'demo')->first();
>>> $tenant->slug = 'demo-library';
>>> $tenant->save();
```

---

## 📊 Demo Library Statistics

| Item | Count | Description |
|------|-------|-------------|
| **📚 Bibliographic Records** | 15 | Unique titles in the catalog |
| **📦 Physical Items** | 17 | Physical book copies available |
| **💾 Digital Resources** | 11 | eBooks, PDFs, and digital materials |
| **👥 Patrons** | 10 | Registered library members |
| **🔄 Loans** | 13 | Active loans + loan history |
| **📍 Locations** | 5 | Library branches and rooms |
| **📁 Collections** | 6 | Different collection types |

---

## 📚 Sample Catalog Content

### **Books Available (Selection):**

1. **Clean Code: A Handbook of Agile Software Craftsmanship** (2008)
   - Author: Robert C. Martin
   - ISBN: 9780132350884
   - Type: Book + eBook
   - Subject: Computer programming, Software engineering

2. **The Pragmatic Programmer: Your Journey to Mastery** (2019)
   - Authors: David Thomas, Andrew Hunt
   - ISBN: 9780135957059
   - Type: Book
   - Subject: Software engineering

3. **Design Patterns: Elements of Reusable Object-Oriented Software** (1994)
   - Authors: Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides
   - ISBN: 9780201633610
   - Type: Book
   - Subject: Object-oriented programming, Software patterns

4. **Introduction to Algorithms** (2022)
   - Authors: Thomas H. Cormen, Charles E. Leiserson
   - ISBN: 9780262046305
   - Type: Book
   - Subject: Computer algorithms, Data structures

5. **Laravel: Up & Running** (2023)
   - Author: Matt Stauffer
   - ISBN: 9781098153267
   - Type: Book + eBook
   - Subject: PHP, Web application development

6. **JavaScript: The Good Parts** (2008)
   - Author: Douglas Crockford
   - ISBN: 9780596517748
   - Type: Book

7. **The Art of War** (2007)
   - Author: Sun Tzu (Translator: Lionel Giles)
   - ISBN: 9781599869773
   - Type: Book
   - Subject: Military art and science, Strategy

8. **Thinking, Fast and Slow** (2013)
   - Author: Daniel Kahneman
   - ISBN: 9780374533557
   - Type: Book
   - Subject: Psychology, Behavioral economics

9. **Sapiens: A Brief History of Humankind** (2015)
   - Author: Yuval Noah Harari
   - ISBN: 9780062316097
   - Type: Book
   - Subject: Human evolution, History

10. **Atomic Habits** (2018)
    - Author: James Clear
    - ISBN: 9780735211292
    - Type: Book
    - Subject: Habit, Self-improvement

11. **The Great Gatsby** (2004)
    - Author: F. Scott Fitzgerald
    - ISBN: 9780743273565
    - Type: Book
    - Subject: Fiction, American literature

12. **Digital Transformation in Education** (2023)
    - Authors: Sophea Chann, Dara Prak (Editor)
    - ISBN: 9789997100015
    - Publisher: Corasoft Press
    - Type: Thesis/Dissertation
    - Subject: Education and technology (Cambodia-focused)

---

## 👥 Demo Patron Accounts

All demo patrons have the password: **`password`**

| Patron # | Email | Name | Category | Status |
|----------|-------|------|----------|--------|
| P-2024-001 | sophea.kim@university.edu.kh | Sophea Kim | Student | Active (has loans) |
| P-2024-002 | dara.prak@university.edu.kh | Dara Prak | Faculty | Active (has loans) |
| P-2024-003 | ratana.chan@university.edu.kh | Ratana Chan | Student | Active (has loans) |
| P-2024-004 | virak.sok@library.org | Virak Sok | Staff | Overdue items! |
| P-2024-005 | channary.lim@gmail.com | Channary Lim | Public | Overdue items! |
| P-2024-006 | bunna.heng@student.edu.kh | Bunna Heng | Student | Active (has loans) |
| P-2024-007 | sreymom.oun@university.edu | Sreymom Oun | Student | Active (has loans) |
| P-2024-008 | makara.tep@faculty.edu.kh | Makara Tep | Faculty | Active |
| P-2024-009 | pisey.mao@gmail.com | Pisey Mao | Public | Active |
| P-2024-010 | rith.noun@student.edu.kh | Rith Noun | Student | Active (has loans) |

---

## 🏢 Library Locations

1. **Main Library** (Branch)
   - Ground Floor
   - First Floor
   - Reference Room

2. **Toul Kork Branch** (Branch)

---

## 📁 Collections

| Collection | Loanable | Loan Period | Renewals | Fine Rate |
|------------|----------|-------------|----------|-----------|
| **General Collection** | ✅ Yes | 14 days | 2 times | $0.10/day |
| **Reference Collection** | ❌ No | In-library only | - | - |
| **Khmer Collection** | ✅ Yes | 14 days | 2 times | $0.10/day |
| **Periodicals** | ❌ No | In-library only | - | - |
| **Thesis & Dissertation** | ✅ Yes | 7 days | 1 time | $0.20/day |
| **Reserve Collection** | ✅ Yes | 3 days | 0 times | $0.50/day |

---

## 🎯 OPAC Features to Test

### **1. Public Catalog (OPAC Home)**
- URL: `http://127.0.0.1:8000/demo-library`
- Features:
  - Search bar (keyword, title, author, ISBN)
  - Recently added resources
  - Browse by category/subject
  - Quick stats display

### **2. Search & Browse**
- URL: `http://127.0.0.1:8000/demo-library/catalog`
- Features:
  - Full-text search
  - Faceted filters (material type, language, year)
  - Sort options (relevance, title, year)
  - Result grid/list view

### **3. Record Detail Page**
- URL: `http://127.0.0.1:8000/demo-library/catalog/{id}`
- Features:
  - Full bibliographic metadata
  - Cover image
  - Physical copies availability table
  - Digital resource access buttons
  - Reserve button (if all copies checked out)
  - Similar items suggestions
  - Citation export (APA, MLA, Chicago, BibTeX)

### **4. Digital Reader**
- URL: `http://127.0.0.1:8000/demo-library/reader/{resourceId}`
- Features:
  - PDF.js viewer for PDFs
  - epub.js viewer for eBooks
  - Audio/video player for media

### **5. Patron Login**
- URL: `http://127.0.0.1:8000/demo-library/login`
- Test accounts: Use any patron from the list above
- Password: `password`

### **6. Patron Account (My Account)**
- URL: `http://127.0.0.1:8000/demo-library/account`
- Features:
  - Current loans + due dates
  - Loan history
  - Active reservations
  - Downloaded/accessed digital resources
  - Fines (if overdue)
  - Reading wishlist

---

## 🔄 Sample Loan Scenarios

### **Active Loans (Not Returned Yet):**
- Patron 1 (Sophea Kim) has borrowed "Clean Code"
- Patron 2 (Dara Prak) has borrowed "Design Patterns"
- Patron 3 (Ratana Chan) has borrowed "Laravel: Up & Running"
- Patron 6 (Bunna Heng) has borrowed "Thinking, Fast and Slow"
- Patron 7 (Sreymom Oun) has borrowed "Sapiens"

### **Overdue Loans (With Fines):**
- Patron 4 (Virak Sok) has overdue "JavaScript: The Good Parts" ⚠️
- Patron 5 (Channary Lim) has overdue "Atomic Habits" ⚠️

### **Returned Loans (History):**
- 7 books have been borrowed and returned in the past
- Includes "Pragmatic Programmer", "Algorithms", "Art of War", "Great Gatsby"

### **Pending Reservations:**
- 3 reservations exist for books currently checked out

---

## 🧪 Testing Scenarios

### **Scenario 1: Browse & Search**
1. Visit demo library home
2. Use search bar: Search for "code"
3. Should find "Clean Code" and other programming books
4. Apply filter: Material Type = "Book"
5. Sort by: Year (newest first)

### **Scenario 2: View Book Details**
1. Click on "Clean Code"
2. View full metadata (title, author, ISBN, subjects, abstract)
3. Check availability table:
   - Should show physical copies and their locations
   - Should show status (available/checked out)
4. See digital resource section if book has eBook version

### **Scenario 3: Patron Login & Account**
1. Login as: `sophea.kim@university.edu.kh` / `password`
2. View "My Account"
3. Check "Current Loans" tab
4. Should see "Clean Code" borrowed with due date
5. Check loan history

### **Scenario 4: Reserve a Book**
1. Login as patron
2. Find a book that's currently checked out
3. Click "Reserve" button
4. Reservation should appear in "My Reservations"

### **Scenario 5: View Overdue & Fines**
1. Login as: `virak.sok@library.org` / `password`
2. View account
3. Should see overdue items highlighted in red
4. Should see fine amount calculated (days overdue × $0.10)

### **Scenario 6: Read Digital Resource**
1. Find "Clean Code" (has both book + eBook)
2. Click "Read Online" button
3. Should open PDF/eBook reader
4. Test navigation, zoom, page turning

---

## 📝 Sample Search Queries to Test

| Query | Expected Results |
|-------|------------------|
| `code` | Clean Code, JavaScript, Design Patterns |
| `laravel` | Laravel: Up & Running |
| `psychology` | Thinking, Fast and Slow |
| `9780132350884` | Clean Code (by ISBN) |
| `Robert Martin` | Clean Code (by author) |
| `2023` | Recent books published in 2023 |
| `programming` | Multiple programming books |
| `fiction` | The Great Gatsby |

---

## 🎨 OPAC Design Features

### **Visual Elements:**
- ✅ Cover images for books
- ✅ Material type icons (book, eBook, audio, video)
- ✅ Availability badges (Available, Checked Out, On Hold)
- ✅ Collection labels with color coding
- ✅ Status indicators for overdue items
- ✅ Khmer language support (titles, UI)

### **User Experience:**
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Breadcrumb navigation
- ✅ Faceted search filters
- ✅ Pagination for large result sets
- ✅ Sort options
- ✅ Quick search autocomplete (future enhancement)

---

## 🚀 Quick Start Guide for Demoing

### **1. Access the Demo Library:**
```
http://127.0.0.1:8000/demo-library
```
*(Or http://127.0.0.1:8000/library/demo if you haven't renamed it yet)*

### **2. Browse as Public User:**
- Search for books
- View book details
- See what's available

### **3. Login as Patron:**
```
Email: sophea.kim@university.edu.kh
Password: password
```

### **4. View Your Account:**
- Current loans
- Due dates
- Loan history

### **5. Try Searching:**
- Search: "programming"
- Filter by: Book
- View a book detail page

### **6. Test Digital Resources:**
- Find a book with "eBook" type
- Click "Read Online"
- Experience the reader interface

---

## 📦 What Makes This Demo Realistic?

1. **Real Book Data**: Actual ISBNs, publishers, publication years
2. **Diverse Content**: Programming, psychology, history, fiction
3. **Multiple Material Types**: Physical books, eBooks, theses
4. **Active Circulation**: Loans, overdues, reservations
5. **Multiple Patrons**: Students, faculty, staff, public users
6. **Multiple Locations**: Branches, floors, reference rooms
7. **Different Collections**: General, reference, special collections
8. **Bilingual Support**: English + Khmer titles/UI

---

## 🔗 Related Pages

- **Staff Admin Login**: http://127.0.0.1:8000/admin
  - Manage catalog, patrons, loans from staff side
- **Landing Page**: http://127.0.0.1:8000/
  - Marketing site for Alpha eLibrary
- **Demo Request**: http://127.0.0.1:8000/demo
  - Form to request personalized demo

---

## 💡 Tips for Showcasing

1. **Start with Search**: Show how easy it is to find books
2. **Show Book Details**: Highlight rich metadata (subjects, abstract, DDC classification)
3. **Demo Patron Account**: Login and show personalized loan history
4. **Show Digital Reader**: Open a PDF/eBook in the embedded reader
5. **Highlight Khmer Support**: Show bilingual interface
6. **Show Circulation**: Demonstrate checkout, return, fines
7. **Show Reservations**: Place a hold on a checked-out book
8. **Show Reports**: (Staff side) Show usage statistics

---

**The demo library is a complete, working library system ready to showcase all features of Alpha eLibrary!** 🎉
