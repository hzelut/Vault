import * as types from '@/app/types/budget'
import fetchQuery, { removeQuery } from '@/app/lib/database'
import { getsCategories } from '@/app/lib/finance'

export async function remove(id: number): Promise<boolean> {
  return await removeQuery(types.TABLE, id)
}

export async function upsert(items: Array<types.BudgetType>): Promise<boolean> {
  try {
    let values = ''
    const params = []

    items.map(item => {
      params.push(item.category, item.amount)
      values += '(?,?),'
    })
    values = values.slice(0, -1)

    const res = await fetchQuery(
      `INSERT INTO ${types.TABLE}
      (category,amount) VALUES ${values}
      ON CONFLICT(category) DO UPDATE SET
      amount = excluded.amount
      RETURNING id
      `, params
    ) as Array<{id: number}>

    if(res.length !== items.length)
      throw new Error('Failed parse')

    return true
  } catch(err) {
    console.error(err)
  }

  return false
}

export async function getsMap(): Promise<Map<string, number>> {
  try {
    const res = await fetchQuery(
      `SELECT * FROM ${types.TABLE} ORDER BY amount ASC`,
      []
    ) as Array<types.BudgetType>

    return new Map(res.map(item => [item.category, item.amount]))
  } catch(err) {
    console.error(err)
  }

  return null
}

export async function gets(): Promise<Array<types.BudgetType>> {
  try {
    const amountMap = await getsMap()
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth()+1
    const categories = await getsCategories(year, month)

    const budgets = categories.map(item => ({
      category: item.category,
      amount: amountMap.get(item.category) ?? 0
    })) as Array<types.BudgetType>

    return budgets
  } catch(err) {
    console.error(err)
  }

  return null
}
