# Supabase Storage Setup for Scenario Package Management

## Overview
This document describes the required Supabase Storage configuration for the scenario package management feature.

## Bucket Configuration

### Bucket Name
`scenario-packages`

### Access Settings
- **Public Access**: Enabled (public-read)
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`
- **File Size Limit**: 5 MB (5,242,880 bytes)

## Setup Steps

### Option 1: Supabase Dashboard (Recommended)

1. Navigate to your Supabase project dashboard at https://supabase.com/dashboard
2. Go to **Storage** section
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `scenario-packages`
   - **Public bucket**: ☑️ Enable
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
5. Click **Create bucket**

### Option 2: Supabase CLI (Alternative)

```bash
# Create bucket
supabase storage create scenario-packages --public

# Set bucket policies (execute in SQL Editor)
```

```sql
-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'scenario-packages');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated upload access"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'scenario-packages'
  AND auth.role() = 'authenticated'
);

-- File size limit (5MB) - enforced at application level
-- MIME type validation - enforced at application level
```

## Verification

After setup, verify the bucket is accessible:

```bash
# Test public read access
curl https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/bucket/scenario-packages

# Expected response: bucket metadata (200 OK)
```

## Security Notes

1. **Public Read Only**: The bucket is configured for public read access, but write operations require authentication
2. **File Validation**: Backend validates file type and size before generating presigned URLs
3. **Presigned URLs**: Upload URLs expire after 10 minutes for security
4. **Path Structure**: Images are stored with UUID prefixes to prevent naming conflicts:
   ```
   scenario-packages/
   └── backgrounds/
       ├── {uuid}-{original-filename}.jpg
       └── {uuid}-{original-filename}.png
   ```

## Related Configuration

### Backend (application.yml)
```yaml
supabase:
  url: ${SUPABASE_URL:https://fxhgyxceqrmnpezluaht.supabase.co}
  service-role-key: ${SUPABASE_SERVICE_ROLE_KEY}
  storage:
    bucket: scenario-packages
    base-url: ${SUPABASE_URL}/storage/v1
```

### Frontend (.env.local)
```bash
VITE_SUPABASE_URL=https://fxhgyxceqrmnpezluaht.supabase.co
VITE_STORAGE_BUCKET=scenario-packages
```

## Troubleshooting

### Upload fails with 403 Forbidden
- Verify bucket policies are correctly set
- Check that service role key has storage permissions
- Ensure presigned URL hasn't expired

### Images not displaying
- Verify bucket is set to public
- Check CORS configuration in Supabase
- Verify image URL format: `{SUPABASE_URL}/storage/v1/object/public/scenario-packages/{path}`

## Next Steps

After bucket setup is complete:
1. Mark task T002 as complete in tasks.md
2. Test image upload functionality using the ImageUploadService
3. Verify images are accessible via public URLs
