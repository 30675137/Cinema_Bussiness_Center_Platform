-- Mark duplicate migrations as completed in flyway_schema_history
-- These migrations (V007-V012) are duplicates of V1-V6, already applied with different version numbers

INSERT INTO flyway_schema_history (
    installed_rank,
    version,
    description,
    type,
    script,
    checksum,
    installed_by,
    installed_on,
    execution_time,
    success
) VALUES
    ((SELECT COALESCE(MAX(installed_rank), 0) + 1 FROM flyway_schema_history), '007', 'rename background image url to image', 'SQL', 'V007__rename_background_image_url_to_image.sql', 0, current_user, now(), 0, true),
    ((SELECT COALESCE(MAX(installed_rank), 0) + 2 FROM flyway_schema_history), '008', 'add store associations', 'SQL', 'V008__add_store_associations.sql', 0, current_user, now(), 0, true),
    ((SELECT COALESCE(MAX(installed_rank), 0) + 3 FROM flyway_schema_history), '009', 'add store address fields', 'SQL', 'V009__add_store_address_fields.sql', 0, current_user, now(), 0, true),
    ((SELECT COALESCE(MAX(installed_rank), 0) + 4 FROM flyway_schema_history), '010', 'create package tiers and addons', 'SQL', 'V010__create_package_tiers_and_addons.sql', 0, current_user, now(), 0, true),
    ((SELECT COALESCE(MAX(installed_rank), 0) + 5 FROM flyway_schema_history), '011', 'insert proposal package data', 'SQL', 'V011__insert_proposal_package_data.sql', 0, current_user, now(), 0, true),
    ((SELECT COALESCE(MAX(installed_rank), 0) + 6 FROM flyway_schema_history), '012', 'create time slot overrides', 'SQL', 'V012__create_time_slot_overrides.sql', 0, current_user, now(), 0, true)
ON CONFLICT DO NOTHING;
