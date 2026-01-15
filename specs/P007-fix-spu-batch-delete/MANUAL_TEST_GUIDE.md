# Manual Testing Guide - P007 SPU Batch Delete Fix

**@spec P007-fix-spu-batch-delete**

## Test Environment
- **URL**: http://localhost:3000/spu/list
- **Prerequisites**: Dev server must be running (`npm run dev`)

## Test Scenario 1: Basic Batch Delete

### Steps:
1. Navigate to http://localhost:3000/spu/list
2. Wait for the SPU list to load (table should show multiple SPU items)
3. **Record initial total**: Note the total number of records in pagination (e.g., "共 100 条")
4. **Select 3 SPU items**: Click the checkboxes for the first 3 rows
5. **Open batch operations**: Click the "批量操作" dropdown button
6. **Click batch delete**: Select "批量删除" from the dropdown menu
7. **Confirm deletion**: In the confirmation modal, click "确认删除"
8. **Verify success message**: Check that a success message appears showing "成功删除 3 个 SPU"
9. **Verify list refresh**: The list should automatically refresh (may see a brief loading state)
10. **Verify record count decreased**: Total should now be 3 less than initial (e.g., 97 instead of 100)
11. **Verify items removed**: The 3 selected SPU items should no longer appear in the list
12. **Refresh page**: Press F5 or Cmd+R to reload the page
13. **Verify persistence**: After reload, total should still be reduced by 3, and deleted items should not reappear

### Expected Results:
- ✅ Total record count decreases by 3
- ✅ Deleted items do not appear in current page
- ✅ After page refresh, data remains consistent (items stay deleted)
- ✅ Pagination updates correctly

---

## Test Scenario 2: Verify localStorage Persistence (Optional)

### Steps:
1. Open browser DevTools (F12)
2. Go to Application tab → Local Storage → http://localhost:3000
3. Find the `mockSPUData` key
4. **Before deletion**: Note the length of the JSON array
5. Perform batch delete of 2 items (follow steps from Scenario 1)
6. **After deletion**: Check `mockSPUData` again
7. **Verify**: Array length should be 2 less than before

### Expected Results:
- ✅ `mockSPUData` exists in localStorage
- ✅ Array length decreases after deletion
- ✅ Deleted item IDs not present in the array

---

## Test Scenario 3: Cancel Deletion

### Steps:
1. Navigate to http://localhost:3000/spu/list
2. Record initial total count
3. Select 2 SPU items
4. Click "批量操作" → "批量删除"
5. **In confirmation modal, click "取消" instead of "确认删除"**
6. Verify modal closes
7. Verify total count unchanged
8. Verify selected items still present in list

### Expected Results:
- ✅ No deletion occurs
- ✅ Total count remains the same
- ✅ Selected items still visible

---

## Test Scenario 4: Empty Selection

### Steps:
1. Navigate to http://localhost:3000/spu/list
2. Do NOT select any items (all checkboxes unchecked)
3. Check the "批量操作" button state

### Expected Results:
- ✅ "批量操作" button is disabled when no items selected
- ✅ Button becomes enabled after selecting at least 1 item

---

## Test Scenario 5: Select All and Delete

### Steps:
1. Navigate to http://localhost:3000/spu/list
2. Click the checkbox in the table header (select all on current page)
3. **Verify**: All visible row checkboxes should be checked
4. Note how many items are selected (e.g., 10 if page size is 10)
5. Click "批量操作" → "批量删除" → "确认删除"
6. Verify success message shows correct count (e.g., "成功删除 10 个 SPU")
7. Verify list refreshes and shows next page of data
8. Refresh page and verify deleted items don't reappear

### Expected Results:
- ✅ All items on current page get selected
- ✅ All selected items get deleted
- ✅ Total count decreases by the number of selected items
- ✅ Data persists after page refresh

---

## Test Scenario 6: Multiple Deletion Cycles

### Steps:
1. Navigate to http://localhost:3000/spu/list
2. **Cycle 1**: Delete 2 items, verify success
3. **Cycle 2**: Delete 3 more items, verify success
4. **Cycle 3**: Delete 1 item, verify success
5. **Verify total decrease**: Total should be reduced by 6 (2 + 3 + 1)
6. Refresh page
7. Verify all 6 deletions persisted

### Expected Results:
- ✅ Each deletion cycle works independently
- ✅ Cumulative deletions persist across page refreshes
- ✅ Total count accurately reflects all deletions

---

## Test Scenario 7: Network Delay Simulation

### Steps:
1. Open browser DevTools → Network tab
2. Set network throttling to "Slow 3G"
3. Navigate to http://localhost:3000/spu/list
4. Select 3 items and perform batch delete
5. **Observe**: Operation should show loading state for ~1 second (MSW delay)
6. Verify success message appears after delay
7. Verify list refreshes after deletion completes

### Expected Results:
- ✅ UI shows loading state during deletion
- ✅ Success message appears after ~1 second
- ✅ List refreshes correctly even with network delay

---

## Bug Verification Checklist

**Root Cause Validation**: The original bug was that `spuService.batchDeleteSPU()` only simulated a delay without calling the API, and MSW handler returned success without modifying data.

### ❌ Before Fix (Expected Failures):
- [ ] Deleting items showed success message
- [ ] But after page refresh, deleted items reappeared
- [ ] Total count remained unchanged
- [ ] localStorage `mockSPUData` unchanged

### ✅ After Fix (Expected Passes):
- [x] Deleting items shows success message
- [x] After page refresh, deleted items stay deleted
- [x] Total count decreases correctly
- [x] localStorage `mockSPUData` updated with fewer items

---

## Browser Console Checks

### Verify No JavaScript Errors:
1. Open DevTools Console (F12)
2. Perform batch delete
3. **Check**: No red error messages should appear
4. **Expected logs**:
   ```
   [MockSPUStore] Restored 100 SPU items from localStorage
   [MockSPUStore] Deleted 3 SPU items
   ```

### Verify Network Requests:
1. Open DevTools Network tab
2. Filter by "Fetch/XHR"
3. Perform batch delete
4. **Verify request**:
   - Method: POST
   - URL: /api/spu/batch
   - Request body: `{ "operation": "delete", "ids": ["SPU001", "SPU002", ...] }`
5. **Verify response**:
   - Status: 200 OK
   - Response body: `{ "success": true, "data": { "processedCount": 3, "failedCount": 0 }, ... }`

---

## Troubleshooting

### If items reappear after refresh:
- **Check**: localStorage persistence might be disabled
- **Fix**: In mockSPUStore.ts line 49, verify `enablePersistence(false)` is commented or set to true in your local test

### If "批量操作" button not found:
- **Check**: You might be on the wrong page
- **Verify**: URL should be exactly http://localhost:3000/spu/list
- **Check**: SPU list page might use different UI components

### If tests show stale data:
- **Fix**: Clear localStorage:
  ```javascript
  localStorage.clear()
  location.reload()
  ```

---

## Test Completion Checklist

Mark each scenario as you complete it:

- [ ] Scenario 1: Basic Batch Delete - PASSED
- [ ] Scenario 2: localStorage Persistence - PASSED (Optional)
- [ ] Scenario 3: Cancel Deletion - PASSED
- [ ] Scenario 4: Empty Selection - PASSED
- [ ] Scenario 5: Select All and Delete - PASSED
- [ ] Scenario 6: Multiple Deletion Cycles - PASSED
- [ ] Scenario 7: Network Delay Simulation - PASSED
- [ ] Bug Verification: All "After Fix" items checked
- [ ] Browser Console: No JavaScript errors
- [ ] Network Requests: Correct POST /api/spu/batch calls

---

## Success Criteria

All tests pass when:
- ✅ Batch delete removes items from the list
- ✅ Deleted items do not reappear after page refresh
- ✅ Total record count updates correctly
- ✅ Success/error messages display appropriately
- ✅ Cancel button prevents deletion
- ✅ Multiple deletion cycles work correctly
- ✅ No JavaScript console errors

---

**Test Date**: ____________
**Tester**: ____________
**Result**: PASS / FAIL
**Notes**: ____________
