/**
 * @spec M001-material-unit-system
 * Extend conversion_rate column precision to support larger values
 * 
 * Problem: numeric(10,6) only allows 4 integer digits, but 10000 needs 5.
 * Solution: Change to numeric(12,6) to allow 6 integer digits.
 */

-- Extend conversion_rate precision from numeric(10,6) to numeric(12,6)
ALTER TABLE materials
ALTER COLUMN conversion_rate TYPE NUMERIC(12, 6);
