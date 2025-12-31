/**
 * @spec T004-lark-project-management
 * Unit tests for TaskRepository
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TaskRepository } from './task-repository.js'
import { LarkClient } from '../lark/client.js'
import { TaskPriority, TaskStatus, TaskTag } from '../models/task.js'

// Mock LarkClient
vi.mock('../lark/client.js')

describe('TaskRepository', () => {
  let repository: TaskRepository
  let mockClient: any

  beforeEach(() => {
    mockClient = {
      createRecord: vi.fn(),
      searchRecords: vi.fn(),
      updateRecord: vi.fn(),
    }

    repository = new TaskRepository(mockClient as LarkClient, 'app123', 'table456')
  })

  describe('create', () => {
    it('should create a task with required fields', async () => {
      const mockRecord = {
        record_id: 'rec123',
        fields: {
          标题: '实现登录功能',
          优先级: TaskPriority.High,
          状态: TaskStatus.Todo,
        },
      }

      mockClient.createRecord.mockResolvedValue(mockRecord)

      const task = await repository.create({
        title: '实现登录功能',
        priority: TaskPriority.High,
        status: TaskStatus.Todo,
      })

      expect(task.id).toBe('rec123')
      expect(task.title).toBe('实现登录功能')
      expect(task.priority).toBe(TaskPriority.High)
      expect(mockClient.createRecord).toHaveBeenCalledWith(
        'app123',
        'table456',
        expect.objectContaining({
          标题: '实现登录功能',
          优先级: TaskPriority.High,
          状态: TaskStatus.Todo,
        })
      )
    })

    it('should create a task with all fields', async () => {
      const mockRecord = {
        record_id: 'rec123',
        fields: {
          标题: '实现登录功能',
          优先级: TaskPriority.High,
          状态: TaskStatus.InProgress,
          规格ID: 'S017',
          负责人: ['user1'],
          标签: [TaskTag.Frontend],
          进度: 50,
        },
      }

      mockClient.createRecord.mockResolvedValue(mockRecord)

      const task = await repository.create({
        title: '实现登录功能',
        priority: TaskPriority.High,
        status: TaskStatus.InProgress,
        specId: 'S017',
        assignees: ['user1'],
        tags: [TaskTag.Frontend],
        progress: 50,
      })

      expect(task.specId).toBe('S017')
      expect(task.progress).toBe(50)
    })
  })

  describe('findById', () => {
    it('should find a task by ID', async () => {
      const mockRecord = {
        record_id: 'rec123',
        fields: {
          标题: '测试任务',
          优先级: TaskPriority.Medium,
          状态: TaskStatus.Todo,
        },
      }

      mockClient.searchRecords.mockResolvedValue({
        items: [mockRecord],
      })

      const task = await repository.findById('rec123')

      expect(task).not.toBeNull()
      expect(task?.id).toBe('rec123')
      expect(task?.title).toBe('测试任务')
    })

    it('should return null if task not found', async () => {
      mockClient.searchRecords.mockResolvedValue({
        items: [],
      })

      const task = await repository.findById('nonexistent')

      expect(task).toBeNull()
    })
  })

  describe('list', () => {
    it('should list all tasks', async () => {
      const mockRecords = [
        {
          record_id: 'rec1',
          fields: {
            标题: '任务1',
            优先级: TaskPriority.High,
            状态: TaskStatus.Todo,
          },
        },
        {
          record_id: 'rec2',
          fields: {
            标题: '任务2',
            优先级: TaskPriority.Medium,
            状态: TaskStatus.InProgress,
          },
        },
      ]

      mockClient.searchRecords.mockResolvedValue({
        items: mockRecords,
      })

      const tasks = await repository.list()

      expect(tasks).toHaveLength(2)
      expect(tasks[0].title).toBe('任务1')
      expect(tasks[1].title).toBe('任务2')
    })

    it('should filter tasks by status', async () => {
      mockClient.searchRecords.mockResolvedValue({
        items: [
          {
            record_id: 'rec1',
            fields: {
              标题: '进行中任务',
              优先级: TaskPriority.Medium,
              状态: TaskStatus.InProgress,
            },
          },
        ],
      })

      const tasks = await repository.list({
        filter: { status: TaskStatus.InProgress },
      })

      expect(tasks).toHaveLength(1)
      expect(mockClient.searchRecords).toHaveBeenCalledWith(
        'app123',
        'table456',
        expect.objectContaining({
          filter: expect.objectContaining({
            conditions: expect.arrayContaining([
              expect.objectContaining({
                field_name: '状态',
                value: [TaskStatus.InProgress],
              }),
            ]),
          }),
        })
      )
    })

    it('should filter tasks by specId', async () => {
      mockClient.searchRecords.mockResolvedValue({
        items: [],
      })

      await repository.list({
        filter: { specId: 'S017' },
      })

      expect(mockClient.searchRecords).toHaveBeenCalledWith(
        'app123',
        'table456',
        expect.objectContaining({
          filter: expect.objectContaining({
            conditions: expect.arrayContaining([
              expect.objectContaining({
                field_name: '规格ID',
                value: ['S017'],
              }),
            ]),
          }),
        })
      )
    })

    it('should limit results', async () => {
      const mockRecords = Array.from({ length: 10 }, (_, i) => ({
        record_id: `rec${i}`,
        fields: {
          标题: `任务${i}`,
          优先级: TaskPriority.Medium,
          状态: TaskStatus.Todo,
        },
      }))

      mockClient.searchRecords.mockResolvedValue({
        items: mockRecords,
      })

      const tasks = await repository.list({ limit: 5 })

      expect(tasks).toHaveLength(5)
    })
  })

  describe('update', () => {
    it('should update a task', async () => {
      const mockRecord = {
        record_id: 'rec123',
        fields: {
          标题: '更新后的标题',
          优先级: TaskPriority.High,
          状态: TaskStatus.Done,
        },
      }

      mockClient.updateRecord.mockResolvedValue(mockRecord)

      const task = await repository.update('rec123', {
        title: '更新后的标题',
        status: TaskStatus.Done,
      })

      expect(task.title).toBe('更新后的标题')
      expect(task.status).toBe(TaskStatus.Done)
      expect(mockClient.updateRecord).toHaveBeenCalledWith(
        'app123',
        'table456',
        'rec123',
        expect.objectContaining({
          标题: '更新后的标题',
          状态: TaskStatus.Done,
        })
      )
    })
  })

  describe('delete', () => {
    it('should mark task as cancelled', async () => {
      const mockRecord = {
        record_id: 'rec123',
        fields: {
          标题: '任务',
          优先级: TaskPriority.Medium,
          状态: TaskStatus.Cancelled,
        },
      }

      mockClient.updateRecord.mockResolvedValue(mockRecord)

      await repository.delete('rec123')

      expect(mockClient.updateRecord).toHaveBeenCalledWith(
        'app123',
        'table456',
        'rec123',
        expect.objectContaining({
          状态: TaskStatus.Cancelled,
        })
      )
    })
  })
})
