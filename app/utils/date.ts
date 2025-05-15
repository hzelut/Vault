export function timestampToDateTime(timestamp: number) {
  if(!timestamp)
    return {date: null, time: null}

  const date = new Date(timestamp*1000)

  const pad = (n: number) => n.toString().padStart(2, '0')

  const yy = date.getFullYear()
  const mm = pad(date.getMonth()+1)
  const dd = pad(date.getDate())
  const h = pad(date.getHours())
  const m = pad(date.getMinutes())

  return {
    date: `${yy}-${mm}-${dd}`,
    time: `${h}:${m}`
  }
}

export function dateTimeToTimestamp(date: string, time: string) {
  if(!date) return null
  const t = time || '00:00'

  const [yy, mm, dd] = date.split('-').map(Number)
  const [h, m] = t.split(':').map(Number)

  const d = new Date(yy, mm-1, dd, h, m)
  return Math.floor(d.getTime() / 1000)
}

export function getToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return Math.floor(date.getTime() / 1000)
}

export function getNow() {
  const date = new Date()
  return Math.floor(date.getTime() / 1000)
}

type ShifOptions = {
  days?: number
  weeks?: number
  months?: number
}

export function shiftDate( timestamp: number, options?: ShifOptions): number {
  const date = new Date(timestamp * 1000)

  if(options?.days)
    date.setDate(date.getDate() + options.days)
  if(options?.weeks)
    date.setDate(date.getDate() + options.weeks*7)
  if(options?.months)
    date.setMonth(date.getMonth() + options.months)

  return Math.floor(date.getTime() / 1000)
}

export function dateFormat(timestamp: number, options: Intl.DateTimeFormatOptions) {
  const date = new Date(timestamp*1000)

  return date.toLocaleString('en-GB', options)
}
