import fetchQuery from '@/app/lib/database'
import * as types from '@/app/types/todo'
import { getNow, getToday, shiftDate } from '@/app/utils/date'
import * as common from './common'

export async function create(name: string): Promise<number|null> {
  try {
    if(name === '')
      throw new Error('Empty todo name')

    const now = getNow()
    const res = await fetchQuery(
      `INSERT INTO ${types.TABLE} (name,created_at,updated_at)
      VALUES (?,?,?) RETURNING id`,
      [name, now, now]
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
  return await common.remove(types.TABLE, id)
}

export async function update(item: types.TodoType): Promise<boolean> {
  try {
    const now = getNow()
    const res = await fetchQuery(
      `UPDATE ${types.TABLE}
      SET name=?,memo=?,done=?,date=?,repeat_interval=?,repeat_unit=?,updated_at=?
      WHERE id=? RETURNING id`,
      [item.name, item.memo, item.done, item.date,
        item.repeat_interval, item.repeat_unit,
        now, item.id]
    ) as Array<{id: number}>

    if(res.length !== 1 && res[0].id !== item.id)
      throw new Error('Failed todo update')

    return true
  } catch(err) {
    console.error(err)
  }
  return false
}

export async function gets(category: types.TodoCategory): Promise<Array<types.TodoType>|types.TodoAll|null> {
  try {
    let query = `SELECT * FROM ${types.TABLE} `
    const args = []

    if(category === 'all') {
      const [inbox, today, upcomming] = await Promise.all([
        await gets('inbox'),
        await gets('today'),
        await gets('upcomming')
      ])

      return {inbox:inbox, today:today, upcomming:upcomming} as types.TodoAll
    }
    else if(category === 'inbox') {
      query += 'WHERE done IS NULL AND date IS NULL'
    }
    else if(category === 'done') {
      query += `WHERE done IS NOT NULL ORDER BY done ASC`
    }
    else {
      const tomorrow = shiftDate(getToday(), {days:1})
      args.push(tomorrow)
      query += 'WHERE done IS NULL AND '

      if(category === 'today') {
        query += 'date < ?'
      }
      else if(category === 'upcomming') {
        const until = shiftDate(tomorrow, {days:7})
        query += 'date >= ? AND date < ?'
        args.push(until)
      }
      query += ' ORDER BY date ASC'
    }

    const res = await fetchQuery(query, args) as Array<types.TodoType>

    return res
  } catch(err) {
    console.error(err)
  }
  return null
}

export async function done(id): Promise<number|null> {
  try {
    const now = getNow()
    const today = getToday()

    const items = await fetchQuery(
      `SELECT * FROM ${types.TABLE} WHERE id = ?`
  , [id]
    ) as Array<types.TodoType>
    if(items.length !== 1)
      throw new Error(`Failed todo done - Wrong id(${id})`)

    const item = items[0]

    if(item.repeat_interval) {
      if(item.done) {
        // find next -> delete
        const next = await fetchQuery(
          `SELECT id FROM ${types.TABLE}
          WHERE name=? AND memo=? AND date=? AND
          repeat_unit=? AND repeat_interval=?`
        , [item.name, item.memo, item.date,
      item.repeat_unit, item.repeat_interval]
        ) as Array<{id: number}>
        if(next.length !== 1)
          throw new Error(`Failed todo done - Not Found next one`)
        else
          await fetchQuery(`DELETE FROM ${types.TABLE} WHERE id = ?`, [next[0].id])

        // update done=null
        const res = await fetchQuery(
          `UPDATE ${types.TABLE}
          SET updated_at = ?, done = null
          WHERE id = ? RETURNING done
          `, [now, id]
        ) as Array<{done: number}>
        if(res.length !== 1)
          throw new Error('Failed todo done')

        return res[0].done
      }
      else {
        // make options -> make nextDate
        const options = {}
        switch(item.repeat_unit) {
          case 'days':
            options['days'] = item.repeat_interval
          break
          case 'weeks':
            options['weeks'] = item.repeat_interval
          break
          case 'months':
            options['months'] = item.repeat_interval
          break
        }
        const nextDate = shiftDate((item?.date)? item.date: today, options)

        // done
        const res = await fetchQuery(
          `UPDATE ${types.TABLE}
          SET updated_at = ?, done = ?
            WHERE id = ? RETURNING done
          `, [now, now, id]
        ) as Array<{done: number}>
        if(res.length !== 1)
          throw new Error('Failed todo done')

        // create next
        const newRes = await fetchQuery(
          `INSERT INTO ${types.TABLE}
          (name,memo,date,repeat_unit,
           repeat_interval,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?) RETURNING id
           `,
           [item.name, item.memo, nextDate,
             item.repeat_unit, item.repeat_interval,
             now, now
           ]
        ) as Array<{id: number}>
        if(newRes.length !== 1)
          throw new Error('Failed todo done')

        return res[0].done
      }
    }
    else {
      const res = await fetchQuery(
        `UPDATE ${types.TABLE}
        SET updated_at = ?, done = CASE
        WHEN done IS NULL THEN ?
          ELSE NULL
        END
        WHERE id = ? RETURNING done
        `, [now, now, id]
      ) as Array<{done: number}>
      if(res.length !== 1)
        throw new Error('Failed todo done')

      return res[0].done
    }
  } catch(err) {
    console.error(err)
  }

  return 0
}
