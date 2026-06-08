# Storage Provider Migration Guide

## Overview

This guide explains how to migrate your digital library files from one storage provider to another (e.g., from local storage to Cloudflare R2, or from Amazon S3 to DigitalOcean Spaces).

**Migration Features:**
- ✅ Zero downtime - files remain accessible during migration
- ✅ Automatic checksum verification
- ✅ Progress tracking in real-time
- ✅ Resumable on failure
- ✅ Background processing via queue

---

## When to Migrate

### Common Migration Scenarios

1. **Starting a New Library**
   - From: Local storage (testing)
   - To: Cloudflare R2 (production)

2. **Cost Optimization**
   - From: Amazon S3 (high egress fees)
   - To: Cloudflare R2 (free egress)

3. **Changing Providers**
   - From: Any provider
   - To: Better pricing/features

4. **Multi-Region Setup**
   - From: Single region
   - To: Global CDN provider

---

## Prerequisites

### Before Starting Migration

1. ✅ **New provider configured and tested**
   - Go to Settings → Storage
   - Configure new provider
   - Test connection successfully

2. ✅ **Sufficient storage space**
   - New provider has enough space for all files
   - Check current usage in dashboard

3. ✅ **Queue worker running**
   - Migration runs in background queue
   - Run: `php artisan queue:work --queue=storage-migration`

4. ✅ **Backup (recommended)**
   - Download critical files
   - Or snapshot current storage

---

## Migration Process

### Step 1: Prepare

1. **Check Current Usage**
   - Go to **Settings → Storage**
   - Note total files and storage size
   - Example: "2,450 files, 12.3 GB"

2. **Configure New Provider**
   - Select new provider from dropdown
   - Enter credentials
   - Click **"Test Connection"**
   - Wait for ✅ success message

3. **Do NOT Save Yet**
   - Keep current provider active
   - New provider is just for testing

### Step 2: Start Migration

1. **Click "Migrate Files" Button**
   - Located in Storage Settings page
   - Opens migration confirmation dialog

2. **Review Migration Details**
   - From: Current provider
   - To: New provider
   - Total files to migrate
   - Estimated time

3. **Confirm Migration**
   - Click **"Start Migration"**
   - Migration ID will be generated
   - Example: `mig_abc123def456`

### Step 3: Monitor Progress

The page automatically shows real-time progress:

```
Migration in Progress
━━━━━━━━━━━━━━━━━━━━ 45%

Processed: 1,102 / 2,450 files
Succeeded: 1,100 files
Failed: 2 files
Estimated time remaining: 18 minutes
```

**Progress Updates:**
- Updates every 5 seconds
- Shows current status
- Lists any errors
- Estimates completion time

### Step 4: Handle Errors (If Any)

If some files fail:

1. **View Error Details**
   - Click "View Errors" button
   - See which files failed and why

2. **Common Errors:**
   - File not found (already deleted)
   - Checksum mismatch (retry)
   - Permission denied (check credentials)

3. **Retry Failed Files**
   - Fix the issue
   - Click "Retry Failed Files"
   - Only failed files will be retried

### Step 5: Verify Migration

1. **Check Completion Status**
   - Status changes to: **"Completed"**
   - All files migrated successfully

2. **Verify Files**
   - Go to new provider's dashboard
   - Check files exist in bucket
   - Verify file count matches

3. **Test Download**
   - Go to OPAC → Digital Resources
   - Download a test file
   - Confirm it downloads successfully

### Step 6: Switch Provider

1. **Go to Settings → Storage**
2. **Select New Provider** from dropdown
3. **Click "Save Configuration"**
4. **All new uploads** now use new provider
5. **Old files** still work (served from new provider)

---

## Technical Details

### How Migration Works

```
Migration Process Flow:

1. StorageMigrationJob dispatched
   └─> Processes files in chunks (50 files/chunk)

2. For each file:
   a. Download from source provider
   b. Calculate MD5 checksum
   c. Upload to destination provider
   d. Verify checksum matches
   e. Copy thumbnail (if exists)

3. Update progress:
   - Increment processed count
   - Log errors if any
   - Update estimated time

4. Dispatch next chunk:
   - Small delay (5 seconds) between chunks
   - Prevents overwhelming storage APIs

5. Completion:
   - Mark migration as completed
   - Send notification (optional)
```

### Chunk Processing

Files are migrated in **chunks of 50** to:
- ✅ Prevent memory exhaustion
- ✅ Allow resumability
- ✅ Provide granular progress
- ✅ Reduce API rate limit issues

Configuration in `.env`:
```env
STORAGE_MIGRATION_CHUNK_SIZE=50
STORAGE_MIGRATION_DELAY=5
STORAGE_MIGRATION_VERIFY=true
```

### Checksum Verification

Every file is verified:

```php
$sourceChecksum = md5($sourceFileContent);
$destinationChecksum = md5($destinationFileContent);

if ($sourceChecksum !== $destinationChecksum) {
    throw new Exception("Checksum mismatch");
}
```

This ensures **100% data integrity**.

---

## Migration Strategies

### Strategy 1: Direct Migration (Recommended)

**When:** Small library (<10,000 files, <100GB)

**Steps:**
1. Configure new provider
2. Test connection
3. Start migration
4. Wait for completion (~30 min)
5. Switch provider

**Pros:**
- Simple, one-step process
- Fastest completion

**Cons:**
- Single queue processes all files

### Strategy 2: Gradual Migration

**When:** Large library (>10,000 files, >100GB)

**Steps:**
1. Configure new provider
2. Set new uploads to use new provider
3. Keep old files on old provider
4. Migrate old files in off-peak hours
5. Complete migration over days/weeks

**Pros:**
- No rush
- Can spread cost over time
- Less impact on performance

**Cons:**
- Files split between providers temporarily
- More complex

### Strategy 3: Parallel Migration

**When:** Very large library (>100,000 files)

**Steps:**
1. Run multiple queue workers
2. Each processes different offset
3. Faster total migration time

**Command:**
```bash
# Terminal 1
php artisan queue:work --queue=storage-migration --timeout=3600

# Terminal 2
php artisan queue:work --queue=storage-migration --timeout=3600

# Terminal 3
php artisan queue:work --queue=storage-migration --timeout=3600
```

**Pros:**
- 3x faster with 3 workers
- Scales to any size

**Cons:**
- Requires server resources
- More complex monitoring

---

## Troubleshooting

### Migration Stuck

**Symptom:** Progress not updating for >10 minutes

**Solutions:**
1. Check queue worker is running:
   ```bash
   ps aux | grep queue:work
   ```

2. Restart queue worker:
   ```bash
   php artisan queue:restart
   php artisan queue:work --queue=storage-migration
   ```

3. Check failed jobs:
   ```bash
   php artisan queue:failed
   ```

4. Retry failed jobs:
   ```bash
   php artisan queue:retry all
   ```

### High Failure Rate

**Symptom:** >10% of files failing

**Solutions:**
1. **Check credentials:**
   - Test connection again
   - Verify API keys haven't expired

2. **Check source files:**
   - Files may have been deleted
   - Source storage may be offline

3. **Check network:**
   - Slow/unstable connection
   - Firewall blocking requests

4. **Increase timeout:**
   ```env
   STORAGE_MIGRATION_TIMEOUT=7200  # 2 hours
   ```

### Out of Memory

**Symptom:** PHP memory limit exceeded

**Solutions:**
1. **Reduce chunk size:**
   ```env
   STORAGE_MIGRATION_CHUNK_SIZE=25  # Half the default
   ```

2. **Increase PHP memory:**
   ```ini
   # php.ini
   memory_limit = 512M
   ```

3. **Process smaller files first:**
   - Filter by file size
   - Migrate in batches

---

## Post-Migration

### Verify Integrity

1. **Compare file counts:**
   ```sql
   SELECT COUNT(*) FROM digital_resources WHERE file_path IS NOT NULL;
   ```

2. **Spot check files:**
   - Download random files
   - Verify they open correctly
   - Check thumbnails display

3. **Monitor errors:**
   - Check Laravel logs
   - Watch for 404 errors
   - Monitor storage API errors

### Clean Up Old Storage (Optional)

**After confirming migration success:**

1. **Download backup** (recommended)
2. **Delete files** from old provider
3. **Cancel old provider** subscription
4. **Remove old credentials** from Alpha eLibrary

⚠️ **Wait at least 7 days** before deleting old files!

---

## Migration Cost Estimate

### Cloudflare R2 → Amazon S3

**Scenario:** 10,000 files, 50GB

**Costs:**
- R2 egress: **$0** (free)
- S3 ingress: **$0** (free)
- S3 storage (first month): $50GB × $0.023 = **$1.15**

**Total migration cost: ~$1.15**

### Amazon S3 → Cloudflare R2

**Scenario:** 10,000 files, 50GB

**Costs:**
- S3 egress: 50GB × $0.09 = **$4.50**
- R2 ingress: **$0** (free)
- R2 storage (first month): $50GB × $0.015 = **$0.75**

**Total migration cost: ~$5.25**

**Monthly savings:** $1.15 - $0.75 = **$0.40/month**  
**Break-even:** 13 months

---

## FAQ

### Q: Can I cancel a running migration?

A: Not currently. Let it complete, then delete unwanted files manually.

### Q: Do files stay accessible during migration?

A: Yes! Old files work during migration. Switch provider only after completion.

### Q: What if migration fails halfway?

A: Resume from last checkpoint. Failed chunks are retried automatically.

### Q: Can I migrate back to the old provider?

A: Yes! Just reverse the process (swap from/to providers).

### Q: How long does migration take?

A: Depends on file count and size:
- 1,000 files (~5GB): 10-15 minutes
- 10,000 files (~50GB): 1-2 hours
- 100,000 files (~500GB): 8-12 hours

### Q: Will thumbnail images migrate?

A: Yes! Thumbnails are automatically migrated with their parent files.

### Q: Can I migrate only specific files?

A: Not via UI. Contact support for custom migration scripts.

---

## Support

### Need Help?

1. **Check logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **View failed jobs:**
   ```bash
   php artisan queue:failed
   ```

3. **Contact support:**
   - Email: support@corasoft.com
   - Include: Migration ID, error messages, log excerpts

---

**Last Updated:** June 6, 2026  
**Version:** 1.0
