export const TABLE = 'todos'
export const TABLE_ID = 1

export type RepeatUnit = 'days'|'weeks'|'months'
export type TodoCategory = 'inbox'|'upcomming'|'today'|'done'|'all'

export type TodoType = {
  id: number
  name: string
  memo?: string
  done?: number
  date?: number
  date_string?: string
  time_string?: string
  repeat_interval?: number
  repeat_unit?: RepeatUnit
  created_at: number
  updated_at: number
}
