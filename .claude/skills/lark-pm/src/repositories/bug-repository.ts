/**
 * @spec T004-lark-project-management
 * Bug repository for CRUD operations on Lark Base
 */

import { LarkClient } from '../lark/client.js'
import { Bug, BugInput, BugSchema, BugStatus, BugSeverity } from '../models/bug.js'
import { validate } from '../utils/validator.js'
import logger from '../utils/logger.js'
import type { LarkFilterCondition } from '../types/lark-api.js'

export interface BugFilter {
  status?: BugStatus
  severity?: BugSeverity
  specId?: string
  assignee?: string
}

export interface BugListOptions {
  filter?: BugFilter
  limit?: number
}

export class BugRepository {
  constructor(
    private client: LarkClient,
    private appToken: string,
    private tableId: string
  ) {}

  async create(input: BugInput): Promise<Bug> {
    const validated = validate(BugSchema, input)

    logger.info({ input: validated }, 'Creating bug')

    const fields: Record<string, any> = {
      标题: validated.title,
      严重程度: validated.severity,
      状态: validated.status,
    }

    if (validated.reporter) fields['报告人'] = validated.reporter
    if (validated.assignee) fields['负责人'] = validated.assignee
    if (validated.specId) fields['规格ID'] = validated.specId
    if (validated.foundDate) fields['发现日期'] = validated.foundDate
    if (validated.fixedDate) fields['修复日期'] = validated.fixedDate
    if (validated.reproSteps) fields['复现步骤'] = validated.reproSteps
    if (validated.environment) fields['环境'] = validated.environment
    if (validated.notes) fields['备注'] = validated.notes

    const record = await this.client.createRecord(this.appToken, this.tableId, fields)

    return this.mapRecordToBug(record)
  }

  async findById(bugId: string): Promise<Bug | null> {
    logger.info({ bugId }, 'Finding bug by ID')

    const result = await this.client.searchRecords(this.appToken, this.tableId, {
      filter: {
        conjunction: 'and',
        conditions: [
          {
            field_name: '记录ID',
            operator: 'is',
            value: [bugId],
          },
        ],
      },
    })

    if (result.items.length === 0) {
      return null
    }

    return this.mapRecordToBug(result.items[0])
  }

  async list(options: BugListOptions = {}): Promise<Bug[]> {
    logger.info({ options }, 'Listing bugs')

    const filter = this.buildFilter(options.filter)

    const result = await this.client.searchRecords(this.appToken, this.tableId, {
      filter,
      automatic_fields: true,
    })

    const bugs = result.items.map((record) => this.mapRecordToBug(record))

    if (options.limit) {
      return bugs.slice(0, options.limit)
    }

    return bugs
  }

  async update(bugId: string, input: Partial<BugInput>): Promise<Bug> {
    logger.info({ bugId, input }, 'Updating bug')

    const fields: Record<string, any> = {}

    if (input.title) fields['标题'] = input.title
    if (input.severity) fields['严重程度'] = input.severity
    if (input.status) fields['状态'] = input.status
    if (input.reporter !== undefined) fields['报告人'] = input.reporter
    if (input.assignee !== undefined) fields['负责人'] = input.assignee
    if (input.specId !== undefined) fields['规格ID'] = input.specId
    if (input.foundDate !== undefined) fields['发现日期'] = input.foundDate
    if (input.fixedDate !== undefined) fields['修复日期'] = input.fixedDate
    if (input.reproSteps !== undefined) fields['复现步骤'] = input.reproSteps
    if (input.environment !== undefined) fields['环境'] = input.environment
    if (input.notes !== undefined) fields['备注'] = input.notes

    const record = await this.client.updateRecord(
      this.appToken,
      this.tableId,
      bugId,
      fields
    )

    return this.mapRecordToBug(record)
  }

  async delete(bugId: string): Promise<void> {
    logger.info({ bugId }, 'Deleting bug (setting status to WontFix)')

    await this.update(bugId, {
      status: BugStatus.WontFix,
    })
  }

  private buildFilter(filter?: BugFilter): LarkFilterCondition | undefined {
    if (!filter) return undefined

    const conditions: Array<{
      field_name: string
      operator: 'is' | 'contains'
      value: string[]
    }> = []

    if (filter.status) {
      conditions.push({
        field_name: '状态',
        operator: 'is',
        value: [filter.status],
      })
    }

    if (filter.severity) {
      conditions.push({
        field_name: '严重程度',
        operator: 'is',
        value: [filter.severity],
      })
    }

    if (filter.specId) {
      conditions.push({
        field_name: '规格ID',
        operator: 'is',
        value: [filter.specId],
      })
    }

    if (filter.assignee) {
      conditions.push({
        field_name: '负责人',
        operator: 'contains',
        value: [filter.assignee],
      })
    }

    if (conditions.length === 0) return undefined

    return {
      conjunction: 'and',
      conditions,
    }
  }

  private mapRecordToBug(record: any): Bug {
    const fields = record.fields

    const getValue = (field: any): any => {
      if (!field) return undefined
      if (Array.isArray(field)) {
        return field.length > 0 ? field[0]?.text || field[0] : undefined
      }
      if (typeof field === 'object' && field.text !== undefined) {
        return field.text
      }
      return field
    }

    return {
      id: record.record_id,
      title: getValue(fields['标题']) || '',
      severity: getValue(fields['严重程度']) || BugSeverity.Medium,
      status: getValue(fields['状态']) || BugStatus.Open,
      reporter: getValue(fields['报告人']),
      assignee: getValue(fields['负责人']),
      specId: getValue(fields['规格ID']),
      foundDate: fields['发现日期'],
      fixedDate: fields['修复日期'],
      reproSteps: getValue(fields['复现步骤']),
      environment: getValue(fields['环境']),
      notes: getValue(fields['备注']),
    }
  }
}
