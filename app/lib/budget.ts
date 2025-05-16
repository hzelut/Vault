import * as types from '@/app/types/budget'
import fetchQuery, { updateQuery, removeQuery } from '@/app/lib/database'

export async function remove(id: number): Promise<boolean> {
  return await removeQuery(types.TABLE, id)
}

export async function update(item: types.BudgetType): Promise<boolean> {
  const res = await updateQuery(types.TABLE, item, {id: item.id})
  return (res === item.id)
}

export async function gets(): Promise<Array<types.BudgetType>> {
  try {
    const res = await fetchQuery(
      `SELECT * FROM ${types.TABLE}`,
      []
    ) as Array<types.BudgetType>

    return res
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
