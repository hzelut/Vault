'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import { BudgetType } from '@/app/types/budget'
import fetchAPI from '@/app/utils/api'
import { createHandleFormArrayChange } from '@/app/utils/form'

async function handleSave(items: Array<BudgetType>) {
    const res = await fetchAPI('budget/api', {
      method: 'PATCH',
      data: {data: JSON.stringify(items)}
    })
    if(res.count === items.length)
      return true

    return false
}

export default function Page() {
  const [items, setItems] = useState<Array<BudgetType>>()
  const handleChange = createHandleFormArrayChange(setItems)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const res = await fetchAPI('budget/api', {
      method: 'GET'
    })
    setItems(res.data)
  }

  return (
    <div className={styles.page}>
      <div className={styles.items}>
        {items?.map((item, i) => (
          <div className={`flexbox ${styles.item}`} key={item.id}>
            <div className={`flexgrow-1 ${styles.category}`}>
              {item.category}
            </div>
            <input type='number' name='amount'
              className={`flexgrow-1 text-right ${styles.amount}`}
              value={item.amount} onChange={(e) => handleChange(e, i)}
            />
          </div>
        ))}
        <div className={`flexbox ${styles.item}`}>
          <div className={`flexgrow-1 ${styles.saveBtn}`} onClick={() =>handleSave(items)}>
            Save
          </div>
        </div>
      </div>
    </div>
  )
}
