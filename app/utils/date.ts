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
