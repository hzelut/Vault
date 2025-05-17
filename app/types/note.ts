export const TABLE = 'notes'
export const TABLE_ID = 3

export const NoteStatusArray = ['private', 'public']
export type NoteStatus = typeof NoteStatusArray[number]

export type NoteType = {
  id: number
  status: NoteStatus
  title: string
  content?: string
  created_at: number
  updated_at: number
}
