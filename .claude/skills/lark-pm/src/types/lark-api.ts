/**
 * @spec T004-lark-project-management
 * TypeScript types for Lark API responses
 */

export interface LarkApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

export interface LarkBaseApp {
  app_token: string
  name: string
  folder_token: string
  url: string
  time_zone: string
}

export interface LarkTable {
  table_id: string
  table_name: string
  revision: number
}

export interface LarkField {
  field_id: string
  field_name: string
  type: number
  ui_type?: string
  property?: Record<string, unknown>
  description?: {
    text: string
    disable_sync: boolean
  }
}

export interface LarkRecord {
  record_id: string
  fields: Record<string, unknown>
  created_time?: number
  last_modified_time?: number
}

export interface LarkListRecordsResponse {
  has_more: boolean
  page_token?: string
  total: number
  items: LarkRecord[]
}

export interface LarkSearchRecordsRequest {
  view_id?: string
  field_names?: string[]
  filter?: LarkFilterCondition
  sort?: LarkSortCondition[]
  automatic_fields?: boolean
}

export interface LarkFilterCondition {
  conjunction: 'and' | 'or'
  conditions: Array<{
    field_name: string
    operator: LarkFilterOperator
    value?: string[]
  }>
}

export type LarkFilterOperator =
  | 'is'
  | 'isNot'
  | 'contains'
  | 'doesNotContain'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'isGreater'
  | 'isGreaterEqual'
  | 'isLess'
  | 'isLessEqual'

export interface LarkSortCondition {
  field_name: string
  desc: boolean
}

export interface LarkCreateRecordRequest {
  fields: Record<string, unknown>
}

export interface LarkUpdateRecordRequest {
  fields: Record<string, unknown>
}
