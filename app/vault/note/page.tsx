'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import { NoteType } from '@/app/types/note'
import fetchAPI from '@/app/utils/api'

export default function Page() {
  const [items, setItems] = useState<Array<NoteType>>()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const res = await fetchAPI('note/api', {
      method: 'GET'
    })
    setItems(res.data)
  }

  async function handleNew(e: React.FormEvent) {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const title = (form.elements.namedItem('title') as HTMLInputElement)?.value

    const res = await fetchAPI('note/api', {
      method: 'PUT',
      data: {title}
    })
    if(res?.id > 0) {
      form.reset()
      await fetchData()
    }
  }

  return (
    <div className={styles.page}>
      <form onSubmit={handleNew}>
        <input type='text' name='title' placeholder='title...' required autoFocus />
        <input type='submit' hidden />
      </form>
      <div className={styles.items}>
        {items?.map(item => (
          <div className={styles.item}>
            {item.title}
          </div>
        ))}
      </div>
    </div>
  )
}
