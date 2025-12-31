/**
 * @spec T004-lark-project-management
 * Unit tests for Task model Zod schema
 */

import { describe, it, expect } from 'vitest'
import { TaskSchema, TaskPriority, TaskStatus, TaskTag } from './task.js'

describe('TaskSchema', () => {
  it('should validate valid task input', () => {
    const input = {
      title: 'Implement login feature',
      priority: TaskPriority.High,
      status: TaskStatus.Todo,
      specId: 'S017',
      tags: [TaskTag.Frontend],
    }

    const result = TaskSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Implement login feature')
      expect(result.data.priority).toBe(TaskPriority.High)
    }
  })

  it('should apply default values', () => {
    const input = {
      title: 'Simple task',
    }

    const result = TaskSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.priority).toBe(TaskPriority.Medium)
      expect(result.data.status).toBe(TaskStatus.Todo)
    }
  })

  it('should reject empty title', () => {
    const input = {
      title: '',
    }

    const result = TaskSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('should reject invalid specId format', () => {
    const input = {
      title: 'Task with invalid spec',
      specId: 'invalid',
    }

    const result = TaskSchema.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('规格 ID 格式错误')
    }
  })

  it('should accept valid specId format', () => {
    const validSpecIds = ['S017', 'A005', 'P001', 'I003']

    validSpecIds.forEach((specId) => {
      const input = {
        title: 'Task',
        specId,
      }

      const result = TaskSchema.safeParse(input)
      expect(result.success).toBe(true)
    })
  })

  it('should validate progress range', () => {
    const input = {
      title: 'Task with progress',
      progress: 101,
    }

    const result = TaskSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('should accept valid progress', () => {
    const input = {
      title: 'Task with progress',
      progress: 50,
    }

    const result = TaskSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('should validate title length', () => {
    const input = {
      title: 'a'.repeat(201),
    }

    const result = TaskSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('should validate estimatedHours is positive', () => {
    const input = {
      title: 'Task',
      estimatedHours: -1,
    }

    const result = TaskSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('should accept optional fields as undefined', () => {
    const input = {
      title: 'Minimal task',
    }

    const result = TaskSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.specId).toBeUndefined()
      expect(result.data.dueDate).toBeUndefined()
      expect(result.data.assignees).toBeUndefined()
    }
  })
})
