'use client'

import { useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import styles from './page.module.css'
import { FinanceMonthly } from '@/app/types/finance'
import fetchAPI from '@/app/utils/api'
import { getNow, dateFormat } from '@/app/utils/date'

function makeNewDate(year: number, month: number) {
  const now = new Date()
  const cur = new Date(year, month-1)
  let time = (now.getMonth() == cur.getMonth())? now.getTime(): cur.getTime()

  return Math.floor(time/1000)
}

export default function Page() {
  const params = useSearchParams()
  const pathname = usePathname()
  const [year, setYear] = useState(Number(params.get('y') ?? new Date().getFullYear()))
  const [month, setMonth] = useState(Number(params.get('m') ?? new Date().getMonth()+1))
  const [newDate, setNewDate] = useState(getNow())
  const [Items, setItems] = useState<Array<FinanceMonthly>>()

  useEffect(() => {
    fetchMonthly()
  }, [])

  useEffect(() => {
    setNewDate(makeNewDate(year, month))
  }, [year, month])

  async function fetchMonthly() {
    const res = await fetchAPI('finance/api', {
      method: 'GET',
      params: {y: year, m: month}
    })
    if(res.data)
      setItems(res.data)
  }

  async function handleNew(e: React.FormEvent) {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const query = (form.elements.namedItem('query') as HTMLInputElement)?.value

    const res = await fetchAPI('finance/api', {
      method: 'PUT',
      data: {date: newDate, query}
    })
    if(res?.id > 0) {
      form.reset()
      await fetchMonthly()
    }
  }

  return (
    <div className={styles.page}>
      <div className={`flexbox ${styles.header}`}>
        <a className={styles.arrow} href={`${pathname}?y=${year}&m=${month-1}`} >
          {'<<'}
        </a>
        <div className={styles.month}>
          {dateFormat(newDate, {year: 'numeric', month: 'long'})}
        </div>
        <a className={styles.arrow} href={`${pathname}?y=${year}&m=${month+1}`} >
          {'>>'}
        </a>
      </div>
      <form onSubmit={handleNew}>
        <input type='text' name='query' placeholder='category amount [memo]' required autoFocus />
        <input type='submit' hidden />
      </form>
      <div>
        {Items?.map(group => (
          <div key={group.category} className={styles.group}>
            <div className={`flexbox ${styles.groupHeader}`}>
              <div className={styles.category}>
                {group.category}
              </div>
              <div className={styles.totalAmount}>
                {group.amount.toLocaleString()}
              </div>
            </div>
            <div className={styles.items}>
              {group.items?.map(item => (
                <div key={item.id}
                  className={`flexbox ${styles.item}`}
                >
                  <div className={styles.date}>
                    {dateFormat(item.date, {day: '2-digit'})}
                  </div>
                  <div className={styles.memo}>
                    {item.memo}
                  </div>
                  <div className={styles.amount}>
                    {item.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
