export const TABLE = 'finances'
export const TABLE_ID = 2

export type FinanceType = {
  id: number
  category: string
  amount: number
  date: number
  memo?: string
  created_at: number
  updated_at: number
}

export type FinanceMonthly = {
  category: string
  amount: number
  budget?: number
  items: Array<FinanceType>
}
