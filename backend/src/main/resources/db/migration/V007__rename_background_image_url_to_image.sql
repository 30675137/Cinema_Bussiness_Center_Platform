-- V4: Rename background_image_url to image for C-end frontend compatibility
-- This migration renames the column to match the C-end Taro frontend field naming convention
-- FIXED: Skip if column already renamed (duplicate with V004)

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'scenario_packages' AND column_name = 'background_image_url'
    ) THEN
        ALTER TABLE scenario_packages
        RENAME COLUMN background_image_url TO image;
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN scenario_packages.image IS 'Scenario package background image URL (renamed from background_image_url for frontend compatibility)';
