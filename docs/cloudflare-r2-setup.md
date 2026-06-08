# Cloudflare R2 Storage Setup Guide

## Overview

Cloudflare R2 is the **recommended default storage provider** for Alpha eLibrary digital resources. It offers:

- ✅ **Zero egress fees** - Download files for free
- ✅ **S3-compatible API** - Works with existing tools
- ✅ **Automatic region selection** - Fast global access
- ✅ **Simple pricing** - $0.015/GB/month for storage

---

## Prerequisites

- Cloudflare account (free tier available)
- Access to Cloudflare Dashboard
- 5 minutes setup time

---

## Step 1: Create R2 Bucket

1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Navigate to **R2** in the sidebar

2. **Create Bucket**
   - Click **"Create bucket"**
   - Enter bucket name: `alpha-elibrary-files` (or your preferred name)
   - Click **"Create bucket"**

3. **Note Your Account ID**
   - Look at the URL: `https://dash.cloudflare.com/<ACCOUNT_ID>/r2`
   - Copy the `<ACCOUNT_ID>` value
   - You'll need this later

---

## Step 2: Generate API Token

1. **Navigate to API Tokens**
   - In R2 dashboard, click **"Manage R2 API Tokens"**
   - Click **"Create API token"**

2. **Configure Token**
   - **Token Name:** `Alpha eLibrary Production`
   - **Permissions:** Select **"Admin Read & Write"**
   - **TTL:** Leave as "Forever" or set expiration
   - Click **"Create API Token"**

3. **Save Credentials**
   - **Access Key ID:** Copy and save securely
   - **Secret Access Key:** Copy and save securely
   - ⚠️ **Important:** Secret key is shown only once!

---

## Step 3: Configure Alpha eLibrary

### Option A: System-Wide Default (All Tenants)

Edit `.env` file:

```env
# Cloudflare R2 Configuration
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
R2_ACCOUNT_ID=your_account_id_here
R2_BUCKET=alpha-elibrary-files
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
R2_PUBLIC_URL=

# Set default filesystem disk
FILESYSTEM_DISK=default_r2
```

### Option B: Per-Tenant Configuration

1. Login to library admin panel
2. Navigate to **Settings → Storage**
3. Select **"Cloudflare R2 (Custom)"**
4. Fill in credentials:
   - Access Key ID
   - Secret Access Key
   - Account ID
   - Bucket Name
   - Endpoint URL
5. Click **"Test Connection"**
6. If successful, click **"Save Configuration"**

---

## Step 4: Verify Setup

### Test File Upload

1. **Go to Admin → Digital Resources**
2. **Click "Create Digital Resource"**
3. **Select a bibliographic record**
4. **Upload a test PDF file**
5. **Submit**

### Check R2 Bucket

1. **Go to Cloudflare R2 Dashboard**
2. **Open your bucket**
3. **Navigate to:** `resources/<uuid>/`
4. **You should see:**
   - Original file: `filename.pdf`
   - Thumbnail: `filename_thumb.jpg` (if PDF)

### Verify Download

1. **Go to OPAC → Catalog**
2. **Find the uploaded resource**
3. **Click "Download" or "View"**
4. **File should download from R2**

---

## R2 Endpoint Configuration

Your R2 endpoint follows this pattern:

```
https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

Replace `<ACCOUNT_ID>` with your actual Cloudflare Account ID.

Example:
```
https://abc123def456.r2.cloudflarestorage.com
```

---

## Custom Domain (Optional)

To serve files from your own domain (e.g., `files.yourlibrary.com`):

1. **Configure R2 Custom Domain**
   - In R2 bucket settings, click **"Connect Domain"**
   - Enter your domain: `files.yourlibrary.com`
   - Add CNAME record to your DNS

2. **Update Alpha eLibrary**
   - Set `R2_PUBLIC_URL=https://files.yourlibrary.com` in `.env`
   - Files will be served from your domain

---

## Pricing Calculator

### Example Library: 500 ebooks, 100 students

**Storage:**
- 500 PDFs × 5MB average = 2.5GB
- Cost: 2.5GB × $0.015 = **$0.0375/month**

**Operations:**
- 1,000 downloads/month
- Cost: 1,000 × $0.36/million = **$0.0004/month**

**Egress:**
- 5GB downloaded/month
- Cost: **$0 (FREE!)**

**Total:** ~$0.04/month 🎉

### Large Library: 50,000 ebooks, 10,000 students

**Storage:**
- 50,000 PDFs × 5MB = 250GB
- Cost: 250GB × $0.015 = **$3.75/month**

**Operations:**
- 100,000 downloads/month
- Cost: 100,000 × $0.36/million = **$0.036/month**

**Egress:**
- 500GB downloaded/month
- Cost: **$0 (FREE!)**

**Total:** ~$3.80/month 💰

---

## Troubleshooting

### Connection Test Failed

**Error:** "Access Denied"
- ✅ Check Access Key ID and Secret are correct
- ✅ Ensure API token has "Admin Read & Write" permissions
- ✅ Verify bucket name matches exactly

**Error:** "Bucket not found"
- ✅ Check bucket name spelling
- ✅ Ensure bucket exists in R2 dashboard
- ✅ Verify Account ID is correct

**Error:** "Invalid endpoint"
- ✅ Endpoint format: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
- ✅ No trailing slash
- ✅ Must be HTTPS

### Upload Failed

**Error:** "Storage disk not configured"
- ✅ Run `php artisan config:clear`
- ✅ Check `.env` has R2 credentials
- ✅ Restart queue worker: `php artisan queue:restart`

**Error:** "File size too large"
- ✅ Check PHP `upload_max_filesize` setting
- ✅ Check PHP `post_max_size` setting
- ✅ Default R2 max: 5GB per file

---

## Security Best Practices

### API Token Security

1. ✅ **Never commit tokens to Git**
2. ✅ **Use environment variables**
3. ✅ **Rotate tokens periodically**
4. ✅ **Use separate tokens for dev/prod**

### Bucket Access

1. ✅ **Keep buckets private** (default)
2. ✅ **Use signed URLs** for restricted files
3. ✅ **Enable access logs** (optional)
4. ✅ **Monitor usage** in R2 dashboard

---

## Migration from Other Storage

If moving from another provider to R2:

1. **Configure R2 as described above**
2. **Test connection**
3. **Go to Settings → Storage**
4. **Click "Migrate Files"**
5. **Select:**
   - From: Current provider
   - To: Cloudflare R2
6. **Start migration**
7. **Monitor progress** in real-time

Migration runs in background. Files remain accessible during migration.

---

## Support

### Cloudflare R2 Support

- Documentation: https://developers.cloudflare.com/r2/
- Community: https://community.cloudflare.com/c/developers/storage/51
- Status: https://www.cloudflarestatus.com/

### Alpha eLibrary Support

- Documentation: `docs/storage-migration.md`
- GitHub Issues: https://github.com/corasoft/alpha-elibrary/issues
- Email: support@corasoft.com

---

**Last Updated:** June 6, 2026  
**Version:** 1.0
