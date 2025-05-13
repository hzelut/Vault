'use client'

import { useState, useEffect } from 'react'

import styles from './page.module.css'
import fetchAPI from '@/app/utils/api'
import { TodoType } from '@/app/types/todo'
import Modal from '@/app/components/modal'
import { createHandleFormChange } from '@/app/utils/form'
import { timestampToDateTime, dateTimeToTimestamp } from '@/app/utils/date'

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

async function update(data: TodoType) {
    const item = {...data}
    const date = dateTimeToTimestamp(item.date_string, item.time_string)
    item.date = date
    item.date_string = item.time_string = null

  await fetchAPI('todo/api', {
    method: 'POST',
    data: item
  })
}

export default function Page() {
  const [Inbox, setInbox] = useState<Array<TodoType>>()
  const [IsModal, setIsModal] = useState<boolean>(false)
  const [Selected, setSelected] = useState<TodoType>()
  const handleFormChange = createHandleFormChange(setSelected)

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

  function onClickItem(item: TodoType) {
    const copyItem = {...item}
    const {date, time} = timestampToDateTime(copyItem.date)
    copyItem.date_string = date
    copyItem.time_string = time

    setSelected(copyItem)
    setIsModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await update(Selected)
  }

  return (
    <div className={styles.page}>
      {Selected &&
      <Modal state={[IsModal, setIsModal]}>
        <form onSubmit={handleSave}>
          <input type='text' name='name' value={Selected.name} onChange={handleFormChange} />
          <input type='text' name='memo' value={Selected.memo} onChange={handleFormChange} />
          <input type='date' name='date_string' value={Selected.date_string} onChange={handleFormChange} />
          <input type='time' name='time_string' value={Selected.time_string} onChange={handleFormChange} />
          <input type='submit' value='Save'/>
        </form>
      </Modal>
      }
      <form onSubmit={handleNew}>
        <input type='text' name='name' placeholder='new...' required />
        <input type='submit' hidden />
      </form>
      {Inbox &&
      <div className={styles.inbox}>
        <div className={styles.items}>
          {Inbox?.map(item => (
          <div className={styles.item} key={item.id}
            onClick={() => onClickItem(item)}
          >
            <div className={styles.name}>{item.name}</div>
          </div>
          ))}
        </div>
      </div>
      }
    </div>
  )
}
