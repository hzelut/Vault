import * as types from '@/app/types/budget'
import fetchQuery, { updateQuery, removeQuery } from '@/app/lib/database'
import { getNow, shiftDate } from '@/app/utils/date'
import { getsCategories } from '@/app/lib/finance'

export async function remove(id: number): Promise<boolean> {
  return await removeQuery(types.TABLE, id)
}

export async function update(item: types.BudgetType): Promise<boolean> {
  const res = await updateQuery(types.TABLE, item, {id: item.id})
  return (res === item.id)
}

async function getUnbudges() {
  try {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth()+1

    const res = await getsCategories(year, month)
    console.log(res)
  } catch(err) {
    console.error(err)
  }

  return null
}

export async function gets(): Promise<Array<types.BudgetType>> {
  try {
    const res = await fetchQuery(
      `SELECT * FROM ${types.TABLE} ORDER BY amount ASC`,
      []
    ) as Array<types.BudgetType>

    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth()+1
    const categories = await getsCategories(year, month)
    const amountMap = new Map(res.map(item => [item.category, item.amount]))

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

export async function create(category: string, amount: number): Promise<number> {
  try {
    const res = await fetchQuery(
      `INSERT INTO ${types.TABLE} (category,amount)
      VALUES (?,?) RETURNING id`,
      [category, amount]
    ) as Array<{id: number}>

    if(res.length !== 1)
      throw new Error('Failed budget create')

    return res[0].id
  } catch(err) {
    console.error(err)
  }

  return null
}
