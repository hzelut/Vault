export function createHandleFormChange<T>(setState: React.Dispatch<React.SetStateAction<T>>) {
  return (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement | HTMLSelectElement>) => {
    setState(prev => ({...prev, [e.target.name]: e.target.value}))
  }
}

export function createHandleFormArrayChange<T>(
  setState: React.Dispatch<React.SetStateAction<T[]>>
) {
  return (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    index: number
  ) => {
    setState(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, [e.target.name]: e.target.value } : item
      )
    )
  }
}
