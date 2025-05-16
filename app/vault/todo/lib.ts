'use client'

import fetchAPI from '@/app/utils/api'
import { TodoType, TodoAll } from '@/app/types/todo'
import { dateTimeToTimestamp } from '@/app/utils/date'

export async function create(form: HTMLFormElement) {
  const name = (form.elements.namedItem('name') as HTMLInputElement)?.value

  const res = await fetchAPI('todo/api', {
    method: 'PUT',
    data: {name: name}
  })
  if(res?.id > 0)
    form.reset()
}

export async function gets(action: string, isShowUpcomming?: boolean): Promise<Array<TodoType>|TodoAll> {
  const params = {a: action}
  if(isShowUpcomming)
    params['u'] = '1'

  const res = await fetchAPI('todo/api', {
    method: 'GET',
    params
  })

  return res?.data
}

export async function update(form: HTMLFormElement) {
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

export async function remove(id: number) {
  const res = await fetchAPI('todo/api', {
    method: 'DELETE',
    data: {id: id}
  })
  return (res?.id == id)
}
