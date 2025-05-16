'use client'

import { useState, useEffect } from 'react'

import styles from './page.module.css'
import { TodoType, TodoAll } from '@/app/types/todo'
import itemsView from './items'
import * as lib from './lib'

export default function Page() {
  const [Inbox, setInbox] = useState<Array<TodoType>>()
  const [Today, setToday] = useState<Array<TodoType>>()
  const [Upcomming, setUpcomming] = useState<Array<TodoType>>()
  const [Selected, setSelected] = useState<number>()
  const [isShowUpcomming, setIsShowUpcomming] = useState(false)

  useEffect(() => {
    fetchAll(isShowUpcomming)
  }, [isShowUpcomming])

  async function fetchAll(showUpcommint: boolean) {
    const res = await lib.gets('all', showUpcommint) as TodoAll
    setInbox(res.inbox)
    setToday(res.today)
    setUpcomming(res.upcomming)
  }

  async function fetchInbox() {
    setInbox(await lib.gets('inbox') as Array<TodoType>)
  }

  async function handleNew(e: React.FormEvent) {
    e.preventDefault()
    await lib.create(e.currentTarget as HTMLFormElement)
    await fetchInbox()
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    await lib.update(form)
    await fetchAll(isShowUpcomming)
  }

  async function handleDelete(e: React.FormEvent, id: number) {
    e.preventDefault()
    if(confirm('DELETE?!?!?!')) {
      if(await lib.remove(id)) {
        setSelected(0)
        await fetchAll(isShowUpcomming)
      }
    }
  }

  return (
    <div className={styles.page}>
      <form onSubmit={handleNew}>
        <input type='text' name='name' placeholder='new...' required autoFocus />
        <input type='submit' hidden />
      </form>
      {Inbox &&
      <div className={styles.inbox}>
        {itemsView([Inbox, setInbox], [Selected, setSelected], handleDelete, handleSave)}
      </div>
      }
      <div className={styles.today}>
        <div className={styles.header}>
          Today
        </div>
        {Today?.length > 0 ?
          <>{itemsView([Today, setToday], [Selected, setSelected], handleDelete, handleSave)}</>
        :
        <div>All done!!</div>
        }
      </div>
      <div className={styles.upcomming}
        onClick={() => setIsShowUpcomming(prev => !prev)}
      >
        <div className={styles.header}>
          Upcomming
        </div>
        {Upcomming?.length > 0 && <>
          {itemsView([Upcomming, setUpcomming], [Selected, setSelected], handleDelete, handleSave)}
        </>}
      </div>
    </div>
  )
}
