export const TABLE = 'todos'
export const TABLE_ID = 1

export const RepeatUnitArray = ['days','weeks','months']
export type RepeatUnit = typeof RepeatUnitArray[number]
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

export type TodoAll = {
  inbox: Array<TodoType>
  today: Array<TodoType>
  upcomming: Array<TodoType>
}
