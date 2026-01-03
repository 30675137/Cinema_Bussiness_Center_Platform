/**
 * @spec T004-lark-project-management
 * Populate task ID and phase fields from titles and notes
 */

import { LarkClient } from '../src/lark/client.js'
import { config } from '../src/config/index.js'
import logger from '../src/utils/logger.js'

interface TaskRecord {
  record_id: string
  fields: {
    标题?: string
    备注?: string
    任务标识?: string
    阶段?: string
    规格ID?: string
  }
}

async function populateTaskMetadata() {
  const client = new LarkClient(config.lark)
  const appToken = config.lark.appToken
  const tableId = config.lark.tableIds.tasks

  logger.info('Fetching all O007 tasks...')

  // Fetch all tasks for spec O007
  const response = await client.listRecords(appToken, tableId, {
    filter: '规格ID = "O007"',
    page_size: 500
  })

  const records = response.data?.items || []
  logger.info(`Found ${records.length} tasks for O007`)

  let updated = 0
  let skipped = 0
  let errors = 0

  for (const record of records) {
    const recordId = record.record_id
    const title = record.fields['标题'] as string
    const notes = record.fields['备注'] as string
    const currentTaskId = record.fields['任务标识'] as string
    const currentPhase = record.fields['阶段'] as string

    // Parse task ID from title (format: "T001: description")
    const taskIdMatch = title?.match(/^(T\d{3}):/)
    const parsedTaskId = taskIdMatch ? taskIdMatch[1] : null

    // Parse phase from notes (format: "阶段: Phase 1: Setup & Infrastructure")
    const phaseMatch = notes?.match(/阶段:\s*(.+?)(?:\n|$)/)
    const parsedPhase = phaseMatch ? phaseMatch[1].trim() : null

    // Check if we need to update
    const needsTaskIdUpdate = parsedTaskId && parsedTaskId !== currentTaskId
    const needsPhaseUpdate = parsedPhase && parsedPhase !== currentPhase

    if (!needsTaskIdUpdate && !needsPhaseUpdate) {
      skipped++
      continue
    }

    // Build update payload
    const updates: Record<string, string> = {}
    if (needsTaskIdUpdate) {
      updates['任务标识'] = parsedTaskId
    }
    if (needsPhaseUpdate) {
      updates['阶段'] = parsedPhase
    }

    try {
      logger.info(`Updating ${parsedTaskId || recordId}...`, {
        taskId: parsedTaskId,
        phase: parsedPhase?.substring(0, 30)
      })

      await client.updateRecord(appToken, tableId, recordId, updates)
      updated++

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (error) {
      logger.error(`Failed to update ${parsedTaskId || recordId}`, { error })
      errors++
    }

    // Progress report every 10 records
    if ((updated + skipped + errors) % 10 === 0) {
      logger.info(`Progress: ${updated} updated, ${skipped} skipped, ${errors} errors`)
    }
  }

  logger.info('Complete!', {
    total: records.length,
    updated,
    skipped,
    errors
  })

  return { total: records.length, updated, skipped, errors }
}

// Run the script
populateTaskMetadata()
  .then((result) => {
    console.log('\n✅ Metadata population complete!')
    console.log(`Total records: ${result.total}`)
    console.log(`Updated: ${result.updated}`)
    console.log(`Skipped: ${result.skipped}`)
    console.log(`Errors: ${result.errors}`)
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
