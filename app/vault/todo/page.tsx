'use client'

import { useState, useEffect } from 'react'

import styles from './page.module.css'
import fetchAPI from '@/app/utils/api'
import { TodoType } from '@/app/types/todo'
import { createHandleFormArrayChange } from '@/app/utils/form'
import { getToday, timestampToDateTime, dateTimeToTimestamp } from '@/app/utils/date'
import Button from '@/app/components/button'

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

async function update(form: HTMLFormElement) {
  const formData = new FormData(form)
  const item: TodoType = Object.fromEntries(formData.entries()) as unknown as TodoType

  const date = dateTimeToTimestamp(item.date_string, item.time_string)
  if(date)
    item.date = date

  // cleanup
  delete item.date_string
  delete item.time_string
  if(!item.memo)
    delete item.memo

  await fetchAPI('todo/api', {
    method: 'POST',
    data: item
  })
}

export default function Page() {
  const [Inbox, setInbox] = useState<Array<TodoType>>()
  const [Today, setToday] = useState<Array<TodoType>>()
  const [Upcomming, setUpcomming] = useState<Array<TodoType>>()
  const [Selected, setSelected] = useState<number>()

  useEffect(() => {
    fetchInbox()
    fetchToday()
    fetchUpcomming()
  }, [])

  async function fetchInbox() {
    setInbox(await gets('inbox'))
  }

  async function fetchToday() {
    setToday(await gets('today'))
  }

  async function fetchUpcomming() {
    setUpcomming(await gets('upcomming'))
  }

  async function handleNew(e: React.FormEvent) {
    e.preventDefault()
    await create(e.currentTarget as HTMLFormElement)
    await fetchInbox()
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    await update(form)
  }

  function itemsView(
    state: [Array<TodoType>, React.Dispatch<React.SetStateAction<Array<TodoType>>>]
  ) {
    if(!state[0] || state[0].length === 0) return null;

    const [Items, setItems] = state
    const handleChange = createHandleFormArrayChange(setItems)

    function onClickItem(index: number, id: number) {
      const {date, time} = timestampToDateTime(Items[index].date)

      setItems(
        prev =>
          prev.map(
            (item, i) => i === index ? { ...item, date_string: date, time_string: time} : item
        )
      )
      setSelected(id)
    }

    function onClickDate(index: number) {
      let date = null
      let time = null

      if(!Items[index]?.time_string) {
        ({date: date, time: time} = timestampToDateTime(getToday()))
      }

      setItems(
        prev =>
          prev.map(
            (item, i) => i === index ? { ...item, date_string: date, time_string: time} : item
        )
      )
    }

    return (
      <div className={styles.items}>
        {Items.map((item, i) => (<>
          {item.id === Selected ?
            <form className={styles.item} key={item.id} onSubmit={handleSave}>
              <input type='number' name='id' value={item.id} hidden />
              <input type='text' name='name' value={item.name} onChange={e => handleChange(e, i)} />
              <input type='text' name='memo'
                placeholder='memo...'
                value={item.memo} onChange={e => handleChange(e, i)}
              />
              <div className={styles.date}>
                { item?.date_string &&
                <input type='date' name='date_string' value={item.date_string} onChange={e => handleChange(e, i)} />
                }
                { item?.time_string &&
                  <input type='time' name='time_string' value={item.time_string} onChange={e => handleChange(e, i)} />
                }
              </div>
              <div className={styles.btns}>
                <Button type='calendar' onClick={() => onClickDate(i)} />
              </div>
              <input type='submit' value='Save'/>
            </form>
            :
            <div className={styles.item} key={item.id}
              onClick={() => onClickItem(i, item.id)}
            >
              <div className={styles.name}>{item.name}</div>
            </div>
          }
        </>))}
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <form onSubmit={handleNew}>
        <input type='text' name='name' placeholder='new...' required />
        <input type='submit' hidden />
      </form>
      {Inbox &&
      <div className={styles.inbox}>
        {itemsView([Inbox, setInbox])}
      </div>
      }
      <div className={styles.today}>
        <div className={styles.header}>
          Today
        </div>
        {Today ?
          <>{itemsView([Today, setToday])}</>
        :
        <div>All done!!</div>
        }
      </div>
      <div className={styles.upcomming}>
        <div className={styles.header}>
          Upcomming
        </div>
        {itemsView([Upcomming, setUpcomming])}
      </div>
    </div>
  )
}
