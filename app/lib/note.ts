import * as types from '@/app/types/note'
import fetchQuery, { updateQuery, removeQuery } from '@/app/lib/database'
import { getNow } from '@/app/utils/date'

export async function remove(id: number): Promise<boolean> {
  return await removeQuery(types.TABLE, id)
}

export async function update(item: types.NoteType): Promise<boolean> {
  const res = await updateQuery(types.TABLE, item, {id: item.id})
  return (res === item.id)
}

export async function create(title: string): Promise<number|null> {
  try {
    if(title === '')
      throw new Error('Empty note title')

    const now = getNow()
    const res = await fetchQuery(
      `INSERT INTO ${types.TABLE} (title,status,created_at,updated_at)
      VALUES (?,?,?,?) RETURNING id`,
      [title, 'private', now, now]
    ) as Array<{id: number}>

    if(res.length !== 1)
      throw new Error('Failed note create')

    return res[0].id
  } catch(err) {
    console.error(err)
  }
  return null
}

export async function gets(): Promise<Array<types.NoteType>> {
  try {
    const res = await fetchQuery(
      `SELECT id,status,title,created_at,updated_at FROM ${types.TABLE}`
      , []
    ) as Array<types.NoteType>

    return res
  } catch(err) {
    console.error(err)
  }
  return null
}
