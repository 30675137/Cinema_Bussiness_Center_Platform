-- Migration: Add fields for Taro frontend (018-hall-reserve-homepage)
-- Feature: 018-hall-reserve-homepage
-- Date: 2025-12-21
-- Description: Adds category, rating, and tags fields to scenario_packages table for C端小程序展示

-- Add category field (MOVIE, TEAM, PARTY)
ALTER TABLE scenario_packages
ADD COLUMN IF NOT EXISTS category VARCHAR(50) CHECK (category IN ('MOVIE', 'TEAM', 'PARTY'));

-- Add rating field (0-5 stars, nullable)
ALTER TABLE scenario_packages
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5));

-- Add tags field (JSONB array for flexible tagging)
ALTER TABLE scenario_packages
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_pkg_category ON scenario_packages(category) WHERE deleted_at IS NULL;

-- Create GIN index on tags for JSONB queries
CREATE INDEX IF NOT EXISTS idx_pkg_tags ON scenario_packages USING GIN(tags);

-- Add comment explaining the fields
COMMENT ON COLUMN scenario_packages.category IS 'Scenario package category for frontend grouping (MOVIE=私人订制, TEAM=商务团建, PARTY=派对策划)';
COMMENT ON COLUMN scenario_packages.rating IS 'Fixed rating score (0-5) configured by operations team, displayed on C端小程序首页';
COMMENT ON COLUMN scenario_packages.tags IS 'Business tags for frontend display (e.g., ["浪漫", "惊喜", "求婚"])';
