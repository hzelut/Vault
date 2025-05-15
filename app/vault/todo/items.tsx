'use client'

import styles from './page.module.css'
import fetchAPI from '@/app/utils/api'
import { TodoType, RepeatUnitArray } from '@/app/types/todo'
import { createHandleFormArrayChange } from '@/app/utils/form'
import { getToday, timestampToDateTime, dateFormat } from '@/app/utils/date'
import Button from '@/app/components/button'
import Checkbox from '@/app/components/checkbox'

export default function itemsView(
  state: [Array<TodoType>, React.Dispatch<React.SetStateAction<Array<TodoType>>>],
  selectState: [number, (number) => void],
  handleDelete: (e: React.FormEvent, id: number) => void,
  handleSave: (e: React.FormEvent) => void
) {
  if(!state[0] || state[0].length === 0) return null;

  const [Items, setItems] = state
  const [Selected, setSelected] = selectState
  const handleChange = createHandleFormArrayChange(setItems)
  const today = getToday()

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
