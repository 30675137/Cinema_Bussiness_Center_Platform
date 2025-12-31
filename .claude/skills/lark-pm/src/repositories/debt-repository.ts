/**
 * @spec T004-lark-project-management
 * Technical Debt repository for CRUD operations on Lark Base
 */

import { LarkClient } from '../lark/client.js'
import {
  TechnicalDebt,
  TechnicalDebtInput,
  TechnicalDebtSchema,
  DebtStatus,
  DebtSeverity,
} from '../models/debt.js'
import { validate } from '../utils/validator.js'
import logger from '../utils/logger.js'
import type { LarkFilterCondition } from '../types/lark-api.js'

export interface DebtFilter {
  status?: DebtStatus
  severity?: DebtSeverity
  specId?: string
  assignee?: string
}

export interface DebtListOptions {
  filter?: DebtFilter
  limit?: number
}

export class DebtRepository {
  constructor(
    private client: LarkClient,
    private appToken: string,
    private tableId: string
  ) {}

  async create(input: TechnicalDebtInput): Promise<TechnicalDebt> {
    const validated = validate(TechnicalDebtSchema, input)

    logger.info({ input: validated }, 'Creating technical debt')

    const fields: Record<string, any> = {
      标题: validated.title,
      严重程度: validated.severity,
      状态: validated.status,
    }

    if (validated.impact) fields['影响范围'] = validated.impact
    if (validated.specId) fields['规格ID'] = validated.specId
    if (validated.estimatedEffort) fields['预估工时'] = validated.estimatedEffort
    if (validated.assignee) fields['负责人'] = validated.assignee
    if (validated.foundDate) fields['发现日期'] = validated.foundDate
    if (validated.resolvedDate) fields['解决日期'] = validated.resolvedDate
    if (validated.notes) fields['备注'] = validated.notes

    const record = await this.client.createRecord(this.appToken, this.tableId, fields)

    return this.mapRecordToDebt(record)
  }

  async findById(debtId: string): Promise<TechnicalDebt | null> {
    logger.info({ debtId }, 'Finding technical debt by ID')

    const result = await this.client.searchRecords(this.appToken, this.tableId, {
      filter: {
        conjunction: 'and',
        conditions: [
          {
            field_name: '记录ID',
            operator: 'is',
            value: [debtId],
          },
        ],
      },
    })

    if (result.items.length === 0) {
      return null
    }

    return this.mapRecordToDebt(result.items[0])
  }

  async list(options: DebtListOptions = {}): Promise<TechnicalDebt[]> {
    logger.info({ options }, 'Listing technical debts')

    const filter = this.buildFilter(options.filter)

    const result = await this.client.searchRecords(this.appToken, this.tableId, {
      filter,
      automatic_fields: true,
    })

    const debts = result.items.map((record) => this.mapRecordToDebt(record))

    if (options.limit) {
      return debts.slice(0, options.limit)
    }

    return debts
  }

  async update(debtId: string, input: Partial<TechnicalDebtInput>): Promise<TechnicalDebt> {
    logger.info({ debtId, input }, 'Updating technical debt')

    const fields: Record<string, any> = {}

    if (input.title) fields['标题'] = input.title
    if (input.severity) fields['严重程度'] = input.severity
    if (input.status) fields['状态'] = input.status
    if (input.impact !== undefined) fields['影响范围'] = input.impact
    if (input.specId !== undefined) fields['规格ID'] = input.specId
    if (input.estimatedEffort !== undefined) fields['预估工时'] = input.estimatedEffort
    if (input.assignee !== undefined) fields['负责人'] = input.assignee
    if (input.foundDate !== undefined) fields['发现日期'] = input.foundDate
    if (input.resolvedDate !== undefined) fields['解决日期'] = input.resolvedDate
    if (input.notes !== undefined) fields['备注'] = input.notes

    const record = await this.client.updateRecord(
      this.appToken,
      this.tableId,
      debtId,
      fields
    )

    return this.mapRecordToDebt(record)
  }

  async delete(debtId: string): Promise<void> {
    logger.info({ debtId }, 'Deleting technical debt (setting status to Deferred)')

    await this.update(debtId, {
      status: DebtStatus.Deferred,
    })
  }

  private buildFilter(filter?: DebtFilter): LarkFilterCondition | undefined {
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

  private mapRecordToDebt(record: any): TechnicalDebt {
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
      severity: getValue(fields['严重程度']) || DebtSeverity.Medium,
      status: getValue(fields['状态']) || DebtStatus.Open,
      impact: getValue(fields['影响范围']),
      specId: getValue(fields['规格ID']),
      estimatedEffort: fields['预估工时'],
      assignee: getValue(fields['负责人']),
      foundDate: fields['发现日期'],
      resolvedDate: fields['解决日期'],
      notes: getValue(fields['备注']),
    }
  }
}
