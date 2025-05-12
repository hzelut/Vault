import fetchQuery from '@/app/lib/database'
import * as types from '@/app/types/todo'

export async function create(name: string): Promise<number|null> {
  try {
    if(name === '')
      throw new Error('Empty todo name')

    const today = Math.floor(new Date().getTime() / 1000)
    const res = await fetchQuery(
      `INSERT INTO ${types.TABLE} (name,created_at,updated_at)
      VALUES (?,?,?) RETURNING id`,
      [name, today, today]
    ) as Array<{id: number}>

    if(res.length !== 1)
      throw new Error('Failed todo create')

    return res[0].id
  } catch(err) {
    console.error(err)
  }
  return null
}

export async function remove(id: number): Promise<boolean> {
  try {
    const res = await fetchQuery(
      `DELETE ${types.TABLE} WHERE id=? RETURNING id`
      [id]
    ) as Array<{id: number}>

    if(res.length !== 1 && res[0].id !== id)
      throw new Error('Failed note remove')

    return true
  } catch(err) {
    console.error(err)
  }
  return false
}


export async function update(item: types.TodoType): Promise<boolean> {
  try {
    const today = Math.floor(new Date().getTime() / 1000)
    const res = await fetchQuery(
      `UPDATE ${types.TABLE}
      SET name=?,memo=?,done=?,date=?,repeat_interval=?,repeat_unit=?,updated_at=?
      WHERE id=? RETURNING id`,
      [item.name, item.memo, item.done, item.date,
        item.repeat_interval, item.repeat_unit,
        today, item.id]
    ) as Array<{id: number}>

    if(res.length !== 1 && res[0].id !== item.id)
      throw new Error('Failed todo update')

    return true
  } catch(err) {
    console.error(err)
  }
  return false
}

export async function getInbox(): Promise<Array<types.TodoType>|null> {
  try {
    const res = await fetchQuery(
      `SELECT * FROM ${types.TABLE}
       WHERE done IS NULL AND date IS NULL
      `, []
    ) as Array<types.TodoType>

    return res
  } catch(err) {
    console.error(err)
  }
  return null
}
