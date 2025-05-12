'use client'

import { useState, useEffect } from 'react'

import styles from './page.module.css'
import fetchAPI from '@/app/utils/api'
import { TodoType } from '@/app/types/todo'

async function create(form: HTMLFormElement) {
  const name = (form.elements.namedItem('name') as HTMLInputElement)?.value

  const res = await fetchAPI('todo/api', {
    method: 'PUT',
    data: {name: name}
  })
  if(res?.id > 0)
    form.reset()
}

async function gets(action: string): Promise<Array<TodoType>> {
  const res = await fetchAPI('todo/api', {
    method: 'GET',
    params: {a: action}
  })

  return res?.data
}

export default function Page() {
  const [Inbox, setInbox] = useState<Array<TodoType>>()

  useEffect(() => {
    fetchInbox()
  }, [])

  async function fetchInbox() {
    setInbox(await gets('inbox'))
  }

  async function handleNew(e: React.FormEvent) {
    e.preventDefault()
    await create(e.currentTarget as HTMLFormElement)
    await fetchInbox()
  }

  return (
    <div className={styles.page}>
      <form onSubmit={handleNew}>
        <input type='text' name='name' placeholder='new...' required />
        <input type='submit' hidden />
      </form>
      {Inbox &&
      <div className={styles.inbox}>
        <div className={styles.items}>
          {Inbox?.map(item => (
          <div className={styles.item}>
            <div className={styles.name}>{item.name}</div>
          </div>
          ))}
        </div>
      </div>
      }
    </div>
  )
}
