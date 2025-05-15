import fetchQuery from '@/app/lib/database'

export async function remove(table: string, id: number): Promise<boolean> {
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
