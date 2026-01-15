/**
 * @spec T003-lark-task-manager
 * 飞书任务管理脚本 - 通过 Lark MCP 管理项目任务
 */

import { execSync } from 'child_process'

// ============================================
// 配置常量
// ============================================

const LARK_CONFIG = {
  // TODO: 替换为你的飞书配置
  folderToken: '', // 可选，不填则创建在根目录
  baseAppName: 'Cinema Platform 任务管理',
  tableName: '项目任务',
  timeZone: 'Asia/Shanghai',
}

// ============================================
// MCP 调用封装
// ============================================

function callMcpTool(toolName: string, params: any): any {
  const command = `echo '${JSON.stringify({ name: toolName, arguments: params })}' | npx @anthropic-ai/mcp-client`
  try {
    const result = execSync(command, { encoding: 'utf8' })
    return JSON.parse(result)
  } catch (error) {
    console.error(`MCP 调用失败: ${toolName}`, error)
    throw error
  }
}

// ============================================
// 任务管理类
// ============================================

class LarkTaskManager {
  private appToken?: string
  private tableId?: string

  /**
   * 1. 创建 Base App
   */
  async createBaseApp(): Promise<void> {
    console.log('🚀 创建飞书 Base App...')

    const response = await callMcpTool('mcp__lark-mcp__bitable_v1_app_create', {
      data: {
        name: LARK_CONFIG.baseAppName,
        folder_token: LARK_CONFIG.folderToken || undefined,
        time_zone: LARK_CONFIG.timeZone,
      },
      useUAT: true, // 使用用户身份认证
    })

    this.appToken = response.data.app.app_token
    console.log(`✅ Base App 创建成功: ${this.appToken}`)
  }

  /**
   * 2. 创建任务表
   */
  async createTaskTable(): Promise<void> {
    if (!this.appToken) {
      throw new Error('请先创建 Base App')
    }

    console.log('📋 创建任务表...')

    const response = await callMcpTool('mcp__lark-mcp__bitable_v1_appTable_create', {
      path: {
        app_token: this.appToken,
      },
      data: {
        table: {
          name: LARK_CONFIG.tableName,
          default_view_name: '所有任务',
          fields: [
            {
              field_name: '任务标题',
              type: 1, // 多行文本
              ui_type: 'Text',
            },
            {
              field_name: '优先级',
              type: 3, // 单选
              ui_type: 'SingleSelect',
              property: {
                options: [
                  { name: '🔴 高', color: 1 },
                  { name: '🟡 中', color: 2 },
                  { name: '🟢 低', color: 3 },
                ],
              },
            },
            {
              field_name: '状态',
              type: 3, // 单选
              ui_type: 'SingleSelect',
              property: {
                options: [
                  { name: '📝 待办', color: 0 },
                  { name: '🚀 进行中', color: 2 },
                  { name: '✅ 已完成', color: 3 },
                  { name: '❌ 已取消', color: 1 },
                ],
              },
            },
            {
              field_name: '负责人',
              type: 11, // 人员
              ui_type: 'User',
              property: {
                multiple: true, // 允许多人
              },
            },
            {
              field_name: '截止日期',
              type: 5, // 日期
              ui_type: 'DateTime',
              property: {
                date_formatter: 'yyyy/MM/dd',
              },
            },
            {
              field_name: '关联规格',
              type: 1, // 多行文本
              ui_type: 'Text',
              description: {
                text: '关联的 specId，如 P003, I004',
              },
            },
            {
              field_name: '标签',
              type: 4, // 多选
              ui_type: 'MultiSelect',
              property: {
                options: [
                  { name: 'Frontend', color: 1 },
                  { name: 'Backend', color: 2 },
                  { name: 'Test', color: 3 },
                  { name: 'Docs', color: 4 },
                  { name: 'Design', color: 5 },
                  { name: 'Infra', color: 6 },
                ],
              },
            },
            {
              field_name: '进度',
              type: 2, // 数字
              ui_type: 'Progress',
              property: {
                min: 0,
                max: 100,
              },
            },
          ],
        },
      },
      useUAT: true,
    })

    this.tableId = response.data.table_id
    console.log(`✅ 任务表创建成功: ${this.tableId}`)
  }

  /**
   * 3. 添加任务
   */
  async addTask(task: {
    title: string
    priority?: '🔴 高' | '🟡 中' | '🟢 低'
    status?: '📝 待办' | '🚀 进行中' | '✅ 已完成' | '❌ 已取消'
    assignee?: string // open_id
    dueDate?: number // 时间戳(毫秒)
    specId?: string
    tags?: string[]
    progress?: number
  }): Promise<void> {
    if (!this.appToken || !this.tableId) {
      throw new Error('请先创建 Base App 和任务表')
    }

    console.log(`📌 添加任务: ${task.title}`)

    const fields: any = {
      任务标题: task.title,
    }

    if (task.priority) fields.优先级 = task.priority
    if (task.status) fields.状态 = task.status
    if (task.assignee) fields.负责人 = [{ id: task.assignee }]
    if (task.dueDate) fields.截止日期 = task.dueDate
    if (task.specId) fields.关联规格 = task.specId
    if (task.tags) fields.标签 = task.tags
    if (task.progress !== undefined) fields.进度 = task.progress

    await callMcpTool('mcp__lark-mcp__bitable_v1_appTableRecord_create', {
      path: {
        app_token: this.appToken,
        table_id: this.tableId,
      },
      data: {
        fields,
      },
      params: {
        user_id_type: 'open_id',
      },
      useUAT: true,
    })

    console.log(`✅ 任务添加成功`)
  }

  /**
   * 4. 查询任务
   */
  async queryTasks(filter?: {
    status?: string
    specId?: string
    assignee?: string
  }): Promise<any[]> {
    if (!this.appToken || !this.tableId) {
      throw new Error('请先创建 Base App 和任务表')
    }

    console.log('🔍 查询任务...')

    const conditions: any[] = []

    if (filter?.status) {
      conditions.push({
        field_name: '状态',
        operator: 'is',
        value: [filter.status],
      })
    }

    if (filter?.specId) {
      conditions.push({
        field_name: '关联规格',
        operator: 'contains',
        value: [filter.specId],
      })
    }

    if (filter?.assignee) {
      conditions.push({
        field_name: '负责人',
        operator: 'contains',
        value: [filter.assignee],
      })
    }

    const response = await callMcpTool('mcp__lark-mcp__bitable_v1_appTableRecord_search', {
      path: {
        app_token: this.appToken,
        table_id: this.tableId,
      },
      data: {
        filter: conditions.length > 0 ? {
          conjunction: 'and',
          conditions,
        } : undefined,
        automatic_fields: true, // 自动填充创建时间、更新时间等
      },
      params: {
        page_size: 100,
        user_id_type: 'open_id',
      },
      useUAT: true,
    })

    const tasks = response.data.items || []
    console.log(`✅ 查询到 ${tasks.length} 个任务`)
    return tasks
  }

  /**
   * 5. 更新任务
   */
  async updateTask(recordId: string, updates: {
    status?: string
    progress?: number
    assignee?: string
  }): Promise<void> {
    if (!this.appToken || !this.tableId) {
      throw new Error('请先创建 Base App 和任务表')
    }

    console.log(`📝 更新任务: ${recordId}`)

    const fields: any = {}
    if (updates.status) fields.状态 = updates.status
    if (updates.progress !== undefined) fields.进度 = updates.progress
    if (updates.assignee) fields.负责人 = [{ id: updates.assignee }]

    await callMcpTool('mcp__lark-mcp__bitable_v1_appTableRecord_update', {
      path: {
        app_token: this.appToken,
        table_id: this.tableId,
        record_id: recordId,
      },
      data: {
        fields,
      },
      params: {
        user_id_type: 'open_id',
      },
      useUAT: true,
    })

    console.log(`✅ 任务更新成功`)
  }

  /**
   * 获取配置信息
   */
  getConfig() {
    return {
      appToken: this.appToken,
      tableId: this.tableId,
    }
  }
}

// ============================================
// CLI 命令
// ============================================

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  const manager = new LarkTaskManager()

  switch (command) {
    case 'init':
      // 初始化：创建 Base App 和任务表
      await manager.createBaseApp()
      await manager.createTaskTable()
      console.log('\n📋 配置信息:')
      console.log(JSON.stringify(manager.getConfig(), null, 2))
      console.log('\n请保存上述配置到脚本中，以便后续使用')
      break

    case 'add':
      // 添加任务
      await manager.addTask({
        title: args[1] || '新任务',
        priority: (args[2] as any) || '🟡 中',
        status: '📝 待办',
        specId: args[3],
      })
      break

    case 'list':
      // 列出任务
      const tasks = await manager.queryTasks()
      console.table(tasks.map((t: any) => ({
        标题: t.fields['任务标题'],
        状态: t.fields['状态'],
        优先级: t.fields['优先级'],
        进度: t.fields['进度'] || 0,
        规格: t.fields['关联规格'],
      })))
      break

    case 'update':
      // 更新任务状态
      await manager.updateTask(args[1], {
        status: args[2],
        progress: args[3] ? parseInt(args[3]) : undefined,
      })
      break

    default:
      console.log(`
🎯 Lark 任务管理器

用法:
  npm run task:init                           # 初始化 Base App 和任务表
  npm run task:add "任务标题" "优先级" "specId"  # 添加任务
  npm run task:list                           # 列出所有任务
  npm run task:update <recordId> "状态" [进度]  # 更新任务

示例:
  npm run task:add "实现库存查询" "🔴 高" "I003"
  npm run task:update rec123 "🚀 进行中" 50
      `)
  }
}

// 运行
if (require.main === module) {
  main().catch(console.error)
}

export { LarkTaskManager }
