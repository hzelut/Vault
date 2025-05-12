export const TABLE = 'todos'
export const TABLE_ID = 1

export type RepeatUnit = 'days'|'weeks'|'months'

export type TodoType = {
  id: number
  name: string
  memo?: string
  done?: number
  date?: number
  repeat_interval?: number
  repeat_unit?: RepeatUnit
  created_at: number
  updated_at: number
}
