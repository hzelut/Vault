import fetchQuery, { updateQuery, removeQuery } from '@/app/lib/database'
import * as types from '@/app/types/finance'
import { getNow, shiftDate } from '@/app/utils/date'

type ParsedResult = {
  category: string
  amount: number
  memo?: string
}

function parseQuery(query: string): ParsedResult {
  try {
    const [categoryRaw, amountRaw, ... memoRaw] = query.trim().split(/\s+/)

    if(!categoryRaw || !amountRaw)
      throw new Error('Failed parse')

    const category = categoryRaw.toLowerCase()

    const amount = new Function(`return ${amountRaw}`)() as number
    if(isNaN(amount))
      throw new Error('Failed parse')

    const memo = memoRaw.length > 0 ? memoRaw.join(' '): undefined

    return {category, amount, memo}
  } catch(err) {
    console.error(err)
  }

  return null
}

export async function create(date: number, query: string): Promise<number> {
  try {
    const parsed = parseQuery(query)
    if(!parsed)
      throw new Error('Failed create')

    const now = getNow()
    const res = await fetchQuery(
      `INSERT INTO ${types.TABLE} (category,amount,memo,date,created_at,updated_at)
      VALUES (?,?,?,?,?,?) RETURNING id`,
      [parsed.category, parsed.amount, parsed.memo, date, now, now]
    ) as Array<{id: number}>

    if(res.length !== 1)
      throw new Error('Failed finance create')

    return res[0].id
  } catch(err) {
    console.error(err)
  }

  return null
}

export async function remove(id: number): Promise<boolean> {
  return await removeQuery(types.TABLE, id)
}

export async function update(item: types.FinanceType): Promise<boolean> {
  const res = await updateQuery(types.TABLE, item, {id: item.id})
  return (res === item.id)
}

export async function getsMonthly(year: number, month: number): Promise<Array<types.FinanceType>> {
  try {
    const thisMonth = Math.floor((new Date(year, month)).getTime() / 1000)
    const nextMonth = shiftDate(thisMonth, {months: 1})

    const res = await fetchQuery(
      `SELECT * FROM ${types.TABLE}
      WHERE date <= ? AND date > ?`,
      [thisMonth, nextMonth]
    ) as Array<types.FinanceType>

    return res
  } catch(err) {
    console.error(err)
  }
  return null
}
