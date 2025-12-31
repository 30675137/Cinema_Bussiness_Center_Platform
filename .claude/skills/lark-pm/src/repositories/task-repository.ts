/**
 * @spec T004-lark-project-management
 * Task repository for CRUD operations on Lark Base
 */

import { LarkClient } from '../lark/client.js'
import { Task, TaskInput, TaskSchema, TaskStatus, TaskPriority } from '../models/task.js'
import { validate } from '../utils/validator.js'
import logger from '../utils/logger.js'
import type { LarkFilterCondition, LarkSortCondition } from '../types/lark-api.js'

export interface TaskFilter {
  status?: TaskStatus
  priority?: TaskPriority
  specId?: string
  assignee?: string
  tags?: string[]
}

export interface TaskListOptions {
  filter?: TaskFilter
  sortBy?: 'createdTime' | 'dueDate' | 'priority'
  sortDesc?: boolean
  limit?: number
}

export class TaskRepository {
  constructor(
    private client: LarkClient,
    private appToken: string,
    private tableId: string
  ) {}

  /**
   * Create a new task
   */
  async create(input: TaskInput): Promise<Task> {
    const validated = validate(TaskSchema, input)

    logger.info({ input: validated }, 'Creating task')

    const fields: Record<string, unknown> = {
      标题: validated.title,
      优先级: validated.priority,
      状态: validated.status,
    }

    if (validated.specId) fields['规格ID'] = validated.specId
    if (validated.assignees) fields['负责人'] = validated.assignees
    if (validated.dueDate) fields['截止日期'] = validated.dueDate
    if (validated.tags) fields['标签'] = validated.tags
    if (validated.progress !== undefined) fields['进度'] = validated.progress
    if (validated.estimatedHours) fields['预计工时'] = validated.estimatedHours
    if (validated.actualHours) fields['实际工时'] = validated.actualHours
    if (validated.notes) fields['备注'] = validated.notes

    const record = await this.client.createRecord(this.appToken, this.tableId, fields)

    return this.mapRecordToTask(record)
  }

  /**
   * Find task by ID
   */
  async findById(taskId: string): Promise<Task | null> {
    logger.info({ taskId }, 'Finding task by ID')

    const result = await this.client.searchRecords(this.appToken, this.tableId, {
      filter: {
        conjunction: 'and',
        conditions: [
          {
            field_name: '记录ID',
            operator: 'is',
            value: [taskId],
          },
        ],
      },
    })

    if (result.items.length === 0) {
      return null
    }

    return this.mapRecordToTask(result.items[0])
  }

  /**
   * List tasks with optional filtering and sorting
   */
  async list(options: TaskListOptions = {}): Promise<Task[]> {
    logger.info({ options }, 'Listing tasks')

    const filter = this.buildFilter(options.filter)
    const sort = this.buildSort(options.sortBy, options.sortDesc)

    const result = await this.client.searchRecords(this.appToken, this.tableId, {
      filter,
      sort,
      automatic_fields: true,
    })

    const tasks = result.items.map((record) => this.mapRecordToTask(record))

    if (options.limit) {
      return tasks.slice(0, options.limit)
    }

    return tasks
  }

  /**
   * Update task
   */
  async update(taskId: string, input: Partial<TaskInput>): Promise<Task> {
    logger.info({ taskId, input }, 'Updating task')

    const fields: Record<string, unknown> = {}

    if (input.title) fields['标题'] = input.title
    if (input.priority) fields['优先级'] = input.priority
    if (input.status) fields['状态'] = input.status
    if (input.specId !== undefined) fields['规格ID'] = input.specId
    if (input.assignees !== undefined) fields['负责人'] = input.assignees
    if (input.dueDate !== undefined) fields['截止日期'] = input.dueDate
    if (input.tags !== undefined) fields['标签'] = input.tags
    if (input.progress !== undefined) fields['进度'] = input.progress
    if (input.estimatedHours !== undefined) fields['预计工时'] = input.estimatedHours
    if (input.actualHours !== undefined) fields['实际工时'] = input.actualHours
    if (input.notes !== undefined) fields['备注'] = input.notes

    const record = await this.client.updateRecord(
      this.appToken,
      this.tableId,
      taskId,
      fields
    )

    return this.mapRecordToTask(record)
  }

  /**
   * Delete task (not implemented in Lark API, using status update instead)
   */
  async delete(taskId: string): Promise<void> {
    logger.info({ taskId }, 'Deleting task (setting status to Cancelled)')

    await this.update(taskId, {
      status: TaskStatus.Cancelled,
    })
  }

  /**
   * Build Lark filter condition from TaskFilter
   */
  private buildFilter(filter?: TaskFilter): LarkFilterCondition | undefined {
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

    if (filter.priority) {
      conditions.push({
        field_name: '优先级',
        operator: 'is',
        value: [filter.priority],
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

    if (filter.tags && filter.tags.length > 0) {
      filter.tags.forEach((tag) => {
        conditions.push({
          field_name: '标签',
          operator: 'contains',
          value: [tag],
        })
      })
    }

    if (conditions.length === 0) return undefined

    return {
      conjunction: 'and',
      conditions,
    }
  }

  /**
   * Build Lark sort condition
   */
  private buildSort(
    sortBy?: 'createdTime' | 'dueDate' | 'priority',
    sortDesc = false
  ): LarkSortCondition[] | undefined {
    if (!sortBy) return undefined

    const fieldMap: Record<string, string> = {
      createdTime: '创建时间',
      dueDate: '截止日期',
      priority: '优先级',
    }

    return [
      {
        field_name: fieldMap[sortBy],
        desc: sortDesc,
      },
    ]
  }

  /**
   * Map Lark record to Task entity
   */
  private mapRecordToTask(record: any): Task {
    const fields = record.fields

    return {
      id: record.record_id,
      title: fields['标题'] || '',
      priority: fields['优先级'] || TaskPriority.Medium,
      status: fields['状态'] || TaskStatus.Todo,
      assignees: fields['负责人'],
      specId: fields['规格ID'],
      dueDate: fields['截止日期'],
      tags: fields['标签'],
      progress: fields['进度'],
      estimatedHours: fields['预计工时'],
      actualHours: fields['实际工时'],
      notes: fields['备注'],
      createdTime: record.created_time,
    }
  }
}
