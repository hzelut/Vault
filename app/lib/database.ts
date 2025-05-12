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
