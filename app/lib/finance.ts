import fetchQuery, { updateQuery, removeQuery } from '@/app/lib/database'
import * as types from '@/app/types/finance'
import { getNow, shiftDate } from '@/app/utils/date'
import { getsMap } from '@/app/lib/budget'

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

export async function getsMonthly(year: number, month: number): Promise<Array<types.FinanceMonthly>> {
  try {
    let isThisMonth = false
    let budgetMap = null
    const thisMonth = Math.floor((new Date(year, month-1)).getTime() / 1000)
    const nextMonth = shiftDate(thisMonth, {months: 1})

    const res = await fetchQuery(
      `SELECT * FROM ${types.TABLE}
      WHERE date >= ? AND date < ?`,
      [thisMonth, nextMonth]
    ) as Array<types.FinanceType>

    const today = new Date()
    if(year === today.getFullYear() &&
       month === today.getMonth()+1)
      {
        isThisMonth = true
        budgetMap = await getsMap()
      }

    // Grouping
    const map = new Map()
    res.forEach(item => {
      if(!map.has(item.category))
        map.set(item.category, {items: [], amount:0})
      const group = map.get(item.category)
      group.items.push(item)
      group.amount += item.amount
      if(isThisMonth) {
        group.budget = budgetMap.get(item.category) ?? 0
      }
    })
    const monthly: Array<types.FinanceMonthly> = Array.from(map, ([category, {items, amount, budget}]) => ({category, items, amount, budget}))

    return monthly
  } catch(err) {
    console.error(err)
  }
  return null
}

export async function getsCategories(year: number, month: number): Promise<Array<{category: string}>> {
  try {
    const thisMonth = Math.floor((new Date(year, month-1)).getTime() / 1000)
    const nextMonth = shiftDate(thisMonth, {months: 1})

    const res = await fetchQuery(
      `SELECT category FROM ${types.TABLE}
      WHERE date >= ? AND date < ?
        GROUP BY category
        `,
      [thisMonth, nextMonth]
    ) as Array<{category: string}>

    return res
  } catch(err) {
    console.error(err)
  }
  return null
}
