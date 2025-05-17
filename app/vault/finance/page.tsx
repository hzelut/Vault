'use client'

import { useState, useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import styles from './page.module.css'
import { FinanceMonthly, FinanceType } from '@/app/types/finance'
import fetchAPI from '@/app/utils/api'
import { getNow, dateFormat } from '@/app/utils/date'
import { createHandleFormChange } from '@/app/utils/form'
import Button from '@/app/components/button'

export default function Page() {
  return (
    <Suspense>
      <FinancePage />
    </Suspense>
  )
}

function makeNewDate(year: number, month: number) {
  const now = new Date()
  const cur = new Date(year, month-1)
  const time = (now.getMonth() == cur.getMonth())? now.getTime(): cur.getTime()

  return Math.floor(time/1000)
}

async function fetchData(year, month) {
  return await fetchAPI('finance/api', {
    method: 'GET',
    params: {y: year, m: month}
  })
}

function FinancePage() {
  const params = useSearchParams()
  const pathname = usePathname()
  const [year, setYear] = useState(null)
  const [month, setMonth] = useState(null)
  const [newDate, setNewDate] = useState(getNow())
  const [Items, setItems] = useState<Array<FinanceMonthly>>()
  const [selected, setSelected] = useState<FinanceType>()
  const handleChange = createHandleFormChange(setSelected)

  useEffect(() => {
    setYear(Number(params.get('y') ?? new Date().getFullYear()))
    setMonth(Number(params.get('m') ?? new Date().getMonth()+1))
  }, [params])

  useEffect(() => {
    if(year && month)
      fetchMonthly(year, month)
  }, [year, month])

  useEffect(() => {
    setNewDate(makeNewDate(year, month))
  }, [year, month])

  async function fetchMonthly(year, month) {
    const res = await fetchData(year, month)
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
      await fetchMonthly(year, month)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetchAPI('finance/api', {
      method: 'PATCH',
      data: selected
    })
    if(res?.id == selected.id)
      await fetchMonthly(year, month)
  }

  async function handleDel() {
    if(confirm('DELETE?!?!?!')) {
      const res = await fetchAPI('finance/api', {
        method: 'DELETE',
        data: {id: selected.id}
      })
      if(res?.id == selected.id) {
        setSelected(null)
        await fetchMonthly(year, month)
      }
    }
  }

  return (
    <div className={styles.page}>
        <div className={`flexbox ${styles.headerWrap}`}>
        <div className={`flexbox flexgrow-1 ${styles.header}`}>
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
          <a href='budget' >
        <Button type='setting' className={styles.settingBtn} />
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
              <div className={`flexgrow-1 ${styles.category}`}>
                {group.category}
              </div>
              { group?.budget > 0 &&
              <div className={`flexgrow-1 ${styles.memo}`}>
                {group.budget.toLocaleString()}
                {`(${Math.floor((group.amount/group.budget)*100)}%)`}
              </div>
              }
              <div className={`flexbox ${styles.totalAmount}`}>
                <div className={styles.currentAmount}>
                  {group.amount.toLocaleString()}
                </div>
              </div>
              { group?.budget > 0 &&
              <div className={styles.progress}>
                <div className={styles.progressFill}
                  style={{width: `${(group.amount/group.budget)*100}%`}}
                >
                </div>
              </div>
              }
            </div>
            <div className={styles.items}>
              {group.items?.map(item => (<>
                { selected?.id === item.id ?<>
                  <form className={`flexbox ${styles.item}`} onSubmit={handleSave}>
                    <input type='text' name='category'
                      className={`flexgrow-1 ${styles.date}`}
                      value={selected.category} onChange={handleChange} />
                    <input type='text' name='memo'
                      className={`flexgrow-1 ${styles.memo}`} placeholder='memo...'
                      value={selected.memo} onChange={handleChange} />
                    <input type='number' name='amount'
                      className={`flexgrow-1 ${styles.amount}`} autoFocus
                      value={selected.amount} onChange={handleChange} />
                    <input type='submit' hidden />
                  </form>
                  <div className={`flexbox ${styles.item} ${styles.formBtns}`}>
                    <input type='button' className={styles.saveBtn} value='Save'
                      onClick={handleSave}
                    />
                    <input type='button' className={`flexgrow-1 ${styles.deleteBtn}`} value='Delete'
                      onClick={handleDel}
                    />
                  </div>
                </>:
                <div key={item.id}
                  onClick={() => setSelected(item)}
                  className={`flexbox ${styles.item}`}
                >
                  <div className={`flexgrow-1 ${styles.date}`}>
                    {dateFormat(item.date, {day: '2-digit'})}
                  </div>
                  <div className={`flexgrow-1 ${styles.memo}`}>
                    {item.memo}
                  </div>
                  <div className={`flexgrow-1 ${styles.amount}`}>
                    {item.amount.toLocaleString()}
                  </div>
                </div>
                }
              </>))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
