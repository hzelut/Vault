import sqlite3 from 'sqlite3'
import { readFileSync } from 'fs'

let database: sqlite3.Database | null = null

async function init(): Promise<sqlite3.Database> {
  if(database) {return database}

  database = new sqlite3.Database(String(process.env.DATABASE_FILE))
  return new Promise(async (resolve, reject) => {
    try {
      const schema = readFileSync('./schema.sql', 'utf8')
      database!.serialize(() => {
        database!.exec(schema, err => {
          if(err) {
            reject(err)
            return
          }
          resolve(database!)
        })
      })
    } catch(err) {
      reject(err)
    }
  })
}

export default async function fetchQuery(query: string, args: Array<unknown> = []): Promise<unknown> {
  const db = await init()
  return new Promise(async (resolve, reject) => {
    db.all(query, args, (err, rows) => {
      if(err) {
        console.error(err)
        console.error(query)
        reject(err)
        return
      }
    resolve(rows)
    })
  })
}

export async function updateQuery(
  table: string,
  item: Record<string, 'number'|'string'|null>,
  where: Record<string, 'number'|'string'|null>,
  exclude: string[] = ['id', 'created_at', 'updated_at']
): Promise<number|null> {
  try {
    if(Object.keys(where).length === 0)
      throw new Error('Not found where fields')

    const excludeSet = new Set(exclude)
    const params = []
    const keys = []
    let setHolders = ''
    let whereHolders = ''

    for(const k in item) {
      if(!excludeSet.has(k)) {
        keys.push(k)
        params.push(item[k])
        setHolders += `${k}=?,`
      }
    }
    if(keys.length === 0)
      throw new Error('Not found update fields')

    setHolders = setHolders.slice(0, -1)

    for(const k of Object.keys(where)) {
      whereHolders += `${k}=? AND `
      params.push(where[k])
    }
    whereHolders = whereHolders.slice(0, -5)

    const query = `UPDATE ${table} SET ${setHolders} WHERE ${whereHolders} RETURNING id`

    const res = await fetchQuery(query, params) as Array<{id: number}>

    if(res.length !== 1)
      throw new Error(`Failed ${table} update`)

    return res[0].id
  } catch(err) {
    console.error(err)
  }

  return null
}

export async function removeQuery(table: string, id: number): Promise<boolean> {
  try {
    const res = await fetchQuery(
      `DELETE FROM ${table} WHERE id=? RETURNING id`, [id]
    ) as Array<{id: number}>

    if(res.length !== 1 && res[0].id !== id)
      throw new Error(`Failed ${table} remove`)

    return true
  } catch(err) {
    console.error(err)
  }
  return false
}
