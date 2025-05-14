'use client'

import { useState, useEffect } from 'react'

import styles from './page.module.css'
import fetchAPI from '@/app/utils/api'
import { TodoType, RepeatUnitArray } from '@/app/types/todo'
import { createHandleFormArrayChange } from '@/app/utils/form'
import { getToday, timestampToDateTime, dateTimeToTimestamp, dateFormat } from '@/app/utils/date'
import Button from '@/app/components/button'
import Checkbox from '@/app/components/checkbox'

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
  if(!item.repeat_interval) {
    item.repeat_interval = item.repeat_unit = null
  }

  await fetchAPI('todo/api', {
    method: 'PATCH',
    data: item
  })
}

async function remove(id: number) {
  const res = await fetchAPI('todo/api', {
    method: 'DELETE',
    data: {id: id}
  })
  return (res?.id == id)
}

export default function Page() {
  const [Inbox, setInbox] = useState<Array<TodoType>>()
  const [Today, setToday] = useState<Array<TodoType>>()
  const [Upcomming, setUpcomming] = useState<Array<TodoType>>()
  const [Selected, setSelected] = useState<number>()
  const today = getToday()

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

  async function handleDelete(e: React.FormEvent, id: number) {
    e.preventDefault()
    if(confirm('DELETE?!?!?!')) {
      if(await remove(id)) {
        setSelected(0)
      }
    }
  }

  function itemsView(
    state: [Array<TodoType>, React.Dispatch<React.SetStateAction<Array<TodoType>>>]
  ) {
    if(!state[0] || state[0].length === 0) return null;

    const [Items, setItems] = state
    const handleChange = createHandleFormArrayChange(setItems)

    function onClickItem(index: number, id: number) {
      const item: TodoType = Items[index]
      const {date, time} = timestampToDateTime(item.date)

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

    function onClickRepeat(index: number) {
      let repeat_unit = Items[index].repeat_unit
      repeat_unit = (repeat_unit)? null: 'days'

      setItems(
        prev =>
          prev.map(
            (item, i) => i === index ? { ...item, repeat_unit: repeat_unit, repeat_interval: null} : item
        )
      )
    }

    async function onClickDone(e: React.FormEvent, id: number) {
      e.stopPropagation()

      const res = await fetchAPI('todo/api', {
        method: 'POST',
        data: {id: id}
      })

      setItems(
        prev =>
          prev.map(
            (item) => item.id === id ? { ...item, done: res.done} : item
        )
      )


    }

    return (
      <div className={styles.items}>
        {Items.map((item, i) => (<>
          {item.id === Selected ?
            <form key={item.id} onSubmit={handleSave} className={styles.item}>
              <Checkbox className={styles.check} checked={!(!item.done)} onClick={(e) => onClickDone(e, item.id)}/>
              <input type='number' name='id' value={item.id} hidden />
              <div className='flexbox'>
                <input className={styles.name} type='text' name='name' value={item.name} onChange={e => handleChange(e, i)} />
                <Button type='close' className={styles.close} onClick={() => setSelected(0)}/>
              </div>
              <div className={styles.body}>
                <input type='text' name='memo'
                  placeholder='memo...'
                  value={item.memo} onChange={e => handleChange(e, i)}
                />
                <div className={styles.date}>
                  { item?.date_string &&<>
                  <input type='date' name='date_string' value={item.date_string} onChange={e => handleChange(e, i)} />
                    <input type='time' name='time_string' value={item.time_string} onChange={e => handleChange(e, i)} />
                    </>}
                </div>
                <div className={styles.repeat}>
                  { item?.repeat_unit &&<>
                    <input type='number' name='repeat_interval'
                      value={item.repeat_interval} onChange={e => handleChange(e, i)}
                      placeholder='repeat...'
                    />
                    <select name='repeat_unit'
                      value={item.repeat_unit} onChange={e => handleChange(e, i)}
                      >
                      {RepeatUnitArray?.map(unit => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </>}
                </div>
                <div className={styles.btns}>
                  <Button type='calendar' onClick={() => onClickDate(i)} />
                  <Button type='repeat' onClick={() => onClickRepeat(i)} />
                </div>
                <div className='flexbox'>
                  <input className={styles.saveBtn} type='submit' value='Save'/>
                  <input className={styles.deleteBtn} type='button' value='Delete'
                    onClick={(e) => handleDelete(e, item.id)}
                  />
                </div>
              </div>
            </form>
            :
            <div key={item.id}
              className={`
                ${styles.item}
                ${(item.date && item?.date < today && styles.outdated)}
                ${(item.done && styles.done)}
                `}
              onClick={() => onClickItem(i, item.id)}
            >
              <Checkbox className={styles.check} checked={!(!item.done)} onClick={(e) => onClickDone(e, item.id)}/>
              <div>
                <div className={styles.name}>
                  {item.name}
                  <span className={styles.icons}>
                    {item?.repeat_interval && <Button type='repeat' />}
                  </span>
                </div>
                <div className={styles.info}>
                  {item?.date &&
                  <div className={styles.date}>
                    {dateFormat(item.date, {month: '2-digit', day: '2-digit'})}
                  </div>
                  }
                  {item?.memo &&
                  <div className={styles.memo}>
                    {item.memo}
                  </div>
                  }
                </div>
              </div>
            </div>
          }
        </>))}
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <form onSubmit={handleNew}>
        <input type='text' name='name' placeholder='new...' required autoFocus />
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
