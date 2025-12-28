-- V4: Rename background_image_url to image for C-end frontend compatibility
-- This migration renames the column to match the C-end Taro frontend field naming convention

ALTER TABLE scenario_packages 
RENAME COLUMN background_image_url TO image;

-- Add comment for documentation
COMMENT ON COLUMN scenario_packages.image IS 'Scenario package background image URL (renamed from background_image_url for frontend compatibility)';
