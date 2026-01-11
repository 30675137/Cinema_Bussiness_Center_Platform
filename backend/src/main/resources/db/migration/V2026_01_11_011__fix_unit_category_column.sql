/**
 * @spec M001-material-unit-system
 * Fix unit_category column type: PostgreSQL enum -> VARCHAR
 * 
 * Problem: JPA @Enumerated(EnumType.STRING) sends VARCHAR but the column is PostgreSQL enum type.
 * Solution: Convert the column to VARCHAR(20) to be compatible with JPA string enum mapping.
 */

-- Change column type from enum to VARCHAR
ALTER TABLE units
ALTER COLUMN category TYPE VARCHAR(20) USING category::text;

-- Set NOT NULL constraint
ALTER TABLE units
ALTER COLUMN category SET NOT NULL;
