# 📥 Template Download Guide - Alpha eLibrary

## 🎯 How to Download the Import Template

The import template is **already built and ready**! Here are **3 ways** to download it:

---

## ✅ **Method 1: From Import Modal** (Recommended)

1. **Login** to admin panel: http://127.0.0.1:8000/admin
   - Email: `cataloger@bannalai.com`
   - Password: `password`

2. **Navigate** to: Catalog page

3. **Click** the "Import" button (blue upload icon)

4. **Modal opens** with a blue info box at the top

5. **Click** the "Template" button in the info box

6. **File downloads**: `catalog_import_template.xlsx`

---

## ✅ **Method 2: Direct URL**

Simply visit this URL in your browser:

```
http://127.0.0.1:8000/admin/catalog/excel/template
```

The file will download immediately!

---

## ✅ **Method 3: Via Export Button**

Coming soon - we can add a "Download Template" option to the Export dropdown menu.

---

## 📋 What's in the Template?

The downloaded file contains **2 sheets**:

### **Sheet 1: Catalog Template**

```
┌─────────────────────────────────────────────────────────────┐
│ Row 1: Headers (Blue background, frozen)                    │
│ - title, subtitle, authors, isbn, publisher, year, etc.    │
├─────────────────────────────────────────────────────────────┤
│ Row 2: Example Record (Green background)                    │
│ - Clean Code: A Handbook of Agile Software Craftsmanship   │
│ - Robert C. Martin (aut)                                    │
│ - ISBN: 9780132350884                                       │
│ - All fields filled with realistic data                     │
├─────────────────────────────────────────────────────────────┤
│ Row 3: Hint Row (Gray italic text)                          │
│ - # Required                                                 │
│ - # Format: Name (role) | Name2 (role)                      │
│ - # Use code from material_types sheet                      │
└─────────────────────────────────────────────────────────────┘
```

**Special Features:**
- ✅ **Column Q (material_type)**: Dropdown list with valid codes
- ✅ **Column AA (record_status)**: Dropdown with "active" or "draft"
- ✅ **Optimized column widths** for easy editing
- ✅ **Freeze panes** - Row 1 stays visible when scrolling

---

### **Sheet 2: Material Types Reference**

```
┌────────────────┬─────────────────────┬──────────────┬─────────────┐
│ code           │ name                │ has_physical │ has_digital │
├────────────────┼─────────────────────┼──────────────┼─────────────┤
│ book           │ Book                │ yes          │ no          │
│ ebook          │ eBook               │ no           │ yes         │
│ book_ebook     │ Book + eBook        │ yes          │ yes         │
│ journal        │ Journal/Serial      │ yes          │ yes         │
│ article        │ Article             │ no           │ yes         │
│ thesis         │ Thesis/Dissertation │ yes          │ yes         │
│ audio          │ Audio               │ no           │ yes         │
│ video          │ Video               │ no           │ yes         │
│ dataset        │ Dataset             │ no           │ yes         │
│ dvd            │ DVD/CD              │ yes          │ no          │
│ map            │ Map                 │ yes          │ yes         │
└────────────────┴─────────────────────┴──────────────┴─────────────┘
```

**Use this sheet to:**
- See all valid material type codes
- Understand which types support physical/digital formats
- Copy codes for the material_type column in Sheet 1

---

## 📝 How to Use the Template

### **Step 1: Download Template**
Use one of the methods above to get `catalog_import_template.xlsx`

### **Step 2: Open in Excel/LibreOffice**
- ✅ Microsoft Excel (recommended)
- ✅ LibreOffice Calc
- ❌ Google Sheets (dropdown validation may not work)

### **Step 3: Add Your Data**
1. **Keep Row 1** (headers) - don't modify!
2. **Study Row 2** (example) - see the format
3. **Delete Row 3** (hints) - optional, but cleaner
4. **Start adding data from Row 4** (or Row 3 if you deleted hints)

### **Step 4: Fill Required Fields**
Only **1 field** is required:
- ✅ `title` - Book/resource title (max 500 chars)

All other fields are optional!

### **Step 5: Use Dropdowns**
- **Column Q (material_type)**: Click cell → dropdown appears
- **Column AA (record_status)**: Choose "active" or "draft"

### **Step 6: Format Complex Fields**

**Authors** (Column E):
```
Robert C. Martin (aut) | Kent Beck (edt) | Martin Fowler (trl)
```
- Separate multiple authors with ` | `
- Role codes: `aut` (author), `edt` (editor), `trl` (translator), `ill` (illustrator)

**Subjects** (Column R):
```
Computer programming [LCSH] | Software engineering [MeSH] | Clean code [local]
```
- Separate with ` | `
- Scheme in brackets: `[LCSH]`, `[MeSH]`, `[local]`

**Keywords** (Column S):
```
clean code | refactoring | TDD | unit testing
```
- Just words separated by ` | `

### **Step 7: Save & Import**
1. Save as `.xlsx` file
2. Go to Admin → Catalog
3. Click "Import" button
4. Drag & drop or browse to your file
5. Watch the progress!

---

## 🎨 Template Customization

You can add these optional fields to make your catalog richer:

| Field | Example | Notes |
|-------|---------|-------|
| **subtitle** | "A Framework for Modern PHP" | Secondary title |
| **title_km** | "សៀវភៅកូដស្អាត" | Khmer translation |
| **isbn** | "9780132350884" | ISBN-10 or ISBN-13 |
| **issn** | "1234-5678" | For journals/serials |
| **doi** | "10.1234/example.doi" | Digital Object Identifier |
| **publisher** | "Prentice Hall" | Publisher name |
| **publisher_place** | "Upper Saddle River, NJ" | City, State/Country |
| **publication_year** | 2008 | Integer (1000-2030) |
| **edition** | "2nd" | Edition number/text |
| **language** | "en" | ISO 639-1 code (en, km, fr, zh) |
| **pages** | "431" | Page count |
| **volume** | "5" | Volume number (for serials) |
| **issue** | "3" | Issue number (for serials) |
| **ddc_class** | "005.133" | Dewey Decimal Classification |
| **lcc_class** | "QA76.73" | Library of Congress |
| **series_title** | "Programming Series" | Series name |
| **series_number** | "12" | Number in series |
| **abstract** | "A guide to writing clean code..." | Summary/description |
| **notes** | "2nd printing includes errata" | Internal notes |
| **cover_image_url** | "https://example.com/cover.jpg" | Cover image URL |

---

## 🔄 Update Existing Records

To **update** instead of create new records:

1. **Export existing catalog** (Export → Export All Records)
2. **Open exported file**
3. **Modify the data** you want to change
4. **Keep the ISBN** (Column F) - this is the match key!
5. **Import the file**
6. ✅ Records with matching ISBN will be **updated**
7. ✅ Records without matching ISBN will be **created**

**Alternative:** Use the `record_id` column (Column AB) to match by UUID

---

## 📊 Template Field Reference

All **28 columns** in order:

```
1.  title               ← REQUIRED
2.  subtitle
3.  title_alternative
4.  title_km
5.  authors             ← Format: Name (role) | Name2 (role)
6.  isbn                ← Match key for updates
7.  issn
8.  doi
9.  publisher
10. publisher_place
11. publication_year    ← Integer only
12. edition
13. language            ← ISO code (en, km, etc.)
14. pages
15. volume
16. issue
17. material_type       ← Use dropdown!
18. subjects            ← Format: Term [Scheme] | Term2 [LCSH]
19. keywords            ← Format: word1 | word2 | word3
20. ddc_class
21. lcc_class
22. series_title
23. series_number
24. abstract
25. notes
26. cover_image_url
27. record_status       ← Use dropdown: active or draft
28. record_id           ← UUID (for updates only)
```

---

## 💡 Pro Tips

### ✅ **Best Practices:**
- Delete the hint row (Row 3) before importing to avoid confusion
- Fill at least: title, authors, publication_year, material_type
- Use the dropdown for material_type - don't type manually!
- ISBNs make updates easier - use them when available
- Test with 5-10 records first before importing hundreds

### ⚠️ **Common Mistakes:**
- ❌ Typing invalid material_type codes (use the dropdown!)
- ❌ Future years (max is current year + 5)
- ❌ Forgetting to separate authors/subjects with ` | `
- ❌ Using wrong role codes (use: aut, edt, trl, ill)
- ❌ Leaving title empty (it's required!)

### 🎯 **Quick Validation:**
Before importing, check:
- [ ] All rows have a title
- [ ] Years are realistic (1000-2030)
- [ ] Material types use dropdown values
- [ ] Authors follow: `Name (role)` format
- [ ] No special characters in ISBNs (just digits and hyphens)

---

## 🆘 Need Help?

**Template not downloading?**
1. Make sure you're logged in as staff
2. Try the direct URL method
3. Check browser console for errors

**Dropdown not working?**
1. Open in Microsoft Excel or LibreOffice
2. Don't use Google Sheets for this

**Import failing?**
1. Check the error report download
2. Verify all required fields are filled
3. Test with just the example row first

---

## 🎉 Template Features Summary

✅ **Pre-filled example** with realistic data  
✅ **Hint row** with field descriptions  
✅ **Dropdown validation** for material_type and status  
✅ **Reference sheet** with all material type codes  
✅ **Styled headers** with freeze panes  
✅ **Optimized columns** for easy editing  
✅ **28 fields** covering all catalog metadata  
✅ **Upsert support** via ISBN matching  

---

**Template URL**: http://127.0.0.1:8000/admin/catalog/excel/template  
**Live Demo**: Click "Import" → "Template" button  
**Format**: Excel (.xlsx) - 2 sheets  
**Size**: ~15KB  

---

*The template is ready to use right now!* 🚀
