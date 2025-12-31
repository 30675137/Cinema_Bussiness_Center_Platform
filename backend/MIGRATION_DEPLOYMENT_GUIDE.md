# O004 Beverage SKU Reuse - Migration Deployment Guide

**@spec O004-beverage-sku-reuse**
**Target Environment**: Staging / Production
**Migration Version**: V064, V065
**Created**: 2025-12-31

---

## Prerequisites

### 1. Environment Access
- Access to **staging/production environment** where Spring Boot backend is deployed
- Access to **Supabase PostgreSQL database** (admin privileges)
- Network connectivity to Supabase (verify with `psql` or `pg_isready`)

### 2. Tools Required
- **Maven** 3.9+ (`mvn --version`)
- **Java** 17+ (`java --version`)
- **psql** (PostgreSQL client) for manual verification (optional)

### 3. Configuration Verification
Verify `application.yml` or environment variables:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://<supabase-host>:6543/postgres?prepareThreshold=0
    username: postgres.<project-id>
    password: <database-password>

  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
```

---

## Migration Files

### V064: Migrate Beverages to SKUs

**File**: `src/main/resources/db/migration/V064__migrate_beverages_to_skus.sql`

**Purpose**: Migrate existing beverage data to unified SKU system

**Key Operations**:
1. Copy beverage records to `skus` table with type `finished_product`
2. Create mapping records in `beverage_sku_mapping` table
3. Validate data integrity with check constraints
4. Use **idempotent INSERT...ON CONFLICT DO NOTHING** pattern

**Features**:
- ✅ **Idempotent**: Safe to run multiple times
- ✅ **Defense in Depth**: Application-level + database-level validation
- ✅ **Reversible**: See V065 for rollback

**Validation Queries** (run after migration):

```sql
-- 1. Check migration record count
SELECT COUNT(*) AS sku_count FROM skus WHERE sku_type = 'finished_product';

-- 2. Verify beverage_sku_mapping populated
SELECT COUNT(*) AS mapping_count FROM beverage_sku_mapping;

-- 3. Check for orphaned mappings (should return 0)
SELECT COUNT(*)
FROM beverage_sku_mapping bsm
LEFT JOIN beverages b ON b.id = bsm.beverage_id
LEFT JOIN skus s ON s.id = bsm.sku_id
WHERE b.id IS NULL OR s.id IS NULL;

-- 4. Verify SKU type constraint
SELECT sku_type, COUNT(*)
FROM skus
GROUP BY sku_type;
-- Expected: All migrated SKUs have sku_type = 'finished_product'

-- 5. Sample data verification
SELECT
    b.id AS beverage_id,
    b.name AS beverage_name,
    s.id AS sku_id,
    s.name AS sku_name,
    s.sku_type,
    s.price
FROM beverage_sku_mapping bsm
INNER JOIN beverages b ON b.id = bsm.beverage_id
INNER JOIN skus s ON s.id = bsm.sku_id
LIMIT 10;
```

---

### V065: Rollback Migration (Emergency Use Only)

**File**: `src/main/resources/db/migration/V065__rollback_beverage_migration.sql`

**Purpose**: Rollback V064 migration if critical issues detected

**⚠️ WARNING**: This is an **emergency rollback script**. Do NOT run unless:
- Critical data integrity issues found
- Business operations severely impacted
- Approved by technical lead

**Operations**:
1. Delete migrated SKU records (only `finished_product` type from beverages)
2. Delete mapping records from `beverage_sku_mapping`
3. Preserve existing `packaging` and `raw_material` SKUs
4. Preserve BOM relationships

**Features**:
- ✅ **Safe Deletion**: Uses defensive WHERE clauses
- ✅ **Selective**: Only removes beverage-migrated SKUs
- ✅ **Preserves BOM**: Does not cascade delete BOM components

---

## Deployment Steps

### Step 1: Pre-Migration Verification

```bash
# Navigate to backend directory
cd /path/to/Cinema_Bussiness_Center_Platform/backend

# Check Flyway status
mvn flyway:info

# Expected output:
# +-----------+---------+-------------------------------------+--------+
# | Category  | Version | Description                         | State  |
# +-----------+---------+-------------------------------------+--------+
# | Versioned | 064     | migrate beverages to skus           | Pending|
# | Versioned | 065     | rollback beverage migration         | Pending|
# +-----------+---------+-------------------------------------+--------+
```

### Step 2: Backup Database (CRITICAL)

```bash
# Using Supabase CLI (if available)
supabase db dump > backup_before_v064_$(date +%Y%m%d_%H%M%S).sql

# OR using pg_dump directly
pg_dump -h <supabase-host> -p 6543 -U postgres.<project-id> -d postgres \
  --table=beverages \
  --table=skus \
  --table=beverage_sku_mapping \
  > backup_before_v064_$(date +%Y%m%d_%H%M%S).sql
```

### Step 3: Run Migration

```bash
# Run Flyway migration
mvn flyway:migrate

# Expected output:
# Successfully applied 1 migration to schema "public"
# Migrated from version 063 to 064 (migrate beverages to skus)
```

### Step 4: Post-Migration Validation

```bash
# Connect to database
psql -h <supabase-host> -p 6543 -U postgres.<project-id> -d postgres

# Run validation queries (see "Validation Queries" section above)
```

**Success Criteria**:
- ✅ All beverages have corresponding SKU records
- ✅ `beverage_sku_mapping` count matches beverage count
- ✅ No orphaned mapping records
- ✅ All migrated SKUs have `sku_type = 'finished_product'`

### Step 5: Update Flyway History

```bash
# Verify migration recorded in Flyway history
mvn flyway:info

# Expected output:
# +-----------+---------+-------------------------------------+--------+
# | Category  | Version | Description                         | State  |
# +-----------+---------+-------------------------------------+--------+
# | Versioned | 064     | migrate beverages to skus           | Success|
# | Versioned | 065     | rollback beverage migration         | Pending|
# +-----------+---------+-------------------------------------+--------+
```

---

## Rollback Procedure (Emergency Only)

**⚠️ ONLY USE IF CRITICAL ISSUES DETECTED**

### When to Rollback:
- Critical data integrity issues (orphaned records, data corruption)
- Business operations severely impacted
- Unanticipated application errors related to SKU migration

### Rollback Steps:

1. **Create Emergency Backup**:
   ```bash
   pg_dump -h <supabase-host> -p 6543 -U postgres.<project-id> -d postgres \
     > emergency_backup_before_rollback_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Apply V065 Rollback Migration**:
   ```bash
   mvn flyway:migrate
   ```

3. **Verify Rollback**:
   ```sql
   -- Should return 0 (all beverage-migrated SKUs deleted)
   SELECT COUNT(*) FROM skus WHERE sku_type = 'finished_product';

   -- Should return 0 (all mappings deleted)
   SELECT COUNT(*) FROM beverage_sku_mapping;
   ```

4. **Notify Development Team**: Immediately report rollback reason and observed issues

---

## Troubleshooting

### Issue 1: Connection Timeout

**Error**: `Unable to obtain connection from database`

**Solutions**:
- Check network connectivity: `ping aws-1-us-east-2.pooler.supabase.com`
- Verify Supabase database status (check Supabase dashboard)
- Check firewall/VPN blocking port 6543
- Verify credentials in `application.yml`

### Issue 2: Duplicate Key Violation

**Error**: `duplicate key value violates unique constraint`

**Root Cause**: Migration already partially applied

**Solution**: V064 uses `INSERT...ON CONFLICT DO NOTHING`, safe to re-run

### Issue 3: Foreign Key Violation

**Error**: `violates foreign key constraint`

**Root Cause**: Referenced data (beverages, categories) missing

**Solution**:
1. Verify `beverages` table populated
2. Check `beverage_categories` table exists
3. Ensure previous migrations (V001-V063) applied successfully

### Issue 4: Flyway Checksum Mismatch

**Error**: `Migration checksum mismatch`

**Root Cause**: Migration file modified after first run

**Solution**:
```bash
# Repair Flyway metadata (use with caution)
mvn flyway:repair

# Re-run migration
mvn flyway:migrate
```

---

## Performance Considerations

### Expected Execution Time

| Record Count | Estimated Time |
|--------------|----------------|
| < 100 beverages | 1-2 seconds |
| 100-1000 beverages | 2-5 seconds |
| 1000-10000 beverages | 5-15 seconds |
| > 10000 beverages | 15-60 seconds |

### Database Load

- **Read Load**: Minimal (SELECT from `beverages` table)
- **Write Load**: Moderate (INSERT into `skus`, `beverage_sku_mapping`)
- **Lock Duration**: Short (row-level locks only)
- **Downtime**: **ZERO** (migration is online-safe)

---

## Post-Deployment Checklist

After successful migration:

- [ ] Run all validation queries (Step 4)
- [ ] Verify frontend UI displays SKU data correctly (`/products/sku`)
- [ ] Test BOM configuration with migrated SKUs
- [ ] Check application logs for errors (`grep "BOM\|SKU" logs/application.log`)
- [ ] Monitor database performance (no significant degradation)
- [ ] Update deployment documentation
- [ ] Archive migration backup files

---

## Contact & Support

**Feature Owner**: @spec O004-beverage-sku-reuse
**Technical Lead**: Development Team
**Documentation**: `specs/O004-beverage-sku-reuse/quickstart.md`

**For Issues**:
1. Check this guide's Troubleshooting section
2. Review migration SQL files (`V064*.sql`, `V065*.sql`)
3. Contact development team with:
   - Error messages (full stack trace)
   - Validation query results
   - Flyway info output (`mvn flyway:info`)

---

**Version**: 1.0
**Last Updated**: 2025-12-31
**Status**: Ready for Deployment
