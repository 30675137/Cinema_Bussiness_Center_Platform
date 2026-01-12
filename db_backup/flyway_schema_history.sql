-- =====================================================
-- Flyway Schema History Export
-- 数据库迁移版本记录
-- 导出时间: 2026-01-12
-- =====================================================

-- 清空现有记录（谨慎使用）
-- TRUNCATE TABLE flyway_schema_history;

-- 插入迁移历史记录
INSERT INTO flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) VALUES
(1, '0', '<< Flyway Baseline >>', 'BASELINE', '<< Flyway Baseline >>', NULL, 'postgres', '2025-12-21 07:52:32.114636', 0, true),
(2, '1', 'create skus table', 'SQL', 'V1__create_scenario_packages.sql', -1089562550, 'postgres', '2025-12-21 07:52:37.34929', 7597, true),
(3, '2', 'create bom combo tables', 'SQL', 'V2__add_taro_frontend_fields.sql', -1629251614, 'postgres', '2025-12-21 07:52:48.122476', 3138, true),
(4, '3', 'create unit test data', 'SQL', 'V3__insert_test_scenario_packages.sql', -1855316699, 'postgres', '2025-12-21 07:52:54.406695', 2340, true),
(5, '4', 'create scenario packages', 'SQL', 'V4__rename_background_image_url_to_image.sql', -850420922, 'postgres', '2025-12-21 08:45:25.59747', 1594, true),
(6, '5', 'add taro frontend fields', 'SQL', 'V5__add_store_associations.sql', 1867322405, 'postgres', '2025-12-21 11:55:36.691012', 3656, true),
(7, '6', 'insert test scenario packages', 'SQL', 'V6__add_store_address_fields.sql', -678255572, 'postgres', '2025-12-22 01:24:41.658632', 3632, true),
(8, '016.001', 'create reservation settings', 'SQL', 'V016_001__create_reservation_settings.sql', -1067595472, 'postgres', '2025-12-22 10:41:50.061324', 5454, true),
(9, '022.001', 'store crud extension', 'SQL', 'V022_001__store_crud_extension.sql', 291202387, 'postgres', '2025-12-22 14:20:54.711192', 3919, true),
(10, '023.001', 'store add cinema fields', 'SQL', 'V023_001__store_add_cinema_fields.sql', 1929692501, 'postgres', '2025-12-23 07:04:24.255446', 3366, true),
(11, '024.001', 'import yaolai cinema data', 'SQL', 'V024_001__import_yaolai_cinema_data.sql', 1189587144, 'postgres', '2025-12-23 07:04:31.064509', 21182, true),
(12, '025', 'create reservation tables', 'SQL', 'V025__create_reservation_tables.sql', -329318032, 'postgres', '2025-12-23 10:32:29.922659', 9174, true),
(13, '026', 'create skus table', 'SQL', 'V026__create_skus_table.sql', 1181485818, 'postgres', '2025-12-24 14:21:08.026034', 4207, true),
(14, '027', 'create bom combo tables', 'SQL', 'V027__create_bom_combo_tables.sql', -344393142, 'postgres', '2025-12-24 14:21:15.592691', 6521, true),
(15, '028', 'create unit conversions', 'SQL', 'V028__create_unit_conversions.sql', -528776197, 'postgres', '2025-12-24 14:21:25.324415', 3473, true),
(16, '029', 'insert test data', 'SQL', 'V029__insert_test_data.sql', -694862417, 'postgres', '2025-12-24 14:21:31.904726', 4414, true),
(17, '030', 'create spus table', 'SQL', 'V030__create_spus_table.sql', -311926538, 'postgres', '2025-12-25 00:50:53.046153', 6497, true),
(18, '031', 'update spu specifications', 'SQL', 'V031__update_spu_specifications.sql', 1379008129, 'postgres', '2025-12-25 01:04:53.424883', 2187, true),
(19, '032', 'create brands table', 'SQL', 'V032__create_brands_table.sql', -314764095, 'postgres', '2025-12-25 01:16:09.701712', 5361, true),
(20, '033', 'create store inventory', 'SQL', 'V033__create_store_inventory.sql', 1800755238, 'postgres', '2025-12-26 05:28:31.838434', 5055, true),
(21, '034', 'insert test inventory data', 'SQL', 'V034__insert_test_inventory_data.sql', -1599714968, 'postgres', '2025-12-26 09:42:29.990516', 3349, true),
(22, '035', 'create inventory adjustment tables', 'SQL', 'V035__create_inventory_adjustment_tables.sql', 1429932323, 'postgres', '2025-12-26 09:42:36.681355', 13582, true),
(23, '038', 'create product orders tables', 'SQL', 'V038__create_product_orders_tables.sql', 236010777, 'postgres', '2025-12-27 08:56:03.903643', 5696, true),
(24, '039', 'create beverages', 'SQL', 'V039__create_beverages.sql', -2107567430, 'postgres', '2025-12-27 12:54:38.686612', 3857, true),
(25, '040', 'create beverage specs', 'SQL', 'V040__create_beverage_specs.sql', 400937586, 'postgres', '2025-12-27 12:54:45.776322', 2914, true),
(26, '041', 'create beverage recipes', 'SQL', 'V041__create_beverage_recipes.sql', -346548446, 'postgres', '2025-12-27 12:54:51.574322', 2585, true),
(27, '042', 'create recipe ingredients', 'SQL', 'V042__create_recipe_ingredients.sql', -746527326, 'postgres', '2025-12-27 12:54:57.041415', 2818, true),
(28, '043', 'create beverage orders', 'SQL', 'V043__create_beverage_orders.sql', -1135033914, 'postgres', '2025-12-27 12:58:03.507991', 5401, true),
(29, '044', 'create beverage order items', 'SQL', 'V044__create_beverage_order_items.sql', 2145218386, 'postgres', '2025-12-27 12:58:12.049955', 3761, true),
(30, '045', 'create queue numbers', 'SQL', 'V045__create_queue_numbers.sql', -1572128940, 'postgres', '2025-12-27 12:58:18.658124', 3762, true),
(31, '046', 'create order status logs', 'SQL', 'V046__create_order_status_logs.sql', -1973754658, 'postgres', '2025-12-27 12:58:25.268994', 2828, true),
(32, '047', 'create indexes', 'SQL', 'V047__create_indexes.sql', -844195884, 'postgres', '2025-12-27 12:58:30.945942', 937, true),
(33, '048', 'alter beverage recipes columns', 'SQL', 'V048__alter_beverage_recipes_columns.sql', -664132380, 'postgres', '2025-12-28 04:44:55.933024', 3438, true),
(34, '049', 'alter recipe ingredients sku id type', 'SQL', 'V049__alter_recipe_ingredients_sku_id_type.sql', -1993556968, 'postgres', '2025-12-28 05:14:52.759735', 1521, true),
(35, '050', 'add missing columns to recipe ingredients', 'SQL', 'V050__add_missing_columns_to_recipe_ingredients.sql', -1912434025, 'postgres', '2025-12-28 05:52:37.461014', 2297, true),
(36, '051', 'add customer note to order items', 'SQL', 'V051__add_customer_note_to_order_items.sql', 435786591, 'postgres', '2025-12-28 11:04:46.559907', 1635, true),
(37, '052', 'fix queue numbers status constraint', 'SQL', 'V052__fix_queue_numbers_status_constraint.sql', -1611000380, 'postgres', '2025-12-28 12:00:51.095245', 1751, true),
(38, '053', 'add order type discriminator', 'SQL', 'V053__add_order_type_discriminator.sql', -567677787, 'postgres', '2025-12-28 12:24:27.946879', 3523, true),
(39, '007', 'rename background image url to image', 'SQL', 'V007__rename_background_image_url_to_image.sql', -253333352, 'postgres', '2025-12-29 05:02:09.352516', 1553, true),
(40, '007', 'rename background image url to image', 'SQL', 'V007__rename_background_image_url_to_image.sql', -253333352, 'postgres', '2025-12-29 05:04:14.926765', 0, true),
(41, '008', 'add store associations', 'SQL', 'V008__add_store_associations.sql', 226838030, 'postgres', '2025-12-29 05:04:14.926765', 0, true),
(42, '009', 'add store address fields', 'SQL', 'V009__add_store_address_fields.sql', -966072872, 'postgres', '2025-12-29 05:04:14.926765', 0, true),
(43, '010', 'create package tiers and addons', 'SQL', 'V010__create_package_tiers_and_addons.sql', 748117636, 'postgres', '2025-12-29 05:04:14.926765', 0, true),
(44, '011', 'insert proposal package data', 'SQL', 'V011__insert_proposal_package_data.sql', -1658741938, 'postgres', '2025-12-29 05:04:14.926765', 0, true),
(45, '012', 'create time slot overrides', 'SQL', 'V012__create_time_slot_overrides.sql', -610487258, 'postgres', '2025-12-29 05:04:14.926765', 0, true),
(46, '054', 'p005 manual setup', 'SQL', 'V054__p005_manual_setup.sql', -797420939, 'postgres', '2025-12-29 05:05:59.411354', 3996, true),
(47, '055', 'add inventory reserved quantity', 'SQL', 'V055__add_inventory_reserved_quantity.sql', 368271413, 'postgres', '2025-12-29 05:06:33.607895', 2671, true),
(48, '058', 'create inventory reservations', 'SQL', 'V058__create_inventory_reservations.sql', 2095762086, 'postgres', '2025-12-29 05:07:57.908702', 3084, true),
(49, '059', 'create bom snapshots', 'SQL', 'V059__create_bom_snapshots.sql', 1712209969, 'postgres', '2025-12-29 05:09:55.759795', 2333, true),
(50, '060', 'extend inventory transactions', 'SQL', 'V060__extend_inventory_transactions.sql', -500800055, 'postgres', '2025-12-29 05:10:34.168596', 2086, true),
(51, '061', 'add version to skus', 'SQL', 'V061__add_version_to_skus.sql', 1909094550, 'postgres', '2025-12-31 02:15:30.702399', 2305, true),
(52, '062', 'create beverage sku mapping table', 'SQL', 'V062__create_beverage_sku_mapping_table.sql', -1798353819, 'postgres', '2025-12-31 09:43:53.754011', 4646, true),
(53, '063', 'add bom finished product type constraint', 'SQL', 'V063__add_bom_finished_product_type_constraint.sql', -1330955919, 'postgres', '2025-12-31 09:44:03.221777', 2976, true),
(54, '064', 'migrate beverages to skus', 'SQL', 'V064__migrate_beverages_to_skus.sql', -908029262, 'postgres', '2025-12-31 09:46:19.137712', 2842, true),
(55, '2026.01.01.001', 'create channel product config', 'SQL', 'V2026_01_01_001__create_channel_product_config.sql', -732212357, 'postgres', '2026-01-01 11:10:28.245027', 11007, true),
(56, '2026.01.01.002', 'fix soft delete unique constraint', 'SQL', 'V2026_01_01_002__fix_soft_delete_unique_constraint.sql', -957495673, 'postgres', '2026-01-01 14:00:13.617479', 2520, true),
(57, '2026.01.03.001', 'add menu category', 'SQL', 'V2026_01_03_001__add_menu_category.sql', -1361505268, 'postgres', '2026-01-04 01:32:25.259119', 12577, true),
(58, '2026.01.03.002', 'migrate category data', 'SQL', 'V2026_01_03_002__migrate_category_data.sql', -1472419175, 'postgres', '2026-01-04 01:32:43.110219', 6310, true),
(59, '2026.01.04.001', 'add version column to menu category', 'SQL', 'V2026_01_04_001__add_version_column_to_menu_category.sql', -1915785821, 'postgres', '2026-01-04 07:56:03.622912', 8695, true),
(60, NULL, '01 seed brands', 'SQL', 'R__01_seed_brands.sql', -2008473597, 'postgres', '2026-01-10 21:00:28.125235', 1318, true),
(61, NULL, '02 seed categories', 'SQL', 'R__02_seed_categories.sql', 1953927592, 'postgres', '2026-01-10 21:01:50.694051', 1249, true),
(62, NULL, '03 seed unit conversions', 'SQL', 'R__03_seed_unit_conversions.sql', 1216104121, 'postgres', '2026-01-10 21:01:55.402307', 1842, true),
(63, '065', 'example add column', 'SQL', 'V065__example_add_column.sql', 1224945380, 'postgres', '2026-01-10 21:04:17.785642', 1497, true),
(64, '065', 'example add column', 'DELETE', 'V065__example_add_column.sql', 1224945380, 'postgres', '2026-01-10 21:05:17.259716', 0, true),
(65, '2026.01.11.001', 'create procurement tables', 'SQL', 'V2026_01_11_001__create_procurement_tables.sql', 750944741, 'postgres', '2026-01-11 00:19:46.939837', 12311, true),
(66, '2026.01.11.002', 'create po status history', 'SQL', 'V2026_01_11_002__create_po_status_history.sql', 897496511, 'postgres', '2026-01-11 00:20:02.670036', 3375, true),
(67, '2026.01.11.003', 'create units table', 'SQL', 'V2026_01_11_003__create_units_table.sql', -260639801, 'postgres', '2026-01-11 08:42:38.598395', 5202, true),
(68, '2026.01.11.004', 'create materials table', 'SQL', 'V2026_01_11_004__create_materials_table.sql', -968145547, 'postgres', '2026-01-11 08:44:14.805923', 6791, true),
(69, '2026.01.11.005', 'add material reference to bom components', 'SQL', 'V2026_01_11_005__add_material_reference_to_bom_components.sql', 1339253247, 'postgres', '2026-01-11 08:44:24.999675', 5241, true),
(70, '2026.01.11.006', 'add material support to inventory', 'SQL', 'V2026_01_11_006__add_material_support_to_inventory.sql', -96601837, 'postgres', '2026-01-11 08:44:33.390399', 5513, true),
(71, '2026.01.11.007', 'migrate sku to material fixed', 'SQL', 'V2026_01_11_007__migrate_sku_to_material_fixed.sql', -149589795, 'postgres', '2026-01-11 08:45:23.206711', 1544, true),
(72, '2026.01.11.008', 'add material support to purchase order items', 'SQL', 'V2026_01_11_008__add_material_support_to_purchase_order_items.sql', -1151474610, 'postgres', '2026-01-11 12:00:15.41279', 5221, true),
(73, '2026.01.11.009', 'add material support to goods receipt items', 'SQL', 'V2026_01_11_009__add_material_support_to_goods_receipt_items.sql', -1472075040, 'postgres', '2026-01-11 12:42:12.099223', 3148, true),
(74, '2026.01.11.010', 'fix inventory item type column', 'SQL', 'V2026_01_11_010__fix_inventory_item_type_column.sql', -756129559, 'postgres', '2026-01-11 12:51:39.915472', 2179, true),
(75, '2026.01.11.011', 'fix unit category column', 'SQL', 'V2026_01_11_011__fix_unit_category_column.sql', -1967271268, 'postgres', '2026-01-11 13:07:19.484281', 1575, true),
(76, '2026.01.11.012', 'fix material conversion rate precision', 'SQL', 'V2026_01_11_012__fix_material_conversion_rate_precision.sql', 1489275578, 'postgres', '2026-01-11 13:21:12.556332', 1417, true),
(77, '2026.01.11.013', 'add standard cost to materials', 'SQL', 'V2026_01_11_013__add_standard_cost_to_materials.sql', -907594246, 'postgres', '2026-01-11 13:39:38.594551', 1605, true),
(78, '2026.01.11.014', 'add component type to bom components', 'SQL', 'V2026_01_11_014__add_component_type_to_bom_components.sql', -1692501773, 'postgres', '2026-01-11 14:05:50.717605', 1562, true);

-- =====================================================
-- 迁移统计
-- =====================================================
-- 总计: 78 条迁移记录
-- 类型分布:
--   BASELINE: 1
--   SQL: 74
--   DELETE: 1
--   可重复脚本(R__): 3
-- 时间范围: 2025-12-21 ~ 2026-01-11
-- =====================================================
